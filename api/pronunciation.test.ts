// Test /api/pronunciation — cache phát âm từ điển (Postgres + Google TTS).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const rateLimitOk = { value: true }
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk.value,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }

const query = vi.fn()
vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: () => ({ query }) }))

const generateAudioFromGoogle = vi.fn()
const generateStudioAudioFromGoogle = vi.fn()
vi.mock('./_lib/googleTts', () => ({
  generateAudioFromGoogle: (...args: unknown[]) => generateAudioFromGoogle(...args),
  generateStudioAudioFromGoogle: (...args: unknown[]) => generateStudioAudioFromGoogle(...args),
  // Lưu ý: handler tự toLowerCase() voiceParam trước khi kiểm — nên so khớp chữ thường ở đây.
  isValidVoice: (v: string) => ['kore', 'puck'].includes(v),
  isValidStudioVoice: (v: string) => ['studio-o', 'studio-q'].includes(v),
  DEFAULT_VOICE: 'Kore',
  VOICE_IDS: ['Kore', 'Puck'],
  STUDIO_VOICE_IDS: ['Studio-O', 'Studio-Q'],
  VOICE_VERSION: 'v3',
}))

const saveAudio = vi.fn()
// isServableUrl dùng bản THẬT — xem ghi chú cùng loại trong packages/core-ai/tts.test.ts.
vi.mock('../packages/core-ai/fileStorage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../packages/core-ai/fileStorage')>()),
  saveAudio: (...args: unknown[]) => saveAudio(...args),
}))

const ensureProfileRow = vi.fn()
vi.mock('../packages/core-auth/authService', () => ({
  ensureProfileRow: (...args: unknown[]) => ensureProfileRow(...args),
}))

const clampVoiceToPlan = vi.fn()
vi.mock('./_lib/voiceAccess', () => ({
  clampVoiceToPlan: (...args: unknown[]) => clampVoiceToPlan(...args),
}))

vi.mock('../packages/core-ai/elevenLabsTts', () => ({
  isValidElevenVoice: () => false,
}))

async function importHandler() {
  vi.resetModules()
  const mod = await import('./pronunciation')
  return mod.default
}

function makeRequest(qs = 'word=apple'): Request {
  return new Request(`http://localhost/api/pronunciation?${qs}`)
}

afterEach(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk.value = true
  query.mockReset()
  generateAudioFromGoogle.mockReset()
  generateStudioAudioFromGoogle.mockReset()
  saveAudio.mockReset()
  ensureProfileRow.mockReset().mockResolvedValue({ plan: 'free' })
  clampVoiceToPlan.mockReset().mockImplementation((v: string) => Promise.resolve(v))
})

describe('/api/pronunciation', () => {
  it('OPTIONS → 204', async () => {
    const handler = await importHandler()
    const res = await handler(
      new Request('http://localhost/api/pronunciation', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('method khác GET → 405', async () => {
    const handler = await importHandler()
    const res = await handler(new Request('http://localhost/api/pronunciation', { method: 'POST' }))
    expect(res.status).toBe(405)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk.value = false
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(401)
  })

  it('lang không hợp lệ → 400', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&lang=fr-FR'))
    expect(res.status).toBe(400)
  })

  it('thiếu word → 400', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest(''))
    expect(res.status).toBe(400)
  })

  it('word chứa ký tự lạ → 400', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple%3Bdrop'))
    expect(res.status).toBe(400)
  })

  it('voice không hợp lệ → 400', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=unknown'))
    expect(res.status).toBe(400)
  })

  it('cache HIT (voice_version khớp) → trả audio_url luôn, không gọi Google TTS', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ audio_url: 'https://cdn/apple.mp3', voice_version: 'v3' }],
      }) // select cache
      .mockResolvedValueOnce({ rows: [] }) // update last_accessed_at
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { audio_url: string; cached: boolean }
    expect(data.audio_url).toBe('https://cdn/apple.mp3')
    expect(data.cached).toBe(true)
    expect(generateAudioFromGoogle).not.toHaveBeenCalled()
  })

  it('cache MISS (voice_version cũ) → gọi Google TTS, lưu file + DB, trả cached:false', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ audio_url: 'old.mp3', voice_version: 'old' }] }) // select cache cũ
      .mockResolvedValueOnce({ rows: [] }) // insert/upsert
    generateAudioFromGoogle.mockResolvedValue(new ArrayBuffer(8))
    saveAudio.mockResolvedValue('https://cdn/apple-new.mp3')
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { audio_url: string; cached: boolean }
    expect(data.audio_url).toBe('https://cdn/apple-new.mp3')
    expect(data.cached).toBe(false)
    expect(generateAudioFromGoogle).toHaveBeenCalled()
    expect(saveAudio).toHaveBeenCalled()
  })

  it('cache MISS + rate limit tạo audio mới bị chặn → 429', async () => {
    query.mockResolvedValueOnce({ rows: [] }) // select cache — không có
    let call = 0
    rateLimitOk.value = true
    // Rate limit thứ 2 (pron-gen) fail — mock checkRateLimit qua module state phức tạp, nên
    // dùng cách đơn giản: override module mock trực tiếp trong test này.
    const security = await import('../packages/core-auth/security')
    vi.spyOn(security, 'checkRateLimit').mockImplementation(async () => {
      call++
      return call === 1 // lần 1 (chung) qua, lần 2 (pron-gen) chặn
    })
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(429)
  })

  it('Google TTS lỗi → 500', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    generateAudioFromGoogle.mockRejectedValue(new Error('quota exceeded'))
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(500)
  })

  it('saveAudio lỗi → 500', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    generateAudioFromGoogle.mockResolvedValue(new ArrayBuffer(8))
    saveAudio.mockRejectedValue(new Error('storage down'))
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(500)
  })

  it('lưu DB lỗi sau khi tạo audio thành công → vẫn trả 200 (best-effort)', async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(new Error('db error'))
    generateAudioFromGoogle.mockResolvedValue(new ArrayBuffer(8))
    saveAudio.mockResolvedValue('https://cdn/apple.mp3')
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(200)
  })

  it('voice Studio dùng cho tiếng Việt → hạ về Chirp3-HD (fallback)', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    generateAudioFromGoogle.mockResolvedValue(new ArrayBuffer(8))
    saveAudio.mockResolvedValue('https://cdn/tu.mp3')
    const handler = await importHandler()
    const res = await handler(makeRequest('word=t%E1%BB%AB&voice=studio-o&lang=vi-VN'))
    expect(res.status).toBe(200)
    expect(generateStudioAudioFromGoogle).not.toHaveBeenCalled()
    expect(generateAudioFromGoogle).toHaveBeenCalledWith('từ', 'Kore', 'vi-VN')
  })

  it('voice Studio hợp lệ (tiếng Anh) → gọi generateStudioAudioFromGoogle', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    generateStudioAudioFromGoogle.mockResolvedValue(new ArrayBuffer(8))
    saveAudio.mockResolvedValue('https://cdn/apple-studio.mp3')
    const handler = await importHandler()
    const res = await handler(makeRequest('word=apple&voice=studio-o'))
    expect(res.status).toBe(200)
    expect(generateStudioAudioFromGoogle).toHaveBeenCalled()
  })

  it('lấy pool lỗi (chưa cấu hình DATABASE_URL) → 500', async () => {
    vi.resetModules()
    vi.doMock('../packages/core-db/pgPool', () => ({
      getPgPool: () => {
        throw new Error('DATABASE_URL chưa cấu hình')
      },
    }))
    const mod = await import('./pronunciation')
    const res = await mod.default(makeRequest('word=apple&voice=kore'))
    expect(res.status).toBe(500)
  })
})

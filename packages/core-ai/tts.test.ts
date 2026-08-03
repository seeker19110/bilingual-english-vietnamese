// Test handler /api/tts (packages/core-ai/tts.ts) — mock toàn bộ lớp ngoài (Postgres, Google
// TTS, ElevenLabs, storage, auth/security) để test OFFLINE, không tốn tiền API thật.
//
// Trọng tâm: luồng cache HIT/MISS, cơ chế "claim" chống race condition, chọn nhánh provider
// (Google Chirp3-HD / Studio / ElevenLabs), và các nhánh lỗi (quota 429, lưu file lỗi, DB lỗi).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('../../api/_lib/googleTts', () => ({
  generateAudioFromGoogle: vi.fn(),
  generateStudioAudioFromGoogle: vi.fn(),
  isValidVoice: (v: string) => ['Kore', 'Aoede', 'Puck'].includes(v),
  isValidStudioVoice: (v: string) => ['Studio-O', 'Studio-Q'].includes(v),
  DEFAULT_VOICE: 'Kore',
  VOICE_VERSION: 'v-test',
}))
vi.mock('./elevenLabsTts', () => ({
  generateAudioFromElevenLabs: vi.fn(),
  isValidElevenVoice: (v: string) => v === 'Rachel',
}))
vi.mock('../../api/_lib/visemeTimeline', () => ({
  visemeTimelineFromAlignment: vi.fn(async () => [{ viseme: 'A', startMs: 0, endMs: 100 }]),
}))
vi.mock('../core-auth/authService', () => ({
  ensureProfileRow: vi.fn(async () => ({ plan: 'free' })),
}))
vi.mock('../../api/_lib/voiceAccess', () => ({
  clampVoiceToPlan: vi.fn(async (voice: string) => voice),
}))
vi.mock('./fileStorage', () => ({ saveAudio: vi.fn(async () => 'https://cdn.test/audio.mp3') }))
vi.mock('../../api/_lib/ttsCrypto', () => ({
  encryptAudio: vi.fn(async (buf: ArrayBuffer) => buf),
  getClientKeyMaterial: vi.fn(async () => ({ key_b64: 'key', iv_b64: 'iv' })),
}))
vi.mock('../core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => ({ userId: 'user-test' }),
  validateContentType: () => true,
  logSecurityEvent: () => {},
}))

import handler from './tts'
import { getPgPool } from '../core-db/pgPool'
import { generateAudioFromGoogle, generateStudioAudioFromGoogle } from '../../api/_lib/googleTts'
import { generateAudioFromElevenLabs } from './elevenLabsTts'
import { saveAudio } from './fileStorage'
import * as security from '../core-auth/security'
import { ensureProfileRow } from '../core-auth/authService'
import { clampVoiceToPlan } from '../../api/_lib/voiceAccess'

const mockedGetPool = vi.mocked(getPgPool)
const mockedGenGoogle = vi.mocked(generateAudioFromGoogle)
const mockedGenStudio = vi.mocked(generateStudioAudioFromGoogle)
const mockedGenEleven = vi.mocked(generateAudioFromElevenLabs)
const mockedSaveAudio = vi.mocked(saveAudio)

function makeRequest(body?: object): Request {
  return new Request('http://localhost/api/tts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: JSON.stringify(body ?? { text: 'Xin chào', lang: 'en-US', voice: 'Kore' }),
  })
}

// Pool giả — query() được lái bằng danh sách handler khớp theo chuỗi SQL chứa 1 từ khoá.
// Đơn giản hoá bằng cách cho từng test tự set `queryImpl`.
type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>
function makePool(queryImpl: QueryFn) {
  return { query: vi.fn(queryImpl) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedGenGoogle.mockResolvedValue(new ArrayBuffer(8))
  mockedSaveAudio.mockResolvedValue('https://cdn.test/audio.mp3')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handler /api/tts — cổng vào', () => {
  it('OPTIONS → 204', async () => {
    const res = await handler(new Request('http://localhost/api/tts', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('GET → 405', async () => {
    const res = await handler(new Request('http://localhost/api/tts', { method: 'GET' }))
    expect(res.status).toBe(405)
  })

  it('Content-Type sai → 415', async () => {
    vi.spyOn(security, 'validateContentType').mockReturnValueOnce(false)
    const res = await handler(makeRequest())
    expect(res.status).toBe(415)
  })

  it('Rate limit vượt quá → 429', async () => {
    vi.spyOn(security, 'checkRateLimit').mockResolvedValueOnce(false)
    const res = await handler(makeRequest())
    expect(res.status).toBe(429)
  })

  it('Chưa đăng nhập → 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const res = await handler(makeRequest())
    expect(res.status).toBe(401)
  })

  it('Thiếu text → 400', async () => {
    const res = await handler(makeRequest({ text: '' }))
    expect(res.status).toBe(400)
  })

  it('Text quá dài (> 4000 ký tự) → 413', async () => {
    const res = await handler(makeRequest({ text: 'a'.repeat(4001) }))
    expect(res.status).toBe(413)
  })

  it('Body không phải JSON → 400', async () => {
    const res = await handler(
      new Request('http://localhost/api/tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
        body: 'không phải json',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('Không khởi tạo được Postgres pool → 500', async () => {
    mockedGetPool.mockImplementation(() => {
      throw new Error('no DATABASE_URL')
    })
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
  })
})

describe('handler /api/tts — cache HIT', () => {
  it('câu đã cache → trả audio ngay, cached:true, không gọi Google TTS', async () => {
    mockedGetPool.mockReturnValue(
      makePool(async (sql) => {
        if (sql.includes('select audio_url, viseme_timeline from public.tts_cache where'))
          return { rows: [{ audio_url: 'https://cdn.test/cached.mp3', viseme_timeline: null }] }
        return { rows: [] }
      }) as never,
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as { cached: boolean; audio_url: string }
    expect(data.cached).toBe(true)
    expect(data.audio_url).toBe('https://cdn.test/cached.mp3')
    expect(mockedGenGoogle).not.toHaveBeenCalled()
  })
})

describe('handler /api/tts — cache MISS, leader sinh audio (Google Chirp3-HD)', () => {
  function poolLeaderFlow(): QueryFn {
    return async (sql) => {
      if (sql.includes('select audio_url, viseme_timeline from public.tts_cache where'))
        return { rows: [] } // chưa có cache
      if (sql.startsWith('insert into public.tts_cache_pending')) return { rows: [{ hash: 'h' }] } // giành được quyền leader
      return { rows: [] }
    }
  }

  it('sinh audio mới bằng Google, lưu file + DB, trả cached:false', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as { cached: boolean; audio_url: string }
    expect(data.cached).toBe(false)
    expect(data.audio_url).toBe('https://cdn.test/audio.mp3')
    expect(mockedGenGoogle).toHaveBeenCalledTimes(1)
    expect(mockedSaveAudio).toHaveBeenCalledTimes(1)
  })

  it('Vượt rate limit tạo audio mới (tts-gen) → 429', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    vi.spyOn(security, 'checkRateLimit').mockImplementation(
      async (_ip: string, _limit?: number, bucket?: string) => bucket !== 'tts-gen',
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(429)
    expect(mockedGenGoogle).not.toHaveBeenCalled()
  })

  it('Google TTS hết quota (429/RESOURCE_EXHAUSTED) → 503 kèm fallback + Retry-After', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    mockedGenGoogle.mockRejectedValueOnce(new Error('RESOURCE_EXHAUSTED (429)'))
    const res = await handler(makeRequest())
    expect(res.status).toBe(503)
    expect(res.headers.get('Retry-After')).toBe('60')
    const data = (await res.json()) as { fallback: boolean }
    expect(data.fallback).toBe(true)
  })

  it('Google TTS lỗi khác (không phải quota) → 500', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    mockedGenGoogle.mockRejectedValueOnce(new Error('network down'))
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
  })

  it('saveAudio lỗi → 500', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    mockedSaveAudio.mockRejectedValueOnce(new Error('disk full'))
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
  })

  it('Lưu DB tts_cache lỗi → vẫn trả 200 (audio đã tạo/lưu file thành công)', async () => {
    mockedGetPool.mockReturnValue(
      makePool(async (sql) => {
        if (sql.includes('select audio_url, viseme_timeline from public.tts_cache where'))
          return { rows: [] }
        if (sql.startsWith('insert into public.tts_cache_pending')) return { rows: [{ hash: 'h' }] }
        if (sql.startsWith('insert into public.tts_cache')) throw new Error('db down')
        return { rows: [] }
      }) as never,
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
  })
})

describe('handler /api/tts — khoá claim cũ (leader trước crash) tự dọn rồi thử claim lại', () => {
  it('khoá pending quá hạn (> 30s) → xoá khoá cũ rồi claim lại thành công, tự làm leader', async () => {
    let insertCount = 0
    mockedGetPool.mockReturnValue(
      makePool(async (sql) => {
        if (sql.includes('select audio_url, viseme_timeline from public.tts_cache where'))
          return { rows: [] }
        if (sql.startsWith('insert into public.tts_cache_pending')) {
          insertCount += 1
          // Lần đầu thua claim (khoá cũ còn đó), lần 2 (sau khi dọn) thắng claim.
          return insertCount === 1 ? { rows: [] } : { rows: [{ hash: 'h' }] }
        }
        if (sql.startsWith('select created_at from public.tts_cache_pending'))
          return { rows: [{ created_at: new Date(Date.now() - 40_000).toISOString() }] } // > 30s, đã hết hạn
        if (sql.startsWith('delete from public.tts_cache_pending')) return { rows: [] }
        return { rows: [] }
      }) as never,
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    expect(insertCount).toBe(2)
    expect(mockedGenGoogle).toHaveBeenCalledTimes(1)
  })
})

describe('handler /api/tts — follower nhận kết quả cache từ leader (claim thua)', () => {
  it('claim thua nhưng leader đã sinh xong → trả luôn kết quả cache, không gọi Google', async () => {
    // Đếm số lần gọi câu SELECT tts_cache: lần 1 = kiểm tra cache ban đầu (chưa có),
    // lần 2 = kiểm tra lại BÊN TRONG claimTtsGeneration sau khi thua claim (đã có, do leader
    // vừa xong). Không thể phân biệt 2 câu này bằng text (giống hệt nhau) nên dùng thứ tự gọi.
    let cacheSelectCount = 0
    mockedGetPool.mockReturnValue(
      makePool(async (sql) => {
        if (sql.startsWith('select audio_url, viseme_timeline from public.tts_cache where hash')) {
          cacheSelectCount += 1
          if (cacheSelectCount === 1) return { rows: [] } // chưa có cache lần đầu kiểm tra
          return { rows: [{ audio_url: 'https://cdn.test/leader.mp3', viseme_timeline: null }] }
        }
        if (sql.startsWith('insert into public.tts_cache_pending')) return { rows: [] } // thua claim
        if (sql.startsWith('select created_at from public.tts_cache_pending'))
          return { rows: [{ created_at: new Date().toISOString() }] } // khoá còn mới (không stale)
        return { rows: [] }
      }) as never,
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as { cached: boolean; audio_url: string }
    expect(data.cached).toBe(true)
    expect(data.audio_url).toBe('https://cdn.test/leader.mp3')
    expect(mockedGenGoogle).not.toHaveBeenCalled()
  })
})

describe('handler /api/tts — giọng ElevenLabs (VIP) và Studio', () => {
  function poolLeaderFlow(): QueryFn {
    return async (sql) => {
      if (sql.includes('select audio_url, viseme_timeline from public.tts_cache where'))
        return { rows: [] }
      if (sql.startsWith('insert into public.tts_cache_pending')) return { rows: [{ hash: 'h' }] }
      return { rows: [] }
    }
  }

  beforeEach(() => {
    vi.mocked(clampVoiceToPlan).mockImplementation(async (voice) => voice)
    vi.mocked(ensureProfileRow).mockResolvedValue({ plan: 'vip' } as never)
  })

  it('giọng Rachel (ElevenLabs) → gọi generateAudioFromElevenLabs, có viseme timeline', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    mockedGenEleven.mockResolvedValueOnce({
      audio: new ArrayBuffer(8),
      alignment: {
        characters: ['a'],
        character_start_times_seconds: [0],
        character_end_times_seconds: [0.1],
      },
    })
    const res = await handler(makeRequest({ text: 'Hello', lang: 'en-US', voice: 'Rachel' }))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { viseme_timeline: unknown }
    expect(mockedGenEleven).toHaveBeenCalledTimes(1)
    expect(data.viseme_timeline).not.toBeNull()
  })

  it('dựng viseme timeline lỗi → không làm hỏng audio, viseme_timeline trả về null', async () => {
    const { visemeTimelineFromAlignment } = await import('../../api/_lib/visemeTimeline')
    vi.mocked(visemeTimelineFromAlignment).mockRejectedValueOnce(new Error('espeak-ng missing'))
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    mockedGenEleven.mockResolvedValueOnce({
      audio: new ArrayBuffer(8),
      alignment: {
        characters: ['a'],
        character_start_times_seconds: [0],
        character_end_times_seconds: [0.1],
      },
    })
    const res = await handler(makeRequest({ text: 'Hello', lang: 'en-US', voice: 'Rachel' }))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { viseme_timeline: unknown }
    expect(data.viseme_timeline).toBeNull()
  })

  it('giọng Studio-O với lang en-US → gọi generateStudioAudioFromGoogle', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    mockedGenStudio.mockResolvedValueOnce(new ArrayBuffer(8))
    const res = await handler(makeRequest({ text: 'Hello', lang: 'en-US', voice: 'Studio-O' }))
    expect(res.status).toBe(200)
    expect(mockedGenStudio).toHaveBeenCalledTimes(1)
  })

  it('giọng Studio nhưng lang vi-VN → tự hạ về Chirp3-HD tương ứng (Kore), không gọi Studio', async () => {
    mockedGetPool.mockReturnValue(makePool(poolLeaderFlow()) as never)
    const res = await handler(makeRequest({ text: 'Xin chào', lang: 'vi-VN', voice: 'Studio-O' }))
    expect(res.status).toBe(200)
    expect(mockedGenStudio).not.toHaveBeenCalled()
    expect(mockedGenGoogle).toHaveBeenCalledWith('Xin chào', 'Kore', 'vi-VN')
  })
})

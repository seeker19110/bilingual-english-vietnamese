// Test /api/avatar-visemes — trả dãy viseme cho avatar nói chuyện (eSpeak offline).
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
const rateLimitOk = { value: true }
const contentTypeOk = { value: true }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk.value,
  validateAuth: async () => authState.user,
  validateContentType: () => contentTypeOk.value,
  logSecurityEvent: () => {},
}))

const wordVisemesFromEspeak = vi.fn()
vi.mock('@dhcb/core-ai/espeakPhonemes', () => ({
  wordVisemesFromEspeak: (...args: unknown[]) => wordVisemesFromEspeak(...args),
}))

async function importHandler() {
  vi.resetModules()
  const mod = await import('./avatar-visemes.js')
  return mod.default
}

function makeRequest(
  body: unknown,
  headers: Record<string, string> = { 'content-type': 'application/json' },
): Request {
  return new Request('http://localhost/api/avatar-visemes', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk.value = true
  contentTypeOk.value = true
  wordVisemesFromEspeak.mockReset()
})

describe('/api/avatar-visemes', () => {
  it('OPTIONS → 204', async () => {
    const handler = await importHandler()
    const res = await handler(
      new Request('http://localhost/api/avatar-visemes', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('method khác POST → 405', async () => {
    const handler = await importHandler()
    const res = await handler(new Request('http://localhost/api/avatar-visemes'))
    expect(res.status).toBe(405)
  })

  it('Content-Type sai → 415', async () => {
    contentTypeOk.value = false
    const handler = await importHandler()
    const res = await handler(makeRequest({ text: 'hello', lang: 'en-US' }))
    expect(res.status).toBe(415)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk.value = false
    const handler = await importHandler()
    const res = await handler(makeRequest({ text: 'hello', lang: 'en-US' }))
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const handler = await importHandler()
    const res = await handler(makeRequest({ text: 'hello', lang: 'en-US' }))
    expect(res.status).toBe(401)
  })

  it('body JSON hỏng → 400', async () => {
    const handler = await importHandler()
    const res = await handler(
      new Request('http://localhost/api/avatar-visemes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{invalid json',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('thiếu text → 400', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest({ lang: 'en-US' }))
    expect(res.status).toBe(400)
  })

  it('lang không hợp lệ → 400', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest({ text: 'hello', lang: 'fr-FR' }))
    expect(res.status).toBe(400)
  })

  it('text quá dài (>4000 ký tự) → 400/413', async () => {
    const handler = await importHandler()
    const longText = 'a'.repeat(4001)
    const res = await handler(makeRequest({ text: longText, lang: 'en-US' }))
    expect([400, 413]).toContain(res.status)
  })

  it('thành công → 200, trả wordVisemes theo từng từ tách bằng khoảng trắng', async () => {
    wordVisemesFromEspeak.mockResolvedValue([['AA'], ['PP', 'REST']])
    const handler = await importHandler()
    const res = await handler(makeRequest({ text: 'hello world', lang: 'en-US' }))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { wordVisemes: unknown }
    expect(data.wordVisemes).toEqual([['AA'], ['PP', 'REST']])
    expect(wordVisemesFromEspeak).toHaveBeenCalledWith(['hello', 'world'], 'en-US')
  })

  it('eSpeak-ng chưa cài / lỗi → trả wordVisemes: null (client tự fallback)', async () => {
    wordVisemesFromEspeak.mockResolvedValue(null)
    const handler = await importHandler()
    const res = await handler(makeRequest({ text: 'hello', lang: 'en-US' }))
    expect(res.status).toBe(200)
    const data = (await res.json()) as { wordVisemes: unknown }
    expect(data.wordVisemes).toBeNull()
  })
})

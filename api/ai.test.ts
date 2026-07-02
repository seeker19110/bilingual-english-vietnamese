// Test handler /api/claude (api/ai.ts) — tập trung "đường đi của tiền" ở nhánh Groq:
// mọi nhánh lỗi sau khi ĐÃ TRỪ lượt (checkAndConsumeUsage) phải HOÀN lượt (refundUsage),
// kể cả khi Groq trả HTTP 200 nhưng body hỏng (không phải JSON / thiếu field) —
// trước đây các nhánh body-hỏng quên hoàn, người dùng mất lượt mà không có câu trả lời.
//
// Mock toàn bộ lớp ngoài (security/usage/fetch) để test OFFLINE, không cần DB/provider thật.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./_lib/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: () => true,
  validateAuth: async () => ({ userId: 'user-test' }),
  validateContentType: () => true,
  logSecurityEvent: () => {},
}))
vi.mock('./_lib/usage', () => ({
  checkAndConsumeUsage: vi.fn(async () => ({ ok: true as const })),
  refundUsage: vi.fn(async () => {}),
  isUsageMode: (v: unknown) => v === 'chat' || v === 'writing' || v === 'speaking' || v === 'stt',
}))
vi.mock('./_lib/fetchTimeout', () => ({ fetchWithTimeout: vi.fn() }))

import handler from './ai'
import { refundUsage } from './_lib/usage'
import { fetchWithTimeout } from './_lib/fetchTimeout'

const mockedFetch = vi.mocked(fetchWithTimeout)
const mockedRefund = vi.mocked(refundUsage)

// Request hợp lệ tối thiểu cho /api/claude
function makeRequest(): Request {
  return new Request('http://localhost/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }], mode: 'chat' }),
  })
}

// Ép handler đi nhánh Groq: chỉ có GROQ_API_KEY, không có Gemini/Anthropic.
const ENV_KEYS = ['GEMINI_API_KEY', 'GROQ_API_KEY', 'ANTHROPIC_API_KEY'] as const
let savedEnv: Record<string, string | undefined>

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))
  delete process.env.GEMINI_API_KEY
  delete process.env.ANTHROPIC_API_KEY
  process.env.GROQ_API_KEY = 'groq-test-key'
  mockedFetch.mockReset()
  mockedRefund.mockClear()
})

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
})

describe('handler /api/claude — cổng vào (method/key/body)', () => {
  it('OPTIONS (preflight CORS) → 204', async () => {
    const res = await handler(new Request('http://localhost/api/claude', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('GET → 405 Method not allowed', async () => {
    const res = await handler(new Request('http://localhost/api/claude', { method: 'GET' }))
    expect(res.status).toBe(405)
  })

  it('Chưa cấu hình key AI nào → 500 kèm thông điệp rõ', async () => {
    delete process.env.GROQ_API_KEY
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
    const data = (await res.json()) as { error: { message: string } }
    expect(data.error.message).toMatch(/GEMINI_API_KEY|GROQ_API_KEY|ANTHROPIC_API_KEY/)
  })

  it('Body không phải JSON → 400', async () => {
    const res = await handler(
      new Request('http://localhost/api/claude', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
        body: 'không phải json',
      }),
    )
    expect(res.status).toBe(400)
  })
})

describe('handler /api/claude — nhánh Groq và hoàn lượt', () => {
  it('Groq trả lời hợp lệ → 200, KHÔNG hoàn lượt', async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'Hi there!' } }] }), {
        status: 200,
      }),
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as { content: Array<{ text: string }> }
    expect(data.content[0]?.text).toBe('Hi there!')
    expect(mockedRefund).not.toHaveBeenCalled()
  })

  it('Groq 200 nhưng cấu trúc JSON sai (thiếu choices) → 500 + HOÀN lượt', async () => {
    mockedFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
    expect(mockedRefund).toHaveBeenCalledTimes(1)
    expect(mockedRefund).toHaveBeenCalledWith('user-test', 'chat')
  })

  it('Groq 200 nhưng body KHÔNG phải JSON → 500 + HOÀN lượt', async () => {
    mockedFetch.mockResolvedValue(new Response('<html>gateway error</html>', { status: 200 }))
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
    expect(mockedRefund).toHaveBeenCalledTimes(1)
  })

  it('Groq 200 nhưng content không phải string → 500 + HOÀN lượt', async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 42 } }] }), { status: 200 }),
    )
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
    expect(mockedRefund).toHaveBeenCalledTimes(1)
  })

  it('Groq trả HTTP lỗi (500) → giữ status + HOÀN lượt', async () => {
    mockedFetch.mockResolvedValue(new Response('boom', { status: 500 }))
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
    expect(mockedRefund).toHaveBeenCalledTimes(1)
  })

  it('Groq timeout/lỗi mạng (fetch ném lỗi) → 504 + HOÀN lượt', async () => {
    mockedFetch.mockRejectedValue(new Error('Hết thời gian chờ (quá 30s)'))
    const res = await handler(makeRequest())
    expect(res.status).toBe(504)
    expect(mockedRefund).toHaveBeenCalledTimes(1)
  })
})

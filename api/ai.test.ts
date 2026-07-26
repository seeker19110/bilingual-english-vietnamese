// Test handler /api/agent (api/ai.ts) — tập trung "đường đi của tiền" ở nhánh Groq:
// mọi nhánh lỗi sau khi ĐÃ TRỪ lượt (checkAndConsumeUsage) phải HOÀN lượt (refundUsage),
// kể cả khi Groq trả HTTP 200 nhưng body hỏng (không phải JSON / thiếu field) —
// trước đây các nhánh body-hỏng quên hoàn, người dùng mất lượt mà không có câu trả lời.
//
// Mock toàn bộ lớp ngoài (security/usage/fetch) để test OFFLINE, không cần DB/provider thật.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./_lib/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => ({ userId: 'user-test' }),
  validateContentType: () => true,
  logSecurityEvent: () => {},
}))
vi.mock('./_lib/usage', () => ({
  checkAndConsumeUsage: vi.fn(async () => ({ ok: true as const })),
  refundUsage: vi.fn(async () => {}),
}))
vi.mock('./_lib/fetchTimeout', () => ({ fetchWithTimeout: vi.fn() }))

import handler from './ai'
import { refundUsage } from './_lib/usage'
import { fetchWithTimeout } from './_lib/fetchTimeout'

const mockedFetch = vi.mocked(fetchWithTimeout)
const mockedRefund = vi.mocked(refundUsage)

// Request hợp lệ tối thiểu cho /api/agent — cho phép ghi đè body để test validate/sanitize.
function makeRequest(body?: object): Request {
  return new Request('http://localhost/api/agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: JSON.stringify(body ?? { messages: [{ role: 'user', content: 'Hello' }], mode: 'chat' }),
  })
}

// Đọc lại body JSON handler gửi cho Groq (mockedFetch.mock.calls[0] = [url, options]).
function lastGroqRequestBody(): { max_tokens: number; messages: { content?: unknown }[] } {
  const options = mockedFetch.mock.calls[0]?.[1] as { body: string }
  return JSON.parse(options.body)
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

describe('handler /api/agent — cổng vào (method/key/body)', () => {
  it('OPTIONS (preflight CORS) → 204', async () => {
    const res = await handler(new Request('http://localhost/api/agent', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('GET → 405 Method not allowed', async () => {
    const res = await handler(new Request('http://localhost/api/agent', { method: 'GET' }))
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
      new Request('http://localhost/api/agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
        body: 'không phải json',
      }),
    )
    expect(res.status).toBe(400)
  })
})

describe('handler /api/agent — nhánh Groq và hoàn lượt', () => {
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

// Đợt 3 rollout Zod (api/ai.ts) — schema CHỈ định hình lại logic lenient cũ (cắt bớt/mặc định),
// KHÔNG được siết chặt thêm: input sai kiểu/thiếu field vẫn phải trả 200 như trước, không phải
// 400 mới. Duy nhất hành vi từ chối giữ nguyên là 413 khi tổng nội dung quá lớn.
describe('handler /api/agent — validate/sanitize (Zod, đợt 3)', () => {
  beforeEach(() => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
        status: 200,
      }),
    )
  })

  it('messages rỗng → vẫn 200 (không bị từ chối)', async () => {
    const res = await handler(makeRequest({ messages: [], mode: 'chat' }))
    expect(res.status).toBe(200)
  })

  it('messages không phải mảng → coi như rỗng, vẫn 200 (không regress về 400)', async () => {
    const res = await handler(makeRequest({ messages: 'không phải mảng', mode: 'chat' }))
    expect(res.status).toBe(200)
  })

  it('1 phần tử messages không phải object → giữ nguyên, vẫn 200', async () => {
    const res = await handler(makeRequest({ messages: [42], mode: 'chat' }))
    expect(res.status).toBe(200)
  })

  it('thiếu max_tokens → mặc định 1024 (forward đúng cho Groq)', async () => {
    const res = await handler(
      makeRequest({ messages: [{ role: 'user', content: 'Hi' }], mode: 'chat' }),
    )
    expect(res.status).toBe(200)
    expect(lastGroqRequestBody().max_tokens).toBe(1024)
  })

  it('tin nhắn dài hơn 2000 ký tự → cắt đúng còn 2000 ký tự khi forward cho Groq', async () => {
    const longContent = 'a'.repeat(3000)
    const res = await handler(
      makeRequest({ messages: [{ role: 'user', content: longContent }], mode: 'chat' }),
    )
    expect(res.status).toBe(200)
    const forwarded = lastGroqRequestBody().messages
    const userMsg = forwarded.find((m) => m.content === 'a'.repeat(2000))
    expect(userMsg).toBeDefined()
  })

  it('tổng nội dung vượt 40000 ký tự → 413, KHÔNG hoàn lượt (chưa trừ lượt)', async () => {
    // 21 tin × 2000 ký tự (đã bị cắt còn 2000/tin) = 42000 > 40000, dưới 64KB body-guard.
    const messages = Array.from({ length: 21 }, () => ({
      role: 'user' as const,
      content: 'a'.repeat(2000),
    }))
    const res = await handler(makeRequest({ messages, mode: 'chat' }))
    expect(res.status).toBe(413)
    expect(mockedRefund).not.toHaveBeenCalled()
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})

// Chặn lỗ hổng: /api/agent CHỈ được đếm vào chat/writing/speaking — mode 'stt'/'pronounce'
// là của /api/stt và /api/pronounce-assess, đếm nhầm vào đây sẽ giúp client né giới hạn chat
// bằng cách rút quota của mode khác (xem ghi chú CHAT_ENDPOINT_MODES ở api/ai.ts).
describe('handler /api/agent — mode lạ (không phải chat/writing/speaking) → coi như "chat"', () => {
  beforeEach(() => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
        status: 200,
      }),
    )
  })

  it.each(['stt', 'pronounce', 'hack', 123, null])(
    'mode=%p → checkAndConsumeUsage("chat")',
    async (mode) => {
      const { checkAndConsumeUsage } = await import('./_lib/usage')
      const mockedConsume = vi.mocked(checkAndConsumeUsage)
      mockedConsume.mockClear()
      await handler(makeRequest({ messages: [{ role: 'user', content: 'Hi' }], mode }))
      expect(mockedConsume).toHaveBeenCalledWith('user-test', 'chat')
    },
  )
})

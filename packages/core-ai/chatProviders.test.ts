import { describe, it, expect, vi, afterEach } from 'vitest'
import { callGroqChat, callAnthropicChat } from './chatProviders.js'

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  vi.restoreAllMocks()
})

function mockFetchOnce(resp: Partial<Response> & { ok: boolean; status: number }) {
  global.fetch = vi.fn().mockResolvedValue(resp as Response)
}

describe('callGroqChat', () => {
  it('phản hồi hợp lệ → success kèm text đúng đường dẫn choices[0].message.content', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Xin chào' } }] }),
    } as Response)
    const result = await callGroqChat('key', 'model-x', 'system', [], 100)
    expect(result).toMatchObject({ kind: 'success', text: 'Xin chào' })
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('ghép system thành message role=system ở ĐẦU danh sách khi gửi cho Groq', async () => {
    let sentBody: unknown
    global.fetch = vi.fn().mockImplementation((_url, init: RequestInit) => {
      sentBody = JSON.parse(init.body as string)
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
      } as Response)
    })
    await callGroqChat('key', 'model-x', 'bạn là gia sư', [{ role: 'user', content: 'hi' }], 100)
    expect(sentBody).toMatchObject({
      messages: [
        { role: 'system', content: 'bạn là gia sư' },
        { role: 'user', content: 'hi' },
      ],
    })
  })

  it('system rỗng → KHÔNG thêm message role=system', async () => {
    let sentBody: unknown
    global.fetch = vi.fn().mockImplementation((_url, init: RequestInit) => {
      sentBody = JSON.parse(init.body as string)
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
      } as Response)
    })
    await callGroqChat('key', 'model-x', '', [{ role: 'user', content: 'hi' }], 100)
    expect(sentBody).toMatchObject({ messages: [{ role: 'user', content: 'hi' }] })
  })

  it('HTTP lỗi (500) → http_error kèm status + bodyText', async () => {
    mockFetchOnce({ ok: false, status: 500, text: async () => 'server error' } as Response)
    const result = await callGroqChat('key', 'model-x', '', [], 100)
    expect(result).toMatchObject({ kind: 'http_error', status: 500, bodyText: 'server error' })
  })

  it('lỗi mạng (fetch ném lỗi) → network_error kèm message', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    const result = await callGroqChat('key', 'model-x', '', [], 100)
    expect(result).toMatchObject({ kind: 'network_error', message: 'ECONNREFUSED' })
  })

  it('200 nhưng thiếu choices → malformed_body', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({}) } as Response)
    const result = await callGroqChat('key', 'model-x', '', [], 100)
    expect(result.kind).toBe('malformed_body')
  })

  it('200 nhưng body không phải JSON (json() ném lỗi) → malformed_body', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('invalid json')
      },
    } as unknown as Response)
    const result = await callGroqChat('key', 'model-x', '', [], 100)
    expect(result.kind).toBe('malformed_body')
  })

  it('200 nhưng content không phải string → malformed_body', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 123 } }] }),
    } as Response)
    const result = await callGroqChat('key', 'model-x', '', [], 100)
    expect(result.kind).toBe('malformed_body')
  })
})

describe('callAnthropicChat', () => {
  it('thành công → response kèm status 200 + body NGUYÊN VĂN (không parse)', async () => {
    const rawBody = '{"content":[{"type":"text","text":"xin chào"}]}'
    mockFetchOnce({ ok: true, status: 200, text: async () => rawBody } as Response)
    const result = await callAnthropicChat('key', 'model-x', 'system', [], 100)
    expect(result).toMatchObject({ kind: 'response', status: 200, bodyText: rawBody })
  })

  it('lỗi HTTP → vẫn trả kind=response kèm status/body gốc (ai.ts tự quyết fallback hay forward)', async () => {
    const rawBody = '{"error":{"message":"overloaded"}}'
    mockFetchOnce({ ok: false, status: 529, text: async () => rawBody } as Response)
    const result = await callAnthropicChat('key', 'model-x', 'system', [], 100)
    expect(result).toMatchObject({ kind: 'response', status: 529, bodyText: rawBody })
  })

  it('lỗi mạng/timeout (fetch ném lỗi) → network_error, không có response để forward', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Hết thời gian chờ'))
    const result = await callAnthropicChat('key', 'model-x', 'system', [], 100)
    expect(result).toMatchObject({ kind: 'network_error', message: 'Hết thời gian chờ' })
  })

  it('gửi đúng system + messages + max_tokens trong body request', async () => {
    let sentBody: unknown
    global.fetch = vi.fn().mockImplementation((_url, init: RequestInit) => {
      sentBody = JSON.parse(init.body as string)
      return Promise.resolve({ ok: true, status: 200, text: async () => '{}' } as Response)
    })
    await callAnthropicChat(
      'key',
      'claude-haiku',
      'bạn là gia sư',
      [{ role: 'user', content: 'hi' }],
      256,
    )
    expect(sentBody).toEqual({
      model: 'claude-haiku',
      max_tokens: 256,
      system: 'bạn là gia sư',
      messages: [{ role: 'user', content: 'hi' }],
    })
  })
})

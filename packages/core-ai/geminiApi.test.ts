// Test api/_lib/geminiApi.ts — gọi Google Gemini API, tập trung vào các nhánh LỖI (HTTP lỗi,
// payload lỗi/rỗng) vì luồng thành công tương đối đơn giản.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { callGemini } from './geminiApi.js'

afterEach(() => vi.unstubAllGlobals())

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('callGemini', () => {
  it('HTTP lỗi (vd 429) → ném lỗi kèm status + nội dung', async () => {
    vi.stubGlobal('fetch', async () => new Response('Quota exceeded', { status: 429 }))
    await expect(callGemini('key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(
      /Gemini API error \(429\)/,
    )
  })

  it('response có field error → ném lỗi kèm message', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({ error: { message: 'Invalid API key' } }))
    await expect(callGemini('bad-key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(
      /Invalid API key/,
    )
  })

  it('không có candidates → ném lỗi "empty candidates"', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({ candidates: [] }))
    await expect(callGemini('key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(
      /empty candidates/,
    )
  })

  it('thiếu field candidates hoàn toàn → ném lỗi "empty candidates"', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({}))
    await expect(callGemini('key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(
      /empty candidates/,
    )
  })

  it('candidate không có content/parts → ném lỗi "empty content"', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({ candidates: [{ finishReason: 'STOP' }] }))
    await expect(callGemini('key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(
      /empty content/,
    )
  })

  it('parts rỗng → ném lỗi "empty content"', async () => {
    vi.stubGlobal('fetch', async () => jsonResponse({ candidates: [{ content: { parts: [] } }] }))
    await expect(callGemini('key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(
      /empty content/,
    )
  })

  it('part có text rỗng → ném lỗi "empty text"', async () => {
    vi.stubGlobal('fetch', async () =>
      jsonResponse({ candidates: [{ content: { parts: [{ text: '' }] } }] }),
    )
    await expect(callGemini('key', 'gemini-pro', 'system', [], 100)).rejects.toThrow(/empty text/)
  })

  it('phản hồi hợp lệ → trả về đúng text, gửi đúng payload (systemInstruction + hội thoại)', async () => {
    let capturedBody: string | undefined
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      capturedBody = init.body as string
      return jsonResponse({ candidates: [{ content: { parts: [{ text: 'Xin chào!' }] } }] })
    })
    const result = await callGemini(
      'key',
      'gemini-pro',
      'Bạn là gia sư tiếng Anh',
      [{ role: 'user', content: 'Hello' }],
      200,
      'cachedContents/eng-vocab-12k',
    )
    expect(result).toBe('Xin chào!')
    const body = JSON.parse(capturedBody ?? '{}')
    // system prompt được gửi trong systemInstruction
    expect(body.systemInstruction).toEqual({ parts: [{ text: 'Bạn là gia sư tiếng Anh' }] })
    expect(body.cachedContent).toBe('cachedContents/eng-vocab-12k')
    expect(body.contents[0]).toEqual({ role: 'user', parts: [{ text: 'Hello' }] })
    expect(body.generationConfig.maxOutputTokens).toBe(200)
  })

  it('không truyền system (rỗng) → không chèn systemInstruction vào payload', async () => {
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string)
      expect(body.systemInstruction).toBeUndefined()
      expect(body.contents).toHaveLength(1)
      expect(body.contents[0]).toEqual({ role: 'user', parts: [{ text: 'Hi' }] })
      return jsonResponse({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
    })
    await callGemini('key', 'gemini-pro', '', [{ role: 'user', content: 'Hi' }], 100)
  })

  it('role assistant được chuyển thành role model theo đúng convention Gemini', async () => {
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string)
      const last = body.contents[body.contents.length - 1]
      expect(last).toEqual({ role: 'model', parts: [{ text: 'Trả lời' }] })
      return jsonResponse({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
    })
    await callGemini('key', 'gemini-pro', '', [{ role: 'assistant', content: 'Trả lời' }], 100)
  })
})

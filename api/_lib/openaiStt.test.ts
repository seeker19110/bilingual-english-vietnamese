// Test transcribeAudio (api/_lib/openaiStt.ts) — audit 2026-07-03: trước đây
// `data.text?.trim() ?? ''` coi HTTP 200 thiếu/sai kiểu trường `text` giống hệt
// im lặng thật (chuỗi rỗng hợp lệ) → nơi gọi (api/stt.ts) không throw nên KHÔNG
// hoàn lượt dù đây là body hỏng, không phải người dùng không nói gì. Cùng nguyên
// tắc với parseGroqText đã sửa ở api/ai.ts (F1).

import { describe, it, expect, afterEach, vi } from 'vitest'
import { transcribeAudio } from './openaiStt'

const OLD_GROQ = process.env.GROQ_API_KEY
const OLD_OPENAI = process.env.OPENAI_API_KEY

afterEach(() => {
  vi.unstubAllGlobals()
  if (OLD_GROQ === undefined) delete process.env.GROQ_API_KEY
  else process.env.GROQ_API_KEY = OLD_GROQ
  if (OLD_OPENAI === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = OLD_OPENAI
})

describe('transcribeAudio — body 200 hỏng phải throw (để hoàn lượt), im lặng thật thì không', () => {
  it('trả về text hợp lệ bình thường', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      async () => new Response(JSON.stringify({ text: 'hello world' }), { status: 200 }),
    )
    const text = await transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')
    expect(text).toBe('hello world')
  })

  it('im lặng thật (text rỗng hợp lệ) → trả chuỗi rỗng, KHÔNG throw', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ text: '' }), { status: 200 }))
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).resolves.toBe('')
  })

  it('HTTP 200 nhưng thiếu trường text → throw (để api/stt.ts hoàn lượt)', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({}), { status: 200 }))
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).rejects.toThrow(
      /cấu trúc không hợp lệ/,
    )
  })

  it('HTTP 200 nhưng text sai kiểu (không phải string) → throw', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ text: 123 }), { status: 200 }))
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).rejects.toThrow(
      /cấu trúc không hợp lệ/,
    )
  })

  it('HTTP lỗi (4xx/5xx) → throw kèm mã lỗi', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', async () => new Response('server error', { status: 500 }))
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).rejects.toThrow(/500/)
  })
})

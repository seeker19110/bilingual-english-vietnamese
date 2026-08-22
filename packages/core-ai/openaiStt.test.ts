// Test transcribeAudio (api/_lib/openaiStt.ts) — audit 2026-07-03: trước đây
// `data.text?.trim() ?? ''` coi HTTP 200 thiếu/sai kiểu trường `text` giống hệt
// im lặng thật (chuỗi rỗng hợp lệ) → nơi gọi (api/stt.ts) không throw nên KHÔNG
// hoàn lượt dù đây là body hỏng, không phải người dùng không nói gì. Cùng nguyên
// tắc với parseGroqText đã sửa ở api/ai.ts (F1).

import { describe, it, expect, afterEach, vi } from 'vitest'
import { transcribeAudio } from './openaiStt'
import { __resetGroqKeyRotationForTests } from './groqKeyPool.js'

const OLD_GROQ = process.env.GROQ_API_KEY
const OLD_OPENAI = process.env.OPENAI_API_KEY

afterEach(() => {
  vi.unstubAllGlobals()
  __resetGroqKeyRotationForTests()
  if (OLD_GROQ === undefined) delete process.env.GROQ_API_KEY
  else process.env.GROQ_API_KEY = OLD_GROQ
  if (OLD_OPENAI === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = OLD_OPENAI
})

describe('transcribeAudio — body 200 hỏng phải throw (để hoàn lượt), im lặng thật thì không', () => {
  it('trả về text hợp lệ bình thường', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: 'hello world' }), { status: 200 })
    })
    const text = await transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')
    expect(text).toBe('hello world')
  })

  it('im lặng thật (text rỗng hợp lệ) → trả chuỗi rỗng, KHÔNG throw', async () => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: '' }), { status: 200 })
    })
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
    vi.stubGlobal('fetch', async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: 123 }), { status: 200 })
    })
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

// Đợt bổ sung 2026-08-03: chọn nhà cung cấp theo biến môi trường + thiếu cả 2 key.
describe('transcribeAudio — chọn nhà cung cấp (Groq ưu tiên hơn OpenAI)', () => {
  it('không có key nào → throw ngay, không gọi fetch', async () => {
    delete process.env.GROQ_API_KEY
    delete process.env.OPENAI_API_KEY
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).rejects.toThrow(
      /GROQ_API_KEY hoặc OPENAI_API_KEY/,
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('có cả GROQ_API_KEY lẫn OPENAI_API_KEY → ưu tiên gọi Groq', async () => {
    process.env.GROQ_API_KEY = 'groq-key'
    process.env.OPENAI_API_KEY = 'openai-key'
    const fetchSpy = vi.fn(async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchSpy)
    await transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')
    const url = fetchSpy.mock.calls[0]?.[0] as string
    expect(url).toContain('groq.com')
  })

  it('chỉ có OPENAI_API_KEY → gọi OpenAI, model mặc định gpt-4o-mini-transcribe', async () => {
    delete process.env.GROQ_API_KEY
    process.env.OPENAI_API_KEY = 'openai-key'
    const fetchSpy = vi.fn(async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchSpy)
    await transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')
    const url = fetchSpy.mock.calls[0]?.[0] as string
    expect(url).toContain('api.openai.com')
    const opts = fetchSpy.mock.calls[0]?.[1] as { body: FormData }
    expect(opts.body.get('model')).toBe('gpt-4o-mini-transcribe')
  })

  it('STT_MODEL đặt sẵn → ghi đè model mặc định của provider đang dùng', async () => {
    delete process.env.GROQ_API_KEY
    process.env.OPENAI_API_KEY = 'openai-key'
    process.env.STT_MODEL = 'whisper-1'
    const fetchSpy = vi.fn(async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchSpy)
    await transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')
    const opts = fetchSpy.mock.calls[0]?.[1] as { body: FormData }
    expect(opts.body.get('model')).toBe('whisper-1')
    delete process.env.STT_MODEL
  })

  it.each([
    ['audio/mp4', 'ok'],
    ['audio/m4a', 'ok'],
    ['audio/aac', 'ok'],
    ['audio/mpeg', 'ok'],
    ['audio/mp3', 'ok'],
    ['audio/ogg', 'ok'],
  ])('mime %s → gửi thành công (đuôi file suy đúng, không throw)', async (mime) => {
    process.env.GROQ_API_KEY = 'groq-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async (...args: unknown[]) => {
        void args
        return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
      }),
    )
    await expect(transcribeAudio(new ArrayBuffer(4), mime, 'en')).resolves.toBe('ok')
  })

  it('mime rỗng → dùng mặc định audio/webm', async () => {
    process.env.GROQ_API_KEY = 'groq-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async (...args: unknown[]) => {
        void args
        return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
      }),
    )
    await expect(transcribeAudio(new ArrayBuffer(4), '', 'en')).resolves.toBe('ok')
  })

  it('mime dạng wav → gửi đúng lang + form-data multipart', async () => {
    process.env.GROQ_API_KEY = 'groq-key'
    const fetchSpy = vi.fn(async (...args: unknown[]) => {
      void args
      return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchSpy)
    await transcribeAudio(new ArrayBuffer(4), 'audio/wav', 'vi')
    const opts = fetchSpy.mock.calls[0]?.[1] as { body: FormData }
    expect(opts.body).toBeInstanceOf(FormData)
    expect(opts.body.get('file')).toBeTruthy()
    expect(opts.body.get('language')).toBe('vi')
    expect(opts.body.get('response_format')).toBe('json')
  })
})

describe('transcribeAudio — GROQ_API_KEY nhiều key (cách nhau dấu phẩy) tự xoay vòng', () => {
  it('key đầu 401 → tự chuyển sang key kế tiếp, thành công', async () => {
    process.env.GROQ_API_KEY = 'key-bad,key-good'
    const fetchSpy = vi.fn(async (_url: string, init: RequestInit) => {
      const auth = (init.headers as Record<string, string>).Authorization
      if (auth === 'Bearer key-bad') return new Response('invalid', { status: 401 })
      return new Response(JSON.stringify({ text: 'ok' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchSpy)
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).resolves.toBe('ok')
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('toàn bộ key đều 429 → throw kèm mã lỗi của lần thử cuối', async () => {
    process.env.GROQ_API_KEY = 'key-1,key-2'
    const fetchSpy = vi.fn(async () => new Response('rate limited', { status: 429 }))
    vi.stubGlobal('fetch', fetchSpy)
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).rejects.toThrow(/429/)
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('lỗi không liên quan tới key (500) → throw ngay, không thử key khác', async () => {
    process.env.GROQ_API_KEY = 'key-1,key-2'
    const fetchSpy = vi.fn(async () => new Response('server error', { status: 500 }))
    vi.stubGlobal('fetch', fetchSpy)
    await expect(transcribeAudio(new ArrayBuffer(4), 'audio/webm', 'en')).rejects.toThrow(/500/)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})

// Test generateAudioFromGemini (packages/core-ai/geminiTts.ts) — mock fetch toàn cục, KHÔNG
// gọi Gemini thật (tốn tiền). Trọng tâm: thiếu API key, HTTP lỗi, response thiếu audio, và
// đóng gói WAV đúng (header 44 byte + đúng số byte PCM).

import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  generateAudioFromGemini,
  isValidGeminiVoice,
  hasGeminiTtsKey,
  parseSampleRate as parseSampleRateForTest,
} from './geminiTts.js'

const OLD_KEY = process.env.GEMINI_API_KEY

afterEach(() => {
  vi.unstubAllGlobals()
  if (OLD_KEY === undefined) delete process.env.GEMINI_API_KEY
  else process.env.GEMINI_API_KEY = OLD_KEY
})

describe('isValidGeminiVoice / hasGeminiTtsKey', () => {
  it('chỉ 6 giọng theo thể loại truyện là hợp lệ', () => {
    expect(isValidGeminiVoice('Gemini-Leda')).toBe(true)
    expect(isValidGeminiVoice('Gemini-Kore')).toBe(true)
    expect(isValidGeminiVoice('Kore')).toBe(false) // tên Chirp3-HD trần, không có tiền tố
    expect(isValidGeminiVoice('Khong-Ton-Tai')).toBe(false)
  })

  it('hasGeminiTtsKey phản ánh đúng biến môi trường', () => {
    process.env.GEMINI_API_KEY = 'k'
    expect(hasGeminiTtsKey()).toBe(true)
    delete process.env.GEMINI_API_KEY
    expect(hasGeminiTtsKey()).toBe(false)
    process.env.GEMINI_API_KEY = '   '
    expect(hasGeminiTtsKey()).toBe(false)
  })
})

describe('generateAudioFromGemini', () => {
  it('thiếu GEMINI_API_KEY → throw ngay, không gọi fetch', async () => {
    delete process.env.GEMINI_API_KEY
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    await expect(generateAudioFromGemini('hello', 'Gemini-Kore')).rejects.toThrow(
      /chưa cấu hình GEMINI_API_KEY/,
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('HTTP lỗi → throw kèm status code', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('quota exceeded', { status: 429 })),
    )
    await expect(generateAudioFromGemini('hello', 'Gemini-Kore')).rejects.toThrow(/429/)
  })

  it('HTTP 200 nhưng body có error.message (Gemini báo lỗi trong payload) → throw', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { message: 'invalid voice name' } }), {
            status: 200,
          }),
      ),
    )
    await expect(generateAudioFromGemini('hello', 'Gemini-Kore')).rejects.toThrow(
      /invalid voice name/,
    )
  })

  it('response thiếu dữ liệu âm thanh → throw', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ candidates: [{ content: { parts: [] } }] }), {
            status: 200,
          }),
      ),
    )
    await expect(generateAudioFromGemini('hello', 'Gemini-Kore')).rejects.toThrow(
      /thiếu dữ liệu âm thanh/,
    )
  })

  it('thành công → đóng gói đúng WAV (header 44 byte + PCM nguyên vẹn)', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    const pcmBytes = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]) // 4 "sample" 16-bit giả
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toContain('gemini-2.5-flash-preview-tts')
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'audio/L16;codec=pcm;rate=24000',
                        data: pcmBytes.toString('base64'),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        )
      }),
    )

    const wav = await generateAudioFromGemini('Ngày xưa có hai anh em.', 'Gemini-Aoede')
    const view = new DataView(wav)

    expect(wav.byteLength).toBe(44 + pcmBytes.byteLength)
    expect(view.getUint32(0, false)).toBe(0x52494646) // "RIFF"
    expect(view.getUint32(8, false)).toBe(0x57415645) // "WAVE"
    expect(view.getUint32(24, true)).toBe(24000) // sample rate lấy từ mimeType
    expect(view.getUint16(34, true)).toBe(16) // bitsPerSample
    expect(new Uint8Array(wav, 44)).toEqual(new Uint8Array(pcmBytes))
  })

  it('mimeType thiếu "rate=" → mặc định sample rate 24000', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    const pcmBytes = Buffer.from([9, 9])
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              candidates: [
                {
                  content: {
                    parts: [
                      { inlineData: { mimeType: 'audio/L16', data: pcmBytes.toString('base64') } },
                    ],
                  },
                },
              ],
            }),
            { status: 200 },
          ),
      ),
    )
    const wav = await generateAudioFromGemini('hello', 'Gemini-Kore')
    const view = new DataView(wav)
    expect(view.getUint32(24, true)).toBe(24000)
  })
})

describe('parseSampleRate (nội bộ)', () => {
  it('mimeType undefined (hàm dùng nội bộ, TypeScript cho phép dù find() luôn lọc trước) → 24000', () => {
    expect(parseSampleRateForTest(undefined)).toBe(24000)
  })
})

// GEMINI_TTS_MODEL đọc từ process.env LÚC MODULE nạp (module-level const) — phải đặt biến
// môi trường TRƯỚC rồi nạp lại module bằng vi.resetModules(), test module-scope thông thường
// (import tĩnh ở đầu file) không thấy được nhánh này.
describe('GEMINI_TTS_MODEL tuỳ chỉnh qua biến môi trường', () => {
  const OLD_MODEL = process.env.GEMINI_TTS_MODEL

  afterEach(() => {
    if (OLD_MODEL === undefined) delete process.env.GEMINI_TTS_MODEL
    else process.env.GEMINI_TTS_MODEL = OLD_MODEL
    vi.resetModules()
  })

  it('dùng đúng model gửi trong GEMINI_TTS_MODEL thay vì mặc định', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.GEMINI_TTS_MODEL = 'gemini-2.5-pro-preview-tts'
    vi.resetModules()
    const { generateAudioFromGemini: freshGenerate } = await import('./geminiTts.js')

    const pcmBytes = Buffer.from([1])
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toContain('gemini-2.5-pro-preview-tts')
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'audio/L16;rate=24000',
                        data: pcmBytes.toString('base64'),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        )
      }),
    )
    await freshGenerate('hello', 'Gemini-Kore')
  })
})

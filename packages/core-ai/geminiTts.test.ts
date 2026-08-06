// Test generateAudioFromGemini (packages/core-ai/geminiTts.ts) — mock fetch toàn cục, KHÔNG
// gọi Gemini thật (tốn tiền). Trọng tâm: thiếu API key, HTTP lỗi, response thiếu audio, và
// đóng gói WAV đúng (header 44 byte + đúng số byte PCM).

import { describe, it, expect, afterEach, vi } from 'vitest'
import { generateAudioFromGemini, isValidGeminiVoice, hasGeminiTtsKey } from './geminiTts'

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
})

// Test generateAudioFromElevenLabs (packages/core-ai/elevenLabsTts.ts) — mock fetch toàn cục,
// KHÔNG gọi ElevenLabs thật (tốn tiền). Trọng tâm: thiếu API key, HTTP lỗi, JSON hỏng, và
// alignment hợp lệ/không hợp lệ.

import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  generateAudioFromElevenLabs,
  isValidElevenVoice,
  hasElevenLabsKey,
} from './elevenLabsTts.js'

const OLD_KEY = process.env.ELEVENLABS_API_KEY

afterEach(() => {
  vi.unstubAllGlobals()
  if (OLD_KEY === undefined) delete process.env.ELEVENLABS_API_KEY
  else process.env.ELEVENLABS_API_KEY = OLD_KEY
})

describe('isValidElevenVoice / hasElevenLabsKey', () => {
  it('Rachel là giọng hợp lệ duy nhất', () => {
    expect(isValidElevenVoice('Rachel')).toBe(true)
    expect(isValidElevenVoice('Khong-Ton-Tai')).toBe(false)
  })

  it('hasElevenLabsKey phản ánh đúng biến môi trường', () => {
    process.env.ELEVENLABS_API_KEY = 'k'
    expect(hasElevenLabsKey()).toBe(true)
    delete process.env.ELEVENLABS_API_KEY
    expect(hasElevenLabsKey()).toBe(false)
    process.env.ELEVENLABS_API_KEY = '   '
    expect(hasElevenLabsKey()).toBe(false)
  })
})

describe('generateAudioFromElevenLabs', () => {
  it('thiếu ELEVENLABS_API_KEY → throw ngay, không gọi fetch', async () => {
    delete process.env.ELEVENLABS_API_KEY
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    await expect(generateAudioFromElevenLabs('hello')).rejects.toThrow(
      /chưa cấu hình ELEVENLABS_API_KEY/,
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('thành công kèm alignment hợp lệ → trả audio + alignment', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    const audioBase64 = Buffer.from('fake-mp3-bytes').toString('base64')
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              audio_base64: audioBase64,
              alignment: {
                characters: ['h', 'i'],
                character_start_times_seconds: [0, 0.1],
                character_end_times_seconds: [0.1, 0.2],
              },
            }),
            { status: 200 },
          ),
      ),
    )
    const result = await generateAudioFromElevenLabs('hi')
    expect(Buffer.from(result.audio).toString()).toBe('fake-mp3-bytes')
    expect(result.alignment?.characters).toEqual(['h', 'i'])
  })

  it('thành công nhưng alignment sai cấu trúc (mảng không khớp độ dài) → alignment null', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    const audioBase64 = Buffer.from('abc').toString('base64')
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              audio_base64: audioBase64,
              alignment: { characters: ['h', 'i'], character_start_times_seconds: [0] },
            }),
            { status: 200 },
          ),
      ),
    )
    const result = await generateAudioFromElevenLabs('hi')
    expect(result.alignment).toBeNull()
  })

  it('thành công, không có trường alignment → alignment null', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    const audioBase64 = Buffer.from('abc').toString('base64')
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(JSON.stringify({ audio_base64: audioBase64 }), { status: 200 }),
      ),
    )
    const result = await generateAudioFromElevenLabs('hi')
    expect(result.alignment).toBeNull()
  })

  it('HTTP lỗi (4xx/5xx) → throw kèm mã lỗi', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('quota exceeded', { status: 429 })),
    )
    await expect(generateAudioFromElevenLabs('hi')).rejects.toThrow(/ElevenLabs TTS lỗi \(429\)/)
  })

  it('HTTP 200 nhưng thiếu audio_base64 → throw', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    )
    await expect(generateAudioFromElevenLabs('hi')).rejects.toThrow(/thiếu audio_base64/)
  })

  it('HTTP 200 nhưng audio_base64 rỗng → throw', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ audio_base64: '' }), { status: 200 })),
    )
    await expect(generateAudioFromElevenLabs('hi')).rejects.toThrow(/thiếu audio_base64/)
  })

  it('fetch reject (lỗi mạng/timeout) → throw truyền nguyên lỗi', async () => {
    process.env.ELEVENLABS_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    await expect(generateAudioFromElevenLabs('hi')).rejects.toThrow(/network down/)
  })
})

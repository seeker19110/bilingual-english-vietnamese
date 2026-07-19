// Test xoay vòng nhiều API key (GOOGLE_TTS_API_KEYS) trong api/_lib/googleTts.ts:
// round-robin bình thường, và tự chuyển key khác khi 1 key báo hết quota (429).

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'

const OLD_SINGLE = process.env.GOOGLE_TTS_API_KEY
const OLD_LIST = process.env.GOOGLE_TTS_API_KEYS

function mockGoogleResponse(handler: (apiKey: string) => Response) {
  vi.stubGlobal('fetch', async (url: string) => {
    const apiKey = new URL(url).searchParams.get('key') ?? ''
    return handler(apiKey)
  })
}

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
  if (OLD_SINGLE === undefined) delete process.env.GOOGLE_TTS_API_KEY
  else process.env.GOOGLE_TTS_API_KEY = OLD_SINGLE
  if (OLD_LIST === undefined) delete process.env.GOOGLE_TTS_API_KEYS
  else process.env.GOOGLE_TTS_API_KEYS = OLD_LIST
})

describe('generateAudioFromGoogle — xoay vòng key', () => {
  it('không có key nào → throw lỗi rõ ràng', async () => {
    delete process.env.GOOGLE_TTS_API_KEY
    delete process.env.GOOGLE_TTS_API_KEYS
    const { generateAudioFromGoogle } = await import('./googleTts')
    await expect(generateAudioFromGoogle('hi')).rejects.toThrow(/GOOGLE_TTS_API_KEY/)
  })

  it('chỉ 1 key (biến cũ) vẫn hoạt động như trước', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'key-single'
    delete process.env.GOOGLE_TTS_API_KEYS
    mockGoogleResponse(
      () =>
        new Response(JSON.stringify({ audioContent: Buffer.from('abc').toString('base64') }), {
          status: 200,
        }),
    )
    const { generateAudioFromGoogle } = await import('./googleTts')
    const buf = await generateAudioFromGoogle('hi')
    expect(new TextDecoder().decode(buf)).toBe('abc')
  })

  it('nhiều key → chia đều round-robin qua các lần gọi liên tiếp', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b,key-c'
    delete process.env.GOOGLE_TTS_API_KEY
    const usedKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      usedKeys.push(apiKey)
      return new Response(JSON.stringify({ audioContent: Buffer.from('x').toString('base64') }), {
        status: 200,
      })
    })
    const { generateAudioFromGoogle } = await import('./googleTts')
    await generateAudioFromGoogle('a')
    await generateAudioFromGoogle('b')
    await generateAudioFromGoogle('c')
    await generateAudioFromGoogle('d')
    expect(usedKeys).toEqual(['key-a', 'key-b', 'key-c', 'key-a'])
  })

  it('key đầu hết quota (429) → tự chuyển sang key kế tiếp, vẫn trả audio', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b'
    delete process.env.GOOGLE_TTS_API_KEY
    mockGoogleResponse((apiKey) => {
      if (apiKey === 'key-a') {
        return new Response('quota exceeded RESOURCE_EXHAUSTED', { status: 429 })
      }
      return new Response(JSON.stringify({ audioContent: Buffer.from('ok').toString('base64') }), {
        status: 200,
      })
    })
    const { generateAudioFromGoogle } = await import('./googleTts')
    const buf = await generateAudioFromGoogle('hi')
    expect(new TextDecoder().decode(buf)).toBe('ok')
  })

  it('TOÀN BỘ key đều hết quota → throw lỗi 429 (để client fallback Web Speech)', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b'
    delete process.env.GOOGLE_TTS_API_KEY
    mockGoogleResponse(() => new Response('RESOURCE_EXHAUSTED', { status: 429 }))
    const { generateAudioFromGoogle } = await import('./googleTts')
    await expect(generateAudioFromGoogle('hi')).rejects.toThrow(/429/)
  })

  it('lỗi KHÔNG PHẢI quota (vd 400) → throw ngay, không thử key khác', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b'
    delete process.env.GOOGLE_TTS_API_KEY
    const usedKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      usedKeys.push(apiKey)
      return new Response('bad request', { status: 400 })
    })
    const { generateAudioFromGoogle } = await import('./googleTts')
    await expect(generateAudioFromGoogle('hi')).rejects.toThrow(/400/)
    expect(usedKeys).toEqual(['key-a'])
  })
})

describe('hasGoogleTtsKey', () => {
  it('false khi chưa cấu hình key nào', async () => {
    delete process.env.GOOGLE_TTS_API_KEY
    delete process.env.GOOGLE_TTS_API_KEYS
    const { hasGoogleTtsKey } = await import('./googleTts')
    expect(hasGoogleTtsKey()).toBe(false)
  })

  it('true khi có GOOGLE_TTS_API_KEYS dù không có GOOGLE_TTS_API_KEY', async () => {
    delete process.env.GOOGLE_TTS_API_KEY
    process.env.GOOGLE_TTS_API_KEYS = 'key-a'
    const { hasGoogleTtsKey } = await import('./googleTts')
    expect(hasGoogleTtsKey()).toBe(true)
  })
})

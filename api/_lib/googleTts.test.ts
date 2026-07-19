// Test xoay vòng nhiều API key (GOOGLE_TTS_API_KEYS) trong api/_lib/googleTts.ts:
// round-robin bình thường, tự chuyển key khác khi 1 key báo hết quota (429) hoặc
// billing chưa bật (403), và bể "khỏe mạnh" (probe định kỳ, loại tạm key hỏng).

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

  it('chỉ 1 key (biến cũ) vẫn hoạt động như trước — không probe (pool ≤ 1)', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'key-single'
    delete process.env.GOOGLE_TTS_API_KEYS
    const usedKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      usedKeys.push(apiKey)
      return new Response(JSON.stringify({ audioContent: Buffer.from('abc').toString('base64') }), {
        status: 200,
      })
    })
    const { generateAudioFromGoogle } = await import('./googleTts')
    const buf = await generateAudioFromGoogle('hi')
    expect(new TextDecoder().decode(buf)).toBe('abc')
    // 1 key duy nhất → không có gì để loại trừ, getHealthyKeyPool() bỏ qua bước probe.
    expect(usedKeys).toEqual(['key-single'])
  })

  it('nhiều key → probe 1 lần rồi chia đều round-robin qua các lần gọi liên tiếp', async () => {
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
    // 3 lượt probe (song song, đúng thứ tự bể) rồi mới tới 4 lượt gọi thật xoay vòng.
    expect(usedKeys).toEqual([
      'key-a',
      'key-b',
      'key-c', // probe
      'key-a',
      'key-b',
      'key-c',
      'key-a', // xoay vòng thật
    ])
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

  it('key đầu billing CHƯA BẬT (403) → tự chuyển sang key kế tiếp, vẫn trả audio', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b'
    delete process.env.GOOGLE_TTS_API_KEY
    mockGoogleResponse((apiKey) => {
      if (apiKey === 'key-a') {
        // Lỗi thật Google trả về — pretty-print JSON có xuống dòng thật giữa "(403)" và "billing".
        return new Response(
          JSON.stringify(
            { error: { code: 403, message: 'This API method requires billing to be enabled.' } },
            null,
            2,
          ),
          { status: 403 },
        )
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

  it('lỗi KHÔNG PHẢI quota/billing (vd 400) → throw ngay, không thử key khác trong lượt gọi thật', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b'
    delete process.env.GOOGLE_TTS_API_KEY
    const usedKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      usedKeys.push(apiKey)
      return new Response('bad request', { status: 400 })
    })
    const { generateAudioFromGoogle } = await import('./googleTts')
    await expect(generateAudioFromGoogle('hi')).rejects.toThrow(/400/)
    // Probe cũng lỗi 400 cho cả 2 key (probeKey nuốt lỗi, coi là "không dùng được") — bể khỏe
    // mạnh rỗng nên getHealthyKeyPool() fallback dùng lại NGUYÊN bể gốc (xem comment hàm đó).
    // Lượt gọi thật chỉ thử key ĐẦU TIÊN rồi throw ngay (400 không phải lỗi do key).
    expect(usedKeys).toEqual(['key-a', 'key-b', 'key-a'])
  })
})

describe('getHealthyKeyPool (probe định kỳ, loại tạm key hỏng)', () => {
  it('key billing chưa bật bị LOẠI KHỎI vòng xoay thật (không chỉ skip giữa chừng)', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-bad,key-good'
    delete process.env.GOOGLE_TTS_API_KEY
    const realCallKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      if (apiKey === 'key-bad') {
        realCallKeys.push(`probe-or-real:${apiKey}`)
        return new Response('{"error":{"code":403,"message":"billing to be enabled"}}', {
          status: 403,
        })
      }
      realCallKeys.push(`probe-or-real:${apiKey}`)
      return new Response(JSON.stringify({ audioContent: Buffer.from('x').toString('base64') }), {
        status: 200,
      })
    })
    const { generateAudioFromGoogle } = await import('./googleTts')
    await generateAudioFromGoogle('a') // probe: bad(fail)+good(ok) → bể khỏe mạnh = [key-good]
    await generateAudioFromGoogle('b') // trong TTL cache → chỉ còn key-good, KHÔNG thử key-bad nữa
    // 2 probe (bad, good) + 2 lượt gọi thật đều key-good = 4 lần chạm 'key-bad' hoặc 'key-good'.
    expect(realCallKeys).toEqual([
      'probe-or-real:key-bad',
      'probe-or-real:key-good',
      'probe-or-real:key-good',
      'probe-or-real:key-good',
    ])
  })
})

describe('probeApiKeys + setActiveKeyPool', () => {
  it('probe từng key song song, trả về key nào 200 và key nào lỗi', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b,key-c'
    delete process.env.GOOGLE_TTS_API_KEY
    mockGoogleResponse((apiKey) => {
      if (apiKey === 'key-b') return new Response('RESOURCE_EXHAUSTED', { status: 429 })
      return new Response(JSON.stringify({ audioContent: Buffer.from('x').toString('base64') }), {
        status: 200,
      })
    })
    const { probeApiKeys } = await import('./googleTts')
    const { working, total } = await probeApiKeys()
    expect(total).toEqual(['key-a', 'key-b', 'key-c'])
    expect(working).toEqual(['key-a', 'key-c'])
  })

  it('setActiveKeyPool thu hẹp bể — chỉ xoay vòng qua key được truyền vào (sau probe)', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b,key-c'
    delete process.env.GOOGLE_TTS_API_KEY
    const usedKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      usedKeys.push(apiKey)
      return new Response(JSON.stringify({ audioContent: Buffer.from('x').toString('base64') }), {
        status: 200,
      })
    })
    const { generateAudioFromGoogle, setActiveKeyPool } = await import('./googleTts')
    setActiveKeyPool(['key-a', 'key-c'])
    await generateAudioFromGoogle('a')
    await generateAudioFromGoogle('b')
    await generateAudioFromGoogle('c')
    // probe 2 key (a,c) rồi xoay vòng thật 3 lần: a, c, a.
    expect(usedKeys).toEqual(['key-a', 'key-c', 'key-a', 'key-c', 'key-a'])
  })

  it('setActiveKeyPool(null) → quay lại đọc toàn bộ key từ biến môi trường + xóa cache khỏe mạnh cũ', async () => {
    process.env.GOOGLE_TTS_API_KEYS = 'key-a,key-b'
    delete process.env.GOOGLE_TTS_API_KEY
    const usedKeys: string[] = []
    mockGoogleResponse((apiKey) => {
      usedKeys.push(apiKey)
      return new Response(JSON.stringify({ audioContent: Buffer.from('x').toString('base64') }), {
        status: 200,
      })
    })
    const { generateAudioFromGoogle, setActiveKeyPool } = await import('./googleTts')
    setActiveKeyPool(['key-a']) // 1 key → không probe
    await generateAudioFromGoogle('x')
    setActiveKeyPool(null) // quay lại bể đầy đủ 2 key + xóa cache
    await generateAudioFromGoogle('y')
    await generateAudioFromGoogle('z')
    // x: key-a (không probe, pool=1). y: probe(a,b) rồi xoay vòng thật key-a. z: key-b (cache còn hạn).
    expect(usedKeys).toEqual(['key-a', 'key-a', 'key-b', 'key-a', 'key-b'])
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

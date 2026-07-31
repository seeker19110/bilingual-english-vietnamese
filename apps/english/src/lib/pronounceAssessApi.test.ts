import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./authHeader', () => ({
  getAuthHeader: async () => ({ Authorization: 'Bearer test-token' }),
}))
vi.mock('./wav', () => ({
  blobToWav16kMono: vi.fn(async () => new ArrayBuffer(8)),
}))

import { assessPronunciationClient } from './pronounceAssessApi'
import { blobToWav16kMono } from './wav'

const mockedBlobToWav = vi.mocked(blobToWav16kMono)

const GOOD_RESULT = {
  overall: 88,
  accuracy: 85,
  fluency: 90,
  completeness: 100,
  words: [{ word: 'three', score: 60, errorType: 'Mispronunciation', phonemes: [] }],
}

beforeEach(() => {
  mockedBlobToWav.mockReset()
  mockedBlobToWav.mockResolvedValue(new ArrayBuffer(8))
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('assessPronunciationClient', () => {
  it('đường thành công: convert WAV, gọi API, trả result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        expect(init.method).toBe('POST')
        const body = JSON.parse(init.body as string) as { referenceText: string; audio_b64: string }
        expect(body.referenceText).toBe('three books')
        expect(typeof body.audio_b64).toBe('string')
        return new Response(JSON.stringify(GOOD_RESULT), { status: 200 })
      }),
    )
    const outcome = await assessPronunciationClient(new Blob(['x']), 'three books')
    expect(outcome).toEqual({ ok: true, result: GOOD_RESULT })
  })

  it('convert WAV lỗi (audio hỏng) → ok:false, fallback:false', async () => {
    mockedBlobToWav.mockRejectedValue(new Error('Không giải mã được audio'))
    const outcome = await assessPronunciationClient(new Blob(['x']), 'hello')
    expect(outcome).toEqual({ ok: false, fallback: false, message: 'Không giải mã được audio' })
  })

  it('server trả 503 fallback:true (chưa cấu hình Azure) → giữ nguyên fallback:true', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(JSON.stringify({ error: 'chưa cấu hình', fallback: true }), { status: 503 }),
    )
    const outcome = await assessPronunciationClient(new Blob(['x']), 'hello')
    expect(outcome).toEqual({ ok: false, fallback: true, message: 'chưa cấu hình' })
  })

  it('server trả 429 hết lượt (fallback:true)', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(JSON.stringify({ error: 'Hết lượt hôm nay', fallback: true }), {
          status: 429,
        }),
    )
    const outcome = await assessPronunciationClient(new Blob(['x']), 'hello')
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.fallback).toBe(true)
  })

  it('server trả 500 lỗi cứng (không có fallback) → fallback:false', async () => {
    vi.stubGlobal(
      'fetch',
      async () => new Response(JSON.stringify({ error: 'Azure lỗi (500)' }), { status: 500 }),
    )
    const outcome = await assessPronunciationClient(new Blob(['x']), 'hello')
    expect(outcome).toEqual({ ok: false, fallback: false, message: 'Azure lỗi (500)' })
  })

  it('fetch ném lỗi mạng → ok:false, thông điệp thân thiện', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    const outcome = await assessPronunciationClient(new Blob(['x']), 'hello')
    expect(outcome).toEqual({ ok: false, fallback: false, message: 'Không kết nối được máy chủ' })
  })
})

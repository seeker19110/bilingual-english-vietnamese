import { describe, it, expect, afterEach, vi } from 'vitest'
import { fetchWithTimeout } from './fetchTimeout'

// vitest.setup.ts stub global fetch để đọc file — ở đây ta tự stub lại theo từng ca.
afterEach(() => vi.unstubAllGlobals())

describe('fetchWithTimeout (H2 — timeout chống treo)', () => {
  it('phản hồi nhanh → trả Response bình thường', async () => {
    vi.stubGlobal('fetch', async () => new Response('ok', { status: 200 }))
    const res = await fetchWithTimeout('https://x.test', {}, 1000)
    expect(res.status).toBe(200)
  })

  it('quá thời gian chờ → ném lỗi "Hết thời gian chờ"', async () => {
    // fetch giả: chỉ reject khi AbortController phát tín hiệu abort (do timeout).
    vi.stubGlobal(
      'fetch',
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const e = new Error('aborted')
            e.name = 'AbortError'
            reject(e)
          })
        }),
    )
    await expect(fetchWithTimeout('https://slow.test', {}, 30)).rejects.toThrow(/Hết thời gian chờ/)
  })

  it('lỗi mạng (không phải abort) → ném nguyên lỗi gốc', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('ECONNREFUSED')
    })
    await expect(fetchWithTimeout('https://down.test', {}, 1000)).rejects.toThrow(/ECONNREFUSED/)
  })
})

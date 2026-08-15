import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'

// Mock lớp lưu trữ: không gọi Cloudflare thật.
vi.mock('./fileStorage.js', () => ({
  listR2Objects: vi.fn(),
  getR2PublicBaseUrl: vi.fn(),
}))

import { runTtsCacheAudit, urlToR2Key } from './ttsCacheAudit.js'
import { listR2Objects, getR2PublicBaseUrl } from './fileStorage.js'

const BASE = 'https://pub-abc.r2.dev'

describe('urlToR2Key', () => {
  it('URL R2 → key tương ứng', () => {
    expect(urlToR2Key(`${BASE}/tts-cache/en-US/f/a.mp3`, BASE)).toBe('tts-cache/en-US/f/a.mp3')
  })

  it('base URL có dấu / thừa vẫn đúng', () => {
    expect(urlToR2Key(`${BASE}/tts-cache/a.mp3`, `${BASE}/`)).toBe('tts-cache/a.mp3')
  })

  it('URL /uploads cũ → null (không thuộc R2)', () => {
    expect(urlToR2Key('/uploads/tts-cache/a.mp3', BASE)).toBeNull()
  })

  it('domain chỉ TRÙNG TIỀN TỐ → null (không nhận nhầm)', () => {
    expect(urlToR2Key('https://pub-abc.r2.dev.evil.com/tts-cache/a.mp3', BASE)).toBeNull()
  })
})

describe('runTtsCacheAudit', () => {
  const query = vi.fn()
  const pool = { query } as unknown as Pool

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getR2PublicBaseUrl).mockReturnValue(BASE)
  })

  it('chưa cấu hình R2_PUBLIC_BASE_URL → ném lỗi rõ ràng', async () => {
    vi.mocked(getR2PublicBaseUrl).mockReturnValue(undefined)
    await expect(runTtsCacheAudit(pool)).rejects.toThrow(/R2_PUBLIC_BASE_URL/)
  })

  it('phân loại đúng: trỏ R2 / trỏ sai chỗ / thiếu trên R2 / orphan', async () => {
    // R2 có: a.mp3 (được DB trỏ tới), zz.mp3 (không ai trỏ → orphan)
    vi.mocked(listR2Objects).mockImplementation(async (prefix: string) =>
      prefix === 'tts-cache/'
        ? [
            { key: 'tts-cache/a.mp3', size: 1000 },
            { key: 'tts-cache/zz.mp3', size: 500 },
          ]
        : [],
    )
    // DB có 3 dòng: 1 khớp file thật, 1 trỏ R2 nhưng file đã mất, 1 trỏ /uploads cũ.
    query
      .mockResolvedValueOnce({
        rows: [
          { audio_url: `${BASE}/tts-cache/a.mp3` },
          { audio_url: `${BASE}/tts-cache/mat-roi.mp3` },
          { audio_url: '/uploads/tts-cache/cu.mp3' },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })

    const res = await runTtsCacheAudit(pool)
    const t = res.ttsCache

    expect(t.total).toBe(3)
    expect(t.onR2).toBe(2) // 2 dòng trỏ đúng miền R2
    expect(t.offR2).toBe(1) // dòng /uploads
    expect(t.missingOnR2).toBe(1) // mat-roi.mp3
    expect(t.orphanOnR2).toBe(1) // zz.mp3
    expect(t.r2Files).toBe(2)
    expect(t.r2Bytes).toBe(1500)
    expect(t.samples.offR2).toEqual(['/uploads/tts-cache/cu.mp3'])
    expect(t.samples.missingOnR2).toEqual(['tts-cache/mat-roi.mp3'])
    expect(t.samples.orphanOnR2).toEqual(['tts-cache/zz.mp3'])
  })

  it('cache khớp hoàn toàn → không có mục nào bất thường', async () => {
    vi.mocked(listR2Objects).mockImplementation(async (prefix: string) =>
      prefix === 'pronunciations/' ? [{ key: 'pronunciations/apple.mp3', size: 10 }] : [],
    )
    query
      .mockResolvedValueOnce({ rows: [] }) // tts_cache
      .mockResolvedValueOnce({ rows: [{ audio_url: `${BASE}/pronunciations/apple.mp3` }] })

    const res = await runTtsCacheAudit(pool)
    expect(res.pronunciations).toMatchObject({
      total: 1,
      onR2: 1,
      offR2: 0,
      missingOnR2: 0,
      orphanOnR2: 0,
    })
  })

  it('đọc đúng 2 bảng, KHÔNG kéo về cột dữ liệu người dùng nào', async () => {
    vi.mocked(listR2Objects).mockResolvedValue([])
    query.mockResolvedValue({ rows: [] })
    await runTtsCacheAudit(pool)
    const sqls = query.mock.calls.map((c) => String(c[0]))
    expect(sqls).toEqual([
      'select audio_url from public.tts_cache',
      'select audio_url from english.pronunciations',
    ])
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Pool } from 'pg'
import { recordTtsCacheEvent } from './ttsStats.js'

describe('recordTtsCacheEvent', () => {
  const query = vi.fn()
  const pool = { query } as unknown as Pool

  beforeEach(() => {
    vi.clearAllMocks()
    query.mockResolvedValue({ rows: [] })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hit → cộng vào cột hits', () => {
    recordTtsCacheEvent(pool, { lang: 'en-US', voice: 'Algieba', hit: true })
    const sql = String(query.mock.calls[0]?.[0])
    expect(sql).toContain('hits')
    expect(sql).not.toContain('misses')
    expect(query.mock.calls[0]?.[1]).toEqual([expect.any(String), 'en-US', 'Algieba'])
  })

  it('miss → cộng vào cột misses', () => {
    recordTtsCacheEvent(pool, { lang: 'vi-VN', voice: 'Kore', hit: false })
    const sql = String(query.mock.calls[0]?.[0])
    expect(sql).toContain('misses')
    expect(sql).not.toContain('hits')
  })

  it('cộng dồn chứ không ghi đè (upsert phải có do update ... + 1)', () => {
    recordTtsCacheEvent(pool, { lang: 'en-US', voice: 'Algieba', hit: true })
    const sql = String(query.mock.calls[0]?.[0])
    expect(sql).toContain('on conflict (day, lang, voice) do update')
    expect(sql).toContain('+ 1')
  })

  it('ngày lưu theo định dạng YYYY-MM-DD (giờ VN)', () => {
    recordTtsCacheEvent(pool, { lang: 'en-US', voice: 'Algieba', hit: true })
    expect(String(query.mock.calls[0]?.[1]?.[0])).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('DB lỗi KHÔNG được ném ra ngoài (không làm hỏng việc phát audio)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    query.mockRejectedValueOnce(new Error('db down'))
    expect(() => recordTtsCacheEvent(pool, { lang: 'en-US', voice: 'x', hit: true })).not.toThrow()
    // Chờ microtask để .catch() kịp chạy.
    await new Promise((r) => setTimeout(r, 0))
    expect(warn).toHaveBeenCalled()
  })

  it('không await — trả về ngay cả khi query treo', () => {
    query.mockReturnValueOnce(new Promise(() => {})) // không bao giờ resolve
    expect(() => recordTtsCacheEvent(pool, { lang: 'en-US', voice: 'x', hit: true })).not.toThrow()
  })
})

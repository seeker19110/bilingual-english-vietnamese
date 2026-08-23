// Test api/_lib/planMarketing.ts — đọc nội dung mô tả gói (badge/tagline/bullets), cache TTL.
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))

import { getPlanMarketing, invalidatePlanMarketingCache } from './planMarketing.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  invalidatePlanMarketingCache()
})

describe('getPlanMarketing', () => {
  it('không có dòng nào → trả về 3 gói rỗng, updatedAt mặc định', async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })
    const data = await getPlanMarketing()
    expect(data.plans.free).toEqual({
      plan: 'free',
      badge: '',
      taglineVi: '',
      taglineEn: '',
      bullets: [],
    })
    expect(data.plans.pro.plan).toBe('pro')
    expect(data.plans.vip.plan).toBe('vip')
    expect(data.updatedAt).toBe('1970-01-01T00:00:00.000Z')
  })

  it('gộp info + bullets đúng theo từng gói, updatedAt lấy mốc mới nhất', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            plan: 'pro',
            badge: 'Phổ biến',
            tagline_vi: 'Học nhanh hơn',
            tagline_en: 'Learn faster',
            updated_at: new Date('2026-01-01'),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            plan: 'pro',
            sort_order: 1,
            text_vi: 'Không giới hạn',
            text_en: 'Unlimited',
            updated_at: new Date('2026-01-05'),
          },
        ],
      })
    const data = await getPlanMarketing()
    expect(data.plans.pro.badge).toBe('Phổ biến')
    expect(data.plans.pro.bullets).toEqual([
      { id: 1, textVi: 'Không giới hạn', textEn: 'Unlimited', sortOrder: 1 },
    ])
    expect(data.plans.free.badge).toBe('') // gói không có info vẫn giữ rỗng
    expect(data.updatedAt).toBe(new Date('2026-01-05').toISOString())
  })

  it('cache trong TTL → không gọi DB lần 2', async () => {
    query.mockResolvedValue({ rows: [] })
    await getPlanMarketing()
    await getPlanMarketing()
    // mỗi lần loadData gọi 2 query song song → cache hit chỉ tốn 2 lần tổng cộng
    expect(query).toHaveBeenCalledTimes(2)
  })

  it('invalidatePlanMarketingCache → lần gọi sau đọc lại DB', async () => {
    query.mockResolvedValue({ rows: [] })
    await getPlanMarketing()
    invalidatePlanMarketingCache()
    await getPlanMarketing()
    expect(query).toHaveBeenCalledTimes(4)
  })

  it('DB lỗi → trả về dữ liệu mặc định (client tự fallback)', async () => {
    query.mockRejectedValueOnce(new Error('db down'))
    const data = await getPlanMarketing()
    expect(data.plans.free.badge).toBe('')
    expect(data.updatedAt).toBe('1970-01-01T00:00:00.000Z')
  })
})

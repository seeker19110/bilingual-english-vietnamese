import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))

import {
  activePromoPercent,
  getPricePromo,
  invalidatePricePromoCache,
  type PricePromo,
} from './pricePromo'
import { getPgPool } from '../../packages/core-db/pgPool'

describe('activePromoPercent', () => {
  const NOW = new Date('2026-07-27T10:00:00+07:00')

  it('percent = 0 → null (không có khuyến mãi)', () => {
    const promo: PricePromo = {
      percent: 0,
      startsAt: '2026-07-01T00:00:00+07:00',
      endsAt: '2026-08-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBeNull()
  })

  it('thiếu startsAt hoặc endsAt → null dù percent > 0', () => {
    const missingStarts: PricePromo = {
      percent: 20,
      startsAt: null,
      endsAt: '2026-08-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    const missingEnds: PricePromo = {
      percent: 20,
      startsAt: '2026-07-01T00:00:00+07:00',
      endsAt: null,
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(missingStarts, NOW)).toBeNull()
    expect(activePromoPercent(missingEnds, NOW)).toBeNull()
  })

  it('now nằm TRONG khoảng [starts, ends] → trả về percent', () => {
    const promo: PricePromo = {
      percent: 15,
      startsAt: '2026-07-01T00:00:00+07:00',
      endsAt: '2026-08-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBe(15)
  })

  it('now TRƯỚC starts_at → null (ca biên: chưa tới ngày bắt đầu)', () => {
    const promo: PricePromo = {
      percent: 15,
      startsAt: '2026-08-01T00:00:00+07:00',
      endsAt: '2026-09-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBeNull()
  })

  it('now SAU ends_at → null (ca biên: đã hết hạn)', () => {
    const promo: PricePromo = {
      percent: 15,
      startsAt: '2026-06-01T00:00:00+07:00',
      endsAt: '2026-07-01T00:00:00+07:00',
      updatedAt: NOW.toISOString(),
    }
    expect(activePromoPercent(promo, NOW)).toBeNull()
  })
})

describe('getPricePromo', () => {
  const mockedGetPool = vi.mocked(getPgPool)
  const query = vi.fn()

  beforeEach(() => {
    query.mockReset()
    mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
    invalidatePricePromoCache()
  })

  it('không có dòng id=1 → trả về mặc định (không khuyến mãi)', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const promo = await getPricePromo()
    expect(promo.percent).toBe(0)
    expect(promo.startsAt).toBeNull()
  })

  it('có dòng khuyến mãi → chuyển đổi đúng sang ISO string', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          percent: 20,
          starts_at: new Date('2026-07-01T00:00:00Z'),
          ends_at: new Date('2026-08-01T00:00:00Z'),
          updated_at: new Date('2026-07-01T00:00:00Z'),
        },
      ],
    })
    const promo = await getPricePromo()
    expect(promo.percent).toBe(20)
    expect(promo.startsAt).toBe('2026-07-01T00:00:00.000Z')
    expect(promo.endsAt).toBe('2026-08-01T00:00:00.000Z')
  })

  it('cache trong TTL → không gọi DB lần 2', async () => {
    query.mockResolvedValue({ rows: [] })
    await getPricePromo()
    await getPricePromo()
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('invalidatePricePromoCache → đọc lại DB', async () => {
    query.mockResolvedValue({ rows: [] })
    await getPricePromo()
    invalidatePricePromoCache()
    await getPricePromo()
    expect(query).toHaveBeenCalledTimes(2)
  })

  it('DB lỗi → fail-open, trả về mặc định không giảm giá', async () => {
    query.mockRejectedValueOnce(new Error('db down'))
    const promo = await getPricePromo()
    expect(promo.percent).toBe(0)
  })

  it('có starts_at nhưng ends_at null → endsAt trả về null (ca biên dữ liệu thiếu)', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          percent: 10,
          starts_at: new Date('2026-07-01T00:00:00Z'),
          ends_at: null,
          updated_at: new Date('2026-07-01T00:00:00Z'),
        },
      ],
    })
    const promo = await getPricePromo()
    expect(promo.startsAt).toBe('2026-07-01T00:00:00.000Z')
    expect(promo.endsAt).toBeNull()
  })
})

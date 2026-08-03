import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('../../packages/core-db/settings', () => ({ getAppSettings: vi.fn() }))

import { computePlanGrant, grantPlanDays } from './planGrant'
import { getPgPool } from '../../packages/core-db/pgPool'
import { getAppSettings } from '../../packages/core-db/settings'

const NOW = new Date('2026-07-25T10:00:00+07:00')
const MS_DAY = 86_400_000
const daysFromNow = (n: number) => new Date(NOW.getTime() + n * MS_DAY)

describe('computePlanGrant', () => {
  it('user free (chưa có gói) → cấp đúng gói, hạn = now + N ngày', () => {
    const r = computePlanGrant('free', null, 'pro', 7, NOW)
    expect(r.plan).toBe('pro')
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(7).getTime())
  })

  it('user chưa có hồ sơ (plan null) → coi như free, cấp bình thường', () => {
    const r = computePlanGrant(null, null, 'pro', 7, NOW)
    expect(r.plan).toBe('pro')
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(7).getTime())
  })

  it('CỘNG DỒN: đang Pro còn 5 ngày, thưởng thêm 7 ngày → còn 12 ngày (không mất phần cũ)', () => {
    const r = computePlanGrant('pro', daysFromNow(5), 'pro', 7, NOW)
    expect(r.plan).toBe('pro')
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(12).getTime())
  })

  it('gói cũ ĐÃ HẾT HẠN → tính lại từ bây giờ, không cộng vào mốc quá khứ', () => {
    const r = computePlanGrant('pro', daysFromNow(-10), 'pro', 7, NOW)
    expect(r.plan).toBe('pro')
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(7).getTime())
  })

  it('KHÔNG HẠ CẤP: đang VIP còn hạn, thưởng Pro → vẫn là VIP, vẫn được cộng ngày', () => {
    const r = computePlanGrant('vip', daysFromNow(5), 'pro', 7, NOW)
    expect(r.plan).toBe('vip')
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(12).getTime())
  })

  it('NÂNG CẤP: đang Pro còn hạn, cấp VIP → thành VIP, cộng dồn hạn', () => {
    const r = computePlanGrant('pro', daysFromNow(5), 'vip', 30, NOW)
    expect(r.plan).toBe('vip')
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(35).getTime())
  })

  it('gói VĨNH VIỄN (expires null) không bị đụng — không biến thành có hạn', () => {
    const r = computePlanGrant('vip', null, 'pro', 7, NOW)
    expect(r.plan).toBe('vip')
    expect(r.planExpiresAt).toBeNull()
  })

  it('Pro vĩnh viễn + cấp VIP → nâng lên VIP, vẫn vĩnh viễn', () => {
    const r = computePlanGrant('pro', null, 'vip', 7, NOW)
    expect(r.plan).toBe('vip')
    expect(r.planExpiresAt).toBeNull()
  })

  it('days = 0 hoặc âm → không trừ hạn đang có (phòng lỗi gọi sai)', () => {
    const zero = computePlanGrant('pro', daysFromNow(5), 'pro', 0, NOW)
    expect(zero.planExpiresAt?.getTime()).toBe(daysFromNow(5).getTime())

    const negative = computePlanGrant('pro', daysFromNow(5), 'pro', -3, NOW)
    expect(negative.planExpiresAt?.getTime()).toBe(daysFromNow(5).getTime())
  })

  it('days không phải số hữu hạn → không làm hỏng hạn hiện tại', () => {
    const r = computePlanGrant('pro', daysFromNow(5), 'pro', Number.NaN, NOW)
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(5).getTime())
  })
})

describe('computePlanGrant — cấp gói TRONG lúc khuyến mãi (2026-07-26): hạn không đếm lùi tới khi hết khuyến mãi', () => {
  const PROMO_UNTIL = daysFromNow(20) // khuyến mãi còn 20 ngày nữa mới hết

  it('cấp gói mới (chưa có gì) trong lúc khuyến mãi → hạn tính từ LÚC HẾT KHUYẾN MÃI, không phải từ bây giờ', () => {
    const r = computePlanGrant('free', null, 'pro', 7, NOW, PROMO_UNTIL)
    expect(r.plan).toBe('pro')
    expect(r.planExpiresAt?.getTime()).toBe(PROMO_UNTIL.getTime() + 7 * MS_DAY)
  })

  it('gia hạn gói ĐANG CÒN HẠN trong lúc khuyến mãi, hạn cũ RƠI TRƯỚC lúc hết khuyến mãi → vẫn neo theo khuyến mãi (không mất, không sớm hơn)', () => {
    const r = computePlanGrant('pro', daysFromNow(5), 'pro', 7, NOW, PROMO_UNTIL)
    expect(r.planExpiresAt?.getTime()).toBe(PROMO_UNTIL.getTime() + 7 * MS_DAY)
  })

  it('gia hạn gói ĐANG CÒN HẠN, hạn cũ RƠI SAU lúc hết khuyến mãi → nối tiếp từ hạn cũ như bình thường (không cần neo theo khuyến mãi)', () => {
    const r = computePlanGrant('pro', daysFromNow(30), 'pro', 7, NOW, PROMO_UNTIL)
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(37).getTime())
  })

  it('khuyến mãi ĐÃ HẾT HẠN (promoUntil ở quá khứ) → không ảnh hưởng gì, tính như bình thường', () => {
    const pastPromo = daysFromNow(-1)
    const r = computePlanGrant('free', null, 'pro', 7, NOW, pastPromo)
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(7).getTime())
  })

  it('không truyền promoUntil (mặc định null) → hành vi cũ, không bị ảnh hưởng', () => {
    const r = computePlanGrant('free', null, 'pro', 7, NOW)
    expect(r.planExpiresAt?.getTime()).toBe(daysFromNow(7).getTime())
  })
})

// grantPlanDays: đọc trạng thái hiện tại từ DB, tính bằng computePlanGrant rồi ghi lại.
describe('grantPlanDays', () => {
  const mockedGetPool = vi.mocked(getPgPool)
  const mockedGetSettings = vi.mocked(getAppSettings)
  const query = vi.fn()

  beforeEach(() => {
    query.mockReset()
    mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
    mockedGetSettings.mockResolvedValue({ promoUntil: null } as Awaited<
      ReturnType<typeof getAppSettings>
    >)
  })

  it('user chưa có hồ sơ (không có dòng) → cấp mới từ free, ghi upsert xuống DB', async () => {
    query
      .mockResolvedValueOnce({ rows: [] }) // select profiles
      .mockResolvedValueOnce({ rows: [] }) // insert/upsert
    const result = await grantPlanDays('u1', 'pro', 7, NOW)
    expect(result.plan).toBe('pro')
    expect(result.planExpiresAt?.getTime()).toBe(daysFromNow(7).getTime())
    // Câu upsert thứ 2 phải nhận đúng userId + gói + hạn vừa tính.
    const upsertArgs = query.mock.calls[1]?.[1] as unknown[]
    expect(upsertArgs).toEqual(['u1', 'pro', result.planExpiresAt])
  })

  it('có khuyến mãi đang chạy (từ getAppSettings) → neo hạn theo promoUntil', async () => {
    const promoUntil = daysFromNow(20)
    mockedGetSettings.mockResolvedValue({ promoUntil } as unknown as Awaited<
      ReturnType<typeof getAppSettings>
    >)
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })
    const result = await grantPlanDays('u1', 'pro', 7, NOW)
    expect(result.planExpiresAt?.getTime()).toBe(promoUntil.getTime() + 7 * MS_DAY)
  })

  it('user đang có gói Pro còn hạn → cộng dồn đúng số ngày', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ plan: 'pro', plan_expires_at: daysFromNow(5) }] })
      .mockResolvedValueOnce({ rows: [] })
    const result = await grantPlanDays('u1', 'pro', 7, NOW)
    expect(result.planExpiresAt?.getTime()).toBe(daysFromNow(12).getTime())
  })
})

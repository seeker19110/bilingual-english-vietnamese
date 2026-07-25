import { describe, it, expect } from 'vitest'
import { computePlanGrant } from './planGrant'

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

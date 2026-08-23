import { describe, it, expect } from 'vitest'
import { normalizePlan, resolvePlan } from './plan.js'

describe('normalizePlan', () => {
  it('nhận đúng plus/pro/vip, mọi giá trị khác → free', () => {
    expect(normalizePlan('plus')).toBe('plus')
    expect(normalizePlan('pro')).toBe('pro')
    expect(normalizePlan('vip')).toBe('vip')
    expect(normalizePlan('free')).toBe('free')
    expect(normalizePlan(null)).toBe('free')
    expect(normalizePlan(undefined)).toBe('free')
    expect(normalizePlan('rac-gi-do')).toBe('free')
  })
})

describe('resolvePlan', () => {
  const now = new Date('2026-07-24T00:00:00Z')

  it('free luôn là free, bất kể planExpiresAt', () => {
    expect(resolvePlan('free', null, now)).toBe('free')
    expect(resolvePlan('free', new Date('2020-01-01'), now)).toBe('free')
  })

  it('pro/vip không có planExpiresAt (null) → vĩnh viễn, giữ nguyên gói', () => {
    expect(resolvePlan('pro', null, now)).toBe('pro')
    expect(resolvePlan('vip', null, now)).toBe('vip')
  })

  it('pro/vip còn hạn (planExpiresAt trong tương lai) → giữ nguyên gói', () => {
    const future = new Date('2026-08-01T00:00:00Z')
    expect(resolvePlan('pro', future, now)).toBe('pro')
    expect(resolvePlan('vip', future, now)).toBe('vip')
  })

  it('pro/vip đã hết hạn (planExpiresAt trong quá khứ) → coi như free', () => {
    const past = new Date('2026-07-01T00:00:00Z')
    expect(resolvePlan('pro', past, now)).toBe('free')
    expect(resolvePlan('vip', past, now)).toBe('free')
  })

  it('hết hạn ĐÚNG lúc now (ca biên, không lệch 1 mili-giây) → coi như free', () => {
    expect(resolvePlan('pro', now, now)).toBe('free')
  })

  it('chấp nhận planExpiresAt dạng chuỗi ISO (từ JSON) không chỉ Date', () => {
    expect(resolvePlan('pro', '2020-01-01T00:00:00Z', now)).toBe('free')
    expect(resolvePlan('pro', '2030-01-01T00:00:00Z', now)).toBe('pro')
  })
})

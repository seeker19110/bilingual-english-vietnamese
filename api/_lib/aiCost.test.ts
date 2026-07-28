// Test đơn giá chi phí AI — trọng tâm: biến môi trường rác KHÔNG được làm chi phí thành 0
// (số 0 trông như "miễn phí" và dẫn tới quyết định giá sai).
import { describe, it, expect, afterEach } from 'vitest'
import { getUnitCostsUsd, getUsdVndRate, estimateCostUsd } from './aiCost'

const KEYS = ['AI_COST_CHAT_USD', 'AI_COST_STT_USD', 'USD_VND_RATE'] as const

afterEach(() => {
  for (const key of KEYS) delete process.env[key]
})

describe('aiCost', () => {
  it('mặc định: mọi chế độ đều có đơn giá dương', () => {
    for (const value of Object.values(getUnitCostsUsd())) expect(value).toBeGreaterThan(0)
    expect(getUsdVndRate()).toBeGreaterThan(0)
  })

  it('biến môi trường hợp lệ ghi đè được đơn giá', () => {
    process.env.AI_COST_CHAT_USD = '0.01'
    process.env.USD_VND_RATE = '27000'
    expect(getUnitCostsUsd().chat).toBe(0.01)
    expect(getUsdVndRate()).toBe(27_000)
  })

  it.each(['0', '-1', 'abc', ''])('giá trị không hợp lệ (%s) → giữ mặc định', (raw) => {
    const fallback = getUnitCostsUsd().stt
    process.env.AI_COST_STT_USD = raw
    expect(getUnitCostsUsd().stt).toBe(fallback)
  })

  it('estimateCostUsd cộng đúng và bỏ qua chế độ không truyền', () => {
    const unit = getUnitCostsUsd()
    expect(estimateCostUsd({ chat: 2, writing: 3 })).toBeCloseTo(
      2 * unit.chat + 3 * unit.writing,
      10,
    )
    expect(estimateCostUsd({})).toBe(0)
  })
})

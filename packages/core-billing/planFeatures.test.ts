// Test api/_lib/planFeatures.ts — đọc ma trận tính năng theo gói, có cache TTL và fail-open.
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))

import {
  getPlanFeatureMatrix,
  invalidatePlanFeatureCache,
  isFeatureEnabledForPlan,
} from './planFeatures.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  invalidatePlanFeatureCache()
})

describe('getPlanFeatureMatrix', () => {
  it('không có dòng nào → trả về ma trận mặc định rỗng', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const matrix = await getPlanFeatureMatrix()
    expect(matrix.catalog).toEqual([])
    expect(matrix.flags).toEqual({})
    expect(matrix.updatedAt).toBe('1970-01-01T00:00:00.000Z')
  })

  it('gộp nhiều dòng cùng feature_key thành 1 mục catalog + flags theo từng gói', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          key: 'speaking',
          label: 'Luyện nói',
          description: 'mô tả',
          sort_order: 1,
          created_at: new Date('2026-01-01'),
          plan: 'free',
          enabled: false,
          flag_updated_at: new Date('2026-01-02'),
        },
        {
          key: 'speaking',
          label: 'Luyện nói',
          description: 'mô tả',
          sort_order: 1,
          created_at: new Date('2026-01-01'),
          plan: 'pro',
          enabled: true,
          flag_updated_at: new Date('2026-01-03'),
        },
      ],
    })
    const matrix = await getPlanFeatureMatrix()
    expect(matrix.catalog).toEqual([
      { key: 'speaking', label: 'Luyện nói', description: 'mô tả', sortOrder: 1 },
    ])
    expect(matrix.flags.speaking).toEqual({ free: false, plus: true, pro: true, vip: true })
    expect(matrix.updatedAt).toBe(new Date('2026-01-03').toISOString())
  })

  it('cache trong TTL → không gọi DB lần 2', async () => {
    query.mockResolvedValue({ rows: [] })
    await getPlanFeatureMatrix()
    await getPlanFeatureMatrix()
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('invalidatePlanFeatureCache → lần gọi sau đọc lại DB', async () => {
    query.mockResolvedValue({ rows: [] })
    await getPlanFeatureMatrix()
    invalidatePlanFeatureCache()
    await getPlanFeatureMatrix()
    expect(query).toHaveBeenCalledTimes(2)
  })

  it('DB lỗi → fail-open, trả về ma trận mặc định', async () => {
    query.mockRejectedValueOnce(new Error('db down'))
    const matrix = await getPlanFeatureMatrix()
    expect(matrix).toEqual({ catalog: [], flags: {}, updatedAt: '1970-01-01T00:00:00.000Z' })
  })
})

describe('isFeatureEnabledForPlan', () => {
  it('tính năng chưa có trong danh mục → fail-open, coi như bật', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    expect(await isFeatureEnabledForPlan('unknown_feature', 'free')).toBe(true)
  })

  it('tính năng admin đã tắt cho gói free → trả false', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          key: 'speaking',
          label: 'Luyện nói',
          description: null,
          sort_order: 1,
          created_at: new Date(),
          plan: 'free',
          enabled: false,
          flag_updated_at: new Date(),
        },
      ],
    })
    expect(await isFeatureEnabledForPlan('speaking', 'free')).toBe(false)
  })
})

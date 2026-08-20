import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { runNightlyConsolidation, getLatestSubconsciousThought } from './subconsciousService.js'

vi.mock('./crossDomainGraphService.js', () => ({
  syncCrossDomainLifeGraph: vi.fn().mockImplementation(async () => ({
    nodes: [
      { id: 'n1', type: 'Goal', label: 'Career: Principal AI' },
      { id: 'n2', type: 'Skill', label: 'English IELTS 8.0' },
    ],
    edges: [{ id: 'e1', source: 'n2', target: 'n1', relation: 'enables' }],
  })),
}))

vi.mock('./outcomeCalibrationService.js', () => ({
  calculateOutcomeCalibration: vi.fn().mockImplementation(async () => ({
    totalDecisions: 2,
    decidedCount: 2,
    reviewedCount: 1,
    pendingReviewCount: 1,
    overallSuccessRate: 1.0,
    calibrationScore: 90,
    domainStats: [],
    insights: [],
  })),
}))

describe('subconsciousService', () => {
  it('chạy thành công chu trình hợp nhất nhận thức ngầm ban đêm', async () => {
    const log = await runNightlyConsolidation(
      {} as unknown as Pool,
      '550e8400-e29b-41d4-a716-446655440000',
      'user-123',
    )

    expect(log.id).toBeDefined()
    expect(log.cycleType).toBe('rem_consolidation')
    expect(log.hypothesesEvaluated.length).toBeGreaterThan(0)
    expect(log.preComputedStrategy.vitalTasks.length).toBeGreaterThan(0)
    expect(log.schemaVersion).toBe('v3.0.0')
  })

  it('lấy bản ghi tư duy ngầm mới nhất từ bộ nhớ đệm', async () => {
    const latest = await getLatestSubconsciousThought(
      {} as unknown as Pool,
      '550e8400-e29b-41d4-a716-446655440000',
      'user-123',
    )

    expect(latest).toBeDefined()
    expect(latest.personId).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  // --- Nhánh: hypotheses.length === 0 → default hypothesis (lines 59-67) ---
  it('khi graph không có Skill và calibration không có pendingReview → thêm hypothesis mặc định', async () => {
    const { syncCrossDomainLifeGraph } = await import('./crossDomainGraphService.js')
    const { calculateOutcomeCalibration } = await import('./outcomeCalibrationService.js')
    vi.mocked(syncCrossDomainLifeGraph).mockResolvedValueOnce({
      nodes: [],
      edges: [],
    } as unknown as Awaited<ReturnType<typeof syncCrossDomainLifeGraph>>)
    vi.mocked(calculateOutcomeCalibration).mockResolvedValueOnce({
      totalDecisions: 0,
      decidedCount: 0,
      reviewedCount: 0,
      pendingReviewCount: 0,
      overallSuccessRate: 0.9,
      calibrationScore: 90,
      domainStats: [],
      insights: [],
    } as unknown as Awaited<ReturnType<typeof calculateOutcomeCalibration>>)

    const log = await runNightlyConsolidation(
      {} as unknown as Pool,
      '550e8400-e29b-41d4-a716-446655440001',
      'user-456',
    )
    expect(log.hypothesesEvaluated).toHaveLength(1)
    expect(log.hypothesesEvaluated[0]?.domain).toBe('general')
    expect(log.preComputedStrategy.targetDomainFocus).toBe('learning')
    expect(log.preComputedStrategy.potentialObstacles).toHaveLength(0)
  })

  it('khi successRate < 0.6 → potentialObstacles có cảnh báo thời gian', async () => {
    const { syncCrossDomainLifeGraph } = await import('./crossDomainGraphService.js')
    const { calculateOutcomeCalibration } = await import('./outcomeCalibrationService.js')
    vi.mocked(syncCrossDomainLifeGraph).mockResolvedValueOnce({
      nodes: [],
      edges: [],
    } as unknown as Awaited<ReturnType<typeof syncCrossDomainLifeGraph>>)
    vi.mocked(calculateOutcomeCalibration).mockResolvedValueOnce({
      totalDecisions: 3,
      decidedCount: 3,
      reviewedCount: 1,
      pendingReviewCount: 0,
      overallSuccessRate: 0.3,
      calibrationScore: 40,
      domainStats: [],
      insights: [],
    } as unknown as Awaited<ReturnType<typeof calculateOutcomeCalibration>>)

    const log = await runNightlyConsolidation(
      {} as unknown as Pool,
      '550e8400-e29b-41d4-a716-446655440002',
      'user-789',
    )
    expect(log.preComputedStrategy.potentialObstacles).toHaveLength(1)
    expect(log.preComputedStrategy.potentialObstacles[0]).toContain('kiểm soát thời gian')
  })

  // --- Nhánh: getLatestSubconsciousThought khi cache miss với personId mới (line 129) ---
  it('cache miss với personId mới → gọi runNightlyConsolidation tự động', async () => {
    const { syncCrossDomainLifeGraph } = await import('./crossDomainGraphService.js')
    const { calculateOutcomeCalibration } = await import('./outcomeCalibrationService.js')
    vi.mocked(syncCrossDomainLifeGraph).mockResolvedValueOnce({
      nodes: [],
      edges: [],
    } as unknown as Awaited<ReturnType<typeof syncCrossDomainLifeGraph>>)
    vi.mocked(calculateOutcomeCalibration).mockResolvedValueOnce({
      totalDecisions: 0,
      decidedCount: 0,
      reviewedCount: 0,
      pendingReviewCount: 0,
      overallSuccessRate: 1,
      calibrationScore: 100,
      domainStats: [],
      insights: [],
    } as unknown as Awaited<ReturnType<typeof calculateOutcomeCalibration>>)

    const freshPersonId = '660e8400-e29b-41d4-a716-446655440099'
    const result = await getLatestSubconsciousThought(
      {} as unknown as Pool,
      freshPersonId,
      'user-new',
    )
    expect(result.personId).toBe(freshPersonId)
    expect(result.triggerSource).toBe('spontaneous_initialization')
  })
})

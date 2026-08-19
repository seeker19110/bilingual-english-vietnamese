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
})

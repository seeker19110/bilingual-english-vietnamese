import { describe, it, expect, vi } from 'vitest'
import { calculateOutcomeCalibration } from './outcomeCalibrationService.js'

import type { Pool } from 'pg'
import type { DecisionRecord } from '../core-contracts/decisionRecord.js'

const mockDecisions: Partial<DecisionRecord>[] = []

vi.mock('./decisionLedgerService.js', () => ({
  listDecisions: vi.fn().mockImplementation(async () => mockDecisions),
}))

describe('outcomeCalibrationService', () => {
  it('tính toán chính xác chỉ số hiệu chuẩn khi chưa có quyết định', async () => {
    mockDecisions.length = 0
    const report = await calculateOutcomeCalibration({} as unknown as Pool, 'person-123')

    expect(report.totalDecisions).toBe(0)
    expect(report.calibrationScore).toBe(100)
    expect(report.insights.length).toBeGreaterThan(0)
  })

  it('phân tích chính xác success rate khi có kết quả thực tế', async () => {
    mockDecisions.length = 0
    const nowIso = new Date().toISOString()
    mockDecisions.push(
      {
        id: 'dec-1',
        domain: 'learning',
        status: 'reviewed',
        actualOutcomes: [
          { description: 'Đạt 7.0 IELTS', observedAt: nowIso, matchedExpectation: true },
        ],
      },
      {
        id: 'dec-2',
        domain: 'career',
        status: 'reviewed',
        actualOutcomes: [
          { description: 'Trúng tuyển công ty A', observedAt: nowIso, matchedExpectation: true },
        ],
      },
      {
        id: 'dec-3',
        domain: 'work',
        status: 'decided',
        reviewAt: new Date(Date.now() - 10000).toISOString(), // quá hạn
        actualOutcomes: [
          { description: 'Chậm deadline 1 ngày', observedAt: nowIso, matchedExpectation: false },
        ],
      },
    )

    const report = await calculateOutcomeCalibration({} as unknown as Pool, 'person-123')

    expect(report.totalDecisions).toBe(3)
    expect(report.decidedCount).toBe(3)
    expect(report.reviewedCount).toBe(2)
    expect(report.pendingReviewCount).toBe(1)
    expect(report.overallSuccessRate).toBeCloseTo(0.67, 1)
    expect(report.domainStats.length).toBe(3)

    const learningStat = report.domainStats.find((s) => s.domain === 'learning')
    expect(learningStat?.successRate).toBe(1.0)
  })
})

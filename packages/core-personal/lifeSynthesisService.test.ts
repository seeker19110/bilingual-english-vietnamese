import { describe, it, expect } from 'vitest'
import { generateLifeSynthesisReport } from './lifeSynthesisService.js'
import { LifeSynthesisReportSchema } from '@dhcb/core-contracts/lifeSynthesis'

describe('lifeSynthesisService', () => {
  it('generates a valid synthesis report matching schema v5.4.0', () => {
    const report = generateLifeSynthesisReport({
      personId: 'usr-test-1',
      timeframe: 'weekly',
      domainActivityCounts: {
        learning: 15,
        career: 8,
        work: 20,
        startup: 3,
        life: 10,
      },
      metacognitiveAwarenessIndex: 88,
      neuroEnergyScore: 84,
    })

    expect(report.schemaVersion).toBe('v5.4.0')
    expect(report.personId).toBe('usr-test-1')
    expect(report.holisticAlignmentScore).toBeGreaterThanOrEqual(0)
    expect(report.holisticAlignmentScore).toBeLessThanOrEqual(100)
    expect(report.domainBreakdown).toHaveLength(5)
    expect(report.predictiveGoals.length).toBeGreaterThan(0)
    expect(report.highLeverageRecommendations.length).toBeGreaterThan(0)

    const parsed = LifeSynthesisReportSchema.parse(report)
    expect(parsed.holisticAlignmentScore).toBe(report.holisticAlignmentScore)
  })

  it('handles empty activity gracefully with dormant momentum', () => {
    const report = generateLifeSynthesisReport({
      personId: 'usr-dormant',
      domainActivityCounts: {
        learning: 0,
        career: 0,
        work: 0,
        startup: 0,
        life: 0,
      },
    })

    expect(report.domainBreakdown.every((d) => d.momentum === 'dormant')).toBe(true)
    expect(report.holisticAlignmentScore).toBeLessThan(70)
  })
})

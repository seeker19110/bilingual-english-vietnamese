import { describe, it, expect } from 'vitest'
import {
  LifeSynthesisReportSchema,
  PredictiveGoalHorizonSchema,
  StrategicRecommendationSchema,
  type LifeSynthesisReport,
} from './lifeSynthesis'

describe('LifeSynthesis Schemas', () => {
  it('validates a valid LifeSynthesisReport', () => {
    const mockReport: LifeSynthesisReport = {
      schemaVersion: 'v5.4.0',
      timestamp: new Date().toISOString(),
      personId: 'user-123',
      timeframe: 'weekly',
      holisticAlignmentScore: 88,
      lifeSynergyIndex: 92,
      cognitiveResilienceScore: 85,
      domainBreakdown: [
        {
          domain: 'learning',
          score: 90,
          activityCount: 14,
          momentum: 'accelerating',
          keyHighlight: 'Mastered 30 C1 collocations',
          bottlenecks: [],
        },
        {
          domain: 'career',
          score: 80,
          activityCount: 5,
          momentum: 'stable',
          keyHighlight: 'Completed System Architecture doc',
          bottlenecks: ['Limited deep-work time'],
        },
      ],
      predictiveGoals: [
        {
          goalId: 'goal-1',
          title: 'IELTS Band 8.0',
          domain: 'learning',
          targetDate: '2026-12-31',
          estimatedCompletionDate: '2026-11-15',
          successProbabilityPercent: 87.5,
          confidenceInterval: {
            optimisticDate: '2026-10-30',
            pessimisticDate: '2026-12-15',
          },
          criticalPathSteps: ['C1 Vocabulary', 'Speaking Full-duplex drills'],
          riskFactors: ['Fatigue late evening'],
          energyAlignmentScore: 90,
        },
      ],
      highLeverageRecommendations: [
        {
          id: 'rec-1',
          priority: 'high',
          sourceDomain: 'learning',
          targetDomain: 'career',
          title: 'Translate Technical Architecture into English Case Study',
          actionPrompt: 'Write a 500-word engineering reflection in English',
          expectedSynergyImpact: 'Boosts both C1 Writing and Portfolio evidence',
          estimatedMinutes: 25,
        },
      ],
      synthesisSummaryMarkdown:
        '## Weekly Life Synthesis Summary\nAll 5 domains show strong positive momentum.',
    }

    const parsed = LifeSynthesisReportSchema.parse(mockReport)
    expect(parsed.schemaVersion).toBe('v5.4.0')
    expect(parsed.holisticAlignmentScore).toBe(88)
    expect(parsed.predictiveGoals).toHaveLength(1)
  })

  it('rejects invalid scores outside [0, 100]', () => {
    const invalidGoal = {
      goalId: 'g1',
      title: 'Goal',
      domain: 'career',
      targetDate: '2026-12-31',
      estimatedCompletionDate: '2026-12-31',
      successProbabilityPercent: 120, // Invalid > 100
      confidenceInterval: {
        optimisticDate: '2026-12-01',
        pessimisticDate: '2027-01-01',
      },
      criticalPathSteps: [],
      riskFactors: [],
      energyAlignmentScore: 80,
    }

    expect(() => PredictiveGoalHorizonSchema.parse(invalidGoal)).toThrow()
  })

  it('validates StrategicRecommendation', () => {
    const rec = {
      id: 'rec-1',
      priority: 'critical' as const,
      sourceDomain: 'startup' as const,
      targetDomain: 'work' as const,
      title: 'Automate weekly report generation',
      actionPrompt: 'Setup agent workflow',
      expectedSynergyImpact: 'Saves 3 hours/week',
      estimatedMinutes: 15,
    }

    const parsed = StrategicRecommendationSchema.parse(rec)
    expect(parsed.priority).toBe('critical')
    expect(parsed.estimatedMinutes).toBe(15)
  })
})

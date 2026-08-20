import { describe, it, expect } from 'vitest'
import {
  type CognitiveTelemetrySample,
  calculateCognitiveLoadIndex,
  assessCognitiveState,
} from './cognitiveLoadRegulator'

describe('cognitiveLoadRegulator (Flow State & Cognitive Load Auto-Regulator)', () => {
  it('calculates low cognitive load index for fast and fluent learners', () => {
    const fluentSample: CognitiveTelemetrySample = {
      responseLatencyMs: 1600,
      revisionCount: 0,
      hesitationPauses: 0,
      errorRateRecent: 0.0,
      targetDifficulty: 5,
    }

    const cli = calculateCognitiveLoadIndex(fluentSample)
    expect(cli).toBeLessThan(0.2)

    const assessment = assessCognitiveState(fluentSample)
    expect(assessment.state).toBe('boredom')
    expect(assessment.recommendedIntervention.action).toBe('increase_challenge')
    expect(assessment.recommendedIntervention.suggestedDifficultyDelta).toBe(1)
  })

  it('detects cognitive overload and triggers micro-break intervention', () => {
    const overloadedSample: CognitiveTelemetrySample = {
      responseLatencyMs: 9000,
      revisionCount: 5,
      hesitationPauses: 4,
      errorRateRecent: 0.8,
      targetDifficulty: 8,
    }

    const cli = calculateCognitiveLoadIndex(overloadedSample)
    expect(cli).toBeGreaterThan(0.75)

    const assessment = assessCognitiveState(overloadedSample)
    expect(assessment.state).toBe('overload')
    expect(assessment.recommendedIntervention.action).toBe('micro_break')
    expect(assessment.recommendedIntervention.suggestedDifficultyDelta).toBe(-2)
  })

  it('detects optimal flow state when challenge matches learner skill', () => {
    const flowSample: CognitiveTelemetrySample = {
      responseLatencyMs: 4500,
      revisionCount: 1,
      hesitationPauses: 1,
      errorRateRecent: 0.2,
      targetDifficulty: 6,
    }

    const assessment = assessCognitiveState(flowSample)
    expect(assessment.state).toBe('flow')
    expect(assessment.flowScore).toBeGreaterThan(0.7)
    expect(assessment.recommendedIntervention.action).toBe('maintain')
    expect(assessment.recommendedIntervention.suggestedDifficultyDelta).toBe(0)
  })
})

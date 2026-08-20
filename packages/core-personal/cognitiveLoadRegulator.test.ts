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

  it('triggers scaffold_hint when high cognitive load without extreme hesitation or error (lines 61-65)', () => {
    // cli >= 0.75, hesitationPauses < 3, errorRateRecent < 0.8  →  else branch → scaffold_hint
    const highLoadSample: CognitiveTelemetrySample = {
      responseLatencyMs: 9000, // normLatency = 1.0
      revisionCount: 4, // normRevisions = 1.0
      hesitationPauses: 2, // normPauses = 0.67, < 3  ← key
      errorRateRecent: 0.7, // normError = 0.7, < 0.8  ← key
      targetDifficulty: 9,
    }

    const cli = calculateCognitiveLoadIndex(highLoadSample)
    expect(cli).toBeGreaterThanOrEqual(0.75)

    const assessment = assessCognitiveState(highLoadSample)
    // errorRateRecent 0.7 > 0.6 → 'overload'; hesitationPauses 2 < 3 AND errorRate 0.7 < 0.8 → scaffold_hint
    expect(assessment.state).toBe('overload')
    expect(assessment.recommendedIntervention.action).toBe('scaffold_hint')
    expect(assessment.recommendedIntervention.suggestedDifficultyDelta).toBe(-1)
  })

  it('detects anxiety state when high load but error rate is not dominant (lines 53)', () => {
    // cli >= 0.75, errorRateRecent <= 0.6 → 'anxiety' state (not overload)
    // Tính: latency=1.0, revisions=1.0, pauses=2/3≈0.667, error=0.4
    // rawCli = 0.3 + 0.25 + 0.133 + 0.1 = 0.783 >= 0.75 ✓
    const anxietySample: CognitiveTelemetrySample = {
      responseLatencyMs: 9000, // normLatency = 1.0
      revisionCount: 4, // normRevisions = 1.0
      hesitationPauses: 2, // normPauses ≈ 0.667 — đủ để CLI >= 0.75, < 3 → scaffold_hint
      errorRateRecent: 0.4, // normError = 0.4, <= 0.6 → anxiety, < 0.8 → scaffold_hint
      targetDifficulty: 7,
    }

    const assessment = assessCognitiveState(anxietySample)
    expect(assessment.state).toBe('anxiety')
    expect(assessment.recommendedIntervention.action).toBe('scaffold_hint')
    expect(assessment.recommendedIntervention.suggestedDifficultyDelta).toBe(-1)
    expect(assessment.flowScore).toBe(0.25)
  })

  it('detects relaxed state when low load but error rate is non-negligible (line 67)', () => {
    // cli <= 0.25, errorRateRecent >= 0.1 → 'relaxed' (not boredom)
    const relaxedSample: CognitiveTelemetrySample = {
      responseLatencyMs: 1600, // normLatency ≈ 0.015
      revisionCount: 0, // normRevisions = 0
      hesitationPauses: 0, // normPauses = 0
      errorRateRecent: 0.15, // normError = 0.15, >= 0.1 → 'relaxed'
      targetDifficulty: 3,
    }

    const cli = calculateCognitiveLoadIndex(relaxedSample)
    expect(cli).toBeLessThanOrEqual(0.25)

    const assessment = assessCognitiveState(relaxedSample)
    expect(assessment.state).toBe('relaxed')
    expect(assessment.recommendedIntervention.action).toBe('increase_challenge')
    expect(assessment.recommendedIntervention.suggestedDifficultyDelta).toBe(1)
  })
})

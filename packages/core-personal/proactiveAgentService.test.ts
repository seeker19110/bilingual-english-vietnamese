// packages/core-personal/proactiveAgentService.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import {
  dismissNudge,
  evaluateProactiveState,
  executeQuickAction,
  generateGoalAutoPilotPlan,
  updateProactiveConfig,
} from './proactiveAgentService.js'

describe('proactiveAgentService Engine', () => {
  const dummyPersonId = '22222222-2222-4222-8222-222222222222'

  beforeEach(() => {
    // Fresh test context
  })

  it('evaluates proactive state and produces circadian peak nudge when energy is high', () => {
    const state = evaluateProactiveState(dummyPersonId, {
      circadianEnergy: 90,
      stressIndex: 30,
    })

    expect(state.nudges.length).toBeGreaterThan(0)
    const peakNudge = state.nudges.find((n) => n.nudgeType === 'circadian_peak')
    expect(peakNudge).toBeDefined()
    expect(peakNudge?.suggestedAction?.actionType).toBe('start_micro_drill')
  })

  it('triggers burnout prevention nudge when stress is dangerously high (>75)', () => {
    const testId = '33333333-3333-4333-8333-333333333333'
    const state = evaluateProactiveState(testId, {
      stressIndex: 85,
    })

    const burnoutNudge = state.nudges.find((n) => n.nudgeType === 'neuro_burnout_prevention')
    expect(burnoutNudge).toBeDefined()
    expect(burnoutNudge?.priority).toBe('urgent')
  })

  it('generates a goal auto-pilot plan with proper step structure', () => {
    const plan = generateGoalAutoPilotPlan(
      dummyPersonId,
      'ielts-speaking',
      'Luyện phản xạ IELTS 8.0',
      'learning',
    )

    expect(plan.goalId).toBe('ielts-speaking')
    expect(plan.steps.length).toBe(4)
    expect(plan.steps[0]?.status).toBe('completed')
    expect(plan.progressPercentage).toBe(25)
  })

  it('allows dismissing a nudge and executing quick actions', () => {
    const testId = '44444444-4444-4444-8444-444444444444'
    const state = evaluateProactiveState(testId, { circadianEnergy: 95 })
    const nudge = state.nudges[0]

    expect(nudge).toBeDefined()
    if (nudge && nudge.suggestedAction) {
      const dismissed = dismissNudge(testId, nudge.id)
      expect(dismissed).toBe(true)

      const result = executeQuickAction(testId, nudge.id, nudge.suggestedAction)
      expect(result.success).toBe(true)

      // Re-evaluate state, the dismissed nudge should no longer appear
      const nextState = evaluateProactiveState(testId, { circadianEnergy: 95 })
      const reFound = nextState.nudges.find((n) => n.id === nudge.id)
      expect(reFound).toBeUndefined()
    }
  })

  it('updates proactive configuration correctly', () => {
    const updated = updateProactiveConfig(dummyPersonId, {
      nudgeFrequency: 'high_focus',
      autoFlowShieldEnabled: false,
    })

    expect(updated.nudgeFrequency).toBe('high_focus')
    expect(updated.autoFlowShieldEnabled).toBe(false)
  })

  // --- Nhánh lines 115-137: canvas_blocker nudge khi hasUnfinishedCanvasTask = true ---
  it('triggers canvas_blocker nudge when hasUnfinishedCanvasTask is true', () => {
    const testId = '55555555-5555-4555-8555-555555555555'
    const state = evaluateProactiveState(testId, {
      circadianEnergy: 30, // low energy → không có circadian_peak
      stressIndex: 10, // low stress → không có burnout
      hasUnfinishedCanvasTask: true,
    })

    const canvasNudge = state.nudges.find((n) => n.nudgeType === 'canvas_blocker')
    expect(canvasNudge).toBeDefined()
    expect(canvasNudge?.priority).toBe('medium')
    expect(canvasNudge?.suggestedAction?.actionType).toBe('open_canvas_task')
  })

  // --- Nhánh lines 140-163: streak_at_risk nudge khi streakCount > 0 và nudges rỗng ---
  it('triggers streak_at_risk nudge when streakCount > 0 and no other nudges', () => {
    const testId = '66666666-6666-4666-8666-666666666666'
    const state = evaluateProactiveState(testId, {
      circadianEnergy: 30, // không đủ để circadian_peak
      stressIndex: 10, // không đủ để burnout
      hasUnfinishedCanvasTask: false,
      streakCount: 7, // có streak → kích hoạt khi nudges.length === 0
    })

    const streakNudge = state.nudges.find((n) => n.nudgeType === 'streak_at_risk')
    expect(streakNudge).toBeDefined()
    expect(streakNudge?.domain).toBe('learning')
    expect(streakNudge?.suggestedAction?.actionType).toBe('start_srs_review')
  })

  // --- Nhánh: evaluateProactiveState với context mặc định (không truyền gì) ---
  it('evaluateProactiveState với context rỗng → circadianEnergy mặc định 85 → circadian_peak', () => {
    const testId = '77777777-7777-4777-8777-777777777777'
    const state = evaluateProactiveState(testId) // không truyền context → default
    // energy = 85 (default) → circadian_peak nếu stressIndex không có hoặc <= 50
    const peakNudge = state.nudges.find((n) => n.nudgeType === 'circadian_peak')
    expect(peakNudge).toBeDefined()
  })
})

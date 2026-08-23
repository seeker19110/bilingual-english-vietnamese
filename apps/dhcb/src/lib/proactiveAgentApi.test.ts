// apps/dhcb/src/lib/proactiveAgentApi.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAutoPilotPlanApi,
  dismissProactiveNudge,
  executeProactiveAction,
  fetchProactiveAgentState,
  updateProactiveConfigApi,
} from './proactiveAgentApi.js'

describe('proactiveAgentApi Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.setItem('gsa_session_token_v1', 'fake-token-123')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('fetches proactive agent state', async () => {
    const mockState = {
      nudges: [],
      autoPilotPlans: [],
      config: { nudgeFrequency: 'balanced' },
      lastEvaluatedAt: new Date().toISOString(),
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, state: mockState }),
    } as unknown as Response)

    const state = await fetchProactiveAgentState({ circadianEnergy: 88 })
    expect(state.config.nudgeFrequency).toBe('balanced')
  })

  it('dismisses proactive nudge', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as unknown as Response)

    const result = await dismissProactiveNudge('nudge-123')
    expect(result).toBe(true)
  })

  it('executes proactive action', async () => {
    const mockResult = {
      success: true,
      message: 'Action done',
      targetUrl: '/dong-hanh',
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, result: mockResult }),
    } as unknown as Response)

    const res = await executeProactiveAction('nudge-123', {
      id: 'act-1',
      label: 'Luyện ngay',
      actionType: 'start_micro_drill',
      targetUrl: '/dong-hanh',
    })

    expect(res.success).toBe(true)
    expect(res.targetUrl).toBe('/dong-hanh')
  })

  it('updates proactive config and creates plan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, config: { nudgeFrequency: 'high_focus' } }),
    } as unknown as Response)

    const config = await updateProactiveConfigApi({ nudgeFrequency: 'high_focus' })
    expect(config.nudgeFrequency).toBe('high_focus')

    const mockPlan = {
      id: 'plan-1',
      goalId: 'g1',
      goalTitle: 'Title',
      steps: [],
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, plan: mockPlan }),
    } as unknown as Response)

    const plan = await createAutoPilotPlanApi({ goalId: 'g1', goalTitle: 'Title' })
    expect(plan.goalId).toBe('g1')
  })
})

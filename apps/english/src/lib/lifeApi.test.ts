// apps/english/src/lib/lifeApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listLifePlans,
  createLifePlan,
  updateLifePlanStatus,
  listHabits,
  createHabit,
  logHabit,
  listWellbeingChecks,
  recordWellbeingCheck,
  listGrowthMilestones,
  createGrowthMilestone,
} from './lifeApi'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn().mockResolvedValue({ Authorization: 'Bearer mock-token' }),
}))

describe('lifeApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('plan operations work', async () => {
    const mockPlans = [{ id: 'plan-1', title: 'Q3 Plan' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlans,
    } as unknown as Response)

    const list = await listLifePlans()
    expect(list).toEqual(mockPlans)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'plan-2', title: 'Q4 Plan' }),
    } as unknown as Response)

    const created = await createLifePlan({
      title: 'Q4 Plan',
      planType: 'quarterly',
      periodStart: '2026-10-01',
      periodEnd: '2026-12-31',
    })
    expect(created.title).toBe('Q4 Plan')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'plan-2', status: 'completed' }),
    } as unknown as Response)

    const updated = await updateLifePlanStatus('plan-2', 'completed')
    expect(updated.status).toBe('completed')
  })

  it('habit operations work', async () => {
    const mockHabits = [{ id: 'h-1', title: 'Read 30 mins', currentStreak: 5 }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockHabits,
    } as unknown as Response)

    const list = await listHabits()
    expect(list).toEqual(mockHabits)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'h-2', title: 'Run 5km' }),
    } as unknown as Response)

    const created = await createHabit({
      title: 'Run 5km',
      habitType: 'build',
      frequency: 'daily',
    })
    expect(created.title).toBe('Run 5km')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'log-1', habitId: 'h-2', count: 1 }),
    } as unknown as Response)

    const logged = await logHabit({ habitId: 'h-2' })
    expect(logged.count).toBe(1)
  })

  it('wellbeing and milestone operations work', async () => {
    const mockChecks = [{ id: 'wb-1', moodScore: 8, energyScore: 9, stressScore: 3 }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockChecks,
    } as unknown as Response)

    const checks = await listWellbeingChecks()
    expect(checks).toEqual(mockChecks)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'wb-2', moodScore: 9, energyScore: 9, stressScore: 2 }),
    } as unknown as Response)

    const check = await recordWellbeingCheck({
      moodScore: 9,
      energyScore: 9,
      stressScore: 2,
      notes: 'Feeling great!',
    })
    expect(check.moodScore).toBe(9)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'm-1', title: 'Run a marathon', area: 'health' }],
    } as unknown as Response)

    const milestones = await listGrowthMilestones()
    expect(milestones[0]?.title).toBe('Run a marathon')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'm-2', title: 'Publish book', area: 'creativity' }),
    } as unknown as Response)

    const createdMilestone = await createGrowthMilestone({
      title: 'Publish book',
      area: 'creativity',
    })
    expect(createdMilestone.title).toBe('Publish book')
  })
})

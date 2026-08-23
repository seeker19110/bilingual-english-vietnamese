import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  createLifePlan,
  listLifePlans,
  updateLifePlanStatus,
  createHabit,
  listHabits,
  logHabit,
  recordWellbeingCheck,
  listWellbeingChecks,
  createGrowthMilestone,
  listGrowthMilestones,
} from './lifeFoundationService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

const mockQuery = vi.fn()
const pool = { query: mockQuery } as unknown as Pool

vi.mock('@dhcb/core-db/transaction', () => ({
  withTransaction: async (_pool: unknown, cb: (client: { query: typeof mockQuery }) => unknown) =>
    cb({ query: mockQuery }),
}))

beforeEach(() => vi.clearAllMocks())

const now = new Date('2026-08-17T00:00:00Z')

describe('LifeFoundationService', () => {
  it('creates and lists plans', async () => {
    const planRow = {
      id: ID_1,
      person_id: PERSON_ID,
      title: 'Q3 Plan',
      plan_type: 'quarterly',
      period_start: new Date('2026-07-01'),
      period_end: new Date('2026-09-30'),
      status: 'draft',
      version: 1,
      created_at: now,
      updated_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [planRow] })
    const p = await createLifePlan(pool, PERSON_ID, {
      title: 'Q3 Plan',
      planType: 'quarterly',
      periodStart: '2026-07-01',
      periodEnd: '2026-09-30',
    })
    expect(p.status).toBe('draft')
    expect(p.planType).toBe('quarterly')

    mockQuery.mockResolvedValueOnce({ rows: [planRow] })
    const list = await listLifePlans(pool, PERSON_ID)
    expect(list.length).toBe(1)
  })

  it('updates plan status', async () => {
    const planRow = {
      id: ID_1,
      person_id: PERSON_ID,
      title: 'Q3 Plan',
      plan_type: 'quarterly',
      period_start: new Date('2026-07-01'),
      period_end: new Date('2026-09-30'),
      status: 'active',
      version: 2,
      created_at: now,
      updated_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [{ id: ID_1 }] })
    mockQuery.mockResolvedValueOnce({ rows: [planRow] })
    const p = await updateLifePlanStatus(pool, PERSON_ID, ID_1, 'active')
    expect(p.status).toBe('active')
  })

  it('creates habits and logs them with streak update', async () => {
    const habitRow = {
      id: ID_1,
      person_id: PERSON_ID,
      title: 'Morning Meditation',
      habit_type: 'build',
      frequency: 'daily',
      target_count: 1,
      current_streak: 0,
      best_streak: 0,
      is_active: true,
      version: 1,
      created_at: now,
      updated_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [habitRow] })
    const h = await createHabit(pool, PERSON_ID, {
      title: 'Morning Meditation',
      habitType: 'build',
      frequency: 'daily',
    })
    expect(h.currentStreak).toBe(0)

    const logRow = {
      id: ID_1,
      habit_id: ID_1,
      person_id: PERSON_ID,
      logged_at: now,
      count: 1,
      note: null,
      created_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [{ ...habitRow, current_streak: 0, best_streak: 0 }] })
    mockQuery.mockResolvedValueOnce({ rows: [logRow] })
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const log = await logHabit(pool, PERSON_ID, { habitId: ID_1 })
    expect(log.count).toBe(1)

    mockQuery.mockResolvedValueOnce({ rows: [habitRow] })
    const habits = await listHabits(pool, PERSON_ID)
    expect(habits.length).toBe(1)

    // filter by isActive
    mockQuery.mockResolvedValueOnce({ rows: [habitRow] })
    const activeHabits = await listHabits(pool, PERSON_ID, true)
    expect(activeHabits.length).toBe(1)
  })

  it('handles not found and optional values on plan and habit', async () => {
    // not found on updateLifePlanStatus
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateLifePlanStatus(pool, PERSON_ID, ID_1, 'completed')).rejects.toThrow(
      'Không tìm thấy LifePlan',
    )

    // filter listLifePlans by status
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const filteredPlans = await listLifePlans(pool, PERSON_ID, 'completed')
    expect(filteredPlans.length).toBe(0)

    // not found on logHabit
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(logHabit(pool, PERSON_ID, { habitId: ID_1 })).rejects.toThrow(
      'Không tìm thấy Habit',
    )

    // logHabit with custom loggedAt, count, and note
    const habitRow = {
      id: ID_1,
      person_id: PERSON_ID,
      title: 'Water',
      habit_type: 'build',
      frequency: 'daily',
      target_count: 8,
      current_streak: 5,
      best_streak: 5,
      is_active: true,
      version: 2,
      created_at: now,
      updated_at: now,
    }
    const logRow = {
      id: ID_1,
      habit_id: ID_1,
      person_id: PERSON_ID,
      logged_at: new Date('2026-08-16'),
      count: 2,
      note: '2 glasses in the morning',
      created_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [habitRow] })
    mockQuery.mockResolvedValueOnce({ rows: [logRow] })
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const customLog = await logHabit(pool, PERSON_ID, {
      habitId: ID_1,
      loggedAt: '2026-08-16',
      count: 2,
      note: '2 glasses in the morning',
    })
    expect(customLog.note).toBe('2 glasses in the morning')
    expect(customLog.count).toBe(2)
  })

  it('records wellbeing checks with notes and lists with custom limit', async () => {
    const wbRow = {
      id: ID_1,
      person_id: PERSON_ID,
      mood_score: 8,
      energy_score: 7,
      stress_score: 4,
      notes: 'Feeling productive',
      checked_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [wbRow] })
    const wb = await recordWellbeingCheck(pool, PERSON_ID, {
      moodScore: 8,
      energyScore: 7,
      stressScore: 4,
      notes: 'Feeling productive',
    })
    expect(wb.moodScore).toBe(8)
    expect(wb.notes).toBe('Feeling productive')

    mockQuery.mockResolvedValueOnce({ rows: [wbRow] })
    const list = await listWellbeingChecks(pool, PERSON_ID, 10)
    expect(list.length).toBe(1)

    // record wellbeing check without notes
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...wbRow, id: '33333333-3333-4333-8333-333333333333', notes: null }],
    })
    const wbNoNotes = await recordWellbeingCheck(pool, PERSON_ID, {
      moodScore: 5,
      energyScore: 5,
      stressScore: 5,
    })
    expect(wbNoNotes.notes).toBeUndefined()
  })

  it('creates growth milestones with description/achievedAt and filters by area', async () => {
    const gmRow = {
      id: ID_1,
      person_id: PERSON_ID,
      area: 'career',
      title: 'Senior Engineer Promotion',
      description: 'Promoted to Senior level',
      achieved_at: new Date('2026-08-01'),
      created_at: now,
    }
    mockQuery.mockResolvedValueOnce({ rows: [gmRow] })
    const gm = await createGrowthMilestone(pool, PERSON_ID, {
      area: 'career',
      title: 'Senior Engineer Promotion',
      description: 'Promoted to Senior level',
      achievedAt: '2026-08-01',
    })
    expect(gm.area).toBe('career')
    expect(gm.description).toBe('Promoted to Senior level')
    expect(gm.achievedAt).toBe('2026-08-01')

    // create growth milestone without description and achievedAt
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          ...gmRow,
          id: '44444444-4444-4444-8444-444444444444',
          description: null,
          achieved_at: null,
        },
      ],
    })
    const gmMinimal = await createGrowthMilestone(pool, PERSON_ID, {
      area: 'career',
      title: 'Goal achieved',
    })
    expect(gmMinimal.description).toBeUndefined()
    expect(gmMinimal.achievedAt).toBeUndefined()

    mockQuery.mockResolvedValueOnce({ rows: [gmRow] })
    const filteredList = await listGrowthMilestones(pool, PERSON_ID, 'career')
    expect(filteredList.length).toBe(1)

    // list without area filter
    mockQuery.mockResolvedValueOnce({ rows: [gmRow] })
    const allMilestones = await listGrowthMilestones(pool, PERSON_ID)
    expect(allMilestones.length).toBe(1)
  })
})

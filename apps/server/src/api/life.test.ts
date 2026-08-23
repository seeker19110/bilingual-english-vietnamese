import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true

vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('@dhcb/core-personal/personService', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const svc = vi.hoisted(() => ({
  createLifePlan: vi.fn(),
  listLifePlans: vi.fn(),
  updateLifePlanStatus: vi.fn(),
  createHabit: vi.fn(),
  listHabits: vi.fn(),
  logHabit: vi.fn(),
  recordWellbeingCheck: vi.fn(),
  listWellbeingChecks: vi.fn(),
  createGrowthMilestone: vi.fn(),
  listGrowthMilestones: vi.fn(),
}))
vi.mock('@dhcb/core-life/lifeFoundationService', () => ({ ...svc }))

import handler from './life.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/life${query}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePerson.mockResolvedValue({ id: PERSON_ID })
})

describe('api/life', () => {
  it('handles OPTIONS', async () => {
    const res = await handler(new Request('http://localhost/api/life', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('429 when rate limit exceeded', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('401 when unauthenticated', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
  })

  it('GET ?kind=plans with optional status filter', async () => {
    svc.listLifePlans.mockResolvedValueOnce([{ id: ID_1, title: 'Q3 Plan' }])
    const res = await handler(req('GET', '?kind=plans&status=draft'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.plans.length).toBe(1)
    expect(svc.listLifePlans).toHaveBeenCalledWith(expect.anything(), PERSON_ID, 'draft')
  })

  it('GET ?kind=habits with isActive filter', async () => {
    svc.listHabits.mockResolvedValueOnce([{ id: ID_1, title: 'Meditation', isActive: true }])
    const res = await handler(req('GET', '?kind=habits&isActive=true'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.habits.length).toBe(1)
    expect(svc.listHabits).toHaveBeenCalledWith(expect.anything(), PERSON_ID, true)

    // without isActive
    svc.listHabits.mockResolvedValueOnce([{ id: ID_1, title: 'Meditation' }])
    const res2 = await handler(req('GET', '?kind=habits'))
    expect(res2.status).toBe(200)
    expect(svc.listHabits).toHaveBeenCalledWith(expect.anything(), PERSON_ID, undefined)
  })

  it('GET ?kind=wellbeing with custom limit', async () => {
    svc.listWellbeingChecks.mockResolvedValueOnce([{ id: ID_1, moodScore: 8 }])
    const res = await handler(req('GET', '?kind=wellbeing&limit=15'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.checks.length).toBe(1)
    expect(svc.listWellbeingChecks).toHaveBeenCalledWith(expect.anything(), PERSON_ID, 15)
  })

  it('GET ?kind=milestones with area filter', async () => {
    svc.listGrowthMilestones.mockResolvedValueOnce([{ id: ID_1, area: 'career' }])
    const res = await handler(req('GET', '?kind=milestones&area=career'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.milestones.length).toBe(1)
    expect(svc.listGrowthMilestones).toHaveBeenCalledWith(expect.anything(), PERSON_ID, 'career')
  })

  it('GET with invalid kind returns 400', async () => {
    const res = await handler(req('GET', '?kind=unknown'))
    expect(res.status).toBe(400)
  })

  it('POST plan', async () => {
    svc.createLifePlan.mockResolvedValueOnce({ id: ID_1, status: 'draft' })
    const res = await handler(
      req('POST', '', {
        kind: 'plan',
        title: 'Q3 Plan',
        planType: 'quarterly',
        periodStart: '2026-07-01',
        periodEnd: '2026-09-30',
      }),
    )
    expect(res.status).toBe(201)
  })

  it('POST habit and habit_log', async () => {
    svc.createHabit.mockResolvedValueOnce({ id: ID_1, currentStreak: 0 })
    const res = await handler(
      req('POST', '', {
        kind: 'habit',
        title: 'Meditation',
        habitType: 'build',
        frequency: 'daily',
        targetCount: 1,
      }),
    )
    expect(res.status).toBe(201)

    svc.logHabit.mockResolvedValueOnce({ id: ID_1, count: 1 })
    const resLog = await handler(
      req('POST', '', {
        kind: 'habit_log',
        habitId: ID_1,
        loggedAt: '2026-08-17',
        count: 1,
        note: 'Completed early',
      }),
    )
    expect(resLog.status).toBe(201)
  })

  it('POST wellbeing check and milestone', async () => {
    svc.recordWellbeingCheck.mockResolvedValueOnce({ id: ID_1, moodScore: 8 })
    const res = await handler(
      req('POST', '', {
        kind: 'wellbeing',
        moodScore: 8,
        energyScore: 7,
        stressScore: 4,
        notes: 'Good day',
      }),
    )
    expect(res.status).toBe(201)

    svc.createGrowthMilestone.mockResolvedValueOnce({ id: ID_1, area: 'learning' })
    const resMilestone = await handler(
      req('POST', '', {
        kind: 'milestone',
        area: 'learning',
        title: 'B2 English',
        description: 'Passed test',
        achievedAt: '2026-08-17',
      }),
    )
    expect(resMilestone.status).toBe(201)
  })

  it('POST invalid payload returns 400', async () => {
    const res = await handler(req('POST', '', { kind: 'invalid' }))
    expect(res.status).toBe(400)
  })

  it('PATCH plan_status and invalid payload handling', async () => {
    svc.updateLifePlanStatus.mockResolvedValueOnce({ id: ID_1, status: 'active' })
    const res = await handler(req('PATCH', '', { kind: 'plan_status', id: ID_1, status: 'active' }))
    expect(res.status).toBe(200)

    const resInvalid = await handler(req('PATCH', '', { kind: 'unknown' }))
    expect(resInvalid.status).toBe(400)
  })

  it('405 for DELETE', async () => {
    expect((await handler(req('DELETE'))).status).toBe(405)
  })
})

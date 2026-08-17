import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = {
  user: { userId: 'user-1' },
}
let rateLimitOk = true
vi.mock('../packages/core-auth/security.js', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('../packages/core-db/pgPool.js', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('../packages/core-personal/personService.js', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const careerService = vi.hoisted(() => ({
  getOrCreateCareerProfile: vi.fn(),
  updateCareerProfile: vi.fn(),
  addCareerExperience: vi.fn(),
  listCareerExperiences: vi.fn(),
  createCareerGoal: vi.fn(),
  listCareerGoals: vi.fn(),
  analyzeCareerSkillGap: vi.fn(),
}))

vi.mock('../packages/core-career/careerService.js', () =>
  Object.fromEntries(
    Object.entries(careerService).map(([k, fn]) => [k, (...a: unknown[]) => fn(...a)]),
  ),
)

import handler from './career.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const GOAL_ID = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/career${query}`, {
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
  getOrCreatePerson.mockResolvedValue({ id: PERSON })
  careerService.getOrCreateCareerProfile.mockResolvedValue({ targetRole: 'DevOps' })
  careerService.updateCareerProfile.mockResolvedValue({ targetRole: 'Lead DevOps' })
  careerService.listCareerExperiences.mockResolvedValue([])
  careerService.addCareerExperience.mockResolvedValue({ company: 'Tech Inc' })
  careerService.listCareerGoals.mockResolvedValue([])
  careerService.createCareerGoal.mockResolvedValue({ targetTitle: 'CTO' })
  careerService.analyzeCareerSkillGap.mockResolvedValue({ targetTitle: 'CTO', gaps: [] })
})

describe('auth & rate limit on /api/career', () => {
  it('OPTIONS -> 204', async () => {
    const res = await handler(req('OPTIONS'))
    expect(res.status).toBe(204)
  })

  it('rate limit exceeded -> 429', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('unauthenticated -> 401', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/career', () => {
  it('gets career profile by default', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.profile.targetRole).toBe('DevOps')
  })

  it('gets career experiences', async () => {
    const res = await handler(req('GET', '?resource=experiences'))
    expect(res.status).toBe(200)
    expect(careerService.listCareerExperiences).toHaveBeenCalledWith(expect.anything(), PERSON)
  })

  it('gets skill gap analysis', async () => {
    const res = await handler(req('GET', `?resource=skill_gap&goalId=${GOAL_ID}`))
    expect(res.status).toBe(200)
    expect(careerService.analyzeCareerSkillGap).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      GOAL_ID,
      'user-1',
    )
  })
})

describe('POST /api/career', () => {
  it('updates profile on resource=profile', async () => {
    const res = await handler(
      req('POST', '', {
        resource: 'profile',
        targetRole: 'Lead DevOps',
        yearsOfExperience: 6,
      }),
    )
    expect(res.status).toBe(200)
    expect(careerService.updateCareerProfile).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      expect.objectContaining({ targetRole: 'Lead DevOps', yearsOfExperience: 6 }),
    )
  })

  it('creates goal on resource=goal', async () => {
    const res = await handler(
      req('POST', '', {
        resource: 'goal',
        targetTitle: 'CTO',
        skillsRequired: ['Leadership', 'English B2'],
      }),
    )
    expect(res.status).toBe(201)
    expect(careerService.createCareerGoal).toHaveBeenCalledWith(
      expect.anything(),
      PERSON,
      expect.objectContaining({ targetTitle: 'CTO' }),
    )
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = {
  user: { userId: 'user-1' },
}
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

const careerService = vi.hoisted(() => ({
  getOrCreateCareerProfile: vi.fn(),
  updateCareerProfile: vi.fn(),
  addCareerExperience: vi.fn(),
  listCareerExperiences: vi.fn(),
  createCareerGoal: vi.fn(),
  listCareerGoals: vi.fn(),
  analyzeCareerSkillGap: vi.fn(),
  getSkillSelfLevels: vi.fn(),
  setSkillSelfLevel: vi.fn(),
}))

vi.mock('@dhcb/core-domains/careerService', () =>
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

  it('gets career goals and handles missing goalId on skill_gap', async () => {
    const resGoals = await handler(req('GET', '?resource=goals&status=active'))
    expect(resGoals.status).toBe(200)
    expect(careerService.listCareerGoals).toHaveBeenCalledWith(expect.anything(), PERSON, 'active')

    const resMissingGoal = await handler(req('GET', '?resource=skill_gap'))
    expect(resMissingGoal.status).toBe(400)

    const resInvalid = await handler(req('GET', '?resource=unknown'))
    expect(resInvalid.status).toBe(400)
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

  it('creates experience on resource=experience', async () => {
    const res = await handler(
      req('POST', '', {
        resource: 'experience',
        company: 'Tech Corp',
        role: 'Tech Lead',
        startDate: '2024-01-01',
        isCurrent: true,
        achievements: ['Built system'],
      }),
    )
    expect(res.status).toBe(201)
    expect(careerService.addCareerExperience).toHaveBeenCalled()
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

  it('handles invalid POST body and unsupported methods', async () => {
    const resInvalid = await handler(req('POST', '', { resource: 'unknown' }))
    expect(resInvalid.status).toBe(400)

    const resDelete = await handler(req('DELETE'))
    expect(resDelete.status).toBe(405)
  })

  // [2026-08-24, Đợt 2] Tự đánh giá bậc thành thạo B1–B5 — thứ làm bảng phân tích khoảng cách
  // kỹ năng có nghĩa thay vì bịa cứng "In Progress".
  it('GET ?resource=skill_levels trả danh sách bậc đã tự đánh giá', async () => {
    careerService.getSkillSelfLevels.mockResolvedValueOnce({
      sql: {
        skill: 'SQL',
        selfBand: 'B3',
        targetBand: 'B3',
        updatedAt: '2026-08-24T00:00:00.000Z',
      },
    })
    const res = await handler(req('GET', '?resource=skill_levels'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.skillLevels).toHaveLength(1)
    expect(j.skillLevels[0].selfBand).toBe('B3')
    // Bậc gắn theo USER (token), không theo person id client gửi lên.
    expect(careerService.getSkillSelfLevels).toHaveBeenCalledWith('user-1')
  })

  it('POST skill_level lưu bậc tự đánh giá', async () => {
    careerService.setSkillSelfLevel.mockResolvedValueOnce({
      skill: 'SQL',
      selfBand: 'B4',
      targetBand: 'B3',
      updatedAt: '2026-08-24T00:00:00.000Z',
    })
    const res = await handler(
      req('POST', '', { resource: 'skill_level', skill: 'SQL', selfBand: 'B4' }),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).skillLevel.selfBand).toBe('B4')
    expect(careerService.setSkillSelfLevel).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ skill: 'SQL', selfBand: 'B4' }),
    )
  })

  it('POST skill_level từ chối bậc ngoài thang B1–B5', async () => {
    for (const selfBand of ['B0', 'B6', 'expert', 3]) {
      const res = await handler(
        req('POST', '', { resource: 'skill_level', skill: 'SQL', selfBand }),
      )
      expect(res.status).toBe(400)
    }
    expect(careerService.setSkillSelfLevel).not.toHaveBeenCalled()
  })
})

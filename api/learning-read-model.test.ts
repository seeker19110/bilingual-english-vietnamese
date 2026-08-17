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

const getLearningReadModel = vi.fn()
vi.mock('../packages/core-learner/learningReadModelService.js', () => ({
  getLearningReadModel: (...a: unknown[]) => getLearningReadModel(...a),
}))

import handler from './learning-read-model.js'

const PERSON = '11111111-1111-4111-8111-111111111111'

function req(method: string, query = '') {
  return new Request(`http://localhost/api/learning-read-model${query}`, { method })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePerson.mockResolvedValue({ id: PERSON })
  getLearningReadModel.mockResolvedValue({
    personId: PERSON,
    subject: 'english',
    direction: 'A',
    currentLevel: 'B1',
    dailySpeed: 10,
    dailyMinutes: 15,
    onboarded: true,
    activeGoal: 'Giao tiếp',
    masterySummary: { masteredCount: 50, inProgressCount: 10, dueForReviewCount: 2 },
    recentEvidenceCount: 60,
    srsDueCount: 2,
    updatedAt: '2026-08-17T00:00:00.000Z',
    schemaVersion: 1,
  })
})

describe('auth & rate limit on /api/learning-read-model', () => {
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

  it('rejects POST with 405 Method Not Allowed', async () => {
    const res = await handler(req('POST'))
    expect(res.status).toBe(405)
  })
})

describe('GET /api/learning-read-model', () => {
  it('returns LearningReadModel for authenticated user', async () => {
    const res = await handler(req('GET', '?subject=english'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.readModel.subject).toBe('english')
    expect(json.readModel.currentLevel).toBe('B1')
    expect(getLearningReadModel).toHaveBeenCalledWith(expect.anything(), {
      personId: PERSON,
      userId: 'user-1',
      subject: 'english',
    })
  })
})

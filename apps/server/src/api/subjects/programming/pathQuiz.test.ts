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

const query = vi.hoisted(() => vi.fn())
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({ query }) }))

import handler from './pathQuiz.js'
import { quizOfStage } from '@dhcb/subject-programming/learningPaths/stageQuizzes'

function req(method: string, body?: unknown) {
  return new Request('http://localhost/api/programming/path-quiz', {
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
  query.mockResolvedValue({ rows: [] })
})

describe('/api/programming/path-quiz', () => {
  it('chưa đăng nhập → 401; quá rate limit → 429', async () => {
    authState.user = null
    expect((await handler(req('POST', { pathId: 'x', stageId: 'y', answers: [] }))).status).toBe(
      401,
    )
    authState.user = { userId: 'user-1' }
    rateLimitOk = false
    expect((await handler(req('POST', { pathId: 'x', stageId: 'y', answers: [] }))).status).toBe(
      429,
    )
  })

  it('method lạ → 405', async () => {
    expect((await handler(req('GET'))).status).toBe(405)
  })

  it('body sai khuôn → 400, KHÔNG chạm DB', async () => {
    expect((await handler(req('POST', { pathId: 'x' }))).status).toBe(400)
    expect(
      (
        await handler(
          req('POST', {
            pathId: 'principal-ai',
            stageId: 'ai-s1',
            answers: [{ questionId: 'q1', choiceIndex: 9 }],
          }),
        )
      ).status,
    ).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('chặng chưa có quiz → 400', async () => {
    const res = await handler(
      req('POST', { pathId: 'principal-ai', stageId: 'ai-s2', answers: [] }),
    )
    expect(res.status).toBe(400)
  })

  it('trả lời đúng hết → 200, passed true, ghi completed theo user_id của TOKEN', async () => {
    authState.user = { userId: 'user-B' }
    const questions = quizOfStage('ai-s1')
    const answers = questions.map((q) => ({ questionId: q.id, choiceIndex: q.answerIndex }))
    const res = await handler(req('POST', { pathId: 'principal-ai', stageId: 'ai-s1', answers }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { correct: number; total: number; passed: boolean }
    expect(body).toEqual({ correct: questions.length, total: questions.length, passed: true })
    expect(query.mock.calls[0]?.[1]).toEqual(['user-B', 'principal-ai', 'ai-s1', 'completed'])
  })

  it('trả lời sai hết → 200, passed false, KHÔNG ghi DB', async () => {
    const questions = quizOfStage('ai-s1')
    const answers = questions.map((q) => ({
      questionId: q.id,
      choiceIndex: (q.answerIndex + 1) % 4,
    }))
    const res = await handler(req('POST', { pathId: 'principal-ai', stageId: 'ai-s1', answers }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ correct: 0, total: questions.length, passed: false })
    expect(query).not.toHaveBeenCalled()
  })
})

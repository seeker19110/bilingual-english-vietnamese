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

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
vi.mock('@dhcb/core-personal/personService', () => ({
  getOrCreatePerson: async () => ({ id: PERSON_ID }),
}))

const career = vi.hoisted(() => ({
  getOrCreateCareerProfile: vi.fn(),
  listCareerGoals: vi.fn(),
}))
vi.mock('@dhcb/core-domains/careerService', () => ({ ...career }))

const usage = vi.hoisted(() => ({
  checkAndConsumeUsage: vi.fn(),
  refundUsage: vi.fn(),
}))
vi.mock('@dhcb/core-billing/usage', () => ({ ...usage }))

const svc = vi.hoisted(() => ({
  generateQuestions: vi.fn(),
  evaluateAnswer: vi.fn(),
  fallbackQuestions: vi.fn(),
  fallbackFeedback: vi.fn(),
}))
vi.mock('@dhcb/core-ai/careerInterviewService', () => ({ CareerInterviewService: svc }))

const featureStore = new Map<string, unknown>()
vi.mock('@dhcb/core-db/featureState', () => ({
  getFeatureState: vi.fn(async (u: string, f: string) => featureStore.get(u + '|' + f) ?? null),
  setFeatureState: vi.fn(async (u: string, f: string, st: unknown) => {
    featureStore.set(u + '|' + f, st)
  }),
}))

import handler from './career-interview.js'

const QUESTIONS = [
  { id: 'q1', question: 'Câu 1?' },
  { id: 'q2', question: 'Câu 2?' },
]
const FEEDBACK = {
  score: 7,
  strengths: ['tốt'],
  improvements: ['cần rõ hơn'],
  sampleAnswer: 'mẫu',
  bandSignal: 'B3' as const,
  isFallback: false,
}

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/career-interview${query}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  featureStore.clear()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  career.getOrCreateCareerProfile.mockResolvedValue({
    targetRole: 'Kỹ sư dữ liệu',
    currentTitle: 'Backend',
    yearsOfExperience: 3,
    industry: 'TMĐT',
  })
  career.listCareerGoals.mockResolvedValue([{ skillsRequired: ['SQL'] }])
  usage.checkAndConsumeUsage.mockResolvedValue({ ok: true, day: '2026-08-24' })
  usage.refundUsage.mockResolvedValue(undefined)
  svc.generateQuestions.mockResolvedValue(QUESTIONS)
  svc.evaluateAnswer.mockResolvedValue(FEEDBACK)
  svc.fallbackQuestions.mockReturnValue([{ id: 'q1', question: 'Câu dự phòng?' }])
  svc.fallbackFeedback.mockReturnValue({
    score: 0,
    strengths: [],
    improvements: ['chưa chấm được'],
    sampleAnswer: '',
    bandSignal: null,
    isFallback: true,
  })
})

describe('api/career-interview', () => {
  it('handles OPTIONS', async () => {
    expect((await handler(req('OPTIONS'))).status).toBe(204)
  })

  it('429 khi vượt rate limit', async () => {
    rateLimitOk = false
    expect((await handler(req('GET'))).status).toBe(429)
  })

  it('401 khi chưa đăng nhập', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
  })

  it('GET trả null khi chưa từng luyện, trả phiên đã lưu khi có', async () => {
    expect((await (await handler(req('GET'))).json()).session).toBeNull()
    await handler(req('POST', '?action=start', { kind: 'behavioral' }))
    expect((await (await handler(req('GET'))).json()).session).not.toBeNull()
  })

  it('start: sinh câu hỏi theo hồ sơ THẬT và trừ đúng 1 lượt chat', async () => {
    const res = await handler(req('POST', '?action=start', { kind: 'technical' }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.session.turns).toHaveLength(2)
    expect(j.session.targetRole).toBe('Kỹ sư dữ liệu')
    expect(j.isFallback).toBe(false)
    // Hồ sơ thật được truyền xuống service, không phải giá trị mẫu.
    expect(svc.generateQuestions).toHaveBeenCalledWith(
      expect.objectContaining({ targetRole: 'Kỹ sư dữ liệu', skillsRequired: ['SQL'] }),
      'technical',
      3,
    )
    expect(usage.checkAndConsumeUsage).toHaveBeenCalledWith('user-1', 'chat')
    expect(usage.refundUsage).not.toHaveBeenCalled()
  })

  it('start: AI hỏng → dùng bộ dự phòng VÀ HOÀN lượt đã trừ', async () => {
    svc.generateQuestions.mockResolvedValueOnce(null)
    const j = await (await handler(req('POST', '?action=start', { kind: 'behavioral' }))).json()
    expect(j.isFallback).toBe(true)
    expect(usage.refundUsage).toHaveBeenCalledWith('user-1', 'chat', '2026-08-24')
  })

  it('start: hết lượt → 429 và KHÔNG gọi AI', async () => {
    usage.checkAndConsumeUsage.mockResolvedValueOnce({ ok: false, message: 'Hết lượt hôm nay' })
    const res = await handler(req('POST', '?action=start', { kind: 'behavioral' }))
    expect(res.status).toBe(429)
    expect(svc.generateQuestions).not.toHaveBeenCalled()
  })

  it('answer: chấm câu trả lời, lưu vào phiên, trừ 1 lượt', async () => {
    await handler(req('POST', '?action=start', { kind: 'behavioral' }))
    vi.clearAllMocks()
    usage.checkAndConsumeUsage.mockResolvedValue({ ok: true, day: '2026-08-24' })
    svc.evaluateAnswer.mockResolvedValue(FEEDBACK)

    const res = await handler(
      req('POST', '?action=answer', { questionId: 'q1', answer: 'Tôi đã xây pipeline…' }),
    )
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.feedback.score).toBe(7)
    expect(j.session.turns[0].answer).toBe('Tôi đã xây pipeline…')
    expect(j.session.turns[0].feedback.bandSignal).toBe('B3')
    // Câu chưa trả lời vẫn còn nguyên để trả lời tiếp.
    expect(j.session.turns[1].answer).toBeUndefined()
    expect(usage.checkAndConsumeUsage).toHaveBeenCalledWith('user-1', 'chat')
    expect(usage.refundUsage).not.toHaveBeenCalled()
  })

  it('answer: AI không chấm được → nhận xét dự phòng, HOÀN lượt, giữ nguyên câu trả lời', async () => {
    await handler(req('POST', '?action=start', { kind: 'behavioral' }))
    svc.evaluateAnswer.mockResolvedValueOnce(null)

    const j = await (
      await handler(req('POST', '?action=answer', { questionId: 'q1', answer: 'câu trả lời' }))
    ).json()
    expect(j.isFallback).toBe(true)
    expect(j.feedback.score).toBe(0)
    expect(j.session.turns[0].answer).toBe('câu trả lời')
    expect(usage.refundUsage).toHaveBeenCalledWith('user-1', 'chat', '2026-08-24')
  })

  it('answer: chưa có phiên → 404 và KHÔNG trừ lượt', async () => {
    const res = await handler(req('POST', '?action=answer', { questionId: 'q1', answer: 'x' }))
    expect(res.status).toBe(404)
    expect(usage.checkAndConsumeUsage).not.toHaveBeenCalled()
  })

  it('answer: questionId không có trong phiên → 404 và KHÔNG trừ lượt', async () => {
    await handler(req('POST', '?action=start', { kind: 'behavioral' }))
    vi.clearAllMocks()
    const res = await handler(
      req('POST', '?action=answer', { questionId: 'khong-co', answer: 'x' }),
    )
    expect(res.status).toBe(404)
    expect(usage.checkAndConsumeUsage).not.toHaveBeenCalled()
  })

  it('từ chối payload sai và action lạ', async () => {
    expect((await handler(req('POST', '?action=start', { kind: 'phong-van-gi-do' }))).status).toBe(
      400,
    )
    expect((await handler(req('POST', '?action=answer', { questionId: 'q1' }))).status).toBe(400)
    expect(
      (await handler(req('POST', '?action=answer', { questionId: 'q1', answer: '' }))).status,
    ).toBe(400)
    expect((await handler(req('POST', '?action=khong-biet', {}))).status).toBe(400)
  })

  it('405 cho DELETE', async () => {
    expect((await handler(req('DELETE'))).status).toBe(405)
  })

  it('phiên của người này KHÔNG lộ sang người khác', async () => {
    await handler(req('POST', '?action=start', { kind: 'behavioral' }))
    authState.user = { userId: 'user-2' }
    expect((await (await handler(req('GET'))).json()).session).toBeNull()
  })
})

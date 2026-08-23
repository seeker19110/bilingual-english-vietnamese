import { beforeEach, expect, it, vi } from 'vitest'
const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateOk = true
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))
const backfill = vi.fn()
const read = vi.fn()
vi.mock('@dhcb/core-personal/learningGoalAdapter', () => ({
  backfillCurrentLearningGoal: (...a: unknown[]) => backfill(...a),
  readLearningGoalFromLifeGraph: (...a: unknown[]) => read(...a),
}))
import handler from './life-goals.js'
const NODE = '22222222-2222-4222-8222-222222222222'
beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateOk = true
  backfill.mockResolvedValue({ nodeId: NODE })
  read.mockResolvedValue({ id: NODE })
})
it('auth bắt buộc', async () => {
  authState.user = null
  expect((await handler(new Request('http://x/api/life-goals'))).status).toBe(401)
})
it('rate limit 429', async () => {
  rateOk = false
  expect((await handler(new Request('http://x/api/life-goals'))).status).toBe(429)
})
it('POST backfill chỉ user từ token', async () => {
  expect((await handler(new Request('http://x/api/life-goals', { method: 'POST' }))).status).toBe(
    200,
  )
  expect(backfill.mock.calls[0]?.[1]).toBe('user-1')
})
it('GET nodeId sai trả 400', async () => {
  expect((await handler(new Request('http://x/api/life-goals?nodeId=x'))).status).toBe(400)
})
it('GET round-trip node hợp lệ', async () => {
  expect((await handler(new Request(`http://x/api/life-goals?nodeId=${NODE}`))).status).toBe(200)
  expect(read.mock.calls[0]?.slice(1)).toEqual(['user-1', NODE])
})

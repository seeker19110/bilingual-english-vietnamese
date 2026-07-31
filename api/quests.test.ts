// Test /api/quests — chặn method/đăng nhập/input, gọi đúng hàm claim theo action, và GET
// trả trạng thái tổng hợp.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const claimShareMock = vi.fn()
const claimStreakMock = vi.fn()
const claimCefrMock = vi.fn()
const statusMock = vi.fn()
vi.mock('./_lib/quests', () => ({
  claimShareQuest: (userId: string) => claimShareMock(userId),
  claimStreakQuest: (userId: string) => claimStreakMock(userId),
  claimCefrExamQuest: (userId: string, level: string) => claimCefrMock(userId, level),
  getQuestsStatus: (userId: string) => statusMock(userId),
  CEFR_EXAM_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
}))

import handler from './quests'

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  claimShareMock.mockReset()
  claimStreakMock.mockReset()
  claimCefrMock.mockReset()
  statusMock.mockReset()
})

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/quests', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/quests', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(new Request('http://localhost/api/quests'))
    expect(res.status).toBe(401)
  })

  it('đã đăng nhập → 200, trả trạng thái tổng hợp', async () => {
    statusMock.mockResolvedValue({ share: {}, streak: {}, cefrExams: [], referral: {} })
    const res = await handler(new Request('http://localhost/api/quests'))
    expect(res.status).toBe(200)
    expect(statusMock).toHaveBeenCalledWith('user-1')
  })
})

describe('POST /api/quests', () => {
  it('method khác GET/POST → 405', async () => {
    const res = await handler(new Request('http://localhost/api/quests', { method: 'DELETE' }))
    expect(res.status).toBe(405)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeRequest({ action: 'claim-share' }))
    expect(res.status).toBe(401)
  })

  it('action không hợp lệ → 400, không gọi hàm claim nào', async () => {
    const res = await handler(makeRequest({ action: 'unknown' }))
    expect(res.status).toBe(400)
    expect(claimShareMock).not.toHaveBeenCalled()
    expect(claimStreakMock).not.toHaveBeenCalled()
    expect(claimCefrMock).not.toHaveBeenCalled()
  })

  it('claim-share → gọi claimShareQuest, trả rewardDays', async () => {
    claimShareMock.mockResolvedValue({ ok: true, rewardDays: 1 })
    const res = await handler(makeRequest({ action: 'claim-share' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, rewardDays: 1 })
    expect(claimShareMock).toHaveBeenCalledWith('user-1')
  })

  it('claim-streak → gọi claimStreakQuest', async () => {
    claimStreakMock.mockResolvedValue({ ok: true, rewardDays: 1 })
    const res = await handler(makeRequest({ action: 'claim-streak' }))
    expect(res.status).toBe(200)
    expect(claimStreakMock).toHaveBeenCalledWith('user-1')
  })

  it('claim-cefr-exam → gọi claimCefrExamQuest với đúng level', async () => {
    claimCefrMock.mockResolvedValue({ ok: true, rewardDays: 1 })
    const res = await handler(makeRequest({ action: 'claim-cefr-exam', level: 'B1' }))
    expect(res.status).toBe(200)
    expect(claimCefrMock).toHaveBeenCalledWith('user-1', 'B1')
  })

  it('claim-cefr-exam với level không hợp lệ → 400', async () => {
    const res = await handler(makeRequest({ action: 'claim-cefr-exam', level: 'Z9' }))
    expect(res.status).toBe(400)
    expect(claimCefrMock).not.toHaveBeenCalled()
  })

  it('chưa đủ điều kiện (đã nhận trong cửa sổ hồi) → 400 kèm thông điệp', async () => {
    claimShareMock.mockResolvedValue({ ok: false, message: 'Đã nhận rồi' })
    const res = await handler(makeRequest({ action: 'claim-share' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Đã nhận rồi' })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './admin-feedback.js'

vi.mock('../packages/core-db/pgPool.js', () => {
  const query = vi.fn()
  return { getPgPool: () => ({ query }) }
})

vi.mock('../packages/core-auth/security.js', () => ({
  validateAuth: vi.fn(),
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: () => Promise.resolve(true),
  logSecurityEvent: vi.fn(),
}))

vi.mock('../packages/core-auth/authService.js', () => ({
  getUserById: vi.fn(),
}))

vi.mock('../packages/core-auth/adminAuth.js', () => ({
  isAdminEmail: (e?: string) => e === 'admin@example.com',
}))

import { getPgPool } from '../packages/core-db/pgPool.js'
import { validateAuth } from '../packages/core-auth/security.js'
import { getUserById } from '../packages/core-auth/authService.js'

type UserInfo = Awaited<ReturnType<typeof getUserById>>

describe('/api/admin-feedback', () => {
  const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('từ chối người dùng chưa đăng nhập (401)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/admin-feedback')
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('lấy danh sách phản hồi 👎 (GET 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'f1', source: 'chat', userInput: 'Hi' }] })

    const req = new Request('http://localhost/api/admin-feedback')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.feedbackList).toHaveLength(1)
  })

  it('từ chối người dùng không phải admin (403)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'u1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'u1',
      email: 'user@example.com',
    } as UserInfo)

    const req = new Request('http://localhost/api/admin-feedback')
    const res = await handler(req)
    expect(res.status).toBe(403)
  })

  it('từ chối HTTP method không hỗ trợ (405)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)

    const req = new Request('http://localhost/api/admin-feedback', {
      method: 'POST',
    })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('lọc phản hồi theo source=chat (GET 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'f2', source: 'chat' }] })

    const req = new Request('http://localhost/api/admin-feedback?source=chat')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.feedbackList).toHaveLength(1)
    // Verify query was called with the source filter param
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('tf.source = $1'), ['chat'])
  })
})

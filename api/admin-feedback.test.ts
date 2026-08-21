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
  checkRateLimit: vi.fn(() => Promise.resolve(true)),
  logSecurityEvent: vi.fn(),
}))

vi.mock('../packages/core-auth/authService.js', () => ({
  getUserById: vi.fn(),
}))

vi.mock('../packages/core-auth/adminAuth.js', () => ({
  isAdminEmail: (e?: string) => e === 'admin@example.com',
}))

import { getPgPool } from '../packages/core-db/pgPool.js'
import { validateAuth, checkRateLimit } from '../packages/core-auth/security.js'
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

  it('lấy danh sách ý kiến đóng góp người dùng (GET 200 default type=user)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 'fb-1',
          category: 'feature',
          title: 'Đổi theme',
          message: 'Tuyệt vời',
          status: 'new',
        },
      ],
    })

    const req = new Request('http://localhost/api/admin-feedback')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.feedbackList).toHaveLength(1)
    expect(json.type).toBe('user')
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

  it('lấy danh sách phản hồi gia sư AI khi type=tutor (GET 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'f2', source: 'chat' }] })

    const req = new Request('http://localhost/api/admin-feedback?type=tutor&source=chat')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.feedbackList).toHaveLength(1)
    expect(json.type).toBe('tutor')
  })

  it('cập nhật trạng thái ý kiến đóng góp (PATCH 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }] })

    const req = new Request('http://localhost/api/admin-feedback', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        status: 'resolved',
        adminNotes: 'Đã fix ở v7.2',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('trả về 204 với OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/admin-feedback', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('chặn khi vượt rate limit (429)', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce(false)
    const req = new Request('http://localhost/api/admin-feedback')
    const res = await handler(req)
    expect(res.status).toBe(429)
  })

  it('từ chối method không hỗ trợ (405)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    const req = new Request('http://localhost/api/admin-feedback', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('PATCH báo 404 khi id không tồn tại', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/admin-feedback', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', status: 'resolved' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(404)
  })

  it('PATCH báo lỗi validate khi body sai định dạng', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)

    const req = new Request('http://localhost/api/admin-feedback', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'not-a-uuid' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('lấy phản hồi gia sư AI khi type=tutor không kèm source filter', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/admin-feedback?type=tutor')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.type).toBe('tutor')
  })

  it('lọc danh sách ý kiến người dùng theo category và status', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/admin-feedback?category=bug&status=new')
    const res = await handler(req)
    expect(res.status).toBe(200)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './admin-payments.js'

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

vi.mock('./_lib/planGrant.js', () => ({
  grantPlanDays: vi.fn(() => Promise.resolve()),
}))

import { getPgPool } from '../packages/core-db/pgPool.js'
import { validateAuth } from '../packages/core-auth/security.js'
import { getUserById } from '../packages/core-auth/authService.js'

type UserInfo = Awaited<ReturnType<typeof getUserById>>

describe('/api/admin-payments', () => {
  const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('từ chối người dùng chưa đăng nhập (401)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/admin-payments')
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('từ chối người dùng không phải admin (403)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'u1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'u1',
      email: 'user@example.com',
    } as UserInfo)
    const req = new Request('http://localhost/api/admin-payments')
    const res = await handler(req)
    expect(res.status).toBe(403)
  })

  it('trả danh sách đơn cho admin (GET 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 'p1', paymentCode: 'DHCB1234', status: 'pending' }],
    })

    const req = new Request('http://localhost/api/admin-payments')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.payments).toHaveLength(1)
  })

  it('GET với ?q=search_term → lọc đơn theo payment_code hoặc email', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 'p2', paymentCode: 'DHCB5678', status: 'pending' }],
    })

    const req = new Request('http://localhost/api/admin-payments?q=DHCB5678')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.payments).toHaveLength(1)
    // Xác nhận query SQL có chứa tham số lọc %search_term%
    const sqlCall = queryMock.mock.calls[0]
    expect(sqlCall?.[1]).toContain('%dhcb5678%')
  })

  it('POST manual-match: happy path → cấp gói thành công (200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    // 1) Tìm user bằng email
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'u99' }] })
    // 2) Đọc đơn thanh toán
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 'pay-1', status: 'pending', plan: 'pro', cycle: 'month' }],
    })
    // 3) Update trạng thái đơn
    queryMock.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/admin-payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'manual-match',
        paymentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'buyer@example.com',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.message).toContain('PRO')
  })

  it('POST manual-match: email không tồn tại → 404', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    // Tìm user bằng email → không có kết quả
    queryMock.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/admin-payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'manual-match',
        paymentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'notfound@example.com',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toContain('notfound@example.com')
  })

  it('POST manual-match: đơn đã paid → 400', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    // 1) Tìm user bằng email
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'u99' }] })
    // 2) Đọc đơn thanh toán → đã paid
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 'pay-1', status: 'paid', plan: 'pro', cycle: 'month' }],
    })

    const req = new Request('http://localhost/api/admin-payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'manual-match',
        paymentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'buyer@example.com',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('đã được ghi nhận')
  })
})

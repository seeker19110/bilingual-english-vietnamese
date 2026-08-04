import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './admin-system-control.js'

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

describe('/api/admin-system-control', () => {
  const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('từ chối người dùng chưa đăng nhập (401)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/admin-system-control')
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('đọc trạng thái circuit breaker (GET 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [{ ai_circuit_breaker: true }] })

    const req = new Request('http://localhost/api/admin-system-control')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.circuitBreakerEnabled).toBe(true)
  })

  it('bật/tắt circuit breaker (POST 200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/admin-system-control', {
      method: 'POST',
      body: JSON.stringify({ action: 'toggle-circuit-breaker', enabled: true }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.circuitBreakerEnabled).toBe(true)
  })
})

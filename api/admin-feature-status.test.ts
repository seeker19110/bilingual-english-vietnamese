import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './admin-feature-status.js'

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

vi.mock('./_lib/featureStatusChecks.js', () => ({
  runAllFeatureChecks: vi.fn(() =>
    Promise.resolve([
      { key: 'database', label: 'PostgreSQL', usesApi: false, status: 'up', latencyMs: 3 },
    ]),
  ),
  summarizeOverallStatus: vi.fn(() => 'up'),
}))

import { getPgPool } from '../packages/core-db/pgPool.js'
import { validateAuth } from '../packages/core-auth/security.js'
import { getUserById } from '../packages/core-auth/authService.js'
import { runAllFeatureChecks } from './_lib/featureStatusChecks.js'

type UserInfo = Awaited<ReturnType<typeof getUserById>>

describe('/api/admin-feature-status', () => {
  const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.FEATURE_STATUS_CRON_KEY
  })

  it('GET từ chối người dùng chưa đăng nhập (401)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/admin-feature-status')
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('GET từ chối người dùng không phải admin (403)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'user@example.com',
    } as UserInfo)
    const req = new Request('http://localhost/api/admin-feature-status')
    const res = await handler(req)
    expect(res.status).toBe(403)
  })

  it('GET trả về lượt gần nhất + lịch sử cho admin (200)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 1, overall_status: 'up', results: [] }],
    })
    const req = new Request('http://localhost/api/admin-feature-status')
    const res = await handler(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.latest.id).toBe(1)
    expect(json.history).toHaveLength(1)
  })

  it('POST từ chối khi không có cron key hợp lệ và chưa đăng nhập (401)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/admin-feature-status', { method: 'POST' })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('POST chạy kiểm tra khi admin bấm thủ công (200, triggered_by=manual)', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@example.com',
    } as UserInfo)
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 2, triggered_by: 'manual', overall_status: 'up', results: [] }],
    })
    const req = new Request('http://localhost/api/admin-feature-status', { method: 'POST' })
    const res = await handler(req)
    expect(res.status).toBe(200)
    expect(runAllFeatureChecks).toHaveBeenCalledOnce()
    const insertCall = queryMock.mock.calls[0]!
    expect(insertCall[1][0]).toBe('manual')
  })

  it('POST chạy kiểm tra khi cron VPS gọi bằng x-cron-key hợp lệ (200, không cần đăng nhập)', async () => {
    process.env.FEATURE_STATUS_CRON_KEY = 'secret-key'
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 3, triggered_by: 'cron', overall_status: 'up', results: [] }],
    })
    const req = new Request('http://localhost/api/admin-feature-status', {
      method: 'POST',
      headers: { 'x-cron-key': 'secret-key' },
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    expect(validateAuth).not.toHaveBeenCalled()
    const insertCall = queryMock.mock.calls[0]!
    expect(insertCall[1][0]).toBe('cron')
  })

  it('POST từ chối cron key sai (401, không lộ cho người chưa đăng nhập)', async () => {
    process.env.FEATURE_STATUS_CRON_KEY = 'secret-key'
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/admin-feature-status', {
      method: 'POST',
      headers: { 'x-cron-key': 'wrong-key' },
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })
})

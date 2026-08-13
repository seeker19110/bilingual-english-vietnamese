import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './admin-tts-cache.js'

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

vi.mock('../packages/core-auth/authService.js', () => ({ getUserById: vi.fn() }))
vi.mock('../packages/core-auth/adminAuth.js', () => ({
  isAdminEmail: (e?: string) => e === 'admin@example.com',
}))
vi.mock('../packages/core-ai/fileStorage.js', () => ({
  getR2PublicBaseUrl: vi.fn(() => 'https://pub-abc.r2.dev'),
}))
vi.mock('../packages/core-ai/ttsCacheAudit.js', () => ({ runTtsCacheAudit: vi.fn() }))

import { getPgPool } from '../packages/core-db/pgPool.js'
import { validateAuth } from '../packages/core-auth/security.js'
import { getUserById } from '../packages/core-auth/authService.js'

type UserInfo = Awaited<ReturnType<typeof getUserById>>
const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

function asAdmin() {
  vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'a1' })
  vi.mocked(getUserById).mockResolvedValueOnce({ id: 'a1', email: 'admin@example.com' } as UserInfo)
}

describe('/api/admin-tts-cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chưa đăng nhập → 401', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce(null)
    const res = await handler(new Request('http://localhost/api/admin-tts-cache'))
    expect(res.status).toBe(401)
  })

  it('đăng nhập nhưng KHÔNG phải admin → 403', async () => {
    vi.mocked(validateAuth).mockResolvedValueOnce({ userId: 'u9' })
    vi.mocked(getUserById).mockResolvedValueOnce({
      id: 'u9',
      email: 'ai-do@example.com',
    } as UserInfo)
    const res = await handler(new Request('http://localhost/api/admin-tts-cache'))
    expect(res.status).toBe(403)
  })

  it('GET trả tỉ lệ hit tính đúng', async () => {
    asAdmin()
    queryMock
      .mockResolvedValueOnce({
        rows: [
          { day: '2026-08-12', hits: 80, misses: 20 },
          { day: '2026-08-13', hits: 20, misses: 0 },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ lang: 'en-US', voice: 'Algieba', hits: 100, misses: 20 }] })
      .mockResolvedValueOnce({ rows: [{ total: 500, on_r2: 480 }] })
      .mockResolvedValueOnce({ rows: [{ total: 300, on_r2: 300 }] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await handler(new Request('http://localhost/api/admin-tts-cache?days=30'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.stats.totalHits).toBe(100)
    expect(body.stats.totalMisses).toBe(20)
    expect(body.stats.hitRate).toBeCloseTo(100 / 120)
    expect(body.quick.ttsCache).toEqual({ total: 500, on_r2: 480 })
  })

  it('chưa có lượt gọi nào → hitRate là null, KHÔNG phải 0', async () => {
    asAdmin()
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0, on_r2: 0 }] })
      .mockResolvedValueOnce({ rows: [{ total: 0, on_r2: 0 }] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await handler(new Request('http://localhost/api/admin-tts-cache'))
    const body = await res.json()
    // Phân biệt "chưa có dữ liệu" với "hit rate thật sự bằng 0" — UI hiển thị khác nhau.
    expect(body.stats.hitRate).toBeNull()
  })

  it('days vượt trần → kẹp về tối đa 180', async () => {
    asAdmin()
    queryMock.mockResolvedValue({ rows: [] })
    const res = await handler(new Request('http://localhost/api/admin-tts-cache?days=9999'))
    const body = await res.json()
    expect(body.days).toBe(180)
  })

  it('days rác (không phải số) → về mặc định 30', async () => {
    asAdmin()
    queryMock.mockResolvedValue({ rows: [] })
    const res = await handler(new Request('http://localhost/api/admin-tts-cache?days=abc'))
    expect((await res.json()).days).toBe(30)
  })

  it('POST scan → 202 và tạo bản ghi quét', async () => {
    asAdmin()
    queryMock
      .mockResolvedValueOnce({ rows: [] }) // không có lượt nào đang chạy
      .mockResolvedValueOnce({ rows: [{ id: 'audit-1' }] }) // insert
      .mockResolvedValue({ rows: [] }) // các update chạy nền

    const res = await handler(
      new Request('http://localhost/api/admin-tts-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' }),
      }),
    )
    expect(res.status).toBe(202)
    expect((await res.json()).auditId).toBe('audit-1')
  })

  it('POST scan khi ĐANG có lượt quét chạy dở → 409, không tạo thêm', async () => {
    asAdmin()
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'dang-chay' }] })

    const res = await handler(
      new Request('http://localhost/api/admin-tts-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' }),
      }),
    )
    expect(res.status).toBe(409)
    // Chỉ đúng 1 truy vấn (kiểm tra), KHÔNG có insert.
    expect(queryMock).toHaveBeenCalledTimes(1)
  })

  it('POST action lạ → từ chối (không chạy quét)', async () => {
    asAdmin()
    const res = await handler(
      new Request('http://localhost/api/admin-tts-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'xoa-het' }),
      }),
    )
    expect(res.status).toBe(400)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it('method lạ → 405', async () => {
    asAdmin()
    const res = await handler(
      new Request('http://localhost/api/admin-tts-cache', { method: 'DELETE' }),
    )
    expect(res.status).toBe(405)
  })
})

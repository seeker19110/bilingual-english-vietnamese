import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

vi.mock('../core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('../core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

import handler from './checkout'
import { getPgPool } from '../core-db/pgPool'
import { invalidatePricesCache } from '../../api/_lib/prices'
import { invalidatePricePromoCache } from '../../api/_lib/pricePromo'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

function makeRequest(body?: unknown): Request {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

beforeEach(() => {
  invalidatePricesCache() // module-level cache TTL 30s bám giữa các test — reset để test độc lập
  invalidatePricePromoCache()
  query.mockReset()
  query.mockResolvedValue({ rows: [], rowCount: 1 })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = { userId: 'user-1' }
  process.env.SEPAY_BANK_ACCOUNT = '0123456789'
  process.env.SEPAY_BANK_CODE = 'MBBank'
})

afterEach(() => {
  delete process.env.SEPAY_BANK_ACCOUNT
  delete process.env.SEPAY_BANK_CODE
})

describe('/api/checkout', () => {
  it('OPTIONS request → 204', async () => {
    const resp = await handler(new Request('http://localhost/api/checkout', { method: 'OPTIONS' }))
    expect(resp.status).toBe(204)
  })

  it('HTTP method khác POST → 405', async () => {
    const resp = await handler(new Request('http://localhost/api/checkout', { method: 'GET' }))
    expect(resp.status).toBe(405)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const resp = await handler(makeRequest({ plan: 'pro', cycle: 'month' }))
    expect(resp.status).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it('body không phải JSON → 400', async () => {
    const req = new Request('http://localhost/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
      body: 'invalid-json',
    })
    const resp = await handler(req)
    expect(resp.status).toBe(400)
  })

  it('plan/cycle ngoài enum → 400, không tạo đơn', async () => {
    const resp = await handler(makeRequest({ plan: 'ultra', cycle: 'month' }))
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('tạo đơn hợp lệ → trả đúng giá mặc định (Pro/tháng = 40.000đ)', async () => {
    const resp = await handler(makeRequest({ plan: 'pro', cycle: 'month' }))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as { amountVnd: number; paymentCode: string; qrUrl: string }
    expect(data.amountVnd).toBe(40_000)
    expect(data.paymentCode).toMatch(/^DHCB/)
    expect(data.qrUrl).toContain('qr.sepay.vn')
    expect(query).toHaveBeenCalledTimes(3) // đọc bảng giá + đọc khuyến mãi % + insert đơn
  })

  it('thiếu cấu hình ngân hàng trên VPS → 503, không tạo đơn', async () => {
    delete process.env.SEPAY_BANK_ACCOUNT
    const resp = await handler(makeRequest({ plan: 'pro', cycle: 'month' }))
    expect(resp.status).toBe(503)
    expect(query).not.toHaveBeenCalled()
  })

  it('mã trùng (23505) → tự thử lại mã khác thay vì lỗi ngay', async () => {
    query
      .mockResolvedValueOnce({ rows: [] }) // đọc bảng giá
      .mockResolvedValueOnce({ rows: [] }) // đọc khuyến mãi %
      .mockRejectedValueOnce({ code: '23505' }) // lần insert đầu va mã trùng
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // lần thử lại thành công
    const resp = await handler(makeRequest({ plan: 'vip', cycle: 'year' }))
    expect(resp.status).toBe(200)
    expect(query).toHaveBeenCalledTimes(4)
  })

  it('vượt quá số lần thử mã trùng → 500', async () => {
    query
      .mockResolvedValueOnce({ rows: [] }) // đọc bảng giá
      .mockResolvedValueOnce({ rows: [] }) // đọc khuyến mãi %
      .mockRejectedValue({ code: '23505' }) // luôn trùng mã
    const resp = await handler(makeRequest({ plan: 'vip', cycle: 'year' }))
    expect(resp.status).toBe(500)
  })
})

// Test webhook SePay — trọng tâm CHỐNG TRÙNG và KIỂM TRA SỐ TIỀN (đây là chỗ đụng tiền thật).

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

vi.mock('../core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('../core-auth/security', () => ({ logSecurityEvent: vi.fn() }))
const granted: { calls: { userId: string; plan: string; days: number }[] } = { calls: [] }
vi.mock('../../api/_lib/planGrant', () => ({
  grantPlanDays: async (userId: string, plan: string, days: number) => {
    granted.calls.push({ userId, plan, days })
    return { plan, planExpiresAt: new Date() }
  },
}))

import handler from './payment-webhook'
import { getPgPool } from '../core-db/pgPool'
import { logSecurityEvent } from '../core-auth/security'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()
const API_KEY = 'sepay-test-key'

function makeRequest(body: unknown, apiKey: string | null = API_KEY): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (apiKey) headers.authorization = `Apikey ${apiKey}`
  return new Request('http://localhost/api/payment-webhook', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

const PENDING_PAYMENT = {
  id: 'payment-1',
  user_id: 'user-1',
  plan: 'pro',
  cycle: 'month',
  amount_vnd: 40_000,
  status: 'pending',
  years: 1,
}

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  granted.calls = []
  vi.mocked(logSecurityEvent).mockClear()
  process.env.SEPAY_WEBHOOK_API_KEY = API_KEY
})

afterEach(() => {
  delete process.env.SEPAY_WEBHOOK_API_KEY
})

describe('/api/payment-webhook', () => {
  it('sai/thiếu API key → 401, không đụng DB', async () => {
    const resp = await handler(makeRequest({ id: 1, transferAmount: 40_000 }, 'sai-khoa'))
    expect(resp.status).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it('transferType=out (tiền ra) → success:true, bỏ qua, không đụng DB', async () => {
    const resp = await handler(
      makeRequest({ id: 1, transferType: 'out', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(await resp.json()).toEqual({ success: true })
    expect(query).not.toHaveBeenCalled()
  })

  it('nội dung không chứa mã nào → success:true, không cấp gói', async () => {
    const resp = await handler(
      makeRequest({ id: 1, transferType: 'in', transferAmount: 40_000, content: 'chuyen tien' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([])
  })

  it('mã không khớp đơn nào trong DB → success:true, không cấp gói', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const resp = await handler(
      makeRequest({ id: 1, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([])
  })

  it('chuyển THIẾU tiền → không cấp gói, giữ pending (không update)', async () => {
    query.mockResolvedValueOnce({ rows: [PENDING_PAYMENT] })
    const resp = await handler(
      makeRequest({ id: 1, transferType: 'in', transferAmount: 10_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([])
    expect(query).toHaveBeenCalledTimes(1) // chỉ SELECT, không UPDATE
  })

  it('đơn ĐÃ paid (webhook lặp) → success:true, không cấp gói lần 2', async () => {
    query.mockResolvedValueOnce({ rows: [{ ...PENDING_PAYMENT, status: 'paid' }] })
    const resp = await handler(
      makeRequest({ id: 1, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([])
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('đủ tiền, đơn pending → cấp đúng gói/số ngày, ghi provider_txn_id', async () => {
    query.mockResolvedValueOnce({ rows: [PENDING_PAYMENT] }).mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 'user-1', plan: 'pro', cycle: 'month' }],
    })
    const resp = await handler(
      makeRequest({ id: 999, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([{ userId: 'user-1', plan: 'pro', days: 30 }])
    const [sql, params] = query.mock.calls[1] as [string, unknown[]]
    expect(sql).toContain("status = 'pending'")
    expect(params).toEqual(['payment-1', '999'])
  })

  it('đủ tiền, đơn pending → coi như đã xác thực email (set email_verified nếu đang null)', async () => {
    query.mockResolvedValueOnce({ rows: [PENDING_PAYMENT] }).mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 'user-1', plan: 'pro', cycle: 'month' }],
    })
    const resp = await handler(
      makeRequest({ id: 999, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    const [sql, params] = query.mock.calls[2] as [string, unknown[]]
    expect(sql).toContain('email_verified = now()')
    expect(sql).toContain('email_verified is null')
    expect(params).toEqual(['user-1'])
  })

  it('2 webhook song song cho cùng đơn: cái thứ 2 thấy rowCount=0 → KHÔNG cấp lần 2', async () => {
    query
      .mockResolvedValueOnce({ rows: [PENDING_PAYMENT] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] }) // request khác đã thắng UPDATE trước
    const resp = await handler(
      makeRequest({ id: 999, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([])
  })

  it('UNIQUE violation provider_txn_id (23505) → coi như đã xử lý, success:true', async () => {
    query
      .mockResolvedValueOnce({ rows: [PENDING_PAYMENT] })
      .mockRejectedValueOnce({ code: '23505' })
    const resp = await handler(
      makeRequest({ id: 999, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(await resp.json()).toEqual({ success: true })
    expect(granted.calls).toEqual([])
  })

  it('cấp đúng số ngày theo cycle year (365)', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ ...PENDING_PAYMENT, plan: 'vip', cycle: 'year', amount_vnd: 500_000 }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ user_id: 'user-1', plan: 'vip', cycle: 'year', years: 1 }],
      })
    const resp = await handler(
      makeRequest({ id: 1, transferType: 'in', transferAmount: 500_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([{ userId: 'user-1', plan: 'vip', days: 365 }])
  })

  it('mua NHIỀU NĂM (years=3) → cấp đúng 3×365 ngày, không phải 365', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ ...PENDING_PAYMENT, plan: 'vip', cycle: 'year', amount_vnd: 1_050_000, years: 3 }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ user_id: 'user-1', plan: 'vip', cycle: 'year', years: 3 }],
      })
    const resp = await handler(
      makeRequest({
        id: 2,
        transferType: 'in',
        transferAmount: 1_050_000,
        content: 'ENVI7K2M9QRT',
      }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([{ userId: 'user-1', plan: 'vip', days: 1095 }])
  })

  it('years > 1 nhưng cycle KHÔNG phải year (dữ liệu lệch bất thường) → vẫn cấp đúng 1 chu kỳ, bỏ qua years', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ ...PENDING_PAYMENT, plan: 'pro', cycle: 'month', years: 3 }],
      })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ user_id: 'user-1', plan: 'pro', cycle: 'month', years: 3 }],
      })
    const resp = await handler(
      makeRequest({ id: 3, transferType: 'in', transferAmount: 40_000, content: 'ENVI7K2M9QRT' }),
    )
    expect(resp.status).toBe(200)
    expect(granted.calls).toEqual([{ userId: 'user-1', plan: 'pro', days: 30 }])
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPgPool } from './pgPool'
import { checkAndConsumeUsage, refundUsage, isUsageMode } from './usage'
import { invalidateSettingsCache } from './settings'

// Mock Pool Postgres để test logic đếm/hoàn lượt OFFLINE (không cần DB thật).
vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
const mockedGetPool = vi.mocked(getPgPool)

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  // getAppSettings() cache trong bộ nhớ tiến trình (TTL 30s) — reset giữa các test để mock
  // pool mới không bị "ăn" giá trị cache từ test trước.
  invalidateSettingsCache()
})
afterEach(() => {
  vi.restoreAllMocks()
})

// Dòng app_settings giả — promo_until: null (tắt khuyến mãi) trừ khi test cố tình bật, để
// không làm nhiễu các assertion về hạn mức riêng từng gói.
const FAKE_SETTINGS_ROW = {
  free_chat_limit: 5,
  free_writing_limit: 5,
  free_speaking_limit: 5,
  free_stt_limit: 5,
  free_pronounce_limit: 5,
  pro_chat_limit: 100,
  pro_writing_limit: 100,
  pro_speaking_limit: 100,
  pro_stt_limit: 100,
  pro_pronounce_limit: 100,
  vip_chat_limit: 1_000_000,
  vip_writing_limit: 1_000_000,
  vip_speaking_limit: 1_000_000,
  vip_stt_limit: 1_000_000,
  vip_pronounce_limit: 1_000_000,
  promo_until: null as string | null,
  updated_at: '2026-01-01T00:00:00.000Z',
}

// query giả: phân biệt câu lệnh theo chuỗi SQL (chứa 'profiles' / 'app_settings' /
// 'consume_usage' / 'refund_usage').
function mockPool(opts: {
  plan?: 'free' | 'pro'
  planExpiresAt?: string | null
  consumeResult?: boolean
  queryError?: Error
  promoUntil?: string | null
}) {
  const query = vi.fn(async (sql: string) => {
    if (opts.queryError) throw opts.queryError
    if (sql.includes('from public.profiles'))
      return {
        rows: [{ plan: opts.plan ?? 'free', plan_expires_at: opts.planExpiresAt ?? null }],
      }
    if (sql.includes('from public.app_settings'))
      return { rows: [{ ...FAKE_SETTINGS_ROW, promo_until: opts.promoUntil ?? null }] }
    if (sql.includes('consume_usage'))
      return { rows: [{ consume_usage: opts.consumeResult ?? true }] }
    if (sql.includes('refund_usage')) return { rows: [] }
    return { rows: [] }
  })
  return { query } as unknown as ReturnType<typeof getPgPool>
}

describe('checkAndConsumeUsage', () => {
  beforeEach(() => mockedGetPool.mockReset())

  it('hàm SQL còn lượt (true) → ok', async () => {
    mockedGetPool.mockReturnValue(mockPool({ consumeResult: true }))
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('hàm SQL hết lượt (false) → chặn kèm thông điệp', async () => {
    mockedGetPool.mockReturnValue(mockPool({ consumeResult: false }))
    const r = await checkAndConsumeUsage('u1', 'chat')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/Hết lượt|hết lượt/)
  })

  it('DB lỗi (query throw) → FAIL-OPEN (cho qua)', async () => {
    mockedGetPool.mockReturnValue(mockPool({ queryError: new Error('db down') }))
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('gói pro dùng giới hạn cao hơn (đọc đúng plan + truyền đúng limit)', async () => {
    const pool = mockPool({ plan: 'pro', consumeResult: true })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'speaking')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_usage'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'speaking_count', 100])
  })

  it('gói pro đã HẾT HẠN (plan_expires_at trong quá khứ) → áp hạn mức free ngay, không chờ job dọn dữ liệu', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString()
    const pool = mockPool({ plan: 'pro', planExpiresAt: past, consumeResult: true })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'speaking')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_usage'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'speaking_count', 5])
  })

  it('gói pro CÒN HẠN (plan_expires_at trong tương lai) → vẫn áp hạn mức pro', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const pool = mockPool({ plan: 'pro', planExpiresAt: future, consumeResult: true })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'speaking')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_usage'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'speaking_count', 100])
  })

  it('khuyến mãi đang bật → mọi gói (kể cả free) được nâng thành vip (không giới hạn)', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const pool = mockPool({ plan: 'free', consumeResult: true, promoUntil: future })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'chat')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_usage'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'chat_count', 1_000_000])
  })
})

describe('refundUsage', () => {
  beforeEach(() => mockedGetPool.mockReset())

  it('gọi đúng hàm refund_usage với đúng cột', async () => {
    const pool = mockPool({})
    mockedGetPool.mockReturnValue(pool)
    await refundUsage('u1', 'stt')
    const refundCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('refund_usage'))
    expect(refundCall?.[1]).toEqual(['u1', expect.any(String), 'stt_count'])
  })

  it('DB lỗi → nuốt êm (FAIL-OPEN), không ném', async () => {
    mockedGetPool.mockReturnValue(mockPool({ queryError: new Error('db down') }))
    await expect(refundUsage('u1', 'chat')).resolves.toBeUndefined()
  })
})

describe('isUsageMode', () => {
  it('chỉ chấp nhận 5 mode hợp lệ', () => {
    expect(isUsageMode('chat')).toBe(true)
    expect(isUsageMode('stt')).toBe(true)
    expect(isUsageMode('writing')).toBe(true)
    expect(isUsageMode('speaking')).toBe(true)
    expect(isUsageMode('pronounce')).toBe(true)
    expect(isUsageMode('hack')).toBe(false)
    expect(isUsageMode(null)).toBe(false)
  })
})

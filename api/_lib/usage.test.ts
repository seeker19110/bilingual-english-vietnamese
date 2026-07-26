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
  ai_circuit_breaker: false,
  updated_at: '2026-01-01T00:00:00.000Z',
}

// query giả: phân biệt câu lệnh theo chuỗi SQL (chứa 'profiles' / 'app_settings' /
// 'consume_usage' / 'refund_usage').
function mockPool(opts: {
  plan?: 'free' | 'pro'
  planExpiresAt?: string | null
  consumeResult?: boolean
  consumeWeeklyResult?: boolean
  queryError?: Error
  promoUntil?: string | null
  aiCircuitBreaker?: boolean
}) {
  const query = vi.fn(async (sql: string) => {
    if (opts.queryError) throw opts.queryError
    if (sql.includes('from public.profiles'))
      return {
        rows: [{ plan: opts.plan ?? 'free', plan_expires_at: opts.planExpiresAt ?? null }],
      }
    if (sql.includes('from public.app_settings'))
      return {
        rows: [
          {
            ...FAKE_SETTINGS_ROW,
            promo_until: opts.promoUntil ?? null,
            ai_circuit_breaker: opts.aiCircuitBreaker ?? false,
          },
        ],
      }
    // Gói Free: kho lượt tuần chung (xem 0012_free_weekly_ai_credit.sql)
    if (sql.includes('consume_weekly_ai_credit'))
      return { rows: [{ consume_weekly_ai_credit: opts.consumeWeeklyResult ?? true }] }
    if (sql.includes('refund_weekly_ai_credit')) return { rows: [] }
    // Gói Pro/VIP: cột riêng từng mode trong daily_usage (giữ nguyên như cũ)
    if (sql.includes('consume_usage'))
      return { rows: [{ consume_usage: opts.consumeResult ?? true }] }
    if (sql.includes('refund_usage')) return { rows: [] }
    return { rows: [] }
  })
  return { query } as unknown as ReturnType<typeof getPgPool>
}

describe('checkAndConsumeUsage — gói Free (kho lượt tuần chung)', () => {
  beforeEach(() => mockedGetPool.mockReset())

  it('còn lượt trong kho tuần (true) → ok', async () => {
    mockedGetPool.mockReturnValue(mockPool({ consumeWeeklyResult: true }))
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('hết lượt trong kho tuần (false) → chặn kèm thông điệp', async () => {
    mockedGetPool.mockReturnValue(mockPool({ consumeWeeklyResult: false }))
    const r = await checkAndConsumeUsage('u1', 'chat')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/lượt/i)
  })

  it('mode khác nhau (chat/writing/speaking/stt/pronounce) đều dùng CHUNG 1 kho tuần', async () => {
    const pool = mockPool({ consumeWeeklyResult: true })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'stt')
    const call = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_weekly_ai_credit'))
    // Không truyền cột riêng theo mode — chỉ userId + week_start, đúng ý "kho chung".
    expect(call?.[1]).toEqual(['u1', expect.any(String)])
  })

  it('DB lỗi (query throw) → FAIL-OPEN (cho qua)', async () => {
    mockedGetPool.mockReturnValue(mockPool({ queryError: new Error('db down') }))
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('cầu dao AI bật → chặn ngay, không cần biết còn lượt hay không', async () => {
    // consumeWeeklyResult: true (rõ ràng còn lượt) nhưng vẫn phải chặn vì breaker bật trước.
    mockedGetPool.mockReturnValue(mockPool({ aiCircuitBreaker: true, consumeWeeklyResult: true }))
    const r = await checkAndConsumeUsage('u1', 'chat')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/bảo trì/i)
  })
})

describe('checkAndConsumeUsage — gói Pro/VIP (giữ nguyên cột riêng từng mode)', () => {
  beforeEach(() => mockedGetPool.mockReset())

  it('gói pro dùng giới hạn cao hơn (đọc đúng plan + truyền đúng limit)', async () => {
    const pool = mockPool({ plan: 'pro', consumeResult: true })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'speaking')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_usage'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'speaking_count', 100])
  })

  it('gói pro đã HẾT HẠN (plan_expires_at trong quá khứ) → rơi về Free ngay (kho lượt tuần), không chờ job dọn dữ liệu', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString()
    const pool = mockPool({ plan: 'pro', planExpiresAt: past, consumeWeeklyResult: true })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'speaking')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_weekly_ai_credit'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String)])
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

  it('khuyến mãi đang bật → free được nâng lên hạn mức pro (không phải kho tuần, không phải không giới hạn)', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const pool = mockPool({ plan: 'free', consumeResult: true, promoUntil: future })
    mockedGetPool.mockReturnValue(pool)
    await checkAndConsumeUsage('u1', 'chat')
    const consumeCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('consume_usage'))
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'chat_count', 100])
  })

  it('khuyến mãi đang bật → pro được nâng lên vip (không giới hạn)', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const pool = mockPool({ plan: 'pro', consumeResult: true, promoUntil: future })
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

  it('gói Free → hoàn vào kho lượt tuần chung (không phân biệt cột)', async () => {
    const pool = mockPool({ plan: 'free' })
    mockedGetPool.mockReturnValue(pool)
    await refundUsage('u1', 'stt')
    const refundCall = vi
      .mocked(pool.query)
      .mock.calls.find(([sql]) => (sql as string).includes('refund_weekly_ai_credit'))
    expect(refundCall?.[1]).toEqual(['u1', expect.any(String), 35])
  })

  it('gói Pro/VIP → gọi đúng hàm refund_usage với đúng cột như cũ', async () => {
    const pool = mockPool({ plan: 'pro' })
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

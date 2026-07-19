import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPgPool } from './pgPool'
import { checkAndConsumeUsage, refundUsage, isUsageMode } from './usage'

// Mock Pool Postgres để test logic đếm/hoàn lượt OFFLINE (không cần DB thật).
vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
const mockedGetPool = vi.mocked(getPgPool)

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

// query giả: phân biệt câu lệnh theo chuỗi SQL (chứa 'profiles' / 'consume_usage' / 'refund_usage').
function mockPool(opts: { plan?: 'free' | 'pro'; consumeResult?: boolean; queryError?: Error }) {
  const query = vi.fn(async (sql: string) => {
    if (opts.queryError) throw opts.queryError
    if (sql.includes('from public.profiles')) return { rows: [{ plan: opts.plan ?? 'free' }] }
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
    expect(consumeCall?.[1]).toEqual(['u1', expect.any(String), 'speaking_count', 60])
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

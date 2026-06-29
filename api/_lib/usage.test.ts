import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getSupabaseAdmin } from './supabaseAdmin'
import { checkAndConsumeUsage, refundUsage, isUsageMode } from './usage'

// Mock client Supabase admin để test logic đếm/hoàn lượt OFFLINE (không cần DB thật).
vi.mock('./supabaseAdmin', () => ({ getSupabaseAdmin: vi.fn() }))
const mockedGet = vi.mocked(getSupabaseAdmin)

// Im lặng console.warn: các test fallback/FAIL-OPEN cố tình kích hoạt nhánh log lỗi
// (đúng hành vi mong đợi) — không cần in stack trace ra log CI.
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

// Chain giả: mọi .select()/.eq() trả lại chính nó; .maybeSingle()/.upsert() trả kết quả định sẵn.
function chain(result: unknown) {
  const obj: Record<string, unknown> = {}
  obj.select = () => obj
  obj.eq = () => obj
  obj.maybeSingle = async () => result
  obj.upsert = async () => ({ error: null })
  return obj
}

function makeSupabase(opts: {
  plan?: 'free' | 'pro'
  consume?: { data: unknown; error: unknown }
  dailyRow?: Record<string, unknown> | null
  refundError?: unknown
}) {
  const rpc = vi.fn(async (name: string) => {
    if (name === 'consume_usage') return opts.consume ?? { data: true, error: null }
    if (name === 'refund_usage') return { error: opts.refundError ?? null }
    return { data: null, error: null }
  })
  return {
    rpc,
    from: (table: string) =>
      table === 'profiles'
        ? chain({ data: { plan: opts.plan ?? 'free' } })
        : chain({ data: opts.dailyRow ?? null }),
  }
}

describe('checkAndConsumeUsage', () => {
  beforeEach(() => mockedGet.mockReset())

  it('RPC còn lượt (true) → ok', async () => {
    mockedGet.mockReturnValue(makeSupabase({ consume: { data: true, error: null } }) as never)
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('RPC hết lượt (false) → chặn kèm thông điệp', async () => {
    mockedGet.mockReturnValue(makeSupabase({ consume: { data: false, error: null } }) as never)
    const r = await checkAndConsumeUsage('u1', 'chat')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/Hết lượt|hết lượt/)
  })

  it('RPC lỗi (schema cũ) → fallback non-atomic, còn lượt thì ok', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        consume: { data: null, error: { message: 'function not found' } },
        dailyRow: { chat_count: 0 },
      }) as never,
    )
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('fallback non-atomic chặn khi đã đạt giới hạn free (chat=15)', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        consume: { data: null, error: { message: 'function not found' } },
        dailyRow: { chat_count: 15 },
      }) as never,
    )
    const r = await checkAndConsumeUsage('u1', 'chat')
    expect(r.ok).toBe(false)
  })

  it('DB lỗi (query reject) → FAIL-OPEN (cho qua)', async () => {
    mockedGet.mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: () => Promise.reject(new Error('db down')) }) }),
      }),
      rpc: () => Promise.reject(new Error('db down')),
    } as never)
    expect(await checkAndConsumeUsage('u1', 'chat')).toEqual({ ok: true })
  })

  it('gói pro dùng giới hạn cao hơn (đọc đúng plan)', async () => {
    const sb = makeSupabase({ plan: 'pro', consume: { data: true, error: null } })
    mockedGet.mockReturnValue(sb as never)
    await checkAndConsumeUsage('u1', 'speaking')
    // RPC nhận đúng cột speaking_count với p_limit của pro (60)
    expect(sb.rpc).toHaveBeenCalledWith(
      'consume_usage',
      expect.objectContaining({
        p_col: 'speaking_count',
        p_limit: 60,
      }),
    )
  })
})

describe('refundUsage', () => {
  beforeEach(() => mockedGet.mockReset())

  it('gọi RPC refund_usage với đúng cột', async () => {
    const sb = makeSupabase({ refundError: null })
    mockedGet.mockReturnValue(sb as never)
    await refundUsage('u1', 'stt')
    expect(sb.rpc).toHaveBeenCalledWith(
      'refund_usage',
      expect.objectContaining({ p_col: 'stt_count' }),
    )
  })

  it('RPC lỗi → fallback đọc-rồi-trừ, không ném', async () => {
    mockedGet.mockReturnValue(
      makeSupabase({
        refundError: { message: 'no function' },
        dailyRow: { chat_count: 3 },
      }) as never,
    )
    await expect(refundUsage('u1', 'chat')).resolves.toBeUndefined()
  })

  it('DB lỗi (rpc reject) → nuốt êm (FAIL-OPEN), không ném', async () => {
    mockedGet.mockReturnValue({
      rpc: () => Promise.reject(new Error('db down')),
      from: () => ({
        select: () => ({
          eq: () => ({ eq: () => ({ maybeSingle: () => Promise.reject(new Error('db down')) }) }),
        }),
      }),
    } as never)
    await expect(refundUsage('u1', 'chat')).resolves.toBeUndefined()
  })
})

describe('isUsageMode', () => {
  it('chỉ chấp nhận 4 mode hợp lệ', () => {
    expect(isUsageMode('chat')).toBe(true)
    expect(isUsageMode('stt')).toBe(true)
    expect(isUsageMode('writing')).toBe(true)
    expect(isUsageMode('speaking')).toBe(true)
    expect(isUsageMode('hack')).toBe(false)
    expect(isUsageMode(null)).toBe(false)
  })
})

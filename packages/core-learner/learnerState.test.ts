import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPgPool } from '@dhcb/core-db/pgPool'
import { getLearnerState } from './learnerState.js'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const mockedGetPool = vi.mocked(getPgPool)

afterEach(() => {
  vi.restoreAllMocks()
})

function mockPool(opts: {
  profile?: { onboarded: boolean; goal: string | null; daily_minutes: number | null } | null
  progress?: { settings: unknown; placement: unknown } | null
}) {
  const query = vi.fn(async (sql: string, params: unknown[]) => {
    if (sql.includes('from public.profiles')) {
      // Xác nhận truy vấn LUÔN lọc theo userId truyền vào — chống cross-user leakage.
      expect(params).toEqual([expect.any(String)])
      return { rows: opts.profile === undefined ? [] : opts.profile ? [opts.profile] : [] }
    }
    if (sql.includes('from english.learning_progress')) {
      expect(params).toEqual([expect.any(String)])
      return { rows: opts.progress === undefined ? [] : opts.progress ? [opts.progress] : [] }
    }
    throw new Error(`Câu SQL không mong đợi trong test: ${sql}`)
  })
  return { query } as unknown as ReturnType<typeof getPgPool>
}

describe('getLearnerState', () => {
  beforeEach(() => mockedGetPool.mockReset())

  it('chưa có hồ sơ profiles → trả null (không giả định dữ liệu)', async () => {
    mockedGetPool.mockReturnValue(mockPool({ profile: undefined }))
    expect(await getLearnerState('user-1')).toBeNull()
  })

  it('có profile, CHƯA có learning_progress (user mới, chưa học lần nào) → vẫn trả state hợp lệ với giá trị mặc định', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: true, goal: 'daily', daily_minutes: 10 },
        progress: undefined,
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state).toEqual({
      userId: 'user-1',
      direction: 'A',
      currentLevel: null,
      onboarded: true,
      goal: { label: 'daily', dailyMinutes: 10 },
      skills: [],
      knowledge: [],
      errors: [],
      recentEvidence: [],
      risks: [],
    })
  })

  it('settings.direction = B (chiều học tiếng Việt) → đọc đúng, không mặc định về A', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: true, goal: 'daily', daily_minutes: 10 },
        progress: { settings: { direction: 'B' }, placement: {} },
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state?.direction).toBe('B')
  })

  it('settings.direction chứa giá trị KHÔNG hợp lệ (dữ liệu hỏng) → rơi về mặc định A, không throw', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: true, goal: 'daily', daily_minutes: 10 },
        progress: { settings: { direction: 'X' }, placement: {} },
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state?.direction).toBe('A')
  })

  it('placement.cefr có giá trị hợp lệ → currentLevel đọc đúng', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: true, goal: 'daily', daily_minutes: 10 },
        progress: { settings: {}, placement: { cefr: 'B1' } },
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state?.currentLevel).toBe('B1')
  })

  it('placement rỗng (chưa làm bài test xếp lớp) → currentLevel null, KHÔNG bịa cấp mặc định', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: true, goal: 'daily', daily_minutes: 10 },
        progress: { settings: {}, placement: {} },
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state?.currentLevel).toBeNull()
  })

  it('goal/daily_minutes null trong DB (chưa onboarding) → rơi về mặc định "daily"/10', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: false, goal: null, daily_minutes: null },
        progress: undefined,
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state?.goal).toEqual({ label: 'daily', dailyMinutes: 10 })
    expect(state?.onboarded).toBe(false)
  })

  it('skills/knowledge/errors/recentEvidence/risks LUÔN rỗng — Phase 04-09 chưa xây engine', async () => {
    mockedGetPool.mockReturnValue(
      mockPool({
        profile: { onboarded: true, goal: 'daily', daily_minutes: 10 },
        progress: { settings: {}, placement: {} },
      }),
    )
    const state = await getLearnerState('user-1')
    expect(state?.skills).toEqual([])
    expect(state?.knowledge).toEqual([])
    expect(state?.errors).toEqual([])
    expect(state?.recentEvidence).toEqual([])
    expect(state?.risks).toEqual([])
  })

  it('truy vấn cả 2 bảng đều lọc theo ĐÚNG userId truyền vào (chống cross-user leakage)', async () => {
    const query = vi.fn(async (sql: string, params: unknown[]) => {
      if (sql.includes('from public.profiles')) {
        expect(params).toEqual(['user-xyz'])
        return { rows: [{ onboarded: true, goal: 'daily', daily_minutes: 10 }] }
      }
      if (sql.includes('from english.learning_progress')) {
        expect(params).toEqual(['user-xyz'])
        return { rows: [] }
      }
      return { rows: [] }
    })
    mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
    await getLearnerState('user-xyz')
    expect(query).toHaveBeenCalledTimes(2)
  })
})

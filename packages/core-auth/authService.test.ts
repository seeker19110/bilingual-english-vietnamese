import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPgPool } from '../core-db/pgPool'
import {
  hashPassword,
  verifyPassword,
  validateSessionToken,
  createUserWithPassword,
  createSession,
  revokeSession,
  verifyUserPassword,
  getUserById,
  ensureProfileRow,
} from './authService'

vi.mock('../core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const mockedGetPool = vi.mocked(getPgPool)

function mockPool(queryImpl: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>) {
  return { query: vi.fn(queryImpl) } as unknown as ReturnType<typeof getPgPool>
}

describe('hashPassword / verifyPassword', () => {
  it('băm rồi so khớp đúng mật khẩu gốc', async () => {
    const hash = await hashPassword('MatKhau123')
    expect(hash).not.toBe('MatKhau123')
    expect(await verifyPassword('MatKhau123', hash)).toBe(true)
  })

  it('so khớp SAI mật khẩu → false (không throw)', async () => {
    const hash = await hashPassword('MatKhau123')
    expect(await verifyPassword('SaiRoi', hash)).toBe(false)
  })
})

describe('validateSessionToken', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('token hợp lệ, chưa hết hạn → trả userId', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async () => ({
        rows: [{ user_id: 'user-1', expires: new Date(Date.now() + 60_000) }],
      })),
    )
    const result = await validateSessionToken('token-hop-le')
    expect(result).toEqual({ userId: 'user-1' })
  })

  it('token KHÔNG tồn tại trong DB → null', async () => {
    mockedGetPool.mockReturnValue(mockPool(async () => ({ rows: [] })))
    const result = await validateSessionToken('token-la')
    expect(result).toBeNull()
  })

  it('token ĐÃ HẾT HẠN (ca biên: expires trong quá khứ) → null, không trả userId', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        if (sql.startsWith('select'))
          return { rows: [{ user_id: 'user-2', expires: new Date(Date.now() - 1000) }] }
        return { rows: [] } // câu delete dọn session hết hạn
      }),
    )
    const result = await validateSessionToken('token-het-han')
    expect(result).toBeNull()
  })
})

describe('createSession', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('tạo token ngẫu nhiên, KHÔNG lưu token trần vào DB (chỉ lưu bản hash)', async () => {
    let savedToken = ''
    mockedGetPool.mockReturnValue(
      mockPool(async (sql, params) => {
        expect(sql).toContain('insert into public.sessions')
        savedToken = String(params?.[0])
        return { rows: [] }
      }),
    )
    const rawToken = await createSession('user-1')
    expect(rawToken).toBeTruthy()
    // Token trả về cho client phải khác hẳn bản đã lưu (đã băm) trong DB.
    expect(savedToken).not.toBe(rawToken)
  })

  it('gọi 2 lần → 2 token ngẫu nhiên khác nhau', async () => {
    mockedGetPool.mockReturnValue(mockPool(async () => ({ rows: [] })))
    const [tokenA, tokenB] = await Promise.all([createSession('user-1'), createSession('user-1')])
    expect(tokenA).not.toBe(tokenB)
  })
})

describe('revokeSession', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('xoá đúng dòng session khớp với hash của token truyền vào', async () => {
    const deleteCalls: unknown[][] = []
    mockedGetPool.mockReturnValue(
      mockPool(async (sql, params) => {
        expect(sql).toContain('delete from public.sessions')
        deleteCalls.push(params ?? [])
        return { rows: [] }
      }),
    )
    await revokeSession('token-can-thu-hoi')
    expect(deleteCalls).toHaveLength(1)
    // Tham số xoá phải là bản hash, không phải token trần.
    expect(deleteCalls[0]?.[0]).not.toBe('token-can-thu-hoi')
  })
})

describe('createUserWithPassword', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('email TRÙNG (unique_violation code 23505) → trả null, không throw', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async () => {
        const err = new Error('duplicate key') as Error & { code: string }
        err.code = '23505'
        throw err
      }),
    )
    const result = await createUserWithPassword('trung@example.com', 'MatKhau123')
    expect(result).toBeNull()
  })

  it('lỗi DB khác (không phải trùng email) → ném lại lỗi, không nuốt im lặng', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async () => {
        throw new Error('connection refused')
      }),
    )
    await expect(createUserWithPassword('a@example.com', 'MatKhau123')).rejects.toThrow(
      'connection refused',
    )
  })
})

describe('verifyUserPassword', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('email KHÔNG tồn tại → null (không phân biệt với sai mật khẩu)', async () => {
    mockedGetPool.mockReturnValue(mockPool(async () => ({ rows: [] })))
    expect(await verifyUserPassword('khong-co@example.com', 'x')).toBeNull()
  })

  it('user chỉ đăng nhập OAuth, chưa từng đặt mật khẩu (password_hash null) → null', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async () => ({
        rows: [{ id: 'u1', email: 'a@b.com', password_hash: null }],
      })),
    )
    expect(await verifyUserPassword('a@b.com', 'batkyxi')).toBeNull()
  })

  it('đúng mật khẩu → trả user, KHÔNG kèm password_hash trong kết quả', async () => {
    const hash = await hashPassword('MatKhau123')
    mockedGetPool.mockReturnValue(
      mockPool(async () => ({ rows: [{ id: 'u1', email: 'a@b.com', password_hash: hash }] })),
    )
    const result = await verifyUserPassword('a@b.com', 'MatKhau123')
    expect(result).toEqual({ id: 'u1', email: 'a@b.com' })
  })

  it('sai mật khẩu → null', async () => {
    const hash = await hashPassword('MatKhau123')
    mockedGetPool.mockReturnValue(
      mockPool(async () => ({ rows: [{ id: 'u1', email: 'a@b.com', password_hash: hash }] })),
    )
    expect(await verifyUserPassword('a@b.com', 'SaiRoi')).toBeNull()
  })
})

describe('getUserById', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('user tồn tại → trả id/email', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async () => ({ rows: [{ id: 'u1', email: 'a@b.com' }] })),
    )
    expect(await getUserById('u1')).toEqual({ id: 'u1', email: 'a@b.com' })
  })

  it('user không tồn tại → null', async () => {
    mockedGetPool.mockReturnValue(mockPool(async () => ({ rows: [] })))
    expect(await getUserById('khong-co')).toBeNull()
  })
})

describe('ensureProfileRow', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('user CŨ (profile đã tồn tại, insert 0 dòng) → KHÔNG chạy nhánh cấp VIP whitelist', async () => {
    const calls: string[] = []
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        calls.push(sql)
        if (sql.startsWith('insert into public.profiles')) return { rows: [] } // 0 dòng = user cũ
        return { rows: [{ plan: 'free', plan_expires_at: null, onboarded: true, name: 'Cũ' }] }
      }),
    )
    const result = await ensureProfileRow('u1', 'Tên mới')
    expect(result.plan).toBe('free')
    expect(result.onboarded).toBe(true)
    // Không có câu update nào gán plan = 'vip' — nhánh VIP whitelist không chạy cho user cũ.
    expect(calls.some((sql) => sql.includes("plan = 'vip'"))).toBe(false)
  })

  it('user MỚI (profile vừa tạo lần đầu) → CÓ chạy nhánh kiểm VIP whitelist', async () => {
    const calls: string[] = []
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        calls.push(sql)
        if (sql.startsWith('insert into public.profiles'))
          return { rows: [{ id: 'u1' }], rowCount: 1 } // 1 dòng = mới tạo
        if (sql.includes("plan = 'vip'")) return { rows: [] }
        return { rows: [{ plan: 'free', plan_expires_at: null, onboarded: false, name: 'Mới' }] }
      }),
    )
    const result = await ensureProfileRow('u1', 'Tên mới')
    expect(result.onboarded).toBe(false)
    expect(calls.some((sql) => sql.includes("plan = 'vip'"))).toBe(true)
  })

  it('gói Free nhưng DB còn sót plan_expires_at cũ → planExpiresAt trả null (tránh hiểu nhầm sắp hết hạn)', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        if (sql.startsWith('insert into public.profiles')) return { rows: [] }
        return {
          rows: [
            { plan: 'free', plan_expires_at: new Date('2020-01-01'), onboarded: true, name: 'X' },
          ],
        }
      }),
    )
    const result = await ensureProfileRow('u1', 'X')
    expect(result.plan).toBe('free')
    expect(result.planExpiresAt).toBeNull()
  })

  it('gói Pro còn hạn → planExpiresAt trả đúng ISO string', async () => {
    const future = new Date(Date.now() + 86_400_000)
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        if (sql.startsWith('insert into public.profiles')) return { rows: [] }
        return { rows: [{ plan: 'pro', plan_expires_at: future, onboarded: true, name: 'X' }] }
      }),
    )
    const result = await ensureProfileRow('u1', 'X')
    expect(result.planExpiresAt).toBe(future.toISOString())
  })
})

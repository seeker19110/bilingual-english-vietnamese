import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPgPool } from './pgPool'
import {
  hashPassword,
  verifyPassword,
  validateSessionToken,
  createUserWithPassword,
  createSession,
  revokeSession,
} from './authService'

vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
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

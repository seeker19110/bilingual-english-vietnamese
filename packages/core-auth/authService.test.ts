import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPgPool } from '../core-db/pgPool'

// google-auth-library: mock verifyIdToken để test verifyGoogleIdToken không gọi mạng thật.
const googleAuth = vi.hoisted(() => ({ verifyIdToken: vi.fn() }))
vi.mock('google-auth-library', () => ({ OAuth2Client: vi.fn() }))

// jose: mock jwtVerify dùng chung cho verifyAppleIdToken/verifyMicrosoftIdToken.
const jose = vi.hoisted(() => ({ jwtVerify: vi.fn() }))
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => ({})),
  jwtVerify: jose.jwtVerify,
}))

import { OAuth2Client } from 'google-auth-library'
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
  verifyGoogleIdToken,
  verifyGoogleAccessToken,
  verifyFacebookAccessToken,
  verifyAppleIdToken,
  verifyMicrosoftIdToken,
  findOrCreateGoogleUser,
  findOrCreateFacebookUser,
  findOrCreateAppleUser,
  findOrCreateMicrosoftUser,
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

// ── OAuth: Google (ID token qua google-auth-library) ─────────────────────────────────
describe('verifyGoogleIdToken', () => {
  const OLD = process.env.GOOGLE_CLIENT_ID
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'gclient'
    googleAuth.verifyIdToken.mockReset()
    // Các describe trước gọi vi.restoreAllMocks() (dọn spy khác) — nó cũng xoá luôn
    // implementation đã gán cho OAuth2Client mock, nên phải gán lại ở đây mỗi lần.
    vi.mocked(OAuth2Client).mockImplementation(
      () => ({ verifyIdToken: googleAuth.verifyIdToken }) as unknown as OAuth2Client,
    )
  })
  afterEach(() => {
    if (OLD === undefined) delete process.env.GOOGLE_CLIENT_ID
    else process.env.GOOGLE_CLIENT_ID = OLD
  })

  // Chạy TRƯỚC các test đăng nhập thành công — getGoogleClient() cache client Google ở cấp
  // module SAU LẦN GỌI THÀNH CÔNG ĐẦU TIÊN, nếu chạy sau sẽ dùng lại cache thay vì thật sự
  // kiểm tra nhánh thiếu biến môi trường.
  it('thiếu GOOGLE_CLIENT_ID → ném lỗi cấu hình (bọc trong try nên trả null)', async () => {
    delete process.env.GOOGLE_CLIENT_ID
    expect(await verifyGoogleIdToken('tok')).toBeNull()
  })

  it('token hợp lệ, email đã xác thực → trả thông tin user', async () => {
    googleAuth.verifyIdToken.mockResolvedValue({
      getPayload: () => ({ sub: 'g1', email: 'a@b.com', email_verified: true, name: 'A' }),
    })
    const result = await verifyGoogleIdToken('tok')
    expect(result).toEqual({ googleId: 'g1', email: 'a@b.com', name: 'A' })
  })

  it('email CHƯA xác thực (email_verified=false) → null', async () => {
    googleAuth.verifyIdToken.mockResolvedValue({
      getPayload: () => ({ sub: 'g1', email: 'a@b.com', email_verified: false }),
    })
    expect(await verifyGoogleIdToken('tok')).toBeNull()
  })

  it('token giả mạo (verifyIdToken ném lỗi) → null, không crash', async () => {
    googleAuth.verifyIdToken.mockRejectedValue(new Error('invalid signature'))
    expect(await verifyGoogleIdToken('tok-gia')).toBeNull()
  })
})

// ── OAuth: Google (access token qua tokeninfo + userinfo endpoint) ───────────────────
describe('verifyGoogleAccessToken', () => {
  const OLD = process.env.GOOGLE_CLIENT_ID
  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'gclient'
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    if (OLD === undefined) delete process.env.GOOGLE_CLIENT_ID
    else process.env.GOOGLE_CLIENT_ID = OLD
  })

  it('audience đúng + userinfo hợp lệ → trả thông tin user', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ aud: 'gclient' }) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sub: 'g2', email: 'b@c.com', email_verified: true, name: 'B' }),
      } as Response)
    const result = await verifyGoogleAccessToken('atok')
    expect(result).toEqual({ googleId: 'g2', email: 'b@c.com', name: 'B' })
  })

  it('audience SAI (token cấp cho app khác) → null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ aud: 'app-khac' }),
    } as Response)
    expect(await verifyGoogleAccessToken('atok')).toBeNull()
  })

  it('tokeninfo trả lỗi HTTP → null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    expect(await verifyGoogleAccessToken('atok')).toBeNull()
  })
})

// ── OAuth: Facebook (debug_token + /me qua Graph API) ─────────────────────────────────
describe('verifyFacebookAccessToken', () => {
  const OLD_ID = process.env.FACEBOOK_APP_ID
  const OLD_SECRET = process.env.FACEBOOK_APP_SECRET
  beforeEach(() => {
    process.env.FACEBOOK_APP_ID = 'fbapp'
    process.env.FACEBOOK_APP_SECRET = 'fbsecret'
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    if (OLD_ID === undefined) delete process.env.FACEBOOK_APP_ID
    else process.env.FACEBOOK_APP_ID = OLD_ID
    if (OLD_SECRET === undefined) delete process.env.FACEBOOK_APP_SECRET
    else process.env.FACEBOOK_APP_SECRET = OLD_SECRET
  })

  it('token hợp lệ, đúng app_id, có email → trả thông tin user', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => ({ data: { is_valid: true, app_id: 'fbapp' } }),
      } as Response)
      .mockResolvedValueOnce({
        json: async () => ({ id: 'fb1', email: 'x@y.com', name: 'X' }),
      } as Response)
    const result = await verifyFacebookAccessToken('atok')
    expect(result).toEqual({ facebookId: 'fb1', email: 'x@y.com', name: 'X' })
  })

  it('debug_token báo is_valid=false → null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ data: { is_valid: false, app_id: 'fbapp' } }),
    } as Response)
    expect(await verifyFacebookAccessToken('atok')).toBeNull()
  })

  it('app_id KHÔNG khớp (token của app Facebook khác) → null', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ data: { is_valid: true, app_id: 'app-khac' } }),
    } as Response)
    expect(await verifyFacebookAccessToken('atok')).toBeNull()
  })

  it('user không cấp quyền email → null (users.email NOT NULL)', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        json: async () => ({ data: { is_valid: true, app_id: 'fbapp' } }),
      } as Response)
      .mockResolvedValueOnce({ json: async () => ({ id: 'fb1' }) } as Response)
    expect(await verifyFacebookAccessToken('atok')).toBeNull()
  })

  it('thiếu FACEBOOK_APP_ID/SECRET → null, không throw ra ngoài', async () => {
    delete process.env.FACEBOOK_APP_ID
    expect(await verifyFacebookAccessToken('atok')).toBeNull()
  })
})

// ── OAuth: Apple (id_token JWT verify qua JWKS) ────────────────────────────────────────
describe('verifyAppleIdToken', () => {
  const OLD = process.env.APPLE_CLIENT_ID
  beforeEach(() => {
    process.env.APPLE_CLIENT_ID = 'apple-client'
    jose.jwtVerify.mockReset()
  })
  afterEach(() => {
    if (OLD === undefined) delete process.env.APPLE_CLIENT_ID
    else process.env.APPLE_CLIENT_ID = OLD
  })

  it('JWT hợp lệ, có email, có tên từ client (lần đầu) → trả thông tin user', async () => {
    jose.jwtVerify.mockResolvedValue({ payload: { sub: 'ap1', email: 'a@icloud.com' } })
    const result = await verifyAppleIdToken('idtok', 'Táo Tây')
    expect(result).toEqual({ appleId: 'ap1', email: 'a@icloud.com', name: 'Táo Tây' })
  })

  it('không có tên từ client (lần sau) → dùng phần trước @ của email', async () => {
    jose.jwtVerify.mockResolvedValue({ payload: { sub: 'ap1', email: 'a@icloud.com' } })
    const result = await verifyAppleIdToken('idtok')
    expect(result?.name).toBe('a')
  })

  it('id_token thiếu email → null (không tạo được tài khoản)', async () => {
    jose.jwtVerify.mockResolvedValue({ payload: { sub: 'ap1' } })
    expect(await verifyAppleIdToken('idtok')).toBeNull()
  })

  it('chữ ký sai/hết hạn (jwtVerify ném lỗi) → null', async () => {
    jose.jwtVerify.mockRejectedValue(new Error('signature verification failed'))
    expect(await verifyAppleIdToken('idtok')).toBeNull()
  })
})

// ── OAuth: Microsoft (id_token JWT verify qua JWKS, issuer theo tenant động) ──────────
describe('verifyMicrosoftIdToken', () => {
  const OLD = process.env.MICROSOFT_CLIENT_ID
  beforeEach(() => {
    process.env.MICROSOFT_CLIENT_ID = 'ms-client'
    jose.jwtVerify.mockReset()
  })
  afterEach(() => {
    if (OLD === undefined) delete process.env.MICROSOFT_CLIENT_ID
    else process.env.MICROSOFT_CLIENT_ID = OLD
  })

  it('JWT hợp lệ, issuer đúng mẫu tenant, có email → trả thông tin user', async () => {
    jose.jwtVerify.mockResolvedValue({
      payload: {
        sub: 'ms1',
        iss: 'https://login.microsoftonline.com/tenant-abc/v2.0',
        email: 'm@corp.com',
        name: 'M',
      },
    })
    const result = await verifyMicrosoftIdToken('idtok')
    expect(result).toEqual({ microsoftId: 'ms1', email: 'm@corp.com', name: 'M' })
  })

  it('thiếu claim email → fallback dùng preferred_username', async () => {
    jose.jwtVerify.mockResolvedValue({
      payload: {
        sub: 'ms1',
        iss: 'https://login.microsoftonline.com/tenant-abc/v2.0',
        preferred_username: 'm@corp.com',
      },
    })
    const result = await verifyMicrosoftIdToken('idtok')
    expect(result?.email).toBe('m@corp.com')
    expect(result?.name).toBe('m') // không có claim 'name' → lấy phần trước @
  })

  it('issuer KHÔNG khớp mẫu tenant Microsoft → null', async () => {
    jose.jwtVerify.mockResolvedValue({
      payload: { sub: 'ms1', iss: 'https://evil.com/fake', email: 'm@corp.com' },
    })
    expect(await verifyMicrosoftIdToken('idtok')).toBeNull()
  })

  it('không có email lẫn preferred_username → null', async () => {
    jose.jwtVerify.mockResolvedValue({
      payload: { sub: 'ms1', iss: 'https://login.microsoftonline.com/tenant-abc/v2.0' },
    })
    expect(await verifyMicrosoftIdToken('idtok')).toBeNull()
  })
})

// ── findOrCreate*User (dùng chung findOrCreateOAuthUser, mỗi hàm khác cột định danh) ──
describe('findOrCreate*User (Facebook/Apple/Microsoft — liên kết tài khoản qua email)', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('findOrCreateGoogleUser: đã có user theo google_id → trả user cũ, isNew=false', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        if (sql.includes('google_id')) return { rows: [{ id: 'u1', email: 'a@b.com' }] }
        return { rows: [] }
      }),
    )
    const result = await findOrCreateGoogleUser('g1', 'a@b.com')
    expect(result).toEqual({ user: { id: 'u1', email: 'a@b.com' }, isNew: false })
  })

  it('findOrCreateFacebookUser: chưa có theo facebook_id nhưng email đã tồn tại → LIÊN KẾT, isNew=false', async () => {
    const calls: string[] = []
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        calls.push(sql)
        if (sql.includes('facebook_id') && sql.startsWith('select')) return { rows: [] }
        if (sql.startsWith('select id, email from public.users where email'))
          return { rows: [{ id: 'u2', email: 'old@b.com' }] }
        return { rows: [] }
      }),
    )
    const result = await findOrCreateFacebookUser('fb1', 'old@b.com')
    expect(result).toEqual({ user: { id: 'u2', email: 'old@b.com' }, isNew: false })
    expect(calls.some((sql) => sql.startsWith('update public.users set facebook_id'))).toBe(true)
  })

  it('findOrCreateAppleUser: email HOÀN TOÀN mới → tạo user mới, isNew=true', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        if (sql.startsWith('select')) return { rows: [] }
        return { rows: [{ id: 'u3', email: 'moi@b.com' }] }
      }),
    )
    const result = await findOrCreateAppleUser('ap1', 'moi@b.com')
    expect(result).toEqual({ user: { id: 'u3', email: 'moi@b.com' }, isNew: true })
  })

  it('findOrCreateMicrosoftUser: insert không trả dòng nào (lỗi lạ) → ném lỗi', async () => {
    mockedGetPool.mockReturnValue(
      mockPool(async (sql) => {
        if (sql.startsWith('select')) return { rows: [] }
        return { rows: [] } // insert thất bại âm thầm — ca biên hiếm
      }),
    )
    await expect(findOrCreateMicrosoftUser('ms1', 'x@b.com')).rejects.toThrow(
      'Không tạo được user microsoft mới',
    )
  })
})

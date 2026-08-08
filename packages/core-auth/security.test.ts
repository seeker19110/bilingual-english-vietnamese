import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getCorsHeaders,
  checkRateLimit,
  warnIfClusterWithoutRedis,
  validateAuth,
  validateContentType,
  logSecurityEvent,
} from './security'

const validateSessionToken = vi.hoisted(() => vi.fn())
vi.mock('./authService', () => ({ validateSessionToken }))

// Request giả tối thiểu — chỉ cần headers.get(...).
function reqWithHeaders(headers: Record<string, string | null>): Request {
  return {
    headers: { get: (k: string) => headers[k] ?? null },
  } as unknown as Request
}

// Request giả tối thiểu — chỉ cần headers.get('Origin').
function reqWithOrigin(origin: string | null): Request {
  return { headers: { get: (k: string) => (k === 'Origin' ? origin : null) } } as unknown as Request
}

describe('getCorsHeaders (H10 — CORS)', () => {
  const OLD = process.env.ALLOWED_ORIGINS
  afterEach(() => {
    process.env.ALLOWED_ORIGINS = OLD
  })

  it('không cấu hình ALLOWED_ORIGINS → "*", KHÔNG kèm credentials', () => {
    delete process.env.ALLOWED_ORIGINS
    const h = getCorsHeaders(reqWithOrigin('https://evil.com'))
    expect(h['Access-Control-Allow-Origin']).toBe('*')
    expect(h['Access-Control-Allow-Credentials']).toBeUndefined()
  })

  it('origin trong whitelist → phản chiếu origin + credentials', () => {
    process.env.ALLOWED_ORIGINS = 'https://app.com,https://www.app.com'
    const h = getCorsHeaders(reqWithOrigin('https://app.com'))
    expect(h['Access-Control-Allow-Origin']).toBe('https://app.com')
    expect(h['Access-Control-Allow-Credentials']).toBe('true')
  })

  it('origin NGOÀI whitelist → KHÔNG phản chiếu, KHÔNG credentials', () => {
    process.env.ALLOWED_ORIGINS = 'https://app.com'
    const h = getCorsHeaders(reqWithOrigin('https://evil.com'))
    expect(h['Access-Control-Allow-Origin']).toBe('https://app.com') // origin đầu danh sách
    expect(h['Access-Control-Allow-Credentials']).toBeUndefined()
  })
})

// Không set REDIS_URL trong test → toàn bộ khối này chạy nhánh FALLBACK Map in-memory,
// tức xác nhận hành vi cũ được giữ nguyên khi môi trường chưa có Redis (dev local, CI).
describe('checkRateLimit (fallback Map in-memory khi không có REDIS_URL)', () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    vi.useRealTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('không cấu hình REDIS_URL → vẫn đếm được bằng Map, không ném lỗi', async () => {
    expect(process.env.REDIS_URL).toBeUndefined()
    const ip = 'ip-' + Math.random()
    await expect(checkRateLimit(ip, 1, 'fallback')).resolves.toBe(true)
    await expect(checkRateLimit(ip, 1, 'fallback')).resolves.toBe(false)
  })

  it('cho qua tới hạn rồi chặn request vượt', async () => {
    const ip = 'ip-' + Math.random()
    expect(await checkRateLimit(ip, 3, 'b1')).toBe(true)
    expect(await checkRateLimit(ip, 3, 'b1')).toBe(true)
    expect(await checkRateLimit(ip, 3, 'b1')).toBe(true)
    expect(await checkRateLimit(ip, 3, 'b1')).toBe(false) // request thứ 4 → chặn
  })

  it('bộ đếm tách biệt theo bucket', async () => {
    const ip = 'ip-' + Math.random()
    expect(await checkRateLimit(ip, 1, 'bucketA')).toBe(true)
    expect(await checkRateLimit(ip, 1, 'bucketA')).toBe(false)
    // bucket khác vẫn còn lượt riêng
    expect(await checkRateLimit(ip, 1, 'bucketB')).toBe(true)
  })

  it('reset sau cửa sổ 60s', async () => {
    vi.useFakeTimers()
    const ip = 'ip-' + Math.random()
    expect(await checkRateLimit(ip, 1, 'win')).toBe(true)
    expect(await checkRateLimit(ip, 1, 'win')).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(await checkRateLimit(ip, 1, 'win')).toBe(true) // cửa sổ mới
  })
})

describe('warnIfClusterWithoutRedis (cảnh báo lúc khởi động — H: rate limit lỏng khi cluster thiếu Redis)', () => {
  const OLD_INSTANCE = process.env.NODE_APP_INSTANCE
  const OLD_REDIS = process.env.REDIS_URL
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    warnSpy.mockRestore()
    if (OLD_INSTANCE === undefined) delete process.env.NODE_APP_INSTANCE
    else process.env.NODE_APP_INSTANCE = OLD_INSTANCE
    if (OLD_REDIS === undefined) delete process.env.REDIS_URL
    else process.env.REDIS_URL = OLD_REDIS
  })

  it('chạy dưới PM2 (NODE_APP_INSTANCE có set) mà KHÔNG có REDIS_URL → cảnh báo', () => {
    process.env.NODE_APP_INSTANCE = '0'
    delete process.env.REDIS_URL
    warnIfClusterWithoutRedis()
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain('REDIS_URL')
  })

  it('chạy dưới PM2 nhưng ĐÃ có REDIS_URL → không cảnh báo', () => {
    process.env.NODE_APP_INSTANCE = '0'
    process.env.REDIS_URL = 'redis://127.0.0.1:6379'
    warnIfClusterWithoutRedis()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('không chạy dưới PM2 (dev local) → không cảnh báo dù thiếu REDIS_URL', () => {
    delete process.env.NODE_APP_INSTANCE
    delete process.env.REDIS_URL
    warnIfClusterWithoutRedis()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})

// ── validateAuth — nhánh TỪ CHỐI là quan trọng nhất (bảo mật) ──────────────────────────
describe('validateAuth', () => {
  const OLD_SKIP = process.env.SKIP_AUTH
  const OLD_NODE_ENV = process.env.NODE_ENV
  const OLD_VERCEL_ENV = process.env.VERCEL_ENV

  beforeEach(() => {
    validateSessionToken.mockReset()
  })
  afterEach(() => {
    if (OLD_SKIP === undefined) delete process.env.SKIP_AUTH
    else process.env.SKIP_AUTH = OLD_SKIP
    if (OLD_NODE_ENV === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = OLD_NODE_ENV
    if (OLD_VERCEL_ENV === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = OLD_VERCEL_ENV
  })

  it('THIẾU header Authorization → null, không gọi validateSessionToken', async () => {
    delete process.env.SKIP_AUTH
    const result = await validateAuth(reqWithHeaders({}))
    expect(result).toBeNull()
    expect(validateSessionToken).not.toHaveBeenCalled()
  })

  it('header sai định dạng (không phải "Bearer ...") → null', async () => {
    delete process.env.SKIP_AUTH
    const result = await validateAuth(reqWithHeaders({ Authorization: 'Basic abc123' }))
    expect(result).toBeNull()
    expect(validateSessionToken).not.toHaveBeenCalled()
  })

  it('"Bearer " nhưng token rỗng (chỉ khoảng trắng) → null', async () => {
    delete process.env.SKIP_AUTH
    const result = await validateAuth(reqWithHeaders({ Authorization: 'Bearer    ' }))
    expect(result).toBeNull()
    expect(validateSessionToken).not.toHaveBeenCalled()
  })

  it('token ĐÚNG định dạng nhưng hết hạn/không tồn tại (validateSessionToken trả null) → null', async () => {
    delete process.env.SKIP_AUTH
    validateSessionToken.mockResolvedValue(null)
    const result = await validateAuth(reqWithHeaders({ Authorization: 'Bearer het-han' }))
    expect(result).toBeNull()
  })

  it('validateSessionToken ném lỗi (DB lỗi) → null, không crash', async () => {
    delete process.env.SKIP_AUTH
    validateSessionToken.mockRejectedValue(new Error('db down'))
    const result = await validateAuth(reqWithHeaders({ Authorization: 'Bearer x' }))
    expect(result).toBeNull()
  })

  it('token hợp lệ → trả userId', async () => {
    delete process.env.SKIP_AUTH
    validateSessionToken.mockResolvedValue({ userId: 'user-1' })
    const result = await validateAuth(reqWithHeaders({ Authorization: 'Bearer hop-le' }))
    expect(result).toEqual({ userId: 'user-1' })
  })

  // ── Cookie fallback (Bước 3 SSO — dual-accept, sessionCookie.ts) ────────────────────
  it('KHÔNG có Authorization nhưng có cookie session_token hợp lệ → trả userId', async () => {
    delete process.env.SKIP_AUTH
    validateSessionToken.mockResolvedValue({ userId: 'user-cookie' })
    const result = await validateAuth(reqWithHeaders({ Cookie: 'session_token=abc123' }))
    expect(result).toEqual({ userId: 'user-cookie' })
    expect(validateSessionToken).toHaveBeenCalledWith('abc123')
  })

  it('CÓ CẢ Authorization lẫn cookie → ưu tiên Bearer (cơ chế chính)', async () => {
    delete process.env.SKIP_AUTH
    validateSessionToken.mockResolvedValue({ userId: 'user-bearer' })
    await validateAuth(
      reqWithHeaders({ Authorization: 'Bearer bearer-tok', Cookie: 'session_token=cookie-tok' }),
    )
    expect(validateSessionToken).toHaveBeenCalledWith('bearer-tok')
  })

  it('không có Authorization, cookie không chứa session_token → null', async () => {
    delete process.env.SKIP_AUTH
    const result = await validateAuth(reqWithHeaders({ Cookie: 'other=xyz' }))
    expect(result).toBeNull()
    expect(validateSessionToken).not.toHaveBeenCalled()
  })

  it('SKIP_AUTH=true nhưng NODE_ENV=production → KHÔNG bypass (an toàn production)', async () => {
    process.env.SKIP_AUTH = 'true'
    process.env.NODE_ENV = 'production'
    delete process.env.VERCEL_ENV
    const result = await validateAuth(reqWithHeaders({}))
    expect(result).toBeNull()
  })

  it('SKIP_AUTH=true nhưng VERCEL_ENV=production → KHÔNG bypass', async () => {
    process.env.SKIP_AUTH = 'true'
    delete process.env.NODE_ENV
    process.env.VERCEL_ENV = 'production'
    const result = await validateAuth(reqWithHeaders({}))
    expect(result).toBeNull()
  })

  it('SKIP_AUTH=true và KHÔNG phải production nào → bypass, trả user giả dev', async () => {
    process.env.SKIP_AUTH = 'true'
    process.env.NODE_ENV = 'development'
    delete process.env.VERCEL_ENV
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const result = await validateAuth(reqWithHeaders({}))
    expect(result).toEqual({ userId: 'dev-skip-auth' })
    warnSpy.mockRestore()
  })
})

describe('validateContentType', () => {
  it('Content-Type application/json → true', () => {
    expect(validateContentType(reqWithHeaders({ 'Content-Type': 'application/json' }))).toBe(true)
  })

  it('Content-Type có charset kèm theo (application/json; charset=utf-8) → vẫn true', () => {
    expect(
      validateContentType(reqWithHeaders({ 'Content-Type': 'application/json; charset=utf-8' })),
    ).toBe(true)
  })

  it('Content-Type khác (text/plain) → false', () => {
    expect(validateContentType(reqWithHeaders({ 'Content-Type': 'text/plain' }))).toBe(false)
  })

  it('THIẾU Content-Type → false', () => {
    expect(validateContentType(reqWithHeaders({}))).toBe(false)
  })
})

describe('logSecurityEvent', () => {
  it('ghi log cảnh báo có kèm loại sự kiện + ip', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    logSecurityEvent('LOGIN_FAILED', '1.2.3.4', { email: 'a@b.com' })
    expect(warnSpy).toHaveBeenCalledWith(
      '[Security][LOGIN_FAILED] ip=1.2.3.4',
      JSON.stringify({ email: 'a@b.com' }),
    )
    warnSpy.mockRestore()
  })
})

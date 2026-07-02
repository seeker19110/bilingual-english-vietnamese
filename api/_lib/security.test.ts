// @vitest-environment node
// Chạy ở môi trường Node thay vì happy-dom: đây là code server-side, và happy-dom
// mô phỏng giới hạn "forbidden header" của trình duyệt (chặn set/đọc header Origin
// qua Request constructor), khác với môi trường Node/Edge thật lúc request đến.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCorsHeaders, checkRateLimit, validateAuth } from './security'

describe('getCorsHeaders', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS

  afterEach(() => {
    // Gán = undefined sẽ biến thành chuỗi "undefined" trong process.env — phải delete.
    if (originalEnv === undefined) delete process.env.ALLOWED_ORIGINS
    else process.env.ALLOWED_ORIGINS = originalEnv
  })

  it('cho phép mọi origin ("*") khi chưa cấu hình ALLOWED_ORIGINS', () => {
    delete process.env.ALLOWED_ORIGINS
    const req = new Request('http://localhost', { headers: { Origin: 'https://anywhere.com' } })
    expect(getCorsHeaders(req)['Access-Control-Allow-Origin']).toBe('*')
  })

  it('phản chiếu đúng origin nếu nằm trong whitelist', () => {
    process.env.ALLOWED_ORIGINS = 'https://a.com,https://b.com'
    const req = new Request('http://localhost', { headers: { Origin: 'https://b.com' } })
    expect(getCorsHeaders(req)['Access-Control-Allow-Origin']).toBe('https://b.com')
  })

  it('trả về domain đầu tiên trong whitelist nếu origin lạ (không cho phép "*")', () => {
    process.env.ALLOWED_ORIGINS = 'https://a.com,https://b.com'
    const req = new Request('http://localhost', { headers: { Origin: 'https://evil.com' } })
    expect(getCorsHeaders(req)['Access-Control-Allow-Origin']).toBe('https://a.com')
  })
})

describe('checkRateLimit', () => {
  it('cho phép tới đúng giới hạn rồi chặn ở lượt tiếp theo', () => {
    const ip = `ip-test-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip, 5)).toBe(true)
    }
    expect(checkRateLimit(ip, 5)).toBe(false)
  })

  it('mỗi IP có cửa sổ đếm riêng, không ảnh hưởng lẫn nhau', () => {
    const ipA = `ip-a-${Math.random()}`
    const ipB = `ip-b-${Math.random()}`
    for (let i = 0; i < 3; i++) checkRateLimit(ipA, 3)
    expect(checkRateLimit(ipA, 3)).toBe(false)
    expect(checkRateLimit(ipB, 3)).toBe(true)
  })

  it('mở lại cửa sổ mới sau khi hết 1 phút', () => {
    vi.useFakeTimers()
    try {
      const ip = `ip-reset-${Math.random()}`
      expect(checkRateLimit(ip, 1)).toBe(true)
      expect(checkRateLimit(ip, 1)).toBe(false)
      vi.advanceTimersByTime(60_001)
      expect(checkRateLimit(ip, 1)).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('validateAuth', () => {
  const originalSkipAuth = process.env.SKIP_AUTH
  const originalNodeEnv = process.env.NODE_ENV
  const originalVercelEnv = process.env.VERCEL_ENV

  beforeEach(() => {
    vi.resetModules()
  })

  function restore(key: string, value: string | undefined) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }

  afterEach(() => {
    restore('SKIP_AUTH', originalSkipAuth)
    restore('NODE_ENV', originalNodeEnv)
    restore('VERCEL_ENV', originalVercelEnv)
    vi.doUnmock('./supabaseAdmin')
  })

  it('trả về null nếu không có header Authorization', async () => {
    const req = new Request('http://localhost')
    const result = await validateAuth(req)
    expect(result).toBeNull()
  })

  it('trả về null nếu Authorization không phải "Bearer <token>"', async () => {
    const req = new Request('http://localhost', { headers: { Authorization: 'Basic abc' } })
    expect(await validateAuth(req)).toBeNull()
  })

  it('KHÔNG bypass auth khi SKIP_AUTH=true nhưng NODE_ENV=production', async () => {
    process.env.SKIP_AUTH = 'true'
    process.env.NODE_ENV = 'production'
    delete process.env.VERCEL_ENV
    const req = new Request('http://localhost')
    expect(await validateAuth(req)).toBeNull()
  })

  it('KHÔNG bypass auth khi SKIP_AUTH=true nhưng VERCEL_ENV=production', async () => {
    process.env.SKIP_AUTH = 'true'
    delete process.env.NODE_ENV
    process.env.VERCEL_ENV = 'production'
    const req = new Request('http://localhost')
    expect(await validateAuth(req)).toBeNull()
  })

  it('trả về userId hợp lệ khi Supabase xác thực token thành công', async () => {
    vi.doMock('./supabaseAdmin', () => ({
      getSupabaseAdmin: () => ({
        auth: {
          getUser: async (token: string) =>
            token === 'good-token'
              ? { data: { user: { id: 'user-123' } }, error: null }
              : { data: { user: null }, error: new Error('invalid') },
        },
      }),
    }))
    const { validateAuth: freshValidateAuth } = await import('./security')
    const req = new Request('http://localhost', { headers: { Authorization: 'Bearer good-token' } })
    expect(await freshValidateAuth(req)).toEqual({ userId: 'user-123' })
  })

  it('trả về null khi token sai', async () => {
    vi.doMock('./supabaseAdmin', () => ({
      getSupabaseAdmin: () => ({
        auth: {
          getUser: async () => ({ data: { user: null }, error: new Error('invalid') }),
        },
      }),
    }))
    const { validateAuth: freshValidateAuth } = await import('./security')
    const req = new Request('http://localhost', { headers: { Authorization: 'Bearer bad-token' } })
    expect(await freshValidateAuth(req)).toBeNull()
  })
})

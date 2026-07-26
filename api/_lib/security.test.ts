import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCorsHeaders, checkRateLimit, warnIfClusterWithoutRedis } from './security'

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

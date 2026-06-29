import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCorsHeaders, checkRateLimit } from './security'

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

describe('checkRateLimit', () => {
  beforeEach(() => vi.useRealTimers())
  afterEach(() => vi.useRealTimers())

  it('cho qua tới hạn rồi chặn request vượt', () => {
    const ip = 'ip-' + Math.random()
    expect(checkRateLimit(ip, 3, 'b1')).toBe(true)
    expect(checkRateLimit(ip, 3, 'b1')).toBe(true)
    expect(checkRateLimit(ip, 3, 'b1')).toBe(true)
    expect(checkRateLimit(ip, 3, 'b1')).toBe(false) // request thứ 4 → chặn
  })

  it('bộ đếm tách biệt theo bucket', () => {
    const ip = 'ip-' + Math.random()
    expect(checkRateLimit(ip, 1, 'bucketA')).toBe(true)
    expect(checkRateLimit(ip, 1, 'bucketA')).toBe(false)
    // bucket khác vẫn còn lượt riêng
    expect(checkRateLimit(ip, 1, 'bucketB')).toBe(true)
  })

  it('reset sau cửa sổ 60s', () => {
    vi.useFakeTimers()
    const ip = 'ip-' + Math.random()
    expect(checkRateLimit(ip, 1, 'win')).toBe(true)
    expect(checkRateLimit(ip, 1, 'win')).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(checkRateLimit(ip, 1, 'win')).toBe(true) // cửa sổ mới
  })
})

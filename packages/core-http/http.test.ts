// Cổng cho getClientIp — chặn hồi quy LỖ HỔNG THẬT đã xác minh trên production 2026-08-26:
// bản cũ đọc phần tử ĐẦU của X-Forwarded-For, tức giá trị client tự khai, nên đổi header mỗi
// request là né sạch rate limit (40 request vào route giới hạn 30/phút → 40 lần 200, 0 lần 429).
import { describe, it, expect } from 'vitest'
import { getClientIp } from './http.js'

const req = (headers: Record<string, string>) => new Request('https://x.test/', { headers })

describe('getClientIp', () => {
  it('ưu tiên CF-Connecting-IP — Cloudflare GHI ĐÈ header này ở biên', () => {
    expect(
      getClientIp(
        req({
          'cf-connecting-ip': '203.0.113.7',
          'x-real-ip': '10.0.0.1',
          'x-forwarded-for': '1.2.3.4, 10.0.0.1',
        }),
      ),
    ).toBe('203.0.113.7')
  })

  it('không có CF thì dùng X-Real-IP (nginx đặt = $remote_addr, cũng là ghi đè)', () => {
    expect(
      getClientIp(req({ 'x-real-ip': '10.0.0.1', 'x-forwarded-for': '1.2.3.4, 10.0.0.1' })),
    ).toBe('10.0.0.1')
  })

  it('CHẶN HỒI QUY: XFF lấy phần tử CUỐI, không phải phần client tự khai ở đầu', () => {
    // Nginx nối ip thật vào cuối: "<client khai>, <ip thật>".
    expect(getClientIp(req({ 'x-forwarded-for': '1.2.3.4, 198.51.100.5' }))).toBe('198.51.100.5')
    // Kẻ tấn công chèn nhiều IP giả — phần tử cuối vẫn là ip do proxy nối vào.
    expect(getClientIp(req({ 'x-forwarded-for': 'a, b, c, 198.51.100.5' }))).toBe('198.51.100.5')
  })

  it('XFF chỉ có một giá trị (không qua proxy nào nối thêm) → chính giá trị đó', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '198.51.100.5' }))).toBe('198.51.100.5')
  })

  it('bỏ qua khoảng trắng thừa và phần tử rỗng', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '1.2.3.4 ,  198.51.100.5 , ' }))).toBe(
      '198.51.100.5',
    )
    expect(getClientIp(req({ 'cf-connecting-ip': '  203.0.113.7  ' }))).toBe('203.0.113.7')
  })

  it('không có header nào → "unknown", KHÔNG ném lỗi (rate limit vẫn đếm được)', () => {
    expect(getClientIp(req({}))).toBe('unknown')
    expect(getClientIp(req({ 'x-forwarded-for': '' }))).toBe('unknown')
    expect(getClientIp(req({ 'x-forwarded-for': ' , , ' }))).toBe('unknown')
  })

  it('hai request giả IP khác nhau trong XFF vẫn ra CÙNG một IP ⇒ rate limit gộp đúng', () => {
    // Đây chính là ca lỗ hổng: trước đây hai request này cho hai khoá rate limit khác nhau.
    const a = getClientIp(req({ 'x-forwarded-for': '10.0.1.1, 198.51.100.5' }))
    const b = getClientIp(req({ 'x-forwarded-for': '10.0.9.9, 198.51.100.5' }))
    expect(a).toBe(b)
  })
})

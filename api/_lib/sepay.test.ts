import { describe, it, expect } from 'vitest'
import {
  generatePaymentCode,
  extractPaymentCode,
  buildSepayQrUrl,
  verifySepayApiKey,
  PAYMENT_CODE_PREFIX,
  ACCEPTED_PAYMENT_PREFIXES,
} from './sepay'

describe('generatePaymentCode', () => {
  it('luôn bắt đầu bằng tiền tố DHCB (mã mới, kể từ 2026-07-31), đủ độ dài, không chứa ký tự dễ nhầm 0/O/1/I/L', () => {
    for (let i = 0; i < 200; i++) {
      const code = generatePaymentCode()
      expect(code.startsWith(PAYMENT_CODE_PREFIX)).toBe(true)
      expect(code).toMatch(/^DHCB[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/)
    }
  })

  it('không sinh trùng trong 500 lần (xác suất trùng gần như 0 với 32^8 khả năng)', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generatePaymentCode()))
    expect(codes.size).toBe(500)
  })
})

describe('extractPaymentCode', () => {
  it('dò được mã DHCB (tiền tố mới) nằm giữa nội dung chuyển khoản thật', () => {
    expect(extractPaymentCode('NGUYEN VAN A chuyen tien DHCB7K2M9QRT thanh toan')).toBe(
      'DHCB7K2M9QRT',
    )
  })

  it('VẪN dò được mã ENVI (tiền tố cũ) — giao dịch cũ / người dùng copy lại nội dung cũ phải luôn khớp', () => {
    expect(extractPaymentCode('NGUYEN VAN A chuyen tien ENVI7K2M9QRT thanh toan')).toBe(
      'ENVI7K2M9QRT',
    )
  })

  it('không phân biệt hoa/thường (ngân hàng có thể viết hoa toàn bộ) — cả 2 tiền tố', () => {
    expect(extractPaymentCode('dhcb7k2m9qrt')).toBe('DHCB7K2M9QRT')
    expect(extractPaymentCode('envi7k2m9qrt')).toBe('ENVI7K2M9QRT')
  })

  it('không có mã trong nội dung → null', () => {
    expect(extractPaymentCode('chuyen tien an com')).toBeNull()
  })

  it('rỗng/null/undefined → null, không throw', () => {
    expect(extractPaymentCode('')).toBeNull()
    expect(extractPaymentCode(null)).toBeNull()
    expect(extractPaymentCode(undefined)).toBeNull()
  })

  it('mã bị cắt ngắn (thiếu ký tự) → không khớp', () => {
    expect(extractPaymentCode('ENVI7K2M9Q')).toBeNull()
    expect(extractPaymentCode('DHCB7K2M9Q')).toBeNull()
  })

  it('ACCEPTED_PAYMENT_PREFIXES luôn chứa cả DHCB và ENVI (chống xoá nhầm ENVI sau này)', () => {
    expect(ACCEPTED_PAYMENT_PREFIXES).toContain('DHCB')
    expect(ACCEPTED_PAYMENT_PREFIXES).toContain('ENVI')
  })
})

describe('buildSepayQrUrl', () => {
  it('ghép đúng tham số, không gọi mạng', () => {
    const url = buildSepayQrUrl({
      bankAccount: '0123456789',
      bankCode: 'MBBank',
      amountVnd: 40000,
      paymentCode: 'ENVI7K2M9QRT',
    })
    expect(url).toBe(
      'https://qr.sepay.vn/img?acc=0123456789&bank=MBBank&amount=40000&des=ENVI7K2M9QRT',
    )
  })
})

describe('verifySepayApiKey', () => {
  const KEY = 'sk_test_abc123'

  it('đúng khoá → true', () => {
    expect(verifySepayApiKey(`Apikey ${KEY}`, KEY)).toBe(true)
  })

  it('sai khoá → false', () => {
    expect(verifySepayApiKey('Apikey sai-khoa', KEY)).toBe(false)
  })

  it('thiếu header → false', () => {
    expect(verifySepayApiKey(null, KEY)).toBe(false)
  })

  it('sai định dạng (thiếu tiền tố "Apikey ") → false', () => {
    expect(verifySepayApiKey(KEY, KEY)).toBe(false)
  })

  it('độ dài khác nhau → false, không throw (timingSafeEqual đòi buffer cùng độ dài)', () => {
    expect(verifySepayApiKey('Apikey short', KEY)).toBe(false)
    expect(verifySepayApiKey('Apikey ' + KEY + 'extra', KEY)).toBe(false)
  })
})

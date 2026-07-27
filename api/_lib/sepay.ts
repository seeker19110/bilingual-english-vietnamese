// api/_lib/sepay.ts — Phần THUẦN (không đụng DB) của tích hợp SePay: sinh mã thanh toán, dựng
// URL ảnh QR, dò mã trong nội dung chuyển khoản, xác thực webhook. Tách riêng để test được mọi
// ca biên (đặc biệt việc dò mã — nơi dễ sai nhất vì phụ thuộc cách ngân hàng ghi nội dung).
//
// Đọc tài liệu thật trước khi viết: https://docs.sepay.vn/tich-hop-webhooks.html,
// https://docs.sepay.vn/lap-trinh-webhooks.html, https://sepay.vn/lap-trinh-cong-thanh-toan.html
// — xem docs/research/dac-ta-thanh-toan-2026-07-25.md mục "Cổng thanh toán: SePay".

import { randomInt, timingSafeEqual } from 'node:crypto'

// Tiền tố cố định để lọc trên dashboard SePay ("tiền tố mã thanh toán") — tách giao dịch của
// app khỏi các giao dịch cá nhân khác trong cùng tài khoản ngân hàng.
export const PAYMENT_CODE_PREFIX = 'ENVI'

// Bảng ký tự KHÔNG chứa 0/O, 1/I/L — người dùng có thể phải GÕ TAY nội dung chuyển khoản khi
// ứng dụng ngân hàng không cho sửa nội dung từ QR, nên tránh ký tự dễ đọc/gõ nhầm.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const CODE_SUFFIX_LEN = 8

/** Sinh mã thanh toán mới, vd "ENVI7K2M9QRT". Ngẫu nhiên an toàn (node:crypto), không Math.random. */
export function generatePaymentCode(): string {
  let suffix = ''
  for (let i = 0; i < CODE_SUFFIX_LEN; i++) {
    suffix += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)]
  }
  return `${PAYMENT_CODE_PREFIX}${suffix}`
}

/**
 * Dò mã thanh toán trong một đoạn text (nội dung chuyển khoản hoặc trường `code` của webhook).
 * Không phân biệt hoa/thường — nhiều ngân hàng viết hoa toàn bộ nội dung chuyển khoản.
 * Trả về mã dạng CHUẨN HOÁ (viết hoa) nếu tìm thấy, null nếu không.
 */
export function extractPaymentCode(text: string | null | undefined): string | null {
  if (!text) return null
  const re = new RegExp(`${PAYMENT_CODE_PREFIX}[${CODE_ALPHABET}]{${CODE_SUFFIX_LEN}}`, 'i')
  const match = text.toUpperCase().match(re)
  return match ? match[0] : null
}

export interface SepayQrParams {
  bankAccount: string
  bankCode: string
  amountVnd: number
  paymentCode: string
}

/** Dựng URL ảnh QR VietQR của SePay — KHÔNG gọi API ngoài, chỉ ghép chuỗi. */
export function buildSepayQrUrl({
  bankAccount,
  bankCode,
  amountVnd,
  paymentCode,
}: SepayQrParams): string {
  const params = new URLSearchParams({
    acc: bankAccount,
    bank: bankCode,
    amount: String(amountVnd),
    des: paymentCode,
  })
  return `https://qr.sepay.vn/img?${params.toString()}`
}

/**
 * So sánh header `Authorization: Apikey <key>` với khoá thật, chống timing attack.
 * `timingSafeEqual` YÊU CẦU 2 buffer cùng độ dài — độ dài khác nhau đã đủ để biết sai mà
 * không cần so nội dung, nên trả false thẳng (không rò rỉ thời gian có ý nghĩa: độ dài khoá
 * không phải bí mật cần giữ).
 */
export function verifySepayApiKey(authHeader: string | null, expectedKey: string): boolean {
  if (!authHeader || !expectedKey) return false
  const prefix = 'Apikey '
  if (!authHeader.startsWith(prefix)) return false
  const provided = Buffer.from(authHeader.slice(prefix.length))
  const expected = Buffer.from(expectedKey)
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}

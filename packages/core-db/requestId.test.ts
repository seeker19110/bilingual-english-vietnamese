import { describe, it, expect } from 'vitest'
import { createRequestId } from './requestId.js'

describe('createRequestId', () => {
  it('trả về chuỗi 8 ký tự', () => {
    expect(createRequestId()).toHaveLength(8)
  })

  it('chỉ gồm ký tự hex (khớp phần đầu UUID v4)', () => {
    expect(createRequestId()).toMatch(/^[0-9a-f]{8}$/)
  })

  it('2 lần gọi liên tiếp trả về giá trị KHÁC nhau', () => {
    const a = createRequestId()
    const b = createRequestId()
    expect(a).not.toBe(b)
  })

  // ── Vì sao KHÔNG khẳng định "1000 lần gọi không bao giờ trùng" (vá F2, audit 2026-08-24) ──
  //
  // ID chỉ dài 8 ký tự hex = 32 bit, tức không gian 2^32 ≈ 4,29 tỷ. Theo nghịch lý sinh nhật,
  // 1000 mẫu có xác suất trùng ≈ 1 − exp(−1000²/2·2^32) ≈ 0,012% MỖI LƯỢT CHẠY — tức khoảng
  // 1/8.600 lần chạy sẽ đỏ. Test cũ khẳng định `size === 1000` nên đã làm CI đỏ ngẫu nhiên.
  //
  // Bản thân `createRequestId()` KHÔNG sai: nó chỉ dùng để nối các dòng log của cùng một
  // request (xem chú thích đầu requestId.ts), không phải khoá định danh lâu dài — trùng
  // 1/8.600 là hoàn toàn chấp nhận được. Cái sai là TEST đòi hỏi bất biến mạnh hơn thứ hàm
  // cam kết. Ngưỡng ≥ 999/1000 phản ánh đúng cam kết thật ("gần như luôn khác nhau") và chỉ
  // đỏ khi có ≥ 2 lần trùng trong cùng một lượt — xác suất ~7e-9, tức không bao giờ.
  it('1000 lần gọi gần như luôn khác nhau (cho phép tối đa 1 lần trùng)', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createRequestId()))
    expect(ids.size).toBeGreaterThanOrEqual(999)
  })
})

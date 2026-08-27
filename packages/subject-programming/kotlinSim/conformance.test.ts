// CỔNG ĐỐI CHIẾU của bộ chạy Kotlin (PR-M7, hiến chương M §3.4).
//
// Chạy TỪNG ca trong conformance.ts và so output với kết quả kỳ vọng. Một interpreter sai âm
// thầm dạy sai cú pháp cho người mới, mà người mới không có cách nào biết — nên cổng này chặn
// CI, và mỗi tính năng cú pháp bộ chạy hứa phải có ít nhất một ca ở đây.
import { describe, expect, it } from 'vitest'
import { CA_DOI_CHIEU } from './conformance.js'
import { chayKotlin, DONG_TU_KHAI } from './chayKotlin.js'

function chay(code: string): { ra: string; loi?: string } {
  const r = chayKotlin(code)
  return { ra: r.output.replace(`${DONG_TU_KHAI}\n`, ''), ...(r.error ? { loi: r.error } : {}) }
}

describe('bộ chạy Kotlin — ca đối chiếu', () => {
  it.each(CA_DOI_CHIEU)('$ma $tinhNang', (ca) => {
    const { ra, loi } = chay(ca.code)
    expect(loi, `Ca ${ca.ma} chạy lỗi: ${loi}`).toBeUndefined()
    expect(ra, `Ca ${ca.ma} (${ca.tinhNang})`).toBe(ca.ky)
  })

  it('mã ca không trùng nhau', () => {
    const ma = CA_DOI_CHIEU.map((c) => c.ma)
    expect(new Set(ma).size).toBe(ma.length)
  })

  it('mỗi ca đều ghi NGUỒN của kết quả kỳ vọng (không suy đoán từ trí nhớ)', () => {
    for (const ca of CA_DOI_CHIEU) {
      expect(ca.nguon.length, `Ca ${ca.ma} thiếu nguồn`).toBeGreaterThan(10)
    }
  })

  // Cổng của hiến chương §3.4: nội dung Kotlin (PR-M8 trở đi) chỉ được soạn SAU khi mọi ca đã
  // chạy thật trên trình biên dịch Kotlin. Test này canh đúng ràng buộc đó: ngày nào có bài
  // `language: 'kotlin'` mà ca đối chiếu chưa được xác minh, CI đỏ.
  it('CỔNG §3.4: chưa đối chiếu trên kotlinc thật thì chưa được soạn nội dung Kotlin', async () => {
    const chuaDoiChieu = CA_DOI_CHIEU.filter((c) => !c.daDoiChieu)
    if (chuaDoiChieu.length === 0) return
    const { PROGRAMMING_LESSONS } = await import('../lessons.js')
    const baiKotlin = PROGRAMMING_LESSONS.filter((l) => l.language === 'kotlin')
    expect(
      baiKotlin.length,
      `Con ${chuaDoiChieu.length} ca doi chieu chua chay tren kotlinc that (chay "npm run kotlin:conformance" tren may co Kotlin), nhung da co ${baiKotlin.length} bai Kotlin. Hien chuong M §3.4 cam soan noi dung truoc khi bo doi chieu xanh.`,
    ).toBe(0)
  })
})

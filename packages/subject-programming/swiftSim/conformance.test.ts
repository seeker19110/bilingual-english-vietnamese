// CỔNG ĐỐI CHIẾU của bộ chạy Swift (PR-M3, hiến chương M §3.4).
//
// Chạy TỪNG ca trong conformance.ts và so output với kết quả kỳ vọng. Một interpreter sai âm
// thầm dạy sai cú pháp cho người mới, mà người mới không có cách nào biết — nên cổng này chặn
// CI, và mỗi tính năng cú pháp bộ chạy hứa phải có ít nhất một ca ở đây.
import { describe, expect, it } from 'vitest'
import { CA_DOI_CHIEU } from './conformance.js'
import { chaySwift, DONG_TU_KHAI } from './index.js'

function chay(code: string): { ra: string; loi?: string } {
  const r = chaySwift(code)
  return { ra: r.output.replace(`${DONG_TU_KHAI}\n`, ''), ...(r.error ? { loi: r.error } : {}) }
}

describe('bộ chạy Swift — ca đối chiếu', () => {
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

  // Cổng cứng của hiến chương §8: nội dung Swift (PR-M4 trở đi) chỉ được soạn SAU khi mọi ca
  // đã chạy thật trên trình biên dịch Swift. Test này canh đúng ràng buộc đó: ngày nào có bài
  // `language: 'swift'` mà ca đối chiếu chưa được xác minh, CI đỏ.
  it('CỔNG §8: chưa đối chiếu trên swiftc thật thì chưa được soạn nội dung Swift', async () => {
    const chuaDoiChieu = CA_DOI_CHIEU.filter((c) => !c.daDoiChieu)
    if (chuaDoiChieu.length === 0) return
    const { PROGRAMMING_LESSONS } = await import('../lessons.js')
    const baiSwift = PROGRAMMING_LESSONS.filter((l) => l.language === 'swift')
    expect(
      baiSwift.length,
      `Con ${chuaDoiChieu.length} ca doi chieu chua chay tren swiftc that (chay "npm run swift:conformance" tren may co Xcode), nhung da co ${baiSwift.length} bai Swift. Hien chuong M §8 cam soan noi dung truoc khi bo doi chieu xanh.`,
    ).toBe(0)
  })
})

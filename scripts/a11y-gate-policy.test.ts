// scripts/a11y-gate-policy.test.ts — Chốt chặn cho CÁCH CHỜ của cổng a11y.
//
// VÌ SAO CẦN: cổng a11y (`e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts`) hỏng theo kiểu IM
// LẶNG nếu nó quét trang CHƯA RENDER XONG — nó vẫn chạy, vẫn báo "0 vi phạm", chỉ là con số
// đó nói về một trang gần như trống chứ không về trang người dùng thấy.
//
// Đã xảy ra thật (2026-09-03): cổng dùng `waitForTimeout(1000)`. Đo trên máy phát triển,
// TRANG CHỦ tại thời điểm quét mới có **268/478 phần tử** — chữ 39/94, phần tử tương tác
// 21/55. Tức cổng chỉ soi 38% số nút và link của trang quan trọng nhất, rồi tuyên bố sạch.
// Cùng cơ chế đó khiến một lỗi `aria-required-parent` mức critical trên 182 phần tử lọt qua
// kiểm tra cục bộ và chỉ CI mới bắt được.
//
// Con số chờ cứng KHÔNG thể đúng cho mọi lần chạy: nó phụ thuộc tốc độ máy và độ "nóng" của
// dev server. Cùng một lệnh, cùng một commit, máy nguội và máy nóng cho hai kết quả khác
// nhau — nên phải chờ theo TRẠNG THÁI (`waitForStableDom`).
//
// Test này CỐ Ý chỉ kiểm đúng một điều: hai file cổng không quay lại lối chờ cứng trước khi
// quét. Không kiểm nội dung test, không kiểm danh sách trang — ép những thứ đó sẽ biến test
// thành vật cản mỗi lần thêm trang mới.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const GATE_FILES = ['a11y.spec.ts', 'a11y-aaa.spec.ts'] as const

function readGate(name: string): string {
  return readFileSync(join(process.cwd(), 'e2e', name), 'utf-8')
}

describe('cổng a11y phải chờ theo trạng thái, không theo thời gian', () => {
  for (const name of GATE_FILES) {
    it(`${name} dùng waitForStableDom trước khi quét`, () => {
      expect(readGate(name)).toContain('waitForStableDom(page)')
    })

    it(`${name} không chờ cứng ≥500ms (dấu hiệu quay lại lối cũ)`, () => {
      // Chờ cứng NGẮN (vd 100ms sau khi tắt animation) thì chấp nhận được — nó không thay
      // thế việc chờ render. Chỉ chặn các mốc dài, vốn luôn là "đoán xem trang xong chưa".
      const longWaits = [...readGate(name).matchAll(/waitForTimeout\((\d+)\)/g)]
        .map((m) => Number(m[1]))
        .filter((ms) => ms >= 500)
      expect(
        longWaits,
        `còn ${longWaits.length} chỗ chờ cứng ≥500ms trong ${name} — dùng waitForStableDom thay thế`,
      ).toEqual([])
    })
  }
})

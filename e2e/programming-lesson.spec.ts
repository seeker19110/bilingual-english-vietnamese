import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng CHỨC NĂNG bài học 8 bước (PR-L3) — đi trọn luồng 1 bài end-to-end trên bài mẫu
// P1-U4 "tiền điện bậc thang": Predict chọn đáp án → Parsons xếp đúng thứ tự → Make dùng
// code mẫu (phao) và chấm 5 test-case bằng Pyodide thật (tự host, chạy offline).

const PARSONS_ORDER = [
  'so_kwh = int(input("Số điện tháng này? "))',
  'if so_kwh < 100:',
  'print("Dùng tiết kiệm")',
  'elif so_kwh < 300:',
  'print("Bình thường")',
  'else:',
  'print("Dùng nhiều")',
]

test('luồng 1 bài học end-to-end: predict → parsons → make đạt hết test', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/bai-hoc/p1-u4-l1', { waitUntil: 'domcontentloaded' })

  // ①② Khái niệm hiện móc thực tế
  await expect(page.getByText(/hoá đơn tiền điện/i).first()).toBeVisible()

  // ④ Predict: chọn đáp án đúng "Khá" → hiện giải thích
  await page.getByRole('button', { name: 'Dự đoán' }).click()
  await page.getByRole('button', { name: 'Khá', exact: true }).click()
  await expect(page.getByText('Chính xác! 🎉')).toBeVisible()

  // ⑤ Parsons: bấm các dòng theo đúng thứ tự rồi kiểm tra
  await page.getByRole('button', { name: 'Xếp code' }).click()
  for (const line of PARSONS_ORDER) {
    // Kho nằm SAU khung "Bài của bạn" — dòng còn trong kho là nút cuối trùng tên.
    await page.getByRole('button', { name: line }).last().click()
  }
  await page.getByRole('button', { name: 'Kiểm tra thứ tự' }).click()
  await expect(page.getByText('Đúng thứ tự!')).toBeVisible()

  // ⑥ Make: dùng phao (code mẫu) rồi chấm — 5 test-case chạy Pyodide thật
  await page.getByRole('button', { name: 'Tự viết' }).click()
  await page.getByRole('button', { name: 'Xem code mẫu' }).click()
  await page.getByRole('button', { name: 'Chấm bài' }).click()
  await expect(page.getByText('Đạt toàn bộ test!')).toBeVisible({ timeout: 120_000 })

  // ⑦ Về nhà: xác nhận trạng thái hoàn thành
  await page.getByRole('button', { name: 'Về nhà' }).click()
  await expect(page.getByText('Bài học đã hoàn thành')).toBeVisible()
})

test('parsons xếp sai báo chưa đúng; make chạy code khởi đầu thì có ca rớt', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/bai-hoc/p1-u4-l1', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Xếp code' }).click()
  // Xếp sai chủ đích: bấm 2 dòng cuối trước
  await page.getByRole('button', { name: PARSONS_ORDER[6]! }).last().click()
  await page.getByRole('button', { name: PARSONS_ORDER[0]! }).last().click()
  await page.getByRole('button', { name: 'Kiểm tra thứ tự' }).click()
  await expect(page.getByText('Chưa đúng thứ tự')).toBeVisible()

  // Make với code khởi đầu (chưa tính tiền) → phải có ca rớt hiện rõ
  await page.getByRole('button', { name: 'Tự viết' }).click()
  await page.getByRole('button', { name: 'Chấm bài' }).click()
  await expect(page.getByText(/Dùng 30 kWh/).first()).toBeVisible({ timeout: 120_000 })
  await expect(page.getByText('Đạt toàn bộ test!')).not.toBeVisible()
})

// Bài P1-U9 dạy random.seed() để kết quả TẤT ĐỊNH. Cổng nội dung (lessonsPython.test.ts)
// chấm bằng python3 của runner; học viên lại chạy CPython bản WASM (Pyodide). Nếu hai bản
// sinh dãy số khác nhau thì bài sẽ "xanh ở CI, rớt ở người học" — test này chạy chính code
// mẫu của bài TRONG TRÌNH DUYỆT để chốt hai môi trường khớp nhau.
test('bài số ngẫu nhiên: code mẫu đạt hết test-case trong Pyodide (khớp python3)', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/bai-hoc/p1-u9-l1', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Tự viết' }).click()
  await page.getByRole('button', { name: 'Xem code mẫu' }).click()
  await page.getByRole('button', { name: 'Chấm bài' }).click()
  await expect(page.getByText('Đạt toàn bộ test!')).toBeVisible({ timeout: 120_000 })
})

// P2 dùng hai thứ mà python3 của runner làm được nhưng Pyodide THÌ CHƯA CHẮC: ghi/đọc FILE
// (U6 — Pyodide dùng hệ thống file trong bộ nhớ) và thư viện datetime/math (U8). Xanh ở cổng
// python3 mà rớt trong trình duyệt thì học viên là người lãnh đủ, nên chạy thật hai bài này
// trong Pyodide y như học viên gặp.
for (const lessonId of ['p2-u6-l1', 'p2-u8-l1']) {
  test(`bài ${lessonId}: code mẫu đạt hết test-case trong Pyodide (khớp python3)`, async ({
    page,
  }) => {
    test.setTimeout(180_000)
    await mockLogin(page, 'vi', 'dark-blue')
    await page.goto(`/lap-trinh/bai-hoc/${lessonId}`, { waitUntil: 'domcontentloaded' })

    await page.getByRole('button', { name: 'Tự viết' }).click()
    await page.getByRole('button', { name: 'Xem code mẫu' }).click()
    await page.getByRole('button', { name: 'Chấm bài' }).click()
    await expect(page.getByText('Đạt toàn bộ test!')).toBeVisible({ timeout: 120_000 })
  })
}

// ⑥b AI đồng hành (PR-L5) — chặn `/api/programming/feedback` để KHÔNG gọi model thật trong CI.
// Thứ cần chốt ở đây là hợp đồng UI: bậc gợi ý mở dần theo bậc SERVER trả về, nút "nhờ xem
// code" chỉ xuất hiện sau khi đạt bài, và lời nhắn hết lượt hiện nguyên văn cho học viên.
test('gợi ý Socratic mở dần theo bậc server trả về; hết lượt hiện đúng lời nhắn', async ({
  page,
}) => {
  await mockLogin(page, 'vi', 'dark-blue')

  let call = 0
  await page.route('**/api/programming/feedback', async (route) => {
    call += 1
    if (call === 1) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          text: 'Đề bài yêu cầu in ra gì nhỉ?',
          kind: 'socratic_hint',
          hintLevel: 1,
        }),
      })
      return
    }
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Hết lượt rồi. Học thêm bài để có thêm lượt nhé!' }),
    })
  })

  await page.goto('/lap-trinh/bai-hoc/p1-u4-l1', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Tự viết' }).click()

  // Chưa đạt bài → KHÔNG được mời nhờ AI xem lại code (đó là đường vòng lấy lời giải).
  await expect(page.getByRole('button', { name: 'Nhờ AI xem lại code' })).toHaveCount(0)

  const hint = page.getByRole('button', { name: /Gợi ý bậc/ })
  await expect(hint).toContainText('bậc 1/3')
  await hint.click()
  await expect(page.getByText('Đề bài yêu cầu in ra gì nhỉ?')).toBeVisible()
  await expect(hint).toContainText('bậc 2/3')

  // Lượt sau hết lượt → hiện NGUYÊN VĂN lời nhắn của server, không nuốt thành lỗi chung.
  await hint.click()
  await expect(page.getByText('Hết lượt rồi. Học thêm bài để có thêm lượt nhé!')).toBeVisible()
})

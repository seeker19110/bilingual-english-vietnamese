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

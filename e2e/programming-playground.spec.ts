import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng CHỨC NĂNG của sandbox Python (PR-L2): Pyodide tự host (copy vào /pyodide/ lúc
// build, viteStaticCopy phục vụ cả ở dev) nên test chạy ĐƯỢC OFFLINE trong CI — không
// phụ thuộc CDN. Lần nạp môi trường đầu ~13MB từ localhost + khởi tạo WASM có thể chậm
// trên runner CI → nới timeout riêng cho file này.

test.describe('sandbox Python môn Lập trình', () => {
  test('chạy bài mẫu 1 in ra lời chào', async ({ page }) => {
    test.setTimeout(120_000)
    await mockLogin(page, 'vi', 'dark-blue')
    await page.goto('/lap-trinh/chay-thu', { waitUntil: 'domcontentloaded' })

    await page.getByRole('button', { name: 'Chạy' }).click()
    // Chờ Pyodide nạp + chạy xong — output của bài mẫu 1 hiện trong khung Kết quả.
    await expect(page.getByText('Đây là chương trình Python đầu tiên')).toBeVisible({
      timeout: 90_000,
    })
  })

  test('bài có input() dùng dữ liệu điền sẵn và tính đúng', async ({ page }) => {
    test.setTimeout(120_000)
    await mockLogin(page, 'vi', 'dark-blue')
    await page.goto('/lap-trinh/chay-thu', { waitUntil: 'domcontentloaded' })

    // Bài 3: chia tiền ăn nhóm — 480000đ / 4 người = 120,000 đồng.
    await page.getByLabel('Bài mẫu bậc P1').selectOption({ index: 2 })
    await page.getByRole('button', { name: 'Chạy' }).click()
    await expect(page.getByText(/Mỗi người trả: 120,000 đồng/)).toBeVisible({ timeout: 90_000 })
  })

  test('code lỗi hiện thông báo lỗi đọc được (không màn hình trắng)', async ({ page }) => {
    test.setTimeout(120_000)
    await mockLogin(page, 'vi', 'dark-blue')
    await page.goto('/lap-trinh/chay-thu', { waitUntil: 'domcontentloaded' })

    // Bài 8 "Bác sĩ code" cố tình sai tên biến → phải hiện NameError cho học viên đọc.
    await page.getByLabel('Bài mẫu bậc P1').selectOption({ index: 7 })
    await page.getByRole('button', { name: 'Chạy' }).click()
    await expect(page.getByText(/NameError/)).toBeVisible({ timeout: 90_000 })
  })
})

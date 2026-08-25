import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng CHỨC NĂNG dự án trục chặng P1 (PR-L3b): workspace + milestone check chấm hành vi
// bằng Pyodide thật (tự host, offline). Bước sau khoá tới khi bước trước đạt hết test.

test('bước 1 dự án: dùng code mẫu → đạt hết check → mở bước 2', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/du-an', { waitUntil: 'domcontentloaded' })

  // Bước 2 đang KHOÁ khi chưa xong bước 1
  await expect(page.getByRole('button', { name: 'Bước 2', exact: true })).toBeDisabled()

  // Dùng phao của bước 1 rồi chấm
  await page.getByRole('button', { name: 'Xem code mẫu bước này' }).click()
  await page.getByRole('button', { name: 'Kiểm tra bước' }).click()
  await expect(page.getByText('Chào đúng tên chủ quán nhập vào')).toBeVisible({ timeout: 120_000 })

  // Đạt hết → banner + nút sang bước 2; nút "Bước 2" trên thanh cũng mở khoá
  await expect(page.getByText(/Đạt hết test của bước 1/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bước 2', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Sang bước 2' }).click()
  await expect(page.getByText('Bước 2: Chọn món + số lượng → tính tiền')).toBeVisible()
})

test('code khởi đầu (chưa làm gì) chấm bước 1 → có ca rớt, bước 2 vẫn khoá', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/du-an', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Kiểm tra bước' }).click()
  // Starter code không in gì → ca 1 rớt hiện rõ
  await expect(page.getByText('Chào đúng tên chủ quán nhập vào')).toBeVisible({ timeout: 120_000 })
  await expect(page.getByText('(không in gì)').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bước 2', exact: true })).toBeDisabled()
})

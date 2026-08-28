import { test, expect } from '@playwright/test'

// Smoke tối thiểu: app khởi động, route bảo vệ đẩy về /login, form hiện ra.
test.describe('Khởi động & trang đăng nhập', () => {
  test('truy cập / khi chưa đăng nhập → chuyển về /login và hiện form', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Đồng Hành Cùng Bạn' })).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
  })

  test('ui_lang=en → trang đăng nhập hiển thị tiếng Anh', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ui_lang', 'en'))
    await page.goto('/login')
    // Tên thương hiệu KHÔNG dịch — cả hai ngôn ngữ đều là "Đồng Hành Cùng Bạn". Thứ đổi theo
    // ngôn ngữ là dòng tagline và nhãn form, nên chốt bằng chúng (đổi 2026-08-28 khi gỡ định vị
    // "Gia sư tiếng Anh AI" ở mức nền tảng).
    await expect(page.getByRole('heading', { name: 'Đồng Hành Cùng Bạn' })).toBeVisible()
    await expect(page.getByText('Learning · Career · Work · Startup · Life')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  })

  test('nút VI/EN đổi ngôn ngữ giao diện ngay tại trang đăng nhập', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Đồng Hành Cùng Bạn' })).toBeVisible()
    await expect(
      page.getByText('Học tập · Sự nghiệp · Công việc · Khởi nghiệp · Đời sống'),
    ).toBeVisible()
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.getByText('Learning · Career · Work · Startup · Life')).toBeVisible()
    await page.getByRole('button', { name: 'VI', exact: true }).click()
    await expect(
      page.getByText('Học tập · Sự nghiệp · Công việc · Khởi nghiệp · Đời sống'),
    ).toBeVisible()
  })
})

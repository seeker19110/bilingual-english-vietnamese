import { test, expect } from '@playwright/test'

// Smoke tối thiểu: app khởi động, route bảo vệ đẩy về /login, form hiện ra.
test.describe('Khởi động & trang đăng nhập', () => {
  test('truy cập / khi chưa đăng nhập → chuyển về /login và hiện form', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Gia sư tiếng Anh AI' })).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'

// Smoke tối thiểu: app khởi động, route bảo vệ đẩy về /login, form hiện ra.
test.describe('Khởi động & trang đăng nhập', () => {
  test('truy cập / khi chưa đăng nhập → chuyển về /login và hiện form', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Gia sư tiếng Anh AI' })).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
  })

  test('ui_lang=en → trang đăng nhập hiển thị tiếng Anh', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ui_lang', 'en'))
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'AI Language Tutor' })).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  })

  test('nút VI/EN đổi ngôn ngữ giao diện ngay tại trang đăng nhập', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Gia sư tiếng Anh AI' })).toBeVisible()
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'AI Language Tutor' })).toBeVisible()
    await page.getByRole('button', { name: 'VI', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Gia sư tiếng Anh AI' })).toBeVisible()
  })
})

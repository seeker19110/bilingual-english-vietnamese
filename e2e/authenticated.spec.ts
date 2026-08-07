import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Trang chủ chào theo i18n: vi "Xin chào bạn" · en "Hi there" (không kèm tên, ② rút gọn 2026-08-07).
// Chứng minh app chạy song ngữ (UI lang đọc từ localStorage 'ui_lang').
test.describe('Trang chủ sau đăng nhập (song ngữ)', () => {
  test('tiếng Việt: vào / không bị đẩy về login + lời chào tiếng Việt', async ({ page }) => {
    await mockLogin(page, 'vi')
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('banner').getByText(/Xin chào/)).toBeVisible()
  })

  test('tiếng Anh: lời chào đổi sang tiếng Anh khi ui_lang=en', async ({ page }) => {
    await mockLogin(page, 'en')
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByRole('banner').getByText(/Hi there/)).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Canh gác lỗi TRANG TRẮNG: trước đây Login.tsx gọi nav('/') ngay trong thân render rồi
// `return null` — React bỏ qua side effect đó nên URL đứng nguyên ở /login và người dùng
// đã đăng nhập nhìn thấy màn hình trắng. Test này bắt đúng ca đó.
test('người đã đăng nhập vào /login thì được đẩy về trang chủ, không thấy trang trắng', async ({
  page,
}) => {
  await mockLogin(page)
  await page.goto('/login')
  await expect(page).toHaveURL(/\/$/)
  // Chờ trang chủ (lazy chunk) vẽ xong rồi mới đo — nếu vẫn trắng thì đây là lỗi thật.
  await expect(page.locator('main, nav').first()).toBeVisible()
  await expect
    .poll(async () => (await page.locator('body').innerText()).trim().length)
    .toBeGreaterThan(40)
})

test('người chưa đăng nhập vẫn thấy form đăng nhập ở /login', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('input[type="email"]')).toBeVisible()
})

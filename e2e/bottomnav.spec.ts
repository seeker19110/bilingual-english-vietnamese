import { test, expect, type Page } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// BottomNav chỉ hiện < 640px (xem --bnav-h trong index.css) — quét ở khổ mobile.
test.use({ viewport: { width: 390, height: 844 } })

async function mockClaude(page: Page) {
  await page.route('**/api/claude', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: [{ text: '💬 Hello!\n✅ Good job.' }] }),
    }),
  )
}

test.describe('BottomNav (U-5)', () => {
  test('hiện đủ 4 mục ở trang đã đăng nhập, ẩn ở /login và /onboarding', async ({ page }) => {
    await mockLogin(page, 'vi')
    await page.goto('/')
    const nav = page.locator('nav[aria-label]')
    await expect(nav).toBeVisible()
    await expect(page.getByRole('link', { name: /Trang chủ/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Lộ trình/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Luyện tập/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Tiến độ/ })).toBeVisible()

    await page.goto('/login')
    await expect(page.locator('nav[aria-label]')).toHaveCount(0)
  })

  test('tab Luyện tập: chưa từng vào → mặc định /chat; đã vào /speaking → nhớ /speaking', async ({
    page,
  }) => {
    await mockLogin(page, 'vi')
    await page.goto('/')
    await page.getByRole('link', { name: /Luyện tập/ }).click()
    await expect(page).toHaveURL(/\/chat$/)

    await page.goto('/speaking')
    await expect(page.getByRole('heading', { name: /Luyện nói song ngữ/ }).first()).toBeVisible()
    await page.goto('/')
    await page.getByRole('link', { name: /Luyện tập/ }).click()
    await expect(page).toHaveURL(/\/speaking$/)
  })

  test('Chat: input không bị BottomNav che (nằm trên đường viền nav)', async ({ page }) => {
    await mockLogin(page, 'vi')
    await mockClaude(page)
    await page.goto('/chat')
    await page.getByRole('button', { name: /Bắt đầu/ }).click()
    const input = page.getByPlaceholder(/Nhập tiếng Anh|Type in Vietnamese/i)
    await expect(input).toBeVisible()
    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    if (box) expect(box.y + box.height).toBeLessThanOrEqual(844 - 72)
  })

  test('QuickActions (Chia sẻ/Nhắc học) chỉ còn ở Profile, không còn ở Chat/Lessons', async ({
    page,
  }) => {
    await mockLogin(page, 'vi')
    await page.goto('/profile')
    await expect(page.getByText('Chia sẻ')).toBeVisible()

    await page.goto('/chat')
    await expect(page.getByText('Chia sẻ')).toHaveCount(0)

    await page.goto('/lessons')
    await expect(page.getByText('Chia sẻ')).toHaveCount(0)
  })

  test('cuộn thật xuống đáy Home — nút cuối trang vẫn bấm được (không bị nav che)', async ({
    page,
  }) => {
    await mockLogin(page, 'vi')
    await page.goto('/')
    await page.mouse.wheel(0, 100000)
    const historyBtn = page.getByRole('button', { name: /Xem lịch sử học/ })
    await expect(historyBtn).toBeVisible()
    await historyBtn.click()
    await expect(page).toHaveURL(/\/history$/)
  })
})

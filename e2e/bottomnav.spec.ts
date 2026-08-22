import { test, expect, type Page } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// BottomNav hiện ở mọi kích thước màn hình (xem --bnav-h trong index.css) — quét ở khổ mobile.
test.use({ viewport: { width: 390, height: 844 } })

async function mockClaude(page: Page) {
  await page.route('**/api/agent', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: [{ text: '💬 Hello!\n✅ Good job.' }] }),
    }),
  )
}

test.describe('BottomNav (U-5)', () => {
  test('hiện đủ 5 mục ở trang đã đăng nhập, ẩn ở /login và /onboarding', async ({ page }) => {
    await mockLogin(page, 'vi')
    await page.goto('/')
    const nav = page.locator('nav[aria-label]')
    await expect(nav).toBeVisible()
    await expect(page.getByRole('link', { name: /Trang chủ/ })).toBeVisible()
    // Tab 2 đổi từ "Lộ trình" sang "Học Tiếng Anh" (feat(navigation): restructure platform hub
    // and dedicated english studio routing, commit fd188ef) — xem BottomNav.tsx.
    await expect(page.getByRole('link', { name: /Học Tiếng Anh/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Luyện tập/ })).toBeVisible()
    // Tab 3 đổi từ "Tiến độ" sang "Đồng Hành" (AI companion, dẫn tới /dong-hanh) — xem
    // BottomNav.tsx (nút tâm điểm Orb Glow, Platform V7.0). Trang /tien-do vẫn tồn tại (vào qua
    // Cá nhân/Dashboard), chỉ không còn là tab riêng ở BottomNav.
    await expect(page.getByRole('link', { name: /Đồng Hành/ })).toBeVisible()
    // Tab 5 đổi từ "Cài đặt" sang "Cá nhân" (dẫn tới /profile) — xem PROGRESS.md mục "V2 UI —
    // Multi-Subject Learning..." (BottomNav.tsx: label T.navProfile, i18n/index.ts).
    await expect(page.getByRole('link', { name: /Cá nhân/ })).toBeVisible()

    await page.goto('/login')
    await expect(page.locator('nav[aria-label]')).toHaveCount(0)
  })

  test('tab Luyện tập: luôn vào trang hub /phong-luyen-tap, kể cả khi vừa ở /luyen-noi', async ({
    page,
  }) => {
    await mockLogin(page, 'vi')
    await page.goto('/')
    await page.getByRole('link', { name: /Luyện tập/ }).click()
    await expect(page).toHaveURL(/\/phong-luyen-tap$/)

    await page.goto('/luyen-noi')
    await expect(page.getByRole('heading', { name: /Luyện nói song ngữ/ }).first()).toBeVisible()
    await page.goto('/')
    await page.getByRole('link', { name: /Luyện tập/ }).click()
    await expect(page).toHaveURL(/\/phong-luyen-tap$/)
  })

  test('Chat: input không bị BottomNav che (nằm trên đường viền nav)', async ({ page }) => {
    await mockLogin(page, 'vi')
    await mockClaude(page)
    await page.goto('/tro-truyen')
    await page.getByRole('button', { name: /Bắt đầu/ }).click()
    const input = page.getByPlaceholder(/Nhập tiếng Anh|Type in Vietnamese/i)
    await expect(input).toBeVisible()
    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    if (box) expect(box.y + box.height).toBeLessThanOrEqual(844 - 72)
  })

  test('QuickActions (Chia sẻ/Nhắc học) chỉ còn ở Tiến độ, không còn ở Chat/Lessons', async ({
    page,
  }) => {
    // QuickActions dời từ /cai-dat sang /tien-do (Dashboard.tsx) — xem PROGRESS.md mục "V2 UI —
    // Multi-Subject Learning..." ("Loại bỏ hoàn toàn các cài đặt học tập vụn vặt khỏi trang cá
    // nhân"); apps/english/src/pages/EnglishSettings.tsx (/cai-dat) không còn import QuickActions.
    await mockLogin(page, 'vi')
    await page.goto('/tien-do')
    await expect(page.getByText('Chia sẻ')).toBeVisible()

    await page.goto('/tro-truyen')
    await expect(page.getByText('Chia sẻ')).toHaveCount(0)

    await page.goto('/bai-hoc')
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
    await expect(page).toHaveURL(/\/lich-su-hoc$/)
  })
})

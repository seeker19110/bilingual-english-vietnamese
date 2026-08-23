// e2e/a11y-intake.spec.ts — Cổng a11y cho luồng NGƯỜI MỚI (/bat-dau, 5 câu + màn gợi ý).
//
// Đây là màn hình ĐẦU TIÊN mọi người dùng mới nhìn thấy, nên nó phải sạch ở cả 5 theme. Cũng như
// `a11y-2fa.spec.ts`: `e2e/a11y.spec.ts` không quét route này.

import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, type ThemeName } from './helpers/auth'
import { freezeAnimations } from './helpers/axe'

const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']

async function scan(page: Page) {
  await freezeAnimations(page)
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['meta-viewport'])
    .analyze()
  return violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} phần tử)`)
}

// Giả lập API: chưa trả lời (để trang không chuyển tiếp sang /onboarding), và trả gợi ý cố định
// khi lưu — test a11y không nên phụ thuộc vào bộ máy chọn việc.
async function mockApi(page: Page) {
  await page.route('**/api/intake', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { done: false, chosenTaskId: null, result: null } })
    }
    return route.fulfill({
      json: {
        ok: true,
        result: {
          primary: {
            id: 'tien-ghi-chi-tieu',
            title: 'Ghi lại mọi khoản chi trong 7 ngày tới — chỉ ghi, chưa cần cắt giảm gì',
            why: 'Bạn có nhắc tới "vẽ tranh" — mình nghĩ bắt đầu từ đó là hợp nhất.',
          },
          alternatives: [
            { id: 'suc-khoe-gio-ngu', title: 'Đặt một giờ đi ngủ cố định', why: 'Một hướng khác.' },
            { id: 'kham-pha-mot-cau-hoi', title: 'Mỗi ngày một thắc mắc', why: 'Một hướng khác.' },
          ],
        },
      },
    })
  })
}

for (const theme of THEMES) {
  test(`a11y: /bat-dau câu 1 (nhóm tuổi) theme=${theme}`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page)
    await page.goto('/bat-dau', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Bạn bao nhiêu tuổi rồi?')).toBeVisible()
    expect(await scan(page)).toEqual([])
  })

  test(`a11y: /bat-dau câu tự do (ô nhập) theme=${theme}`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page)
    await page.goto('/bat-dau', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /10–15/ }).click()
    await page.getByRole('button', { name: 'Học hành, thi cử' }).click()
    await expect(page.getByLabel(/thêm một giờ/)).toBeVisible()
    expect(await scan(page)).toEqual([])
  })

  test(`a11y: /bat-dau màn GỢI Ý theme=${theme}`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page)
    await page.goto('/bat-dau', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /10–15/ }).click()
    await page.getByRole('button', { name: 'Học hành, thi cử' }).click()
    await page.getByRole('button', { name: 'Bỏ qua' }).click()
    await page.getByRole('button', { name: 'Bỏ qua' }).click()
    await page.getByRole('button', { name: 'Tuần này' }).click()
    await expect(page.getByText('Mình gợi ý bắt đầu từ đây nhé?')).toBeVisible()
    expect(await scan(page)).toEqual([])
  })
}

// ── Bất biến T1: không con số năng lực nào rò lên giao diện ────────────────────────────────
test('màn gợi ý KHÔNG hiện điểm số, thang bậc hay so sánh', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await mockApi(page)
  await page.goto('/bat-dau', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Từ 23/ }).click()
  await page.getByRole('button', { name: 'Công việc' }).click()
  await page.getByRole('button', { name: 'Bỏ qua' }).click()
  await page.getByRole('button', { name: 'Bỏ qua' }).click()
  await page.getByRole('button', { name: 'Tuần này' }).click()
  await expect(page.getByText('Mình gợi ý bắt đầu từ đây nhé?')).toBeVisible()

  const text = (await page.locator('main').innerText()).toLowerCase()
  for (const banned of ['điểm số', '/100', 'xếp hạng', 'trình độ của bạn', 'so với người']) {
    expect(text).not.toContain(banned)
  }
  expect(text).not.toMatch(/\d+\s*%/)
})

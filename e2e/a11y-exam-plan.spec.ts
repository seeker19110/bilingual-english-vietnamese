// e2e/a11y-exam-plan.spec.ts — Cổng a11y cho trang "Ôn thi" (/on-thi).
//
// Quét CẢ HAI màn hình của trang, vì chúng dùng bảng màu khác hẳn nhau:
//   1. Chưa có kế hoạch → biểu mẫu (input ngày, thanh trượt, nút chọn ngày nghỉ).
//   2. Đã có kế hoạch → đồng hồ đếm ngược + khối cảnh báo "không kịp" (nền hổ phách).
// Màn hình 2 cần giả lập API vì E2E chạy bằng Vite dev, không có backend.

import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, USER_ID, type ThemeName } from './helpers/auth'
import { freezeAnimations } from './helpers/axe'

const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']
const AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Ngày thi rất gần + phạm vi lớn ⇒ ép ra trạng thái "không kịp" (khối cảnh báo hổ phách), tức là
// quét luôn tổ hợp màu khó nhất chứ không chỉ trạng thái đẹp.
const NEAR_PLAN = {
  id: '22222222-2222-4222-8222-222222222222',
  userId: USER_ID,
  examKind: 'vao10-english',
  examDate: '2099-01-05',
  targetLabel: '8 điểm',
  scopeItems: 100000,
  dailyCapItems: 5,
  restDays: [],
  status: 'active',
  createdAt: '2026-08-26T00:00:00.000Z',
  schemaVersion: 1,
}

async function mockApi(page: Page, plan: unknown) {
  await page.route('**/api/exam-plan*', (route) => route.fulfill({ json: { plan } }))
}

async function scan(page: Page, tags: string[]) {
  await freezeAnimations(page)
  const { violations } = await new AxeBuilder({ page })
    .include('main')
    .withTags(tags)
    .disableRules(['meta-viewport'])
    .analyze()
  return violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} phần tử)`)
}

for (const theme of THEMES) {
  test(`a11y: /on-thi — biểu mẫu tạo kế hoạch, theme=${theme} — 0 vi phạm A/AA`, async ({
    page,
  }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page, null)
    await page.goto('/on-thi', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Bắt đầu đếm ngược' })).toBeVisible({
      timeout: 15_000,
    })
    expect(await scan(page, AA_TAGS)).toEqual([])
  })

  test(`a11y: /on-thi — đã có kế hoạch, theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page, NEAR_PLAN)
    await page.goto('/on-thi', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible({ timeout: 15_000 })
    expect(await scan(page, AA_TAGS)).toEqual([])
  })
}

test('a11y AAA: chữ nội dung trang Ôn thi đạt tương phản ≥ 7:1', async ({ page }) => {
  await mockLogin(page, 'vi')
  await mockApi(page, NEAR_PLAN)
  await page.goto('/on-thi', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Hôm nay' })).toBeVisible({ timeout: 15_000 })
  expect(await scan(page, ['wcag2aaa'])).toEqual([])
})

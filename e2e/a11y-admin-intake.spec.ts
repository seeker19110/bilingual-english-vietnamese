// e2e/a11y-admin-intake.spec.ts — Panel "Luồng người mới" trong /admin-s.
//
// Kiểm hai thứ trong cùng một chỗ vì chúng chỉ lộ ra khi chạy thật:
//   1. a11y ở cả 5 theme (trang /admin-s không nằm trong danh sách `e2e/a11y.spec.ts` quét).
//   2. Số liệu hiện ra ĐÚNG — nhất là chỗ "chưa có dữ liệu" phải là dấu gạch, không phải 0%.

import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, USER_ID, type ThemeName } from './helpers/auth'
import { freezeAnimations } from './helpers/axe'

const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']

/** mockLogin không cấp quyền admin — route này đăng ký SAU nên được Playwright ưu tiên. */
async function loginAsAdmin(page: Page, theme: ThemeName) {
  await mockLogin(page, 'vi', theme)
  await page.route('**/api/auth?action=me', (route) =>
    route.fulfill({
      json: {
        id: USER_ID,
        email: 'admin@example.com',
        name: 'Admin',
        plan: 'free',
        onboarded: true,
        isAdmin: true,
        userLevel: 'beginner',
        goal: 'daily',
        dailyMinutes: 10,
        ageGroup: 'nguoi_lon',
      },
    }),
  )
}

const FULL_STATS = {
  days: 30,
  counts: {
    answered: 100,
    tookSuggested: 62,
    switched: 25,
    skipped: 13,
    done: 40,
    doneWithin7Days: 31,
    topTasks: [{ taskId: 'tien-ghi-chi-tieu', chosen: 30, done: 12 }],
  },
  rates: {
    tookSuggested: 62,
    switched: 25,
    skipped: 13,
    doneAmongChosen: 46,
    doneWithin7DaysAmongChosen: 35.6,
  },
  note: 'Việc "đã làm xong" là người dùng tự đánh dấu, không đo được khách quan.',
}

const EMPTY_STATS = {
  days: 30,
  counts: {
    answered: 0,
    tookSuggested: 0,
    switched: 0,
    skipped: 0,
    done: 0,
    doneWithin7Days: 0,
    topTasks: [],
  },
  rates: {
    tookSuggested: null,
    switched: null,
    skipped: null,
    doneAmongChosen: null,
    doneWithin7DaysAmongChosen: null,
  },
  note: 'Việc "đã làm xong" là người dùng tự đánh dấu, không đo được khách quan.',
}

async function openAnalyticsTab(page: Page, stats: unknown) {
  await page.route('**/api/admin-intake-stats*', (route) => route.fulfill({ json: stats }))
  await page.goto('/admin-s', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Analytics/ }).click()
}

for (const theme of THEMES) {
  test(`a11y: panel luồng người mới, theme=${theme}`, async ({ page }) => {
    await loginAsAdmin(page, theme)
    await openAnalyticsTab(page, FULL_STATS)
    await expect(page.getByText('Luồng người mới — gợi ý có trúng không')).toBeVisible()
    await freezeAnimations(page)

    // Giới hạn phạm vi vào ĐÚNG panel này. Trang /admin-s chưa từng được gác a11y và các panel
    // khác có lỗi tương phản sẵn ở theme sáng (xem PROGRESS.md) — quét cả trang sẽ biến spec này
    // thành cổng cho toàn bộ trang admin, việc đó phải là PR riêng.
    const { violations } = await new AxeBuilder({ page })
      .include('#admin-intake-panel')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .disableRules(['meta-viewport'])
      .analyze()
    expect(violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length})`)).toEqual([])
  })
}

test('hiện đúng số và tách rõ hai câu hỏi', async ({ page }) => {
  await loginAsAdmin(page, 'dark-blue')
  await openAnalyticsTab(page, FULL_STATS)

  await expect(page.getByText('1. Suy luận có đúng không?')).toBeVisible()
  await expect(page.getByText('2. Có tác dụng thật không?')).toBeVisible()
  await expect(page.getByText('62%')).toBeVisible()
  await expect(page.getByText('35.6%')).toBeVisible()
  // Mẫu số của khối 2 là những người ĐÃ CHỌN việc (62 + 25), không phải toàn bộ 100 người trả lời.
  await expect(page.getByText('trong 87 người đã chọn việc')).toBeVisible()
  // Số liệu tự khai phải được nói rõ ngay trên giao diện.
  await expect(page.getByText(/tự đánh dấu, không đo được khách quan/)).toBeVisible()
})

test('CHƯA CÓ DỮ LIỆU hiện dấu gạch, KHÔNG hiện 0%', async ({ page }) => {
  await loginAsAdmin(page, 'dark-blue')
  await openAnalyticsTab(page, EMPTY_STATS)

  // Thấy 0% sẽ khiến người đọc kết luận "gợi ý trượt hoàn toàn", trong khi sự thật là chưa ai đi
  // qua luồng này. Panel phải nói thẳng điều đó.
  await expect(page.getByText(/Chưa ai đi qua luồng người mới/)).toBeVisible()
  await expect(page.getByText('0%')).toHaveCount(0)
})

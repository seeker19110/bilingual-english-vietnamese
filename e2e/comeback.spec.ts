import { test, expect, type Page } from '@playwright/test'
import { mockLogin, USER_ID } from './helpers/auth'

// Luồng "quay lại sau khi bỏ bẵng" (② M4, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md)
// + gợi ý "Luyện nói với từ vừa học" ở Home.

// Ngày theo giờ VN (khớp src/lib/date.ts vnDateStr) — tính ở NODE trước khi trang tải.
function vnDateOffset(offsetDays: number): string {
  const ms = Date.now() - offsetDays * 86400000 + 7 * 3600000
  return new Date(ms).toISOString().slice(0, 10)
}

// Seed 1 ngày có hoạt động (khớp key et_usage_<uid>_<date> — src/lib/storage.ts).
async function seedActivity(page: Page, offsetDays: number) {
  const date = vnDateOffset(offsetDays)
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: `et_usage_${USER_ID}_${date}`,
    value: { date, chatCount: 0, writingCount: 0, speakingCount: 0, learnCount: 1 },
  })
}

// Seed vài từ "đã thuộc" (khớp key et_learned_<uid> — src/lib/vocab.ts).
async function seedLearnedWords(page: Page, words: string[]) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: `et_learned_${USER_ID}`,
    value: words,
  })
}

test.describe('Luồng quay lại sau khi bỏ bẵng (② M4)', () => {
  test('vắng 5 ngày → hiện banner chào mừng + 2 CTA phiên rút gọn', async ({ page }) => {
    await seedActivity(page, 5)
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Mừng bạn quay lại/)).toBeVisible()
    await expect(page.getByText(/Đã 5 ngày rồi/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Học 3 từ mới/ })).toBeVisible()
  })

  test('đã học hôm nay → KHÔNG hiện banner (không phải "đi vắng")', async ({ page }) => {
    await seedActivity(page, 0)
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Mừng bạn quay lại/)).not.toBeVisible()
  })

  test('người dùng mới (chưa từng học) → KHÔNG hiện banner', async ({ page }) => {
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Mừng bạn quay lại/)).not.toBeVisible()
  })

  test('bấm đóng (X) → banner ẩn ngay trong phiên', async ({ page }) => {
    await seedActivity(page, 5)
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Mừng bạn quay lại/)).toBeVisible()
    await page.getByRole('button', { name: /Đóng/ }).click()
    await expect(page.getByText(/Mừng bạn quay lại/)).not.toBeVisible()
  })

  test('bấm "Học 3 từ mới" → điều hướng sang tab Hôm nay với cap=3', async ({ page }) => {
    await seedActivity(page, 5)
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Học 3 từ mới/ }).click()
    await expect(page).toHaveURL(/tab=today&cap=3/)
  })
})

test.describe('Gợi ý "Luyện nói với từ vừa học" ở Home', () => {
  test('đã học vài từ → hiện nút gợi ý, bấm vào điều hướng sang /speaking kèm ?words=', async ({
    page,
  }) => {
    await seedLearnedWords(page, ['apple', 'banana', 'cherry'])
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const cta = page.getByRole('button', { name: /Luyện nói với 3 từ vừa học/ })
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/luyen-noi\?words=/)
  })

  test('chưa học từ nào → không hiện nút gợi ý', async ({ page }) => {
    await mockLogin(page, 'vi')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Luyện nói với/)).not.toBeVisible()
  })
})

import { test, expect, type Page } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng cho trang KHOÁ NGẮN (`/lap-trinh/khoa-hoc/:courseId`, PR 3/4 khoá Git). Bất biến quan
// trọng nhất theo spec (docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md, tiêu chí ④):
// vào thẳng khoá Git khi CHƯA học bậc nào vẫn học được bài đầu ngay.

async function gioLapTiendo(page: Page, lessons: { lessonId: string; status: string }[]) {
  await page.route('**/api/programming/progress', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({
          status: 200,
          body: JSON.stringify({
            lessons: lessons.map((l) => ({
              ...l,
              completedAt: l.status === 'completed' ? 1 : null,
            })),
          }),
        })
      : route.fulfill({ status: 200, body: '{}' }),
  )
}

test('chưa học bậc nào vẫn vào thẳng khoá Git học được ngay', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/git', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Git & GitHub thực hành' })).toBeVisible()
  await expect(page.getByText('vào thẳng học được', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: /Học bài:/ }).first()).toBeVisible()
})

test('mã khoá lạ thì về trang tổng quan môn, không render trang trắng', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/khong-ton-tai', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/lap-trinh$/)
})

test('bấm vào bài trong khoá dẫn đúng bài học (dùng lại bài p3-u10-l1)', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/git', { waitUntil: 'domcontentloaded' })

  await page
    .getByRole('button', { name: /Học bài:/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/lap-trinh\/bai-hoc\/p3-u10-l1(--[a-z0-9-]+)?$/)
})

test('trang môn Lập trình có lối vào khoá ngắn', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Khoá ngắn', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: /Git & GitHub thực hành/ }).click()
  await expect(page).toHaveURL('/lap-trinh/khoa-hoc/git')
})

// ── Khoá Hermes (PR khoá Hermes — docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md) ──
// Cùng bất biến với khoá Git: vào thẳng khi chưa học bậc nào vẫn học được bài đầu ngay.

test('chưa học bậc nào vẫn vào thẳng khoá Hermes học được ngay', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/hermes', { waitUntil: 'domcontentloaded' })

  await expect(
    page.getByRole('heading', { name: 'Hermes Agent — trợ lý AI cho người đi làm' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /Học bài:/ }).first()).toBeVisible()
})

test('bấm vào bài trong khoá Hermes dẫn đúng bài đầu chương C1', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/hermes', { waitUntil: 'domcontentloaded' })

  await page
    .getByRole('button', { name: /Học bài:/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/lap-trinh\/bai-hoc\/hermes-u1-l1(--[a-z0-9-]+)?$/)
})

test('trang môn Lập trình có lối vào khoá Hermes', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /Hermes Agent — trợ lý AI cho người đi làm/ }).click()
  await expect(page).toHaveURL('/lap-trinh/khoa-hoc/hermes')
})

// ── Khoá Vibe Code (docs/specs/2026-08-31-khoa-vibe-code.md) ── Cùng bất biến với khoá
// Git/Hermes: vào thẳng khi chưa học bậc nào vẫn học được bài đầu ngay.

test('chưa học bậc nào vẫn vào thẳng khoá Vibe Code học được ngay', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/vibe', { waitUntil: 'domcontentloaded' })

  await expect(
    page.getByRole('heading', { name: 'Vibe Code — từ số 0 đến chuyên gia' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /Học bài:/ }).first()).toBeVisible()
})

test('bấm vào bài trong khoá Vibe Code dẫn đúng bài đầu chương C1', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/vibe', { waitUntil: 'domcontentloaded' })

  await page
    .getByRole('button', { name: /Học bài:/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/lap-trinh\/bai-hoc\/vibe-u1-l1(--[a-z0-9-]+)?$/)
})

test('trang môn Lập trình có lối vào khoá Vibe Code', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /Vibe Code — từ số 0 đến chuyên gia/ }).click()
  await expect(page).toHaveURL('/lap-trinh/khoa-hoc/vibe')
})

// ── Khoá OpenClaw (PR 2/3 khoá OpenClaw — docs/specs/2026-08-31-khoa-openclaw.md) ──
// Cùng bất biến với khoá Git/Hermes: vào thẳng khi chưa học bậc nào vẫn học được bài đầu ngay.

test('chưa học bậc nào vẫn vào thẳng khoá OpenClaw học được ngay', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/openclaw', { waitUntil: 'domcontentloaded' })

  await expect(
    page.getByRole('heading', { name: 'OpenClaw — dựng trợ lý AI của riêng bạn' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /Học bài:/ }).first()).toBeVisible()
})

test('bấm vào bài trong khoá OpenClaw dẫn đúng bài đầu chương C1', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa-hoc/openclaw', { waitUntil: 'domcontentloaded' })

  await page
    .getByRole('button', { name: /Học bài:/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/lap-trinh\/bai-hoc\/openclaw-u1-l1(--[a-z0-9-]+)?$/)
})

test('URL cũ /lap-trinh/khoa/:id chuyển hướng sang /lap-trinh/khoa-hoc/:id, giữ mã khoá', async ({
  page,
}) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa/openclaw', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL('/lap-trinh/khoa-hoc/openclaw')
  await expect(
    page.getByRole('heading', { name: 'OpenClaw — dựng trợ lý AI của riêng bạn' }),
  ).toBeVisible()
})

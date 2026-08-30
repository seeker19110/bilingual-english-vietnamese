import { test, expect, type Page } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng cho trang KHOÁ NGẮN (`/lap-trinh/khoa/:courseId`, PR 3/4 khoá Git). Bất biến quan
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
  await page.goto('/lap-trinh/khoa/git', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Git & GitHub thực hành' })).toBeVisible()
  await expect(page.getByText('vào thẳng học được', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: /Học bài:/ }).first()).toBeVisible()
})

test('mã khoá lạ thì về trang tổng quan môn, không render trang trắng', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa/khong-ton-tai', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/lap-trinh$/)
})

test('bấm vào bài trong khoá dẫn đúng bài học (dùng lại bài p3-u10-l1)', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh/khoa/git', { waitUntil: 'domcontentloaded' })

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
  await expect(page).toHaveURL('/lap-trinh/khoa/git')
})

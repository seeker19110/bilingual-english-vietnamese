import { test, expect, type Page } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng cho trang môn Lập trình sau khi dựng lại (PR-UX4). Bất biến quan trọng nhất: thẻ
// "Học tiếp" phải đúng ở CẢ BA ca — chưa học gì · đang học dở · đã xong hết (tiêu chí A5).

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

test('chưa học bài nào → mời bắt đầu bài đầu tiên, kèm lối sang mô tả khoá học', async ({
  page,
}) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [])
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Học tiếp', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bắt đầu bài này' })).toBeVisible()
  // Người chưa học gì mới thấy lối này — người đang học dở không cần nó nữa.
  await expect(page.getByRole('button', { name: /Khoá học này là gì/ })).toBeVisible()
})

test('đang học dở → thẻ đưa thẳng về ĐÚNG bài dở, không phải bài 1', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  // Bài dở nằm ở bậc P3, tức là sau rất nhiều bài chưa hoàn thành khác.
  await gioLapTiendo(page, [{ lessonId: 'p3-u10-l1', status: 'in_progress' }])
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Đang học dở')).toBeVisible()
  await page.getByRole('button', { name: 'Học tiếp', exact: true }).click()
  await expect(page).toHaveURL(/\/lap-trinh\/bai-hoc\/p3-u10-l1$/)
})

test('tiến độ và cột mốc bậc đọc từ dữ liệu thật, không phải số cứng', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await gioLapTiendo(page, [
    { lessonId: 'p1-u1-l1', status: 'completed' },
    { lessonId: 'p1-u2-l1', status: 'completed' },
  ])
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })

  // Thanh tiến độ khai đúng số bài đã xong cho trình đọc màn hình.
  const thanh = page.getByRole('progressbar', { name: 'Tiến độ môn Lập trình' })
  await expect(thanh).toHaveAttribute('aria-valuenow', '2')

  // Cột mốc bậc P1 khai 2 bài đã xong trong nhãn của nó.
  await expect(page.getByRole('button', { name: /Bậc P1 .* đã xong 2 trên \d+ bài/ })).toBeVisible()
})

// Ca "đã đi hết môn → chúc mừng" KHÔNG kiểm ở tầng e2e: dựng nó cần danh sách toàn bộ mã bài,
// tức phải import gói `@dhcb/subject-programming` vào e2e — mà tsconfig.e2e.json không có
// `paths`, nên chỉ chạy được khi packages/*/dist đã build sẵn (xanh ở máy dev, đỏ trên CI).
// Ca đó đã được phủ ở tầng unit, nơi import gói là hợp lệ:
// `apps/dhcb/src/lib/programmingNextLesson.test.ts` — "hoàn thành hết môn → null".

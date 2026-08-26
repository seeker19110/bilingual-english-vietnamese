import { test, expect, type Page } from '@playwright/test'
import { mockLogin } from './helpers/auth'
import { PROGRAMMING_LEVELS } from '@dhcb/subject-programming/curriculum'
import { getLessonsByUnit } from '@dhcb/subject-programming/lessons'

// Danh sách "mọi bài" dựng từ chính giáo trình lúc chạy test — thêm bài mới không làm test
// này lạc hậu.

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

test('đã đi hết môn → chúc mừng, không đẩy quay lại bài nào nữa', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  // Trả về "mọi bài đều completed", danh sách dựng từ chính giáo trình (xem ALL_DONE dưới).
  await page.route('**/api/programming/progress', async (route) => {
    if (route.request().method() !== 'GET') return route.fulfill({ status: 200, body: '{}' })
    return route.fulfill({ status: 200, body: JSON.stringify({ lessons: ALL_DONE }) })
  })
  await page.goto('/lap-trinh', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(/Bạn đã đi hết \d+ bài của môn/)).toBeVisible()
})

const ALL_DONE = PROGRAMMING_LEVELS.flatMap((lv) =>
  lv.units.flatMap((u) =>
    getLessonsByUnit(u.id).map((l) => ({ lessonId: l.id, status: 'completed', completedAt: 1 })),
  ),
)

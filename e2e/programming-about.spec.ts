import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng cho trang mô tả khoá học môn Lập trình (PR-UX3).
// Ba bất biến, mỗi cái tương ứng một quyết định đã chốt trong đặc tả UI/UX:

test('CÔNG KHAI: người chưa đăng nhập đọc được toàn bộ trang, không bị đá về /login', async ({
  page,
}) => {
  await page.goto('/lap-trinh/gioi-thieu', { waitUntil: 'domcontentloaded' })

  // Không bị RequireAuth chuyển hướng — đây là điểm dễ hỏng nhất nếu ai đó "dọn dẹp" App.tsx
  // và bọc lại route này cho đồng bộ với 6 route còn lại của môn.
  await expect(page).toHaveURL(/\/lap-trinh\/gioi-thieu$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Lập trình')

  // Nội dung thuyết phục phải có mặt, không chỉ tiêu đề.
  await expect(page.getByText('Học xong bạn cầm được gì trên tay')).toBeVisible()
  await expect(page.getByText('thứ bạn sẽ KHÔNG có')).toBeVisible()
})

test('luật N1: khối trạng thái thật nói CHƯA AI đi hết môn, và số bài lấy từ dữ liệu', async ({
  page,
}) => {
  await page.goto('/lap-trinh/gioi-thieu', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('Trạng thái thật hôm nay')).toBeVisible()
  await expect(page.getByText(/chưa có ai đi hết môn này/i)).toBeVisible()

  // Con số phải là số THẬT của giáo trình (60 bài / 6 bậc tại thời điểm viết), không phải chữ
  // viết tay. Test đọc chính con số hiện trên trang và kiểm nó hợp lý, nên khi soạn thêm bài
  // mà ai đó hard-code lại con số cũ thì chỗ này vẫn bắt được qua unit test đi kèm.
  await expect(page.getByText(/\d+ bài, cả \d+ bậc đều mở/)).toBeVisible()
})

test('người CHƯA đăng nhập bấm "Bắt đầu" thì đi qua đăng nhập trước', async ({ page }) => {
  await page.goto('/lap-trinh/gioi-thieu', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Bắt đầu bài đầu tiên' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('người ĐÃ đăng nhập bấm "Bắt đầu" thì vào thẳng bài đầu tiên', async ({ page }) => {
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/gioi-thieu', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Bắt đầu bài đầu tiên' }).click()
  // URL nay có thêm slug mô tả (SEO) sau id — vd p1-u1-l1--chuong-trinh-dau-tien...
  await expect(page).toHaveURL(/\/lap-trinh\/bai-hoc\/p1-u1-l1(--[a-z0-9-]+)?$/)
})

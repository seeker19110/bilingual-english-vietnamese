import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Canh gác các ALIAS TIẾNG ANH của đường dẫn tiếng Việt.
//
// Vì sao cần: alias thiếu KHÔNG gây lỗi ồn ào — route `*` ở cuối App.tsx nuốt mọi đường
// dẫn lạ rồi đẩy về trang chủ. Người dùng gõ /programming sẽ về trang chủ, không phải
// trang môn cũng không phải 404, nên nhìn qua tưởng "app chạy bình thường". Đúng loại
// lỗi im lặng chỉ lộ ra khi có người đối chiếu từng cặp — bảng dưới đây làm việc đó.
const ALIASES: ReadonlyArray<readonly [alias: string, dich: string]> = [
  ['/english', '/hoc-tieng-anh'],
  ['/tieng-anh', '/hoc-tieng-anh'],
  ['/programming', '/lap-trinh'],
  // Hai trụ gộp thành một trang (2026-08-28) — alias tiếng Anh vào thẳng đúng tab.
  ['/career', '/su-nghiep-khoi-nghiep'],
  ['/startup', '/su-nghiep-khoi-nghiep'],
  ['/profile', '/trang-ca-nhan'],
  ['/companion', '/ban-dong-hanh'],
  ['/subjects', '/mon-hoc'],
  ['/workspace', '/action-canvas'],
  ['/simulators', '/ung-dung-thuc-te'],
]

for (const [alias, dich] of ALIASES) {
  test(`alias ${alias} dẫn tới ${dich}`, async ({ page }) => {
    await mockLogin(page)
    await page.goto(alias)
    // Chờ chuyển hướng xong rồi mới đối chiếu — <Navigate> chạy ở giai đoạn commit.
    await expect(page).toHaveURL(new RegExp(`${dich.replace(/\//g, '\\/')}(\\?|$)`))
  })
}

// Đường dẫn KHÔNG tồn tại vẫn phải về trang chủ (hành vi của route `*`) — chốt lại để
// việc thêm alias mới không vô tình phá nhánh bắt-tất.
test('đường dẫn không tồn tại thì về trang chủ', async ({ page }) => {
  await mockLogin(page)
  await page.goto('/duong-dan-khong-ton-tai-abc123')
  await expect(page).toHaveURL(/\/$/)
})

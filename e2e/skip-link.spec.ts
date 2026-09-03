// E2E: "Bỏ qua tới nội dung chính" — WCAG 2.4.1 Bypass Blocks (mức A).
//
// Mọi trang đều có sidebar cố định (~15 mục) cộng header. Người dùng bàn phím muốn tới nội
// dung phải Tab qua toàn bộ khối đó, MỖI LẦN đổi trang. Đo thật ở 1440px: trang cấp CEFR có
// 137 điểm dừng Tab, các trang khác 26–59 — phần đầu luôn là cùng một menu.
//
// Cổng axe của dự án vẫn xanh trước khi có liên kết này, vì luật `bypass` chấp nhận landmark
// `<main>` là đủ. Nhưng landmark chỉ giúp người dùng TRÌNH ĐỌC MÀN HÌNH; người dùng bàn phím
// thuần không có cách nào bỏ qua menu. Test này canh phần mà axe không canh.
import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

test('Tab lần đầu là skip link, Enter đưa tiêu điểm thẳng vào nội dung', async ({ page }) => {
  await mockLogin(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  // Chọn trang NHIỀU điểm dừng Tab nhất — nơi liên kết này có giá trị rõ nhất.
  await page.goto('/lo-trinh-hoc/a1')
  await expect(page.getByRole('button', { name: /Lộ trình A1/ }).first()).toBeVisible()

  // 1) Điểm dừng Tab ĐẦU TIÊN của trang phải là skip link. Bản đầu đặt nó trong `Layout` và
  //    đo ra sai: `DesktopSidebar` render TRƯỚC `Layout` nên Tab lần 1 rơi vào logo sidebar,
  //    tức liên kết vô dụng. Nay đặt trong `App`, ngay trước `DesktopSidebar`.
  await page.keyboard.press('Tab')
  const focused = page.locator(':focus')
  await expect(focused).toHaveText(/Bỏ qua tới nội dung chính|Skip to main content/)

  // 2) Nó phải HIỆN RA khi có tiêu điểm (sr-only lúc bình thường). Kích thước > 0 là bằng
  //    chứng: `display:none` sẽ cho 0 và cũng gỡ luôn khỏi thứ tự Tab.
  const box = await focused.boundingBox()
  expect(box?.width ?? 0).toBeGreaterThan(50)
  expect(box?.height ?? 0).toBeGreaterThan(20)

  // 3) Enter đưa TIÊU ĐIỂM (không chỉ cuộn màn hình) vào vùng nội dung chính.
  await page.keyboard.press('Enter')
  await expect(page.locator(':focus')).toHaveAttribute('id', 'noi-dung-chinh')

  // 4) Và Tab kế tiếp rơi vào phần tử BÊN TRONG nội dung, không quay về menu — đây mới là
  //    điều người dùng thật sự cần; ba bước trên chỉ vô nghĩa nếu bước này sai.
  await page.keyboard.press('Tab')
  const inMain = await page.locator(':focus').evaluate((el) => !!el.closest('main'))
  expect(inMain, 'phím Tab sau khi bỏ qua phải ở trong <main>').toBe(true)
})

test('skip link KHÔNG hiện khi chưa có tiêu điểm', async ({ page }) => {
  await mockLogin(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/tien-do')
  const link = page.getByRole('link', { name: /Bỏ qua tới nội dung chính/ })
  // Vẫn nằm trong DOM (phải thế, nếu không sẽ không nhận được tiêu điểm), nhưng thu về
  // kích thước 1px của `sr-only` nên người dùng chuột không bao giờ thấy.
  await expect(link).toBeAttached()
  const box = await link.boundingBox()
  expect(box?.width ?? 99).toBeLessThan(5)
})

import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Gợi ý "Tiếp tục" (đánh dấu "đã xem" cho Lessons/CommonPhrases) — phần phụ của
// U-5, xem docs/research/cai-tien-ui-ux.md.
test.describe('Gợi ý "Tiếp tục" — đánh dấu đã xem', () => {
  test('Lessons: chưa xem gì → gợi ý bài 1; mở bài 1 xong quay lại → gợi ý bài 2', async ({
    page,
  }) => {
    await mockLogin(page, 'vi')
    await page.goto('/bai-hoc')
    await page.waitForTimeout(500)
    const cta = page.getByRole('button', { name: /Tiếp tục/ })
    await expect(cta).toBeVisible()
    await expect(cta).toContainText('Bài 1')
    await cta.click()
    // [2026-09-05, đợt 1 "desktop giáo dục"] Playwright chạy ở 1280px, tức nhánh MASTER–DETAIL:
    // danh sách bài KHÔNG bị thay thế nữa mà ở nguyên cột trái, nội dung bài mở ở cột phải.
    // Vì vậy không còn (và không cần) nút "← Danh sách" để quay lại — gợi ý "Tiếp tục" phải tự
    // nhảy sang bài 2 NGAY sau khi bài 1 được đánh dấu đã xem, không qua bước quay lại nào.
    // Kiểm bằng `aria-current` của mục trong danh sách chứ không bằng chữ tiêu đề: ở khuôn
    // master–detail tiêu đề bài xuất hiện ở CẢ hai chỗ (mục danh sách + thanh header), nên
    // `getByText` sẽ vi phạm strict-mode. `aria-current` cũng chính là thứ ta cam kết cho
    // trình đọc màn hình, nên kiểm nó là kiểm đúng hợp đồng a11y.
    await expect(page.getByRole('button', { name: /Giới thiệu bản thân/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(page.getByRole('button', { name: /Tiếp tục/ })).toContainText('Bài 2')
  })

  test('CommonPhrases: gợi ý chủ đề đầu tiên chưa xem, mở xong thì đổi gợi ý', async ({ page }) => {
    await mockLogin(page, 'vi')
    await page.goto('/cau-thong-dung')
    await page.waitForTimeout(500)
    const cta = page.getByRole('button', { name: /Tiếp tục/ })
    await expect(cta).toBeVisible()
    const firstLabel = await cta.innerText()
    await cta.click()
    await page.waitForTimeout(300)
    await page.goto('/cau-thong-dung')
    await page.waitForTimeout(500)
    const secondLabel = await page.getByRole('button', { name: /Tiếp tục/ }).innerText()
    expect(secondLabel).not.toBe(firstLabel)
  })
})

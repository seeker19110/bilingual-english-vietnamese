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
    // Vào màn chi tiết bài 1
    await expect(page.getByText('Giới thiệu bản thân')).toBeVisible()
    await page.getByRole('button', { name: /Danh sách/ }).click()
    await page.waitForTimeout(500)
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

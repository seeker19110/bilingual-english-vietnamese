// E2E: phiên học bị rút gọn thì phải NÓI RÕ.
//
// Luồng "quay lại sau khi bỏ bẵng" (`lib/comeback.ts`) trỏ tới `?cap=3`, khiến lượt đầu chỉ
// còn 3 từ thay vì tốc độ người học đã chọn. Trước đây app không nói gì — người học thấy ít
// bài hơn thường lệ mà không biết vì sao, dễ tưởng mất tiến độ hoặc app lỗi.
//
// Test canh CẢ HAI chiều: có `?cap=` thì giải thích, không có thì im. Vế thứ hai quan trọng
// ngang vế đầu — một dòng giải thích hiện ra khi không có gì để giải thích cũng là lỗi.
import { test, expect } from '@playwright/test'
import { mockLogin, USER_ID } from './helpers/auth'

test.beforeEach(async ({ page }) => {
  await mockLogin(page)
  await page.addInitScript((uid) => {
    localStorage.setItem(`et_speed_${uid}`, '10')
  }, USER_ID)
  await page.setViewportSize({ width: 1440, height: 1000 })
})

test('có ?cap= nhỏ hơn tốc độ thường → nói rõ vì sao ít bài hơn', async ({ page }) => {
  await page.goto('/lo-trinh-hoc/a1?tab=today&cap=3')
  const banner = page.locator('.glass').first()
  await expect(banner).toContainText('3 từ mới')
  // Nêu ĐỦ hai con số (3 và 10) để người học tự đối chiếu với tốc độ mình đã chọn.
  await expect(banner).toContainText(/3 từ thay vì 10/)
})

test('không có ?cap= → không hiện dòng giải thích thừa', async ({ page }) => {
  await page.goto('/lo-trinh-hoc/a1?tab=today')
  const banner = page.locator('.glass').first()
  await expect(banner).toContainText('10 từ mới')
  await expect(banner).not.toContainText(/thay vì/)
})

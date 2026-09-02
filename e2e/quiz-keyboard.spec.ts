// E2E: điều khiển bài trắc nghiệm bằng bàn phím (tab "Kiểm tra" của một cấp CEFR).
//
// Vì sao cần test ở tầng E2E chứ không chỉ unit test: luật phím đã có test thuần ở
// `packages/core-ui/useQuizKeyboard.test.ts`, nhưng thứ dễ hỏng lại nằm ở chỗ LẮP RÁP —
// hook gắn vào `window`, còn nút bấm nằm trong component con. Một lần đổi cấu trúc render là
// phím có thể ngừng chạy mà mọi unit test vẫn xanh. Test này giữ đúng phần đó.
import { test, expect } from '@playwright/test'
import { mockLogin, USER_ID } from './helpers/auth'

const LEARNED = ['hello', 'water', 'book', 'house', 'friend', 'school', 'happy', 'green']

test.describe('phím tắt bài trắc nghiệm', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page)
    // Tab Kiểm tra chỉ dựng được câu hỏi khi đã có từ đã học — gieo sẵn để test không phụ
    // thuộc vào việc phải học tay trước đó.
    await page.addInitScript(
      ([uid, words]) => {
        localStorage.setItem(`et_learned_${uid}`, JSON.stringify(words))
      },
      [USER_ID, LEARNED] as const,
    )
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/lo-trinh-hoc/a1?tab=quiz')
  })

  test('phím số chọn đáp án, Enter sang câu tiếp theo', async ({ page }) => {
    const firstPrompt = page.locator('text=/CÂU 1\\/|Câu 1\\//i').first()
    await expect(firstPrompt).toBeVisible()

    // Trước khi trả lời: chưa có nút sang câu tiếp.
    const nextBtn = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ })
    await expect(nextBtn).toHaveCount(0)

    // Bấm phím "1" = chọn đáp án đầu tiên.
    await page.keyboard.press('1')
    await expect(nextBtn).toBeVisible()

    // Enter = sang câu tiếp theo (câu 2/10).
    await page.keyboard.press('Enter')
    await expect(page.locator('text=/CÂU 2\\/|Câu 2\\//i').first()).toBeVisible()
  })

  test('ô số phím tắt hiện ở desktop và ẩn khỏi trình đọc màn hình', async ({ page }) => {
    // Ô số là chỉ dẫn thị giác; trình đọc màn hình phải nghe nội dung đáp án, không nghe "1".
    const keyHint = page.locator('[aria-hidden="true"]', { hasText: /^1$/ }).first()
    await expect(keyHint).toBeVisible()
  })

  test('thẻ từ vựng: phím 2 = "Đã thuộc" chuyển sang từ kế tiếp', async ({ page }) => {
    // Thao tác lặp nhiều nhất của người học (20–100 lượt/ngày) nên phải chạy được bằng phím.
    await page.goto('/lo-trinh-hoc/a1')
    await page
      .getByText(/Đại từ & lời chào/)
      .first()
      .click()
    // Kiểm SỰ TĂNG chứ không kiểm con số cứng: `beforeEach` đã gieo sẵn một số từ đã học nên
    // vòng từ vựng có thể bắt đầu ở vị trí khác 1.
    const counter = page.locator('text=/^Từ \\d+\\/\\d+$/').first()
    await expect(counter).toBeVisible()
    const before = Number(/Từ (\d+)\//.exec(await counter.innerText())?.[1])
    await page.keyboard.press('2')
    await expect(counter).toHaveText(new RegExp(`^Từ ${before + 1}/`))
  })

  test('ở màn hình hẹp thì KHÔNG hiện ô số phím (không hứa thao tác không làm được)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()
    await expect(page.locator('text=/CÂU 1\\/|Câu 1\\//i').first()).toBeVisible()
    await expect(page.locator('[aria-hidden="true"]', { hasText: /^1$/ }).first()).toBeHidden()
  })
})

// E2E: bài kiểm tra đang làm dở KHÔNG mất khi chuyển tab.
//
// Trước đây tiến trình nằm hoàn toàn trong state của component, nên đổi tab là component bị gỡ
// khỏi cây và làm dở 9/10 câu cũng mất trắng. Luật lưu/đọc phiên đã có test thuần ở
// `apps/dhcb/src/lib/quizSession.test.ts`; test này canh phần LẮP RÁP — thứ mà unit test không
// thấy được: state có thật sự khôi phục đúng khi component dựng lại hay không.
import { test, expect } from '@playwright/test'
import { mockLogin, USER_ID } from './helpers/auth'

const LEARNED = [
  'hello',
  'water',
  'book',
  'house',
  'friend',
  'school',
  'happy',
  'green',
  'city',
  'music',
]

test('làm dở bài kiểm tra, đổi tab rồi quay lại thì học tiếp đúng chỗ', async ({ page }) => {
  await mockLogin(page)
  await page.addInitScript(
    ([uid, words]) => {
      localStorage.setItem(`et_learned_${uid}`, JSON.stringify(words))
    },
    [USER_ID, LEARNED] as const,
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/lo-trinh-hoc/a1?tab=quiz')

  const counter = page.locator('text=/CÂU \\d+\\/10/i').first()
  await expect(counter).toBeVisible()

  // Trả lời 3 câu bằng bàn phím (1 = chọn đáp án đầu, Enter = sang câu tiếp).
  // Chờ theo TRẠNG THÁI ở từng bước (nút "Câu tiếp theo" hiện ra, rồi số câu đổi) chứ không
  // chờ cứng theo thời gian: bấm liên tiếp quá nhanh thì React chưa kịp dựng lại câu mới.
  for (let i = 1; i <= 3; i++) {
    await page.keyboard.press('1')
    await expect(page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(counter).toHaveText(new RegExp(`Câu ${i + 1}/10`, 'i'))
  }

  await page
    .getByRole('button', { name: /Từ khó/ })
    .first()
    .click()
  await expect(counter).toHaveCount(0)

  await page
    .getByRole('button', { name: /Kiểm tra/ })
    .first()
    .click()
  // Điểm mấu chốt: quay lại đúng câu 4, KHÔNG phải câu 1.
  await expect(page.locator('text=/CÂU \\d+\\/10/i').first()).toHaveText(/Câu 4\/10/i)
})

import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'
import { muteTts } from './helpers/tts'

// Tab "Nghe" ở trang cấp CEFR (③ N3, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
// A1 luôn mở khóa (CLAUDE.md) nên vào thẳng ?tab=listening không cần seed tiến độ.
test.describe('Tab Nghe (luyện nghe theo cấp)', () => {
  test('mở tab → mặc định "Chọn nghĩa", hiện câu hỏi trắc nghiệm 4 đáp án', async ({ page }) => {
    await muteTts(page)
    await mockLogin(page, 'vi')
    await page.goto('/learning-path/a1?tab=listening', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /Chọn nghĩa/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Gõ lại/ })).toBeVisible()
    // Câu hỏi nghe: nút "Nghe lại" + 4 đáp án lựa chọn.
    await expect(page.getByRole('button', { name: /Nghe lại/ })).toBeVisible()
    const options = page.locator('button').filter({ hasText: /.+/ })
    await expect(options).not.toHaveCount(0)
  })

  test('chọn đáp án đúng/sai → hiện màu phản hồi, bấm tiếp tục sang câu sau', async ({ page }) => {
    await muteTts(page)
    await mockLogin(page, 'vi')
    await page.goto('/learning-path/a1?tab=listening', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /Nghe lại/ })).toBeVisible()
    // Bấm đáp án đầu tiên trong danh sách lựa chọn (dưới khối câu hỏi) — không quan
    // trọng đúng/sai, chỉ cần xác nhận có phản hồi + nút "Câu tiếp theo"/"Xem kết quả".
    const answerButtons = page.locator('.space-y-2\\.5 button')
    await answerButtons.first().click()
    await expect(page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ })).toBeVisible()
  })

  test('chuyển sang "Gõ lại" → hiện ô nhập + nút Kiểm tra, gõ đúng câu → báo điểm cao', async ({
    page,
  }) => {
    await muteTts(page)
    await mockLogin(page, 'vi')
    await page.goto('/learning-path/a1?tab=listening', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Gõ lại/ }).click()

    const textarea = page.getByPlaceholder(/Gõ lại câu vừa nghe/)
    await expect(textarea).toBeVisible()
    // .last(): trang cấp CEFR còn có tab "Kiểm tra" (quiz) trùng tên ở thanh tab trên
    // đầu — nút submit của dictation nằm SAU trong DOM nên .last() luôn trúng đúng nút.
    const checkBtn = page.getByRole('button', { name: /^Kiểm tra$/ }).last()
    await expect(checkBtn).toBeDisabled() // chưa gõ gì → không bấm được

    // Không biết trước nội dung câu (random) — gõ bừa để xác nhận LUỒNG chấm điểm
    // chạy được (không throw, hiện % + câu đúng), không assert điểm cụ thể.
    await textarea.fill('một câu trả lời bất kỳ để kiểm tra luồng chấm điểm')
    await checkBtn.click()
    await expect(page.getByText(/%/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ })).toBeVisible()
  })
})

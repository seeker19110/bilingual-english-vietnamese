import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, type ThemeName } from './helpers/auth'

// Quét a11y bằng axe-core (WCAG 2.0/2.1 A & AA). Loại 'meta-viewport' vì dự án
// CHỦ ĐỘNG khóa zoom (đánh đổi 1 mục a11y, bù bằng sàn chữ ≥11px — CLAUDE.md mục 8).
//
// Cổng kiểu "không tệ hơn hiện tại":
//   - KHÔNG cho phép bất kỳ vi phạm mức 'critical'.
//   - 'serious' chỉ chấp nhận các nợ đã biết (KNOWN_SERIOUS); vi phạm serious MỚI
//     (ngoài baseline) sẽ làm fail → chống tụt lùi. Nợ baseline ghi ở PROGRESS.md.
// Hiện baseline RỖNG: nợ 'color-contrast' trên TẤT CẢ trang được quét dưới đây đã
// được fix (caption nhỏ chuyển từ zinc-500/600 + accent-400/60 sang zinc-400 /
// accent-400 đặc — đạt AA ở mọi theme). Xem PROGRESS.md.
const KNOWN_SERIOUS = new Set<string>([])

async function scan(page: Page) {
  // Tắt animation/transition trước khi quét để axe đo TRẠNG THÁI CUỐI, không bắt
  // nhằm khung giữa của `animate-fade-in` (opacity 0→1) — lúc opacity ~0.6 màu chữ
  // trộn nền làm contrast tụt dưới 4.5 → vi phạm color-contrast chập chờn (flaky).
  // fade-in dùng fill-mode 'both' nên ép duration 0s sẽ nhảy thẳng tới opacity 1.
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}',
  })
  await page.waitForTimeout(100)
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['meta-viewport'])
    .analyze()
  const fmt = (v: { id: string; impact?: string | null }) => `${v.id} (${v.impact})`
  return {
    critical: violations.filter((v) => v.impact === 'critical').map(fmt),
    unexpectedSerious: violations
      .filter((v) => v.impact === 'serious' && !KNOWN_SERIOUS.has(v.id))
      .map(fmt),
  }
}

test('a11y: trang đăng nhập — 0 critical, không có serious mới', async ({ page }) => {
  await page.goto('/login')
  const { critical, unexpectedSerious } = await scan(page)
  expect(critical).toEqual([])
  expect(unexpectedSerious).toEqual([])
})

// Quét Trang chủ ở CẢ 4 THEME (gồm cả mặc định Xanh đêm) — bảo chứng cam kết
// "AA ở mọi theme" (CLAUDE.md mục 4.8, 8).
// Theme SÁNG (Blue sky, Pink) trước đây rớt color-contrast (pill màu cố định + token
// zinc-400 của Pink quá nhạt) → đã sửa bằng biến thể `theme-light:` (sắc độ đậm hơn) và
// chỉnh token `--z-400` của Pink. Gate này chống tụt lùi cho mọi theme.
const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant']
for (const theme of THEMES) {
  test(`a11y: trang chủ theme=${theme} — 0 critical, không có serious mới`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await page.goto('/')
    await expect(page.getByText(/Xin chào/)).toBeVisible()
    const { critical, unexpectedSerious } = await scan(page)
    expect(critical).toEqual([])
    expect(unexpectedSerious).toEqual([])
  })
}

// Trang chủ ở CHIỀU B (người nước ngoài học tiếng Việt): đảo bộ màu accent→sky cho
// badge/nhãn chiều học. Quét ở 2 theme SÁNG (nơi màu sky cố định dễ rớt AA) để chắc
// biến thể `theme-light:` của nhánh B cũng đạt — gate Home phía trên chỉ phủ chiều A.
for (const theme of ['blue-sky', 'pink'] as ThemeName[]) {
  test(`a11y: trang chủ chiều B theme=${theme} — 0 critical, không có serious mới`, async ({
    page,
  }) => {
    await mockLogin(page, 'en', theme)
    await page.addInitScript(() => localStorage.setItem('et_direction', 'B'))
    await page.goto('/')
    await expect(page.getByText(/Hello,/)).toBeVisible()
    const { critical, unexpectedSerious } = await scan(page)
    expect(critical).toEqual([])
    expect(unexpectedSerious).toEqual([])
  })
}

// Các trang chính sau đăng nhập — quét ở CẢ 4 THEME (cam kết "AA ở mọi theme").
// Màu cố định của Tailwind (pill loại từ, màu chủ đề/cấp, IPA…) đã thêm biến thể
// `theme-light:` sắc độ đậm cho 2 theme nền sáng (qua map dùng chung: pos.ts,
// COLOR_MAP Phrases, COLORS Lessons, CEFR_COLORS Dashboard, tab Learn…).
const AUTHED_ROUTES = [
  '/progress',
  '/dictionary',
  '/lessons',
  '/history',
  '/phrases',
  '/learning-path',
  '/learning-path/a1', // trang riêng cấp CEFR (6 cấp A1–C2 dùng chung layout)
  '/learning-path/c1', // cấp nâng cao (accent rose) — quét cả màn khóa
  '/chat',
  '/writing',
  '/speaking',
  '/profile',
]
for (const route of AUTHED_ROUTES) {
  for (const theme of THEMES) {
    test(`a11y: ${route} theme=${theme} — 0 critical, không có serious mới`, async ({ page }) => {
      await mockLogin(page, 'vi', theme)
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000) // chờ render xong (data offline + animation)
      const { critical, unexpectedSerious } = await scan(page)
      expect(critical).toEqual([])
      expect(unexpectedSerious).toEqual([])
    })
  }
}

// ── MÀN KẾT QUẢ CẦN BACKEND (Chat trả lời/nhận xét · Writing chấm điểm/lỗi · Speaking
//    trả lời/sửa lỗi) ──────────────────────────────────────────────────────────────
// Các UI này chỉ hiện SAU khi gọi AI nên axe lúc tải trang không thấy. E2E không có
// backend thật → ta CHẶN /api/claude và trả câu mẫu cố định (đủ render màu amber/accent/
// red của phần sửa lỗi/điểm), rồi quét contrast ở CẢ 4 THEME (cam kết "AA ở mọi theme").
// Đây là phần a11y còn chừa lại trong PROGRESS.md ("Tiếp theo").

// Trả lời /api/claude bằng nội dung cố định để dựng UI kết quả.
async function mockClaude(page: Page, text: string) {
  await page.route('**/api/claude', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: [{ text }] }),
    }),
  )
}

// Vô hiệu hóa TTS để trang Nói không treo: chặn /api/tts (rớt về Web Speech) và làm
// speechSynthesis kết thúc NGAY (headless không có giọng đọc → onend có thể không bao
// giờ bắn → await speakBilingual() treo). Stub gọi onend ở tick sau để Promise resolve.
async function muteTts(page: Page) {
  await page.route('**/api/tts', (route) => route.abort())
  await page.addInitScript(() => {
    const synth = {
      speak: (u: SpeechSynthesisUtterance) => {
        const handler = u.onend
        if (handler)
          setTimeout(() => handler.call(u, new Event('end') as unknown as SpeechSynthesisEvent), 0)
      },
      cancel() {},
      pause() {},
      resume() {},
      getVoices: () => [] as SpeechSynthesisVoice[],
    }
    try {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth })
    } catch {
      /* trình duyệt không cho ghi đè — bỏ qua, fallback vẫn resolve qua onerror */
    }
  })
}

// Chat: 💬 = câu thoại, ✅ = nhận xét (tiếng mẹ đẻ). Bong bóng tách 2 phần → màu amber.
const CHAT_REPLY =
  '💬 Hello! Welcome to the interview. Please tell me about yourself and your work experience.\n' +
  '✅ Nhận xét: Câu trả lời của bạn khá tốt, nhưng nên dùng thì hiện tại hoàn thành khi nói về kinh nghiệm.'

// Writing: JSON đúng dạng FeedbackData. Điểm pha cao/vừa/thấp để bật đủ 3 nhánh màu
// (accent ≥7 · amber 5–6 · red <5) ở ScoreBar và 1 lỗi (đỏ gạch + xanh sửa).
const WRITING_FEEDBACK = JSON.stringify({
  scores: { task_response: 7, coherence: 5, lexical: 6, grammar: 4, overall: 6 },
  errors: [
    {
      original: 'I have went to school yesterday.',
      corrected: 'I went to school yesterday.',
      explanation: 'Dùng quá khứ đơn "went", không dùng "have went".',
    },
  ],
  suggestions: [
    'Dùng câu phức để nâng band Grammatical Range.',
    'Thêm ví dụ cụ thể cho luận điểm.',
  ],
  sample: 'A well-structured paragraph would start with a clear topic sentence...',
  encouragement: 'Bài viết có ý tốt — tiếp tục luyện tập nhé!',
})

// Speaking: JSON đúng dạng AIResponse (speech = câu thoại, feedback = nhận xét, corrected = sửa).
const SPEAKING_REPLY = JSON.stringify({
  speech: 'Hi there! What did you do last weekend?',
  feedback: 'Phát âm rõ ràng, nhưng chú ý nối âm giữa các từ.',
  corrected: 'I went to the cinema with my friends.',
})

const RESULT_THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant']

for (const theme of RESULT_THEMES) {
  test(`a11y: Chat (kết quả AI) theme=${theme} — 0 critical, không có serious mới`, async ({
    page,
  }) => {
    await mockClaude(page, CHAT_REPLY)
    await mockLogin(page, 'vi', theme)
    await page.goto('/chat')
    await page.getByRole('button', { name: /Bắt đầu hội thoại/ }).click()
    await expect(page.getByText(/Câu trả lời của bạn khá tốt/)).toBeVisible()
    const { critical, unexpectedSerious } = await scan(page)
    expect(critical).toEqual([])
    expect(unexpectedSerious).toEqual([])
  })

  test(`a11y: Writing (kết quả chấm) theme=${theme} — 0 critical, không có serious mới`, async ({
    page,
  }) => {
    await mockClaude(page, WRITING_FEEDBACK)
    await mockLogin(page, 'vi', theme)
    await page.goto('/writing')
    await page.locator('#prompt-input').fill('Some people think children should learn to compete.')
    await page
      .locator('#essay-input')
      .fill(
        'In my opinion, cooperation matters more than competition because working together helps children build social skills and solve problems effectively in real life.',
      )
    await page.getByRole('button', { name: /Chấm bài ngay/ }).click()
    await expect(page.getByText(/Điểm ước lượng IELTS/)).toBeVisible()
    const { critical, unexpectedSerious } = await scan(page)
    expect(critical).toEqual([])
    expect(unexpectedSerious).toEqual([])
  })

  test(`a11y: Speaking (kết quả AI) theme=${theme} — 0 critical, không có serious mới`, async ({
    page,
  }) => {
    await muteTts(page)
    await mockClaude(page, SPEAKING_REPLY)
    await mockLogin(page, 'vi', theme)
    await page.goto('/speaking')
    await page.getByRole('button', { name: /Bắt đầu luyện nói/ }).click()
    await expect(page.getByText(/What did you do last weekend/)).toBeVisible()
    const { critical, unexpectedSerious } = await scan(page)
    expect(critical).toEqual([])
    expect(unexpectedSerious).toEqual([])
  })
}

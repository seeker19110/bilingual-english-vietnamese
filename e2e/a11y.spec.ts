import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, USER_ID, type ThemeName } from './helpers/auth'
import { muteTts } from './helpers/tts'
import { freezeAnimations } from './helpers/axe'

// Quét a11y bằng axe-core (WCAG 2.0/2.1/2.2 A & AA). Loại 'meta-viewport' vì dự án
// CHỦ ĐỘNG khóa zoom (đánh đổi 1 mục a11y, bù bằng sàn chữ ≥11px — CLAUDE.md mục 8).
//
// [2026-08-04] Cổng SIẾT THÀNH TUYỆT ĐỐI: 0 vi phạm A/AA ở MỌI mức tác động
// (critical/serious/moderate/minor), thay cho cổng cũ kiểu "không tệ hơn hiện tại"
// (chỉ chặn critical + serious mới). Đo thực tế toàn bộ 15 trang × 5 theme cho 0 vi
// phạm nên siết được ngay, không cần baseline. AA là SÀN BẮT BUỘC của dự án — theo
// khuyến nghị của W3C (Understanding Conformance): KHÔNG lấy AAA làm chính sách cho
// toàn site vì có nội dung không thể đạt hết AAA; chỗ nào chưa/không đạt AAA thì tối
// thiểu phải đạt AA. Mức AAA được gác riêng ở e2e/a11y-aaa.spec.ts.
async function scan(page: Page) {
  await freezeAnimations(page)
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['meta-viewport'])
    .analyze()
  const fmt = (v: { id: string; impact?: string | null; nodes: unknown[] }) =>
    `${v.id} (${v.impact}, ${v.nodes.length} phần tử)`
  return { all: violations.map(fmt) }
}

// Danh sách theme dùng cho MỌI vòng quét bên dưới — gồm cả "Nhi đồng" (kid), theme
// bình thường chỉ tự áp khi age_group='nhi_dong'; ở E2E seed thẳng localStorage
// 'ui_theme' qua mockLogin() (theme render y hệt, chỉ khác cách được áp).
// Quét Trang chủ ở CẢ 5 THEME (gồm cả mặc định Xanh đêm) — bảo chứng cam kết
// "AA ở mọi theme" (CLAUDE.md mục 4.8, 8).
// Theme SÁNG (Blue sky, Pink) trước đây rớt color-contrast (pill màu cố định + token
// zinc-400 của Pink quá nhạt) → đã sửa bằng biến thể `theme-light:` (sắc độ đậm hơn) và
// chỉnh token `--z-400` của Pink. Gate này chống tụt lùi cho mọi theme.
const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']

// Trang đăng nhập — quét CẢ 5 theme (nút OAuth dùng màu thương hiệu cố định, không
// đổi theo theme, nhưng nền/chữ xung quanh thì có).
for (const theme of THEMES) {
  test(`a11y: trang đăng nhập theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('ui_theme', t), theme)
    await page.goto('/login')
    // Chờ nút OAuth cuối cùng render xong rồi mới quét: các nút này hiện SAU form nên
    // quét sớm sẽ bỏ sót chúng (đã từng làm cổng lọt lỗi contrast + target-size).
    await expect(page.getByRole('button', { name: /Microsoft/i })).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

for (const theme of THEMES) {
  test(`a11y: trang chủ theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await page.goto('/')
    await expect(page.getByRole('banner').getByText(/Xin chào/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

// Trang chủ ở CHIỀU B (người nước ngoài học tiếng Việt): đảo bộ màu accent→sky cho
// badge/nhãn chiều học. Quét ở 2 theme SÁNG (nơi màu sky cố định dễ rớt AA) để chắc
// biến thể `theme-light:` của nhánh B cũng đạt — gate Home phía trên chỉ phủ chiều A.
for (const theme of ['blue-sky', 'pink'] as ThemeName[]) {
  test(`a11y: trang chủ chiều B theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await mockLogin(page, 'en', theme)
    await page.addInitScript(() => localStorage.setItem('et_direction', 'B'))
    await page.goto('/')
    await expect(page.getByRole('banner').getByText(/Hi there/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

// Các trang chính sau đăng nhập — quét ở CẢ 5 THEME (cam kết "AA ở mọi theme").
// Màu cố định của Tailwind (pill loại từ, màu chủ đề/cấp, IPA…) đã thêm biến thể
// `theme-light:` sắc độ đậm cho 2 theme nền sáng (qua map dùng chung: pos.ts,
// COLOR_MAP Phrases, COLORS Lessons, CEFR_COLORS Dashboard, tab Learn…).
const AUTHED_ROUTES = [
  '/tien-do',
  '/tu-dien',
  '/bai-hoc',
  '/lich-su-hoc',
  '/cau-thong-dung',
  '/lo-trinh-hoc',
  '/lo-trinh-hoc/a1', // trang riêng cấp CEFR (6 cấp A1–C2 dùng chung layout)
  '/lo-trinh-hoc/c1', // cấp nâng cao (accent rose) — quét cả màn khóa
  '/tro-truyen',
  '/luyen-viet',
  '/luyen-noi',
  '/cai-dat',
  '/thu-thach', // màn "chưa bắt đầu thử thách" — các trạng thái khác quét riêng bên dưới
  '/lap-trinh', // môn Lập trình: tổng quan P1–P6 + dự án xuyên suốt (PR-L1)
  '/lap-trinh/p1', // trang một bậc (6 bậc dùng chung layout)
  '/lap-trinh/chay-thu', // sandbox chạy Python (PR-L2) — quét màn tĩnh, không chạy Pyodide
  '/lap-trinh/bai-hoc/p1-u4-l1', // bài học 8 bước (PR-L3) — màn Khái niệm
  '/lap-trinh/du-an', // dự án trục chặng P1 (PR-L3b)
  '/lap-trinh/on-tap', // ôn thẻ SRS môn Lập trình (PR-L10) — màn rỗng khi chưa có thẻ
  '/lap-trinh/gioi-thieu', // mô tả khoá học & mục tiêu (PR-UX3) — trang chữ dài, nhiều tương phản
]
for (const route of AUTHED_ROUTES) {
  for (const theme of THEMES) {
    test(`a11y: ${route} theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
      await mockLogin(page, 'vi', theme)
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000) // chờ render xong (data offline + animation)
      const { all } = await scan(page)
      expect(all).toEqual([])
    })
  }
}

// ── MÀN KẾT QUẢ CẦN BACKEND (Chat trả lời/nhận xét · Writing chấm điểm/lỗi · Speaking
//    trả lời/sửa lỗi) ──────────────────────────────────────────────────────────────
// Các UI này chỉ hiện SAU khi gọi AI nên axe lúc tải trang không thấy. E2E không có
// backend thật → ta CHẶN /api/agent và trả câu mẫu cố định (đủ render màu amber/accent/
// red của phần sửa lỗi/điểm), rồi quét contrast ở CẢ 5 THEME (cam kết "AA ở mọi theme").
// Đây là phần a11y còn chừa lại trong PROGRESS.md ("Tiếp theo").

// Trả lời /api/agent bằng nội dung cố định để dựng UI kết quả.
async function mockClaude(page: Page, text: string) {
  await page.route('**/api/agent', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: [{ text }] }),
    }),
  )
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

const RESULT_THEMES: ThemeName[] = THEMES

for (const theme of RESULT_THEMES) {
  test(`a11y: Chat (kết quả AI) theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await mockClaude(page, CHAT_REPLY)
    await mockLogin(page, 'vi', theme)
    await page.goto('/tro-truyen')
    await page.getByRole('button', { name: /Bắt đầu hội thoại/ }).click()
    await expect(page.getByText(/Câu trả lời của bạn khá tốt/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })

  test(`a11y: Writing (kết quả chấm) theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await mockClaude(page, WRITING_FEEDBACK)
    await mockLogin(page, 'vi', theme)
    await page.goto('/luyen-viet')
    await page.locator('#prompt-input').fill('Some people think children should learn to compete.')
    await page
      .locator('#essay-input')
      .fill(
        'In my opinion, cooperation matters more than competition because working together helps children build social skills and solve problems effectively in real life.',
      )
    await page.getByRole('button', { name: /Chấm bài ngay/ }).click()
    await expect(page.getByText(/Điểm ước lượng IELTS/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })

  test(`a11y: Speaking (kết quả AI) theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await muteTts(page)
    await mockClaude(page, SPEAKING_REPLY)
    await mockLogin(page, 'vi', theme)
    await page.goto('/luyen-noi')
    await page.getByRole('button', { name: /Bắt đầu luyện nói/ }).click()
    await expect(page.getByText(/What did you do last weekend/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

// ── /thu-thach — các trạng thái khác của thử thách "Challenge 1 phút" (chu kỳ tuần) ──
// Trạng thái "chưa bắt đầu" đã quét chung với AUTHED_ROUTES ở trên. 2 trạng thái
// dưới đây cần seed localStorage (khóa `et_challenge_<uid>` — src/lib/challenge.ts) để bỏ
// qua bước tương tác (bấm bắt đầu/quay/nộp — cần camera thật, không mock ở đây).
// Ghi âm/quay hình KHÔNG cần cho các trạng thái này (đều là màn tĩnh sau khi có
// dữ liệu challenge), nên không cần mock getUserMedia/MediaRecorder.

// Ngày theo giờ VN (khớp src/lib/date.ts vnDateStr), tính ở NODE lúc dựng test data
// (chạy trước khi trang tải — chỉ lệch múi giờ nếu máy CI đặt giờ hệ thống khác UTC,
// không xảy ra trên GitHub Actions runner).
function vnDateOffset(offsetDays: number): string {
  const ms = Date.now() - offsetDays * 86400000 + 7 * 3600000
  return new Date(ms).toISOString().slice(0, 10)
}

async function seedChallengeState(page: Page, challenge: unknown) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: `et_challenge_${USER_ID}`,
    value: challenge,
  })
}

for (const theme of THEMES) {
  test(`a11y: /thu-thach — đã bắt đầu, chưa nộp hôm nay theme=${theme} — 0 vi phạm A/AA`, async ({
    page,
  }) => {
    await mockLogin(page, 'vi', theme)
    await seedChallengeState(page, { startDate: vnDateOffset(0), round: 1, entries: {} })
    await page.goto('/thu-thach', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Challenge 1 phút/)).toBeVisible()
    await page.waitForTimeout(500)
    const { all } = await scan(page)
    expect(all).toEqual([])
  })

  test(`a11y: /thu-thach — đã nộp hôm nay (màn nhận xét AI) theme=${theme} — 0 vi phạm A/AA`, async ({
    page,
  }) => {
    await mockLogin(page, 'vi', theme)
    const today = vnDateOffset(0)
    const feedback = JSON.stringify({
      praise: 'Bạn kể chuyện rất tự nhiên!',
      corrections: [
        {
          original: 'I eat breakfast',
          better: 'I ate breakfast',
          explain: 'Thì quá khứ vì đã ăn rồi.',
        },
      ],
      upgrade: 'This morning I had a delicious bowl of pho.',
    })
    await seedChallengeState(page, {
      startDate: today,
      round: 1,
      entries: {
        [today]: {
          day: today,
          challengeDay: 1,
          topicDay: 1,
          transcript: 'I eat breakfast this morning with banh mi',
          feedback,
          durationSec: 42,
          wordCount: 8,
          round: 1,
        },
      },
    })
    await page.goto('/thu-thach', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Đã nộp challenge hôm nay/)).toBeVisible()
    await page.waitForTimeout(500)
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

// ── Tab "Nghe" (luyện nghe theo cấp, ③ N3) — 2 chế độ: Chọn nghĩa (mặc định) và
// Gõ lại (dictation). A1 luôn mở khóa nên vào thẳng qua ?tab=listening.
for (const theme of THEMES) {
  test(`a11y: /lo-trinh-hoc/a1 tab Nghe — Chọn nghĩa theme=${theme} — 0 vi phạm A/AA`, async ({
    page,
  }) => {
    await muteTts(page)
    await mockLogin(page, 'vi', theme)
    await page.goto('/lo-trinh-hoc/a1?tab=listening', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /Nghe lại/ })).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })

  test(`a11y: /lo-trinh-hoc/a1 tab Nghe — Gõ lại theme=${theme} — 0 vi phạm A/AA`, async ({
    page,
  }) => {
    await muteTts(page)
    await mockLogin(page, 'vi', theme)
    await page.goto('/lo-trinh-hoc/a1?tab=listening', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Gõ lại/ }).click()
    await expect(page.getByPlaceholder(/Gõ lại câu vừa nghe/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

// ── Home: banner "quay lại sau khi bỏ bẵng" (② M4) + gợi ý "Luyện nói với từ
// vừa học" — 2 trạng thái không hiện ở lần quét trang chủ mặc định (user E2E mới
// tinh không kích hoạt điều kiện) nên cần seed riêng.
async function seedOldActivity(page: Page, offsetDays: number) {
  const ms = Date.now() - offsetDays * 86400000 + 7 * 3600000
  const date = new Date(ms).toISOString().slice(0, 10)
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: `et_usage_${USER_ID}_${date}`,
    value: { date, chatCount: 0, writingCount: 0, speakingCount: 0, learnCount: 1 },
  })
}

for (const theme of THEMES) {
  test(`a11y: Home — banner quay lại theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await seedOldActivity(page, 5)
    await mockLogin(page, 'vi', theme)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Mừng bạn quay lại/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })

  test(`a11y: Home — gợi ý luyện nói với từ vừa học theme=${theme} — 0 vi phạm A/AA`, async ({
    page,
  }) => {
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
      key: `et_learned_${USER_ID}`,
      value: ['apple', 'banana', 'cherry'],
    })
    await mockLogin(page, 'vi', theme)
    // Nút gợi ý này đã dời từ trang chủ hub "/" sang trang riêng môn Tiếng Anh
    // "/hoc-tieng-anh" (feat(navigation): restructure platform hub and dedicated
    // english studio routing, commit fd188ef) — xem EnglishHome.tsx.
    await page.goto('/hoc-tieng-anh', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Luyện nói với 3 từ vừa học/)).toBeVisible()
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

// ── MÀN AI PHẢN HỒI CODE môn Lập trình (PR-L5) ────────────────────────────────────
// Khối này chỉ hiện ở bước "Tự viết" và phần trả lời chỉ hiện SAU khi gọi API, nên vòng
// quét theo route ở trên không bao giờ chạm tới. Chặn `/api/programming/feedback` trả câu
// mẫu rồi quét đủ 5 theme — cùng cách đã làm cho màn kết quả Chat/Writing/Speaking.
async function openProgrammingAiPanel(page: Page, theme: ThemeName) {
  await page.route('**/api/programming/feedback', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: 'Đề bài muốn in ra số tiền điện. Bạn thử đọc lại xem mốc 50 kWh đầu tính giá nào nhé?',
        kind: 'socratic_hint',
        hintLevel: 1,
      }),
    }),
  )
  await mockLogin(page, 'vi', theme)
  await page.goto('/lap-trinh/bai-hoc/p1-u4-l1', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Tự viết' }).click()
  await page.getByRole('button', { name: /Gợi ý bậc/ }).click()
  await expect(page.getByText(/mốc 50 kWh đầu/)).toBeVisible()
}

for (const theme of THEMES) {
  test(`a11y: AI xem code (Lập trình) theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await openProgrammingAiPanel(page, theme)
    const { all } = await scan(page)
    expect(all).toEqual([])
  })
}

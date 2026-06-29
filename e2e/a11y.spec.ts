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

// Trạng thái SAU tương tác: menu chọn giao diện (ThemeToggle) chỉ render khi bấm mở
// → axe lúc tải trang KHÔNG quét được. Mở dropdown rồi quét để bắt lỗi a11y của
// menu (role/menuitem, contrast các mục) — chống tụt lùi khi sửa menu sau này.
test('a11y: menu chọn giao diện (sau khi mở) — 0 critical, không có serious mới', async ({
  page,
}) => {
  await mockLogin(page, 'vi')
  await page.goto('/')
  await expect(page.getByText(/Xin chào/)).toBeVisible()
  await page.getByRole('button', { name: /Đổi giao diện/ }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  const { critical, unexpectedSerious } = await scan(page)
  expect(critical).toEqual([])
  expect(unexpectedSerious).toEqual([])
})

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
  '/chat',
  '/writing',
  '/speaking',
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

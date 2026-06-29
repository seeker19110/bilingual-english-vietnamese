import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin } from './helpers/auth'

// Quét a11y bằng axe-core (WCAG 2.0/2.1 A & AA). Loại 'meta-viewport' vì dự án
// CHỦ ĐỘNG khóa zoom (đánh đổi 1 mục a11y, bù bằng sàn chữ ≥11px — CLAUDE.md mục 8).
//
// Cổng kiểu "không tệ hơn hiện tại":
//   - KHÔNG cho phép bất kỳ vi phạm mức 'critical'.
//   - 'serious' chỉ chấp nhận các nợ đã biết (KNOWN_SERIOUS); vi phạm serious MỚI
//     (ngoài baseline) sẽ làm fail → chống tụt lùi. Nợ baseline ghi ở PROGRESS.md.
const KNOWN_SERIOUS = new Set<string>([
  'color-contrast', // nợ a11y: vài chữ phụ (zinc-400) chưa đạt AA ở nền tối — fix ở PR theme riêng
])

async function scan(page: Page) {
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

test('a11y: trang chủ (đã đăng nhập) — 0 critical, không có serious mới', async ({ page }) => {
  await mockLogin(page, 'vi')
  await page.goto('/')
  await expect(page.getByText(/Xin chào/)).toBeVisible()
  const { critical, unexpectedSerious } = await scan(page)
  expect(critical).toEqual([])
  expect(unexpectedSerious).toEqual([])
})

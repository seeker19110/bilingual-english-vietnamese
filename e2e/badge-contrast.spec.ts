// E2E: badge đếm số phải ĐỦ TƯƠNG PHẢN AA — cổng a11y hiện có KHÔNG thấy được nó.
//
// Badge chỉ render khi số đếm > 0. E2E của cổng a11y chạy với tài khoản trống nên phần tử
// này chưa từng tồn tại lúc axe quét — đó là lý do lỗi `text-white` trên `bg-rose-500`
// (≈3,95:1, dưới sàn AA 4,5:1) sống sót qua mọi vòng quét. Test này gieo dữ liệu để badge
// hiện THẬT rồi đo tương phản tại chỗ.
import { test, expect } from '@playwright/test'
import { mockLogin, USER_ID } from './helpers/auth'

const HARD = ['hello', 'water', 'book']

function relLum(rgb: number[]): number {
  const f = (v: number | undefined) => {
    const s = (v ?? 0) / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2])
}

test('badge "Từ khó" hiện đúng số và đạt tương phản AA', async ({ page }) => {
  await mockLogin(page)
  await page.addInitScript(
    ([uid, hard]) => {
      localStorage.setItem(`et_hard_${uid}`, JSON.stringify(hard))
      localStorage.setItem(`et_learned_${uid}`, JSON.stringify(hard))
    },
    [USER_ID, HARD] as const,
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/lo-trinh-hoc/a1')

  const badge = page.locator('button:has-text("Từ khó") span.rounded-full').first()
  await expect(badge).toHaveText(String(HARD.length))

  const colors = await badge.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { fg: cs.color, bg: cs.backgroundColor, size: cs.fontSize }
  })
  const parse = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
  const [L1, L2] = [relLum(parse(colors.fg)), relLum(parse(colors.bg))]
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)

  // Chữ số nhỏ ⇒ áp sàn chữ thường 4,5:1 (không phải 3:1 của "chữ lớn").
  expect(
    ratio,
    `tương phản badge = ${ratio.toFixed(2)}:1 (${colors.fg} trên ${colors.bg})`,
  ).toBeGreaterThanOrEqual(4.5)
  // Cỡ chữ tối thiểu 12px — 11px bold trong vòng tròn 16px thì số gần chạm viền.
  expect(parseFloat(colors.size)).toBeGreaterThanOrEqual(12)
})

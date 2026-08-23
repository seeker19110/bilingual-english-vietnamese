// e2e/a11y-2fa.spec.ts — Cổng a11y cho khối "Xác thực hai bước" (trang Hồ sơ).
//
// Vì sao cần spec RIÊNG: `e2e/a11y.spec.ts` quét 9 route công khai/học tập, KHÔNG có `/profile`.
// Khối 2FA lại nằm đúng ở đó, và mặc định THU GỌN — nghĩa là kể cả có quét trang Hồ sơ thì nội
// dung bên trong cũng không bị chạm tới. Spec này mở khối ra rồi mới quét.
//
// Phạm vi quét giới hạn trong chính khối 2FA (`include`) chứ không cả trang: mục tiêu là gác phần
// MỚI thêm, không vô tình biến spec này thành cổng cho toàn bộ trang Hồ sơ vốn chưa từng được gác.

import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, type ThemeName } from './helpers/auth'
import { freezeAnimations } from './helpers/axe'

const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']
// CSS selector THUẦN: axe không hiểu cú pháp riêng của Playwright (`:has-text()`).
const SECTION = '#two-factor-section'

async function scanSection(page: Page) {
  await freezeAnimations(page)
  const { violations } = await new AxeBuilder({ page })
    .include(SECTION)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['meta-viewport'])
    .analyze()
  return violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} phần tử)`)
}

for (const theme of THEMES) {
  test(`a11y: khối 2FA (đã mở) theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })

    const toggle = page.getByRole('button', { name: /Xác thực hai bước/ })
    await toggle.waitFor({ state: 'visible', timeout: 15_000 })
    await toggle.click()
    // Chờ nội dung bên trong render xong rồi mới quét — quét sớm sẽ bỏ sót đúng phần cần gác.
    await expect(page.getByRole('button', { name: /Bật xác thực hai bước/ })).toBeVisible()

    expect(await scanSection(page)).toEqual([])
  })
}

// ── Các trạng thái SÂU HƠN ─────────────────────────────────────────────────────────────
// Đây mới là chỗ dễ vỡ tương phản nhất: bảng mã khôi phục (chữ hổ phách trên nền hổ phách) và
// khối tắt 2FA (nền hồng). Chúng chỉ hiện sau khi server trả dữ liệu, nên phải giả lập API.
async function mockApi(page: Page, status: Record<string, unknown>) {
  await page.route('**/api/two-factor', async (route) => {
    const req = route.request()
    if (req.method() === 'GET') {
      return route.fulfill({ json: status })
    }
    const body = JSON.parse(req.postData() || '{}') as { action?: string }
    if (body.action === 'setup') {
      return route.fulfill({
        json: {
          secret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
          otpauthUri: 'otpauth://totp/DHCB:e2e?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
        },
      })
    }
    return route.fulfill({
      json: { ok: true, recoveryCodes: Array.from({ length: 10 }, (_, i) => `ABCD-EFGH-IJK${i}L`) },
    })
  })
}

for (const theme of THEMES) {
  test(`a11y: 2FA — màn quét QR, theme=${theme}`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page, { enabled: false, pending: false, recoveryCodesLeft: 0 })
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })

    await page.getByRole('button', { name: /Xác thực hai bước/ }).click()
    await page.getByRole('button', { name: /Bật xác thực hai bước/ }).click()
    await expect(page.getByLabel(/Nhập mã 6 số/)).toBeVisible()

    expect(await scanSection(page)).toEqual([])
  })

  test(`a11y: 2FA — bảng mã khôi phục, theme=${theme}`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page, { enabled: false, pending: false, recoveryCodesLeft: 0 })
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })

    await page.getByRole('button', { name: /Xác thực hai bước/ }).click()
    await page.getByRole('button', { name: /Bật xác thực hai bước/ }).click()
    await page.getByLabel(/Nhập mã 6 số/).fill('123456')
    await page.getByRole('button', { name: /^Xác nhận$/ }).click()
    await expect(page.getByText(/Mã khôi phục — lưu lại ngay/)).toBeVisible()

    expect(await scanSection(page)).toEqual([])
  })

  test(`a11y: 2FA — đã bật + khối tắt, theme=${theme}`, async ({ page }) => {
    await mockLogin(page, 'vi', theme)
    await mockApi(page, { enabled: true, pending: false, recoveryCodesLeft: 2 })
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })

    await page.getByRole('button', { name: /Xác thực hai bước/ }).click()
    await page.getByRole('button', { name: /Tắt xác thực hai bước/ }).click()
    await expect(page.getByLabel(/Nhập thêm mật khẩu/)).toBeVisible()

    expect(await scanSection(page)).toEqual([])
  })
}

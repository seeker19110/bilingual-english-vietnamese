import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, type ThemeName } from './helpers/auth'
import { freezeAnimations } from './helpers/axe'

// ─────────────────────────────────────────────────────────────────────────────
// QUÉT WCAG 2.x mức AAA — bổ sung cho e2e/a11y.spec.ts (file kia gác mức A/AA).
//
// LUẬT DỰ ÁN (CLAUDE.md mục 4.5), theo khuyến nghị của W3C:
//   - W3C (Understanding Conformance) KHÔNG khuyến nghị lấy AAA làm chính sách cho
//     TOÀN site vì có loại nội dung không thể đạt hết AAA.
//   - Nên: **NỘI DUNG và TIÊU ĐỀ** (chữ đọc: h1–h6, p, li, bảng, blockquote…) phải
//     đạt **AAA**; mọi phần còn lại (nav, nút, badge, ô nhập, biểu tượng…) phải đạt
//     **AA** — cổng AA tuyệt đối 0 vi phạm nằm ở e2e/a11y.spec.ts.
//
// Vì hôm nay phần nội dung/tiêu đề chưa đạt hết AAA, cổng này chạy kiểu "bánh cóc"
// (ratchet) — chỉ cho phép đi xuống:
//   1. Vi phạm AAA KHÔNG PHẢI `color-contrast-enhanced` → FAIL ngay (dung sai 0).
//   2. `color-contrast-enhanced` (≥ 7:1) trên nội dung/tiêu đề → FAIL khi số phần tử
//      VƯỢT baseline. Baseline = nợ kỹ thuật đo ngày 2026-08-04, KHÔNG được tăng.
//      Sửa bớt được phần tử nào thì HẠ baseline (test in ra nhắc).
//   3. Trang/theme thiếu baseline → FAIL, buộc khai báo khi thêm màn hình mới.
//
// Đích cuối: mọi ô về 0, rồi đổi cổng thành "0 vi phạm" tuyệt đối. Xem PROGRESS.md.
// ─────────────────────────────────────────────────────────────────────────────

const AAA_TAGS = ['wcag2aaa', 'wcag21aaa', 'wcag22aaa']

// "Nội dung và tiêu đề": phần tử chữ để ĐỌC.
const CONTENT_SELECTOR =
  'h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,td,th,article,main > div'
// Loại phần "vỏ giao diện" (điều hướng, nút bấm, nhãn ô nhập…) — nhóm này chỉ buộc AA.
const CHROME_ANCESTOR = 'nav,header,footer,button,a,[role="button"],[role="tab"],label,input,select'

// Quét CẢ 5 theme (4 theme chính + "Nhi đồng") vì tương phản phụ thuộc bộ token màu.
const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']

const ROUTES = [
  '/login',
  '/',
  '/progress',
  '/dictionary',
  '/lessons',
  '/history',
  '/phrases',
  '/learning-path',
  '/learning-path/a1', // trang riêng cấp CEFR (6 cấp dùng chung layout)
  '/learning-path/c1', // cấp nâng cao (accent rose) — gồm cả màn khóa
  '/chat',
  '/writing',
  '/speaking',
  '/profile',
  '/challenge',
] as const

type Route = (typeof ROUTES)[number]

// Số phần tử nội dung/tiêu đề còn rớt 7:1, đo ngày 2026-08-04 (tổng ~305).
// Theme mặc định "Xanh đêm" gần như đã đạt (chỉ 1) — nợ tập trung ở 2 theme nền sáng
// Pink/Nhi đồng (dùng chung bộ token) và các trang nhiều nhãn màu cố định.
const BASE0: Record<Route, number> = {
  '/login': 0,
  '/': 0,
  '/progress': 0,
  '/dictionary': 0,
  '/lessons': 0,
  '/history': 0,
  '/phrases': 0,
  '/learning-path': 0,
  '/learning-path/a1': 0,
  '/learning-path/c1': 0,
  '/chat': 0,
  '/writing': 0,
  '/speaking': 0,
  '/profile': 0,
  '/challenge': 0,
}

const BASELINE: Record<ThemeName, Record<Route, number>> = {
  'dark-blue': { ...BASE0, '/profile': 1 },
  'blue-sky': { ...BASE0, '/': 1, '/progress': 11, '/profile': 11, '/challenge': 3 },
  pink: {
    ...BASE0,
    '/': 2,
    '/progress': 20,
    '/dictionary': 1,
    '/lessons': 1,
    '/history': 3,
    '/phrases': 1,
    '/learning-path': 18,
    '/learning-path/a1': 38,
    '/learning-path/c1': 3,
    '/chat': 3,
    '/writing': 2,
    '/speaking': 2,
    '/profile': 17,
    '/challenge': 5,
  },
  vibrant: { ...BASE0, '/learning-path': 11, '/learning-path/a1': 36, '/learning-path/c1': 1 },
  kid: {
    ...BASE0,
    '/': 2,
    '/progress': 20,
    '/dictionary': 1,
    '/lessons': 1,
    '/history': 3,
    '/phrases': 1,
    '/learning-path': 18,
    '/learning-path/a1': 38,
    '/learning-path/c1': 3,
    '/chat': 3,
    '/writing': 2,
    '/speaking': 2,
    '/profile': 17,
    '/challenge': 5,
  },
}

// Đếm số phần tử vi phạm NẰM TRONG phần nội dung/tiêu đề (bỏ phần vỏ giao diện).
async function countContentNodes(page: Page, targets: string[]): Promise<number> {
  return page.evaluate(
    ({ targets, content, chrome }) =>
      targets.filter((t) => {
        const el = t ? document.querySelector(t) : null
        return !!el && el.matches(content) && !el.closest(chrome)
      }).length,
    { targets, content: CONTENT_SELECTOR, chrome: CHROME_ANCESTOR },
  )
}

async function scanAaa(page: Page) {
  await freezeAnimations(page)
  const { violations } = await new AxeBuilder({ page }).withTags(AAA_TAGS).analyze()

  const otherRules: string[] = []
  let contrastNodes = 0
  for (const v of violations) {
    const targets = v.nodes.map((n) => (Array.isArray(n.target) ? String(n.target[0]) : ''))
    const n = await countContentNodes(page, targets)
    if (n === 0) continue // chỉ dính phần vỏ giao diện → thuộc phạm vi cổng AA
    if (v.id === 'color-contrast-enhanced') contrastNodes = n
    else otherRules.push(`${v.id} (${n} phần tử)`)
  }
  return { contrastNodes, otherRules }
}

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`a11y AAA (nội dung + tiêu đề): ${route} theme=${theme}`, async ({ page }) => {
      await mockLogin(page, 'vi', theme)
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      // Dữ liệu curriculum/từ điển tính OFFLINE ở client (networkidle không giúp) nên
      // chờ cố định cho render xong — cùng cách làm với e2e/a11y.spec.ts.
      await page.waitForTimeout(1200)

      const { contrastNodes, otherRules } = await scanAaa(page)
      const allowed = BASELINE[theme][route]

      // (1) Mọi tiêu chí AAA khác trên nội dung/tiêu đề: dung sai 0.
      expect(otherRules, `Vi phạm AAA mới (ngoài tương phản) ở ${route} theme=${theme}`).toEqual([])

      // (2)+(3) Tương phản nâng cao 7:1 — chỉ được đi xuống so với baseline.
      expect(
        contrastNodes,
        `color-contrast-enhanced (nội dung/tiêu đề) ở ${route} theme=${theme}: ${contrastNodes} phần tử > baseline ${allowed}. ` +
          `Sửa màu chữ cho đạt 7:1, hoặc nếu là màn hình mới thì khai báo baseline trong e2e/a11y-aaa.spec.ts.`,
      ).toBeLessThanOrEqual(allowed)

      if (contrastNodes < allowed) {
        // Nhắc hạ baseline để cổng bánh cóc siết dần (không fail test).
        console.log(
          `[AAA ratchet] ${route} theme=${theme}: còn ${contrastNodes} phần tử (baseline ${allowed}) → hãy hạ baseline xuống ${contrastNodes}.`,
        )
      }
    })
  }
}

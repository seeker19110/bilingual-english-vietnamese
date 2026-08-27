import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, type ThemeName } from './helpers/auth'
import { openLiveLocationTrip } from './helpers/location'
import { freezeAnimations } from './helpers/axe'

// ─────────────────────────────────────────────────────────────────────────────
// QUÉT WCAG 2.x mức AAA — bổ sung cho e2e/a11y.spec.ts (file kia gác mức A/AA).
//
// LUẬT DỰ ÁN (CLAUDE.md mục 4.5), theo khuyến nghị của W3C:
//   - W3C (Understanding Conformance) KHÔNG khuyến nghị lấy AAA làm chính sách cho
//     TOÀN site vì có loại nội dung không thể đạt hết AAA.
//   - Nên: **NỘI DUNG và TIÊU ĐỀ** (chữ để đọc: h1–h6, p, li, bảng, blockquote…) phải
//     đạt **AAA** (tương phản ≥ 7:1); mọi phần còn lại (nav, nút, badge, ô nhập, biểu
//     tượng…) phải đạt **AA** — cổng AA tuyệt đối 0 vi phạm ở e2e/a11y.spec.ts.
//
// Cổng này TUYỆT ĐỐI: 0 vi phạm AAA trên nội dung/tiêu đề, 15 trang × 5 theme.
// Nợ tương phản cũ (~305 phần tử) đã xử lý xong ngày 2026-08-04 bằng cách chỉnh token
// --z-300/--z-400 của cả 5 theme (xem apps/dhcb/src/index.css + PROGRESS.md), nên
// KHÔNG còn baseline nào — thêm màn hình mới mà rớt 7:1 là fail ngay.
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
  '/tien-do',
  '/tu-dien',
  '/bai-hoc',
  '/lich-su-hoc',
  '/cau-thong-dung',
  '/lo-trinh-hoc',
  '/lo-trinh-hoc/a1', // trang riêng cấp CEFR (6 cấp dùng chung layout)
  '/lo-trinh-hoc/c1', // cấp nâng cao (accent rose) — gồm cả màn khóa
  '/tro-truyen',
  '/luyen-viet',
  '/luyen-noi',
  '/cai-dat',
  '/thu-thach',
  '/lap-trinh', // môn Lập trình: tổng quan P1–P6 (PR-L1)
  '/lap-trinh/p1', // trang một bậc (6 bậc dùng chung layout)
  '/lap-trinh/chay-thu', // sandbox chạy Python (PR-L2)
  '/lap-trinh/bai-hoc/p1-u4-l1', // bài học 8 bước (PR-L3)
  '/lap-trinh/du-an', // dự án trục chặng P1 (PR-L3b)
  '/lap-trinh/on-tap', // ôn thẻ SRS môn Lập trình (PR-L10) — màn rỗng khi chưa có thẻ
  '/lap-trinh/gioi-thieu', // mô tả khoá học & mục tiêu (PR-UX3) — trang gần như toàn chữ đọc
  '/lap-trinh/huong', // danh sách 12 hướng chuyên sâu (PR-L-SPEC)
  '/lap-trinh/huong/web', // chi tiết một hướng — trang chữ dài, nhiều tương phản
  '/lap-trinh/huong/architecture', // hướng kiến trúc — trang chi tiết dài nhất, nhiều danh sách chữ
] as const

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

  const violated: string[] = []
  for (const v of violations) {
    const targets = v.nodes.map((n) => (Array.isArray(n.target) ? String(n.target[0]) : ''))
    const n = await countContentNodes(page, targets)
    if (n === 0) continue // chỉ dính phần vỏ giao diện → thuộc phạm vi cổng AA
    violated.push(`${v.id} (${n} phần tử)`)
  }
  return violated
}

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`a11y AAA (nội dung + tiêu đề): ${route} theme=${theme}`, async ({ page }) => {
      await mockLogin(page, 'vi', theme)
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      // Dữ liệu curriculum/từ điển tính OFFLINE ở client (networkidle không giúp) nên
      // chờ cố định cho render xong — cùng cách làm với e2e/a11y.spec.ts.
      await page.waitForTimeout(1200)

      const violated = await scanAaa(page)
      expect(
        violated,
        `Vi phạm WCAG AAA trên nội dung/tiêu đề ở ${route} theme=${theme} — ` +
          `chữ nội dung phải đạt tương phản ≥ 7:1 (chỉnh token màu ở apps/dhcb/src/index.css).`,
      ).toEqual([])
    })
  }
}

// Khối AI phản hồi code (PR-L5) chỉ hiện ở bước "Tự viết" sau khi gọi API → vòng quét theo
// ROUTES ở trên không thấy. Quét riêng đúng trạng thái đó, đủ 5 theme.
for (const theme of THEMES) {
  test(`a11y AAA (nội dung + tiêu đề): AI xem code (Lập trình) theme=${theme}`, async ({
    page,
  }) => {
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

    const violated = await scanAaa(page)
    expect(violated, `Vi phạm WCAG AAA trên khối AI phản hồi code, theme=${theme}.`).toEqual([])
  })
}

// Màn "Đi chung" khi ĐANG TRONG CHUYẾN — cũng nằm ngoài vòng quét theo ROUTES ở trên vì
// giao diện chỉ dựng sau khi có dữ liệu chuyến. Fixture dùng chung với cổng A/AA.
for (const theme of THEMES) {
  test(`a11y AAA (nội dung + tiêu đề): Đi chung — trong chuyến theme=${theme}`, async ({
    page,
  }) => {
    await openLiveLocationTrip(page, theme)
    const violated = await scanAaa(page)
    expect(
      violated,
      `Vi phạm WCAG AAA trên nội dung/tiêu đề ở /nhom-di-chung theme=${theme} — ` +
        `chữ nội dung phải đạt tương phản ≥ 7:1 (chỉnh token màu ở apps/dhcb/src/index.css).`,
    ).toEqual([])
  })
}

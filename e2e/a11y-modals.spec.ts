import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockLogin, type ThemeName } from './helpers/auth'
import { mockDomainApis } from './helpers/domains'
import { freezeAnimations } from './helpers/axe'

// ── CỔNG A11Y CHO HỘP THOẠI ĐANG MỞ ────────────────────────────────────────────
//
// Vì sao cần file riêng: `e2e/a11y.spec.ts` quét 4 trang trụ cột nhưng CHỈ ở trạng
// thái hộp thoại đang ĐÓNG. 15 hộp thoại của Career/Work/Startup/Life nằm sau
// `{showXModal && ...}` nên axe chưa từng nhìn thấy chúng — và quả thật chúng từng
// thiếu sạch role="dialog", aria-modal, phím Escape, bẫy tiêu điểm, cùng ~49 thẻ
// <label> không gắn với ô nhập. Cổng "0 vi phạm" khi đó xanh trên phần UI KHÔNG
// chứa hộp thoại.
//
// Mỗi test mở LẦN LƯỢT mọi hộp thoại của một trang trong CÙNG một lần tải trang
// (thay vì mỗi hộp thoại một test): 4 trang × 5 theme = 20 test thay vì 75, giữ
// thời gian tường của mảnh E2E ở mức chấp nhận được (luật CI mục 11.1).

async function scan(page: Page) {
  await freezeAnimations(page)
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['meta-viewport'])
    .analyze()
  return violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} phần tử)`)
}

const THEMES: ThemeName[] = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']

/** Một hộp thoại: tên tab phải bấm trước (nếu có) và tên nút mở nó. */
type ModalCase = { tab?: string; trigger: string; title: string }

const PAGES: { name: string; route: string; modals: ModalCase[] }[] = [
  {
    name: 'Sự nghiệp',
    route: '/su-nghiep-khoi-nghiep?muc=su-nghiep',
    modals: [
      { trigger: 'Thiết lập hồ sơ', title: 'Thiết Lập Hồ Sơ Sự Nghiệp' },
      { trigger: 'Thêm mục tiêu', title: 'Thêm Mục Tiêu Sự Nghiệp' },
      { trigger: 'Thêm', title: 'Thêm Kinh Nghiệm Làm Việc' },
    ],
  },
  {
    name: 'Khởi nghiệp',
    route: '/su-nghiep-khoi-nghiep?muc=khoi-nghiep',
    modals: [
      { trigger: 'Dự án mới', title: 'Tạo Dự Án Khởi Nghiệp' },
      { trigger: 'Thêm bài toán', title: 'Thêm Bài Toán Khách Hàng' },
      { trigger: 'Thêm giả thuyết', title: 'Thêm Giả Thuyết Cần Kiểm Chứng' },
      {
        tab: 'Nhật Ký Bằng Chứng',
        trigger: 'Ghi nhận bằng chứng',
        title: 'Ghi Nhận Bằng Chứng Kiểm Chứng',
      },
    ],
  },
  {
    name: 'Công việc',
    route: '/cong-viec-cuoc-song?muc=cong-viec',
    modals: [
      { tab: 'Công việc', trigger: 'Thêm công việc', title: 'Thêm Công Việc Mới' },
      { tab: 'Dự án', trigger: 'Tạo dự án mới', title: 'Tạo Dự Án Mới' },
      { tab: 'Cuộc họp', trigger: 'Ghi lại cuộc họp', title: 'Ghi Lại Cuộc Họp' },
      { tab: 'Tài liệu', trigger: 'Thêm tài liệu', title: 'Thêm Tài Liệu' },
    ],
  },
  {
    name: 'Cuộc sống',
    route: '/cong-viec-cuoc-song?muc=doi-song',
    modals: [
      { tab: 'Thói quen', trigger: 'Thêm thói quen', title: 'Thêm Thói Quen Mới' },
      { tab: 'Sức khỏe', trigger: 'Check-in Tâm Trạng', title: 'Check-in Sức Khỏe & Tâm Trạng' },
      { tab: 'Kế hoạch', trigger: 'Tạo kế hoạch', title: 'Tạo Kế Hoạch Cuộc Sống' },
      { tab: 'Cột mốc', trigger: 'Thêm cột mốc', title: 'Thêm Cột Mốc Bản Thân' },
    ],
  },
]

for (const pg of PAGES) {
  for (const theme of THEMES) {
    test(`a11y hộp thoại: ${pg.name} theme=${theme} — 0 vi phạm A/AA`, async ({ page }) => {
      await mockLogin(page, 'vi', theme)
      await mockDomainApis(page)
      await page.goto(pg.route, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)

      for (const m of pg.modals) {
        if (m.tab) {
          await page
            .getByRole('button', { name: new RegExp(m.tab) })
            .first()
            .click()
        }
        await page.getByRole('button', { name: m.trigger, exact: true }).first().click()

        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        // Tên có thể truy cập của hộp thoại phải là tiêu đề của nó (aria-labelledby).
        await expect(dialog).toHaveAccessibleName(m.title)

        const violations = await scan(page)
        expect(violations, `hộp thoại "${m.title}"`).toEqual([])

        // Escape phải đóng được — hành vi bắt buộc của WAI-ARIA APG cho dialog.
        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
      }
    })
  }
}

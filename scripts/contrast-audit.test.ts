// scripts/contrast-audit.test.ts — TEST CANH GÁC token màu ngữ nghĩa (chạy trong `npm test`).
//
// VÌ SAO LÀ TEST RIÊNG chứ không dựa vào cổng E2E a11y: hai bộ `e2e/a11y*.spec.ts` đo màu đã
// render thật nên chính xác hơn, nhưng chúng chỉ bắt được lỗi Ở NHỮNG CHỖ ĐANG ĐƯỢC DÙNG. Một
// token khai sai vẫn có thể lọt nếu chưa trang nào dùng tới nó — rồi vỡ sau, ở PR của người
// khác, xa nguyên nhân. Test này đo THẲNG bảng token, nên bắt lỗi ngay tại nguồn và trong ~5ms.
//
// Ngưỡng theo CLAUDE.md mục 4.5: chữ nội dung/tiêu đề AAA (≥7:1), phần còn lại AA (≥4.5:1).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AA, AAA, contrastRatio, parseThemeTokens } from './lib/contrast.js'

const css = readFileSync(join(process.cwd(), 'packages', 'core-ui', 'theme.css'), 'utf-8')
const themes = parseThemeTokens(css)

/** 5 theme của dự án — nếu thêm theme mới mà quên khai màu, test này đỏ ngay. */
const THEME_NAMES = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid'] as const

/** Bề mặt nền mà token ngữ nghĩa trỏ tới (khối `:root` cuối `theme.css`). */
const SURFACES = ['z-950', 'z-900', 'z-800'] as const

/** Màu chữ ngữ nghĩa + ngưỡng bắt buộc của từng vai trò. */
const TEXT_ROLES = [
  { role: 'text-primary', token: 'z-100', need: AAA },
  { role: 'text-secondary', token: 'z-300', need: AAA },
  { role: 'text-muted', token: 'z-400', need: AA },
  { role: 'text-disabled', token: 'z-500', need: AA },
] as const

describe('token màu ngữ nghĩa', () => {
  it('đọc được đủ 5 theme từ theme.css', () => {
    for (const name of THEME_NAMES) {
      expect(themes[name], `thiếu theme ${name}`).toBeDefined()
    }
  })

  for (const name of THEME_NAMES) {
    for (const surface of SURFACES) {
      for (const { role, token, need } of TEXT_ROLES) {
        it(`${name}: ${role} trên ${surface} đạt ${need}:1`, () => {
          const tokens = themes[name]
          expect(tokens).toBeDefined()
          const fg = tokens?.[token]
          const bg = tokens?.[surface]
          expect(fg, `thiếu --${token} ở theme ${name}`).toBeDefined()
          expect(bg, `thiếu --${surface} ở theme ${name}`).toBeDefined()
          const ratio = contrastRatio(
            fg as [number, number, number],
            bg as [number, number, number],
          )
          expect(
            Number(ratio.toFixed(2)),
            `${role} (--${token}) trên --${surface} chỉ đạt ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(need)
        })
      }
    }
  }

  // Bẫy đã đo và ghi lại trong theme.css: `--z-600` không bao giờ đủ tương phản làm màu chữ
  // (1,59–3,25 trên mọi bề mặt, mọi theme). Test này giữ cho kết luận đó không bị quên và
  // vô tình được đưa vào một token ngữ nghĩa mới.
  it('z-600 KHÔNG đạt cả AA trên mọi bề mặt — không được dùng làm màu chữ', () => {
    for (const name of THEME_NAMES) {
      const tokens = themes[name]
      const fg = tokens?.['z-600']
      if (!fg) continue
      for (const surface of SURFACES) {
        const bg = tokens?.[surface]
        if (!bg) continue
        expect(contrastRatio(fg, bg)).toBeLessThan(AA)
      }
    }
  })
})

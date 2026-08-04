// Cổng tương phản Ở TẦNG DESIGN TOKEN — đọc thẳng biến CSS trong index.css rồi tính
// tỉ lệ tương phản WCAG cho từng cặp (chữ, nền) của TỪNG theme.
//
// Vì sao cần, dù đã có axe trong E2E: axe chỉ thấy màu của những phần tử THỰC SỰ có
// trên trang nó quét. Một token rớt chuẩn nằm im cho tới khi ai đó dùng nó ở trang
// chưa được quét — hoặc ở phần tử render bất đồng bộ, lúc quét trúng lúc không. Đúng
// kiểu lỗi đã làm e2e đỏ chập chờn (nút Facebook, PR #475). Test này bắt ngay ở tầng
// bảng màu, không phụ thuộc trang nào đang được quét.
//
// Ngưỡng: WCAG AA cho chữ thường = 4.5:1 (CLAUDE.md mục 4.5). KHÔNG dùng AAA (7:1) —
// xem PROGRESS.md: AAA buộc bỏ màu nhận diện thương hiệu và chính W3C không khuyến
// nghị áp AAA cho toàn site.
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const AA_NORMAL_TEXT = 4.5

type Rgb = [number, number, number]

/** Theme nền sáng — dùng biến thể `theme-light:` (xem tailwind.config.js). */
const LIGHT_THEMES = new Set(['blue-sky', 'pink', 'kid'])

/** Sắc độ nền được dùng làm BỀ MẶT thật: trang (950), thẻ (900), ô nổi (800/700). */
const SURFACES = ['z-950', 'z-900', 'z-800', 'z-700'] as const

/** Token chữ trung tính, dùng chung mọi theme (thang zinc tự đảo theo theme). */
const NEUTRAL_TEXT = ['c-white', 'z-200', 'z-300', 'z-400', 'z-500'] as const

/**
 * Token chữ màu nhấn — KHÁC NHAU theo nền theme, nên phải tách:
 * theme tối dùng `text-accent-300/400`, theme sáng dùng `theme-light:text-accent-800`
 * (89 chỗ trong mã nguồn). Lấy nhầm cặp sẽ báo lỗi giả.
 */
const ACCENT_TEXT_DARK = ['a-300', 'a-400'] as const
const ACCENT_TEXT_LIGHT = ['a-700', 'a-800'] as const

/**
 * Nợ đã biết: cặp HIỆN CHƯA đạt AA. Cổng này là loại "không tệ hơn hiện tại" — khoá
 * mọi cặp đang đạt, đồng thời không cho phát sinh cặp rớt MỚI.
 *
 * `z-500` là token "chữ mờ" (mã nguồn dùng ~81 chỗ) và rớt AA ở gần như mọi nền, mọi
 * theme — đây là nợ thật, ghi ở PROGRESS.md, chưa xử lý trong PR này vì sửa nó là đổi
 * bảng màu toàn app, phải xem lại từng chỗ dùng.
 * Nhóm nền `z-700`: đã kiểm mã nguồn — sắc độ này hiện chỉ dùng làm màu HOVER
 * (`hover:bg-zinc-700`), không phải bề mặt nghỉ, và chưa chỗ nào đặt chữ phụ hay chữ
 * accent lên nó. Nên đây là BẪY TIỀM ẨN, không phải lỗi đang xảy ra. Vẫn giữ trong ma
 * trận để ngày ai đó dùng z-700 làm nền thật thì thấy ngay là phải chọn sắc chữ khác.
 */
const KNOWN_LOW = new Set<string>([
  // z-500 — chữ mờ, rớt gần như toàn bộ
  'dark-blue|z-500|z-950',
  'dark-blue|z-500|z-900',
  'dark-blue|z-500|z-800',
  'dark-blue|z-500|z-700',
  'blue-sky|z-500|z-900',
  'blue-sky|z-500|z-800',
  'blue-sky|z-500|z-700',
  'pink|z-500|z-950',
  'pink|z-500|z-900',
  'pink|z-500|z-800',
  'pink|z-500|z-700',
  'vibrant|z-500|z-800',
  'vibrant|z-500|z-700',
  'kid|z-500|z-950',
  'kid|z-500|z-900',
  'kid|z-500|z-800',
  'kid|z-500|z-700',
  // [2026-08-04] Nhóm "chữ phụ (z-300/z-400) trên nền z-700" ĐÃ HẾT NỢ: việc siết token
  // --z-300/--z-400 cho đạt AAA 7:1 (xem cổng e2e/a11y-aaa.spec.ts) kéo luôn các cặp này
  // vượt AA, nên đã xoá khỏi danh sách theo đúng yêu cầu của test bên dưới.
  // chữ accent trên nền z-700 (cũng chỉ là màu hover, chưa dùng kèm chữ accent)
  'blue-sky|a-700|z-700',
  'pink|a-700|z-700',
  'vibrant|a-400|z-700',
])

/** Tỉ lệ tương phản theo công thức WCAG 2.x (dùng luminance tương đối). */
export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const channel = (value: number): number => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const luminance = ([r, g, b]: Rgb): number =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/**
 * Đọc bảng màu của từng theme từ index.css. Cố tình PHÂN TÍCH FILE THẬT thay vì chép
 * lại bảng màu vào test — chép lại thì sửa màu ở css mà quên sửa test, cổng thành vô dụng.
 */
function readThemeTokens(): Map<string, Map<string, Rgb>> {
  const cssPath = path.join(import.meta.dirname, '..', 'index.css')
  const css = readFileSync(cssPath, 'utf8')
  const themes = new Map<string, Map<string, Rgb>>()

  for (const block of css.matchAll(/\[data-theme='([^']+)'\]\s*\{([\s\S]*?)\n\}/g)) {
    const tokens = new Map<string, Rgb>()
    for (const token of block[2].matchAll(/--([az]-\d+|c-white):\s*(\d+)\s+(\d+)\s+(\d+)/g)) {
      tokens.set(token[1], [Number(token[2]), Number(token[3]), Number(token[4])])
    }
    themes.set(block[1], tokens)
  }
  return themes
}

const THEMES = readThemeTokens()

describe('bảng màu theme — đọc được từ index.css', () => {
  it('tìm thấy đủ 5 theme', () => {
    expect([...THEMES.keys()].sort()).toEqual(['blue-sky', 'dark-blue', 'kid', 'pink', 'vibrant'])
  })

  it('mỗi theme có đủ token nền và chữ cần kiểm', () => {
    for (const [theme, tokens] of THEMES) {
      for (const token of [...SURFACES, ...NEUTRAL_TEXT]) {
        expect(tokens.get(token), `${theme} thiếu --${token}`).toBeDefined()
      }
    }
  })
})

describe('tương phản chữ trên nền — đạt WCAG AA ở MỌI theme', () => {
  for (const [theme, tokens] of THEMES) {
    const accentText = LIGHT_THEMES.has(theme) ? ACCENT_TEXT_LIGHT : ACCENT_TEXT_DARK
    for (const fg of [...NEUTRAL_TEXT, ...accentText]) {
      for (const bg of SURFACES) {
        const key = `${theme}|${fg}|${bg}`
        if (KNOWN_LOW.has(key)) continue
        it(`${theme}: text-${fg} trên bg-${bg}`, () => {
          const foreground = tokens.get(fg)
          const background = tokens.get(bg)
          expect(foreground, `thiếu --${fg}`).toBeDefined()
          expect(background, `thiếu --${bg}`).toBeDefined()
          expect(contrastRatio(foreground!, background!)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
        })
      }
    }
  }
})

describe('danh sách nợ KNOWN_LOW phải luôn đúng thực tế', () => {
  it('không còn cặp nào trong KNOWN_LOW đã đạt AA mà quên xoá khỏi danh sách', () => {
    const fixed: string[] = []
    for (const key of KNOWN_LOW) {
      const [theme, fg, bg] = key.split('|')
      const tokens = THEMES.get(theme)
      const foreground = tokens?.get(fg)
      const background = tokens?.get(bg)
      if (!foreground || !background) continue
      if (contrastRatio(foreground, background) >= AA_NORMAL_TEXT) fixed.push(key)
    }
    // Sửa được màu là tin tốt — nhưng phải xoá khỏi KNOWN_LOW, không thì lần sau nó
    // tụt lại mà cổng vẫn im lặng cho qua.
    expect(fixed, `đã đạt AA, hãy xoá khỏi KNOWN_LOW: ${fixed.join(', ')}`).toEqual([])
  })

  it('mọi khoá trong KNOWN_LOW đều trỏ tới token có thật', () => {
    for (const key of KNOWN_LOW) {
      const [theme, fg, bg] = key.split('|')
      const tokens = THEMES.get(theme)
      expect(tokens, `theme không tồn tại: ${theme}`).toBeDefined()
      expect(tokens!.get(fg), `token không tồn tại: ${fg} (${key})`).toBeDefined()
      expect(tokens!.get(bg), `token không tồn tại: ${bg} (${key})`).toBeDefined()
    }
  })
})

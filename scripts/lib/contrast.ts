// scripts/lib/contrast.ts — Đo tương phản WCAG cho các token màu của 5 theme.
//
// VÌ SAO CẦN: luật a11y của dự án (CLAUDE.md mục 4.5) là sàn cứng — chữ nội dung/tiêu đề phải
// đạt AAA (≥ 7:1), mọi phần còn lại đạt AA (≥ 4.5:1), ở CẢ 5 theme. Cổng thật là hai bộ E2E
// (`e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts`) quét 15+ trang × 5 theme — chạy rất lâu.
//
// Module này cho phép trả lời câu hỏi "cặp màu này có đạt ngưỡng không" TRONG VÀI MILI GIÂY,
// ngay lúc đang thiết kế, thay vì phải chạy hết E2E rồi mới biết đã chọn sai màu. Nó KHÔNG
// thay thế cổng E2E (E2E đo màu đã render thật, gồm cả overlay/opacity) — nó chặn sớm loại lỗi
// tốn kém nhất: chọn một token làm màu chữ mà token đó không bao giờ đủ tương phản.
//
// Bẫy đã biết, được mã hoá ở đây: 3 theme nền sáng (blue-sky, pink, kid) ĐẢO thang zinc —
// `--z-50` là màu TỐI nhất chứ không phải sáng nhất. Vì vậy không được suy luận "z số nhỏ =
// màu sáng"; luôn phải đọc giá trị thật của từng theme.

/** Một màu ở dạng bộ ba RGB 0–255, đúng dạng biến CSS của dự án (`--z-500: 133 145 163`). */
export type Rgb = readonly [number, number, number]

/** Bảng biến màu của MỘT theme: tên biến (không có `--`) → giá trị RGB. */
export type ThemeTokens = Readonly<Record<string, Rgb>>

/** Toàn bộ theme đọc được từ `theme.css`: tên theme → bảng biến. */
export type ThemeTable = Readonly<Record<string, ThemeTokens>>

/**
 * Tách các khối `:root` / `[data-theme='...']` trong `theme.css` thành bảng biến từng theme.
 *
 * Cố ý dùng regex thay vì kéo thêm một trình phân tích CSS: file `theme.css` do dự án tự viết,
 * cấu trúc cố định (mỗi theme một khối phẳng, mỗi biến một dòng `--ten: r g b;`), và Prettier
 * giữ nguyên định dạng đó. Chỉ nhận biến có ĐÚNG dạng 3 số — các biến khác (`--glow-accent: 0.4`,
 * `--theme-color: #0f172a`) tự bị bỏ qua vì không khớp, đúng ý muốn.
 */
export function parseThemeTokens(css: string): ThemeTable {
  const table: Record<string, Record<string, Rgb>> = {}
  // `:root` (theme mặc định dark-blue) hoặc `[data-theme='x']`, có thể đứng chung một khối.
  const blockRe = /(?:\[data-theme='([a-z-]+)'\]|:root)[^{]*\{([^}]*)\}/g
  let block: RegExpExecArray | null
  while ((block = blockRe.exec(css)) !== null) {
    const name = block[1] ?? 'dark-blue'
    const body = block[2] ?? ''
    const bucket = (table[name] ??= {})
    const varRe = /--([a-z0-9-]+):\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*;/g
    let v: RegExpExecArray | null
    while ((v = varRe.exec(body)) !== null) {
      bucket[v[1] as string] = [Number(v[2]), Number(v[3]), Number(v[4])]
    }
  }
  return table
}

/** Độ chói tương đối theo công thức WCAG 2.x. */
export function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (raw: number): number => {
    const c = raw / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Tỉ số tương phản WCAG giữa hai màu đặc (1.0 … 21.0). Thứ tự hai tham số không quan trọng. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Ngưỡng WCAG dùng trong dự án. */
export const AA = 4.5
export const AAA = 7

/** Kết quả đo một cặp (màu chữ × nền) trong một theme. */
export interface ContrastCheck {
  theme: string
  text: string
  surface: string
  ratio: number
}

/**
 * Đo một danh sách cặp (chữ, nền) trên MỌI theme trong bảng.
 * Cặp nào có token không tồn tại trong theme đó thì bỏ qua (không coi là lỗi) — cho phép
 * thêm token dần cho từng theme mà không làm gãy công cụ.
 */
export function checkPairs(
  themes: ThemeTable,
  pairs: ReadonlyArray<{ text: string; surface: string }>,
): ContrastCheck[] {
  const out: ContrastCheck[] = []
  for (const [theme, tokens] of Object.entries(themes)) {
    for (const { text, surface } of pairs) {
      const fg = tokens[text]
      const bg = tokens[surface]
      if (!fg || !bg) continue
      out.push({ theme, text, surface, ratio: contrastRatio(fg, bg) })
    }
  }
  return out
}

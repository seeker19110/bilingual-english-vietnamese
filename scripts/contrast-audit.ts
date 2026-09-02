// scripts/contrast-audit.ts — In bảng tương phản WCAG của token ngữ nghĩa trên CẢ 5 theme.
//
// Dùng khi: đang thiết kế và cần biết ngay một cặp (màu chữ × bề mặt) có đạt ngưỡng không,
// thay vì chạy hết `npm run test:e2e` (15+ trang × 5 theme) rồi mới phát hiện chọn sai.
//
// Chạy: npx tsx scripts/contrast-audit.ts
//
// Cổng CHẶN thật nằm ở `scripts/contrast-audit.test.ts` (chạy trong `npm test`); file này chỉ
// để đọc bằng mắt khi đang cân nhắc màu.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AA, AAA, contrastRatio, parseThemeTokens } from './lib/contrast.js'

const css = readFileSync(join(process.cwd(), 'packages', 'core-ui', 'theme.css'), 'utf-8')
const themes = parseThemeTokens(css)

// Bề mặt và màu chữ theo tên NGỮ NGHĨA. `theme.css` khai chúng là bí danh trỏ vào `--z-*`,
// mà bí danh thì không phải bộ ba số nên trình phân tích bỏ qua — vì vậy ở đây tra thẳng
// token nền tảng tương ứng. Bảng này phải khớp khối `:root` cuối `theme.css`.
const SURFACES = [
  { name: 'surface-base', token: 'z-950' },
  { name: 'surface-card', token: 'z-900' },
  { name: 'surface-raised', token: 'z-800' },
] as const
const TEXTS = [
  { name: 'text-primary', token: 'z-100', need: AAA },
  { name: 'text-secondary', token: 'z-300', need: AAA },
  { name: 'text-muted', token: 'z-400', need: AA },
  { name: 'text-disabled', token: 'z-500', need: AA },
] as const

const THEME_ORDER = ['dark-blue', 'blue-sky', 'pink', 'vibrant', 'kid']

let worst = Number.POSITIVE_INFINITY
let failures = 0

for (const theme of THEME_ORDER) {
  const tokens = themes[theme]
  if (!tokens) {
    console.log(`\n=== ${theme} — KHÔNG tìm thấy trong theme.css ===`)
    continue
  }
  console.log(`\n=== ${theme} ===`)
  for (const surface of SURFACES) {
    const bg = tokens[surface.token]
    if (!bg) continue
    const cells: string[] = []
    for (const text of TEXTS) {
      const fg = tokens[text.token]
      if (!fg) continue
      const ratio = contrastRatio(fg, bg)
      const ok = ratio >= text.need
      if (!ok) failures += 1
      // `text-muted` chỉ cần AA nên không tính vào biên độ AAA hẹp nhất.
      if (text.need === AAA) worst = Math.min(worst, ratio)
      cells.push(`${text.name}=${ratio.toFixed(2)}${ok ? '' : ' ❌'}`)
    }
    console.log(`  trên ${surface.name.padEnd(14)} | ${cells.join('  ')}`)
  }
}

console.log(`\nBiên độ AAA hẹp nhất: ${worst.toFixed(2)} (ngưỡng ${AAA})`)
console.log(failures === 0 ? 'Tất cả cặp token đạt ngưỡng.' : `${failures} cặp RỚT ngưỡng.`)
process.exit(failures === 0 ? 0 : 1)

// scripts/fixed-color-contrast-audit.ts — Soi các màu Tailwind CỐ ĐỊNH dùng làm màu CHỮ.
//
// VÌ SAO CẦN: thang `zinc`/`accent`/`content` của dự án là biến CSS nên tự đổi theo theme
// (`packages/core-ui/theme.css`). Nhưng giao diện còn dùng RẤT NHIỀU màu Tailwind gốc
// (amber, emerald, rose, purple, cyan…) — những màu này là hex CỐ ĐỊNH, KHÔNG đổi theo theme.
// Ba theme nền sáng (blue-sky, pink, kid) vì thế là chỗ dễ rớt tương phản nhất: một màu chữ
// chọn cho nền tối sẽ nằm trên nền SÁNG mà không ai đổi nó.
//
// Dự án đã có cách vá đúng — biến thể `theme-light:text-<màu>-800` — nhưng chỉ vá tay ở một
// phần nhỏ. Script này tìm những chỗ CHƯA vá và đo xem chúng có thật sự rớt ngưỡng không, để
// việc sửa đi theo BẰNG CHỨNG chứ không theo cảm giác "màu cứng là xấu".
//
// Chạy: npx tsx scripts/fixed-color-contrast-audit.ts
// Cổng CHẶN nằm ở `scripts/fixed-color-contrast-audit.test.ts`.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import colors from 'tailwindcss/colors'
import { AA, contrastRatio, parseThemeTokens, type Rgb } from './lib/contrast.js'

/** Các họ màu Tailwind GỐC (hex cố định). Cố ý KHÔNG gồm `zinc` — dự án đã ánh xạ zinc sang
 *  biến CSS trong `tailwind.config.js`, nên `text-zinc-*` là token chứ không phải màu cứng. */
const FIXED_FAMILIES = [
  'slate',
  'gray',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'cyan',
] as const

/** Ba theme nền sáng — đúng danh sách mà biến thể `theme-light:` áp dụng
 *  (xem `addVariant('theme-light', …)` trong `apps/dhcb/tailwind.config.js`). */
const LIGHT_THEMES = ['blue-sky', 'pink', 'kid'] as const
const DARK_THEMES = ['dark-blue', 'vibrant'] as const

/** Ba bề mặt thật của dự án, theo đúng bảng ở `scripts/contrast-audit.ts`. */
const SURFACES = [
  { name: 'surface-base', token: 'z-950' },
  { name: 'surface-card', token: 'z-900' },
  { name: 'surface-raised', token: 'z-800' },
] as const

export type Finding = {
  file: string
  line: number
  cls: string
  theme: string
  surface: string
  ratio: number
}

function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1] as string, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function paletteRgb(family: string, step: string): Rgb | null {
  const fam = (colors as unknown as Record<string, Record<string, string>>)[family]
  const hex = fam?.[step]
  return typeof hex === 'string' ? hexToRgb(hex) : null
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.tsx')) out.push(p)
  }
  return out
}

// CỐ Ý chỉ khớp class TRẦN (`text-amber-400`), không khớp class có biến thể đứng trước
// (`hover:text-amber-400`, `group-hover:…`, `theme-light:…`). Lý do: cách vá của dự án là
// thêm `theme-light:text-<màu>-800`, mà bản vá đó chỉ đúng cho class trần — vá cho một
// biến thể phải là `theme-light:hover:…`, tức một bài toán khác. Class trần cũng là cái
// quyết định màu Ở TRẠNG THÁI NGHỈ, tức thứ người dùng nhìn thấy gần như toàn bộ thời gian.
const FAMILY_RE = new RegExp(
  `(^|[\\s"'\`{(])text-(${FIXED_FAMILIES.join('|')})-([0-9]{2,3})\\b`,
  'g',
)
// Chữ nằm trên NỀN MÀU ĐẶC (`bg-amber-400 text-slate-950`) thì bề mặt thật là cái nền đó,
// KHÔNG phải nền trang — đo theo nền trang sẽ ra dương tính giả. Nền màu có độ mờ
// (`bg-cyan-500/20`) thì ngược lại: nó chỉ là lớp phủ mỏng, màu nhìn thấy vẫn do nền trang
// quyết định phần lớn, nên vẫn đo.
const OPAQUE_BG_RE = new RegExp(
  `(^|[\\s"'\`{(])bg-(${FIXED_FAMILIES.join('|')})-[0-9]{2,3}(?![0-9/])`,
)
const LIGHT_OVERRIDE_RE = new RegExp(
  `theme-light:text-(${FIXED_FAMILIES.join('|')})-([0-9]{2,3})\\b`,
)

/** Soi một dòng mã: trả về các phát hiện rớt ngưỡng AA trên bề mặt nào, theme nào. */
export function auditLine(
  file: string,
  line: number,
  text: string,
  themes: Record<string, Record<string, Rgb>>,
): Finding[] {
  const found: Finding[] = []
  if (OPAQUE_BG_RE.test(text)) return found
  const override = LIGHT_OVERRIDE_RE.exec(text)
  FAMILY_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = FAMILY_RE.exec(text)) !== null) {
    // Bỏ qua chính cái override (`theme-light:text-…`) — nó được xét riêng bên dưới.
    const family = m[2] as string
    const step = m[3] as string
    const cls = `text-${family}-${step}`
    for (const theme of [...DARK_THEMES, ...LIGHT_THEMES]) {
      const tokens = themes[theme]
      if (!tokens) continue
      // Ở theme nền sáng, nếu dòng có sẵn `theme-light:text-…` thì màu THẬT là màu override.
      const isLight = (LIGHT_THEMES as readonly string[]).includes(theme)
      const eff =
        isLight && override
          ? paletteRgb(override[1] as string, override[2] as string)
          : paletteRgb(family, step)
      if (!eff) continue
      for (const surface of SURFACES) {
        const bg = tokens[surface.token]
        if (!bg) continue
        const ratio = contrastRatio(eff, bg)
        if (ratio < AA) {
          found.push({ file, line, cls, theme, surface: surface.name, ratio })
        }
      }
    }
  }
  return found
}

/**
 * Ngoại lệ CÓ LÝ DO — cố ý rất nhỏ và phải giải thích được. Đây KHÔNG phải "baseline" nới
 * cho nợ cũ (luật a11y của dự án cấm baseline): mỗi mục dưới đây là một chỗ mà phép đo của
 * script sai bản chất, không phải một lỗi được tha.
 *
 * `text-*` đặt trên <input type="checkbox"> KHÔNG phải màu chữ — nó là màu dấu tích của ô
 * chọn (Tailwind forms). Script đo nó như chữ nằm trên nền trang nên báo nhầm.
 *
 * Test canh (`fixed-color-contrast-audit.test.ts`) bắt buộc mỗi mục ở đây phải CÒN khớp thật:
 * mục không còn khớp là mục chết, phải xoá — nhờ vậy danh sách không âm thầm phình ra.
 */
export const ALLOWLIST: ReadonlyArray<{ file: string; cls: string; reason: string }> = [
  {
    file: 'apps/dhcb/src/pages/domains/career/Career.tsx',
    cls: 'text-emerald-600',
    reason: 'màu dấu tích của <input type="checkbox">, không phải màu chữ',
  },
  {
    file: 'apps/dhcb/src/pages/domains/startup/Startup.tsx',
    cls: 'text-emerald-600',
    reason: 'màu dấu tích của <input type="checkbox">, không phải màu chữ',
  },
]

const isAllowed = (f: Finding): boolean =>
  ALLOWLIST.some((a) => a.file === f.file && a.cls === f.cls)

export function auditRepo(root: string): Finding[] {
  const css = readFileSync(join(root, 'packages', 'core-ui', 'theme.css'), 'utf-8')
  const themes = parseThemeTokens(css) as unknown as Record<string, Record<string, Rgb>>
  const files = [
    ...walk(join(root, 'apps', 'dhcb', 'src')),
    ...walk(join(root, 'packages', 'core-ui')),
  ]
  const out: Finding[] = []
  for (const file of files) {
    const rel = relative(root, file)
    readFileSync(file, 'utf-8')
      .split('\n')
      .forEach((text, i) => out.push(...auditLine(rel, i + 1, text, themes)))
  }
  return out.filter((f) => !isAllowed(f))
}

if (process.argv[1]?.endsWith('fixed-color-contrast-audit.ts')) {
  const findings = auditRepo(process.cwd())
  const byClass = new Map<string, Finding[]>()
  for (const f of findings) byClass.set(f.cls, [...(byClass.get(f.cls) ?? []), f])
  const rows = [...byClass.entries()].sort((a, b) => b[1].length - a[1].length)
  console.log(`Tổng: ${findings.length} cặp (chỗ dùng × bề mặt × theme) rớt AA ${AA}:1\n`)
  for (const [cls, list] of rows) {
    const worst = Math.min(...list.map((f) => f.ratio))
    const themes = [...new Set(list.map((f) => f.theme))].join(', ')
    const places = [...new Set(list.map((f) => `${f.file}:${f.line}`))]
    console.log(
      `${cls.padEnd(22)} thấp nhất ${worst.toFixed(2)}  [${themes}]  ${places.length} chỗ`,
    )
    for (const p of places.slice(0, 3)) console.log(`    ${p}`)
    if (places.length > 3) console.log(`    … và ${places.length - 3} chỗ nữa`)
  }
}

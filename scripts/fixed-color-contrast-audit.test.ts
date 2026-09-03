// Cổng CHẶN: không được thêm màu Tailwind CỐ ĐỊNH làm màu chữ mà rớt tương phản AA.
//
// Vì sao cần cổng này khi đã có `e2e/a11y.spec.ts`: bộ E2E quét 15 trang × 5 theme — rất
// nhiều component chỉ hiện trong luồng sâu (modal, tab, trạng thái lỗi) KHÔNG nằm trong 15
// trang đó, nên màu chữ hỏng ở ba theme nền sáng có thể sống rất lâu mà không cổng nào đỏ.
// Đợt 2026-09-03 đo được 720 chỗ như vậy. Cổng này đọc thẳng mã nguồn nên phủ hết mọi
// component, kể cả component chưa có test E2E nào chạm tới.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ALLOWLIST, auditRepo, auditLine } from './fixed-color-contrast-audit.js'
import { parseThemeTokens } from './lib/contrast.js'

const ROOT = process.cwd()

describe('màu Tailwind cố định dùng làm màu chữ', () => {
  it('không chỗ nào rớt AA trên bất kỳ theme nào', () => {
    const findings = auditRepo(ROOT)
    const shown = findings
      .slice(0, 20)
      .map((f) => `${f.file}:${f.line} ${f.cls} [${f.theme}/${f.surface}] ${f.ratio.toFixed(2)}`)
    expect(
      findings.length,
      `Rớt tương phản AA. Cách vá của dự án: thêm biến thể \`theme-light:text-<họ màu>-800/900\`\n` +
        `cạnh class trần (xem ~720 tiền lệ đã vá 2026-09-03), hoặc đổi sang token ngữ nghĩa\n` +
        `(\`text-content-muted\`…). Chạy \`npx tsx scripts/fixed-color-contrast-audit.ts\` để xem\n` +
        `danh sách đầy đủ.\n${shown.join('\n')}`,
    ).toBe(0)
  })

  // Ngoại lệ chỉ được tồn tại khi nó CÒN che một phép đo sai thật. Mục chết phải bị xoá,
  // nếu không danh sách sẽ phình dần thành baseline trá hình — đúng thứ luật a11y cấm.
  it('mỗi mục trong ALLOWLIST vẫn còn khớp thật (không có mục chết)', () => {
    const themes = parseThemeTokens(
      readFileSync(`${ROOT}/packages/core-ui/theme.css`, 'utf-8'),
    ) as never
    for (const entry of ALLOWLIST) {
      const lines = readFileSync(`${ROOT}/${entry.file}`, 'utf-8').split('\n')
      const hits = lines.flatMap((text, i) => auditLine(entry.file, i + 1, text, themes))
      expect(
        hits.some((h) => h.cls === entry.cls),
        `ALLOWLIST có mục chết: ${entry.file} / ${entry.cls} không còn rớt ngưỡng nữa — xoá nó đi.`,
      ).toBe(true)
    }
  })

  it('phát hiện được một ca hỏng cố ý (script không im lặng cho qua)', () => {
    const themes = parseThemeTokens(
      readFileSync(`${ROOT}/packages/core-ui/theme.css`, 'utf-8'),
    ) as never
    const hits = auditLine('x.tsx', 1, '<p className="text-amber-300">chào</p>', themes)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((h) => ['blue-sky', 'pink', 'kid'].includes(h.theme))).toBe(true)
  })

  it('không báo nhầm khi chữ nằm trên nền màu ĐẶC', () => {
    const themes = parseThemeTokens(
      readFileSync(`${ROOT}/packages/core-ui/theme.css`, 'utf-8'),
    ) as never
    expect(
      auditLine('x.tsx', 1, '<span className="bg-amber-400 text-slate-950">x</span>', themes),
    ).toEqual([])
  })
})

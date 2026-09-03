// apps/dhcb/src/pages/core/UiNoise.design.test.ts — Cổng canh chặn quầng sáng nền trang trí
// quay lại (đợt D1 thiết kế lại UI/UX, 2026-09-03).
//
// VÌ SAO CẦN: `blur-2xl`/`blur-3xl` trên một `<div>` tuyệt đối định vị + nền màu mờ là "quầng
// sáng" — dấu hiệu UI do AI sinh liệt kê ở luật 5 mục 9 `.agents/skills/ui-ux-craftsman`. Đo
// 2026-09-03: 8 chỗ trong `apps/`, 7 chỗ là quầng trang trí thuần (đã gỡ ở đợt D1); còn lại
// `Layout.tsx` dùng `backdrop-blur-2xl` cho dropdown nổi (frosted glass thật, không phải quầng
// sáng) nên GIỮ NGUYÊN — test dưới chỉ cấm mẫu quầng sáng, không cấm backdrop-blur.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC_DIR = join(__dirname, '../..')
// Quầng sáng: div tuyệt đối định vị, bo tròn hết cỡ, nền màu mờ, mờ nét — không phải
// `backdrop-blur` (frosted glass hợp lệ trên bề mặt nổi như dropdown/modal).
const GLOW_PATTERN = /rounded-full[^"]*blur-(2xl|3xl)|blur-(2xl|3xl)[^"]*rounded-full/

function listSourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...listSourceFiles(full))
    } else if (
      ['.ts', '.tsx'].includes(extname(entry)) &&
      !entry.endsWith('.test.ts') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.d.ts')
    ) {
      out.push(full)
    }
  }
  return out
}

describe('Không còn quầng sáng nền trang trí (đợt D1)', () => {
  const files = listSourceFiles(SRC_DIR)
  expect(files.length).toBeGreaterThan(100) // canh chống hàm quét bị hỏng rồi lặng lẽ quét rỗng

  it('không file nào chứa mẫu quầng sáng (rounded-full + blur-2xl/3xl)', () => {
    const offenders = files
      .filter((f) => GLOW_PATTERN.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(SRC_DIR.length + 1))
    expect(offenders).toEqual([])
  })
})

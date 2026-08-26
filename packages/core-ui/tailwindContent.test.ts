import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Bất biến: MỌI class Tailwind dùng trong packages/core-ui PHẢI được cấu hình Tailwind của
// app quét tới, nếu không class đó lặng lẽ KHÔNG được sinh ra và mất tác dụng — không lỗi
// build, không cảnh báo, chỉ là giao diện sai.
//
// Đã dính thật (PR #693): apps/dhcb/tailwind.config.js chỉ quét apps/dhcb/src, nên hai class
// của ToastProvider chết lặng:
//   • `z-[100]` của khung toast → toast bị 12 modal `fixed inset-0 z-50` che khuất hoàn toàn;
//   • `theme-light:text-red-800` → chữ toast lỗi rớt tương phản AA ở 3 theme nền sáng.
// apps/hub/tailwind.config.js vốn đã quét đúng — chỉ apps/dhcb bị bỏ sót.

// Vitest chạy từ gốc repo (xem vitest.config.ts). Không dùng import.meta.url vì môi trường
// jsdom không cho nó là URL scheme file.
const repoRoot = process.cwd()

/** Đọc mảng `content` của một cấu hình Tailwind (đọc dạng văn bản, không import ESM). */
function readContentGlobs(configPath: string): string {
  const source = readFileSync(join(repoRoot, configPath), 'utf8')
  const match = source.match(/content:\s*\[([\s\S]*?)\]/)
  expect(match, `Không tìm thấy mảng content trong ${configPath}`).toBeTruthy()
  return match![1]!
}

describe('cấu hình Tailwind phải quét packages/core-ui', () => {
  // Cả hai app đều dùng chung component trong packages/core-ui, nên cả hai đều phải quét.
  for (const configPath of ['apps/dhcb/tailwind.config.js', 'apps/hub/tailwind.config.js']) {
    it(`${configPath} có glob trỏ tới packages/core-ui`, () => {
      expect(readContentGlobs(configPath)).toContain('packages/core-ui/')
    })
  }

  it('core-ui thật sự có class Tailwind cần được sinh ra (test này không vô nghĩa)', () => {
    const dir = join(repoRoot, 'packages/core-ui')
    const classes = readdirSync(dir)
      .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
      .map((f) => readFileSync(join(dir, f), 'utf8'))
      .join('\n')
    // Hai class từng chết lặng — giữ lại làm mốc canh cụ thể, không chỉ canh chung chung.
    expect(classes).toContain('z-[100]')
    expect(classes).toContain('theme-light:text-red-800')
  })
})

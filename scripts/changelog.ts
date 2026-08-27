// scripts/changelog.ts — Xem nhật ký từng đợt việc trong docs/changelog/.
//
// Vì sao là SCRIPT ĐỌC THƯ MỤC chứ không phải file index được commit: một file index sinh tự
// động sẽ lại là file mà MỌI PR cùng sửa — tức dựng lại đúng cái xung đột mà việc tách thư mục
// vừa bỏ đi (xem PROGRESS.md mục "Giai đoạn hiện tại"). Đọc thẳng thư mục thì không có gì để
// xung đột: PR mới chỉ thêm một file mới.
//
// Dùng:
//   npm run changelog              10 đợt gần nhất
//   npm run changelog -- 30        30 đợt gần nhất
//   npm run changelog -- --all     toàn bộ

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHANGELOG_DIR = 'docs/changelog'

/** Tên file hợp lệ: NNNN-YYYY-MM-DD-slug.md — số thứ tự tăng dần theo thời gian. */
export const ENTRY_PATTERN = /^(\d{4})-(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/

export interface ChangelogEntry {
  file: string
  seq: number
  date: string
  title: string
}

/** Đọc mọi đợt việc, sắp MỚI NHẤT TRƯỚC (số thứ tự giảm dần). */
export function readEntries(dir: string = CHANGELOG_DIR): ChangelogEntry[] {
  return (
    readdirSync(dir)
      .map((file) => ({ file, m: ENTRY_PATTERN.exec(file) }))
      .filter((x): x is { file: string; m: RegExpExecArray } => x.m !== null)
      .map(({ file, m }) => {
        const first = readFileSync(join(dir, file), 'utf8').split('\n')[0] ?? ''
        return {
          file,
          seq: Number(m[1]),
          date: m[2]!,
          // Dòng đầu mỗi file là tiêu đề cấp 1. Bỏ "# " và bỏ cụm ngày ở CUỐI tiêu đề —
          // ngày đã có sẵn một cột riêng, in lại lần nữa chỉ làm dòng dài ra.
          title: first
            .replace(/^#\s+/, '')
            .replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, '')
            .trim(),
        }
      })
      // Số trùng là hợp lệ (hai PR song song cùng lấy max+1), nên phải có quy tắc phá hoà cố
      // định: ngày mới hơn trước, rồi tới tên file. Không có nó, thứ tự rơi về thứ tự readdir
      // — khác nhau giữa các máy — nên hook đầu phiên in ra hai kết quả khác nhau cho cùng
      // một thư mục.
      .sort((a, b) => b.seq - a.seq || b.date.localeCompare(a.date) || a.file.localeCompare(b.file))
  )
}

function main(): void {
  const args = process.argv.slice(2)
  const all = args.includes('--all')
  const n = Number(args.find((a) => /^\d+$/.test(a)) ?? 10)

  const entries = readEntries()
  const shown = all ? entries : entries.slice(0, n)

  console.log(`\nNhật ký đợt việc — ${entries.length} đợt trong ${CHANGELOG_DIR}/`)
  console.log(`Đang hiện ${shown.length} đợt mới nhất.\n`)
  for (const e of shown) {
    console.log(`  ${String(e.seq).padStart(4, '0')} · ${e.date}  ${e.title}`)
  }
  if (!all && entries.length > shown.length) {
    console.log(`\n  … còn ${entries.length - shown.length} đợt nữa — thêm --all để xem hết.`)
  }
  // Số kế tiếp: quy ước cấp số của repo là "quét rồi lấy số lớn nhất + 1" (docs/changelog/
  // README.md). Hai PR song song có thể cùng lấy một số — KHÔNG SAO: slug khác nhau nên tên
  // file khác nhau, git không xung đột, và changelog.test.ts chấp nhận số trùng (từ
  // 2026-08-27; trước đó cổng đòi tăng nghiêm ngặt và đã làm PR #703 đỏ bốn lượt).
  console.log(
    `\n  Đợt kế tiếp nên đánh số: ${String((entries[0]?.seq ?? 0) + 1).padStart(4, '0')}\n`,
  )
}

// Chỉ chạy khi gọi trực tiếp, để test import được mà không in ra gì.
if (process.argv[1]?.endsWith('changelog.ts')) main()

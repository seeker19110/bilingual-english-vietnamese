import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CHANGELOG_DIR, ENTRY_PATTERN, readEntries } from './changelog'

// Nhật ký đợt việc nằm ở docs/changelog/, mỗi đợt MỘT FILE (quyết định 2026-08-26 — trước đó
// mọi PR cùng chèn vào đầu PROGRESS.md nên xung đột liên tục). Cả hook đầu phiên
// (.claude/report-status.sh) lẫn `npm run changelog` đều dựa vào ĐÚNG hai quy ước dưới đây:
//   1. tên file NNNN-YYYY-MM-DD-slug.md — số thứ tự quyết định cái nào mới nhất;
//   2. dòng đầu mỗi file là tiêu đề cấp 1.
// Sai một trong hai là đợt việc biến mất khỏi báo cáo mà không có lỗi nào báo ra.

const files = readdirSync(CHANGELOG_DIR).filter((f) => f !== 'README.md')

describe('docs/changelog/', () => {
  it('có đủ file (bản di trú 150 đợt từ PROGRESS.md trở lên)', () => {
    expect(files.length).toBeGreaterThanOrEqual(150)
  })

  it('mọi file đều đúng khuôn tên NNNN-YYYY-MM-DD-slug.md', () => {
    const sai = files.filter((f) => !ENTRY_PATTERN.test(f))
    expect(sai, `Sai khuôn tên: ${sai.join(', ')}`).toEqual([])
  })

  it('dòng đầu mỗi file là tiêu đề cấp 1', () => {
    const sai = files.filter((f) => {
      const first = readFileSync(join(CHANGELOG_DIR, f), 'utf8').split('\n')[0] ?? ''
      return !first.startsWith('# ')
    })
    expect(sai, `Thiếu tiêu đề cấp 1: ${sai.join(', ')}`).toEqual([])
  })

  it('không có file rỗng', () => {
    const rong = files.filter((f) => readFileSync(join(CHANGELOG_DIR, f), 'utf8').trim() === '')
    expect(rong).toEqual([])
  })

  it('readEntries() sắp mới nhất trước và đọc được tiêu đề', () => {
    const entries = readEntries()
    expect(entries.length).toBe(files.length)
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1]!.seq).toBeGreaterThan(entries[i]!.seq)
    }
    expect(entries[0]!.title.length).toBeGreaterThan(0)
  })

  it('PROGRESS.md KHÔNG còn chồng thêm mục đợt việc (nguồn xung đột cũ)', () => {
    const progress = readFileSync('PROGRESS.md', 'utf8')
    const section = progress.slice(progress.indexOf('## Giai đoạn hiện tại'))
    const untilNext = section.slice(0, section.indexOf('\n## ', 5))
    // Mục này nay chỉ là phần TĨNH trỏ sang docs/changelog/ — không còn mục ### nào.
    expect(untilNext).not.toMatch(/^### /m)
    expect(untilNext).toContain('docs/changelog/')
  })
})

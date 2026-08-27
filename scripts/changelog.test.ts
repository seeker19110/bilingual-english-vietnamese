import { describe, it, expect } from 'vitest'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
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
      // KHÔNG dùng toBeGreaterThan: số TRÙNG là hợp lệ. Xem test ngay dưới để biết vì sao.
      expect(entries[i - 1]!.seq).toBeGreaterThanOrEqual(entries[i]!.seq)
    }
    expect(entries[0]!.title.length).toBeGreaterThan(0)
  })

  it('SỐ TRÙNG là hợp lệ — hai PR song song không được làm đỏ CI', () => {
    // Quy ước cấp số: người soạn chạy `npm run changelog`, lấy số lớn nhất + 1. Hai nhánh
    // soạn cùng lúc thì CÙNG thấy một số lớn nhất, nên cùng chọn một số — hệ quả tất yếu của
    // cách cấp số phi tập trung, không phải lỗi của ai. Tên file vẫn khác nhau (slug khác
    // nhau) nên git không xung đột.
    //
    // Trước 2026-08-27 cổng này đòi số TĂNG NGHIÊM NGẶT, tức đánh trượt đúng cái nó không nên
    // chặn — trong khi scripts/changelog.ts vẫn ghi "trùng số không sao". Công cụ và cổng mâu
    // thuẫn nhau, và cổng thắng. Riêng PR #703 dính BỐN lượt CI đỏ vì chuyện này (0154, rồi
    // 0155/0156/0157 cùng lúc, rồi 0159, rồi 0160), mỗi lượt tốn một vòng chạy.
    //
    // Kiểm trên THƯ MỤC GIẢ chứ không trên docs/changelog/ thật: hôm nay thư mục thật không
    // có số trùng nào, nên kiểm ở đó là test đạt một cách rỗng — nó sẽ vẫn xanh kể cả khi luật
    // cũ được đặt lại.
    const dir = mkdtempSync(join(tmpdir(), 'changelog-trung-'))
    writeFileSync(join(dir, '0200-2026-08-27-pr-mot.md'), '# 0200 — đợt của PR một\n')
    writeFileSync(join(dir, '0200-2026-08-27-pr-hai.md'), '# 0200 — đợt của PR hai\n')
    writeFileSync(join(dir, '0199-2026-08-26-truoc-do.md'), '# 0199 — đợt trước đó\n')

    const entries = readEntries(dir)

    // Không mất đợt nào, và mỗi tên file là duy nhất.
    expect(entries.length).toBe(3)
    expect(new Set(entries.map((e) => e.file)).size).toBe(3)
    // Hai đợt cùng số nằm cạnh nhau, đợt cũ hơn xuống cuối.
    expect(entries.map((e) => e.seq)).toEqual([200, 200, 199])
    expect(entries[2]!.title).toBe('0199 — đợt trước đó')

    // Chứng minh luật CŨ sẽ đánh trượt đúng bộ dữ liệu hợp lệ này — nếu ai đó đặt lại
    // toBeGreaterThan thì test trên cùng file sẽ đỏ, và đây là lời giải thích tại chỗ.
    const tangNghiemNgat = entries.every((e, i) => i === 0 || entries[i - 1]!.seq > e.seq)
    expect(tangNghiemNgat).toBe(false)

    rmSync(dir, { recursive: true, force: true })
  })

  it('thứ tự XÁC ĐỊNH khi số trùng — báo cáo đầu phiên không đảo lung tung', () => {
    // Số trùng thì phải có quy tắc phá hoà cố định: ngày mới hơn trước, rồi tới tên file.
    // Không có nó, thứ tự rơi về thứ tự readdir — khác nhau giữa các máy — nên hook đầu phiên
    // in ra hai kết quả khác nhau cho cùng một thư mục.
    const dir = mkdtempSync(join(tmpdir(), 'changelog-thu-tu-'))
    writeFileSync(join(dir, '0300-2026-08-25-cu-nhat.md'), '# 0300 — cũ nhất\n')
    writeFileSync(join(dir, '0300-2026-08-27-moi-nhat.md'), '# 0300 — mới nhất\n')
    writeFileSync(join(dir, '0300-2026-08-26-o-giua.md'), '# 0300 — ở giữa\n')

    // Cùng một số, khác ngày → ngày mới nhất đứng đầu, bất kể readdir trả về thứ tự nào.
    expect(readEntries(dir).map((e) => e.date)).toEqual(['2026-08-27', '2026-08-26', '2026-08-25'])

    // Cùng số, cùng ngày → phá hoà bằng tên file, cũng phải xác định.
    writeFileSync(join(dir, '0301-2026-08-27-b-sau.md'), '# 0301 — b\n')
    writeFileSync(join(dir, '0301-2026-08-27-a-truoc.md'), '# 0301 — a\n')
    expect(
      readEntries(dir)
        .filter((e) => e.seq === 301)
        .map((e) => e.file),
    ).toEqual(['0301-2026-08-27-a-truoc.md', '0301-2026-08-27-b-sau.md'])

    rmSync(dir, { recursive: true, force: true })
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

// Cổng canh cho `.claude/report-status.sh` — bản tóm tắt in ra ở ĐẦU MỖI PHIÊN.
//
// Vì sao cần cổng này: trước 2026-09-03 danh sách nợ kỹ thuật được CHÉP CỨNG vào script và đã
// lỗi thời hai lần (audit 2026-08-01 và 2026-09-03). Nay script đọc thẳng PROGRESS.md, nhưng
// cái giá là nó phụ thuộc vào ĐỊNH DẠNG của file đó: đổi định dạng mục nợ mà không ai hay thì
// script lặng lẽ in ra danh sách RỖNG — hỏng im lặng, đúng thứ tệ nhất cho một bản tóm tắt mà
// mọi phiên đều tin.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SCRIPT = '.claude/report-status.sh'

function chay(progressFile?: string): string {
  return execFileSync('bash', [SCRIPT], {
    encoding: 'utf8',
    env: { ...process.env, ...(progressFile ? { PROGRESS_FILE: progressFile } : {}) },
  })
}

function fileTam(noiDung: string): string {
  const p = join(mkdtempSync(join(tmpdir(), 'dhcb-status-')), 'PROGRESS.md')
  writeFileSync(p, noiDung, 'utf8')
  return p
}

describe('report-status.sh — mục nợ kỹ thuật đọc từ PROGRESS.md', () => {
  it('đọc được nợ thật của dự án, không rỗng', () => {
    const out = chay()
    expect(out).toContain('NỢ KỸ THUẬT CÒN MỞ')
    // Có ít nhất một mục được đánh số → parser còn khớp định dạng thật của PROGRESS.md.
    expect(out).toMatch(/\n {3}1\. .+/)
    expect(out).not.toContain('kiểm lại định dạng PROGRESS.md')
  })

  it('chỉ lấy mục CÒN MỞ (🟡/🔴), bỏ mục đã đóng (gạch ngang)', () => {
    const out = chay(
      fileTam(
        [
          '## Nợ kỹ thuật còn mở',
          '',
          '- 🟡 **[2026-01-01] Nợ còn mở A.** Mô tả dài không cần in.',
          // Dạng THẬT của mục đã đóng trong PROGRESS.md: gạch ngang đặt ngay sau "- ".
          '- ~~🟡~~ **[2026-01-02] Nợ ĐÃ ĐÓNG B.** Không được in.',
          '- ~~🟢 **[2026-01-05] Nợ đã đóng E.**~~ Cũng không được in.',
          // Mục CÒN MỞ nhưng dòng đầu có nhắc ~~gạch ngang~~ — vẫn phải được in.
          '- 🟡 **[2026-01-06] Nợ còn mở F, thay cho ~~cách cũ~~.**',
          '- 🔴 **[2026-01-03] Nợ nặng C.**',
          '',
          '## Mục khác',
          '',
          '- 🟡 **[2026-01-04] Không thuộc mục nợ D.**',
        ].join('\n'),
      ),
    )
    expect(out).toContain('Nợ còn mở A.')
    expect(out).toContain('Nợ nặng C.')
    expect(out).not.toContain('ĐÃ ĐÓNG B')
    expect(out).not.toContain('Nợ đã đóng E')
    expect(out).toContain('Nợ còn mở F')
    // Dừng đúng ở tiêu đề mục kế tiếp, không ăn lan sang mục khác.
    expect(out).not.toContain('Không thuộc mục nợ D')
  })

  it('gom tiêu đề in đậm vắt qua nhiều dòng, không xén giữa chữ tiếng Việt', () => {
    const out = chay(
      fileTam(
        [
          '## Nợ kỹ thuật còn mở',
          '',
          '- 🟡 **[2026-01-01] Tiêu đề rất dài bị xuống dòng giữa chừng nên phải',
          '  gom lại mới đủ nghĩa.** Phần mô tả.',
        ].join('\n'),
      ),
    )
    expect(out).toContain('Tiêu đề rất dài bị xuống dòng giữa chừng nên phải gom lại mới đủ nghĩa.')
  })

  it('đổi định dạng làm parser không khớp → BÁO RÕ, không im lặng in rỗng', () => {
    const out = chay(
      fileTam(['## Nợ kỹ thuật còn mở', '', '* 🟡 Dùng dấu sao thay vì gạch ngang.'].join('\n')),
    )
    expect(out).toContain('kiểm lại định dạng PROGRESS.md')
  })

  it('thiếu file PROGRESS.md → nói rõ, không làm vỡ hook đầu phiên', () => {
    const out = chay('/tmp/khong-ton-tai-dhcb.md')
    expect(out).toContain('không thấy')
    expect(out).toContain('VỊ TRÍ DỰ ÁN HIỆN TẠI')
  })
})

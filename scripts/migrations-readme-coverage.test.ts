// scripts/migrations-readme-coverage.test.ts — Chốt chặn: MỌI file migration phải được ghi
// vào bảng liệt kê trong postgres/migrations/README.md.
//
// VÌ SAO CẦN: bảng đó từng tụt lại rất xa mà không ai biết — đến 2026-08-23 nó dừng ở `0043`
// trong khi repo đã có tới `0059`, thiếu 19 file (kể cả 3 file CŨ hơn 0043: 0027, 0033, 0040).
// Đây là kiểu hỏng IM LẶNG: không công cụ nào báo, chỉ âm thầm khiến người đọc README tưởng
// mình đã nắm hết lịch sử schema. Test này biến nó thành lỗi thấy ngay ở CI.
//
// CỐ Ý chỉ kiểm "có được nhắc tới hay không", KHÔNG kiểm nội dung mô tả: ép định dạng mô tả sẽ
// biến test thành phiền phức mà chẳng bắt được lỗi thật nào.

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const MIGRATIONS_DIR = join(process.cwd(), 'postgres', 'migrations')

describe('postgres/migrations/README.md', () => {
  const sqlFiles = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  const readme = readFileSync(join(MIGRATIONS_DIR, 'README.md'), 'utf-8')

  it('có ít nhất một file migration để kiểm (tự bảo vệ khỏi test rỗng luôn xanh)', () => {
    expect(sqlFiles.length).toBeGreaterThan(0)
  })

  it('liệt kê ĐỦ mọi file .sql trong bảng', () => {
    const missing = sqlFiles.filter((f) => !readme.includes(`\`${f}\``))
    // Báo thẳng tên file thiếu — người sửa biết ngay phải thêm dòng nào, không phải đi dò.
    expect(missing, `Thiếu dòng mô tả trong README cho: ${missing.join(', ')}`).toEqual([])
  })

  it('không nhắc tới file migration đã bị xoá', () => {
    const mentioned = [...readme.matchAll(/`(\d{4}_[a-z0-9_]+\.sql)`/g)].map((m) => m[1])
    const orphan = [...new Set(mentioned)].filter((f) => !sqlFiles.includes(f as string))
    expect(orphan, `README nhắc file không còn tồn tại: ${orphan.join(', ')}`).toEqual([])
  })
})

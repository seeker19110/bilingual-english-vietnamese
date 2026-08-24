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

// ── Chốt chặn số thứ tự migration (audit 2026-08-24, F7) ─────────────────────────────────────
//
// Chuỗi migration LÀ thứ tự thi hành trên DB thật. Hai file cùng số thì thứ tự giữa chúng do
// alphabet của phần đuôi quyết định — tình cờ đúng chứ không phải có chủ đích. Số bị nhảy cóc
// thường là dấu hiệu một file rơi mất khi rebase.
//
// VÌ SAO KHÔNG ĐỔI TÊN 3 CẶP ĐANG CÓ: `scripts/run-pg-migrations.ts` theo dõi migration đã áp
// bằng TÊN FILE (bảng `public._schema_migrations`). Đổi tên một file đã chạy trên production
// khiến runner tưởng nó chưa chạy và CHẠY LẠI trên dữ liệu thật — rủi ro không đáng, chỉ để
// làm đẹp con số. Nên 3 cặp cũ được ghi nhận (grandfather) ở đây, còn từ nay cặp trùng MỚI sẽ
// làm đỏ CI ngay.
const TRUNG_SO_DA_BIET = new Set(['0026', '0027', '0059'])

describe('đánh số file migration', () => {
  const soThuTu = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => f.slice(0, 4))

  it('không phát sinh số TRÙNG mới', () => {
    const dem = new Map<string, number>()
    for (const so of soThuTu) dem.set(so, (dem.get(so) ?? 0) + 1)
    const trungMoi = [...dem.entries()]
      .filter(([so, n]) => n > 1 && !TRUNG_SO_DA_BIET.has(so))
      .map(([so, n]) => `${so} (${n} file)`)
    expect(
      trungMoi,
      `Số migration bị trùng — đổi số file MỚI trước khi merge: ${trungMoi.join(', ')}`,
    ).toEqual([])
  })

  it('không có số bị nhảy cóc', () => {
    const duy = [...new Set(soThuTu)].map(Number).sort((a, b) => a - b)
    const thieu: string[] = []
    for (let n = duy[0] ?? 1; n <= (duy[duy.length - 1] ?? 0); n++) {
      if (!duy.includes(n)) thieu.push(String(n).padStart(4, '0'))
    }
    expect(thieu, `Thiếu số migration (file rơi mất khi rebase?): ${thieu.join(', ')}`).toEqual([])
  })
})

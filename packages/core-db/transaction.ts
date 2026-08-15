// packages/core-db/transaction.ts — Chạy nhiều câu SQL trong 1 transaction Postgres, dùng chung.
//
// Phase 01 "Foundation OS" mục 2 (docs/phases/01-foundation-os.md): "DB access boundary and
// transaction helpers". Trước file này, cả repo chỉ có ĐÚNG 1 chỗ dùng transaction
// (`api/admin-plan-features.ts` PUT — thêm tính năng mới + gán mặc định 3 gói), tự viết tay
// begin/commit/rollback/release. Không sai, nhưng là khuôn tay chép — mọi phase OS sau này chạm
// tới ghi nhiều bảng cùng lúc (Evidence Engine, Mastery Engine...) đều cần lặp lại đúng khuôn đó;
// tách ra một hàm để không ai quên `rollback` hay quên `release()` trong nhánh lỗi.
//
// KHÔNG đổi hành vi transaction hiện có — helper này chỉ BỌC LẠI đúng trình tự
// connect → begin → (chạy fn) → commit / rollback khi lỗi → release, luôn luôn release.

import type { Pool, PoolClient } from 'pg'

/**
 * Chạy `fn` bên trong 1 transaction Postgres lấy từ `pool`.
 *
 * - `fn` nhận `PoolClient` — dùng client này để `query()`, KHÔNG dùng lại `pool.query()` bên
 *   trong `fn` (sẽ mượn 1 connection khác ngoài transaction, không thấy dữ liệu chưa commit).
 * - `fn` ném lỗi (hoặc trả Promise reject) ⇒ tự động `rollback` rồi NÉM LẠI lỗi gốc cho nơi gọi
 *   xử lý (giữ đúng stack/message, không bọc thêm).
 * - `fn` chạy xong không lỗi ⇒ `commit`, trả về giá trị `fn` trả ra.
 * - Client LUÔN được `release()` ở `finally`, dù thành công, lỗi nghiệp vụ, hay lỗi mạng khi
 *   `commit`/`rollback` — tránh rò rỉ connection trong pool (rất dễ gặp khi copy tay từng chỗ).
 */
export async function withTransaction<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await fn(client)
    await client.query('commit')
    return result
  } catch (err) {
    // Bản thân lệnh rollback cũng có thể lỗi (vd mất kết nối giữa chừng) — không để lỗi đó che
    // mất lỗi nghiệp vụ gốc, vốn mới là thứ nơi gọi cần biết để trả đúng mã lỗi (409/500...).
    try {
      await client.query('rollback')
    } catch {
      // im lặng — client sắp release() ngay dưới, transaction dở dang sẽ tự huỷ khi connection đóng.
    }
    throw err
  } finally {
    client.release()
  }
}

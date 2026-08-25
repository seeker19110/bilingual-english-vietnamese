// sqlPrelude — Cách hiển thị KẾT QUẢ truy vấn, dùng chung cho cổng CI và trình duyệt
// (PR-L7b2). Cùng lý do với jsPrelude.ts: hai nơi định dạng lệch nhau một dấu cách là cổng
// xanh nhưng học viên rớt, nên định dạng chỉ được viết MỘT lần, ở đây.
//
// Engine thì cả hai nơi đã là MỘT (sql.js — SQLite biên dịch WASM), nên bài SQL không có rủi
// ro "hai bản khác nhau" như mạch Python (CI chạy python3, học viên chạy Pyodide).

/** Một bảng kết quả của sql.js: tên cột + các dòng giá trị. */
export interface SqlResultTable {
  columns: string[]
  values: unknown[][]
}

/** Ô rỗng in thành NULL để phân biệt với chuỗi rỗng — đây là khác biệt SQL hay bẫy người mới. */
function formatCell(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  return String(v)
}

/**
 * Đổi kết quả truy vấn thành văn bản dạng bảng để đem đi chấm (ProgrammingTestCase so chuỗi,
 * dùng chung với bài Python/JavaScript nên không phải thêm kiểu test-case mới).
 *
 * Câu lệnh không trả dòng nào (CREATE/INSERT/UPDATE) cho mảng rỗng → in lời nhắn rõ ràng thay
 * vì để trống, vì "không thấy gì" là lúc người mới hoang mang nhất.
 */
export function formatSqlResults(tables: SqlResultTable[]): string {
  if (tables.length === 0) return '(khong co dong nao tra ve)'
  return tables
    .map((t) => {
      const header = t.columns.join(' | ')
      const rows = t.values.map((row) => row.map(formatCell).join(' | '))
      return [header, ...rows].join('\n')
    })
    .join('\n\n')
}

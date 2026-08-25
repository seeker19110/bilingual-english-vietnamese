// jsPrelude — Lớp đệm chung cho MỌI nơi chạy JavaScript của bài học (PR-L7b1).
//
// VÌ SAO PHẢI DÙNG CHUNG: bài JS được chạy ở HAI nơi — sandbox iframe trong trình duyệt
// (apps/dhcb/src/lib/jsRunner.ts) và cổng CI chạy bằng node:vm (lessonsJs.test.ts). Hai nơi
// lệch nhau một chút là CI xanh nhưng học viên vẫn rớt. Nên phần "giả lập input()" chỉ được
// viết MỘT lần, ở đây, và cả hai nơi cùng gọi wrapJavaScript().
//
// Bài học môn này dạy Python trước, JavaScript sau; giữ nguyên mô hình "điền sẵn dòng nhập"
// của bài Python (input() đọc tuần tự + echo "câu hỏi + câu trả lời") để học viên không phải
// học lại cách dùng ô "Dữ liệu nhập", và để ProgrammingTestCase dùng chung không phải đổi.

/** Thông điệp khi code gọi input() nhiều hơn số dòng đã điền — nói rõ cách sửa. */
export const JS_INPUT_EXHAUSTED =
  "Chuong trinh goi input() nhung o 'Du lieu nhap' da het dong — hay dien du du lieu (moi dong mot lan input)."

/**
 * Bọc code JavaScript của học viên bằng lớp đệm cung cấp input() đọc từ `stdinLines`.
 * Trả về source chạy được ở cả node:vm lẫn trong thẻ script của iframe sandbox.
 */
export function wrapJavaScript(code: string, stdinLines: string[]): string {
  // Nhúng dữ liệu bằng JSON.stringify hai lần: chuỗi JSON được đặt vào source dưới dạng
  // literal hợp lệ, không thể "thoát" ra ngoài để chèn code (dữ liệu là dữ liệu).
  const linesLiteral = JSON.stringify(JSON.stringify(stdinLines))
  return [
    'const __dhcbLines = JSON.parse(' + linesLiteral + ');',
    'let __dhcbAt = 0;',
    'function input(prompt) {',
    '  if (__dhcbAt >= __dhcbLines.length) {',
    '    throw new Error(' + JSON.stringify(JS_INPUT_EXHAUSTED) + ');',
    '  }',
    '  const value = __dhcbLines[__dhcbAt++];',
    '  console.log(String(prompt === undefined ? "" : prompt) + value);',
    '  return value;',
    '}',
    '',
    code,
    '',
  ].join('\n')
}

/**
 * Gộp các đối số của một lần console.log thành một dòng output, giống cách trình duyệt và
 * node in ra. Dùng chung để hai nơi chạy cho ra CÙNG một chuỗi đem đi chấm.
 */
export function formatConsoleArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'string') return a
      if (a === undefined) return 'undefined'
      try {
        return JSON.stringify(a) ?? String(a)
      } catch {
        return String(a)
      }
    })
    .join(' ')
}

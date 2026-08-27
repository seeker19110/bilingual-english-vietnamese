// lessonMarkdown — bộ đọc markdown TỐI GIẢN cho phần lý thuyết bài học môn Lập trình.
//
// Vì sao tự viết thay vì thêm thư viện: phần `theory` chỉ dùng đúng 5 cấu trúc (đã đếm trên
// toàn bộ 68 bài, xem bảng dưới), trong khi một thư viện markdown đầy đủ nặng vài chục kB —
// ngân sách bundle của app chỉ còn dư ~11% (xem PROGRESS.md "Nợ kỹ thuật còn mở").
//
// Thống kê thật trên 68 bài lúc viết file này:
//   190 dòng thụt lề (code)  ·  118 gạch đầu dòng  ·  110 mục đánh số
//    86 **đậm**              ·   13 `code` trong dòng  ·  1 *nghiêng*
//
// LUẬT QUAN TRỌNG NHẤT — dòng thụt lề là CODE, KHÔNG phân tích cú pháp bên trong.
// Code trong bài chứa đầy ký tự trùng với dấu markdown: `2 ** (lan - 1)`, `COUNT(*)`,
// `# ghi chú`, `` `Xin chao ${ten}` ``. Phân tích chúng như markdown là làm hỏng code hiển
// thị cho học viên — nên khối code đi thẳng ra màn hình, nguyên văn.
//
// Cũng vì thế `#` KHÔNG được hiểu là tiêu đề: cả 2 lần `#` xuất hiện đầu dòng trong dữ liệu
// đều nằm trong khối code (bộ chọn CSS `#tieu-de` và comment Python `# ghi chú`).

/** Một mảnh chữ trong dòng. `code` giữ nguyên văn, không phân tích tiếp. */
export interface InlineNode {
  kind: 'text' | 'bold' | 'italic' | 'code'
  text: string
}

export type LessonBlock =
  | { kind: 'para'; inline: InlineNode[] }
  | { kind: 'bullets'; items: InlineNode[][] }
  | { kind: 'numbers'; items: InlineNode[][] }
  /** Dòng thụt lề — giữ NGUYÊN VĂN, không phân tích markdown bên trong. */
  | { kind: 'code'; code: string }

/**
 * `**đậm**` · `` `code` `` · `*nghiêng*` — quét MỘT lượt, không lồng nhau.
 *
 * Nhánh nghiêng bắt buộc nội dung KHÔNG bắt đầu và KHÔNG kết thúc bằng khoảng trắng, để
 * phép nhân trong câu văn ("mỗi ngày 3 * 5 phút") không bị hiểu nhầm thành chữ nghiêng.
 * Cố tình KHÔNG dùng lookbehind: Safari chỉ hỗ trợ từ 16.4, mà regex sai cú pháp thì hỏng
 * ngay lúc nạp bundle chứ không phải hỏng một chỗ.
 */
const INLINE_RE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^\s*](?:[^*\n]*[^\s*])?\*)/g

/**
 * Tách một dòng chữ thành các mảnh. Dấu markdown không khớp cặp thì giữ nguyên là chữ —
 * người soạn viết dấu sao lẻ (vd "10 * 5") không bị mất ký tự.
 */
export function parseInline(line: string): InlineNode[] {
  const out: InlineNode[] = []
  let last = 0
  for (const m of line.matchAll(INLINE_RE)) {
    const at = m.index
    if (at > last) out.push({ kind: 'text', text: line.slice(last, at) })
    const raw = m[0]
    if (raw.startsWith('**')) out.push({ kind: 'bold', text: raw.slice(2, -2) })
    else if (raw.startsWith('`')) out.push({ kind: 'code', text: raw.slice(1, -1) })
    else out.push({ kind: 'italic', text: raw.slice(1, -1) })
    last = at + raw.length
  }
  if (last < line.length) out.push({ kind: 'text', text: line.slice(last) })
  return out
}

const BULLET_RE = /^- (.*)$/
const NUMBER_RE = /^\d+\.\s+(.*)$/
/** Thụt lề từ 2 dấu cách trở lên = code. Ngưỡng 2 khớp đúng cách các bài đang soạn. */
const INDENT_RE = /^ {2,}\S/

/** Bỏ phần thụt lề CHUNG của cả khối, giữ nguyên thụt lề tương đối bên trong code. */
function dedent(lines: string[]): string {
  const widths = lines.filter((l) => l.trim() !== '').map((l) => l.length - l.trimStart().length)
  const chung = widths.length > 0 ? Math.min(...widths) : 0
  return lines.map((l) => l.slice(chung)).join('\n')
}

/**
 * Đọc phần `theory` thành các khối để hiển thị.
 *
 * Mỗi dòng chữ thường là MỘT đoạn riêng (không gộp các dòng liền nhau): người soạn xuống
 * dòng giữa đoạn là có chủ đích — thường để tách một dòng dẫn ra khỏi ví dụ ngay bên dưới.
 */
export function parseLessonMarkdown(text: string): LessonBlock[] {
  const blocks: LessonBlock[] = []
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    if (line.trim() === '') {
      i += 1
      continue
    }

    // Khối code: gom các dòng thụt lề liền nhau, KHÔNG phân tích bên trong.
    if (INDENT_RE.test(line)) {
      const gom: string[] = []
      while (i < lines.length && INDENT_RE.test(lines[i]!)) {
        gom.push(lines[i]!)
        i += 1
      }
      blocks.push({ kind: 'code', code: dedent(gom) })
      continue
    }

    if (BULLET_RE.test(line)) {
      const items: InlineNode[][] = []
      let m: RegExpMatchArray | null
      while (i < lines.length && (m = lines[i]!.match(BULLET_RE))) {
        items.push(parseInline(m[1]!))
        i += 1
      }
      blocks.push({ kind: 'bullets', items })
      continue
    }

    if (NUMBER_RE.test(line)) {
      const items: InlineNode[][] = []
      let m: RegExpMatchArray | null
      while (i < lines.length && (m = lines[i]!.match(NUMBER_RE))) {
        items.push(parseInline(m[1]!))
        i += 1
      }
      blocks.push({ kind: 'numbers', items })
      continue
    }

    blocks.push({ kind: 'para', inline: parseInline(line) })
    i += 1
  }

  return blocks
}

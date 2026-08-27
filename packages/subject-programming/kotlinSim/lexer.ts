// kotlinSim/lexer — TÁCH TỪ cho bộ chạy Kotlin rút gọn (PR-M7, chương trình M §3).
//
// Vì sao tự viết chứ không dùng thư viện: hiến chương M §3.1 chọn "interpreter viết bằng
// TypeScript, chạy chung một đoạn mã ở CI lẫn trình duyệt" chính là để KHÔNG có khe hở trôi
// giữa hai nơi. Kéo một thư viện ngoài vào là mở lại đúng khe hở đó, chưa kể ngân sách bundle.
//
// Nguyên tắc soạn thông báo lỗi (hiến chương M §3.4): mọi lỗi phải chỉ đúng SỐ DÒNG của học
// viên và viết bằng tiếng Việt dễ hiểu — đây là chỗ bộ chạy tự viết hơn hẳn trình biên dịch
// thật với người mới, và là lý do sư phạm chính đáng thứ hai của cả quyết định này.
//
// KHÁC swiftSim ở hai chỗ đáng ghi, vì đây là nguồn lỗi khi đọc chéo hai bộ chạy:
//   ① Nội suy chuỗi của Kotlin là `$ten` và `${bieu thuc}`, KHÔNG phải `\(...)` như Swift.
//      Dạng `$ten` không có dấu đóng nên phải tự dừng đúng chỗ hết tên — đây là chỗ dễ sai nhất.
//   ② Kotlin KHÔNG có dấu chấm phẩy bắt buộc nhưng CHO PHÉP, và xuống dòng là dấu kết câu.

export type LoaiToken =
  | 'so' // 42, 3.14, 1_000
  | 'chuoi' // "xin chao $ten"
  | 'kyTu' // 'a'
  | 'ten' // tên biến/hàm/lớp
  | 'tuKhoa'
  | 'dau' // toán tử và dấu câu
  | 'xuongDong'
  | 'het'

/** Một mảnh của chuỗi có nội suy: chữ thuần hoặc một biểu thức `$ten` / `${...}`. */
export interface ManhChuoi {
  loai: 'chu' | 'bieuThuc'
  noiDung: string
  /** Dòng bắt đầu của mảnh — để lỗi bên trong `${...}` vẫn chỉ đúng dòng. */
  dong: number
}

export interface Token {
  loai: LoaiToken
  chu: string
  dong: number
  /** Chỉ với token 'chuoi': các mảnh đã tách sẵn (chữ thuần + biểu thức nội suy). */
  manh?: ManhChuoi[]
  /** Chỉ với token 'so': true nếu có dấu chấm thập phân (Double), false là Int. */
  laDouble?: boolean
}

/** Lỗi có thông điệp DẠY ĐƯỢC, luôn kèm số dòng của học viên. */
export class LoiKotlin extends Error {
  constructor(
    message: string,
    readonly dong: number,
  ) {
    super(message)
  }
}

export const TU_KHOA = new Set([
  'val',
  'var',
  'fun',
  'return',
  'if',
  'else',
  'when',
  'while',
  'do',
  'for',
  'in',
  'is',
  'as',
  'break',
  'continue',
  'class',
  'data',
  'object',
  'interface',
  'enum',
  'sealed',
  'open',
  'override',
  'abstract',
  'init',
  'constructor',
  'companion',
  'this',
  'super',
  'true',
  'false',
  'null',
  'try',
  'catch',
  'finally',
  'throw',
  'private',
  'public',
  'protected',
  'internal',
])

/**
 * Toán tử nhiều ký tự, xếp DÀI TRƯỚC NGẮN.
 *
 * Thứ tự ở đây là thứ tự thử khớp, nên `?:` phải đứng trước `?`, và `..` trước `.` — xếp sai
 * là `a ?: b` bị đọc thành `a ?` rồi `: b`, một lỗi im lặng rất khó lần ra.
 */
const DAU_NHIEU_KY_TU = [
  '!==',
  '===',
  '...',
  '<=',
  '>=',
  '==',
  '!=',
  '&&',
  '||',
  '->',
  '?:',
  '?.',
  '!!',
  '..',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '++',
  '--',
]

const DAU_MOT_KY_TU = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '=',
  '<',
  '>',
  '!',
  '?',
  '.',
  ',',
  ':',
  ';',
  '(',
  ')',
  '{',
  '}',
  '[',
  ']',
  '@',
])

/** Ký tự mở đầu một tên: chữ cái bất kỳ (kể cả tiếng Việt có dấu), gạch dưới. */
function laDauTen(c: string): boolean {
  return /[\p{L}_]/u.test(c)
}

/** Ký tự tiếp theo trong một tên: như trên, cộng chữ số. */
function laThanTen(c: string): boolean {
  return /[\p{L}\p{N}_]/u.test(c)
}

/**
 * Tách một chuỗi nguồn Kotlin rút gọn thành danh sách token.
 *
 * Xuống dòng được giữ lại thành token riêng vì Kotlin dùng nó làm dấu kết câu — bỏ đi là
 * không phân biệt được `val a = 1` với `val a = 1` viết dính hai dòng.
 */
export function tachTu(src: string): Token[] {
  const ra: Token[] = []
  let i = 0
  let dong = 1

  const day = (t: Token) => ra.push(t)

  while (i < src.length) {
    const c = src[i]!

    // ── Xuống dòng ──
    if (c === '\n') {
      day({ loai: 'xuongDong', chu: '\n', dong })
      dong++
      i++
      continue
    }

    // ── Khoảng trắng khác ──
    if (c === ' ' || c === '\t' || c === '\r') {
      i++
      continue
    }

    // ── Chú thích một dòng ──
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++
      continue
    }

    // ── Chú thích khối, LỒNG NHAU được (Kotlin cho phép, khác C) ──
    if (c === '/' && src[i + 1] === '*') {
      let sau = 0
      const dongMo = dong
      while (i < src.length) {
        if (src[i] === '/' && src[i + 1] === '*') {
          sau++
          i += 2
        } else if (src[i] === '*' && src[i + 1] === '/') {
          sau--
          i += 2
          if (sau === 0) break
        } else {
          if (src[i] === '\n') dong++
          i++
        }
      }
      if (sau !== 0) {
        throw new LoiKotlin(
          'Chu thich khoi mo bang "/*" ma khong dong bang "*/". Them "*/" vao cuoi phan ghi chu.',
          dongMo,
        )
      }
      continue
    }

    // ── Chuỗi ba nháy (raw string) ──
    if (c === '"' && src[i + 1] === '"' && src[i + 2] === '"') {
      const dongMo = dong
      i += 3
      let chu = ''
      while (i < src.length && !(src[i] === '"' && src[i + 1] === '"' && src[i + 2] === '"')) {
        if (src[i] === '\n') dong++
        chu += src[i]
        i++
      }
      if (i >= src.length) {
        throw new LoiKotlin('Chuoi ba nhay mo ra ma khong dong lai bang """.', dongMo)
      }
      i += 3
      day({ loai: 'chuoi', chu, dong: dongMo, manh: [{ loai: 'chu', noiDung: chu, dong: dongMo }] })
      continue
    }

    // ── Chuỗi thường, có nội suy `$ten` và `${...}` ──
    if (c === '"') {
      const dongMo = dong
      i++
      const manh: ManhChuoi[] = []
      let dem = ''
      const xaChu = () => {
        if (dem !== '') {
          manh.push({ loai: 'chu', noiDung: dem, dong })
          dem = ''
        }
      }
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\n') {
          throw new LoiKotlin(
            'Chuoi mo bang dau nhay kep ma chua dong da xuong dong. Them dau " o cuoi, hoac dung """ cho chuoi nhieu dong.',
            dongMo,
          )
        }
        if (src[i] === '\\') {
          const sau = src[i + 1]
          const bang: Record<string, string> = {
            n: '\n',
            t: '\t',
            r: '\r',
            '"': '"',
            "'": "'",
            '\\': '\\',
            $: '$',
          }
          if (sau !== undefined && sau in bang) {
            dem += bang[sau]!
            i += 2
            continue
          }
          throw new LoiKotlin(
            `Ky tu thoat "\\${sau ?? ''}" khong hop le trong chuoi. Bo chay nay hieu \\n \\t \\r \\" \\' \\\\ va \\$.`,
            dong,
          )
        }
        // Nội suy `${ ... }` — đếm ngoặc để cho phép lồng.
        if (src[i] === '$' && src[i + 1] === '{') {
          xaChu()
          const dongBt = dong
          i += 2
          let sau = 1
          let bt = ''
          while (i < src.length && sau > 0) {
            if (src[i] === '{') sau++
            else if (src[i] === '}') {
              sau--
              if (sau === 0) break
            }
            if (src[i] === '\n') dong++
            bt += src[i]
            i++
          }
          if (sau !== 0) {
            throw new LoiKotlin('Noi suy "${" trong chuoi khong duoc dong bang "}".', dongBt)
          }
          i++ // bỏ qua '}'
          manh.push({ loai: 'bieuThuc', noiDung: bt, dong: dongBt })
          continue
        }
        // Nội suy `$ten` — KHÔNG có dấu đóng, dừng đúng chỗ hết tên.
        if (src[i] === '$' && src[i + 1] !== undefined && laDauTen(src[i + 1]!)) {
          xaChu()
          const dongBt = dong
          i++
          let ten = ''
          while (i < src.length && laThanTen(src[i]!)) {
            ten += src[i]
            i++
          }
          manh.push({ loai: 'bieuThuc', noiDung: ten, dong: dongBt })
          continue
        }
        dem += src[i]
        i++
      }
      if (i >= src.length) {
        throw new LoiKotlin('Chuoi mo bang dau nhay kep ma khong dong lai.', dongMo)
      }
      i++ // bỏ qua '"'
      xaChu()
      day({ loai: 'chuoi', chu: manh.map((m) => m.noiDung).join(''), dong: dongMo, manh })
      continue
    }

    // ── Ký tự đơn 'a' ──
    if (c === "'") {
      const dongMo = dong
      i++
      let gia = ''
      if (src[i] === '\\') {
        const bang: Record<string, string> = {
          n: '\n',
          t: '\t',
          r: '\r',
          "'": "'",
          '"': '"',
          '\\': '\\',
        }
        const sau = src[i + 1]
        if (sau === undefined || !(sau in bang)) {
          throw new LoiKotlin(`Ky tu thoat "\\${sau ?? ''}" khong hop le.`, dongMo)
        }
        gia = bang[sau]!
        i += 2
      } else {
        gia = src[i] ?? ''
        i++
      }
      if (src[i] !== "'") {
        throw new LoiKotlin(
          'Hang ky tu phai dong bang dau nhay don va chi chua DUNG MOT ky tu. Muon nhieu ky tu thi dung dau nhay kep.',
          dongMo,
        )
      }
      i++
      day({ loai: 'kyTu', chu: gia, dong: dongMo })
      continue
    }

    // ── Số ──
    if (/[0-9]/.test(c)) {
      const dongSo = dong
      let chu = ''
      let laDouble = false
      while (i < src.length && /[0-9_]/.test(src[i]!)) {
        if (src[i] !== '_') chu += src[i]
        i++
      }
      // Dấu chấm thập phân — nhưng `1..5` là KHOẢNG, không phải số thực.
      if (src[i] === '.' && src[i + 1] !== '.' && /[0-9]/.test(src[i + 1] ?? '')) {
        laDouble = true
        chu += '.'
        i++
        while (i < src.length && /[0-9_]/.test(src[i]!)) {
          if (src[i] !== '_') chu += src[i]
          i++
        }
      }
      // Hậu tố kiểu — bộ chạy chấp nhận và bỏ qua (số của JavaScript, xem KHAC_BIET).
      if (src[i] === 'L' || src[i] === 'f' || src[i] === 'F') {
        if (src[i] === 'f' || src[i] === 'F') laDouble = true
        i++
      }
      day({ loai: 'so', chu, dong: dongSo, laDouble })
      continue
    }

    // ── Tên và từ khoá ──
    if (laDauTen(c)) {
      const dongTen = dong
      let chu = ''
      while (i < src.length && laThanTen(src[i]!)) {
        chu += src[i]
        i++
      }
      day({ loai: TU_KHOA.has(chu) ? 'tuKhoa' : 'ten', chu, dong: dongTen })
      continue
    }

    // ── Dấu nhiều ký tự ──
    const nhieu = DAU_NHIEU_KY_TU.find((d) => src.startsWith(d, i))
    if (nhieu !== undefined) {
      day({ loai: 'dau', chu: nhieu, dong })
      i += nhieu.length
      continue
    }

    // ── Dấu một ký tự ──
    if (DAU_MOT_KY_TU.has(c)) {
      day({ loai: 'dau', chu: c, dong })
      i++
      continue
    }

    throw new LoiKotlin(
      `Ky tu "${c}" khong dung duoc trong ma Kotlin. Kiem lai xem co go nham ban phim khong.`,
      dong,
    )
  }

  day({ loai: 'het', chu: '', dong })
  return ra
}

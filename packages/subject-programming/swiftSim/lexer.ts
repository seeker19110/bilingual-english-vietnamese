// swiftSim/lexer — TÁCH TỪ cho bộ chạy Swift rút gọn (PR-M3, chương trình M §3).
//
// Vì sao tự viết chứ không dùng thư viện: hiến chương M §3.1 chọn "interpreter viết bằng
// TypeScript, chạy chung một đoạn mã ở CI lẫn trình duyệt" chính là để KHÔNG có khe hở trôi
// giữa hai nơi. Kéo một thư viện ngoài vào là mở lại đúng khe hở đó, chưa kể ngân sách bundle.
//
// Nguyên tắc soạn thông báo lỗi (hiến chương M §3.4): mọi lỗi phải chỉ đúng SỐ DÒNG của học
// viên và viết bằng tiếng Việt dễ hiểu — đây là chỗ bộ chạy tự viết hơn hẳn trình biên dịch
// thật với người mới, và là lý do sư phạm chính đáng thứ hai của cả quyết định này.

export type LoaiToken =
  | 'so' // 42, 3.14
  | 'chuoi' // "xin chao" (có thể kèm nội suy)
  | 'ten' // tên biến/hàm/kiểu
  | 'tuKhoa'
  | 'dau' // toán tử và dấu câu
  | 'xuongDong'
  | 'het'

/** Một mảnh của chuỗi có nội suy: chữ thuần hoặc một biểu thức `\(...)`. */
export interface ManhChuoi {
  loai: 'chu' | 'bieuThuc'
  noiDung: string
  /** Dòng bắt đầu của mảnh — để lỗi bên trong `\(...)` vẫn chỉ đúng dòng. */
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
export class LoiSwift extends Error {
  constructor(
    message: string,
    readonly dong: number,
  ) {
    super(message)
  }
}

export const TU_KHOA = new Set([
  'let',
  'var',
  'func',
  'return',
  'if',
  'else',
  'guard',
  'while',
  'repeat',
  'for',
  'in',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'struct',
  'class',
  'enum',
  'protocol',
  'extension',
  'init',
  'self',
  'mutating',
  'static',
  'true',
  'false',
  'nil',
  'throw',
  'throws',
  'try',
  'do',
  'catch',
  'where',
  'is',
  'as',
  'super',
  'override',
  'get',
  'set',
  'inout',
  'import',
])

/** Toán tử/dấu câu, xếp DÀI TRƯỚC để `..<` không bị đọc nhầm thành `.` `.` `<`. */
const DAU = [
  '...',
  '..<',
  '->',
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '??',
  '+=',
  '-=',
  '*=',
  '/=',
  '?.',
  '(',
  ')',
  '{',
  '}',
  '[',
  ']',
  ',',
  ':',
  ';',
  '.',
  '=',
  '+',
  '-',
  '*',
  '/',
  '%',
  '<',
  '>',
  '!',
  '?',
  '_',
  '&',
]

export function tachToken(src: string): Token[] {
  const ra: Token[] = []
  let i = 0
  let dong = 1

  const cuoiCungLa = (chu: string): boolean => ra[ra.length - 1]?.chu === chu

  while (i < src.length) {
    const c = src[i]!

    if (c === '\n') {
      // Xuống dòng CÓ NGHĨA trong Swift: nó ngăn cách hai câu lệnh. Nhưng nhiều dấu xuống dòng
      // liên tiếp (hoặc ngay sau dấu mở khối) chỉ là khoảng trắng — gộp lại cho parser đỡ nhọc.
      if (ra.length > 0 && ra[ra.length - 1]!.loai !== 'xuongDong') {
        ra.push({ loai: 'xuongDong', chu: '\\n', dong })
      }
      dong += 1
      i += 1
      continue
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      i += 1
      continue
    }
    // Chú thích một dòng.
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i += 1
      continue
    }
    // Chú thích nhiều dòng — Swift cho phép lồng nhau, mô phỏng đúng điểm đó.
    if (c === '/' && src[i + 1] === '*') {
      let sau = 1
      i += 2
      while (i < src.length && sau > 0) {
        if (src[i] === '\n') dong += 1
        if (src[i] === '/' && src[i + 1] === '*') {
          sau += 1
          i += 2
          continue
        }
        if (src[i] === '*' && src[i + 1] === '/') {
          sau -= 1
          i += 2
          continue
        }
        i += 1
      }
      if (sau > 0) throw new LoiSwift('Chu thich /* … */ chua duoc dong lai bang */.', dong)
      continue
    }

    if (c === '"') {
      const { token, next, dongMoi } = docChuoi(src, i, dong)
      ra.push(token)
      i = next
      dong = dongMoi
      continue
    }

    if (/[0-9]/.test(c)) {
      let j = i
      let laDouble = false
      while (j < src.length && /[0-9_]/.test(src[j]!)) j += 1
      if (src[j] === '.' && /[0-9]/.test(src[j + 1] ?? '')) {
        laDouble = true
        j += 1
        while (j < src.length && /[0-9_]/.test(src[j]!)) j += 1
      }
      ra.push({ loai: 'so', chu: src.slice(i, j).replace(/_/g, ''), dong, laDouble })
      i = j
      continue
    }

    // `$0`, `$1`… — tên tham số ngầm của đóng (closure) khi không tự đặt tên.
    if (c === '$' && /[0-9]/.test(src[i + 1] ?? '')) {
      let j = i + 1
      while (j < src.length && /[0-9]/.test(src[j]!)) j += 1
      ra.push({ loai: 'ten', chu: src.slice(i, j), dong })
      i = j
      continue
    }

    // Swift cho phép tên có dấu Unicode (`func nói()` là hợp lệ) — giữ đúng, vì người học
    // Việt Nam hoàn toàn có thể đặt tên biến tiếng Việt có dấu.
    if (/[\p{L}_]/u.test(c)) {
      let j = i
      while (j < src.length && /[\p{L}\p{N}_]/u.test(src[j]!)) j += 1
      const chu = src.slice(i, j)
      // `_` đứng một mình là ký hiệu "bỏ qua" của Swift (nhãn tham số, biến vứt đi) — giữ là dấu.
      ra.push({ loai: chu === '_' ? 'dau' : TU_KHOA.has(chu) ? 'tuKhoa' : 'ten', chu, dong })
      i = j
      continue
    }

    const dau = DAU.find((d) => src.startsWith(d, i))
    if (dau) {
      // `?` ngay sau một TÊN KIỂU là dấu Optional (`Int?`), còn `? :` là toán tử ba ngôi —
      // parser phân biệt bằng ngữ cảnh, lexer chỉ cần trả đúng ký tự.
      ra.push({ loai: 'dau', chu: dau, dong })
      i += dau.length
      continue
    }

    throw new LoiSwift(`Bo chay khong hieu ky tu "${c}".`, dong)
  }

  if (!cuoiCungLa('\\n')) ra.push({ loai: 'xuongDong', chu: '\\n', dong })
  ra.push({ loai: 'het', chu: '', dong })
  return ra
}

/** Đọc một chuỗi có nội suy `"a \(b) c"`, tách sẵn thành các mảnh. */
function docChuoi(
  src: string,
  batDau: number,
  dongVao: number,
): {
  token: Token
  next: number
  dongMoi: number
} {
  const manh: ManhChuoi[] = []
  const dong = dongVao
  let i = batDau + 1
  let dem = ''
  const xa = () => {
    if (dem !== '') {
      manh.push({ loai: 'chu', noiDung: dem, dong })
      dem = ''
    }
  }

  while (i < src.length && src[i] !== '"') {
    if (src[i] === '\n') {
      throw new LoiSwift('Chuoi chua duoc dong lai bang dau nhay kep truoc khi het dong.', dong)
    }
    if (src[i] === '\\' && src[i + 1] === '(') {
      xa()
      let sau = 1
      let j = i + 2
      while (j < src.length && sau > 0) {
        if (src[j] === '(') sau += 1
        else if (src[j] === ')') sau -= 1
        j += 1
      }
      if (sau > 0) throw new LoiSwift('Thieu dau ngoac dong ")" trong chuoi noi suy \\( … ).', dong)
      manh.push({ loai: 'bieuThuc', noiDung: src.slice(i + 2, j - 1), dong })
      i = j
      continue
    }
    if (src[i] === '\\') {
      const sau = src[i + 1]
      const doi: Record<string, string> = { n: '\n', t: '\t', '"': '"', '\\': '\\', "'": "'" }
      if (sau !== undefined && sau in doi) {
        dem += doi[sau]
        i += 2
        continue
      }
      throw new LoiSwift(`Bo chay khong hieu ky tu thoat "\\${sau ?? ''}".`, dong)
    }
    dem += src[i]
    i += 1
  }
  if (i >= src.length) throw new LoiSwift('Chuoi chua duoc dong lai bang dau nhay kep.', dong)
  xa()
  return {
    token: { loai: 'chuoi', chu: src.slice(batDau, i + 1), dong: dongVao, manh },
    next: i + 1,
    dongMoi: dong,
  }
}

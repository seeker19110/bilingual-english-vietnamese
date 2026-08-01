// Chính sách dung sai. Đặc tả §5: docs/research/dac-ta-engine-cham-dung-chung.md
//
// Vì sao cần dung sai theo môn: bài Lý dùng `g = 10` và bài dùng `g = 9,8` cho kết quả lệch
// khoảng 2%; chấm cứng sẽ báo sai hàng loạt dù học sinh làm đúng.

import type { Tolerance } from './types.js'

/**
 * Dung sai mặc định khuyến nghị theo môn — dùng khi soạn đề, KHÔNG áp tự động trong engine
 * (engine không biết đề thuộc môn nào). Con số này phải kiểm chứng bằng bộ test thật rồi mới
 * chốt, xem đặc tả §5.
 */
export const DEFAULT_TOLERANCE_BY_SUBJECT: Record<'math' | 'physics' | 'chemistry', Tolerance> = {
  math: { mode: 'relative', pct: 0.1 },
  // ⚠️ 3% chứ KHÔNG phải 2% như bản đặc tả đầu tiên ước lượng. Đo lại bằng số thật:
  // chênh lệch giữa g = 10 và g = 9,8 là 10/9,8 − 1 = 2,04% — đặt ngưỡng đúng 2% sẽ chấm SAI
  // học sinh làm đúng theo quy ước g = 10. Lấy 3% để có biên an toàn.
  physics: { mode: 'relative', pct: 3 },
  chemistry: { mode: 'relative', pct: 1 }, // hấp thụ chênh lệch nguyên tử khối làm tròn
}

/**
 * Dung sai mặc định khi đề không khai báo: số nguyên thì đòi đúng tuyệt đối, số thập phân thì
 * cho lệch 0,1% (đủ hấp thụ sai số làm tròn trung gian mà không cho qua đáp án sai thật).
 */
export function defaultToleranceFor(expected: number): Tolerance {
  return Number.isInteger(expected) ? { mode: 'exact' } : { mode: 'relative', pct: 0.1 }
}

/** Làm tròn tới `digits` chữ số có nghĩa. */
export function roundToSigFigs(value: number, digits: number): number {
  if (value === 0 || !Number.isFinite(value)) return value
  const magnitude = Math.ceil(Math.log10(Math.abs(value)))
  const factor = Math.pow(10, digits - magnitude)
  return Math.round(value * factor) / factor
}

/** Hai số coi như bằng nhau về mặt dấu phẩy động (dùng để phân biệt CORRECT với CORRECT_LOOSE). */
export function isEssentiallyEqual(a: number, b: number): boolean {
  if (a === b) return true
  const scale = Math.max(Math.abs(a), Math.abs(b), 1)
  return Math.abs(a - b) <= 1e-9 * scale
}

/** Câu trả lời có nằm trong dung sai cho phép không. */
export function withinTolerance(actual: number, expected: number, tol: Tolerance): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false

  switch (tol.mode) {
    case 'exact':
      return isEssentiallyEqual(actual, expected)
    case 'absolute':
      return Math.abs(actual - expected) <= tol.eps
    case 'relative': {
      // Đáp án đúng bằng 0 thì tỉ lệ phần trăm vô nghĩa — lùi về so sánh tuyệt đối.
      if (expected === 0) return Math.abs(actual) <= 1e-9
      return Math.abs(actual - expected) / Math.abs(expected) <= tol.pct / 100
    }
    case 'sigfig':
      return isEssentiallyEqual(
        roundToSigFigs(actual, tol.digits),
        roundToSigFigs(expected, tol.digits),
      )
  }
}

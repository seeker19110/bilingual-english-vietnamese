// grading — Engine chấm THUẦN cho bài học 8 bước (PR-L3): so output test-case (Make),
// kiểm thứ tự Parsons, xáo trộn deterministic. KHÔNG đụng Pyodide/DOM — test được bằng vitest.
import type { ProgrammingTestCase } from './lessonTypes.js'

/**
 * Chuẩn hoá output trước khi so: bỏ khoảng trắng cuối MỖI DÒNG + dòng trống cuối,
 * thống nhất xuống dòng. Người mới hay lệch nhau đúng mấy chỗ này — không phải lỗi logic.
 */
export function normalizeOutput(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n+$/g, '')
}

export interface TestCaseResult {
  label: string
  hidden: boolean
  passed: boolean
  /** Với ca lỗi KHÔNG ẩn: output thật (đã chuẩn hoá, cắt ngắn) để học viên đối chiếu. */
  actual?: string
  /** Thông điệp lỗi runtime (nếu code ném lỗi ở ca này). */
  error?: string
}

const MAX_ACTUAL_SHOWN = 800

/** Chấm MỘT ca: so output thật với kỳ vọng theo chế độ của ca. */
export function gradeTestCase(
  testCase: ProgrammingTestCase,
  actualRaw: string,
  runError?: string,
): TestCaseResult {
  const actual = normalizeOutput(actualRaw)
  const expected = normalizeOutput(testCase.expected)
  const passed =
    !runError && (testCase.match === 'exact' ? actual === expected : actual.includes(expected))
  return {
    label: testCase.label,
    hidden: testCase.hidden,
    passed,
    // Ca ẩn không lộ output/lỗi chi tiết (chống dò đáp án bằng in thử).
    ...(passed || testCase.hidden ? {} : { actual: actual.slice(0, MAX_ACTUAL_SHOWN) }),
    ...(runError && !testCase.hidden ? { error: runError } : {}),
  }
}

/** Đạt bài Make = mọi ca đều pass. */
export function allTestsPassed(results: TestCaseResult[]): boolean {
  return results.length > 0 && results.every((r) => r.passed)
}

/** Kiểm bài Parsons: thứ tự học viên xếp có đúng thứ tự gốc không. */
export function checkParsonsOrder(arranged: string[], solution: string[]): boolean {
  if (arranged.length !== solution.length) return false
  return arranged.every((line, i) => line === solution[i])
}

/**
 * Xáo trộn DETERMINISTIC theo seed chuỗi (id bài học) — mọi lần vào bài thấy cùng một thứ
 * tự (đề ổn định, không dùng Math.random để còn test được). Đảm bảo kết quả KHÁC thứ tự
 * gốc khi có ≥ 2 phần tử khác nhau (xáo xong mà trùng thì xoay vòng 1 bước).
 */
export function parsonsShuffle(lines: string[], seed: string): string[] {
  // Băm seed đơn giản (FNV-1a rút gọn) → dãy số giả ngẫu nhiên ổn định.
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const next = () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return (h >>> 0) / 4294967296
  }
  const out = [...lines]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  const changed = out.some((l, i) => l !== lines[i])
  if (!changed && new Set(lines).size > 1) {
    out.push(out.shift()!)
  }
  return out
}

// scripts/lib/codeFeedbackScoring.ts — CHẤM TỰ ĐỘNG câu trả lời của AI phản hồi code (PR-L5).
//
// Tách khỏi scripts/eval-code-feedback.ts để phần LOGIC chấm test được bằng vitest (không tốn
// API), đúng khuôn scripts/lib/evalScoring.ts của eval gia sư ngôn ngữ.
//
// Bất biến cần đo: prompt có thể trôi (thêm/bớt một câu là AI bắt đầu chữa bài hộ) mà không
// cổng nào đỏ. Ba thứ đo được KHÁCH QUAN từ văn bản trả về:
//   1. KHÔNG đưa lời giải — dấu hiệu rõ nhất là một khối code dài chép-dán được.
//   2. Trả lời bằng TIẾNG VIỆT (học viên là người mới, đọc tiếng Anh chưa nổi).
//   3. Đúng việc của từng kind (gợi ý phải có câu hỏi; giải thích lỗi phải gọi tên lỗi).

/** Số dòng code tối đa cho phép trong MỘT khối minh hoạ (khớp luật "≤ 3 dòng" ở bậc 3). */
export const MAX_SNIPPET_LINES = 3

/** Lấy nội dung các khối code ```…``` trong câu trả lời. */
export function extractCodeBlocks(text: string): string[] {
  const blocks: string[] = []
  const re = /```[a-zA-Z]*\n?([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) blocks.push(m[1] ?? '')
  return blocks
}

/** Số dòng KHÔNG rỗng của một khối (dòng trống/comment thuần không tính là code). */
export function codeLineCount(block: string): number {
  return block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#')).length
}

/** Vi phạm luật cấm đưa lời giải: có khối code dài hơn mức minh hoạ cho phép. */
export function leaksSolution(text: string): boolean {
  return extractCodeBlocks(text).some((b) => codeLineCount(b) > MAX_SNIPPET_LINES)
}

// Dấu phụ tiếng Việt — câu trả lời tiếng Anh thuần sẽ không có ký tự nào trong dải này.
const VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i

/** Trả lời có phải tiếng Việt không (đủ dấu, không phải một câu lạc dấu). */
export function isVietnamese(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length < 5) return false
  const withDiacritics = words.filter((w) => VI_DIACRITICS.test(w)).length
  return withDiacritics / words.length >= 0.15
}

export type FeedbackKind = 'review' | 'socratic_hint' | 'explain_error'

export interface ScoreInput {
  kind: FeedbackKind
  text: string
  /** Tên lỗi Python của ca 'explain_error' (vd 'NameError') — bắt buộc phải được gọi tên. */
  errorName?: string
}

export interface CaseScore {
  /** Đạt = KHÔNG vi phạm bất biến nào. */
  passed: boolean
  /** Danh sách bất biến bị vi phạm (rỗng = sạch) — in ra để biết sửa prompt ở đâu. */
  violations: string[]
}

/** Chấm MỘT câu trả lời theo các bất biến của kind tương ứng. */
export function scoreFeedback({ kind, text, errorName }: ScoreInput): CaseScore {
  const violations: string[] = []
  const body = text.trim()

  if (!body) violations.push('trả lời rỗng')
  if (body && !isVietnamese(body)) violations.push('không phải tiếng Việt')
  if (leaksSolution(body)) violations.push(`lộ lời giải (khối code > ${MAX_SNIPPET_LINES} dòng)`)

  if (kind === 'socratic_hint' && body && !body.includes('?')) {
    violations.push('gợi ý Socratic mà không có câu hỏi nào')
  }
  if (kind === 'explain_error' && errorName && body && !body.includes(errorName)) {
    violations.push(`không gọi tên lỗi ${errorName}`)
  }

  return { passed: violations.length === 0, violations }
}

export interface EvalSummary {
  total: number
  passed: number
  /** Tỉ lệ đạt (0..1) — 1.0 mới là xanh; bất biến không có "phần lớn là đủ". */
  passRate: number
  /** Đếm theo từng loại vi phạm, để biết sửa prompt chỗ nào trước. */
  byViolation: Record<string, number>
}

export function summarize(scores: CaseScore[]): EvalSummary {
  const byViolation: Record<string, number> = {}
  for (const s of scores) {
    for (const v of s.violations) byViolation[v] = (byViolation[v] ?? 0) + 1
  }
  const passed = scores.filter((s) => s.passed).length
  return {
    total: scores.length,
    passed,
    passRate: scores.length === 0 ? 0 : passed / scores.length,
    byViolation,
  }
}

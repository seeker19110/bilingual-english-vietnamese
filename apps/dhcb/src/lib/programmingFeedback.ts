// programmingFeedback — Gọi AI phản hồi code môn Lập trình (PR-L5) từ phía client.
//
// Prompt KHÔNG dựng ở đây: server (`/api/programming/feedback`) dựng toàn bộ từ mã bài, nên
// client chỉ gửi dữ liệu thô. Xem lý do ở packages/subject-programming/feedbackPrompt.ts.
// Mỗi lượt gọi đều TIÊU 1 LƯỢT AI (mode `code_feedback`) → UI phải hỏi ý người học trước
// (bấm nút), không bao giờ gọi tự động sau mỗi lần chấm.
import { getAuthHeader } from '@core/authHeader'
import type { TestCaseResult } from '@dhcb/subject-programming/grading'

export type CodeFeedbackKind = 'review' | 'socratic_hint' | 'explain_error'

export interface CodeFeedbackRequest {
  kind: CodeFeedbackKind
  lessonId: string
  code: string
  hintLevel?: number
  errorText?: string
  failedCaseLabels?: string[]
}

export type CodeFeedbackResult =
  { ok: true; text: string; hintLevel?: number } | { ok: false; message: string }

const NETWORK_MESSAGE = 'Không gọi được AI (mất mạng?). Thử lại khi có kết nối nhé.'

/**
 * Nhãn các ca CHƯA ĐẠT để gửi kèm cho AI gợi ý trúng chỗ.
 * Ca ẩn chỉ gửi số thứ tự — nhãn của nó thường mô tả chính đáp án (vd "0 kWh → 0 đồng"), gửi
 * đi là tự tay lộ ca ẩn qua miệng AI, hỏng luôn tác dụng chống hardcode của ca ẩn.
 */
export function failedCaseLabels(results: TestCaseResult[] | null): string[] {
  if (!results) return []
  return results
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => !r.passed)
    .map(({ r, i }) => (r.hidden ? `Ca ẩn ${i + 1}` : r.label))
}

/** Một lượt hỏi AI. Lỗi mạng/HTTP đều trả về `ok:false` kèm câu tiếng Việt hiện thẳng cho học viên. */
export async function requestCodeFeedback(input: CodeFeedbackRequest): Promise<CodeFeedbackResult> {
  try {
    const res = await fetch('/api/programming/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(input),
    })
    const body = (await res.json().catch(() => null)) as {
      text?: string
      hintLevel?: number
      error?: string
    } | null
    if (!res.ok || !body?.text) {
      return { ok: false, message: body?.error ?? NETWORK_MESSAGE }
    }
    return { ok: true, text: body.text, hintLevel: body.hintLevel }
  } catch {
    return { ok: false, message: NETWORK_MESSAGE }
  }
}

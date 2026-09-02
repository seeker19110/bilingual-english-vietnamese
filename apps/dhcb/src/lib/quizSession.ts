// apps/dhcb/src/lib/quizSession.ts — Giữ lại bài kiểm tra đang làm dở.
//
// VÌ SAO CẦN: tab "Kiểm tra" dựng 10 câu và giữ toàn bộ tiến trình trong state của component.
// Chuyển sang tab khác là component bị gỡ khỏi cây → làm dở 9/10 câu rồi lỡ bấm nhầm tab là
// mất trắng, không cảnh báo, không khôi phục. Người học phải làm lại từ câu 1.
//
// CÁCH CHỌN GIẢI PHÁP: cách rẻ nhất là hỏi "bạn chắc chưa?" khi rời tab. Nhưng hộp thoại đó
// vẫn bắt người học trả giá cho một cú bấm nhầm, và chặn cả những lần rời tab CHÍNH ĐÁNG (mở
// lại bài ngữ pháp vừa trả lời sai — đúng việc app khuyến khích). Lưu phiên lại thì không cần
// hỏi gì cả: rời tab bao nhiêu lần cũng được, quay lại là học tiếp đúng chỗ đang dở.
//
// DÙNG `sessionStorage`, KHÔNG PHẢI `localStorage`: một bài kiểm tra làm dở chỉ có nghĩa
// trong phiên duyệt web hiện tại. Đóng trình duyệt hôm nay, mai mở lại mà thấy bài cũ còn treo
// giữa chừng thì gây bối rối hơn là giúp — và bộ câu hỏi lúc đó cũng đã lạc hậu so với vốn từ
// mới học thêm.

/** Một câu hỏi đã sinh — đúng hình dạng `QuizQuestion` trong `StudyTabs.tsx`. */
export interface SavedQuizQuestion {
  kind: 'vocab' | 'grammar'
  prompt: string
  correct: string
  options: string[]
  lessonId?: string
}

export interface QuizSession {
  questions: SavedQuizQuestion[]
  /** Chỉ số câu đang làm. */
  current: number
  /** Đáp án đã chọn ở câu hiện tại; `null` nghĩa là chưa trả lời. */
  selected: string | null
  /** Đúng/sai của các câu đã qua. */
  answers: boolean[]
}

const PREFIX = 'dhcb_quiz_session_v1'

/** Khoá tách theo người dùng VÀ theo cấp: mỗi cấp có bộ câu hỏi riêng, không trộn lẫn. */
function keyOf(uid: string, scope: string): string {
  return `${PREFIX}_${uid}_${scope}`
}

/**
 * Đọc lại phiên đang dở. Trả `null` khi không có, hoặc khi dữ liệu không còn hợp lệ.
 *
 * Kiểm hình dạng từng trường thay vì tin `JSON.parse`: đây là dữ liệu NGOÀI (người dùng sửa
 * được bằng devtools, và bản cũ của app có thể đã ghi hình dạng khác). Một trường sai kiểu mà
 * lọt qua sẽ làm hỏng màn hình đang học chứ không báo lỗi ở chỗ dễ thấy.
 */
export function loadQuizSession(uid: string, scope: string): QuizSession | null {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(keyOf(uid, scope))
  } catch {
    // Trình duyệt chặn lưu trữ (chế độ riêng tư, cấu hình chặn) — coi như không có phiên nào.
    return null
  }
  if (!raw) return null

  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return null
    const { questions, current, selected, answers } = data as Record<string, unknown>

    if (!Array.isArray(questions) || questions.length === 0) return null
    if (typeof current !== 'number' || !Number.isInteger(current) || current < 0) return null
    if (current >= questions.length) return null
    if (selected !== null && typeof selected !== 'string') return null
    if (!Array.isArray(answers) || answers.some((a) => typeof a !== 'boolean')) return null

    const ok = questions.every((q) => {
      if (typeof q !== 'object' || q === null) return false
      const item = q as Record<string, unknown>
      return (
        (item.kind === 'vocab' || item.kind === 'grammar') &&
        typeof item.prompt === 'string' &&
        typeof item.correct === 'string' &&
        Array.isArray(item.options) &&
        item.options.every((o) => typeof o === 'string')
      )
    })
    if (!ok) return null

    return {
      questions: questions as SavedQuizQuestion[],
      current,
      selected: selected as string | null,
      answers: answers as boolean[],
    }
  } catch {
    return null
  }
}

/** Ghi lại phiên đang dở. Lỗi lưu trữ được nuốt: không giữ được phiên thì cũng không được
 *  phép làm hỏng bài đang làm. */
export function saveQuizSession(uid: string, scope: string, session: QuizSession): void {
  try {
    sessionStorage.setItem(keyOf(uid, scope), JSON.stringify(session))
  } catch {
    /* hết dung lượng hoặc bị chặn — bỏ qua */
  }
}

/** Xoá phiên (làm xong, hoặc bấm làm lại từ đầu). */
export function clearQuizSession(uid: string, scope: string): void {
  try {
    sessionStorage.removeItem(keyOf(uid, scope))
  } catch {
    /* bỏ qua */
  }
}

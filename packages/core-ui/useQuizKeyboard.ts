// packages/core-ui/useQuizKeyboard.ts — Điều khiển bài trắc nghiệm bằng bàn phím.
//
// VÌ SAO CẦN: trắc nghiệm là thao tác lặp nhiều nhất trong app học tập — một phiên có hàng
// chục câu, một ngày có thể vài trăm lượt bấm. Khảo sát ngày 2026-09-02 cho thấy TOÀN BỘ các
// luồng trắc nghiệm (mini-quiz, tab Kiểm tra, bài kiểm tra vượt cấp, bài nghe) chỉ có
// `onClick`: người học trên máy tính buộc phải rời bàn phím, rê chuột xuống đáp án, bấm, rồi
// lại rê xuống nút "Câu tiếp theo" — cho mỗi câu.
//
// Đó vừa là vấn đề tốc độ vừa là vấn đề tiếp cận: người không dùng được chuột hiện phải Tab
// qua từng đáp án. Sau thay đổi này, một câu hỏi = một phím.
//
// QUY ƯỚC PHÍM (chọn theo thói quen sẵn có của người học, không sáng tạo mới):
//   • `1`…`9` — chọn đáp án thứ n. Đây là quy ước của mọi ứng dụng trắc nghiệm; số hiện ngay
//     trên đáp án nên không phải học thuộc.
//   • `Enter` / `Space` — sang câu tiếp theo, chỉ khi đã trả lời. Không cho bấm trước khi trả
//     lời là CỐ Ý: bấm Enter theo quán tính sẽ bỏ qua câu hỏi mà không kịp đọc.
//
// Hook đặt ở `packages/core-ui` vì trắc nghiệm không thuộc riêng môn nào — môn Anh, Lập trình
// và ba môn STEM đều dùng cùng dạng bài này.
import { useEffect } from 'react'

/** Phần tử đang lấy nét có phải nơi người dùng đang GÕ CHỮ không. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  // Nếu người học đang gõ vào ô nhập (bài điền từ, ô chat, ô tìm kiếm) thì phím số là nội dung
  // họ muốn gõ, không phải lệnh chọn đáp án. Bỏ qua bước này là lỗi kinh điển của phím tắt
  // toàn trang: gõ "1" vào ô tìm kiếm lại nhảy sang câu khác.
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable === true
  )
}

/** Phím bấm quy về một hành động của bài trắc nghiệm — hoặc không hành động nào. */
export type QuizKeyAction = { kind: 'pick'; index: number } | { kind: 'next' } | null

export interface QuizKeyInput {
  key: string
  /** Có phím bổ trợ nào đang giữ không (Ctrl/Cmd/Alt). */
  modified: boolean
  /** Con trỏ đang nằm trong ô nhập chữ. */
  typing: boolean
  answered: boolean
  optionCount: number
}

/**
 * Quy một phím thành hành động. Hàm THUẦN, tách khỏi hook để kiểm chứng được bằng test mà
 * không cần dựng DOM — toàn bộ luật phím nằm ở đây, hook chỉ còn việc lắp vào `window`.
 */
export function resolveQuizKey({
  key,
  modified,
  typing,
  answered,
  optionCount,
}: QuizKeyInput): QuizKeyAction {
  // Đang gõ chữ thì phím số là nội dung người dùng muốn gõ, không phải lệnh chọn đáp án.
  // `Ctrl+1` là lệnh đổi tab của trình duyệt — cướp phím đó sẽ phá thói quen của người dùng.
  if (typing || modified) return null

  if (!answered) {
    const index = Number(key) - 1
    return Number.isInteger(index) && index >= 0 && index < optionCount
      ? { kind: 'pick', index }
      : null
  }

  return key === 'Enter' || key === ' ' ? { kind: 'next' } : null
}

export interface QuizKeyboardOptions {
  /** Số đáp án đang hiện. Phím `1`…`n` mới có tác dụng; ngoài khoảng đó bỏ qua. */
  optionCount: number
  /** Gọi khi người học chọn đáp án thứ `index` (đếm từ 0). */
  onPick: (index: number) => void
  /** Gọi khi người học muốn sang câu tiếp theo. Bỏ trống nếu bài không có bước này. */
  onNext?: () => void
  /**
   * Đã trả lời chưa. Quyết định phím nào đang sống: chưa trả lời thì chỉ `1`…`n` chạy, đã trả
   * lời thì chỉ `Enter`/`Space` chạy. Tách bạch như vậy để không bao giờ có chuyện một phím
   * vừa chọn đáp án vừa nhảy câu.
   */
  answered: boolean
  /** Tắt toàn bộ phím tắt (ví dụ khi đang mở hộp thoại đè lên). Mặc định bật. */
  enabled?: boolean
}

export function useQuizKeyboard({
  optionCount,
  onPick,
  onNext,
  answered,
  enabled = true,
}: QuizKeyboardOptions): void {
  useEffect(() => {
    if (!enabled) return

    function handle(event: KeyboardEvent) {
      const action = resolveQuizKey({
        key: event.key,
        modified: event.ctrlKey || event.metaKey || event.altKey,
        typing: isTypingTarget(event.target),
        answered,
        optionCount,
      })
      if (!action) return
      if (action.kind === 'next' && !onNext) return

      // `preventDefault` cho Space là bắt buộc: mặc định Space cuộn trang xuống một màn, nên
      // không chặn thì mỗi lần sang câu người học lại bị đẩy khỏi vị trí đang đọc.
      event.preventDefault()
      if (action.kind === 'pick') onPick(action.index)
      else onNext?.()
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [enabled, optionCount, onPick, onNext, answered])
}

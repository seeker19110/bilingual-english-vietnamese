// tutorFeedback.ts — Vòng phản hồi người dùng cho chất lượng gia sư AI (mục ⑤ T3
// trong docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
//
// Người dùng bấm 👎 cạnh khối "✅ Nhận xét" (Chat/Speaking) khi thấy AI sửa SAI hoặc
// BỎ SÓT lỗi → ghi 1 dòng vào bảng `tutor_feedback` (migration 0014, RLS owner-only).
// CHỈ ghi khi người dùng CHỦ ĐỘNG bấm — không tự động thu thập gì khác. Định kỳ (thủ
// công, đọc SQL trực tiếp) dùng dữ liệu này bổ sung ca sai vào golden set eval (⑤ T1).
//
// "Bắn rồi quên" — không throw, giống challengeCloud.ts/progressSync.ts.

import { supabase } from './supabase'

export type TutorFeedbackSource = 'chat' | 'speaking'

export async function reportTutorFeedback(
  userId: string,
  source: TutorFeedbackSource,
  userInput: string,
  aiFeedback: string,
): Promise<void> {
  if (!userId || !userInput.trim() || !aiFeedback.trim()) return
  const { error } = await supabase.from('tutor_feedback').insert({
    user_id: userId,
    source,
    user_input: userInput,
    ai_feedback: aiFeedback,
  })
  if (error) console.warn('[tutorFeedback] lưu lỗi:', error.message)
}

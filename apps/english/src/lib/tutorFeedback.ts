// tutorFeedback.ts — Vòng phản hồi người dùng cho chất lượng gia sư AI (mục ⑤ T3
// trong docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
//
// Người dùng bấm 👎 cạnh khối "✅ Nhận xét" (Chat/Speaking) khi thấy AI sửa SAI hoặc
// BỎ SÓT lỗi → ghi 1 dòng vào bảng `tutor_feedback` qua /api/tutor-feedback (Giai đoạn C —
// server tự kiểm user từ Bearer token, thay client insert Supabase dựa vào RLS trước đây).
// CHỈ ghi khi người dùng CHỦ ĐỘNG bấm — không tự động thu thập gì khác. Định kỳ (thủ
// công, đọc SQL trực tiếp) dùng dữ liệu này bổ sung ca sai vào golden set eval (⑤ T1).
//
// "Bắn rồi quên" — không throw, giống challengeCloud.ts/progressSync.ts.

import { getAuthHeader, getStoredToken } from './authHeader'

export type TutorFeedbackSource = 'chat' | 'speaking'

export async function reportTutorFeedback(
  userId: string,
  source: TutorFeedbackSource,
  userInput: string,
  aiFeedback: string,
): Promise<void> {
  if (!userId || !userInput.trim() || !aiFeedback.trim()) return
  if (!getStoredToken()) return
  try {
    const resp = await fetch('/api/tutor-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ source, userInput, aiFeedback }),
    })
    if (!resp.ok) console.warn('[tutorFeedback] lưu lỗi: HTTP', resp.status)
  } catch (e) {
    console.warn('[tutorFeedback] lưu lỗi:', e)
  }
}

// programmingPathQuiz — client gọi API chấm QUIZ SAU CHẶNG của lộ trình mục tiêu.
// Chấm hoàn toàn ở SERVER (submitStageQuiz) — client chỉ gửi câu trả lời, không tự tính điểm.
import { getAuthHeader } from '@core/authHeader'

export interface QuizSubmitResult {
  correct: number
  total: number
  passed: boolean
}

const API = '/api/programming/path-quiz'

/** Nộp quiz; trả `null` khi mạng lỗi/server lỗi — UI phải có trạng thái lỗi riêng, không đoán. */
export async function submitPathQuiz(
  pathId: string,
  stageId: string,
  answers: { questionId: string; choiceIndex: number }[],
): Promise<QuizSubmitResult | null> {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ pathId, stageId, answers }),
    })
    if (!res.ok) return null
    return (await res.json()) as QuizSubmitResult
  } catch {
    return null
  }
}

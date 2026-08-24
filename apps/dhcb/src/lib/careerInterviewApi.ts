// apps/dhcb/src/lib/careerInterviewApi.ts — Client cho Phòng Luyện Phỏng Vấn (/api/career-interview).
import { getAuthHeader } from '@core/authHeader'
import type {
  InterviewFeedback,
  InterviewKind,
  InterviewSession,
} from '@dhcb/core-contracts/careerInterview'

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

// Phiên luyện gần nhất (null nếu chưa từng luyện) — để mở lại trang là thấy buổi trước.
export async function fetchLatestInterview(): Promise<InterviewSession | null> {
  const headers = await getAuthHeader()
  const data = await parseOrThrow(await fetch('/api/career-interview', { headers }))
  return (data as { session: InterviewSession | null }).session
}

// Bắt đầu phiên mới: server sinh câu hỏi theo hồ sơ nghề nghiệp thật.
// `isFallback` = true nghĩa là AI không chạy được và đây là bộ câu hỏi mặc định — giao diện
// phải nói thật với người dùng.
export async function startInterview(
  kind: InterviewKind,
): Promise<{ session: InterviewSession; isFallback: boolean }> {
  const headers = await getAuthHeader()
  const data = await parseOrThrow(
    await fetch('/api/career-interview?action=start', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind }),
    }),
  )
  return data as { session: InterviewSession; isFallback: boolean }
}

// Nộp câu trả lời và nhận nhận xét đã được model chấm thật.
export async function submitInterviewAnswer(params: {
  questionId: string
  answer: string
}): Promise<{ session: InterviewSession; feedback: InterviewFeedback; isFallback: boolean }> {
  const headers = await getAuthHeader()
  const data = await parseOrThrow(
    await fetch('/api/career-interview?action=answer', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),
  )
  return data as { session: InterviewSession; feedback: InterviewFeedback; isFallback: boolean }
}

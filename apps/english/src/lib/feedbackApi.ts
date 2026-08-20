// apps/english/src/lib/feedbackApi.ts — Client API gửi và tra cứu ý kiến đóng góp người dùng.
import { getAuthHeader } from '@core/authHeader'
import type {
  CreateFeedbackInput,
  UserFeedbackRecord,
} from '../../../../packages/core-contracts/feedback'

export async function submitFeedback(
  input: CreateFeedbackInput,
): Promise<{ ok: true; id: string; message: string } | { ok: false; error: string }> {
  try {
    const authHeaders = getAuthHeader()
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(input),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: (data as { error?: string }).error ?? `Lỗi ${res.status}` }
    }

    return {
      ok: true,
      id: (data as { id: string }).id,
      message: (data as { message: string }).message,
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message ?? 'Không thể gửi phản hồi' }
  }
}

export async function fetchMyFeedback(): Promise<UserFeedbackRecord[]> {
  try {
    const authHeaders = getAuthHeader()
    const res = await fetch('/api/feedback', {
      headers: authHeaders,
    })
    if (!res.ok) return []
    const data = (await res.json()) as { feedbackList: UserFeedbackRecord[] }
    return data.feedbackList ?? []
  } catch {
    return []
  }
}

// src/lib/quests.ts — Gọi API nhiệm vụ (api/quests.ts). Tách riêng khỏi shareContent.ts (hàm
// thuần dựng nội dung, không gọi mạng) — file này CÓ gọi API.

import { getAuthHeader } from './authHeader'

export type CefrExamLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface QuestsStatus {
  share: { cooldownDays: number; rewardDays: number; canClaim: boolean }
  streak: {
    current: number
    required: number
    rewardDays: number
    cooldownDays: number
    canClaim: boolean
  }
  cefrExams: { level: CefrExamLevel; passed: boolean; claimed: boolean; rewardDays: number }[]
  referral: {
    code: string
    rewardedCount: number
    pendingCount: number
    maxRewarded: number
    rewardDays: number
  }
}

async function postClaim(body: Record<string, unknown>): Promise<number | null> {
  try {
    const headers = getAuthHeader()
    if (!headers.Authorization) return null // chưa đăng nhập — không có gì để thưởng
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { ok: boolean; rewardDays?: number }
    return data.ok && typeof data.rewardDays === 'number' ? data.rewardDays : null
  } catch {
    return null
  }
}

// Nhận thưởng nhiệm vụ "Chia sẻ công khai" — gọi SAU khi Web Share API xác nhận người dùng đã
// chọn nơi chia sẻ (không phải lúc bấm nút, xem src/components/ShareResultCard.tsx). Trả về số
// ngày Pro vừa được cộng, hoặc `null` nếu chưa đủ điều kiện (đã nhận trong 7 ngày qua, chưa
// đăng nhập, lỗi mạng...) — im lặng bỏ qua, không phá luồng chia sẻ đã thành công.
export function claimShareQuest(): Promise<number | null> {
  return postClaim({ action: 'claim-share' })
}

// Nhận thưởng nhiệm vụ "Học liên tiếp N ngày" — server tự tính lại streak, không tin số client
// gửi lên. Trả `null` nếu chưa đủ ngày/đã nhận trong cửa sổ hồi/lỗi.
export function claimStreakQuest(): Promise<number | null> {
  return postClaim({ action: 'claim-streak' })
}

// Nhận thưởng nhiệm vụ "Thi đạt cấp CEFR" — server tự đọc lại learning_progress.cefr_exams,
// CHỈ gọi sau khi chắc chắn server đã nhận kết quả thi mới nhất (await pushProgressAsync
// trước, xem src/components/CefrExam.tsx) — nếu không, server có thể còn đọc dữ liệu cũ.
export function claimCefrExamQuest(level: CefrExamLevel): Promise<number | null> {
  return postClaim({ action: 'claim-cefr-exam', level })
}

export async function fetchQuestsStatus(): Promise<QuestsStatus | null> {
  try {
    const headers = getAuthHeader()
    if (!headers.Authorization) return null
    const res = await fetch('/api/quests', { headers })
    if (!res.ok) return null
    return (await res.json()) as QuestsStatus
  } catch {
    return null
  }
}

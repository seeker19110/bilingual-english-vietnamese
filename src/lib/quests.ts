// src/lib/quests.ts — Gọi API nhận thưởng nhiệm vụ (api/quests.ts). Tách riêng khỏi
// shareContent.ts (hàm thuần dựng nội dung, không gọi mạng) — file này CÓ gọi API.

import { getAuthHeader } from './authHeader'

// Nhận thưởng nhiệm vụ "Chia sẻ công khai" — gọi SAU khi Web Share API xác nhận người dùng đã
// chọn nơi chia sẻ (không phải lúc bấm nút, xem src/components/ShareResultCard.tsx). Trả về số
// ngày Pro vừa được cộng, hoặc `null` nếu chưa đủ điều kiện (đã nhận trong 7 ngày qua, chưa
// đăng nhập, lỗi mạng...) — im lặng bỏ qua, không phá luồng chia sẻ đã thành công.
export async function claimShareQuest(): Promise<number | null> {
  try {
    const headers = getAuthHeader()
    if (!headers.Authorization) return null // chưa đăng nhập — không có gì để thưởng
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ action: 'claim-share' }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { ok: boolean; rewardDays?: number }
    return data.ok && typeof data.rewardDays === 'number' ? data.rewardDays : null
  } catch {
    return null
  }
}

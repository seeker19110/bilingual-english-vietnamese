// src/lib/weeklyCredit.ts — Đọc "còn bao nhiêu lượt" từ SERVER cho gói Free (kho lượt
// tuần chung, xem api/usage-summary.ts + postgres/migrations/0012_free_weekly_ai_credit.sql).
// Pro/VIP KHÔNG cần gọi API này — vẫn hiển thị đúng bằng dữ liệu local như cũ (per-mode,
// đếm theo ngày, xem src/lib/storage.ts).
//
// Không cache lâu (kho đổi liên tục mỗi lần dùng AI/học từ mới) — luôn hỏi lại server khi
// vào các trang Chat/Writing/Speaking/Dashboard/Challenge để số hiển thị luôn đúng.

import { getAuthHeader } from './authHeader'

export interface WeeklyCreditInfo {
  plan: 'free' | 'pro' | 'vip'
  freeWeeklyCredit: number | null // null = không phải gói Free (Pro/VIP không áp dụng)
  freeWeeklyCap: number
}

// Lỗi mạng/server → coi như hết lượt (an toàn hơn là coi như còn — tránh hiển thị sai
// "còn nhiều lượt" trong khi server có thể đang chặn thật). UI nơi gọi tự xử lý null/lỗi
// hiển thị phù hợp (vd ẩn số, không chặn cứng — chặn thật vẫn do server quyết định).
export async function fetchWeeklyCredit(): Promise<WeeklyCreditInfo | null> {
  try {
    const resp = await fetch('/api/usage-summary', { headers: getAuthHeader() })
    if (!resp.ok) return null
    return (await resp.json()) as WeeklyCreditInfo
  } catch {
    return null
  }
}

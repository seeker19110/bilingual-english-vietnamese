// ──────────────────────────────────────────────────────────────────────
// LUỒNG "QUAY LẠI SAU KHI BỎ BẴNG" (② M4 — docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md)
//
// Bỏ ≥3 ngày → lần mở app kế: màn chào "Mừng bạn quay lại 👋" + đề xuất phiên
// RÚT GỌN (5 thẻ SRS + 3 từ mới) thay vì đập nguyên nợ ôn vào mặt — nghiên cứu
// Duolingo: nợ ôn dồn là lý do bỏ học số 1 (đã ghi chú ở lib/srs.ts).
// ──────────────────────────────────────────────────────────────────────

import { daysSinceLastActivity } from './storage'
import { vnDateStr } from './date'

export const COMEBACK_THRESHOLD_DAYS = 3
export const COMEBACK_SRS_CARDS = 5
export const COMEBACK_NEW_WORDS = 3

const DISMISS_KEY = (uid: string) => `et_comeback_dismissed_${uid}`

// Đã tắt banner NGÀY HÔM NAY chưa — idempotent theo ngày, giống
// et_streak_celebrated_* (storage.ts): mai mở lại app vẫn hiện lại nếu còn đủ
// điều kiện (không tắt vĩnh viễn — người dùng có thể lại bỏ bẵng lần sau).
function isDismissedToday(uid: string): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY(uid)) === vnDateStr()
  } catch {
    return false
  }
}

export function dismissComebackToday(uid: string): void {
  try {
    localStorage.setItem(DISMISS_KEY(uid), vnDateStr())
  } catch {
    /* hết dung lượng — bỏ qua, chỉ ảnh hưởng lần hiện lại banner trong ngày */
  }
}

// Có nên hiện banner "quay lại" không: đã vắng ≥ ngưỡng NGÀY, chưa tắt hôm nay.
export function shouldShowComeback(uid: string): boolean {
  if (!uid || isDismissedToday(uid)) return false
  const gap = daysSinceLastActivity(uid)
  return gap != null && gap >= COMEBACK_THRESHOLD_DAYS
}

// Số ngày đã vắng — dùng cho câu chào (chỉ gọi sau khi shouldShowComeback true
// nên luôn có giá trị hợp lệ; ?? 0 chỉ để TypeScript yên tâm về kiểu).
export function comebackDaysAway(uid: string): number {
  return daysSinceLastActivity(uid) ?? 0
}

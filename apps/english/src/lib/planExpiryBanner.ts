// lib/planExpiryBanner.ts — Logic THUẦN (không đụng DOM/localStorage) cho
// PlanExpiryBanner: quyết định có nên hiện banner "còn X ngày dùng gói Pro/VIP" hay không.
// Cùng khuôn mẫu promoEndingBanner.ts (tách hàm thuần khỏi component để test ca biên ngày
// tháng — điểm dễ sai nhất của loại banner này).
import { vnDateStr, MS_DAY } from './date'

// Chỉ báo trước khi còn ≤ 5 ngày — đủ để nhắc gia hạn/nâng cấp mà không phiền suốt 14 ngày
// dùng thử (SIGNUP_TRIAL_DAYS, xem api/_lib/trial.ts).
export const WARNING_WINDOW_DAYS = 5

export const PLAN_EXPIRY_BANNER_DISMISS_KEY = 'plan_expiry_banner_dismissed_at'

// Số ngày còn lại tới `planExpiresAt` tính từ `now` (làm tròn LÊN — còn vài giờ của ngày cuối
// vẫn tính là "còn 1 ngày", không tụt xuống 0 gây hoang mang là đã hết hạn).
export function daysUntilPlanExpires(planExpiresAt: string, now: Date): number {
  return Math.ceil((new Date(planExpiresAt).getTime() - now.getTime()) / MS_DAY)
}

// `plan`: gói ĐANG hiệu lực (đọc từ user.plan, đã resolvePlan() ở server) — Free không bao
// giờ hiện banner này (không có gì "hết hạn" với Free, xem promoEndingBanner cho khuyến mãi).
// `planExpiresAt`: null = gói vĩnh viễn hoặc đang Free → không hiện.
import type { Plan } from '../types'

export function shouldShowPlanExpiryBanner(
  plan: Plan,
  planExpiresAt: string | null | undefined,
  now: Date,
  dismissedAtDateStr: string | null,
): boolean {
  if (plan === 'free' || !planExpiresAt) return false

  const daysLeft = daysUntilPlanExpires(planExpiresAt, now)
  if (daysLeft <= 0) return false // Đã hết hạn — server sẽ tự hạ về Free, không phải việc banner này
  if (daysLeft > WARNING_WINDOW_DAYS) return false

  // Đã đóng ĐÚNG HÔM NAY (giờ VN) → khỏi hiện lại; hôm sau vẫn còn hạn thì hiện lại.
  if (dismissedAtDateStr !== null && dismissedAtDateStr === vnDateStr(now)) return false

  return true
}

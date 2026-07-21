// api/_lib/promo.ts — Mốc khuyến mãi ra mắt: TOÀN BỘ user (kể cả Free) được đối xử như
// VIP (đủ 14 giọng TTS + KHÔNG giới hạn lượt dùng AI) tới hết ngày 31/12/2026 (giờ VN).
// Từ 2027 trở đi, quyền lợi quay về đúng gói thật (free/pro/vip) — xem quyết định người
// dùng chốt ngày 2026-07-21 (mục "Trạng thái hiện tại" PROGRESS.md).
// PHẢI khớp tay với src/lib/promo.ts (dự án không share code giữa api/ và src/).
import type { Plan } from './plan'

export const FULL_ACCESS_PROMO_UNTIL = '2027-01-01T00:00:00+07:00'

export function isFullAccessPromoActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(FULL_ACCESS_PROMO_UNTIL).getTime()
}

// Gói THỰC SỰ áp dụng ngay bây giờ cho việc tính hạn mức/quyền giọng — trong thời gian
// khuyến mãi, MỌI gói đều được đối xử như 'vip' bất kể profiles.plan lưu gì.
export function effectivePlan(plan: Plan, now: Date = new Date()): Plan {
  return isFullAccessPromoActive(now) ? 'vip' : plan
}

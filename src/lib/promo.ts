// src/lib/promo.ts — Mốc khuyến mãi ra mắt: TOÀN BỘ user (kể cả Free) được đối xử như VIP
// (đủ 14 giọng TTS + KHÔNG giới hạn lượt dùng AI) tới hết ngày 31/12/2026 (giờ VN). Từ 2027
// trở đi, quyền lợi quay về đúng gói thật (free/pro/vip) — quyết định người dùng chốt
// 2026-07-21. PHẢI khớp tay với api/_lib/promo.ts (dự án không share code giữa api/ và src/).
import type { Plan } from '../types'

export const FULL_ACCESS_PROMO_UNTIL = '2027-01-01T00:00:00+07:00'

export function isFullAccessPromoActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(FULL_ACCESS_PROMO_UNTIL).getTime()
}

// Gói THỰC SỰ áp dụng ngay bây giờ cho việc tính hạn mức/quyền giọng hiển thị ở UI —
// trong thời gian khuyến mãi, MỌI gói đều hiện như 'vip' bất kể user.plan lưu gì.
// Server (api/_lib/promo.ts) luôn là nguồn sự thật cuối cùng — đây chỉ để UI không hiện
// nhầm "hết lượt" trong lúc server vẫn đang cho phép.
export function effectivePlan(plan: Plan, now: Date = new Date()): Plan {
  return isFullAccessPromoActive(now) ? 'vip' : plan
}

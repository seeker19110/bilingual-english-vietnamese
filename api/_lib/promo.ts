// api/_lib/promo.ts — Khuyến mãi ra mắt: khi admin đặt promo_until (bảng app_settings, chỉnh
// qua /api/admin-settings), TOÀN BỘ user (kể cả Free) được đối xử như VIP (đủ 14 giọng TTS +
// KHÔNG giới hạn lượt dùng AI) tới thời điểm đó. promo_until = null → tắt khuyến mãi, áp hạn
// mức thật ngay. PHẢI khớp Ý NGHĨA với src/lib/promo.ts phía client (giá trị THẬT lấy từ DB,
// client chỉ có bản tĩnh để hiển thị tạm — xem ghi chú trong file đó).
import { getAppSettings } from './settings.js'
import type { Plan } from './plan.js'

export async function isFullAccessPromoActive(now: Date = new Date()): Promise<boolean> {
  const { promoUntil } = await getAppSettings()
  return promoUntil !== null && now.getTime() < new Date(promoUntil).getTime()
}

// Gói THỰC SỰ áp dụng ngay bây giờ cho việc tính hạn mức/quyền giọng — trong thời gian
// khuyến mãi, MỌI gói đều được đối xử như 'vip' bất kể profiles.plan lưu gì.
export async function effectivePlan(plan: Plan, now: Date = new Date()): Promise<Plan> {
  return (await isFullAccessPromoActive(now)) ? 'vip' : plan
}

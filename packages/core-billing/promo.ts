// api/_lib/promo.ts — Khuyến mãi ra mắt: khi admin đặt promo_until (bảng app_settings, chỉnh
// qua /api/admin-settings), MỖI GÓI được nâng lên đúng 1 bậc tới thời điểm đó: Free → hạn mức
// Pro, Pro → hạn mức VIP (không giới hạn), VIP giữ nguyên VIP. promo_until = null → tắt khuyến
// mãi, áp hạn mức thật ngay. PHẢI khớp Ý NGHĨA với src/lib/promo.ts phía client (giá trị THẬT
// lấy từ DB, client chỉ có bản tĩnh để hiển thị tạm — xem ghi chú trong file đó).
//
// Quyết định 2026-07-26: đổi từ "mọi gói đều thành VIP" (không phân biệt) sang "nâng đúng 1
// bậc" — Free vẫn có giới hạn (bằng Pro) thay vì không giới hạn hoàn toàn trong lúc khuyến mãi.
import { getAppSettings } from '@dhcb/core-db/settings'
import type { Plan } from './plan.js'

export async function isFullAccessPromoActive(now: Date = new Date()): Promise<boolean> {
  const { promoUntil } = await getAppSettings()
  return promoUntil !== null && now.getTime() < new Date(promoUntil).getTime()
}

// Gói THỰC SỰ áp dụng ngay bây giờ cho việc tính hạn mức/quyền giọng.
export async function effectivePlan(plan: Plan, now: Date = new Date()): Promise<Plan> {
  if (!(await isFullAccessPromoActive(now))) return plan
  if (plan === 'free') return 'pro'
  return 'vip' // pro → vip (không giới hạn); vip → vip (không đổi)
}

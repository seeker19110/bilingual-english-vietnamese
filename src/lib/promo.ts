// src/lib/promo.ts — Mốc khuyến mãi ra mắt: khi server báo promoUntil khác null (đọc qua
// src/lib/appSettings.ts, đồng bộ lúc mở app từ /api/app-settings — nguồn sự thật là bảng
// app_settings, admin chỉnh qua /api/admin-settings), TOÀN BỘ user (kể cả Free) được đối xử
// như VIP (đủ 14 giọng TTS + KHÔNG giới hạn lượt dùng AI) tới thời điểm đó. Server
// (api/_lib/promo.ts) luôn là nguồn sự thật cuối cùng cho việc CHẶN thật — đây chỉ để UI
// không hiện nhầm "hết lượt" trong lúc server vẫn đang cho phép.
import type { Plan } from '../types'
import { getAppSettings } from './appSettings'

export function isFullAccessPromoActive(now: Date = new Date()): boolean {
  const { promoUntil } = getAppSettings()
  return promoUntil !== null && now.getTime() < new Date(promoUntil).getTime()
}

// Gói THỰC SỰ áp dụng ngay bây giờ cho việc tính hạn mức/quyền giọng hiển thị ở UI.
export function effectivePlan(plan: Plan, now: Date = new Date()): Plan {
  return isFullAccessPromoActive(now) ? 'vip' : plan
}

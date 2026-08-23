// src/lib/promo.ts — Mốc khuyến mãi ra mắt: khi server báo promoUntil khác null (đọc qua
// src/lib/appSettings.ts, đồng bộ lúc mở app từ /api/app-settings — nguồn sự thật là bảng
// app_settings, admin chỉnh qua /api/admin-settings), MỖI GÓI được nâng lên ĐÚNG 1 BẬC tới
// thời điểm đó: Free → hạn mức/giọng của Pro, Pro → VIP, VIP giữ nguyên. Server
// (api/_lib/promo.ts) luôn là nguồn sự thật cuối cùng cho việc CHẶN thật — đây chỉ để UI
// không hiện nhầm "hết lượt"/mở nhầm giọng trong lúc server vẫn đang cho phép.
//
// PHẢI KHỚP Ý NGHĨA với api/_lib/promo.ts (dự án không share code giữa api/ và src/ — 2
// tsconfig riêng). Lệch nhau thì UI mở khoá giọng mà server âm thầm hạ về giọng mặc định
// (clampVoiceToPlan, api/_lib/voiceAccess.ts) — đúng lỗi đã gặp trước 2026-07-28.
import type { Plan } from '../types'
import { getAppSettings } from './appSettings'

export function isFullAccessPromoActive(now: Date = new Date()): boolean {
  const { promoUntil } = getAppSettings()
  return promoUntil !== null && now.getTime() < new Date(promoUntil).getTime()
}

// Gói THỰC SỰ áp dụng ngay bây giờ cho việc tính hạn mức/quyền giọng hiển thị ở UI.
export function effectivePlan(plan: Plan, now: Date = new Date()): Plan {
  if (!isFullAccessPromoActive(now)) return plan
  if (plan === 'free') return 'pro'
  return 'vip' // pro → vip (không giới hạn); vip → vip (không đổi)
}

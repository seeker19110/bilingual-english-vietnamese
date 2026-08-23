// src/lib/analytics.ts — Client "gửi rồi quên" cho analytics tự viết (xem api/analytics.ts).
// KHÔNG await ở nơi gọi, KHÔNG block UI, nuốt lỗi mạng — đây là tracking nền, lỗi không
// quan trọng với trải nghiệm nên không hiện toast/thông báo lỗi cho user.

import { getAuthHeader } from '@core/authHeader'

// Whitelist khớp EVENT_TYPES ở api/analytics.ts — giữ đồng bộ khi thêm event mới.
export type AnalyticsEvent =
  'landing_view' | 'cta_click' | 'signup' | 'first_session_done' | 'share_click' | 'day2_return'

export interface AnalyticsExtra {
  refCode?: string
  utmSource?: string
  path?: string
}

export function track(event: AnalyticsEvent, extra?: AnalyticsExtra): void {
  const body = {
    event,
    refCode: extra?.refCode,
    utmSource: extra?.utmSource,
    // Tự gắn path hiện tại nếu không truyền — window chỉ tồn tại ở trình duyệt.
    path: extra?.path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
  }

  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...getAuthHeader(), // rỗng nếu chưa đăng nhập — vẫn gửi được, server không bắt buộc auth
    },
    body: JSON.stringify(body),
  }).catch(() => {
    // Nuốt lỗi mạng — tracking nền, không ảnh hưởng trải nghiệm người dùng.
  })
}

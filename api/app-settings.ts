// api/app-settings.ts — Đọc CÔNG KHAI hạn mức/khuyến mãi hiện hành (bảng app_settings) để
// client đồng bộ ngay lúc mở app, KHÔNG cần đăng nhập (chỉ là số hạn mức theo gói + mốc
// khuyến mãi, không phải dữ liệu riêng tư của user nào) — khác api/admin-settings.ts (đọc/SỬA,
// bắt buộc admin). Client dùng src/lib/appSettings.ts để gọi + cache endpoint này.
//
// GET /api/app-settings

import { getAppSettings } from './_lib/settings'
import { getCorsHeaders, SECURITY_HEADERS, checkRateLimit, logSecurityEvent } from './_lib/security'
import { jsonResponse, getClientIp } from './_lib/http'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp, 30, 'app-settings')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/app-settings' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const settings = await getAppSettings()
  // Cache ngắn ở CDN/trình duyệt — số này hiếm khi đổi, admin sửa xong vẫn có độ trễ chấp
  // nhận được (client tự fetch lại mỗi lần mở app).
  return jsonResponse(settings, 200, { ...allHeaders, 'Cache-Control': 'public, max-age=60' })
}

export const config = { runtime: 'edge' }

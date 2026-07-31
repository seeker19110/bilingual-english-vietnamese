// api/plan-marketing.ts — Đọc CÔNG KHAI nội dung mô tả gói (badge/tagline + gạch đầu dòng)
// để trang Nâng cấp (UpgradeSection.tsx) hiển thị, KHÔNG cần đăng nhập — khác
// api/admin-plan-marketing.ts (đọc/SỬA, bắt buộc admin). Hỗ trợ ETag/If-None-Match giống
// api/plan-features.ts.
//
// GET /api/plan-marketing

import { getPlanMarketing } from '../../api/_lib/planMarketing.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '../core-auth/security.js'
import { jsonResponse, getClientIp } from '../../api/_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'plan-marketing'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/plan-marketing' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const data = await getPlanMarketing()
  const etag = `"${data.updatedAt}"`
  const headers = { ...allHeaders, 'Cache-Control': 'public, max-age=60', ETag: etag }

  if (req.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers })
  }

  return jsonResponse(data, 200, headers)
}

export const config = { runtime: 'edge' }

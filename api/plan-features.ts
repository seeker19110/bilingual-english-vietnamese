// api/plan-features.ts — Đọc CÔNG KHAI ma trận tính năng theo gói (bảng feature_catalog +
// plan_feature_flags) để client biết tính năng nào cần khoá cho gói nào, KHÔNG cần đăng nhập
// (không phải dữ liệu riêng tư user nào) — khác api/admin-plan-features.ts (đọc/SỬA, bắt buộc
// admin). Hỗ trợ ETag/If-None-Match giống api/app-settings.ts.
//
// GET /api/plan-features

import { getPlanFeatureMatrix } from '@dhcb/core-billing/planFeatures'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'plan-features'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/plan-features' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const matrix = await getPlanFeatureMatrix()
  const etag = `"${matrix.updatedAt}"`
  const headers = { ...allHeaders, 'Cache-Control': 'public, max-age=60', ETag: etag }

  if (req.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers })
  }

  return jsonResponse(matrix, 200, headers)
}

export const config = { runtime: 'edge' }

// api/plan-prices.ts — Đọc CÔNG KHAI bảng giá Pro/VIP (public.plan_prices), KHÔNG cần đăng
// nhập — chỉ là giá bán hiển thị, không phải dữ liệu riêng tư. Khác api/checkout.ts (TẠO đơn,
// bắt buộc đăng nhập). UI (UpgradeSection.tsx) gọi endpoint này để hiện bảng giá trước khi
// người dùng bấm mua.
//
// GET /api/plan-prices

import { getPlanPrices, effectivePrice } from './_lib/prices.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from './_lib/security.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'plan-prices'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/plan-prices' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const prices = await getPlanPrices()
  const now = new Date()

  // Trả kèm cả giá niêm yết lẫn giá đang áp dụng — UI cần cả hai để hiện "gạch giá cũ" khi
  // đang khuyến mãi (xem docs/research/dac-ta-thanh-toan-2026-07-25.md mục "Khuyến mãi dịp lễ").
  const body = {
    pro: {
      '10day': { ...prices.pro['10day'], effectiveVnd: effectivePrice(prices.pro['10day'], now) },
      month: { ...prices.pro.month, effectiveVnd: effectivePrice(prices.pro.month, now) },
      year: { ...prices.pro.year, effectiveVnd: effectivePrice(prices.pro.year, now) },
    },
    vip: {
      '10day': { ...prices.vip['10day'], effectiveVnd: effectivePrice(prices.vip['10day'], now) },
      month: { ...prices.vip.month, effectiveVnd: effectivePrice(prices.vip.month, now) },
      year: { ...prices.vip.year, effectiveVnd: effectivePrice(prices.vip.year, now) },
    },
  }

  return jsonResponse(body, 200, { ...allHeaders, 'Cache-Control': 'public, max-age=60' })
}

export const config = { runtime: 'edge' }

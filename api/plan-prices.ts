// api/plan-prices.ts — Đọc CÔNG KHAI bảng giá Pro/VIP (public.plan_prices), KHÔNG cần đăng
// nhập — chỉ là giá bán hiển thị, không phải dữ liệu riêng tư. Khác api/checkout.ts (TẠO đơn,
// bắt buộc đăng nhập). UI (UpgradeSection.tsx) gọi endpoint này để hiện bảng giá trước khi
// người dùng bấm mua.
//
// GET /api/plan-prices

import {
  getPlanPrices,
  effectivePrice,
  effectiveTotalPrice,
  MAX_PROMO_YEARS,
  type PriceEntry,
} from './_lib/prices.js'
import { getPricePromo, activePromoPercent } from './_lib/pricePromo.js'
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

  const [prices, promo] = await Promise.all([getPlanPrices(), getPricePromo()])
  const now = new Date()
  const pct = activePromoPercent(promo, now)

  // Tổng tiền mua N năm liền (1..MAX_PROMO_YEARS) cho gói theo chu kỳ 'year' — UI dùng để hiện
  // giá theo số năm người dùng chọn, không phải tự tính lại công thức giảm giá luỹ tiến.
  function yearTotals(entry: PriceEntry): number[] {
    return Array.from({ length: MAX_PROMO_YEARS }, (_, i) =>
      effectiveTotalPrice(entry, i + 1, now, pct),
    )
  }

  // Trả kèm cả giá niêm yết lẫn giá đang áp dụng — UI cần cả hai để hiện "gạch giá cũ" khi
  // đang khuyến mãi (xem docs/research/dac-ta-thanh-toan-2026-07-25.md mục "Khuyến mãi dịp lễ").
  const body = {
    promoPercent: pct,
    // Chỉ trả kèm mốc kết thúc khi khuyến mãi đang THẬT SỰ hiệu lực (pct !== null) — tránh
    // lộ lịch khuyến mãi tương lai chưa công bố nếu admin đã đặt trước nhưng chưa tới giờ.
    promoEndsAt: pct !== null ? promo.endsAt : null,
    maxPromoYears: MAX_PROMO_YEARS,
    pro: {
      '10day': {
        ...prices.pro['10day'],
        effectiveVnd: effectivePrice(prices.pro['10day'], now, pct),
      },
      month: { ...prices.pro.month, effectiveVnd: effectivePrice(prices.pro.month, now, pct) },
      year: {
        ...prices.pro.year,
        effectiveVnd: effectivePrice(prices.pro.year, now, pct),
        yearTotals: yearTotals(prices.pro.year),
      },
    },
    vip: {
      '10day': {
        ...prices.vip['10day'],
        effectiveVnd: effectivePrice(prices.vip['10day'], now, pct),
      },
      month: { ...prices.vip.month, effectiveVnd: effectivePrice(prices.vip.month, now, pct) },
      year: {
        ...prices.vip.year,
        effectiveVnd: effectivePrice(prices.vip.year, now, pct),
        yearTotals: yearTotals(prices.vip.year),
      },
    },
  }

  return jsonResponse(body, 200, { ...allHeaders, 'Cache-Control': 'public, max-age=60' })
}

export const config = { runtime: 'edge' }

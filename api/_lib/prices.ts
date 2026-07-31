// api/_lib/prices.ts — Đọc bảng giá Pro/VIP (public.plan_prices, migration 0014). Cùng khuôn
// mẫu cache TTL ngắn như api/_lib/settings.ts — đọc trên đường nóng của /api/checkout.
import { getPgPool } from '../../packages/core-db/pgPool.js'

export type PayableCycle = '10day' | 'month' | 'year'
export type PayablePlan = 'pro' | 'vip'

// Số ngày cấp cho mỗi chu kỳ — DUY NHẤT một chỗ đổi nếu sau này thêm chu kỳ mới.
export const CYCLE_DAYS: Record<PayableCycle, number> = { '10day': 10, month: 30, year: 365 }

export interface PriceEntry {
  priceVnd: number
  salePriceVnd: number | null
  saleUntil: string | null
}

export type PlanPrices = Record<PayablePlan, Record<PayableCycle, PriceEntry>>

// Mặc định khi DB chưa có dòng nào / query lỗi (fail-open) — PHẢI khớp giá trị seed migration
// 0014 (giá chốt 2026-07-27).
const DEFAULT_PRICES: PlanPrices = {
  pro: {
    '10day': { priceVnd: 20_000, salePriceVnd: null, saleUntil: null },
    month: { priceVnd: 40_000, salePriceVnd: null, saleUntil: null },
    year: { priceVnd: 360_000, salePriceVnd: null, saleUntil: null },
  },
  vip: {
    '10day': { priceVnd: 30_000, salePriceVnd: null, saleUntil: null },
    month: { priceVnd: 75_000, salePriceVnd: null, saleUntil: null },
    year: { priceVnd: 500_000, salePriceVnd: null, saleUntil: null },
  },
}

interface PriceRow {
  plan: PayablePlan
  cycle: PayableCycle
  price_vnd: number
  sale_price_vnd: number | null
  sale_until: Date | null
}

const CACHE_TTL_MS = 30_000
let cache: { value: PlanPrices; fetchedAt: number } | null = null

export async function getPlanPrices(): Promise<PlanPrices> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.value

  try {
    const pool = getPgPool()
    const { rows } = await pool.query<PriceRow>(
      'select plan, cycle, price_vnd, sale_price_vnd, sale_until from public.plan_prices',
    )
    // Bắt đầu từ mặc định rồi ghi đè bằng dữ liệu DB — nếu DB thiếu 1 dòng (chưa migrate hết),
    // gói/chu kỳ đó vẫn có giá mặc định hợp lý thay vì `undefined` làm vỡ /api/checkout.
    const value: PlanPrices = {
      pro: { ...DEFAULT_PRICES.pro },
      vip: { ...DEFAULT_PRICES.vip },
    }
    for (const row of rows) {
      value[row.plan][row.cycle] = {
        priceVnd: row.price_vnd,
        salePriceVnd: row.sale_price_vnd,
        saleUntil: row.sale_until ? new Date(row.sale_until).toISOString() : null,
      }
    }
    cache = { value, fetchedAt: Date.now() }
    return value
  } catch (err) {
    console.warn('[prices] Đọc plan_prices lỗi → dùng mặc định (fail-open):', err)
    return DEFAULT_PRICES
  }
}

export function invalidatePricesCache(): void {
  cache = null
}

// Mua nhiều năm liền (chu kỳ 'year') MỘT LẦN — giảm giá luỹ tiến theo số năm, quyết định người
// dùng 2026-07-30: năm 2 giảm 20%, năm 3 giảm 30%... +10%/năm, TRẦN 80%. Năm 1 (mua lẻ) = 0%.
export const MAX_PROMO_YEARS = 5

export function multiYearDiscountPercent(years: number): number {
  if (!Number.isFinite(years) || years <= 1) return 0
  return Math.min(80, Math.floor(years) * 10)
}

// Tổng tiền phải trả cho `years` năm liền (chỉ có ý nghĩa với cycle='year', years=1 cho
// '10day'/'month'). Quyết định người dùng 2026-07-30: giảm giá nhiều năm và % khuyến mãi toàn
// cục KHÔNG cộng dồn — chỉ áp mức giảm CAO HƠN trong 2, tránh giảm giá chồng ngoài ý muốn.
export function effectiveTotalPrice(
  entry: PriceEntry,
  years: number,
  now: Date = new Date(),
  globalPromoPercent: number | null = null,
): number {
  const safeYears = Math.max(1, Math.floor(years))
  // Mua nhiều năm (>1): sale_price_vnd riêng dòng KHÔNG áp dụng — giá đó chỉ định nghĩa cho
  // 1 năm, dùng cho tổng nhiều năm sẽ sai ý nghĩa. Chỉ % (nhiều năm hoặc khuyến mãi) mới áp.
  if (safeYears > 1) {
    const pct = Math.max(multiYearDiscountPercent(safeYears), globalPromoPercent ?? 0)
    return effectivePrice(
      { priceVnd: entry.priceVnd * safeYears, salePriceVnd: null, saleUntil: null },
      now,
      pct,
    )
  }
  // 1 năm (hoặc chu kỳ khác): giữ nguyên hành vi cũ — sale_price_vnd riêng dòng vẫn có hiệu lực
  // khi KHÔNG có khuyến mãi toàn cục đang chạy (effectivePrice tự ưu tiên promoPercent nếu có).
  return effectivePrice(entry, now, globalPromoPercent)
}

// Giá THẬT phải trả ngay bây giờ: giá khuyến mãi nếu đang trong hạn, ngược lại giá niêm yết.
// `promoPercent`: % khuyến mãi TOÀN BỘ gói đang chạy (xem api/_lib/pricePromo.ts), null nếu
// không có. Ưu tiên hơn sale_price_vnd riêng dòng (cơ chế cũ, chưa có admin API nào set) —
// 2 cơ chế không cộng dồn, tránh giảm giá 2 lần ngoài ý muốn.
export function effectivePrice(
  entry: PriceEntry,
  now: Date = new Date(),
  promoPercent: number | null = null,
): number {
  if (promoPercent != null && promoPercent > 0) {
    // Làm tròn về đơn vị 1.000đ — giá lẻ dưới nghìn không hợp lý cho chuyển khoản ngân hàng VN.
    return Math.round((entry.priceVnd * (100 - promoPercent)) / 100 / 1000) * 1000
  }
  if (
    entry.salePriceVnd != null &&
    entry.saleUntil &&
    now.getTime() < new Date(entry.saleUntil).getTime()
  ) {
    return entry.salePriceVnd
  }
  return entry.priceVnd
}

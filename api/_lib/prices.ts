// api/_lib/prices.ts — Đọc bảng giá Pro/VIP (public.plan_prices, migration 0014). Cùng khuôn
// mẫu cache TTL ngắn như api/_lib/settings.ts — đọc trên đường nóng của /api/checkout.
import { getPgPool } from './pgPool.js'

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

// Giá THẬT phải trả ngay bây giờ: giá khuyến mãi nếu đang trong hạn, ngược lại giá niêm yết.
export function effectivePrice(entry: PriceEntry, now: Date = new Date()): number {
  if (
    entry.salePriceVnd != null &&
    entry.saleUntil &&
    now.getTime() < new Date(entry.saleUntil).getTime()
  ) {
    return entry.salePriceVnd
  }
  return entry.priceVnd
}

// api/_lib/pricePromo.ts — Đọc/ghi khuyến mãi % áp dụng cho TOÀN BỘ gói/chu kỳ cùng lúc
// (bảng public.price_promo, migration 0026), quản lý qua api/admin-price-promo.ts. Khác
// api/_lib/prices.ts (sale_price_vnd — giá tuyệt đối riêng từng dòng, không admin API nào
// dùng). Cùng khuôn cache TTL ngắn như settings.ts.
import { getPgPool } from './pgPool.js'

export interface PricePromo {
  percent: number
  startsAt: string | null
  endsAt: string | null
  updatedAt: string
}

// Fail-open về "không có khuyến mãi" — lỗi hạ tầng KHÔNG được vô tình giảm giá cho mọi người.
const DEFAULT_PROMO: PricePromo = {
  percent: 0,
  startsAt: null,
  endsAt: null,
  updatedAt: '1970-01-01T00:00:00.000Z',
}

interface PricePromoRow {
  percent: number
  starts_at: Date | null
  ends_at: Date | null
  updated_at: Date
}

function rowToPromo(row: PricePromoRow): PricePromo {
  return {
    percent: row.percent,
    startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

const CACHE_TTL_MS = 30_000
let cache: { value: PricePromo; fetchedAt: number } | null = null

export async function getPricePromo(): Promise<PricePromo> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.value

  try {
    const pool = getPgPool()
    const { rows } = await pool.query<PricePromoRow>(
      'select percent, starts_at, ends_at, updated_at from public.price_promo where id = 1',
    )
    const value = rows[0] ? rowToPromo(rows[0]) : DEFAULT_PROMO
    cache = { value, fetchedAt: Date.now() }
    return value
  } catch (err) {
    console.warn(
      '[pricePromo] Đọc price_promo lỗi → dùng mặc định (fail-open, không giảm giá):',
      err,
    )
    return DEFAULT_PROMO
  }
}

export function invalidatePricePromoCache(): void {
  cache = null
}

// % đang thật sự có hiệu lực tại thời điểm `now` — null nếu không có khuyến mãi nào đang chạy
// (percent=0, hoặc thiếu starts_at/ends_at, hoặc now nằm ngoài khoảng).
export function activePromoPercent(promo: PricePromo, now: Date = new Date()): number | null {
  if (promo.percent <= 0 || !promo.startsAt || !promo.endsAt) return null
  const t = now.getTime()
  if (t < new Date(promo.startsAt).getTime() || t > new Date(promo.endsAt).getTime()) return null
  return promo.percent
}

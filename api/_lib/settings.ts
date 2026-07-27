// api/_lib/settings.ts — Đọc cấu hình hạn mức/khuyến mãi do ADMIN chỉnh qua
// /api/admin-settings (bảng public.app_settings, 1 dòng duy nhất id=1). Cache trong bộ
// nhớ tiến trình (TTL ngắn) để không tra DB ở MỌI request tính lượt/giọng — usage.ts và
// promo.ts nằm trên đường nóng nhất của app (gọi ở mọi request Chat/Speaking/TTS...).
import { getPgPool } from './pgPool.js'

export interface AppSettings {
  // Quyết định 2026-07-27: hạn mức Pro/VIP là MỘT con số TỔNG lượt/ngày cho MỌI tính năng AI
  // cộng lại (không còn chia riêng chat/writing/speaking/stt/pronounce) — cùng triết lý đã áp
  // cho Free từ trước (kho lượt tuần chung, xem usage.ts FREE_WEEKLY_*). Free KHÔNG có mặt ở
  // đây vì không enforce qua app_settings (xem usage.ts).
  limits: { pro: number; vip: number }
  // null = không có khuyến mãi đang chạy (áp hạn mức thật ngay)
  promoUntil: string | null
  // Cầu dao khẩn cấp chặn TOÀN BỘ lượt gọi AI (chat/writing/speaking/stt/pronounce) — admin bật
  // qua /api/admin-settings khi phát hiện chi phí bất thường. Xem api/_lib/usage.ts +
  // postgres/migrations/0005_ai_circuit_breaker.sql.
  aiCircuitBreaker: boolean
  // "Token" để client so sánh — chính là updated_at của dòng cấu hình (ISO string). Client
  // gửi lại qua header If-None-Match (xem api/app-settings.ts); server trả 304 nếu trùng,
  // client bỏ qua parse/ghi cache — KHÔNG cần tự viết cơ chế so token riêng, tận dụng đúng
  // ngữ nghĩa ETag/If-None-Match chuẩn HTTP.
  updatedAt: string
}

// Mặc định dùng khi DB CHƯA có dòng cấu hình hoặc query lỗi (fail-open, giống mọi nơi khác
// trong app — không để lỗi hạ tầng làm vỡ luồng chính) — PHẢI khớp giá trị seed trong
// postgres/migrations/0016_daily_total_limit.sql (Pro 30/ngày, VIP 300/ngày, đều là TỔNG).
const DEFAULT_SETTINGS: AppSettings = {
  limits: { pro: 30, vip: 300 },
  promoUntil: '2027-01-01T00:00:00+07:00',
  aiCircuitBreaker: false,
  updatedAt: '1970-01-01T00:00:00.000Z',
}

interface AppSettingsRow {
  pro_daily_limit: number
  vip_daily_limit: number
  promo_until: Date | null
  ai_circuit_breaker: boolean
  updated_at: Date
}

function rowToSettings(row: AppSettingsRow): AppSettings {
  return {
    limits: { pro: row.pro_daily_limit, vip: row.vip_daily_limit },
    promoUntil: row.promo_until ? new Date(row.promo_until).toISOString() : null,
    aiCircuitBreaker: Boolean(row.ai_circuit_breaker),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

const CACHE_TTL_MS = 30_000 // 30s — admin đổi cấu hình có hiệu lực gần như ngay, không cần restart
let cache: { value: AppSettings; fetchedAt: number } | null = null

export async function getAppSettings(): Promise<AppSettings> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.value

  try {
    const pool = getPgPool()
    const { rows } = await pool.query<AppSettingsRow>(
      'select * from public.app_settings where id = 1',
    )
    const value = rows[0] ? rowToSettings(rows[0]) : DEFAULT_SETTINGS
    cache = { value, fetchedAt: Date.now() }
    return value
  } catch (err) {
    console.warn('[settings] Đọc app_settings lỗi → dùng mặc định (fail-open):', err)
    return DEFAULT_SETTINGS
  }
}

// Gọi sau khi admin POST cập nhật thành công — để lần đọc TIẾP THEO thấy giá trị mới ngay,
// không phải đợi hết TTL.
export function invalidateSettingsCache(): void {
  cache = null
}

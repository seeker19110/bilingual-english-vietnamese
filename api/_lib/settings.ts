// api/_lib/settings.ts — Đọc cấu hình hạn mức/khuyến mãi do ADMIN chỉnh qua
// /api/admin-settings (bảng public.app_settings, 1 dòng duy nhất id=1). Cache trong bộ
// nhớ tiến trình (TTL ngắn) để không tra DB ở MỌI request tính lượt/giọng — usage.ts và
// promo.ts nằm trên đường nóng nhất của app (gọi ở mọi request Chat/Speaking/TTS...).
import { getPgPool } from './pgPool'
import type { Plan } from './plan'
import type { UsageMode } from './usage'

export interface AppSettings {
  limits: Record<Plan, Record<UsageMode, number>>
  // null = không có khuyến mãi đang chạy (áp hạn mức thật ngay)
  promoUntil: string | null
}

// Mặc định dùng khi DB CHƯA có dòng cấu hình hoặc query lỗi (fail-open, giống mọi nơi khác
// trong app — không để lỗi hạ tầng làm vỡ luồng chính) — PHẢI khớp giá trị seed trong
// postgres/migrations/0001_app_settings.sql.
const DEFAULT_SETTINGS: AppSettings = {
  limits: {
    free: { chat: 5, writing: 5, speaking: 5, stt: 5, pronounce: 5 },
    pro: { chat: 100, writing: 100, speaking: 100, stt: 100, pronounce: 100 },
    vip: { chat: 1_000_000, writing: 1_000_000, speaking: 1_000_000, stt: 1_000_000, pronounce: 1_000_000 },
  },
  promoUntil: '2027-01-01T00:00:00+07:00',
}

interface AppSettingsRow {
  free_chat_limit: number
  free_writing_limit: number
  free_speaking_limit: number
  free_stt_limit: number
  free_pronounce_limit: number
  pro_chat_limit: number
  pro_writing_limit: number
  pro_speaking_limit: number
  pro_stt_limit: number
  pro_pronounce_limit: number
  vip_chat_limit: number
  vip_writing_limit: number
  vip_speaking_limit: number
  vip_stt_limit: number
  vip_pronounce_limit: number
  promo_until: Date | null
}

function rowToSettings(row: AppSettingsRow): AppSettings {
  return {
    limits: {
      free: {
        chat: row.free_chat_limit,
        writing: row.free_writing_limit,
        speaking: row.free_speaking_limit,
        stt: row.free_stt_limit,
        pronounce: row.free_pronounce_limit,
      },
      pro: {
        chat: row.pro_chat_limit,
        writing: row.pro_writing_limit,
        speaking: row.pro_speaking_limit,
        stt: row.pro_stt_limit,
        pronounce: row.pro_pronounce_limit,
      },
      vip: {
        chat: row.vip_chat_limit,
        writing: row.vip_writing_limit,
        speaking: row.vip_speaking_limit,
        stt: row.vip_stt_limit,
        pronounce: row.vip_pronounce_limit,
      },
    },
    promoUntil: row.promo_until ? new Date(row.promo_until).toISOString() : null,
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

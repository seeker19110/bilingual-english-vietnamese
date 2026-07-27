// src/lib/appSettings.ts — Đọc hạn mức/khuyến mãi hiện hành từ server (bảng app_settings,
// admin chỉnh qua /api/admin-settings) NGAY LÚC MỞ APP, thay vì dùng số tĩnh hard-code mãi
// mãi. Hydrate NGAY (đồng bộ) từ localStorage để có giá trị dùng được tức thì (tránh UI
// nhấp nháy "5 lượt" rồi nhảy lên "100 lượt"), sau đó refreshAppSettings() ở App.tsx gọi
// /api/app-settings (public, không cần đăng nhập) để cập nhật lại cho đúng.
import type { Plan } from '../types'
import { LIMITS as DEFAULT_LIMITS } from '../types'

export type UsageMode = 'chat' | 'writing' | 'speaking' | 'stt' | 'pronounce'

export interface AppSettings {
  limits: Record<Plan, Record<UsageMode, number>>
  promoUntil: string | null
  // Bật/tắt bảng xếp hạng (Challenge.tsx → LeagueSection) — xem api/_lib/settings.ts.
  leaderboardEnabled: boolean
  // Token so sánh (= updated_at ở server) — dùng làm ETag/If-None-Match, xem refreshAppSettings().
  updatedAt: string
}

const DEFAULT_SETTINGS: AppSettings = {
  limits: DEFAULT_LIMITS,
  promoUntil: '2027-01-01T00:00:00+07:00',
  leaderboardEnabled: false,
  updatedAt: '1970-01-01T00:00:00.000Z',
}

const CACHE_KEY = 'app_settings_cache'

function loadFromLocalStorage(): AppSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    if (!parsed.limits || !parsed.updatedAt) return null
    return {
      limits: parsed.limits as AppSettings['limits'],
      promoUntil: parsed.promoUntil ?? null,
      leaderboardEnabled: parsed.leaderboardEnabled ?? false,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

let current: AppSettings = loadFromLocalStorage() ?? DEFAULT_SETTINGS

export function getAppSettings(): AppSettings {
  return current
}

export function getLimits(): Record<Plan, Record<UsageMode, number>> {
  return current.limits
}

export function isLeaderboardEnabled(): boolean {
  return current.leaderboardEnabled
}

// Gọi 1 lần lúc app khởi động (App.tsx) — public, không cần header đăng nhập.
//
// Gửi kèm If-None-Match: token (updatedAt) đang có trong cache — admin CHƯA đổi gì thì
// server trả 304 (rỗng), ta GIỮ NGUYÊN cache hiện có, không cần parse/ghi lại gì cả. Chỉ khi
// admin đã đổi (token khác) server mới trả body mới + token mới, lúc đó mới cập nhật cache.
// Lỗi mạng/server thì bỏ qua êm, giữ nguyên giá trị cache/mặc định đang có (fail-open).
export async function refreshAppSettings(): Promise<void> {
  try {
    const res = await fetch('/api/app-settings', {
      headers: { 'If-None-Match': `"${current.updatedAt}"` },
    })
    if (res.status === 304) return // Không đổi gì — cache hiện tại vẫn đúng, khỏi làm gì thêm
    if (!res.ok) return
    const data = (await res.json()) as AppSettings
    current = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* giữ nguyên cache/mặc định hiện có */
  }
}

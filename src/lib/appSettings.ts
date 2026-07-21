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
}

const DEFAULT_SETTINGS: AppSettings = {
  limits: DEFAULT_LIMITS,
  promoUntil: '2027-01-01T00:00:00+07:00',
}

const CACHE_KEY = 'app_settings_cache'

function loadFromLocalStorage(): AppSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    if (!parsed.limits) return null
    return { limits: parsed.limits as AppSettings['limits'], promoUntil: parsed.promoUntil ?? null }
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

// Gọi 1 lần lúc app khởi động (App.tsx) — public, không cần header đăng nhập. Lỗi mạng/server
// thì bỏ qua êm, giữ nguyên giá trị cache/mặc định đang có (fail-open, không chặn app chạy).
export async function refreshAppSettings(): Promise<void> {
  try {
    const res = await fetch('/api/app-settings')
    if (!res.ok) return
    const data = (await res.json()) as AppSettings
    current = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* giữ nguyên cache/mặc định hiện có */
  }
}

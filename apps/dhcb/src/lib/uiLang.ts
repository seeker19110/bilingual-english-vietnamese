// Lưu và đọc ngôn ngữ giao diện (vi / en) từ localStorage
// [Cập nhật 2026-08-13] Đã đồng bộ đa thiết bị qua learning_progress.settings — xem
// lib/progressSync.ts (touchSettingsUpdated đánh dấu mốc để hợp nhất theo "mới hơn thắng").
import { touchSettingsUpdated } from './storage'

export type UiLang = 'vi' | 'en'

const KEY = 'ui_lang'

export function getUiLang(): UiLang {
  return (localStorage.getItem(KEY) as UiLang) ?? 'vi'
}

export function setUiLang(lang: UiLang) {
  localStorage.setItem(KEY, lang)
  touchSettingsUpdated()
}

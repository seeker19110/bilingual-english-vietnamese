// File này chỉ tạo context object + định nghĩa kiểu — không có component hay hook
import { createContext } from 'react'
import type { Translations } from '../i18n'
import type { UiLang } from '../lib/uiLang'

export interface LangContextValue {
  lang: UiLang
  toggleLang: () => void
  T: Translations
}

export const LangContext = createContext<LangContextValue | null>(null)

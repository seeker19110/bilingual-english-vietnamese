import { createContext, useContext, useState, type ReactNode } from 'react'
import { getUiLang, setUiLang, type UiLang } from '../lib/uiLang'
import { t, type Translations } from '../i18n'

interface LangContextValue {
  lang: UiLang
  toggleLang: () => void
  T: Translations  // object chứa tất cả chuỗi đã dịch
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<UiLang>(getUiLang)

  function toggleLang() {
    const next: UiLang = lang === 'vi' ? 'en' : 'vi'
    setUiLang(next)
    setLang(next)
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, T: t[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

// Hook tiện lợi — dùng trong mọi component: const { T, lang, toggleLang } = useLang()
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}

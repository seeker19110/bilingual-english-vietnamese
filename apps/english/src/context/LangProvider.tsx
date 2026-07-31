import { useState, type ReactNode } from 'react'
import { LangContext } from './langContext'
import { getUiLang, setUiLang, type UiLang } from '../lib/uiLang'
import { t } from '../i18n'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<UiLang>(getUiLang)

  function toggleLang() {
    const next: UiLang = lang === 'vi' ? 'en' : 'vi'
    setUiLang(next)
    setLang(next)
  }

  function setLangDirect(l: UiLang) {
    setUiLang(l)
    setLang(l)
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLang: setLangDirect, T: t[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

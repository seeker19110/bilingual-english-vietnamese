import { useContext } from 'react'
import { LangContext } from './langContext'

// Hook tiện lợi — dùng trong mọi component: const { T, lang, toggleLang } = useLang()
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}

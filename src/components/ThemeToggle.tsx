import { Sun, Moon, Palette } from 'lucide-react'
import { useTheme } from '../context/useTheme'
import { useLang } from '../context/useLang'
import { THEMES, type Theme } from '../lib/theme'

// Nút xoay vòng theme: Sáng → Tối → Xanh đêm → Sáng...
const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  'dark-blue': Palette,
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { lang } = useLang()

  function cycle() {
    const idx = THEMES.findIndex((t) => t.value === theme)
    const next = THEMES[(idx + 1) % THEMES.length].value
    setTheme(next)
  }

  const Icon = ICONS[theme]
  const current = THEMES.find((t) => t.value === theme)!
  const label = lang === 'vi' ? current.labelVi : current.labelEn

  return (
    <button
      onClick={cycle}
      title={`${lang === 'vi' ? 'Giao diện' : 'Theme'}: ${label}`}
      aria-label={`${lang === 'vi' ? 'Đổi giao diện' : 'Change theme'} (${label})`}
      className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition shrink-0 p-3 rounded-lg hover:bg-zinc-800/50">
      <Icon className="w-4 h-4" />
    </button>
  )
}

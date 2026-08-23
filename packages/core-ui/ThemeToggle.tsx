import { Palette } from 'lucide-react'
import { useTheme } from './useTheme.js'
import { THEMES } from './theme.js'

export interface ThemeToggleProps {
  lang?: 'vi' | 'en'
  className?: string
}

// Nút đổi giao diện dùng chung toàn monorepo: bấm là chuyển tuần tự sang theme kế tiếp
// trong danh sách (Xanh đêm → Blue sky → Pink → Rực rỡ → quay lại Xanh đêm).
// Tự động ẩn khi theme bị khoá cứng (ví dụ nhóm tuổi Nhi đồng).
export function ThemeToggle({ lang = 'vi', className }: ThemeToggleProps) {
  const { theme, setTheme, locked } = useTheme()

  if (locked) return null

  const index = Math.max(
    THEMES.findIndex((t) => t.value === theme),
    0,
  )
  const current = THEMES[index]!
  const next = THEMES[(index + 1) % THEMES.length]!
  const label = lang === 'vi' ? current.labelVi : current.labelEn
  const nextLabel = lang === 'vi' ? next.labelVi : next.labelEn

  function cycleTheme() {
    setTheme(next.value)
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`${lang === 'vi' ? 'Giao diện' : 'Theme'}: ${label} — ${lang === 'vi' ? 'bấm để đổi sang' : 'tap to switch to'} ${nextLabel}`}
      aria-label={`${lang === 'vi' ? 'Đổi giao diện' : 'Change theme'} (${lang === 'vi' ? 'hiện tại' : 'current'}: ${label})`}
      className={
        className ??
        'tap-44 flex items-center justify-center text-zinc-400 hover:text-white transition p-2.5 rounded-lg hover:bg-zinc-800/50 shrink-0'
      }
    >
      <Palette className="w-5 h-5" />
    </button>
  )
}

export default ThemeToggle

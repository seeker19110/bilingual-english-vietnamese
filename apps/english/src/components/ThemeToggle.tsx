import { Palette } from 'lucide-react'
import { useTheme } from '@core/useTheme'
import { useLang } from '../context/useLang'
import { THEMES } from '@core/theme'

// Nút đổi giao diện: bấm là chuyển tuần tự sang theme kế tiếp trong danh sách
// (Xanh đêm → Blue sky → Pink → Rực rỡ → quay lại Xanh đêm), không mở menu chọn.
export default function ThemeToggle() {
  const { theme, setTheme, locked } = useTheme()
  const { lang } = useLang()

  // Nhóm tuổi Nhi đồng bị khoá cứng vào 1 theme riêng (kế hoạch "giao diện + nội dung
  // theo độ tuổi") — không có gì để đổi nên ẩn hẳn nút, không hiện dạng disabled.
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
      onClick={cycleTheme}
      title={`${lang === 'vi' ? 'Giao diện' : 'Theme'}: ${label} — ${lang === 'vi' ? 'bấm để đổi sang' : 'tap to switch to'} ${nextLabel}`}
      aria-label={`${lang === 'vi' ? 'Đổi giao diện' : 'Change theme'} (${lang === 'vi' ? 'hiện tại' : 'current'}: ${label})`}
      className="tap-44 flex items-center justify-center text-zinc-400 hover:text-white transition p-2.5 rounded-lg hover:bg-zinc-800/50 shrink-0"
    >
      <Palette className="w-5 h-5" />
    </button>
  )
}

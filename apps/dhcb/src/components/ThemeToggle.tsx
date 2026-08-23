import { ThemeToggle as CoreThemeToggle } from '@core/ThemeToggle'
import { useLang } from '../context/useLang'

// Nút đổi giao diện: bấm là chuyển tuần tự sang theme kế tiếp trong danh sách
// (Xanh đêm → Blue sky → Pink → Rực rỡ → quay lại Xanh đêm), không mở menu chọn.
export default function ThemeToggle({ className }: { className?: string }) {
  const { lang } = useLang()
  return <CoreThemeToggle lang={lang} className={className} />
}

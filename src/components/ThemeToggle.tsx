import { useEffect, useRef, useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '../context/useTheme'
import { useLang } from '../context/useLang'
import { THEMES } from '../lib/theme'

// Menu chọn giao diện: Xanh đêm · Blue sky · Pink · Rực rỡ.
// Mỗi mục có ô swatch (nền + màu nhấn) để xem trước, dấu ✓ ở theme đang dùng.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Đóng menu khi bấm ra ngoài hoặc nhấn Esc
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = THEMES.find((t) => t.value === theme)!
  const label = lang === 'vi' ? current.labelVi : current.labelEn

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={`${lang === 'vi' ? 'Giao diện' : 'Theme'}: ${label}`}
        aria-label={`${lang === 'vi' ? 'Đổi giao diện' : 'Change theme'} (${label})`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center text-zinc-400 hover:text-white transition p-2.5 rounded-lg hover:bg-zinc-800/50">
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 glass rounded-xl p-1.5 shadow-xl z-50 animate-scale-in origin-top-right">
          <p className="px-2 py-1 text-[11px] font-medium text-zinc-400">
            {lang === 'vi' ? 'Giao diện' : 'Theme'}
          </p>
          {THEMES.map((t) => {
            const active = t.value === theme
            const name = lang === 'vi' ? t.labelVi : t.labelEn
            return (
              <button
                key={t.value}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(t.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition ${
                  active ? 'bg-accent-500/15 text-white' : 'text-zinc-300 hover:bg-zinc-800/60'
                }`}>
                {/* Swatch: ô nền + chấm màu nhấn để xem trước theme */}
                <span
                  className="w-5 h-5 rounded-md border border-zinc-600/50 shrink-0 flex items-center justify-center"
                  style={{ background: t.swatchBg }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.swatchAccent }} />
                </span>
                <span className="flex-1 text-left truncate">{name}</span>
                {active && <Check className="w-4 h-4 text-accent-400 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

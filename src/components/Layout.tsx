import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, BookOpen } from 'lucide-react'
import { logout } from '../lib/auth'
import { getUsage } from '../lib/storage'
import { LIMITS } from '../types'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import ThemeToggle from './ThemeToggle'

interface Props {
  // title/subtitle KHÔNG bắt buộc: nhiều trang nay hiển thị tiêu đề LỚN ngay dưới header
  // (component PageHeader) thay vì nhồi trong thanh header này.
  title?: string
  subtitle?: string
  back?: boolean
  extra?: ReactNode
  streak?: number
}

export default function Layout({ title, subtitle, back = true, extra, streak }: Props) {
  const nav = useNavigate()
  const { user } = useAuth()
  const usage = user ? getUsage(user.id) : null
  const limit = user ? LIMITS[user.plan] : null
  const { T } = useLang()

  async function handleLogout() {
    await logout()
    nav('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 relative pt-safe">
      {/* Gradient accent line trên cùng */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />

      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Back / Logo */}
        {back ? (
          <button
            onClick={() => nav('/')}
            aria-label={T.home}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition shrink-0 -ml-1 p-3 rounded-lg hover:bg-zinc-800/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">{T.home}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center shadow-md shadow-accent-500/30">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white hidden sm:inline tracking-tight">
              {T.appName}
            </span>
          </div>
        )}

        {/* Title — chỉ hiện khi trang truyền title cho header (trang chủ, màn chi tiết…).
            Các trang đã chuyển sang PageHeader sẽ KHÔNG truyền title → ô này chỉ làm spacer
            đẩy các nút bên phải về đúng vị trí. */}
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-[15px] truncate text-white">{title}</p>}
          {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
        </div>

        {/* Streak — hiện ở giữa header khi được truyền vào */}
        {streak != null && streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 rounded-xl px-2.5 py-1.5 shrink-0">
            <span className="text-base leading-none">🔥</span>
            <div className="leading-none">
              <p className="text-sm font-bold text-orange-400">{streak}</p>
              <p className="text-[11px] text-orange-400/60">{T.streakDays}</p>
            </div>
          </div>
        )}

        {/* Usage indicator */}
        {usage && limit && (
          <>
            {/* Desktop: text */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 shrink-0">
              <span>
                {T.chat}{' '}
                <strong className="text-zinc-400">
                  {usage.chatCount}/{limit.chat}
                </strong>
              </span>
              <span>
                {T.speak}{' '}
                <strong className="text-zinc-400">
                  {usage.speakingCount}/{limit.speaking}
                </strong>
              </span>
            </div>
            {/* Mobile: mini badges cho chat và nói */}
            <div className="sm:hidden flex items-center gap-1.5 shrink-0 text-[11px] text-zinc-400">
              <span>
                <strong className="text-zinc-400">{usage.chatCount}</strong>/{limit.chat}
              </span>
              <span className="text-zinc-700">·</span>
              <span>
                <strong className="text-zinc-400">{usage.speakingCount}</strong>/{limit.speaking}
              </span>
            </div>
          </>
        )}

        {/* Nút tùy chỉnh thêm vào header (vd: VoiceToggle) */}
        {extra}

        {/* Nút đổi giao diện: Sáng / Tối / Xanh đêm */}
        <ThemeToggle />

        {/* User avatar (bấm vào để xem trang cá nhân) + logout */}
        {user && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => nav('/profile')}
              aria-label={T.profile}
              title={T.profile}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center text-xs font-bold text-white shadow-sm hover:opacity-85 transition"
            >
              {user.name[0]?.toUpperCase()}
            </button>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 transition p-3 rounded-lg hover:bg-red-400/10"
              title={T.logout}
              aria-label={T.logout}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

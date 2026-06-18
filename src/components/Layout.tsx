import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, BookOpen } from 'lucide-react'
import { getCurrentUser, logout } from '../lib/storage'
import { getUsage } from '../lib/storage'
import { LIMITS } from '../types'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
}

export default function Layout({ title, subtitle, back = true }: Props) {
  const nav = useNavigate()
  const user = getCurrentUser()
  const usage = user ? getUsage(user.id) : null
  const limit = user ? LIMITS[user.plan] : null

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo / back */}
        {back ? (
          <button onClick={() => nav('/')}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Trang chủ</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-white hidden sm:inline">Gia sư AI</span>
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{title}</p>
          {subtitle && <p className="text-xs text-zinc-500 truncate">{subtitle}</p>}
        </div>

        {/* Usage badge */}
        {usage && limit && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 shrink-0">
            <span>Chat: <strong className="text-zinc-300">{usage.chatCount}/{limit.chat}</strong></span>
            <span>Nói: <strong className="text-zinc-300">{usage.speakingCount}/{limit.speaking}</strong></span>
          </div>
        )}

        {/* User + logout */}
        {user && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              {user.name[0]?.toUpperCase()}
            </div>
            <button onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition p-1 rounded">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

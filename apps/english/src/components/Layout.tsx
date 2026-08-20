import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Layers,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Calculator,
  Briefcase,
  Heart,
  Dumbbell,
} from 'lucide-react'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { getStreak } from '../lib/storage'
import ThemeToggle from './ThemeToggle'
import OfflineStatusBanner from './OfflineStatusBanner'

interface Props {
  // title/subtitle KHÔNG bắt buộc: nhiều trang nay hiển thị tiêu đề LỚN ngay dưới header
  // (component PageHeader) thay vì nhồi trong thanh header này.
  title?: string
  subtitle?: string
  back?: boolean
  // Đích đến khi bấm back — mặc định về Trang chủ ('/'). Trang có PHÂN CẤP điều hướng riêng
  // (vd CefrLevelPage: cấp → vòng từ vựng/bài ngữ pháp/hội thoại) truyền hàm này để back luôn
  // lùi ĐÚNG 1 BƯỚC theo cấp bậc đó, KỂ CẢ khi người dùng vào "tắt" từ Home (vd nút "Học tiếp"
  // nhảy thẳng vào 1 cấp) — không phụ thuộc lối vào, back luôn nhất quán theo cấu trúc trang.
  onBack?: () => void
  extra?: ReactNode
}

const STUDIOS = [
  {
    id: 'companion',
    title: 'Bạn Đồng Hành AI',
    subtitle: 'Live Voice, 3D Avatar & Socratic AI',
    to: '/dong-hanh',
    icon: Sparkles,
    badge: 'Executive',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60',
  },
  {
    id: 'english',
    title: 'Gia Sư Tiếng Anh',
    subtitle: 'Lộ trình CEFR A1-C2 & 4 Kỹ năng',
    to: '/lo-trinh-hoc',
    icon: GraduationCap,
    badge: 'A1-C2',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    id: 'practice',
    title: 'Hub Luyện Tập',
    subtitle: 'Nghe · Nói IPA · Viết IELTS · Đọc',
    to: '/luyen-tap',
    icon: Dumbbell,
    badge: '4 Kỹ năng',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60',
  },
  {
    id: 'subjects',
    title: 'Khoa Học & STEM',
    subtitle: 'Toán, Lý, Hóa, Sinh & Simulators',
    to: '/subjects',
    icon: Calculator,
    badge: 'Vision OCR',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
  },
  {
    id: 'career',
    title: 'Sự Nghiệp & Công Việc',
    subtitle: 'Phỏng vấn STAR & Kanban Board',
    to: '/su-nghiep',
    icon: Briefcase,
    badge: 'Work OS',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
  },
  {
    id: 'life',
    title: 'Đời Sống & Bản Đồ Ký Ức',
    subtitle: 'Bánh xe cuộc đời & Life Graph',
    to: '/cuoc-song',
    icon: Heart,
    badge: 'Life OS',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60',
  },
]

export default function Layout({ title, subtitle, back = true, onBack, extra }: Props) {
  const nav = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { T } = useLang()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Streak tự lấy ở ĐÂY (không nhận qua prop nữa) — áp dụng TOÀN CỤC, hiện trên MỌI
  // trang có Layout, không cần từng trang tự truyền vào (trước đây dễ quên).
  const streak = user ? getStreak(user.id) : 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSwitcherOpen(false)
    }
    if (switcherOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [switcherOpen])

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 relative pt-safe shadow-sm">
      {/* Tấm nền ĐẶC phủ toàn bộ khoảng phía TRÊN header cho Reachability */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-full h-screen bg-zinc-950 pointer-events-none"
      />

      {/* Gradient accent line trên cùng */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />

      <OfflineStatusBanner />

      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3 relative">
        {/* Back / Logo */}
        {back ? (
          <button
            onClick={onBack ?? (() => nav('/'))}
            aria-label={T.home}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition shrink-0 -ml-1 p-2.5 rounded-xl hover:bg-zinc-800/60 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">{T.home}</span>
          </button>
        ) : (
          // Logo "Đồng Hành" — bấm vào xem trang giới thiệu tính năng
          <Link
            to="/gioi-thieu"
            aria-label={T.aboutApp}
            title={T.aboutApp}
            className="tap-44 flex items-center gap-2.5 shrink-0 -ml-1 p-1.5 rounded-xl hover:bg-zinc-800/60 transition active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-accent-500 via-accent-400 to-indigo-500 flex items-center justify-center shadow-md shadow-accent-500/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white hidden sm:inline tracking-tight">
              {T.appName}
            </span>
          </Link>
        )}

        {/* Global Studio Switcher Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            aria-expanded={switcherOpen}
            aria-label="Chuyển đổi Studio & Không gian học tập"
            title="Chuyển đổi Studio & Không gian học tập"
            className="tap-44 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/90 text-xs font-semibold text-zinc-200 transition active:scale-95 group"
          >
            <Layers className="w-3.5 h-3.5 text-accent-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden xs:inline">Studio</span>
            <ChevronDown
              className={`w-3 h-3 text-zinc-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Studio Switcher Dropdown */}
          {switcherOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 p-2 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl z-50 animate-fade-up">
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-800/80 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Không Gian Nền Tảng
                </span>
                <span className="text-[10px] text-accent-400 font-semibold bg-accent-500/10 px-1.5 py-0.5 rounded">
                  5 Miền Studio
                </span>
              </div>
              <div className="space-y-1">
                {STUDIOS.map((st) => {
                  const Icon = st.icon
                  const isActive = location.pathname.startsWith(st.to)
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        setSwitcherOpen(false)
                        nav(st.to)
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-zinc-800 border border-accent-500/40 text-white'
                          : 'hover:bg-zinc-800/70 text-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${st.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">{st.title}</span>
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {st.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate leading-tight mt-0.5">
                          {st.subtitle}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Title — chỉ hiện khi trang truyền title cho header */}
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-[15px] truncate text-white">{title}</p>}
          {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
        </div>

        {/* Streak — TOÀN CỤC */}
        {streak > 0 &&
          (title || subtitle ? (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30 rounded-full px-3 py-1 shadow-sm shadow-orange-500/10 shrink-0">
              <span className="text-base leading-none animate-pulse">🔥</span>
              <span className="text-sm font-bold text-orange-400 leading-none">{streak}</span>
              <span className="text-[11px] font-medium text-orange-400 theme-light:text-orange-800 leading-none">
                {T.streakDays}
              </span>
            </div>
          ) : (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30 rounded-full px-3 py-1 shadow-sm shadow-orange-500/10 pointer-events-none">
              <span className="text-base leading-none animate-pulse">🔥</span>
              <span className="text-sm font-bold text-orange-400 leading-none">{streak}</span>
              <span className="text-[11px] font-medium text-orange-400 theme-light:text-orange-800 leading-none">
                {T.streakDays}
              </span>
            </div>
          ))}

        {/* Nút tùy chỉnh thêm vào header (tuỳ trang truyền vào) */}
        {extra}

        {/* Nút truy cập nhanh Bạn Đồng Hành AI toàn cục */}
        <button
          onClick={() => nav('/dong-hanh')}
          aria-label="Mở Bạn Đồng Hành AI"
          title="Bạn Đồng Hành AI (Live Voice & Executive Suite)"
          className="tap-44 relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 border border-accent-500/30 text-accent-300 text-xs font-semibold transition-all active:scale-95 group shadow-sm shrink-0"
        >
          <Bot className="w-3.5 h-3.5 text-accent-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Đồng Hành AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        {/* Nút đổi giao diện: Sáng / Tối / Xanh đêm */}
        <ThemeToggle />

        {/* User avatar + tên đầy đủ (bấm vào để xem trang cá nhân) */}
        {user && (
          <button
            onClick={() => nav('/profile')}
            aria-label={T.profile}
            title={T.profile}
            className="tap-44 flex items-center gap-2 shrink-0 hover:opacity-90 transition active:scale-95 min-w-0 group"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 via-accent-400 to-indigo-500 ring-1.5 ring-accent-500/30 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-accent-500/20 shrink-0 group-hover:scale-105 transition-transform">
              {user.name[0]?.toUpperCase()}
            </span>
            <span className="text-sm font-medium text-white truncate hidden sm:inline max-w-[10rem]">
              {user.name}
            </span>
          </button>
        )}
      </div>
    </header>
  )
}

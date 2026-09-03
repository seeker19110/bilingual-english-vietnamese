// BottomNav — thanh điều hướng dưới cố định, hiện ở màn hình MOBILE/TABLET (<1024px).
// Từ 1024px trở lên (`lg:`) bị ẩn (`lg:hidden`) — desktop dùng DesktopSidebar.tsx thay thế.
// 5 Tab lõi: Trang chủ · Phòng Học · Đồng Hành (Agent) · Luyện tập · Profile
import { Link, useLocation } from 'react-router-dom'
import { Home, GraduationCap, Dumbbell, Sparkles, User, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import type { useOneHandedDrag } from '../lib/useOneHandedDrag'
import SubjectsLink from './SubjectsLink'
// Bảng tiền tố đường dẫn dùng CHUNG với DesktopSidebar — xem lib/navPaths.ts
import {
  LEARNING_PATHS,
  PRACTICE_PATHS,
  COMPANION_PATHS,
  PROFILE_PATHS,
  matchesNav,
} from '../lib/navPaths'

const HIDDEN_PATHS = ['/login', '/onboarding']

interface Props {
  triggerHandlers?: ReturnType<typeof useOneHandedDrag>['triggerHandlers']
  isReachabilityOpen?: boolean
}

export default function BottomNav({ triggerHandlers, isReachabilityOpen }: Props) {
  const { user } = useAuth()
  const { T } = useLang()
  const location = useLocation()

  if (!user || HIDDEN_PATHS.includes(location.pathname)) return null

  const isHome = location.pathname === '/'
  const isLearning = matchesNav(location.pathname, LEARNING_PATHS)
  const isCompanion = matchesNav(location.pathname, COMPANION_PATHS)
  const isPractice = matchesNav(location.pathname, PRACTICE_PATHS)
  const isProfile = matchesNav(location.pathname, PROFILE_PATHS)

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 min-h-[5.25rem] pb-safe bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 shadow-2xl shadow-black/40"
      aria-label="Điều hướng chính"
    >
      {/* Viền sáng gradient đa sắc tinh tế ở đỉnh thanh điều hướng */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />

      {/* Vùng bắt cử chỉ Reachability */}
      {triggerHandlers && (
        <div
          className="absolute -top-[2rem] inset-x-0 bg-zinc-950"
          style={{ touchAction: 'none', height: '2rem' }}
          aria-hidden="true"
          {...triggerHandlers}
        >
          <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
          <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none">
            {isReachabilityOpen ? (
              <ChevronUp className="w-4 h-4 text-accent-400/70 theme-light:text-accent-800/70 animate-bounce" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500 animate-bounce" />
            )}
          </div>
        </div>
      )}

      {/* `min-h` chứ không `h-full`: hộp <nav> nay chỉ có CHIỀU CAO TỐI THIỂU (min-h) nên
          `h-full` sẽ tính về auto — dùng thẳng min-h cùng giá trị cho chắc chắn. */}
      <div className="max-w-3xl mx-auto min-h-[5.25rem] grid grid-cols-5 px-1 items-center">
        {/* Tab 1: Trang chủ */}
        <Link
          to="/"
          aria-current={isHome ? 'page' : undefined}
          className={`tap-44 relative flex flex-col items-center justify-center gap-1 text-center text-xs font-medium transition-all duration-200 group ${
            isHome
              ? 'text-accent-400 theme-light:text-accent-800 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div
            className={`flex items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isHome
                ? 'bg-accent-500/15 text-accent-400 theme-light:text-accent-800 shadow-sm shadow-accent-500/20 scale-105'
                : 'group-hover:bg-zinc-800/40 group-active:scale-95'
            }`}
          >
            <Home
              className={`w-5 h-5 transition-transform duration-200 ${isHome ? 'scale-110' : 'group-hover:scale-105'}`}
            />
          </div>
          <span className="truncate max-w-[4.5rem] tracking-tight">{T.home ?? 'Trang chủ'}</span>
        </Link>

        {/* Tab 2: Phòng Học */}
        <SubjectsLink
          ariaCurrent={isLearning ? 'page' : undefined}
          className={`tap-44 relative flex flex-col items-center justify-center gap-1 text-center text-xs font-medium transition-all duration-200 group ${
            isLearning
              ? 'text-emerald-400 theme-light:text-emerald-800 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div
            className={`flex items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isLearning
                ? 'bg-emerald-500/15 text-emerald-400 theme-light:text-emerald-800 shadow-sm shadow-emerald-500/20 scale-105'
                : 'group-hover:bg-zinc-800/40 group-active:scale-95'
            }`}
          >
            <GraduationCap
              className={`w-5 h-5 transition-transform duration-200 ${isLearning ? 'scale-110' : 'group-hover:scale-105'}`}
            />
          </div>
          <span className="truncate max-w-[4.5rem] tracking-tight">Phòng Học</span>
        </SubjectsLink>

        {/* Tab 3: Agent Bạn Đồng Hành (Nút tâm điểm Orb Glow) */}
        <Link
          to="/ban-dong-hanh"
          aria-current={isCompanion ? 'page' : undefined}
          className="tap-44 relative flex flex-col items-center justify-center -mt-3.5 text-center text-xs font-medium transition-all duration-200 group"
          title="Agent Bạn Đồng Hành"
        >
          <div
            className={`relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-600 via-accent-500 to-indigo-500 text-zinc-950 shadow-lg transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${
              isCompanion
                ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-zinc-950 scale-105'
                : ''
            }`}
          >
            <Sparkles className="w-6 h-6 text-zinc-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-950 animate-pulse" />
          </div>
          <span
            className={`truncate max-w-[5.25rem] tracking-tight mt-0.5 text-[11px] font-bold ${
              isCompanion
                ? 'text-accent-300 theme-light:text-accent-800'
                : 'text-zinc-300 group-hover:text-white'
            }`}
          >
            {/* Nhãn RÚT GỌN: "Agent Bạn Đồng Hành" bị cắt cụt ("Agent Bạn Đồn…") trên máy
                390px vì ô tab chỉ rộng 1/5 màn hình — xem audit 2026-08-31 mục A6. Tên đầy
                đủ vẫn còn ở thuộc tính `title` cho người dùng chuột. */}
            Đồng Hành
          </span>
        </Link>

        {/* Tab 4: Hub Luyện tập */}
        <Link
          to="/luyen-tap"
          aria-current={isPractice ? 'page' : undefined}
          className={`tap-44 relative flex flex-col items-center justify-center gap-1 text-center text-xs font-medium transition-all duration-200 group ${
            isPractice
              ? 'text-sky-400 theme-light:text-sky-800 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div
            className={`flex items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isPractice
                ? 'bg-sky-500/15 text-sky-400 theme-light:text-sky-800 shadow-sm shadow-sky-500/20 scale-105'
                : 'group-hover:bg-zinc-800/40 group-active:scale-95'
            }`}
          >
            <Dumbbell
              className={`w-5 h-5 transition-transform duration-200 ${isPractice ? 'scale-110' : 'group-hover:scale-105'}`}
            />
          </div>
          <span className="truncate max-w-[4.5rem] tracking-tight">
            {T.navPractice ?? 'Luyện tập'}
          </span>
        </Link>

        {/* Tab 5: Profile */}
        <Link
          to="/trang-ca-nhan"
          aria-current={isProfile ? 'page' : undefined}
          className={`tap-44 relative flex flex-col items-center justify-center gap-1 text-center text-xs font-medium transition-all duration-200 group ${
            isProfile
              ? 'text-accent-400 theme-light:text-accent-800 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div
            className={`flex items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isProfile
                ? 'bg-accent-500/15 text-accent-400 theme-light:text-accent-800 shadow-sm shadow-accent-500/20 scale-105'
                : 'group-hover:bg-zinc-800/40 group-active:scale-95'
            }`}
          >
            <User
              className={`w-5 h-5 transition-transform duration-200 ${isProfile ? 'scale-110' : 'group-hover:scale-105'}`}
            />
          </div>
          <span className="truncate max-w-[4.5rem] tracking-tight">Profile</span>
        </Link>
      </div>
    </nav>
  )
}

// BottomNav — thanh điều hướng dưới cố định, hiện ở MỌI kích thước màn hình
// 5 Tab lõi: Trang chủ · Học tập · Đồng Hành AI (Glowing Center Orb) · Luyện tập · Cá nhân
import { Link, useLocation } from 'react-router-dom'
import { Home, Target, Dumbbell, Sparkles, User, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import type { useOneHandedDrag } from '../lib/useOneHandedDrag'

const HIDDEN_PATHS = ['/login', '/onboarding']

const LEARNING_PATHS = [
  '/hoc-tieng-anh',
  '/tieng-anh',
  '/english',
  '/hoc-mon-hoc',
  '/subjects',
  '/mon-hoc',
  '/hoc-ung-dung',
  '/applied-knowledge',
  '/ung-dung-thuc-te',
  '/mo-phong',
]
const PRACTICE_PATHS = [
  '/luyen-tap',
  '/tro-truyen',
  '/luyen-noi',
  '/luyen-viet',
  '/luyen-nghe',
  '/tu-dien',
  '/truyen-song-ngu',
  '/cau-thong-dung',
  '/bai-hoc',
  '/so-tay-loi-sai',
  '/thu-thach',
]
const COMPANION_PATHS = [
  '/agent-ban-dong-hanh',
  '/ban-dong-hanh',
  '/dong-hanh',
  '/companion',
  '/workspace',
  '/action-canvas',
]
const PROFILE_PATHS = [
  '/profile',
  '/cai-dat',
  '/tien-do',
  '/lich-su-hoc',
  '/su-nghiep-cua-toi',
  '/hoc-su-nghiep',
  '/su-nghiep',
  '/career',
  '/cong-viec-cua-toi',
  '/hoc-cong-viec',
  '/cong-viec',
  '/work',
  '/toi-khoi-nghiep',
  '/hoc-khoi-nghiep',
  '/khoi-nghiep',
  '/startup',
  '/cuoc-song-cua-toi',
  '/hoc-cuoc-song',
  '/cuoc-song',
  '/life',
  '/life-graph',
  '/ban-be',
  '/tin-nhan',
]

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
  const isLearning = LEARNING_PATHS.some((p) => location.pathname.startsWith(p))
  const isCompanion = COMPANION_PATHS.some((p) => location.pathname.startsWith(p))
  const isPractice = PRACTICE_PATHS.some((p) => location.pathname.startsWith(p))
  const isProfile = PROFILE_PATHS.some((p) => location.pathname.startsWith(p))

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 h-[5.25rem] pb-safe bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 shadow-2xl shadow-black/40"
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
              <ChevronUp className="w-4 h-4 text-accent-400/70 animate-bounce" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500 animate-bounce" />
            )}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto h-full grid grid-cols-5 px-1 items-center">
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
          <span className="truncate max-w-[4.5rem] tracking-tight">{T.home}</span>
        </Link>

        {/* Tab 2: Học Tiếng Anh */}
        <Link
          to="/hoc-tieng-anh"
          aria-current={isLearning ? 'page' : undefined}
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
            <Target
              className={`w-5 h-5 transition-transform duration-200 ${isLearning ? 'scale-110' : 'group-hover:scale-105'}`}
            />
          </div>
          <span className="truncate max-w-[4.5rem] tracking-tight">Học Tiếng Anh</span>
        </Link>

        {/* Tab 3: Bạn Đồng Hành AI (Nút tâm điểm Orb Glow) */}
        <Link
          to="/agent-ban-dong-hanh"
          aria-current={isCompanion ? 'page' : undefined}
          className="tap-44 relative flex flex-col items-center justify-center -mt-3.5 text-center text-xs font-medium transition-all duration-200 group"
          title="Bạn Đồng Hành AI"
        >
          <div
            className={`relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-600 via-accent-500 to-indigo-500 text-zinc-950 shadow-lg shadow-accent-500/35 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${
              isCompanion
                ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-zinc-950 scale-105'
                : ''
            }`}
          >
            <Sparkles className="w-6 h-6 text-zinc-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-950 animate-pulse" />
          </div>
          <span
            className={`truncate max-w-[4.5rem] tracking-tight mt-0.5 text-[11px] font-bold ${
              isCompanion ? 'text-accent-300' : 'text-zinc-300 group-hover:text-white'
            }`}
          >
            Bạn Đồng Hành
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
          <span className="truncate max-w-[4.5rem] tracking-tight">{T.navPractice}</span>
        </Link>

        {/* Tab 5: Cá nhân / Hồ sơ */}
        <Link
          to="/profile"
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
          <span className="truncate max-w-[4.5rem] tracking-tight">{T.navProfile}</span>
        </Link>
      </div>
    </nav>
  )
}

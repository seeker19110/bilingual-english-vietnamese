// BottomNav — thanh điều hướng dưới cố định, hiện ở MỌI kích thước màn hình
// (mobile lẫn web) — xem `--bnav-h` trong index.css. 4 mục: Trang chủ · Lộ
// trình · Luyện tập · Tiến độ. Ẩn hoàn toàn ở /login, /onboarding (chưa có user).
//
// Tab "Luyện tập" trỏ vào trang hub /practice (gộp Nghe/Nói/Viết — src/pages/Practice.tsx).
// Chat/Speaking/Writing vẫn là route độc lập (điều hướng TỚI từ trang hub), tab vẫn
// sáng khi đang ở 1 trong các route đó để không gây cảm giác "lạc" điều hướng.
import { Link, useLocation } from 'react-router-dom'
import { Home, Target, Dumbbell, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'

const PRACTICE_ROUTES = ['/practice', '/chat', '/speaking', '/writing']
// /login, /onboarding không nằm sau RequireAuth — user context có thể vẫn còn
// (vd vừa đăng nhập nhưng chưa onboarded) nên phải loại trừ theo path, không
// chỉ dựa vào `!user`.
const HIDDEN_PATHS = ['/login', '/onboarding']

export default function BottomNav() {
  const { user } = useAuth()
  const { T } = useLang()
  const location = useLocation()
  const isPracticeRoute = PRACTICE_ROUTES.includes(location.pathname)

  if (!user || HIDDEN_PATHS.includes(location.pathname)) return null

  const TABS = [
    {
      key: 'home',
      to: '/',
      icon: Home,
      label: T.home,
      active: location.pathname === '/',
    },
    {
      key: 'path',
      to: '/learning-path',
      icon: Target,
      label: T.navPath,
      active: location.pathname.startsWith('/learning-path'),
    },
    {
      key: 'practice',
      to: '/practice',
      icon: Dumbbell,
      label: T.navPractice,
      active: isPracticeRoute,
    },
    {
      key: 'progress',
      to: '/progress',
      icon: TrendingUp,
      label: T.navProgress,
      active: location.pathname === '/progress',
    },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 h-[5.25rem] pb-safe bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60"
      aria-label={T.home}
    >
      <div className="max-w-3xl mx-auto h-full grid grid-cols-4">
        {TABS.map(({ key, to, icon: Icon, label, active }) => (
          <Link
            key={key}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={`tap-44 flex flex-col items-center justify-center gap-1 text-center text-xs font-medium leading-tight transition ${
              active
                ? 'text-accent-400 theme-light:text-accent-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

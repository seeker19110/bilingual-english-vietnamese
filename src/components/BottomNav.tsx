// BottomNav — thanh điều hướng dưới cố định, CHỈ hiện < 640px (khớp breakpoint
// `sm:` của Tailwind — xem `--bnav-h` trong index.css). 4 mục: Trang chủ · Lộ
// trình · Luyện tập · Tiến độ. Ẩn hoàn toàn ở /login, /onboarding (chưa có user).
//
// Tab "Luyện tập" không có route cố định — Chat/Nói/Viết là 3 route độc lập,
// không có trang gộp chung. Bấm vào thì tới ĐÚNG chế độ dùng gần nhất (ghi nhớ
// localStorage mỗi khi vào /chat, /speaking, /writing); người dùng mới chưa
// từng vào thì mặc định '/chat' (đã gắn nhãn "Phổ biến" ở Home).
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Target, Dumbbell, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'

const PRACTICE_ROUTES = ['/chat', '/speaking', '/writing']
const DEFAULT_PRACTICE_ROUTE = '/chat'
// /login, /onboarding không nằm sau RequireAuth — user context có thể vẫn còn
// (vd vừa đăng nhập nhưng chưa onboarded) nên phải loại trừ theo path, không
// chỉ dựa vào `!user`.
const HIDDEN_PATHS = ['/login', '/onboarding']
const LAST_PRACTICE_KEY = (uid: string) => `et_last_practice_${uid}`

function getLastPracticeRoute(uid: string): string {
  try {
    const raw = localStorage.getItem(LAST_PRACTICE_KEY(uid))
    if (raw && PRACTICE_ROUTES.includes(raw)) return raw
  } catch {
    /* localStorage không khả dụng — dùng mặc định bên dưới */
  }
  return DEFAULT_PRACTICE_ROUTE
}

function setLastPracticeRoute(uid: string, path: string) {
  try {
    localStorage.setItem(LAST_PRACTICE_KEY(uid), path)
  } catch {
    /* bỏ qua — chỉ ảnh hưởng việc tab Luyện tập nhớ sai chế độ gần nhất */
  }
}

export default function BottomNav() {
  const { user } = useAuth()
  const { T } = useLang()
  const location = useLocation()
  const uid = user?.id ?? ''
  const isPracticeRoute = PRACTICE_ROUTES.includes(location.pathname)

  // Ghi nhớ chế độ luyện tập gần nhất mỗi khi vào 1 trong 3 route luyện tập.
  useEffect(() => {
    if (uid && isPracticeRoute) setLastPracticeRoute(uid, location.pathname)
  }, [uid, isPracticeRoute, location.pathname])

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
      to: isPracticeRoute ? location.pathname : getLastPracticeRoute(uid),
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
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 h-16 pb-safe bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60 grid grid-cols-4"
      aria-label={T.home}
    >
      {TABS.map(({ key, to, icon: Icon, label, active }) => (
        <Link
          key={key}
          to={to}
          aria-current={active ? 'page' : undefined}
          className={`tap-44 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
            active
              ? 'text-accent-400 theme-light:text-accent-800'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

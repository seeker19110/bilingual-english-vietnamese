// BottomNav — thanh điều hướng dưới cố định, hiện ở MỌI kích thước màn hình
// (mobile lẫn web) — xem `--bnav-h` trong index.css. 4 mục: Trang chủ · Lộ
// trình · Luyện tập · Tiến độ. Ẩn hoàn toàn ở /login, /onboarding (chưa có user).
//
// Tab "Luyện tập" trỏ vào trang hub /practice (gộp Nghe/Nói/Viết — src/pages/Practice.tsx).
// Chat/Speaking/Writing vẫn là route độc lập (điều hướng TỚI từ trang hub), tab vẫn
// sáng khi đang ở 1 trong các route đó để không gây cảm giác "lạc" điều hướng.
import { Link, useLocation } from 'react-router-dom'
import { Home, Target, Dumbbell, TrendingUp, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import type { useOneHandedDrag } from '../lib/useOneHandedDrag'

const PRACTICE_ROUTES = ['/luyen-tap', '/tro-truyen', '/luyen-noi', '/luyen-viet']
// /login, /onboarding không nằm sau RequireAuth — user context có thể vẫn còn
// (vd vừa đăng nhập nhưng chưa onboarded) nên phải loại trừ theo path, không
// chỉ dựa vào `!user`.
const HIDDEN_PATHS = ['/login', '/onboarding']

interface Props {
  // Handlers vuốt-để-kích-hoạt Reachability (lib/useOneHandedDrag.ts) — truyền từ
  // App.tsx vì state kéo 1 tay dùng chung với nội dung trang (contentStyle/Handlers).
  // Lồng dải trigger NGAY TRONG BottomNav (thay vì <div> rời ở App.tsx định vị bằng
  // biến CSS --bnav-only-h) để trigger tự bám theo chính kích thước nav qua absolute
  // positioning — không cần đồng bộ 2 file qua biến CSS nữa.
  triggerHandlers?: ReturnType<typeof useOneHandedDrag>['triggerHandlers']
  /** Reachability đang mở? Dùng để hiển thị chevron đúng hướng trên dải trigger. */
  isReachabilityOpen?: boolean
}

export default function BottomNav({ triggerHandlers, isReachabilityOpen }: Props) {
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
      to: '/lo-trinh-hoc',
      icon: Target,
      label: T.navPath,
      active: location.pathname.startsWith('/lo-trinh-hoc'),
    },
    {
      key: 'practice',
      to: '/luyen-tap',
      icon: Dumbbell,
      label: T.navPractice,
      active: isPracticeRoute,
    },
    {
      key: 'progress',
      to: '/tien-do',
      icon: TrendingUp,
      label: T.navProgress,
      active: location.pathname === '/tien-do',
    },
    {
      key: 'profile',
      to: '/cai-dat',
      icon: Settings,
      label: T.navProfile,
      active: location.pathname === '/cai-dat',
    },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 h-[5.25rem] pb-safe bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60"
      aria-label={T.home}
    >
      {/* Vùng bắt cử chỉ Reachability — lồng NGAY TRONG nav (nav đã `fixed` nên tự
          làm containing block, đặt `absolute -top-[2rem]` là bám thẳng lên mép
          trên của CHÍNH nav này). touchAction 'none' để trình duyệt không chiếm
          quyền cuộn trang trong vùng này. Nền đục hoàn toàn (bg-zinc-950) để
          không hở nội dung trang phía sau. Chỉ render khi App.tsx truyền
          triggerHandlers — tránh BottomNav phải biết trực tiếp về
          lib/useOneHandedDrag.ts khi không cần. */}
      {triggerHandlers && (
        <div
          className="absolute -top-[2rem] inset-x-0 bg-zinc-950"
          style={{ touchAction: 'none', height: '2rem' }}
          aria-hidden="true"
          {...triggerHandlers}
        >
          {/* Dải màu accent gradient — cách 0.5rem từ mép dưới */}
          <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
          {/* Chevron mũi tên lên/xuống tùy trạng thái reachability — cách 0.5rem từ mép trên */}
          <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none">
            {isReachabilityOpen ? (
              <ChevronUp className="w-4 h-4 text-accent-400/70 animate-bounce" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500 animate-bounce" />
            )}
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto h-full grid grid-cols-5">
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

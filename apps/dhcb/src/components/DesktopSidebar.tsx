// DesktopSidebar — thanh điều hướng dọc CỐ ĐỊNH bên trái, CHỈ hiện từ 1024px trở lên
// (`hidden lg:flex`). Dưới ngưỡng đó vẫn là BottomNav như cũ, không đổi gì.
//
// Vì sao có file này: web trước đây là app mobile phóng to — 6 studio bị giấu trong một
// dropdown và thanh điều hướng chính nằm ở ĐÁY màn hình, chỗ con trỏ chuột phải đi xa
// nhất. Trên desktop, chiều dọc mới là thứ dư dả, nên điều hướng chuyển sang cột trái.
//
// Thu gọn được (icon-only): trạng thái lưu ở localStorage và ĐỒNG THỜI ghi lên
// `document.documentElement.dataset.sidebar`. Đó là mấu chốt — bề rộng thật của sidebar
// nằm ở biến CSS `--sidebar-w` (index.css) và nội dung trang chừa chỗ bằng
// `lg:pl-[var(--sidebar-w)]` (App.tsx), nên chỉ cần đổi một thuộc tính data là cả trang
// tự co giãn theo, không component nào phải biết về component nào.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Crown,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { STUDIOS, NAV_HIDDEN_PATHS } from '../lib/studios'
import {
  CAREER_PATHS,
  COMPANION_PATHS,
  ENGLISH_PATHS,
  LEARNING_PATHS,
  PRACTICE_PATHS,
  PRICING_PATHS,
  PROFILE_PATHS,
  PROGRESS_PATHS,
  WORKLIFE_PATHS,
  resolveActiveNav,
} from '../lib/navPaths'

const STORAGE_KEY = 'ui_sidebar_collapsed'

interface Item {
  to: string
  label: string
  icon: LucideIcon
  /** Lớp màu riêng của studio; mục lõi (Trang chủ/Tiến độ/Hồ sơ) để trống. */
  color?: string
  /** Các tiền tố đường dẫn làm mục này sáng. Không truyền = so khớp chính `to`. */
  paths?: readonly string[]
  /** Chỉ sáng khi đường dẫn TRÙNG KHÍT (dùng cho Trang chủ `/`). */
  exact?: boolean
}

/** Tra nhanh studio theo id — sidebar sắp xếp lại thứ tự nên không duyệt tuần tự được. */
function studio(id: string): (typeof STUDIOS)[number] {
  const st = STUDIOS.find((s) => s.id === id)
  if (!st) throw new Error(`Không tìm thấy studio "${id}" trong lib/studios.ts`)
  return st
}

function studioItem(id: string, paths: readonly string[], label?: string): Item {
  const st = studio(id)
  return { to: st.to, label: label ?? st.title, icon: st.icon, color: st.color, paths }
}

// NHÓM 1 — 4 điểm đến TƯƠNG ỨNG 4 tab đầu của BottomNav mobile (tab thứ 5 "Profile" nằm ở
// CORE_BOTTOM). Trước đây desktop chỉ có Trang chủ + Tiến độ + Hồ sơ + danh sách studio, tức
// NGHÈO HƠN mobile ở đúng những nơi người dùng ở lâu nhất (Phòng Học, Luyện tập, Bạn Đồng
// Hành). Ba mục studio đó được NHẤC LÊN đây chứ không nhân bản — nhóm "Không Gian Nền Tảng"
// bên dưới chỉ render phần studio CÒN LẠI, nên không mục nào xuất hiện hai lần.
const HOME_ITEM: Item = { to: '/', label: 'Trang chủ', icon: Home, exact: true }
const MAIN_NAV: Item[] = [
  HOME_ITEM,
  studioItem('subjects', LEARNING_PATHS, 'Phòng Học'),
  studioItem('companion', COMPANION_PATHS, 'Bạn Đồng Hành'),
  studioItem('practice', PRACTICE_PATHS, 'Luyện tập'),
]

// NHÓM 2 — các studio CÒN LẠI (3 studio kia đã lên MAIN_NAV), kèm bảng path riêng để
// active-state không chồng lấn nhau.
const STUDIO_NAV: Item[] = [
  studioItem('english', ENGLISH_PATHS),
  studioItem('career', CAREER_PATHS),
  studioItem('worklife', WORKLIFE_PATHS),
]

const CORE_BOTTOM: Item[] = [
  { to: '/tien-do', label: 'Tiến độ', icon: TrendingUp, paths: PROGRESS_PATHS },
  // Bảng giá tách khỏi trang Hồ sơ (audit 2026-08-31 mục B9) nên cần lối vào riêng.
  {
    to: '/nang-cap',
    label: 'Nâng cấp',
    icon: Crown,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    paths: PRICING_PATHS,
  },
  { to: '/trang-ca-nhan', label: 'Hồ sơ', icon: User, paths: PROFILE_PATHS },
]

// Thứ tự XÉT active (khác thứ tự HIỂN THỊ): cụ thể nhất trước, bao quát nhất sau — xem
// `resolveActiveNav`. `ENGLISH_PATHS` ⊂ `LEARNING_PATHS` nên "Học Tiếng Anh" phải đứng trước
// "Phòng Học"; `PROFILE_PATHS` chứa cả path sự nghiệp/đời sống nên "Hồ sơ" đứng cuối cùng.
const ACTIVE_ORDER: Item[] = [HOME_ITEM, ...STUDIO_NAV, ...MAIN_NAV.slice(1), ...CORE_BOTTOM]

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // localStorage bị chặn (chế độ riêng tư): coi như đang mở rộng, không làm vỡ trang.
    return false
  }
}

export default function DesktopSidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)

  // Trang đăng nhập/onboarding không có sidebar → nội dung không được chừa lề trái.
  const hidden = !user || NAV_HIDDEN_PATHS.includes(location.pathname)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.sidebar = hidden ? 'off' : collapsed ? 'collapsed' : 'expanded'
    return () => {
      delete root.dataset.sidebar
    }
  }, [hidden, collapsed])

  if (hidden) return null

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Không lưu được thì vẫn đổi trong phiên hiện tại — chỉ mất tính ghi nhớ.
      }
      return next
    })
  }

  // Tính MỘT LẦN cho cả sidebar: mục nào đang hoạt động. Trước đây mỗi mục tự
  // `startsWith(item.to)` nên các trang luyện tập (/tro-truyen, /luyen-noi, /luyen-viet,
  // /tu-dien, /bai-hoc…) không làm sáng mục nào cả — xem lib/navPaths.ts.
  const activeTo = resolveActiveNav(location.pathname, ACTIVE_ORDER)

  function renderItem(item: Item) {
    const Icon = item.icon
    const active = item.to === activeTo
    return (
      <li key={item.to}>
        <Link
          to={item.to}
          // Icon-only vẫn phải có TÊN đọc được cho trình đọc màn hình: khi thu gọn, nhãn
          // chữ bị ẩn bằng `sr-only` chứ KHÔNG bị bỏ khỏi DOM (ẩn hẳn = link không tên).
          title={collapsed ? item.label : undefined}
          aria-current={active ? 'page' : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            collapsed ? 'justify-center' : ''
          } ${
            active
              ? 'bg-zinc-800 border border-accent-500/40 text-white'
              : 'border border-transparent text-zinc-300 hover:bg-zinc-800/70 hover:text-white'
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              item.color ?? 'text-accent-400 bg-accent-500/10 border-accent-500/30'
            }`}
          >
            <Icon className="w-4 h-4" />
          </span>
          <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
        </Link>
      </li>
    )
  }

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[var(--sidebar-w)] flex-col bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 transition-[width] duration-200"
      aria-label="Điều hướng chính (desktop)"
    >
      <div
        className={`h-14 flex items-center gap-2 px-3 border-b border-zinc-800/80 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <Link
          to="/gioi-thieu"
          className="flex items-center gap-2.5 min-w-0 rounded-xl p-1 hover:bg-zinc-800/60 transition"
        >
          <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-accent-500 via-accent-400 to-indigo-500 flex items-center justify-center shadow-md shadow-accent-500/30 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-[#fff]" />
          </span>
          <span className={collapsed ? 'sr-only' : 'font-bold text-sm text-white truncate'}>
            Đồng Hành
          </span>
        </Link>
        {!collapsed && (
          <button
            onClick={toggle}
            aria-label="Thu gọn thanh điều hướng"
            title="Thu gọn thanh điều hướng"
            className="ml-auto p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">{MAIN_NAV.map(renderItem)}</ul>

        {!collapsed && (
          <p className="px-3 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Không Gian Nền Tảng
          </p>
        )}
        <ul className={`space-y-1 ${collapsed ? 'mt-3 pt-3 border-t border-zinc-800/80' : ''}`}>
          {STUDIO_NAV.map(renderItem)}
        </ul>

        <ul className="space-y-1 mt-3 pt-3 border-t border-zinc-800/80">
          {CORE_BOTTOM.map(renderItem)}
        </ul>
      </nav>

      {collapsed && (
        <div className="p-2 border-t border-zinc-800/80 flex justify-center">
          <button
            onClick={toggle}
            aria-label="Mở rộng thanh điều hướng"
            title="Mở rộng thanh điều hướng"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}

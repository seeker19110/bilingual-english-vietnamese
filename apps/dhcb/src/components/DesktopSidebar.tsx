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
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { STUDIOS, NAV_HIDDEN_PATHS } from '../lib/studios'

const STORAGE_KEY = 'ui_sidebar_collapsed'

interface Item {
  to: string
  label: string
  icon: LucideIcon
  /** Lớp màu riêng của studio; mục lõi (Trang chủ/Tiến độ/Hồ sơ) để trống. */
  color?: string
}

const CORE_TOP: Item[] = [{ to: '/', label: 'Trang chủ', icon: Home }]
const CORE_BOTTOM: Item[] = [
  { to: '/tien-do', label: 'Tiến độ', icon: TrendingUp },
  { to: '/trang-ca-nhan', label: 'Hồ sơ', icon: User },
]

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

  function renderItem(item: Item) {
    const Icon = item.icon
    const active =
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
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
        <ul className="space-y-1">{CORE_TOP.map(renderItem)}</ul>

        {!collapsed && (
          <p className="px-3 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Không Gian Nền Tảng
          </p>
        )}
        <ul className={`space-y-1 ${collapsed ? 'mt-3 pt-3 border-t border-zinc-800/80' : ''}`}>
          {STUDIOS.map((st) =>
            renderItem({ to: st.to, label: st.title, icon: st.icon, color: st.color }),
          )}
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

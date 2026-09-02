import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, BookOpen, Bot, Layers, ChevronDown } from 'lucide-react'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { getStreak } from '../lib/storage'
import ThemeToggle from './ThemeToggle'
import Breadcrumb from './Breadcrumb'
import OfflineStatusBanner from './OfflineStatusBanner'
import { navigateTo } from '../lib/subjectsHost'
import { STUDIOS } from '../lib/studios'

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

export default function Layout({ title, subtitle, back = true, onBack, extra }: Props) {
  const nav = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { T } = useLang()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  // Nút mở menu — giữ tham chiếu để TRẢ FOCUS về đây khi đóng (WAI-ARIA APG: menu button).
  const switcherBtnRef = useRef<HTMLButtonElement>(null)
  // Danh sách các mục trong menu, theo đúng thứ tự hiển thị — dùng cho ↑/↓ và focus mục đầu.
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([])

  // Streak tự lấy ở ĐÂY (không nhận qua prop nữa) — áp dụng TOÀN CỤC, hiện trên MỌI
  // trang có Layout, không cần từng trang tự truyền vào (trước đây dễ quên).
  const streak = user ? getStreak(user.id) : 0

  // Đóng menu VÀ trả focus về nút kích hoạt (bắt buộc theo WAI-ARIA APG — nếu không,
  // người dùng bàn phím bị "rơi" về đầu tài liệu và phải Tab mò lại từ đầu).
  const closeSwitcher = useCallback((returnFocus: boolean) => {
    setSwitcherOpen(false)
    if (returnFocus) switcherBtnRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Bấm ra ngoài: KHÔNG kéo focus về nút (người dùng đang thao tác chỗ khác).
        setSwitcherOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSwitcher(true)
        return
      }
      // ↑/↓ chạy vòng trong danh sách mục; Home/End nhảy đầu/cuối.
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
      const items = menuItemsRef.current.filter((el): el is HTMLButtonElement => el !== null)
      if (items.length === 0) return
      e.preventDefault()
      const current = items.findIndex((el) => el === document.activeElement)
      let next = 0
      if (e.key === 'End') next = items.length - 1
      else if (e.key === 'ArrowUp') next = (current <= 0 ? items.length : current) - 1
      else if (e.key === 'ArrowDown') next = (current + 1) % items.length
      items[next]?.focus()
    }
    if (switcherOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      // Mở xong đưa focus vào mục ĐẦU TIÊN (⌘K mới thực sự dùng được bằng bàn phím).
      menuItemsRef.current[0]?.focus()
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [switcherOpen, closeSwitcher])

  // Phím tắt toàn cục (PR 4, thiết kế lại web cho desktop) — Layout render ở MỌI trang nên
  // đây là chỗ gắn 1 lần duy nhất, không phải lặp lại ở từng trang.
  //   ⌘K / Ctrl+K — mở/đóng Studio switcher (quy ước "command palette" của nhiều app desktop).
  //   /            — focus ô nhập TRÊN TRANG (input/textarea đầu tiên còn hiện, không disabled),
  //                  bỏ qua khi đang gõ sẵn trong 1 ô nhập khác (để không chặn gõ dấu "/" thật).
  useEffect(() => {
    function isTypingTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false
      const tag = t.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable
    }
    function handleGlobalShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSwitcherOpen((v) => !v)
        return
      }
      if (e.key === '/' && !isTypingTarget(e.target)) {
        // Ưu tiên Ô NHẬP CHÍNH của trang (trang tự đánh dấu bằng `data-primary-input`).
        // Không có thì mới lấy ô nhập đầu tiên trong DOM như cũ — trước đây chỉ có nhánh
        // sau nên "/" hay nhảy vào ô tìm kiếm phụ ở header thay vì ô chính (audit B20).
        const el =
          document.querySelector<HTMLElement>(
            '[data-primary-input]:not([disabled]):not([hidden])',
          ) ??
          document.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])',
          )
        if (el) {
          e.preventDefault()
          el.focus()
        }
      }
    }
    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 relative pt-safe shadow-sm">
      {/* Tấm nền ĐẶC phủ toàn bộ khoảng phía TRÊN header cho Reachability (cử chỉ kéo màn
          hình xuống — thuần MOBILE). `lg:hidden` vì desktop không có cử chỉ này, mà header
          `z-50` lại nằm trên sidebar `z-40` nên tấm nền còn có thể phủ lên sidebar.
          `100dvh` thay `h-screen`: trên iOS `100vh` tính cả thanh URL nên bị hụt/thừa. */}
      <div
        aria-hidden
        className="lg:hidden absolute inset-x-0 bottom-full h-[100dvh] bg-zinc-950 pointer-events-none"
      />

      {/* Gradient accent line trên cùng */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />

      <OfflineStatusBanner />

      {/* [2026-09-02, đợt 2 thiết kế lại desktop] Bề rộng desktop đổi 5xl → 6xl để KHỚP MÉP với
          nội dung trang. Đo thật ở 1440px trước khi sửa: header 336→1360 trong khi nội dung các
          trang có cột phải (Trang chủ, Tiến độ, Luyện viết, CEFR) là 288→1408 — tức nội dung
          THÒ RA 48px mỗi bên so với header, nhìn như hai lớp lệch nhau. 1152px (`max-w-6xl`) nay
          là bề rộng chuẩn của app: `PageShell` cấp `standard` dùng đúng giá trị này. */}
      <div className="max-w-3xl lg:max-w-6xl mx-auto px-4 h-14 flex items-center gap-3 relative">
        {/* Back / Logo */}
        {back ? (
          <button
            onClick={onBack ?? (() => nav('/'))}
            aria-label={T.home}
            // GIỮ hiện ở mọi kích thước — nhiều trang truyền `onBack` riêng để lùi ĐÚNG một
            // bậc theo phân cấp của trang đó (vd bài học Lập trình lùi về đúng chặng, không
            // phải P1). Breadcrumb chỉ biết cây route TĨNH nên không thay được logic đó; nó
            // là phần BỔ SUNG bên cạnh Back, không phải thay thế (đã thử thay hẳn — vỡ
            // `e2e/programming-lesson.spec.ts` vì nút "Trang chủ" biến mất trên desktop).
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
            ref={switcherBtnRef}
            onClick={() => setSwitcherOpen(!switcherOpen)}
            aria-expanded={switcherOpen}
            aria-haspopup="menu"
            aria-keyshortcuts="Meta+K Control+K"
            aria-label="Chuyển đổi Studio & Không gian học tập (⌘K)"
            title="Chuyển đổi Studio & Không gian học tập (⌘K)"
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
                <span className="text-[11px] text-accent-400 font-semibold bg-accent-500/10 px-1.5 py-0.5 rounded">
                  5 Miền Studio
                </span>
              </div>
              {/* role="menu" + các mục role="menuitem": khai báo đúng ngữ nghĩa để trình đọc
                  màn hình đọc "menu 6 mục" thay vì một đống nút rời rạc. */}
              <div className="space-y-1" role="menu" aria-label="Không Gian Nền Tảng">
                {STUDIOS.map((st, i) => {
                  const Icon = st.icon
                  const isActive = location.pathname.startsWith(st.to)
                  return (
                    <button
                      key={st.id}
                      ref={(el) => {
                        menuItemsRef.current[i] = el
                      }}
                      role="menuitem"
                      onClick={() => {
                        // Điều hướng đi nơi khác nên KHÔNG trả focus về nút mở menu.
                        closeSwitcher(false)
                        navigateTo(nav, st.to)
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
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
                          <span className="text-[11px] font-semibold px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
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

        {/* Title/subtitle — như cũ, hiện ở MỌI kích thước (Back/logo vẫn là đường lùi chính,
            xem lý do giữ Back ở trên). Breadcrumb desktop là dòng NHỎ phía trên, chỉ vẽ khi
            có tầng cha thật sự (rỗng ở Trang chủ — Breadcrumb tự ẩn, xem lib/breadcrumb.ts). */}
        <div className="flex-1 min-w-0">
          <Breadcrumb
            pathname={location.pathname}
            currentLabel={title}
            className="hidden lg:block mb-0.5"
          />
          {title && <p className="font-semibold text-[15px] truncate text-white">{title}</p>}
          {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
        </div>

        {/* Streak — TOÀN CỤC */}
        {streak > 0 &&
          (title || subtitle ? (
            // Header có cả title/subtitle LẪN nút "Đồng Hành AI" ở màn hẹp (390px) thì 3 phần tử
            // này tràn ngang (đo được 54px) — ẩn streak badge trên di động, chỉ hiện lại từ `sm`
            // trở lên khi đã đủ chỗ. Không mất thông tin: streak vẫn thấy ở /progress.
            <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30 rounded-full px-3 py-1 shadow-sm shadow-orange-500/10 shrink-0">
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
        {/* GIỮ transition-all: hover đổi màu nền/viền, active đổi transform (scale). */}
        <button
          onClick={() => nav('/ban-dong-hanh')}
          aria-label="Mở Bạn Đồng Hành AI"
          title="Bạn Đồng Hành AI (Live Voice & Executive Suite)"
          className="tap-44 relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 border border-accent-500/30 text-accent-300 theme-light:text-accent-800 text-xs font-semibold transition-all active:scale-95 group shadow-sm shrink-0"
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
            onClick={() => nav('/trang-ca-nhan')}
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

import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { getStreak } from '../lib/storage'
import ThemeToggle from './ThemeToggle'

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
  const { user } = useAuth()
  const { T } = useLang()
  // Streak tự lấy ở ĐÂY (không nhận qua prop nữa) — áp dụng TOÀN CỤC, hiện trên MỌI
  // trang có Layout, không cần từng trang tự truyền vào (trước đây dễ quên).
  const streak = user ? getStreak(user.id) : 0

  return (
    <header className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800/60 relative pt-safe">
      {/* Tấm nền ĐẶC phủ toàn bộ khoảng phía TRÊN header.
          Vì sao cần: tính năng "kéo 1 tay" (Reachability — lib/useOneHandedDrag.ts) đẩy cả
          trang xuống 45% chiều cao màn hình bằng transform. Header là sticky nên tụt xuống
          theo, để hở dải phía trên; nếu lúc đó trang ĐANG CUỘN XUỐNG thì phần nội dung đã
          cuộn qua lộ ra ở dải đó (trông như header bị xuyên thấu, chữ đè lên thanh trạng
          thái). Tấm này nằm trong header (z-50) nên luôn phủ đè lên nội dung trang; lúc bình
          thường nó nằm ngoài màn hình phía trên nên không thấy và không chiếm chỗ (absolute). */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-full h-screen bg-zinc-950 pointer-events-none"
      />

      {/* Gradient accent line trên cùng */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />

      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3 relative">
        {/* Back / Logo */}
        {back ? (
          <button
            onClick={onBack ?? (() => nav('/'))}
            aria-label={T.home}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition shrink-0 -ml-1 p-3 rounded-lg hover:bg-zinc-800/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">{T.home}</span>
          </button>
        ) : (
          // Logo "Gia sư AI" — bấm vào xem trang giới thiệu tính năng + mẹo học hiệu quả.
          <Link
            to="/gioi-thieu"
            aria-label={T.aboutApp}
            title={T.aboutApp}
            className="tap-44 flex items-center gap-2 shrink-0 -ml-1 p-1 rounded-lg hover:bg-zinc-800/50 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center shadow-md shadow-accent-500/30">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white hidden sm:inline tracking-tight">
              {T.appName}
            </span>
          </Link>
        )}

        {/* Title — chỉ hiện khi trang truyền title cho header (trang chủ, màn chi tiết…).
            Các trang đã chuyển sang PageHeader sẽ KHÔNG truyền title → ô này chỉ làm spacer
            đẩy các nút bên phải về đúng vị trí. */}
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-[15px] truncate text-white">{title}</p>}
          {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
        </div>

        {/* Streak — TOÀN CỤC, dàn ngang 1 hàng. Căn CHÍNH GIỮA header (top-middle) khi
            KHÔNG có title/subtitle (đa số trang) — không thứ gì để đè lên. Trang CÓ
            title/subtitle (vd Writing "Kết quả chấm bài", Chat/Speaking đang có session)
            thì xếp ngay sau khối đó theo dòng chảy bình thường — absolute căn giữa sẽ ĐÈ
            LÊN chữ title/subtitle, gây lỗi tương phản (a11y AA) khi 2 lớp chữ chồng nhau.
            Nhãn "ngày liên tiếp" dùng text-orange-400 ĐẶC (không giảm opacity /60 — bản mờ
            từng rớt AA 3.58:1 trên nền tối) + theme-light:text-orange-800 cho 3 theme nền
            sáng (Blue sky/Pink/Nhi đồng — orange-400 gốc chỉ 1.96:1 trên nền sáng). */}
        {streak > 0 &&
          (title || subtitle ? (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-base leading-none">🔥</span>
              <span className="text-sm font-bold text-orange-400 leading-none">{streak}</span>
              <span className="text-[11px] text-orange-400 theme-light:text-orange-800 leading-none">
                {T.streakDays}
              </span>
            </div>
          ) : (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 rounded-xl px-2.5 py-1.5 pointer-events-none">
              <span className="text-base leading-none">🔥</span>
              <span className="text-sm font-bold text-orange-400 leading-none">{streak}</span>
              <span className="text-[11px] text-orange-400 theme-light:text-orange-800 leading-none">
                {T.streakDays}
              </span>
            </div>
          ))}

        {/* Nút tùy chỉnh thêm vào header (vd: VoiceMenu) */}
        {extra}

        {/* Nút đổi giao diện: Sáng / Tối / Xanh đêm */}
        <ThemeToggle />

        {/* User avatar + tên đầy đủ (bấm vào để xem trang cá nhân) */}
        {user && (
          <button
            onClick={() => nav('/cai-dat')}
            aria-label={T.profile}
            title={T.profile}
            className="tap-44 flex items-center gap-2 shrink-0 hover:opacity-85 transition min-w-0"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
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

// Danh sách 6 "Studio" (không gian nền tảng) dùng CHUNG cho mọi thanh điều hướng:
// dropdown "Studio" ở header (components/Layout.tsx) và sidebar desktop
// (components/DesktopSidebar.tsx). Trước đây danh sách này nằm riêng trong Layout.tsx;
// tách ra đây để hai nơi không bao giờ lệch nhau khi thêm/bớt studio.
import {
  Sparkles,
  GraduationCap,
  Dumbbell,
  Calculator,
  Briefcase,
  Heart,
  type LucideIcon,
} from 'lucide-react'

export interface Studio {
  id: string
  title: string
  subtitle: string
  to: string
  icon: LucideIcon
  badge: string
  /** Lớp màu cho ô biểu tượng — nền + viền + màu chữ của riêng studio đó.
   *  BẮT BUỘC kèm biến thể `theme-light:` cho màu CHỮ: sắc độ -400 đọc tốt trên nền tối
   *  nhưng rớt AA hẳn ở 3 theme nền sáng (trình duyệt thật cho thấy biểu tượng studio
   *  trông như bị vô hiệu hoá ở Blue sky — audit 2026-08-31 mục B17). Nền/viền dùng độ
   *  mờ thấp nên không cần đổi. */
  color: string
}

export const STUDIOS: Studio[] = [
  {
    id: 'companion',
    title: 'Bạn Đồng Hành',
    subtitle: 'Live Voice, 3D Avatar & Socratic AI',
    to: '/ban-dong-hanh',
    icon: Sparkles,
    badge: 'Executive',
    color:
      'text-amber-400 theme-light:text-amber-800 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60',
  },
  {
    id: 'english',
    title: 'Học Tiếng Anh',
    subtitle: 'Lộ trình CEFR A1-C2 & 4 Kỹ năng',
    to: '/hoc-tieng-anh',
    icon: GraduationCap,
    badge: 'A1-C2',
    color:
      'text-emerald-400 theme-light:text-emerald-800 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    id: 'practice',
    title: 'Phòng Luyện Tập',
    subtitle: 'Đa Môn · Bài Tập · Sửa Lỗi · 4 Kỹ Năng',
    to: '/luyen-tap',
    icon: Dumbbell,
    badge: 'Đa Môn AI',
    color:
      'text-sky-400 theme-light:text-sky-800 bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60',
  },
  {
    id: 'subjects',
    title: 'Phòng Học & STEM',
    subtitle: 'Toán, Lý, Hóa, Sinh & Simulators',
    to: '/mon-hoc',
    icon: Calculator,
    badge: 'Vision OCR',
    color:
      'text-blue-400 theme-light:text-blue-800 bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
  },
  {
    id: 'career',
    title: 'Sự Nghiệp & Khởi Nghiệp',
    subtitle: 'Phỏng vấn STAR · Lean Canvas',
    to: '/su-nghiep-khoi-nghiep',
    icon: Briefcase,
    badge: 'Career',
    color:
      'text-purple-400 theme-light:text-purple-800 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
  },
  {
    id: 'worklife',
    title: 'Công Việc & Đời Sống',
    subtitle: 'Dự án, việc cần làm · thói quen, sức khoẻ',
    to: '/cong-viec-cuoc-song',
    icon: Heart,
    badge: 'Work-Life',
    color:
      'text-rose-400 theme-light:text-rose-800 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60',
  },
]

/** Trang KHÔNG có thanh điều hướng nào (đăng nhập, onboarding) — dùng chung cho
 *  BottomNav (mobile) và DesktopSidebar (desktop) để hai bên ẩn/hiện y hệt nhau. */
export const NAV_HIDDEN_PATHS = ['/login', '/onboarding']

// navTree — CÂY điều hướng dùng chung: mỗi mục điều hướng có thể có mục con ĐÓNG/MỞ được.
//
// Vì sao có file này: trước đây sidebar là danh sách PHẲNG, nên muốn vào môn Toán phải đi
// hai chặng (bấm "Phòng Học" → chờ trang danh sách tải → bấm thẻ môn). Các môn học là nơi
// người dùng ở lâu nhất, mà lại nằm sâu nhất. Nay mục cha mở ra ngay trong thanh điều hướng.
//
// Dữ liệu để RIÊNG khỏi component (DesktopSidebar.tsx) vì hai lý do: cây này còn dùng cho
// thanh điều hướng khác khi cần, và phần logic đóng/mở là hàm thuần nên test được mà không
// phải dựng React.
import {
  Atom,
  BookOpen,
  Calculator,
  Code2,
  Dumbbell,
  FlaskConical,
  Headphones,
  Languages,
  Leaf,
  Mic,
  MessagesSquare,
  PenLine,
  Route as RouteIcon,
  Swords,
  type LucideIcon,
} from 'lucide-react'

/** Một mục CON trong nhóm đóng/mở được. */
export interface NavChild {
  /** Nhãn hiển thị. */
  label: string
  icon: LucideIcon
  /** Đường dẫn trong app. Bỏ trống khi dùng `subjectId` (trụ Học tập có thể ở origin khác). */
  to?: string
  /** Id môn học — render bằng <SubjectsLink>, xem lib/subjectsHost.ts. */
  subjectId?: string
  /** Tiền tố đường dẫn làm mục con này sáng. */
  paths: readonly string[]
}

/** Mục con của "Phòng Học" — 6 môn trong `packages/core-learner/subjectRegistry.ts`. */
export const SUBJECT_CHILDREN: NavChild[] = [
  {
    label: 'Tiếng Anh',
    icon: Languages,
    subjectId: 'english',
    paths: ['/mon-hoc/english', '/english'],
  },
  {
    label: 'Toán học',
    icon: Calculator,
    subjectId: 'mathematics',
    paths: ['/mon-hoc/mathematics', '/mathematics'],
  },
  { label: 'Vật lý', icon: Atom, subjectId: 'physics', paths: ['/mon-hoc/physics', '/physics'] },
  {
    label: 'Hóa học',
    icon: FlaskConical,
    subjectId: 'chemistry',
    paths: ['/mon-hoc/chemistry', '/chemistry'],
  },
  { label: 'Sinh học', icon: Leaf, subjectId: 'biology', paths: ['/mon-hoc/biology', '/biology'] },
  {
    label: 'Lập trình',
    icon: Code2,
    subjectId: 'programming',
    paths: ['/mon-hoc/programming', '/lap-trinh'],
  },
]

/** Mục con của "Luyện tập" — 4 kỹ năng + tra cứu + thử thách. */
export const PRACTICE_CHILDREN: NavChild[] = [
  { label: 'Trò chuyện', icon: MessagesSquare, to: '/tro-truyen', paths: ['/tro-truyen'] },
  { label: 'Luyện nói', icon: Mic, to: '/luyen-noi', paths: ['/luyen-noi'] },
  { label: 'Luyện viết', icon: PenLine, to: '/luyen-viet', paths: ['/luyen-viet'] },
  { label: 'Luyện nghe', icon: Headphones, to: '/luyen-nghe', paths: ['/luyen-nghe'] },
  { label: 'Từ điển', icon: BookOpen, to: '/tu-dien', paths: ['/tu-dien', '/tu-vung'] },
  { label: 'Thử thách', icon: Swords, to: '/thu-thach', paths: ['/thu-thach'] },
]

/** Mục con của "Học Tiếng Anh". */
export const ENGLISH_CHILDREN: NavChild[] = [
  { label: 'Lộ trình CEFR', icon: RouteIcon, to: '/lo-trinh-hoc', paths: ['/lo-trinh-hoc'] },
  { label: 'Bài học hôm nay', icon: BookOpen, to: '/bai-hoc', paths: ['/bai-hoc'] },
  {
    label: 'Câu thông dụng',
    icon: MessagesSquare,
    to: '/cau-thong-dung',
    paths: ['/cau-thong-dung'],
  },
  { label: 'Sổ tay lỗi sai', icon: PenLine, to: '/so-tay-loi-sai', paths: ['/so-tay-loi-sai'] },
  { label: 'Ôn thi', icon: Dumbbell, to: '/on-thi', paths: ['/on-thi'] },
]

const STORAGE_KEY = 'ui_sidebar_groups'

/** Nhóm nào đang MỞ (đọc từ localStorage). Hỏng/không đọc được → coi như chưa có nhóm nào. */
export function readOpenGroups(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    // localStorage bị chặn hoặc JSON hỏng: mở mặc định, không làm vỡ trang.
    return []
  }
}

export function writeOpenGroups(ids: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Không lưu được thì vẫn đóng/mở được trong phiên hiện tại — chỉ mất tính ghi nhớ.
  }
}

/** Bật/tắt một nhóm trong danh sách đang mở (hàm THUẦN — dễ test, không đụng storage). */
export function toggleGroup(open: readonly string[], id: string): string[] {
  return open.includes(id) ? open.filter((x) => x !== id) : [...open, id]
}

/**
 * Nhóm có mục con nào khớp đường dẫn hiện tại không.
 *
 * Dùng để TỰ MỞ nhóm chứa trang đang xem: người dùng phải thấy mình đang đứng ở đâu trong
 * cây, kể cả khi vào thẳng bằng URL.
 */
export function groupContainsPath(children: readonly NavChild[], pathname: string): boolean {
  return children.some((c) => c.paths.some((p) => pathname.startsWith(p)))
}

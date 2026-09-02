// breadcrumb — sinh "đường đi" (Trang chủ › Phòng Học › Toán học) TỪ đường dẫn hiện tại.
//
// Vì sao có file này: header desktop trước đây chỉ có nút "Back" trỏ về Trang chủ. Nút đó
// trả lời được câu "đi đâu tiếp" nhưng KHÔNG trả lời được "tôi đang ở đâu" — lặn sâu vào
// một bài học rồi thì người dùng mất định vị, và bấm Back là văng thẳng về Trang chủ chứ
// không lùi đúng một bậc. Breadcrumb trả lời cả hai câu cùng lúc, ở mọi tầng.
//
// Toàn bộ logic là HÀM THUẦN (không React, không router) nên test được thẳng bằng Vitest.
// Nhãn lấy lại từ `studios.ts` + `navTree.ts` — một nguồn sự thật, sidebar và breadcrumb
// không bao giờ gọi cùng một trang bằng hai cái tên khác nhau.
import { STUDIOS } from './studios'
import { ENGLISH_CHILDREN, PRACTICE_CHILDREN, SUBJECT_CHILDREN, type NavChild } from './navTree'

/** Một đốt trong đường đi. `to` rỗng nghĩa là đốt cuối (trang hiện tại, không phải liên kết). */
export interface Crumb {
  label: string
  to: string
}

/** Một nút trong cây route. `parent` là TIỀN TỐ của nút cha, bỏ trống = con trực tiếp của Trang chủ. */
interface RouteNode {
  /** Tiền tố đường dẫn. So khớp theo BIÊN đoạn (`/mon-hoc` không nuốt `/mon-hoc-abc`). */
  path: string
  label: string
  /** Đích khi bấm vào đốt này — mặc định chính là `path`. */
  to?: string
  parent?: string
}

const HOME: Crumb = { label: 'Trang chủ', to: '/' }

/** Studio nào đó theo id — sai id là lỗi lập trình, ném ngay lúc nạp module. */
function studioPath(id: string): string {
  const st = STUDIOS.find((s) => s.id === id)
  if (!st) throw new Error(`Không tìm thấy studio "${id}" trong lib/studios.ts`)
  return st.to
}

/** Trải các mục con của một nhóm thành nút route (mỗi `paths` một nút, cùng nhãn + cùng đích). */
function childNodes(children: readonly NavChild[], parent: string): RouteNode[] {
  return children.flatMap((c) =>
    c.paths.map((p) => ({ path: p, label: c.label, to: c.to ?? c.paths[0], parent })),
  )
}

const SUBJECTS = studioPath('subjects')
const PRACTICE = studioPath('practice')
const ENGLISH = studioPath('english')
const CAREER = studioPath('career')
const WORKLIFE = studioPath('worklife')

/**
 * Cây route dùng cho breadcrumb.
 *
 * CỐ Ý không liệt kê hết mọi trang: đốt cuối (trang đang xem) lấy tên từ tiêu đề trang
 * truyền vào, nên ở đây chỉ cần các tầng CHA mà người dùng có thể muốn lùi về.
 */
const ROUTE_NODES: readonly RouteNode[] = [
  ...STUDIOS.map((st) => ({ path: st.to, label: st.title })),
  ...childNodes(SUBJECT_CHILDREN, SUBJECTS),
  ...childNodes(PRACTICE_CHILDREN, PRACTICE),
  ...childNodes(ENGLISH_CHILDREN, ENGLISH),
  { path: '/tien-do', label: 'Tiến độ' },
  { path: '/nang-cap', label: 'Nâng cấp' },
  { path: '/trang-ca-nhan', label: 'Hồ sơ' },
  { path: '/cai-dat', label: 'Cài đặt', parent: '/trang-ca-nhan' },
  { path: '/lich-su-hoc', label: 'Lịch sử học', parent: '/tien-do' },
  { path: '/gioi-thieu', label: 'Giới thiệu' },
  { path: '/ban-be', label: 'Bạn bè', parent: '/trang-ca-nhan' },
  { path: '/tin-nhan', label: 'Tin nhắn', parent: '/trang-ca-nhan' },
  { path: '/nhiem-vu', label: 'Nhiệm vụ', parent: '/tien-do' },

  // --- Môn Lập trình: các tầng TĨNH dưới `/lap-trinh` ---
  // Chỉ liệt kê nhánh nào có TRANG THẬT để bấm về (xem App.tsx). Nhánh có id động
  // (`/lap-trinh/khoa-hoc/:id`, `/lap-trinh/lo-trinh/:id`, `/lap-trinh/bai-hoc/:id`) KHÔNG có
  // trang danh sách riêng, nên không đặt nút ở đây — trang tự truyền đốt cha động vào
  // `Layout crumbs` (xem tham số `extra` của `buildCrumbs` bên dưới).
  { path: '/lap-trinh/huong', label: 'Hướng chuyên sâu', parent: '/lap-trinh' },
  { path: '/lap-trinh/du-an', label: 'Dự án', parent: '/lap-trinh' },
  { path: '/lap-trinh/on-tap', label: 'Ôn tập', parent: '/lap-trinh' },
  { path: '/lap-trinh/chay-thu', label: 'Chạy thử', parent: '/lap-trinh' },
  { path: '/lap-trinh/gioi-thieu', label: 'Giới thiệu môn', parent: '/lap-trinh' },

  // --- Các TRỤ: công cụ nằm dưới hai studio gộp ---
  // Trang công cụ của trụ trước đây không có tầng cha nào nên breadcrumb tự ẩn hẳn: đứng ở
  // "Phòng Luyện Phỏng Vấn AI" không có gì cho biết nó thuộc trụ Sự nghiệp. Đích của đốt cha
  // giữ nguyên tham số `?muc=` như nút Back của chính trang đó, để rơi đúng tab.
  {
    path: '/career/interview',
    label: 'Sự nghiệp',
    to: `${CAREER}?muc=su-nghiep`,
    parent: CAREER,
  },
  {
    path: '/startup/canvas',
    label: 'Khởi nghiệp',
    to: `${CAREER}?muc=khoi-nghiep`,
    parent: CAREER,
  },
  {
    path: '/work/kanban',
    label: 'Công việc',
    to: `${WORKLIFE}?muc=cong-viec`,
    parent: WORKLIFE,
  },
  { path: '/life/wheel', label: 'Đời sống', to: `${WORKLIFE}?muc=doi-song`, parent: WORKLIFE },
  { path: '/action-canvas', label: 'Action Canvas', parent: studioPath('companion') },
  { path: '/life-graph', label: 'Mạng lưới & Ký ức', parent: '/trang-ca-nhan' },
  { path: '/ung-dung-thuc-te', label: 'Ứng dụng thực tế', parent: SUBJECTS },
]

/** Tra nhanh theo tiền tố. Trùng tiền tố thì mục ĐẦU TIÊN thắng (có test canh). */
const BY_PATH = new Map<string, RouteNode>()
for (const node of ROUTE_NODES) if (!BY_PATH.has(node.path)) BY_PATH.set(node.path, node)

/** `pathname` có nằm trong nhánh `prefix` không — so theo BIÊN đoạn, không phải chuỗi con. */
function underPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`)
}

/** Nút khớp SÂU NHẤT với đường dẫn (tiền tố dài nhất thắng). */
function deepestNode(pathname: string): RouteNode | null {
  let best: RouteNode | null = null
  for (const node of BY_PATH.values()) {
    if (!underPrefix(pathname, node.path)) continue
    if (!best || node.path.length > best.path.length) best = node
  }
  return best
}

/**
 * Đường đi tới trang hiện tại, LUÔN bắt đầu bằng "Trang chủ".
 *
 * @param pathname đường dẫn đang xem
 * @param currentLabel tiêu đề trang hiện tại (nếu có) — thành đốt CUỐI, không phải liên kết
 * @param extra đốt cha ĐỘNG do trang tự cấp (tên hướng chuyên sâu, tên lộ trình, tên bậc…),
 *   chèn SAU các tầng tĩnh. Cây route ở file này chỉ biết đường dẫn cố định, không biết
 *   `/lap-trinh/huong/web--lap-trinh-web` tên là "Lập trình Web" — chỉ trang đó mới biết.
 * @returns mảng đốt; đốt cuối có `to` rỗng. Ở Trang chủ trả về mảng RỖNG (không vẽ gì).
 */
export function buildCrumbs(
  pathname: string,
  currentLabel?: string,
  extra: readonly Crumb[] = [],
): Crumb[] {
  if (pathname === '/') return []

  const trail: Crumb[] = []
  // Lần ngược lên cha. `seen` chặn vòng lặp vô hạn nếu cấu hình `parent` lỡ trỏ vòng tròn.
  const seen = new Set<string>()
  let node = deepestNode(pathname)
  while (node && !seen.has(node.path)) {
    seen.add(node.path)
    trail.unshift({ label: node.label, to: node.to ?? node.path })
    node = node.parent ? (BY_PATH.get(node.parent) ?? null) : null
  }
  trail.unshift(HOME)

  // Đốt cha động của trang — bỏ đốt trùng ngay trước nó (tránh "Lập trình › Lập trình").
  for (const c of extra) {
    if (trail[trail.length - 1]?.label !== c.label) trail.push(c)
  }

  // Tiêu đề trang: chỉ thêm khi nó KHÁC đốt cuối, tránh "Toán học › Toán học".
  if (currentLabel && trail[trail.length - 1]?.label !== currentLabel) {
    trail.push({ label: currentLabel, to: '' })
  }
  // Đốt cuối luôn là trang hiện tại → bỏ liên kết (bấm vào chính mình là vô nghĩa).
  const last = trail[trail.length - 1]
  if (last) trail[trail.length - 1] = { ...last, to: '' }
  return trail
}

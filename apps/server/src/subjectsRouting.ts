// subjectsRouting.ts — Trụ Học tập ở subdomain riêng: quyết định 301 cho từng request.
//
// Quyết định của chủ dự án (2026-08-28): `/mon-hoc*` chuyển sang `hoc-tap.donghanhcungban.org`,
// BỎ tiền tố, và **mỗi nội dung chỉ sống ở MỘT host**:
//
//   www…/mon-hoc              → hoc-tap…/                 (301)
//   www…/mon-hoc/mathematics  → hoc-tap…/mathematics      (301)
//   hoc-tap…/tien-do          → www…/tien-do              (301)   ← mọi thứ ngoài trụ Học tập
//
// Tách thành hàm thuần vì đây là loại logic dễ sai âm thầm: một luật quá rộng sẽ chuyển hướng
// cả file tĩnh (trang trắng, không lỗi rõ ràng), một luật quá hẹp thì sinh nội dung trùng ở hai
// host. `server.ts` gọi `app.listen()` ngay lúc import nên không test được — bài học từ đợt
// `apps/hub` bị bỏ quên (changelog 0191).

/**
 * Host phục vụ trụ Học tập.
 *
 * MẶC ĐỊNH TẮT (`subjectsHostname` không truyền ⇒ không chuyển hướng gì cả). Bật bằng biến môi
 * trường `SUBJECTS_HOSTNAME` trên VPS, SAU khi DNS + chứng chỉ của host mới đã sống. Lý do:
 * deploy code trước khi `hoc-tap.` phân giải được thì `/mon-hoc` sẽ 301 tới một host chết —
 * người dùng mất hẳn đường vào trụ Học tập. Tách "code đã lên" khỏi "tính năng đã bật" để thứ
 * tự triển khai không quyết định thành bại.
 */
export const DEFAULT_SUBJECTS_HOSTNAME = 'hoc-tap.donghanhcungban.org'

/** Host chuẩn của app nền tảng — nơi mọi đường dẫn ngoài trụ Học tập thuộc về. */
export const DEFAULT_CANONICAL_HOSTNAME = 'www.donghanhcungban.org'

/** Tiền tố cũ trên app nền tảng, sẽ được chuyển hướng đi. */
export const LEGACY_SUBJECTS_PREFIX = '/mon-hoc'

/**
 * Đường dẫn thuộc về hạ tầng/tài nguyên, KHÔNG bao giờ được chuyển hướng.
 *
 * Thiếu danh sách này thì trên `hoc-tap.` chính bundle JS/CSS của SPA cũng bị 301 sang `www`,
 * và trang trắng — kiểu lỗi không có thông báo nào để lần ra.
 */
const ASSET_PREFIXES = [
  '/assets/',
  '/data/',
  '/downloads/',
  '/pyodide/',
  '/sqljs/',
  '/uploads/',
  '/api/',
]

/**
 * Môi trường này có dùng subdomain riêng cho trụ Học tập không.
 *
 * `false` ở localhost/IP/domain xem thử — nơi MỘT host phục vụ tất cả. Ở đó `/mon-hoc` phải
 * chạy nguyên như cũ, nếu không `npm run dev` và Playwright sẽ bị đẩy sang một domain production
 * không tồn tại trong môi trường test. (Test canh gác bắt được đúng lỗi này lúc viết.)
 */
export function usesSubjectsSubdomain(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h.endsWith('.donghanhcungban.org') || h.endsWith('.donghanhcungban.com')
}

/** Có phải yêu cầu file tĩnh không (đuôi mở rộng ở đoạn cuối, hoặc nằm trong thư mục tài nguyên). */
export function isAssetPath(pathname: string): boolean {
  if (ASSET_PREFIXES.some((p) => pathname.startsWith(p))) return true
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  // Mã môn học không chứa dấu chấm, nên "có dấu chấm" là dấu hiệu đủ tin cậy của tên file
  // (index-a1b2c3.js, favicon.svg, manifest.webmanifest, robots.txt, sw.js…).
  return lastSegment.includes('.')
}

/**
 * Môn đã có không gian riêng trên app nền tảng — mở thẳng chỗ đó thay vì trang chi tiết môn.
 * Giữ khớp với các route tương ứng trong `apps/dhcb/src/App.tsx`.
 */
const SUBJECTS_WITH_OWN_SPACE: Record<string, string> = {
  programming: '/lap-trinh',
}

export interface RedirectDecision {
  /** URL tuyệt đối để 301 tới. */
  location: string
}

/**
 * Quyết định chuyển hướng cho một request, hoặc `null` nếu cứ phục vụ bình thường.
 *
 * @param subjectIds Mã các môn hợp lệ. Trên host Học tập, chỉ `/` và `/<mã môn>` được ở lại;
 *   đường dẫn lạ đi về `www` thay vì trả SPA — nếu không, mọi route của app sẽ tồn tại ở CẢ
 *   HAI host (trùng lặp nội dung, đúng thứ phương án này sinh ra để tránh).
 */
export function decideRedirect(opts: {
  hostname: string | undefined
  pathname: string
  search?: string
  subjectIds: readonly string[]
  subjectsHostname?: string
  canonicalHostname?: string
}): RedirectDecision | null {
  // Không khai báo host trụ Học tập = tính năng chưa bật ⇒ mọi thứ y như trước.
  if (!opts.subjectsHostname) return null
  const subjectsHost = opts.subjectsHostname.toLowerCase()
  const canonicalHost = opts.canonicalHostname ?? DEFAULT_CANONICAL_HOSTNAME
  const host = opts.hostname?.toLowerCase()
  const { pathname } = opts
  const search = opts.search ?? ''

  if (!host) return null
  if (isAssetPath(pathname)) return null

  if (host === subjectsHost) {
    if (pathname === '/') return null
    // `/mathematics` — đúng một đoạn và là mã môn hợp lệ.
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 1 && opts.subjectIds.includes(segments[0]!)) {
      // Môn có KHÔNG GIAN RIÊNG ngoài trụ Học tập thì đi thẳng về đó, đừng dựng trang chi tiết
      // rồi mới chuyển tiếp bằng JS (một chặng thừa, và người dùng thấy nháy). Tương ứng với
      // route `/mon-hoc/programming` → `/lap-trinh` vốn có trong App.tsx.
      const homeOfOwn = SUBJECTS_WITH_OWN_SPACE[segments[0]!]
      if (homeOfOwn) return { location: `https://${canonicalHost}${homeOfOwn}${search}` }
      return null
    }
    // Mọi thứ khác không thuộc về host này.
    return { location: `https://${canonicalHost}${pathname}${search}` }
  }

  // Trên các host khác: gỡ tiền tố cũ và đẩy sang host Học tập — nhưng CHỈ ở môi trường thật
  // sự có subdomain. Ở localhost/dev thì giữ nguyên `/mon-hoc`.
  if (!usesSubjectsSubdomain(host)) return null
  if (pathname === LEGACY_SUBJECTS_PREFIX || pathname.startsWith(`${LEGACY_SUBJECTS_PREFIX}/`)) {
    const rest = pathname.slice(LEGACY_SUBJECTS_PREFIX.length) || '/'
    return { location: `https://${subjectsHost}${rest}${search}` }
  }

  return null
}

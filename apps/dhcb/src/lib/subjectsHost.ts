// subjectsHost.ts — Trụ Học tập sống ở subdomain riêng `hoc-tap.donghanhcungban.org`.
//
// BỐI CẢNH (quyết định của chủ dự án, 2026-08-28): trang danh sách môn `/mon-hoc` và trang chi
// tiết môn `/mon-hoc/:subjectId` chuyển sang host riêng, và **bỏ tiền tố** `/mon-hoc`:
//
//   www.donghanhcungban.org/mon-hoc              →  hoc-tap.donghanhcungban.org/
//   www.donghanhcungban.org/mon-hoc/mathematics  →  hoc-tap.donghanhcungban.org/mathematics
//
// Mỗi nội dung chỉ sống ở MỘT host: trên `hoc-tap.` mọi đường dẫn khác đều 301 về `www`, và
// trên `www` thì `/mon-hoc*` 301 sang `hoc-tap.` (chặn ở server — xem apps/server/src).
//
// TẠI SAO CÓ FILE NÀY THAY VÌ VIẾT THẲNG URL Ở ~20 CHỖ `nav('/mon-hoc')`: điều hướng sang môn
// học nay có thể là CHUYỂN ORIGIN (một lượt tải trang thật) hoặc điều hướng trong app, tuỳ
// đang đứng ở host nào — và ở localhost/dev thì KHÔNG có subdomain nào cả nên phải giữ nguyên
// đường dẫn `/mon-hoc` cũ. Gom một chỗ để không nơi nào đoán sai.

/**
 * Host phục vụ trụ Học tập. Khớp `SUBJECTS_HOSTNAME` phía server.
 *
 * MẶC ĐỊNH TẮT (rỗng) — bật bằng `VITE_SUBJECTS_HOSTNAME` lúc build, SAU khi DNS + chứng chỉ
 * của host mới đã sống. Nếu bật phía client mà host chưa phân giải, mọi liên kết "Môn học"
 * dẫn tới trang chết; nếu bật phía server mà không bật client thì chỉ mất thêm một chặng 301
 * (vô hại). Vì vậy hai bên tách riêng, và cả hai đều mặc định TẮT.
 */
export function subjectsHostname(): string {
  return ((import.meta.env.VITE_SUBJECTS_HOSTNAME as string | undefined) ?? '').toLowerCase()
}

/** Tiền tố đường dẫn cũ — vẫn dùng ở dev/localhost, nơi không có subdomain. */
export const LEGACY_SUBJECTS_PREFIX = '/mon-hoc'

/** Đang đứng trên chính host của trụ Học tập? Luôn `false` khi tính năng chưa bật. */
export function isSubjectsHost(hostname: string): boolean {
  const configured = subjectsHostname()
  if (!configured) return false
  return hostname.toLowerCase() === configured
}

/**
 * Môi trường này có dùng subdomain riêng cho trụ Học tập không.
 *
 * `false` ở localhost / IP / domain xem thử — nơi chỉ có MỘT host phục vụ tất cả. Khi đó mọi
 * thứ giữ nguyên đường dẫn `/mon-hoc` như trước, để `npm run dev` và Playwright chạy được mà
 * không cần dựng DNS.
 */
export function usesSubjectsSubdomain(hostname: string): boolean {
  if (!subjectsHostname()) return false
  const h = hostname.toLowerCase()
  return h.endsWith('.donghanhcungban.org') || h.endsWith('.donghanhcungban.com')
}

/**
 * Đường dẫn TRONG app tới trụ Học tập, tính theo host hiện tại.
 *
 * Trên host Học tập: `/` và `/<subjectId>` (đã bỏ tiền tố).
 * Nơi khác (gồm localhost): giữ `/mon-hoc` và `/mon-hoc/<subjectId>`.
 */
export function subjectsPath(hostname: string, subjectId?: string): string {
  if (isSubjectsHost(hostname)) return subjectId ? `/${subjectId}` : '/'
  return subjectId ? `${LEGACY_SUBJECTS_PREFIX}/${subjectId}` : LEGACY_SUBJECTS_PREFIX
}

/**
 * Nơi cần tới khi người dùng bấm "Môn học".
 *
 * - `kind: 'path'` → điều hướng trong app (React Router), không tải lại trang.
 * - `kind: 'url'`  → ĐỔI ORIGIN, phải `window.location.assign` chứ Router không đi được.
 *
 * Trả về kiểu phân biệt thay vì một chuỗi, để nơi gọi KHÔNG THỂ quên mất khác biệt đó — đưa
 * một URL tuyệt đối cho `navigate()` của React Router sẽ hỏng âm thầm (nó coi đó là đường dẫn
 * tương đối và ghép vào sau origin hiện tại).
 */
export function subjectsTarget(
  hostname: string,
  subjectId?: string,
): { kind: 'path'; value: string } | { kind: 'url'; value: string } {
  if (isSubjectsHost(hostname) || !usesSubjectsSubdomain(hostname)) {
    return { kind: 'path', value: subjectsPath(hostname, subjectId) }
  }
  const path = subjectId ? `/${subjectId}` : '/'
  return { kind: 'url', value: `https://${subjectsHostname()}${path}` }
}

/**
 * Đi tới trụ Học tập từ bất kỳ đâu trong app.
 *
 * Gói trọn khác biệt "cùng origin hay khác origin": `navigate()` của React Router KHÔNG đi được
 * sang origin khác (nó ghép URL tuyệt đối vào sau origin hiện tại và hỏng âm thầm), nên phải
 * dùng `window.location.assign`. Nơi gọi chỉ cần biết "tôi muốn tới môn học".
 */
export function goToSubjects(navigate: (path: string) => void, subjectId?: string): void {
  const target = subjectsTarget(window.location.hostname, subjectId)
  if (target.kind === 'url') window.location.assign(target.value)
  else navigate(target.value)
}

/** Địa chỉ dùng cho thẻ liên kết. Xem `subjectsTarget` để biết khi nào là URL tuyệt đối. */
export function subjectsLinkTarget(subjectId?: string): ReturnType<typeof subjectsTarget> {
  return subjectsTarget(window.location.hostname, subjectId)
}

/**
 * `navigate()` cho các bảng cấu hình vẫn giữ đường dẫn `/mon-hoc` (Layout, Profile, About).
 *
 * Giữ chuỗi cũ trong cấu hình là có chủ đích: chúng được đọc ở cấp module, trước khi biết chắc
 * đang chạy ở đâu, và ở localhost thì `/mon-hoc` vẫn là đường dẫn ĐÚNG. Việc quy đổi để đúng
 * một chỗ này lo.
 */
export function navigateTo(navigate: (path: string) => void, path: string): void {
  if (path === LEGACY_SUBJECTS_PREFIX) {
    goToSubjects(navigate)
    return
  }
  if (path.startsWith(`${LEGACY_SUBJECTS_PREFIX}/`)) {
    goToSubjects(navigate, path.slice(LEGACY_SUBJECTS_PREFIX.length + 1))
    return
  }
  navigate(path)
}

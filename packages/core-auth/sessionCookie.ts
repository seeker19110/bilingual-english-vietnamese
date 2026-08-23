// packages/core-auth/sessionCookie.ts — Cookie phiên đăng nhập, SONG SONG với Bearer token
// (Bước 3 kế hoạch quản lý user đa lĩnh vực — docs/adr/0002-quan-ly-nguoi-dung.md).
//
// LÝ DO: Bearer/`localStorage` bị cô lập theo origin — đăng nhập ở `en-vi.` xong sang
// `math.` (subdomain môn học tiếp theo) phải đăng nhập lại. Cookie `Domain=.donghanhcungban.org`
// dùng chung cho MỌI subdomain vì tất cả đi qua 1 tiến trình Express (ADR-0001 "mức 2").
//
// CÁCH LÀM: dual-accept, KHÔNG thay Bearer. `packages/core-auth/auth.ts` gắn thêm Set-Cookie
// mỗi lần tạo/thu hồi session; `security.ts#validateAuth` đọc Authorization trước, thiếu mới
// thử cookie. Client hiện tại (apps/dhcb/src/lib/auth.ts) không cần đổi gì — cookie chỉ
// được trình duyệt tự lưu, mở đường cho app con sau này xác thực thẳng bằng cookie mà không
// cần chia sẻ token qua code.
//
// AN TOÀN CSRF: `SameSite=Lax` không gửi kèm cookie khi request là POST/fetch từ site khác
// (chỉ gửi ở điều hướng GET cấp cao nhất) — mọi endpoint đổi trạng thái ở đây đều là POST JSON
// nên rủi ro CSRF qua cookie này thấp, nhưng KHÔNG tuyệt đối như Bearer thuần (client tự gắn
// header, trình duyệt không tự động gửi). Giữ Bearer làm cơ chế chính vì lý do đó.

import { SESSION_TTL_MS } from './authService.js'

export const SESSION_COOKIE_NAME = 'session_token'

// COOKIE_DOMAIN mặc định đúng domain gốc đã chốt ở ADR-0002 — set qua env để override khi cần
// (vd môi trường staging dùng domain khác). Để trống (dev local/localhost) thì KHÔNG set thuộc
// tính Domain — trình duyệt tự giới hạn cookie vào đúng host hiện tại, tránh lỗi cookie bị từ
// chối vì Domain không khớp origin (vd chạy `npm run dev` ở localhost).
// Đọc lại process.env MỖI LẦN gọi (không cache ở module scope) — test đổi biến môi trường
// giữa các case, và về nguyên tắc process.env có thể đổi runtime nếu process manager reload.
function getCookieDomain(reqHost?: string): string {
  if (process.env.COOKIE_DOMAIN) return process.env.COOKIE_DOMAIN
  if (reqHost && reqHost.includes('donghanhcungban.com')) {
    return '.donghanhcungban.com'
  }
  return '.donghanhcungban.org'
}
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

// Dựng giá trị header Set-Cookie cho phiên đăng nhập mới — gọi cùng lúc tạo Bearer token.
export function buildSessionCookie(token: string, reqHost?: string): string {
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000)
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ]
  // Secure bắt buộc đi kèm domain cha production (HTTPS) — bỏ ở dev để cookie hoạt động qua
  // http://localhost (browser từ chối cookie Secure trên kết nối không mã hoá).
  if (isProduction()) {
    parts.push('Secure')
    parts.push(`Domain=${getCookieDomain(reqHost)}`)
  }
  return parts.join('; ')
}

// Xoá cookie lúc đăng xuất — cùng thuộc tính Domain/Path như lúc set, khác đi trình duyệt sẽ
// coi là cookie khác và không xoá được cookie cũ.
export function buildClearSessionCookie(reqHost?: string): string {
  const parts = [`${SESSION_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']
  if (isProduction()) {
    parts.push('Secure')
    parts.push(`Domain=${getCookieDomain(reqHost)}`)
  }
  return parts.join('; ')
}

// Đọc session token từ header Cookie thô (Web API Request không tự parse cookie).
export function readSessionCookie(req: Request): string | null {
  const header = req.headers.get('Cookie') ?? req.headers.get('cookie')
  if (!header) return null

  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=')
    if (eq === -1) continue
    const name = pair.slice(0, eq).trim()
    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(pair.slice(eq + 1).trim())
    }
  }
  return null
}

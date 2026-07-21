// api/_lib/adminAuth.ts — Xác thực ADMIN bằng danh sách email cố định trong biến môi
// trường (không cần đổi schema DB). Đặt ADMIN_EMAILS trong .env, nhiều email cách nhau
// dấu phẩy, vd: ADMIN_EMAILS=donghanhcungban.org@gmail.com
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}

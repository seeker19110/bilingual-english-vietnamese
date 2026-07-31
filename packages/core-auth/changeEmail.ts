// api/_lib/changeEmail.ts — Đổi email của tài khoản đang đăng nhập, rồi gửi lại mã xác thực.
//
// Vì sao cần: người dùng gõ nhầm email lúc đăng ký sẽ KHÔNG BAO GIỜ nhận được mã, tức là kẹt
// vĩnh viễn (không xác thực được → không mở khoá thưởng mời bạn). Phải có đường tự sửa.
//
// BẢO MẬT (đổi email là đường chiếm tài khoản kinh điển — đổi email rồi "quên mật khẩu"):
//   • Tài khoản có mật khẩu → BẮT BUỘC nhập đúng mật khẩu hiện tại mới cho đổi. Chỉ có session
//     token (vd máy dùng chung quên đăng xuất) là KHÔNG đủ.
//   • Tài khoản chỉ đăng nhập Google (password_hash = null) → không có mật khẩu để hỏi; danh
//     tính vẫn neo vào google_id nên đổi email KHÔNG cướp được quyền đăng nhập.
//   • Email mới luôn về trạng thái CHƯA xác thực, kèm gửi mã mới.

import { getPgPool } from '../core-db/pgPool.js'
import { verifyPassword } from './authService.js'
import { sendVerificationCode } from './emailVerification.js'
import type { MailStatus } from '../../api/_lib/mailer.js'

export type ChangeEmailResult =
  | { ok: true; mail: MailStatus }
  | {
      ok: false
      reason:
        'user_not_found' | 'wrong_password' | 'password_required' | 'email_taken' | 'same_email'
    }

export async function changeEmail(
  userId: string,
  rawNewEmail: string,
  password: string | null,
): Promise<ChangeEmailResult> {
  const pool = getPgPool()
  const newEmail = rawNewEmail.trim().toLowerCase()

  const { rows } = await pool.query<{ email: string; password_hash: string | null }>(
    'select email, password_hash from public.users where id = $1',
    [userId],
  )
  const user = rows[0]
  if (!user) return { ok: false, reason: 'user_not_found' }
  if (user.email.toLowerCase() === newEmail) return { ok: false, reason: 'same_email' }

  // Tài khoản có mật khẩu thì phải xác nhận bằng mật khẩu (xem chú thích bảo mật ở đầu file).
  if (user.password_hash) {
    if (!password) return { ok: false, reason: 'password_required' }
    if (!(await verifyPassword(password, user.password_hash))) {
      return { ok: false, reason: 'wrong_password' }
    }
  }

  try {
    // Đổi email + ĐẶT LẠI trạng thái xác thực. Email mới chưa được chứng minh là của họ.
    await pool.query('update public.users set email = $1, email_verified = null where id = $2', [
      newEmail,
      userId,
    ])
  } catch (err) {
    // 23505 = unique_violation trên users.email — email đã có người dùng.
    if ((err as { code?: string }).code === '23505') return { ok: false, reason: 'email_taken' }
    throw err
  }

  // Xoá mã cũ (gắn với email cũ) để không ai xác thực email mới bằng mã đã gửi tới hộp thư cũ.
  await pool.query('delete from public.email_verifications where user_id = $1', [userId])

  const sent = await sendVerificationCode(userId)
  return { ok: true, mail: sent.ok ? sent.mail : 'error' }
}

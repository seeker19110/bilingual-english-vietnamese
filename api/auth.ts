// api/auth.ts — Đăng ký/đăng nhập/đăng xuất (Giai đoạn B, thay Supabase Auth).
// Xem docs/migration-thoat-ly-supabase.md — kiến trúc Bearer token tự viết, KHÔNG dùng
// @auth/express (lý do: khớp đúng SPA hiện có, miễn nhiễm CSRF theo thiết kế).
//
// POST /api/auth  body { action: 'register', email, name, password }
// POST /api/auth  body { action: 'login', email, password }
// POST /api/auth  body { action: 'google', idToken }
// POST /api/auth  body { action: 'logout' }               (cần Authorization: Bearer)
// GET  /api/auth?action=me                                 (cần Authorization: Bearer)

import { z } from 'zod'
import {
  createUserWithPassword,
  verifyUserPassword,
  verifyGoogleIdToken,
  findOrCreateGoogleUser,
  createSession,
  revokeSession,
  ensureProfileRow,
  getUserById,
} from './_lib/authService.js'
import type { Plan } from './_lib/plan.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { sendVerificationCode, verifyCode, isEmailVerified } from './_lib/emailVerification.js'
import { grantEmailVerifyTrial, EMAIL_VERIFY_TRIAL_DAYS } from './_lib/trial.js'
import { changeEmail } from './_lib/changeEmail.js'
import { requestPasswordReset, resetPassword } from './_lib/passwordReset.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { isReservedName } from './_lib/reservedNames.js'

const RegisterSchema = z.object({
  action: z.literal('register'),
  email: z.string().trim().toLowerCase().email(),
  name: z
    .string()
    .trim()
    .min(1)
    .max(80)
    // Chặn tên dễ gây nhầm là admin/CSKH (giả danh lừa người dùng khác) — xem
    // api/_lib/reservedNames.ts + docs/research/dac-ta-admin-dashboard-2026-07-25.md Phần B.
    .refine((name) => !isReservedName(name), {
      message: 'Tên này không thể sử dụng, vui lòng chọn tên khác',
    }),
  password: z.string().min(6).max(200),
})
const LoginSchema = z.object({
  action: z.literal('login'),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
})
const GoogleSchema = z.object({
  action: z.literal('google'),
  idToken: z.string().min(10),
})
const LogoutSchema = z.object({ action: z.literal('logout') })
// Gửi lại mã xác thực email (cần đăng nhập) — chống email giả cày thưởng mời bạn.
const SendVerificationSchema = z.object({ action: z.literal('send-verification') })
const VerifyEmailSchema = z.object({
  action: z.literal('verify-email'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Mã xác thực gồm 6 chữ số'),
})
// Đổi email (cần đăng nhập). Mật khẩu bắt buộc với tài khoản email/password — xem
// api/_lib/changeEmail.ts để biết vì sao.
const ChangeEmailSchema = z.object({
  action: z.literal('change-email'),
  newEmail: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200).optional(),
})
// Quên mật khẩu: yêu cầu gửi link reset — KHÔNG cần đăng nhập (đây chính là lúc không đăng
// nhập được). Không rate-limit riêng vì checkRateLimit theo IP ở đầu handler đã áp dụng chung.
const RequestPasswordResetSchema = z.object({
  action: z.literal('request-password-reset'),
  email: z.string().trim().toLowerCase().email(),
})
const ResetPasswordSchema = z.object({
  action: z.literal('reset-password'),
  token: z.string().trim().min(20).max(200),
  newPassword: z.string().min(6).max(200),
})
const BodySchema = z.union([
  RegisterSchema,
  LoginSchema,
  GoogleSchema,
  LogoutSchema,
  SendVerificationSchema,
  VerifyEmailSchema,
  ChangeEmailSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
])

// Trả về đúng shape AppUser phía client mong đợi (xem src/types.ts) — email lấy từ input vì
// bảng users hiện chưa cần trả qua API này (chỉ id cần thiết cho các nơi khác dùng).
function authResponse(
  token: string,
  user: { id: string; email: string },
  profile: { plan: Plan; onboarded: boolean; name: string },
) {
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: profile.name,
      plan: profile.plan,
      onboarded: profile.onboarded,
      createdAt: Date.now(),
    },
  }
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  // Giới hạn chặt hơn route thường — chống dò mật khẩu/tạo tài khoản hàng loạt.
  if (!(await checkRateLimit(clientIp, 10, 'auth'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/auth' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const url = new URL(req.url)

  if (req.method === 'GET' && url.searchParams.get('action') === 'me') {
    const auth = await validateAuth(req)
    if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)
    const [user, profile] = await Promise.all([
      getUserById(auth.userId),
      ensureProfileRow(auth.userId, ''),
    ])
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)
    return jsonResponse(
      {
        id: auth.userId,
        email: user.email,
        name: profile.name,
        plan: profile.plan,
        onboarded: profile.onboarded,
        // Để UI biết có cần nhắc xác thực email không (xem src/components/EmailVerifySection.tsx).
        emailVerified: await isEmailVerified(auth.userId),
      },
      200,
      allHeaders,
    )
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(BodySchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

  if (result.data.action === 'register') {
    const { email, name, password } = result.data
    const user = await createUserWithPassword(email, password)
    if (!user) {
      // Không nói rõ "email đã tồn tại" để tránh dò email hàng loạt — trả lỗi chung.
      return jsonResponse({ error: 'Không đăng ký được tài khoản này' }, 409, allHeaders)
    }
    const profile = await ensureProfileRow(user.id, name)
    const token = await createSession(user.id)
    // Gửi mã xác thực ngay sau khi tạo tài khoản. KHÔNG chặn đăng ký nếu gửi lỗi/chưa cấu hình
    // SMTP — người dùng vẫn vào học được, chỉ là chưa mở khoá phần thưởng mời bạn (họ bấm
    // "gửi lại mã" trong Hồ sơ sau). Xem api/_lib/emailVerification.ts.
    await sendVerificationCode(user.id).catch((err) => {
      console.error('[auth] Không gửi được mã xác thực lúc đăng ký:', err)
    })
    return jsonResponse(authResponse(token, user, profile), 200, allHeaders)
  }

  if (result.data.action === 'login') {
    const { email, password } = result.data
    const user = await verifyUserPassword(email, password)
    if (!user) {
      logSecurityEvent('LOGIN_FAILED', clientIp, { email })
      return jsonResponse({ error: 'Email hoặc mật khẩu không đúng' }, 401, allHeaders)
    }
    const profile = await ensureProfileRow(user.id, user.email.split('@')[0] ?? user.email)
    const token = await createSession(user.id)
    return jsonResponse(authResponse(token, user, profile), 200, allHeaders)
  }

  if (result.data.action === 'google') {
    const info = await verifyGoogleIdToken(result.data.idToken)
    if (!info) return jsonResponse({ error: 'Google token không hợp lệ' }, 401, allHeaders)
    const user = await findOrCreateGoogleUser(info.googleId, info.email)
    const profile = await ensureProfileRow(user.id, info.name)
    const token = await createSession(user.id)
    return jsonResponse(authResponse(token, user, profile), 200, allHeaders)
  }

  // ── Xác thực email (chống email giả cày thưởng mời bạn) ────────────────────
  // Phải nằm TRƯỚC nhánh logout bên dưới vì đó là nhánh fallthrough cuối hàm.
  if (result.data.action === 'send-verification') {
    const auth = await validateAuth(req)
    if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

    const sent = await sendVerificationCode(auth.userId)
    if (!sent.ok) {
      const messages: Record<typeof sent.reason, string> = {
        already_verified: 'Email của bạn đã được xác thực rồi',
        cooldown: 'Vui lòng đợi một phút trước khi gửi lại mã',
        user_not_found: 'Không tìm thấy tài khoản',
      }
      return jsonResponse({ error: messages[sent.reason] }, 400, allHeaders)
    }
    // Trả trạng thái gửi thật để UI báo đúng: 'rejected' = địa chỉ không nhận được thư
    // (nhiều khả năng gõ sai email), 'not_configured'/'error' = lỗi phía máy chủ.
    return jsonResponse({ ok: true, mail: sent.mail }, 200, allHeaders)
  }

  if (result.data.action === 'verify-email') {
    const auth = await validateAuth(req)
    if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

    const verified = await verifyCode(auth.userId, result.data.code)
    if (!verified.ok) {
      const messages: Record<typeof verified.reason, string> = {
        no_code: 'Chưa có mã nào đang chờ — hãy bấm gửi mã trước',
        expired: 'Mã đã hết hạn, hãy gửi lại mã mới',
        too_many_attempts: 'Nhập sai quá nhiều lần, hãy gửi lại mã mới',
        wrong_code: 'Mã không đúng',
      }
      logSecurityEvent('EMAIL_VERIFY_FAILED', clientIp, { reason: verified.reason })
      return jsonResponse({ error: messages[verified.reason] }, 400, allHeaders)
    }
    // Quà dùng thử Pro 5 ngày — chỉ lần đầu mỗi tài khoản (xem api/_lib/trial.ts).
    // Không để lỗi tặng quà làm hỏng việc xác thực: hàm này tự nuốt lỗi, trả false.
    const trialGranted = await grantEmailVerifyTrial(auth.userId)
    return jsonResponse(
      { ok: true, trialGranted, trialDays: EMAIL_VERIFY_TRIAL_DAYS },
      200,
      allHeaders,
    )
  }

  if (result.data.action === 'change-email') {
    const auth = await validateAuth(req)
    if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

    const changed = await changeEmail(
      auth.userId,
      result.data.newEmail,
      result.data.password ?? null,
    )
    if (!changed.ok) {
      const messages: Record<typeof changed.reason, string> = {
        user_not_found: 'Không tìm thấy tài khoản',
        wrong_password: 'Mật khẩu không đúng',
        password_required: 'Nhập mật khẩu hiện tại để đổi email',
        email_taken: 'Email này đã được dùng cho tài khoản khác',
        same_email: 'Email mới trùng email hiện tại',
      }
      logSecurityEvent('CHANGE_EMAIL_FAILED', clientIp, { reason: changed.reason })
      return jsonResponse({ error: messages[changed.reason] }, 400, allHeaders)
    }
    logSecurityEvent('CHANGE_EMAIL_OK', clientIp, { userId: auth.userId })
    return jsonResponse({ ok: true, mail: changed.mail }, 200, allHeaders)
  }

  if (result.data.action === 'request-password-reset') {
    // LUÔN trả cùng 1 kết quả bất kể email có tồn tại hay không — chống dò email hàng loạt.
    // Xem chú thích bảo mật trong api/_lib/passwordReset.ts.
    await requestPasswordReset(result.data.email)
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  if (result.data.action === 'reset-password') {
    const reset = await resetPassword(result.data.token, result.data.newPassword)
    if (!reset.ok) {
      const messages: Record<typeof reset.reason, string> = {
        invalid_or_expired: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
        already_used: 'Link này đã được dùng rồi — yêu cầu link mới nếu cần đổi lại',
      }
      logSecurityEvent('PASSWORD_RESET_FAILED', clientIp, { reason: reset.reason })
      return jsonResponse({ error: messages[reset.reason] }, 400, allHeaders)
    }
    logSecurityEvent('PASSWORD_RESET_OK', clientIp, {})
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  // action === 'logout'
  const authHeader = req.headers.get('Authorization')
  const rawToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (rawToken) await revokeSession(rawToken)
  return jsonResponse({ ok: true }, 200, allHeaders)
}

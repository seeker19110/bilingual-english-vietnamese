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
} from './_lib/authService'
import type { Plan } from './_lib/plan'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security'
import { validateBody, readJsonBody } from './_lib/validation'
import { jsonResponse, getClientIp } from './_lib/http'

const RegisterSchema = z.object({
  action: z.literal('register'),
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).max(80),
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
const BodySchema = z.union([RegisterSchema, LoginSchema, GoogleSchema, LogoutSchema])

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

  // action === 'logout'
  const authHeader = req.headers.get('Authorization')
  const rawToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (rawToken) await revokeSession(rawToken)
  return jsonResponse({ ok: true }, 200, allHeaders)
}

// api/_lib/authService.ts — Auth tự viết thay Supabase Auth (Giai đoạn B).
// Quyết định kiến trúc (xem docs/migration-thoat-ly-supabase.md): giữ mô hình Bearer token
// (không đổi sang cookie session của @auth/express) — khớp đúng kiến trúc SPA hiện có,
// miễn nhiễm CSRF theo thiết kế (client tự gắn header Authorization, trình duyệt không
// tự động gửi kèm như cookie).
//
// Session token: chuỗi ngẫu nhiên 32 byte (crypto.randomBytes), CHỈ hash SHA-256 của token
// được lưu trong bảng `sessions` (không lưu token gốc) — giống thông lệ lưu API key, để lộ
// DB không đồng nghĩa với lộ token dùng được ngay.

import { randomBytes, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { getPgPool } from './pgPool.js'
import { resolvePlan, type Plan } from './plan.js'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 ngày — khớp thời hạn session Supabase cũ
const BCRYPT_ROUNDS = 12

export interface AuthUserRow {
  id: string
  email: string
}

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Tạo user email/password mới. Trả `null` nếu email đã tồn tại (unique_violation, code 23505).
export async function createUserWithPassword(
  email: string,
  password: string,
): Promise<AuthUserRow | null> {
  const pool = getPgPool()
  const passwordHash = await hashPassword(password)
  try {
    const { rows } = await pool.query<AuthUserRow>(
      'insert into public.users (email, password_hash) values ($1, $2) returning id, email',
      [email.toLowerCase().trim(), passwordHash],
    )
    return rows[0] ?? null
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return null // email đã tồn tại
    }
    throw err
  }
}

// Xác thực email/password. Trả `null` nếu sai email hoặc sai mật khẩu (không phân biệt lỗi
// nào để tránh lộ thông tin "email này có tồn tại không" cho kẻ dò email hàng loạt).
export async function verifyUserPassword(
  email: string,
  password: string,
): Promise<AuthUserRow | null> {
  const pool = getPgPool()
  const { rows } = await pool.query<AuthUserRow & { password_hash: string | null }>(
    'select id, email, password_hash from public.users where email = $1',
    [email.toLowerCase().trim()],
  )
  const user = rows[0]
  if (!user?.password_hash) return null
  const ok = await verifyPassword(password, user.password_hash)
  return ok ? { id: user.id, email: user.email } : null
}

// ── Google OAuth (Google Identity Services — client gửi ID token, server verify) ──────
let googleClient: OAuth2Client | null = null
let googleClientId: string | null = null
function getGoogleClient(): { client: OAuth2Client; clientId: string } {
  if (googleClient && googleClientId) return { client: googleClient, clientId: googleClientId }
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Server chưa cấu hình GOOGLE_CLIENT_ID')
  googleClientId = clientId
  googleClient = new OAuth2Client(clientId)
  return { client: googleClient, clientId }
}

// Verify ID token nhận từ client (Google Identity Services), trả thông tin đã xác thực
// hoặc `null` nếu token không hợp lệ/giả mạo/sai audience.
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<{ googleId: string; email: string; name: string } | null> {
  try {
    const { client, clientId } = getGoogleClient()
    const ticket = await client.verifyIdToken({ idToken, audience: clientId })
    const payload = ticket.getPayload()
    if (!payload?.sub || !payload.email) return null
    if (payload.email_verified === false) return null
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email.split('@')[0] ?? payload.email,
    }
  } catch (err) {
    console.warn(
      '[authService] verifyGoogleIdToken thất bại:',
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

// Tìm user theo google_id; nếu chưa có mà email đã tồn tại (đăng ký email/password trước đó)
// thì LIÊN KẾT (gắn google_id vào user cũ) thay vì tạo user trùng email.
export async function findOrCreateGoogleUser(
  googleId: string,
  email: string,
): Promise<AuthUserRow> {
  const pool = getPgPool()
  const normalizedEmail = email.toLowerCase().trim()

  const byGoogle = await pool.query<AuthUserRow>(
    'select id, email from public.users where google_id = $1',
    [googleId],
  )
  if (byGoogle.rows[0]) return byGoogle.rows[0]

  const byEmail = await pool.query<AuthUserRow>(
    'select id, email from public.users where email = $1',
    [normalizedEmail],
  )
  if (byEmail.rows[0]) {
    await pool.query('update public.users set google_id = $1 where id = $2', [
      googleId,
      byEmail.rows[0].id,
    ])
    return byEmail.rows[0]
  }

  const { rows } = await pool.query<AuthUserRow>(
    'insert into public.users (email, google_id, email_verified) values ($1, $2, now()) returning id, email',
    [normalizedEmail, googleId],
  )
  const created = rows[0]
  if (!created) throw new Error('Không tạo được user Google mới')
  return created
}

export async function getUserById(userId: string): Promise<AuthUserRow | null> {
  const pool = getPgPool()
  const { rows } = await pool.query<AuthUserRow>(
    'select id, email from public.users where id = $1',
    [userId],
  )
  return rows[0] ?? null
}

// ── Session (Bearer token) ─────────────────────────────────────────────────────
export async function createSession(userId: string): Promise<string> {
  const pool = getPgPool()
  const rawToken = randomBytes(32).toString('base64url')
  const expires = new Date(Date.now() + SESSION_TTL_MS)
  await pool.query(
    'insert into public.sessions (session_token, user_id, expires) values ($1, $2, $3)',
    [hashToken(rawToken), userId, expires],
  )
  return rawToken
}

export async function validateSessionToken(rawToken: string): Promise<{ userId: string } | null> {
  const pool = getPgPool()
  const { rows } = await pool.query<{ user_id: string; expires: Date }>(
    'select user_id, expires from public.sessions where session_token = $1',
    [hashToken(rawToken)],
  )
  const session = rows[0]
  if (!session) return null
  if (new Date(session.expires).getTime() < Date.now()) {
    // Hết hạn — dọn luôn (best-effort, không chặn request nếu lỗi)
    void pool
      .query('delete from public.sessions where session_token = $1', [hashToken(rawToken)])
      .catch(() => undefined)
    return null
  }
  return { userId: session.user_id }
}

export async function revokeSession(rawToken: string): Promise<void> {
  const pool = getPgPool()
  await pool.query('delete from public.sessions where session_token = $1', [hashToken(rawToken)])
}

// ── Profile (tối thiểu cho luồng auth — phần còn lại của `profiles` thuộc Giai đoạn C) ──
export interface ProfileInfo {
  plan: Plan
  onboarded: boolean
  name: string
}

// Tạo profile nếu chưa có (khớp hành vi trigger handle_new_user cũ của Supabase, nhưng
// chạy trong code server thay vì trigger DB ẩn) rồi trả thông tin hiện tại.
export async function ensureProfileRow(userId: string, name: string): Promise<ProfileInfo> {
  const pool = getPgPool()
  await pool.query(
    'insert into public.profiles (id, name) values ($1, $2) on conflict (id) do nothing',
    [userId, name],
  )
  const { rows } = await pool.query<{
    plan: string
    plan_expires_at: Date | null
    onboarded: boolean
    name: string | null
  }>('select plan, plan_expires_at, onboarded, name from public.profiles where id = $1', [userId])
  const row = rows[0]
  return {
    plan: resolvePlan(row?.plan, row?.plan_expires_at),
    onboarded: !!row?.onboarded,
    name: row?.name ?? name,
  }
}

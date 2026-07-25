// api/profile.ts — Đọc/ghi hồ sơ (Giai đoạn C, thay client gọi thẳng Supabase `profiles`).
// Trước đây src/lib/cloud.ts (ensureProfile/saveOnboarding) và src/lib/onboarding.ts
// (fetchOnboarding) gọi Supabase client dựa vào RLS `auth.uid()` — không còn hoạt động
// sau khi cutover khỏi Supabase Auth (Giai đoạn B), nên chuyển hết qua route server này.
//
// GET  /api/profile                                          (cần Authorization: Bearer)
// POST /api/profile  body { action: 'onboarding', level, goal, dailyMinutes }

import { z } from 'zod'
import { getPgPool } from './_lib/pgPool'
import { ensureProfileRow } from './_lib/authService'
import { resolvePlan } from './_lib/plan'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security'
import { validateBody, readJsonBody } from './_lib/validation'
import { jsonResponse, getClientIp } from './_lib/http'

const AGE_GROUPS = ['nhi_dong', 'thieu_nien', 'thanh_nien', 'nguoi_lon'] as const

const OnboardingSchema = z.object({
  action: z.literal('onboarding'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.string().min(1).max(40),
  dailyMinutes: z.number().int().min(1).max(180),
  ageGroup: z.enum(AGE_GROUPS).optional(),
})

// Đổi nhóm tuổi riêng (Profile.tsx, sau khi đã onboarded) — tách khỏi action 'onboarding'
// vì chỉ đổi đúng 1 cột, không gửi lại level/goal/dailyMinutes không liên quan.
const SetAgeGroupSchema = z.object({
  action: z.literal('set-age-group'),
  ageGroup: z.enum(AGE_GROUPS),
})

const BodySchema = z.union([OnboardingSchema, SetAgeGroupSchema])

interface ProfileRow {
  plan: string
  plan_expires_at: Date | null
  onboarded: boolean
  name: string | null
  user_level: string | null
  goal: string | null
  daily_minutes: number | null
  age_group: string | null
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'profile'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/profile' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method === 'GET') {
    await ensureProfileRow(auth.userId, '') // tạo profile nếu chưa có (an toàn, idempotent)
    const pool = getPgPool()
    const { rows } = await pool.query<ProfileRow>(
      'select plan, plan_expires_at, onboarded, name, user_level, goal, daily_minutes, age_group from public.profiles where id = $1',
      [auth.userId],
    )
    const row = rows[0]
    return jsonResponse(
      {
        plan: resolvePlan(row?.plan, row?.plan_expires_at),
        planExpiresAt: row?.plan_expires_at ? new Date(row.plan_expires_at).toISOString() : null,
        onboarded: !!row?.onboarded,
        name: row?.name ?? '',
        userLevel: row?.user_level ?? 'beginner',
        goal: row?.goal ?? 'daily',
        dailyMinutes: row?.daily_minutes ?? 10,
        // NULL (chưa từng chọn) → 'nguoi_lon': mặc định an toàn, không ép giao diện/giọng
        // điệu trẻ em lên người dùng chưa từng chọn nhóm tuổi.
        ageGroup: row?.age_group ?? 'nguoi_lon',
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

  const pool = getPgPool()

  if (result.data.action === 'set-age-group') {
    await pool.query('update public.profiles set age_group = $1 where id = $2', [
      result.data.ageGroup,
      auth.userId,
    ])
    return jsonResponse({ ok: true }, 200, allHeaders)
  }

  await pool.query(
    `update public.profiles
       set user_level = $1, goal = $2, daily_minutes = $3, onboarded = true,
           age_group = coalesce($5, age_group)
     where id = $4`,
    [
      result.data.level,
      result.data.goal,
      result.data.dailyMinutes,
      auth.userId,
      result.data.ageGroup ?? null,
    ],
  )
  return jsonResponse({ ok: true }, 200, allHeaders)
}

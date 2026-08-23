// api/profile.ts — Đọc/ghi hồ sơ (Giai đoạn C, thay client gọi thẳng Supabase `profiles`).
// Trước đây src/lib/cloud.ts (ensureProfile/saveOnboarding) và src/lib/onboarding.ts
// (fetchOnboarding) gọi Supabase client dựa vào RLS `auth.uid()` — không còn hoạt động
// sau khi cutover khỏi Supabase Auth (Giai đoạn B), nên chuyển hết qua route server này.
//
// GET  /api/profile                                          (cần đăng nhập — cookie)
// POST /api/profile  body { action: 'onboarding', level, goal, dailyMinutes }
//
// ── RANH GIỚI NỀN TẢNG vs MÔN HỌC (PR C1b, migration 0059) ────────────────────────────────
// `public.profiles` giữ dữ liệu CẤP NỀN TẢNG (plan, tên, đã onboard chưa, `age_group`).
// `english.user_profile` giữ dữ liệu CHỈ ĐÚNG VỚI MÔN TIẾNG ANH (`user_level` kiểu CEFR thô,
// `goal`, `daily_minutes`) — bảng do migration 0036 tạo sẵn rồi để NGỦ; file này là nơi đánh
// thức nó.
//
// `age_group` thuộc NỀN TẢNG chứ không thuộc môn (0036 xếp nhầm): nó quyết định giọng
// Companion (`prompts/index.ts` → ageGroupToneBlock), nội dung theo lứa tuổi, và băng tuổi
// trong hồ sơ năng lực — dùng cho MỌI môn. Migration 0059 đã xoá cột trùng bên bảng môn.
//
// Chiến lược chuyển đổi AN TOÀN, đảo ngược được: GHI CẢ HAI nơi (dual-write, trong cùng một
// transaction), ĐỌC ưu tiên bảng môn rồi rơi về `public.profiles`. Nhờ vậy rollback = revert
// code, không cần đụng dữ liệu. Xoá hẳn 3 cột cũ trên `public.profiles` là bước RIÊNG, chỉ làm
// sau khi bản dual-write này đã chạy ổn định trên production một thời gian.

import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import { withTransaction } from '@dhcb/core-db/transaction'
import { ensureProfileRow } from '@dhcb/core-auth/authService'
import { resolvePlan } from '@dhcb/core-billing/plan'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { backfillCurrentLearningGoal } from '@dhcb/core-personal/learningGoalAdapter'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

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
    // coalesce = ưu tiên bảng môn, rơi về cột cũ trên public.profiles khi người dùng chưa có
    // hàng bên english.user_profile (đăng ký trước 0036/0059, hoặc chưa onboard môn Anh).
    const { rows } = await pool.query<ProfileRow>(
      `select p.plan, p.plan_expires_at, p.onboarded, p.name, p.age_group,
              coalesce(e.user_level, p.user_level)       as user_level,
              coalesce(e.goal, p.goal)                   as goal,
              coalesce(e.daily_minutes, p.daily_minutes) as daily_minutes
         from public.profiles p
         left join english.user_profile e on e.user_id = p.id
        where p.id = $1`,
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

  const { level, goal, dailyMinutes, ageGroup } = result.data

  // Dual-write trong MỘT transaction: hai nơi không được phép lệch nhau. Nếu chỉ ghi một nơi rồi
  // lỗi, lần đọc sau sẽ lấy `coalesce` ra giá trị cũ của nơi kia — sai mà không báo lỗi gì.
  await withTransaction(pool, async (client) => {
    await client.query(
      `update public.profiles
         set user_level = $1, goal = $2, daily_minutes = $3, onboarded = true,
             age_group = coalesce($5, age_group)
       where id = $4`,
      [level, goal, dailyMinutes, auth.userId, ageGroup ?? null],
    )
    await client.query(
      `insert into english.user_profile (user_id, user_level, goal, daily_minutes)
       values ($1, $2, $3, $4)
       on conflict (user_id) do update
         set user_level = excluded.user_level,
             goal = excluded.goal,
             daily_minutes = excluded.daily_minutes`,
      [auth.userId, level, goal, dailyMinutes],
    )
  })

  // Outbox/Reconciliation: Cập nhật lại read view của Life Graph
  try {
    await backfillCurrentLearningGoal(pool, auth.userId)
  } catch (err) {
    // Không ném lỗi ra ngoài để tránh làm hỏng luồng đổi profile chính
    console.error(`Lỗi đồng bộ Life Graph cho user ${auth.userId}:`, err)
  }

  return jsonResponse({ ok: true }, 200, allHeaders)
}

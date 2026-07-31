// api/progress.ts — Đọc/ghi tiến độ học (Giai đoạn C, thay client gọi thẳng Supabase
// `learning_progress`). Trước đây src/lib/progressSync.ts gọi Supabase client dựa vào RLS
// `auth.uid()` — không còn hoạt động sau khi cutover khỏi Supabase Auth (Giai đoạn B).
//
// GET  /api/progress                         (cần Authorization: Bearer)
// POST /api/progress  body { learned, hard, srs, cefrGrammar, cefrDialogues, cefrUnlocked,
//                             cefrExams, placement, weeklyGoal, achievements }

import { z } from 'zod'
import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { vnDateStr } from '../packages/core-db/date.js'
import { FREE_WEEKLY_BONUS_PER_DAY } from './_lib/usage.js'

// Giới hạn kích thước hợp lý — chặn payload bất thường (DoS/lỗi client) mà vẫn đủ rộng
// cho người học nhiều năm (từ điển app hiện ~12.000 từ).
const MAX_ARR = 20_000
const ProgressSchema = z.object({
  learned: z.array(z.string()).max(MAX_ARR).default([]),
  hard: z.array(z.string()).max(MAX_ARR).default([]),
  srs: z.record(z.string(), z.unknown()).default({}),
  cefrGrammar: z.array(z.string()).max(MAX_ARR).default([]),
  cefrDialogues: z.array(z.string()).max(MAX_ARR).default([]),
  cefrUnlocked: z.array(z.string()).max(MAX_ARR).default([]),
  cefrExams: z.record(z.string(), z.unknown()).default({}),
  placement: z.record(z.string(), z.unknown()).default({}),
  weeklyGoal: z.record(z.string(), z.unknown()).default({}),
  achievements: z.array(z.string()).max(MAX_ARR).default([]),
})

interface ProgressRow {
  learned: string[]
  hard: string[]
  srs: Record<string, unknown>
  cefr_grammar: string[]
  cefr_dialogues: string[]
  cefr_unlocked: string[]
  cefr_exams: Record<string, unknown>
  placement: Record<string, unknown>
  weekly_goal: Record<string, unknown>
  achievements: string[]
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'progress'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/progress' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()

  if (req.method === 'GET') {
    const { rows } = await pool.query<ProgressRow>(
      `select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams,
              placement, weekly_goal, achievements
         from public.learning_progress where user_id = $1`,
      [auth.userId],
    )
    const row = rows[0]
    if (!row) return jsonResponse(null, 200, allHeaders)
    return jsonResponse(
      {
        learned: row.learned ?? [],
        hard: row.hard ?? [],
        srs: row.srs ?? {},
        cefrGrammar: row.cefr_grammar ?? [],
        cefrDialogues: row.cefr_dialogues ?? [],
        cefrUnlocked: row.cefr_unlocked ?? [],
        cefrExams: row.cefr_exams ?? {},
        placement: row.placement ?? {},
        weeklyGoal: row.weekly_goal ?? {},
        achievements: row.achievements ?? [],
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
  const result = validateBody(ProgressSchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)

  const d = result.data

  // Quyết định 2026-07-26 (đổi cơ chế trượt 2026-07-27): gói Free tích lượt AI — +5 lượt
  // mỗi ngày người dùng THỰC SỰ học (không bắt buộc dùng lượt AI), tính theo cửa sổ TRƯỢT
  // 7 ngày liền kề (xem api/_lib/usage.ts, postgres/migrations/0017_free_rolling_credit.sql).
  // Ta không có sự kiện "học 1 từ" riêng, nhưng pushProgress() (src/lib/progressSync.ts)
  // được gọi ĐÚNG lúc học từ mới/ôn từ/hoàn thành hội thoại/ngữ pháp — nên phát hiện qua so
  // sánh độ dài mảng TRƯỚC/SAU: nếu bất kỳ mảng nào dài ra so với bản đang lưu → có hoạt
  // động học thật trong request này, cộng thưởng (idempotent theo ngày, xem
  // grant_daily_bonus_rolling). Không cộng khi chỉ đồng bộ lại dữ liệu cũ (pullProgress →
  // pushProgress merge) mà không có gì mới.
  const { rows: beforeRows } = await pool.query<{
    learned: string[]
    hard: string[]
    cefr_grammar: string[]
    cefr_dialogues: string[]
  }>(
    `select learned, hard, cefr_grammar, cefr_dialogues
       from public.learning_progress where user_id = $1`,
    [auth.userId],
  )
  const before = beforeRows[0]
  const grewLearning =
    !before ||
    d.learned.length > (before.learned ?? []).length ||
    d.hard.length > (before.hard ?? []).length ||
    d.cefrGrammar.length > (before.cefr_grammar ?? []).length ||
    d.cefrDialogues.length > (before.cefr_dialogues ?? []).length

  if (grewLearning) {
    try {
      await pool.query('select public.grant_daily_bonus_rolling($1, $2, $3)', [
        auth.userId,
        vnDateStr(),
        FREE_WEEKLY_BONUS_PER_DAY,
      ])
    } catch (err) {
      // FAIL-OPEN: lỗi cộng thưởng không được làm vỡ luồng lưu tiến độ chính.
      console.warn('[progress] cộng thưởng lượt lỗi → bỏ qua:', err)
    }
  }

  await pool.query(
    `insert into public.learning_progress
       (user_id, learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked,
        cefr_exams, placement, weekly_goal, achievements, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     on conflict (user_id) do update set
       learned = excluded.learned,
       hard = excluded.hard,
       srs = excluded.srs,
       cefr_grammar = excluded.cefr_grammar,
       cefr_dialogues = excluded.cefr_dialogues,
       cefr_unlocked = excluded.cefr_unlocked,
       cefr_exams = excluded.cefr_exams,
       placement = excluded.placement,
       weekly_goal = excluded.weekly_goal,
       achievements = excluded.achievements,
       updated_at = now()`,
    [
      auth.userId,
      JSON.stringify(d.learned),
      JSON.stringify(d.hard),
      JSON.stringify(d.srs),
      JSON.stringify(d.cefrGrammar),
      JSON.stringify(d.cefrDialogues),
      JSON.stringify(d.cefrUnlocked),
      JSON.stringify(d.cefrExams),
      JSON.stringify(d.placement),
      JSON.stringify(d.weeklyGoal),
      JSON.stringify(d.achievements),
    ],
  )
  return jsonResponse({ ok: true }, 200, allHeaders)
}

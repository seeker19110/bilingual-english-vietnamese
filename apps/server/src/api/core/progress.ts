// api/progress.ts — Đọc/ghi tiến độ học (Giai đoạn C, thay client gọi thẳng Supabase
// `learning_progress`). Trước đây src/lib/progressSync.ts gọi Supabase client dựa vào RLS
// `auth.uid()` — không còn hoạt động sau khi cutover khỏi Supabase Auth (Giai đoạn B).
//
// GET  /api/progress                         (cần đăng nhập — cookie)
// POST /api/progress  body { learned, hard, srs, cefrGrammar, cefrDialogues, cefrUnlocked,
//                             cefrExams, placement, weeklyGoal, achievements }

import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import { vnDateStr } from '@dhcb/core-db/date'
import { FREE_WEEKLY_BONUS_PER_DAY } from '@dhcb/core-billing/usage'
import {
  mergeSrsMap,
  mergeExamMap,
  mergeByTimestamp,
  mergeArrayUnion,
} from '../_lib/progressMerge.js'

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
  settings: z.record(z.string(), z.unknown()).default({}),
  streakFreezeDates: z.array(z.string()).max(MAX_ARR).default([]),
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
  settings: Record<string, unknown>
  streak_freeze_dates: string[]
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
              placement, weekly_goal, achievements, settings, streak_freeze_dates
         from english.learning_progress where user_id = $1`,
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
        settings: row.settings ?? {},
        streakFreezeDates: row.streak_freeze_dates ?? [],
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
  const { rows: existingRows } = await pool.query<ProgressRow>(
    `select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams,
            placement, weekly_goal, achievements, settings, streak_freeze_dates
       from english.learning_progress where user_id = $1`,
    [auth.userId],
  )
  const existing = existingRows[0]
  // KHÔNG tính `hard` (audit 2026-08-12): đánh dấu một từ là "khó" KHÔNG phải hành động học —
  // nó chỉ là gắn nhãn để lọc ở tab Từ khó, bấm phát một cái là xong, không cần học gì. Tính nó
  // vào đây nghĩa là bật/tắt 1 từ khó cũng lĩnh trọn +5 lượt AI của ngày mà không học chữ nào.
  // Ba tín hiệu còn lại đều là học thật: thuộc thêm từ, xong thêm bài ngữ pháp, xong thêm hội thoại.
  const grewLearning =
    !existing ||
    d.learned.length > (existing.learned ?? []).length ||
    d.cefrGrammar.length > (existing.cefr_grammar ?? []).length ||
    d.cefrDialogues.length > (existing.cefr_dialogues ?? []).length

  if (grewLearning) {
    try {
      await pool.query('select public.grant_daily_bonus_rolling($1, $2, $3, $4)', [
        auth.userId,
        vnDateStr(),
        FREE_WEEKLY_BONUS_PER_DAY,
        'english',
      ])
    } catch (err) {
      // FAIL-OPEN: lỗi cộng thưởng không được làm vỡ luồng lưu tiến độ chính.
      console.warn('[progress] cộng thưởng lượt lỗi → bỏ qua:', err)
    }
  }

  // Hợp nhất với dữ liệu đang có trên server — CHẶN TUYỆT ĐỐI kịch bản mất tiến độ khi dùng
  // nhiều thiết bị/tab (một thiết bị gửi lên dữ liệu CŨ/thiếu trước khi kịp kéo dữ liệu thật
  // về, do mất mạng, 2 tab cùng mở, hoặc 2 thiết bị học song song rồi đồng bộ gần như đồng
  // thời). Quyết định 2026-08-13: TOÀN BỘ các trường "tiến độ học" giờ chỉ TĂNG, không bao giờ
  // giảm — kể cả learned/cefrGrammar/cefrDialogues/cefrUnlocked/achievements (trước đây ghi đè
  // theo client). Đánh đổi đã xác nhận với người dùng: "bỏ đánh dấu" (unmarkLearned — không có
  // nút UI nào gọi, chỉ còn trong test; unmarkGrammarDone — CÓ dùng ở CefrLessonViews.tsx) sẽ
  // không còn tác dụng lâu dài, vì máy khác đồng bộ lại sẽ tự thêm lại mục vừa bỏ (xem
  // _lib/progressMerge.ts). Riêng `hard` (nhãn từ khó, chỉ là lọc hiển thị — không phải tiến
  // độ) VẪN ghi đè theo client như cũ.
  const merged = {
    learned: mergeArrayUnion(existing?.learned ?? [], d.learned),
    hard: d.hard,
    srs: mergeSrsMap(existing?.srs ?? {}, d.srs),
    cefrGrammar: mergeArrayUnion(existing?.cefr_grammar ?? [], d.cefrGrammar),
    cefrDialogues: mergeArrayUnion(existing?.cefr_dialogues ?? [], d.cefrDialogues),
    cefrUnlocked: mergeArrayUnion(existing?.cefr_unlocked ?? [], d.cefrUnlocked),
    cefrExams: mergeExamMap(existing?.cefr_exams ?? {}, d.cefrExams),
    placement: mergeByTimestamp(existing?.placement ?? {}, d.placement, 'lastAt'),
    weeklyGoal: mergeByTimestamp(existing?.weekly_goal ?? {}, d.weeklyGoal, 'updatedAt'),
    achievements: mergeArrayUnion(existing?.achievements ?? [], d.achievements),
    // settings: "lựa chọn hiện tại" (ngôn ngữ giao diện, chiều học, âm thanh, giọng đọc) —
    // không phải tiến độ "chỉ tăng", nên hợp nhất theo mốc updatedAt MỚI HƠN thắng, giống
    // placement/weeklyGoal.
    settings: mergeByTimestamp(existing?.settings ?? {}, d.settings, 'updatedAt'),
    // streakFreezeDates: vé nghỉ streak ĐÃ DÙNG là sự kiện đã xảy ra — chỉ tăng, union như
    // learned/achievements (không bao giờ mất vé đã ghi nhận ở máy khác).
    streakFreezeDates: mergeArrayUnion(existing?.streak_freeze_dates ?? [], d.streakFreezeDates),
  }

  await pool.query(
    `insert into english.learning_progress
       (user_id, learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked,
        cefr_exams, placement, weekly_goal, achievements, settings, streak_freeze_dates,
        updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
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
       settings = excluded.settings,
       streak_freeze_dates = excluded.streak_freeze_dates,
       updated_at = now()`,
    [
      auth.userId,
      JSON.stringify(merged.learned),
      JSON.stringify(merged.hard),
      JSON.stringify(merged.srs),
      JSON.stringify(merged.cefrGrammar),
      JSON.stringify(merged.cefrDialogues),
      JSON.stringify(merged.cefrUnlocked),
      JSON.stringify(merged.cefrExams),
      JSON.stringify(merged.placement),
      JSON.stringify(merged.weeklyGoal),
      JSON.stringify(merged.achievements),
      JSON.stringify(merged.settings),
      JSON.stringify(merged.streakFreezeDates),
    ],
  )
  return jsonResponse({ ok: true }, 200, allHeaders)
}

// api/challenge.ts — Đồng bộ entries thử thách "Challenge 1 phút" (Giai đoạn C phần còn
// lại, thay client gọi thẳng Supabase trong src/lib/challengeCloud.ts).
//
// GET  /api/challenge → { entries: CloudChallengeEntry[] } (snake_case như hàng DB —
//   client giữ nguyên bộ chuyển đổi cloudChallengeToLocal có sẵn)
// POST /api/challenge  body camelCase (ChallengeEntryLike) → upsert theo (user_id, day),
//   nộp lại trong ngày = ghi đè. Video KHÔNG bao giờ upload — chỉ text.

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

const EntrySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  challengeRound: z.number().int().min(1).optional(),
  round: z.number().int().min(1).optional(),
  challengeDay: z.number().int().min(0),
  topicDay: z.number().int().min(0),
  transcript: z.string().max(20_000),
  feedback: z.string().max(50_000).nullable().default(null),
  durationSec: z.number().int().min(0).max(3_600),
  wordCount: z.number().int().min(0).max(100_000),
})

// feedback: local giữ dạng CHUỖI JSON, cột DB là jsonb. Parse thành object thật để jsonb
// truy vấn được; chuỗi không phải JSON hợp lệ thì giữ nguyên chuỗi (jsonb chứa được string).
// (Chuyển từ challengeCloud.ts cũ lên server — client giờ gửi chuỗi thô.)
function feedbackToJsonb(fb: string | null): string | null {
  if (fb === null || fb === '') return null
  try {
    JSON.parse(fb)
    return fb // đã là JSON hợp lệ — truyền thẳng cho cột jsonb
  } catch {
    return JSON.stringify(fb) // bọc thành json string hợp lệ
  }
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'challenge'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/challenge' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()

  if (req.method === 'GET') {
    // day::text để trả đúng 'YYYY-MM-DD' — node-postgres parse cột date thành Date theo
    // múi giờ máy chủ, serialize lại có thể lệch sang ngày hôm trước.
    const { rows } = await pool.query(
      `select id, user_id, day::text as day, challenge_round, challenge_day, topic_day,
              transcript, feedback, duration_sec, word_count, created_at
         from public.challenge_entries where user_id = $1 order by day asc`,
      [auth.userId],
    )
    return jsonResponse({ entries: rows }, 200, allHeaders)
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(EntrySchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
  const e = result.data

  await pool.query(
    `insert into public.challenge_entries
       (user_id, day, challenge_round, challenge_day, topic_day, transcript, feedback,
        duration_sec, word_count)
     values ($1, $2::date, $3, $4, $5, $6, $7::jsonb, $8, $9)
     on conflict (user_id, day) do update set
       challenge_round = excluded.challenge_round,
       challenge_day = excluded.challenge_day,
       topic_day = excluded.topic_day,
       transcript = excluded.transcript,
       feedback = excluded.feedback,
       duration_sec = excluded.duration_sec,
       word_count = excluded.word_count`,
    [
      auth.userId,
      e.day,
      e.challengeRound ?? e.round ?? 1,
      e.challengeDay,
      e.topicDay,
      e.transcript,
      feedbackToJsonb(e.feedback),
      e.durationSec,
      e.wordCount,
    ],
  )
  return jsonResponse({ ok: true }, 200, allHeaders)
}

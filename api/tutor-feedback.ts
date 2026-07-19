// api/tutor-feedback.ts — Nhận báo cáo 👎 chất lượng gia sư AI (Giai đoạn C phần còn lại,
// thay client insert thẳng Supabase trong src/lib/tutorFeedback.ts).
//
// POST /api/tutor-feedback  body { source:'chat'|'speaking', userInput, aiFeedback }
// CHỈ ghi khi người dùng CHỦ ĐỘNG bấm 👎 — dùng bổ sung ca sai vào golden set eval (⑤ T1).

import { z } from 'zod'
import { getPgPool } from './_lib/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security'
import { validateBody, readJsonBody } from './_lib/validation'
import { jsonResponse, getClientIp } from './_lib/http'

const BodySchema = z.object({
  source: z.enum(['chat', 'speaking']),
  userInput: z.string().min(1).max(10_000),
  aiFeedback: z.string().min(1).max(20_000),
})

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp, 10, 'tutor-feedback')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/tutor-feedback' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const parsedBody = await readJsonBody(req)
  if (!parsedBody.ok)
    return jsonResponse({ error: parsedBody.error.message }, parsedBody.error.status, allHeaders)
  const result = validateBody(BodySchema, parsedBody.raw)
  if (!result.ok)
    return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
  const d = result.data

  await getPgPool().query(
    `insert into public.tutor_feedback (user_id, source, user_input, ai_feedback)
     values ($1, $2, $3, $4)`,
    [auth.userId, d.source, d.userInput, d.aiFeedback],
  )
  return jsonResponse({ ok: true }, 200, allHeaders)
}

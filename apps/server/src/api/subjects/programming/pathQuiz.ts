// api/subjects/programming/pathQuiz.ts — Nộp QUIZ SAU CHẶNG của lộ trình mục tiêu (đợt 3/4).
//
// Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md. Chấm HOÀN TOÀN ở server bằng
// đúng ngân hàng câu hỏi (`stageQuizzes.ts`) — client không tự tính điểm để giả mạo kết quả
// đạt/không đạt (không tin client).
//
// POST /api/programming/path-quiz  body: { pathId, stageId, answers: [{questionId, choiceIndex}] }
//      → { correct, total, passed } — đạt ≥ 80% (4/5) thì server tự đánh dấu chặng 'completed'.
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
import { jsonResponse, getClientIp, internalErrorResponse } from '@dhcb/core-http/http'
import { submitStageQuiz } from '@dhcb/subject-programming/pathProgressService'

const BodySchema = z
  .object({
    pathId: z.string().trim().toLowerCase().min(2).max(32),
    stageId: z.string().trim().toLowerCase().min(4).max(40),
    answers: z
      .array(
        z
          .object({
            questionId: z.string().trim().min(1).max(60),
            choiceIndex: z.number().int().min(0).max(3),
          })
          .strict(),
      )
      .max(20),
  })
  .strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'programming-path-quiz'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/programming/path-quiz' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

  const pool = getPgPool()
  try {
    const parsed = await readJsonBody(req)
    if (!parsed.ok)
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
    const validated = validateBody(BodySchema, parsed.raw)
    if (!validated.ok)
      return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

    const { pathId, stageId, answers } = validated.data
    const result = await submitStageQuiz(pool, auth.userId, pathId, stageId, answers)
    if (!result.ok) return jsonResponse({ error: result.error }, 400, headers)
    return jsonResponse(
      { correct: result.correct, total: result.total, passed: result.passed },
      200,
      headers,
    )
  } catch (err: unknown) {
    return internalErrorResponse(err, headers, 'programming-path-quiz')
  }
}

// api/subjects/programming/pathProgress.ts — Tiến độ LỘ TRÌNH MỤC TIÊU môn Lập trình (đợt 2/4).
//
// Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md. Điểm lệch so với đặc tả: đặt tại
// `api/subjects/programming/` (khớp vị trí handler `specialization.ts` đã có trong repo) thay
// vì `api/learning/` như bản nháp đầu của đặc tả — cùng thư mục với mọi handler khác của môn.
//
// GET  /api/programming/path-progress?pathId=principal-ai
//      → { stages: PathStageProgress[] }
// POST /api/programming/path-progress  body:
//      { pathId, stages: [{ stageId, status }] }   → ghi hàng loạt, dừng ở chặng lỗi đầu tiên
//
// Bảng: programming.path_progress (migration 0073). Không tin client: `validateAuth()` lấy
// user_id từ token; service đối chiếu pathId/stageId với dữ liệu giáo trình thật.
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
import {
  getPathProgress,
  setPathStageProgressBulk,
} from '@dhcb/subject-programming/pathProgressService'

const PathIdSchema = z.string().trim().toLowerCase().min(2).max(32)

const BodySchema = z
  .object({
    pathId: PathIdSchema,
    stages: z
      .array(
        z
          .object({
            stageId: z.string().trim().toLowerCase().min(4).max(40),
            status: z.enum(['skipped', 'in_progress', 'completed']),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'programming-path-progress'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/programming/path-progress' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  const pool = getPgPool()
  try {
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const parsedPathId = PathIdSchema.safeParse(url.searchParams.get('pathId') ?? '')
      if (!parsedPathId.success) {
        return jsonResponse({ error: 'Thiếu hoặc sai tham số pathId' }, 400, headers)
      }
      const stages = await getPathProgress(pool, auth.userId, parsedPathId.data)
      return jsonResponse({ stages }, 200, headers)
    }

    if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

    const parsed = await readJsonBody(req)
    if (!parsed.ok)
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
    const validated = validateBody(BodySchema, parsed.raw)
    if (!validated.ok)
      return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

    const { pathId, stages } = validated.data
    const result = await setPathStageProgressBulk(pool, auth.userId, pathId, stages)
    if (!result.ok) return jsonResponse({ error: result.error }, 400, headers)
    return jsonResponse({ ok: true }, 200, headers)
  } catch (err: unknown) {
    return internalErrorResponse(err, headers, 'programming-path-progress')
  }
}

// api/subjects/programming/specialization.ts — Tiến độ HƯỚNG CHUYÊN SÂU môn Lập trình.
//
// Nối tiếp PR #712 (dữ liệu 13 hướng) — việc để ngỏ số 2: lưu tiến độ hướng xuống Postgres.
//
// GET  /api/programming/specialization
//      → { primarySpecId, crossSpecIds, enrollments, stages }
// POST /api/programming/specialization  body là union theo `action`:
//      { action: 'enroll',   specId }            → theo hướng (server tự suy vai trò)
//      { action: 'unenroll', specId }            → bỏ theo hướng (tiến độ chặng giữ nguyên)
//      { action: 'stage',    stageId, status }   → đánh dấu chặng đang học / đã xong
//
// Bảng: programming.spec_enrollment + programming.spec_stage_progress (migration 0071).
// Không tin client: `validateAuth()` lấy user_id từ token, mọi truy vấn của service đều kèm
// user_id đó; id hướng/chặng đối chiếu với dữ liệu giáo trình thật trong service.
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
  getSpecProgress,
  enrollSpecialization,
  unenrollSpecialization,
  setSpecStageProgress,
} from '@dhcb/subject-programming/specProgressService'

// Khuôn dạng THÔ ở đây (chuỗi ngắn, chữ thường); tính hợp lệ THẬT do service đối chiếu với
// getSpecialization()/getSpecStage() — tránh chép danh sách 13 hướng ra hai nơi rồi lệch nhau.
const SpecIdSchema = z.string().trim().toLowerCase().min(2).max(32)

const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('enroll'), specId: SpecIdSchema }).strict(),
  z.object({ action: z.literal('unenroll'), specId: SpecIdSchema }).strict(),
  z
    .object({
      action: z.literal('stage'),
      stageId: z.string().trim().toLowerCase().min(4).max(40),
      status: z.enum(['in_progress', 'completed']),
    })
    .strict(),
])

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'programming-specialization'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/programming/specialization' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  const pool = getPgPool()
  try {
    if (req.method === 'GET') {
      return jsonResponse(await getSpecProgress(pool, auth.userId), 200, headers)
    }

    if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

    const parsed = await readJsonBody(req)
    if (!parsed.ok)
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
    const validated = validateBody(BodySchema, parsed.raw)
    if (!validated.ok)
      return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

    const body = validated.data
    const result =
      body.action === 'enroll'
        ? await enrollSpecialization(pool, auth.userId, body.specId)
        : body.action === 'unenroll'
          ? await unenrollSpecialization(pool, auth.userId, body.specId)
          : await setSpecStageProgress(pool, auth.userId, body.stageId, body.status)

    if (!result.ok) return jsonResponse({ error: result.error }, 400, headers)
    return jsonResponse({ ok: true }, 200, headers)
  } catch (err: unknown) {
    return internalErrorResponse(err, headers, 'programming-specialization')
  }
}

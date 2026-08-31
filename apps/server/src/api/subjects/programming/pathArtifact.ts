// api/subjects/programming/pathArtifact.ts — Kho ARTIFACT CÁ NHÂN của lộ trình mục tiêu (đợt 3/4).
//
// Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md. CRUD giới hạn: create/list/delete
// CỦA CHÍNH NGƯỜI DÙNG (không có update — nộp lại là nộp MỚI, xem `pathArtifactService.ts`).
// KHÔNG chấm bằng AI.
//
// GET    /api/programming/path-artifact?pathId=principal-ai        → { artifacts: PathArtifact[] }
// POST   /api/programming/path-artifact  body: { pathId, phaseId, url, note }
// DELETE /api/programming/path-artifact?id=<uuid>
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
  listPathArtifacts,
  createPathArtifact,
  deletePathArtifact,
} from '@dhcb/subject-programming/pathArtifactService'

const PathIdSchema = z.string().trim().toLowerCase().min(2).max(32)

const CreateSchema = z
  .object({
    pathId: PathIdSchema,
    phaseId: z.string().trim().toLowerCase().min(4).max(40),
    // .url() chỉ kiểm CÚ PHÁP URL; refine thêm để chặn 'javascript:'/'file:' — chỉ nhận http(s).
    url: z
      .string()
      .trim()
      .url()
      .max(500)
      .refine((u) => /^https?:\/\//i.test(u), 'url phải bắt đầu bằng http:// hoặc https://'),
    note: z.string().trim().max(500).default(''),
  })
  .strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'programming-path-artifact'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/programming/path-artifact' })
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
      const artifacts = await listPathArtifacts(pool, auth.userId, parsedPathId.data)
      return jsonResponse({ artifacts }, 200, headers)
    }

    if (req.method === 'POST') {
      const parsed = await readJsonBody(req)
      if (!parsed.ok)
        return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
      const validated = validateBody(CreateSchema, parsed.raw)
      if (!validated.ok)
        return jsonResponse({ error: validated.error.message }, validated.error.status, headers)
      const { pathId, phaseId, url, note } = validated.data
      const result = await createPathArtifact(pool, auth.userId, pathId, phaseId, url, note)
      if (!result.ok) return jsonResponse({ error: result.error }, 400, headers)
      return jsonResponse({ ok: true }, 200, headers)
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const id = z
        .string()
        .uuid()
        .safeParse(url.searchParams.get('id') ?? '')
      if (!id.success) return jsonResponse({ error: 'Thiếu hoặc sai tham số id' }, 400, headers)
      const result = await deletePathArtifact(pool, auth.userId, id.data)
      if (!result.ok) return jsonResponse({ error: result.error }, 404, headers)
      return jsonResponse({ ok: true }, 200, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err: unknown) {
    return internalErrorResponse(err, headers, 'programming-path-artifact')
  }
}

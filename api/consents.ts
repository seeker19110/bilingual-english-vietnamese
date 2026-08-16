// api/consents.ts — Xem/cấp/thu hồi consent của chính mình (V2-04 slice 1).
//
//   GET    /api/consents?scope=&includeHistory=1  → danh sách consent của CHÍNH mình
//   POST   /api/consents                          → cấp consent (cấp lại thì version tăng)
//   DELETE /api/consents?id=<consentId>           → thu hồi (xoá mềm, giữ lịch sử)
//
// NGUYÊN TẮC: `personId` LUÔN suy từ token qua `getOrCreatePerson`, KHÔNG BAO GIỜ nhận từ client —
// không ai cấp/thu hồi quyền hộ người khác. Service còn kèm `person_id` ngay trong câu SQL.

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
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { getOrCreatePerson } from '../packages/core-personal/personService.js'
import {
  grantConsent,
  listConsents,
  revokeConsent,
} from '../packages/core-personal/consentService.js'

const PostSchema = z
  .object({
    // Cùng dạng "resource.action" như contract packages/core-contracts/consentGrant.ts.
    scope: z
      .string()
      .max(200)
      .regex(/^[a-z_]+\.[a-z_]+$/, 'scope phải dạng "resource.action"'),
    purpose: z.string().min(1).max(200),
    expiresAt: z.iso.datetime().optional(),
  })
  .strict()

const UuidParam = z.uuid()

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'consents'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/consents' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()
  const url = new URL(req.url)

  try {
    const person = await getOrCreatePerson(pool, auth.userId)

    if (req.method === 'GET') {
      const scope = url.searchParams.get('scope') ?? undefined
      const includeHistory = url.searchParams.get('includeHistory') === '1'
      const consents = await listConsents(pool, person.id, { scope, includeHistory })
      return jsonResponse({ consents }, 200, allHeaders)
    }

    if (req.method === 'POST') {
      const parsedBody = await readJsonBody(req)
      if (!parsedBody.ok)
        return jsonResponse(
          { error: parsedBody.error.message },
          parsedBody.error.status,
          allHeaders,
        )
      const result = validateBody(PostSchema, parsedBody.raw)
      if (!result.ok)
        return jsonResponse({ error: result.error.message }, result.error.status, allHeaders)
      const d = result.data

      const consent = await grantConsent(pool, {
        personId: person.id,
        scope: d.scope,
        purpose: d.purpose,
        ...(d.expiresAt ? { expiresAt: d.expiresAt } : {}),
      })
      return jsonResponse(consent, 201, allHeaders)
    }

    if (req.method === 'DELETE') {
      const idParam = UuidParam.safeParse(url.searchParams.get('id') ?? '')
      if (!idParam.success)
        return jsonResponse({ error: 'Thiếu hoặc sai tham số id' }, 400, allHeaders)
      await revokeConsent(pool, person.id, idParam.data)
      return jsonResponse({ ok: true }, 200, allHeaders)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  } catch (err) {
    // Lỗi nghiệp vụ đã biết trước (409 đã thu hồi rồi, 404 không thấy) trả đúng status + code.
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, allHeaders)
    throw err
  }
}

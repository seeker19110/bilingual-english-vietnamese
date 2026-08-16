// api/personal-policies.ts — Xem/đặt/thu hồi policy thẩm quyền của chính mình (V2-04 slice 1).
//
//   GET    /api/personal-policies?subject=&includeHistory=1 → policy của CHÍNH mình
//   POST   /api/personal-policies                           → đặt policy (thay bản cũ, append)
//   DELETE /api/personal-policies?id=<policyId>             → thu hồi (xoá mềm, giữ lịch sử)
//
// NGUYÊN TẮC: `personId` LUÔN suy từ token qua `getOrCreatePerson`, không nhận từ client.
//
// Ràng buộc "authority=AUTOMATE bắt buộc có reviewAt" (02-SYSTEM-ARCHITECTURE.md mục 7) được chặn
// NGAY Ở ĐÂY bằng Zod (400) — trước khi chạm DB; DB còn một `check` constraint làm lưới cuối.

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
import { AuthorityLevelSchema } from '../packages/core-contracts/personalPolicy.js'
import { getOrCreatePerson } from '../packages/core-personal/personService.js'
import { setPolicy, listPolicies, revokePolicy } from '../packages/core-personal/policyService.js'

const PostSchema = z
  .object({
    subject: z.string().min(1).max(200),
    action: z.string().min(1).max(200),
    resourceScope: z.string().min(1).max(200),
    authority: AuthorityLevelSchema,
    purpose: z.string().min(1).max(200),
    reviewAt: z.iso.datetime().optional(),
  })
  .strict()
  .refine((d) => d.authority !== 'AUTOMATE' || d.reviewAt !== undefined, {
    error: 'authority=AUTOMATE bắt buộc có reviewAt',
  })

const UuidParam = z.uuid()

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'personal-policies'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/personal-policies' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()
  const url = new URL(req.url)

  try {
    const person = await getOrCreatePerson(pool, auth.userId)

    if (req.method === 'GET') {
      const subject = url.searchParams.get('subject') ?? undefined
      const includeHistory = url.searchParams.get('includeHistory') === '1'
      const policies = await listPolicies(pool, person.id, { subject, includeHistory })
      return jsonResponse({ policies }, 200, allHeaders)
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

      const policy = await setPolicy(pool, {
        personId: person.id,
        subject: d.subject,
        action: d.action,
        resourceScope: d.resourceScope,
        authority: d.authority,
        purpose: d.purpose,
        ...(d.reviewAt ? { reviewAt: d.reviewAt } : {}),
      })
      return jsonResponse(policy, 201, allHeaders)
    }

    if (req.method === 'DELETE') {
      const idParam = UuidParam.safeParse(url.searchParams.get('id') ?? '')
      if (!idParam.success)
        return jsonResponse({ error: 'Thiếu hoặc sai tham số id' }, 400, allHeaders)
      await revokePolicy(pool, person.id, idParam.data)
      return jsonResponse({ ok: true }, 200, allHeaders)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, allHeaders)
    throw err
  }
}

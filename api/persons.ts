// api/persons.ts — Danh tính Personal OS của người đang đăng nhập (V2-03 slice 1).
//
// GET /api/persons  → Person của chính user trong token (tự tạo nếu chưa có).
// KHÔNG có endpoint đọc Person của người khác — `personId` luôn suy ra từ token, không nhận từ
// client (CLAUDE.md mục 4.2).

import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { getOrCreatePerson } from '../packages/core-personal/personService.js'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'persons'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/persons' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const person = await getOrCreatePerson(getPgPool(), auth.userId)
  return jsonResponse(person, 200, allHeaders)
}

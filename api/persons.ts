// api/persons.ts — Danh tính Personal OS của người đang đăng nhập (V2-03 slice 1).
//
// GET /api/persons                   → Person của chính user trong token (tự tạo nếu chưa có).
// GET /api/persons?action=export     → Xuất toàn bộ dữ liệu cá nhân (V2-19 Privacy Drill).
// DELETE /api/persons?action=full_erase → Xoá toàn bộ dữ liệu cascade (V2-19 Privacy Drill).
//
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
import {
  exportPersonData,
  erasePersonData,
} from '../packages/core-personal/personErasureService.js'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)

  // Rate limiting — stricter for export (heavy query)
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  const rateLimitKey = action === 'export' ? `persons-export-${clientIp}` : `persons-${clientIp}`
  const rateLimitMax = action === 'export' ? 2 : 30 // export: 2/min, normal: 30/min

  if (!(await checkRateLimit(clientIp, rateLimitMax, rateLimitKey))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/persons', action })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()

  // ── GET /api/persons ──────────────────────────────────────────────────────
  if (req.method === 'GET' && !action) {
    const person = await getOrCreatePerson(pool, auth.userId)
    return jsonResponse(person, 200, allHeaders)
  }

  // ── GET /api/persons?action=export ────────────────────────────────────────
  if (req.method === 'GET' && action === 'export') {
    const person = await getOrCreatePerson(pool, auth.userId)
    const exportData = await exportPersonData(pool, person.id)
    return jsonResponse(exportData, 200, allHeaders)
  }

  // ── DELETE /api/persons?action=full_erase ─────────────────────────────────
  if (req.method === 'DELETE' && action === 'full_erase') {
    const person = await getOrCreatePerson(pool, auth.userId)
    logSecurityEvent('PERSON_FULL_ERASE_INITIATED', clientIp, { personId: person.id })
    const result = await erasePersonData(pool, person.id, 'self')
    logSecurityEvent('PERSON_FULL_ERASE_COMPLETED', clientIp, {
      personId: person.id,
      schemasCleared: result.schemasCleared.length,
      recordsDeleted: result.recordsDeletedCount,
    })
    return jsonResponse(result, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

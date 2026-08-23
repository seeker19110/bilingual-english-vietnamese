// Backfill/read-view Goal Learning ↔ Life Graph. Không sửa dữ liệu Learning gốc.
import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import {
  backfillCurrentLearningGoal,
  readLearningGoalFromLifeGraph,
} from '@dhcb/core-personal/learningGoalAdapter'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  const ip = getClientIp(req)
  if (!(await checkRateLimit(ip, 10, 'life-goals'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { path: '/api/life-goals' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }
  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  const pool = getPgPool()
  try {
    if (req.method === 'POST') {
      return jsonResponse(await backfillCurrentLearningGoal(pool, auth.userId), 200, headers)
    }
    if (req.method === 'GET') {
      const id = z.uuid().safeParse(new URL(req.url).searchParams.get('nodeId') ?? '')
      if (!id.success) return jsonResponse({ error: 'Thiếu hoặc sai nodeId' }, 400, headers)
      return jsonResponse(
        await readLearningGoalFromLifeGraph(pool, auth.userId, id.data),
        200,
        headers,
      )
    }
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, headers)
    throw err
  }
}

// api/learning-read-model.ts — V2-11 Learning Domain Read Model API.
// Trả về Learning Read Model cho người học đã xác thực mà không lộ cấu trúc lưu trữ nội bộ.
import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { getOrCreatePerson } from '../packages/core-personal/personService.js'
import { getLearningReadModel } from '../packages/core-learner/learningReadModelService.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  }

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'learning-read-model'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/learning-read-model' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  try {
    const pool = getPgPool()
    const person = await getOrCreatePerson(pool, auth.userId)
    const url = new URL(req.url)
    const subject = url.searchParams.get('subject') ?? 'english'

    const readModel = await getLearningReadModel(pool, {
      personId: person.id,
      userId: auth.userId,
      subject,
    })

    return jsonResponse({ readModel }, 200, headers)
  } catch (err: unknown) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}

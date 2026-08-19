// api/echo-shadowing.ts — V3 Real-Time Echo Shadowing Endpoint.
import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { getOrCreatePerson } from '../packages/core-personal/personService.js'
import {
  listShadowingPassages,
  getShadowingPassage,
  evaluateShadowingSession,
} from '../packages/core-ai/echoShadowingService.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { readJsonBody } from './_lib/validation.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'echo_shadowing_api'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/echo-shadowing' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  try {
    const pool = getPgPool()
    const person = await getOrCreatePerson(pool, auth.userId)

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const passageId = url.searchParams.get('passageId')

      if (passageId) {
        const passage = getShadowingPassage(passageId)
        if (!passage) {
          return jsonResponse({ error: 'Không tìm thấy đoạn văn' }, 404, headers)
        }
        return jsonResponse({ passage }, 200, headers)
      }

      const passages = listShadowingPassages()
      return jsonResponse({ passages }, 200, headers)
    }

    if (req.method === 'POST') {
      const bodyResult = await readJsonBody(req)
      if (!bodyResult.ok) {
        return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, headers)
      }

      const body = bodyResult.raw as {
        passageId: string
        measuredLatencyMs?: number
        phonemeAccuracy?: number
      }

      if (!body.passageId) {
        return jsonResponse({ error: 'Thiếu passageId' }, 400, headers)
      }

      const session = evaluateShadowingSession(
        person.id,
        body.passageId,
        body.measuredLatencyMs ?? 420,
        body.phonemeAccuracy ?? 88,
      )

      return jsonResponse({ session }, 200, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return jsonResponse({ error: 'Lỗi xử lý phản xạ Shadowing' }, 500, headers)
  }
}

// api/scenario-holodeck.ts — V3 Scenario Holodeck & Multi-Persona Simulation Endpoint.
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
  listPredefinedScenarios,
  startHolodeckSession,
  getHolodeckSession,
  processHolodeckTurn,
  finalizeHolodeckSession,
} from '../packages/core-personal/scenarioHolodeckService.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { readJsonBody } from './_lib/validation.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'scenario_holodeck_api'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/scenario-holodeck' })
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
      const sessionId = url.searchParams.get('sessionId')

      if (sessionId) {
        const session = getHolodeckSession(sessionId)
        if (!session) {
          return jsonResponse({ error: 'Phiên không tồn tại' }, 404, headers)
        }
        return jsonResponse({ session }, 200, headers)
      }

      const scenarios = listPredefinedScenarios()
      return jsonResponse({ scenarios }, 200, headers)
    }

    if (req.method === 'POST') {
      const bodyResult = await readJsonBody(req)
      if (!bodyResult.ok) {
        return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, headers)
      }
      const body = bodyResult.raw as {
        action: 'start' | 'turn' | 'finalize'
        scenarioId?: string
        sessionId?: string
        utterance?: string
      }

      if (body.action === 'start') {
        if (!body.scenarioId) {
          return jsonResponse({ error: 'Thiếu scenarioId' }, 400, headers)
        }
        const session = startHolodeckSession(person.id, body.scenarioId)
        return jsonResponse({ session }, 201, headers)
      }

      if (body.action === 'turn') {
        if (!body.sessionId || !body.utterance) {
          return jsonResponse({ error: 'Thiếu sessionId hoặc utterance' }, 400, headers)
        }
        const result = processHolodeckTurn(body.sessionId, body.utterance)
        return jsonResponse(result, 200, headers)
      }

      if (body.action === 'finalize') {
        if (!body.sessionId) {
          return jsonResponse({ error: 'Thiếu sessionId' }, 400, headers)
        }
        const session = finalizeHolodeckSession(body.sessionId)
        return jsonResponse({ session }, 200, headers)
      }

      return jsonResponse({ error: 'Action không hợp lệ' }, 400, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return jsonResponse({ error: 'Lỗi xử lý phòng giả lập Scenario Holodeck' }, 500, headers)
  }
}

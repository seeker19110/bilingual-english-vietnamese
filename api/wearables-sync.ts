// api/wearables-sync.ts — V3 Wearables & Circadian Bio-Adaptive MCP Endpoint.
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
  syncWearableBiometrics,
  getLatestBioStream,
  calculateCircadianLearningWindow,
} from '../packages/core-integrations/wearablesIntegrationService.js'
import {
  type WearableSource,
  WearableSourceSchema,
} from '../packages/core-contracts/wearablesIntegration.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { readJsonBody } from './_lib/validation.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'wearables_sync_api'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/wearables-sync' })
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
      const bio = getLatestBioStream(person.id)
      const window = calculateCircadianLearningWindow(person.id)
      return jsonResponse({ bio, window }, 200, headers)
    }

    if (req.method === 'POST') {
      const bodyResult = await readJsonBody(req)
      if (!bodyResult.ok) {
        return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, headers)
      }

      const body = bodyResult.raw as {
        source?: WearableSource
        hrvMs?: number
        restingHeartRateBpm?: number
        sleepQualityScore?: number
        deepSleepMinutes?: number
      }

      const validatedSource = body.source ? WearableSourceSchema.parse(body.source) : 'apple_health'
      const synced = syncWearableBiometrics(
        person.id,
        validatedSource,
        body.hrvMs ?? 70,
        body.restingHeartRateBpm ?? 55,
        body.sleepQualityScore ?? 88,
        body.deepSleepMinutes ?? 100,
      )
      const window = calculateCircadianLearningWindow(person.id)

      return jsonResponse({ bio: synced, window }, 201, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return jsonResponse({ error: 'Lỗi đồng bộ dữ liệu sinh học Wearables' }, 500, headers)
  }
}

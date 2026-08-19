// api/articulatory-phonetics.ts — V3 3D Articulatory Phonetics & Pitch Alignment Endpoint.
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
  getArticulatoryGuide,
  analyzePhoneticsAndPitch,
  ARTICULATORY_GUIDES,
} from '../packages/core-ai/articulatoryPhoneticsService.js'
import {
  type L1PhonemeTarget,
  L1PhonemeTargetSchema,
} from '../packages/core-contracts/articulatoryPhonetics.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { jsonResponse, getClientIp } from './_lib/http.js'
import { readJsonBody } from './_lib/validation.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'articulatory_phonetics_api'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/articulatory-phonetics' })
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
      const phonemeParam = url.searchParams.get('phoneme')

      if (phonemeParam) {
        const validatedPhoneme = L1PhonemeTargetSchema.parse(phonemeParam)
        const guide = getArticulatoryGuide(validatedPhoneme)
        return jsonResponse({ guide }, 200, headers)
      }

      return jsonResponse({ guides: Object.values(ARTICULATORY_GUIDES) }, 200, headers)
    }

    if (req.method === 'POST') {
      const bodyResult = await readJsonBody(req)
      if (!bodyResult.ok) {
        return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, headers)
      }
      const body = bodyResult.raw as {
        targetWord: string
        targetPhoneme: L1PhonemeTarget
        scoreEstimate?: number
      }

      if (!body.targetWord || !body.targetPhoneme) {
        return jsonResponse({ error: 'Thiếu targetWord hoặc targetPhoneme' }, 400, headers)
      }

      const validatedPhoneme = L1PhonemeTargetSchema.parse(body.targetPhoneme)
      const report = analyzePhoneticsAndPitch(
        person.id,
        body.targetWord,
        validatedPhoneme,
        body.scoreEstimate ?? 88,
      )

      return jsonResponse({ report }, 200, headers)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return jsonResponse({ error: 'Lỗi phân tích giải phẫu âm vị học 3D' }, 500, headers)
  }
}

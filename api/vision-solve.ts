// api/vision-solve.ts — V2 Flagship Multimodal Vision STEM Solver API Endpoint.
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { VisionSolveRequestSchema } from '../packages/core-contracts/visionSolver.js'
import { solveProblemWithVision } from '../packages/core-ai/visionSolverService.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'vision_solve'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/vision-solve' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu giải ảnh — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  }

  const bodyParsed = await readJsonBody(req)
  if (!bodyParsed.ok) {
    return jsonResponse(bodyParsed.error, bodyParsed.error.status, headers)
  }

  const validation = validateBody(VisionSolveRequestSchema, bodyParsed.raw)
  if (!validation.ok) {
    return jsonResponse(validation.error, validation.error.status, headers)
  }

  try {
    const result = await solveProblemWithVision(validation.data)
    return jsonResponse(result, 200, headers)
  } catch (err: unknown) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}

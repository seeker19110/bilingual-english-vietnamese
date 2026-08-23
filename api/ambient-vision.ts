// api/ambient-vision.ts — V3 Ambient Vision & Screen Grounding Endpoint.
import { z } from 'zod'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { analyzeAmbientScreenFrame } from '@dhcb/core-ai/ambientVisionService'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import { readJsonBody } from '@dhcb/core-http/validation'

const AmbientVisionRequestSchema = z
  .object({
    imageBase64: z.string().min(10, 'Ảnh không hợp lệ'),
    focusHint: z.string().max(300).optional(),
  })
  .strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 40, 'ambient_vision'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/ambient-vision' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  }

  try {
    const rawBody = await readJsonBody(req)
    const parsed = AmbientVisionRequestSchema.parse(rawBody)

    const insight = await analyzeAmbientScreenFrame(parsed.imageBase64, parsed.focusHint)
    return jsonResponse({ insight }, 200, headers)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return jsonResponse({ error: 'Lỗi phân tích thị giác môi trường' }, 500, headers)
  }
}

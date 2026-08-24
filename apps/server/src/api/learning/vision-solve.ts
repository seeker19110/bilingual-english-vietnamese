// api/vision-solve.ts — V2 Flagship Multimodal Vision STEM Solver API Endpoint.
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { VisionSolveRequestSchema } from '@dhcb/core-contracts/visionSolver'
import { solveProblemWithVision } from '@dhcb/core-ai/visionSolverService'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp, internalErrorResponse } from '@dhcb/core-http/http'
import { checkAndConsumeUsage, refundUsage } from '@dhcb/core-billing/usage'

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

  // Đếm lượt như chế độ 'chat' — endpoint gọi Gemini Vision trả phí, phải chịu hạn mức
  // Free/Pro như mọi đường AI khác (vá lỗ hổng chi phí 2026-08-23, đề xuất N1 mục B3).
  const gate = await checkAndConsumeUsage(auth.userId, 'chat')
  if (!gate.ok) {
    logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/vision-solve' })
    return jsonResponse({ error: gate.message }, 429, headers)
  }

  try {
    const result = await solveProblemWithVision(validation.data)
    return jsonResponse(result, 200, headers)
  } catch (err: unknown) {
    // Provider lỗi → trả lại lượt vừa trừ
    refundUsage(auth.userId, 'chat', gate.day).catch(() => {})
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return internalErrorResponse(err, headers, 'vision-solve')
  }
}

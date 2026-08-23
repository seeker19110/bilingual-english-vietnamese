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
import { checkAndConsumeUsage, refundUsage } from '@dhcb/core-billing/usage'
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

  // Đếm lượt như chế độ 'chat' — endpoint gọi Gemini Vision trả phí, phải chịu hạn mức
  // Free/Pro như mọi đường AI khác (vá lỗ hổng chi phí 2026-08-23, đề xuất N1 mục B3).
  const gate = await checkAndConsumeUsage(auth.userId, 'chat')
  if (!gate.ok) {
    logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/ambient-vision' })
    return jsonResponse({ error: gate.message }, 429, headers)
  }

  try {
    const rawBody = await readJsonBody(req)
    const parsed = AmbientVisionRequestSchema.parse(rawBody)

    const insight = await analyzeAmbientScreenFrame(parsed.imageBase64, parsed.focusHint)
    return jsonResponse({ insight }, 200, headers)
  } catch (err) {
    // Provider lỗi → trả lại lượt vừa trừ
    refundUsage(auth.userId, 'chat', gate.day).catch(() => {})
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    return jsonResponse({ error: 'Lỗi phân tích thị giác môi trường' }, 500, headers)
  }
}

// api/companion.ts — V2-09 Companion Runtime API endpoint.
// POST /api/companion -> executes a complete Companion turn.
import { z } from 'zod'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { getOrCreatePerson } from '@dhcb/core-personal/personService'
import { executeCompanionTurn, streamCompanionTurn } from '@dhcb/core-personal/companionRuntime'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import { checkAndConsumeUsage, refundUsage } from '@dhcb/core-billing/usage'

const CompanionApiRequestSchema = z
  .object({
    message: z.string().min(1).max(2000),
    intent: z.string().max(100).optional(),
    domain: z.string().max(100).optional(),
    tokenBudget: z.number().int().positive().max(8000).optional(),
    stream: z.boolean().optional(),
  })
  .strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'companion'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/companion' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
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
  const validation = validateBody(CompanionApiRequestSchema, bodyParsed.raw)
  if (!validation.ok) {
    return jsonResponse(validation.error, validation.error.status, headers)
  }

  // Đếm lượt như chế độ 'chat' — Companion gọi đúng các model trả phí của /api/agent nên
  // phải chịu cùng hạn mức Free/Pro (lỗ hổng chi phí vá 2026-08-23, xem đề xuất N1 mục B3).
  const gate = await checkAndConsumeUsage(auth.userId, 'chat')
  if (!gate.ok) {
    logSecurityEvent('USAGE_LIMIT', clientIp, { path: '/api/companion' })
    return jsonResponse({ error: gate.message }, 429, headers)
  }

  try {
    const pool = getPgPool()
    const person = await getOrCreatePerson(pool, auth.userId)

    const turnInput = {
      personId: person.id,
      userMessage: validation.data.message,
      intent: validation.data.intent,
      targetDomain: validation.data.domain,
      tokenBudget: validation.data.tokenBudget,
    }

    if (validation.data.stream) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            for await (const event of streamCompanionTurn(pool, turnInput)) {
              const sseChunk = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`
              controller.enqueue(encoder.encode(sseChunk))
            }
            controller.close()
          } catch (streamErr) {
            // Provider lỗi giữa chừng → trả lại lượt vừa trừ (cùng quy ước /api/agent)
            refundUsage(auth.userId, 'chat', gate.day).catch(() => {})
            const errPayload = isAppError(streamErr)
              ? toErrorBody(streamErr)
              : {
                  error: 'Stream error',
                  message: streamErr instanceof Error ? streamErr.message : String(streamErr),
                }
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify(errPayload)}\n\n`),
            )
            controller.close()
          }
        },
      })

      return new Response(stream, {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      })
    }

    const response = await executeCompanionTurn(pool, turnInput)

    return jsonResponse(response, 200, headers)
  } catch (err: unknown) {
    // Lỗi trước khi có phản hồi AI → trả lại lượt (cùng quy ước /api/agent)
    refundUsage(auth.userId, 'chat', gate.day).catch(() => {})
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}

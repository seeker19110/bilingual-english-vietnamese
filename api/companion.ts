// api/companion.ts — V2-09 Companion Runtime API endpoint.
// POST /api/companion -> executes a complete Companion turn.
import { z } from 'zod'
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
  executeCompanionTurn,
  streamCompanionTurn,
} from '../packages/core-personal/companionRuntime.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

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
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}

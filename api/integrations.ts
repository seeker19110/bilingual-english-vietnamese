// api/integrations.ts — V2 Flagship External Integrations API (Google Calendar & Notion).
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { IntegrationSyncRequestSchema } from '../packages/core-contracts/integrations.js'
import { syncToGoogleCalendar } from '../packages/core-integrations/googleCalendar.js'
import { exportToNotion } from '../packages/core-integrations/notion.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { validateBody, readJsonBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'integrations'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/integrations' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401, headers)
  }

  if (req.method === 'GET') {
    return jsonResponse(
      {
        integrations: [
          {
            provider: 'google_calendar',
            name: 'Google Calendar',
            status: 'available',
            icon: 'Calendar',
          },
          { provider: 'notion', name: 'Notion Workspace', status: 'available', icon: 'FileText' },
        ],
      },
      200,
      headers,
    )
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  }

  const bodyParsed = await readJsonBody(req)
  if (!bodyParsed.ok) {
    return jsonResponse(bodyParsed.error, bodyParsed.error.status, headers)
  }

  const validation = validateBody(IntegrationSyncRequestSchema, bodyParsed.raw)
  if (!validation.ok) {
    return jsonResponse(validation.error, validation.error.status, headers)
  }

  try {
    const input = validation.data
    if (input.kind === 'google_calendar_sync') {
      const result = await syncToGoogleCalendar(input.event)
      return jsonResponse(result, 200, headers)
    }

    if (input.kind === 'notion_export') {
      const result = await exportToNotion(input.task)
      return jsonResponse(result, 200, headers)
    }

    return jsonResponse({ error: 'Invalid integration request' }, 400, headers)
  } catch (err: unknown) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}

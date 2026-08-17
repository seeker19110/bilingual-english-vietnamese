// api/subjects.ts — V2-12 Multi-Subject Learning API.
// Exposes supported subject manifests & taxonomy details.
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import {
  getSubjectManifest,
  listSupportedSubjects,
} from '../packages/core-learner/subjectRegistry.js'
import { isAppError, toErrorBody } from '../packages/core-errors/appError.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, headers)
  }

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 60, 'subjects'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/subjects' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const category = url.searchParams.get('category') as 'language' | 'stem' | 'humanities' | null

    if (id) {
      const subject = getSubjectManifest(id)
      return jsonResponse({ subject }, 200, headers)
    }

    const subjects = listSupportedSubjects(category ?? undefined)
    return jsonResponse({ subjects }, 200, headers)
  } catch (err: unknown) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, headers)
    }
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: 'Internal server error', message }, 500, headers)
  }
}

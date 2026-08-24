// api/subjects.ts — V2-12 Multi-Subject Learning API.
// Exposes supported subject manifests & taxonomy details.
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { getSubjectManifest, listSupportedSubjects } from '@dhcb/core-learner/subjectRegistry'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { jsonResponse, getClientIp, internalErrorResponse } from '@dhcb/core-http/http'

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
    return internalErrorResponse(err, headers, 'subjects')
  }
}

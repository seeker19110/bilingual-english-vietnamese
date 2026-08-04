// api/admin-feedback.ts — Lấy danh sách phản hồi 👎 chất lượng gia sư AI cho Admin.
//
// GET /api/admin-feedback?source=chat|speaking

import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  validateAuth,
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { getUserById } from '../packages/core-auth/authService.js'
import { isAdminEmail } from '../packages/core-auth/adminAuth.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

export interface FeedbackRow {
  id: string
  userId: string
  userEmail: string | null
  source: 'chat' | 'speaking'
  userInput: string
  aiFeedback: string
  createdAt: string
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'admin-feedback'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/admin-feedback' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const admin = await getUserById(auth.userId)
  if (!isAdminEmail(admin?.email)) {
    logSecurityEvent('ADMIN_ACCESS_DENIED', clientIp, { path: '/api/admin-feedback' })
    return jsonResponse({ error: 'Chỉ admin mới truy cập được' }, 403, allHeaders)
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  }

  const pool = getPgPool()
  const url = new URL(req.url)
  const sourceFilter = url.searchParams.get('source')?.trim()

  let sql = `
    select
      tf.id,
      tf.user_id as "userId",
      u.email as "userEmail",
      tf.source,
      tf.user_input as "userInput",
      tf.ai_feedback as "aiFeedback",
      tf.created_at as "createdAt"
    from english.tutor_feedback tf
    left join public.users u on u.id = tf.user_id
    where 1=1
  `
  const params: string[] = []

  if (sourceFilter && ['chat', 'speaking'].includes(sourceFilter)) {
    params.push(sourceFilter)
    sql += ` and tf.source = $1`
  }

  sql += ` order by tf.created_at desc limit 100`

  const { rows } = await pool.query<FeedbackRow>(sql, params)
  return jsonResponse({ feedbackList: rows }, 200, allHeaders)
}

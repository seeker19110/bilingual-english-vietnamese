// api/feedback.ts — API Tiếp nhận và tra cứu ý kiến đóng góp của người dùng.
//
// POST /api/feedback  body: CreateFeedbackInput  → Lưu ý kiến đóng góp (kèm context & user nếu đăng nhập)
// GET  /api/feedback                             → Danh sách phản hồi của chính người dùng hiện tại

import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { CreateFeedbackSchema, type UserFeedbackRecord } from '@dhcb/core-contracts/feedback'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 15, 'user-feedback'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/feedback' })
    return jsonResponse(
      { error: 'Quá nhiều yêu cầu — vui lòng thử lại sau 1 phút' },
      429,
      allHeaders,
    )
  }

  const auth = await validateAuth(req)

  if (req.method === 'POST') {
    const bodyResult = await readJsonBody(req)
    if (!bodyResult.ok) {
      return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, allHeaders)
    }

    const parsed = validateBody(CreateFeedbackSchema, bodyResult.raw)
    if (!parsed.ok) {
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)
    }

    const { category, rating, title, message, contactEmail, contextInfo } = parsed.data
    const pool = getPgPool()

    const { rows } = await pool.query<{ id: string }>(
      `insert into public.user_feedback (
         user_id, category, rating, title, message, contact_email, context_info
       ) values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [
        auth?.userId ?? null,
        category,
        rating ?? null,
        title ?? null,
        message,
        contactEmail ?? null,
        JSON.stringify(contextInfo ?? {}),
      ],
    )

    const feedbackId = rows[0]?.id

    return jsonResponse(
      {
        ok: true,
        id: feedbackId,
        message:
          'Cảm ơn bạn đã gửi ý kiến đóng góp! Đội ngũ phát triển sẽ ghi nhận và cải thiện sản phẩm.',
      },
      201,
      allHeaders,
    )
  }

  if (req.method === 'GET') {
    if (!auth) {
      return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)
    }

    const pool = getPgPool()
    const { rows } = await pool.query<UserFeedbackRecord>(
      `select
         id,
         user_id as "userId",
         category,
         rating,
         title,
         message,
         contact_email as "contactEmail",
         context_info as "contextInfo",
         status,
         admin_notes as "adminNotes",
         created_at as "createdAt",
         updated_at as "updatedAt"
       from public.user_feedback
       where user_id = $1
       order by created_at desc
       limit 50`,
      [auth.userId],
    )

    return jsonResponse({ feedbackList: rows }, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

export const config = { runtime: 'edge' }

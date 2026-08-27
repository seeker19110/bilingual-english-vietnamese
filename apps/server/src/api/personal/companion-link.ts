// api/personal/companion-link.ts — "Người thân theo dõi": mã mời, liên kết, gỡ.
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md
//
//   GET    /api/companion-link                 → { watchers, following }  (của CHÍNH mình)
//   GET    /api/companion-link?peek=CODE       → { learner } | { learner: null }
//   POST   /api/companion-link { action:'invite' }              → { code, expiresAt }
//   POST   /api/companion-link { action:'redeem', code, relation } → { learner } | lỗi
//   DELETE /api/companion-link?linkId=ID       → gỡ (người học HOẶC người theo dõi đều gỡ được)
//
// ⚠️ KHÔNG có endpoint nào cho người theo dõi ĐỌC dữ liệu học của người học. Cố ý: báo cáo là
// TUẦN, đẩy qua email. Thêm một route "xem tiến độ ngay" ở đây là biến tính năng đồng hành
// thành công cụ giám sát — đọc mục 3.6 đặc tả trước khi định làm.

import { z } from 'zod'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp } from '@dhcb/core-http/http'
import { isAppError, toErrorBody } from '@dhcb/core-errors/appError'
import { getPgPool } from '@dhcb/core-db/pgPool'
import {
  createInvite,
  peekInvite,
  redeemInvite,
  listWatchers,
  listFollowedLearners,
  removeLink,
} from '@dhcb/core-personal/companionLinkService'

const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('invite') }).strict(),
  z
    .object({
      action: z.literal('redeem'),
      code: z.string().trim().min(8).max(32),
      relation: z.enum(['family', 'teacher', 'friend']).optional(),
    })
    .strict(),
])

const UuidParam = z.uuid()

// Thông điệp lỗi cho từng lý do từ chối — nói rõ chuyện gì xảy ra mà không tiết lộ mã của ai.
const REDEEM_ERRORS: Record<string, { message: string; status: number }> = {
  code_invalid: {
    message: 'Mã không đúng hoặc đã hết hạn (mã chỉ dùng được một lần)',
    status: 400,
  },
  self_link: { message: 'Không thể tự theo dõi chính mình', status: 400 },
  too_many_watchers: {
    message: 'Người học này đã đủ số người theo dõi cho phép',
    status: 409,
  },
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'companion-link'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/companion-link' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()
  const url = new URL(req.url)

  try {
    if (req.method === 'GET') {
      const peek = url.searchParams.get('peek')
      if (peek) {
        return jsonResponse({ learner: await peekInvite(pool, peek) }, 200, allHeaders)
      }
      const [watchers, following] = await Promise.all([
        listWatchers(pool, auth.userId),
        listFollowedLearners(pool, auth.userId),
      ])
      return jsonResponse({ watchers, following }, 200, allHeaders)
    }

    if (req.method === 'POST') {
      const parsedBody = await readJsonBody(req)
      if (!parsedBody.ok) {
        return jsonResponse(
          { error: parsedBody.error.message },
          parsedBody.error.status,
          allHeaders,
        )
      }
      const body = validateBody(BodySchema, parsedBody.raw)
      if (!body.ok)
        return jsonResponse({ error: body.error.message }, body.error.status, allHeaders)

      if (body.data.action === 'invite') {
        return jsonResponse(await createInvite(pool, auth.userId), 200, allHeaders)
      }

      const result = await redeemInvite(
        pool,
        auth.userId,
        body.data.code,
        body.data.relation ?? 'family',
      )
      if (!result.ok) {
        const err = REDEEM_ERRORS[result.reason]!
        return jsonResponse({ error: err.message }, err.status, allHeaders)
      }
      return jsonResponse({ learner: result.learner }, 200, allHeaders)
    }

    if (req.method === 'DELETE') {
      const linkId = UuidParam.safeParse(url.searchParams.get('linkId'))
      if (!linkId.success) return jsonResponse({ error: 'linkId không hợp lệ' }, 400, allHeaders)
      await removeLink(pool, linkId.data, auth.userId)
      return jsonResponse({ ok: true }, 200, allHeaders)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  } catch (err) {
    if (isAppError(err)) {
      return jsonResponse(toErrorBody(err), err.status, allHeaders)
    }
    throw err
  }
}

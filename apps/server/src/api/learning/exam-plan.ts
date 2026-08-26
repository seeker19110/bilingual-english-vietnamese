// api/learning/exam-plan.ts — Kế hoạch ôn thi có hạn chót.
//
// Đặc tả: docs/research/dac-ta-che-do-on-thi-2026-08-26.md
//
//   GET    /api/exam-plan            → { plan } | { plan: null }
//   POST   /api/exam-plan { ... }    → tạo kế hoạch (một kế hoạch đang chạy mỗi người)
//   DELETE /api/exam-plan?planId=ID  → kết thúc kế hoạch
//
// KHÔNG có endpoint "lấy lịch hôm nay": lịch được TÍNH Ở CLIENT bằng hàm thuần
// `packages/core-examplan/examPlan.ts`, từ dữ liệu từ vựng/CEFR và trạng thái SRS vốn nằm ở
// client. Server chỉ giữ ý định của người học.

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
import { vnDateStr } from '@dhcb/core-db/date'
import { CreateExamPlanSchema } from '@dhcb/core-contracts/examPlan'
import { getActivePlan, createPlan, archivePlan } from '@dhcb/core-examplan/examPlanService'
import { z } from 'zod'

const UuidParam = z.uuid()

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'exam-plan'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/exam-plan' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const pool = getPgPool()
  // Ngày "hôm nay" theo giờ VIỆT NAM — dùng ngày UTC ở đây thì trước 7h sáng VN, kế hoạch thi
  // đúng hôm nay sẽ bị coi là đã hết hạn.
  const today = vnDateStr()

  try {
    if (req.method === 'GET') {
      return jsonResponse({ plan: await getActivePlan(pool, auth.userId, today) }, 200, allHeaders)
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
      const body = validateBody(CreateExamPlanSchema, parsedBody.raw)
      if (!body.ok)
        return jsonResponse({ error: body.error.message }, body.error.status, allHeaders)

      const plan = await createPlan(pool, auth.userId, body.data, today)
      return jsonResponse({ plan }, 200, allHeaders)
    }

    if (req.method === 'DELETE') {
      const planId = UuidParam.safeParse(req.url && new URL(req.url).searchParams.get('planId'))
      if (!planId.success) return jsonResponse({ error: 'planId không hợp lệ' }, 400, allHeaders)
      await archivePlan(pool, auth.userId, planId.data)
      return jsonResponse({ ok: true }, 200, allHeaders)
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
  } catch (err) {
    if (isAppError(err)) return jsonResponse(toErrorBody(err), err.status, allHeaders)
    throw err
  }
}

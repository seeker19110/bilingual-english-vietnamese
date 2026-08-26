// api/subjects/programming/ts-check.ts — KIỂM KIỂU TYPESCRIPT cho làn TS của bậc P4 (PR-L16).
//
// POST /api/programming/ts-check   body { code }   → { loi: string[], js: string }
//
// Vì sao việc này ở SERVER chứ không ở trình duyệt như mọi làn khác: trình biên dịch tsc kèm
// bộ lib.d.ts nặng ~7MB — tải về máy học viên chỉ để kiểm kiểu là quá đắt, trong khi ở đây
// nó đã nằm sẵn (typescript là công cụ build của chính dự án). Xem hiến chương
// docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md.
//
// AN TOÀN — điều quan trọng nhất của endpoint này: server CHỈ BIÊN DỊCH, TUYỆT ĐỐI KHÔNG CHẠY
// code học viên. Không eval, không vm, không tiến trình con. JavaScript sinh ra được trả về
// cho trình duyệt và chạy trong Web Worker đã có sẵn — tức vẫn đúng mô hình "code học viên
// chạy trên máy học viên". Rủi ro còn lại chỉ là tốn CPU, nên có auth + rate-limit + giới hạn
// độ dài code.
import { z } from 'zod'
import ts from 'typescript'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from '@dhcb/core-auth/security'
import { validateBody, readJsonBody } from '@dhcb/core-http/validation'
import { jsonResponse, getClientIp, internalErrorResponse } from '@dhcb/core-http/http'
import { kiemTraTypeScript } from '@dhcb/subject-programming/tsPrelude'

/** Bài học dài nhất của làn TS còn xa mới tới ngưỡng này — đủ rộng mà vẫn chặn spam. */
const MAX_TS_CHARS = 8_000

const BodySchema = z.object({ code: z.string().min(1).max(MAX_TS_CHARS) }).strict()

export default async function handler(req: Request): Promise<Response> {
  const headers = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  // 30 lượt/phút: mỗi lượt là một lần chạy tsc (tốn CPU thật), nhưng học viên bấm "Chấm bài"
  // nhiều lần liên tiếp là chuyện bình thường — chặt hơn nữa sẽ cản việc học.
  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'programming-ts-check'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/programming/ts-check' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, headers)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, headers)

  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, headers)

  const parsed = await readJsonBody(req)
  if (!parsed.ok) return jsonResponse({ error: parsed.error.message }, parsed.error.status, headers)
  const validated = validateBody(BodySchema, parsed.raw)
  if (!validated.ok)
    return jsonResponse({ error: validated.error.message }, validated.error.status, headers)

  try {
    const ketQua = kiemTraTypeScript(validated.data.code, ts)
    return jsonResponse(ketQua, 200, headers)
  } catch (err) {
    return internalErrorResponse(err, headers, 'programming-ts-check')
  }
}

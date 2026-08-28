// api/subjects.ts — V2-12 Multi-Subject Learning API.
// Exposes supported subject manifests & taxonomy details.
//
// CÔNG KHAI CÓ CHỦ ĐÍCH — KHÔNG gọi validateAuth. Endpoint chỉ trả manifest/taxonomy của các môn
// học (danh sách môn, tên, bậc, chủ đề) — là DỮ LIỆU CẤU HÌNH của sản phẩm, giống app-settings.ts
// và plan-features.ts, không phải dữ liệu riêng tư của bất kỳ người dùng nào. Trang giới thiệu và
// bộ chọn môn cần đọc nó trước khi người dùng đăng nhập. Chống lạm dụng bằng checkRateLimit theo
// IP. Mọi endpoint ĐỌC/SỬA tiến độ học của một người đều ở file khác và đều bắt validateAuth —
// đừng thêm dữ liệu theo user vào file này (audit 2026-08-28, F3).
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

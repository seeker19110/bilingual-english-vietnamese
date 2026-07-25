// api/admin-settings.ts — Cho ADMIN (xác thực qua ADMIN_EMAILS, xem _lib/adminAuth.ts) đọc/sửa
// hạn mức lượt dùng AI theo gói (free/pro/vip) + mốc khuyến mãi, lưu trong bảng app_settings
// (postgres/migrations/0001_app_settings.sql) — thay vì phải sửa code + deploy lại mỗi lần
// đổi số. Không CHECK constraint DB nào khác bị ảnh hưởng.
//
// GET  /api/admin-settings   (cần Authorization: Bearer, user phải nằm trong ADMIN_EMAILS)
// POST /api/admin-settings   body: { limits: {free:{...},pro:{...},vip:{...}}, promoUntil: string|null }

import { z } from 'zod'
import { getPgPool } from './_lib/pgPool.js'
import {
  validateAuth,
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from './_lib/security.js'
import { getUserById } from './_lib/authService.js'
import { isAdminEmail } from './_lib/adminAuth.js'
import { getAppSettings, invalidateSettingsCache } from './_lib/settings.js'
import { readJsonBody, validateBody } from './_lib/validation.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

const LimitsSchema = z.object({
  chat: z.number().int().min(0).max(1_000_000),
  writing: z.number().int().min(0).max(1_000_000),
  speaking: z.number().int().min(0).max(1_000_000),
  stt: z.number().int().min(0).max(1_000_000),
  pronounce: z.number().int().min(0).max(1_000_000),
})

const UpdateSchema = z.object({
  limits: z.object({ free: LimitsSchema, pro: LimitsSchema, vip: LimitsSchema }),
  // null = tắt khuyến mãi; chuỗi = ISO datetime hợp lệ
  promoUntil: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()), { error: 'promoUntil không hợp lệ' })
    .nullable(),
})

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 20, 'admin-settings'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/admin-settings' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const user = await getUserById(auth.userId)
  if (!isAdminEmail(user?.email)) {
    logSecurityEvent('ADMIN_ACCESS_DENIED', clientIp, { path: '/api/admin-settings' })
    return jsonResponse({ error: 'Chỉ admin mới truy cập được' }, 403, allHeaders)
  }

  if (req.method === 'GET') {
    const settings = await getAppSettings()
    return jsonResponse(settings, 200, allHeaders)
  }

  if (req.method === 'POST') {
    const bodyResult = await readJsonBody(req)
    if (!bodyResult.ok) {
      return jsonResponse({ error: bodyResult.error.message }, bodyResult.error.status, allHeaders)
    }
    const parsed = validateBody(UpdateSchema, bodyResult.raw)
    if (!parsed.ok) {
      return jsonResponse({ error: parsed.error.message }, parsed.error.status, allHeaders)
    }
    const { limits, promoUntil } = parsed.data

    const pool = getPgPool()
    await pool.query(
      `update public.app_settings set
         free_chat_limit = $1, free_writing_limit = $2, free_speaking_limit = $3,
         free_stt_limit = $4, free_pronounce_limit = $5,
         pro_chat_limit = $6, pro_writing_limit = $7, pro_speaking_limit = $8,
         pro_stt_limit = $9, pro_pronounce_limit = $10,
         vip_chat_limit = $11, vip_writing_limit = $12, vip_speaking_limit = $13,
         vip_stt_limit = $14, vip_pronounce_limit = $15,
         promo_until = $16, updated_at = now()
       where id = 1`,
      [
        limits.free.chat,
        limits.free.writing,
        limits.free.speaking,
        limits.free.stt,
        limits.free.pronounce,
        limits.pro.chat,
        limits.pro.writing,
        limits.pro.speaking,
        limits.pro.stt,
        limits.pro.pronounce,
        limits.vip.chat,
        limits.vip.writing,
        limits.vip.speaking,
        limits.vip.stt,
        limits.vip.pronounce,
        promoUntil,
      ],
    )
    invalidateSettingsCache()

    const updated = await getAppSettings()
    return jsonResponse(updated, 200, allHeaders)
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)
}

export const config = { runtime: 'edge' }

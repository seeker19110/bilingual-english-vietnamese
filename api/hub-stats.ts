// api/hub-stats.ts — Số liệu TỔNG HỢP công khai cho trang chủ apps/hub (mục "Hoạt động của dự
// án nói chung", §7.1 docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md). CHỈ trả số đếm
// tổng (không có PII, không cần đăng nhập) — khác api/analytics-summary.ts (yêu cầu admin, chi
// tiết theo kênh). Cache ngắn tại process để không dội DB mỗi lần hub được tải.
//
// GET /api/hub-stats

import { getPgPool } from '../packages/core-db/pgPool.js'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  logSecurityEvent,
} from '../packages/core-auth/security.js'
import { jsonResponse, getClientIp } from './_lib/http.js'

interface HubStats {
  totalUsers: number
  // Tổng lượt học tiếng Anh (chat + viết + nói) — cộng dồn qua mọi thời gian. Môn khác
  // (Toán/Lý/Hoá) sẽ cộng thêm vào đây khi GĐ2/3 có bảng dữ liệu riêng.
  totalEnglishSessions: number
}

let cache: { data: HubStats; expiresAt: number } | null = null
const CACHE_MS = 5 * 60 * 1000 // 5 phút — số liệu tổng hợp không cần tức thời

async function loadStats(): Promise<HubStats> {
  const pool = getPgPool()
  const [{ rows: userRows }, { rows: sessionRows }] = await Promise.all([
    pool.query<{ count: string }>('select count(*)::text as count from public.users'),
    pool.query<{ count: string }>(
      `select
         (select count(*) from english.chat_sessions) +
         (select count(*) from english.writing_submissions) +
         (select count(*) from english.speaking_sessions) as count`,
    ),
  ])
  return {
    totalUsers: Number(userRows[0]?.count ?? 0),
    totalEnglishSessions: Number(sessionRows[0]?.count ?? 0),
  }
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 30, 'hub-stats'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/hub-stats' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const now = Date.now()
  if (!cache || cache.expiresAt < now) {
    cache = { data: await loadStats(), expiresAt: now + CACHE_MS }
  }
  return jsonResponse(cache.data, 200, allHeaders)
}

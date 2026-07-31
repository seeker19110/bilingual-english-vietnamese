// api/admin-usage-stats.ts — Dashboard vận hành cho ADMIN: ai đang dùng gì, tốn bao nhiêu
// tiền, thu về bao nhiêu.
//
// GET /api/admin-usage-stats?days=30  (cần Authorization: Bearer, email nằm trong ADMIN_EMAILS)
//
// Khác gì /api/analytics-summary? File đó đọc bảng `analytics_events` — phễu MARKETING (xem
// landing, bấm CTA, đăng ký). File này đọc dữ liệu VẬN HÀNH THẬT (daily_usage, profiles,
// payments, free_daily_credit) để trả lời 3 câu hỏi tiền bạc:
//   1. Tính năng nào được dùng nhiều/ít → nên đầu tư thêm hay bỏ bớt?
//   2. Chi phí AI ước tính bao nhiêu, ai đang ngốn nhiều nhất → có cần siết hạn mức không?
//   3. Doanh thu Pro/VIP có bù nổi chi phí không → biên lãi/lỗ.
//
// Mọi truy vấn đều là GROUP BY toàn bảng, KHÔNG trả dữ liệu học tập chi tiết của cá nhân.
// Riêng bảng "top người dùng" có email — cần thiết để liên hệ khi phát hiện lạm dụng, và chỉ
// admin đọc được.

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
import { getUnitCostsUsd, getUsdVndRate, estimateCostUsd } from '../packages/core-ai/aiCost.js'
import { FREE_WEEKLY_CAP, FREE_ROLLING_WINDOW_DAYS, type UsageMode } from './_lib/usage.js'
import { vnDateStr, addDays } from '../packages/core-db/date.js'

const DEFAULT_DAYS = 30
const MAX_DAYS = 180
const TOP_USERS_LIMIT = 10

// Biểu thức SQL "gói ĐANG có hiệu lực" — Pro/VIP đã quá hạn thì tính là free. Phải khớp
// logic resolvePlan() ở api/_lib/plan.ts; viết bằng SQL vì gộp theo gói ngay trong DB rẻ
// hơn nhiều so với kéo toàn bộ profiles về Node rồi lọc.
const EFFECTIVE_PLAN_SQL = `case
  when p.plan in ('pro', 'vip') and (p.plan_expires_at is null or p.plan_expires_at > now())
    then p.plan
  else 'free'
end`

// Tổng mọi lượt AI của 1 dòng daily_usage (KHÔNG gồm learn_count — học từ vựng chạy ở
// client, không tốn tiền AI; gộp vào sẽ thổi phồng chi phí ước tính).
const AI_SUM_SQL = 'chat_count + writing_count + speaking_count + stt_count + pronounce_count'
// Bản có tiền tố bảng, dùng ở các truy vấn có JOIN (cột trùng tên sẽ nhập nhằng nếu không).
const AI_SUM_D_SQL =
  'd.chat_count + d.writing_count + d.speaking_count + d.stt_count + d.pronounce_count'

const MODES: UsageMode[] = ['chat', 'writing', 'speaking', 'stt', 'pronounce']

interface UsageDayRow {
  day: string
  chat: number
  writing: number
  speaking: number
  stt: number
  pronounce: number
  learn: number
  active_users: number
}

interface PlanUsageRow {
  plan: string
  users: number
  chat: number
  writing: number
  speaking: number
  stt: number
  pronounce: number
}

interface TopUserRow {
  email: string
  plan: string
  chat: number
  writing: number
  speaking: number
  stt: number
  pronounce: number
  total: number
  active_days: number
}

function toCounts(row: {
  chat: number
  writing: number
  speaking: number
  stt: number
  pronounce: number
}): Record<UsageMode, number> {
  return {
    chat: row.chat,
    writing: row.writing,
    speaking: row.speaking,
    stt: row.stt,
    pronounce: row.pronounce,
  }
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = getClientIp(req)
  if (!(await checkRateLimit(clientIp, 20, 'admin-usage-stats'))) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/admin-usage-stats' })
    return jsonResponse({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  const auth = await validateAuth(req)
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401, allHeaders)

  const user = await getUserById(auth.userId)
  if (!isAdminEmail(user?.email)) {
    logSecurityEvent('ADMIN_ACCESS_DENIED', clientIp, { path: '/api/admin-usage-stats' })
    return jsonResponse({ error: 'Chỉ admin mới truy cập được' }, 403, allHeaders)
  }

  const url = new URL(req.url)
  const rawDays = Number(url.searchParams.get('days'))
  const days =
    Number.isFinite(rawDays) && rawDays > 0 ? Math.min(Math.floor(rawDays), MAX_DAYS) : DEFAULT_DAYS

  const today = vnDateStr()
  // daily_usage.day là TEXT 'YYYY-MM-DD' (xem postgres/schema.sql) → lọc bằng so sánh chuỗi,
  // đúng thứ tự từ điển = đúng thứ tự thời gian với định dạng này.
  const from = addDays(today, -(days - 1))
  const pool = getPgPool()

  try {
    const [
      usersRes,
      planRes,
      dailyRes,
      planUsageRes,
      reachRes,
      activeRes,
      paymentRes,
      paidBreakdownRes,
      revenueDailyRes,
      creditRes,
      topUsersRes,
    ] = await Promise.all([
      // ① Tổng người dùng + số đăng ký mới trong kỳ
      pool.query<{ total: number; new_in_range: number }>(
        `select count(*)::int as total,
                count(*) filter (where created_at >= now() - ($1 || ' days')::interval)::int
                  as new_in_range
         from public.users`,
        [days],
      ),

      // ② Phân bổ theo gói ĐANG hiệu lực
      pool.query<{ plan: string; count: number }>(
        `select ${EFFECTIVE_PLAN_SQL} as plan, count(*)::int as count
         from public.profiles p group by 1`,
      ),

      // ③ Lượt dùng từng tính năng theo ngày (+ số người hoạt động mỗi ngày)
      pool.query<UsageDayRow>(
        `select day,
                sum(chat_count)::int      as chat,
                sum(writing_count)::int   as writing,
                sum(speaking_count)::int  as speaking,
                sum(stt_count)::int       as stt,
                sum(pronounce_count)::int as pronounce,
                sum(learn_count)::int     as learn,
                count(*) filter (where ${AI_SUM_SQL} + learn_count > 0)::int as active_users
         from public.daily_usage
         where day >= $1
         group by day
         order by day asc`,
        [from],
      ),

      // ④ Lượt dùng chia theo gói — biết gói nào ngốn chi phí, để chỉnh giá/hạn mức
      pool.query<PlanUsageRow>(
        `select ${EFFECTIVE_PLAN_SQL} as plan,
                count(distinct d.user_id)::int as users,
                sum(d.chat_count)::int      as chat,
                sum(d.writing_count)::int   as writing,
                sum(d.speaking_count)::int  as speaking,
                sum(d.stt_count)::int       as stt,
                sum(d.pronounce_count)::int as pronounce
         from public.daily_usage d
         left join public.profiles p on p.id = d.user_id
         where d.day >= $1
         group by 1`,
        [from],
      ),

      // ⑤ Độ phủ tính năng: BAO NHIÊU NGƯỜI đã chạm vào từng tính năng (khác tổng lượt —
      // một tính năng có thể có nhiều lượt nhưng chỉ do vài người dùng đi dùng lại).
      pool.query<Record<string, number>>(
        `select count(distinct user_id) filter (where chat_count > 0)::int      as chat,
                count(distinct user_id) filter (where writing_count > 0)::int   as writing,
                count(distinct user_id) filter (where speaking_count > 0)::int  as speaking,
                count(distinct user_id) filter (where stt_count > 0)::int       as stt,
                count(distinct user_id) filter (where pronounce_count > 0)::int as pronounce,
                count(distinct user_id) filter (where learn_count > 0)::int     as learn
         from public.daily_usage where day >= $1`,
        [from],
      ),

      // ⑥ DAU / WAU / MAU + số người quay lại (hoạt động ≥ 2 ngày khác nhau trong kỳ).
      // Các mốc 1/7/30 ngày cố định, KHÔNG phụ thuộc tham số `days` — để so sánh được
      // giữa các lần xem với khoảng thời gian khác nhau.
      pool.query<{ dau: number; wau: number; mau: number; returning: number }>(
        `select
           count(distinct user_id) filter (where day = $1)::int as dau,
           count(distinct user_id) filter (where day >= $2)::int as wau,
           count(distinct user_id) filter (where day >= $3)::int as mau,
           (select count(*)::int from (
              select user_id from public.daily_usage
              where day >= $4 and ${AI_SUM_SQL} + learn_count > 0
              group by user_id having count(*) >= 2
            ) t) as returning
         from public.daily_usage
         where ${AI_SUM_SQL} + learn_count > 0`,
        [today, addDays(today, -6), addDays(today, -29), from],
      ),

      // ⑦ Đơn thanh toán theo trạng thái (đo cả tỉ lệ bỏ giữa chừng)
      pool.query<{ status: string; count: number; vnd: number }>(
        `select status, count(*)::int as count, coalesce(sum(amount_vnd), 0)::int as vnd
         from public.payments
         where created_at >= now() - ($1 || ' days')::interval
         group by status`,
        [days],
      ),

      // ⑧ Doanh thu ĐÃ THU chia theo gói + chu kỳ — biết gói nào bán chạy
      pool.query<{ plan: string; cycle: string; count: number; vnd: number }>(
        `select plan, cycle, count(*)::int as count, coalesce(sum(amount_vnd), 0)::int as vnd
         from public.payments
         where status = 'paid' and paid_at >= now() - ($1 || ' days')::interval
         group by plan, cycle
         order by vnd desc`,
        [days],
      ),

      // ⑨ Doanh thu theo ngày (giờ VN) để nhìn xu hướng
      pool.query<{ day: string; count: number; vnd: number }>(
        `select to_char(paid_at at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as day,
                count(*)::int as count,
                coalesce(sum(amount_vnd), 0)::int as vnd
         from public.payments
         where status = 'paid' and paid_at >= now() - ($1 || ' days')::interval
         group by 1 order by 1 asc`,
        [days],
      ),

      // ⑩ Sức khoẻ kho lượt cửa sổ trượt 7 ngày của gói Free — bao nhiêu người CẠN kho (chạm
      // trần chặn, dấu hiệu hạn mức quá chặt) so với bao nhiêu người ĐẦY kho (dùng không hết).
      // Công thức PHẢI khớp consume_rolling_credit/usage-summary.ts (migration 0017): tổng
      // bonus_earned trừ credits_spent trong FREE_ROLLING_WINDOW_DAYS ngày gần nhất, gộp theo
      // user TRƯỚC rồi mới đếm số người cạn/đầy (không gộp thẳng toàn bảng).
      pool.query<{ users: number; total: number; exhausted: number; capped: number }>(
        `select count(*)::int as users,
                coalesce(sum(available), 0)::int as total,
                count(*) filter (where available <= 0)::int as exhausted,
                count(*) filter (where available >= $3)::int as capped
         from (
           select user_id, sum(bonus_earned) - sum(credits_spent) as available
           from public.free_daily_credit
           where day > $1::date - $2::int and day <= $1::date
           group by user_id
         ) t`,
        [today, FREE_ROLLING_WINDOW_DAYS, FREE_WEEKLY_CAP],
      ),

      // ⑪ Top người dùng theo tổng lượt AI — phát hiện lạm dụng / user cần mời lên gói cao
      pool.query<TopUserRow>(
        `select u.email,
                ${EFFECTIVE_PLAN_SQL} as plan,
                sum(d.chat_count)::int      as chat,
                sum(d.writing_count)::int   as writing,
                sum(d.speaking_count)::int  as speaking,
                sum(d.stt_count)::int       as stt,
                sum(d.pronounce_count)::int as pronounce,
                sum(${AI_SUM_D_SQL})::int as total,
                count(*)::int as active_days
         from public.daily_usage d
         join public.users u on u.id = d.user_id
         left join public.profiles p on p.id = d.user_id
         where d.day >= $1
         group by u.email, ${EFFECTIVE_PLAN_SQL}
         having sum(${AI_SUM_D_SQL}) > 0
         order by total desc
         limit ${TOP_USERS_LIMIT}`,
        [from],
      ),
    ])

    // ── Gộp số liệu, tính chi phí ────────────────────────────────────────────
    const totalUsers = usersRes.rows[0]?.total ?? 0
    const planCounts = { free: 0, pro: 0, vip: 0 }
    for (const row of planRes.rows) {
      if (row.plan === 'pro' || row.plan === 'vip') planCounts[row.plan] = row.count
      else planCounts.free = row.count
    }
    // Người dùng chưa có dòng profiles vẫn là người dùng Free thật — nếu bỏ qua, tổng cộng
    // các gói sẽ không bằng tổng người dùng và bảng nhìn như bị mất dữ liệu.
    const profiledTotal = planCounts.free + planCounts.pro + planCounts.vip
    planCounts.free += Math.max(totalUsers - profiledTotal, 0)

    const usageTotals = { chat: 0, writing: 0, speaking: 0, stt: 0, pronounce: 0, learn: 0 }
    for (const row of dailyRes.rows) {
      for (const key of Object.keys(usageTotals) as (keyof typeof usageTotals)[]) {
        usageTotals[key] += row[key]
      }
    }

    const unitCostsUsd = getUnitCostsUsd()
    const usdVndRate = getUsdVndRate()
    const totalCostUsd = estimateCostUsd(usageTotals)

    // Chi phí quy cho từng tính năng — đây là bảng để quyết định "tính năng nào đáng giữ".
    const costByFeature = MODES.map((mode) => ({
      mode,
      count: usageTotals[mode],
      unitUsd: unitCostsUsd[mode],
      costUsd: usageTotals[mode] * unitCostsUsd[mode],
      users: Number(reachRes.rows[0]?.[mode] ?? 0),
    }))

    const payments = { pending: 0, paid: 0, failed: 0, expired: 0 }
    let revenueVnd = 0
    for (const row of paymentRes.rows) {
      if (row.status in payments) payments[row.status as keyof typeof payments] = row.count
      if (row.status === 'paid') revenueVnd = row.vnd
    }
    const createdOrders = payments.pending + payments.paid + payments.failed + payments.expired

    const planUsage = planUsageRes.rows.map((row) => ({
      plan: row.plan,
      users: row.users,
      counts: toCounts(row),
      costUsd: estimateCostUsd(toCounts(row)),
    }))

    const activeRow = activeRes.rows[0] ?? { dau: 0, wau: 0, mau: 0, returning: 0 }
    const paidUsers = planCounts.pro + planCounts.vip
    const costVnd = totalCostUsd * usdVndRate

    return jsonResponse(
      {
        range: { days, from, to: today },
        users: {
          total: totalUsers,
          newInRange: usersRes.rows[0]?.new_in_range ?? 0,
          byPlan: planCounts,
          paidUsers,
          // Tỉ lệ trả phí — chỉ số quyết định giá/gói quan trọng nhất.
          paidRatio: totalUsers > 0 ? paidUsers / totalUsers : 0,
          dau: activeRow.dau,
          wau: activeRow.wau,
          mau: activeRow.mau,
          returningInRange: activeRow.returning,
        },
        usage: {
          totals: usageTotals,
          daily: dailyRes.rows,
          reach: reachRes.rows[0] ?? {},
          byPlan: planUsage,
        },
        cost: {
          unitCostsUsd,
          usdVndRate,
          totalUsd: totalCostUsd,
          totalVnd: costVnd,
          byFeature: costByFeature,
          // Chi phí bình quân trên MỘT người hoạt động tháng — so trực tiếp với giá gói
          // (Pro 40.000đ/tháng) để biết bán một gói có lãi không.
          perActiveUserVnd: activeRow.mau > 0 ? costVnd / activeRow.mau : 0,
        },
        revenue: {
          vnd: revenueVnd,
          payments,
          createdOrders,
          // Bao nhiêu đơn tạo ra thì thật sự trả tiền — thấp = luồng chuyển khoản đang vướng.
          payRate: createdOrders > 0 ? payments.paid / createdOrders : 0,
          byPlanCycle: paidBreakdownRes.rows,
          daily: revenueDailyRes.rows,
          // Lãi/lỗ thô: doanh thu trừ chi phí AI ước tính (CHƯA trừ VPS, tên miền...).
          marginVnd: revenueVnd - costVnd,
        },
        freeCredit: {
          cap: FREE_WEEKLY_CAP,
          ...(creditRes.rows[0] ?? { users: 0, total: 0, exhausted: 0, capped: 0 }),
        },
        topUsers: topUsersRes.rows,
      },
      200,
      allHeaders,
    )
  } catch (err) {
    // KHÔNG fail-open thành số 0 ở đây: dashboard hiện toàn số 0 trông y hệt "app không ai
    // dùng" và có thể khiến bạn ra quyết định sai. Thà báo lỗi rõ ràng.
    console.error('[admin-usage-stats] lỗi truy vấn:', err)
    return jsonResponse({ error: 'Không đọc được số liệu thống kê' }, 500, allHeaders)
  }
}

export const config = { runtime: 'edge' }

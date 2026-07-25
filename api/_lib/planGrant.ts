// api/_lib/planGrant.ts — Cấp/gia hạn gói Pro/VIP cho 1 user, DÙNG CHUNG cho mọi nguồn cấp:
// thưởng mời bạn (api/referral.ts), cấp tay của admin (api/admin-grant-plan.ts), và sau này là
// thanh toán thật. Tách riêng vì đây là chỗ đụng "tiền thật" — mỗi nơi tự viết lại logic cộng
// ngày là cách chắc chắn nhất để sinh lỗi lệch nhau (cấp trùng, hạ nhầm gói, mất hạn còn lại).
//
// NGUYÊN TẮC BẤT BIẾN của hàm này:
//   1. KHÔNG BAO GIỜ hạ cấp người dùng. Đang VIP mà được thưởng Pro → vẫn giữ VIP.
//   2. KHÔNG BAO GIỜ làm mất thời hạn đang còn. Cộng dồn từ mốc hết hạn hiện tại nếu còn hiệu
//      lực, chỉ tính từ "bây giờ" khi gói cũ đã hết hạn.
//   3. Gói vĩnh viễn (plan pro/vip + plan_expires_at = null) là cao nhất — không đụng vào.

import { getPgPool } from './pgPool.js'
import { resolvePlan, type Plan } from './plan.js'

// Thứ hạng gói để so sánh cao/thấp — free < pro < vip.
const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, vip: 2 }

const MS_DAY = 86_400_000

export interface PlanGrantResult {
  plan: Plan
  planExpiresAt: Date | null
}

/**
 * Tính gói + hạn mới sau khi cộng `days` ngày gói `grantPlan` vào trạng thái hiện tại.
 * Hàm THUẦN (không đụng DB) để test được mọi ca biên — phần ghi DB nằm ở `grantPlanDays()`.
 *
 * @param currentPlanRaw  giá trị cột profiles.plan hiện tại (chuỗi tự do, có thể null)
 * @param currentExpiresAt giá trị cột profiles.plan_expires_at hiện tại
 * @param grantPlan   gói muốn cấp ('pro' | 'vip')
 * @param days        số ngày cấp thêm (> 0)
 * @param now         mốc thời gian tham chiếu (cho test)
 */
export function computePlanGrant(
  currentPlanRaw: string | null | undefined,
  currentExpiresAt: Date | string | null | undefined,
  grantPlan: Exclude<Plan, 'free'>,
  days: number,
  now: Date = new Date(),
): PlanGrantResult {
  // Gói ĐANG CÒN HIỆU LỰC (Pro/VIP hết hạn đã tự coi như free — xem plan.ts).
  const activePlan = resolvePlan(currentPlanRaw, currentExpiresAt, now)

  // Ca 3: đang có gói trả phí VĨNH VIỄN (không hạn) → đã là cao nhất về thời hạn, không đụng.
  // Chỉ nâng gói nếu gói cấp mới cao hơn (vd đang Pro vĩnh viễn, được cấp VIP → thành VIP vĩnh viễn).
  if (activePlan !== 'free' && currentExpiresAt == null) {
    const keepPlan = PLAN_RANK[grantPlan] > PLAN_RANK[activePlan] ? grantPlan : activePlan
    return { plan: keepPlan, planExpiresAt: null }
  }

  // Số ngày âm/0 không hợp lệ — không làm gì (phòng lỗi gọi sai, không tự ý trừ hạn của user).
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 0

  // Mốc bắt đầu cộng: nếu gói cũ CÒN hiệu lực thì nối tiếp từ hạn cũ (không mất phần còn lại),
  // nếu đã hết hạn/chưa có gì thì tính từ bây giờ.
  const currentExpiryMs =
    activePlan !== 'free' && currentExpiresAt != null ? new Date(currentExpiresAt).getTime() : 0
  const base = Math.max(now.getTime(), currentExpiryMs)
  const newExpiry = new Date(base + safeDays * MS_DAY)

  // Ca 1: không bao giờ hạ cấp — giữ gói cao hơn trong 2 gói.
  const finalPlan = PLAN_RANK[grantPlan] >= PLAN_RANK[activePlan] ? grantPlan : activePlan

  return { plan: finalPlan, planExpiresAt: newExpiry }
}

/**
 * Ghi kết quả cấp gói xuống DB (đọc trạng thái hiện tại → tính → ghi).
 * Trả về gói/hạn SAU KHI cấp.
 */
export async function grantPlanDays(
  userId: string,
  grantPlan: Exclude<Plan, 'free'>,
  days: number,
  now: Date = new Date(),
): Promise<PlanGrantResult> {
  const pool = getPgPool()
  const { rows } = await pool.query<{ plan: string | null; plan_expires_at: Date | null }>(
    'select plan, plan_expires_at from public.profiles where id = $1',
    [userId],
  )
  const next = computePlanGrant(rows[0]?.plan, rows[0]?.plan_expires_at, grantPlan, days, now)

  await pool.query(
    `insert into public.profiles (id, plan, plan_expires_at)
     values ($1, $2, $3)
     on conflict (id) do update set plan = excluded.plan, plan_expires_at = excluded.plan_expires_at`,
    [userId, next.plan, next.planExpiresAt],
  )
  return next
}

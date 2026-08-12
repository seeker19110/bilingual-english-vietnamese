// api/_lib/usage.ts — Đếm & giới hạn lượt dùng ở SERVER (nguồn sự thật).
//
// Giai đoạn C: chuyển từ Supabase (RPC consume_usage/refund_usage qua PostgREST) sang
// Postgres tự host (cùng 2 hàm SQL, giờ gọi thẳng qua `pg`) — xem postgres/schema.sql.
// Logic nghiệp vụ (giới hạn theo gói, FAIL-OPEN khi lỗi hạ tầng) giữ nguyên 100%.

import { getPgPool } from '../core-db/pgPool.js'
import { vnDateStr } from '../core-db/date.js'
import { resolvePlan, type Plan } from './plan.js'
import { effectivePlan } from './promo.js'
import { getAppSettings, isSubjectEnforced } from '../core-db/settings.js'

export type UsageMode = 'chat' | 'writing' | 'speaking' | 'stt' | 'pronounce'

// Môn học — mặc định 'english' ở MỌI lời gọi hiện tại (chỉ có 1 môn tồn tại). Khi thêm môn
// mới (GĐ2), lời gọi của môn đó tự truyền subject khác; các lời gọi hiện có KHÔNG cần sửa.
// Xem docs/adr/0001-nen-tang-da-linh-vuc.md mục 8 + postgres/migrations/0029_platform_subject.sql.
// Export để api/usage-summary.ts lọc ĐÚNG cùng subject như hàm SQL enforce (consume_rolling_credit
// lọc `subject = p_subject`) — xem audit 2026-08-12.
export const DEFAULT_SUBJECT = 'english'

// Hạn mức theo gói ĐỌC TỪ DB (bảng app_settings, admin chỉnh qua /api/admin-settings) —
// xem settings.ts để biết giá trị mặc định khi DB chưa có dòng cấu hình. Riêng gói Free
// KHÔNG dùng bảng này nữa để enforce — xem FREE_WEEKLY_* + weekly_ai_credit bên dưới.

// Tên cột tương ứng trong bảng daily_usage (vẫn dùng cho Pro/VIP)
const COLUMN: Record<UsageMode, string> = {
  chat: 'chat_count',
  writing: 'writing_count',
  speaking: 'speaking_count',
  stt: 'stt_count',
  pronounce: 'pronounce_count',
}

// Quyết định 2026-07-26 (đổi cơ chế trượt 2026-07-27): gói Free dùng 1 KHO LƯỢT CHUNG cho
// MỌI tính năng AI, +5 lượt mỗi ngày có học thật. Từ 2026-07-27: cửa sổ TRƯỢT 7 ngày liền kề
// thật (không phải tuần lịch reset thứ Hai như bản cũ 0012) — "còn bao nhiêu lượt hôm nay"
// luôn = tổng bonus 7 ngày gần nhất trừ lượt đã dùng trong chính 7 ngày đó. Xem
// postgres/migrations/0017_free_rolling_credit.sql + api/progress.ts (gọi
// grant_daily_bonus_rolling khi phát hiện học thật trong ngày).
export const FREE_WEEKLY_BONUS_PER_DAY = 5
export const FREE_ROLLING_WINDOW_DAYS = 7
// Trần TỰ NHIÊN của cửa sổ trượt (không có cơ chế dồn bù ngày bỏ lỡ, nên không thể vượt quá
// window × bonus/ngày) — giữ tên cũ FREE_WEEKLY_CAP để không phải sửa lại mọi nơi hiển thị UI
// đã quen gọi "cap", dù bản chất giờ là trần cửa sổ trượt chứ không phải trần theo tuần lịch.
export const FREE_WEEKLY_CAP = FREE_WEEKLY_BONUS_PER_DAY * FREE_ROLLING_WINDOW_DAYS

export function isUsageMode(v: unknown): v is UsageMode {
  return v === 'chat' || v === 'writing' || v === 'speaking' || v === 'stt' || v === 'pronounce'
}

function today(): string {
  return vnDateStr()
}

function limitMessage(plan: Plan): string {
  if (plan === 'pro' || plan === 'vip') {
    return 'Bạn đã dùng hết lượt hôm nay. Thử lại vào ngày mai nhé.'
  }
  return 'Hết lượt rồi. Học thêm từ mới/bài học để có thêm lượt — lượt cũ nhất trong 7 ngày qua sẽ tự nhường chỗ cho lượt mới mỗi ngày!'
}

const CIRCUIT_BREAKER_MESSAGE =
  'Hệ thống AI đang tạm dừng để bảo trì. Vui lòng thử lại sau ít phút.'

// Tra gói hiện tại của user (mặc định 'free' nếu chưa có hồ sơ; Pro/VIP đã hết hạn → coi như free).
// Export cho api/usage-summary.ts (hiển thị UI) dùng lại — tránh trùng logic tra gói.
export async function lookupPlan(userId: string): Promise<Plan> {
  const pool = getPgPool()
  const { rows: profileRows } = await pool.query<{ plan: string; plan_expires_at: Date | null }>(
    'select plan, plan_expires_at from public.profiles where id = $1',
    [userId],
  )
  return effectivePlan(resolvePlan(profileRows[0]?.plan, profileRows[0]?.plan_expires_at))
}

// Tăng 1 vào cột đếm của daily_usage THUẦN ĐỂ THỐNG KÊ, không kiểm hạn mức. Dùng lại đúng
// hàm SQL consume_usage (đã atomic, đã whitelist tên cột) với hạn mức = int4 lớn nhất nên
// nhánh "vượt hạn mức" không bao giờ xảy ra. FAIL-OPEN: hỏng thống kê KHÔNG được phép làm
// hỏng lượt dùng thật của người học.
const NO_LIMIT = 2_147_483_647

async function bumpUsageStat(userId: string, day: string, col: string): Promise<void> {
  try {
    await getPgPool().query('select public.consume_usage($1, $2, $3, $4, $5)', [
      userId,
      day,
      col,
      NO_LIMIT,
      DEFAULT_SUBJECT,
    ])
  } catch (err) {
    console.warn('[usage] ghi thống kê lượt Free lỗi → bỏ qua:', err)
  }
}

// Kiểm tra còn lượt không + tăng 1 (authoritative). FAIL-OPEN khi lỗi hạ tầng.
// `day` trả kèm khi cho qua = NGÀY (giờ VN) mà lượt đã bị trừ vào. Nơi gọi PHẢI truyền lại
// đúng ngày này cho refundUsage() nếu sau đó provider lỗi — xem giải thích ở refundUsage().
export async function checkAndConsumeUsage(
  userId: string,
  mode: UsageMode,
): Promise<{ ok: true; day: string } | { ok: false; message: string }> {
  const day = today()
  try {
    const pool = getPgPool()

    // Cầu dao khẩn cấp (admin bật qua /api/admin-settings khi phát hiện chi phí AI bất
    // thường) — chặn NGAY, trước khi động vào bảng daily_usage, không phân biệt gói/hạn mức.
    // Xem postgres/migrations/0005_ai_circuit_breaker.sql.
    const { aiCircuitBreaker } = await getAppSettings()
    if (aiCircuitBreaker) {
      return { ok: false, message: CIRCUIT_BREAKER_MESSAGE }
    }

    // Phanh tay theo môn (bảng subject_limits, migration 0029): admin tắt enforce cho một môn
    // (vd giai đoạn ra mắt) → KHÔNG chặn theo hạn mức, nhưng VẪN ghi thống kê để còn theo dõi
    // được chi phí. Mặc định mọi môn đều enforce — xem isSubjectEnforced().
    if (!(await isSubjectEnforced(DEFAULT_SUBJECT))) {
      await bumpUsageStat(userId, day, COLUMN[mode])
      return { ok: true, day }
    }

    const plan = await lookupPlan(userId)

    // ── Gói Free: tiêu từ kho lượt CHUNG (mọi mode), cửa sổ trượt 7 ngày liền kề ──
    if (plan === 'free') {
      const { rows } = await pool.query<{ consume_rolling_credit: boolean }>(
        'select public.consume_rolling_credit($1, $2, $3, $4) as consume_rolling_credit',
        [userId, day, FREE_ROLLING_WINDOW_DAYS, DEFAULT_SUBJECT],
      )
      const allowed = rows[0]?.consume_rolling_credit
      if (allowed === false) return { ok: false, message: limitMessage(plan) }
      // Ghi thêm vào daily_usage CHỈ ĐỂ THỐNG KÊ (không dùng để chặn — gói Free đã bị chặn
      // bằng kho lượt cửa sổ trượt ở trên). Không có dòng này, dashboard quản trị sẽ không
      // thấy được người dùng Free — vốn là ĐA SỐ — dùng tính năng nào, tức là không đánh giá
      // được chi phí theo tính năng. Hạn mức truyền vào là vô cực để không bao giờ chặn nhầm.
      await bumpUsageStat(userId, day, COLUMN[mode])
      return { ok: true, day }
    }

    // ── Gói Pro/VIP: 1 hạn mức TỔNG/ngày cho MỌI mode cộng lại (quyết định 2026-07-27) ──
    // Vẫn ghi tăng đúng cột theo mode (giữ breakdown cho thống kê), nhưng ngưỡng chặn là
    // SUM cả 5 cột so với limits.pro/limits.vip — xem consume_usage_total (migration 0016).
    const col = COLUMN[mode]
    const { limits } = await getAppSettings()
    const limit = limits[plan]

    // Kiểm tra + tăng ATOMIC qua hàm SQL (chống race condition 2 request song song)
    const { rows } = await pool.query<{ consume_usage_total: boolean }>(
      'select public.consume_usage_total($1, $2, $3, $4, $5) as consume_usage_total',
      [userId, day, col, limit, DEFAULT_SUBJECT],
    )
    const allowed = rows[0]?.consume_usage_total

    return allowed === false ? { ok: false, message: limitMessage(plan) } : { ok: true, day }
  } catch (err) {
    console.warn('[usage] kiểm tra lượt lỗi → fail-open (cho qua):', err)
    return { ok: true, day }
  }
}

// Hoàn lại 1 lượt đã trừ khi nhà cung cấp AI/STT lỗi (người dùng không nhận được kết quả).
// FAIL-OPEN: lỗi hạ tầng thì bỏ qua êm (không bao giờ làm vỡ luồng trả lỗi cho client).
//
// `day` PHẢI là ngày do chính checkAndConsumeUsage() trả về lúc trừ lượt (audit 2026-08-12).
// Trước đây hàm này tự gọi today() lần nữa: một lượt trừ lúc 23:59 giờ VN mà provider AI lỗi
// và hoàn lúc 00:01 sẽ hoàn vào dòng NGÀY MỚI, nơi credits_spent đang là 0 —
// `greatest(0 - 1, 0) = 0` nên khoản hoàn bốc hơi, người dùng mất trắng 1 lượt. Cả 2 hàm SQL
// refund_rolling_credit/refund_usage đều chỉ sửa đúng dòng của ngày truyền vào.
// Bỏ trống `day` = giữ hành vi cũ (dùng hôm nay) cho nơi gọi không có ngày gốc.
export async function refundUsage(userId: string, mode: UsageMode, day = today()): Promise<void> {
  try {
    const pool = getPgPool()
    const plan = await lookupPlan(userId)

    if (plan === 'free') {
      await pool.query('select public.refund_rolling_credit($1, $2, $3)', [
        userId,
        day,
        DEFAULT_SUBJECT,
      ])
      // Trả lại luôn con số thống kê đã cộng ở checkAndConsumeUsage — nếu không, dashboard
      // sẽ đếm cả những lượt mà người dùng KHÔNG hề nhận được kết quả (provider lỗi), làm
      // chi phí ước tính cao hơn thực tế.
      await pool.query('select public.refund_usage($1, $2, $3, $4)', [
        userId,
        day,
        COLUMN[mode],
        DEFAULT_SUBJECT,
      ])
      return
    }

    const col = COLUMN[mode]
    await pool.query('select public.refund_usage($1, $2, $3, $4)', [
      userId,
      day,
      col,
      DEFAULT_SUBJECT,
    ])
  } catch (err) {
    console.warn('[usage] hoàn lượt lỗi → bỏ qua (fail-open):', err)
  }
}

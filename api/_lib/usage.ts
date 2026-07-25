// api/_lib/usage.ts — Đếm & giới hạn lượt dùng ở SERVER (nguồn sự thật).
//
// Giai đoạn C: chuyển từ Supabase (RPC consume_usage/refund_usage qua PostgREST) sang
// Postgres tự host (cùng 2 hàm SQL, giờ gọi thẳng qua `pg`) — xem postgres/schema.sql.
// Logic nghiệp vụ (giới hạn theo gói, FAIL-OPEN khi lỗi hạ tầng) giữ nguyên 100%.

import { getPgPool } from './pgPool.js'
import { vnDateStr } from './date.js'
import { resolvePlan, type Plan } from './plan.js'
import { effectivePlan } from './promo.js'
import { getAppSettings } from './settings.js'

export type UsageMode = 'chat' | 'writing' | 'speaking' | 'stt' | 'pronounce'

// Hạn mức theo gói ĐỌC TỪ DB (bảng app_settings, admin chỉnh qua /api/admin-settings) —
// xem settings.ts để biết giá trị mặc định khi DB chưa có dòng cấu hình.

// Tên cột tương ứng trong bảng daily_usage
const COLUMN: Record<UsageMode, string> = {
  chat: 'chat_count',
  writing: 'writing_count',
  speaking: 'speaking_count',
  stt: 'stt_count',
  pronounce: 'pronounce_count',
}

export function isUsageMode(v: unknown): v is UsageMode {
  return v === 'chat' || v === 'writing' || v === 'speaking' || v === 'stt' || v === 'pronounce'
}

function today(): string {
  return vnDateStr()
}

function limitMessage(plan: Plan): string {
  return plan === 'pro' || plan === 'vip'
    ? 'Bạn đã dùng hết lượt hôm nay. Thử lại vào ngày mai nhé.'
    : 'Hết lượt miễn phí hôm nay. Thử lại ngày mai hoặc nâng cấp gói Pro.'
}

const CIRCUIT_BREAKER_MESSAGE =
  'Hệ thống AI đang tạm dừng để bảo trì. Vui lòng thử lại sau ít phút.'

// Kiểm tra còn lượt không + tăng 1 (authoritative). FAIL-OPEN khi lỗi hạ tầng.
export async function checkAndConsumeUsage(
  userId: string,
  mode: UsageMode,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const pool = getPgPool()
    const day = today()
    const col = COLUMN[mode]

    // Cầu dao khẩn cấp (admin bật qua /api/admin-settings khi phát hiện chi phí AI bất
    // thường) — chặn NGAY, trước khi động vào bảng daily_usage, không phân biệt gói/hạn mức.
    // Xem postgres/migrations/0005_ai_circuit_breaker.sql.
    const { aiCircuitBreaker } = await getAppSettings()
    if (aiCircuitBreaker) {
      return { ok: false, message: CIRCUIT_BREAKER_MESSAGE }
    }

    // Gói của user (mặc định 'free' nếu chưa có hồ sơ; Pro/VIP đã hết hạn → coi như free)
    const { rows: profileRows } = await pool.query<{ plan: string; plan_expires_at: Date | null }>(
      'select plan, plan_expires_at from public.profiles where id = $1',
      [userId],
    )
    const plan = await effectivePlan(
      resolvePlan(profileRows[0]?.plan, profileRows[0]?.plan_expires_at),
    )
    const { limits } = await getAppSettings()
    const limit = limits[plan][mode]

    // ── Kiểm tra + tăng ATOMIC qua hàm SQL (chống race condition 2 request song song) ──
    const { rows } = await pool.query<{ consume_usage: boolean }>(
      'select public.consume_usage($1, $2, $3, $4) as consume_usage',
      [userId, day, col, limit],
    )
    const allowed = rows[0]?.consume_usage

    return allowed === false ? { ok: false, message: limitMessage(plan) } : { ok: true }
  } catch (err) {
    console.warn('[usage] kiểm tra lượt lỗi → fail-open (cho qua):', err)
    return { ok: true }
  }
}

// Hoàn lại 1 lượt đã trừ khi nhà cung cấp AI/STT lỗi (người dùng không nhận được kết quả).
// FAIL-OPEN: lỗi hạ tầng thì bỏ qua êm (không bao giờ làm vỡ luồng trả lỗi cho client).
export async function refundUsage(userId: string, mode: UsageMode): Promise<void> {
  try {
    const pool = getPgPool()
    const day = today()
    const col = COLUMN[mode]
    await pool.query('select public.refund_usage($1, $2, $3)', [userId, day, col])
  } catch (err) {
    console.warn('[usage] hoàn lượt lỗi → bỏ qua (fail-open):', err)
  }
}

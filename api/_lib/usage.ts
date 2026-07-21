// api/_lib/usage.ts — Đếm & giới hạn lượt dùng ở SERVER (nguồn sự thật).
//
// Giai đoạn C: chuyển từ Supabase (RPC consume_usage/refund_usage qua PostgREST) sang
// Postgres tự host (cùng 2 hàm SQL, giờ gọi thẳng qua `pg`) — xem postgres/schema.sql.
// Logic nghiệp vụ (giới hạn theo gói, FAIL-OPEN khi lỗi hạ tầng) giữ nguyên 100%.

import { getPgPool } from './pgPool'
import { vnDateStr } from './date'
import { normalizePlan, type Plan } from './plan'
import { effectivePlan } from './promo'
import { getAppSettings } from './settings'

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

// Kiểm tra còn lượt không + tăng 1 (authoritative). FAIL-OPEN khi lỗi hạ tầng.
export async function checkAndConsumeUsage(
  userId: string,
  mode: UsageMode,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const pool = getPgPool()
    const day = today()
    const col = COLUMN[mode]

    // Gói của user (mặc định 'free' nếu chưa có hồ sơ)
    const { rows: profileRows } = await pool.query<{ plan: string }>(
      'select plan from public.profiles where id = $1',
      [userId],
    )
    const plan = await effectivePlan(normalizePlan(profileRows[0]?.plan))
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

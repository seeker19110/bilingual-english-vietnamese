// api/_lib/planExpiry.ts — Dọn dữ liệu: đưa `profiles.plan` về 'free' khi Pro/VIP đã hết hạn
// (`plan_expires_at` trong quá khứ). KHÔNG phải nơi chặn quyền thật — usage.ts/authService.ts/
// profile.ts đã tự coi Pro/VIP hết hạn là 'free' NGAY LÚC ĐỌC qua resolvePlan(), bất kể job này
// đã chạy hay chưa. Job này chỉ để cột `plan` trong DB phản ánh đúng thực tế (cho các chỗ đọc
// trực tiếp khác, vd admin xem danh sách user) — chạy 1 lần/ngày là đủ, xem server.ts.
import { getPgPool } from '../../packages/core-db/pgPool.js'

export async function downgradeExpiredPlans(): Promise<{ downgraded: number }> {
  const pool = getPgPool()
  const { rowCount } = await pool.query(
    `update public.profiles
       set plan = 'free', plan_expires_at = null
     where plan in ('plus', 'pro', 'vip')
       and plan_expires_at is not null
       and plan_expires_at < now()`,
  )
  return { downgraded: rowCount ?? 0 }
}

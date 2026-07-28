// api/_lib/trial.ts — Quà dùng thử Pro 14 ngày cho tài khoản MỚI (quyết định 2026-07-27,
// chiến lược tăng trưởng — thay cho việc mở khuyến mãi Pro cho TOÀN BỘ user hiện có, vốn tốn
// chi phí AI không kiểm soát được cho những người vốn đã ở lại mà không cần khuyến mãi).
//
// QUYẾT ĐỊNH (chỉnh lại 2026-07-28): chỉ cấp quà khi email đã được XÁC THỰC — tài khoản
// email/password vừa đăng ký KHÔNG được cấp ngay, phải bấm xác thực mã 6 số trước (chống lạm
// dụng email rác tạo hàng loạt để cày trial). Tài khoản Google COI NHƯ ĐÃ XÁC THỰC (Google tự
// verify email khi đăng nhập) nên được cấp NGAY ở lần đăng nhập đầu tiên — xem lời gọi ở
// api/auth.ts (action 'verify-email' cho email/password, action 'google' khi isNew cho Google).
//
// Luật: mỗi TÀI KHOẢN được nhận đúng MỘT lần, mãi mãi — không phụ thuộc email hiện tại, đổi
// email rồi xác thực lại KHÔNG được nhận thêm.
//
// Cấp gói đi qua grantPlanDays() dùng chung (api/_lib/planGrant.ts) nên tự động thừa hưởng
// mọi nguyên tắc ở đó: không hạ cấp người đang VIP, không làm mất hạn đang còn, không đụng
// gói vĩnh viễn.

import { getPgPool } from './pgPool.js'
import { grantPlanDays } from './planGrant.js'

/** Số ngày Pro tặng cho tài khoản mới đã xác thực. Đổi ở ĐÚNG một chỗ này. */
export const SIGNUP_TRIAL_DAYS = 14

/**
 * Cấp quà Pro nếu tài khoản chưa từng nhận. Trả về `true` nếu LẦN NÀY vừa cấp, `false` nếu đã
 * nhận trước đó (hoặc có lỗi).
 *
 * An toàn khi gọi nhiều lần / gọi song song: việc "giành quyền nhận quà" nằm gọn trong MỘT câu
 * lệnh ghi có điều kiện `signup_trial_granted_at is null`, nên chỉ đúng một request thấy
 * rowCount = 1 và đi tiếp tới bước cấp ngày.
 *
 * KHÔNG throw ra ngoài: lỗi tặng quà tuyệt đối không được làm hỏng luồng xác thực email/đăng
 * nhập Google của người dùng.
 */
export async function grantSignupTrial(userId: string): Promise<boolean> {
  try {
    const pool = getPgPool()

    // Giành quyền nhận quà. `where profiles.signup_trial_granted_at is null` áp cho cả nhánh
    // UPDATE của on-conflict → hàng đã có dấu thì không cập nhật, rowCount = 0.
    const { rowCount } = await pool.query(
      `insert into public.profiles (id, signup_trial_granted_at)
       values ($1, now())
       on conflict (id) do update set signup_trial_granted_at = now()
       where profiles.signup_trial_granted_at is null`,
      [userId],
    )
    if (!rowCount) return false

    await grantPlanDays(userId, 'pro', SIGNUP_TRIAL_DAYS)
    return true
  } catch (err) {
    console.error('[trial] Lỗi khi cấp quà dùng thử:', err)
    return false
  }
}

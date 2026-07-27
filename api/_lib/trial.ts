// api/_lib/trial.ts — Quà dùng thử Pro khi xác thực email xong (quyết định 2026-07-27).
//
// Luật: mỗi TÀI KHOẢN được nhận đúng MỘT lần, mãi mãi. Không phụ thuộc email hiện tại —
// đổi email rồi xác thực lại KHÔNG được nhận thêm (xem chú thích migration 0013).
//
// Cấp gói đi qua grantPlanDays() dùng chung (api/_lib/planGrant.ts) nên tự động thừa hưởng
// mọi nguyên tắc ở đó: không hạ cấp người đang VIP, không làm mất hạn đang còn, không đụng
// gói vĩnh viễn.

import { getPgPool } from './pgPool.js'
import { grantPlanDays } from './planGrant.js'

/** Số ngày Pro tặng khi xác thực email. Đổi ở ĐÚNG một chỗ này. */
export const EMAIL_VERIFY_TRIAL_DAYS = 5

/**
 * Cấp quà dùng thử nếu tài khoản chưa từng nhận. Trả về `true` nếu LẦN NÀY vừa cấp,
 * `false` nếu đã nhận trước đó (hoặc có lỗi).
 *
 * An toàn khi gọi nhiều lần / gọi song song: việc "giành quyền nhận quà" nằm gọn trong MỘT
 * câu lệnh ghi có điều kiện `trial_granted_at is null`, nên chỉ đúng một request thấy
 * rowCount = 1 và đi tiếp tới bước cấp ngày.
 *
 * KHÔNG throw ra ngoài: đây là tác dụng phụ của luồng xác thực email — lỗi tặng quà tuyệt đối
 * không được làm hỏng việc xác thực email của người dùng.
 */
export async function grantEmailVerifyTrial(userId: string): Promise<boolean> {
  try {
    const pool = getPgPool()

    // Giành quyền nhận quà. `where profiles.trial_granted_at is null` áp cho cả nhánh UPDATE
    // của on-conflict → hàng đã có dấu thì không cập nhật, rowCount = 0.
    const { rowCount } = await pool.query(
      `insert into public.profiles (id, trial_granted_at)
       values ($1, now())
       on conflict (id) do update set trial_granted_at = now()
       where profiles.trial_granted_at is null`,
      [userId],
    )
    if (!rowCount) return false

    await grantPlanDays(userId, 'pro', EMAIL_VERIFY_TRIAL_DAYS)
    return true
  } catch (err) {
    // Nuốt lỗi có chủ đích — xem chú thích ở đầu hàm.
    console.error('[trial] Lỗi khi cấp quà dùng thử:', err)
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Quà dùng thử Pro NGAY LÚC ĐĂNG KÝ tài khoản mới (quyết định 2026-07-27, chiến lược tăng
// trưởng — thay cho việc mở khuyến mãi Pro cho TOÀN BỘ user hiện có, vốn tốn chi phí AI
// không kiểm soát được cho những người vốn đã ở lại mà không cần khuyến mãi).
//
// TÁCH RIÊNG cột (`signup_trial_granted_at`) khỏi quà xác thực email ở trên
// (`trial_granted_at`) — hai quà phục vụ 2 mục đích khác nhau nên CỘNG DỒN được:
//   - Quà đăng ký: giảm ma sát ngay từ đầu, chỉ cấp cho tài khoản VỪA TẠO (không cấp khi
//     user cũ đăng nhập lại — xem lời gọi ở api/auth.ts action 'register'/'google').
//   - Quà xác thực email: khuyến khích xác thực (tốt cho chống gian lận mời bạn + khôi phục
//     tài khoản), không đổi hành vi cũ.
export const SIGNUP_TRIAL_DAYS = 14

/**
 * Cấp quà Pro cho tài khoản MỚI TẠO. CHỈ gọi ngay sau khi tạo user thành công (register,
 * hoặc Google đăng nhập lần đầu) — KHÔNG gọi cho user cũ đăng nhập lại, để giới hạn đúng
 * phạm vi "tài khoản mới" (bảo vệ chi phí AI, xem api/_lib/aiCost.ts).
 *
 * Idempotent + an toàn gọi song song (cùng cơ chế giành quyền 1 lần như trên). KHÔNG throw:
 * lỗi tặng quà không được phép làm hỏng luồng đăng ký.
 */
export async function grantSignupTrial(userId: string): Promise<boolean> {
  try {
    const pool = getPgPool()

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
    console.error('[trial] Lỗi khi cấp quà đăng ký tài khoản mới:', err)
    return false
  }
}

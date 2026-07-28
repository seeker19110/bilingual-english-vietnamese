// api/_lib/quests.ts — Nhiệm vụ (quest) cho user, thưởng thêm hạn mức/gói khi hoàn thành.
// Hạ tầng generic (bảng quest_claims + hàm claim_quest_if_ready, migration 0021) — mở thêm
// nhiệm vụ mới chỉ cần thêm 1 hằng số + 1 hàm claim ở file này, không cần migration mới.
//
// NHIỆM VỤ ĐẦU TIÊN: "Chia sẻ công khai" — quyết định 2026-07-28, thưởng +1 ngày gói Pro,
// hồi (cooldown) sau 7 ngày để khớp cửa sổ trượt của gói Free và chặn lạm dụng hàng loạt.
//
// CẢNH BÁO (đã ghi trong migration 0021, nhắc lại ở đây vì đây là chỗ code thật): Web Share
// API phía client KHÔNG cho server biết người dùng có thật sự đăng công khai hay không — chỉ
// biết họ đã mở hộp thoại chia sẻ và không huỷ (xem src/components/ShareResultCard.tsx). Rate
// limit 1 lần/7 ngày là lớp phòng thủ DUY NHẤT hiện có. Nếu phát hiện lạm dụng, cân nhắc thêm
// device_hash (giống referral, migration 0008) hoặc đổi thưởng sang phi tiền tệ (badge...).

import { getPgPool } from './pgPool.js'
import { grantPlanDays } from './planGrant.js'

export const SHARE_QUEST_KEY = 'share_public'
export const SHARE_QUEST_REWARD_DAYS = 1
export const SHARE_QUEST_COOLDOWN_DAYS = 7

export type ClaimQuestResult = { ok: true; rewardDays: number } | { ok: false; message: string }

// Nhận thưởng nhiệm vụ "chia sẻ công khai" nếu chưa nhận trong 7 ngày gần nhất.
// KHÔNG throw ra ngoài — lỗi hạ tầng trả về { ok: false } với thông điệp chung, không làm vỡ
// luồng chia sẻ phía client (ảnh/link vẫn đã được chia sẻ xong trước khi gọi hàm này).
export async function claimShareQuest(userId: string): Promise<ClaimQuestResult> {
  try {
    const pool = getPgPool()
    const { rows } = await pool.query<{ claim_quest_if_ready: boolean }>(
      'select public.claim_quest_if_ready($1, $2, $3) as claim_quest_if_ready',
      [userId, SHARE_QUEST_KEY, SHARE_QUEST_COOLDOWN_DAYS],
    )
    if (!rows[0]?.claim_quest_if_ready) {
      return {
        ok: false,
        message: `Bạn đã nhận thưởng chia sẻ rồi — quay lại sau ${SHARE_QUEST_COOLDOWN_DAYS} ngày kể từ lần trước nhé.`,
      }
    }
    await grantPlanDays(userId, 'pro', SHARE_QUEST_REWARD_DAYS)
    return { ok: true, rewardDays: SHARE_QUEST_REWARD_DAYS }
  } catch (err) {
    console.error('[quests] claimShareQuest lỗi:', err)
    return { ok: false, message: 'Có lỗi xảy ra, thử lại sau nhé.' }
  }
}

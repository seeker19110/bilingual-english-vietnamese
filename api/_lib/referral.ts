// api/_lib/referral.ts — Logic mời bạn dùng chung: sinh mã, ghi nhận lời mời, và TRAO THƯỞNG
// khi người được mời hoàn thành phiên học thật (gọi từ api/history.ts).
//
// Vì sao tách khỏi api/referral.ts: điểm trao thưởng nằm ở luồng lưu lịch sử học
// (api/history.ts), không phải ở endpoint referral — 2 nơi cùng dùng nên logic phải ở 1 chỗ.

import { getPgPool } from './pgPool.js'
import { grantPlanDays } from './planGrant.js'
import { logSecurityEvent } from './security.js'

// Số ngày Pro thưởng cho MỖI BÊN khi 1 lượt mời thành công.
export const REFERRAL_REWARD_DAYS = 7

// Trần số lượt mời ĐƯỢC THƯỞNG trên mỗi tài khoản — chống cày tài khoản ảo hàng loạt.
// Vượt trần: người được mời VẪN dùng app bình thường, chỉ là người mời không được thưởng thêm.
export const MAX_REWARDED_REFERRALS = 10

// Bộ ký tự sinh mã: bỏ 0/O/1/I/L để người dùng đọc/gõ lại không nhầm.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6
const MAX_CODE_ATTEMPTS = 8

function randomCode(): string {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return out
}

/**
 * Lấy mã mời của user, sinh mới nếu chưa có (sinh lười). Retry khi đụng unique constraint.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const pool = getPgPool()

  const { rows } = await pool.query<{ referral_code: string | null }>(
    'select referral_code from public.profiles where id = $1',
    [userId],
  )
  const existing = rows[0]?.referral_code
  if (existing) return existing

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = randomCode()
    try {
      // Chỉ ghi khi CHƯA có mã (where referral_code is null) — tránh 2 request song song của
      // cùng 1 user ghi đè lẫn nhau thành 2 mã khác nhau.
      const { rows: updated } = await pool.query<{ referral_code: string }>(
        `insert into public.profiles (id, referral_code) values ($1, $2)
         on conflict (id) do update set referral_code = excluded.referral_code
         where public.profiles.referral_code is null
         returning referral_code`,
        [userId, code],
      )
      if (updated[0]?.referral_code) return updated[0].referral_code

      // Không trả về dòng nào = user đã có mã (do request song song vừa ghi) → đọc lại.
      const { rows: reread } = await pool.query<{ referral_code: string | null }>(
        'select referral_code from public.profiles where id = $1',
        [userId],
      )
      if (reread[0]?.referral_code) return reread[0].referral_code
    } catch (err) {
      // 23505 = unique_violation: mã trùng người khác → thử mã khác.
      if ((err as { code?: string }).code !== '23505') throw err
    }
  }

  throw new Error('Không sinh được mã mời sau nhiều lần thử')
}

export type ClaimResult =
  { ok: true } | { ok: false; reason: 'code_not_found' | 'self_invite' | 'already_referred' }

/**
 * Ghi nhận "user này được mời bởi mã X" — CHƯA thưởng (chờ họ học phiên đầu tiên).
 * Gọi ngay sau khi đăng ký thành công.
 */
export async function claimReferral(
  refereeId: string,
  rawCode: string,
  deviceHash: string | null = null,
): Promise<ClaimResult> {
  const pool = getPgPool()
  const code = rawCode.trim().toUpperCase()

  const { rows } = await pool.query<{ id: string }>(
    'select id from public.profiles where referral_code = $1',
    [code],
  )
  const referrerId = rows[0]?.id
  if (!referrerId) return { ok: false, reason: 'code_not_found' }
  if (referrerId === refereeId) return { ok: false, reason: 'self_invite' }

  try {
    const { rowCount } = await pool.query(
      `insert into public.referrals (referrer_id, referee_id, device_hash) values ($1, $2, $3)
       on conflict (referee_id) do nothing`,
      [referrerId, refereeId, deviceHash],
    )
    // rowCount = 0 → đã có người mời trước đó, không ghi đè (1 người chỉ được mời 1 lần).
    if (rowCount === 0) return { ok: false, reason: 'already_referred' }
    return { ok: true }
  } catch (err) {
    // 23514 = check_violation (referrals_no_self_invite) — hàng rào cuối ở tầng DB.
    if ((err as { code?: string }).code === '23514') return { ok: false, reason: 'self_invite' }
    throw err
  }
}

/**
 * Trao thưởng cho lượt mời của `refereeId` nếu đủ điều kiện. Gọi khi người này vừa HOÀN THÀNH
 * 1 phiên học thật (api/history.ts). An toàn khi gọi nhiều lần — chỉ thưởng đúng 1 lần.
 *
 * Không throw ra ngoài: đây là tác dụng phụ của luồng lưu lịch sử học, lỗi thưởng KHÔNG được
 * làm hỏng việc lưu bài học của người dùng.
 */
export async function rewardReferralIfEligible(refereeId: string): Promise<void> {
  try {
    const pool = getPgPool()

    // Đánh dấu đã thưởng TRƯỚC KHI cấp gói, và chỉ khi đang còn chưa thưởng (rewarded_at is
    // null). Đây là chốt chống trao thưởng 2 lần khi 2 request song song cùng lúc hoàn thành
    // phiên học: chỉ đúng 1 request nhận được rowCount = 1.
    const { rows } = await pool.query<{ referrer_id: string; device_hash: string | null }>(
      `update public.referrals set rewarded_at = now()
       where referee_id = $1 and rewarded_at is null
       returning referrer_id, device_hash`,
      [refereeId],
    )
    const referrerId = rows[0]?.referrer_id
    if (!referrerId) return // Không có lời mời, hoặc đã thưởng rồi.
    const deviceHash = rows[0]?.device_hash ?? null

    // Chống cày thưởng trên CÙNG MỘT MÁY: nếu thiết bị này đã từng được thưởng cho một lượt
    // mời khác thì không thưởng nữa. Xem giới hạn của mã thiết bị ở src/lib/deviceId.ts —
    // đây là hàng rào chi phí, không phải bảo mật tuyệt đối.
    let deviceAlreadyRewarded = false
    if (deviceHash) {
      const { rows: deviceRows } = await pool.query<{ count: string }>(
        `select count(*) as count from public.referrals
         where device_hash = $1 and rewarded_at is not null and referee_id <> $2`,
        [deviceHash, refereeId],
      )
      deviceAlreadyRewarded = Number(deviceRows[0]?.count ?? 0) > 0
    }

    if (deviceAlreadyRewarded) {
      // KHÔNG khoá tài khoản, KHÔNG chặn học — chỉ không trao thưởng lượt này. Máy dùng chung
      // (gia đình, phòng máy trường, quán net) rất phổ biến với học sinh nên phải xử nhẹ tay.
      logSecurityEvent('REFERRAL_DEVICE_REUSED', 'system', { referrerId, refereeId })
      return
    }

    // Trần chống lạm dụng: đếm số lượt ĐÃ thưởng của người mời (kể cả lượt vừa đánh dấu).
    const { rows: countRows } = await pool.query<{ count: string }>(
      'select count(*) as count from public.referrals where referrer_id = $1 and rewarded_at is not null',
      [referrerId],
    )
    const rewardedCount = Number(countRows[0]?.count ?? 0)

    // Người ĐƯỢC MỜI luôn được thưởng (họ không kiểm soát được việc người mời đã mời bao nhiêu).
    await grantPlanDays(refereeId, 'pro', REFERRAL_REWARD_DAYS)

    if (rewardedCount <= MAX_REWARDED_REFERRALS) {
      await grantPlanDays(referrerId, 'pro', REFERRAL_REWARD_DAYS)
    } else {
      logSecurityEvent('REFERRAL_CAP_REACHED', 'system', { referrerId, rewardedCount })
    }
  } catch (err) {
    // Nuốt lỗi có chủ đích — xem chú thích ở đầu hàm.
    console.error('[referral] Lỗi khi trao thưởng:', err)
  }
}

export interface ReferralStats {
  code: string
  rewardedCount: number
  pendingCount: number
  maxRewarded: number
  rewardDays: number
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const pool = getPgPool()
  const code = await ensureReferralCode(userId)

  const { rows } = await pool.query<{ rewarded: string; pending: string }>(
    `select
       count(*) filter (where rewarded_at is not null) as rewarded,
       count(*) filter (where rewarded_at is null)     as pending
     from public.referrals where referrer_id = $1`,
    [userId],
  )

  return {
    code,
    rewardedCount: Number(rows[0]?.rewarded ?? 0),
    pendingCount: Number(rows[0]?.pending ?? 0),
    maxRewarded: MAX_REWARDED_REFERRALS,
    rewardDays: REFERRAL_REWARD_DAYS,
  }
}

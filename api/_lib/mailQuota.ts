// api/_lib/mailQuota.ts — Trần số mail/ngày + tự chuyển sang kênh dự phòng khi hết hạn mức.
//
// VẤN ĐỀ GIẢI QUYẾT: gói miễn phí của nhà cung cấp mail có hạn mức ngày (Brevo 300/ngày). Nếu
// một đợt đăng ký hàng loạt (chiến dịch viral, hoặc bị lạm dụng) đốt sạch hạn mức, nhà cung cấp
// có thể KHOÁ TÀI KHOẢN GỬI — hậu quả nặng hơn nhiều so với việc không gửi được vài thư, vì
// người dùng thật cũng mất luôn đường nhận mã.
//
// CÁCH XỬ LÝ: chạm trần kênh chính thì KHÔNG dừng gửi mà chuyển sang kênh dự phòng trả tiền
// theo lượng (Amazon SES ~$0,10/1.000 thư). Người dùng vẫn nhận được mã, chi phí phát sinh
// không đáng kể. Chỉ khi CẢ HAI kênh đều không dùng được mới thực sự ngừng.
//
// Thứ tự ưu tiên khi gửi 1 thư:
//   1. Kênh chính, nếu chưa chạm trần ngày.
//   2. Kênh dự phòng, nếu kênh chính chạm trần / lỗi tạm thời / chưa cấu hình.
//   3. Không gửi được → trả trạng thái để nơi gọi báo đúng cho người dùng.

import { getPgPool } from './pgPool.js'
import { vnDateStr } from './date.js'
import { sendMail, isMailerConfigured, type MailResult, type MailChannel } from './mailer.js'

// Trần mặc định cho kênh chính, để dưới hạn mức thật một khoảng an toàn (Brevo free 300/ngày →
// 280 chừa chỗ cho thư gửi tay/thử nghiệm). Chỉnh qua biến môi trường khi đổi nhà cung cấp.
const DEFAULT_PRIMARY_DAILY_LIMIT = 280

export function primaryDailyLimit(): number {
  const raw = Number(process.env.SMTP_DAILY_LIMIT)
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_PRIMARY_DAILY_LIMIT
}

export interface DailyCounts {
  day: string
  primarySent: number
  fallbackSent: number
}

export async function getDailyCounts(now: Date = new Date()): Promise<DailyCounts> {
  const day = vnDateStr(now)
  try {
    const pool = getPgPool()
    const { rows } = await pool.query<{ primary_sent: number; fallback_sent: number }>(
      'select primary_sent, fallback_sent from public.email_daily_usage where day = $1',
      [day],
    )
    return {
      day,
      primarySent: Number(rows[0]?.primary_sent ?? 0),
      fallbackSent: Number(rows[0]?.fallback_sent ?? 0),
    }
  } catch {
    // Lỗi DB → coi như chưa gửi thư nào. FAIL-OPEN giống các chỗ khác trong dự án: thà gửi thừa
    // vài thư còn hơn chặn nhầm người dùng thật vì hạ tầng trục trặc.
    return { day, primarySent: 0, fallbackSent: 0 }
  }
}

// Tăng bộ đếm của kênh vừa gửi. Không throw — lỗi đếm không được làm hỏng việc gửi mail.
async function incrementCount(channel: MailChannel, now: Date): Promise<void> {
  const column = channel === 'fallback' ? 'fallback_sent' : 'primary_sent'
  try {
    const pool = getPgPool()
    await pool.query(
      `insert into public.email_daily_usage (day, ${column}) values ($1, 1)
       on conflict (day) do update set ${column} = public.email_daily_usage.${column} + 1`,
      [vnDateStr(now)],
    )
  } catch (err) {
    console.error('[mailQuota] Không cập nhật được bộ đếm mail:', (err as Error).message)
  }
}

export interface QuotaMailResult extends MailResult {
  // Kênh đã thực sự gửi (null nếu không gửi được qua kênh nào).
  channel: MailChannel | null
  // true khi kênh chính chạm trần và đã chuyển sang dự phòng — dùng để cảnh báo trong log.
  switchedToFallback: boolean
}

/**
 * Gửi mail có kiểm soát hạn mức ngày, tự chuyển kênh dự phòng khi cần.
 * KHÔNG throw.
 */
export async function sendMailWithQuota(
  opts: { to: string; subject: string; text: string; html?: string },
  now: Date = new Date(),
): Promise<QuotaMailResult> {
  const counts = await getDailyCounts(now)
  const overPrimaryLimit = counts.primarySent >= primaryDailyLimit()
  const hasFallback = isMailerConfigured('fallback')

  // ── 1. Kênh chính, nếu còn hạn mức ──────────────────────────────────────
  if (!overPrimaryLimit) {
    const result = await sendMail(opts, 'primary')
    if (result.status === 'sent') {
      await incrementCount('primary', now)
      return { ...result, channel: 'primary', switchedToFallback: false }
    }
    // 'rejected' = địa chỉ người nhận sai — đổi kênh cũng vô ích, trả về luôn để UI báo đúng.
    if (result.status === 'rejected') {
      await incrementCount('primary', now)
      return { ...result, channel: 'primary', switchedToFallback: false }
    }
    // Còn lại là lỗi phía nhà cung cấp/chưa cấu hình → thử kênh dự phòng bên dưới.
    if (!hasFallback) return { ...result, channel: null, switchedToFallback: false }
  } else if (!hasFallback) {
    // Chạm trần mà KHÔNG có kênh dự phòng → đành ngừng gửi. Đây là tình huống cần cấu hình
    // SMTP_FALLBACK_* (Amazon SES) để không bao giờ rơi vào.
    console.error(
      `[mailQuota] Chạm trần ${primaryDailyLimit()} thư/ngày và CHƯA cấu hình kênh dự phòng — ` +
        'không gửi được mã. Xem docs/email-setup.md để bật Amazon SES.',
    )
    return { status: 'quota_exceeded', channel: null, switchedToFallback: false }
  }

  // ── 2. Kênh dự phòng ────────────────────────────────────────────────────
  if (overPrimaryLimit) {
    console.warn(
      `[mailQuota] Kênh chính đã gửi ${counts.primarySent}/${primaryDailyLimit()} thư hôm nay — ` +
        'chuyển sang kênh dự phòng.',
    )
  }
  const fallbackResult = await sendMail(opts, 'fallback')
  if (fallbackResult.status === 'sent' || fallbackResult.status === 'rejected') {
    await incrementCount('fallback', now)
  }
  return { ...fallbackResult, channel: 'fallback', switchedToFallback: overPrimaryLimit }
}

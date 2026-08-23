// api/_lib/mailer.ts — Gửi email qua SMTP (nodemailer).
//
// Vì sao SMTP chứ không phải API riêng của một nhà cung cấp (Resend/SendGrid/Mailgun):
// SMTP là chuẩn chung, đổi nhà cung cấp chỉ cần đổi biến môi trường, không phải viết lại code
// và không khoá dự án vào một hãng. Dùng được với Gmail, Zoho, Resend, SendGrid, Amazon SES...
//
// KHUÔN NO-OP: giống Sentry trong dự án này (xem api/_lib/sentry.ts) — khi CHƯA cấu hình SMTP
// thì hàm gửi mail không nổ lỗi, chỉ trả về false và ghi log. Nhờ vậy dev/CI chạy được mà không
// cần tài khoản mail thật, và thiếu cấu hình trên production cũng không làm sập luồng đăng ký.

import nodemailer, { type Transporter } from 'nodemailer'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

// Hai KÊNH gửi độc lập:
//   'primary'  — nhà cung cấp chính, thường là gói miễn phí có hạn mức ngày (vd Brevo 300/ngày).
//   'fallback' — nhà cung cấp dự phòng trả tiền theo lượng, gần như không giới hạn (vd Amazon
//                SES ~$0,10/1.000 thư). Dùng khi kênh chính hết hạn mức hoặc lỗi.
// Cả hai đều là SMTP chuẩn nên đổi nhà cung cấp chỉ là đổi biến môi trường.
export type MailChannel = 'primary' | 'fallback'

function readConfig(channel: MailChannel): SmtpConfig | null {
  const prefix = channel === 'fallback' ? 'SMTP_FALLBACK_' : 'SMTP_'
  const host = process.env[`${prefix}HOST`]
  const user = process.env[`${prefix}USER`]
  const pass = process.env[`${prefix}PASS`]
  if (!host || !user || !pass) return null

  const port = Number(process.env[`${prefix}PORT`] ?? 587)
  const secureRaw = process.env[`${prefix}SECURE`]
  return {
    host,
    port,
    // Cổng 465 = TLS ngầm định (secure), 587/25 = STARTTLS (secure=false rồi nâng cấp).
    secure: secureRaw ? secureRaw === 'true' : port === 465,
    user,
    pass,
    // Địa chỉ người gửi dùng CHUNG cho cả 2 kênh (SMTP_FROM) để người nhận luôn thấy cùng một
    // địa chỉ dù thư đi qua nhà cung cấp nào — trừ khi đặt riêng cho kênh dự phòng.
    from: process.env[`${prefix}FROM`] || process.env.SMTP_FROM || user,
  }
}

const cache = new Map<MailChannel, { key: string; transport: Transporter }>()

function getTransport(channel: MailChannel, cfg: SmtpConfig): Transporter {
  // Tái dùng transport giữa các request (giữ kết nối, đỡ bắt tay TLS mỗi lần gửi).
  const key = `${cfg.host}:${cfg.port}:${cfg.user}`
  const hit = cache.get(channel)
  if (hit && hit.key === key) return hit.transport
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
  cache.set(channel, { key, transport })
  return transport
}

export function isMailerConfigured(channel: MailChannel = 'primary'): boolean {
  return readConfig(channel) !== null
}

// Kết quả gửi, phân biệt rõ để UI báo đúng cho người dùng:
//   'sent'           — máy chủ nhận đã CHẤP NHẬN địa chỉ này.
//   'rejected'       — máy chủ nhận TỪ CHỐI thẳng địa chỉ (hòm thư không tồn tại, tên miền sai)
//                      → gần như chắc chắn người dùng gõ SAI EMAIL.
//   'not_configured' — máy chủ chưa cấu hình SMTP. Lỗi phía mình, KHÔNG phải lỗi người dùng.
//   'error'          — lỗi mạng/tạm thời. Cũng không phải lỗi email người dùng.
//
// ⚠️ GIỚI HẠN QUAN TRỌNG: 'sent' KHÔNG đồng nghĩa "đã vào hộp thư". SMTP chấp nhận xong, thư
// vẫn có thể bị trả lại (bounce) sau đó vài giây tới vài phút, hoặc rơi vào thư rác — các tình
// huống đó báo về BẤT ĐỒNG BỘ qua thư trả lại/webhook, không thể biết ngay trong request này.
// Vì vậy UI luôn phải kèm lối thoát "chưa nhận được? xem thư rác hoặc đổi email".
//   'quota_exceeded' — chạm trần ngày và không có kênh dự phòng (xem mailQuota.ts).
export type MailStatus = 'sent' | 'rejected' | 'not_configured' | 'error' | 'quota_exceeded'

export interface MailResult {
  status: MailStatus
  // Mô tả từ máy chủ nhận — chỉ để ghi log/chẩn đoán, KHÔNG hiện thẳng cho người dùng.
  detail?: string
}

/**
 * Gửi 1 email. KHÔNG throw — nơi gọi không được vỡ luồng chính chỉ vì mail lỗi.
 */
export async function sendMail(
  opts: {
    to: string
    subject: string
    text: string
    html?: string
  },
  channel: MailChannel = 'primary',
): Promise<MailResult> {
  const cfg = readConfig(channel)
  if (!cfg) {
    if (channel === 'primary') {
      console.warn('[mailer] Chưa cấu hình SMTP_HOST/SMTP_USER/SMTP_PASS — bỏ qua gửi mail.')
    }
    return { status: 'not_configured' }
  }

  try {
    // nodemailer trả accepted/rejected — danh sách địa chỉ máy chủ nhận chấp nhận/từ chối.
    const info = (await getTransport(channel, cfg).sendMail({
      from: cfg.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })) as { accepted?: unknown[]; rejected?: unknown[]; response?: string }

    if ((info.rejected?.length ?? 0) > 0 && (info.accepted?.length ?? 0) === 0) {
      return { status: 'rejected', detail: info.response }
    }
    return { status: 'sent', detail: info.response }
  } catch (err) {
    const message = (err as Error).message
    // Không log địa chỉ email đầy đủ để tránh rò dữ liệu cá nhân vào log.
    console.error(`[mailer:${channel}] Gửi mail thất bại:`, message)

    // Mã SMTP 5xx = lỗi VĨNH VIỄN (địa chỉ không tồn tại/không hợp lệ), khác 4xx (tạm thời,
    // thử lại được) và khác lỗi kết nối phía mình.
    const code = (err as { responseCode?: number }).responseCode
    if (code && code >= 500 && code < 600) return { status: 'rejected', detail: message }
    return { status: 'error', detail: message }
  }
}

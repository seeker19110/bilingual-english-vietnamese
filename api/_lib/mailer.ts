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

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  const port = Number(process.env.SMTP_PORT ?? 587)
  return {
    host,
    port,
    // Cổng 465 = TLS ngầm định (secure), 587/25 = STARTTLS (secure=false rồi nâng cấp).
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    user,
    pass,
    from: process.env.SMTP_FROM || user,
  }
}

let cached: Transporter | null = null
let cachedKey = ''

function getTransport(cfg: SmtpConfig): Transporter {
  // Tái dùng transport giữa các request (giữ kết nối, đỡ bắt tay TLS mỗi lần gửi).
  const key = `${cfg.host}:${cfg.port}:${cfg.user}`
  if (cached && cachedKey === key) return cached
  cached = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
  cachedKey = key
  return cached
}

export function isMailerConfigured(): boolean {
  return readConfig() !== null
}

/**
 * Gửi 1 email. Trả về true nếu đã gửi, false nếu CHƯA cấu hình SMTP hoặc gửi lỗi.
 * KHÔNG throw — nơi gọi không được vỡ luồng chính chỉ vì mail lỗi.
 */
export async function sendMail(opts: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<boolean> {
  const cfg = readConfig()
  if (!cfg) {
    console.warn('[mailer] Chưa cấu hình SMTP_HOST/SMTP_USER/SMTP_PASS — bỏ qua gửi mail.')
    return false
  }

  try {
    await getTransport(cfg).sendMail({
      from: cfg.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })
    return true
  } catch (err) {
    // Không log nội dung mail/địa chỉ đầy đủ để tránh rò dữ liệu cá nhân vào log.
    console.error('[mailer] Gửi mail thất bại:', (err as Error).message)
    return false
  }
}

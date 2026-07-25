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
export type MailStatus = 'sent' | 'rejected' | 'not_configured' | 'error'

export interface MailResult {
  status: MailStatus
  // Mô tả từ máy chủ nhận — chỉ để ghi log/chẩn đoán, KHÔNG hiện thẳng cho người dùng.
  detail?: string
}

/**
 * Gửi 1 email. KHÔNG throw — nơi gọi không được vỡ luồng chính chỉ vì mail lỗi.
 */
export async function sendMail(opts: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<MailResult> {
  const cfg = readConfig()
  if (!cfg) {
    console.warn('[mailer] Chưa cấu hình SMTP_HOST/SMTP_USER/SMTP_PASS — bỏ qua gửi mail.')
    return { status: 'not_configured' }
  }

  try {
    // nodemailer trả accepted/rejected — danh sách địa chỉ máy chủ nhận chấp nhận/từ chối.
    const info = (await getTransport(cfg).sendMail({
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
    console.error('[mailer] Gửi mail thất bại:', message)

    // Mã SMTP 5xx = lỗi VĨNH VIỄN (địa chỉ không tồn tại/không hợp lệ), khác 4xx (tạm thời,
    // thử lại được) và khác lỗi kết nối phía mình.
    const code = (err as { responseCode?: number }).responseCode
    if (code && code >= 500 && code < 600) return { status: 'rejected', detail: message }
    return { status: 'error', detail: message }
  }
}

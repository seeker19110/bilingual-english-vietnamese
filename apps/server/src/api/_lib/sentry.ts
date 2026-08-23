// api/_lib/sentry.ts — Sentry (error tracking) phía SERVER (server.ts + handler api/*.ts).
//
// CHỈ bật khi có biến môi trường SENTRY_DSN (KHÔNG có tiền tố VITE_ — chỉ server đọc,
// xem .env.example). Không đặt biến này thì initSentryServer()/captureServerException()
// no-op ngay, không ảnh hưởng gì tới hành vi hiện tại (an toàn mặc định).
//
// Không bật tracesSampleRate (performance tracing) — chỉ cần bắt lỗi (exception), giữ gọn
// dữ liệu gửi đi + không vượt quota free của Sentry.

import * as Sentry from '@sentry/node'

let initialized = false

// Gọi 1 lần lúc server khởi động (server.ts, SAU dotenv.config()).
export function initSentryServer(): void {
  const dsn = process.env.SENTRY_DSN
  if (!dsn || initialized) return
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0,
  })
  initialized = true
}

// Gửi 1 lỗi lên Sentry. No-op nếu chưa cấu hình SENTRY_DSN (initSentryServer() chưa bật).
export function captureServerException(error: unknown, extra?: Record<string, unknown>): void {
  if (!initialized) return
  Sentry.captureException(error, extra ? { extra } : undefined)
}

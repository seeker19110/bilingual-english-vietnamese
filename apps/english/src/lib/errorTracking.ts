// src/lib/errorTracking.ts — Sentry (error tracking) phía CLIENT.
//
// CHỈ bật khi có biến môi trường VITE_SENTRY_DSN (đặt lúc build, xem .env.example).
// Không đặt biến này thì mọi hàm ở đây no-op ngay — KHÔNG tải @sentry/react, không tốn
// byte nào trong bundle chính (an toàn mặc định, không ảnh hưởng ngân sách size-limit).
//
// Dùng import() động (không import tĩnh ở đầu file) để @sentry/react nằm trong chunk
// riêng "vendor-sentry" (xem vite.config.ts) — chỉ tải xuống khi thực sự cần, không nằm
// trong bundle khởi động ban đầu.
//
// Không bật tracesSampleRate (performance tracing) hay Session Replay — app này chỉ cần
// bắt lỗi (crash/exception), giữ gọn dữ liệu gửi đi + không vượt quota free của Sentry.

type SentryModule = typeof import('@sentry/react')

let sentryModule: SentryModule | null = null
let initPromise: Promise<void> | null = null

function getDsn(): string | undefined {
  return import.meta.env.VITE_SENTRY_DSN as string | undefined
}

// Gọi 1 lần lúc app khởi động (main.tsx). No-op nếu chưa cấu hình DSN.
export function initErrorTracking(): void {
  const dsn = getDsn()
  if (!dsn) return
  initPromise = import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0,
    })
    sentryModule = Sentry
  })
}

// Gửi 1 lỗi lên Sentry (vd. từ ErrorBoundary). No-op an toàn nếu chưa bật DSN
// hoặc SDK chưa tải xong — không bao giờ ném lỗi ngược lại nơi gọi.
export async function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!getDsn()) return
  try {
    await initPromise
    sentryModule?.captureException(error, context ? { extra: context } : undefined)
  } catch {
    // Không để lỗi báo cáo làm hỏng luồng xử lý lỗi gốc.
  }
}

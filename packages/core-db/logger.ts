// packages/core-db/logger.ts — Logger nhẹ dùng chung toàn app, bọc console.* để: (1) gắn tiền
// tố module nhất quán (thay vì mỗi chỗ tự viết `[agent]`/`[googleTts]`), (2) cho phép ẨN log
// 'debug' (vết chạy chi tiết mỗi request) qua biến môi trường LOG_LEVEL mà không cần xoá code,
// (3) CHE bí mật lỡ lọt vào message trước khi in ra (Phase 01 mục 7, docs/phases/01-foundation-os.md
// — "secrets never enter logs"; xem packages/core-config/secrets.ts để biết cơ chế nhận diện).
// KHÔNG dùng thư viện ngoài (pino/winston) — quy mô 1 VPS + PM2 đọc log dạng text, không cần
// log JSON có cấu trúc. KHÔNG thay Sentry — lỗi cần theo dõi dài hạn vẫn gọi
// captureServerException() (api/_lib/sentry.ts) riêng, logger này chỉ phục vụ đọc log runtime.

import { redactSecrets } from '../core-config/secrets.js'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

function currentMinLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL
  // Mặc định 'debug' (hiện hết) — KHỚP hành vi console.log trực tiếp trước đây, không đổi gì
  // khi chưa đặt LOG_LEVEL. Đặt LOG_LEVEL=info trên VPS khi muốn bớt nhiễu log vận hành.
  return raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error' ? raw : 'debug'
}

export interface Logger {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

// vd: const log = createLogger('agent'); log.debug('gọi Gemini bắt đầu')  → in "[agent] gọi Gemini bắt đầu"
export function createLogger(prefix: string): Logger {
  const tag = `[${prefix}]`
  function write(level: LogLevel, message: string): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[currentMinLevel()]) return
    const line = `${tag} ${redactSecrets(message)}`
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  }
  return {
    debug: (message) => write('debug', message),
    info: (message) => write('info', message),
    warn: (message) => write('warn', message),
    error: (message) => write('error', message),
  }
}

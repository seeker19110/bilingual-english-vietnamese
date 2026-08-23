// server.ts — Express server chạy trên VPS (thay thế Vercel Edge Runtime)
// Bọc lại các handler trong api/*.ts mà không cần sửa logic bên trong.
//
// Cách chạy:
//   Development : npm run dev  (Vite dev server, không dùng file này)
//   Production  : npm start    (file này, chạy qua PM2)

import express from 'express'
import compression from 'compression'
import path from 'node:path'
import * as dotenv from 'dotenv'

// Nạp biến môi trường từ .env — phải chạy trước khi import các handler
// vì handler đọc process.env ngay lúc module load
dotenv.config()

import { initSentryServer, captureServerException } from './api/_lib/sentry.js'
import { registerApiRoutes, CSP_HEADER } from './routes.js'
import { warnIfClusterWithoutRedis, reportRedisStatusAtStartup } from '@dhcb/core-auth/security'

// Bật Sentry (error tracking) — no-op nếu chưa cấu hình SENTRY_DSN (xem api/_lib/sentry.ts).
initSentryServer()

// Cảnh báo ngay ở log khởi động nếu thiếu REDIS_URL khi chạy dưới PM2 — xem chi tiết
// lý do trong warnIfClusterWithoutRedis() (api/_lib/security.ts).
warnIfClusterWithoutRedis()

import { attachChatWebSocketServer } from '@dhcb/core-chat/wsHandler'
import { attachVoiceWebSocketServer } from '@dhcb/core-ai/wsVoiceHandler'
import { attachCoLearningWebSocketServer } from '@dhcb/core-ai/wsCoLearningHandler'
import { attachGeminiLiveWebSocketServer } from '@dhcb/core-ai/wsGeminiLiveHandler'
import { sendReminders } from './api/core/push.js'
import { downgradeExpiredPlans } from './api/_lib/planExpiry.js'
import { sendEmailReminders } from './api/_lib/emailReminders.js'

const app = express()

// Bỏ header "X-Powered-By: Express" — tránh lộ stack kỹ thuật ra bên ngoài
app.disable('x-powered-by')

// Bật gzip/brotli compression — giảm kích thước response 70% cho Mobile
// threshold: chỉ nén khi response > 1KB (tránh overhead cho response nhỏ)
app.use(compression({ threshold: 1024 }))

// Toàn bộ route API (parser đặc biệt + JSON 64kb + ~100 endpoint) — xem routes.ts (PR-S3).
registerApiRoutes(app)

// Dùng process.cwd() thay vì __dirname (đường dẫn của CHÍNH file server.ts): khi chạy qua
// `tsx` (dev/hiện tại) __dirname = gốc repo, nhưng khi chạy bản đã biên dịch
// (dist-server/server.js — xem tsconfig.server.json) __dirname sẽ trỏ SAI vào dist-server/.
// PM2 luôn set cwd = thư mục chứa ecosystem.config.cjs (gốc repo) ở cả 2 cách chạy nên
// process.cwd() ổn định hơn.
const __dirname = process.cwd()

// ── Security headers cho static files và non-API routes ─────────────────────
app.use((req, res, next) => {
  // Chỉ apply cho non-API routes để tránh double headers
  if (!req.path.startsWith('/api/')) {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Security-Policy', CSP_HEADER)
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  }
  next()
})

// ── Health check ────────────────────────────────────────────────────────────
// Endpoint nhẹ để PM2 / Nginx / uptime monitor kiểm tra app còn sống không.
// Không gọi AI, không đụng DB → trả lời tức thì, không tốn tiền.
app.get('/api/health', (_req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Security-Policy', CSP_HEADER)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() })
})

// ── Phục vụ file upload local (audio cache khi STORAGE_DRIVER=local) ────────
// Nginx cũng có thể serve trực tiếp nhưng Express làm backup nếu cần
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '30d',
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=2592000')
    },
  }),
)

// ── Phục vụ frontend (React build) — chọn app theo Host header (PR-7) ───────
// Một tiến trình Express phục vụ NHIỀU app tĩnh (mức 2 kiến trúc đã chốt, ADR-0001): app
// tiếng Anh ở dist/ (gốc, giữ nguyên đường dẫn cũ để KHÔNG đổi hành vi production hiện tại)
// và apps/hub/dist/ cho mọi host còn lại (apex, subdomain môn chưa mở, domain lạ). Route
// /api/* đã xử lý xong ở trên, không đi qua bảng này.
//
// EN_VI_HOSTNAME mặc định đúng domain production hiện tại — nếu không đặt biến môi trường,
// hành vi cho host đó giữ y hệt trước PR-7. Host nào Nginx CHƯA có server_name trỏ vào tiến
// trình này thì nhánh "hub" ở đây là code chết cho tới khi thêm cấu hình Nginx/DNS/cert thật
// (xem docs/nginx-hub-apex.md — phần hạ tầng thật cần làm tay, PR-7 mới chỉ dựng code).
// Nhận NHIỀU host phân cách dấu phẩy (vd đang chuyển đổi .com → .org song song, xem
// docs/doi-ten-mien-chinh-org.md) — cả 2 domain cùng phục vụ app tiếng Anh trong lúc test.
const appDistDir = path.join(__dirname, 'dist')

function staticCacheHeaders(res: express.Response, filePath: string) {
  // index.html không được cache (luôn fetch mới)
  if (filePath.endsWith('index.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }
  // File assets có hash (*.js, *.css, images) — cache mãi mãi (immutable).
  else if (/-[A-Za-z0-9_-]{8}\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?)$/.test(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
  // File khác (manifest, etc) — cache 1 tuần
  else {
    res.setHeader('Cache-Control', 'public, max-age=604800')
  }
  // Thêm charset cho HTML/JSON
  if (filePath.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
  }
}

// Phục vụ toàn bộ ứng dụng học tập và Bạn Đồng Hành AI đầy đủ tính năng
app.use(
  express.static(appDistDir, {
    maxAge: '1y',
    setHeaders: staticCacheHeaders,
  }),
)

// /api/* không khớp route nào ở trên → JSON 404 rõ ràng. Trước đây rơi xuống catch-all
// SPA bên dưới, trả index.html 200 — client tưởng thành công, khó debug
// (vá 2026-08-23, đề xuất N1 mục B6).
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route không tồn tại' })
})

// Mọi route client SPA (Toán, Tiếng Anh, Lộ trình, Luyện nói, Đồng Hành, Simulators, v.v.) đều trả index.html đầy đủ
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.sendFile(path.join(appDistDir, 'index.html'))
})

// ── Bộ hẹn giờ nhắc học (web push) ───────────────────────────────────────────
// Mỗi khi sang một GIỜ mới (UTC), gửi nhắc cho những người đã hẹn nhắc vào giờ đó
// mà HÔM NAY CHƯA HỌC (giữ streak). Chạy ngay trong tiến trình server, không cần cron ngoài.
// Lưu ý: nếu chạy PM2 cluster nhiều instance, đặt REMINDER_SCHEDULER=off ở các instance
// phụ để tránh gửi trùng (mặc định bật).
function startReminderScheduler() {
  if (process.env.REMINDER_SCHEDULER === 'off') {
    console.log('   Nhắc học : tắt (REMINDER_SCHEDULER=off)')
    return
  }

  const hasPushConfig = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
  if (!hasPushConfig) {
    console.log('   Nhắc học Web Push : tắt (chưa cấu hình VAPID keys)')
  } else {
    console.log('   Nhắc học Web Push : bật (gửi đúng giờ mỗi người chọn)')
  }

  // Khởi tạo = giờ hiện tại để BỎ QUA phần giờ dở dang lúc server vừa bật
  // (tránh gửi nhắc trễ giữa giờ); bắt đầu gửi từ đầu giờ kế tiếp.
  let lastHourSent = new Date().getUTCHours()
  setInterval(() => {
    const hour = new Date().getUTCHours()
    if (hour === lastHourSent) return
    lastHourSent = hour

    // 1. Gửi Web Push reminders nếu có cấu hình
    if (hasPushConfig) {
      void sendReminders(hour)
        .then((r) => {
          if (r.sent || r.skipped)
            console.log(
              `[reminder:push] ${hour}h UTC → gửi ${r.sent}, bỏ qua ${r.skipped} (đã học)`,
            )
        })
        .catch((err) => {
          console.error('[reminder:push] lỗi gửi nhắc:', err)
          captureServerException(err, { context: 'reminder-scheduler-push', hour })
        })
    }

    // 2. Gửi Smart Email Reminders một lần mỗi ngày lúc 13h UTC (20h Việt Nam)
    if (hour === 13) {
      void sendEmailReminders()
        .then((r) => {
          if (r.sent || r.skipped)
            console.log(
              `[reminder:email] Gửi xong email nhắc học: ${r.sent} gửi, ${r.skipped} bỏ qua`,
            )
        })
        .catch((err) => {
          console.error('[reminder:email] lỗi gửi email nhắc:', err)
          captureServerException(err, { context: 'reminder-scheduler-email' })
        })
    }
  }, 60_000) // kiểm tra mỗi phút, gửi 1 lần khi sang giờ mới
}

// ── Dọn gói Pro/VIP hết hạn (1 lần/ngày) ─────────────────────────────────────
// Chỉ dọn dữ liệu cho ĐÚNG (cột `plan` trong DB) — việc CHẶN quyền hết hạn đã tự áp ngay lúc
// đọc plan (resolvePlan trong api/_lib/plan.ts), không phụ thuộc job này chạy đúng giờ hay không.
function startPlanExpiryScheduler() {
  let lastDaySent = new Date().getUTCDate()
  setInterval(() => {
    const day = new Date().getUTCDate()
    if (day === lastDaySent) return
    lastDaySent = day
    void downgradeExpiredPlans()
      .then((r) => {
        if (r.downgraded > 0) console.log(`[plan-expiry] Đã hạ ${r.downgraded} gói hết hạn về free`)
      })
      .catch((err) => {
        console.error('[plan-expiry] lỗi dọn gói hết hạn:', err)
        captureServerException(err, { context: 'plan-expiry-scheduler' })
      })
  }, 60_000) // kiểm tra mỗi phút, chạy 1 lần khi sang ngày mới (UTC)
}

// ── Khởi động ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`✅ English Tutor đang chạy tại http://localhost:${PORT}`)
  console.log(`   NODE_ENV : ${process.env.NODE_ENV || 'production'}`)
  console.log(`   Node.js  : ${process.version}`)
  // PM2 cluster: chỉ instance 0 chạy scheduler — trước đây CẢ 3 instance cùng chạy nên
  // push/email nhắc học gửi 3 lần/người và downgradeExpiredPlans() chạy 3 lần
  // (vá 2026-08-23, đề xuất N1 mục B5). Chạy ngoài PM2 thì biến không tồn tại → vẫn chạy.
  const pm2Instance = process.env.NODE_APP_INSTANCE
  if (pm2Instance === undefined || pm2Instance === '0') {
    startReminderScheduler()
    startPlanExpiryScheduler()
    // Kiểm Redis CHỈ ở instance 0: cấu hình REDIS_URL giống hệt nhau ở mọi instance nên một
    // lần là đủ, in 3 lần chỉ làm rối log. Không await — đo đạc không được làm chậm khởi động.
    void reportRedisStatusAtStartup()
  } else {
    console.log(`   Scheduler: tắt ở instance ${pm2Instance} (chỉ instance 0 chạy)`)
  }
  // Báo PM2 là app ĐÃ nhận request được (đi với wait_ready trong ecosystem.config.cjs).
  // Khi reload, PM2 đợi tín hiệu này từ process MỚI rồi mới tắt process CŨ → không có
  // khoảng chết. Chạy ngoài PM2 (npm start tay) thì process.send không tồn tại → bỏ qua.
  process.send?.('ready')
})

// WebSocket chat gắn vào CHÍNH http.Server này (không mở cổng riêng) — xem
// packages/core-chat/wsHandler.ts.
attachChatWebSocketServer(server)
attachVoiceWebSocketServer(server)
attachCoLearningWebSocketServer(server)
attachGeminiLiveWebSocketServer(server)

// Tắt êm (graceful shutdown): PM2 gửi SIGINT khi stop/reload. Ngừng nhận kết nối mới,
// đóng ngay kết nối keep-alive đang rảnh, chờ request đang chạy xong rồi thoát.
// Quá 5s chưa xong thì thoát luôn (PM2 còn kill_timeout để SIGKILL nếu process kẹt).
function shutdown() {
  server.close(() => process.exit(0))
  server.closeIdleConnections()
  setTimeout(() => process.exit(0), 5000).unref()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

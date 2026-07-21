// server.ts — Express server chạy trên VPS (thay thế Vercel Edge Runtime)
// Bọc lại các handler trong api/*.ts mà không cần sửa logic bên trong.
//
// Cách chạy:
//   Development : npm run dev  (Vite dev server, không dùng file này)
//   Production  : npm start    (file này, chạy qua PM2)

import express from 'express'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'

// Nạp biến môi trường từ .env — phải chạy trước khi import các handler
// vì handler đọc process.env ngay lúc module load
dotenv.config()

import { initSentryServer, captureServerException } from './api/_lib/sentry.js'

// Bật Sentry (error tracking) — no-op nếu chưa cấu hình SENTRY_DSN (xem api/_lib/sentry.ts).
initSentryServer()

import ttsHandler from './api/tts.js'
import aiHandler from './api/ai.js'
import pronunciationHandler from './api/pronunciation.js'
import sttHandler from './api/stt.js'
import pushHandler, { sendReminders } from './api/push.js'
import dictionaryHandler from './api/dictionary.js'
import leaderboardHandler from './api/leaderboard.js'
import pronounceAssessHandler from './api/pronounce-assess.js'
import authHandler from './api/auth.js'
import profileHandler from './api/profile.js'
import progressHandler from './api/progress.js'
import historyHandler from './api/history.js'
import challengeHandler from './api/challenge.js'
import tutorFeedbackHandler from './api/tutor-feedback.js'
import adminSettingsHandler from './api/admin-settings.js'
import appSettingsHandler from './api/app-settings.js'

const app = express()

// Content-Security-Policy dùng chung cho mọi response (API, static, health).
// Đã bỏ các domain KHÔNG còn dùng: cdn.jsdelivr.net (không có script nào tải từ CDN),
// fonts.googleapis.com + fonts.gstatic.com (font Inter đã tự host — xem src/main.tsx).
// 'unsafe-inline'/'unsafe-eval' giữ lại vì bundle Vite hiện cần; siết thêm là việc riêng.
// static.cloudflareinsights.com: script beacon Cloudflare tự chèn khi bật proxy
// (xem docs/cloudflare-setup.md) — cần cho phép cả script-src (tải file) lẫn
// connect-src (báo cáo RUM qua cdn-cgi/rum), nếu không sẽ bị chặn CSP.
// https://accounts.google.com trong script-src: tải script Google Identity Services
// (đăng nhập Google — Giai đoạn B, xem src/lib/auth.ts loadGoogleScript()).
// frame-src https://accounts.google.com: khung One Tap/popup chọn tài khoản Google hiện
// TRONG trang (không có directive này thì rơi về default-src 'self', chặn hẳn khung Google).
const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://accounts.google.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; media-src 'self' blob: https:; connect-src 'self' https:; frame-src https://accounts.google.com; frame-ancestors 'self'"

// Bỏ header "X-Powered-By: Express" — tránh lộ stack kỹ thuật ra bên ngoài
app.disable('x-powered-by')

// Bật gzip/brotli compression — giảm kích thước response 70% cho Mobile
// threshold: chỉ nén khi response > 1KB (tránh overhead cho response nhỏ)
app.use(compression({ threshold: 1024 }))

// STT nhận audio base64 → body lớn hơn nhiều so với chat/tts. Đăng ký parser riêng
// cho route này TRƯỚC parser JSON 64kb mặc định bên dưới (Express chạy middleware theo
// thứ tự — nếu để parser 64kb chạy trước, body audio sẽ bị chặn 413 trước khi tới handler).
app.post('/api/stt', express.json({ limit: '10mb' }), wrapEdge(sttHandler))
// /api/pronounce-assess cũng nhận audio base64 (câu ngắn ~30s, nhẹ hơn STT hội thoại tự do)
// — cùng lý do cần parser riêng thay vì giới hạn 64kb mặc định.
app.post('/api/pronounce-assess', express.json({ limit: '5mb' }), wrapEdge(pronounceAssessHandler))

app.use(express.json({ limit: '64kb' }))

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Bọc Edge Function handler thành Express route ────────────────────────────
// Edge Function: nhận (Request) → trả (Response)  [Web API chuẩn]
// Express      : nhận (req, res)                   [Node.js API]
// Node.js 20 hỗ trợ sẵn Web API Request/Response nên chuyển đổi khá gọn.
function wrapEdge(handler: (req: Request) => Promise<Response>) {
  return async (req: express.Request, res: express.Response) => {
    try {
      // Dựng lại URL đầy đủ — một số handler dùng URL để đọc query params
      const protocol = req.get('x-forwarded-proto') || req.protocol
      const host = req.get('host') || 'localhost'
      const fullUrl = `${protocol}://${host}${req.originalUrl}`

      // Chuyển Express request → Web API Request
      const webReq = new Request(fullUrl, {
        method: req.method,
        headers: req.headers as HeadersInit,
        // GET/HEAD không có body
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
      })

      // Gọi handler gốc
      const webRes = await handler(webReq)

      // Chuyển Web API Response → Express response
      res.status(webRes.status)
      webRes.headers.forEach((val, key) => res.setHeader(key, val))

      // Security headers — thêm sau khi convert response, tránh conflict với Web API Response
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Security-Policy', CSP_HEADER)
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

      res.send(await webRes.text())
    } catch (err) {
      console.error('[server] Lỗi handler:', err)
      captureServerException(err, { path: req.originalUrl, method: req.method })
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

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

// ── API routes ────────────────────────────────────────────────────────────────
// Thêm vào đây nếu tạo thêm file api/*.ts mới
app.all('/api/tts', wrapEdge(ttsHandler))
app.all('/api/claude', wrapEdge(aiHandler))
app.all('/api/pronunciation', wrapEdge(pronunciationHandler))
app.all('/api/push', wrapEdge(pushHandler))
app.all('/api/dictionary', wrapEdge(dictionaryHandler))
app.all('/api/leaderboard', wrapEdge(leaderboardHandler))
app.all('/api/auth', wrapEdge(authHandler))
app.all('/api/profile', wrapEdge(profileHandler))
app.all('/api/progress', wrapEdge(progressHandler))
app.all('/api/history', wrapEdge(historyHandler))
app.all('/api/challenge', wrapEdge(challengeHandler))
app.all('/api/tutor-feedback', wrapEdge(tutorFeedbackHandler))
app.all('/api/admin-settings', wrapEdge(adminSettingsHandler))
app.all('/api/app-settings', wrapEdge(appSettingsHandler))

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

// ── Phục vụ frontend (React build) ───────────────────────────────────────────
// Cache file tĩnh 1 năm với cache busting (filename hash) — trừ index.html để luôn lấy bản mới nhất
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y',
    setHeaders(res, filePath) {
      // index.html không được cache (luôn fetch mới)
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      }
      // File assets có hash (*.js, *.css, images) — cache mãi mãi (immutable).
      // LƯU Ý: Vite đặt tên kiểu "[name]-[hash:8].ext" (ví dụ chunk-009-kqpwuI8u.js),
      // hash là chuỗi base64url 8 ký tự (A-Za-z0-9_-) đứng SAU dấu gạch ngang —
      // KHÔNG phải hex thường sau dấu chấm. Regex cũ /\.[a-f0-9]{8}\./ không bao giờ
      // khớp nên trước đây mọi file JS/CSS chỉ được cache 1 tuần (rớt điểm Lighthouse).
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
    },
  }),
)

// Mọi route không khớp đều trả index.html (React Router xử lý phía client).
// index.html KHÔNG được cache — luôn lấy bản mới để tham chiếu đúng tên chunk
// (có hash) sau mỗi lần deploy; nếu cache index.html cũ sẽ trỏ tới chunk đã biến
// mất → 404 chunk → màn hình trắng.
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
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
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('   Nhắc học : tắt (chưa cấu hình VAPID keys)')
    return
  }
  // Khởi tạo = giờ hiện tại để BỎ QUA phần giờ dở dang lúc server vừa bật
  // (tránh gửi nhắc trễ giữa giờ); bắt đầu gửi từ đầu giờ kế tiếp.
  let lastHourSent = new Date().getUTCHours()
  setInterval(() => {
    const hour = new Date().getUTCHours()
    if (hour === lastHourSent) return
    lastHourSent = hour
    void sendReminders(hour)
      .then((r) => {
        if (r.sent || r.skipped)
          console.log(`[reminder] ${hour}h UTC → gửi ${r.sent}, bỏ qua ${r.skipped} (đã học)`)
      })
      .catch((err) => {
        console.error('[reminder] lỗi gửi nhắc:', err)
        captureServerException(err, { context: 'reminder-scheduler', hour })
      })
  }, 60_000) // kiểm tra mỗi phút, gửi 1 lần khi sang giờ mới
  console.log('   Nhắc học : bật (gửi đúng giờ mỗi người chọn)')
}

// ── Khởi động ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`✅ English Tutor đang chạy tại http://localhost:${PORT}`)
  console.log(`   NODE_ENV : ${process.env.NODE_ENV || 'production'}`)
  console.log(`   Node.js  : ${process.version}`)
  startReminderScheduler()
  // Báo PM2 là app ĐÃ nhận request được (đi với wait_ready trong ecosystem.config.cjs).
  // Khi reload, PM2 đợi tín hiệu này từ process MỚI rồi mới tắt process CŨ → không có
  // khoảng chết. Chạy ngoài PM2 (npm start tay) thì process.send không tồn tại → bỏ qua.
  process.send?.('ready')
})

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

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
import { warnIfClusterWithoutRedis } from './packages/core-auth/security.js'

// Bật Sentry (error tracking) — no-op nếu chưa cấu hình SENTRY_DSN (xem api/_lib/sentry.ts).
initSentryServer()

// Cảnh báo ngay ở log khởi động nếu thiếu REDIS_URL khi chạy dưới PM2 — xem chi tiết
// lý do trong warnIfClusterWithoutRedis() (api/_lib/security.ts).
warnIfClusterWithoutRedis()

import ttsHandler from './packages/core-ai/tts.js'
import aiHandler from './packages/core-ai/ai.js'
import pronunciationHandler from './api/pronunciation.js'
import sttHandler from './packages/core-ai/stt.js'
import pushHandler, { sendReminders } from './api/push.js'
import dictionaryHandler from './api/dictionary.js'
import leaderboardHandler from './api/leaderboard.js'
import pronounceAssessHandler from './api/pronounce-assess.js'
import authHandler from './packages/core-auth/auth.js'
import profileHandler from './api/profile.js'
import progressHandler from './api/progress.js'
import usageSummaryHandler from './api/usage-summary.js'
import historyHandler from './api/history.js'
import challengeHandler from './api/challenge.js'
import tutorFeedbackHandler from './api/tutor-feedback.js'
import adminSettingsHandler from './api/admin-settings.js'
import appSettingsHandler from './api/app-settings.js'
import adminGrantPlanHandler from './api/admin-grant-plan.js'
import adminVipWhitelistHandler from './api/admin-vip-whitelist.js'
import planFeaturesHandler from './packages/core-billing/plan-features.js'
import adminPlanFeaturesHandler from './api/admin-plan-features.js'
import adminPricePromoHandler from './api/admin-price-promo.js'
import planMarketingHandler from './packages/core-billing/plan-marketing.js'
import adminPlanMarketingHandler from './api/admin-plan-marketing.js'
import analyticsHandler from './api/analytics.js'
import analyticsSummaryHandler from './api/analytics-summary.js'
import adminUsageStatsHandler from './api/admin-usage-stats.js'
import adminUsersHandler from './api/admin-users.js'
import referralHandler from './api/referral.js'
import questsHandler from './api/quests.js'
import achievementsHandler from './api/achievements.js'
import friendsHandler from './api/friends.js'
import chatHandler from './api/chat.js'
import { attachChatWebSocketServer } from './packages/core-chat/wsHandler.js'
import { attachVoiceWebSocketServer } from './packages/core-ai/wsVoiceHandler.js'
import adminAchievementRewardsHandler from './api/admin-achievement-rewards.js'
import adminPaymentsHandler from './api/admin-payments.js'
import adminSystemControlHandler from './api/admin-system-control.js'
import adminTtsCacheHandler from './api/admin-tts-cache.js'
import adminReservedNamesHandler from './api/admin-reserved-names.js'
import adminFeedbackHandler from './api/admin-feedback.js'
import planPricesHandler from './packages/core-billing/plan-prices.js'
import checkoutHandler from './packages/core-billing/checkout.js'
import paymentWebhookHandler from './packages/core-billing/payment-webhook.js'
import paymentStatusHandler from './packages/core-billing/payment-status.js'
import paymentHistoryHandler from './packages/core-billing/payment-history.js'
import avatarVisemesHandler from './api/avatar-visemes.js'
import hubStatsHandler from './api/hub-stats.js'
import personsHandler from './api/persons.js'
import personalFactsHandler from './api/personal-facts.js'
import consentsHandler from './api/consents.js'
import personalPoliciesHandler from './api/personal-policies.js'
import lifeGraphHandler from './api/life-graph.js'
import lifeGoalsHandler from './api/life-goals.js'
import memoriesHandler from './api/memories.js'
import contextPackageHandler from './api/context-package.js'
import proposedActionsHandler from './api/proposed-actions.js'
import companionHandler from './api/companion.js'
import decisionLedgerHandler from './api/decision-ledger.js'
import learningReadModelHandler from './api/learning-read-model.js'
import subjectsHandler from './api/subjects.js'
import careerHandler from './api/career.js'
import workHandler from './api/work.js'
import startupHandler from './api/startup.js'
import lifeHandler from './api/life.js'
import automationHandler from './api/automation.js'
import healthDeepHandler from './api/healthDeep.js'
import proactiveBriefingHandler from './api/proactive-briefing.js'
import visionSolveHandler from './api/vision-solve.js'
import integrationsHandler from './api/integrations.js'
import subconsciousHandler from './api/subconscious.js'
import { downgradeExpiredPlans } from './api/_lib/planExpiry.js'
import { sendEmailReminders } from './api/_lib/emailReminders.js'

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
// style-src thêm https://accounts.google.com: nút/khung Google Identity Services tự chèn
// thẻ <link> tải stylesheet https://accounts.google.com/gsi/style — thiếu domain này sẽ bị
// CSP chặn (lỗi "violates style-src directive"), khiến nút đăng nhập Google mất style/không hiện.
// https://connect.facebook.net: tải Facebook JS SDK (đăng nhập Facebook, src/lib/auth.ts
// loadFacebookScript()). https://appleid.cdn-apple.com: tải Sign in with Apple JS
// (loadAppleScript()). https://alcdn.msauth.net: tải MSAL.js (đăng nhập Microsoft,
// loadMicrosoftScript()). Cả 3 mở popup (window mới), KHÔNG nhúng iframe trong trang như
// Google One Tap, nên KHÔNG cần thêm vào frame-src.
const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://accounts.google.com https://connect.facebook.net https://appleid.cdn-apple.com https://alcdn.msauth.net; style-src 'self' 'unsafe-inline' https://accounts.google.com; font-src 'self' data:; img-src 'self' data: https:; media-src 'self' blob: https:; connect-src 'self' https:; frame-src https://accounts.google.com; frame-ancestors 'self'"

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
// /api/vision-solve nhận image base64 từ camera/file upload
app.post('/api/vision-solve', express.json({ limit: '10mb' }), wrapEdge(visionSolveHandler))

app.use(express.json({ limit: '64kb' }))

// Dùng process.cwd() thay vì __dirname (đường dẫn của CHÍNH file server.ts): khi chạy qua
// `tsx` (dev/hiện tại) __dirname = gốc repo, nhưng khi chạy bản đã biên dịch
// (dist-server/server.js — xem tsconfig.server.json) __dirname sẽ trỏ SAI vào dist-server/.
// PM2 luôn set cwd = thư mục chứa ecosystem.config.cjs (gốc repo) ở cả 2 cách chạy nên
// process.cwd() ổn định hơn.
const __dirname = process.cwd()

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
app.all('/api/agent', wrapEdge(aiHandler))
app.all('/api/pronunciation', wrapEdge(pronunciationHandler))
app.all('/api/push', wrapEdge(pushHandler))
app.all('/api/dictionary', wrapEdge(dictionaryHandler))
app.all('/api/leaderboard', wrapEdge(leaderboardHandler))
app.all('/api/auth', wrapEdge(authHandler))
app.all('/api/profile', wrapEdge(profileHandler))
app.all('/api/progress', wrapEdge(progressHandler))
app.all('/api/usage-summary', wrapEdge(usageSummaryHandler))
app.all('/api/history', wrapEdge(historyHandler))
app.all('/api/challenge', wrapEdge(challengeHandler))
app.all('/api/tutor-feedback', wrapEdge(tutorFeedbackHandler))
app.all('/api/admin-settings', wrapEdge(adminSettingsHandler))
app.all('/api/app-settings', wrapEdge(appSettingsHandler))
app.all('/api/admin-grant-plan', wrapEdge(adminGrantPlanHandler))
app.all('/api/admin-vip-whitelist', wrapEdge(adminVipWhitelistHandler))
app.all('/api/plan-features', wrapEdge(planFeaturesHandler))
app.all('/api/admin-plan-features', wrapEdge(adminPlanFeaturesHandler))
app.all('/api/admin-price-promo', wrapEdge(adminPricePromoHandler))
app.all('/api/plan-marketing', wrapEdge(planMarketingHandler))
app.all('/api/admin-plan-marketing', wrapEdge(adminPlanMarketingHandler))
app.all('/api/analytics', wrapEdge(analyticsHandler))
app.all('/api/analytics-summary', wrapEdge(analyticsSummaryHandler))
app.all('/api/admin-usage-stats', wrapEdge(adminUsageStatsHandler))
app.all('/api/admin-users', wrapEdge(adminUsersHandler))
app.all('/api/referral', wrapEdge(referralHandler))
app.all('/api/quests', wrapEdge(questsHandler))
app.all('/api/achievements', wrapEdge(achievementsHandler))
app.all('/api/friends', wrapEdge(friendsHandler))
app.all('/api/chat', wrapEdge(chatHandler))
app.all('/api/admin-achievement-rewards', wrapEdge(adminAchievementRewardsHandler))
app.all('/api/admin-payments', wrapEdge(adminPaymentsHandler))
app.all('/api/admin-system-control', wrapEdge(adminSystemControlHandler))
app.all('/api/admin-tts-cache', wrapEdge(adminTtsCacheHandler))
app.all('/api/admin-reserved-names', wrapEdge(adminReservedNamesHandler))
app.all('/api/admin-feedback', wrapEdge(adminFeedbackHandler))
app.all('/api/plan-prices', wrapEdge(planPricesHandler))
app.all('/api/checkout', wrapEdge(checkoutHandler))
app.all('/api/payment-webhook', wrapEdge(paymentWebhookHandler))
app.all('/api/payment-status', wrapEdge(paymentStatusHandler))
app.all('/api/payment-history', wrapEdge(paymentHistoryHandler))
app.all('/api/avatar-visemes', wrapEdge(avatarVisemesHandler))
app.all('/api/hub-stats', wrapEdge(hubStatsHandler))
// Personal World Model (V2-03) — danh tính + fact cá nhân, đều bắt buộc đăng nhập.
app.all('/api/persons', wrapEdge(personsHandler))
app.all('/api/personal-facts', wrapEdge(personalFactsHandler))
// Consent + Personal Policy (V2-04) — quyền/đồng ý của chính người dùng, bắt buộc đăng nhập.
app.all('/api/consents', wrapEdge(consentsHandler))
app.all('/api/personal-policies', wrapEdge(personalPoliciesHandler))
// Life Graph foundation (V2-05) — graph của chính người dùng + Learning Goal read view.
app.all('/api/life-graph', wrapEdge(lifeGraphHandler))
app.all('/api/life-goals', wrapEdge(lifeGoalsHandler))
// Personal Knowledge Fabric (V2-06) — bộ nhớ cá nhân hóa theo namespace & retention.
app.all('/api/memories', wrapEdge(memoriesHandler))
// Context Engine (V2-07) — xây dựng ContextPackage có lọc permission/sensitivity/budget.
app.all('/api/context-package', wrapEdge(contextPackageHandler))
// ProposedAction & Tool Manifest Pipeline (V2-08) — Planning ≠ Execution ≠ State Mutation.
app.all('/api/proposed-actions', wrapEdge(proposedActionsHandler))
// Companion Runtime (V2-09) — Intent -> Context -> Planner -> Policy -> Actions -> Response.
app.all('/api/companion', wrapEdge(companionHandler))
// Decision Ledger + Outcome Loop (V2-10) — Structured decision records & evidence loop.
app.all('/api/decision-ledger', wrapEdge(decisionLedgerHandler))
// Learning Read Model (V2-11) — Typed Learning domain read model for Companion.
app.all('/api/learning-read-model', wrapEdge(learningReadModelHandler))
// Multi-Subject Learning (V2-12) — Subject manifests & taxonomy registry.
app.all('/api/subjects', wrapEdge(subjectsHandler))
// Career Domain (V2-13) — Profile, experiences, goals & skill gap analysis.
app.all('/api/career', wrapEdge(careerHandler))
// Work Domain (V2-15) — Projects, tasks, meetings, documents, deadlines.
app.all('/api/work', wrapEdge(workHandler))
// Startup Domain (V2-16) — Ventures, problems, hypotheses, evidence (claims require provenance).
app.all('/api/startup', wrapEdge(startupHandler))
// Life Foundation (V2-17) — Plans, habits, wellbeing, growth milestones.
app.all('/api/life', wrapEdge(lifeHandler))
// Approved Automation (V2-18) — Explicit grants, triggers, budgets, retries/compensation, action receipts.
app.all('/api/automation', wrapEdge(automationHandler))
// Deep Health Check — Giám sát chuyên sâu Database, Storage, Cache, Uptime.
app.all('/api/health/deep', wrapEdge(healthDeepHandler))
// Proactive Briefing (V2 Flagship P1) — Morning / Evening personalized proactive briefs.
app.all('/api/proactive-briefing', wrapEdge(proactiveBriefingHandler))
// Multimodal Vision Solver (V2 Flagship P1) — STEM & Document OCR solver.
app.all('/api/vision-solve', wrapEdge(visionSolveHandler))
// External Integrations (V2 Flagship) — Google Calendar & Notion sync.
app.all('/api/integrations', wrapEdge(integrationsHandler))
// Subconscious Cognition & Nightly REM Consolidation (V3 Flagship) — Autonomous cognition & predictive strategy.
app.all('/api/subconscious', wrapEdge(subconsciousHandler))

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
const EN_VI_HOSTNAMES = new Set(
  (process.env.EN_VI_HOSTNAME || 'en-vi.donghanhcungban.org,en-vi.donghanhcungban.com')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean),
)
const englishDistDir = path.join(__dirname, 'dist')
const hubDistDir = path.join(__dirname, 'apps/hub/dist')

function distDirForHost(hostname: string): string {
  return EN_VI_HOSTNAMES.has(hostname) ? englishDistDir : hubDistDir
}

function staticCacheHeaders(res: express.Response, filePath: string) {
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
}

// Cache file tĩnh 1 năm với cache busting (filename hash) — trừ index.html để luôn lấy bản mới nhất
const englishStatic = express.static(englishDistDir, {
  maxAge: '1y',
  setHeaders: staticCacheHeaders,
})
const hubStatic = express.static(hubDistDir, { maxAge: '1y', setHeaders: staticCacheHeaders })
app.use((req, res, next) => {
  const serveStatic = distDirForHost(req.hostname) === englishDistDir ? englishStatic : hubStatic
  serveStatic(req, res, next)
})

// Mọi route không khớp đều trả index.html của ĐÚNG app theo Host (React Router xử lý routing
// phía client). index.html KHÔNG được cache — luôn lấy bản mới để tham chiếu đúng tên chunk
// (có hash) sau mỗi lần deploy; nếu cache index.html cũ sẽ trỏ tới chunk đã biến mất → 404
// chunk → màn hình trắng.
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.sendFile(path.join(distDirForHost(req.hostname), 'index.html'))
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
  startReminderScheduler()
  startPlanExpiryScheduler()
  // Báo PM2 là app ĐÃ nhận request được (đi với wait_ready trong ecosystem.config.cjs).
  // Khi reload, PM2 đợi tín hiệu này từ process MỚI rồi mới tắt process CŨ → không có
  // khoảng chết. Chạy ngoài PM2 (npm start tay) thì process.send không tồn tại → bỏ qua.
  process.send?.('ready')
})

// WebSocket chat gắn vào CHÍNH http.Server này (không mở cổng riêng) — xem
// packages/core-chat/wsHandler.ts.
attachChatWebSocketServer(server)
attachVoiceWebSocketServer(server)

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

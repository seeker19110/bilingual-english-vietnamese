// server.ts — Express server chạy trên VPS (thay thế Vercel Edge Runtime)
// Bọc lại các handler trong api/*.ts mà không cần sửa logic bên trong.
//
// Cách chạy:
//   Development : npm run dev  (Vite dev server, không dùng file này)
//   Production  : npm start    (file này, chạy qua PM2)

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'

// Nạp biến môi trường từ .env — phải chạy trước khi import các handler
// vì handler đọc process.env ngay lúc module load
dotenv.config()

import ttsHandler from './api/tts.js'
import claudeHandler from './api/claude.js'
import pronunciationHandler from './api/pronunciation.js'
import sttHandler from './api/stt.js'
import pushHandler from './api/push.js'

const app = express()

// STT nhận audio base64 → body lớn hơn nhiều so với chat/tts. Đăng ký parser riêng
// cho route này TRƯỚC parser JSON 64kb mặc định bên dưới (Express chạy middleware theo
// thứ tự — nếu để parser 64kb chạy trước, body audio sẽ bị chặn 413 trước khi tới handler).
app.post('/api/stt', express.json({ limit: '10mb' }), wrapEdge(sttHandler))

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
        body: ['GET', 'HEAD'].includes(req.method)
          ? undefined
          : JSON.stringify(req.body),
      })

      // Gọi handler gốc
      const webRes = await handler(webReq)

      // Chuyển Web API Response → Express response
      res.status(webRes.status)
      webRes.headers.forEach((val, key) => res.setHeader(key, val))
      res.send(await webRes.text())
    } catch (err) {
      console.error('[server] Lỗi handler:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// ── Health check ────────────────────────────────────────────────────────────
// Endpoint nhẹ để PM2 / Nginx / uptime monitor kiểm tra app còn sống không.
// Không gọi AI, không đụng DB → trả lời tức thì, không tốn tiền.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() })
})

// ── API routes ────────────────────────────────────────────────────────────────
// Thêm vào đây nếu tạo thêm file api/*.ts mới
app.all('/api/tts', wrapEdge(ttsHandler))
app.all('/api/claude', wrapEdge(claudeHandler))
app.all('/api/pronunciation', wrapEdge(pronunciationHandler))
app.all('/api/push', wrapEdge(pushHandler))

// ── Phục vụ file upload local (audio cache khi STORAGE_DRIVER=local) ────────
// Nginx cũng có thể serve trực tiếp nhưng Express làm backup nếu cần
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }))

// ── Phục vụ frontend (React build) ───────────────────────────────────────────
// Cache file tĩnh 1 ngày — trừ index.html để luôn lấy bản mới nhất
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1d',
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      }
    },
  }),
)

// Mọi route không khớp đều trả index.html (React Router xử lý phía client)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ── Khởi động ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ English Tutor đang chạy tại http://localhost:${PORT}`)
  console.log(`   NODE_ENV : ${process.env.NODE_ENV || 'production'}`)
  console.log(`   Node.js  : ${process.version}`)
})

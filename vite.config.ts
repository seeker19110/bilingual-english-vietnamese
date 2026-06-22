import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

export default defineConfig(({ mode }) => {
  // Đọc các biến môi trường server-only trực tiếp từ file .env (Node) —
  // các biến này KHÔNG có tiền tố VITE_ nên sẽ không bị Vite đóng gói vào file JS gửi cho browser.
  const env = loadEnv(mode, process.cwd(), '')

  // api/*.ts đọc key bằng process.env.X (giống lúc chạy thật trên Vercel, nơi Vercel tự inject
  // Environment Variables vào process.env). Lúc "npm run dev", .env KHÔNG tự nạp vào process.env
  // nên ta gán tay các biến server-only cần dùng.
  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_TTS_API_KEY', 'TTS_ENCRYPTION_MASTER_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GROQ_API_KEY', 'GROQ_CHAT_MODEL', 'STT_MODEL', 'OPENAI_STT_MODEL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  // /api/claude giờ do dev middleware gọi thẳng handler api/claude.ts (xem API_ROUTES bên dưới)
  // — không proxy thẳng tới Anthropic nữa, để handler tự chọn nhà cung cấp (Groq/Anthropic).
  return {
    plugins: [react(), apiEdgeDevMiddleware()],
  }
})

// ── Dev middleware cho các Edge Function trong api/ ─────────────────────────
// api/pronunciation.ts và api/tts.ts là Vercel Edge Function thật (chỉ tự chạy khi deploy).
// Lúc "npm run dev", Vite không biết gì về thư mục api/ — plugin này gọi thẳng handler đó
// mỗi khi có request tới các route tương ứng, để test được ngay ở máy mình mà không cần
// deploy hoặc cài "vercel dev". Cùng 1 file logic dùng cho cả dev và production.
//
// Bảng ánh xạ route → file handler. Thêm endpoint mới chỉ cần thêm 1 dòng ở đây.
const API_ROUTES: { prefix: string; module: string }[] = [
  { prefix: '/api/pronunciation', module: '/api/pronunciation.ts' },
  { prefix: '/api/tts', module: '/api/tts.ts' },
  { prefix: '/api/stt', module: '/api/stt.ts' },
  { prefix: '/api/claude', module: '/api/claude.ts' },
]

function apiEdgeDevMiddleware(): Plugin {
  return {
    name: 'api-edge-dev-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const route = req.url ? API_ROUTES.find(r => req.url!.startsWith(r.prefix)) : undefined
        if (!route) {
          next()
          return
        }

        try {
          // Đọc body cho các method có payload (POST) — /api/tts nhận JSON body.
          const body = await readRequestBody(req)

          // ssrLoadModule: để Vite tự biên dịch TypeScript + import nội bộ (./_lib/...)
          // bằng đúng pipeline thật, không phải viết/duy trì 2 bản logic khác nhau.
          const mod = (await server.ssrLoadModule(route.module)) as {
            default: (request: Request) => Promise<Response>
          }
          const request = new Request(new URL(req.url!, 'http://localhost'), {
            method: req.method,
            headers: {
              'content-type': req.headers['content-type'] ?? 'application/json',
              // /api/tts cần header này để biết user đã đăng nhập chưa (trả khoá giải mã hay không)
              ...(req.headers['authorization'] ? { authorization: req.headers['authorization'] as string } : {}),
            },
            // GET/HEAD không được có body trong Fetch API
            body: req.method && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
          })
          const response = await mod.default(request)

          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (err) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: (err as Error).message }))
        }
      })
    },
  }
}

// Gom toàn bộ body của request thành chuỗi (dùng cho POST /api/tts khi chạy dev).
function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => { data += chunk.toString() })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

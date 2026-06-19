import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

export default defineConfig(({ mode }) => {
  // Đọc các biến môi trường server-only trực tiếp từ file .env (Node) —
  // các biến này KHÔNG có tiền tố VITE_ nên sẽ không bị Vite đóng gói vào file JS gửi cho browser.
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ANTHROPIC_API_KEY

  // api/pronunciation.ts đọc key bằng process.env.X (giống lúc chạy thật trên Vercel,
  // nơi Vercel tự inject Environment Variables vào process.env). Lúc "npm run dev",
  // .env KHÔNG tự nạp vào process.env nên ta gán tay các biến server-only cần dùng.
  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_TTS_API_KEY']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [react(), pronunciationDevMiddleware()],
    server: {
      proxy: {
        // Proxy /api/claude → api.anthropic.com để tránh CORS khi dev.
        // Server tự gắn API key vào header — frontend không hề biết key.
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/claude/, '/v1/messages'),
          configure: (proxy: { on: (event: string, cb: (proxyReq: { setHeader: (k: string, v: string) => void }) => void) => void }) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) proxyReq.setHeader('x-api-key', apiKey)
              proxyReq.setHeader('anthropic-version', '2023-06-01')
            })
          },
        },
      },
    },
  }
})

// ── Dev middleware cho /api/pronunciation ──────────────────────────────────
// api/pronunciation.ts là 1 Vercel Edge Function thật (chỉ tự chạy khi deploy lên Vercel).
// Lúc "npm run dev", Vite không biết gì về thư mục api/ — plugin này gọi thẳng handler đó
// mỗi khi có request tới /api/pronunciation, để test được ngay ở máy mình mà không cần
// deploy hoặc cài "vercel dev". Cùng 1 file logic dùng cho cả dev và production.
function pronunciationDevMiddleware(): Plugin {
  return {
    name: 'pronunciation-api-dev-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url || !req.url.startsWith('/api/pronunciation')) {
          next()
          return
        }

        try {
          // ssrLoadModule: để Vite tự biên dịch TypeScript + import nội bộ (./_lib/...)
          // bằng đúng pipeline thật, không phải viết/duy trì 2 bản logic khác nhau.
          const mod = (await server.ssrLoadModule('/api/pronunciation.ts')) as {
            default: (request: Request) => Promise<Response>
          }
          const request = new Request(new URL(req.url, 'http://localhost'), { method: req.method })
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

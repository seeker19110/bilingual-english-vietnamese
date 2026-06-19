import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Đọc ANTHROPIC_API_KEY trực tiếp từ file .env phía server (Node) —
  // biến này KHÔNG có tiền tố VITE_ nên sẽ không bị Vite đóng gói vào file JS gửi cho browser.
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ANTHROPIC_API_KEY

  return {
    plugins: [react()],
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

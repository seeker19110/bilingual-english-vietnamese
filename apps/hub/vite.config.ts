import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// apps/hub — trang giới thiệu tổng thể nền tảng "Đồng hành cùng bạn" (PR-7,
// docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md §7). Vite app ĐỘC LẬP với
// apps/english (không dùng chung vite.config.ts gốc) — tránh đụng cấu hình build phức
// tạp (dev middleware gọi API, code-splitting) của app tiếng Anh đang chạy thật.
//
// Dev: /api/* proxy sang server.ts (Express) đang chạy ở cổng 3001 — hub chỉ gọi 2 API
// công khai, không cần auth: /api/plan-prices (bảng giá) và /api/hub-stats (số liệu tổng).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

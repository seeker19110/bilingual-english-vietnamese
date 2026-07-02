import { defineConfig } from 'vitest/config'

// Cấu hình test (Vitest). Dùng happy-dom để có localStorage/window cho các hàm
// đụng tới bộ nhớ trình duyệt. Chạy file *.test.ts(x) trong src/ và api/ (serverless functions).
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.{ts,tsx}'],
  },
})

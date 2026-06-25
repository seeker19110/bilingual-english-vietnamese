import { defineConfig } from 'vitest/config'

// Cấu hình test (Vitest). Dùng happy-dom để có localStorage/window cho các hàm
// đụng tới bộ nhớ trình duyệt. Chỉ chạy file *.test.ts(x) trong src/.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
    // Mock fetch('/data/...') → đọc thẳng public/ để test chạy offline (không cần server).
    setupFiles: ['./vitest.setup.ts'],
  },
})

import { defineConfig } from 'vitest/config'

// Cấu hình test (Vitest). Dùng happy-dom để có localStorage/window cho các hàm
// đụng tới bộ nhớ trình duyệt. Chỉ chạy file *.test.ts(x) trong src/.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
    // Mock fetch('/data/...') → đọc thẳng public/ để test chạy offline (không cần server).
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      // v8 = đo coverage bằng bộ máy V8 (nhanh, không cần biến đổi mã).
      provider: 'v8',
      // Chỉ đo phần LOGIC THUẦN (lib + api). Bỏ UI (.tsx/pages/components),
      // điểm khởi tạo (server.ts) và dữ liệu tĩnh — nơi unit test ít giá trị.
      include: ['src/lib/**/*.ts', 'api/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
      reporter: ['text', 'text-summary', 'html'],
      // "Coverage ratchet": ngưỡng SÀN = "không tệ hơn hiện tại" (đo 2026-06,
      // đặt thấp hơn baseline vài điểm để chống tụt, KHÔNG gây gãy do làm tròn).
      // Khi thêm test mới → NÂNG DẦN các số này. Xem PROGRESS.md.
      thresholds: {
        statements: 13,
        branches: 80,
        functions: 50,
        lines: 13,
      },
    },
  },
})

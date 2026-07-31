import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Cấu hình test (Vitest). Dùng happy-dom để có localStorage/window cho các hàm
// đụng tới bộ nhớ trình duyệt. Chỉ chạy file *.test.ts(x) trong src/.
// resolve.alias tách riêng khỏi vite.config.ts (2 config không merge) — @core/* phải trỏ
// đúng packages/core-ui/ như production để test không lệch alias với build thật.
export default defineConfig({
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./packages/core-ui', import.meta.url)),
      '@english': fileURLToPath(new URL('./apps/english/src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    // scripts/**/*.test.ts = test cho tiện ích script THUẦN (vd scripts/lib/evalScoring.test.ts) —
    // không tốn API, chỉ logic. KHÔNG gồm chính script chạy AI (scripts/eval-tutor.ts) vì nó tốn phí.
    include: [
      'apps/english/src/**/*.test.{ts,tsx}',
      'api/**/*.test.ts',
      'packages/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
    ],
    // Mock fetch('/data/...') → đọc thẳng public/ để test chạy offline (không cần server).
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      // v8 = đo coverage bằng bộ máy V8 (nhanh, không cần biến đổi mã).
      provider: 'v8',
      // Chỉ đo phần LOGIC THUẦN (lib + api). Bỏ UI (.tsx/pages/components),
      // điểm khởi tạo (server.ts) và dữ liệu tĩnh — nơi unit test ít giá trị.
      include: ['apps/english/src/lib/**/*.ts', 'api/**/*.ts', 'packages/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
      reporter: ['text', 'text-summary', 'html'],
      // "Coverage ratchet": ngưỡng SÀN = "không tệ hơn hiện tại" (đo 2026-07-24:
      // stmts/lines 49.94 · branches 88.47 · funcs 78.04 — đặt thấp hơn số đo chút để
      // chống tụt, KHÔNG gây gãy do làm tròn hoặc dao động nhỏ giữa các lượt chạy.
      // Khi thêm test mới → NÂNG DẦN các số này. Xem PROGRESS.md.
      thresholds: {
        statements: 48,
        branches: 87,
        functions: 76,
        lines: 48,
      },
    },
  },
})

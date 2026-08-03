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
      // Loại khỏi phép đo những file mà unit test KHÔNG mang lại giá trị thật — chúng chỉ là
      // lớp vỏ mỏng bọc API trình duyệt/nền tảng, hoặc hook React, hoặc mã khởi tạo. Test cho
      // chúng chủ yếu kiểm chứng chính cái mock ta vừa dựng, gãy mỗi lần refactor, và rủi ro
      // thật đã được E2E che. Giữ chúng trong phép đo chỉ làm loãng con số coverage.
      // (Quyết định 2026-08-03 — xem PROGRESS.md.)
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        // Chỉ khai báo kiểu, không có mã chạy.
        '**/types.ts',
        // Vỏ bọc thiết bị ghi âm/ghi hình (MediaRecorder, getUserMedia).
        'apps/english/src/lib/audioRecorder.ts',
        'apps/english/src/lib/sttServer.ts',
        'apps/english/src/lib/challengeRecorder.ts',
        // Vỏ bọc Web Speech API.
        'apps/english/src/lib/stt.ts',
        // Vỏ bọc IndexedDB.
        'apps/english/src/lib/audioCache.ts',
        'apps/english/src/lib/challengeVideo.ts',
        // Vỏ bọc API trình duyệt lặt vặt (vibrate, canvas fingerprint, AudioContext, DOM effect).
        'apps/english/src/lib/haptics.ts',
        'apps/english/src/lib/deviceId.ts',
        'apps/english/src/lib/confetti.ts',
        'apps/english/src/lib/sound.ts',
        // Service worker / Web Push.
        'apps/english/src/lib/pushNotif.ts',
        // Nạp trước dữ liệu & chunk — chỉ là điều phối fetch, không có logic nghiệp vụ.
        'apps/english/src/lib/preloadBrowse.ts',
        'apps/english/src/lib/preloadState.ts',
        'apps/english/src/lib/preloader.ts',
        'apps/english/src/lib/dataPrecache.ts',
        'apps/english/src/lib/lazyWithRetry.ts',
        // Hook React — thuộc phạm vi test UI, không phải unit test logic thuần.
        'apps/english/src/lib/useCloudSync.ts',
        'apps/english/src/lib/useOneHandedDrag.ts',
        'apps/english/src/lib/useApiThrottle.ts',
        // Gửi-rồi-quên / khởi tạo SDK ngoài.
        'apps/english/src/lib/analytics.ts',
        'apps/english/src/lib/errorTracking.ts',
        'api/_lib/sentry.ts',
        // Tạo connection pool — chạy thật cần Postgres, đã có test tích hợp che.
        'packages/core-db/pgPool.ts',
      ],
      reporter: ['text', 'text-summary', 'html'],
      // "Coverage ratchet": ngưỡng SÀN = "không tệ hơn hiện tại" (đo 2026-08-01, sau khi thêm
      // test cho authHeader.ts/plan-features.ts/plan-marketing.ts/authService.ts: stmts/lines
      // 55.9 · branches 87.56 · funcs 82.24 — đặt thấp hơn số đo chút để chống tụt, KHÔNG gây
      // gãy do làm tròn hoặc dao động nhỏ giữa các lượt chạy. Khi thêm test mới → NÂNG DẦN các
      // số này. Xem PROGRESS.md.
      thresholds: {
        statements: 55,
        branches: 87,
        functions: 81,
        lines: 55,
      },
    },
  },
})

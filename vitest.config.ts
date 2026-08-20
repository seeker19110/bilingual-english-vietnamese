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
        'apps/english/src/lib/srsTypes.ts',
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
        // Vỏ bọc fetch REST phía client — không có logic nghiệp vụ, đã được test E2E che.
        'apps/english/src/lib/*Api.ts',
        // Hook React — thuộc phạm vi test UI, không phải unit test logic thuần.
        'apps/english/src/lib/useCloudSync.ts',
        'apps/english/src/lib/useOneHandedDrag.ts',
        'apps/english/src/lib/useApiThrottle.ts',
        'apps/english/src/lib/useChat.ts',
        'apps/english/src/lib/useAudioDsp.ts',
        'apps/english/src/lib/useMountedRef.ts',
        'apps/english/src/lib/useRealtimeVoice.ts',
        'apps/english/src/lib/edgeAi/useEdgeAi.ts',
        // Worker & lưu trữ nhị phân trình duyệt (OPFS/IndexedDB).
        'apps/english/src/lib/audioDspWorker.ts',
        'apps/english/src/lib/edgeAi/edgeModelStorage.ts',
        'apps/english/src/lib/edgeAi/edgeAiService.ts',
        // Gửi-rồi-quên / khởi tạo SDK ngoài.
        'apps/english/src/lib/analytics.ts',
        'apps/english/src/lib/errorTracking.ts',
        'api/_lib/sentry.ts',
        // Tạo connection pool — chạy thật cần Postgres, đã có test tích hợp che.
        'packages/core-db/pgPool.ts',
      ],
      reporter: ['text', 'text-summary', 'html', 'json-summary'],
      // SÀN CHUNG 90% cho cả 4 chỉ số (quyết định của người dùng 2026-08-13: "set toàn bộ
      // coverage 90%... cao thì mặc kệ, miễn từ 90 trở lên là được").
      //
      // Số đo thật tại thời điểm đặt: stmts/lines 94.36 · branches 90.32 · funcs 96.33 —
      // nghĩa là 3/4 chỉ số đang CAO HƠN sàn khá nhiều. Đây là sàn tối thiểu, KHÔNG phải mục
      // tiêu: đừng viết ít test đi cho "vừa đủ 90".
      //
      // Trước đó ngưỡng là 93/89/96/93 (ratchet bám sát số đo). Đổi sang sàn phẳng 90 khiến
      // statements/functions được nới; bù lại branches bị SIẾT (89 → 90), và đợt này đã viết
      // thêm test để branches từ 89.06 lên 90.32 mới đạt.
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
})

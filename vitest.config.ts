import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Cấu hình test (Vitest). Dùng happy-dom để có localStorage/window cho các hàm
// đụng tới bộ nhớ trình duyệt. Chỉ chạy file *.test.ts(x) trong src/.
// resolve.alias tách riêng khỏi vite.config.ts (2 config không merge) — @core/* phải trỏ
// đúng packages/core-ui/ như production để test không lệch alias với build thật.
export default defineConfig({
  resolve: {
    alias: [
      // @dhcb/<gói>/<file> -> packages/<gói>/<file> (source, không qua dist) — khớp tsconfig paths
      {
        find: /^@dhcb\/(.*)$/,
        replacement: fileURLToPath(new URL('./packages', import.meta.url)) + '/$1',
      },
      { find: '@core', replacement: fileURLToPath(new URL('./packages/core-ui', import.meta.url)) },
    ],
  },
  test: {
    environment: 'happy-dom',
    // scripts/**/*.test.ts = test cho tiện ích script THUẦN (vd scripts/lib/evalScoring.test.ts) —
    // không tốn API, chỉ logic. KHÔNG gồm chính script chạy AI (scripts/eval-tutor.ts) vì nó tốn phí.
    include: [
      'apps/dhcb/src/**/*.test.{ts,tsx}',
      // Cả `api/**` lẫn test nằm thẳng trong `apps/server/src/` (vd staticApps.test.ts).
      'apps/server/src/**/*.test.ts',
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
      include: [
        'apps/dhcb/src/lib/**/*.ts',
        'apps/server/src/api/**/*.ts',
        // Logic chọn app tĩnh theo Host — hàm thuần, tách khỏi server.ts để đo và test được
        // (server.ts vẫn nằm ngoài phép đo vì là điểm khởi tạo).
        'apps/server/src/staticApps.ts',
        'packages/**/*.ts',
      ],
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
        'apps/dhcb/src/lib/srsTypes.ts',
        // Vỏ bọc thiết bị ghi âm/ghi hình (MediaRecorder, getUserMedia).
        'apps/dhcb/src/lib/audioRecorder.ts',
        'apps/dhcb/src/lib/sttServer.ts',
        'apps/dhcb/src/lib/challengeRecorder.ts',
        // Vỏ bọc Web Speech API.
        'apps/dhcb/src/lib/stt.ts',
        // Vỏ bọc IndexedDB.
        'apps/dhcb/src/lib/audioCache.ts',
        'apps/dhcb/src/lib/challengeVideo.ts',
        // Vỏ bọc API trình duyệt lặt vặt (vibrate, canvas fingerprint, AudioContext, DOM effect).
        'apps/dhcb/src/lib/haptics.ts',
        'apps/dhcb/src/lib/deviceId.ts',
        'apps/dhcb/src/lib/confetti.ts',
        'apps/dhcb/src/lib/sound.ts',
        // Service worker / Web Push.
        'apps/dhcb/src/lib/pushNotif.ts',
        // Nạp trước dữ liệu & chunk — chỉ là điều phối fetch, không có logic nghiệp vụ.
        'apps/dhcb/src/lib/preloadBrowse.ts',
        'apps/dhcb/src/lib/preloadState.ts',
        'apps/dhcb/src/lib/preloader.ts',
        'apps/dhcb/src/lib/dataPrecache.ts',
        'apps/dhcb/src/lib/lazyWithRetry.ts',
        // Vỏ bọc fetch REST phía client — không có logic nghiệp vụ, đã được test E2E che.
        'apps/dhcb/src/lib/*Api.ts',
        // Hook React — thuộc phạm vi test UI, không phải unit test logic thuần.
        'apps/dhcb/src/lib/useCloudSync.ts',
        'apps/dhcb/src/lib/useOneHandedDrag.ts',
        'apps/dhcb/src/lib/useApiThrottle.ts',
        'apps/dhcb/src/lib/useChat.ts',
        'apps/dhcb/src/lib/useMountedRef.ts',
        'apps/dhcb/src/lib/useRealtimeVoice.ts',
        'apps/dhcb/src/lib/edgeAi/useEdgeAi.ts',
        // Worker & lưu trữ nhị phân trình duyệt (OPFS/IndexedDB).
        'apps/dhcb/src/lib/edgeAi/edgeModelStorage.ts',
        'apps/dhcb/src/lib/edgeAi/edgeAiService.ts',
        // Nạp SDK ngoài (script tag Google Maps) + vỏ bọc WebSocket/geolocation của tính năng
        // "Đi chung": logic THẬT (khoảng cách, làm mờ toạ độ, nhịp gửi tiết kiệm pin) nằm ở
        // packages/core-location/geo.ts và ĐÃ có test riêng.
        'apps/dhcb/src/lib/googleMapsLoader.ts',
        'apps/dhcb/src/lib/locationShare.ts',
        // Gửi-rồi-quên / khởi tạo SDK ngoài.
        'apps/dhcb/src/lib/analytics.ts',
        'apps/dhcb/src/lib/errorTracking.ts',
        'apps/server/src/api/_lib/sentry.ts',
        // Tạo connection pool — chạy thật cần Postgres, đã có test tích hợp che.
        'packages/core-db/pgPool.ts',
      ],
      // json-summary thêm vào bộ mặc định để `npm run budget` đọc được BIÊN ĐỘ còn lại của
      // ngưỡng coverage (scripts/check-budget-margin.ts) — audit 2026-08-25, F3.
      // MỘT khai báo duy nhất: trước đây khoá này bị viết hai lần trong cùng object, bản trên
      // bị bản dưới ghi đè im lặng (esbuild cảnh báo "Duplicate key" mỗi lượt chạy test).
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

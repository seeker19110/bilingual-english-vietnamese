// ecosystem.config.cjs — Cấu hình PM2 cho VPS
//
// Dùng .cjs vì package.json khai báo "type": "module" —
// PM2 đọc file này theo CommonJS nên cần đuôi .cjs.
//
// Cách dùng:
//   pm2 start ecosystem.config.cjs
//   pm2 reload ecosystem.config.cjs   ← zero-downtime khi update code
//
// [2026-07-20] ĐÃ THỬ cluster mode (1 instance) + wait_ready để reload
// zero-downtime thật, nhưng cluster mode + loader ESM (`--import tsx`) làm
// worker crash ngay khi khởi động mà KHÔNG in được log gì (silent crash) —
// lỗi tương thích đã biết giữa Node cluster module và custom ESM loader.
// ROLLBACK về fork mode để khôi phục dịch vụ.
//
// [2026-07-25] ĐÃ GỠ nguyên nhân crash: thêm bước biên dịch server.ts + api/**/*.ts
// thành JS thật qua `npm run build:server` (xem tsconfig.server.json), production giờ
// chạy `node dist-server/server.js` trực tiếp — KHÔNG còn qua loader `tsx` nữa, nên
// cluster mode chạy được. Bật lại `wait_ready`/`kill_timeout` (server.ts đã có sẵn
// `process.send('ready')` + graceful shutdown từ lần thử trước, chỉ chưa được PM2 đọc).
// QUAN TRỌNG: phải chạy `npm run build` (gồm build:server) trên VPS TRƯỚC MỖI lần
// `pm2 start`/`pm2 reload` — xem docs/deploy-vps-ubuntu.md.
// LƯU Ý: deploy đầu tiên sau PR này chạy `pm2 reload` như cũ (không đổi được
// exec_mode process đang chạy) → cluster mode CHƯA áp dụng thật sự cho tới khi
// `scripts/pm2-reload.sh` (đã sửa để tự phát hiện đổi exec_mode và `pm2 delete`+
// `pm2 start` lại khi cần) được deploy — xem PROGRESS.md mục nợ kỹ thuật.
//
// QUAN TRỌNG: Phải dùng Node.js >= 22. Node 20 thiếu WebSocket gốc nên
// Supabase auth (supabase.auth.getUser) ném lỗi → mọi request đăng nhập
// bị AUTH_FAILED.
// VPS này dùng Node hệ thống (không qua NVM) — Ubuntu 24.04, Node v22.22.3.
// Lấy đường dẫn bằng:
//   which node
// Rồi cập nhật giá trị interpreter bên dưới cho khớp.

module.exports = {
  apps: [
    {
      name: 'english-tutor',

      // Chạy JS đã biên dịch sẵn (npm run build:server) — không qua loader tsx nữa,
      // đây là điều kiện để cluster mode chạy được (xem ghi chú 2026-07-25 ở trên).
      script: './dist-server/server.js',

      // Cluster mode: PM2 tự fork N tiến trình (N = số CPU core) và cân tải round-robin
      // qua cổng chung — tận dụng nhiều core thay vì 1 tiến trình fork như trước.
      instances: 'max',
      exec_mode: 'cluster',

      // Zero-downtime thật khi reload: PM2 đợi tiến trình MỚI gửi tín hiệu 'ready'
      // (server.ts đã có sẵn `process.send?.('ready')` sau `app.listen` — viết từ
      // 2026-07-20, trước đây không phát huy tác dụng vì thiếu 2 dòng dưới đây) rồi
      // mới tắt tiến trình CŨ — không có khoảng chết giữa 2 lần deploy.
      wait_ready: true,
      listen_timeout: 10000, // tối đa 10s chờ 'ready', không thì coi như lỗi khởi động

      // server.ts tự thoát êm tối đa 5s khi nhận SIGINT/SIGTERM (chờ request đang chạy
      // xong). PM2 mặc định kill_timeout 1.6s — QUÁ NGẮN, sẽ SIGKILL trước khi server
      // kịp thoát êm, cắt ngang request đang chạy dở. Đặt dài hơn 5s của server.ts.
      kill_timeout: 5500,

      // !! Sửa đường dẫn này thành kết quả của lệnh: which node
      // VPS hiện tại (Ubuntu 24.04, Node hệ thống v22.22.3): /usr/bin/node
      // (bắt buộc Node >= 22 — xem ghi chú WebSocket phía trên)
      interpreter: '/usr/bin/node',

      // Biến môi trường production — các secret vẫn để trong .env
      // PORT=3001 vì cổng 3000 đã bị app "xboss" (Next.js) chiếm trên VPS này
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Tự restart nếu app crash, giới hạn 10 lần/phút để tránh vòng lặp vô tận
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Ghi log ra file (xem bằng: pm2 logs english-tutor)
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Xoay vòng log khi file quá 10MB
      merge_logs: true,
    },
  ],
}

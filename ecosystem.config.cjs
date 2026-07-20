// ecosystem.config.cjs — Cấu hình PM2 cho VPS
//
// Dùng .cjs vì package.json khai báo "type": "module" —
// PM2 đọc file này theo CommonJS nên cần đuôi .cjs.
//
// Cách dùng:
//   pm2 start ecosystem.config.cjs
//   bash scripts/pm2-reload.sh           ← reload zero-downtime (deploy dùng script này)
//
// ZERO-DOWNTIME (từ 2026-07-20): chạy CLUSTER MODE (1 instance) + wait_ready.
// Khi reload, PM2 khởi động process MỚI, đợi nó báo 'ready' (server.ts gửi sau khi
// app.listen thành công) rồi MỚI tắt process cũ → không còn khoảng chết ~10s như
// fork mode (fork mode reload = tắt cũ trước, khởi động mới sau).
//
// LƯU Ý CHUYỂN ĐỔI: PM2 KHÔNG đổi được exec_mode qua "pm2 reload" — lần đầu áp
// cấu hình này phải "pm2 delete english-tutor && pm2 start ecosystem.config.cjs"
// (scripts/pm2-reload.sh tự phát hiện và làm việc này, chịu vài giây downtime MỘT lần).
//
// QUAN TRỌNG: Phải dùng Node.js >= 22. Node 20 thiếu WebSocket gốc nên auth ném lỗi.
// Cluster mode luôn chạy bằng node của chính PM2 (bỏ qua trường interpreter) —
// VPS này cài PM2 bằng Node hệ thống v22 (/usr/bin/node, không qua NVM) nên khớp.
// Kiểm tra bằng: pm2 info english-tutor → dòng "node.js version".

module.exports = {
  apps: [
    {
      name: 'english-tutor',

      // Cluster mode bắt buộc script là file chạy bằng node → chạy thẳng server.ts
      // với loader tsx nạp qua node_args (không qua binary ./node_modules/.bin/tsx
      // như fork mode cũ — binary đó spawn process con, phá cơ chế chia port cluster).
      script: 'server.ts',
      // Khai báo tường minh 'node' — không thì PM2 tự đoán interpreter theo đuôi
      // file .ts (một số bản PM2 đoán ra 'bun'), VPS không cài bun nên start lỗi.
      interpreter: 'node',
      node_args: '--import tsx',
      exec_mode: 'cluster',
      instances: 1,

      // Đợi tín hiệu process.send('ready') từ app (server.ts) tối đa 30s trước khi
      // coi là online — cốt lõi của reload zero-downtime.
      wait_ready: true,
      listen_timeout: 30000,
      // Sau khi gửi SIGINT cho process cũ, đợi tối đa 8s cho graceful shutdown rồi SIGKILL.
      kill_timeout: 8000,

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

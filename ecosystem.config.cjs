// ecosystem.config.cjs — Cấu hình PM2 cho VPS
//
// Dùng .cjs vì package.json khai báo "type": "module" —
// PM2 đọc file này theo CommonJS nên cần đuôi .cjs.
//
// Cách dùng:
//   pm2 start ecosystem.config.cjs
//   pm2 reload ecosystem.config.cjs   ← zero-downtime khi update code
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

      // Dùng tsx để chạy TypeScript trực tiếp — không cần bước compile thêm
      script: './node_modules/.bin/tsx',
      args: 'server.ts',

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

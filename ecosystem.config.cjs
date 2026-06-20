// ecosystem.config.cjs — Cấu hình PM2 cho VPS
//
// Dùng .cjs vì package.json khai báo "type": "module" —
// PM2 đọc file này theo CommonJS nên cần đuôi .cjs.
//
// Cách dùng:
//   pm2 start ecosystem.config.cjs
//   pm2 reload ecosystem.config.cjs   ← zero-downtime khi update code
//
// QUAN TRỌNG: Sau khi cài NVM trên VPS, chạy lệnh này để lấy đường dẫn Node 20:
//   nvm which 20
// Rồi cập nhật giá trị interpreter bên dưới cho khớp.

module.exports = {
  apps: [
    {
      name: 'english-tutor',

      // Dùng tsx để chạy TypeScript trực tiếp — không cần bước compile thêm
      script: './node_modules/.bin/tsx',
      args: 'server.ts',

      // !! Sửa đường dẫn này thành kết quả của lệnh: nvm which 20
      // Ví dụ: /root/.nvm/versions/node/v20.19.0/bin/node
      interpreter: '/root/.nvm/versions/node/v20.19.0/bin/node',

      // Biến môi trường production — các secret + PORT để trong .env
      // (KHÔNG ép cứng PORT ở đây để .env tự quyết định cổng, tránh xung đột
      //  khi VPS đã có app khác chiếm cổng 3000)
      env: {
        NODE_ENV: 'production',
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

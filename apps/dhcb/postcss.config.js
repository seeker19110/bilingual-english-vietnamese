import { fileURLToPath } from 'node:url'

// Chỉ định ĐƯỜNG DẪN TUYỆT ĐỐI tới tailwind.config.js — plugin tailwindcss mặc định tìm
// config theo cwd (gốc repo khi chạy npm script), sẽ KHÔNG thấy config đã dời vào apps/dhcb
// (PR-S2) → CSS mất sạch utilities (đã bắt được qua size-limit: 15.75 kB tụt còn 2.44 kB).
export default {
  plugins: {
    tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) },
    autoprefixer: {},
  },
}

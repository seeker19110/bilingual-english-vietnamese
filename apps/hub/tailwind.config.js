/** @type {import('tailwindcss').Config} */
export default {
  // hub dùng bảng màu Tailwind mặc định (zinc + emerald) — CHƯA nối vào hệ design-token
  // --a-*/--z-* (đổi 4 theme) của apps/english/src/index.css. Cố ý đơn giản hoá: hub là
  // trang giới thiệu tĩnh, không có ThemeToggle/đăng nhập cá nhân hoá theme. Khi
  // packages/core-ui đủ trưởng thành (theme.ts hiện chưa tách, xem PROGRESS.md mục PR-6),
  // cân nhắc nối hub vào cùng hệ token thay vì màu Tailwind mặc định.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}

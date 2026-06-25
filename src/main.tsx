import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { applyTheme, getTheme } from './lib/theme'

// Áp dụng theme đã lưu NGAY trước khi render để tránh nhấp nháy màu
applyTheme(getTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Đăng ký service worker để app cài được lên màn hình chính (PWA) và mở nhanh hơn.
// Chỉ chạy ở bản build thật (production) để khỏi vướng cache lúc đang dev.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Không sao nếu trình duyệt chặn/không hỗ trợ — app vẫn chạy bình thường.
    })
  })
}

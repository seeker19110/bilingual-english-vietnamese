import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, getTheme } from '@core/theme'
import { ThemeProvider } from '@core/ThemeProvider'
import App from './App'
import './index.css'

// Áp dụng theme đã lưu (hoặc dark-blue mặc định) ngay trước khi render để tránh giật giao diện
applyTheme(getTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

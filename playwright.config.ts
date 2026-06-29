import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Cổng dev server riêng cho E2E (tránh đụng 5173 nếu đang chạy dev tay).
const PORT = 5179
const baseURL = `http://localhost:${PORT}`

// Dùng Chromium cài sẵn của môi trường nếu có (KHÔNG chạy "playwright install");
// nếu không (vd. CI tự cài browser), để trống cho Playwright tự tìm bản của nó.
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(chromiumPath) ? { executablePath: chromiumPath } : {}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions,
      },
    },
  ],
  webServer: {
    // src/lib/supabase.ts gọi createClient khi nạp module → cần URL/key hợp lệ
    // để không ném "supabaseUrl is required". Giá trị giả: app vẫn render bình
    // thường, chỉ không đăng nhập THẬT (E2E tự giả session — xem e2e/helpers/auth.ts).
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_SUPABASE_URL: 'https://e2e.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'e2e-anon-key-not-real',
    },
  },
})

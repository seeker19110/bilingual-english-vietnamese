import type { Page } from '@playwright/test'

// Giả "đã đăng nhập" cho E2E: gieo trước token Bearer giả (đúng key mà
// src/lib/authHeader.ts đọc — gsa_session_token_v1) + chặn network `GET
// /api/auth?action=me` (gọi thật khi AuthProvider mount, xem src/lib/auth.ts
// getCurrentUser()) trả về profile giả — E2E chạy bằng `npm run dev` (Vite),
// không có backend Postgres thật nên không thể để request đó đi thật.
const TOKEN_KEY = 'gsa_session_token_v1'
// Export để các file E2E khác seed localStorage đúng key theo user (vd `et_challenge_<uid>`).
export const USER_ID = 'e2e-user-0001'

// Tên 4 theme (đồng bộ src/lib/theme.ts). Dùng để E2E quét a11y ở mọi theme.
export type ThemeName = 'dark-blue' | 'blue-sky' | 'pink' | 'vibrant'

export async function mockLogin(
  page: Page,
  uiLang: 'vi' | 'en' = 'vi',
  theme?: ThemeName,
): Promise<void> {
  const profile = {
    id: USER_ID,
    email: 'e2e@example.com',
    name: 'E2E User',
    plan: 'free',
    onboarded: true,
  }

  await page.addInitScript(
    (data) => {
      localStorage.setItem(data.tokenKey, 'e2e-fake-token')
      localStorage.setItem('ui_lang', data.uiLang)
      if (data.theme) localStorage.setItem('ui_theme', data.theme)
    },
    {
      tokenKey: TOKEN_KEY,
      uiLang,
      theme: theme ?? null,
    },
  )

  await page.route('**/api/auth?action=me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profile) }),
  )
}

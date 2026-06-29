import type { Page } from '@playwright/test'

// Giả "đã đăng nhập" cho E2E mà KHÔNG cần backend thật:
// - Supabase đọc session từ localStorage (getSession không gọi mạng nếu chưa hết hạn).
// - toAppUser() trả về ngay nếu có cached profile (gsa_profile_v1) onboarded=true,
//   chỉ refresh ngầm ở nền (fail thì chỉ warn) — xem src/lib/auth.ts.
// Nhờ vậy app vào thẳng trang sau đăng nhập, dựng UI theo ui_lang để test en/vi.

// ref 'e2e' suy từ VITE_SUPABASE_URL=https://e2e.supabase.co (xem playwright.config.ts)
const SUPABASE_AUTH_KEY = 'sb-e2e-auth-token'
const PROFILE_CACHE_KEY = 'gsa_profile_v1'
const USER_ID = 'e2e-user-0001'
const USER_NAME = 'E2E Tester'

export async function mockLogin(page: Page, uiLang: 'vi' | 'en' = 'vi'): Promise<void> {
  const nowSec = Math.floor(Date.now() / 1000)
  const oneYear = 60 * 60 * 24 * 365
  const session = {
    access_token: 'e2e-fake-access-token',
    refresh_token: 'e2e-fake-refresh-token',
    token_type: 'bearer',
    expires_in: oneYear,
    expires_at: nowSec + oneYear, // xa tương lai → getSession không refresh (không gọi mạng)
    user: {
      id: USER_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'e2e@example.com',
      user_metadata: { name: USER_NAME },
      app_metadata: { provider: 'email', providers: ['email'] },
    },
  }
  const profile = { id: USER_ID, plan: 'free', onboarded: true, ts: Date.now() }

  await page.addInitScript(
    (data) => {
      localStorage.setItem(data.authKey, JSON.stringify(data.session))
      localStorage.setItem(data.profileKey, JSON.stringify(data.profile))
      localStorage.setItem('ui_lang', data.uiLang)
    },
    { authKey: SUPABASE_AUTH_KEY, session, profileKey: PROFILE_CACHE_KEY, profile, uiLang },
  )
}

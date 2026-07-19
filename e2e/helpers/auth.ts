import type { Page } from '@playwright/test'

// Giả "đã đăng nhập" cho E2E bằng cách gieo trước localStorage — profile cache
// (gsa_profile_v1) cho UI hiện đúng trạng thái onboarded=true ngay lập tức.
//
// ⚠️ NỢ KỸ THUẬT (phát hiện ở Giai đoạn E rời Supabase, chưa sửa): từ khi
// src/lib/auth.ts chuyển sang Bearer token tự viết (Giai đoạn B), AuthProvider
// LUÔN gọi thật `GET /api/auth?action=me` khi mount — khoá `authKey` giả bên dưới
// KHÔNG còn được auth.ts đọc (đó là tên khoá kiểu Supabase cũ, để lại làm tư liệu).
// Muốn mockLogin hoạt động đúng cần: (a) page.route() chặn `/api/auth?action=me`
// trả profile giả, hoặc (b) chạy E2E với backend Postgres thật đã seed sẵn user
// e2e-user-0001. Chưa việc nào được làm — các spec dùng mockLogin có thể đang
// phụ thuộc vào nhánh lỗi mạng (401) của getCurrentUser() để hoạt động tình cờ.
const PROFILE_CACHE_KEY = 'gsa_profile_v1'
// Export để các file E2E khác seed localStorage đúng key theo user (vd `et_challenge_<uid>`).
export const USER_ID = 'e2e-user-0001'

// Tên 4 theme (đồng bộ src/lib/theme.ts). Dùng để E2E quét a11y ở mọi theme.
export type ThemeName = 'dark-blue' | 'blue-sky' | 'pink' | 'vibrant'

export async function mockLogin(
  page: Page,
  uiLang: 'vi' | 'en' = 'vi',
  theme?: ThemeName,
): Promise<void> {
  const profile = { id: USER_ID, plan: 'free', onboarded: true, ts: Date.now() }

  await page.addInitScript(
    (data) => {
      localStorage.setItem(data.profileKey, JSON.stringify(data.profile))
      localStorage.setItem('ui_lang', data.uiLang)
      if (data.theme) localStorage.setItem('ui_theme', data.theme)
    },
    {
      profileKey: PROFILE_CACHE_KEY,
      profile,
      uiLang,
      theme: theme ?? null,
    },
  )
}

/// <reference types="vite/client" />

// ANTHROPIC_API_KEY KHÔNG khai báo ở đây vì nó không có tiền tố VITE_ —
// chỉ dùng ở phía server (vite.config.ts khi dev, api/claude.ts khi deploy),
// không bao giờ được đóng gói vào bundle gửi cho browser.
interface ImportMetaEnv {
  // Google OAuth Client ID (auth tự viết — an toàn public vì Client ID không phải secret,
  // chỉ dùng để Google biết app nào đang xin đăng nhập)
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_APPLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

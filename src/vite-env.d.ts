/// <reference types="vite/client" />

// ANTHROPIC_API_KEY KHÔNG khai báo ở đây vì nó không có tiền tố VITE_ —
// chỉ dùng ở phía server (vite.config.ts khi dev, api/claude.ts khi deploy),
// không bao giờ được đóng gói vào bundle gửi cho browser.
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

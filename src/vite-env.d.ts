/// <reference types="vite/client" />

// ANTHROPIC_API_KEY KHÔNG khai báo ở đây vì nó không có tiền tố VITE_ —
// chỉ dùng ở phía server (vite.config.ts khi dev, api/claude.ts khi deploy),
// không bao giờ được đóng gói vào bundle gửi cho browser.
//
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY thì NGƯỢC LẠI — phải có tiền tố
// VITE_ để Vite đóng gói vào bundle, vì trình duyệt cần 2 giá trị này để gọi
// Supabase Auth trực tiếp. An toàn vì anon key được thiết kế để public (Supabase
// dùng Row Level Security để giới hạn quyền, không phải giữ kín key này).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

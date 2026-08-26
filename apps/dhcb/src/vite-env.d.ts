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
  readonly VITE_MICROSOFT_CLIENT_ID: string
  // Google Maps JavaScript API key (bản đồ "Đi chung"). Public được — nhưng PHẢI khoá theo
  // HTTP referrer + chỉ bật Maps JavaScript API trong Google Cloud Console, nếu không người
  // khác dùng ké sẽ tính tiền vào tài khoản mình. Thiếu key thì app tự chuyển sang danh sách
  // khoảng cách + nút mở Google Maps (xem components/location/LiveMap.tsx).
  readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

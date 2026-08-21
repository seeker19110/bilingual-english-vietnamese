# Hướng dẫn liên kết đăng nhập Facebook, Apple, Microsoft

> Đọc khi cần BẬT đăng nhập bằng Facebook / Apple / Microsoft trên production.
> Code đã làm xong 100% (backend `api/auth.ts` + `api/_lib/authService.ts`, frontend
> `src/lib/auth.ts` + nút bấm ở `src/pages/Login.tsx`). Việc còn lại chỉ là **đăng ký app ở mỗi
> nền tảng rồi điền biến môi trường** — không cần sửa code.

Cả 3 đều dùng cơ chế giống Google đang chạy: người dùng bấm nút → JS SDK của nền tảng mở popup
đăng nhập → trả về token → gửi lên `/api/auth` để server tự verify (không tin client) → tạo/khớp
tài khoản trong Postgres → trả về Bearer token của app. **Không có bước "kết nối 2 chiều" giữa
Facebook/Apple/Microsoft với server — mỗi lần đăng nhập chỉ là xác minh danh tính một lần.**

## 0. Domain cần đăng ký ở cả 3 nền tảng

Dùng domain thật đang chạy: `https://en-vi.donghanhcungban.com` (và `http://localhost:5173` nếu
muốn test ở máy mình). Ghi nhớ domain này — cả 3 bước dưới đều cần nhập lại.

---

## 1. Facebook Login

1. Vào https://developers.facebook.com/apps → **Create App** → chọn loại **"Consumer"**.
2. Sau khi tạo app, vào **Add Product** → chọn **Facebook Login** → **Set Up**.
3. Vào **Facebook Login → Settings**:
   - **Valid OAuth Redirect URIs**: `https://en-vi.donghanhcungban.com/`
   - Bật **Login with the JavaScript SDK**: điền domain app vào **App Domains** (Settings →
     Basic) là `en-vi.donghanhcungban.com`.
4. Lấy **App ID** và **App Secret** ở Settings → Basic.
5. **Bắt buộc trước khi công khai:** vào App Review → xin quyền `email` (mặc định app ở chế độ
   "Development" chỉ đăng nhập được tài khoản test/admin bạn tự thêm ở Roles → Testers). Chuyển
   app sang **"Live"** (nút gạt ở đầu trang) để người dùng thật đăng nhập được.
6. Điền vào `.env` trên VPS:
   ```
   FACEBOOK_APP_ID=xxxxxxxxxx
   FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_FACEBOOK_APP_ID=xxxxxxxxxx
   ```
   (`VITE_FACEBOOK_APP_ID` phải build lại frontend mới có hiệu lực vì Vite nhúng vào bundle lúc
   build — không phải biến đọc lúc chạy như biến server.)

## 2. Sign in with Apple

Cần **tài khoản Apple Developer Program** (trả phí, 99 USD/năm) — không có cách nào miễn phí.

1. Vào https://developer.apple.com/account → **Certificates, Identifiers & Profiles**.
2. Tạo **Identifiers → App IDs** (nếu chưa có) → bật capability **Sign In with Apple**.
3. Tạo thêm **Identifiers → Services IDs** (đây là ID dùng ở web, KHÁC App ID phía trên) —
   ví dụ `com.donghanhcungban.envi.web`.
4. Mở Services ID vừa tạo → bật **Sign In with Apple** → **Configure**:
   - **Primary App ID**: chọn App ID ở bước 2.
   - **Domains and Subdomains**: `en-vi.donghanhcungban.com`
   - **Return URLs**: `https://en-vi.donghanhcungban.com/`
5. Điền vào `.env` trên VPS (giá trị chính là Services ID, không phải App ID):
   ```
   APPLE_CLIENT_ID=com.donghanhcungban.envi.web
   VITE_APPLE_CLIENT_ID=com.donghanhcungban.envi.web
   ```

Lưu ý quan trọng đã xử lý sẵn trong code: Apple chỉ gửi tên người dùng **đúng 1 lần** ở lần đồng
ý đầu tiên — các lần đăng nhập sau sẽ không có tên, server tự lấy phần trước `@` của email làm
tên. Không cần làm gì thêm.

## 3. Microsoft (MSAL.js)

1. Vào https://portal.azure.com → **Azure Active Directory → App registrations → New
   registration**.
2. **Supported account types**: chọn **"Accounts in any organizational directory and personal
   Microsoft accounts"** (bắt buộc — code dùng authority `common`, chấp nhận cả tài khoản công
   ty/trường lẫn tài khoản cá nhân outlook.com/hotmail.com).
3. **Redirect URI**: chọn loại **Single-page application (SPA)**, nhập
   `https://en-vi.donghanhcungban.com/`.
4. Sau khi tạo, copy **Application (client) ID** ở trang Overview.
5. Điền vào `.env` trên VPS:
   ```
   MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   VITE_MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
   Không cần Client Secret — MSAL.js chạy hoàn toàn phía trình duyệt (Authorization Code Flow
   - PKCE), server chỉ verify chữ ký JWT qua JWKS công khai của Microsoft.

---

## 4. Sau khi điền `.env` xong

```bash
npm run build          # bắt buộc — build lại để nhúng VITE_* mới vào bundle
pm2 reload dhcb   # hoặc theo scripts/pm2-reload.sh, xem docs/deploy-vps-ubuntu.md
```

Kiểm tra: mở trang đăng nhập ở domain thật (không phải localhost, vì Facebook/Apple yêu cầu đúng
domain đã đăng ký) → bấm từng nút Facebook/Apple/Microsoft → xác nhận đăng nhập xong redirect về
app đúng, tài khoản mới xuất hiện trong bảng `users` (Postgres).

## 5. Sự cố thường gặp

| Lỗi                                                  | Nguyên nhân                                                                              | Cách sửa                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Facebook: "URL Blocked"                              | Domain chưa khớp **Valid OAuth Redirect URIs**                                           | Thêm đúng domain, có dấu `/` cuối                        |
| Facebook: đăng nhập được nhưng chỉ với vài tài khoản | App còn ở chế độ "Development"                                                           | Chuyển app sang "Live" ở App Review                      |
| Apple: "invalid_client"                              | Domain/Return URL ở Services ID không khớp domain thật                                   | Sửa lại Domains/Return URLs cho đúng `https://` + domain |
| Microsoft: "AADSTS50011: redirect URI mismatch"      | Redirect URI đăng ký sai loại (Web thay vì SPA) hoặc thiếu `/` cuối                      | Xóa, đăng ký lại đúng loại **SPA**                       |
| Đăng nhập xong nhưng lỗi "Server chưa cấu hình ..."  | Thiếu biến server-side (`FACEBOOK_APP_SECRET`, `APPLE_CLIENT_ID`, `MICROSOFT_CLIENT_ID`) | Kiểm tra lại `.env` trên VPS, restart PM2                |

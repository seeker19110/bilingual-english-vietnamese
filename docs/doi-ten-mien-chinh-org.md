# Đổi tên miền chính sang donghanhcungban.org — checklist chuẩn bị

> Trạng thái: **CHƯA thực hiện, chỉ chuẩn bị.** `.com` vẫn là mặc định trong code cho tới khi
> tất cả mục dưới đây xong. Domain `.org` đã mua sẵn nhưng **SSL, redirect URI OAuth, webhook
> SePay đều CHƯA cập nhật** (xác nhận 2026-07-31) — đổi mặc định lúc này sẽ làm gãy đăng nhập
> mạng xã hội và webhook thanh toán thật.

## Vì sao KHÔNG đổi mặc định ngay

Đăng nhập Google/Facebook/Apple/Microsoft (`src/lib/auth.ts` các hàm `loadGoogleScript()`,
`loadFacebookScript()`, v.v.) và webhook SePay (`api/payment-webhook.ts`) đều dựa vào domain đã
đăng ký SẴN trên console của từng bên thứ ba. Đổi domain chính trong code TRƯỚC khi các console
đó biết domain mới → người dùng bấm đăng nhập/thanh toán sẽ gặp lỗi thật trên production.

## Việc tay cần làm TRƯỚC (theo đúng thứ tự)

1. **SSL cho `.org`**: SSH vào VPS, mở rộng chứng chỉ hiện có hoặc cấp mới —
   ```bash
   sudo certbot --expand \
     -d en-vi.donghanhcungban.com -d donghanhcungban.com -d www.donghanhcungban.com \
     -d en-vi.donghanhcungban.org -d donghanhcungban.org -d www.donghanhcungban.org
   ```
2. **Nginx**: thêm `server_name` cho các domain `.org` tương ứng (nhân bản `nginx/en-vi.conf` +
   `docs/nginx-hub-apex.md`, đổi `.com` → `.org`), `nginx -t && systemctl reload nginx`. Có thể
   để CẢ HAI domain cùng trỏ vào cùng server block trong lúc chuyển tiếp (không bắt buộc chọn 1).
3. **Google Cloud Console** (OAuth) → Credentials → thêm `https://en-vi.donghanhcungban.org` vào
   Authorized JavaScript origins + Authorized redirect URIs (giữ nguyên `.com`, chỉ THÊM).
4. **Facebook Developer / Apple Developer / Microsoft Azure** (xem
   `docs/huong-dan-lien-ket-facebook-apple-microsoft.md`) → tương tự, thêm domain `.org` vào
   danh sách redirect/callback URL hợp lệ của từng bên.
5. **SePay dashboard** → thêm webhook URL `https://en-vi.donghanhcungban.org/api/payment-webhook`
   (nếu SePay cho nhiều webhook cùng lúc) hoặc xác nhận webhook hiện tại dùng IP/domain nào ổn
   định qua cả 2 domain.
6. **Xác nhận từng mục trên chạy thật** trước khi qua bước "đổi mặc định" bên dưới — thử đăng
   nhập Google/Facebook/Apple/Microsoft và một giao dịch SePay nhỏ TRÊN domain `.org` trong khi
   `.com` vẫn là mặc định (cả 2 domain cùng phục vụ được nhờ bước 1-2, không ảnh hưởng người dùng
   `.com` hiện tại).

## Sau khi TẤT CẢ mục trên đã xác nhận — mới đổi mặc định (việc code, làm trong 1 PR riêng)

Code đã chuẩn bị sẵn để đổi bằng BIẾN MÔI TRƯỜNG, không cần sửa lại logic — chỉ đặt trên VPS
(file `.env`) rồi `pm2 reload`:

```bash
SITE_URL=https://en-vi.donghanhcungban.org
VITE_SITE_URL=https://en-vi.donghanhcungban.org   # phải build lại (npm run build) mới ăn — biến VITE_* nhúng lúc build, không đọc lúc chạy
EN_VI_HOSTNAME=en-vi.donghanhcungban.org           # server.ts dùng để chọn app theo Host
VITE_ENGLISH_APP_URL=https://en-vi.donghanhcungban.org  # apps/hub — nút "Học ngay"/đăng nhập
```

Các nơi đọc đúng các biến này (đã xác nhận 2026-07-31, không cần sửa thêm):
`api/_lib/passwordReset.ts` (link đặt lại mật khẩu qua email), `apps/english/src/App.tsx`
(canonical SEO), `apps/english/src/components/ShareResultCard.tsx` (link chia sẻ kết quả),
`scripts/gen-dictionary-sitemap.ts` (sitemap từ vựng), `server.ts` (`EN_VI_HOSTNAME` — chọn app
tiếng Anh hay hub theo Host), `apps/hub/vite.config.ts`/`apps/hub/src/App.tsx`
(`VITE_ENGLISH_APP_URL`).

Sau khi đổi: `.com` nên **301 redirect toàn site sang `.org`** (không tắt hẳn ngay) để giữ SEO —
thêm `server` block Nginx riêng cho `.com` chỉ làm `return 301 https://$host_org$request_uri;`
(việc tay, không có trong PR-7).

## Không nằm trong phạm vi này

Đổi domain trong `nginx/en-vi.conf`, `docs/nginx-hub-apex.md` (các file mẫu hiện dùng `.com`) —
chỉ đổi khi thực sự cắt lịch chuyển đổi, tránh 2 bộ tài liệu mẫu gây nhầm domain nào đang thật sự
dùng.

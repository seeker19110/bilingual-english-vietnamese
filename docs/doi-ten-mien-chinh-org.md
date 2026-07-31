# Đổi tên miền chính sang donghanhcungban.org — checklist chuẩn bị

> **Trạng thái: ĐÃ HOÀN TẤT chuyển đổi (2026-07-31).** `.org` giờ là domain mặc định — đã xác nhận
> đăng nhập Google + thanh toán SePay (tiền tố mới `DHCB`) chạy thật trên `en-vi.donghanhcungban.org`;
> `www.donghanhcungban.org` là domain chuẩn duy nhất cho trang hub — `donghanhcungban.com`,
> `www.donghanhcungban.com`, VÀ `donghanhcungban.org` (apex, không `www`) đều 301 redirect sang
> `www.donghanhcungban.org` (tránh trùng nội dung 2 URL, tốt cho SEO). Toàn bộ nội dung bên dưới
> giữ lại làm **lịch sử/tham khảo** cho lần đổi domain tiếp theo (vd môn mới), không còn là việc
> cần làm.
>
> **Cấu hình Nginx thật nằm ở 2 file** (không phải file mẫu `nginx/en-vi.conf`/`docs/nginx-hub-apex.md`
> trong repo — xem mục "Không nằm trong phạm vi này" cuối bài):
> - `/etc/nginx/sites-available/default`: 1 block HTTPS chung phục vụ `www.donghanhcungban.org` +
>   `en-vi.donghanhcungban.org` (proxy Express, chọn app theo `Host` qua `EN_VI_HOSTNAME`), và 1
>   block riêng chỉ `return 301` cho 3 domain không chuẩn (`donghanhcungban.com`,
>   `www.donghanhcungban.com`, `donghanhcungban.org` apex) sang `www.donghanhcungban.org`.
> - `/etc/nginx/sites-available/en-vi`: trước là file phục vụ thật `en-vi.donghanhcungban.com`
>   (bản gốc trước khi có `.org`, khớp mẫu `nginx/en-vi.conf`) — nay đã đổi thành `return 301
>   https://en-vi.donghanhcungban.org$request_uri;` (giữ path khi redirect, không redirect về
>   trang chủ). Certbot vẫn quản cert của domain này qua `/etc/letsencrypt/live/en-vi.donghanhcungban.com/`.

> **Quyết định 2026-07-31:** tạm hoãn thêm domain `.org` vào Facebook Developer / Apple Developer
> (Services ID) / Microsoft Azure — làm sau, không chặn việc đổi mặc định. Trong lúc đó, đăng nhập
> Facebook/Apple/Microsoft trên `.org` sẽ báo lỗi "domain không hợp lệ" (Facebook)/`invalid_client`
> (Apple)/`AADSTS50011` (Microsoft) cho tới khi làm — người dùng vẫn đăng nhập được bằng Google
> hoặc email/password. Nhớ quay lại làm 3 mục này khi có thời gian (xem §1 các bước 2-4 dưới đây).

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
   - **Bắt buộc trước khi test**: đặt `EN_VI_HOSTNAME=en-vi.donghanhcungban.com,en-vi.donghanhcungban.org`
     trong `.env` trên VPS rồi `pm2 reload` (không cần build lại, biến này server đọc lúc chạy,
     khác `VITE_*`). Thiếu bước này, `server.ts` (`distDirForHost`) không nhận diện được host
     `.org` nên mọi đường dẫn (kể cả `/login`) sẽ bị phục vụ nhầm bằng `apps/hub/dist` thay vì
     app tiếng Anh thật — biểu hiện: mở `https://en-vi.donghanhcungban.org/login` vẫn thấy giao
     diện trang hub thay vì form đăng nhập.

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

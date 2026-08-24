# Đổi tên miền chính sang donghanhcungban.org — checklist chuẩn bị

> ## ⚠️ CẢNH BÁO — KHẲNG ĐỊNH BÊN DƯỚI KHÔNG KHỚP THỰC TẾ (đo lại 2026-08-24)
>
> Tài liệu này khẳng định apex `donghanhcungban.org` và cả 2 domain `.com` đều **301 redirect** về
> `www.donghanhcungban.org`. **Đo thật trên VPS ngày 2026-08-24 cho kết quả ngược lại** — cả 5
> domain đều trả `HTTP/2 200`, tức KHÔNG có redirect nào:
>
> ```
> donghanhcungban.org              HTTP/2 200     ← lẽ ra phải 301
> www.donghanhcungban.org          HTTP/2 200     ← đúng (phục vụ)
> donghanhcungban.com              HTTP/2 200     ← lẽ ra phải 301
> www.donghanhcungban.com          HTTP/2 200     ← lẽ ra phải 301
> en-vi.donghanhcungban.org        HTTP/2 200     ← đúng (phục vụ)
> ```
>
> Hệ quả: **2 URL cùng phục vụ một nội dung** (apex và `www`) — đúng thứ mà mục "tránh trùng nội
> dung, tốt cho SEO" bên dưới nói là đã xử lý. Chưa xác định được nguyên nhân (redirect chưa từng
> được đặt / bị ghi đè / chỉ đặt ở tầng Cloudflare nên đo từ trong VPS không thấy). `scripts/deploy.sh`
> **không** đụng tới nginx nên không phải do deploy ghi đè.
>
> Đây đúng loại lỗi mà Tầng 6b của `docs/framework/QUY-TRINH-AUDIT.md` sinh ra để bắt: tài liệu
> điều hành khẳng định một trạng thái hạ tầng mà không ai đo lại. **Đừng tin phần "ĐÃ HOÀN TẤT"
> bên dưới cho tới khi đo lại bằng `curl -sI`.**
>
> ---
>
> **Trạng thái (tự khai 2026-07-31, CHƯA được xác nhận lại):** `.org` giờ là domain mặc định — đã xác nhận
> đăng nhập Google + thanh toán SePay (tiền tố mới `DHCB`) chạy thật trên `en-vi.donghanhcungban.org`;
> `www.donghanhcungban.org` là domain chuẩn duy nhất cho trang hub — `donghanhcungban.com`,
> `www.donghanhcungban.com`, VÀ `donghanhcungban.org` (apex, không `www`) đều 301 redirect sang
> `www.donghanhcungban.org` (tránh trùng nội dung 2 URL, tốt cho SEO). Toàn bộ nội dung bên dưới
> giữ lại làm **lịch sử/tham khảo** cho lần đổi domain tiếp theo (vd môn mới), không còn là việc
> cần làm.
>
> **Cấu hình Nginx thật nằm ở 2 file** (không phải file mẫu `nginx/en-vi.conf`/`docs/nginx-hub-apex.md`
> trong repo — xem mục "Không nằm trong phạm vi này" cuối bài):
>
> - `/etc/nginx/sites-available/default`: 1 block HTTPS chung phục vụ `www.donghanhcungban.org` +
>   `en-vi.donghanhcungban.org` (proxy Express, chọn app theo `Host` qua `EN_VI_HOSTNAME`), và 1
>   block riêng chỉ `return 301` cho 3 domain không chuẩn (`donghanhcungban.com`,
>   `www.donghanhcungban.com`, `donghanhcungban.org` apex) sang `www.donghanhcungban.org`.
> - `/etc/nginx/sites-available/en-vi`: trước là file phục vụ thật `en-vi.donghanhcungban.com`
>   (bản gốc trước khi có `.org`, khớp mẫu `nginx/en-vi.conf`) — nay đã đổi thành `return 301
https://en-vi.donghanhcungban.org$request_uri;` (giữ path khi redirect, không redirect về
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

## File mẫu trong repo

**[Cập nhật 2026-08-24]** `nginx/en-vi.conf` ĐÃ đổi sang `.org` và đã được **sửa lại một lỗi
nguy hiểm**: bản trước (commit `7bbb1a7`) xếp `en-vi.donghanhcungban.org` vào nhóm 301 redirect
về `www.donghanhcungban.org` — tức là copy file đó lên VPS thì **app tiếng Anh chết**, vì subdomain
phục vụ nó bị đẩy hết về hub. Nay file mẫu ghi rõ 2 nhóm tách bạch:

| Nhóm                                                                             | Hành vi                                   |
| -------------------------------------------------------------------------------- | ----------------------------------------- |
| `www.donghanhcungban.org` · `en-vi.donghanhcungban.org`                          | **PHỤC VỤ** (không bao giờ redirect đi)   |
| `donghanhcungban.org` (apex) · `donghanhcungban.com` · `www.donghanhcungban.com` | 301 → `https://www.donghanhcungban.org`   |
| `en-vi.donghanhcungban.com`                                                      | 301 → `https://en-vi.donghanhcungban.org` |

Hai điểm dễ sai khi áp lên VPS:

1. **Block HTTP :80 của domain phục vụ phải dùng `$host`**, không ép cứng `www` — ép cứng thì
   `en-vi...` truy cập qua HTTP sẽ bị mất subdomain.
2. **Block redirect của `.com` phải dùng chứng chỉ phủ `.com`**, không dùng cert `.org`: bắt tay
   TLS xảy ra TRƯỚC HTTP, nên cert sai thì trình duyệt báo lỗi bảo mật trước khi kịp đọc redirect.

`docs/nginx-hub-apex.md` vẫn còn `.com` — là tài liệu lịch sử, chưa rà lại.

> Cấu hình ĐANG CHẠY THẬT vẫn nằm trên VPS (`/etc/nginx/sites-available/{default,en-vi}`), không
> phải file mẫu này. Sửa file mẫu KHÔNG tự động đổi gì trên production.

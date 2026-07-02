# Đặt Cloudflare trước VPS (CDN + chống DDoS, miễn phí)

> Dành cho người mới. Đọc hết 1 lần trước khi làm. Việc này **đổi DNS domain** —
> có ảnh hưởng thật tới site đang chạy, nhưng **an toàn & dễ hoàn tác** (chỉ cần
> đổi lại nameserver hoặc tắt "Proxy" là quay về y như cũ, không mất dữ liệu).

## Vì sao làm việc này

- **Nhanh hơn cho người dùng ở xa VPS**: Cloudflare có server (edge) gần người dùng
  khắp nơi, cache file tĩnh (JS/CSS/ảnh) tại edge thay vì mọi request đều phải bay
  tới VPS ở Việt Nam.
- **Giảm tải VPS**: VPS hiện dùng chung tài nguyên với app "xboss" khác — traffic
  tĩnh (chiếm phần lớn) được Cloudflare phục vụ, VPS chỉ còn xử lý `/api/` + HTML.
- **Ẩn IP thật + chống DDoS cơ bản**: người dùng thấy IP Cloudflare, không thấy IP
  VPS thật; Cloudflare tự lọc bớt traffic rác trước khi tới VPS.
- **Miễn phí** (gói Free đủ dùng cho nhu cầu hiện tại).

## Việc BẠN phải tự làm (chỉ chủ tài khoản domain mới làm được)

AI không có quyền truy cập tài khoản Cloudflare/nơi mua domain của bạn — các bước
dưới đây bạn tự thao tác trên trình duyệt.

### Bước 1 — Thêm site vào Cloudflare

1. Vào https://dash.cloudflare.com → **Add a Site** → gõ domain gốc (vd
   `donghanhcungban.com`, không cần gõ subdomain `en-vi.`).
2. Chọn gói **Free** → **Continue**.
3. Cloudflare tự quét bản ghi DNS hiện có — kiểm tra thấy đủ bản ghi cho
   `en-vi.donghanhcungban.com` (và các subdomain khác bạn đang dùng, kể cả app
   "xboss" nếu chung domain) trước khi qua bước sau. Thiếu bản ghi nào thì thêm tay.

### Bước 2 — Bật Proxy (đám mây cam) cho bản ghi `en-vi`

Trong danh sách DNS record, tìm dòng `en-vi` (loại A, trỏ vào IP VPS
`160.30.172.203`) → bấm vào biểu tượng đám mây để chuyển từ **DNS only** (xám)
sang **Proxied** (🟠 cam). Chỉ bật Proxied cho subdomain bạn muốn qua Cloudflare —
subdomain nào chưa sẵn sàng (vd "xboss") có thể để DNS only trước, chuyển sau.

### Bước 3 — Đổi Nameserver ở nơi mua domain

Cloudflare cho bạn 2 nameserver riêng (dạng `xxx.ns.cloudflare.com`). Vào trang
quản lý domain (Namecheap/GoDaddy/Mắt Bão/... — nơi bạn đã mua domain
`donghanhcungban.com`) → thay nameserver cũ bằng 2 cái Cloudflare vừa cấp.

⏳ Việc này có thể mất **vài phút đến 24 giờ** để lan truyền (DNS propagation).
Cloudflare sẽ gửi email báo khi site đã "Active".

### Bước 4 — SSL/TLS mode = "Full (strict)"

Vào **SSL/TLS → Overview** → chọn **Full (strict)**. Bắt buộc chọn đúng mode này
vì VPS **đã có chứng chỉ Let's Encrypt thật** (không phải self-signed) — "Full
(strict)" nghĩa là Cloudflare xác minh cert VPS hợp lệ trước khi tin, an toàn nhất.
KHÔNG chọn "Flexible" (sẽ làm mất mã hóa đoạn Cloudflare→VPS).

### Bước 5 — (Khuyên dùng) Always Use HTTPS + tắt cache cho /api/

- **SSL/TLS → Edge Certificates** → bật **Always Use HTTPS**.
- **Rules → Page Rules** (hoặc **Cache Rules** ở bản mới) → thêm rule:
  URL khớp `en-vi.donghanhcungban.com/api/*` → **Cache Level: Bypass** (API luôn
  cần dữ liệu mới + xác thực, không được cache).

## Việc AI/bạn làm trên VPS (sau khi Bước 1–4 xong)

Repo đã có sẵn `scripts/update-cloudflare-ips.sh` (sinh danh sách IP Cloudflare
mới nhất) + `nginx/en-vi.conf` đã thêm dòng `include` — chỉ cần deploy lên VPS:

```bash
# SSH vào VPS
ssh root@160.30.172.203
cd /var/www/english-tutor

# Kéo code mới nhất (đã có script + nginx config cập nhật)
git pull

# 1. Sinh file danh sách IP Cloudflare (BẮT BUỘC trước khi reload nginx)
sudo bash scripts/update-cloudflare-ips.sh

# 2. Copy nginx config mới (nếu đã sửa nginx/en-vi.conf)
sudo cp nginx/en-vi.conf /etc/nginx/sites-available/en-vi

# 3. Kiểm tra cú pháp rồi mới reload (an toàn — không làm sập site đang chạy nếu lỗi)
sudo nginx -t && sudo systemctl reload nginx
```

> Đặt cron chạy lại `update-cloudflare-ips.sh` mỗi tháng — xem hướng dẫn trong
> chính file script (Cloudflare hiếm khi đổi dải IP nhưng có thể xảy ra).

## Cách kiểm tra đã chạy đúng

1. **DNS đã qua Cloudflare**: `curl -I https://en-vi.donghanhcungban.com` — thấy
   header `cf-ray` nghĩa là request đã đi qua Cloudflare.
2. **App vẫn chạy bình thường**: mở site, thử đăng nhập, chat, nghe TTS — luồng
   chính không đổi gì cả (Cloudflare chỉ là lớp trung gian, không đổi code app).
3. **Rate-limit vẫn nhận đúng IP thật** (quan trọng nhất — xác nhận
   `nginx/cloudflare-realip.conf` hoạt động đúng): trên VPS chạy
   `pm2 logs english-tutor` rồi thử gọi 1 request bất kỳ, xem log
   `[Security][...]` (nếu có) có in ra IP **thật của bạn**, không phải IP nội bộ
   Cloudflare (dải `173.245.x.x`, `103.21.x.x`, v.v.).

## Cách hoàn tác (nếu có sự cố)

- **Tắt nhanh nhất**: vào Cloudflare DNS → bấm đám mây 🟠 → xám lại **DNS only**.
  Traffic đi thẳng VPS như trước, không cần đổi gì ở VPS.
- **Hoàn tác hẳn**: đổi nameserver ở nơi mua domain về nameserver cũ (nhà cung cấp
  ban đầu thường lưu sẵn nameserver gốc, hoặc đăng ký lại domain "sử dụng DNS mặc
  định" của nhà cung cấp).
- Trên VPS: comment dòng `include /etc/nginx/cloudflare-realip.conf;` trong
  `nginx/en-vi.conf` nếu không dùng Cloudflare nữa, rồi `nginx -t && reload`.

## (Tùy chọn, nâng cao) Chặn truy cập thẳng vào IP VPS

Sau khi xác nhận Cloudflare chạy ổn, có thể giới hạn firewall VPS chỉ nhận traffic
từ dải IP Cloudflare trên cổng 80/443 — tăng thêm 1 lớp bảo vệ (dù
`cloudflare-realip.conf` đã tự chống giả mạo IP mà không cần bước này). **Rủi ro:
nếu bạn tắt Cloudflare Proxy sau này mà quên gỡ rule firewall, site sẽ không truy
cập được** — vì vậy đây là bước TÙY CHỌN, cân nhắc kỹ trước khi bật, và luôn giữ
port 22 (SSH) mở để không tự khóa mình ngoài VPS. Không bắt buộc để đóng lỗ bảo
mật chính (đã đóng bằng `real_ip` ở trên).

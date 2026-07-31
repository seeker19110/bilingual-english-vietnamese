# Nginx cho apex domain + hub — bản nháp, CHƯA áp dụng

> Trạng thái: **code hub đã có** (`apps/hub/`, phục vụ qua `server.ts` dựa vào `Host` header —
> xem PR-7, `docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md` §7). File Nginx này là
> **bản nháp chuẩn bị sẵn**, CHƯA copy lên VPS, CHƯA chạy `certbot --expand`. Đây là phần hạ
> tầng thật (DNS, Nginx, chứng chỉ SSL) — không thể làm trong sandbox, cần làm TAY trên VPS.

## Việc cần làm tay (theo thứ tự)

1. **DNS**: trỏ bản ghi A cho `donghanhcungban.com` (apex) và `www.donghanhcungban.com` về cùng
   IP VPS đang chạy `en-vi.donghanhcungban.com` (103.81.87.174, xem `docs/deploy-vps-ubuntu.md`).
   Chưa cần trỏ `math.` — thêm khi thật sự mở môn Toán (GĐ2).
2. **Build hub**: `npm run build` (đã tự gồm `npm run build --workspace=hub` từ PR-7) →
   `apps/hub/dist/` xuất hiện cạnh `dist/` (English) trên VPS.
3. **Copy file cấu hình** (nội dung mẫu bên dưới) lên
   `/etc/nginx/sites-available/donghanhcungban-hub`, rồi
   `sudo ln -s /etc/nginx/sites-available/donghanhcungban-hub /etc/nginx/sites-enabled/`.
4. **Mở rộng chứng chỉ SSL** (KHÔNG xin chứng chỉ mới riêng — mở rộng chứng chỉ hiện có để cùng
   một cert phủ cả 2 domain, tránh phải quản lý nhiều cert):
   ```bash
   sudo certbot --expand \
     -d en-vi.donghanhcungban.com \
     -d donghanhcungban.com \
     -d www.donghanhcungban.com
   ```
5. `sudo nginx -t && sudo systemctl reload nginx`.
6. Xác nhận: mở `https://donghanhcungban.com` → thấy trang hub; `https://en-vi.donghanhcungban.com`
   vẫn thấy app tiếng Anh như cũ (không đổi gì, vì `EN_VI_HOSTNAME` mặc định giữ nguyên hành vi).

## Nội dung mẫu (apex + www → hub)

Tương tự `nginx/en-vi.conf` nhưng đơn giản hơn (hub không có `/uploads/`, không cần cache
`immutable` riêng biệt phức tạp — có thể copy nguyên khối `location ~* ^/(js|assets)/` từ
`en-vi.conf` nếu muốn Nginx serve tĩnh trực tiếp thay vì qua Express).

```nginx
server {
    listen 80;
    server_name donghanhcungban.com www.donghanhcungban.com;
    server_tokens off;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name donghanhcungban.com www.donghanhcungban.com;
    server_tokens off;

    include /etc/nginx/cloudflare-realip.conf; # nếu dùng Cloudflare, xem docs/cloudflare-setup.md

    ssl_certificate /etc/letsencrypt/live/en-vi.donghanhcungban.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/en-vi.donghanhcungban.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Lưu ý: `proxy_set_header Host $host` là chỗ mấu chốt — `server.ts` (`distDirForHost`) dựa vào
đúng header `Host` này để quyết định phục vụ `dist/` (tiếng Anh) hay `apps/hub/dist/` (hub).

## Việc CHƯA làm (out of scope PR-7, để dành khi cần)

- Cookie phiên đăng nhập dùng chung (`domain=.donghanhcungban.com`) — SSO thật giữa hub và
  subdomain từng môn. Hiện tại hub chỉ điều hướng sang `en-vi.donghanhcungban.com/login`, người
  dùng đăng nhập lại ở đó bình thường.
- Bảng `onboarding_profiles(user_id, subject, ...)` hỏi trình độ/mục tiêu riêng theo từng môn khi
  bấm "Học ngay" lần đầu (§7.2 đặc tả) — chỉ cần khi có môn thứ hai thật sự tồn tại.
- `math.donghanhcungban.com` — dựng khi môn Toán bắt đầu code thật (GĐ2).

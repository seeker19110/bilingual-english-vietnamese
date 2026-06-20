# Triển khai lên VPS Ubuntu Server

> Hướng dẫn này dành cho người mới — giải thích từng bước từ cài môi trường đến HTTPS.
> Đọc hết một lần trước khi bắt đầu để hiểu tổng thể.
>
> **Dự án deploy bằng VPS (Express `server.ts` + PM2 + Nginx) — KHÔNG dùng Vercel.**

---

## Kiến trúc tổng quan

```
Internet
   │
[Nginx :443]  ← nhận HTTPS, tên miền, gzip, serve file audio tĩnh
   │
[Express :3000]  ← server.ts: api/*.ts + phục vụ React build (dist/)
   │
[Supabase]  ← database, storage, auth (RLS)
```

App chạy bằng **PM2** (process manager) trên **Node.js 22** (qua NVM).
> ⚠️ **Bắt buộc Node 22 trở lên.** Node 20 thiếu WebSocket gốc → thư viện Supabase ném lỗi khi xác thực (`supabase.auth.getUser`), khiến **mọi request đăng nhập bị `AUTH_FAILED`** (đăng nhập xong vẫn không gọi được API). Node 22 có WebSocket sẵn nên hết lỗi.

Nếu VPS đang chạy app khác dùng Node 16, các app vẫn cùng tồn tại — mỗi app chỉ định đúng version Node của mình trong `ecosystem.config.cjs`.

---

## Yêu cầu

- VPS Ubuntu 22.04 hoặc 24.04
- Tên miền trỏ vào IP của VPS (DNS A record cho cả `@` và `www`)
- SSH vào VPS với quyền `sudo`
- Tài khoản Supabase + dự án đã tạo
- API key: Anthropic (Claude) + Google Cloud Text-to-Speech
- File `.env` ở máy local (sẽ copy lên VPS)

---

## ✅ Checklist tiện ích cần có trước khi "lên sóng"

| Tiện ích | Bắt buộc? | Bước |
|---|---|---|
| Bảng Supabase (`schema.sql`) | ✅ Bắt buộc | Bước 0 |
| Firewall `ufw` | ✅ Nên có | Bước 1 |
| Node 22 (NVM) | ✅ Bắt buộc | Bước 2 |
| Nginx + PM2 + log rotation | ✅ Bắt buộc | Bước 3 |
| `.env` đủ key (gồm `ALLOWED_ORIGINS`) | ✅ Bắt buộc | Bước 4 |
| Health check `/api/health` | ✅ Có sẵn trong code | Bước 6, 7 |
| HTTPS (Let's Encrypt) | ✅ Bắt buộc | Bước 8 |
| Pre-cache audio (seed scripts) | ⬜ Tùy chọn | Bước 9 |
| Local storage cho audio | ⬜ Khuyên dùng | mục riêng |
| Backup uploads + DB | ⬜ Tùy chọn | mục riêng |

---

## Bước 0 — Chuẩn bị Supabase (tạo bảng + lấy key)

App **không chạy được** nếu chưa tạo bảng trong database.

1. Mở **Supabase Dashboard → SQL Editor → New query**.
2. Mở file `supabase/schema.sql` trong repo, copy toàn bộ nội dung, dán vào và bấm **Run**.
   - File này tạo các bảng `profiles`, `daily_usage`, `tts_cache`, lịch sử học… kèm Row Level Security (RLS).
   - Chi tiết: xem `SUPABASE_SYNC_SETUP.md` và `PRONUNCIATION_CACHE_SETUP.md`.
3. Lấy các key (dùng ở Bước 4): **Project Settings → API**
   - `Project URL` → cho `VITE_SUPABASE_URL` và `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key (bí mật!) → `SUPABASE_SERVICE_ROLE_KEY`

> Nếu dùng local storage cho audio (khuyên dùng) thì **không cần** tạo Storage bucket. Nếu để `STORAGE_DRIVER=supabase` thì tạo bucket `tts-cache` theo `TTS_CACHE_SETUP.md`.

---

## Bước 1 — Bật firewall (ufw)

Chỉ mở đúng 3 cổng cần thiết, chặn còn lại để an toàn.

```bash
sudo ufw allow OpenSSH      # cổng 22 — đừng quên, kẻo tự khóa mình ngoài SSH
sudo ufw allow 'Nginx Full' # cổng 80 (HTTP) + 443 (HTTPS)
sudo ufw enable             # bật firewall
sudo ufw status             # kiểm tra
```

> ⚠️ Express chạy ở cổng 3000 nhưng **không cần** mở ra ngoài — chỉ Nginx (localhost) gọi vào nó.

---

## Bước 2 — Cài NVM + Node.js 22

Dùng **NVM** để quản lý nhiều version Node song song — không xung đột với app khác đang chạy Node 16.

```bash
# Cài NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Nạp NVM vào shell hiện tại (không cần logout)
source ~/.bashrc

# Cài Node 22
nvm install 22

# Lấy đường dẫn chính xác của Node 22 — COPY kết quả này, dùng ở Bước 5
nvm which 22
# Ví dụ ra: /root/.nvm/versions/node/v22.20.0/bin/node
```

---

## Bước 3 — Cài Nginx, PM2 và log rotation

```bash
# Cài Nginx
sudo apt update && sudo apt install -y nginx

# Cài PM2 toàn cục
npm install -g pm2

# Cài module xoay vòng log cho PM2 — tránh file log phình to làm đầy ổ cứng
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M       # mỗi file tối đa 10MB
pm2 set pm2-logrotate:retain 7           # giữ 7 file gần nhất
pm2 set pm2-logrotate:compress true      # nén file log cũ
```

---

## Bước 4 — Clone code, tạo `.env`, cài đặt, build

```bash
# Clone repo
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git
cd bilingual-english-vietnamese

# Tạo thư mục log (PM2 ghi log vào đây)
mkdir -p logs uploads

# Tạo file .env — dán nội dung vào
nano .env
```

Nội dung `.env` đầy đủ:

```env
# ── Supabase (frontend) ──
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# ── Supabase (server) ──
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── AI + TTS ──
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_TTS_API_KEY=AIza...

# ── Mã hóa audio cache (32 byte base64) ──
TTS_ENCRYPTION_MASTER_KEY=...

# ── Bảo mật: chỉ cho domain thật gọi API ──
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ── Lưu audio trên VPS (miễn phí) ──
STORAGE_DRIVER=local
# UPLOADS_DIR=/root/bilingual-english-vietnamese/uploads

PORT=3000
```

> **Thiếu `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`** → đăng nhập lỗi (frontend không kết nối được Supabase).
> **Thiếu `TTS_ENCRYPTION_MASTER_KEY`** → audio cache mã hóa/giải mã thất bại, app fallback giọng trình duyệt nhưng mất cache.
> Tạo `TTS_ENCRYPTION_MASTER_KEY`:
> `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
> **Bỏ trống `ALLOWED_ORIGINS`** = cho phép mọi domain gọi API (chỉ nên dùng lúc dev).

```bash
# Cài thư viện
nvm use 22
npm install

# Build frontend React → thư mục dist/
npm run build
```

---

## Bước 5 — Cập nhật đường dẫn Node trong `ecosystem.config.cjs`

```bash
# Lấy lại đường dẫn Node 22 (nếu chưa copy ở Bước 2)
nvm which 22
# Ví dụ: /root/.nvm/versions/node/v22.20.0/bin/node

nano ecosystem.config.cjs
```

Tìm dòng `interpreter` và sửa cho khớp đường dẫn vừa lấy:

```js
interpreter: '/root/.nvm/versions/node/v22.20.0/bin/node',
```

Kiểm tra nhanh:

```bash
grep interpreter ecosystem.config.cjs
```

---

## Bước 6 — Chạy app với PM2

```bash
# Khởi động
pm2 start ecosystem.config.cjs

# Trạng thái — cột "status" phải là "online"
pm2 status

# Log realtime (Ctrl+C để thoát)
pm2 logs english-tutor

# Tự khởi động khi VPS reboot
pm2 startup        # chạy lệnh sudo nó in ra
pm2 save

# Kiểm tra app sống chưa — health check trả về {"status":"ok",...}
curl http://localhost:3000/api/health
```

---

## Bước 7 — Nginx reverse proxy (gzip + health + audio tĩnh)

```bash
sudo nano /etc/nginx/sites-available/english-tutor
```

Dán nội dung (thay `yourdomain.com` bằng tên miền thật):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10M;

    # Nén response cho nhẹ băng thông
    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;
    gzip_min_length 1024;

    # Serve file audio trực tiếp từ ổ cứng — nhanh hơn qua Express, cache 30 ngày
    location /uploads/ {
        alias /root/bilingual-english-vietnamese/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # Health check — Nginx/uptime monitor gọi /api/health
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/english-tutor /etc/nginx/sites-enabled/

# Kiểm tra cú pháp
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Bước 8 — HTTPS miễn phí với Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Lấy chứng chỉ SSL (nhập email khi được hỏi)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Kiểm tra tự gia hạn
sudo certbot renew --dry-run
```

Certbot tự sửa file Nginx thêm cấu hình HTTPS và tự gia hạn mỗi 90 ngày.

App chạy tại `https://yourdomain.com` ✅
Kiểm tra: `curl https://yourdomain.com/api/health`

---

## Bước 9 — (Tùy chọn) Pre-cache audio bằng seed scripts

Chạy sẵn để lần đầu người dùng vào đã có audio ngay, đỡ tốn lượt gọi Google TTS lúc cao điểm.

```bash
cd ~/bilingual-english-vietnamese
nvm use 22

# Cache phát âm các từ trong từ điển
npm run seed:pronunciation

# Pre-cache audio các mẫu câu luyện nói
npm run prefetch:tts-patterns
```

> Hai script này đọc `.env` để gọi Google TTS và lưu vào `uploads/` (hoặc Supabase tùy `STORAGE_DRIVER`). Chạy lại an toàn — file đã có sẽ bỏ qua.

---

## Health check `/api/health`

`server.ts` có sẵn endpoint nhẹ (không gọi AI, không đụng DB):

```bash
curl https://yourdomain.com/api/health
# {"status":"ok","uptime":123.4,"time":"2026-06-20T19:42:00.000Z"}
```

Dùng cho: uptime monitor (UptimeRobot…), kiểm tra sau deploy, cảnh báo khi app chết.

---

## Local Storage — lưu file audio trên VPS

> Đặt `STORAGE_DRIVER=local` để lưu audio trên ổ cứng VPS — **miễn phí**, không tốn Supabase Storage.

### Cấu trúc thư mục (tự tạo khi có file đầu tiên)

```
uploads/
├── tts-cache/          ← cache audio hội thoại (api/tts.ts)
│   ├── en-US/female/  ·  en-US/male/
│   └── vi-VN/female/  ·  vi-VN/male/
└── pronunciations/     ← cache phát âm từ điển (api/pronunciation.ts)
    ├── apple-female.mp3
    └── apple-male.mp3
```

### Theo dõi dung lượng

```bash
du -sh uploads/          # tổng dung lượng
du -sh uploads/*/        # theo thư mục con
df -h                    # ổ cứng tổng thể
```

---

## Backup (tùy chọn)

```bash
crontab -e
# Backup uploads hàng tuần (Chủ Nhật 2h sáng):
0 2 * * 0 tar -czf ~/backup-uploads-$(date +\%Y\%m\%d).tar.gz ~/bilingual-english-vietnamese/uploads/
```

> Audio cache có thể tạo lại được (chỉ tốn thêm lượt Google TTS). Dữ liệu quan trọng nằm ở **Supabase** — bật Point-in-Time Recovery / backup ở Supabase Dashboard.

---

## Script deploy nhanh khi cập nhật code

Tạo file `~/deploy-english-tutor.sh`:

```bash
#!/bin/bash
set -e   # dừng ngay nếu có lệnh lỗi

cd ~/bilingual-english-vietnamese

echo "📥 Pull code mới..."
git pull origin main

echo "📦 Cài thư viện..."
source ~/.nvm/nvm.sh && nvm use 22 && npm install

echo "🔨 Build frontend..."
npm run build

echo "🔄 Reload app (zero-downtime)..."
pm2 reload ecosystem.config.cjs

echo "✅ Deploy xong!"
curl -s http://localhost:3000/api/health && echo
pm2 status
```

```bash
chmod +x ~/deploy-english-tutor.sh
~/deploy-english-tutor.sh   # mỗi lần update chỉ cần chạy lệnh này
```

---

## Chạy chung với app khác (Node 16)

Mỗi app dùng đúng `interpreter` của mình trong file ecosystem — không xung đột.

```bash
nvm install 16   # nếu chưa có
nvm which 16     # copy đường dẫn vào ecosystem của app kia
```

```
english-tutor → interpreter: .../v22.x.x/bin/node   port: 3000
xboss         → interpreter: .../v16.x.x/bin/node   port: 8000
```

---

## Xử lý sự cố thường gặp

### App không start
```bash
pm2 logs english-tutor --lines 50
```
Hay gặp: sai `interpreter` trong `ecosystem.config.cjs` → chạy lại `nvm which 22`.

### Nginx 502 Bad Gateway
Express chưa chạy hoặc sai port.
```bash
pm2 status
curl http://localhost:3000/api/health
```

### Đăng nhập lỗi / không gọi được API
```bash
cat .env                          # kiểm tra đủ key
# Nếu API bị chặn: kiểm tra ALLOWED_ORIGINS có khớp tên miền không
pm2 reload ecosystem.config.cjs   # reload sau khi sửa .env
```

### Gia hạn SSL thủ công
```bash
sudo certbot renew && sudo systemctl reload nginx
```

---

## Tóm tắt lệnh hay dùng

```bash
pm2 status                          # trạng thái tất cả app
pm2 logs english-tutor              # log realtime
pm2 reload ecosystem.config.cjs     # restart không downtime
sudo systemctl reload nginx         # reload Nginx sau khi sửa config
~/deploy-english-tutor.sh           # deploy code mới
curl https://yourdomain.com/api/health   # kiểm tra app sống

# Storage
du -sh uploads/                     # dung lượng cache audio
ls uploads/tts-cache/en-US/female/  # xem file đã cache
```

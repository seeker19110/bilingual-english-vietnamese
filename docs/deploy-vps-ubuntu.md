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
[Nginx :443]  ← nhận HTTPS, tên miền, gzip, serve file audio tĩnh /uploads/
   │
[Express :3001]  ← server.ts: api/*.ts + phục vụ React build (dist/)
   │
[Supabase]  ← database (bảng user, lịch sử học, tts_cache), auth (RLS)
```

App chạy bằng **PM2** trên **Node.js 22** (yêu cầu tối thiểu).

> ⚠️ **Bắt buộc Node 22 trở lên.** Node 20 thiếu WebSocket gốc → thư viện Supabase
> ném lỗi khi xác thực → **mọi request đăng nhập bị `AUTH_FAILED`**.

---

## Thông tin VPS thực tế đang dùng

| Mục | Giá trị |
|---|---|
| OS | Ubuntu 24.04 |
| Node | v22.22.3 (cài hệ thống, đường dẫn `/usr/bin/node`) |
| Thư mục app | `/var/www/english-tutor` |
| Port app | **3001** (3000 đã bị app `xboss` chiếm) |
| Domain | `en-vi.donghanhcungban.com` |
| Audio storage | **Local VPS** (`/var/www/english-tutor/uploads/`) |
| PM2 app name | `english-tutor` (id 3) |

---

## ✅ Checklist trước khi bắt đầu

| Tiện ích | Bắt buộc? | Bước |
|---|---|---|
| Bảng Supabase (`schema.sql`) | ✅ | Bước 0 |
| Firewall `ufw` | ✅ Nên có | Bước 1 |
| Node.js 22 | ✅ | Bước 2 |
| Nginx + PM2 + log rotation | ✅ | Bước 3 |
| `.env` đủ key | ✅ | Bước 4 |
| HTTPS (Let's Encrypt) | ✅ | Bước 7 |
| Pre-cache audio (seed scripts) | ⬜ Khuyên dùng | Bước 8 |
| Backup uploads | ⬜ Tùy chọn | mục riêng |

---

## Bước 0 — Chuẩn bị Supabase (tạo bảng + lấy key)

App **không chạy được** nếu chưa tạo bảng trong database.

1. Mở **Supabase Dashboard → SQL Editor → New query**.
2. Mở file `supabase/schema.sql` trong repo, copy toàn bộ nội dung, dán vào và bấm **Run**.
   - Tạo các bảng: `profiles`, `daily_usage`, `tts_cache`, `pronunciations`, `chat_sessions`, `writing_submissions`, `speaking_sessions` kèm Row Level Security (RLS).
3. Lấy các key (**Project Settings → API**):
   - `Project URL` → `VITE_SUPABASE_URL` và `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key (bí mật!) → `SUPABASE_SERVICE_ROLE_KEY`

> Dùng `STORAGE_DRIVER=local` thì **không cần** tạo Storage bucket trên Supabase.

---

## Bước 1 — Bật firewall (ufw)

```bash
sudo ufw allow OpenSSH      # cổng 22 — đừng quên, kẻo tự khóa mình ngoài SSH
sudo ufw allow 'Nginx Full' # cổng 80 (HTTP) + 443 (HTTPS)
sudo ufw enable
sudo ufw status
```

> Express chạy ở cổng 3001 — **không cần mở ra ngoài** (chỉ Nginx gọi nội bộ).

---

## Bước 2 — Cài Node.js 22

### Cách A: Cài qua NodeSource (Node hệ thống — đơn giản hơn, đang dùng)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # phải ra v22.x.x
which node   # lấy đường dẫn → dùng ở Bước 5, ví dụ: /usr/bin/node
```

### Cách B: Dùng NVM (nếu cần chạy nhiều version Node song song)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm which 22   # lấy đường dẫn → dùng ở Bước 5
```

> VPS hiện tại dùng **Cách A** (`/usr/bin/node`).

---

## Bước 3 — Cài Nginx, PM2 và log rotation

```bash
sudo apt update && sudo apt install -y nginx

npm install -g pm2

pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## Bước 4 — Clone code, tạo `.env`, cài đặt, build

```bash
cd /var/www
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git english-tutor
cd english-tutor

mkdir -p logs uploads

nano .env
```

Nội dung `.env` đầy đủ (xem `.env.example` trong repo để có danh sách mới nhất):

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

# ── Mã hóa audio cache (bắt buộc — 32 byte base64) ──
# Tạo key: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# ⚠️ Sau khi tạo xong KHÔNG ĐỔI — đổi key thì toàn bộ audio cache cũ giải mã thất bại
TTS_ENCRYPTION_MASTER_KEY=...

# ── Bảo mật: chỉ cho domain thật gọi API ──
ALLOWED_ORIGINS=https://en-vi.donghanhcungban.com

# ── Lưu audio TTS trên ổ đĩa VPS (miễn phí, không tốn Supabase Storage) ──
STORAGE_DRIVER=local
UPLOADS_DIR=/var/www/english-tutor/uploads

# ── Cổng app (3001 vì 3000 đã bị app khác dùng) ──
PORT=3001
```

> **Thiếu `TTS_ENCRYPTION_MASTER_KEY`** → audio cache mã hóa/giải mã thất bại, app fallback giọng trình duyệt.
> **Thiếu `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`** → đăng nhập lỗi.
> **Bỏ trống `ALLOWED_ORIGINS`** = cho phép mọi domain gọi API (chỉ dùng lúc dev).

```bash
npm install
npm run build
```

---

## Bước 5 — Cấu hình `ecosystem.config.cjs` (PM2)

```bash
nano ecosystem.config.cjs
```

Nội dung cho VPS này (Node hệ thống `/usr/bin/node`, port 3001):

```js
module.exports = {
  apps: [
    {
      name: 'english-tutor',
      script: './node_modules/.bin/tsx',
      args: 'server.ts',

      // Đường dẫn Node — lấy bằng: which node (Node hệ thống) hoặc: nvm which 22 (NVM)
      interpreter: '/usr/bin/node',

      env: {
        NODE_ENV: 'production',
        PORT: 3001,   // đổi nếu cổng này đã bị app khác dùng
      },

      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
```

Kiểm tra:
```bash
grep interpreter ecosystem.config.cjs
```

---

## Bước 6 — Chạy app với PM2

```bash
pm2 start ecosystem.config.cjs

pm2 status   # cột "status" phải là "online"

pm2 logs english-tutor   # log realtime (Ctrl+C để thoát)

# Tự khởi động khi VPS reboot
pm2 startup   # chạy lệnh sudo nó in ra
pm2 save

# Kiểm tra app sống
curl http://localhost:3001/api/health
# Kết quả: {"status":"ok","uptime":...}
```

---

## Bước 7 — Nginx reverse proxy + HTTPS

### 7a. Tạo config Nginx

```bash
sudo nano /etc/nginx/sites-available/en-vi
```

Dán nội dung (thay domain nếu cần):

```nginx
server {
    server_name en-vi.donghanhcungban.com;

    # Ẩn phiên bản nginx trong header "Server:" — tránh lộ thông tin hệ thống
    server_tokens off;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;
    gzip_min_length 1024;

    # Serve file audio TTS trực tiếp từ ổ cứng — nhanh hơn qua Express
    location /uploads/ {
        alias /var/www/english-tutor/uploads/;
        add_header Cache-Control "public, max-age=31536000";
        add_header Access-Control-Allow-Origin *;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/en-vi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7b. Cài HTTPS miễn phí (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d en-vi.donghanhcungban.com

# Kiểm tra tự gia hạn
sudo certbot renew --dry-run
```

Certbot tự sửa file Nginx thêm block HTTPS + tự gia hạn mỗi 90 ngày.

Kiểm tra:
```bash
curl https://en-vi.donghanhcungban.com/api/health
```

---

## Bước 8 — Pre-cache audio (khuyên chạy 1 lần sau deploy)

Chạy trước để người dùng đầu tiên đã có audio ngay, không phải chờ generate:

```bash
cd /var/www/english-tutor

# Cache phát âm từ điển (~8800 từ × 2 giọng nam/nữ)
npm run seed:pronunciation

# Pre-cache câu mẫu luyện nói (~1677 câu × 2 ngôn ngữ × 2 giọng = 6708 file)
BASE_URL=https://en-vi.donghanhcungban.com npm run prefetch:tts-patterns
```

> Hai script này tự bỏ qua file đã có — **chạy lại an toàn**.
> Nếu cần tạo lại toàn bộ (vd. cache cũ bị hỏng): thêm `-- --force` vào cuối.

---

## Cập nhật code mới (deploy lại)

```bash
cd /var/www/english-tutor
git pull origin main
npm install        # chỉ cần nếu package.json đổi
npm run build      # chỉ cần nếu code frontend thay đổi
pm2 reload ecosystem.config.cjs   # zero-downtime restart
```

Hoặc tạo script tự động (`~/deploy-english-tutor.sh`):

```bash
#!/bin/bash
set -e

cd /var/www/english-tutor
echo "📥 Pull code mới..."
git pull origin main

echo "📦 Cài thư viện..."
npm install

echo "🔨 Build frontend..."
npm run build

echo "🔄 Reload app..."
pm2 reload ecosystem.config.cjs

echo "✅ Deploy xong!"
curl -s http://localhost:3001/api/health && echo
pm2 status
```

```bash
chmod +x ~/deploy-english-tutor.sh
~/deploy-english-tutor.sh   # mỗi lần update chạy lệnh này
```

---

## Chạy chung với app khác trên cùng VPS

VPS này đang có 2 app PM2:
- **`xboss`** (id 0) — Next.js, port 3000, interpreter riêng
- **`english-tutor`** (id 3) — Express, port 3001, interpreter `/usr/bin/node`

Mỗi app có `interpreter` và `PORT` riêng trong `ecosystem.config.cjs` của mình → không xung đột.

---

## Health check

```bash
curl https://en-vi.donghanhcungban.com/api/health
# {"status":"ok","uptime":123.4,"time":"2026-06-21T..."}
```

---

## Theo dõi dung lượng audio

```bash
du -sh /var/www/english-tutor/uploads/          # tổng
du -sh /var/www/english-tutor/uploads/*/        # theo thư mục con
ls uploads/tts-cache/en-US/female/ | wc -l      # đếm file đã cache
df -h                                            # ổ cứng tổng thể
```

---

## Backup

Audio cache **có thể tạo lại** bằng script seed (chỉ tốn thêm Google TTS quota).
Dữ liệu quan trọng (tài khoản, lịch sử học) nằm trên **Supabase** — bật backup ở Supabase Dashboard.

```bash
# Backup uploads thủ công
tar -czf ~/backup-uploads-$(date +%Y%m%d).tar.gz /var/www/english-tutor/uploads/

# Tự động hàng tuần (Chủ Nhật 2h sáng)
crontab -e
# 0 2 * * 0 tar -czf ~/backup-uploads-$(date +\%Y\%m\%d).tar.gz /var/www/english-tutor/uploads/
```

---

## Xử lý sự cố thường gặp

### App không start
```bash
pm2 logs english-tutor --lines 50
```
Hay gặp: sai `interpreter` trong `ecosystem.config.cjs` — kiểm tra:
```bash
grep interpreter ecosystem.config.cjs
which node   # hoặc nvm which 22
```

### Nginx 502 Bad Gateway
Express chưa chạy hoặc sai port.
```bash
pm2 status
curl http://localhost:3001/api/health
```
Nếu app không trả lời, kiểm tra port trong `.env` (`PORT=3001`) và `ecosystem.config.cjs`.

### Đăng nhập lỗi / không gọi được API
```bash
# Kiểm tra đủ key chưa
grep -E "^(VITE_SUPABASE|ANTHROPIC|GOOGLE_TTS|TTS_ENCRYPTION|ALLOWED_ORIGINS)" .env

# Reload sau khi sửa .env
pm2 reload ecosystem.config.cjs --update-env
```
Hay gặp: `ALLOWED_ORIGINS` không có domain của bạn → bị chặn CORS.

### Audio không phát / fallback về giọng trình duyệt
```bash
# Kiểm tra file audio đã có chưa
ls /var/www/english-tutor/uploads/tts-cache/en-US/female/ | head

# Kiểm tra Nginx phục vụ được không
curl -I https://en-vi.donghanhcungban.com/uploads/tts-cache/en-US/female/<tên-file>.mp3
```
Hay gặp: `TTS_ENCRYPTION_MASTER_KEY` bị đổi → giải mã thất bại. Key phải giống nhau từ lúc tạo đến khi dùng.

### Gia hạn SSL thủ công
```bash
sudo certbot renew && sudo systemctl reload nginx
```

---

## Tóm tắt lệnh hay dùng

```bash
pm2 status                                # trạng thái tất cả app
pm2 logs english-tutor                    # log realtime
pm2 reload ecosystem.config.cjs          # restart không downtime
pm2 restart english-tutor --update-env   # restart + nạp lại .env
sudo nginx -t && sudo systemctl reload nginx   # reload Nginx sau khi sửa config

# Deploy nhanh
~/deploy-english-tutor.sh

# Kiểm tra
curl https://en-vi.donghanhcungban.com/api/health

# Audio cache
du -sh /var/www/english-tutor/uploads/
BASE_URL=https://en-vi.donghanhcungban.com npm run prefetch:tts-patterns -- --force
```

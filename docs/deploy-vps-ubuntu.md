# Triển khai lên VPS Ubuntu Server

> Hướng dẫn này dành cho người mới — giải thích từng bước từ cài môi trường đến HTTPS.
> Đọc hết một lần trước khi bắt đầu để hiểu tổng thể.
>
> **Dự án deploy bằng VPS (Express `server.ts` + PM2 + Nginx) — KHÔNG dùng Vercel.**
>
> Muốn thêm Cloudflare (CDN + chống DDoS, miễn phí) trước VPS này? Xem
> `docs/cloudflare-setup.md` — làm SAU KHI app đã chạy ổn qua Nginx (hướng dẫn dưới đây).

---

## Kiến trúc tổng quan

```
Internet
   │
[Nginx :443]  ← nhận HTTPS, tên miền, gzip, serve file audio tĩnh /uploads/
   │
[Express :3001]  ← server.ts: api/*.ts (auth Bearer token tự viết) + phục vụ React build (dist/)
   │
[PostgreSQL tự host]  ← database (user, lịch sử học, tts_cache...) — cùng VPS
   │
[Cloudflare R2 hoặc /uploads/ local]  ← audio cache TTS/phát âm (STORAGE_DRIVER)
```

App chạy bằng **PM2** trên **Node.js 22** (yêu cầu tối thiểu — dùng cho `tsx`/ESM và các
thư viện hiện tại, không còn ràng buộc riêng nào từ Supabase).

---

## Thông tin VPS thực tế đang dùng

| Mục           | Giá trị                                            |
| ------------- | -------------------------------------------------- |
| OS            | Ubuntu 24.04                                       |
| Node          | v22.22.3 (cài hệ thống, đường dẫn `/usr/bin/node`) |
| Thư mục app   | `/var/www/english-tutor`                           |
| Port app      | **3001** (3000 đã bị app `xboss` chiếm)            |
| Domain        | `en-vi.donghanhcungban.com`                        |
| Audio storage | **Local VPS** (`/var/www/english-tutor/uploads/`)  |
| PM2 app name  | `english-tutor` (id 3)                             |

---

## ✅ Checklist trước khi bắt đầu

| Tiện ích                       | Bắt buộc?      | Bước      |
| ------------------------------ | -------------- | --------- |
| PostgreSQL tự host + bảng      | ✅             | Bước 0    |
| Firewall `ufw`                 | ✅ Nên có      | Bước 1    |
| Node.js 22                     | ✅             | Bước 2    |
| Nginx + PM2 + log rotation     | ✅             | Bước 3    |
| `.env` đủ key                  | ✅             | Bước 4    |
| HTTPS (Let's Encrypt)          | ✅             | Bước 7    |
| Pre-cache audio (seed scripts) | ⬜ Khuyên dùng | Bước 8    |
| Backup uploads                 | ⬜ Tùy chọn    | mục riêng |

---

## Bước 0 — Cài PostgreSQL tự host + tạo bảng

App **không chạy được** nếu chưa có database. Xem hướng dẫn đầy đủ (cài đặt, tạo user
riêng không dùng superuser, backup) tại **`docs/setup-postgresql-vps.md`** — tóm tắt:

1. Cài PostgreSQL 16+ qua `apt`, tạo database `english_tutor` + user riêng `tutor_app`
   (không dùng superuser cho app).
2. Ghi connection string vào `.env` VPS: `DATABASE_URL=postgresql://tutor_app:MAT_KHAU@localhost:5432/english_tutor`.
3. Áp schema: `npm run migrate:pg` (đọc `postgres/schema.sql` + mọi file trong
   `postgres/migrations/*.sql` chưa chạy — tạo bảng `users`, `sessions`, `profiles`,
   `daily_usage`, `tts_cache`, `pronunciations`, `learning_progress`... quyền kiểm tra
   nằm trong code `api/`, không còn Row Level Security của Supabase).
4. Thiết lập cron `pg_dump` backup hàng ngày (Postgres tự host không có backup tự động
   như Supabase — xem mục 7 của `docs/setup-postgresql-vps.md`).

> Dùng `STORAGE_DRIVER=local` (mặc định) thì **không cần** cấu hình Cloudflare R2 —
> audio lưu thẳng vào thư mục `uploads/` trên VPS.

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
# ── PostgreSQL tự host (Bước 0) ──
DATABASE_URL=postgresql://tutor_app:mat-khau-that@localhost:5432/english_tutor

# ── Auth tự viết (Bearer token) — Google OAuth Client ID, CẢ 2 biến CÙNG giá trị ──
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com

# ── AI + TTS ──
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_TTS_API_KEY=AIza...
# (Tùy chọn) nhiều key TTS xoay vòng để tránh hết quota — xem .env.example
# GOOGLE_TTS_API_KEYS=AIza...key1,AIza...key2

# ── Mã hóa audio cache (bắt buộc — 32 byte base64) ──
# Tạo key: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# ⚠️ Sau khi tạo xong KHÔNG ĐỔI — đổi key thì toàn bộ audio cache cũ giải mã thất bại
TTS_ENCRYPTION_MASTER_KEY=...

# ── Bảo mật: chỉ cho domain thật gọi API ──
ALLOWED_ORIGINS=https://en-vi.donghanhcungban.com

# ── Lưu audio TTS — local (mặc định, ổ đĩa VPS) hoặc r2 (Cloudflare R2) ──
STORAGE_DRIVER=local
UPLOADS_DIR=/var/www/english-tutor/uploads
# STORAGE_DRIVER=r2 cần thêm R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/
# R2_BUCKET/R2_PUBLIC_BASE_URL — xem .env.example.

# ── Cổng app (3001 vì 3000 đã bị app khác dùng) ──
PORT=3001
```

> **Thiếu `TTS_ENCRYPTION_MASTER_KEY`** → audio cache mã hóa/giải mã thất bại, app fallback giọng trình duyệt.
> **Thiếu `DATABASE_URL`** → app không kết nối được database, mọi request lỗi 500.
> **Bỏ trống `ALLOWED_ORIGINS`** = cho phép mọi domain gọi API (chỉ dùng lúc dev).
> Xem đầy đủ mọi biến (kể cả tùy chọn) tại `.env.example`.

```bash
npm install
npm run build
```

---

## Bước 5 — Cấu hình `ecosystem.config.cjs` (PM2)

```bash
nano ecosystem.config.cjs
```

File này đã có sẵn trong repo — dùng **cluster mode (1 instance) + `wait_ready`** để
`pm2 reload` là zero-downtime thật (process mới sẵn sàng rồi mới tắt process cũ,
xem comment trong `ecosystem.config.cjs`). Port mặc định 3001 — đổi trong `env.PORT`
nếu cổng đã bị app khác dùng.

Lưu ý: cluster mode chạy bằng Node của chính PM2 (không có trường `interpreter`) —
PM2 phải được cài bằng Node ≥ 22 (VPS này: Node hệ thống v22, `/usr/bin/node`).

Kiểm tra Node mà PM2 dùng:

```bash
pm2 info english-tutor | grep -i 'node.js version'
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

File config chuẩn đã có sẵn trong repo tại `nginx/en-vi.conf` (đọc file đó để biết chi tiết:
`/js/`, `/assets/` được serve thẳng từ `dist/` không qua Express để giảm tải; `/uploads/` serve
file audio TTS; `/api/` và phần còn lại proxy về Express port 3001; có sẵn dòng `include` cho
Cloudflare real-IP — xem `docs/cloudflare-setup.md` nếu dùng). Copy lên VPS:

```bash
# Từ thư mục dự án trên VPS
sudo cp nginx/en-vi.conf /etc/nginx/sites-available/en-vi
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

**⚠️ Lưu ý:** Certbot sẽ tự sửa file Nginx để thêm SSL certificate, nhưng sẽ **bỏ đi** `http2` từ dòng `listen`. Sau khi Certbot chạy xong, phải thêm lại `http2`:

```bash
# Sau certbot, edit file lại
sudo nano /etc/nginx/sites-available/en-vi

# Tìm dòng: listen 443 ssl;
# Sửa thành: listen 443 ssl http2;
```

Kiểm tra + reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
curl https://en-vi.donghanhcungban.com/api/health
```

### 7c. Kiểm tra HTTP/2 đã bật

```bash
# Cách 1: dùng curl
curl -I --http2 https://en-vi.donghanhcungban.com
# Kết quả phải có: HTTP/2 200

# Cách 2: dùng h2load (cài: sudo apt install nghttp2)
h2load -n 100 -c 10 https://en-vi.donghanhcungban.com

# Cách 3: kiểm tra online
# Truy cập: https://www.webpagetest.org/ → nhập domain → xem Protocol
```

**Lợi ích HTTP/2:**

- ✅ Multiplexing: gửi nhiều request cùng lúc (không chờ tuần tự)
- ✅ Nén header: giảm ~30% kích thước request/response
- ✅ Server push: đẩy asset trước khi client request (tùy chọn)
- ✅ Phù hợp hơn với nhiều file nhỏ (JS, CSS, hình ảnh)

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

> Có 2 cách: **tự động** (GitHub Actions, chạy sau khi CI pass trên `main` — xem
> `docs/DEPLOY.md`, cũng chạy migration) hoặc **thủ công bằng `deploy.sh`** mô tả dưới đây.

**Cách khuyên dùng khi có migration mới: chạy `bash deploy.sh`** (file có sẵn ở gốc repo, đã theo dõi trong Git —
xem nội dung tại `deploy.sh`). Script này tự làm hết: pull code → cài thư viện → **tự động
chạy mọi migration Postgres tự host còn thiếu** (`npm run migrate:pg`, dừng deploy ngay nếu
migration lỗi) → build → reload PM2 zero-downtime kèm nạp lại `.env` (`scripts/pm2-reload.sh`).

```bash
cd /var/www/english-tutor   # hoặc đường dẫn thật trên VPS của bạn
bash deploy.sh
```

> ⚠️ **Cần có `DATABASE_URL` trong `.env`** (xem Bước 0 + Bước 4 phía trên). Script tự tạo
> bảng theo dõi `_schema_migrations` ở lần chạy đầu tiên. Xem chi tiết + trạng thái từng
> migration tại `postgres/migrations/README.md`.

<details>
<summary>Deploy thủ công từng bước (không dùng <code>deploy.sh</code>)</summary>

```bash
cd /var/www/english-tutor
git pull origin main
npm install        # chỉ cần nếu package.json đổi
npm run migrate:pg # chạy migration Postgres tự host còn thiếu (cần DATABASE_URL trong .env)
npm run build      # chỉ cần nếu code frontend thay đổi
bash scripts/pm2-reload.sh   # reload zero-downtime + health check
```

</details>

---

## Chạy chung với app khác trên cùng VPS

VPS này đang có 2 app PM2:

- **`xboss`** (id 0) — Next.js, port 3000, interpreter riêng
- **`english-tutor`** — Express, port 3001, cluster mode (Node của PM2, hệ thống v22)

Mỗi app có `PORT` riêng trong `ecosystem.config.cjs` của mình → không xung đột.

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
Dữ liệu quan trọng (tài khoản, lịch sử học) nằm trên **PostgreSQL tự host** — cron
`pg_dump` hàng ngày đã thiết lập theo `docs/setup-postgresql-vps.md` mục 7 (Postgres
tự host không có backup tự động như Supabase, tự chịu trách nhiệm backup).

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

Hay gặp: PM2 chạy bằng Node < 22 (cluster mode dùng Node của chính PM2) — kiểm tra:

```bash
pm2 info english-tutor | grep -i 'node.js version'   # phải >= 22
which node   # Node hệ thống, nơi PM2 được cài
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
grep -E "^(DATABASE_URL|GOOGLE_CLIENT_ID|ANTHROPIC|GOOGLE_TTS|TTS_ENCRYPTION|ALLOWED_ORIGINS)" .env

# Reload sau khi sửa .env
pm2 reload ecosystem.config.cjs --update-env
```

Hay gặp: `ALLOWED_ORIGINS` không có domain của bạn → bị chặn CORS. `DATABASE_URL` sai/DB
chưa chạy → mọi request lỗi 500 (`pm2 logs english-tutor` sẽ thấy lỗi kết nối Postgres).

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

## SSH nhanh — tự vào thẳng thư mục app

Để mỗi lần SSH tự nhảy vào `/var/www/english-tutor` (khỏi gõ `cd` lại), thêm
**trên máy cá nhân** của bạn vào file `~/.ssh/config`
(Windows: `C:\Users\<tên-bạn>\.ssh\config`):

```ssh-config
# Host trơn — dùng vào VPS bình thường + chạy lệnh lẻ
Host xboss
    HostName 160.30.172.203
    User root
    IdentityFile ~/.ssh/id_ed25519

# Host tự cd vào thư mục app khi đăng nhập tương tác
Host app
    HostName 160.30.172.203
    User root
    IdentityFile ~/.ssh/id_ed25519
    RequestTTY yes
    RemoteCommand cd /var/www/english-tutor && exec $SHELL -l
```

Cách dùng:

```bash
ssh app                              # → vào thẳng /var/www/english-tutor
ssh xboss                            # → vào VPS như cũ (thư mục home)
ssh xboss "pm2 logs english-tutor"   # → chạy lệnh lẻ trên VPS
```

> ⚠️ Host có `RemoteCommand` (ở đây là `app`) **không** chạy được lệnh lẻ kiểu
> `ssh app "lệnh"` (sẽ báo xung đột lệnh). Vì vậy giữ thêm host trơn `xboss`
> để chạy lệnh nhanh. Đổi `User`/`IdentityFile` cho khớp nếu bạn đăng nhập
> bằng user hoặc khóa khác.

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

# Triển khai lên VPS Ubuntu Server

> Hướng dẫn này dành cho người mới — giải thích từng bước từ cài môi trường đến HTTPS.
> Đọc hết một lần trước khi bắt đầu để hiểu tổng thể.

---

## Kiến trúc tổng quan

```
Internet
   │
[Nginx :443]  ← nhận HTTPS, tên miền, chuyển tiếp request
   │
[Express :3000]  ← api/*.ts + phục vụ React build (dist/)
   │
[Supabase]  ← database, storage, auth (giữ nguyên như cũ)
```

App chạy bằng **PM2** (process manager) trên **Node.js 20** (qua NVM).
Nếu VPS đang chạy app khác dùng Node 16, hai app vẫn cùng tồn tại — mỗi app chỉ định đúng version Node của mình trong `ecosystem.config.cjs`.

---

## Yêu cầu

- VPS Ubuntu 22.04 hoặc 24.04
- Tên miền trỏ vào IP của VPS (DNS A record)
- SSH vào VPS với quyền `sudo`
- File `.env` ở máy local (cần copy lên VPS)

---

## Bước 1 — Cài NVM + Node.js trên VPS

Dùng **NVM** để quản lý nhiều version Node song song — không xung đột với app khác đang chạy Node 16.

```bash
# Cài NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Nạp NVM vào shell hiện tại (không cần logout)
source ~/.bashrc

# Kiểm tra
nvm --version

# Cài Node 20
nvm install 20

# Lấy đường dẫn chính xác của Node 20 — copy kết quả này, dùng ở Bước 4
nvm which 20
# Ví dụ ra: /root/.nvm/versions/node/v20.19.0/bin/node
```

---

## Bước 2 — Cài Nginx và PM2

```bash
# Cài Nginx
sudo apt install -y nginx

# Cài PM2 toàn cục (dùng Node đang active — có thể là bất kỳ version nào)
npm install -g pm2
```

---

## Bước 3 — Clone code và cài đặt

```bash
# Clone repo
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git
cd bilingual-english-vietnamese

# Tạo thư mục log (PM2 ghi log vào đây)
mkdir -p logs

# Tạo file .env — dán nội dung từ máy local vào
nano .env
```

Nội dung `.env` cần có:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_TTS_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
TTS_ENCRYPTION_MASTER_KEY=...
PORT=3000

# Lưu file audio trên VPS thay vì Supabase Storage
STORAGE_DRIVER=local
# Thư mục lưu file (mặc định: <project>/uploads, có thể đổi nếu muốn)
# UPLOADS_DIR=/root/bilingual-english-vietnamese/uploads
```

> Thiếu `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` → đăng nhập sẽ báo lỗi (frontend không kết nối được Supabase).
> Thiếu `TTS_ENCRYPTION_MASTER_KEY` → audio TTS cache mã hóa/giải mã thất bại, app tự fallback giọng trình duyệt nhưng mất cache.
> Tạo `TTS_ENCRYPTION_MASTER_KEY` bằng lệnh: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` (xem `.env.example`).

```bash
# Cài thư viện (bao gồm express đã thêm vào package.json)
nvm use 20
npm install

# Build frontend React → thư mục dist/
npm run build
```

---

## Bước 4 — Cập nhật đường dẫn Node trong ecosystem.config.cjs

### Bước 4.1 — Lấy đường dẫn Node 20 (nếu chưa copy ở Bước 1)

```bash
nvm which 20
# Ví dụ kết quả: /root/.nvm/versions/node/v20.19.0/bin/node
```

Copy toàn bộ dòng kết quả đó.

### Bước 4.2 — Mở file cấu hình PM2

```bash
nano ecosystem.config.cjs
```

### Bước 4.3 — Tìm và sửa dòng interpreter

Tìm dòng này trong file:

```js
interpreter: '/root/.nvm/versions/node/v20.19.0/bin/node',
```

Xóa đường dẫn cũ, dán đường dẫn vừa copy vào. Ví dụ nếu VPS của bạn ra `/root/.nvm/versions/node/v20.18.3/bin/node` thì sửa thành:

```js
interpreter: '/root/.nvm/versions/node/v20.18.3/bin/node',
```

Lưu file: nhấn `Ctrl + X` → `Y` → `Enter`

### Bước 4.4 — Kiểm tra nhanh file đã đúng chưa

```bash
grep interpreter ecosystem.config.cjs
# Phải thấy đúng đường dẫn của bạn, ví dụ:
# interpreter: '/root/.nvm/versions/node/v20.18.3/bin/node',
```

---

## Bước 5 — Chạy app với PM2

```bash
# Khởi động app
pm2 start ecosystem.config.cjs

# Xem trạng thái — cột "status" phải là "online"
pm2 status

# Xem log realtime
pm2 logs english-tutor

# Cấu hình tự khởi động khi VPS reboot
pm2 startup        # chạy lệnh nó in ra (bắt đầu bằng sudo)
pm2 save

# Kiểm tra app phản hồi
curl http://localhost:3000
```

---

## Bước 6 — Cài Nginx làm reverse proxy

```bash
sudo nano /etc/nginx/sites-available/english-tutor
```

Dán nội dung (thay `yourdomain.com` bằng tên miền thật):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10M;

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

# Kiểm tra cú pháp không có lỗi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Bước 7 — Cài HTTPS miễn phí với Let's Encrypt

```bash
# Cài certbot
sudo apt install -y certbot python3-certbot-nginx

# Lấy chứng chỉ SSL (nhập email khi được hỏi)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Kiểm tra tự gia hạn hoạt động
sudo certbot renew --dry-run
```

Certbot tự sửa file Nginx và thêm cấu hình HTTPS. Chứng chỉ tự gia hạn mỗi 90 ngày.

App chạy tại `https://yourdomain.com` ✅

---

## Chạy chung với app khác (Node 16)

Nếu VPS đang có app khác dùng Node 16, chỉ cần tạo file `ecosystem.config.cjs` riêng cho app đó với đường dẫn Node 16:

```bash
# Lấy đường dẫn Node 16
nvm install 16   # nếu chưa có
nvm which 16     # copy kết quả
```

Mỗi app dùng đúng `interpreter` của mình trong file ecosystem — không xung đột.

```
english-tutor → interpreter: .../v20.x.x/bin/node   port: 3000
xboss         → interpreter: .../v16.x.x/bin/node   port: 8000
```

---

## Script deploy nhanh khi cập nhật code

Tạo file `~/deploy-english-tutor.sh` trên VPS:

```bash
nano ~/deploy-english-tutor.sh
```

```bash
#!/bin/bash
set -e   # dừng ngay nếu có lệnh lỗi

cd ~/bilingual-english-vietnamese

echo "📥 Pull code mới..."
git pull origin main

echo "📦 Cài thư viện..."
nvm use 20 && npm install

echo "🔨 Build frontend..."
npm run build

echo "🔄 Reload app (zero-downtime)..."
pm2 reload ecosystem.config.cjs

echo "✅ Deploy xong!"
pm2 status
```

```bash
chmod +x ~/deploy-english-tutor.sh
```

Mỗi lần cập nhật chỉ cần:

```bash
~/deploy-english-tutor.sh
```

---

## Local Storage — lưu file audio trên VPS

> VPS có 30GB ổ cứng, dùng local storage thay Supabase Storage để **miễn phí hoàn toàn**.

### Cấu trúc thư mục tự động tạo

```
uploads/
├── tts-cache/          ← cache audio hội thoại (api/tts.ts)
│   ├── en-US/female/
│   ├── en-US/male/
│   ├── vi-VN/female/
│   └── vi-VN/male/
└── pronunciations/     ← cache phát âm từ điển (api/pronunciation.ts)
    ├── apple-female.mp3
    └── apple-male.mp3
```

Thư mục tự tạo khi có file đầu tiên — không cần tạo tay.

### Cấp quyền cho thư mục uploads

```bash
mkdir -p uploads
chmod 755 uploads
```

### Cấu hình Nginx serve file audio trực tiếp (nhanh hơn qua Express)

Mở file Nginx đã tạo ở Bước 6:

```bash
sudo nano /etc/nginx/sites-available/english-tutor
```

Thêm block `location /uploads` vào **trước** block `location /`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10M;

    # Serve file audio trực tiếp — cache 30 ngày trên trình duyệt
    location /uploads/ {
        alias /root/bilingual-english-vietnamese/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

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
sudo nginx -t && sudo systemctl reload nginx
```

### Theo dõi dung lượng uploads

```bash
du -sh uploads/          # tổng dung lượng
du -sh uploads/*/        # theo từng thư mục con
df -h                    # ổ cứng tổng thể
```

### Backup uploads (tùy chọn)

File audio cache có thể tạo lại được — nếu mất chỉ tốn thêm lượt gọi Google TTS. Nhưng nếu muốn backup:

```bash
# Thêm vào crontab: backup hàng tuần vào Chủ Nhật 2 giờ sáng
crontab -e
# Thêm dòng:
0 2 * * 0 tar -czf ~/backup-uploads-$(date +\%Y\%m\%d).tar.gz ~/bilingual-english-vietnamese/uploads/
```

---

## Xử lý sự cố thường gặp

### App không start được

```bash
pm2 logs english-tutor --lines 50   # xem lỗi cụ thể
```

Nguyên nhân hay gặp: sai đường dẫn `interpreter` trong `ecosystem.config.cjs` — chạy lại `nvm which 20` để lấy đường dẫn đúng.

### Nginx trả lỗi 502 Bad Gateway

Express chưa chạy hoặc sai port.

```bash
pm2 status                     # kiểm tra "online"
curl http://localhost:3000      # kiểm tra Express phản hồi
```

### Thiếu biến môi trường

```bash
cat .env                        # kiểm tra có đủ key
pm2 reload ecosystem.config.cjs # reload sau khi sửa .env
```

### Gia hạn SSL thủ công

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Tóm tắt lệnh hay dùng

```bash
pm2 status                          # xem trạng thái tất cả app
pm2 logs english-tutor              # xem log realtime
pm2 reload ecosystem.config.cjs     # restart không downtime
pm2 stop english-tutor              # dừng app
sudo systemctl reload nginx         # reload Nginx sau khi sửa config
~/deploy-english-tutor.sh           # deploy code mới

# Storage
du -sh uploads/                     # kiểm tra dung lượng cache audio
ls uploads/tts-cache/en-US/female/  # xem file đã cache
```

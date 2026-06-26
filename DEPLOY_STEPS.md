# Quy Trình Deploy English Tutor

> Hướng dẫn chi tiết từ setup lần đầu đến deploy lại.

---

## 📌 Tóm tắt nhanh

### Deploy lần 1 (Setup toàn bộ)
Xem **`docs/deploy-vps-ubuntu.md`** (8 bước chính).

### Deploy lần 2+ (Cập nhật code)
```bash
./scripts/deploy.sh
```

---

## 🚀 Deploy Lần 1: Setup VPS từ đầu (8 bước)

### Bước 0️⃣ Chuẩn bị Supabase
- Tạo bảng database (copy `supabase/schema.sql` vào Supabase SQL Editor)
- Lấy 3 key: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Bước 1️⃣ Bật Firewall
```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

### Bước 2️⃣ Cài Node.js 22
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # phải là v22.x.x
```

### Bước 3️⃣ Cài Nginx + PM2
```bash
sudo apt update && sudo apt install -y nginx
npm install -g pm2
pm2 install pm2-logrotate
```

### Bước 4️⃣ Clone code + Setup `.env`
```bash
cd /var/www
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git english-tutor
cd english-tutor

mkdir -p logs uploads

# Chỉnh sửa .env (thêm tất cả key từ Supabase, Anthropic, Google TTS, v.v.)
nano .env

# Build
npm install && npm run build
```

**Kiểm tra `.env` có đủ:**
- ✅ `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (frontend)
- ✅ `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server)
- ✅ `ANTHROPIC_API_KEY` hoặc model khác (AI)
- ✅ `GOOGLE_TTS_API_KEY` (text-to-speech)
- ✅ `TTS_ENCRYPTION_MASTER_KEY` (mã hóa audio cache — sinh bằng `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
- ✅ `ALLOWED_ORIGINS=https://en-vi.donghanhcungban.com`
- ✅ `STORAGE_DRIVER=local` + `UPLOADS_DIR=/var/www/english-tutor/uploads`
- ✅ `PORT=3001` (hoặc port trống khác nếu 3001 đã bị dùng)

### Bước 5️⃣ Cấu hình PM2
```bash
nano ecosystem.config.cjs
# Đảm bảo: interpreter: '/usr/bin/node' (lấy bằng: which node)
# Đảm bảo: PORT=3001
```

### Bước 6️⃣ Start app + tự khởi động
```bash
pm2 start ecosystem.config.cjs
pm2 startup
pm2 save
pm2 status   # phải là "online"
```

### Bước 7️⃣ Nginx Reverse Proxy + HTTPS
```bash
sudo nano /etc/nginx/sites-available/en-vi
# (Dán config — xem docs/deploy-vps-ubuntu.md)

sudo ln -s /etc/nginx/sites-available/en-vi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d en-vi.donghanhcungban.com
```

### Bước 8️⃣ Pre-cache Audio (tuỳ chọn, nhưng khuyên làm)
```bash
npm run seed:pronunciation
BASE_URL=https://en-vi.donghanhcungban.com npm run prefetch:tts-patterns
```

✅ **Setup xong!** Check: `https://en-vi.donghanhcungban.com`

---

## 🔄 Deploy Lần 2+ (Cập nhật code từ GitHub)

### Cách nhanh nhất:
```bash
./scripts/deploy.sh
```

### Hoặc chạy từng lệnh:
```bash
ssh root@160.30.172.203

cd /var/www/english-tutor
git pull origin main
npm install
npm run build
pm2 reload ecosystem.config.cjs

# Kiểm tra
curl https://en-vi.donghanhcungban.com/api/health
```

---

## 🛠️ Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| App không start | `pm2 logs english-tutor` — xem chi tiết error |
| Nginx 502 | Kiểm tra `pm2 status` + `curl http://localhost:3001/api/health` |
| Đăng nhập lỗi | Kiểm tra `.env` có đủ key Supabase không; reload: `pm2 restart english-tutor --update-env` |
| Audio không phát | Kiểm tra `ls /var/www/english-tutor/uploads/tts-cache/` có file không |
| SSL lỗi | `sudo certbot renew --dry-run` |

---

## 📂 Cấu trúc Deploy

```
/var/www/english-tutor/
├── .env                    ← key bí mật (git ignore)
├── .git/                   ← repo GitHub
├── dist/                   ← React build
├── node_modules/
├── ecosystem.config.cjs    ← PM2 config
├── server.ts              ← Express app
├── api/                   ← edge functions
├── src/                   ← React code
├── uploads/               ← audio cache (local)
│   └── tts-cache/
├── logs/                  ← PM2 logs
└── docs/
    └── deploy-vps-ubuntu.md
```

---

## 📊 Giám sát

```bash
# Log realtime
pm2 logs english-tutor

# Kiểm tra health
curl https://en-vi.donghanhcungban.com/api/health

# Dung lượng audio
du -sh /var/www/english-tutor/uploads/

# Trạng thái PM2
pm2 status
```

---

## 🔑 Biến môi trường bắt buộc

Tạo `nano /var/www/english-tutor/.env` với:

```env
# === Supabase ===
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# === AI ===
ANTHROPIC_API_KEY=sk-ant-xxx...
# Hoặc: GROQ_API_KEY=gsk_xxx... (cho STT)
# Hoặc: OPENAI_API_KEY=sk-xxx... (cho STT)

# === Text-to-Speech ===
GOOGLE_TTS_API_KEY=AIza...
TTS_ENCRYPTION_MASTER_KEY=xxxxxx...  # base64, 32 byte

# === Bảo mật ===
ALLOWED_ORIGINS=https://en-vi.donghanhcungban.com

# === Storage ===
STORAGE_DRIVER=local
UPLOADS_DIR=/var/www/english-tutor/uploads

# === Server ===
PORT=3001
NODE_ENV=production
```

---

## 📝 Cách cập nhật `.env` trên VPS

```bash
ssh root@160.30.172.203
cd /var/www/english-tutor

# Sửa
nano .env

# Reload app để nạp biến mới
pm2 restart english-tutor --update-env

# Kiểm tra
pm2 logs english-tutor --lines 5
```

---

## 🔗 Tham khảo

- Hướng dẫn đầy đủ: `docs/deploy-vps-ubuntu.md`
- Quick guide: `DEPLOY_QUICK_GUIDE.md`
- Script deploy: `scripts/deploy.sh`

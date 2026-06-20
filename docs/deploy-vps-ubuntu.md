# Triển khai lên VPS Ubuntu Server

> Hướng dẫn này dành cho người mới — giải thích từng bước từ cài môi trường đến HTTPS.
> Đọc hết một lần trước khi bắt đầu để hiểu tổng thể.

---

## Kiến trúc tổng quan

```
Internet
   │
[Nginx]  ← nhận HTTPS, tên miền, chuyển tiếp request
   │
[Node.js / Express :3000]  ← chạy API + phục vụ frontend
   │
[Supabase]  ← database, storage, auth (giữ nguyên như cũ)
```

Điểm khác biệt so với Vercel: các file `api/*.ts` (Edge Functions) cần được
bọc trong **Express.js** vì VPS chạy Node.js thuần, không có Vercel runtime.

---

## Yêu cầu

- VPS chạy Ubuntu 22.04 hoặc 24.04
- Đã có tên miền trỏ vào IP của VPS (dùng A record)
- Truy cập SSH vào VPS với quyền `sudo`
- Các biến môi trường trong file `.env` ở máy local

---

## Bước 1 — Cài môi trường trên VPS

SSH vào VPS rồi chạy lần lượt:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra cài thành công
node -v   # phải ra v20.x.x
npm -v

# Cài PM2 — giữ app chạy liên tục, tự restart khi crash hoặc VPS reboot
sudo npm install -g pm2

# Cài Nginx — làm reverse proxy và xử lý HTTPS
sudo apt install -y nginx
```

---

## Bước 2 — Chuyển Edge Functions sang Express

> Vercel Edge Functions không chạy được trên VPS. Bước này tạo một Express server
> bọc lại các handler hiện có — **không cần viết lại logic**.

### 2a. Cài thêm thư viện Express

Chạy trên **máy local** (trong thư mục project):

```bash
npm install express
npm install -D @types/express
```

### 2b. Tạo file `server.ts` ở gốc project

```typescript
// server.ts — Express server thay thế Vercel runtime trên VPS
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'

dotenv.config()

// Import các handler API hiện có (giữ nguyên, không sửa)
import ttsHandler from './api/tts.js'
import claudeHandler from './api/claude.js'
import pronunciationHandler from './api/pronunciation.js'

const app = express()
app.use(express.json())

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Hàm bọc: chuyển Edge Function handler thành Express middleware
// Lý do: Edge Function nhận (Request) → trả (Response) theo Web API chuẩn,
// còn Express dùng (req, res) của Node — cần chuyển đổi qua lại.
function wrapEdge(handler: (req: Request) => Promise<Response>) {
  return async (req: express.Request, res: express.Response) => {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    })

    const webRes = await handler(webReq)

    res.status(webRes.status)
    webRes.headers.forEach((val, key) => res.setHeader(key, val))
    res.send(await webRes.text())
  }
}

// Gắn API routes — thêm vào đây nếu tạo thêm api/*.ts mới
app.all('/api/tts', wrapEdge(ttsHandler))
app.all('/api/claude', wrapEdge(claudeHandler))
app.get('/api/pronunciation', wrapEdge(pronunciationHandler))

// Phục vụ file frontend đã build (thư mục dist/)
app.use(express.static(path.join(__dirname, 'dist')))

// Mọi URL không khớp API đều trả về index.html (React Router xử lý phía client)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`)
})
```

### 2c. Thêm script build vào `package.json`

```json
"scripts": {
  "build:server": "tsc server.ts --esModuleInterop --module esnext --target esnext --moduleResolution bundler --outDir ."
}
```

### 2d. Commit và push lên GitHub

```bash
git add server.ts package.json
git commit -m "feat: thêm Express server cho deploy VPS"
git push origin main
```

---

## Bước 3 — Clone code và cài đặt trên VPS

```bash
# Clone repo (thay URL bằng repo thật)
git clone https://github.com/seeker19110/bilingual-english-vietnamese.git
cd bilingual-english-vietnamese

# Tạo file .env — copy nội dung từ máy local
nano .env
```

Nội dung file `.env` cần có:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_TTS_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

> ⚠️ File `.env` KHÔNG được commit lên GitHub. Kiểm tra `.gitignore` có dòng `.env`.

```bash
# Cài thư viện
npm install

# Build frontend (tạo thư mục dist/)
npm run build

# Build server.ts → server.js
npm run build:server
```

---

## Bước 4 — Chạy app với PM2

```bash
# Khởi động
pm2 start server.js --name "english-tutor"

# Xem trạng thái
pm2 status

# Xem log realtime
pm2 logs english-tutor

# Dừng / restart
pm2 stop english-tutor
pm2 restart english-tutor

# Cấu hình tự khởi động khi VPS reboot (chạy 2 lệnh này theo thứ tự)
pm2 startup        # copy-paste lệnh nó in ra rồi chạy
pm2 save           # lưu danh sách process hiện tại
```

Kiểm tra app đang chạy:

```bash
curl http://localhost:3000/api/tts -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","lang":"en-US"}'
# Phải trả về JSON có audio_url
```

---

## Bước 5 — Cài Nginx làm reverse proxy

```bash
# Tạo file cấu hình cho site
sudo nano /etc/nginx/sites-available/english-tutor
```

Dán nội dung sau (thay `yourdomain.com` bằng tên miền thật):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Giới hạn kích thước request — phòng upload quá lớn
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # Cần thiết cho WebSocket nếu sau này dùng
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Chuyển thông tin client thật cho Express
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

# Kiểm tra cú pháp cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Bước 6 — Cài HTTPS miễn phí với Let's Encrypt

```bash
# Cài certbot
sudo apt install -y certbot python3-certbot-nginx

# Lấy chứng chỉ SSL (nhập email khi được hỏi)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot tự sửa file Nginx và thêm HTTPS. Chứng chỉ tự gia hạn mỗi 90 ngày.

Kiểm tra tự gia hạn hoạt động:

```bash
sudo certbot renew --dry-run
```

Sau bước này, app chạy tại `https://yourdomain.com` ✅

---

## Bước 7 — Script deploy nhanh khi cập nhật code

Tạo file `~/deploy.sh` trên VPS:

```bash
nano ~/deploy.sh
```

```bash
#!/bin/bash
set -e  # dừng ngay nếu có lệnh lỗi

echo "📦 Pulling code mới..."
cd ~/bilingual-english-vietnamese
git pull origin main

echo "📦 Cài thư viện..."
npm install

echo "🔨 Build frontend..."
npm run build

echo "🔨 Build server..."
npm run build:server

echo "🔄 Restart app..."
pm2 restart english-tutor

echo "✅ Deploy xong! App đang chạy tại https://yourdomain.com"
```

```bash
# Cấp quyền chạy
chmod +x ~/deploy.sh
```

Từ nay mỗi lần cập nhật chỉ cần:

```bash
~/deploy.sh
```

---

## Xử lý sự cố thường gặp

### App không chạy

```bash
pm2 logs english-tutor --lines 50   # xem log lỗi
pm2 status                           # kiểm tra trạng thái
```

### Nginx lỗi 502 Bad Gateway

Nguyên nhân: Express chưa chạy hoặc chạy sai port.

```bash
pm2 status                     # kiểm tra english-tutor đang "online"
curl http://localhost:3000      # kiểm tra Express trả về được không
```

### Lỗi thiếu biến môi trường

```bash
cat .env                        # kiểm tra file .env có đủ key
pm2 restart english-tutor       # restart sau khi sửa .env
```

### Gia hạn chứng chỉ SSL thủ công

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## So sánh VPS vs Vercel

| | Vercel | VPS Ubuntu |
|---|---|---|
| Chi phí | Miễn phí (giới hạn bandwidth) | ~$5–10/tháng |
| Độ phức tạp setup | Thấp (push là xong) | Cao hơn (1 lần) |
| Kiểm soát server | Không có | Toàn quyền |
| Tự scale | Có | Tự xử lý |
| HTTPS | Tự động | Certbot (miễn phí) |
| Cron job / background task | Không | Tự cài được |

**Khuyến nghị:** Giữ Vercel cho đến khi có nhu cầu cụ thể cần VPS
(giảm chi phí lâu dài, cần Redis, cron job nặng, hoặc traffic lớn).

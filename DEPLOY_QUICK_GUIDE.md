# QUY TRÌNH DEPLOY NHANH (Lần 2 trở đi)

> Dành cho những lần deploy sau khi đã setup VPS lần đầu. Nếu setup lần đầu, xem **`docs/deploy-vps-ubuntu.md`**.

## 📋 Thông tin VPS
- **Server:** `en-vi.donghanhcungban.com` (160.30.172.203)
- **Port app:** 3001
- **Thư mục:** `/var/www/english-tutor`
- **App name (PM2):** `english-tutor`

---

## 🚀 Deploy lần 2+ (Update code)

### Cách 1: Chạy script tự động (Khuyên dùng)

```bash
ssh root@160.30.172.203
~/deploy-english-tutor.sh
```

Script sẽ:
1. Pull code mới từ GitHub
2. Cài thư viện (nếu `package.json` đổi)
3. Build frontend
4. Reload app (không downtime)
5. Kiểm tra health

---

### Cách 2: Chạy từng lệnh (Nếu script không có)

```bash
ssh root@160.30.172.203

cd /var/www/english-tutor

# Lấy code mới
git pull origin main

# Cài thư viện (chỉ cần khi package.json đổi)
npm install

# Build React frontend
npm run build

# Reload app (zero-downtime)
pm2 reload ecosystem.config.cjs

# Kiểm tra status
pm2 status
curl https://en-vi.donghanhcungban.com/api/health
```

---

## 🔧 Nếu có lỗi

### App không start
```bash
pm2 logs english-tutor --lines 50
```

### Nginx 502
```bash
pm2 status
curl http://localhost:3001/api/health
```

### Đăng nhập lỗi
```bash
# Kiểm tra .env đủ key không
grep -E "^VITE_SUPABASE|^SUPABASE_URL|^ANTHROPIC_API_KEY" .env

# Reload sau khi sửa .env
pm2 restart english-tutor --update-env
```

---

## 📝 Cập nhật `.env` mới

```bash
nano /var/www/english-tutor/.env

# Sửa xong, reload app
pm2 restart english-tutor --update-env
```

> ⚠️ Không được đổi `TTS_ENCRYPTION_MASTER_KEY` — nếu đổi, toàn bộ audio cache cũ sẽ không mở được.

---

## 🎵 Pre-cache audio (Sau deploy lần đầu)

```bash
cd /var/www/english-tutor

# Cache phát âm từ điển
npm run seed:pronunciation

# Pre-cache câu mẫu luyện nói
BASE_URL=https://en-vi.donghanhcungban.com npm run prefetch:tts-patterns
```

> Chỉ cần chạy 1 lần. Lần sau chạy lại an toàn (tự bỏ qua file đã có).

---

## 📊 Giám sát

```bash
# Xem log realtime
pm2 logs english-tutor

# Kiểm tra dung lượng audio cache
du -sh /var/www/english-tutor/uploads/

# Kiểm tra health
curl https://en-vi.donghanhcungban.com/api/health
```

---

## 🔄 Rollback (Quay lại phiên bản cũ)

```bash
cd /var/www/english-tutor

# Xem git log
git log --oneline | head -10

# Quay lại commit cũ
git revert <commit-hash>
# hoặc
git reset --hard <commit-hash>

# Rebuild + reload
npm run build && pm2 reload ecosystem.config.cjs
```

---

## ✅ Checklist trước khi deploy

- [ ] Code đã commit đủ trên GitHub (branch `main`)
- [ ] `.env` trên VPS có `VITE_SUPABASE_*`, `SUPABASE_*`, `ANTHROPIC_API_KEY`, `GOOGLE_TTS_API_KEY`, `TTS_ENCRYPTION_MASTER_KEY`
- [ ] `ALLOWED_ORIGINS` là `https://en-vi.donghanhcungban.com`
- [ ] Port trong `.env` là `3001`
- [ ] `ecosystem.config.cjs` có `interpreter: '/usr/bin/node'`
- [ ] SSL Let's Encrypt còn hiệu lực (tự renew hàng 90 ngày)

---

## 📞 Khác

Xem chi tiết đầy đủ ở `docs/deploy-vps-ubuntu.md`.

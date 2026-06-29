# 🚀 Deploy Guide — English Tutor

## Quick Fix cho 502 Bad Gateway

VPS không có `compression` package. Fix ngay:

```bash
# SSH vào VPS
ssh root@160.30.172.203

# Vào thư mục app
cd /var/www/english-tutor

# Cài dependencies + build
npm install
npm run build

# Restart PM2
pm2 restart english-tutor

# Check status
pm2 logs english-tutor --lines 10
```

---

## Option 1: Manual Deploy (chạy script)

```bash
# Local machine
bash scripts/deploy.sh
```

Điều kiện:

- Có SSH key setup hoặc password SSH
- Node.js v22+

---

## Option 2: Auto Deploy (GitHub Actions)

GitHub Actions sẽ auto deploy khi push lên `main`.

### Setup:

1. **Tạo SSH key trên VPS:**

```bash
ssh-keygen -t ed25519 -f /root/.ssh/github-deploy -N ""
cat /root/.ssh/github-deploy.pub >> /root/.ssh/authorized_keys
```

2. **Add secrets vào GitHub:**
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Thêm 3 secrets:
     - `VPS_HOST`: `160.30.172.203`
     - `VPS_USER`: `root`
     - `VPS_SSH_KEY`: (nội dung file `/root/.ssh/github-deploy`)

3. **Push code lên main:**

```bash
git push origin main
```

GitHub Actions sẽ tự động deploy! ✅

---

## Troubleshooting

### 502 Bad Gateway

- Check: `pm2 logs english-tutor --lines 50`
- Nếu lỗi `compression not found`: `npm install`
- Nếu lỗi build: `npm run build` check error message

### Port 3001 đang dùng

```bash
lsof -i :3001
kill -9 <PID>
```

### PM2 không restart

```bash
pm2 delete english-tutor
pm2 start ecosystem.config.cjs --name english-tutor
```

### Clear cache

```bash
cd /var/www/english-tutor
rm -rf dist node_modules
npm install
npm run build
pm2 restart english-tutor
```

---

## Deploy Status

Xem logs realtime:

```bash
pm2 logs english-tutor -f
```

Health check:

```bash
curl http://localhost:3001/api/health
```

---

## Deployment Checklist

- [ ] SSH key setup (Option 2)
- [ ] GitHub secrets added (Option 2)
- [ ] VPS `.env` có đủ biến (SUPABASE_URL, API keys, etc.)
- [ ] PM2 ecosystem.config.cjs chạy Node v22
- [ ] Nginx proxy setup tới port 3001
- [ ] SSL Let's Encrypt auto-renew hoạt động

---

## Files

- `scripts/deploy.sh` — Manual deploy script
- `.github/workflows/deploy.yml` — GitHub Actions auto deploy
- `ecosystem.config.cjs` — PM2 config
- `docs/deploy-vps-ubuntu.md` — Full setup guide

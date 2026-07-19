# Deploy nhanh (lần 2 trở đi)

> Setup VPS lần đầu: xem **`docs/deploy-vps-ubuntu.md`**. Troubleshooting mở rộng +
> auto-deploy qua GitHub Actions: xem **`docs/DEPLOY.md`**.

## Thông tin VPS

- Server: `en-vi.donghanhcungban.com` (160.30.172.203)
- Port app: 3001 — Thư mục: `/var/www/english-tutor` — PM2 process: `english-tutor`

## Deploy — chạy trên VPS (không phải máy local)

`scripts/deploy.sh` được thiết kế chạy **trực tiếp trên VPS** (tự
`git reset --hard origin/main`, cài lại deps, build, restart PM2):

```bash
ssh root@160.30.172.203
cd /var/www/english-tutor
bash scripts/deploy.sh
```

Hoặc từng lệnh tay:

```bash
cd /var/www/english-tutor
git pull origin main
npm install          # chỉ cần khi package.json đổi
npm run build
pm2 reload ecosystem.config.cjs   # zero-downtime
pm2 status
curl https://en-vi.donghanhcungban.com/api/health
```

## Nếu có lỗi

```bash
pm2 logs english-tutor --lines 50          # app không start
curl http://localhost:3001/api/health      # Nginx 502 → kiểm tra app có chạy không
grep -E "^DATABASE_URL|^GOOGLE_CLIENT_ID" .env  # đăng nhập lỗi / lỗi DB → thiếu biến
pm2 restart english-tutor --update-env      # reload sau khi sửa .env
```

⚠️ Không đổi `TTS_ENCRYPTION_MASTER_KEY` — đổi sẽ làm toàn bộ audio cache cũ không
mở được.

## Migration DB

`scripts/deploy.sh` tự chạy `npm run migrate:pg` (cần `DATABASE_URL` trong `.env`, xem
`.env.example`) — không cần chạy tay trừ khi muốn kiểm tra ngoài luồng deploy:

```bash
npm run migrate:pg
```

## Pre-cache audio (sau deploy lần đầu, tuỳ chọn)

```bash
npm run seed:all
# hoặc riêng lẻ:
npm run seed:pronunciation
BASE_URL=https://en-vi.donghanhcungban.com npm run prefetch:tts-patterns
```

Chạy lại an toàn — tự bỏ qua audio đã có.

## Rollback

```bash
git log --oneline | head -10
git reset --hard <commit-hash>
npm run build && pm2 reload ecosystem.config.cjs
```

## Checklist trước khi deploy

- [ ] Code đã merge vào `main` trên GitHub
- [ ] `.env` trên VPS đủ biến (xem `.env.example`)
- [ ] `ALLOWED_ORIGINS=https://en-vi.donghanhcungban.com`, `PORT=3001`
- [ ] `ecosystem.config.cjs` có `interpreter: '/usr/bin/node'` (Node 22 hệ thống)
- [ ] SSL Let's Encrypt còn hiệu lực (tự renew 90 ngày)

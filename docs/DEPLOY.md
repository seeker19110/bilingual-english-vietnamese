# Deploy — tóm tắt nhanh

> Hướng dẫn đầy đủ (Node, Nginx, HTTPS, `.env`...): **`docs/deploy-vps-ubuntu.md`**.
> File này chỉ tóm tắt cách deploy code mới + xử lý sự cố nhanh.

## Cách deploy

**Cách 1 — Tự động (đang dùng):** push/merge PR vào `main` → GitHub Actions (`.github/workflows/ci.yml`)
chạy lint/type/test/build; nếu **CI xanh**, `.github/workflows/deploy.yml` tự SSH vào VPS rồi gọi
`bash scripts/deploy.sh` (1 nguồn duy nhất, không còn lệnh trùng lặp riêng trong `deploy.yml`) —
pull code, `npm install`, **chạy migration Postgres tự host còn thiếu** (`npm run migrate:pg`),
build, `scripts/pm2-reload.sh` (PM2 chạy **fork mode** — có vài giây downtime khi reload, xem
ghi chú trong `ecosystem.config.cjs`), rồi health-check `/api/health`. Cần secrets `VPS_HOST`,
`VPS_USER`, `VPS_SSH_KEY` trong GitHub → Settings → Secrets and variables → Actions.

**Cách 2 — Thủ công trên VPS:**

```bash
ssh root@103.81.87.174
cd /var/www/english-tutor
bash scripts/deploy.sh
```

`scripts/deploy.sh` tự làm hết: pull code mới nhất từ `origin/main` → dọn `dist`/`public/data`
cũ → cài dependencies → **chạy migration Postgres tự host còn thiếu** (`npm run migrate:pg`,
dừng deploy nếu lỗi) → build → reload PM2. Cần `DATABASE_URL` trong `.env` trên VPS để bước
migration chạy được — xem `postgres/migrations/README.md`.

## Xử lý sự cố nhanh

**502 Bad Gateway** — Express chưa chạy hoặc lỗi:

```bash
pm2 logs english-tutor --lines 50
pm2 status
curl http://localhost:3001/api/health
```

Thiếu package sau khi pull code mới → `npm ci` rồi `npm run build` lại.

**Port 3001 đang bị chiếm:**

```bash
lsof -i :3001
kill -9 <PID>
```

**PM2 không chịu restart:**

```bash
pm2 delete english-tutor
pm2 start ecosystem.config.cjs
```

**Xóa sạch cài lại (khi nghi cache/node_modules hỏng):**

```bash
cd /var/www/english-tutor
rm -rf dist node_modules
npm ci && npm run build
pm2 restart english-tutor
```

## Checklist trước khi coi là "đã deploy xong"

- [ ] `.env` trên VPS có đủ biến (xem `docs/deploy-vps-ubuntu.md` Bước 4)
- [ ] `ecosystem.config.cjs` → `interpreter` khớp `which node` trên VPS (Node ≥ 22)
- [ ] Nginx đã trỏ `/api/` về port 3001 (`nginx/en-vi.conf`)
- [ ] SSL Let's Encrypt còn hạn (`sudo certbot renew --dry-run`)
- [ ] `curl https://en-vi.donghanhcungban.com/api/health` trả `{"status":"ok",...}`

## File liên quan

- `scripts/deploy.sh` — script deploy (thủ công VÀ tự động qua `deploy.yml` đều gọi file này —
  1 nguồn duy nhất, có migration + dọn build cũ + health check)
- `.github/workflows/deploy.yml` — trigger deploy tự động sau khi CI pass, gọi `scripts/deploy.sh`
- `scripts/pm2-reload.sh` — logic reload PM2 + health check dùng chung
- `ecosystem.config.cjs` — cấu hình PM2
- `docs/deploy-vps-ubuntu.md` — hướng dẫn đầy đủ từ đầu (setup VPS lần đầu)

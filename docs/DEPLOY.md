# Deploy — tóm tắt nhanh

> Hướng dẫn đầy đủ (Node, Nginx, HTTPS, `.env`...): **`docs/deploy-vps-ubuntu.md`**.
> File này chỉ tóm tắt cách deploy code mới + xử lý sự cố nhanh.

## Cách deploy

**Cách 1 — Tự động (đang dùng):** push/merge PR vào `main` → GitHub Actions (`.github/workflows/ci.yml`)
chạy lint/type/test/build; nếu **CI xanh**, `.github/workflows/deploy.yml` tự SSH vào VPS, pull code,
`npm install`, build, `pm2 reload` (không downtime), rồi health-check `/api/health`.

> ⚠️ Deploy tự động qua GitHub Actions **chưa chạy `npm run migrate`** — nếu PR có thêm migration
> Supabase mới (`supabase/migrations/*.sql`), phải tự SSH vào VPS chạy `npm run migrate` một lần
> (hoặc dùng Cách 2 bên dưới, script này CÓ chạy migrate). Cần secrets `VPS_HOST`, `VPS_USER`,
> `VPS_SSH_KEY` trong GitHub → Settings → Secrets and variables → Actions.

**Cách 2 — Thủ công trên VPS** (đầy đủ nhất, có chạy migration tự động):

```bash
ssh root@160.30.172.203
cd /var/www/english-tutor
bash deploy.sh
```

`deploy.sh` (ở gốc repo) tự làm: pull code mới nhất từ `origin/main` → `npm ci` → chạy migration
Supabase còn thiếu (`npm run migrate`, dừng deploy nếu lỗi) → build → `pm2 restart --update-env`.

> Repo còn `scripts/deploy.sh` — bản cũ hơn, KHÔNG có bước migration, đang không được tài liệu nào
> gọi tới. Nên dùng `deploy.sh` ở gốc repo (khớp với `docs/deploy-vps-ubuntu.md`).

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
pm2 start ecosystem.config.cjs --name english-tutor
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

- `deploy.sh` — script deploy thủ công/đầy đủ (có migration)
- `.github/workflows/deploy.yml` — deploy tự động sau khi CI pass
- `ecosystem.config.cjs` — cấu hình PM2
- `docs/deploy-vps-ubuntu.md` — hướng dẫn đầy đủ từ đầu (setup VPS lần đầu)

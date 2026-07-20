# Deploy — tóm tắt

> Hướng dẫn ĐẦY ĐỦ (setup VPS lần đầu, cấu hình Nginx/SSL, biến môi trường chi tiết):
> **`docs/deploy-vps-ubuntu.md`**. File này chỉ là bản tóm tắt nhanh — không lặp lại
> nội dung đầy đủ ở đó.

## Deploy lần 1 (setup toàn bộ VPS)

Làm theo **`docs/deploy-vps-ubuntu.md`** (đủ bước: firewall → Node 22 → Nginx/PM2 →
clone code + `.env` → `ecosystem.config.cjs` → start PM2 → Nginx reverse proxy + SSL
→ pre-cache audio tuỳ chọn).

## Deploy lần 2+ (cập nhật code)

Chạy **trên VPS** (script tự `git reset --hard origin/main`, cài lại, build, restart PM2):

```bash
ssh root@160.30.172.203
cd /var/www/english-tutor
bash scripts/deploy.sh
# hoặc nếu VPS đã có symlink sẵn: ~/deploy-english-tutor.sh
```

Có bật GitHub Actions auto-deploy (`.github/workflows/deploy.yml`, chạy sau khi CI
xanh trên `main`) thì không cần làm gì thêm — xem `docs/DEPLOY.md` để setup SSH secret.

## Migration DB

`scripts/deploy.sh` (dùng chung cho cả thủ công VÀ auto-deploy `deploy.yml`, không còn bản
trùng lặp riêng) **tự chạy** `npm run migrate:pg` (áp mọi file mới trong `postgres/migrations/`
còn thiếu) — cần `DATABASE_URL` trong `.env` trên VPS, xem `postgres/migrations/README.md`.

## Biến môi trường bắt buộc (tóm tắt)

Xem đầy đủ ở `.env.example`. Nhóm chính: `DATABASE_URL` (PostgreSQL tự host),
`GOOGLE_CLIENT_ID`/`VITE_GOOGLE_CLIENT_ID` (Google OAuth), ít nhất 1 trong
`GEMINI_API_KEY`/`GROQ_API_KEY`/`ANTHROPIC_API_KEY` (AI), `GOOGLE_TTS_API_KEY` +
`TTS_ENCRYPTION_MASTER_KEY` (TTS), `ALLOWED_ORIGINS`, `STORAGE_DRIVER=local` +
`UPLOADS_DIR`, `PORT` (3001 trên VPS hiện tại — 3000 đã bị app khác chiếm).

## Troubleshooting nhanh

| Vấn đề          | Lệnh kiểm tra                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| App không start | `pm2 logs english-tutor --lines 50`                                                                      |
| Nginx 502       | `pm2 status` + `curl http://localhost:3001/api/health`                                                   |
| Đăng nhập lỗi   | Kiểm tra `.env` có đủ `DATABASE_URL`/`GOOGLE_CLIENT_ID`; reload `pm2 restart english-tutor --update-env` |
| SSL hết hạn     | `sudo certbot renew --dry-run`                                                                           |

Chi tiết đầy đủ + troubleshooting mở rộng: `docs/deploy-vps-ubuntu.md`, `docs/DEPLOY.md`.

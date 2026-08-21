# Runbook rollback — kế hoạch scale 50k concurrent

> Gom các điểm rollback đã rải rác trong comment code + docs từng PR (GĐ1-2 kế hoạch
> `docs/research/ke-hoach-scale-30k-concurrent.md`) vào 1 chỗ, để không phải lục lại PR cũ khi
> sự cố xảy ra thật. Cập nhật file này mỗi khi thêm bước rollback mới ở giai đoạn sau.

## Nguyên tắc chung

- **Luôn rollback bằng cách đổi CẤU HÌNH trước, không xoá dữ liệu.** Dữ liệu (Postgres/Redis) chỉ
  xoá sau khi xác nhận máy/cấu hình mới ổn định qua vài ngày traffic thật.
- **Deploy tự động chạy khi push/merge lên `main`** (`.github/workflows/deploy.yml`) — rollback
  code nhanh nhất là `git revert` PR gây lỗi rồi để deploy tự chạy lại, KHÔNG sửa tay trực tiếp
  trên VPS (sẽ bị ghi đè ở lần deploy tiếp theo và mất dấu vết).

## GĐ1 — Cluster mode PM2

**Triệu chứng lỗi:** `pm2 status` báo `errored`/khởi động lại liên tục sau deploy; `/api/health`
không phản hồi; `pm2 logs dhcb` không in được log gì (crash im lặng — dấu hiệu đặc
trưng của lỗi tương thích Node `cluster` + loader, xem lịch sử PR #283/#284/#285).

**Rollback:**

1. Sửa `ecosystem.config.cjs`: `instances: 1, exec_mode: 'fork'` (giữ nguyên
   `script: './dist-server/server.js'` — KHÔNG cần quay lại `tsx`, vì bước build JS không phải
   nguyên nhân, chỉ cluster mode mới là nghi phạm).
2. Commit + push lên `main` (qua PR bình thường, không skip cổng) — deploy tự chạy lại.
3. Xác nhận `pm2 status` báo `online`, `/api/health` OK.
4. `scripts/pm2-reload.sh` tự phát hiện exec_mode đổi (cluster→fork) và `pm2 delete`+`pm2 start`
   đúng như chiều ngược lại — không cần thao tác tay gì thêm trên VPS.

## GĐ2 — Tách Postgres/Redis ra VPS riêng

**Triệu chứng lỗi:** app không kết nối được DB sau khi đổi `DATABASE_URL`/`REDIS_URL` (lỗi 500
hàng loạt); độ trễ tăng bất thường (network giữa 2 VPS chậm/không ổn định); firewall chặn nhầm.

**Rollback:**

1. Trên VPS app, sửa `.env`: trả `DATABASE_URL`/`REDIS_URL` về giá trị CŨ (Postgres/Redis local
   trên VPS app — vẫn còn nguyên, KHÔNG xoá cho tới khi xác nhận máy mới ổn định).
2. `bash scripts/pm2-reload.sh` (không cần deploy lại toàn bộ — chỉ đổi `.env` + reload).
3. Xác nhận `/api/health` + thử 1 luồng thật (đăng nhập, tra từ điển).
4. Điều tra máy mới riêng (không vội xoá) — xem `docs/deploy-vps-ubuntu.md` mục "GĐ2" để dò lại
   từng bước (firewall, PgBouncer config, mật khẩu).

## GĐ3 — Cầu dao khẩn cấp AI (không phải rollback, nhưng cùng nhóm "phanh khẩn cấp")

**Khi nào dùng:** phát hiện chi phí gọi AI tăng bất thường (bug vòng lặp, spam) — KHÔNG phải lỗi
deploy, không cần rollback code.

**Cách dùng:** Admin bật "Cầu dao khẩn cấp" trong trang `/admin-settings` (checkbox nền đỏ) —
có hiệu lực gần như ngay (cache 30s), không cần deploy lại. Nhớ tắt lại sau khi xử lý xong.

## Rollback chung (mọi PR): trả về commit trước

Nếu 1 PR bất kỳ gây lỗi mà chưa rõ nguyên nhân cụ thể (chưa nằm trong danh sách trên):

```bash
git revert <sha-commit-gây-lỗi>   # tạo commit mới đảo ngược, KHÔNG dùng git reset (mất lịch sử)
git push origin main              # deploy tự chạy lại với code cũ
```

Không dùng `git reset --hard` + `push --force` lên `main` — phá lịch sử, vi phạm CLAUDE.md
("không push thẳng nhánh chính", và force-push mất dấu vết để điều tra sau này).

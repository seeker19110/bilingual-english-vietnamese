# Đặc tả GĐ 2 — Tầng dữ liệu chịu tải (Postgres/Redis tách máy + PgBouncer)

> Đặc tả thi hành cho `docs/research/ke-hoach-scale-30k-concurrent.md` §3 GĐ2, sau khi GĐ1 đã
> merge (PR #321/#322/#323) và quyết định 5.1/5.2 đã chốt: ngân sách $2.000/tháng, **tự host**.

## Giới hạn quan trọng cần biết trước (đọc kỹ)

Phiên AI này chạy trong sandbox, **không có quyền truy cập VPS production thật** (không SSH,
không tài khoản nhà cung cấp VPS/hosting để mua thêm máy). Deploy tự động (`.github/workflows/
deploy.yml`) chỉ chạy đúng các lệnh đã viết sẵn trong `scripts/deploy.sh` qua SSH bằng secret đã
cấu hình — không phải quyền truy cập tương tác.

Vì vậy GĐ2 chia làm 2 phần:

- **Phần A (AI tự làm được ngay, trong sandbox):** thay đổi code/config — pool Postgres cấu hình
  qua env thay vì hard-code, file cấu hình PgBouncer mẫu, cập nhật script/docs deploy.
- **Phần B (CẦN NGƯỜI DÙNG làm tay):** mua thêm VPS mới, cài PostgreSQL/PgBouncer/Redis lên đó,
  cấu hình DNS/firewall, chuyển `DATABASE_URL`/`REDIS_URL` sang trỏ máy mới. AI **không thể** tự
  hoàn thành phần này — sẽ viết thành **runbook chi tiết từng lệnh** để người dùng copy-paste.

## Phần A — Việc AI làm ngay (Opus tự làm, ít rủi ro, dễ kiểm chứng)

### A1. `api/_lib/pgPool.ts` — pool size cấu hình được qua env

Hiện tại `max: 10` hard-code. Đổi sang đọc từ `PG_POOL_MAX` (mặc định giữ 10 nếu không set —
không đổi hành vi hiện tại), để khi có PgBouncer/máy Postgres riêng, chỉnh số này qua `.env`
không cần sửa code + build lại.

### A2. File cấu hình PgBouncer mẫu

Thêm `postgres/pgbouncer.ini.example` (transaction pooling mode, `max_client_conn` cỡ vài nghìn,
`default_pool_size` khớp `PG_POOL_MAX` × số tiến trình app) + comment tiếng Việt giải thích từng
tham số. Đây là FILE MẪU — người dùng copy sang máy Postgres thật, điền `DATABASE_URL` thật.

### A3. Cập nhật `docs/deploy-vps-ubuntu.md` — thêm mục "GĐ2: tách Postgres/Redis ra VPS riêng"

Runbook từng bước (Phần B) để người dùng tự chạy tay trên VPS mới:

1. Tạo VPS mới (khuyến nghị: Hetzner CX-series hoặc Vultr/DigitalOcean cỡ trung, 4 vCPU/8GB —
   trong ngân sách đã đánh giá ở mục 4.1 kế hoạch scale).
2. Cài PostgreSQL 16+ + PgBouncer (`apt install postgresql postgresql-contrib pgbouncer`).
3. Copy `postgres/schema.sql` + chạy `npm run migrate:pg` trỏ vào máy mới.
4. Cấu hình PgBouncer bằng file mẫu A2.
5. Mở firewall CHỈ cho IP VPS app (không public 5432/6432 ra Internet).
6. Đổi `DATABASE_URL` trên VPS app trỏ qua PgBouncer (`postgresql://...@<ip-db-vps>:6432/...`).
7. Redis: cài `redis-server` trên cùng VPS DB hoặc VPS riêng nếu tải cao; đổi `REDIS_URL`.
8. Restart app (`bash scripts/pm2-reload.sh`), xác nhận `/api/health` OK + thử 1 luồng
   chat/dictionary thật.
9. **Rollback nếu lỗi:** giữ nguyên `DATABASE_URL`/`REDIS_URL` cũ (Postgres/Redis local trên VPS
   app hiện tại) cho tới khi xác nhận máy mới ổn định — KHÔNG xoá dữ liệu cũ ngay.

### A4. Rà index (đã rà trong phiên này — không cần đổi)

Đã đọc `postgres/schema.sql`: các bảng truy vấn nóng nêu trong kế hoạch (`daily_usage`,
`profiles`, `learning_progress`) đã có primary key/index hợp lý (`daily_usage` PK
`(user_id, day)` đúng pattern truy vấn của `consume_usage`/`refund_usage`; `profiles`/
`learning_progress` PK là `user_id`). **Không cần thêm index mới ở GĐ2.**

## Phần B — Người dùng cần tự làm (không thể giao AI)

- Quyết định + mua VPS mới (billing, tài khoản nhà cung cấp).
- Chạy các lệnh SSH trong runbook A3 trên máy mới.
- Xác nhận firewall/security group đúng (không lộ Postgres/Redis ra Internet).

## Tiêu chí chấp nhận Phần A

- `npm run typecheck`/`lint`/`test` xanh, không đổi hành vi khi `PG_POOL_MAX` không set.
- `postgres/pgbouncer.ini.example` không phải file thật thi hành được ngay (chỉ mẫu, không đưa
  secret), có comment tiếng Việt.
- `docs/deploy-vps-ubuntu.md` có runbook đầy đủ, đủ chi tiết để người mới làm theo được (đúng
  triết lý CLAUDE.md — người dùng mới lập trình).

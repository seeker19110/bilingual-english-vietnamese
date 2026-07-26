# Kế hoạch khôi phục khi server sập (Disaster Recovery)

> Kịch bản THẬT: VPS app hỏng, VPS Postgres/Redis hỏng, hoặc cả hai — từ lúc phát hiện tới lúc
> dịch vụ chạy lại bình thường. Đọc TRƯỚC khi sự cố xảy ra, không đọc lần đầu lúc đang sập.
>
> Công cụ liên quan: `scripts/backup-pg-to-r2.ts` (đẩy backup), `scripts/restore-pg-from-r2.ts`
> (khôi phục thật từ R2), `scripts/verify-pg-backup.sh` (kiểm thử backup còn dùng được không),
> `docs/rollback-runbook.md` (rollback do LỖI DEPLOY — khác sự cố phần cứng/hạ tầng ở đây).

## 0. Trước khi cần dùng tài liệu này — điều kiện tiên quyết

- [ ] Cron `pg_dump` đang chạy (`docs/setup-postgresql-vps.md` mục 7).
- [ ] Cron `npm run backup:r2` đang chạy NGAY SAU đó (mục 7.2) — **nếu bước này chưa làm, các
      kịch bản dưới đây KHÔNG khôi phục được** (backup chỉ có ở local, mất cùng VPS).
- [ ] Đã từng chạy thử `npm run restore:r2 -- --list` ít nhất 1 lần để biết chắc thấy được backup
      trên R2 (không phải lúc sập mới thử lần đầu).
- [ ] Ghi lại sẵn (KHÔNG chỉ trong đầu): IP các VPS hiện tại, thông tin đăng nhập nhà cung cấp
      VPS, domain + DNS provider, tài khoản Cloudflare (DNS + R2).

## 1. Xác định NHANH: sập cái gì?

| Triệu chứng                                                               | Khả năng                                                                             | Chuyển tới                        |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| Domain không load được gì, `ping <ip-vps-app>` không phản hồi             | VPS app chết hẳn (phần cứng/nhà cung cấp)                                            | Kịch bản A                        |
| Web load được UI tĩnh nhưng API lỗi 500 hàng loạt, `ssh` vào được VPS app | VPS app sống, DB/Redis chết                                                          | Kịch bản B                        |
| `ssh` vào VPS app KHÔNG được, nhưng nhà cung cấp báo máy vẫn "running"    | Có thể do quá tải (đầy RAM/disk) chứ không phải chết hẳn — thử đợi 2-3 phút, thử lại | Kịch bản C nếu vẫn không vào được |
| Cả `ssh` app lẫn `ssh` DB đều không được                                  | Mất cả 2 VPS cùng lúc (hiếm, nhưng có thể do cùng nhà cung cấp bị sự cố khu vực)     | Kịch bản D                        |

**Luôn kiểm tra Sentry/dashboard nhà cung cấp trước khi kết luận "sập"** — đôi khi chỉ là domain/
DNS trỏ sai, không phải máy chết.

## Kịch bản A — VPS app chết hẳn (DB/Redis vẫn sống, nếu tách máy theo GĐ2)

**RTO ước tính: 15-30 phút** (không cần khôi phục dữ liệu, chỉ dựng lại app).

1. Tạo VPS mới (cùng nhà cung cấp hoặc khác, cùng cấu hình cũ).
2. Cài Node.js 22+, PM2 — theo `docs/deploy-vps-ubuntu.md` bước 1-3 (KHÔNG cần lại bước cài
   Postgres nếu DB nằm ở máy riêng, xem Kịch bản B nếu DB cũng chết).
3. `git clone` repo, tạo `.env` — copy TOÀN BỘ giá trị từ bản sao lưu `.env` (⚠️ xem mục 4 —
   `.env` không hề được backup tự động, PHẢI có bản lưu riêng từ trước).
4. `npm ci && npm run build` (gồm `build:server`).
5. `pm2 start ecosystem.config.cjs`, xác nhận `/api/health` OK.
6. **Trỏ DNS** (Cloudflare) sang IP VPS app mới — đây là bước hay quên, domain vẫn trỏ IP cũ
   cho tới khi đổi.
7. Xác nhận luồng thật: đăng nhập, tra từ điển, gửi 1 tin nhắn Chat.

## Kịch bản B — VPS Postgres/Redis chết hẳn (app còn sống hoặc cũng dựng lại theo Kịch bản A)

**RTO ước tính: 30-60 phút** (phụ thuộc kích thước database cần khôi phục).
**RPO (mất dữ liệu tối đa): tới 24h** (khoảng cách giữa 2 lần `pg_dump` — nếu cần RPO ngắn hơn,
tăng tần suất cron `pg_dump`, đánh đổi tải CPU/disk DB).

1. Tạo VPS Postgres/Redis mới (`docs/huong-dan-tu-host-scale-50k.md` mục 2-3, 6).
2. Cài PostgreSQL + tạo user/database rỗng (mục 3) — **KHÔNG cần chạy `npm run migrate:pg`**,
   backup sẽ tự tạo lại toàn bộ schema.
3. Khôi phục dữ liệu từ R2:
   ```bash
   RESTORE_PSQL_URL=postgresql://postgres:MẬT-KHẨU-SUPERUSER@localhost:5432/postgres \
     npm run restore:r2 -- --list                              # xem có backup nào, chọn bản cần
   RESTORE_PSQL_URL=postgresql://postgres:MẬT-KHẨU-SUPERUSER@localhost:5432/postgres \
     npm run restore:r2 -- --restore-into english_tutor --yes  # khôi phục thật
   ```
4. Xác nhận dữ liệu: `psql <url> -c "select count(*) from public.users;"` — số dòng phải gần
   khớp traffic thật gần đây (không phải 0, không phải lỗi).
5. Cài lại Redis (mục 6 hướng dẫn — Redis KHÔNG cần khôi phục dữ liệu, chỉ là cache/rate-limit,
   tự xây dựng lại khi có traffic).
6. Cấu hình PgBouncer + firewall (mục 5, 7).
7. Trên VPS app: đổi `.env` trỏ `DATABASE_URL`/`REDIS_URL` sang máy mới, `bash
scripts/pm2-reload.sh`.
8. Chạy `bash scripts/verify-pg-backup.sh` để xác nhận backup HIỆN TẠI (sau khi restore) cũng
   restore được — đảm bảo vòng lặp backup/restore vẫn nguyên vẹn sau sự cố.
9. **Chấp nhận mất dữ liệu từ RPO** (tối đa 24h giao dịch gần nhất) — thông báo nếu cần, không
   giấu người dùng bị ảnh hưởng (vd điểm học/streak bị lùi lại).

## Kịch bản C — VPS còn "running" nhưng không SSH được (quá tải)

Không phải mất dữ liệu — thường do hết RAM/disk, không phải sự cố phần cứng.

1. Dùng console web của nhà cung cấp VPS (không qua SSH) để xem trạng thái/log.
2. Nếu hết disk: log PM2 hoặc file backup local tích tụ quá lâu — dọn bớt
   (`pm2 flush`, xoá backup cũ hơn đã có trên R2).
3. Nếu hết RAM: `pm2 restart` để giải phóng, điều tra nguyên nhân sau (rò rỉ bộ nhớ, traffic
   đột biến — xem Sentry nếu đã bật).
4. Nếu console cũng không phản hồi → coi như Kịch bản A/B, dựng máy mới.

## Kịch bản D — Mất CẢ app lẫn DB cùng lúc (dựng lại từ đầu hoàn toàn)

**RTO ước tính: 1-2 giờ.** Làm Kịch bản B trước (dựng DB, khôi phục dữ liệu), rồi Kịch bản A
(dựng app, trỏ vào DB mới), theo đúng thứ tự — app cần DB sẵn sàng trước khi khởi động thật sự
hữu ích (dù `pm2 start` vẫn chạy được, request sẽ lỗi 500 tới khi DB sẵn sàng).

## 2. ⚠️ Điều quan trọng nhất KHÔNG được quên: `.env` không hề được backup tự động

Toàn bộ kế hoạch này giả định bạn có bản sao `.env` (API key AI/TTS/STT, mật khẩu DB, R2
credentials, JWT secret...) **lưu ở nơi KHÁC** ngoài VPS — vd trình quản lý mật khẩu, hoặc
GitHub Secrets (đã có sẵn cho CI/CD, nhưng không phải toàn bộ `.env`). **Mất `.env` cùng lúc mất
VPS = phải xin cấp lại từng API key một** (Anthropic, Groq, Gemini, Google TTS, R2, Google OAuth,
ElevenLabs...) — chậm hơn nhiều so với khôi phục dữ liệu.

**Hành động cần làm ngay (nếu chưa làm):** lưu 1 bản `.env` production vào trình quản lý mật
khẩu, cập nhật mỗi khi đổi biến môi trường trên VPS.

## 3. Diễn tập định kỳ (khuyến nghị)

Kế hoạch chưa từng chạy thật không đáng tin. Khuyến nghị 1 lần/quý:

1. Chạy `npm run restore:r2 -- --restore-into english_tutor_drill --yes` vào 1 database TẠM
   (không phải database thật) trên VPS DB hiện tại hoặc VM local.
2. Đo thời gian thật từ lúc bắt đầu tới lúc `select count(*)` trả kết quả đúng — so với RTO ước
   tính ở trên, điều chỉnh lại tài liệu nếu lệch nhiều.
3. Xoá database tạm sau khi xong (`drop database english_tutor_drill;`).

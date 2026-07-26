# postgres/migrations

Thư mục lưu thay đổi schema PostgreSQL tự host theo thời gian (incremental), giống
cơ chế `supabase/migrations/` cũ nhưng cho DB tự host trên VPS.

- DB mới (lần đầu): `npm run migrate:pg` tự áp `../schema.sql` (đầy đủ, idempotent)
  RỒI mới áp các file lẻ trong thư mục này.
- Đặt tên file `NNNN_mo-ta-ngan.sql` (số thứ tự 4 chữ số + mô tả), viết idempotent
  (`create or replace`, `if not exists`).
- **Tự động áp khi deploy** — `scripts/deploy.sh` gọi `npm run migrate:pg` ở MỌI lượt deploy,
  và deploy tự chạy khi push/merge lên `main` (`.github/workflows/deploy.yml`, trigger
  `push: branches: [main]`). Khác cơ chế Supabase cũ (phải tự tay chạy migration production) —
  ở đây **không cần thao tác tay**, chỉ cần merge xong PR đổi schema là migration đã áp.
  Muốn xác nhận thủ công: SSH VPS, xem log deploy gần nhất hoặc tự chạy lại `npm run migrate:pg`
  (idempotent, chạy lại không sao).

## Danh sách migration đã có

| File                              | Nội dung                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_app_settings.sql`           | Bảng `app_settings` (hạn mức/khuyến mãi hiện hành, đọc công khai qua `/api/app-settings`).                                                                        |
| `0002_age_group.sql`              | Cột `profiles.age_group` (nhóm tuổi tự chọn, giao diện/nội dung theo độ tuổi).                                                                                    |
| `0003_pronunciation_lang_key.sql` | Đổi khoá duy nhất bảng `pronunciations` từ `(word, voice)` thành `(word, voice, lang)` — tránh 1 chữ trùng giữa tiếng Anh/Việt đè cache lẫn nhau.                 |
| `0004_plan_expires_at.sql`        | Cột `profiles.plan_expires_at` — hạn dùng gói Pro/VIP tự hết hạn, cấp gói thủ công qua admin.                                                                     |
| `0005_ai_circuit_breaker.sql`     | Cột `app_settings.ai_circuit_breaker` — cầu dao khẩn cấp chặn toàn bộ lượt gọi AI (GĐ3 kế hoạch scale 50k, xem `docs/research/ke-hoach-scale-30k-concurrent.md`). |
| `0006_analytics_events.sql`       | Bảng `analytics_events` — analytics tự viết (không dùng script bên thứ 3) đo hiệu quả kênh marketing, ghi qua `/api/analytics`, auth tuỳ chọn.                    |
| `0007_referral.sql`               | Cột `profiles.referral_code` + bảng `referrals` — mời bạn, thưởng ngày gói Pro cho cả 2 bên khi người được mời học thật (xem `api/_lib/referral.ts`).             |
| `0008_referral_device.sql`        | Cột `referrals.device_hash` — dấu vân tay thiết bị (best-effort) chỉ dùng để TỪ CHỐI THƯỞNG khi cày nhiều tài khoản trên cùng máy, không khoá tài khoản.          |
| `0010_email_daily_usage.sql`      | Bảng `email_daily_usage` — đếm thư đã gửi mỗi ngày theo kênh, để tự chuyển sang kênh dự phòng (Amazon SES) khi kênh chính chạm trần hạn mức.                      |
| `0009_email_verification.sql`     | Bảng `email_verifications` — mã 6 chữ số xác thực email, chống email giả cày thưởng mời bạn (cột `users.email_verified` đã có sẵn từ schema gốc).                 |
| `0011_password_reset.sql`         | Bảng `password_resets` — quên mật khẩu, gửi link reset qua email (token dài, khác mã 6 chữ số của xác thực email vì đây là đường chiếm quyền tài khoản).          |

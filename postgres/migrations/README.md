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

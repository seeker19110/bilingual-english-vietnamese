# 0277 — 2026-09-06 — Phễu admin: 3 bước suy từ `users` + `daily_usage`, không chờ client bắn

**PR:** (điền khi tạo) · **Loại:** `fix(admin)` · **Nhánh:** `claude/danh-gia-sau-du-an-tpvud1`

## Vấn đề (đo được, không suy đoán)

Tab admin "Analytics" có phễu 6 bước. Whitelist server khai 6 sự kiện nhưng `grep` toàn client
chỉ thấy 3 lời gọi: `landing_view`, `cta_click`, `share_click`. Ba bước quan trọng nhất —
**Đăng ký thành công · Hoàn thành phiên học đầu · Quay lại ngày thứ 2** — chưa từng được bắn ở
đâu, nên phễu luôn hiện 0 ở đúng chỗ cần nhìn. Đây là lỗ hổng "đường đo người dùng" mà đánh giá
sâu (`0276`) chỉ ra.

## Quyết định: SUY RA từ bảng có thẩm quyền thay vì bắn sự kiện từ client

Cách "bắn nốt 3 sự kiện từ client" (ý đầu tiên) có ba điểm yếu: quên bắn/bắn hai lần, bị chặn
quảng cáo, và không có số quá khứ. Trong khi dữ liệu thật đã nằm sẵn: `users.created_at` (đăng
ký) và `daily_usage` (mỗi ngày có lượt dùng nào). Nên `analytics-summary.ts` thêm MỘT câu SQL
(`FUNNEL_SQL`) tính ba bước trên cùng đoàn hệ (user tạo trong cửa sổ N ngày, ngày theo giờ VN
khớp `daily_usage.day`):

- `signup` — ngày tạo tài khoản;
- `first_session_done` — ngày ĐẦU TIÊN có tổng lượt dùng > 0 (7 cột đếm, gồm `code_feedback_count`);
- `day2_return` — ngày đầu tiên có lượt dùng **sau** ngày đăng ký.

Kèm theo: bỏ 3 tên đó khỏi whitelist `POST /api/analytics` (server + kiểu client) để không ai
bắn giả được; tab admin ghi rõ ba bước này tính từ bảng, không phải sự kiện client. Không
migration, không đổi URL.

## Bằng chứng

- **Chạy THẬT trên Postgres 16 tạm** (schema + 77 migration, 5 user + 5 dòng `daily_usage` thử):
  câu SQL trích nguyên văn từ file nguồn trả đúng — 4 `signup` (loại user tạo 40 ngày trước),
  2 `first_session_done` (loại user có dòng usage toàn 0 và user chưa học), 1 `day2_return`
  (user học ngày T-5, quay lại T-3). Bảng kết quả trong mô tả PR.
- Unit test: `analytics-summary.test.ts` +2 ca (gộp hai truy vấn, sắp theo ngày; SQL phễu đúng
  bảng/đúng múi giờ/đúng điều kiện `a.day > c.signup_day`/không sót cột đếm);
  `analytics.test.ts` +1 ca (3 tên cũ gửi từ client → 400, không chạm DB).
- Cổng: typecheck ✅ · lint ✅ · format ✅ · `npm test` ✅ (xem mô tả PR).

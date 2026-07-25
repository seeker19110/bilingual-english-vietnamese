# Đặc tả triển khai — Admin Dashboard + chặn tên tài khoản giả danh (M0)

> Ngày soạn: 2026-07-25 · Làm TRƯỚC M1/M2 vì các hạng mục sau (referral, thanh toán, analytics)
> đều cần nơi admin quản lý tập trung.

## Bối cảnh thật (đọc từ code trước khi đặc tả)

- Đã có `src/pages/AdminSettings.tsx` (route `/admin-settings`) — chỉ 1 khối: hạn mức
  chat/writing/speaking/stt/pronounce theo free/pro/vip + mốc khuyến mãi (`promoUntil`) + cầu
  dao khẩn cấp (`aiCircuitBreaker`). Server luôn tự kiểm `isAdminEmail()` (`api/_lib/adminAuth.ts`,
  đọc `ADMIN_EMAILS` trong `.env`) — không tin client.
- Đã có `api/admin-grant-plan.ts` (cấp Pro/VIP tay theo email) — **hiện KHÔNG có UI**, chỉ gọi
  bằng `curl`/Postman thủ công. Cần đưa vào dashboard.
- **Chưa có** trang tổng nào liệt kê các mục quản trị — mỗi thứ một route rời rạc.
- Đăng ký (`api/auth.ts`, `RegisterSchema`) nhận `name` tự do (1-80 ký tự), **không có bước lọc
  tên giả danh admin/CSKH**.

## Phần A — Trang Dashboard admin (khung tổng)

**Vì sao:** M1.7 (analytics), M1.4 (referral), M2 (thanh toán) đều sẽ cần thêm mục quản trị.
Làm khung dashboard 1 lần, các hạng mục sau chỉ cần thêm tab, đỡ phải làm lại điều hướng.

**Đặc tả:**

- Route mới `/admin` (`src/pages/AdminDashboard.tsx`), thay vai trò "trang vào cổng" — có menu
  tab bên trái (mobile: tab ngang cuộn) trỏ tới các trang con:
  - **Hạn mức & khuyến mãi** — chính là `AdminSettings.tsx` hiện có, chuyển thành 1 tab thay vì
    route riêng (giữ route `/admin-settings` redirect sang `/admin?tab=limits` để không vỡ link
    cũ nếu có bookmark).
  - **Cấp gói tay** — UI mới bọc quanh `api/admin-grant-plan.ts` đã có sẵn (form nhập email +
    chọn plan/days, gọi API có sẵn — không viết API mới).
  - **Tên bị cấm đăng ký** — UI cho Phần B bên dưới.
  - Chỗ trống chờ gắn thêm: "Analytics" (M1.7), "Referral" (M1.4), "Thanh toán" (M2) — chỉ cần
    thêm tab khi các hạng mục đó code xong, không làm trước lúc chưa có API.
- Bảo vệ quyền: **client-side chỉ để ẩn/hiện UI cho mượt** (check `isAdminEmail` không có ở
  client — client không có `ADMIN_EMAILS`). Cách đúng: gọi 1 API bất kỳ trong tab (vd
  `/api/admin-settings` GET) lúc vào trang, nếu 403 thì hiện màn "Không có quyền" (Y HỆT cách
  `AdminSettings.tsx` hiện tại đang làm — đọc state `forbidden` trong file đó, tái dùng đúng
  pattern, không bịa cách mới).
- Điều hướng: thêm link "Quản trị" trong menu chỉ hiện với email nằm trong danh sách admin —
  nhưng vì client không biết `ADMIN_EMAILS`, cách đơn giản nhất: **luôn hiện link, để server tự
  chặn** (đã là hành vi hiện tại của `/admin-settings`) — không thêm logic ẩn/hiện phức t​ tạp ở
  client cho việc này.

**Tiêu chí chấp nhận:**

- Vào `/admin` bằng tài khoản không phải admin → thấy "Không có quyền" (403 xử lý đúng, không
  crash trắng trang).
- Vào bằng tài khoản admin → thấy đủ 3 tab, mỗi tab hoạt động đúng như trang gốc.
- `/admin-settings` cũ vẫn hoạt động (redirect hoặc giữ nguyên — không phá link cũ).
- axe/a11y AA giữ nguyên (nguyên tắc #5), 4 theme dùng được (nguyên tắc #8).
- Không có API mới bắt buộc cho phần này (chỉ gom UI + 1 API nhỏ ở Phần B).

**Người làm:** `standard-worker` (Sonnet) — chủ yếu là ghép UI đã có sẵn logic, đặc tả kín.

---

## Phần B — Chặn tên tài khoản dễ gây nhầm là admin/CSKH

**Vì sao:** người dùng thấy tên "Quản trị viên", "CSKH En-Vi", "Admin", "Ban quản trị"... trong
chat/bình luận (nếu sau này có tính năng cộng đồng) dễ tưởng đó là nhân viên thật → bị lừa hoặc
hoang mang. Chặn từ lúc đăng ký rẻ hơn nhiều so với xử lý hậu quả.

**Đặc tả:**

- Danh sách từ khoá cấm: file tĩnh `api/_lib/reservedNames.ts`, export
  `const RESERVED_NAME_PATTERNS: RegExp[]` — khớp không phân biệt hoa/thường, có dấu/không dấu
  (cần hàm bỏ dấu tiếng Việt trước khi so khớp — kiểm tra dự án đã có hàm bỏ dấu ở đâu chưa,
  vd trong `src/lib/` phần tìm kiếm từ điển, TÁI DÙNG nếu có thay vì viết lại).
  Danh sách khởi điểm (bạn bổ sung thêm nếu thấy thiếu):
  `admin`, `administrator`, `quan tri`, `quan tri vien`, `ban quan tri`, `moderator`, `mod`,
  `cskh`, `cham soc khach hang`, `support`, `ho tro`, `official`, `chinh thuc`, `system`,
  `he thong`, `staff`, `nhan vien`, `donghanhcungban` (trùng tên miền/thương hiệu app).
- Áp dụng ở **server**, đúng nguyên tắc #2 (không tin client): sửa `RegisterSchema` trong
  `api/auth.ts` — thêm `.refine()` kiểm `name` không khớp `RESERVED_NAME_PATTERNS`, lỗi rõ ràng:
  `'Tên này không thể sử dụng, vui lòng chọn tên khác'`.
- Áp dụng luôn cho chỗ đổi tên hồ sơ nếu có (kiểm tra `api/profile.ts` xem có cho sửa `name`
  không — nếu có, thêm cùng kiểm tra ở đó, KHÔNG chỉ chặn lúc đăng ký rồi bỏ lửng chỗ đổi tên).
- **Không** áp dụng nhầm vào các field khác không phải tên hiển thị công khai (vd không đụng
  `nickname` nếu field đó chỉ hiển thị riêng tư cho chính chủ — đọc rõ field nào công khai với
  người khác trước khi quyết định phạm vi áp dụng; hiện tại app **chưa có tính năng cộng đồng
  hiển thị tên chéo giữa các user**, nên phạm vi thực tế trước mắt là chặn lúc đăng ký + đổi tên
  hồ sơ, phòng xa cho các tính năng cộng đồng sau này — vd bảng xếp hạng `leaderboard.ts` đã có,
  cần xác nhận `leaderboard.ts` có hiển thị `name` công khai không, nếu có thì đây là lý do thật
  sự cấp thiết ngay bây giờ, không phải phòng xa).

**Tiêu chí chấp nhận:**

- Test unit: đăng ký với `name = "Admin"`, `"quản trị viên"`, `"CSKH"` (có/không dấu, hoa/thường)
  → bị từ chối, thông báo rõ ràng. Tên hợp lệ bình thường (`"Nguyễn Văn A"`) → qua được.
  Ca biên: tên chứa từ khoá như 1 phần của từ khác không nên bị chặn nhầm — kiểm tra rõ khớp
  theo TỪ/CỤM chứ không phải substring bất kỳ (vd tên "Ngô Admin Trần" hợp lý bị chặn, nhưng
  đừng chặn nhầm tên có chữ khớp ngẫu nhiên nếu danh sách chọn từ tiếng Việt thông dụng — rà kỹ
  danh sách để tránh false positive trước khi merge).
- Không đổi chữ ký hàm hiện có ngoài phạm vi cần thiết.

**Người làm:** `standard-worker` (Sonnet) — cần đọc `leaderboard.ts`/`profile.ts` để xác định
đúng phạm vi trước khi code (không đoán), nên không giao Haiku dù bản chất là lọc chuỗi.

---

## Bảng chia việc

| #    | Hạng mục                | Người làm | Phụ thuộc                                   |
| ---- | ----------------------- | --------- | ------------------------------------------- |
| M0.A | Khung Admin Dashboard   | Sonnet    | không                                       |
| M0.B | Chặn tên giả danh admin | Sonnet    | cần đọc `leaderboard.ts`/`profile.ts` trước |

Cả hai độc lập với nhau, làm song song được. Sau khi xong, M1.1 có thể bắt đầu ngay (không phụ
thuộc M0).

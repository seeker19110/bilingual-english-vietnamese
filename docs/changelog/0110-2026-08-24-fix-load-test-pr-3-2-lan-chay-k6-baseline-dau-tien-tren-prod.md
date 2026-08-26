# fix(load-test): PR 3.2 — lần chạy k6 baseline ĐẦU TIÊN trên production, phát hiện script sai (2026-08-24)

**PR 3.2 của Đợt 3 (gom route, PR #652 đã merge) coi như đóng** — người dùng tự chạy
`k6 run scripts/load-test/k6-baseline.js` thật trên VPS (100 VU, 4 phút 30 giây, nhắm
`www.donghanhcungban.org`). Đây là **lần đo k6 THẬT ĐẦU TIÊN** của dự án — trước giờ mọi số liệu
scale (`ke-hoach-scale-30k-concurrent.md`, `lo-trinh-100k-200k-1trieu.md`) đều là ước lượng lý
thuyết, chưa từng đối chiếu số đo thật.

**Kết quả thô gây hiểu lầm ban đầu:** `http_req_failed` báo đỏ **50%** — nhìn thoáng qua tưởng
hệ thống sập nửa. Điều tra bằng `nginx access.log` cho breakdown mã trạng thái thật:
`3780×429 · 240×401`, **0 lỗi 500**.

**Chẩn đoán — cả hai đều là lỗi PHƯƠNG PHÁP TEST, không phải lỗi server:**

1. **k6 chạy từ 1 máy VPS → mọi VU chia sẻ CHUNG một IP thật** ở phía server.
   `checkRateLimit` (`packages/core-auth/security.ts`) giới hạn theo IP, nên 100 VU bắn liên tục
   từ 1 IP chạm `429` gần như ngay lập tức — **đúng thiết kế chống lạm dụng**, không phải bằng
   chứng server quá tải. `http_req_failed` mặc định của k6 coi mọi status ngoài 2xx/3xx là "lỗi"
   kể cả `429` hợp lệ theo thiết kế, nên số 50% chính nó đã gây hiểu lầm.
2. **🔴 Kịch bản k6 tự nó SAI:** comment cũ ghi route `/api/dictionary` _"không cần đăng
   nhập"_ — SAI, `dictionary.ts` gọi `validateAuth()` và trả `401` khi thiếu token (đúng thiết
   kế, chống cào dữ liệu — xem comment ngay trong file đó). K6 gọi không kèm token nên phần lớn
   request hoặc bị `401` (trước khi chạm ngưỡng rate-limit) hoặc bị `429` (sau khi chạm) — đúng
   khớp con số đo được. Đây là loại lỗi "tài liệu nói sai thực tế" y hệt các lỗi đã săn trong
   Đợt 1/2, chỉ khác lần này nằm trong chính kịch bản test.

**Đã sửa `scripts/load-test/k6-baseline.js`:**

- Đổi route 2 từ `/api/dictionary` (cần đăng nhập, bị hiểu nhầm) sang **`/api/app-settings`** —
  route DUY NHẤT thật sự công khai (không `validateAuth`, xem `apps/server/src/api/platform/
app-settings.ts`) mà vẫn chạm DB/cache thay vì chỉ trả hằng số tĩnh như `/api/health`.
- Bỏ threshold tự động `http_req_failed rate<0.01` (luôn đỏ oan vì lý do #1 ở trên khi test từ
  1 IP) — thay bằng hướng dẫn đọc 2 check riêng (`status 200 hoặc 429`) để phân biệt lỗi thật
  (5xx) với rate-limit hợp lệ.
- Thêm khối comment **"GIỚI HẠN CỦA PHÉP ĐO"** ở đầu file: test 1-IP không đo được trần thật
  của server vì bị rate-limit IP che khuất trước — muốn đo trần thật cần nguồn tải nhiều IP (k6
  Cloud, nhiều VPS, hoặc test có đăng nhập với nhiều tài khoản).

**Kết luận đo được (đáng tin, không bị nhiễu bởi lỗi #1/#2 ở trên):** `/api/health` — **100%
thành công** (không rate-limit, không cần đăng nhập), **p95 = 293ms** (dư sức dưới ngưỡng mục
tiêu `<1000ms`). **0 lỗi 500 ở bất kỳ route nào** trong suốt bài test — không có bằng chứng nào
cho thấy server quá tải ở mức 100 VU.

**✅ [2026-08-24, cùng ngày] Đã chạy lại — số đo `/api/app-settings` SẠCH, xác nhận bản sửa
đúng.** Cùng cấu hình (100 VU, 4 phút 33 giây, nhắm `www.donghanhcungban.org`), sau khi cài lại
`k6` (bản snap trước đó tự hỏng, `/snap/bin/k6: No such file or directory` — gỡ rồi
`sudo snap install k6` lại là xong) và lấy script đã sửa qua `git pull`:

- `checks_succeeded: 100%`, `checks_failed: 0%` — **không còn `401` nào** (khác hẳn lần trước
  3780×429 + 240×401), cả `health` lẫn `app-settings` luôn trả đúng `200` hoặc `429` như kỳ vọng.
- `http_req_failed` **vẫn báo 48,74%** — đúng như comment đã thêm cảnh báo trước: `app-settings`
  giới hạn 30 req/phút/IP (chặt hơn `dictionary` cũ 120/phút), test 1 IP vẫn chạm rate-limit sớm.
  Đây KHÔNG phải điều bất ngờ, đã được viết rõ trong chính script trước khi chạy lại.
- p95 cả 2 route ~260ms (health 264ms, app-settings 256ms) — dư sức dưới ngưỡng `<1000ms`.
- **0 lỗi 500** trong suốt bài test.

Đóng hẳn vòng lặp PR 3.2: script test đã đúng, số đo đã sạch, không còn gì bất thường cần điều
tra thêm ở mức 100 VU.

**Việc tay còn nợ:** tăng dần `VU_TARGET` (500 → 2.000…) theo đúng lộ trình thận trọng đã ghi
trong chính file `k6-baseline.js`. Muốn đo trần thật (không bị IP rate-limit che khuất) cần
nguồn tải nhiều IP (k6 Cloud, nhiều VPS, hoặc test có đăng nhập với nhiều tài khoản) — chưa có
trong phạm vi này.

# feat(security): báo trạng thái Redis ngay lúc khởi động (2026-08-23)

**Bối cảnh — sự cố thật vừa xảy ra:** Redis trên VPS **KHÔNG chết** (chạy tốt 1 ngày 23 giờ,
`systemctl` báo "Ready to accept connections"). `redis-cli ping` trả **`NOAUTH Authentication
required`** — Redis bật `requirepass` nhưng `REDIS_URL` trong `.env` **thiếu mật khẩu**. Client
do đó KHÔNG BAO GIỜ đạt trạng thái `ready`, rate limit chạy Map in-memory **liên tục**, cluster
3 instance nghĩa là hạn mức chống lạm dụng lỏng **gấp 3**.

**ĐÍNH CHÍNH chẩn đoán trước đó (ghi lại để không lặp lỗi suy luận):** khi mở PR #635 tôi kết
luận đây là "trục trặc cửa sổ khởi động", dựa vào việc log chỉ có vài dòng rải rác. **Sai.**
Log ít dòng là vì cái latch `warnedRedisFallback` — mỗi tiến trình log đúng một lần rồi câm
vĩnh viễn. Thực tế hỏng liên tục từ đầu. Chính cái latch đó đã **ngụy trang sự cố thường trực
thành vài blip vô hại** — bài học: đừng suy ra tần suất sự cố từ số dòng log khi cơ chế log có
chống lặp.

**Đã làm:** `reportRedisStatusAtStartup()` — PING ngay khi server start, in thẳng vào log khởi
động:

- Chạy được → `Redis    : ✅ dùng chung toàn cluster (4ms)`
- Hỏng → `Redis    : ❌ KHÔNG dùng được (<lý do>)` kèm **hậu quả** ("rate limit đang đếm RIÊNG
  mỗi instance, hạn mức lỏng gấp N lần") và **cách sửa** (`redis://:MẬT_KHẨU@127.0.0.1:6379`,
  kèm nhắc dấu hai chấm sau `//` — đúng chỗ dễ gõ sai).

Chi tiết: chỉ chạy ở **instance 0** (cấu hình giống nhau mọi instance, in 3 lần chỉ rối log);
**không `await`** nên không làm chậm khởi động; nhận `pingFn` qua tham số để test tiêm được.

**Bằng chứng:** 3 test mới, trong đó ca chính **tái hiện đúng sự cố NOAUTH** và ghim rằng thông
báo phải chứa CẢ lý do, CẢ hậu quả, CẢ cách sửa — không chỉ "Redis lỗi". Cổng: typecheck ✅ ·
lint ✅ · format ✅ · test **4962/4962** ✅.

**Ghi chú kỹ thuật:** ban đầu định mock `pingRedis` ở tầng module — test ĐỎ, vì lời gọi nằm nội
bộ trong `security.ts` nên ESM mock không chặn được. Chuyển sang tiêm phụ thuộc qua tham số
(cùng khuôn `_setWebSocketFactoryForTests` của `geminiLiveService`).

**Việc tay còn lại của người dùng:** điền mật khẩu vào `REDIS_URL` — code không tự sửa `.env`
được. Ngoài ra `.env` trên VPS đang `644` (mọi user trên máy đọc được toàn bộ secret) → nên
`chmod 600`.

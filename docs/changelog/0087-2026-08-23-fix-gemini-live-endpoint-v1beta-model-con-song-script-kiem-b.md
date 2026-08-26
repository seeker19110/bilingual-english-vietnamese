# fix(gemini-live): endpoint v1beta + model còn sống + script kiểm bằng key thật (2026-08-23)

**Bối cảnh:** nợ 🟡 từ 2026-08-21 — `geminiLiveService` đã nối WebSocket thật nhưng CHƯA chạy
được với `GEMINI_API_KEY` thật (sandbox không có key). Người dùng yêu cầu kiểm.

**Không kiểm được bằng key ở phiên này** (không có `.env`, không biến môi trường nào). NHƯNG rà
theo tài liệu hiện hành thì thấy **2 lỗi CHẮC CHẮN làm nó hỏng ngay cả khi có key**:

1. Endpoint ghim `v1alpha`; tài liệu Live API hiện hành dùng **`v1beta`**.
2. Model mặc định `gemini-2.0-flash-exp` — **dòng Gemini 2.0 Flash ngừng phục vụ 31/03/2026**,
   tức đã chết trước thời điểm hiện tại.

**Đã làm:**

1. Sửa cả hai, và cho **cấu hình qua biến môi trường** (`GEMINI_LIVE_WS_URL`,
   `GEMINI_LIVE_MODEL`) — lần sau Google đổi tên thì sửa `.env` là xong, không phải sửa code +
   deploy lại. Mặc định mới: `gemini-3.1-flash-live-preview`.
2. **`npm run smoke:gemini-live`** (`scripts/smoke-gemini-live.ts`) — biến "AI không kiểm được"
   thành một lệnh người dùng chạy trên máy có key. Script KHÔNG tin tên model ghim sẵn: nó hỏi
   Google xem **tài khoản của bạn** được dùng model Live nào (ListModels, lọc
   `bidiGenerateContent`), rồi mở phiên thật, chờ `setupComplete`, gửi một lượt text và in phản
   hồi. Dừng ở bước đầu tiên hỏng và nói rõ phải sửa gì.

**Bằng chứng:** typecheck ✅ · lint ✅ · format ✅ · test **4956/4956** ✅ · chạy thử nhánh lỗi của
script: báo đúng "Thiếu GEMINI_API_KEY".

**VẪN CÒN NỢ:** chưa ai chạy `smoke:gemini-live` với key thật. Nợ chỉ đóng khi script chạy xanh
trên máy có key — đừng đánh dấu xong trước lúc đó.

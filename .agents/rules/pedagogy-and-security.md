---
description: 'Quy chuẩn Sư phạm Song ngữ, Tài chính, Quyền riêng tư & Bảo mật Zero-Trust — Bắt buộc tuân thủ toàn diện'
---

# QUY CHUẨN SƯ PHẠM SONG NGỮ & BẢO MẬT TÀI CHÍNH ZERO-TRUST

Mọi thành phần tính năng và luồng xử lý AI trong hệ thống BẮT BUỘC tuân thủ:

1. **Sư phạm Song ngữ Hai Giọng Phân biệt:**
   - **Chiều A (Việt $\to$ Anh):** Hội thoại/mẫu câu bằng giọng tiếng Anh chuẩn; sửa lỗi, giải thích ngữ pháp và động viên bằng giọng tiếng Việt tự nhiên.
   - **Chiều B (Anh $\to$ Việt):** Hội thoại/mẫu câu bằng giọng tiếng Việt; sửa lỗi và giải thích bằng giọng tiếng Anh.
   - Tuân thủ quy trình 3 nhịp: _Khích lệ $\to$ Sửa lỗi chính xác & giải thích $\to$ Gợi mở Socratic_.
2. **Bảo mật Tài chính & Webhook Idempotency:**
   - Webhook ngân hàng/VietQR phải kiểm tra chữ ký số mật mã `HMAC-SHA256`.
   - Chống trùng lặp tuyệt đối bằng `idempotency_key` duy nhất trong PostgreSQL. Không bao giờ phát sinh tình trạng cấp thừa quyền (Zero Double-Spending).
3. **Quyền hạn Tối thượng từ Server (Server-Authoritative Permissions):**
   - Mọi quyền truy cập tính năng Pro/VIP đều do Server kiểm tra từ bảng `user_plans` hoặc `entitlements`. Client không có thẩm quyền quyết định.
4. **Bảo vệ Ngân sách Token & Quyền riêng tư:**
   - Luôn áp đặt ngân sách trần (Spending Caps) cho các phiên gọi LLM.
   - Ẩn danh hóa thông tin nhạy cảm của người học trước khi truyền ra API bên thứ ba.

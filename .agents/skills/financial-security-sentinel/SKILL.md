---
name: financial-security-sentinel
description: 'Kỹ năng Nghiệp vụ Tài chính, Thanh toán, Kiểm soát Chi phí AI & Bảo mật Tuyệt đối (Financial Integrity, Billing, VietQR Webhook, Token Budgeting, Zero-Trust Auth, OWASP). Kích hoạt khi đụng tới thanh toán, gói cước, webhook ngân hàng, cấp quyền/entitlements, chi phí token LLM, xác thực auth, cookie/token và bảo mật dữ liệu.'
---

# FINANCIAL INTEGRITY, BILLING & SECURITY SENTINEL

Bộ quy chuẩn kiểm soát tài chính, thanh toán và bảo mật nghiêm ngặt khắt khe nhất cho hệ thống Đồng Hành.

---

## 1. QUY CHUẨN THANH TOÁN VIETQR & WEBHOOK IDEMPOTENCY

```
[Bank / Payment Gateway]
         │ (POST Webhook + HMAC-SHA256 Signature)
         ▼
[Signature Verification Gate] ──(Fail)──► [401 / 403 Audit Alert]
         │ (Pass)
         ▼
[Transaction Lock & Idempotency Check] ──(Already Processed)──► [200 OK + Skip]
         │ (New Transaction)
         ▼
[Atomic withTransaction]
  ├── 1. Insert Payment Log (status: 'processing')
  ├── 2. Verify Amount & Order Match
  ├── 3. Grant Plan Entitlements (calculate expiry)
  └── 4. Update Payment Log (status: 'completed')
         │
         ▼
[200 OK Response to Gateway]
```

### Các nguyên tắc Bất Biến:

1. **Kiểm tra Chữ ký số (Cryptographic Signature Verification):**
   - Mọi webhook từ cổng thanh toán / ngân hàng phải được xác minh chữ ký bí mật (`HMAC-SHA256`) trước khi đọc payload.
2. **Chống Trùng lặp & Tấn công Phát lại (Idempotency & Replay Protection):**
   - Sử dụng `idempotency_key` (kết hợp mã giao dịch ngân hàng + mã đơn hàng) lưu trữ trong PostgreSQL với ràng buộc `UNIQUE`.
   - Nếu webhook gọi lại nhiều lần, lập tức trả về `200 OK` và bỏ qua, không được cấp quyền hai lần (Zero Double-Spending).
3. **Đối soát Giao dịch 2 Pha (Two-Phase Reconciliation):**
   - Tuyệt đối không bao giờ cập nhật trạng thái thanh toán là thành công nếu chưa hoàn tất việc ghi nhận quyền lợi (Entitlement Ledger) trong cùng một Database Transaction.

---

## 2. QUẢN TRỊ GÓI CƯỚC & QUYỀN TRUY CẬP (ENTITLEMENTS & SUBSCRIPTIONS)

1. **Kiểm tra Quyền tại Server (Server-Authoritative Permissions):**
   - Client **KHÔNG BAO GIỜ** được quyết định quyền truy cập tính năng Pro/VIP. Mọi quyết định đều do server kiểm tra từ bảng `user_plans` hoặc `entitlements` qua hàm `validatePlanAccess(userId, featureKey)`.
2. **Tính toán Thời hạn Chuẩn UTC:**
   - Ngày bắt đầu và kết thúc gói cước luôn tính theo chuẩn `ISO-8601 UTC`.
   - Xử lý gia hạn cộng dồn (Stackable Renewal): Khi người dùng đang còn 5 ngày gói Pro mà mua tiếp 30 ngày, hạn mới phải là `Thời hạn cũ + 30 ngày`, không được lấy ngày hiện tại ghi đè làm mất ngày cũ.
3. **Thu hồi & Hết hạn Tự động (Grace Period & Expiry):**
   - Khi gói hết hạn, chuyển người dùng về gói `free` êm dịu, không xóa dữ liệu học tập cá nhân đã tích lũy.

---

## 3. LÁ CHẮN NGÂN SÁCH CHI PHÍ AI (AI COST & TOKEN BUDGET GUARDRAILS)

1. **Giới hạn Ngân sách Cứng (Hard Spending Caps):**
   - Mỗi người dùng / phiên học có một định mức sử dụng (Quota / Rate-limit).
   - Thiết lập giới hạn trần chi phí USD/ngày cho toàn hệ sinh thái. Khi đạt 80% ngân sách $\to$ gửi cảnh báo; khi đạt 100% $\to$ tự động chuyển sang mô hình siêu tiết kiệm (Gemini Flash / Cache / Local).
2. **Dynamic Token Clamping & Cost Tier Routing:**
   - Cắt gọt token đầu vào (Input Truncation) và giới hạn `max_tokens` đầu ra một cách nghiêm ngặt tùy theo tác vụ.
   - Ưu tiên sử dụng mô hình tối ưu theo bậc chi phí:
     - Tác vụ phân loại / trích xuất JSON $\to$ Gemini 2.5 Flash / Flash-Lite.
     - Tác vụ chấm điểm IELTS / Đấu trường Tranh biện chuyên sâu $\to$ Gemini 2.5 Pro.

---

## 4. BẢO MẬT ZERO-TRUST & QUYỀN RIÊNG TƯ DỮ LIỆU

1. **Xác thực API Tuyệt đối (`validateAuth`):**
   - 100% API handler nhạy cảm phải gọi `validateAuth(req)` để lấy `userId` từ token đã được ký mật mã.
   - **CẤM:** Không được nhận `userId` từ `req.body` hoặc `req.query` mà không so khớp với token thực tế (Chống triệt để lỗ hổng IDOR - Insecure Direct Object Reference).
2. **Bảo mật Dữ liệu Riêng tư & GDPR/PDPA:**
   - Dữ liệu âm thanh ghi âm và thông tin cá nhân của người học phải được ẩn danh hóa trước khi gửi tới API bên ngoài.
   - Mọi thay đổi về chính sách quyền riêng tư phải được ghi nhận vào `consent_ledger`.

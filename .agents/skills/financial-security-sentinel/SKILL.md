---
name: financial-security-sentinel
description: 'Kỹ năng Nghiệp vụ Tài chính, Thanh toán, Kiểm soát Chi phí AI & Bảo mật Tuyệt đối (Financial Integrity, Billing, VietQR Webhook, Token Budgeting, Zero-Trust Auth, OWASP). Kích hoạt khi đụng tới thanh toán, gói cước, webhook ngân hàng, cấp quyền/entitlements, chi phí token LLM, xác thực auth, cookie/token và bảo mật dữ liệu.'
---

# FINANCIAL INTEGRITY, BILLING & SECURITY SENTINEL V7.0

Bộ quy chuẩn kiểm soát tài chính, thanh toán, kinh tế gamification, chi phí AI và bảo mật nghiêm ngặt khắt khe nhất cho hệ sinh thái Đồng Hành.

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
  ├── 3. Grant Plan Entitlements (calculate stackable expiry)
  └── 4. Update Payment Log (status: 'completed')
         │
         ▼
[200 OK Response to Gateway]
```

### Các nguyên tắc Bất Biến:

1. **Kiểm tra Chữ ký số (Cryptographic Signature Verification):**
   - Mọi webhook từ cổng thanh toán / ngân hàng phải được xác minh chữ ký bí mật (`HMAC-SHA256` qua `SEPAY_WEBHOOK_API_KEY`) trước khi đọc payload.
2. **Chống Trùng lặp & Tấn công Phát lại (Idempotency & Replay Protection):**
   - Sử dụng `idempotency_key` (kết hợp mã giao dịch ngân hàng + mã đơn hàng) lưu trữ trong PostgreSQL với ràng buộc `UNIQUE`.
   - Nếu webhook gọi lại nhiều lần, lập tức trả về `200 OK` và bỏ qua, không được cấp quyền hai lần (Zero Double-Spending).
3. **Đối soát Giao dịch 2 Pha (Two-Phase Reconciliation):**
   - Tuyệt đối không bao giờ cập nhật trạng thái thanh toán là thành công nếu chưa hoàn tất việc ghi nhận quyền lợi (Entitlement Ledger) trong cùng một Database Transaction.

---

## 2. KINH TẾ GAMIFICATION & LAN TỎA VIP (REFERRAL VIP & STREAK VAULT)

1. **Hệ thống Giới thiệu Bạn bè VIP (`packages/core-personal/referralVipService.ts`):**
   - Tặng 7 ngày VIP cho cả người mời và người được mời.
   - **Chống Gian Lận (Anti-Sybil/Fraud):** Người được mời bắt buộc phải hoàn thành bài học thực tế đầu tiên (`hasCompletedFirstLesson: true`) mới kích hoạt tặng ngày VIP.
   - **Cộng Dồn Thời Hạn (Stackable Days):** Khi nhận thêm ngày VIP, hạn mới luôn tính từ hạn cũ cộng thêm số ngày thưởng, không làm mất ngày của người dùng.
   - Lộ trình mốc thưởng 4 tầng (Milestone Road: 1, 3, 5, 10 bạn bè) tích lũy ngày VIP và danh hiệu vinh quang.
2. **Rương Bí Ẩn & Vé Đóng Băng Chuỗi (Streak Freeze Vault):**
   - Người học hoàn thành 3 nhiệm vụ ngày (`dailyQuestsService`) được mở rương nhận Streak Freeze Token.
   - Token chỉ được sử dụng tự động khi người học bỏ lỡ ngày học, bảo vệ chuỗi học tập liên tục mà không gây lạm phát phần thưởng.

---

## 3. LÁ CHẮN NGÂN SÁCH CHI PHÍ AI & PROMPT CACHING GATEWAY

1. **Native Context & Prompt Caching Gateway (`api/_lib/geminiApi.ts`, `packages/core-ai/chatProviders.ts`):**
   - Áp dụng cấu trúc `systemInstruction` và Prompt Caching chính thức của Google Gemini API và Anthropic (`cache_control: { type: 'ephemeral' }`).
   - Tiết kiệm tới **90% chi phí** đọc input token cho các system instruction lớn và kho tri thức học tập.
   - Theo dõi chi tiết `cacheReadTokens`, `cacheWriteTokens` và `costSavedUsd` qua `capabilityCostTracker.ts`.
2. **Giới hạn Ngân sách Cứng (Hard Spending Caps):**
   - Thiết lập giới hạn trần chi phí USD/ngày cho toàn hệ thống.
   - Cảnh báo tại 80% ngân sách $\to$ Tự động chuyển sang mô hình siêu tiết kiệm (Flash-Lite / Edge AI WebGPU) tại 100% ngân sách.
3. **Phân tầng Mô hình Theo Chi phí (Cost Tier Routing):**
   - Tác vụ phân loại / trích xuất JSON / Socratic Hints $\to$ Gemini 2.5 Flash / Flash-Lite.
   - Tác vụ chấm điểm IELTS chuyên sâu / Đấu trường Tranh biện $\to$ Gemini 2.5 Pro.

---

## 4. BẢO MẬT ZERO-TRUST & QUYỀN RIÊNG TƯ DỮ LIỆU

1. **Xác thực API Tuyệt đối (`validateAuth`):**
   - 100% API handler nhạy cảm phải gọi `validateAuth(req)` để lấy `userId` từ token đã được ký mật mã.
   - **CẤM TUYỆT ĐỐI:** Không được nhận `userId` từ `req.body` hoặc `req.query` mà không so khớp với token thực tế (Chống triệt để lỗ hổng IDOR - Insecure Direct Object Reference).
2. **Bảo mật Dữ liệu Riêng tư & Mã Hóa Lưu Trữ:**
   - Dữ liệu âm thanh ghi âm và thông tin cá nhân của người học phải được ẩn danh hóa trước khi gửi tới API bên ngoài.
   - Kho audio cache trên Cloudflare R2 được mã hóa bằng thuật toán `AES-256-GCM`.

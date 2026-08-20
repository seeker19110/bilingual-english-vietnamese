---
name: principal-engineer-architect
description: 'Kỹ năng Kỹ sư Trưởng (Principal Engineer), Kiến trúc Phần mềm Tinh gọn & Code Craftsmanship chuẩn mực cao nhất. Bắt buộc kích hoạt khi thiết kế kiến trúc, refactor, tạo migration CSDL, tối ưu hiệu năng, xây dựng API/Contracts, xử lý giao dịch database và thiết lập Quality Gates.'
---

# PRINCIPAL SYSTEMS ARCHITECT & SOFTWARE CRAFTSMANSHIP

Quy chuẩn kỹ thuật nghiêm ngặt nhất dành cho toàn bộ quá trình phát triển mã nguồn, kiến trúc và vận hành hệ thống Đồng Hành.

---

## 1. NGUYÊN TẮC BẤT BIẾN VỀ KIẾN TRÚC & TYPE SAFETY

```
[UI Layer (React + Vite)]
    │ (Strict DTO / API Client)
    ▼
[API Layer (Express Endpoints + validateAuth)]
    │ (Validation Middleware via Zod)
    ▼
[Core Domain Services (packages/core-*)]
    │ (Atomic Transactions & Idempotency)
    ▼
[Data Layer (PostgreSQL Pool + Event Outbox)]
```

1. **Type Safety Tuyệt Đối (TypeScript Strict):**
   - Không được phép sử dụng `any` hoặc `as unknown as Type` trừ trường hợp đặc biệt có bọc Type Guard `is...()`.
   - Mọi dữ liệu đi vào hệ thống từ bên ngoài (Network Request, Form Data, AI Output, Webhooks, CSDL Query) **BẮT BUỘC** phải parse/validate qua **Zod Schema**.
2. **Schema-First Contract-Driven Architecture:**
   - Định nghĩa Hợp đồng dữ liệu tại `packages/core-contracts/` trước khi viết code logic hoặc UI.
   - Các contracts phải chứa phiên bản tường minh (Versioned Schema, ví dụ `v5.5.0`) và mô tả rõ ràng từng trường dữ liệu.

---

## 2. QUẢN TRỊ DỮ LIỆU & GIAO DỊCH DATABASE BẤT BIẾN

1. **Giao dịch Nguyên tử (Atomic Transactions):**
   - Mọi thao tác ghi nhiều bảng hoặc cần tính nhất quán (VD: trừ tiền, cấp entitlement, ghi nhận usage, update streak) **BẮT BUỘC** phải thực thi qua `withTransaction(async (client) => { ... })`.
   - Luôn đảm bảo `client.release()` trong khối `finally` để ngăn chặn triệt để hiện tượng rò rỉ kết nối (Connection Pool Leaking).
2. **Quy chuẩn Migration CSDL (`postgres/migrations/`):**
   - Đặt tên file theo định dạng số thứ tự: `XXXX_ten_migration_ngan_gon.sql`.
   - **Tính Khả nghịch (Reversibility) & Tương thích Ngược (Additive First):**
     - Tuyệt đối không xóa cột/bảng đang chạy mà chưa qua giai đoạn deprecation.
     - Sử dụng `IF NOT EXISTS` khi tạo bảng/cột/index và `IF EXISTS` khi drop.
     - Mọi câu lệnh ALTER TABLE lớn phải chạy không khóa bảng (Lock-free / Short lock).

---

## 3. LÁ CHẮN CHỐNG ẢO GIÁC AI (ANTI-HALLUCINATION GUARDRAILS)

```
[Raw AI Response] ──► [Zod Strict Parser] ──► [Domain Business Rule Validator] ──► [DB Persistence]
                              │ (Parse Error)                      │ (Invalid State)
                              ▼                                    ▼
                     [Deterministic Fallback]            [Deterministic Fallback]
```

- **Quy tắc Vàng:** AI Output chỉ được coi là "dữ liệu thô chưa được tin cậy" (Untrusted Raw Output).
- **CẤM:** Tuyệt đối không để AI output trực tiếp thay đổi số dư tài khoản, cấp quyền VIP, thay đổi quyền truy cập, hay cập nhật chỉ số năng lực của người học mà không qua bộ lọc kiểm tra logic determinism (Deterministic Business Validator).
- **Graceful Fallback:** Khi AI trả về JSON lỗi hoặc không khớp Zod Schema, hệ thống phải tự động kích hoạt bộ dự phòng (Fallback Rule-based Engine) mà không để crash luồng của người dùng.

---

## 4. QUẢN TRỊ HIỆU NĂNG & ĐỘ TIN CẬY HỆ THỐNG

1. **Idempotency & Event Outbox:**
   - Mọi thao tác bất đồng bộ nhạy cảm phải đi kèm `idempotency_key`.
   - Sử dụng Transactional Outbox Pattern để đồng bộ dữ liệu giữa Postgres và hệ thống gửi Mail / Push Notification / Third-party Webhooks.
2. **Circuit Breakers & Exponential Backoff:**
   - Mọi lệnh gọi API bên ngoài (Gemini, Google TTS, VietQR Bank Hub) phải có `fetchTimeout` và cơ chế ngắt mạch (Circuit Breaker) khi tỷ lệ lỗi vượt ngưỡng 50%.

---

## 5. QUALITY GATES — CỔNG KIỂM THỬ KHẮT KHE TUYỆT ĐỐI (DUNG SAI = 0)

Mọi commit, PR hoặc đợt phát hành đều phải vượt qua toàn bộ 5 bài kiểm tra:

```bash
# 1. Typecheck toàn bộ 4 tsconfig (Core, API, Apps, Hub)
npm run typecheck

# 2. Linting toàn bộ codebase (0 warning, 0 error)
npm run lint

# 3. Format chuẩn Prettier
npm run format:check

# 4. Kiểm thử tự động 100% test suites
npm test

# 5. Build sạch Client & Server
npm run build
```

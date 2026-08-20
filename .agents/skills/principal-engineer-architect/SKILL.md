---
name: principal-engineer-architect
description: 'Kỹ năng Kỹ sư Trưởng (Principal Engineer), Kiến trúc Phần mềm Tinh gọn & Code Craftsmanship chuẩn mực cao nhất. Bắt buộc kích hoạt khi thiết kế kiến trúc, refactor, tạo migration CSDL, tối ưu hiệu năng, xây dựng API/Contracts, xử lý giao dịch database và thiết lập Quality Gates.'
---

# PRINCIPAL SYSTEMS ARCHITECT & SOFTWARE CRAFTSMANSHIP V7.0

Quy chuẩn kỹ thuật nghiêm ngặt nhất dành cho toàn bộ quá trình phát triển mã nguồn, kiến trúc và vận hành hệ thống Đồng Hành.

---

## 1. NGUYÊN TẮC BẤT BIẾN VỀ KIẾN TRÚC & TYPE SAFETY

```
[UI Layer (React 18 + Vite 7 + Dynamic Chunks)]
    │ (Strict DTO / API Client)
    ▼
[API Layer (Express Endpoints + validateAuth)]
    │ (Validation Middleware via Zod Schema)
    ▼
[Core Domain Services (packages/core-*)]
    │ (Atomic Transactions & Idempotency)
    ▼
[Data Layer (PostgreSQL Pool + Event Outbox + Cloudflare R2)]
```

1. **Type Safety Tuyệt Đối (TypeScript Strict):**
   - Không được phép sử dụng `any` hoặc `as unknown as Type` trừ trường hợp đặc biệt có bọc Type Guard `is...()`.
   - Mọi dữ liệu đi vào hệ thống từ bên ngoài (Network Request, Form Data, AI Output, Webhooks, CSDL Query) **BẮT BUỘC** phải parse/validate qua **Zod Schema**.
2. **Schema-First Contract-Driven Architecture:**
   - Định nghĩa Hợp đồng dữ liệu tại `packages/core-contracts/` trước khi viết code logic hoặc UI.
   - Các contracts phải chứa phiên bản tường minh (Versioned Schema, ví dụ `v5.5.0`) và mô tả rõ ràng từng trường dữ liệu.

---

## 2. HIỆU NĂNG TỐI TÂN & CÔ LẬP TIẾN TRÌNH (ADVANCED PERFORMANCE & EDGE ARCHITECTURE)

1. **Off-thread Web Worker DSP (`apps/english/src/lib/audioDspWorker.ts`):**
   - Chuyển toàn bộ các thuật toán tính toán năng lượng âm thanh (PCM RMS), tự tương quan cao độ ($F_0$), và phân tích Formant ($F_1, F_2$) ra khỏi Main UI Thread sang Web Worker chuyên dụng.
   - Giữ vững tốc độ khung hình **60 FPS** mượt mà khi trực quan hóa Avatar 3D và Voice Orb.
2. **Lưu trữ Cục bộ Tốc độ Cao OPFS & IndexedDB (`apps/english/src/lib/edgeAi/edgeModelStorage.ts`):**
   - Xây dựng tầng lưu trữ nhị phân siêu tốc với Origin Private File System (OPFS) kết hợp fallback sang IndexedDB.
   - Cho phép nạp weights/rules mô hình Edge AI WebGPU với độ trễ khởi động **0ms** và 100% khả dụng offline.
3. **Dynamic Studio Code-Splitting & Size Limit Budget:**
   - Áp dụng nạp lười (`lazyWithRetry`) cho 5 Focus Studios của trang Bạn Đồng Hành, chia nhỏ bundle thành dynamic chunks 6–12KB.
   - Kiểm soát nghiêm ngặt ngân sách kích thước: JS $\le 123$ kB, CSS $\le 16$ kB qua `npm run size`.

---

## 3. TRUY XUẤT NGỮ CẢNH LAI & HỢP NHẤT XẾP HẠNG (HYBRID RAG & RRF ENGINE)

Ứng dụng thuật toán **Reciprocal Rank Fusion (RRF)** trong `packages/core-ai/hybridRagEngine.ts`:

$$RRF(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$

- Kết hợp song song độ tương đồng vector ngữ nghĩa (**Dense Cosine Similarity**) và tần suất từ khóa bão hòa (**Sparse BM25 Keyword Scoring**).
- Khử nhiễu ngữ cảnh và xếp hạng chính xác thông tin cá nhân/học tập trước khi nạp vào AI Prompt.

---

## 4. QUẢN TRỊ DỮ LIỆU & GIAO DỊCH DATABASE BẤT BIẾN

1. **Giao dịch Nguyên tử (Atomic Transactions):**
   - Mọi thao tác ghi nhiều bảng hoặc cần tính nhất quán (VD: trừ tiền, cấp entitlement, ghi nhận usage, update streak) **BẮT BUỘC** phải thực thi qua `withTransaction(async (client) => { ... })`.
   - Luôn đảm bảo giải phóng kết nối trong khối `finally` để ngăn chặn rò rỉ connection pool.
2. **Quy chuẩn Migration CSDL (`postgres/migrations/`):**
   - Đặt tên file theo định dạng số thứ tự: `XXXX_ten_migration_ngan_gon.sql`.
   - **Tính Khả nghịch (Reversibility) & Tương thích Ngược (Additive First):**
     - Tuyệt đối không xóa cột/bảng đang chạy mà chưa qua giai đoạn deprecation.
     - Sử dụng `IF NOT EXISTS` khi tạo bảng/cột/index và `IF EXISTS` khi drop.

---

## 5. LÁ CHẮN CHỐNG ẢO GIÁC AI (ANTI-HALLUCINATION GUARDRAILS)

```
[Raw AI Response] ──► [Zod Strict Parser] ──► [Domain Business Rule Validator] ──► [DB Persistence]
                               │ (Parse Error)                      │ (Invalid State)
                               ▼                                    ▼
                      [Deterministic Fallback]            [Deterministic Fallback]
```

- **Quy tắc Vàng:** AI Output chỉ được coi là "dữ liệu thô chưa được tin cậy" (Untrusted Raw Output).
- **CẤM:** Tuyệt đối không để AI output trực tiếp thay đổi số dư tài khoản, cấp quyền VIP, thay đổi quyền truy cập, hay cập nhật chỉ số năng lực của người học mà không qua bộ lọc kiểm tra logic tất định (Deterministic Business Validator).
- **Graceful Fallback:** Khi AI trả về JSON lỗi hoặc không khớp Zod Schema, hệ thống phải tự động kích hoạt bộ dự phòng (Fallback Rule-based Engine) mà không để crash luồng của người dùng.

---

## 6. QUALITY GATES — CỔNG KIỂM THỬ KHẮT KHE TUYỆT ĐỐI (DUNG SAI = 0)

Mọi commit, PR hoặc đợt phát hành đều phải vượt qua toàn bộ 5 bài kiểm tra:

```bash
# 1. Typecheck toàn bộ 4 tsconfig (Core, API, Apps, Hub)
npm run typecheck

# 2. Linting toàn bộ codebase (0 warning, 0 error)
npm run lint

# 3. Format chuẩn Prettier
npm run format:check

# 4. Kiểm thử tự động 100% test suites (4.869+ tests)
npm test

# 5. Build sạch Client & Server
npm run build
```

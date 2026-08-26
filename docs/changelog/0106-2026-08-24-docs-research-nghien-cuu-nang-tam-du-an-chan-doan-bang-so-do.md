# docs(research): nghiên cứu "nâng tầm dự án" — chẩn đoán bằng số đo thật (2026-08-24)

**Tài liệu mới: `docs/research/nang-tam-du-an-2026-08-24.md`** — bản ĐỀ XUẤT (chưa quyết định), trả
lời câu hỏi "nâng tầm dự án" bằng số đo trực tiếp trên `main` thay vì cảm tính. Chỉ thêm tài liệu,
KHÔNG đụng một dòng mã nào.

**Số đo nền (đo lại ngày 2026-08-24, không lấy từ tài liệu cũ):** 145.404 dòng TS/TSX (không tính
test) · 401 file test · 80 route frontend / 50 trang thật · 18 người dùng thật ⇒ **~8.000 dòng mã
cho mỗi người dùng**. Kết luận: nút thắt hiện tại KHÔNG phải thiếu tính năng.

**Ba khoảng cách phát hiện (đều kiểm chứng lại tại chỗ, không chép lại đề xuất cũ):**

1. **Bề rộng ≫ độ sâu** — 4 trụ `domains/` có 6.004 dòng giao diện nhưng mỗi trụ chỉ **2 chỗ chạm
   DB** (`apps/server/src/api/domains/*.ts`). Chỉ môn English là sâu thật.
2. **Giao diện nói dối, VẪN CHƯA SỬA** (nêu từ 2026-08-23, phiên này xác nhận còn nguyên):
   `LifeWheel.tsx:110` `handleSaveAssessment()` chỉ gọi `toast.success('Đã lưu…')` — không `fetch`,
   không API, không `localStorage`, tải lại trang mất trắng. **Sổ tay lỗi sai** (`lib/mistakes.ts`,
   183 dòng) chỉ nằm `localStorage` — grep xác nhận 0 lệnh `fetch`, 0 đường `/api/`, và `postgres/`
   không có bảng `mistake` nào. Còn **4 file API giữ `new Map` cấp module**
   (`agent-orchestrator`, `mesh-telemetry`, `stem-scratchpad`, `debate-arena`) — vỡ trong PM2
   cluster 3 instance.
3. **80 route / 50 trang** — mỗi trụ có tới **4 URL cùng render một component, không redirect**
   (vd `/su-nghiep-cua-toi`, `/hoc-su-nghiep`, `/career`, `/su-nghiep` → `<Career />`). Đúng loại
   lỗi trùng nội dung vừa sửa ở tầng domain (PR #645), nhưng ở tầng route ứng dụng.

**Khuyến nghị:** nâng tầm SẢN PHẨM (làm thật cái đang hiển thị + khoét sâu 1 mũi nhọn), KHÔNG nâng
tầm hạ tầng (993 dòng tài liệu scale 50k–1M mà chưa chạy k6 lần nào, thực tế 18 người dùng), CHƯA mở
môn học mới. Lộ trình 3 đợt: ① "Không nói dối" (3 PR: sổ tay lỗi sai lên server · bánh xe cuộc đời
lưu thật hoặc gỡ nút · 4 `new Map` → `platform.feature_state`) → ② "Một mũi nhọn thật" (chọn ĐÚNG 1
trong 4 trụ làm sâu, ẩn 3 trụ còn lại) → ③ "Dọn nhà + kiểm chứng" (gom route · chạy k6 lần đầu).

**⛔ Chặn: 4 câu hỏi cần chủ dự án chốt trước khi làm PR nào** (§6 của tài liệu): (1) đồng ý phương
án sản phẩm? (2) chọn trụ nào cho Đợt 2? (3) ẩn 3 trụ còn lại? (4) bánh xe cuộc đời — lưu thật hay
gỡ nút "Lưu"?

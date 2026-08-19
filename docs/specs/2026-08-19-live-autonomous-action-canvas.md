# Feature spec: Live Autonomous Action Canvas & Cross-Domain Workspace Hub (Platform V4 Phase 3)

| Thuộc tính   | Giá trị                              |
| ------------ | ------------------------------------ |
| Issue        | #v4-03-live-autonomous-action-canvas |
| Spec owner   | Platform Core Team                   |
| Trạng thái   | **Approved for implementation**      |
| Người duyệt  | Architecture Owner                   |
| Ngày duyệt   | 2026-08-19                           |
| Lần cập nhật | 2026-08-19                           |

> Trạng thái: **Approved for implementation** — Không gian làm việc trực quan tương tác 2 chiều giữa Người dùng và Bạn Đồng Hành AI, kết nối 5 miền tri thức.

---

## 1. Tóm tắt quyết định

Xây dựng **Live Autonomous Action Canvas** — không gian làm việc trực quan tương tác thời gian thực (Visual Collaborative Canvas) cho phép người dùng và Bạn Đồng Hành AI cùng phác thảo sơ đồ tư duy (Mindmap), phân rã mục tiêu đa miền (Cross-Domain Goal Decomposition), quản lý công việc và đồng sáng tạo văn bản/ý tưởng. Tích hợp động cơ tự động bố cục (Auto-Layout Engine), tự động liên kết đồ thị tri thức Life Graph và xuất đa định dạng (Markdown, PDF, Notion, Google Calendar) với cơ chế xác thực an toàn.

---

## 2. Vấn đề, người dùng và bằng chứng

- **Persona/job-to-be-done**: Người dùng cần một nơi tập trung để vừa đối thoại với AI, vừa thấy được bức tranh toàn cảnh các mục tiêu, dự án và hành động cụ thể trên một bảng vẽ trực quan không giới hạn.
- **Hiện trạng & Pain point**: Dù có dữ liệu ở các domain riêng (Learning, Career, Work, Startup, Life), người dùng khó hình dung sự liên kết qua lại (ví dụ: học tiếng Anh phục vụ cho dự án nào ở công việc, thói quen nào hỗ trợ cho sức khỏe).
- **Mục tiêu**: Cung cấp không gian Canvas trực quan 2 chiều, hỗ trợ kéo thả, zoom/pan mượt mà, AI có thể tự động vẽ thêm node/nối dây khi nhận lệnh bằng văn bản hoặc giọng nói.

---

## 3. Scope và Yêu cầu Kỹ thuật

### In scope

1. **Hợp đồng Dữ liệu V4.2 (`packages/core-contracts/actionCanvas.ts`)**:
   - `CanvasNodeTypeSchema`, `CanvasNodeSchema`, `CanvasEdgeSchema`, `ActionCanvasStateSchema`, `CanvasExportFormatSchema`.
2. **Động cơ Điều phối Tự trị (`packages/core-personal/actionCanvasService.ts`)**:
   - Thuật toán phân rã mục tiêu đa miền tự động (Cross-domain Goal Decomposition).
   - Thuật toán tự động sắp xếp sơ đồ cây / lực đàn hồi (Hierarchical / Force-Directed Layout).
   - Bộ chuyển đổi định dạng xuất Markdown & Export helper.
3. **REST API Handler (`api/action-canvas.ts`)**:
   - `GET/POST /api/action-canvas` hỗ trợ load, lưu, tổng hợp tự động và xuất dữ liệu.
4. **Giao diện Người dùng Canvas (`apps/english/src/components/ActionCanvas/`, `apps/english/src/pages/ActionCanvas.tsx`)**:
   - Bảng vẽ tương tác Canvas kéo thả 60 FPS, zoom, pan, thêm/sửa/xóa nodes, nối cạnh liên kết.
   - Hộp thoại AI Orchestration và Export Modal.
   - Định tuyến `/workspace` trong `App.tsx`.

---

## 4. Kế hoạch Kiểm thử & Quality Gates

- **Unit & Integration Tests**: 100% tests cho contracts, layout algorithms, service logic, API và client api.
- **Quality Gates**: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` đều đạt 100% xanh.

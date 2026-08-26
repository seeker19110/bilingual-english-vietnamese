# Platform V2 Flagship — Edge AI Client-side WebGPU Engine & Instant Grammar/Intent (2026-08-19)

Hoàn thành triển khai hạ tầng trí tuệ nhân tạo biên (Edge AI) chạy trực tiếp trên trình duyệt bằng WebGPU/WASM:

- **1. Edge AI Core Engine (`apps/english/src/lib/edgeAi/edgeAiService.ts`, `useEdgeAi.ts`)**:
  - Tự động phát hiện năng lực phần cứng WebGPU (`detectWebGpuCapability`) và bộ nhớ RAM của thiết bị.
  - Phân loại ý định siêu tốc (`classifyIntentEdge`) sang 5 domain trong < 5ms với 0đ chi phí API và 0ms độ trễ mạng.
  - Phân tích và phát hiện lỗi ngữ pháp tiếng Anh tức thì (`checkGrammarEdge`): mạo từ a/an, sự hòa hợp chủ vị, lặp từ.
  - Cơ chế Hybrid Routing tự động chuyển tiếp lên Cloud AI Gateway khi thiết bị không hỗ trợ WebGPU.
- **2. Giao diện & Tích hợp Trải nghiệm (`EdgeAiIndicator.tsx`, `Companion.tsx`, `Writing.tsx`)**:
  - `EdgeAiIndicator.tsx`: Huy hiệu hiển thị trạng thái `⚡ Edge AI WebGPU (0ms)` và popup minh bạch hiệu năng/bảo mật.
  - Tích hợp vào thanh điều hướng Companion (`/dong-hanh`) và trang Luyện viết (`/writing`).
  - Hiển thị gợi ý sửa lỗi ngữ pháp tức thì ngay khi gõ bài viết luận.
- **3. Quality Gates**:
  - `npm test`: **4.330 / 4.330 tests passed 100%** trên 307 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).

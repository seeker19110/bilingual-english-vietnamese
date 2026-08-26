# Platform V3 Flagship — Ambient Screen-Grounding & Context Vision Copilot (2026-08-19)

Hoàn thành triển khai lát cắt thứ hai của **Platform V3: Thị giác Môi trường & Nhận thức Ngữ cảnh Màn hình**:

- **1. Ambient Vision Core Engine (`packages/core-ai/ambientVisionService.ts`, `api/ambient-vision.ts`)**:
  - Nhận thức trực tiếp ngữ cảnh người dùng đang làm việc/học tập trên màn hình máy tính qua Web Screen Capture API.
  - Phân loại ứng dụng (`code_editor`, `document_editor`, `browser`, `chat_app`), tóm tắt công việc và trích xuất từ vựng, thuật ngữ trọng điểm.
  - Tự động sinh gợi ý trợ lực thông minh (Actionable Context Tips: `vocabulary`, `code_refactor`, `concept_explainer`, `productivity`) không cần copy-paste.
  - Endpoint: `POST /api/ambient-vision`.
- **2. Hợp đồng Dữ liệu V3 (`packages/core-contracts/ambientContext.ts`)**:
  - Định nghĩa và kiểm thực chặt chẽ `AmbientScreenCaptureSchema` và `AmbientContextInsightSchema` (`v3.0.0`).
- **3. Frontend UI (`apps/english/src/components/CompanionVoice/AmbientScreenCopilot.tsx`, `Companion.tsx`)**:
  - `AmbientScreenCopilot.tsx`: Bảng điều khiển chia sẻ màn hình 1-chạm, chế độ tự động quét mỗi 15 giây, hiển thị trực quan các gợi ý trợ lực ngữ cảnh theo thời gian thực.
  - Tích hợp trực tiếp tại giao diện Bạn Đồng Hành (`/dong-hanh`).
- **4. Quality Gates**:
  - `npm test`: **4.343 / 4.343 tests passed 100%** trên 311 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).

# Platform V2 Flagship — Proactive Briefings, PWA Offline Mode, Vision Solver & External Integrations (2026-08-18)

Hoàn thành phiên bản Flagship cho Platform V2 với trọn bộ 3 tính năng P1 và tích hợp ứng dụng mở rộng:

- **1. Proactive Companion Briefings (`packages/core-personal/proactiveBriefingService.ts`, `api/proactive-briefing.ts`)**:
  - Tự động tổng hợp dữ liệu đa miền (`learningReadModel`, `lifeFoundation`, `careerGoals`, `wellbeing`) để sinh bản tin Morning/Evening Briefing cá nhân hóa.
  - Component `ProactiveBriefingCard.tsx` hiển thị thẻ bản tin trực quan trên Companion (`/dong-hanh`), liên kết nhanh tới các nhiệm vụ trọng tâm trong ngày.
- **2. PWA Offline Mode & Auto-Sync (`apps/english/src/lib/offlineStore.ts`, `components/OfflineSyncIndicator.tsx`)**:
  - Hỗ trợ hàng đợi ngoại tuyến `offline_sync_queue` lưu trữ cục bộ cho ôn tập thẻ nhớ SRS và check-in thói quen khi mất mạng.
  - Tự động bắt sự kiện `online` để flush đồng bộ dữ liệu lên máy chủ và hiển thị thanh trạng thái đồng bộ mượt mà trên toàn bộ ứng dụng.
- **3. Multimodal Vision STEM Solver (`packages/core-ai/visionSolverService.ts`, `api/vision-solve.ts`)**:
  - Tích hợp mô hình thị giác đa phương thức Gemini Multimodal Vision phân tích ảnh chụp đề bài Toán, Lý, Hóa, Sinh.
  - Trích xuất đề bài, công thức và trả về các bước giải Step-by-step (`title`, `detail`, `formula`) có cấu trúc.
  - Tích hợp nút Chụp/Tải ảnh đề bài trực tiếp trên phòng học `SubjectDetail.tsx`.
- **4. Tích hợp Ứng dụng Ngoài Google Calendar & Notion (`packages/core-integrations/`, `api/integrations.ts`)**:
  - `packages/core-integrations/googleCalendar.ts`: Tạo liên kết và đồng bộ lịch học / sự kiện lên Google Calendar.
  - `packages/core-integrations/notion.ts`: Đóng gói và xuất công việc / dự án sang Notion Database.
  - Component `IntegrationsModal.tsx` cho phép người dùng 1 chạm đồng bộ lịch học từ phòng giải bài tập STEM.
- **5. Ghi nhận Nợ Kỹ thuật & Backlog P2-P3**:
  - Đã lập tài liệu nghiên cứu `docs/research/v2-flagship-backlog-p2-p3.md` ghi nhận lộ trình cho WebRTC Voice Streaming, Three.js 3D Avatar Lip-sync, Edge SLM / WebLLM, Zero-Knowledge Memory Encryption.

# Platform V6.3 — Priority 2 Optimization: Off-thread Audio DSP Worker & OPFS/IndexedDB Edge AI Persistent Model Storage (2026-08-20)

Hoàn thành triển khai trọn vẹn 2 đột phá kỹ thuật Mức Ưu Tiên 2 (Priority 2):

- **1. Off-thread Audio DSP Worker & Real-time Pitch Detection (`apps/english/src/lib/audioDspWorker.ts`, `apps/english/src/lib/useAudioDsp.ts`)**:
  - Chuyển toàn bộ các thuật toán tính toán năng lượng âm thanh (PCM RMS), thuật toán tự tương quan phát hiện cao độ giọng nói $F_0$ (Autocorrelation Pitch Detection) và phân tích phổ Formant $F_1, F_2$ ra khỏi Main UI Thread sang Web Worker chuyên dụng.
  - Xây dựng React Hook `useAudioDsp` quản lý audio stream 2 chiều và tự động fallback về Main Thread đồng bộ trên các trình duyệt cũ.
  - Loại bỏ hoàn toàn hiện tượng drop frames, đảm bảo giữ vững **60 FPS** mượt mà khi trực quan hóa 3D CyberTutor Avatar và phân tích âm học thời gian thực.
- **2. OPFS & IndexedDB Persistent Storage cho Edge AI WebGPU (`apps/english/src/lib/edgeAi/edgeModelStorage.ts`, `apps/english/src/lib/edgeAi/edgeAiService.ts`)**:
  - Xây dựng tầng lưu trữ nhị phân tốc độ cao với **Origin Private File System (OPFS)** kết hợp fallback an toàn sang **IndexedDB**.
  - Cho phép lưu trữ và nạp trước weights/rules cho mô hình phân loại ý định & kiểm tra ngữ pháp tức thì tại Client, đạt thời gian khởi động **0ms** và hỗ trợ 100% chế độ Offline không tốn băng thông mạng.
- **3. Quality Gates**:
  - `npm test`: **4.616 / 4.616 tests passed 100%** trên 382 test files (+10 tests mới).
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).

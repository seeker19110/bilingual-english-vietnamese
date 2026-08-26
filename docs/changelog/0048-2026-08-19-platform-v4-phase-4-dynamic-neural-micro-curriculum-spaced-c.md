# Platform V4 Phase 4 — Dynamic Neural Micro-Curriculum & Spaced Collocations Graph (2026-08-19)

Hoàn thành triển khai Giai đoạn 4 Nâng cấp Đồng Hành lên Tầng Cao Mới (Sovereign Multimodal Cognitive Companion):

- **1. Hợp đồng Dữ liệu V4.3 (`packages/core-contracts/neuralCurriculum.ts`)**:
  - Định nghĩa chuẩn `v4.3.0`: `CollocationTypeSchema` (verb_noun, adjective_noun, noun_noun, phrasal_verb, idiom, discourse_marker), `CollocationNodeSchema`, `MicroDrillQuestionSchema`, `MicroCurriculumModuleSchema`, `NeuralCurriculumStateSchema`.
- **2. Động cơ Sinh Lộ Trình Vi Mô & Đồ Thị Collocations (`packages/core-ai/neuralCurriculumService.ts`, `api/neural-curriculum.ts`)**:
  - Thuật toán sinh mô-đun vi mô (`generateMicroCurriculumModule`): Tự động phát hiện và sinh các bài học 2 phút nhắm đúng cụm từ đắt giá của từng miền và cấp độ CEFR A1-C2.
  - Thuật toán lặp lại ngắt quãng thích ứng (`computeNextSpacedReview`): Tối ưu đường cong lãng quên Ebbinghaus và điểm nhịp sinh học.
  - Endpoint REST `GET/POST /api/neural-curriculum` và client library `apps/english/src/lib/neuralCurriculumApi.ts`.
- **3. Frontend UI Components (`apps/english/src/components/NeuralCurriculum/`, `apps/english/src/pages/Companion.tsx`)**:
  - `CollocationGraphExplorer.tsx`: Trình hiển thị mạng lưới Collocations chuẩn bản xứ kèm phát âm audio, IPA, loại cụm từ và câu ví dụ song ngữ.
  - `MicroDrillModal.tsx`: Hộp thoại tương tác luyện nhanh 2 phút với các câu hỏi điền từ vào cụm collocation và lời giải thích sâu.
  - `NeuralMicroCurriculumCard.tsx`: Thẻ lộ trình vi mô thần kinh tích hợp trực tiếp tại Bạn Đồng Hành (`/dong-hanh`).
- **4. Quality Gates**:
  - `npm test`: **4.482 / 4.482 tests passed 100%** trên 350 test files.
  - `npm run typecheck`: passed 100% (0 errors trên 4 tsconfigs).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier style).
  - `npm run build`: passed 100% (Client Vite SPA, Server `dist-server/`, Hub workspace).

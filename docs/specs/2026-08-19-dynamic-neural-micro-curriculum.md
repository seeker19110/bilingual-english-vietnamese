# Feature spec: Dynamic Neural Micro-Curriculum & Spaced Collocations Graph (Platform V4 Phase 4)

| Thuộc tính   | Giá trị                                |
| ------------ | -------------------------------------- |
| Issue        | #v4-04-dynamic-neural-micro-curriculum |
| Spec owner   | Platform Core Team                     |
| Trạng thái   | **Approved for implementation**        |
| Người duyệt  | Architecture Owner                     |
| Ngày duyệt   | 2026-08-19                             |
| Lần cập nhật | 2026-08-19                             |

> Trạng thái: **Approved for implementation** — Lộ trình vi mô thần kinh thích ứng và mạng lưới Collocations tự nhiên hoá giao tiếp.

---

## 1. Tóm tắt quyết định

Xây dựng **Dynamic Neural Micro-Curriculum & Spaced Collocations Graph** — hệ thống tự động phát hiện lỗ hổng ngôn ngữ (Blind spots & Skill gaps) từ lịch sử đàm thoại giọng nói, bài viết và tương tác của người dùng, từ đó sinh các mô-đun bài học vi mô 2–5 phút (Micro-Drills) tập trung vào các cụm từ tự nhiên (Collocations Graph) có tần suất sử dụng cao trong thực tế. Tích hợp thuật toán Spaced Retrieval v4.3 thích ứng theo nhịp sinh học và độ khó tự động điều chỉnh.

---

## 2. Vấn đề, người dùng và bằng chứng

- **Persona/job-to-be-done**: Người học tiếng Anh ở trình độ trung cấp và nâng cao (B1-C2) thường gặp hiện tượng 'dịch từng từ' (Word-by-word translation) hoặc thiếu vốn Collocation tự nhiên khi trao đổi trong môi trường công việc quốc tế.
- **Hiện trạng & Pain point**: Các bài học truyền thống thường quá dài (15-30 phút), không cá nhân hoá theo nhu cầu tức thì (ví dụ: chuẩn bị thuyết trình dự án công nghệ ngày mai).
- **Mục tiêu**: Cung cấp các mô-đun vi mô 2 phút có thể học mọi lúc, tập trung vào các cụm từ đắt giá kết nối trực tiếp với mục tiêu công việc và cuộc sống của người học.

---

## 3. Scope và Yêu cầu Kỹ thuật

### In scope

1. **Hợp đồng Dữ liệu V4.3 (`packages/core-contracts/neuralCurriculum.ts`)**:
   - `CollocationTypeSchema`, `CollocationNodeSchema`, `MicroCurriculumModuleSchema`, `NeuralCurriculumStateSchema`.
2. **Động cơ Sinh Lộ Trình & Đồ Thị Collocations (`packages/core-ai/neuralCurriculumService.ts`)**:
   - Thuật toán phát hiện lỗ hổng ngôn ngữ (`detectSkillGaps`).
   - Động cơ sinh đồ thị Collocation đắt giá theo CEFR (`generateCollocationGraph`).
   - Thuật toán tính lịch ôn tập Spaced Retrieval v4.3 (`computeNextSpacedReview`).
3. **REST API Handler (`api/neural-curriculum.ts`)**:
   - `GET/POST /api/neural-curriculum` hỗ trợ tải lộ trình, sinh micro-module và hoàn thành bài tập.
4. **Giao diện Người dùng (`apps/english/src/components/NeuralCurriculum/`, `apps/english/src/pages/Companion.tsx`)**:
   - `CollocationGraphExplorer.tsx`: Trình khám phá mạng lưới Collocations đắt giá 60 FPS.
   - `MicroDrillModal.tsx`: Hộp thoại tương tác luyện nhanh 2 phút.
   - `NeuralMicroCurriculumCard.tsx`: Thẻ lộ trình vi mô thần kinh tích hợp tại Bạn Đồng Hành.

---

## 4. Kế hoạch Kiểm thử & Quality Gates

- **Unit & Integration Tests**: 100% tests cho contracts, service logic, API và client api.
- **Quality Gates**: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` đều đạt 100% xanh.

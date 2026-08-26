# V2 Enhancement — Companion SSE Streaming & Multi-Grade STEM Question Banks (2026-08-18)

Hoàn thành nâng cấp trải nghiệm thời gian thực cho Companion Runtime và mở rộng toàn diện dữ liệu bài tập STEM:

- **Mục 2 — Streaming Response (Server-Sent Events - SSE) cho Companion**:
  - `packages/core-personal/companionRuntime.ts`: Bổ sung hàm async generator `streamCompanionTurn` phát sinh chuỗi sự kiện `meta` $\rightarrow$ `chunk` (văn bản delta) $\rightarrow$ `actions` (danh sách Proposed Actions) $\rightarrow$ `done` (kết quả đầy đủ `CompanionResponse`).
  - `api/companion.ts`: Hỗ trợ tham số `stream: true` và trả về `ReadableStream` với `Content-Type: text/event-stream`. Tương thích ngược 100% khi client gửi request JSON truyền thống.
  - `packages/core-personal/companionStream.test.ts`: Bổ sung unit test toàn diện cho luồng SSE events.
  - `apps/english/src/lib/companionApi.ts` & `companionApi.test.ts`: Bổ sung hàm `sendCompanionMessageStream` parse chuẩn SSE streams.
  - `apps/english/src/pages/Companion.tsx`: Nâng cấp giao diện Bạn Đồng Hành AI hiển thị phản hồi chữ chạy thời gian thực (real-time stream typing) kèm cập nhật context và proposed action cards.
- **Mục 3 — Mở rộng Ngân Hàng Dữ Liệu & Bài Tập STEM (Toán, Lý, Hóa, Sinh)**:
  - `apps/english/src/data/stemCurriculum.ts`: Mở rộng toàn bộ 4 môn cốt lõi (Toán học, Vật lý, Hóa học, Sinh học) xuyên suốt cả 4 cấp độ: Lớp 10, Lớp 11, Lớp 12 (Thi THPTQG), và Đại học / Cao cấp.
  - Mỗi cấp độ bao gồm đầy đủ các chương trọng tâm, công thức & định lý cốt lõi, và các bài tập mẫu phân cấp độ khó (`basic`, `intermediate`, `advanced`) kèm lời giải Step-by-step chi tiết.
  - `apps/english/src/pages/SubjectDetail.tsx`: Bổ sung thanh lọc độ khó (Cơ bản, Vận dụng, Vận dụng cao) trong tab Bài Tập Trọng Tâm.
  - `apps/english/src/data/stemCurriculum.test.ts`: Unit test xác minh 100% tính toàn vẹn và duy nhất của toàn bộ ID bài tập, công thức và các bước giải.
- **Quality Gates**:
  - `npm test`: **4.116 / 4.116 tests passed 100%** trên 271 test files.
  - `npm run typecheck`: passed 100% (0 errors trên cả 4 tsconfig).
  - `npm run lint`: passed 100% (0 warnings, 0 errors).
  - `npm run format:check`: passed 100% (All matched files use Prettier code style).
  - `npm run build`: passed 100% (Client, Server, Hub).
  - `npm run eval:v2:audit`: passed 100% (8/8 Acceptance Invariants).

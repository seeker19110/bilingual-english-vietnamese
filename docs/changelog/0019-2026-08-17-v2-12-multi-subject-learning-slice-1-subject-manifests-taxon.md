# V2-12 Multi-Subject Learning — slice 1: subject manifests, taxonomy registry & API (2026-08-17, PR #587 đã MERGE)

Hoàn thành Slice 1 cho V2-12 Multi-Subject Learning:

- **Subject Manifest Contract (`packages/core-contracts/subjectManifest.ts`)**: Phân tách ranh giới rõ ràng giữa shared learning primitives và subject-owned rules (taxonomyKind: `cefr` vs `grade_curriculum`, questionTypes, evaluationModes: `exact_formula`, `step_analysis`, `rubric_ielts`, `rubric_ai`).
- **Subject Registry Service (`packages/core-learner/subjectRegistry.ts`)**: Hỗ trợ 5 môn học cốt lõi (English, Mathematics, Physics, Chemistry, Biology) với cấu hình phân loại và hàm tra cứu chuẩn hoá (`getSubjectManifest`, `listSupportedSubjects`, `isValidSubjectLevel`).
- **API `/api/subjects`**: GET endpoint tra cứu danh sách môn học hoặc chi tiết môn học theo ID/category. Đăng ký trong `server.ts`.
- **Test suite**: 11 unit tests mới (`subjectManifest.test.ts`, `subjectRegistry.test.ts`, `api/subjects.test.ts`), 101 route registration tests passed.

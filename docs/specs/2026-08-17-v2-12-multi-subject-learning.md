# Spec: V2-12 Multi-Subject Learning

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Mở rộng Learning Bounded Context hỗ trợ đa môn (English, Mathematics, Physics, Chemistry, Biology) theo 21-ROADMAP.md Wave D.

## 1. Bối cảnh & Mục tiêu

- Đưa các môn học (English, Mathematics, Physics, Chemistry, Biology) vào cùng một Bounded Context "Learning" mà không ép các khái niệm chuyên biệt của ngôn ngữ (CEFR, IELTS, Phát âm) lên các môn STEM.
- **Shared Primitives:** Learner learning profile, goals, evidence/mastery pattern, learning plan, scheduling.
- **Subject-owned:** Taxonomy (`cefr` vs `grade_curriculum`), Question types (MCQ, proof, formula calculation vs dialogue/pronunciation), Evaluation rules (`rubric_ielts` vs `exact_formula`/`step_analysis`).
- **Gate:** Ít nhất 2 môn học khác biệt nhau hoàn toàn về bản chất (English vs Mathematics) cùng vận hành trơn tru qua hệ thống contract dùng chung mà không sinh mã điều kiện lộn xộn trong core.

## 2. Thiết kế kỹ thuật

- **Contracts (`packages/core-contracts/subjectManifest.ts`)**: Định nghĩa `SubjectManifestSchema`, `SubjectCategorySchema`, `TaxonomyKindSchema`, `EvaluationModeSchema`.
- **Registry Service (`packages/core-learner/subjectRegistry.ts`)**: Cung cấp registry cho English, Mathematics, Physics, Chemistry, Biology cùng các hàm `getSubjectManifest`, `listSupportedSubjects`, `isValidSubjectLevel`.
- **API (`api/subjects.ts`)**: GET endpoint tra cứu danh sách môn học hoặc chi tiết môn học theo ID/category.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/subjectManifest.test.ts`, `packages/core-learner/subjectRegistry.test.ts`.
- API tests: `api/subjects.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.

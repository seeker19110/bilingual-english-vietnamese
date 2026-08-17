# Spec: V2-11 Learning Ownership Migration

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Tách bạch ranh giới sở hữu giữa Personal OS và Learning Domain theo 02-SYSTEM-ARCHITECTURE.md và 21-ROADMAP.md Wave D.

## 1. Bối cảnh & Mục tiêu

- Personal OS quản lý Person, Life Graph, Memories, Facts, Policies, Decision Ledger.
- Learning Domain sở hữu: Learner state, Skill taxonomy, Mastery summary, SRS review queue, Evidence observations.
- Cung cấp mô hình đọc chuẩn hoá (`LearningReadModel`) có kiểu dữ liệu chặt chẽ cho Companion Runtime và Context Engine, không làm lộ chi tiết lưu trữ nội bộ của domain Learning.

## 2. Thiết kế kỹ thuật

- **Contracts (`packages/core-contracts/learningReadModel.ts`)**: Schema `LearningReadModelSchema` và kiểu `LearningReadModel`.
- **Service (`packages/core-learner/learningReadModelService.ts`)**: Hàm `getLearningReadModel` và `formatLearningReadModelForContext`.
- **API (`api/learning-read-model.ts`)**: GET endpoint trả về `LearningReadModel` cho người học đã xác thực.
- **Companion Runtime Integration (`packages/core-personal/companionRuntime.ts`)**: Khi domain là `learning`, tự động nạp `LearningReadModel` vào `domainState` của `ContextEngine`.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/learningReadModel.test.ts`, `packages/core-learner/learningReadModelService.test.ts`, `packages/core-personal/companionRuntime.test.ts`.
- API tests: `api/learning-read-model.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.

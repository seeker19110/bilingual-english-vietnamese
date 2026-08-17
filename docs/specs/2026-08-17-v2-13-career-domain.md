# Spec: V2-13 Career Domain

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Xây dựng Career Domain — miền phi học tập đầu tiên chứng minh kiến trúc đa miền của Personal OS theo 21-ROADMAP.md Wave E.

## 1. Bối cảnh & Mục tiêu

- Career Domain là bằng chứng thực thi đầu tiên cho khả năng mở rộng đa domain của Personal OS.
- Cung cấp:
  - `CareerProfile`: Vai trò mục tiêu, chức danh hiện tại, năm kinh nghiệm, ngành nghề, mức lương kỳ vọng.
  - `CareerExperience`: Lịch sử làm việc, công ty, vị trí, thành tựu.
  - `CareerGoal`: Mục tiêu nghề nghiệp, loại hình công ty, khung thời gian, kỹ năng yêu cầu.
  - `CareerSkillGap`: Phân tích khoảng cách kỹ năng dựa trên mục tiêu và mức độ thành thạo đọc từ `LearningReadModel`.
- **Gate Invariant:** Không query trực tiếp vào bảng nội bộ của Learning (`english.learning_progress`, etc.), mà luôn đọc qua `getLearningReadModel`.

## 2. Thiết kế kỹ thuật

- **DB Schema:** Migration `postgres/migrations/0047_career_domain.sql` tạo schema `career` với các bảng `career.profiles`, `career.experiences`, `career.goals`.
- **Contracts (`packages/core-contracts/career.ts`)**: Schema `CareerProfileSchema`, `CareerExperienceSchema`, `CareerGoalSchema`, `CareerSkillGapAnalysisSchema`.
- **Service (`packages/core-career/careerService.ts`)**: Quản lý hồ sơ, kinh nghiệm, mục tiêu và phân tích khoảng cách kỹ năng (`analyzeCareerSkillGap`).
- **API (`api/career.ts`)**: GET và POST endpoints auth-guarded và rate-limited.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/career.test.ts`, `packages/core-career/careerService.test.ts`.
- API tests: `api/career.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.

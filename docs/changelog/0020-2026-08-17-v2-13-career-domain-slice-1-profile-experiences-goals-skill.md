# V2-13 Career Domain — slice 1: profile, experiences, goals, skill gap & API (2026-08-17, PR #588 đã MERGE)

Hoàn thành Slice 1 cho V2-13 Career Domain:

- **Migration `0047_career_domain.sql`**: Tạo schema `career` với các bảng `career.profiles`, `career.experiences`, `career.goals` (optimistic locking version).
- **Career Domain Contracts (`packages/core-contracts/career.ts`)**: Định nghĩa `CareerProfileSchema`, `CareerExperienceSchema`, `CareerGoalSchema`, `CareerSkillGapAnalysisSchema`.
- **Career Service (`packages/core-career/careerService.ts`)**: Quản lý hồ sơ sự nghiệp, kinh nghiệm, mục tiêu và phân tích khoảng cách kỹ năng (`analyzeCareerSkillGap`). Tuân thủ Gate Invariant: đọc kỹ năng qua `LearningReadModel`, không query trực tiếp vào DB nội bộ của Learning.
- **API `/api/career`**: GET và POST endpoints auth-guarded và rate-limited cho profile, experiences, goals, skill_gap. Đăng ký trong `server.ts`.
- **Test suite**: 12 unit tests mới (`career.test.ts`, `careerService.test.ts`, `api/career.test.ts`), 103 route registration tests passed.

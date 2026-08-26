# V2-11 Learning Ownership Migration — slice 1: learning read model, companion domain injection & API (2026-08-17, PR #586 đã MERGE)

Hoàn thành Slice 1 cho V2-11 Learning Ownership Migration:

- **Learning Domain Contract (`packages/core-contracts/learningReadModel.ts`)**: Schema `LearningReadModelSchema` chuẩn hoá mô hình đọc cho Learning domain (direction, currentLevel, dailySpeed, dailyMinutes, onboarded, activeGoal, masterySummary, recentEvidenceCount, srsDueCount).
- **Learning Read Model Service (`packages/core-learner/learningReadModelService.ts`)**: Trích xuất và đóng gói trạng thái học tập từ các bảng nguồn sự thật, cung cấp hàm định dạng ngữ cảnh cho Context Engine (`formatLearningReadModelForContext`).
- **Companion Runtime Integration (`packages/core-personal/companionRuntime.ts`)**: Tự động tích hợp `LearningReadModel` vào `domainState` của `ContextEngine` khi hội thoại thuộc domain `learning`.
- **API `/api/learning-read-model`**: GET endpoint auth-guarded và rate-limited cho Companion / clients đọc trạng thái học tập mà không lộ cấu trúc lưu trữ nội bộ. Đăng ký trong `server.ts`.
- **Test suite**: 8 unit tests mới (`learningReadModel.test.ts`, `learningReadModelService.test.ts`, `api/learning-read-model.test.ts`), 99 route registration tests passed.

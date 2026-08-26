# V2-15 Work Domain — slice 1: projects, tasks, meetings, documents & API (2026-08-17, PR #590 đã MERGE)

Hoàn thành Slice 1 cho V2-15 Work Domain:

- **Migration `0048_work_domain.sql`**: Tạo schema `work` với các bảng `work.projects`, `work.tasks`, `work.meetings`, `work.documents` (optimistic locking version).
- **Work Domain Contracts (`packages/core-contracts/work.ts`)**: Định nghĩa `WorkProjectSchema`, `WorkTaskSchema`, `WorkMeetingSchema`, `WorkDocumentSchema`.
- **Work Service (`packages/core-work/workService.ts`)**: Quản lý projects, tasks, meetings và documents.
- **API `/api/work`**: GET, POST, PATCH endpoints auth-guarded và rate-limited. Đăng ký trong `server.ts`.
- **Test suite**: 15 unit tests mới (`work.test.ts`, `workService.test.ts`, `api/work.test.ts`), 104 route registration tests passed.

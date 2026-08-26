# V2-10 Decision Ledger + Outcome Loop — slice 1: persistence, outcome loop, review lifecycle & API (2026-08-17, PR #585 đã MERGE)

Hoàn thành Slice 1 cho V2-10 Decision Ledger + Outcome Loop:

- **Migration `0046_decision_records.sql`**: Bảng `personal.decision_records` (status `open | decided | review_due | reviewed | superseded`, optimistic locking version) và bảng `personal.decision_reviews_audit_log` (ghi nhận lịch sử thao tác `create`, `decide`, `record_outcome`, `mark_review_due`, `review`, `supersede`).
- **Decision Ledger Service (`packages/core-personal/decisionLedgerService.ts`)**: Lưu trữ và quản lý quyết định có cấu trúc gồm `problem`, `options`, `assumptions`/`evidence` (`EvidenceRef`), `tradeoffs`, `expectedOutcomes` và `actualOutcomes`. Hỗ trợ toàn diện vòng đời quyết định, review theo lịch hẹn (`review_at`) và bảo đảm bất biến: outcome observations không tự động ghi đè các facts/policies do người dùng chủ động tuyên bố.
- **API `/api/decision-ledger`**: GET (xem chi tiết / danh sách theo status & domain), POST (tạo quyết định mới), PATCH (decide, record_outcome, review, supersede với optimistic locking). Đăng ký trong `server.ts`.
- **Test suite**: 17 unit tests mới (`decisionLedgerService.test.ts` và `api/decision-ledger.test.ts`), 97 route registration tests passed.

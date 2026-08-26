# V2-08 ProposedAction & Tool Manifest Pipeline — slice 1: registry, policy gate, execution & audit (2026-08-17, PR #583 đã MERGE)

Hoàn thành Slice 1 cho V2-08 ProposedAction & Tool Manifest Pipeline:

- **Migration `0045_proposed_actions.sql`**: Bảng `personal.proposed_actions` (status `pending | confirmed | rejected | committed`, optimistic locking version) và bảng `personal.tool_execution_audit_log` (ghi nhận chi tiết tool_id, input/output payload, execution duration, status).
- **Tool Registry (`packages/core-personal/toolRegistry.ts`)**: Quản lý `ToolManifest` với sideEffect (`none | internal | external`), timeout, idempotent và audit policy (`learning.update_goal`, `profile.update_fact`, `memory.create_record`, `dictionary.lookup`).
- **ProposedAction Service (`packages/core-personal/proposedActionService.ts`)**: Thực hiện nguyên tắc Planning ≠ Execution ≠ State Mutation: đánh giá Personal Policy (`resolveAuthority`), từ chối lập tức nếu `DENY`, tự động thực thi nếu `AUTOMATE` và rủi ro thấp/vừa, giữ `pending` nếu rủi ro cao/critical hoặc cần confirmation; hỗ trợ `confirmAction` và `rejectAction` kèm khóa bi quan + phiên bản lạc quan.
- **API `/api/proposed-actions`**: GET (danh sách action / danh sách tools), POST (tạo proposal), PATCH (confirm/reject kèm expectedVersion). Đăng ký trong `server.ts`.
- **Test suite**: 16 unit tests mới (`proposedActionService.test.ts` và `api/proposed-actions.test.ts`), 93 route registration tests passed.

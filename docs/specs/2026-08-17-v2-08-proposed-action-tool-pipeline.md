# Spec: V2-08 ProposedAction & Tool Manifest Pipeline

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Thực thi nguyên tắc bất biến Planning ≠ Execution ≠ State Mutation (02-SYSTEM-ARCHITECTURE.md mục 3, 9, 10).

## 1. Bối cảnh & Mục tiêu

- Tách bạch đề xuất thay đổi state (ProposedAction) khỏi thực thi thực tế (Tool Execution) và lưu trữ trạng thái (State Mutation).
- Enforce Personal Policy gate (`resolveAuthority`): từ chối nếu `DENY`, tự động chạy nếu `AUTOMATE` với rủi ro thấp/vừa, giữ `pending` với rủi ro cao/critical.
- Audit trail chi tiết cho mọi lần gọi tool trong `personal.tool_execution_audit_log`.

## 2. Thiết kế kỹ thuật

- **DB Schema:** `personal.proposed_actions` và `personal.tool_execution_audit_log` (migration `0045_proposed_actions.sql`).
- **Tool Registry:** `packages/core-personal/toolRegistry.ts` định nghĩa Tool Manifests với sideEffect, idempotency, permissions.
- **Service:** `packages/core-personal/proposedActionService.ts` cung cấp `proposeAction`, `confirmAction`, `rejectAction`, `listProposedActions`.
- **API:** `api/proposed-actions.ts` (GET / POST / PATCH).

## 3. Validation & Testing

- Unit tests `packages/core-personal/proposedActionService.test.ts`.
- API tests `api/proposed-actions.test.ts`.
- Route registration test `api/routes-registered.test.ts`.

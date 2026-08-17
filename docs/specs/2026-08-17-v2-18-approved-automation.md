# Spec: V2-18 Approved Automation & Schedulers

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Xây dựng hệ thống Approved Automation cho Personal OS theo 21-ROADMAP.md Wave F.

## 1. Bối cảnh & Mục tiêu

- Cung cấp cơ chế cấp quyền tự động hóa có kiểm soát (`AutomationGrant`):
  - Kích hoạt theo lịch (`schedule`), sự kiện (`event`), hoặc thủ công (`manual`).
  - Hạn mức thực thi (`maxExecutions`, `executionBudget`) và thời hạn (`expiresAt`).
  - Vòng đời: `active`, `paused`, `revoked`, `exhausted`.
- Cơ chế ghi nhận biên lai hành động (`ActionReceipt`):
  - Minh bạch mọi thao tác tự động hóa với `status` (`success`, `failed`, `compensated`), thời lượng `durationMs`, input/output.
- Cơ chế bồi hoàn / xử lý lỗi (`compensation`/`retry`) khi tác vụ tự động thất bại.
- **Gate Invariant**: External side effects bắt buộc phải có `AutomationGrant` đang `active` hợp lệ hoặc sự xác nhận tường minh của người dùng — không có ungranted autonomy.

## 2. Thiết kế kỹ thuật

- **Database (`postgres/migrations/0051_approved_automation.sql`)**: Schema `automation` gồm:
  - `automation.grants`: id, person_id, capability_id, trigger_type, schedule_cron, event_pattern, max_executions, executions_count, status, expires_at, version.
  - `automation.triggers`: id, grant_id, person_id, trigger_type, payload, status, triggered_at.
  - `automation.receipts`: id, grant_id, person_id, capability_id, trigger_id, status, input, output, error_message, duration_ms, created_at.
- **Contracts (`packages/core-contracts/approvedAutomation.ts`)**:
  - `AutomationGrantSchema`, `AutomationTriggerSchema`, `ActionReceiptSchema`.
- **Service (`packages/core-automation/automationService.ts`)**:
  - Quản lý grants (tạo, tạm dừng, huỷ, kích hoạt lại).
  - Kiểm tra và tiêu thụ ngân sách thực thi (`consumeGrantBudget`) trong transaction an toàn.
  - Thực thi tác vụ tự động hóa (`executeAutomation`) và ghi biên lai (`recordReceipt`).
- **API (`api/automation.ts`)**:
  - GET, POST, PATCH endpoints auth-guarded và rate-limited. Đăng ký trong `server.ts`.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/approvedAutomation.test.ts`, `packages/core-automation/automationService.test.ts`, `api/automation.test.ts`.
- Coverage gate: branch coverage ≥ 90%, 0 lint warnings, build & typecheck 100% pass.

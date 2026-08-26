# V2-18 Approved Automation — slice 1: explicit grants, triggers, budgets, retries/compensation, action receipts (2026-08-17)

Hoàn thành Slice 1 cho V2-18 Approved Automation (Wave F):

- **Migration `0051_approved_automation.sql`**: Bảng `personal.automation_grants` (grants explicit, reviewAt bắt buộc, status lifecycle `active | paused | revoked | expired`, optimistic locking) và `personal.action_receipts` (append-only immutable receipts với unique idempotency key).
- **Automation Contracts (`packages/core-contracts/automation.ts`)**: `AutomationTriggerSchema` (`schedule | event | manual`), `AutomationBudgetSchema` (hourly/daily limit & cooldown), `AutomationCompensationSchema`, `AutomationGrantSchema`, `ActionReceiptSchema`.
- **Automation Service (`packages/core-personal/automationService.ts`)**: Quản lý vòng đời explicit grant (create, pause, resume, revoke), thực thi tự động (`executeAutomatedAction`) tuân thủ Personal Policy authority (chặn DENY lập tức), kiểm soát ngân sách/rate-limits (runs/hour, runs/day, cooldown), cơ chế retry và compensation tự động khi thất bại, ghi nhận `ActionReceipt` bất biến và chống trùng lặp theo idempotency key.
- **Gate Invariants**:
  1. Không có hành động tự động nào chạy ngoài `AutomationGrant` có hiệu lực (`active`, chưa hết hạn, chưa quá hạn `reviewAt`).
  2. Action Receipts là bất biến (append-only) và đảm bảo tính idempotent.
  3. Quyền `DENY` từ Personal Policy lập tức chặn mọi thực thi tự động.
- **API `/api/automation`**: GET (danh sách grants/receipts), POST (`create_grant`, `trigger`), PATCH (`pause`, `resume`, `revoke`) auth-guarded và rate-limited. Đăng ký trong `server.ts`.
- **Test suite & Coverage**: 3897 tests passed 100%, branch coverage 90.14% (statements 95.37%, lines 95.37%, functions 96.99%), build, typecheck, lint (0 warnings), format:check passed 100%.

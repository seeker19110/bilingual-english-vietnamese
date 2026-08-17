# Spec: V2-10 Decision Ledger + Outcome Loop

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Xây dựng Decision Ledger và Outcome Loop theo 02-SYSTEM-ARCHITECTURE.md mục 8 và 21-ROADMAP.md.

## 1. Bối cảnh & Mục tiêu

- Decision Ledger lưu trữ các quyết định có cấu trúc (DecisionRecord) gồm options, assumptions/evidence (EvidenceRef), tradeoffs, expected outcomes và actual outcome observations.
- Hỗ trợ scheduled review (`review_due`, `reviewed`, `superseded`).
- Invariant bất biến: Outcome observation không tự động ghi đè các facts/policies do người dùng chủ động tuyên bố (user-declared facts).

## 2. Thiết kế kỹ thuật

- **DB Schema:** Migration `postgres/migrations/0046_decision_records.sql` tạo bảng `personal.decision_records` và bảng audit `personal.decision_reviews_audit_log`.
- **Service:** `packages/core-personal/decisionLedgerService.ts` cung cấp `createDecision`, `decideDecision`, `recordOutcome`, `markReviewDueDecisions`, `reviewDecision`, `supersedeDecision`, `getDecision`, `listDecisions`.
- **API Handler:** `api/decision-ledger.ts` (GET / POST / PATCH).

## 3. Validation & Testing

- Unit tests: `packages/core-personal/decisionLedgerService.test.ts`.
- API tests: `api/decision-ledger.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.

# Spec: V2-16 Startup Domain

**Trạng thái:** Approved for implementation
**Ngày:** 2026-08-17
**Tác giả:** Antigravity AI
**Mục tiêu:** Xây dựng Bounded Context Startup Domain cho Personal OS theo 21-ROADMAP.md Wave E.

## 1. Bối cảnh & Mục tiêu

- Cung cấp các primitives quản lý startup: Ventures, Problems, Hypotheses, Evidence.
- **Gate Invariant:** model-generated market claims NEVER become facts without evidence/provenance.
  - ValidatedEvidence có trường `provenance` bắt buộc (min 1 char), không cho phép AI tự bịa bằng chuỗi rỗng.
  - Evidence tách biệt hoàn toàn khỏi Hypothesis — cần collect từ thực tế rồi mới được liên kết.

## 2. Thiết kế kỹ thuật

- **Database (`postgres/migrations/0049_startup_domain.sql`)**: Schema `startup` gồm:
  - `startup.ventures`: id, person_id, name, description, stage (lifecycle), version.
  - `startup.problems`: id, venture_id, person_id, statement, customer_segment, severity, evidence_count.
  - `startup.hypotheses`: id, venture_id, person_id, statement, hypothesis_type, status (unverified→supported/refuted/pivoted).
  - `startup.evidence`: id, venture_id, hypothesis_id, provenance (required!), findings, supports_hypothesis, collected_at.
- **Contracts (`packages/core-contracts/startup.ts`)**: `VentureSchema`, `ProblemSchema`, `HypothesisSchema`, `ValidatedEvidenceSchema`.
- **Service (`packages/core-startup/startupService.ts`)**: CRUD đầy đủ, hypothesis status lifecycle.
- **API (`api/startup.ts`)**: GET, POST, PATCH endpoints auth-guarded và rate-limited.

## 3. Validation & Testing

- Unit tests: `packages/core-contracts/startup.test.ts`, `packages/core-startup/startupService.test.ts`, `api/startup.test.ts`.
- Route registration test: `api/routes-registered.test.ts`.

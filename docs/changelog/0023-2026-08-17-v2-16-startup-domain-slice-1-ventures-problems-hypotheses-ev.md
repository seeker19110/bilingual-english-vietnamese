# V2-16 Startup Domain — slice 1: ventures, problems, hypotheses, evidence & API (2026-08-17, PR #591 đã MERGE)

Hoàn thành Slice 1 cho V2-16 Startup Domain:

- **Migration `0049_startup_domain.sql`**: Schema `startup` với các bảng `ventures`, `problems`, `hypotheses`, `evidence` (provenance bắt buộc).
- **Startup Domain Contracts (`packages/core-contracts/startup.ts`)**: `VentureSchema`, `ProblemSchema`, `HypothesisSchema`, `ValidatedEvidenceSchema`.
- **Startup Service (`packages/core-startup/startupService.ts`)**: Quản lý vòng đời venture, hypothesis status lifecycle, ghi evidence với provenance bắt buộc.
- **Gate Invariant**: `ValidatedEvidenceSchema.provenance` min 1 char — AI claims không thể trở thành facts khi thiếu provenance.
- **API `/api/startup`**: GET, POST, PATCH auth-guarded và rate-limited. Đăng ký trong `server.ts`.

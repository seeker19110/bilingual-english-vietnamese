# V2-06 Personal Knowledge Fabric — slice 1: persistence, candidate pipeline & API (2026-08-17, PR #581 đã MERGE)

Hoàn thành Slice 1 cho V2-06 Personal Knowledge Fabric:

- **Migration `0044_personal_memory.sql`**: Bảng `personal.memory_records` phân theo 5 namespace (`semantic`, `episodic`, `preference`, `commitment`, `domain`), sensitivity level (`public`, `personal`, `sensitive`, `restricted`), retention timestamp (`retain_until`), versioning và audit log append-only `personal.memory_records_audit_log`.
- **Candidate Pipeline & Service (`packages/core-personal/memoryService.ts`)**: Triển khai pipeline chuẩn: Schema Validation → Dedup / Conflict detection → Sensitivity classification (restricted đòi `user_declared`) → Confidence policy (threshold < 0.60 reject, 0.60-0.80 ask_user) → Outcome `ACCEPT | MERGE | REJECT | ASK_USER | EXPIRE`. Hỗ trợ merge subsumption, retention purge và GDPR deletion.
- **API `/api/memories`**: Auth-guarded, rate-limited, Zod validation, hỗ trợ GET (lọc namespace, includeExpired), POST (evaluate/ingest), PATCH (expire kèm version check), DELETE (privacy purge). Đăng ký đầy đủ trong `server.ts`.
- **Test suite**: 26 unit tests mới (`memoryService.test.ts` và `api/memories.test.ts`), 89 route registration tests passed.

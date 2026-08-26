# V2-19 Platform Evaluation and Hardening (2026-08-17)

Hoàn thành V2-19 Platform Evaluation & Hardening (Wave F):

- **Spec & Documentation**: `docs/specs/2026-08-17-v2-19-platform-evaluation-hardening.md` (Approved for implementation) và `docs/research/eval-v2-19-evidence.md` (báo cáo thực nghiệm đầy đủ).
- **Deterministic Eval Suites (`npm run eval:v2:*`)**:
  - `eval:v2:routing`: Đo routing accuracy trên 50 fixture tiếng Việt/Anh → đạt **98.00%** (49/50, target $\ge 85\%$).
  - `eval:v2:context`: Đo context relevance, token budget, DENY-bypass (=0) và sensitive-leakage (=0) trên 20 fixture → đạt **100.00%**.
  - `eval:v2:memory`: Đo memory classification (100%), false-memory rate (**0.00%**, target $<5\%$), correction rate (**100.00%**) trên 30 fixture.
  - `eval:v2:permissions`: Đo authority resolution (100%), DENY bypasses (**0**) trên 40 fixture.
- **Red-Team Adversarial Suites (`eval:v2:red-team`)**:
  - 30 kịch bản tấn công: 10 Prompt Injection, 10 Tool/State Abuse, 10 Sensitive Data Leakage → **100.00% blocked (30/30)**.
- **Privacy Export & Cascade Erasure (`eval:v2:privacy`)**:
  - Migration `0052_person_erasure_log.sql`: Bảng `platform.person_erasure_log` append-only ghi log yêu cầu xoá dữ liệu toàn diện.
  - Service `personErasureService.ts`: `exportPersonData` xuất dữ liệu cả 13 schema; `erasePersonData` cascade delete atomic trong single transaction across all schemas.
  - API `GET /api/persons?action=export` và `DELETE /api/persons?action=full_erase` (auth + rate-limited).
  - 7/7 privacy drills passed 100% (export completeness, zero-residual erase, scoped isolation).
- **Test suite & Coverage**: 259 test files, **3927 tests passed 100%**, branch coverage **90.23%** (statements 95.43%, lines 95.43%, functions 97.00%), build, typecheck, lint (0 warnings), format:check passed 100%.

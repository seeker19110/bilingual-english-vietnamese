# English Tutor OS — Backlog thực thi theo phase

> Backlog này không phải báo cáo tiến độ. Dùng cùng [`OS_EXECUTION_GUIDE.md`](./OS_EXECUTION_GUIDE.md)
> và [`OS_COMPLETE_IMPLEMENTATION_PLAN.md`](./OS_COMPLETE_IMPLEMENTATION_PLAN.md). Phase chỉ chuyển
> `accepted` khi `PROGRESS.md` có evidence, owner và DoD đầy đủ.

| Phase                       | Outcome nghiệm thu                       | Deliverable / contract                                                                                      | Phụ thuộc và cổng mở phase kế                           |
| --------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 00 Research baseline        | Bản đồ ứng dụng/rủi ro tái lập được      | inventory, trace 8 critical flows, CI/E2E/integration baseline, AI cost/latency sample, risk register owner | baseline sign-off; không subsystem critical vô chủ      |
| 01 Foundation               | Biên config/DB/AI/error/log ổn định      | typed config critical paths, transaction/outbox, provider gateway, error envelope, secret redaction         | Phase 00 accepted; payment/usage transaction audit xanh |
| 02 Contract OS              | UI/API/domain versioned                  | schema registry, compatibility fixtures, deprecation policy                                                 | foundation contract + consumer migration plan           |
| 03 Learner OS               | Learner profile là source of truth       | profile/goals/preferences/consent/merge policy                                                              | Contract OS + migration rehearsal                       |
| 04 Skill OS                 | Taxonomy skill truy vấn được             | skill IDs, prerequisites, proficiency scale, validation                                                     | Learner OS + curriculum mapping                         |
| 05 Knowledge OS             | Knowledge item versioned/có nguồn        | schema, CEFR/citation/license, deprecation                                                                  | Skill taxonomy + content validation                     |
| 06 Evidence engine          | Kết quả học tạo evidence bất biến        | evidence/provenance/confidence, outbox, retention                                                           | learner/skill/knowledge IDs ổn định                     |
| 07 Error memory             | Lỗi tái diễn được dùng an toàn           | taxonomy, dedupe, expiry, learner correction view                                                           | Evidence + privacy approval                             |
| 08 Mastery engine           | Mastery giải thích/tái lập               | formula version, recompute job, comparison dashboard                                                        | Evidence/error memory + golden fixtures                 |
| 09 Diagnostic engine        | Baseline năng lực đáng tin               | adaptive selection, calibration metrics                                                                     | Mastery + assessment item bank                          |
| 10 Assessment engine        | Chấm có rubric/audit                     | rubric, scoring, override, reliability report                                                               | Evidence/diagnostic + AI schema validation              |
| 11 Workflow OS              | Luồng học resume an toàn                 | state machine, command/idempotency, retry/history                                                           | Event/outbox + assessment                               |
| 12 Tutor policy             | Tutor decision minh bạch                 | policy I/O, priority, explain trace, flags                                                                  | learner/mastery/workflow read models                    |
| 13 Tutor state machine      | Session không race/lẫn state             | transitions, persistence, recovery/cancel                                                                   | Workflow + idempotency                                  |
| 14 Tutor agent              | Agent least privilege                    | tool allowlist/schema/budget/audit                                                                          | policy/state machine/provider gateway                   |
| 15 Correction engine        | Sửa lỗi nhất quán                        | correction schema, confidence, feedback eval set                                                            | Error memory + rubric                                   |
| 16 Difficulty engine        | Difficulty được hiệu chỉnh               | model/version, calibration, fairness slices                                                                 | Evidence volume + diagnostics                           |
| 17 Curriculum OS            | Curriculum graph/versioned               | nodes/edges, prerequisites, content release                                                                 | Skills/knowledge/difficulty                             |
| 18 Curriculum agent         | Sequence có ràng buộc                    | planner schema, deterministic fallback, trace                                                               | Curriculum graph + policy                               |
| 19 Adaptive SRS             | Ôn tập tái lập/cá nhân hóa               | scheduler version, simulations, old-SRS migration                                                           | Mastery/evidence + backfill validation                  |
| 20 Daily plan               | Plan ngày có giải thích                  | timezone/capacity/replan/cancel contract                                                                    | SRS + curriculum planner                                |
| 21 Memory OS                | Memory có scope/retention                | types, read/write policy, consent/delete/export                                                             | privacy + identity                                      |
| 22 Memory agent             | Memory agent kiểm soát được              | retrieval, write proposal, audit, correction UI                                                             | Memory OS + permissions                                 |
| 23 Model router             | Chọn model theo quality/cost             | routing policy, budget/fallback, eval telemetry                                                             | provider gateway + benchmark                            |
| 24 Agent router             | Điều phối agent an toàn                  | delegation/deadline/cancel/merge/no-loop                                                                    | tool permissions + observability                        |
| 25 Multi-agent conflict     | Mâu thuẫn audit được                     | provenance, tie-break, escalation policy                                                                    | Agent router + evidence                                 |
| 26 Agent permissions        | Least privilege thật                     | permission matrix, enforcement/revoke/audit                                                                 | agent inventory + identity                              |
| 27 Voice intelligence       | Chọn voice đúng quyền/task               | capability registry, locale/cache/fallback metric                                                           | entitlement/TTS/consent                                 |
| 28 Pronunciation profile    | Profile phát âm riêng tư/có evidence     | phoneme schema, confidence, retention/correction                                                            | assessment + voice policy                               |
| 29 Event OS                 | Event platform đáng tin                  | outbox, consumer registry, replay/DLQ/schema evolution                                                      | transactions + observability                            |
| 30 Job OS                   | Job retry/visibility được                | job/lease/idempotency/dashboard                                                                             | Event OS + deploy runbook                               |
| 31 Engineering intelligence | Quyết định theo signal                   | delivery/incident metrics, dashboard                                                                        | CI/deploy telemetry + ownership                         |
| 32 AI benchmark             | AI quality đo trước/sau                  | datasets, evaluator, threshold, regression report                                                           | provider gateway + eval policy                          |
| 33 Learning outcome         | Đo outcome không chỉ activity            | cohort/baseline/attribution metrics                                                                         | evidence/mastery/assessment quality                     |
| 34 Experimentation OS       | A/B test an toàn                         | assignment/exposure/guardrail/analysis                                                                      | Event OS + outcome metrics                              |
| 35 Observability            | SLO/alert/runbook hoạt động thật         | central logs/traces/metrics, drills                                                                         | all key instrumentation                                 |
| 36 Cost intelligence        | Cost có budget/anomaly control           | cost ledger, budgets, alerts, router feedback                                                               | usage + router telemetry                                |
| 37 Learner UI               | UI giải thích được learner state         | IA, a11y, empty/error/loading states                                                                        | stable read models                                      |
| 38 Backward compatibility   | Đổi kiến trúc không phá user cũ          | compatibility matrix, dual read/write, telemetry                                                            | contracts/migrations/release plan                       |
| 39 Data migration           | Data chuyển kiểm chứng/khôi phục được    | dry run, checksums, reconciliation, recovery runbook                                                        | compatibility + production backup                       |
| 40 Security                 | Threat model/control kiểm chứng          | asset/authz, key rotation, pentest, incident playbook                                                       | all exposed flows mapped                                |
| 41 Test matrix              | Coverage theo rủi ro                     | scenario matrix, test env contract, flaky budget                                                            | critical-flow inventory                                 |
| 42 Production hardening     | Chịu lỗi thường gặp                      | load/chaos, backup-restore, capacity/rollback drills                                                        | observability/security/jobs                             |
| 43 Scale                    | Scale có số đo/giới hạn                  | load model, bottleneck plan, cost envelope                                                                  | hardening SLO + representative load                     |
| 44 Architecture governance  | Kiến trúc có accountability              | ADR lifecycle, owner/dependency/review policy                                                               | engineering intelligence metrics                        |
| 45 Final audit              | Full learner loop đủ điều kiện phát hành | E2E evidence, security/privacy/cost/outcome audit, accepted risks                                           | all required phase accepted or signed waiver            |

## Definition of Ready theo nhóm rủi ro

| Nhóm                        | Phải có trước code                                           | Bằng chứng accepted thêm                                          |
| --------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Payment, entitlement, usage | transaction/state diagram, idempotency, reconciliation owner | concurrent/retry integration test, alert `paid-but-ungranted=0`   |
| Auth, admin, personal data  | threat model, authz matrix, retention/consent                | negative authorization tests, audit trail, security review        |
| AI/model/prompt             | eval set, budget, fallback/cancel policy                     | regression comparison, cost/latency report, provider failure test |
| DB/migration                | row-count/checksum, backup/recovery, rollback                | dry run, migration test DB, post-deploy reconciliation            |
| UI learner flow             | accessibility, empty/loading/error, analytics                | E2E against actual API contract                                   |

## Hiện trạng khởi điểm

Phase 00 là `in_progress`. Phase 01 có foundation đã vào code nhưng chưa đạt acceptance vì critical paths chưa migrate toàn bộ và transaction/payment audit còn lỗi mở. Phase 02–45 là `not_started` cho tới khi `PROGRESS.md` có bằng chứng khác.

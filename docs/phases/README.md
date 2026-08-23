> **[2026-08-23 — THAM KHẢO, KHÔNG PHẢI CAM KẾT LỘ TRÌNH]** Người dùng chốt một nguồn thi
> hành duy nhất: `PROGRESS.md` (trạng thái thật) + `docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md`
> (kiến trúc + trình tự S3→S6/N1→N5). 46 file phase trong thư mục này là kho tham khảo
> nghiệm thu khi làm tới phần tương ứng — KHÔNG tự mở phase, không coi đây là backlog đang chạy.

# English Tutor OS — Phase Specifications

Read `../MASTER_SPEC.md` first. These files state the architectural intent of each phase; before
implementation, use the repository-wide [execution guide](../OS_EXECUTION_GUIDE.md) and
[phase backlog](../OS_PHASE_BACKLOG.md) for contracts, rollout/rollback, test evidence and
acceptance gates. The detailed sequence through project completion is in the
[complete implementation plan](../OS_COMPLETE_IMPLEMENTATION_PLAN.md). Actual status is recorded
only in [`PROGRESS.md`](../../PROGRESS.md).

| Phase | Specification            |
| ----- | ------------------------ |
| 00    | research-baseline        |
| 01    | foundation-os            |
| 02    | contract-os              |
| 03    | learner-os               |
| 04    | skill-os                 |
| 05    | knowledge-os             |
| 06    | evidence-engine          |
| 07    | error-memory             |
| 08    | mastery-engine           |
| 09    | diagnostic-engine        |
| 10    | assessment-engine        |
| 11    | workflow-os              |
| 12    | tutor-policy-engine      |
| 13    | tutor-state-machine      |
| 14    | tutor-agent              |
| 15    | correction-engine        |
| 16    | difficulty-engine        |
| 17    | curriculum-os            |
| 18    | curriculum-agent         |
| 19    | adaptive-srs             |
| 20    | daily-plan               |
| 21    | memory-os                |
| 22    | memory-agent             |
| 23    | model-router             |
| 24    | agent-router             |
| 25    | multi-agent-conflict     |
| 26    | agent-permissions        |
| 27    | voice-intelligence       |
| 28    | pronunciation-profile    |
| 29    | event-os                 |
| 30    | job-os                   |
| 31    | engineering-intelligence |
| 32    | ai-benchmark             |
| 33    | learning-outcome         |
| 34    | experimentation-os       |
| 35    | observability            |
| 36    | cost-intelligence        |
| 37    | learner-ui               |
| 38    | backward-compatibility   |
| 39    | data-migration           |
| 40    | security                 |
| 41    | test-matrix              |
| 42    | production-hardening     |
| 43    | scale                    |
| 44    | architecture-governance  |
| 45    | final-audit              |

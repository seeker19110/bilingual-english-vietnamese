# English Tutor OS v1 — FROZEN

> Status: **FROZEN / LEGACY BASELINE** từ 2026-08-15.

## Quyết định

English Tutor OS v1 không còn là target architecture cấp cao của dự án. Toàn bộ tài liệu v1 (`OS_EXECUTION_GUIDE.md`, `OS_PHASE_BACKLOG.md`, `OS_COMPLETE_IMPLEMENTATION_PLAN.md`, `docs/phases/00..45-*`) được giữ nguyên để làm lịch sử thiết kế, bằng chứng đã nghiên cứu và nguồn tham chiếu cho migration.

Không tiếp tục mở phase mới theo v1 nếu phase đó tạo thêm coupling vào learner-centric architecture. Chỉ được chạm tài liệu/code v1 khi:

1. sửa lỗi production hiện tại;
2. hoàn tất/migration phần đã triển khai dở nhưng cần để giữ ổn định;
3. trích xuất capability/invariant tái sử dụng trong V2;
4. ghi chú mapping/compatibility phục vụ migration.

## Lý do đóng băng

Phạm vi sản phẩm đã vượt khỏi English/language learning. `donghanhcungban` hướng tới đồng hành cùng người dùng ở nhiều mặt của cuộc sống: học tập, nghề nghiệp, công việc, khởi nghiệp và các domain mới trong tương lai. Kiến trúc learner-centric không còn phù hợp làm root model toàn hệ thống.

## Phần v1 tiếp tục có giá trị

- additive migration, dual-read/write, feature flag, canary, rollback/recovery;
- typed/versioned contracts;
- deterministic domain engines;
- evidence before state change;
- AI/agent proposes, policy/domain validates and commits;
- provider abstraction;
- event/outbox/idempotency/audit;
- test matrix, observability, security và acceptance gates;
- Learning-specific skill/knowledge/evidence/mastery/SRS/assessment/voice architecture.

## Ownership mới

- Learner OS → `Personal World Model` + `Learning Profile`.
- Skill/Knowledge/Evidence/Mastery/Diagnostic/Assessment/SRS → `Learning Domain`.
- Memory OS → `Personal Knowledge Fabric` + domain memory.
- Agent OS → `Companion Runtime` + `Capability Registry`; agent chỉ là execution mode.
- Workflow/Event/AI/Observability → platform services dùng chung.

## Source of truth mới

- Master architecture: `docs/MASTER_SPEC.md` — V2.
- Migration: `docs/architecture-v2/20-MIGRATION-V1-V2.md`.
- Roadmap: `docs/architecture-v2/21-ROADMAP.md`.

V1 không bị xóa và không bị rewrite để giữ provenance của các quyết định cũ.

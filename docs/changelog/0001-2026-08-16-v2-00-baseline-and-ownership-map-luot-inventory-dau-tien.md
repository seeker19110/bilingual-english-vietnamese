# V2-00 — Baseline and ownership map, lượt inventory đầu tiên (2026-08-16)

`docs/architecture-v2/21-ROADMAP.md` (V2, chính thức từ PR #542/`e54f102`, thay cho lộ trình
English Tutor OS 46-phase cũ nay đã frozen ở `docs/legacy/ENGLISH_TUTOR_OS_V1_FROZEN.md`) yêu cầu
đóng V2-00 trước khi refactor. Đã làm lượt đầu: đọc trực tiếp repo (không suy đoán) để liệt kê 31
route `api/*.ts`, toàn bộ bảng Postgres (schema.sql + 42 migration) map theo `platform | learning`,
provider AI/TTS/STT/thanh toán, 18 file `packages/core-contracts/` đã có từ Phase 02 (v1) đối chiếu
với danh sách contract V2-02 cần (Person/PersonalFact/Goal/LifeGraphNode.../ConsentGrant/
PersonalPolicy/DecisionRecord...) — phần lõi "Personal OS" (Person, PersonalFact, ConsentGrant,
PersonalPolicy, DecisionRecord, LifeGraph) **chưa có gì**, chỉ Phase 01 "Foundation OS" (logger,
error, config, transaction helper) là tái dùng được ngay. Tài liệu:
`docs/architecture-v2/V2-00-BASELINE-OWNERSHIP-MAP.md`. **CHƯA đóng V2-00** — còn thiếu trace 8
critical flows, risk register có owner, baseline latency/cost sản xuất thật, đọc kỹ `apps/hub/`,
và đối chiếu field-by-field contract đã có với đặc tả V2-02. Việc tiếp theo hợp lý: hoặc làm tiếp
phần còn thiếu của V2-00, hoặc (nếu người dùng ưu tiên) nhảy thẳng vào V2-01 domain-boundary ADR
dựa trên inventory này — cần người dùng chọn hướng trước khi mở rộng phạm vi, vì đây là quyết định
kiến trúc, không phải việc cơ học.

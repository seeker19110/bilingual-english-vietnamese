# V2-02 (lượt trước) — field-by-field contract diff + gap list (2026-08-16, phần diff)

`docs/architecture-v2/V2-02-CONTRACT-DIFF.md` — đọc toàn bộ 18 contract v1 hiện có
(`packages/core-contracts/*.ts`, tất cả khoá `learnerId`, English Tutor OS Phase 02/03 đã
frozen), đối chiếu 13 contract V2-02 mục tiêu: **9 hoàn toàn mới, không xung đột**; **1 xung đột
tên thật** — `Goal` v1 (mục tiêu luyện tập hàng ngày, `learnerId`) khác hoàn toàn `Goal` V2-02
(node Life Graph, `personId`, có edge) — 3 phương án nêu ra (đổi tên bên nào, hoặc coi v1 là
adapter/read-view từ V2-02), chưa tự chọn; **3 gần trùng tên khác scope**
(Memory/MemoryRecord, AgentManifest/CapabilityManifest, EventEnvelope/DomainEvent) — riêng ca
EventEnvelope/DomainEvent đề xuất DÙNG THẲNG EventEnvelope có sẵn, không viết DomainEvent mới
(duy nhất trong 13 contract có thể port thẳng). Gap list 10 contract trắng hoàn toàn, trong đó
`PersonalFact`/`DecisionRecord` đã có interface sẵn ở `02-SYSTEM-ARCHITECTURE.md` (việc cơ học
khi viết), 8 contract còn lại cần owner tham gia thiết kế field. **Không viết code contract
nào** — đúng phạm vi M3/S1 là diff-only, đúng guardrail "không tự quyết port/viết mới khi xung
đột — phải hỏi owner". 4 câu hỏi cụ thể cần owner trả lời trước khi có PR viết contract thật, xem
`V2-02-CONTRACT-DIFF.md` mục 4.

**M1/S4 (latency/cost production thật) vẫn WAITING** — không có quyền SSH/credential VPS trong
phiên làm việc từ xa. Đã gửi owner bộ lệnh cụ thể cần chạy trên VPS (PM2 status/logs, Postgres
`pg_stat_user_tables`, Sentry Performance tab 30 ngày, billing dashboard từng AI provider) và dán
kết quả lại — chưa nhận được, đang chờ.

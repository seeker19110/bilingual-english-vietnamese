# Migration — English Tutor OS v1 → Đồng Hành Platform V2

## Mục tiêu

Chuyển kiến trúc từ learner-centric sang person-centric mà không rewrite production app, không làm mất dữ liệu, không làm gián đoạn Learning hiện tại và không tạo abstraction rỗng.

## Nguyên tắc migration

1. **Strangler migration, không big-bang.** V1 tiếp tục phục vụ production trong lúc V2 được dựng song song.
2. **Additive trước destructive.** Schema/table/contract mới được thêm trước; không rename/drop source-of-truth cũ trong cùng bước.
3. **Một ownership tại một thời điểm.** Mỗi entity phải có owner rõ ràng trong giai đoạn chuyển tiếp.
4. **Dual-read/write có thời hạn.** Chỉ dùng khi cần so sánh old/new; mọi dual path phải có metric mismatch và ngày kết thúc.
5. **Shadow trước cutover.** Model/engine V2 tính song song, không ảnh hưởng user state cho đến khi đạt acceptance gate.
6. **Feature flag + canary.** Cutover theo cohort nhỏ, có rollback/recovery procedure.
7. **Không migrate data chỉ để đẹp kiến trúc.** Chỉ migrate khi capability thật cần V2 ownership.

## Mapping ownership

| V1                  | V2 owner                                  | Migration                            |
| ------------------- | ----------------------------------------- | ------------------------------------ |
| learner profile     | Personal World Model + Learning Profile   | tách field global/domain; dual-read  |
| learner goals       | Life Graph / Goal view                    | backfill goal node + provenance      |
| learner preferences | Personal World Model                      | phân scope global vs learning        |
| learner consent     | Consent/Permission Platform               | purpose/scope/version hóa            |
| skills/knowledge    | Learning Domain                           | giữ IDs bền vững, đổi ownership      |
| learning evidence   | Learning Domain                           | giữ append-only/provenance           |
| mastery             | Learning Domain                           | không đưa lên Personal Core          |
| error memory        | Learning Domain memory                    | expose summary qua contract          |
| generic memory      | Knowledge Fabric                          | phân namespace/sensitivity/retention |
| workflow            | Platform Workflow                         | migrate adapter dần                  |
| agent manifest      | Capability Registry / Agent execution     | capability-first                     |
| AI provider         | AI Platform                               | giữ abstraction, bỏ hard-code domain |
| voice               | shared capability + Learning owner policy | không bắt buộc thành core domain     |

## Biên dữ liệu mới

### Personal World Model

Chỉ chứa hoặc expose các fact/inference có tính cross-domain. Learning-specific mastery, CEFR, SRS và assessment không được copy thành authoritative fields ở core.

### Life Graph

Backfill các goal hiện tại thành node `Goal`. Không vội graph hóa mọi entity cũ. Chỉ thêm edge khi có semantic relationship thật và consumer thật.

### Knowledge Fabric

Không chuyển toàn bộ transcript/history vào một bảng memories. Trước tiên tạo contract/provenance/sensitivity/retention và adapter retrieval từ nguồn cũ.

## Migration theo vertical slice

### Slice A — Person identity + global preferences

- tạo contract `Person`, `PersonalFact`, `Preference`;
- map `profiles` hiện tại;
- dual-read và mismatch report;
- không đổi login/auth semantics;
- cutover read trước write.

### Slice B — Goals

- tạo `Goal` + typed edges tối thiểu;
- backfill learning goals;
- Goal Engine sở hữu mutation mới;
- Learning chỉ giữ learning plan/mastery liên quan.

### Slice C — Memory/context

- thêm memory candidate pipeline;
- provenance/confidence/sensitivity/retention bắt buộc;
- Context Builder đọc theo purpose + permission;
- user có thể inspect/correct/delete memory trước khi tự động hóa sâu.

### Slice D — Capability registry

- đăng ký các capability Learning đang chạy thật;
- route qua registry nhưng giữ handler cũ phía sau adapter;
- chỉ chuyển capability mới sang runtime V2 sau khi telemetry/rollback có đủ.

### Slice E — Companion runtime

- intent/context/planning/policy/capability routing;
- planning không trực tiếp mutate state;
- state proposal qua domain engine;
- shadow routing trước khi phục vụ user.

### Slice F — Domain thứ hai

Career là domain kiểm chứng kiến trúc. V2 chưa được coi là thành công nếu chỉ chạy Learning.

## Những thứ KHÔNG làm trong migration đầu

- không rename repo ngay;
- không move hàng loạt directory;
- không microservice hóa;
- không graph database chỉ vì có Life Graph;
- không vectorize toàn bộ dữ liệu cá nhân;
- không tạo hàng chục agent;
- không thay toàn bộ API response cũ;
- không drop schema v1 trước retention window.

## Acceptance gate cho mỗi cutover

- old/new mismatch trong ngưỡng đã chốt;
- cross-user authorization test xanh;
- consent revoke test xanh;
- retry/idempotency/concurrency test xanh;
- audit truy được nguồn thay đổi;
- production metric không regression;
- rollback/recovery rehearsal thành công;
- `PROGRESS.md` và ADR được cập nhật trong cùng PR thực thi.

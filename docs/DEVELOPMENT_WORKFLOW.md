# Quy trình phát triển từ ý tưởng đến sản phẩm

Đây là nguồn sự thật cho cách đưa một thay đổi của **donghanh** từ ý tưởng đến production.
Mục tiêu là thay đổi nhỏ, truy vết được, có bằng chứng kiểm thử và rollback được.

## 1. Luồng chuẩn

| Cổng | Đầu vào | Việc bắt buộc | Đầu ra |
| --- | --- | --- | --- |
| Idea | Vấn đề hoặc cơ hội | Nêu người dùng, pain point, kết quả mong muốn và cách đo | Feature issue |
| Spec | Feature issue | Chốt phạm vi/non-goals, acceptance criteria, UX/API/data, rủi ro và rollout | Issue đạt DoR |
| Plan | Spec sẵn sàng | Tách lát dọc nhỏ, thứ tự phụ thuộc, test plan, migration/rollback | Checklist thực thi |
| Build | Issue đã duyệt | Nhánh riêng, commit nhỏ, test cùng code, cập nhật tài liệu | Draft PR |
| Verify | Draft PR | CI, self-review, security/privacy, a11y, impact map, manual smoke | PR đạt DoD |
| Release | PR được duyệt | Squash merge, theo dõi deploy; tag phiên bản khi cần release mốc | Bản phát hành |
| Observe | Đã release | Kiểm health/error/cost/critical flow; rollback nếu vượt ngưỡng | Issue đóng hoặc follow-up |

Không nhảy thẳng từ Idea sang code với thay đổi ảnh hưởng kiến trúc, dữ liệu, auth, payment,
entitlement, usage accounting, AI provider/cost hoặc hành vi production.

## 2. Definition of Ready (DoR)

Một issue chỉ sẵn sàng để code khi có:

- vấn đề và nhóm người dùng cụ thể;
- outcome đo được, không chỉ mô tả giải pháp;
- acceptance criteria kiểm thử được;
- scope và non-goals;
- dependency/owner rõ ràng;
- UX states hoặc API/data contract khi có liên quan;
- phân loại rủi ro và kế hoạch test;
- rollout, migration và rollback cho thay đổi production/data;
- không còn quyết định sản phẩm hoặc kiến trúc quan trọng bị bỏ ngỏ.

Nếu thiếu một mục ảnh hưởng cách triển khai, giữ issue ở trạng thái discovery.

## 3. Thiết kế và chia nhỏ

Ưu tiên lát dọc hoàn chỉnh có giá trị cho người dùng. Mỗi PR nên review được trong một lần và
không trộn refactor không liên quan.

Với thay đổi lớn, issue cha giữ outcome; issue con lần lượt đi qua contract/migration, backend,
frontend, telemetry và rollout. Dùng feature flag hoặc rollout tương thích ngược khi không thể
phát hành nguyên tử.

Trước khi sửa hotspot, chạy:

```bash
npm run codemap -- impact <file>
```

Ghi các consumer bị ảnh hưởng vào test plan của PR.

## 4. Ma trận kiểm thử theo rủi ro

| Thay đổi | Bằng chứng tối thiểu |
| --- | --- |
| Docs/config | Prettier file đổi, `git diff --check` |
| Logic thuần | Typecheck, lint, unit test nhắm mục tiêu và full unit gate |
| UI/routing/a11y | Các gate trên + Playwright + axe + kiểm mobile/theme liên quan |
| API/auth/data | Các gate trên + integration test với PostgreSQL disposable, negative/authorization cases |
| Payment/entitlement/usage | Concurrent/retry/idempotency tests, failure recovery và reconciliation |
| Prompt/model AI | Eval tutor so với baseline, token/cost/latency và fallback |
| Migration | Chạy mới + chạy lặp, verify query, backward-compatible rollout và recovery procedure |

Không dùng secret, dữ liệu thật hoặc provider trả phí trong CI.

## 5. Nhánh, commit và PR

- Nhánh: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`, `refactor/<issue>-<slug>`.
- Commit: Conventional Commits, một thay đổi logic mỗi commit.
- Mở draft PR sớm và dùng `Closes #123` để liên kết issue.
- PR mô tả scope, bằng chứng validation, rủi ro, migration/rollback và ảnh hưởng người dùng.
- Tiêu đề PR theo Conventional Commits; squash merge giữ lịch sử `main` rõ ràng.
- Không tự merge khi có review chưa giải quyết hoặc required check chưa xanh.

## 6. Definition of Done (DoD)

- acceptance criteria hoàn tất và có bằng chứng;
- test mới chứng minh hành vi mới/bug fix; tất cả gate liên quan xanh;
- đã self-review diff và kiểm impact map;
- input/error/authorization/privacy được xử lý;
- không có secret, debug log, generated output hoặc file ngoài phạm vi;
- tài liệu, contract, migration và observability được cập nhật;
- có rollout/rollback rõ ràng; breaking change được gọi tên;
- PR không có câu hỏi/blocker chưa giải quyết.

## 7. Merge, release và quan sát

Mặc định squash merge sau khi required checks xanh. Deploy production vẫn do `deploy.yml`
thực hiện khi merge vào `main`.

Dùng tag SemVer khi cần một mốc phát hành:

- PATCH: bug fix tương thích ngược;
- MINOR: tính năng tương thích ngược;
- MAJOR: breaking change có migration/communication plan.

Push tag `vX.Y.Z` sẽ tạo GitHub Release với generated notes. Tag không thay thế approval deploy.

Sau deploy, kiểm critical flow bị ảnh hưởng, Sentry/error rate, latency và chi phí provider. Nếu
health check hoặc critical flow thất bại, ưu tiên rollback/revert rồi điều tra trong issue mới.

## 8. Trách nhiệm

| Vai trò | Trách nhiệm |
| --- | --- |
| Product owner | Outcome, ưu tiên, acceptance criteria, quyết định scope |
| Implementer | Thiết kế, code, test, migration, self-review, bằng chứng |
| Reviewer | Correctness, security/privacy, operability, maintainability |
| Release owner | Go/no-go, theo dõi deploy, xác minh production và rollback |

Một người có thể giữ nhiều vai trò, nhưng phải đi qua đầy đủ các cổng và để lại bằng chứng trong
issue/PR.

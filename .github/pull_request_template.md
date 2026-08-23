## Tóm tắt

-

## Issue / outcome

Closes #

## Research / spec

<!-- BẮT BUỘC với feat: link đặc tả đã Approved for implementation, đặt ở MỘT trong hai nơi:
       docs/specs/<yyyy-mm-dd>-<slug>.md   — spec theo tính năng
       docs/research/<slug>.md             — đặc tả/nghiên cứu lộ trình lớn (CLAUDE.md mục 2)
     Cổng CI `metadata` kiểm file có TỒN TẠI THẬT trong nhánh, không chỉ dò chuỗi. -->

- Spec:
- Trạng thái duyệt:
- Người/ngày duyệt:
- Điểm lệch so với spec (nếu có):

## Loại thay đổi

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs/spec
- [ ] test
- [ ] chore
- [ ] breaking change

## Validation

- [ ] `npm run typecheck`
- [ ] `npm run lint` (0 cảnh báo)
- [ ] `npm run format:check`
- [ ] `npm run test:coverage`
- [ ] `npm run build`
- [ ] `npm run size`
- [ ] `npm run test:e2e` khi đổi UI/routing/auth/API/learner flow
- [ ] Manual smoke test:

### Bằng chứng

<!-- Test count, ảnh/video UI, eval delta hoặc truy vấn xác minh migration. -->

## Rủi ro, rollout và rollback

- Mức rủi ro:
- Critical flow bị ảnh hưởng:
- Rollout/feature flag:
- Telemetry/health check:
- Rollback/recovery:
- Migration:

## Definition of Done

- [ ] Với `feat`: research hoàn tất, spec đã merge và Approved for implementation trước khi code.
- [ ] Implementation khớp spec; deviation đã được ghi và review.
- [ ] Acceptance criteria có bằng chứng và không còn blocker.
- [ ] Đã self-review diff; chỉ gồm thay đổi thuộc scope.
- [ ] Đã chạy `npm run codemap -- impact <file>` cho hotspot và kiểm consumer.
- [ ] Input, error path, authorization và privacy đã được xử lý.
- [ ] Không có secret, dữ liệu production, debug log hoặc generated output ngoài ý muốn.
- [ ] Test mới chứng minh hành vi; contract/tài liệu/observability đã cập nhật.
- [ ] DB migration versioned, có verify query và recovery procedure.
- [ ] Payment/entitlement/usage có test atomicity, idempotency, concurrent/retry.
- [ ] Prompt/model AI đã chạy `npm run eval:tutor` và so baseline cost/quality.
- [ ] Breaking change được nêu rõ và có kế hoạch chuyển đổi.

## Ghi chú cho reviewer

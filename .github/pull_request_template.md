## Tóm tắt

<!-- Đổi gì, tại sao; ưu tiên 2–3 gạch đầu dòng. -->

-

## Issue / outcome

Closes #

<!-- Outcome người dùng/sản phẩm nào được cải thiện? Acceptance criteria nào hoàn tất? -->

## Loại thay đổi

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] chore
- [ ] breaking change

## Validation

<!-- Ghi lệnh đã chạy và kết quả THỰC TẾ; không tick dựa trên lần chạy cũ. -->

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

- Mức rủi ro: thấp / vừa / cao
- Thành phần/critical flow bị ảnh hưởng:
- Rollout/feature flag:
- Telemetry/health check sau deploy:
- Rollback/recovery:
- Migration (nếu có):

## Definition of Done

- [ ] Acceptance criteria có bằng chứng và không còn blocker.
- [ ] Đã self-review diff; chỉ gồm thay đổi thuộc scope.
- [ ] Đã chạy `npm run codemap -- impact <file>` cho hotspot và kiểm consumer liên quan.
- [ ] Input, error path, authorization và privacy đã được xử lý.
- [ ] Không có secret, dữ liệu production, debug log hoặc generated output ngoài ý muốn.
- [ ] Test mới chứng minh hành vi/bug fix; tài liệu/contract/observability đã cập nhật.
- [ ] Thay đổi DB có migration versioned, verify query và recovery procedure.
- [ ] Thay đổi payment/entitlement/usage có test atomicity, idempotency, concurrent/retry.
- [ ] Thay đổi prompt/model AI đã chạy `npm run eval:tutor` và so baseline cost/quality.
- [ ] Breaking change được nêu rõ và có kế hoạch tương thích/chuyển đổi.

## Ghi chú cho reviewer

<!-- Quyết định cần soi kỹ, trade-off hoặc follow-up ngoài scope. -->

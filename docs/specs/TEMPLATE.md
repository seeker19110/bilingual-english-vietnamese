# Feature spec: <Tên tính năng>

| Thuộc tính   | Giá trị                                             |
| ------------ | --------------------------------------------------- |
| Issue        | #                                                   |
| Spec owner   |                                                     |
| Trạng thái   | Draft / In review / **Approved for implementation** |
| Người duyệt  |                                                     |
| Ngày duyệt   | YYYY-MM-DD                                          |
| Lần cập nhật | YYYY-MM-DD                                          |

> Không bắt đầu code khi trạng thái chưa là **Approved for implementation**.

## 1. Tóm tắt quyết định

Một đoạn ngắn: vấn đề, người dùng, outcome, giải pháp đã chọn và lý do.

## 2. Vấn đề, người dùng và bằng chứng

- Persona/job-to-be-done:
- Hiện trạng và pain point:
- Baseline định lượng/định tính:
- Nguồn bằng chứng, link và ngày truy cập:
- Vì sao cần làm bây giờ:

## 3. Nghiên cứu hiện trạng

### Code và luồng hiện tại

Liệt kê route/component/API/table/test liên quan, output của codemap và critical flow.

### Nghiên cứu người dùng/sản phẩm

Nhu cầu, hành vi, accessibility, thiết bị/network và edge cases.

### Nghiên cứu kỹ thuật/nguồn ngoài

Chỉ dùng nguồn chính thống cho API/standard; ghi link, phiên bản và ngày truy cập.

## 4. Phương án và quyết định

| Phương án | Lợi ích | Chi phí/rủi ro | Kết luận |
| --------- | ------- | -------------- | -------- |
| Không làm |         |                |          |
| A         |         |                |          |
| B         |         |                |          |

Tiêu chí quyết định và lý do chọn:

## 5. Outcome và guardrails

- Metric chính + baseline + target:
- Guardrail (error, latency, cost, retention, safety):
- Thời gian đo:
- Điều kiện dừng/rollback:

## 6. Scope và non-goals

### In scope

-

### Không làm

-

## 7. User journeys và trạng thái

Mô tả happy path, empty/loading/error/offline/permission/limit/retry và recovery.

## 8. Yêu cầu

### Functional requirements

- FR-1:

### Non-functional requirements

- NFR-1: security/privacy
- NFR-2: accessibility
- NFR-3: performance/reliability
- NFR-4: AI quality/cost (nếu có)

## 9. Acceptance criteria

- AC-1 — Given / When / Then:
- AC-2 — Given / When / Then:

Mỗi AC phải truy được tới test hoặc bằng chứng manual trong PR.

## 10. UX, nội dung và accessibility

Wireflow/copy, responsive states, keyboard/screen reader, contrast, localization và reduced motion.

## 11. Kiến trúc, API và data contract

- Component/service boundaries:
- API request/response/error/idempotency:
- Schema/index/ownership/retention:
- Backward compatibility:
- Provider/fallback/timeouts/retries:

## 12. Security, privacy và abuse cases

AuthN/AuthZ, cross-user access, validation, secret/PII/logging, rate limit, payment/usage và threat cases.

## 13. Telemetry và vận hành

Event/metric/log (không PII), dashboard/alert, health check, owner và cách xác minh production.

## 14. Test plan

| Lớp                        | Trường hợp | Bằng chứng |
| -------------------------- | ---------- | ---------- |
| Unit                       |            |            |
| Integration                |            |            |
| E2E/a11y                   |            |            |
| Manual/eval                |            |            |
| Concurrent/retry/migration |            |            |

## 15. Kế hoạch triển khai

Lát dọc/PR, dependency, feature flag, migration order, compatibility window và release owner.

## 16. Rollout và rollback

Phần trăm/giai đoạn rollout, go/no-go, verify query, rollback/revert/reconciliation và giới hạn mất dữ liệu.

## 17. Rủi ro và giả định

| Rủi ro/giả định | Xác suất | Ảnh hưởng | Giảm thiểu/xác minh | Owner |
| --------------- | -------- | --------- | ------------------- | ----- |
|                 |          |           |                     |       |

## 18. Câu hỏi mở và quyết định

| Mục | Owner | Hạn | Quyết định |
| --- | ----- | --- | ---------- |
|     |       |     |            |

Không được Approved khi còn câu hỏi làm thay đổi cách implementation.

## 19. Phê duyệt

- [ ] Product outcome và scope
- [ ] UX/accessibility
- [ ] Architecture/API/data
- [ ] Security/privacy/cost
- [ ] Test/telemetry/rollout/rollback
- [ ] Mọi câu hỏi blocking đã đóng

**Kết luận:** Draft / In review / **Approved for implementation**

**Người duyệt:**  
**Ngày:**  
**Ghi chú:**

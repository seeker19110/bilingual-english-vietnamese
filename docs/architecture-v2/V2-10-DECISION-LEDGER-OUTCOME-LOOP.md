# V2-10 — Decision Ledger + Outcome Loop

| Thuộc tính | Giá trị                                                                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                                   |
| Phụ thuộc  | V2-03 (Personal World Model), V2-05 (Life Graph node `Decision`), V2-09 (Companion Runtime)                                                                                                    |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-10 — Decision Ledger + Outcome Loop"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 8 (Decision Ledger), 16 (Outcome learning), 5 (Life Graph) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: các quyết định quan trọng của người dùng được lưu thành **artifact có cấu trúc** (vấn đề,
giả định, bằng chứng, phương án, đánh đổi, lựa chọn, kỳ vọng), sau đó được **rà lại theo lịch** để so
kỳ vọng với thực tế, và kết quả đó có thể **đề xuất** cập nhật Personal World Model.

Trong scope: lưu trữ decision, liên kết `Decision` node trong Life Graph, lịch review, ghi nhận
outcome quan sát được, sinh đề xuất cập nhật fact (dạng candidate, không tự ghi).

Ngoài scope: lưu toàn bộ hội thoại (kiến trúc nói rõ Ledger không phải log chat).

## 2. Entities / schema sketch

```
personal.decision_records            -- append-only; sửa = insert bản mới supersedes bản cũ
  id             uuid pk
  person_id      uuid not null references personal.persons(id) on delete cascade
  node_id        uuid                -- trỏ personal.life_graph_nodes type='Decision'
  problem        text not null
  domain         text
  options        jsonb not null      -- [{id, summary}]
  assumptions    jsonb not null      -- EvidenceRef[]
  evidence       jsonb not null      -- EvidenceRef[]
  tradeoffs      jsonb not null      -- string[]
  selected_option_id text
  rationale      text
  expected_outcomes jsonb not null   -- OutcomeExpectation[]
  status         text not null check (open|decided|review_due|reviewed|superseded)
  review_at      timestamptz
  version        integer not null default 1
  supersedes     uuid references personal.decision_records(id)
  is_current     boolean not null default true
  created_at     timestamptz not null default now()
  archived_at    timestamptz

personal.outcome_observations        -- quan sát thực tế, append-only, không sửa
  id             uuid pk
  decision_id    uuid not null references personal.decision_records(id)
  person_id      uuid not null
  observed_at    timestamptz not null
  metric_key     text not null
  observed_value jsonb not null
  source         jsonb not null      -- provenance: ai/cái gì báo con số này
  created_at     timestamptz not null default now()

personal.world_model_update_proposals -- cầu nối sang V2-03, KHÔNG tự apply
  id             uuid pk
  person_id      uuid not null
  decision_id    uuid
  namespace      text not null
  key            text not null
  proposed_value jsonb not null
  rationale      text not null
  status         text not null check (pending|accepted|rejected|expired)
  version        integer not null default 1
  created_at     timestamptz not null default now()
  archived_at    timestamptz
```

Ràng buộc: `status='decided'` bắt buộc có `selected_option_id`; `review_at` bắt buộc khi `decided`
(nếu chính sách yêu cầu review — xem mục 7).

## 3. API / service contract sketch

```ts
createDecision(personId, input): DecisionRecord           // status 'open' hoặc 'decided'
decide(personId, decisionId, expectedVersion, { selectedOptionId, rationale, expectedOutcomes, reviewAt })
recordObservation(personId, decisionId, observation): OutcomeObservation
reviewDecision(personId, decisionId, expectedVersion): ReviewResult
  // so expectedOutcomes vs observations → 'as_expected' | 'better' | 'worse' | 'inconclusive'
listDueReviews(personId, now): DecisionRecord[]
proposeWorldModelUpdate(...) / acceptProposal(...) / rejectProposal(...)
```

API HTTP: `GET/POST/PATCH /api/decisions`, `POST /api/decisions/:id/observations`,
`POST /api/decisions/:id/review`, `GET/PATCH /api/world-model-proposals`. Auth + rate limit + Zod,
`personId` từ token.

Job nền: quét `review_at <= now()` và chuyển `decided → review_due`, gửi nhắc (kênh nhắc: mục 7).

## 4. Invariant và gate

Invariant:

1. Outcome **không được** tự ghi đè `PersonalFact` gốc `user_declared` hoặc `PersonalPolicy` —
   chỉ được tạo proposal chờ người dùng chấp nhận (gate roadmap).
2. Mọi observation có provenance; không có số liệu "từ trên trời".
3. Decision đã `superseded` không sửa được nữa; chỉnh sửa = bản ghi mới.
4. Một decision chỉ có tối đa một bản `is_current`.
5. Model không được tự tạo decision `decided` thay người dùng — LLM chỉ được đề xuất options/tradeoffs.

Gate coi là đạt phase:

- test chứng minh accept proposal mới làm đổi fact, còn review một mình thì không đổi gì;
- test chứng minh proposal nhắm vào fact `user_declared` bị buộc qua bước xác nhận;
- một decision đi trọn vòng `open → decided → review_due → reviewed` có bằng chứng;
- xoá/export dữ liệu người dùng bao gồm cả ledger (yêu cầu quyền riêng tư mục 18).

## 5. Phụ thuộc và thứ tự triển khai

1. Migration + service CRUD decision (append-only).
2. Liên kết node `Decision` của Life Graph (V2-05 đã có node type này).
3. Observation + review + job nhắc lịch.
4. Proposal sang Personal World Model + luồng accept/reject.
5. Nối Companion (V2-09) để decision được tạo từ hội thoại thay vì nhập tay.

## 6. Rủi ro và giả định

- **Rủi ro:** ghi quá nhiều thứ thành "decision" khiến ledger thành log chat — cần tiêu chí lọc rõ.
- **Rủi ro:** người dùng không bao giờ review ⇒ vòng lặp chết. Giảm thiểu: đo tỉ lệ review đúng hạn.
- **Rủi ro riêng tư:** decision chứa nội dung nhạy cảm (tài chính, sức khoẻ) — cần `sensitivity`
  tương tự fact/memory; kiến trúc chưa nêu field này cho decision (xem mục 7).
- **Giả định:** contract `DecisionRecord` ở `packages/core-contracts/decisionRecord.ts` đã khớp
  interface mục 8 kiến trúc; nếu thiếu `sensitivity` thì phải mở rộng contract không breaking.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                         | Vì sao cần owner                                  | Ảnh hưởng nếu chọn sai                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Tiêu chí nào khiến một việc đáng ghi thành Decision?                            | Quyết định sản phẩm, ảnh hưởng khối lượng dữ liệu | Ghi tất cả → nhiễu; ghi quá ít → vòng outcome vô dụng    |
| `DecisionRecord` có cần `sensitivity` như fact/memory không?                    | Chính sách riêng tư                               | Thiếu thì decision nhạy cảm lọt vào context sai mục đích |
| Review mặc định sau bao lâu (7/30/90 ngày) và có bắt buộc không?                | Chính sách sản phẩm                               | Nhắc sai nhịp → người dùng bỏ tính năng                  |
| Nhắc review qua kênh nào (in-app, email đã có `0033_email_reminders`, push)?    | Chi phí + trải nghiệm                             | Chọn kênh sai gây phiền hoặc không ai thấy               |
| Proposal cập nhật World Model có được auto-accept khi confidence rất cao không? | Trực tiếp đụng gate "không tự ghi đè"             | Auto-accept sai làm hỏng niềm tin và dữ liệu gốc         |
| Decision có hiển thị/chia sẻ được không (export PDF, chia sẻ link)?             | Quyết định sản phẩm + rủi ro lộ dữ liệu           | Mở chia sẻ sớm → rò rỉ dữ liệu cá nhân                   |

## 8. Không làm

- Không lưu transcript hội thoại làm decision.
- Không tự động cập nhật Personal World Model.
- Không xây dashboard phân tích outcome nâng cao (biểu đồ, thống kê nhóm).
- Không dùng outcome để tự đổi Personal Policy.
- Không suy luận nhân quả tự động ("vì quyết định X nên kết quả Y") — chỉ ghi nhận và so sánh.

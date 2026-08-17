# V2-09 — Companion Runtime

| Thuộc tính | Giá trị                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                                                |
| Phụ thuộc  | V2-04 (policy/authority), V2-06 (memory), V2-07 (Context Engine), V2-08 (Capability Registry)                                                                                                               |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-09 — Companion Runtime"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 2 (Companion Layer), 3 (Core request flow), 7 (Policy/authority), 15 (AI and agents) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: có một đường chạy duy nhất từ ý định người dùng tới thay đổi trạng thái, đi qua đủ các trạm
của mục 3 kiến trúc, với **invariant bất biến: Planning ≠ Execution ≠ State Mutation**.

Các trạm phải hiện diện thành module tách bạch:

1. Intent Resolver — phân loại intent + domain;
2. Context resolution — gọi Context Engine (V2-07), không tự truy vấn DB domain;
3. Planner — sinh `Plan` gồm các bước tham chiếu `capabilityId`;
4. Policy Validator — chấm mọi bước theo thứ tự ưu tiên mục 7 kiến trúc;
5. Capability Router — resolve manifest (V2-08) rồi thực thi;
6. Result Validator — validate output theo schema manifest;
7. State Proposal — sinh `ProposedAction`, **không tự UPDATE bảng domain**;
8. Domain commit — domain engine sở hữu quyết định `reject | request_confirmation | commit`.

Ngoài scope: agent tự trị nhiều bước không giới hạn; automation theo lịch (V2-18).

## 2. Entities / schema sketch

```
personal.companion_runs              -- một lượt chạy runtime, append-only
  id             uuid pk
  person_id      uuid not null references personal.persons(id) on delete cascade
  intent         text not null
  domain         text
  context_package_id uuid            -- trỏ context đã dùng (provenance)
  status         text not null check (planning|awaiting_confirmation|executing|completed|rejected|failed)
  version        integer not null default 1
  created_at     timestamptz not null default now()
  archived_at    timestamptz

personal.companion_plan_steps        -- các bước của plan, append-only
  id             uuid pk
  run_id         uuid not null references personal.companion_runs(id) on delete cascade
  step_index     integer not null
  capability_id  text not null
  capability_version integer not null
  input          jsonb not null
  policy_decision text not null check (allow|deny|require_confirmation)
  policy_reason  text
  outcome        text check (success|validation_failed|error|skipped)
  created_at     timestamptz not null default now()
  unique (run_id, step_index)

personal.proposed_actions            -- state proposal chờ domain xử lý
  id             uuid pk
  run_id         uuid not null
  person_id      uuid not null
  target_domain  text not null
  action_type    text not null
  payload        jsonb not null
  authority_required text not null   -- READ|SUGGEST|DRAFT|WRITE_INTERNAL|EXECUTE_WITH_CONFIRMATION|AUTOMATE
  status         text not null check (pending|confirmed|rejected|committed|expired)
  version        integer not null default 1
  created_at     timestamptz not null default now()
  archived_at    timestamptz
```

Ghi audit và outbox event trong cùng transaction commit (mục 13 kiến trúc).

## 3. API / service contract sketch

```ts
runCompanion(input: {
  personId: string
  utterance: string
  activeGoalId?: string
  purpose: string            // bắt buộc, phục vụ consent/purpose check của V2-04
}): CompanionRunResult

confirmProposedAction(personId, actionId, expectedVersion): CommitResult
rejectProposedAction(personId, actionId, expectedVersion, reason?): void
```

API HTTP:

- `POST /api/companion/run` — auth + rate limit; trả về `runId`, phản hồi, danh sách `ProposedAction`
  đang chờ xác nhận;
- `POST /api/companion/actions/:id/confirm` và `/reject` — có `expectedVersion` (409 khi lệch);
- `GET /api/companion/runs?limit=` — người dùng tự xem lại lượt chạy của mình.

`personId` luôn suy từ token, không nhận từ client (quy ước đã dùng ở V2-03/V2-04/V2-05).

## 4. Invariant và gate

Invariant:

1. Planner không được gọi bất kỳ hàm ghi dữ liệu nào — kiểm bằng test và bằng ranh giới module.
2. Mọi bước có side effect phải qua Policy Validator trước; kết quả policy được ghi lại.
3. Runtime không import repository riêng của domain (mục 11 kiến trúc) — enforce bằng lint boundary.
4. Output LLM không bao giờ được commit thẳng: phải qua Result Validator + State Proposal.
5. Consent bị revoke giữa chừng ⇒ bước còn lại bị chặn (đây chính là gate còn treo của V2-04).
6. Một `ProposedAction` chỉ commit đúng một lần (idempotency theo action id).

Gate coi là đạt phase:

- ≥ 1 luồng người dùng thật chạy hết 8 trạm (đề xuất: một luồng Learning đã có, chốt ở mục 7);
- test chứng minh revoke consent làm hỏng bước tiếp theo → đóng gate V2-04;
- test chứng minh commit hai lần cùng `ProposedAction` chỉ đổi trạng thái một lần;
- không có đường ghi domain nào bỏ qua State Proposal trong luồng đã bật.

## 5. Phụ thuộc và thứ tự triển khai

1. V2-08 resolver sẵn sàng.
2. Intent Resolver + Planner (deterministic trước, AI sau — theo "deterministic-first").
3. Policy Validator nối `resolveAuthority`/`isConsentActive` đã có ở V2-04.
4. Router + Result Validator.
5. State Proposal + confirm/reject + domain commit adapter cho Learning.
6. Đóng gate V2-04 bằng test enforcement.

## 6. Rủi ro và giả định

- **Rủi ro lớn nhất:** runtime "tiện tay" ghi thẳng bảng domain để chạy nhanh, phá invariant chính.
  Giảm thiểu: lint import boundary + review bắt buộc + test chống hồi quy.
- **Rủi ro:** chi phí/độ trễ tăng do thêm nhiều trạm. Giảm thiểu: đo baseline trước/sau, cho phép
  fast-path deterministic bỏ qua planner AI khi intent đã rõ.
- **Rủi ro:** prompt injection khiến planner chọn capability nguy hiểm — policy phải chặn, không dựa
  vào lời nhắc.
- **Giả định:** Context Engine V2-07 đã trả `ContextPackage` có provenance đủ dùng.
- **Giả định:** Learning có sẵn một điểm vào application-service để commit; nếu chưa, cần thêm adapter.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                                        | Vì sao cần owner                               | Ảnh hưởng nếu chọn sai                                     |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Luồng người dùng nào dùng làm gate đầu tiên (chat tiếng Anh? đặt mục tiêu học? chấm bài viết?) | Quyết định phạm vi rủi ro chạm production      | Chọn luồng quá nóng → sự cố người dùng thật                |
| Companion có thay thế `/api/agent` hiện tại hay chạy song song sau cờ bật/tắt?                 | Quyết định sản phẩm + rollback                 | Thay thế thẳng làm mất đường lui khi lỗi                   |
| Planner đợt đầu là deterministic rule hay LLM?                                                 | Đánh đổi chi phí/độ chính xác                  | LLM sớm gây chi phí và hành vi khó kiểm                    |
| Mức authority mặc định khi chưa có policy (V2-04 cố ý trả `null`)                              | Đây là quyết định an toàn, không phải kỹ thuật | Mặc định quá rộng = ghi dữ liệu ngoài ý muốn               |
| `ProposedAction` chờ xác nhận hết hạn sau bao lâu?                                             | Chính sách sản phẩm                            | Hết hạn quá ngắn gây khó dùng; quá dài gây commit lỗi thời |
| Có hiển thị cho người dùng thấy plan/policy decision không?                                    | Minh bạch vs lộ thiết kế nội bộ                | Ẩn hết thì mất niềm tin; lộ hết thì dễ bị dò               |

## 8. Không làm

- Không làm agent tự trị vòng lặp dài; mọi bước bị chặn bởi plan hữu hạn.
- Không làm automation theo lịch/sự kiện (V2-18).
- Không tạo capability mới cho domain chưa tồn tại.
- Không cho runtime đổi auth/permission/billing hay đặt mastery Learning (mục 15 kiến trúc cấm).
- Không xây UI Companion đầy đủ trong phase này.

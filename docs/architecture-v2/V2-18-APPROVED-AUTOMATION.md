# V2-18 — Approved automation

| Thuộc tính | Giá trị                                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                      |
| Phụ thuộc  | V2-04 (authority `AUTOMATE`), V2-08 (Capability/Tool Registry), V2-09 (Companion Runtime), V2-15 (external write + receipts)                                                      |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-18 — Approved automation"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 7 (authority `AUTOMATE`), 10 (Tools), 15 (AI and agents) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: hệ thống được phép hành động **không cần hỏi từng lần**, nhưng chỉ trong phạm vi người dùng
đã cấp tường minh, có ngân sách, có thời hạn, có đường thu hồi và có biên nhận.

Trong scope (đúng roadmap):

- automation grant tường minh;
- trigger theo lịch và theo sự kiện;
- budget + rate limit;
- revoke/pause;
- retry + compensation;
- action receipt.

Đây là phase duy nhất được phép bỏ bước xác nhận từng lần — và chỉ khi mọi ràng buộc dưới đây đúng.

## 2. Entities / schema sketch

Schema `personal`, append-only + `version` + `archived_at` như `0041`–`0044`. Automation grant về bản
chất là một `PersonalPolicy` với authority `AUTOMATE`, nên **không tạo hệ quyền thứ hai**: bảng dưới
đây tham chiếu policy đã có chứ không thay thế nó.

```
personal.automation_grants
  id uuid pk
  person_id uuid not null references personal.persons(id) on delete cascade
  policy_id uuid not null references personal.personal_policies(id)   -- authority='AUTOMATE'
  capability_id text not null, capability_version integer
  resource_scope text not null
  purpose text not null
  trigger jsonb not null            -- {kind:'schedule', cron} | {kind:'event', eventType}
  budget jsonb not null             -- {maxRunsPerDay, maxCostVnd, maxExternalWrites}
  status text not null check (active|paused|revoked|expired)
  expires_at timestamptz not null   -- BẮT BUỘC, không có grant vĩnh viễn
  review_at timestamptz not null    -- ràng buộc đã có từ 0042 cho AUTOMATE
  version integer not null default 1
  created_at timestamptz not null default now()
  archived_at timestamptz

personal.automation_runs            -- append-only
  id uuid pk, grant_id uuid not null, person_id uuid not null
  triggered_by text not null check (schedule|event|manual_test)
  run_id uuid                        -- trỏ personal.companion_runs (V2-09)
  status text not null check (started|succeeded|failed|compensated|skipped_budget|skipped_paused)
  attempt integer not null default 1
  cost_estimate numeric(12,2)
  error text
  idempotency_key text not null unique
  created_at timestamptz not null default now()

personal.automation_budget_counters -- đếm theo cửa sổ, cập nhật trong cùng transaction với run
  grant_id uuid, window_start date, runs_used integer, cost_used numeric(12,2)
  primary key (grant_id, window_start)
```

## 3. API / service contract sketch

```ts
createAutomationGrant(personId, input): AutomationGrant   // tạo kèm PersonalPolicy AUTOMATE
pauseGrant / resumeGrant / revokeGrant(personId, grantId, expectedVersion)
listGrants(personId): AutomationGrant[]
listRuns(personId, grantId?, limit?): AutomationRun[]
dryRun(personId, grantId): PlanPreview                    // chạy thử, không side effect
```

API HTTP: `GET/POST/PATCH/DELETE /api/automations`, `GET /api/automations/:id/runs`,
`POST /api/automations/:id/dry-run`. Auth + rate limit + Zod, `personId` từ token.

Worker: quét trigger lịch (và tiêu thụ event từ outbox), mỗi lần chạy tạo `automation_runs` trước khi
gọi Companion Runtime; runtime vẫn đi qua đủ policy như luồng có người.

## 4. Invariant và gate

Invariant:

1. Không có grant vô hạn: `expires_at` và `review_at` bắt buộc.
2. Vượt budget ⇒ bỏ qua lượt chạy và ghi `skipped_budget`, **không** chạy rồi mới báo.
3. `revoke`/`pause` có hiệu lực ngay ở lượt chạy kế tiếp và huỷ lượt đang chờ.
4. Mọi tác động ngoài sinh receipt (V2-15), `confirmed_by='automation_grant'` kèm `grant_id`.
5. Retry hữu hạn, cùng idempotency key; hành động không idempotent thì không được retry tự động.
6. Compensation phải tường minh cho mỗi capability có side effect; capability không khai báo
   compensation thì không được cấp `AUTOMATE`.
7. Automation không được nâng thẩm quyền của chính nó, không đổi policy/consent, không chạm billing.

Gate coi là đạt phase:

- drill: revoke giữa lúc automation đang bật → lượt kế tiếp bị chặn, có bằng chứng log;
- drill: vượt budget → bỏ qua đúng cách;
- drill: lỗi giữa chừng → compensation chạy hoặc trạng thái được đánh dấu cần người xử lý;
- 100% lượt chạy tự động có receipt truy được ngược về grant.

## 5. Phụ thuộc và thứ tự triển khai

1. Grant + policy `AUTOMATE` + UI xem/thu hồi (người dùng phải thấy được trước khi có gì tự chạy).
2. `dryRun` (không side effect) — chứng minh plan đúng trước khi bật thật.
3. Trigger lịch cho capability **không có side effect ngoài** trước.
4. Budget/rate limit + counters.
5. Retry/compensation + receipts.
6. Chỉ khi đủ các bước trên mới bật automation có tác động ra ngoài.

## 6. Rủi ro và giả định

- **Rủi ro cao nhất:** vòng lặp tự chạy gây chi phí AI hoặc tác động ngoài lặp lại. Giảm thiểu: budget
  cứng, rate limit, và cầu dao tổng (kill switch) toàn hệ thống.
- **Rủi ro:** prompt injection từ dữ liệu ngoài khiến automation làm việc không mong muốn — automation
  không có người xem, nên rủi ro lớn hơn luồng tương tác.
- **Rủi ro vận hành:** VPS 1 vCPU; nhiều tiến trình cần `REDIS_URL` cho rate limit dùng chung
  (bài học đã ghi trong `CLAUDE.md`).
- **Giả định:** đã có hạ tầng job/worker; nếu chưa thì đây là phần việc thêm đáng kể.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                     | Vì sao cần owner              | Ảnh hưởng nếu chọn sai                            |
| --------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| Automation nào được bật đầu tiên và cho ai (chỉ owner? người dùng Pro/VIP?) | Quyết định sản phẩm + chi phí | Mở rộng sớm → chi phí API mất kiểm soát           |
| Trần ngân sách mặc định mỗi grant (số lượt/ngày, tiền/tháng) là bao nhiêu?  | Quyết định tài chính          | Trần cao → lỗ; trần thấp → tính năng vô dụng      |
| Thời hạn tối đa của một grant (30/90/365 ngày)?                             | Chính sách an toàn            | Quá dài → quyền tồn tại lâu hơn ý định người dùng |
| Có cầu dao tổng tắt mọi automation không, và ai được bấm?                   | Vận hành sự cố                | Không có → không dừng được khi hỏng               |
| Thông báo cho người dùng sau mỗi lượt tự chạy, hay chỉ khi thất bại?        | Trải nghiệm                   | Im lặng → mất niềm tin; báo hết → phiền           |
| Automation có được chạy capability `riskLevel='high'                        | 'restricted'` không?          | Quyết định an toàn                                | Cho phép → hành động lớn không ai giám sát |

## 8. Không làm

- Không có automation mặc định bật khi chưa có grant tường minh.
- Không retry hành động không idempotent.
- Không cho automation sửa policy/consent/billing/quyền.
- Không chạy agent tự do không giới hạn bước.
- Không bật automation có side effect ngoài trước khi đủ receipts + compensation.

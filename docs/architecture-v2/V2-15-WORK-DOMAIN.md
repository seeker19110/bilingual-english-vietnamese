# V2-15 — Work Domain

| Thuộc tính | Giá trị                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                         |
| Phụ thuộc  | V2-08 (Capability/Tool Registry), V2-09 (Companion Runtime), V2-04 (authority/consent)                                                                                               |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-15 — Work Domain"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 10 (Tools), 11 (Cross-domain protocol), 12 (Domain patterns — Work) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: domain Work quản lý dự án/công việc/cuộc họp/tài liệu/quyết định/hạn chót, và — quan trọng
nhất về mặt kiến trúc — **mọi ghi ra hệ thống bên ngoài đều đi qua tool + permission + ranh giới xác nhận**.

Trong scope (đúng roadmap):

- projects/tasks/meetings/documents/decisions/deadlines;
- integration nằm sau tool manifest + permission;
- confirmation boundary cho external write.

Đây là phase đầu tiên hệ thống **tác động ra thế giới bên ngoài**, nên rủi ro cao nhất không phải kỹ
thuật mà là hành động sai không thu hồi được.

## 2. Entities / schema sketch

Schema `work`, quy ước `version` + `archived_at` + audit append-only như `0041`–`0044`.

```
work.projects
  id uuid pk, person_id uuid not null references personal.persons(id) on delete cascade
  name text not null, status text check (active|paused|done|archived)
  node_id uuid                     -- projection sang life_graph_nodes type='Project'
  version integer, created_at, updated_at, archived_at

work.tasks
  id uuid pk, person_id uuid not null, project_id uuid
  title text not null, detail text
  status text check (todo|doing|blocked|done|cancelled)
  due_at timestamptz, priority smallint
  external_ref jsonb               -- {provider, id, url} nếu đồng bộ từ hệ ngoài
  version integer, created_at, updated_at, archived_at

work.meetings
  id uuid pk, person_id uuid not null, project_id uuid
  title text, starts_at timestamptz not null, ends_at timestamptz
  attendees jsonb, notes_ref jsonb, external_ref jsonb
  version integer, created_at, archived_at

work.documents                     -- CHỈ metadata + con trỏ nguồn, không copy nội dung
  id uuid pk, person_id uuid not null, project_id uuid
  title text, source jsonb not null, sensitivity text not null
  version integer, created_at, archived_at

work.deadlines
  id uuid pk, person_id uuid not null, subject_ref jsonb not null
  due_at timestamptz not null, severity text
  version integer, created_at, archived_at

work.external_action_receipts      -- biên nhận mọi tác động ra ngoài, append-only, không sửa
  id uuid pk, person_id uuid not null
  tool_id text not null, tool_version integer not null
  proposed_action_id uuid          -- trỏ personal.proposed_actions (V2-09)
  request_digest text not null     -- băm payload, không lưu nội dung nhạy cảm thô
  result text not null check (success|failed|rejected)
  provider_ref text, confirmed_by text not null check (user|automation_grant)
  idempotency_key text not null unique
  created_at timestamptz not null default now()
```

Quyết định của Work (`work.decisions`) **không** tạo bảng riêng: dùng `personal.decision_records`
(V2-10) với `domain='work'` — tránh hai ledger cạnh tranh.

## 3. API / service contract sketch

CRUD nội bộ: `GET/POST/PATCH /api/work/projects|tasks|meetings|documents` — auth, Zod, `expectedVersion`.

Tool manifest cho tác động ngoài (đăng ký ở V2-08, `sideEffect='external'`):

```
calendar.create_event      idempotency: (person, external_ref hoặc key do client sinh)
message.send               idempotency bắt buộc
issue.update               idempotency bắt buộc
document.write             idempotency bắt buộc
```

Luồng bắt buộc cho external write:

```
Companion plan → policy (authority >= EXECUTE_WITH_CONFIRMATION)
  → ProposedAction (pending)
    → người dùng xác nhận (hoặc automation grant hợp lệ ở V2-18)
      → tool execute (kèm idempotency key)
        → external_action_receipts
```

## 4. Invariant và gate

Invariant:

1. Không có đường nào gọi tool `sideEffect='external'` mà bỏ qua `ProposedAction` + xác nhận.
2. Mọi lần thực thi ngoài có `idempotency_key` duy nhất; retry không tạo hai tác động.
3. Mọi lần thực thi ngoài sinh đúng một receipt, kể cả khi thất bại.
4. Nội dung tài liệu/email không lưu bản sao thô nếu adapter đọc tại nguồn được (mục 6 kiến trúc).
5. Token của integration bên ngoài lưu mã hoá, không lộ ra client, không ghi vào log.
6. Thu hồi consent làm vô hiệu ngay tool tương ứng.

Gate coi là đạt phase:

- test chứng minh gọi tool external không có xác nhận bị từ chối;
- test retry hai lần cùng idempotency key chỉ tạo một tác động;
- ≥ 1 integration thật chạy end-to-end với receipt đầy đủ (integration nào — mục 7);
- drill thu hồi consent: sau khi revoke, tool bị chặn.

## 5. Phụ thuộc và thứ tự triển khai

1. CRUD nội bộ Work (không side effect) — an toàn, làm trước.
2. Tool manifest + tool runtime có idempotency + receipt (chưa nối provider thật, dùng adapter giả).
3. Confirmation boundary nối V2-09.
4. Nối một provider thật duy nhất, chế độ chỉ đọc trước, rồi mới cho ghi.
5. Drill an toàn (revoke, retry, lỗi provider).

## 6. Rủi ro và giả định

- **Rủi ro nghiêm trọng nhất:** gửi tin/sửa lịch nhầm cho người thật — không thu hồi được. Giảm thiểu:
  mặc định `EXECUTE_WITH_CONFIRMATION`, không có ngoại lệ trong phase này.
- **Rủi ro bảo mật:** lưu OAuth token của bên thứ ba làm mở rộng bề mặt tấn công đáng kể.
- **Rủi ro:** đồng bộ hai chiều gây vòng lặp cập nhật; nên bắt đầu một chiều.
- **Giả định:** hạ tầng lưu secret an toàn đã có (dự án đã có mã hoá AES-256-GCM cho cache TTS —
  cần đánh giá lại có dùng được cho token hay không).
- **Giả định:** chưa cần hỗ trợ nhiều tài khoản cùng provider cho một người dùng.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                                       | Vì sao cần owner                           | Ảnh hưởng nếu chọn sai                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Có tích hợp hệ ngoài nào không, và nếu có thì cái nào trước (Calendar? Email? Issue tracker?) | Quyết định sản phẩm + chi phí + pháp lý    | Chọn sai → nhiều tháng công cho tính năng không ai dùng |
| Work có phải tính năng cho người dùng cuối hay chỉ cho owner tự dùng?                         | Quyết định sản phẩm                        | Ảnh hưởng toàn bộ yêu cầu bảo mật và quy mô             |
| Lưu OAuth token bên thứ ba ở đâu và ai chịu trách nhiệm rò rỉ?                                | Rủi ro bảo mật/pháp lý, vượt thẩm quyền AI | Rò token = sự cố nghiêm trọng với tài khoản thật        |
| Đồng bộ một chiều (đọc) hay hai chiều (ghi) ở đợt đầu?                                        | Đánh đổi giá trị/rủi ro                    | Hai chiều sớm → hành động sai ra ngoài                  |
| Có lưu nội dung tài liệu/email vào DB không?                                                  | Riêng tư + dung lượng                      | Lưu thô → rủi ro rò rỉ và chi phí lưu trữ               |
| Ngưỡng nào coi là "high-impact" cần xác nhận hai lớp?                                         | Chính sách an toàn                         | Thiếu lớp chặn cho hành động lớn                        |

## 8. Không làm

- Không tự động gửi tin nhắn/email khi chưa có automation grant (V2-18).
- Không đồng bộ hai chiều ở đợt đầu.
- Không tạo ledger quyết định riêng cho Work.
- Không xây trình soạn thảo tài liệu trong app.
- Không lưu bản sao toàn bộ hộp thư/lịch của người dùng.

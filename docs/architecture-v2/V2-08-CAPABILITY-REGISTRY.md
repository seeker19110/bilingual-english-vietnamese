# V2-08 — Capability Registry

| Thuộc tính | Giá trị                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                                                                     |
| Phụ thuộc  | V2-02 (contract `CapabilityManifest`, `ToolManifest`), V2-04 (permission/authority), V2-07 (Context Engine)                                                                                                                      |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-08 — Capability Registry" + "Cross-cutting decision — Model API strategy"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 9 (Capability Registry), 10 (Tools), 15 (AI and agents) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: Companion (V2-09) có một danh mục capability **ổn định, có phiên bản, có policy** để gọi,
thay vì gọi thẳng hàm nội bộ của domain. Capability ID là hợp đồng ngữ nghĩa (`learning.grade_writing`),
không chứa tên model/provider.

Trong scope:

- kho lưu `CapabilityManifest` + `ToolManifest` (nguồn khai báo trong code, chiếu xuống DB để audit);
- vòng đời `experimental | active | deprecated` và versioning;
- input/output schema (tham chiếu contract Zod đã có ở `packages/core-contracts/`);
- khai báo permission bắt buộc, `riskLevel`, `costPolicy`, `auditPolicy`, `timeoutMs`, `executionMode`;
- resolver: `capabilityId (+ version) → manifest` với kiểm tra lifecycle;
- **đăng ký các capability Learning có thật trước tiên** (roadmap yêu cầu rõ), không tự bịa capability
  của domain chưa tồn tại.

Ngoài scope: bộ thực thi (runtime) capability — thuộc V2-09. Registry chỉ mô tả và xác thực.

## 2. Entities / schema sketch

Quy ước theo migration `0041`–`0044`: schema `personal` cho Personal OS Core; append-only lịch sử;
soft-delete bằng `archived_at`; optimistic concurrency bằng cột `version`.

Capability **không phải dữ liệu người dùng** — nó là cấu hình hệ thống. Do đó nguồn sự thật đề xuất
là code (khai báo TypeScript, review qua PR), còn DB chỉ giữ bản chiếu để audit/observability.

```
personal.capability_manifests        -- bản chiếu, append-only theo (capability_id, version)
  id                uuid pk
  capability_id     text not null            -- 'learning.grade_writing'
  version           integer not null         -- tăng dần, không sửa bản cũ
  domain            text not null            -- 'learning' | 'career' | ...
  description       text not null
  input_schema_ref  text not null            -- tên contract trong core-contracts
  output_schema_ref text not null
  required_permissions text[] not null
  risk_level        text not null check (low|medium|high|restricted)
  execution_mode    text not null check (deterministic|workflow|ai|agent)
  timeout_ms        integer not null
  cost_policy       jsonb not null           -- CapabilityCostPolicy (schema v2): maxCallsPerDayPerPerson,
                                             -- maxCostUsdPerDayPerPerson (USD), onExceed
  audit_policy      jsonb not null           -- CapabilityAuditPolicy (schema v2): logLevel, retentionDays
  lifecycle         text not null check (experimental|active|deprecated)
  created_at        timestamptz not null default now()
  archived_at       timestamptz              -- deprecate = archive, không delete
  unique (capability_id, version)

personal.tool_manifests              -- cùng khuôn, thêm side_effect
  ...
  side_effect       text not null check (none|internal|external)
  idempotency_key_rule text
  unique (tool_id, version)

personal.capability_tool_links       -- capability nào được dùng tool nào (mục 10 kiến trúc)
  capability_id, capability_version, tool_id, tool_version
```

Ràng buộc:

- không `UPDATE` field nghiệp vụ; đổi manifest = INSERT version mới;
- `execution_mode='ai'|'agent'` bắt buộc `cost_policy` khác rỗng (điều kiện của model API strategy);
- `cost_policy.onExceed='warn_and_allow'` CHỈ hợp lệ khi `risk_level='low'` — hành động rủi ro cao
  không được phép "cứ chạy rồi báo" (ràng buộc này chưa nằm trong Zod contract vì cần biết cả
  `riskLevel`, sẽ enforce ở lớp registry + test);
- `risk_level='restricted'` bắt buộc `required_permissions` khác rỗng.

## 3. API / service contract sketch

Service `packages/core-personal/capabilityRegistry.ts` (tên thư mục cần xác nhận — xem mục 7):

```ts
listCapabilities(filter?: { domain?; lifecycle?; riskLevel? }): CapabilityManifest[]
getCapability(id: string, version?: number): CapabilityManifest   // mặc định: version active mới nhất
resolveForExecution(id, version?): { manifest; inputSchema; outputSchema }  // ném lỗi nếu deprecated
listToolsOf(capabilityId, version?): ToolManifest[]
syncManifestsToDb(pool): { inserted; unchanged }                  // chạy lúc boot hoặc deploy
```

API HTTP (chỉ đọc, dành cho admin/observability, auth bắt buộc):

- `GET /api/capabilities` — danh sách manifest active;
- `GET /api/capabilities?id=...&version=...` — chi tiết một manifest.

Không có endpoint tạo/sửa manifest qua HTTP: manifest thay đổi qua PR + deploy, tránh việc runtime
tự mở rộng quyền của chính nó.

## 4. Invariant và gate

Invariant:

1. Mỗi capability được gọi phải resolve ra manifest tồn tại và `lifecycle != 'deprecated'`.
2. Input/output của mọi lần gọi được validate bằng schema khai báo — không có capability "schema-free".
3. Manifest không chứa tên vendor/model ở bất kỳ field nào (lint/test chặn).
4. Sửa manifest = version mới; version cũ vẫn resolve được để replay/audit.
5. Capability `executionMode` khác `deterministic` không được mặc định `riskLevel='low'` nếu có tool
   side effect `external`.

Gate coi là đạt phase:

- ≥ 3 capability Learning **có thật đang chạy production** đã đăng ký và được resolve qua registry
  (ví dụ chấm bài viết, sinh phản hồi hội thoại, đánh giá phát âm — danh sách chính xác cần chốt, mục 7);
- test chứng minh gọi capability không tồn tại/deprecated bị từ chối;
- test chứng minh không manifest nào chứa chuỗi tên model/provider;
- `syncManifestsToDb` idempotent (chạy 2 lần không tạo dòng thừa).

## 5. Phụ thuộc và thứ tự triển khai

1. Chốt danh sách capability Learning thật (cần owner).
2. Định nghĩa manifest trong code + test hợp lệ hoá.
3. Migration bảng chiếu + `syncManifestsToDb`.
4. Resolver + API đọc.
5. Bàn giao resolver cho V2-09 (runtime gọi thật).

Chặn: V2-09 không bắt đầu trước khi resolver + ≥ 3 manifest thật đã merge.

## 6. Rủi ro và giả định

- **Rủi ro:** registry trở thành lớp trung gian rỗng nếu code production vẫn gọi thẳng hàm domain.
  Giảm thiểu: đo tỉ lệ lời gọi đi qua registry, và chỉ tính gate khi luồng production thật dùng nó.
- **Rủi ro:** manifest ở code còn bản chiếu DB lệch nhau. Giảm thiểu: sync ở deploy + alert khi lệch.
- **Giả định:** contract `CapabilityManifest`/`ToolManifest` ở `packages/core-contracts/` đã đủ field;
  nếu thiếu thì đây là PR sửa contract, phải theo quy trình V2-02 (không breaking).
- **ĐÃ CHỐT (owner 2026-08-17), không còn là giả định:** `costPolicy`/`auditPolicy` là dữ liệu CÓ CẤU
  TRÚC — đã sửa contract `packages/core-contracts/capabilityManifest.ts` từ `z.string()` sang object,
  bump `CAPABILITY_MANIFEST_SCHEMA_VERSION` 1 → 2. Cấu trúc theo nhu cầu thật của V2-18 (worker
  automation cần đọc trần lượt/trần tiền từ manifest, không suy được từ chuỗi tên).

## 7. Câu hỏi mở cần owner quyết

### Đã chốt

- **`costPolicy`/`auditPolicy`: chuỗi hay object? — owner chốt 2026-08-17: CẤU TRÚC HOÁ theo nhu cầu
  V2-18.** Contract đã sửa (schema version 2). Đơn vị tiền là **USD**, khớp quy ước nội bộ của
  `packages/core-ai/aiCost.ts` — chỉ quy đổi VND khi HIỂN THỊ (`USD_VND_RATE`). Sửa được ngay không
  cần đường tương thích vì chưa bảng DB/API nào dùng contract này, chỉ có chính file contract + test.

### Còn mở

| Câu hỏi                                                                             | Vì sao cần owner                                       | Ảnh hưởng nếu chọn sai                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| Chính xác capability Learning nào đăng ký đợt đầu (và tên ID của chúng)?            | Đây là hợp đồng công khai lâu dài, đổi tên sau tốn kém | ID sai ngữ nghĩa phải version-bump hàng loạt về sau    |
| Registry đặt ở `packages/core-personal` hay package mới `packages/core-capability`? | Ranh giới package theo ADR-0003                        | Đặt sai gây phụ thuộc vòng giữa Personal OS và runtime |
| Manifest có được phép cấu hình theo môi trường (dev/prod khác lifecycle) không?     | Ảnh hưởng an toàn khi thử nghiệm trên production       | Bật nhầm capability experimental cho người dùng thật   |
| Ai được xem `GET /api/capabilities` — mọi user đăng nhập hay chỉ admin?             | Lộ bề mặt tấn công/thiết kế nội bộ                     | Lộ danh mục tool cho kẻ tấn công dò prompt injection   |
| Quy tắc deprecate: có thời gian ân hạn bắt buộc không?                              | Chính sách vận hành                                    | Gỡ capability đang dùng làm gãy luồng production       |

## 8. Không làm

- Không xây capability runtime/planner (V2-09).
- Không đăng ký capability của Career/Work/Startup/Life (các phase sau, domain chưa tồn tại).
- Không tạo UI quản trị capability.
- Không chuyển toàn bộ API `api/*` hiện có thành capability trong phase này.
- Không đưa lựa chọn model cụ thể vào registry — đó là việc của AI Gateway theo `22-MODEL-API-STRATEGY.md`.

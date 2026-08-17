# V2-17 — Life foundation

| Thuộc tính | Giá trị                                                                                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                        |
| Phụ thuộc  | V2-04 (Personal Policy), V2-05 (Life Graph), V2-09 (Companion Runtime)                                                                                                              |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-17 — Life foundation"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 12 (Domain patterns — Life), 7 (Personal Policy and authority) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: có **primitive nền tảng** cho mảng đời sống (kế hoạch, thói quen, phát triển bản thân, việc
nhà, sức khoẻ/wellbeing) — nhưng **không có "Life Agent" tổng quát tự trị**. Đây là ràng buộc kiến
trúc, không phải sở thích thiết kế.

Trong scope (đúng roadmap):

- primitive planning/habits/personal growth/household/wellbeing;
- các tiểu vùng tác động cao (sức khoẻ, tài chính cá nhân, quan hệ) bị cô lập sau lớp policy bổ sung;
- không có generic mega Life Agent.

> **Owner chốt 2026-08-17 — đây là tính năng SẢN PHẨM THẬT cho người dùng cuối**, không phải công cụ
> nội bộ hay bằng chứng kiến trúc dùng một lần. Mỗi người dùng có dữ liệu Life riêng theo `person_id`,
> giống mọi bảng Personal OS Core từ V2-03 — **không cần cơ chế đặc biệt nào thêm** cho việc "mỗi
> người một bản": kiến trúc hiện tại (Person / PersonalFact / Life Graph, tất cả khoá theo
> `person_id`, FK `on delete cascade`) vốn đã per-person. Hệ quả: yêu cầu bảo mật/riêng tư/quota áp ở
> mức người dùng thật ngay từ đầu, không được nới lỏng với lý do "chỉ owner tự dùng". Thứ tự
> roll-out các domain: xem V2-13 mục 1 (ĐỀ XUẤT, chờ owner xác nhận).

## 2. Entities / schema sketch

Schema `life`, quy ước `version` + `archived_at` + audit append-only như `0041`–`0044`.

```
life.plans                          -- kế hoạch cá nhân (tuần/tháng)
  id uuid pk, person_id uuid not null references personal.persons(id) on delete cascade
  title text not null, horizon text check (day|week|month|quarter)
  starts_on date, ends_on date
  node_id uuid                       -- projection Life Graph nếu là Goal/Project
  version integer, created_at, updated_at, archived_at

life.habits
  id uuid pk, person_id uuid not null
  name text not null, cadence jsonb not null      -- {type:'daily'|'weekly', times:[...]}
  active boolean not null default true
  version integer, created_at, archived_at

life.habit_events                   -- append-only, không sửa
  id uuid pk, person_id uuid not null, habit_id uuid not null
  occurred_on date not null, status text check (done|skipped|missed)
  source jsonb not null              -- provenance: tự khai hay suy ra
  created_at timestamptz not null default now()
  unique (habit_id, occurred_on)

life.household_items
  id uuid pk, person_id uuid not null
  kind text check (chore|purchase|maintenance|other)
  title text not null, due_at timestamptz, status text
  version, created_at, archived_at

life.wellbeing_entries              -- TIỂU VÙNG NHẠY CẢM
  id uuid pk, person_id uuid not null
  kind text not null                 -- 'mood' | 'sleep' | 'energy' ... (danh mục cần owner chốt)
  value jsonb not null
  sensitivity text not null default 'sensitive'
  recorded_at timestamptz not null
  version, created_at, archived_at

life.subdomain_guards               -- policy bổ sung cho tiểu vùng tác động cao
  id uuid pk, person_id uuid not null
  subdomain text not null check (health|finance|relationships|other)
  max_authority text not null        -- trần thẩm quyền, không vượt được dù policy chung rộng hơn
  requires_confirmation boolean not null default true
  version, created_at, archived_at
```

`life.wellbeing_entries` mặc định `sensitivity='sensitive'` — theo mục 4 kiến trúc, fact nhạy cảm
không tự động đi xuyên domain.

## 3. API / service contract sketch

```ts
createPlan / addHabit / logHabitEvent / listHabitStreak
recordWellbeing(personId, entry)                 // luôn user_declared, không suy ra
getSubdomainGuard(personId, subdomain): Guard | null
effectiveAuthority(personId, subdomain, action): AuthorityLevel
  // = min(resolveAuthority(V2-04), guard.maxAuthority)
```

API HTTP: `/api/life/plans`, `/api/life/habits`, `/api/life/habits/:id/events`,
`/api/life/wellbeing`, `/api/life/guards`. Auth + rate limit + Zod, `personId` từ token.

Capability đăng ký ở V2-08 **theo từng tiểu vùng hẹp** (`life.plan_week`, `life.review_habits`),
không có capability kiểu `life.do_anything`.

## 4. Invariant và gate

Invariant:

1. Không tồn tại capability/agent tổng quát cho toàn bộ Life.
2. `effectiveAuthority` không bao giờ vượt trần `subdomain_guards` — kể cả khi Personal Policy rộng hơn.
3. Dữ liệu wellbeing/sức khoẻ mặc định `sensitive`, không vào context của domain khác nếu không có
   consent riêng theo purpose.
4. Hệ thống không đưa ra lời khuyên y tế/tài chính mang tính chỉ định; nội dung ở tiểu vùng này phải
   có ranh giới nội dung rõ (cần owner chốt câu chữ).
5. `habit_events` append-only; sửa quá khứ = bản ghi mới có provenance.

Gate coi là đạt phase:

- test chứng minh guard hạ được thẩm quyền dù policy chung cho phép cao hơn;
- test chứng minh dữ liệu `sensitive` bị Context Engine (V2-07) loại khi purpose không khớp;
- ≥ 1 tiểu vùng chạy thật end-to-end (tiểu vùng nào — mục 7).

## 5. Phụ thuộc và thứ tự triển khai

1. Primitive không nhạy cảm trước: plans, habits, household.
2. `subdomain_guards` + `effectiveAuthority` (nối V2-04).
3. Wellbeing sau cùng, chỉ khi ranh giới nội dung đã được owner chốt.
4. Capability hẹp theo từng tiểu vùng.

## 6. Rủi ro và giả định

- **Rủi ro lớn nhất là phi kỹ thuật:** nội dung liên quan sức khoẻ/tài chính có thể gây hại nếu hệ
  thống nói như chuyên gia. Cần ranh giới nội dung và tuyên bố rõ ràng.
- **Rủi ro:** phạm vi "đời sống" gần như vô hạn; dễ trở thành app ghi chú tổng quát.
- **Rủi ro:** dữ liệu nhạy cảm nhất hệ thống nằm ở đây — mọi lỗi rò rỉ đều nghiêm trọng.
- **Giả định:** Context Engine V2-07 đã lọc theo sensitivity/purpose (đã có ở slice 1).
- **Giả định:** không có tích hợp thiết bị đeo/health API ở phase này.

## 7. Câu hỏi mở cần owner quyết

### Đã chốt (2026-08-17)

- **Life là tính năng sản phẩm thật cho người dùng cuối, per-person theo `person_id`** — xem hộp
  quyết định ở mục 1. Không cần thiết kế thêm cơ chế đa người dùng. Lưu ý: chính vì là người dùng
  thật nên các câu hỏi về ranh giới nội dung sức khoẻ/tài chính dưới đây càng KHÔNG được bỏ qua.

### Còn mở

| Câu hỏi                                                            | Vì sao cần owner                              | Ảnh hưởng nếu chọn sai                                |
| ------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------- |
| Tiểu vùng nào làm trước (habits? planning? household?)             | Quyết định sản phẩm                           | Chọn vùng nhạy cảm trước → rủi ro sớm không cần thiết |
| Có làm wellbeing/sức khoẻ không, hay loại hẳn khỏi V2?             | Rủi ro pháp lý và đạo đức, vượt thẩm quyền AI | Làm mà thiếu ranh giới → gây hại người dùng thật      |
| Ranh giới nội dung cho lời khuyên sức khoẻ/tài chính viết thế nào? | Trách nhiệm pháp lý                           | Câu chữ sai → rủi ro pháp lý thật                     |
| Có tích hợp thiết bị/health API không?                             | Riêng tư + chi phí                            | Kéo theo dữ liệu y tế thật, nghĩa vụ bảo mật nặng     |
| Trần thẩm quyền mặc định cho mỗi tiểu vùng là gì?                  | Quyết định an toàn                            | Trần quá rộng → hệ thống hành động ngoài ý muốn       |
| Dữ liệu Life có được dùng để cá nhân hoá Learning không?           | Quyết định riêng tư xuyên domain              | Dùng ngầm → vi phạm kỳ vọng người dùng                |

## 8. Không làm

- Không tạo Life Agent tự trị tổng quát (roadmap cấm rõ).
- Không tích hợp dữ liệu y tế/thiết bị đeo.
- Không đưa ra chẩn đoán hay lời khuyên đầu tư.
- Không suy ra dữ liệu wellbeing từ hành vi người dùng.
- Không dùng dữ liệu Life cho domain khác khi chưa có consent theo purpose riêng.

# V2-13 — Career Domain

| Thuộc tính | Giá trị                                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                 |
| Phụ thuộc  | V2-08 (Capability Registry), V2-09 (Companion Runtime), V2-11 (Learning read model)                                                                                          |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-13 — Career Domain"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 11 (Cross-domain protocol), 12 (Domain patterns — Career) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: Career là **domain phi-học-tập đầu tiên**, chứng minh kiến trúc V2 chịu được nhiều domain
thật chứ không chỉ Learning được đổi tên.

Trong scope (đúng gạch đầu dòng roadmap):

- `CareerProfile`;
- kinh nghiệm/portfolio;
- career goal;
- skill gap;
- capability CV / phỏng vấn / tìm việc;
- tiêu thụ **read model** kỹ năng/mastery của Learning qua contract, không truy vấn bảng Learning.

Career sở hữu: trạng thái nghề nghiệp, mục tiêu vai trò, kinh nghiệm, và **cách diễn giải** khoảng
cách kỹ năng. Career **không** sở hữu mastery — mastery vẫn thuộc Learning.

## 2. Entities / schema sketch

Schema riêng `career` (theo tiền lệ `personal`/`english`), quy ước `version` + `archived_at` +
audit append-only như `0041`–`0044`.

```
career.career_profiles
  id uuid pk
  person_id uuid not null references personal.persons(id) on delete cascade
  headline text
  years_experience numeric(4,1)
  current_role text
  version integer not null default 1
  created_at, updated_at, archived_at
  unique (person_id) where archived_at is null

career.experiences                  -- việc đã làm / dự án
  id uuid pk, person_id uuid not null, profile_id uuid not null
  organization text, title text, started_at date, ended_at date
  summary text, highlights jsonb
  version integer, created_at, archived_at

career.portfolio_items
  id uuid pk, person_id uuid not null
  kind text check (project|publication|certificate|link)
  title text not null, url text, description text, evidence jsonb
  version integer, created_at, archived_at

career.career_goals                 -- projection: node_id trỏ Life Graph type='Goal'
  id uuid pk, person_id uuid not null
  node_id uuid                      -- personal.life_graph_nodes
  target_role text not null, target_at date
  status text check (active|achieved|abandoned|blocked)
  version integer, created_at, archived_at

career.skill_gaps                   -- KẾT QUẢ DIỄN GIẢI, không phải mastery
  id uuid pk, person_id uuid not null, career_goal_id uuid not null
  skill_key text not null           -- khớp skill key của Learning read model
  required_level text not null
  observed_level text               -- copy có provenance từ Learning read model
  observed_source jsonb not null    -- {domain:'learning', readModelVersion, fetchedAt}
  gap_score numeric(3,2)
  computed_at timestamptz not null
  version integer, created_at, archived_at
```

`observed_level` là **ảnh chụp có nguồn**, phải ghi rõ thời điểm và phiên bản read model; không được
coi là nguồn sự thật thay Learning.

## 3. API / service contract sketch

```ts
getCareerProfile(personId): CareerProfile
upsertCareerProfile(personId, input, expectedVersion): CareerProfile
addExperience / addPortfolioItem / archive... (đều có expectedVersion)
setCareerGoal(personId, { targetRole, targetAt }): CareerGoal    // đồng thời tạo node Life Graph
computeSkillGap(personId, careerGoalId): SkillGap[]              // đọc LearningReadModel
```

Capability đăng ký vào registry (V2-08), ID ngữ nghĩa không chứa tên model:

- `career.review_cv` (executionMode `ai`, risk `medium`, tools: `document.read`, `resume.extract`,
  `career.rubric.evaluate` — đúng ví dụ mục 10 kiến trúc);
- `career.mock_interview` (`ai`);
- `career.match_jobs` (`workflow` hoặc `deterministic`, phụ thuộc nguồn dữ liệu việc làm — mục 7);
- `career.compute_skill_gap` (`deterministic`).

API HTTP: `GET/POST/PATCH /api/career/profile`, `/api/career/experiences`, `/api/career/goals`,
`/api/career/skill-gap`. Auth + rate limit + Zod, `personId` từ token.

## 4. Invariant và gate

Invariant:

1. **Career không truy vấn trực tiếp bảng Learning** (`learning_mastery`, `english.*`) — cấm rõ ở
   mục 11 kiến trúc; enforce bằng lint boundary + test.
2. Mọi `observed_level` có provenance trỏ về Learning read model.
3. Career goal có node tương ứng trong Life Graph, cùng `person_id`.
4. Nội dung CV do AI sinh là **draft**, không tự công bố/gửi đi (authority `DRAFT`).
5. Không có edge/bản ghi Career trỏ sang person khác.

Gate coi là đạt phase:

- một career goal thật tính được skill gap từ Learning read model, có provenance đầy đủ;
- test chứng minh không có truy vấn nào từ code Career chạm bảng Learning;
- ≥ 1 capability Career chạy qua Companion Runtime với policy check thật.

## 5. Phụ thuộc và thứ tự triển khai

1. Schema + service CRUD `CareerProfile`/experience/portfolio (không AI, an toàn).
2. Career goal + liên kết Life Graph.
3. `computeSkillGap` đọc `LearningReadModel`.
4. Đăng ký capability + nối Companion.
5. Capability AI (CV, phỏng vấn) — sau cùng vì tốn chi phí và cần eval.

## 6. Rủi ro và giả định

- **Rủi ro:** ánh xạ `skill_key` giữa Career và Learning không khớp (Learning dùng khoá riêng của môn).
  Giảm thiểu: bảng ánh xạ tường minh, không đoán theo tên chuỗi.
- **Rủi ro:** CV do AI sinh chứa thông tin bịa về người dùng → phải bám dữ liệu `experiences` có thật.
- **Rủi ro:** chi phí AI cho mock interview/CV cao; cần theo `22-API-COST-OPTIMIZATION-PLAN.md`.
- **Giả định:** Learning read model (V2-11) đã phơi `skillId` + mastery ổn định.
- **Giả định:** chưa cần tích hợp nguồn tin tuyển dụng bên ngoài ở phase này.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                               | Vì sao cần owner                           | Ảnh hưởng nếu chọn sai                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Career là tính năng cho người dùng thật hay chỉ là bằng chứng kiến trúc nội bộ?       | Quyết định sản phẩm, đổi hoàn toàn phạm vi | Làm sản phẩm đầy đủ khi chỉ cần proof → tốn nhiều tháng |
| Có bao nhiêu mẫu CV, định dạng xuất (PDF/DOCX/HTML)?                                  | Quyết định sản phẩm                        | Chọn PDF sớm kéo theo phụ thuộc kỹ thuật lớn            |
| `career.match_jobs` lấy dữ liệu việc làm từ đâu (nhập tay, API bên thứ ba, không có)? | Chi phí, pháp lý, khả thi                  | Phụ thuộc API trả phí ngoài ngân sách                   |
| Ánh xạ skill Career ↔ skill Learning do ai định nghĩa?                                | Cần chuyên môn nghề nghiệp                 | Ánh xạ sai → skill gap vô nghĩa                         |
| CV/kinh nghiệm là dữ liệu `personal` hay `sensitive` theo phân loại V2-03?            | Chính sách riêng tư                        | Phân loại thấp → lọt vào context sai mục đích           |
| Career có gửi email/nộp hồ sơ thay người dùng không?                                  | Side effect ra ngoài, cần authority        | Gửi nhầm hồ sơ thật là sự cố không thu hồi được         |

## 8. Không làm

- Không tự động nộp đơn ứng tuyển hay gửi email cho nhà tuyển dụng.
- Không tự đặt/sửa mastery trong Learning.
- Không crawl dữ liệu tuyển dụng khi chưa có quyết định pháp lý.
- Không xây mạng xã hội nghề nghiệp/chia sẻ hồ sơ công khai.
- Không lưu bản sao tài liệu CV người dùng tải lên nếu adapter đọc tại nguồn được (mục 6 kiến trúc).

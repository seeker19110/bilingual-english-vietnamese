# V2-12 — Multi-subject Learning

| Thuộc tính | Giá trị                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                |
| Phụ thuộc  | V2-11 (Learning ownership migration)                                                                                                                        |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-12 — Multi-subject Learning"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 12 (Domain patterns — Learning) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: đưa English, Toán, Lý, Hoá, Sinh vào **một bounded context Learning duy nhất** mà không ép
khái niệm đặc thù ngôn ngữ (phát âm, CEFR, từ vựng) lên các môn STEM, và không sinh ra `if (subject
=== 'math')` rải rác trong lõi.

Phần dùng chung (lõi Learning sở hữu):

- learner learning profile;
- goal;
- mẫu assessment/evidence;
- learning plan;
- scheduling (lịch học, ôn tập);
- primitive nội dung + versioning.

Phần thuộc từng môn (subject module sở hữu):

- taxonomy (cây kiến thức/kỹ năng);
- pedagogy (cách dạy);
- loại câu hỏi;
- luật chấm/đánh giá;
- tri thức chuyên môn.

## 2. Entities / schema sketch

Đã có `0029_platform_subject.sql` và `0030_schema_english.sql` — phase này mở rộng theo hướng đó,
không phát minh lại.

```
learning.subjects                    -- danh mục môn (có thể đã tồn tại dạng khác, cần đối chiếu)
  id text pk                         -- 'english' | 'math' | 'physics' | 'chemistry' | 'biology'
  display_name, status, created_at, archived_at

learning.learner_profiles            -- phần dùng chung, 1 person × 1 subject
  id uuid pk, person_id uuid not null, subject_id text not null
  preferences jsonb, pace jsonb
  version integer not null default 1
  created_at, updated_at, archived_at
  unique (person_id, subject_id)

learning.skill_nodes                 -- taxonomy: lõi giữ định danh, payload thuộc môn
  id uuid pk, subject_id text not null, external_key text not null
  parent_id uuid, label text not null
  payload jsonb not null             -- do subject module định nghĩa và validate
  version integer, created_at, archived_at
  unique (subject_id, external_key)

learning.assessments / learning.evidence / learning.mastery
  ... person_id, subject_id, skill_node_id, score/result jsonb, occurred_at, source jsonb
```

Nguyên tắc: bảng lõi có cột `subject_id`; **luật nghiệp vụ đặc thù nằm trong module môn**, không nằm
trong `check` constraint của bảng lõi.

## 3. API / service contract sketch

```ts
// Lõi định nghĩa cổng; mỗi môn cài đặt cổng này
interface SubjectModule {
  subjectId: string
  taxonomySchema: ZodSchema // validate payload skill node
  questionTypes: QuestionTypeDescriptor[]
  evaluate(input: AttemptInput): EvaluationResult // luật chấm riêng của môn
  planNext(context: PlanningContext): PlanStep[] // gợi ý học tiếp
}

registerSubject(module: SubjectModule): void
getSubject(subjectId): SubjectModule
```

Lõi gọi qua interface; lõi **không** biết môn nào tồn tại tại thời điểm biên dịch.

API HTTP giữ nguyên hình dạng hiện có, thêm tham số `subjectId` (mặc định `english` để không phá
client cũ — cần xác nhận, mục 7).

## 4. Invariant và gate

Invariant:

1. Lõi Learning không chứa nhánh điều kiện theo tên môn — kiểm bằng lint/grep trong test.
2. Khái niệm đặc thù English (CEFR, phát âm, từ vựng) không xuất hiện trong bảng/contract lõi.
3. Mọi bản ghi assessment/evidence/mastery đều có `subject_id`.
4. Thêm một môn mới không cần sửa file lõi nào ngoài việc đăng ký module.
5. Dữ liệu English hiện có không đổi ngữ nghĩa sau khi gắn `subject_id='english'`.

Gate coi là đạt phase (theo roadmap):

- **ít nhất hai môn khác nhau về bản chất** (ví dụ English và Toán) chạy qua contract chung, không
  có spaghetti điều kiện trong lõi;
- test chứng minh thêm môn thứ ba chỉ cần thêm module, không sửa lõi;
- luồng English production không hồi quy.

## 5. Phụ thuộc và thứ tự triển khai

1. Trích interface `SubjectModule` từ hành vi English hiện có (refactor thuần, không đổi hành vi).
2. Bọc English thành module đầu tiên; toàn bộ test hiện có vẫn xanh.
3. Bổ sung `subject_id` vào bảng lõi + backfill `english`.
4. Dựng môn thứ hai ở mức tối thiểu để chứng minh gate.
5. Đo lại và ghi nhận phần lõi còn rò rỉ khái niệm English.

## 6. Rủi ro và giả định

- **Rủi ro:** trừu tượng hoá sớm dựa trên một môn duy nhất → interface sai. Giảm thiểu: thiết kế
  interface **sau khi** đã phác thảo tối thiểu môn thứ hai trên giấy.
- **Rủi ro:** phạm vi phình rất lớn (nội dung 4 môn STEM là công việc nhiều tháng, không phải kỹ thuật).
- **Rủi ro:** SRS thiết kế cho từ vựng có thể không hợp với bài tập Toán.
- **Giả định:** `0029_platform_subject.sql` đã có khái niệm subject dùng lại được — phải đọc lại trước
  khi thiết kế bảng, tránh tạo khái niệm trùng.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                | Vì sao cần owner                          | Ảnh hưởng nếu chọn sai                        |
| ---------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| Môn thứ hai để chứng minh gate là môn nào và ở mức nội dung nào?       | Quyết định sản phẩm + khối lượng nội dung | Chọn môn quá nặng → phase kéo dài vô hạn      |
| Nội dung STEM lấy từ đâu (soạn tay, nguồn mở, AI sinh có kiểm duyệt)?  | Bản quyền, chất lượng, chi phí            | Vi phạm bản quyền hoặc nội dung sai kiến thức |
| SRS dùng chung cho mọi môn hay mỗi môn tự lập lịch ôn?                 | Quyết định sư phạm                        | Ép SRS từ vựng lên Toán làm hỏng trải nghiệm  |
| API cũ có mặc định `subjectId='english'` để giữ tương thích không?     | Ảnh hưởng client production               | Không mặc định → gãy app đang chạy            |
| Người dùng có được học nhiều môn cùng lúc, và quota/lượt tính thế nào? | Ảnh hưởng chi phí AI và gói Pro/VIP       | Tính sai lượt → lỗ chi phí API                |
| Mức độ chi tiết taxonomy STEM ai duyệt (chuyên môn sư phạm)?           | Cần chuyên gia, AI không tự chốt          | Cây kiến thức sai làm sai toàn bộ lộ trình    |

## 8. Không làm

- Không xây đầy đủ nội dung 4 môn STEM trong phase này.
- Không đổi thuật toán SRS hiện có của English.
- Không tạo domain riêng cho mỗi môn (chúng nằm trong một bounded context Learning).
- Không đưa khái niệm CEFR sang môn STEM.
- Không làm UI chọn môn hoàn chỉnh nếu chưa có nội dung thật.

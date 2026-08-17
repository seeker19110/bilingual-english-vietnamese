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

> **Owner chốt 2026-08-17 — SRS / curriculum / mô hình mastery thuộc TỪNG MÔN, không dùng chung**
> ("tiếng Anh khác toán và lý"). Ranh giới dùng-chung / riêng-theo-môn dưới đây đã sửa theo quyết
> định này. Hệ quả trực tiếp: thuật toán SRS hiện có của English **giữ nguyên, không đổi, không bị
> tổng quát hoá** thành SRS dùng chung; môn STEM về sau tự định nghĩa cách lập lịch ôn của mình.

Phần dùng chung (lõi Learning sở hữu) — đều là KHUNG/kiểu dữ liệu, không chứa thuật toán sư phạm:

- learner learning profile (khung hồ sơ chung: định danh người học × môn, tuỳ chọn, nhịp độ — KHÔNG
  chứa trạng thái SRS của bất kỳ môn nào);
- goal;
- **pattern** assessment/evidence (interface + hình dạng bản ghi chung — KHÔNG phải thuật toán chấm chung);
- learning plan (khung lịch học chung: kế hoạch gồm những bước gì, ở trạng thái nào);
- **primitive** scheduling (kiểu dữ liệu ngày/giờ, hàng đợi nhắc lịch, cron — KHÔNG phải thuật toán
  spaced-repetition dùng chung);
- primitive nội dung + versioning.

Phần thuộc từng môn (subject module sở hữu):

- taxonomy (cây kiến thức/kỹ năng);
- pedagogy (cách dạy);
- loại câu hỏi;
- luật chấm/đánh giá;
- **thuật toán SRS / lập lịch ôn tập** (mỗi môn tự quyết: từ vựng English dùng SRS khoảng cách tăng
  dần, Toán có thể dùng luyện tập theo dạng bài — lõi chỉ cung cấp primitive lịch để môn gọi);
- **cấu trúc curriculum** (lộ trình CEFR của English không áp được cho Toán/Lý);
- **mô hình mastery** (thế nào là "thuộc" một kỹ năng do môn định nghĩa);
- tri thức chuyên môn.

Làm rõ so với mục 12 `02-SYSTEM-ARCHITECTURE.md` ("Learning owns skill/knowledge/evidence/mastery/
assessment/diagnostic/curriculum/SRS"): câu đó nói về ranh giới **giữa các bounded context** —
Learning (chứ không phải Personal OS Core hay Career) sở hữu những khái niệm này. Nó KHÔNG nói mọi
môn trong Learning phải dùng chung một thuật toán. Không cần sửa mục 12 kiến trúc; phân tầng bên
trong Learning được làm rõ tại đây.

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
  // Lập lịch ôn RIÊNG của môn (owner chốt 2026-08-17: không có SRS dùng chung). Lõi chỉ gọi hàm này
  // rồi ghi kết quả vào hàng đợi lịch dùng chung — lõi không biết công thức giãn cách của môn nào.
  scheduleReview(context: ReviewContext): ReviewSchedule
  // Môn tự định nghĩa thế nào là "đã thuộc" — lõi chỉ lưu, không diễn giải.
  computeMastery(evidence: Evidence[]): MasteryState
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
- ~~**Rủi ro:** SRS thiết kế cho từ vựng có thể không hợp với bài tập Toán.~~ **ĐÃ XỬ LÝ bằng quyết
  định owner 2026-08-17:** không có SRS dùng chung, mỗi môn tự lập lịch ôn nên rủi ro này không còn.
  Rủi ro thay thế (nhỏ hơn): lặp code lập lịch giữa các môn — chấp nhận, đổi lấy đúng sư phạm.
- **Giả định:** `0029_platform_subject.sql` đã có khái niệm subject dùng lại được — phải đọc lại trước
  khi thiết kế bảng, tránh tạo khái niệm trùng.

## 7. Câu hỏi mở cần owner quyết

### Đã chốt

- **SRS dùng chung hay mỗi môn tự lập lịch? — owner chốt 2026-08-17: TỪNG MÔN TỰ LẬP LỊCH.** Lõi chỉ
  cung cấp scheduling primitive; SRS/curriculum/mastery model là subject-owned. SRS English giữ
  nguyên. Xem mục 1 và interface `SubjectModule` ở mục 3.

### Còn mở

| Câu hỏi                                                                | Vì sao cần owner                          | Ảnh hưởng nếu chọn sai                        |
| ---------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| Môn thứ hai để chứng minh gate là môn nào và ở mức nội dung nào?       | Quyết định sản phẩm + khối lượng nội dung | Chọn môn quá nặng → phase kéo dài vô hạn      |
| Nội dung STEM lấy từ đâu (soạn tay, nguồn mở, AI sinh có kiểm duyệt)?  | Bản quyền, chất lượng, chi phí            | Vi phạm bản quyền hoặc nội dung sai kiến thức |
| API cũ có mặc định `subjectId='english'` để giữ tương thích không?     | Ảnh hưởng client production               | Không mặc định → gãy app đang chạy            |
| Người dùng có được học nhiều môn cùng lúc, và quota/lượt tính thế nào? | Ảnh hưởng chi phí AI và gói Pro/VIP       | Tính sai lượt → lỗ chi phí API                |
| Mức độ chi tiết taxonomy STEM ai duyệt (chuyên môn sư phạm)?           | Cần chuyên gia, AI không tự chốt          | Cây kiến thức sai làm sai toàn bộ lộ trình    |

## 8. Không làm

- Không xây đầy đủ nội dung 4 môn STEM trong phase này.
- Không đổi thuật toán SRS hiện có của English (owner chốt 2026-08-17: SRS là của từng môn).
- Không tạo domain riêng cho mỗi môn (chúng nằm trong một bounded context Learning).
- Không đưa khái niệm CEFR sang môn STEM.
- Không làm UI chọn môn hoàn chỉnh nếu chưa có nội dung thật.

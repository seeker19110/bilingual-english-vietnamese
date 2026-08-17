# V2-11 — Learning ownership migration

| Thuộc tính | Giá trị                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trạng thái | Draft — chưa duyệt implement                                                                                                                                                                  |
| Phụ thuộc  | V2-01 (ADR biên giới domain), V2-03 (Personal World Model), V2-08/V2-09 (Companion gọi qua contract)                                                                                          |
| Nguồn      | docs/architecture-v2/21-ROADMAP.md mục "V2-11 — Learning ownership migration"; docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md mục 11 (Cross-domain protocol), 12 (Domain patterns — Learning) |

> Đặc tả này mở rộng roadmap thành chi tiết đủ để implement, nhưng KHÔNG tự chốt quyết định
> product/architecture còn tranh cãi — những chỗ đó nằm ở mục "Câu hỏi mở cần owner quyết" và
> PHẢI được trả lời trước khi chuyển trạng thái sang "Approved".

## 1. Outcome và scope

Outcome: hồ sơ người học được tách đúng ranh giới — phần **toàn cục** (thuộc Personal OS) và phần
**thuộc Learning** — đồng thời Companion chỉ đọc Learning qua **read model có kiểu**, không đụng bảng
nội bộ của Learning.

Trong scope:

- phân loại từng field hồ sơ hiện có (`public.profiles`, `english.user_profile`, `learning_progress`,
  SRS, mastery) thành `platform | learning`;
- giữ nguyên ownership của skill/knowledge/evidence/mastery/SRS trong Learning;
- công bố `LearningReadModel` có phiên bản cho Companion và các domain khác;
- chặn import mới từ core vào nội bộ Learning bằng lint boundary (đã có tiền lệ ở ADR-0003);
- di trú dữ liệu toàn cục (ví dụ ngôn ngữ mẹ đẻ, múi giờ, ràng buộc thời gian) sang `personal.personal_facts`.

Đây là phase **refactor có rủi ro production cao nhất của Wave D** vì chạm dữ liệu đang chạy thật.

## 2. Entities / schema sketch

Không tạo domain mới. Thay đổi chính là **di chuyển** và **che chắn**:

```
personal.personal_facts              -- (đã có, 0041) nhận các field toàn cục
  namespace 'profile'  key 'native_language' | 'timezone' | 'daily_time_budget' ...
  origin 'user_declared', confidence 1

english.* / public.profiles          -- giữ nguyên field thuộc Learning
  goal, daily_minutes, cefr_*, learning_progress, srs, mastery ...

personal.learning_read_model_versions -- (tuỳ chọn) ghi phiên bản read model đang phục vụ
  id, version, schema_ref, created_at, archived_at
```

Nguyên tắc di trú: **sao chép trước, đọc song song, chuyển nguồn đọc, rồi mới ngừng ghi chỗ cũ** —
không xoá cột trong cùng một PR với việc đổi nguồn đọc.

## 3. API / service contract sketch

```ts
// Learning công bố, các domain khác chỉ được dùng bản này
interface LearningReadModel {
  version: 1
  personId: string
  subjects: Array<{
    subjectId: string // 'english'
    level?: string // 'B1' — nhãn CEFR nếu môn có
    skills: Array<{ skillId: string; mastery: number; lastEvidenceAt?: string }>
    activeGoals: Array<{ goalId: string; label: string }>
    updatedAt: string
  }>
}

getLearningReadModel(personId, opts?): LearningReadModel
getLearningSkillSummary(personId, skillIds[]): SkillSummary[]
```

Chỉ đọc. Mọi thay đổi mastery/SRS vẫn phải đi qua application service của Learning.

Nếu Companion cần Learning ghi, nó gửi `ProposedAction` (V2-09) tới Learning, không gọi repository.

## 4. Invariant và gate

Invariant:

1. Không module ngoài Learning import file trong `apps/english/**` hoặc truy vấn bảng `english.*`.
2. Personal World Model chỉ chứa **summary** của Learning, provenance trỏ về Learning (mục 12 kiến trúc).
3. Field đã di trú có đúng một nguồn ghi; giai đoạn ghi song song phải có kiểm tra đối chiếu.
4. Không mất dữ liệu người dùng: mọi bước di trú có script kiểm đếm trước/sau và có rollback.
5. Contract Learning v1 đang chạy production không bị phá (yêu cầu xuyên suốt V2).

Gate coi là đạt phase:

- lint boundary bật và 0 vi phạm cho luật "core không import learning internals";
- `LearningReadModel` có test contract + ít nhất một consumer thật dùng nó;
- báo cáo đối chiếu dữ liệu trước/sau di trú (số bản ghi khớp, sai lệch 0);
- e2e luồng học hiện có vẫn xanh sau khi đổi nguồn đọc.

## 5. Phụ thuộc và thứ tự triển khai

1. Bảng phân loại field `platform | learning` (docs, cần owner duyệt).
2. Công bố `LearningReadModel` + test contract (không đổi dữ liệu — an toàn, làm trước).
3. Bật lint boundary ở chế độ cảnh báo → chặn.
4. Di trú từng field toàn cục một, theo mẫu sao chép → đọc song song → đổi nguồn → ngừng ghi cũ.
5. Dọn code đọc trực tiếp còn sót.

## 6. Rủi ro và giả định

- **Rủi ro cao:** đụng `public.profiles` đang phục vụ người dùng thật; sai một bước là hỏng onboarding.
  Giảm thiểu: mỗi field một PR, có cờ bật/tắt nguồn đọc, có rollback.
- **Rủi ro:** V2-05 đã dựng projection Life Goal đọc `public.profiles.goal`; di trú phải không làm gãy
  adapter đó.
- **Rủi ro:** hai nguồn ghi trong giai đoạn song song gây lệch. Giảm thiểu: job đối chiếu + alert.
- **Giả định:** `english.user_profile` hiện chỉ là snapshot backfill (theo `V2-05-SLICE-1.md`), nên
  không phải nguồn sự thật cần di trú — cần xác nhận lại bằng dữ liệu production.

## 7. Câu hỏi mở cần owner quyết

| Câu hỏi                                                                             | Vì sao cần owner                              | Ảnh hưởng nếu chọn sai                          |
| ----------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Field nào là "toàn cục" thật sự (ngôn ngữ mẹ đẻ? mục tiêu học? quỹ thời gian/ngày?) | Ranh giới sản phẩm, không suy ra được từ code | Di trú nhầm → hai domain tranh quyền sở hữu     |
| `english.user_profile` có còn cần tồn tại sau di trú không?                         | Quyết định dọn dẹp schema production          | Xoá nhầm bảng còn dùng → mất dữ liệu            |
| Giai đoạn ghi song song kéo dài bao lâu trước khi ngừng ghi chỗ cũ?                 | Đánh đổi rủi ro/độ phức tạp                   | Ngừng sớm → mất đường lui                       |
| `LearningReadModel` có phơi mastery chi tiết hay chỉ mức tóm tắt?                   | Rò rỉ chi tiết học tập sang domain khác       | Phơi quá nhiều → khó đổi nội bộ Learning về sau |
| Có chấp nhận downtime ngắn để di trú không?                                         | Quyết định vận hành                           | Không có kế hoạch → sự cố người dùng thật       |
| Ai duyệt chạy migration trên production và theo cửa sổ nào?                         | Quyền vận hành, AI không tự chạy              | Chạy sai thời điểm gây gián đoạn                |

## 8. Không làm

- Không đổi thuật toán SRS/mastery/curriculum (chỉ đổi ranh giới sở hữu).
- Không thêm môn học mới (V2-12).
- Không viết lại UI Learning.
- Không xoá cột/bảng trong cùng PR với việc đổi nguồn đọc.
- Không đưa mastery vào Personal World Model làm dữ liệu gốc.

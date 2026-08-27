# Đặc tả — Companion nhìn thấy dữ liệu 4 trụ Career/Work/Startup/Life (bản CHỈ-ĐỌC)

- **Ngày:** 2026-08-27
- **Trạng thái:** **Approved for implementation**
- **Người/ngày duyệt:** người dùng chốt 2026-08-27 (chọn phương án "làm bản chỉ-đọc trước,
  phần ghi tách đợt sau" khi được hỏi giữa hai lựa chọn: viết đặc tả đầy đủ cho cả phần ghi,
  hay làm ngay bản chỉ-đọc an toàn).
- **Bối cảnh phát sinh:** đợt quét trụ cột dự án 2026-08-27.

## 1. Vấn đề

`CLAUDE.md` mục 1 mô tả Companion là **"tác tử AI xuyên suốt"** cả 5 trụ. Đo mã thật cho thấy
không phải vậy:

| Điểm                        | Hiện trạng trước đợt này                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Read model nạp vào ngữ cảnh | Chỉ trụ **Learning** (`companionRuntime.ts` có đúng một nhánh `if (domain === 'learning')`)                                    |
| Nhận diện ý định            | Không có mẫu câu nào cho Career/Work/Startup/Life                                                                              |
| Domain mặc định             | Rơi về `learning` — mọi câu không nhận diện được đều bị gán trụ Học tập                                                        |
| Capability của planner      | 4 cái, đều thuộc Learning/personal: `learning.update_goal`, `dictionary.lookup`, `profile.update_fact`, `memory.create_record` |

Hệ quả cụ thể: hỏi Companion về sự nghiệp thì nó **trả lời được nhưng không thấy dữ liệu** —
dù 4 trụ này có 16 bảng và 5 service đầy đủ (`careerService` 430 dòng/test 814,
`workService` 422/798, `startupService` 332/430, 2 service Life 1.361/472).

## 2. Phạm vi đợt này — CHỈ-ĐỌC

**LÀM:** Companion **đọc** được tóm tắt dữ liệu 4 trụ để trả lời đúng ngữ cảnh.

**KHÔNG LÀM (tách đợt sau, cần đặc tả riêng):** thêm capability **ghi** cho 4 trụ (tạo mục tiêu
nghề nghiệp, thêm việc, thêm thói quen…). Lý do tách: chạm dữ liệu người dùng thật thuộc diện
`CLAUDE.md` mục 12 "phải dừng và hỏi"; phần ghi còn phải chốt mức rủi ro từng capability và cơ
chế xác nhận, đủ lớn để đứng riêng.

Hôm nay muốn Companion thay đổi dữ liệu 4 trụ thì vẫn phải đi qua `proposedActionService`
(người dùng bấm xác nhận) như mọi hành động có rủi ro khác — đợt này **không nới** đường đó.

## 3. Thiết kế

### 3.1. Read model — `packages/core-domains/domainReadModelService.ts`

Theo đúng khuôn `core-learner/learningReadModelService`: một hàm `get*ReadModel` nạp dữ liệu,
một hàm `format*ForContext` dựng chuỗi một dòng, và một hàm điều phối
`getDomainReadModelForContext(pool, personId, domain)` trả `null` cho trụ ngoài nhóm.

| Trụ     | Trường tóm tắt                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Career  | vị trí hiện tại/mục tiêu · số năm kinh nghiệm · ngành · số kinh nghiệm đã ghi · số mục tiêu đang theo đuổi · tối đa 5 kỹ năng mục tiêu cần |
| Work    | số dự án đang chạy · đếm việc theo 4 trạng thái · số việc **quá hạn mà chưa xong** · số việc khẩn cấp chưa xong                            |
| Startup | số venture · tên + giai đoạn venture gần nhất · số vấn đề và đếm giả định theo 4 trạng thái **của venture gần nhất**                       |
| Life    | số kế hoạch đang chạy · số thói quen đang bật · chuỗi ngày dài nhất · điểm tự chấm gần nhất                                                |

**Vì sao Startup chỉ đếm cho venture gần nhất:** `listProblems`/`listHypotheses` gắn theo
**venture** (`ventureId` là tham số bắt buộc), không theo người. Lặp mọi venture sẽ thành N
truy vấn; venture gần nhất cũng chính là cái người dùng đang nói tới khi mở lời.

### 3.2. Riêng tư — hai ràng buộc bất biến, đều phải có test canh gác

1. **Không lấy nội dung tự do nhạy cảm.** Chỉ số đếm, trạng thái, tiêu đề ngắn. Cụ thể cấm:
   `notes` của `wellbeing_checks` (nhật ký cảm xúc) và `description` dài của dự án/venture.
2. **Không lách cổng đồng ý.** Khối tóm tắt chỉ **thực sự** được nạp khi
   `isConsentActive(personId, domain, purpose)` trong `contextEngine` cho phép. Mã read model
   chỉ đưa `domainState` vào rồi để cổng quyết định — **không** tự kiểm tra thay, **không** bỏ qua.

Hai ràng buộc này nối tiếp tinh thần "danh sách trường được xem là ĐÓNG" của tính năng
"Người thân theo dõi" (`docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md`).

### 3.3. Nhận diện trụ

Bảng từ khoá **tất định**, không hỏi LLM: bước này chạy trước cả khi dựng ngữ cảnh nên phải rẻ,
nhanh, và cho cùng kết quả với cùng câu để test kiểm được. Nhận diện sai chỉ làm nạp thiếu/thừa
một khối tóm tắt, không phá hỏng lượt thoại.

**Thứ tự nhánh là ràng buộc thiết kế, không phải chi tiết cài đặt:**

1. Các ý định **HÀNH ĐỘNG** (tra từ · cập nhật hồ sơ · ghi nhớ) xét **trước** bảng từ khoá trụ.
   Nếu không, câu "ghi nhớ giúp tôi **cuộc họp** ngày mai" chứa từ khoá trụ Work sẽ bị cướp khỏi
   ý định `create_memory`.
2. Nhánh **"mục tiêu"** phải hỏi bảng từ khoá **trước** khi kết luận là mục tiêu HỌC TẬP —
   "mục tiêu" là từ chung của cả 5 trụ, để nguyên thì câu "mục tiêu sự nghiệp của tôi là gì"
   bị gán `learning`.

**Giới hạn chấp nhận:** câu gọi tên nhiều trụ cùng lúc ("cân bằng cuộc sống và công việc") lấy
trụ đứng trước trong bảng. Không có đáp án đúng duy nhất cho loại câu đó nên bảng cố ý không cố
xử lý; giao diện vẫn truyền `targetDomain` tường minh được và giá trị đó luôn thắng bảng từ khoá.

### 3.4. Đổi domain mặc định `learning` → `general`

`general` **không phải giá trị mới**: `synthesizeCompanionReply` vốn đã xử lý riêng
(`domain !== 'general' && domain !== 'all'` → bỏ dòng "lĩnh vực trọng tâm"), tức nó vốn là giá
trị trung tính có chỗ đứng trong mã.

Ba nơi khẳng định mặc định cũ phải được cập nhật **kèm lý do tại chỗ**:
`companionRuntime.test.ts`, `scripts/eval-v2-routing.test.ts`, và các ca `gen-*` trong
`scripts/eval-v2-routing-fixtures.json`.

## 4. Tiêu chí chấp nhận

- [x] `getDomainReadModelForContext` trả chuỗi tóm tắt cho đủ 4 trụ, `null` cho trụ khác.
- [x] Companion nạp đúng read model theo `domain`, `provenance` là `<domain>:read_model`.
- [x] Read model hỏng → vẫn trả lời được, chỉ thiếu ngữ cảnh (có test).
- [x] Nhật ký cảm xúc không lọt vào model lẫn chuỗi đã format (có test).
- [x] Câu "ghi nhớ … cuộc họp …" vẫn ra `create_memory` (có test).
- [x] Câu "mục tiêu sự nghiệp …" ra `career`, không phải `learning` (có test).
- [x] `targetDomain` tường minh luôn thắng bảng từ khoá (có test).
- [x] Bộ eval định tuyến mở rộng để có ca cho 4 trụ; độ chính xác không tụt dưới ngưỡng 85%.
- [x] Không có migration; không đụng prompt/model AI.

## 5. Việc tách ra đợt sau

1. **Capability GHI cho 4 trụ** — cần đặc tả riêng: danh sách capability, mức rủi ro từng cái,
   cơ chế xác nhận, và cách hiện "tác vụ đề xuất" trên giao diện từng trụ.
2. **Nợ có sẵn `mem-7`**: câu "nhớ giúp tôi là tôi mệt" ra `update_profile_fact` thay vì
   `create_memory` vì chứa "tôi là" và nhánh `profile` đứng trước nhánh `memory`. Đã kiểm chứng
   là lỗi có TRƯỚC đợt này (trên `origin/main`, nhánh Profile dòng 141 vốn đứng trước Memory
   dòng 155). Đảo thứ tự có thể hỏng ca khác nên cần đợt riêng đo lại toàn bộ bộ eval.
3. **Điều hướng 5 trụ** — `BottomNav` cho Learning 2 tab còn 4 trụ kia gộp dưới tab Hồ sơ.
   Đây là quyết định sản phẩm, chờ người dùng chốt.

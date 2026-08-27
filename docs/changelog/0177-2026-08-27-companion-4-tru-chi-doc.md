# 0177 — Companion nhìn thấy dữ liệu 4 trụ Career/Work/Startup/Life (chỉ-đọc)

- **Ngày:** 2026-08-27
- **Loại:** feat (chỉ-đọc, không ghi dữ liệu)
- **PR:** (điền sau khi tạo)

## Vấn đề phát hiện qua đợt quét trụ cột

CLAUDE.md mục 1 mô tả Companion là **"tác tử AI xuyên suốt"** cả 5 trụ. Mã thật thì không:

1. **Chỉ trụ Learning có read model nạp vào ngữ cảnh.** `companionRuntime.ts` có đúng một nhánh
   `if (domain === 'learning')` gọi `getLearningReadModel` + `getProgrammingProgressSummary`.
   Hỏi về sự nghiệp/công việc/khởi nghiệp/đời sống thì AI **không thấy** dữ liệu người dùng đã
   nhập ở đúng những trụ đó — dù 4 trụ này có tới 16 bảng dữ liệu và 5 service đầy đủ.
2. **Bộ nhận diện ý định không biết 4 trụ đó tồn tại.** Không có mẫu câu nào cho chúng.
3. **Mặc định rơi về `learning`.** Mọi câu không nhận diện được đều bị gán trụ Học tập, khiến
   Companion nạp ngữ cảnh học tập và nói với LLM "lĩnh vực trọng tâm: learning" ngay cả khi
   người dùng đang hỏi chuyện khác.

## Đã làm — PHẠM VI CHỈ-ĐỌC

Gói này **không thêm khả năng GHI** vào dữ liệu 4 trụ. Companion đọc để trả lời cho đúng ngữ
cảnh; muốn thay đổi dữ liệu thì vẫn phải đi qua `proposedActionService` (người dùng bấm xác
nhận) như mọi hành động có rủi ro khác. Phần ghi để đợt sau, cần đặc tả riêng.

### 1. `packages/core-domains/domainReadModelService.ts` (mới)

Read model tóm tắt cho 4 trụ, cùng khuôn với `core-learner/learningReadModelService`:

| Trụ     | Nội dung tóm tắt                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Career  | vị trí hiện tại/mục tiêu, số năm kinh nghiệm, ngành, số kinh nghiệm đã ghi, số mục tiêu đang theo đuổi, tối đa 5 kỹ năng mục tiêu cần |
| Work    | số dự án đang chạy, đếm việc theo 4 trạng thái, số việc **quá hạn mà chưa xong**, số việc khẩn cấp chưa xong                          |
| Startup | số venture, tên + giai đoạn venture gần nhất, số vấn đề và đếm giả định theo 4 trạng thái **của venture gần nhất**                    |
| Life    | số kế hoạch đang chạy, số thói quen đang bật, chuỗi ngày dài nhất, điểm tự chấm gần nhất                                              |

**Riêng tư — hai ràng buộc có test canh gác:**

- Chỉ trả về **số đếm, trạng thái, tiêu đề ngắn**. `notes` của `wellbeing_checks` (nhật ký cảm
  xúc) **không bao giờ** lọt vào chuỗi ngữ cảnh — có test khẳng định chuỗi bí mật không xuất
  hiện trong cả model lẫn chuỗi đã format.
- Khối tóm tắt chỉ **thực sự** được nạp khi `isConsentActive(personId, domain, purpose)` trong
  `contextEngine` cho phép. Mã mới **không lách cổng này**; nó chỉ đưa `domainState` vào rồi để
  cổng quyết định.

### 2. Nhận diện trụ trong `resolveIntentAndDomain`

Bảng từ khoá **tất định** (không hỏi LLM — bước này chạy trước cả khi dựng ngữ cảnh nên phải rẻ,
nhanh, và cùng câu cho cùng kết quả để test kiểm được).

**Thứ tự nhánh là phần khó nhất.** Lần đặt đầu tiên tôi cho bảng từ khoá chặn đầu mọi nhánh và
làm hỏng ngay: câu "ghi nhớ giúp tôi **cuộc họp** ngày mai" chứa từ khoá trụ Work nên bị cướp
khỏi ý định `create_memory`. Thứ tự đúng: các ý định HÀNH ĐỘNG (tra từ · cập nhật hồ sơ · ghi
nhớ) xét trước, rồi mới tới bảng từ khoá trụ. Riêng nhánh "mục tiêu" — từ chung của cả 5 trụ —
phải hỏi bảng từ khoá trước khi kết luận là mục tiêu HỌC TẬP, nếu không câu "mục tiêu sự nghiệp
của tôi là gì" bị gán `learning`.

**Giới hạn đã ghi rõ trong mã:** câu gọi tên nhiều trụ cùng lúc ("cân bằng cuộc sống và công
việc") lấy trụ đứng trước trong bảng. Không có đáp án đúng duy nhất cho loại câu đó nên bảng cố
ý không cố xử lý; giao diện vẫn truyền `targetDomain` tường minh được và giá trị đó luôn thắng.

### 3. Đổi mặc định `learning` → `general`

`general` không phải giá trị mới bịa ra: `synthesizeCompanionReply` **vốn đã** xử lý riêng
(`domain !== 'general' && domain !== 'all'` → bỏ dòng "lĩnh vực trọng tâm"), tức nó vốn là giá
trị trung tính có chỗ đứng trong mã.

Ba nơi khẳng định mặc định cũ đã được cập nhật **kèm lý do tại chỗ**, không sửa lén:
`companionRuntime.test.ts`, `scripts/eval-v2-routing.test.ts`, và 10 ca `gen-*` trong
`scripts/eval-v2-routing-fixtures.json`.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (6832/6832, 485 file)
Test mới: domainReadModelService.test.ts 11 ca · companionRuntime.test.ts 47 -> 52 ca
Eval định tuyến: 98,39% (61/62) — 4 trụ mới đạt 100%
```

Bộ eval được **mở rộng 50 → 62 ca** (thêm 12 ca cho 4 trụ) — trước đây nó không có ca nào ngoài
Learning/profile/personal.

## Nợ phát hiện thêm (KHÔNG sửa trong đợt này)

Ca eval `mem-7` — "nhớ giúp tôi là tôi mệt" → ra `update_profile_fact` thay vì `create_memory`,
vì câu chứa "tôi là" và nhánh `profile` đứng trước nhánh `memory`. **Đã kiểm chứng là lỗi CÓ
SẴN**: trên `origin/main`, nhánh Profile ở dòng 141 vốn đã đứng trước nhánh Memory ở dòng 155.
Không sửa trong đợt này vì đảo thứ tự hai nhánh đó có thể làm hỏng các ca khác — cần một đợt
riêng có đo lại toàn bộ bộ eval.

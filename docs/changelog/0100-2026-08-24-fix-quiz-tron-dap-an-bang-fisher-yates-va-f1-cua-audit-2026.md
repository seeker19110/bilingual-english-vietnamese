# fix(quiz): trộn đáp án bằng Fisher–Yates — vá F1 của audit 2026-08-24

**Vá lỗi audit F1: người học đoán được đáp án đúng theo VỊ TRÍ.** 16 chỗ trong repo trộn mảng
bằng `arr.sort(() => Math.random() - 0.5)`. Đó không phải thuật toán trộn — `Array.sort` giả định
hàm so sánh nhất quán, còn hàm này trả kết quả ngẫu nhiên mỗi lần gọi. Vì đáp án đúng luôn được
ghép vào **đầu** mảng (`[đúng, ...sai]`) trước khi trộn, vị trí của nó đoán được:

| Vị trí đáp án đúng (4 lựa chọn) | 1         | 2      | 3      | 4         |
| ------------------------------- | --------- | ------ | ------ | --------- |
| Trước khi vá (đo 400.000 lượt)  | **36,0%** | 17,2%  | 15,6%  | **31,2%** |
| Sau khi vá (đo 36.000 câu THẬT) | 25,24%    | 24,67% | 25,08% | 25,01%    |

Bấm luôn ô đầu trước đây ăn **36% thay vì 25%** — điểm tab Kiểm tra và test-out cuối vòng đều
mất ý nghĩa.

**Đã làm:**

- Thêm `packages/core-contracts/shuffle.ts` — Fisher–Yates, **một bản dùng chung cho cả client và
  server**. Nhận tham số `rng` để test tiêm nguồn ngẫu nhiên xác định (nhờ vậy test phân bố KHÔNG
  thành test flaky — đúng Tầng 1b vừa thêm vào quy trình audit). Đặt ở `core-contracts` vì
  `core-ai` đã import gói này ở 19 file → **không tạo cạnh phụ thuộc mới**.
- Thay **16/16** chỗ trộn thiên lệch: `StudyTabs.tsx` (11) · `CefrLessonViews.tsx` (3) ·
  `pvpArenaService.ts` (1) · `neuralCurriculumService.ts` (1). Hai dòng `Math.random() - 0.5` còn
  lại trong `confetti.ts` là dịch chuyển ngẫu nhiên của hạt pháo giấy, KHÔNG phải trộn — giữ nguyên.
- Gộp **3 bản Fisher–Yates nhân bản** (`cefrExam.ts`, `listening.ts`, `Practice.tsx`) về hàm dùng
  chung. Đây chính là cờ đỏ R3 của Tầng 10 ("nhiều bản trộn song song") — trước đó repo vừa có bản
  đúng vừa có bản sai cho cùng một việc.
- Thêm `packages/core-contracts/shuffle.test.ts` (5 test): không đụng mảng gốc · giữ đủ phần tử ·
  ca biên rỗng/1 phần tử · **bất biến phân bố đều với 3 và 4 lựa chọn**.

**Bằng chứng test kiểm đúng thứ cần kiểm (mục 5 Giai đoạn 3 của quy trình audit):** tạm thay hàm
mới bằng thuật toán cũ → 2 test phân bố **FAIL** (`expected 36.202 to be less than 26` và
`expected 43.984 to be less than 34.33`); khôi phục Fisher–Yates → **PASS**.

**⚠️ Thay đổi này LÀM ĐỔI CON SỐ người dùng thấy** (mục 5.3 quy trình audit yêu cầu nêu rõ):
người học quen bấm theo vị trí sẽ thấy điểm tab Kiểm tra / test-out **giảm**. Đó là điểm ĐÚNG —
điểm cũ bị thổi lên bởi lỗi trộn. Không có dữ liệu điểm cũ nào bị sửa lại; chỉ các lượt làm bài
từ nay trở đi mới dùng phép trộn đúng.

**Cổng:** build ✅ · typecheck ✅ · lint ✅ (0 cảnh báo) · format ✅ · test ✅ **5111/5111**
(+5 test mới) · coverage 93,27 / 90,17 / 96,48 / 93,27 (sàn 90) ✅ · **`npm test` 3/3 lượt xanh**
(Tầng 1b) ✅ · size JS **120,69** kB/123 (giảm nhẹ so với 120,72 vì bỏ 3 bản nhân bản) ✅ ·
`codemap impact` cho 3 file sửa: mọi file bị ảnh hưởng đều nằm trong bộ test đang xanh.

**Còn mở từ lượt audit:** F2 (2 test flaky) · F3 (chạy `eval:tutor` — cần key AI của người dùng) ·
F4 (hook `.claude/report-status.sh` nói sai vCPU) · F6 (201 dòng code chết — chờ xác nhận xoá) ·
F7/F8/F9.

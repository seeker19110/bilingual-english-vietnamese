# 0249 — 2026-09-03 — PR-M8: unit Kotlin đầu tiên (`p6-u5`), mở sản phẩm trục "Sổ chi tiêu"

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Cổng §3.4 vừa mở ở đợt trước (changelog 0248, PR #831) nên **PR-M8 được phép bắt đầu**. Đây là
**nội dung Kotlin đầu tiên** của dự án — trước đợt này `kotlinSim` đã dựng xong từ PR-M7 nhưng
chưa có một bài học nào chạy trên nó.

Hiến chương chương trình M xếp track Kotlin vào `p6-u5…u7`, với sản phẩm trục nhỏ **"Sổ chi
tiêu"** tích luỹ qua ba unit: model dữ liệu → null safety + collections/lambda → sealed class
xử lý trạng thái. Đợt này làm chặng đầu.

## Đã làm — unit `p6-u5` "Kotlin nhập môn — model dữ liệu", 3 bài

| Bài        | Tiêu đề                                       | Dạy                                                                                                   |
| ---------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `p6-u5-l1` | Kotlin bắt đầu từ đâu — val, var và chuỗi mẫu | val/var, kiểu tự suy ra, chuỗi mẫu `$`/`${}`, bẫy chia Int                                            |
| `p6-u5-l2` | Hàm và when — tự xếp nhóm cho khoản chi       | hàm + kiểu tham số, hàm một biểu thức, tham số mặc định, `if` là biểu thức, `when` hai kiểu           |
| `p6-u5-l3` | data class — model Khoản chi tử tế            | `data class`, `==` so nội dung, `copy()`, huỷ cấu trúc, list + `sumOf`/`filter`/`count`/`maxByOrNull` |

Đủ 8 bước của khuôn bài học, và **bài l3 kết bằng mini-project chấm được** ("Sổ chi tiêu" bản
đầu tiên, 4 test-case) đúng luật §7 của hiến chương: dự án nằm TRONG bài, không phải bài tập rời.

Kèm theo: unit `p6-u5` thêm vào `curriculum.ts` (dải `u5…u15` vốn đã được chương trình M giữ
chỗ), đăng ký ở `lessons.ts`, và sinh lại `lessonsLazy.ts` bằng `npm run gen:lesson-index`.

## Luật tự khai §3.3 — làm đủ, không làm cho có

- **Luật 2** — bài `l1` có mục "Bộ chạy này KHÔNG làm gì", nội dung bám đúng hằng `KHONG_LAM_GI`
  của `kotlinSim/chayKotlin.ts`. Đã ghi chú ở đầu file: sửa hằng đó thì sửa cả bài này.
- **Luật 3** — không câu nào ngụ ý đang chạy `kotlinc` thật. Bài `l1` mở đầu bằng đúng một đoạn
  nói thẳng: nút Chạy gọi bộ chạy rút gọn của dự án, cú pháp là Kotlin thật nhưng chỉ hiểu một
  phần ngôn ngữ.
- **Luật 4** — cả 3 bước ⑦ đều là làn C, và **không chấm hộ**. Đáng chú ý: mỗi bài về nhà đều
  giao một thí nghiệm chỉ máy thật làm được — l1 gán lại `val` để thấy lỗi xuất hiện lúc BIÊN
  DỊCH; l2 xoá nhánh `else` của `when` để gặp lỗi "phải vét hết trường hợp"; l3 bỏ chữ `data` để
  thấy `toString`/`==` đổi hẳn.
- **Luật 5** — bài `l1` chạm điểm "thời điểm bắt lỗi kiểu" trong bảng `KHAC_BIET` và **nói ra
  ngay trong lý thuyết** (bộ chạy bắt lúc chạy, Kotlin thật bắt lúc biên dịch).

## Một ràng buộc đã KIỂM chứ không đoán

Bộ chạy **không có `readLine()`** — không có stdin cho mạch này (đã kiểm bằng `chayKotlin`, và
đúng như ghi chú trong `chayKotlin.ts`). Nên mọi bài lấy dữ liệu từ HẰNG trong đề và `stdinLines`
luôn rỗng. Trước khi viết một dòng nội dung nào, mọi cấu trúc định dùng (`when` hai kiểu, tham số
mặc định, `data class` + `copy` + `==`, `sumOf`/`filter`/`count`/`maxByOrNull`/`joinToString`,
huỷ cấu trúc) đều đã chạy thử qua `chayKotlin` — không suy đoán năng lực engine.

## Bằng chứng kiểm chứng

- **Cổng nội dung `lessonsKotlin.test.ts`** — dựng sẵn từ PR-M7, nay có bài để chấm: code mẫu cả
  3 bài đạt **8/8 test-case**, ví dụ mẫu chạy không lỗi, không bài nào dùng thứ ngoài tập con.
- **Đối chiếu đáp án `predict` với output THẬT của bộ chạy** cho cả 3 bài — khớp từng chữ. (Đây
  là chỗ dễ sai nhất khi soạn bài: viết đáp án theo trí nhớ rồi bộ chạy in ra thứ khác.)
- **Test trình duyệt thật** (yêu cầu số 4 trong "việc còn lại" của đặc tả bộ chạy, và là bài học
  của PR-M2: cổng CI xanh KHÔNG chứng minh đường đi trong giao diện đúng). Thêm 2 test vào
  `e2e/programming-lesson.spec.ts`, **đã chạy và xanh** (7,6 giây):
  1. `p6-u5-l3` — huy hiệu tự khai "Kotlin · mô phỏng" hiện trước khi vào bài; bấm Xem code mẫu
     rồi Chấm bài thì đạt toàn bộ test ngay trong trình duyệt.
  2. `p6-u5-l1` — gán lại một `val` thì thông báo lỗi tiếng Việt nói được ("khai bằng val nên
     không gán lại được, đổi thành var nếu thật sự cần") tới được mắt học viên.
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **543 file / 10.999 test
  xanh** ✅ · `npm run build` ✅ · `npx prettier --check` ✅.

## Một cổng đã bắt lỗi của tôi (và nó đúng)

`srsCards.test.ts` đánh rớt một thẻ SRS tôi viết: _"Vì sao Kotlin không có toán tử ba ngôi
`? :`?"_ — luật "mỗi thẻ hỏi ĐÚNG MỘT ý" đếm hai dấu `?`, trong đó một dấu là cú pháp Kotlin chứ
không phải câu hỏi thứ hai. Dù là dương tính giả về mặt ý định, **luật vẫn đúng về mặt thẻ**: mặt
trước thẻ chứa ký hiệu dễ gây rối. Đã **sửa thẻ** thành "Kotlin dùng gì thay cho toán tử ba ngôi
của C/Java?", **không sửa cổng**.

## Việc tiếp theo

**PR-M9** — hai unit còn lại của track Kotlin:

- `p6-u6` — **null safety** (trụ cột của Kotlin, và là chỗ `kotlinSim` cố ý bám sát nhất: tính
  null theo KIỂU KHAI BÁO + smart cast) cộng collections/lambda đào sâu.
- `p6-u7` — **sealed class** xử lý trạng thái, khép "Sổ chi tiêu". Đây là chỗ duy nhất `when`
  được miễn nhánh `else` — bài `l2` của đợt này đã gieo sẵn câu đó.

Lưu ý cho phiên sau: bảng `KHAC_BIET` có mục **"Phạm vi smart cast"** — bộ chạy chỉ suy ra từ
`x != null`/`x == null` và `is Kieu` trong `when`, hẹp hơn Kotlin thật. Unit `p6-u6` đụng thẳng
vào điểm này nên **bắt buộc nói ra** (luật 5), và mọi mẫu nằm ngoài phạm vi đó phải viết `!!`
hoặc `?:` cho tường minh.

# docs(research): hiến chương mở rộng ngôn ngữ & tư duy môn Lập trình — chương trình M (2026-08-26)

**Đặc tả:** `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`

Người dùng yêu cầu mở rộng cả ba tầng ngôn ngữ của môn Lập trình: tầng 1 thêm **dòng lệnh
(`bash`)**, tầng 2 thêm **Kotlin** và **Swift**, tầng 3 thêm **PARADIGM** (không thêm ngôn ngữ)
— "theo tiêu chuẩn cao nhất cho học viên". Đợt này là **PR-M0**: hiến chương ràng buộc 12 PR
tiếp theo, soạn TRƯỚC khi viết một dòng nội dung nào, đúng luật research-first của dự án (mọi
bậc P4/P5/P6 đều có hiến chương riêng trước nội dung).

## Phát hiện dẫn tới hiến chương này (đếm thật, không ước lượng)

**6/8 ngôn ngữ đặc tả gốc liệt kê hiện có 0 bài**: Java 0 · C# 0 · Go 0 · C 0 · C++ 0 · Rust 0.
Go và Rust "có track" nhưng cả hai bài đều `language: 'python'` — dạy cơ chế bằng mô hình, đúng
hiến chương P6, nhưng học viên đi hết track vẫn chưa gõ một dòng Go/Rust nào được chấm.

Nghĩa là: **thêm tên vào bảng ngôn ngữ là việc rẻ và vô ích.** Hiến chương vì vậy đặt tiêu chí
nghiệm thu số 1 là _mỗi ngôn ngữ thêm vào phải kèm bộ chạy chấm được, hoặc bị loại_.

Số thật khác đã đo và ghi vào §0.2: môn có **60 bài / 57 unit / 195 thẻ SRS**, trong khi đề
cương gốc ghi riêng P1 đã "~40 bài" — **mỏng hơn 4–5 lần**. Đã nói thẳng với người dùng rằng làm
dày P1–P3 có lợi hơn mở ngôn ngữ thứ 9; người dùng nghe và vẫn chọn mở rộng. Ghi lại là **quyết
định của người dùng** để phiên sau không tưởng là sơ suất.

## Quyết định trụ cột — bộ chạy TẬP CON viết bằng TypeScript, chạy trong Worker

Đây là cách thứ ba, nằm giữa "judge server" (đã bác ở hiến chương P5 §6 và P6 §2, bác lại lần
nữa ở đây) và "mô hình Python" (khuôn Go/Rust). Học viên gõ **cú pháp Swift/Kotlin thật** và
được **chấm bằng test-case**, thứ mà khuôn Go/Rust không làm được.

**Vì sao TypeScript-trong-Worker chứ không phải Python-trong-Pyodide** — cột quyết định là _rủi
ro trôi giữa CI và trình duyệt_. Hiến chương P6 §4 có một ca thật: bài dùng `threading` **xanh ở
CI** (python3 chạy thread bình thường) nhưng **rớt trên máy học viên** (Pyodide không tạo được
thread) — cổng không bắt được vì cổng chạy đúng thứ bị hỏng ở nơi kia. Interpreter viết bằng TS
triệt tiêu hẳn loại lỗi đó: cổng CI và trình duyệt chạy **cùng một đoạn mã**, không phải hai bản
cài đặt của cùng một ngôn ngữ. Cộng thêm: không phải tải ~13MB Pyodide chỉ để chạy Swift.

Không phải phát minh mới — `gitSim.ts` (422 dòng), `httpSimPrelude.ts`, `apiSimPrelude.ts` đã
chạy thật cùng kỹ thuật. Chương trình M nâng nó từ "giả lập một thư viện" lên "giả lập một ngôn
ngữ".

## Ba hàng rào chống "dạy sai âm thầm"

Một interpreter sai còn tệ hơn không có interpreter: nó dạy sai cú pháp cho người mới, và người
mới không có cách nào biết. Nên §3.4 bắt buộc: **bộ test đối chiếu** (mỗi tính năng cú pháp ≥ 1
ca, kết quả phải chạy tay một lần trên trình biên dịch thật rồi ghi nguồn vào đặc tả — cấm suy
đoán từ trí nhớ) · **cổng nội dung** `lessonsSwift.test.ts`/`lessonsKotlin.test.ts` theo khuôn
`lessonsPython.test.ts` · **lỗi phải chỉ đúng số dòng của học viên bằng tiếng Việt**.

Và **luật tự khai** siết chặt hơn P4 vì đối tượng giả lập lần này lớn hơn: bộ chạy in
`[GIA LAP] … khong phai swiftc.` mỗi lượt · mỗi unit có mục **"Bộ chạy này KHÔNG làm gì"** ·
cấm câu chữ ngụ ý đang chạy trình biên dịch thật · bước ⑦ luôn là làn C (Xcode/Android Studio
thật, không chấm hộ).

## Xếp chỗ — không đụng schema

Mã bài `^p[1-6]-u\d+-l\d+$` là **khoá tiến độ Postgres**, nên phương án "hệ bậc song song S1–S5
cho Swift" bị **bác** (phải sửa regex, khoá tiến độ, route, UI, toàn bộ test — phá vỡ, giá trị
thấp). Thay vào đó: `bash` mở rộng `p3-u11` (**không** thêm unit mới vào P3 vì `curriculum.test.ts`
bắt unit cuối bậc phải có `projectStep`, mà `p3-u12` là milestone) · Kotlin `p6-u5…u7` · Swift
`p6-u8…u12` (5 unit — nhiều hơn Kotlin vì người dùng yêu cầu riêng khoá Swift "cơ bản → nâng
cao, đầy đủ chi tiết") · Paradigm `p6-u13…u15`.

**P6 giãn 4 → 15 unit**, nên PR giao diện cuối phải gom nhóm theo track chứ không đổ thành danh
sách dài. P6 vẫn không có chặng dự án trục (hiến chương P6 §7) — dự án của chương trình M nằm
**trong bài học**: mỗi unit một mini-project chấm được, mỗi track một sản phẩm tích luỹ (Kotlin
"Sổ chi tiêu", Swift "Sổ tay học tập"), phần app thật luôn ở làn C.

Tầng 3 **không thêm ngôn ngữ**: ba trụ **F** lập trình hàm (lõi thuần + vỏ hiệu ứng) · **C**
đồng thời & phân tán (kế thừa mô hình xen kẽ tất định của `p6-u2`, vẫn cấm tuyệt đối
`threading`) · **S** thiết kế hệ thống & tư duy kỹ sư (post-mortem luyện trên chính hồ sơ sự cố
của dự án này).

## Cổng đã chốt trong hiến chương

**Cổng giữa M3 và M4:** interpreter Swift phải qua bộ test đối chiếu **trước khi** soạn bài nội
dung nào — soạn 20 bài trên một interpreter chưa kiểm chứng là cách chắc chắn nhất để phải viết
lại cả 20.

## Kiểm chứng

Đợt này **chỉ thêm tài liệu**, không đụng mã nguồn — không có hành vi nào để kiểm chứng bằng
chạy thử. Số liệu trích trong đặc tả đều đếm trực tiếp trên repo tại thời điểm soạn (60 bài / 57
unit / 195 thẻ SRS / 26 bước dự án trục / 11 ngôn ngữ bài học / 6 ngôn ngữ có tên mà 0 bài), và
các điểm chạm code nêu trong §6 đã đọc tận nơi: `lessonTypes.ts` (regex mã bài), `curriculum.test.ts`
(luật unit cuối bậc), `codeRunner.ts` (điểm vào duy nhất chọn bộ chạy), `pyodideWorker.ts` +
`sqlWorker.ts` (giao thức message chung, nạp lười).

## Việc tiếp theo

**PR-M1** — hạ tầng `bash` (`bashSim.ts` + runner + test), theo đúng khuôn `gitSim.ts`. Chọn làm
trước vì rẻ nhất, dùng nhiều nhất, và có tiền lệ gần nhất trong repo.

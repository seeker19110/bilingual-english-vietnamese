# Đặc tả BỘ CHẠY KOTLIN của DHCB (kotlinSim) — PR-M7, 2026-08-27

> Hiến chương ràng buộc: `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`
> (chương trình M) — §3 quyết định trụ cột · §3.3 luật tự khai · §3.4 cổng chất lượng của bộ
> chạy · §8 thứ tự thi hành.
>
> File này là "đặc tả bộ chạy" mà §3.4 yêu cầu: nơi ghi bảng khác biệt đã biết và kết quả đối
> chiếu với trình biên dịch thật.

## 0. Trạng thái — ĐỌC TRƯỚC KHI SOẠN NỘI DUNG

| Việc                                                    | Trạng thái     |
| ------------------------------------------------------- | -------------- |
| Interpreter tập con chạy được, chấm được bằng test-case | ✅ xong        |
| Bộ ca đối chiếu (48 ca) xanh trên bộ chạy DHCB          | ✅ xong        |
| **48 ca đã chạy trên `kotlinc` THẬT và khớp**           | ❌ **CHƯA**    |
| Cổng §3.4 (được phép soạn nội dung Kotlin chưa?)        | ❌ **CHƯA MỞ** |

**Vì sao chưa:** máy dựng PR-M7 không có Kotlin toolchain (`kotlin`/`kotlinc` không có sẵn,
proxy chặn tải). Hiến chương §3.4 cấm suy đoán kết quả từ trí nhớ, nên mọi ca giữ
`daDoiChieu: false` cho tới khi có người chạy thật.

**Cách đóng cổng này (một lệnh, trên máy có Kotlin):**

```bash
npm run kotlin:conformance
```

Script `scripts/kotlin-conformance.ts` sinh một file `.kt` gồm đúng 48 ca, chạy bằng `kotlin`
(hoặc `kotlinc` + `java`), so từng ca với cả kết quả kỳ vọng lẫn output của bộ chạy DHCB, rồi
in ra ca nào lệch. Xong thì:

1. Đặt `daDoiChieu: true` cho các ca đã khớp trong
   `packages/subject-programming/kotlinSim/conformance.ts`.
2. Ghi phiên bản đã dùng (`kotlin -version`) vào mục 4 của file này.
3. Ca nào lệch thì **sửa bộ chạy** (hoặc sửa kỳ vọng nếu kỳ vọng sai), không được bỏ qua.

Cổng `conformance.test.ts` tự canh điều này: hễ còn ca chưa đối chiếu mà đã có bài
`language: 'kotlin'` trong `lessons.ts` thì CI đỏ. Tức là **không thể lỡ tay soạn nội dung
trước**.

## 1. Bộ chạy này LÀ GÌ

Trình thông dịch một **tập con** của Kotlin, viết thuần TypeScript, chạy chung một đoạn mã ở
cổng CI lẫn trình duyệt (hiến chương §3.1 — triệt tiêu loại lỗi "xanh ở CI, rớt ở máy học viên"
mà mạch Python python3-vs-Pyodide từng dính).

Bốn file, mỗi file một việc:

| File             | Việc                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `lexer.ts`       | Tách từ; hiểu nội suy `$ten` và `${…}`, chú thích lồng nhau, tên Unicode |
| `ast.ts`         | Khai kiểu cây cú pháp — **cái gì không có ở đây là bộ chạy không làm**   |
| `parser.ts`      | Đệ quy xuống cho câu lệnh, leo bậc cho biểu thức                         |
| `interpreter.ts` | Duyệt cây, tính-null theo khai báo, smart cast, lớp/data/sealed/enum     |

Điểm vào: `chayKotlin(src)` trong `kotlinSim/chayKotlin.ts`.

> **Vì sao không đặt tên `index.ts`** (khác `swiftSim`): Rollup đặt tên chunk theo tên file, và
> `index-*.js` trùng glob "Initial JS" của `.size-limit.json` — đã dính thật một lần và làm ngân
> sách đội 27 kB. `swiftSim/index.ts` là tàn dư trước bài học đó.

## 2. Quyết định thiết kế đáng nhớ nhất — TÍNH NULL THEO KHAI BÁO, không theo giá trị

`swiftSim` bọc Optional tường minh được vì Swift in ra `Optional("Lan")`. **Kotlin không bọc:**
`val s: String? = "hi"; println(s)` in ra đúng `hi`. Nên không mượn được cách đó.

Nhưng thứ Kotlin dạy nằm ở chỗ khác: `s.length` với `s: String?` là **lỗi biên dịch, kể cả khi
s đang có giá trị**. Nếu bộ chạy chỉ hỏi "giá trị lúc này có null không" thì `s.length` sẽ chạy
ngon lành mỗi khi s khác null — và **dạy sai thói quen cho đúng nhóm người dễ sai nhất**.

Nên: ô biến khai kiểu `T?` mang cờ `coTheNull`, và truy cập `.` không an toàn lên ô đó là lỗi
**ngay**, kèm ba cách sửa (`?.` · `?:` · `!!`) — tái hiện đúng thông điệp của trình biên dịch
thật.

**Hệ quả bắt buộc: phải làm SMART CAST.** Không có nó thì `if (s != null) { s.length }` báo lỗi
oan trong khi Kotlin thật cho phép, mà đó lại là mẫu đầu tiên học viên gặp ở bài null safety.
Phạm vi đã làm: nhánh `then` của `if (x != null)` (kèm `&&`), nhánh `else` của `if (x == null)`,
và `is Kieu` trong `when`.

Null safety là trụ cột mà hiến chương §7 xếp vào track Kotlin, nên nó phải đúng chứ không xấp xỉ.

## 3. Khác biệt ĐÃ BIẾT so với Kotlin thật

Nguồn thi hành là hằng `KHAC_BIET` trong `kotlinSim/chayKotlin.ts` (để nội dung đọc được bằng
code, không chép tay). Bảng dưới đây là bản người đọc:

| Điểm                    | Bộ chạy DHCB                                                                     | Kotlin thật                                         | Vì sao chấp nhận                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Thời điểm bắt lỗi kiểu  | Lúc CHẠY — lỗi hiện khi dòng đó thực thi                                         | Lúc BIÊN DỊCH — sai kiểu thì không chạy dòng nào    | Viết bộ kiểm kiểu tĩnh đầy đủ là một dự án riêng; đổi lại lỗi ở đây chỉ đúng dòng và bằng tiếng Việt |
| Tính null của biến      | Theo KIỂU KHAI BÁO — ô khai `T?` dùng thẳng `.` là lỗi dù giá trị đang khác null | **Y HỆT** — chỗ bộ chạy cố ý bám sát                | Đây là trụ cột của ngôn ngữ, xấp xỉ là dạy sai (xem mục 2)                                           |
| Phạm vi smart cast      | Chỉ từ `x != null` / `x == null` (kèm `&&`) và `is Kieu` trong `when`            | Rộng hơn nhiều, gồm cả sau `return`/`throw` và `?:` | Suy sai còn tệ hơn không suy; bài cần mẫu ngoài phạm vi thì viết `!!` hoặc `?:` cho tường minh       |
| Thứ tự duyệt Map        | Sắp theo khoá, tất định                                                          | Giữ THỨ TỰ CHÈN (LinkedHashMap)                     | Bài học phải chấm được. **Hệ quả bắt buộc: không bài nào được dạy rằng Map giữ thứ tự chèn**         |
| Thuộc tính tính `get()` | Tính MỘT LẦN lúc tạo đối tượng                                                   | Tính LẠI mỗi lần đọc                                | Đủ cho mọi bài của khoá; bài cần tính lại theo trạng thái đổi thì phải dùng hàm                      |
| Tràn số nguyên          | Số của JavaScript — số rất lớn mất độ chính xác                                  | Int 32-bit tràn vòng, Long 64-bit                   | Bài học không đụng ngưỡng đó; nếu có thì phải nói ra                                                 |

**Luật §3.3 số 5: bài nào chạm tới một điểm trong bảng này thì PHẢI nói ra điểm đó.**

## 4. Bộ ca đối chiếu

48 ca, phủ mỗi tính năng cú pháp ít nhất một lần — dữ liệu ở
`packages/subject-programming/kotlinSim/conformance.ts`, cổng ở `conformance.test.ts`.

Nhóm ca: cơ bản (val/var, chia Int, Double in `.0`, nội suy `$`/`${}`, chuỗi ba nháy) · null
safety (in nullable không bọc, `?.`, `?:`, smart cast, `toIntOrNull`, Map trả null) · điều khiển
(`if` là biểu thức, `when` có/không chủ đề, `in` khoảng, `..`/`until`/`downTo`/`step`,
while/do-while/break/continue, for trên danh sách và chuỗi) · hàm (một biểu thức, tham số mặc
định, tham số theo tên, gọi trước khai báo) · lớp (hàm dựng chính, `init`, `open`/`override`,
data class với toString/`==`/copy, huỷ cấu trúc, lớp thường so tham chiếu, thuộc tính `get()`,
interface có hàm mặc định, `object`, sealed + `when is`, enum với `name`/`ordinal`/`values`/tham
số, companion object) · bộ sưu tập và lambda (`listOf`/`mutableListOf`, `map`/`filter` với `it`,
`fold`/`sumOf`/`any`/`all`/`count`, `sortedBy`/`joinToString`, lambda nhiều tham số, Map) ·
chuỗi · ngoại lệ (`try`/`catch`/`finally`) · tên tiếng Việt có dấu · `is`/`!is` · Boolean không
tự suy từ số.

**Phiên bản Kotlin đã đối chiếu:** _(chưa có — điền sau khi chạy `npm run kotlin:conformance`
trên máy có Kotlin)_

## 5. Bộ chạy này KHÔNG làm gì

Nguồn thi hành: hằng `KHONG_LAM_GI` trong `kotlinSim/chayKotlin.ts`. Mỗi unit Kotlin phải có một
mục nói lại đúng danh sách này (§3.3 luật 2):

- không thư viện chuẩn đầy đủ: không `java.*`, không `kotlinx`, không Android SDK;
- không giao diện, không ứng dụng thật — phần đó ở **làn C** (Android Studio trên máy học viên);
- không đa luồng thật: không coroutine, không `suspend`, không `Flow`, không `Thread`;
- không file, không mạng, không đồng hồ (cố ý — để bài học luôn cho cùng kết quả);
- không generic tự viết, không extension function, không toán tử tự định nghĩa, không delegate
  (`by lazy`…);
- không lớp lồng trong lớp — đưa lớp bên trong ra mục cao nhất.

## 6. Hai trần cứng chống treo trình duyệt

- **200.000 bước** thực thi mỗi lượt chạy (chặn `while (true)`);
- **200.000 ký tự** output (chặn vòng lặp in ra hàng MB).

Cả hai đều có test, và thông báo khi chạm trần nói rõ phải kiểm lại vòng lặp.

## 7. Việc còn lại của chương trình M sau PR này

1. **Chạy `npm run kotlin:conformance` trên máy có Kotlin** — đóng cổng §3.4 (mục 0).
2. **Chạy `npm run swift:conformance` trên máy có Swift** — cổng cứng §8, vẫn đang chặn PR-M4.
3. PR-M8…M9: nội dung Kotlin `p6-u5`…`p6-u7` (3 unit) — chỉ được bắt đầu sau bước 1.
4. Khi có bài Kotlin đầu tiên: thêm **test trình duyệt** cho mạch Kotlin, đúng bài học của PR-M2
   (cổng CI xanh KHÔNG chứng minh đường đi trong giao diện đúng).

## 8. Ghi chú thứ tự thi hành — vì sao M7 làm TRƯỚC M4

Hiến chương §8 xếp M4–M6 (nội dung Swift) trước M7 (hạ tầng Kotlin), lý do là "rẻ trước đắt".
Lý do đó **đã đảo chiều**: M4 bị cổng cứng §8 chặn cho tới khi có người chạy đối chiếu Swift
trên máy có Xcode, còn M7 là **bộ chạy khác, không đi qua cổng đó** — `conformance.test.ts` của
Swift chỉ đỏ khi có bài `language: 'swift'`, mà M7 không thêm bài nào.

Nên đổi thứ tự để mạch M không đứng im chờ một việc tay. Cổng cứng giữa M3 và M4 **vẫn nguyên
vẹn**: PR này không mở nó, không chạm vào nó, và không soạn một bài Swift nào.

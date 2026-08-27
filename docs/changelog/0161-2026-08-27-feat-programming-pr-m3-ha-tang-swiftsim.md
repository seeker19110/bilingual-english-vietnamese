# feat(programming): PR-M3 — hạ tầng `swiftsim` (interpreter tập con + bộ đối chiếu) (2026-08-27)

**Đặc tả:** `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md` §3 · §3.3 · §3.4 · §8
(hiến chương chương trình M) · đặc tả bộ chạy mới: `docs/research/dac-ta-bo-chay-swift-2026-08-27.md`

Đợt này là **PR-M3**, PR **đắt nhất** của chương trình M: viết một trình thông dịch **tập con
của Swift** bằng TypeScript, để học viên gõ **cú pháp Swift thật** và được chấm bằng test-case
như mọi bài khác của môn.

Vì sao phải làm thế thay vì dùng khuôn Go/Rust (mô hình bằng Python, cú pháp thật ở làn C):
người dùng yêu cầu khoá Swift "từ cơ bản đến nâng cao, đầy đủ và chi tiết" (§1), tức phải dạy
được CÚ PHÁP. Khuôn Go/Rust trung thực nhưng học viên đi hết track vẫn chưa gõ một dòng Swift
nào được chấm.

## Đã làm

| File                               | Dòng  | Việc                                                                                                 |
| ---------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| `swiftSim/lexer.ts`                | 261   | Tách từ: chuỗi nội suy `\(…)`, chú thích lồng nhau, **tên Unicode tiếng Việt** (Swift cho phép thật) |
| `swiftSim/ast.ts`                  | 148   | Khai kiểu cây cú pháp — cái gì không có ở đây là bộ chạy không làm                                   |
| `swiftSim/parser.ts`               | 917   | Đệ quy xuống cho câu lệnh, leo bậc cho biểu thức                                                     |
| `swiftSim/interpreter.ts`          | 1.509 | Duyệt cây; ngữ nghĩa giá trị/tham chiếu; Optional bọc tường minh                                     |
| `swiftSim/index.ts`                | 113   | Điểm vào + `DONG_TU_KHAI` + `KHONG_LAM_GI` + `KHAC_BIET` (dạng dữ liệu để nội dung không chép tay)   |
| `swiftSim/conformance.ts`          | 41 ca | Bộ đối chiếu: mỗi tính năng cú pháp ≥ 1 ca, **mỗi ca ghi NGUỒN** của kết quả kỳ vọng                 |
| `apps/dhcb/src/lib/swiftRunner.ts` | —     | Lớp nối vào trang bài học, không cần Worker                                                          |

Cú pháp phủ: `let/var` · kiểu cơ bản + suy kiểu · chuỗi nội suy · **Optional đủ 4 lối** (`if let`,
`guard let`, `??`, `?.`, `!`) · `if/else if/else` · `for-in` (khoảng, mảng, chuỗi, từ điển) ·
`while` · `repeat-while` · `switch` (giá trị, enum, `where`, không rơi tầng) · `break/continue` ·
`func` (nhãn tham số, mặc định, `_`) · đóng (closure) kể cả `$0` và đóng đuôi · `struct` (giá
trị, memberwise init, `mutating`, thuộc tính tính, `static`) · `class` (tham chiếu, `init`, kế
thừa, `override`) · `enum` (đơn giản, `rawValue`, associated values) · `protocol` (**kiểm tuân
thủ thật**) · generic · `throws`/`do-catch`/`try?` · mảng/từ điển/chuỗi và các phương thức hay dùng.

## Bộ ca đối chiếu và CỔNG CỨNG §8 — phần quan trọng nhất của đợt này

Hiến chương §3.4: _"một interpreter sai âm thầm còn tệ hơn không có interpreter — nó dạy sai cú
pháp cho người mới, và người mới không có cách nào biết"_. Nên có **41 ca đối chiếu**, mỗi ca
ghi rõ **nguồn** của kết quả kỳ vọng (mục nào của tài liệu ngôn ngữ Swift). Cả 41 xanh trên bộ
chạy DHCB.

**Nhưng §3.4 còn đòi thêm: mỗi ca phải được chạy MỘT LẦN trên trình biên dịch THẬT, "không suy
đoán từ trí nhớ". Điều đó CHƯA làm được và tuyệt đối không được vờ như đã làm:** máy dựng PR
này không có Swift toolchain (`swift`/`swiftc` không có; proxy chặn tải từ swift.org — đã thử,
trả 403).

Cách xử lý, để việc này không trôi vào quên lãng:

1. Mọi ca giữ `daDoiChieu: false`.
2. Thêm `npm run swift:conformance` — sinh một file `.swift` chứa đúng 41 ca, chạy bằng `swift`
   nếu máy có, so từng ca với **cả** kết quả kỳ vọng **lẫn** output của bộ chạy DHCB, in ra ca
   nào lệch, thoát mã 1 nếu có lệch. Người dùng chạy **một lệnh** trên máy có Xcode là xong.
3. **`conformance.test.ts` canh cổng cứng §8 bằng code**: hễ còn ca chưa đối chiếu mà đã có bài
   `language: 'swift'` trong `lessons.ts` thì **CI đỏ**. Tức là không thể lỡ tay soạn nội dung
   Swift trước khi đóng cổng — đúng thứ tự hiến chương đã chốt.

## Quyết định thiết kế: Optional được BỌC TƯỜNG MINH

Một giá trị `String?` là một hộp bọc quanh chuỗi, không phải chuỗi trần. Nhờ vậy:

- `print(ten)` với `ten: String?` in ra `Optional("Lan")` — **y như Swift thật**, chứ không im
  lặng in `Lan` rồi để học viên ngã ngửa khi gặp trình biên dịch thật;
- dùng thẳng Optional vào phép tính thì báo lỗi đúng chỗ, kèm **ba** cách mở gói;
- `!` mở gói `nil` thì dừng kèm câu nói rõ đây là crash kinh điển của người mới học Swift.

Optional là trụ cột §7 xếp cho track Swift nên phải đúng, không được xấp xỉ.

## Sáu lỗi thật do chính test bắt được trong lúc dựng

Ghi lại vì chúng là bằng chứng cổng đang làm việc, không phải test cho có:

1. Đóng một dòng bị chạy **hai lần** → `print` trong closure nhân đôi âm thầm.
2. `$0`/`$1` chưa được tách từ.
3. `_ = f()` (bỏ kết quả) chưa phân tích được.
4. Đóng đuôi sau lời gọi (`reduce(0) { … }`) chưa gắn đúng.
5. `a?.ten` trả về giá trị trần thay vì Optional — sai bản chất chuỗi tuỳ chọn.
6. `self.x = …` trong `init` bị bản sao cục bộ **ghi đè ngược** → thuộc tính thành `nil`.

Cộng thêm hai điểm cú pháp thiếu mà cổng lỗi bắt ra: `var ten: String { get }` của protocol, và
`if let x: Int = a` (khai kiểu khi mở gói).

## Bằng chứng kiểm chứng (chạy thật trong phiên này)

| Cổng                        | Kết quả                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run typecheck`         | ✅ xanh (4 project)                                                                                   |
| `npm run lint`              | ✅ 0 cảnh báo                                                                                         |
| `npx prettier --check .`    | ✅ sạch                                                                                               |
| `npm test`                  | ✅ **6.356 test** xanh (6.202 → 6.356; +148 test của swiftSim)                                        |
| `npm run build`             | ✅ app + hub + server                                                                                 |
| `npm run budget`            | ✅ Initial JS 124,06/140 kB · CSS 15,87/18 kB — **không đổi** (bộ chạy nằm trong chunk trang bài học) |
| `npm run test:coverage`     | ✅ branches **90,45%** / sàn 90                                                                       |
| `npm run swift:conformance` | ⚠️ sinh file đúng 41 ca; máy này không có `swift` nên **chưa đối chiếu được** (xem trên)              |

**Coverage — lại đúng cái bẫy của PR-M1, nhưng lần này đã lường trước:** bản test đầu chỉ đưa
branches toàn dự án xuống **89,20%**. Thay vì viết test lấy độ phủ, đã thêm cổng **"lỗi phải nói
được"** (`swiftSim/loi.test.ts`): mỗi ca kiểm HAI thứ — lỗi có được bắt không, và thông điệp có
chỉ đúng cách sửa không. Đó chính là yêu cầu §3.4, và phủ luôn các nhánh còn trống một cách
chính đáng. Kết quả: 90,45%.

## Việc tiếp theo

1. **VIỆC TAY của người dùng:** chạy `npm run swift:conformance` trên máy có Xcode/Swift để đóng
   cổng cứng §8. Chưa có bước này thì PR-M4 (nội dung Swift) **không được bắt đầu** — và CI sẽ
   tự chặn nếu ai đó quên.
2. PR-M4…M6: nội dung Swift `p6-u8`…`p6-u12`.
3. Khi có bài Swift đầu tiên: thêm **test trình duyệt** cho mạch Swift — bài học của PR-M2, cổng
   CI xanh không chứng minh đường đi trong giao diện đúng.

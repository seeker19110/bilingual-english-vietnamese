# feat(programming): PR-M7 — hạ tầng `kotlinSim` (bộ chạy Kotlin rút gọn) (2026-08-27)

**Nhánh:** `claude/check-next-tasks-5ia6r2`

## Bối cảnh — vì sao làm M7 TRƯỚC M4

Hiến chương chương trình M §8 xếp M4–M6 (nội dung Swift) trước M7 (hạ tầng Kotlin), lý do là
"rẻ trước đắt". **Lý do đó đã đảo chiều:** M4 bị cổng cứng §8 chặn cho tới khi có người chạy
`npm run swift:conformance` trên máy có Xcode — một việc tay không ai làm được thay. Còn M7 là
**bộ chạy khác, không đi qua cổng đó**: `conformance.test.ts` của Swift chỉ đỏ khi có bài
`language: 'swift'`, mà M7 không thêm bài nào.

Nên đổi thứ tự để mạch M không đứng im chờ một việc tay. **Cổng cứng giữa M3 và M4 vẫn nguyên
vẹn** — PR này không mở nó, không chạm vào nó, và không soạn một bài Swift nào.

Người dùng đã duyệt việc đảo thứ tự này trước khi thi hành.

## Đã làm

**Bộ chạy** — `packages/subject-programming/kotlinSim/`, **5.972 dòng** gồm cả test:

| File             | Việc                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `lexer.ts`       | Tách từ: nội suy `$ten` và `${…}`, chuỗi ba nháy, chú thích lồng, Unicode |
| `ast.ts`         | Cây cú pháp — cái gì không có ở đây là bộ chạy không làm                  |
| `parser.ts`      | Đệ quy xuống cho câu lệnh, leo bậc cho biểu thức                          |
| `interpreter.ts` | Ngữ nghĩa: tính-null theo khai báo, smart cast, lớp/data/sealed/enum      |
| `chayKotlin.ts`  | Điểm vào + `DONG_TU_KHAI` · `KHONG_LAM_GI` · `KHAC_BIET`                  |

**Bốn cổng** (347 ca): `conformance.test.ts` (48 ca đối chiếu ngữ nghĩa ngôn ngữ) ·
`thuVien.test.ts` (bề mặt thư viện dựng sẵn) · `loi.test.ts` (chất lượng thông báo lỗi theo
§3.4) · `caBien.test.ts` (đường lỗi và các góc ít đi tới).

**Nối vào ứng dụng:** `kotlinRunner.ts` + test · nhánh `kotlin` trong `codeRunner.ts` ·
`'kotlin'` trong `LESSON_LANGUAGES` · huy hiệu `LangBadge` (khai "mô phỏng") ·
`lessonsKotlin.test.ts` (cổng nội dung dựng sẵn cho PR-M8) · `npm run kotlin:conformance`.

**Đặc tả bộ chạy:** `docs/research/dac-ta-bo-chay-kotlin-2026-08-27.md`.

## Quyết định trụ cột — TÍNH NULL THEO KHAI BÁO, không theo giá trị

`swiftSim` bọc Optional tường minh được vì Swift in ra `Optional("Lan")`. **Kotlin không bọc:**
`val s: String? = "hi"; println(s)` in ra đúng `hi`. Nên không mượn được cách đó.

Nhưng thứ Kotlin dạy nằm ở chỗ khác: `s.length` với `s: String?` là **lỗi biên dịch kể cả khi s
đang có giá trị**. Nếu bộ chạy chỉ hỏi "giá trị lúc này có null không" thì `s.length` sẽ chạy
ngon lành mỗi khi s khác null — và **dạy sai thói quen cho đúng nhóm người dễ sai nhất**.

Nên ô biến khai `T?` mang cờ `coTheNull`, và dùng thẳng dấu `.` lên ô đó là lỗi ngay, kèm ba
cách sửa (`?.` · `?:` · `!!`).

**Hệ quả bắt buộc: phải làm SMART CAST.** Không có nó thì `if (s != null) { s.length }` báo lỗi
oan trong khi Kotlin thật cho phép — mà đó là mẫu đầu tiên học viên gặp ở bài null safety. Phạm
vi cố ý hẹp (`x != null` kèm `&&`, nhánh else của `x == null`, `is Kieu` trong `when`): **suy sai
còn tệ hơn không suy**, và chỗ hẹp đó đã ghi vào bảng khác biệt để bài học nói ra.

## Quyết định kèm theo

- **Tên file điểm vào là `chayKotlin.ts`, KHÔNG phải `index.ts`** — Rollup đặt tên chunk theo tên
  file và `index-*.js` trùng glob "Initial JS" của `.size-limit.json`. `swiftSim/index.ts` là tàn
  dư trước bài học đó.
- **Ngoại lệ là KIỂU GIÁ TRỊ riêng (`ngoaiLe`), không phải chuỗi.** Ban đầu tôi lưu ngoại lệ dưới
  dạng chuỗi thông điệp; `catch (e: IllegalStateException)` khi đó không khớp được vì mọi ngoại
  lệ đều mang kiểu `String`. Sửa thành kiểu riêng mang tên lớp, kèm cây thừa kế rút gọn để
  `catch (e: Exception)` bắt tất cả, và `toString()` trả đúng dạng JVM `java.lang.X: msg`
  (ca đối chiếu K82 canh).
- **Bộ sinh file đối chiếu có chốt chặn `fun main`.** File `.kt` sinh ra có `fun main()` của
  riêng nó, nên ca nào tự khai `fun main` sẽ trùng tên và `kotlinc` không dịch được — hỏng IM
  LẶNG vì máy dựng PR không có Kotlin để phát hiện. Nay script báo to ngay lúc sinh. Ca K32 đã
  đổi tên hàm cho khỏi đụng.

## Bằng chứng kiểm chứng

- `npm test` — **497 file, 7.427 test, toàn bộ xanh** (kotlinSim đóng góp 347 ca).
- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run format:check` · `npm run build` — sạch.
- `npm run budget`: Initial JS 124,83/140 kB · CSS 16,23/18 kB.
- **Xác nhận bộ chạy KHÔNG rơi vào Initial JS:** `grep -rl "GIA LAP. Bo chay Kotlin" dist/` chỉ
  trúng `dist/js/grading-*.js`, tức chunk lười.
- `npm run kotlin:conformance` chạy được, sinh đúng 48 ca và báo máy này không có Kotlin.

### Coverage — việc phát sinh đáng ghi

Bản đầu của bộ chạy làm **branches tụt từ 90,43% xuống 88,75%**, tức **CI sẽ đỏ** (sàn 90).
Đúng loại rủi ro mà mục nợ kỹ thuật "biên độ coverage mỏng" đã cảnh báo. Cách xử lý: **viết
thêm test, không nâng ngưỡng** — thêm `thuVien.test.ts` và `caBien.test.ts` phủ bề mặt thư viện
và đường lỗi (đó cũng chính là phần học viên gặp nhiều nhất). Kết quả **90,29%**, qua sàn.

**Biên độ nay còn 0,29 điểm** (trước PR là 0,43) — đã ghi vào PROGRESS.md.

## Việc để ngỏ (cố ý)

- **48 ca đối chiếu CHƯA chạy trên `kotlinc` thật** — máy dựng PR không có Kotlin, proxy chặn
  tải. Mọi ca giữ `daDoiChieu: false`, và `conformance.test.ts` tự chặn PR-M8 cho tới khi việc
  tay này xong. Ghi ở mục "Cần làm tay" của PROGRESS.md.
- Cổng cứng §8 của Swift **vẫn chưa mở** — PR-M4 vẫn bị chặn, không đổi.
- Chưa có test trình duyệt cho mạch Kotlin (bài học PR-M2: cổng CI xanh không chứng minh đường
  đi trong giao diện đúng) — làm cùng bài Kotlin đầu tiên ở PR-M8.

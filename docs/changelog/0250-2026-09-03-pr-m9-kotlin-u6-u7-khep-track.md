# 0250 — 2026-09-03 — PR-M9: `p6-u6` + `p6-u7`, khép track Kotlin và sản phẩm "Sổ chi tiêu"

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

PR-M8 (changelog 0249) làm chặng đầu của track Kotlin. Đợt này làm nốt hai chặng còn lại, khép
trọn `p6-u5…u7` và sản phẩm trục **"Sổ chi tiêu"** theo đúng cung mà hiến chương chương trình M
đặt ra: model dữ liệu → null safety + collections/lambda → sealed class xử lý trạng thái.

## Đã làm — 2 unit, 4 bài

| Bài        | Tiêu đề                                   | Dạy                                                                                            |
| ---------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `p6-u6-l1` | Null safety — thứ làm nên tên tuổi Kotlin | `T?`, `?.`, `?:`, `!!`, smart cast, `toIntOrNull`                                              |
| `p6-u6-l2` | Lambda và collections                     | `it`, `filter`/`map`/`sumOf`/`count`/`any`/`groupBy`, đuôi `OrNull`, ô null trong dữ liệu thật |
| `p6-u7-l1` | sealed class — kể hết các trạng thái      | `sealed class`, `object` vs `data class`, `when is` + smart cast theo kiểu                     |
| `p6-u7-l2` | Sổ chi tiêu hoàn chỉnh                    | Ghép cả ba unit: model → xử lý → trạng thái; hàm thuần dựng trạng thái; ca biên sổ rỗng        |

Bài `u7-l2` là **dự án khép track**: nối thẳng sang làn C vì đúng bộ khung một app Android thật
dùng (`TrangThai` cho giao diện quan sát, `dungTrangThai` trong lớp giữ trạng thái, `when (t)` ở
chỗ vẽ).

## Phát hiện đáng kể: một khác biệt CHƯA có trong bảng

Dò engine trước khi soạn (đúng quy trình PR-M8) thì lộ ra:

> **`when` dùng làm biểu thức mà không khớp nhánh nào → bộ chạy trả `kotlin.Unit` và chạy tiếp.
> Kotlin thật KHÔNG DỊCH NỔI.**

Điểm này **chưa nằm trong hằng `KHAC_BIET`**, mà nó lại đúng chỗ hiểm nhất của unit `p6-u7`:
lợi ích chính của sealed class là _trình biên dịch bắt lỗi khi bạn quên một nhánh_ — và đó lại
chính là thứ bộ chạy KHÔNG làm được. Dạy sealed class mà im chuyện này là để học viên tin vào
một bảo đảm không tồn tại trong môi trường họ đang gõ.

Đã xử lý đúng luật §3.3 (luật 5): **bổ sung điểm này vào `KHAC_BIET`** của
`kotlinSim/chayKotlin.ts` kèm lý do, rồi bài `u7-l1` **nói thẳng ra** trong phần lý thuyết và
giao việc kiểm chứng sang làn C (xoá một nhánh `when` rồi biên dịch trên máy thật, ghi lại
nguyên văn câu "when expression must be exhaustive").

Hai điểm khác biệt sẵn có cũng được nói ra đúng chỗ: **phạm vi smart cast hẹp hơn** Kotlin thật
(`u6-l1`) và **Map duyệt theo khoá chứ không theo thứ tự chèn** (`u6-l2`, nơi dùng `groupBy`).

## Ba giới hạn engine phát hiện bằng cách dò, không đoán

Đều đã tránh trong nội dung, không bài nào dạy thứ chạy không được:

- **không có `let`** — engine báo thẳng "Kieu String khong co let".
- **không có `mapNotNull`** (nhưng CÓ `filterNotNull`).
- **không có `when (val t = ...)`** — dạng khai báo ngay trong chủ đề của `when`. Kotlin thật có.
  Nội dung chuyển sang `val t = ...` rồi `when (t)`, tương đương và cũng idiomatic.

Cái thứ ba chỉ lộ ra khi chạy code mẫu qua bộ chấm — nếu soạn theo trí nhớ Kotlin thì cả bài
`u7-l2` đã hỏng.

## Bằng chứng kiểm chứng

- **Cổng nội dung `lessonsKotlin.test.ts`**: 7 bài Kotlin (3 của M8 + 4 của M9), code mẫu đạt
  **hết test-case**, ví dụ mẫu chạy sạch, không bài nào dùng thứ ngoài tập con.
- **Đối chiếu đáp án `predict` với output THẬT** của bộ chạy cho cả 4 bài — khớp từng chữ.
- **Test trình duyệt**: thêm 2 test (tổng mạch Kotlin nay 4), **đã chạy xanh 11,6 giây**:
  `p6-u7-l2` chấm được trong trình duyệt (bài nặng cú pháp nhất — sealed class), và `p6-u6-l1`
  dùng thẳng dấu `.` trên kiểu có thể null thì thông báo **nêu đủ ba cách sửa** tới mắt học viên.
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **543 file / 11.039 test
  xanh** ✅ · `npm run build` ✅ · `npx prettier --check` ✅.

## Ba cổng đã bắt lỗi của tôi (và cả ba đều đúng)

1. **`srsCards.test.ts`** — 2 thẻ chứa cú pháp Kotlin có dấu `?` (`String?`, `?.`/`?:`) nên bị
   luật "mỗi thẻ hỏi đúng một ý" đếm thành hai câu hỏi. Đã **sửa thẻ** (diễn đạt bằng lời thay
   vì ký hiệu), không sửa cổng. Lần thứ hai luật này bắt đúng kiểu lỗi đó — đáng ghi nhớ khi
   soạn thẻ cho ngôn ngữ mà `?` là cú pháp.
2. **`lessonMarkdown.test.ts`** — `**không cần nhánh \`else\`**`: inline code LỒNG trong bold thì
   trình dựng markdown không xử lý, backtick lọt nguyên ra màn hình. Đã bỏ lồng.
3. **ESLint `no-useless-escape`** — `\$nhom` trong template literal là escape thừa (chỉ `\${` mới
   cần). Không đổi nội dung sinh ra, nhưng vẫn phải sạch.

## Việc tiếp theo

**Track Kotlin của chương trình M nay XONG TRỌN VẸN** (`p6-u5` · `p6-u6` · `p6-u7`). Còn lại:

- **PR-M4…M6** — nội dung Swift `p6-u8…u12`, **vẫn bị cổng cứng §8 chặn**: đã thử lại 2026-09-03,
  `download.swift.org` không tới được và GitHub swiftlang trả 403. Cần máy có Swift toolchain.
- **PR-M10…M11** — nội dung Paradigm `p6-u13…u15`. **Không đi qua cổng nào đang đóng** (không
  thêm ngôn ngữ mới), nên đây là mạch M duy nhất còn đi tiếp được ngay.
- **PR-M12** — giao diện: gom nhóm 15 unit P6 theo track, nhãn ngôn ngữ, a11y, e2e.

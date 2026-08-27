# Đặc tả BỘ CHẠY SWIFT của DHCB (swiftSim) — PR-M3, 2026-08-27

> Hiến chương ràng buộc: `docs/research/dac-ta-mo-rong-ngon-ngu-va-tu-duy-2026-08-26.md`
> (chương trình M) — §3 quyết định trụ cột · §3.3 luật tự khai · §3.4 cổng chất lượng của bộ
> chạy · §8 thứ tự thi hành và cổng cứng giữa M3 và M4.
>
> File này là "đặc tả bộ chạy" mà §3.4 yêu cầu: nơi ghi bảng khác biệt đã biết và kết quả đối
> chiếu với trình biên dịch thật.

## 0. Trạng thái — ĐỌC TRƯỚC KHI SOẠN NỘI DUNG

| Việc                                                    | Trạng thái     |
| ------------------------------------------------------- | -------------- |
| Interpreter tập con chạy được, chấm được bằng test-case | ✅ xong        |
| Bộ ca đối chiếu (41 ca) xanh trên bộ chạy DHCB          | ✅ xong        |
| **41 ca đã chạy trên `swift` THẬT và khớp**             | ❌ **CHƯA**    |
| Cổng cứng §8 (được phép soạn nội dung Swift chưa?)      | ❌ **CHƯA MỞ** |

**Vì sao chưa:** máy dựng PR-M3 không có Swift toolchain (`swift`/`swiftc` không có sẵn; proxy
chặn tải từ swift.org — đã thử, trả 403). Hiến chương §3.4 cấm suy đoán kết quả từ trí nhớ, nên
mọi ca giữ `daDoiChieu: false` cho tới khi có người chạy thật.

**Cách đóng cổng này (một lệnh, trên máy có Xcode hoặc Swift toolchain):**

```bash
npm run swift:conformance
```

Script `scripts/swift-conformance.ts` sinh một file `.swift` chứa đúng 41 ca, chạy bằng `swift`,
so từng ca với cả kết quả kỳ vọng lẫn output của bộ chạy DHCB, rồi in ra ca nào lệch. Xong thì:

1. Đặt `daDoiChieu: true` cho các ca đã khớp trong `packages/subject-programming/swiftSim/conformance.ts`.
2. Ghi phiên bản đã dùng (`swift --version`) vào mục 4 của file này.
3. Ca nào lệch thì **sửa bộ chạy** (hoặc sửa kỳ vọng nếu kỳ vọng sai), không được bỏ qua.

Cổng `conformance.test.ts` tự canh điều này: hễ còn ca chưa đối chiếu mà đã có bài
`language: 'swift'` trong `lessons.ts` thì CI đỏ. Tức là **không thể lỡ tay soạn nội dung trước**.

## 1. Bộ chạy này LÀ GÌ

Trình thông dịch một **tập con** của Swift, viết thuần TypeScript, chạy chung một đoạn mã ở cổng
CI lẫn trình duyệt (hiến chương §3.1 — triệt tiêu loại lỗi "xanh ở CI, rớt ở máy học viên" mà
mạch Python python3-vs-Pyodide từng dính).

Bốn file, mỗi file một việc:

| File             | Việc                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `lexer.ts`       | Tách từ; hiểu chuỗi nội suy `\(…)`, chú thích lồng nhau, tên Unicode   |
| `ast.ts`         | Khai kiểu cây cú pháp — **cái gì không có ở đây là bộ chạy không làm** |
| `parser.ts`      | Đệ quy xuống cho câu lệnh, leo bậc cho biểu thức                       |
| `interpreter.ts` | Duyệt cây, ngữ nghĩa giá trị/tham chiếu, Optional bọc tường minh       |

Điểm vào: `chaySwift(src)` trong `swiftSim/index.ts`.

## 2. Quyết định thiết kế đáng nhớ nhất — Optional BỌC TƯỜNG MINH

Một giá trị `String?` trong bộ chạy là `{k:'tuyChon'}` **bọc quanh** chuỗi, không phải chuỗi
trần. Nhờ vậy bộ chạy làm đúng ba việc mà người mới học Swift vấp nhiều nhất:

- `print(ten)` với `ten: String?` in ra `Optional("Lan")` — y như Swift thật, chứ không im lặng
  in `Lan` rồi để học viên ngã ngửa khi gặp trình biên dịch thật;
- dùng thẳng một Optional vào phép tính thì báo lỗi **đúng chỗ**, kèm **ba** cách mở gói
  (`if let` · `??` · `!`);
- `!` mở gói một `nil` thì dừng với thông điệp nói rõ đây chính là crash kinh điển.

Optional là trụ cột mà hiến chương §7 xếp vào track Swift, nên nó phải đúng chứ không xấp xỉ.

## 3. Khác biệt ĐÃ BIẾT so với Swift thật

Nguồn thi hành là hằng `KHAC_BIET` trong `swiftSim/index.ts` (để nội dung đọc được bằng code,
không chép tay). Bảng dưới đây là bản người đọc:

| Điểm                    | Bộ chạy DHCB                                               | Swift thật                                       | Vì sao chấp nhận                                                                                     |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Thời điểm bắt lỗi kiểu  | Lúc CHẠY — lỗi hiện khi dòng đó thực thi                   | Lúc BIÊN DỊCH — sai kiểu thì không chạy dòng nào | Viết bộ kiểm kiểu tĩnh đầy đủ là một dự án riêng; đổi lại lỗi ở đây chỉ đúng dòng và bằng tiếng Việt |
| Thứ tự duyệt từ điển    | Sắp theo khoá, tất định                                    | KHÔNG bảo đảm thứ tự                             | Bài học phải chấm được. **Hệ quả bắt buộc: không bài nào được dạy rằng từ điển có thứ tự**           |
| Đóng (closure) một dòng | Trả về biểu thức cuối kể cả khi thân dài hơn một biểu thức | Chỉ suy ra ngầm khi thân đúng một biểu thức      | Nới cho người mới; bài học vẫn nên viết `return`                                                     |
| Tràn số nguyên          | Số của JavaScript — số rất lớn mất độ chính xác            | Int 64-bit, tràn là dừng chương trình            | Bài học không đụng ngưỡng đó; nếu có thì phải nói ra                                                 |

**Luật §3.3 số 5: bài nào chạm tới một điểm trong bảng này thì PHẢI nói ra điểm đó.**

## 4. Bộ ca đối chiếu

41 ca, phủ mỗi tính năng cú pháp ít nhất một lần — dữ liệu ở
`packages/subject-programming/swiftSim/conformance.ts`, cổng ở `conformance.test.ts`.

Nhóm ca: cơ bản (let/var, chia Int, Double in `.0`, nội suy) · Optional (in `Optional(…)`,
`if let`, `??`, `Int(String)`, `guard let`, `?.`) · điều khiển (if/else, khoảng đóng và nửa mở,
while, repeat-while, switch không rơi tầng, `where`, break/continue) · hàm (nhãn tham số, mặc
định, `_`) · kiểu (struct là giá trị, class là tham chiếu, memberwise init, `mutating`, thuộc
tính tính, kế thừa) · enum (đơn giản, rawValue, associated values) · protocol · generic · lỗi
(`throws`/`do-catch`/`try?`) · bộ sưu tập (mảng, `map/filter/reduce`, `sorted`, từ điển trả
Optional, `first`) · chuỗi · tên Unicode tiếng Việt.

**Phiên bản Swift đã đối chiếu:** _(chưa có — điền sau khi chạy `npm run swift:conformance` trên
máy có Swift)_

## 5. Bộ chạy này KHÔNG làm gì

Nguồn thi hành: hằng `KHONG_LAM_GI` trong `swiftSim/index.ts`. Mỗi unit Swift phải có một mục
nói lại đúng danh sách này (§3.3 luật 2):

- không thư viện chuẩn đầy đủ: không Foundation, không SwiftUI, không UIKit;
- không giao diện, không ứng dụng thật — phần đó ở **làn C** (Xcode trên máy học viên);
- không đa luồng thật: không `async/await`, không `Task`, không `actor`;
- không quản lý bộ nhớ thật: không ARC, không `weak`/`unowned`;
- không file, không mạng, không đồng hồ (cố ý — để bài học luôn cho cùng kết quả);
- cú pháp chỉ phủ tập con: không `extension`, không subscript tự viết, không toán tử tự định
  nghĩa, không generic ràng buộc phức tạp.

## 6. Hai trần cứng chống treo trình duyệt

- **200.000 bước** thực thi mỗi lượt chạy (chặn `while true`);
- **200.000 ký tự** output (chặn vòng lặp in ra hàng MB).

Cả hai đều có test, và thông báo khi chạm trần nói rõ phải kiểm lại vòng lặp.

## 7. Việc còn lại của chương trình M sau PR này

1. **Chạy `npm run swift:conformance` trên máy có Swift** — đóng cổng cứng §8 (mục 0).
2. PR-M4…M6: nội dung Swift `p6-u8`…`p6-u12` (5 unit) — chỉ được bắt đầu sau bước 1.
3. Khi có bài Swift đầu tiên: thêm **test trình duyệt** cho mạch Swift, đúng bài học của PR-M2
   (cổng CI xanh KHÔNG chứng minh đường đi trong giao diện đúng).

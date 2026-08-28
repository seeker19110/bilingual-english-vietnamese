# fix(kotlinSim): `super.f()` gọi vòng vô tận + nới biên độ coverage (2026-08-28)

**Nhánh:** `claude/hien-trang-du-an-dbch0x`

## Bối cảnh

Người dùng hỏi hiện trạng dự án rồi yêu cầu "làm hết những gì có thể" từ danh sách nợ kỹ thuật.
Hai món đầu (`eval:tutor --write-baseline`, áp `nginx/en-vi.conf`) đều cần khoá thật/quyền VPS
nên không làm được trong phiên. Món thứ ba làm được: **biên độ coverage chỉ còn 0,27 điểm** trên
sàn 90 — mỏng tới mức một PR quên viết test là CI đỏ.

Đi tìm chỗ thiếu test thì bắt được một lỗi thật.

## 1. LỖI THẬT: `super.f()` gọi vòng vô tận, làm sập bộ chạy

`packages/subject-programming/kotlinSim/interpreter.ts` xử lý `super` bằng cách **trả về chính
`this`**:

```ts
case 'super': {
  const o = mt.timO('this')
  ...
  return o.gia          // ← chính là đối tượng hiện tại
}
```

Nên `super.f()` trong thân một hàm `override fun f()` phân giải động **về đúng hàm vừa ghi đè**
và gọi lại chính nó. Tái hiện được:

```kotlin
open class A { open fun f() = "A" }
class B : A() { override fun f() = super.f() + "B" }
println(B().f())
```

Kết quả trước khi sửa: **`RangeError: Maximum call stack size exceeded` của JavaScript thoát ra
NGOÀI `chayKotlin()`** — không phải lỗi tiếng Việt có số dòng như mọi lỗi khác, mà là ngoại lệ
động cơ. `chayKotlin()` chỉ bắt `LoiKotlin`/`LoiNem` rồi `throw e` cho phần còn lại, nên trong
trình duyệt nó làm sập cả runner chứ không hiện thông báo cho học viên.

Vì sao chưa ai bắt được: 1512 test của môn Lập trình không có ca nào dùng `super.`, và grep toàn
repo xác nhận **chưa bài học nào chạm tới** — nên đường sửa an toàn.

### Cách sửa

`super` cần biết lớp CHA của **lớp khai phương thức đang chạy dở**, chứ không phải lớp của đối
tượng: chỉ biết lớp đối tượng thì `super.f()` lại tìm ra đúng `f` vừa ghi đè (và với chuỗi ba
tầng thì vẫn lặp vô tận).

- `timHam()` tách thành `timHamKemLop()` trả kèm **tên lớp đã khai** hàm tìm được (`timHam` giữ
  nguyên chữ ký, gọi lại hàm mới — 3 điểm gọi cũ không phải đổi).
- Khi dựng môi trường cho một phương thức, ghi thêm khoá ẩn `super$lop` = lớp cha của lớp khai
  báo. Tên có `$` nên lexer (chỉ nhận `\p{L}\p{N}_`) không sinh ra định danh trùng được — có ca
  kiểm canh riêng (`bien ten bat dau bang "super"`).
- `super.f()` và `super.x` tra thành viên **bắt đầu từ lớp đó**, và bỏ qua lớp thành viên dựng
  sẵn (nếu không `super.toString()` sẽ nuốt mất lời gọi).

Kết quả: `AB` cho ví dụ trên, `ABC` cho chuỗi ba tầng, `AC` khi lớp giữa không ghi đè.

### Hai ca biên nay báo lỗi ĐÚNG NGHĨA thay vì sập / nói sai

| Mã                                         | Trước                               | Sau                                               |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------- |
| `super.f()` trong lớp không kế thừa ai     | trả `this` rồi lặp vô tận           | "Lop nay khong ke thua lop nao…" + cách sửa       |
| `super.ten` với `ten` là thuộc tính ghi đè | âm thầm trả giá trị của **lớp con** | nói rõ bộ chạy giữ một ô cho mỗi tên, đề xuất hàm |

Ca thứ hai là **khác biệt cố ý** so với Kotlin thật, nên đã thêm mục vào `KHAC_BIET` của
`chayKotlin.ts` đúng luật tự khai §3.3 số 5 (chỗ khác biệt phải nói ra, không im lặng).

## 2. Hai nhánh chết + một khoá cấu hình bị ghi đè im lặng

- `kotlinSim/interpreter.ts` — `inGia` có `g.tap === true ? '[…]' : '[…]'`: **hai vế giống hệt
  nhau**. Kotlin in Set y như List nên nhánh này vô nghĩa; bỏ ternary.
- `swiftSim/interpreter.ts` — khối `if (moi.co(l.ten) && …) { }` **thân rỗng**, chỉ chứa một
  comment. Chuyển comment ra ngoài, bỏ `if`.
- `vitest.config.ts` — khoá `reporter` khai **hai lần** trong cùng object `coverage` (dòng 36 và
  98). Bản trên bị bản dưới ghi đè im lặng, và esbuild in cảnh báo "Duplicate key" ở **mọi lượt
  chạy test**. Gộp làm một khai báo, giữ cả hai ghi chú.

## 3. Test bù: +90 ca

| File                                        | Ca  | Phủ gì                                                                                                                                                                      |
| ------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kotlinSim/keThua.test.ts` (mới)            | 50  | `super` 8 ca (gồm canh hồi quy lỗi trên) · do-while/continue/break · try-finally · in giá trị Set/Map/Pair/khoảng/enum/ngoại lệ · `===` · `!in` · tách biến · `!!` · `when` |
| `swiftSim/luongDieuKhien.test.ts` (mới)     | 26  | 4 dạng vòng lặp × break/continue · lặp trên từ điển/chuỗi · `switch` có `where` · do/catch/`try?` · 5 đường gán sai                                                         |
| `apps/dhcb/src/lib/mistakes.test.ts` (thêm) | 15  | JSON hỏng · `localStorage` hết dung lượng · cắt trường 500 ký tự · trần 200 thẻ · hợp nhất server 4 ca · `deleteMistakeSynced`                                              |

Các ca của `mistakes.ts` đều nhắm vào **nhánh nuốt lỗi** — module này cố ý không bao giờ `throw`
để việc lưu sổ lỗi không làm gãy luồng Chat/Viết/Nói. Không có test canh thì một lần refactor lỡ
tay để lọt exception sẽ hỏng đúng ba luồng đó mà không cổng nào bắt được.

## Bằng chứng

| Cổng      | Kết quả                                       |
| --------- | --------------------------------------------- |
| Build     | ✅ `dist/` + `dist-server/` + hub             |
| Typecheck | ✅ 4 project                                  |
| Lint      | ✅ 0 cảnh báo                                 |
| Format    | ✅ Prettier                                   |
| Test      | ✅ **7580/7580** (trước đợt: 7490) · 499 file |

Coverage **branches: 90,27% → 90,54%** (12 304→12 412 nhánh đã phủ). Biên độ trên sàn 90 từ
**0,27 lên 0,54 điểm — gấp đôi**. Ba chỉ số còn lại: statements/lines 95,27% · functions 95,34%.

## Còn để ngỏ (KHÔNG làm ở đợt này)

- **`swiftSim` không hỗ trợ `super`** — nhưng nó báo lỗi rõ ràng ("Bo chay dang cho mot gia tri
  nhung gap super") chứ không sập, nên đây là **thiếu tính năng**, không phải lỗi. Thêm vào là
  mở rộng phạm vi bộ chạy, cần quyết định riêng.
- Hai món nợ cần VPS (`eval:tutor --write-baseline`, áp `nginx/en-vi.conf`) vẫn nguyên — không
  làm được từ phiên này.

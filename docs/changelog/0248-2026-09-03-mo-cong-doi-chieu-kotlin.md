# 0248 — 2026-09-03 — Mở cổng đối chiếu Kotlin: 48/48 ca khớp `kotlinc` thật

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Hiến chương chương trình M §3.4 đòi: mỗi ca đối chiếu phải được chạy **một lần trên trình biên
dịch thật**, "không suy đoán từ trí nhớ". PR-M7 dựng xong bộ chạy `kotlinSim` (48 ca) nhưng
**không đóng được cổng** vì máy dựng khi đó không có Kotlin toolchain và không tải được. Hệ quả:
`conformance.test.ts` chặn CI nếu có bài `language: 'kotlin'`, tức **PR-M8/M9 không được bắt
đầu**.

Đợt này mở cổng đó.

## Hoá ra không cần máy riêng

PROGRESS ghi việc này thuộc diện "cần làm tay, trên máy có Kotlin". Kiểm lại thì:

- `java` (OpenJDK 21.0.10) **đã có sẵn** trong môi trường dựng — mà `kotlinc` chạy trên JVM.
- Proxy **tải được** `kotlin-compiler-2.0.21.zip` (85 MB) từ GitHub releases, HTTP 200.

Nên cổng đóng được ngay trong phiên, không phải chờ ai chạy tay.

**Đã thử Swift cùng lượt và VẪN chặn** (nên cổng §8 giữ nguyên): `download.swift.org` không tới
được (mã 000), `github.com/swiftlang/swift/releases` trả 403. Ghi lại để phiên sau khỏi thử lại
cùng một đường.

## Lần chạy thật đầu tiên làm lộ 2 lỗi của KHUNG ĐO

Đáng chú ý: **cả hai đều ở script đối chiếu, không phải ở bộ chạy `kotlinSim`.** Script chưa
từng chạy trên toolchain thật nên chưa ai phát hiện.

1. **`kotlin <file>.kt` không chạy được file nguồn ở Kotlin 2.x** — báo `could not find or load
main class`. Script cũ _ưu tiên_ lệnh này, với comment ghi rõ "kotlin chạy thẳng file .kt như
   script". Giả định đó sai: `kotlin` chỉ chạy class/jar đã biên dịch (hoặc `.kts`). Nay luôn
   `kotlinc` → jar → `java -jar`.
2. **Dồn 48 ca vào một file thì trùng tên kiểu** — hai ca cùng khai `data class Diem`, kotlinc
   báo `redeclaration` và chết trước khi so được ca nào. Docstring của script nói khai báo kiểu
   được "đổi tên theo số ca để không đụng nhau" nhưng **code không hề làm việc đó**. Nay mỗi ca
   một file với `package ca<N>` riêng — triệt để hơn đổi tên (đổi tên còn phải sửa mọi chỗ dùng
   kiểu đó bên trong ca), và lỗi biên dịch nay chỉ đúng file của ca gây lỗi.

## Và 2 lệch GIẢ đã truy ra nguyên nhân

Sau khi sửa 2 lỗi trên, còn 46/48. Hai ca lệch **không phải lỗi bộ chạy** — kỳ vọng và
`kotlinSim` đều đúng, khung đo sai:

- **K05** (chuỗi ba nháy `"""`) — mã ca có `dong hai` ở cột 0 bên trong chuỗi thô. Khung đo thụt
  mọi dòng thân ca thêm 4 dấu cách, mà bên trong chuỗi thô thì 4 dấu cách đó **thành nội dung
  chuỗi thật**. Kotlin không đòi thụt dòng nên bỏ hẳn phần thụt.
- **K90** (tên biến/hàm tiếng Việt có dấu) — `Chào Nguyễn Văn A` ra `Ch?o Nguy?n V?n A`: thiếu
  ép UTF-8 khi chạy `java`. Nay truyền `-Dfile.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8`.

Cả hai đều là bẫy dễ kết luận nhầm thành "bộ chạy sai" rồi đi sửa `kotlinSim` cho khớp một phép
đo hỏng. Đã ghi nguyên nhân vào chú thích ngay tại chỗ sửa để lần sau không nghi oan.

## Kết quả

**48/48 ca KHỚP với `kotlinc-jvm 2.0.21` (JRE 21.0.10+7-Ubuntu-124.04).** Mọi ca trong
`packages/subject-programming/kotlinSim/conformance.ts` nay `daDoiChieu: true`.

**Cổng §3.4 MỞ — PR-M8/M9 (nội dung Kotlin) được phép bắt đầu.**

## Đã sửa

| File                                                    | Việc                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `scripts/kotlin-conformance.ts`                         | Sửa 2 lỗi khung đo + 2 nguyên nhân lệch giả; mỗi ca một file `package` riêng                      |
| `packages/subject-programming/kotlinSim/conformance.ts` | 48 ca → `daDoiChieu: true`; viết lại phần đầu file (bản cũ nói "CHƯA đối chiếu", nay sai thực tế) |
| `docs/research/mon-lap-trinh.md`                        | Bảng trạng thái cổng §3.4 → đã mở; ghi phiên bản Kotlin đã đối chiếu                              |
| `scripts/swift-conformance.ts`                          | Chỉ sửa một đường dẫn tài liệu đã chết (xem dưới)                                                 |
| `PROGRESS.md`                                           | Cổng §3.4 mở; ghi rõ Swift đã thử lại và vẫn chặn                                                 |

**Đường dẫn tài liệu đã chết:** cả hai script in ra hướng dẫn trỏ tới
`docs/research/dac-ta-bo-chay-{kotlin,swift}-2026-08-27.md` — hai file này **không còn tồn tại**
(thư mục `docs/research/` đã gộp lại còn 11 file chủ đề). Nay trỏ đúng mục trong
`docs/research/mon-lap-trinh.md`.

## Bằng chứng kiểm chứng

- `npm run kotlin:conformance` với `kotlinc 2.0.21` thật trên PATH: **✅ 48/48 ca KHỚP**.
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **543 file / 10.969 test
  xanh** ✅ · `npm run build` ✅ · `npx prettier --check` ✅.
- `npx vitest run packages/subject-programming/kotlinSim` — 397 test xanh, gồm cổng §3.4.

## Việc tiếp theo

**PR-M8 (nội dung Kotlin, `p6-u5…u7`) nay không còn bị chặn.** Đây là việc soạn nội dung, nên
theo luật CLAUDE.md mục 3 cần chốt phạm vi với người dùng trước khi bắt đầu.

Cổng Swift §8 vẫn đóng và **không mở được từ môi trường dựng** — cần máy có Swift toolchain.

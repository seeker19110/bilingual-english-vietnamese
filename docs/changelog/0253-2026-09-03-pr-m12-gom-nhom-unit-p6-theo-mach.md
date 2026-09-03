# 0253 — 2026-09-03 — PR-M12: gom nhóm 65 unit P6 theo mạch, khép chương trình M

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Nội dung chương trình M xong ở PR-M11. Việc cuối là giao diện: **gom nhóm unit P6 theo track**.

## Con số thật khác hẳn con số trong hiến chương

Hiến chương viết M12 là _"gom nhóm 15 unit P6"_ — vì lúc đó P6 được quy hoạch 15 unit. **Đo lại
2026-09-03: P6 có 65 unit, và tất cả đều đã có bài.** Chênh lệch đến từ tầng hướng chuyên sâu
(`u16+`, 55 unit) ra đời sau hiến chương.

Nên nhu cầu còn gắt hơn hiến chương dự liệu: trang bậc P6 là một dải **65 thẻ liền mạch**, học
viên không phân biệt nổi "dẫn nhập bốn hướng" với "track Kotlin của chương trình M" với "55 unit
hướng chuyên sâu" — chúng nằm cạnh nhau, hình thức y hệt.

Phân bố thật: dẫn nhập `u1–u4` (4) · Kotlin `u5–u7` (3) · Paradigm `u13–u15` (3) · hướng chuyên
sâu `u16+` (55). Dải Swift `u8–u12` **chưa tồn tại** (cổng cứng §8 vẫn chặn).

## Đã làm

**Dữ liệu** (`curriculum.ts`): thêm trường `track?: string` cho `ProgrammingUnit`, khai
`UNIT_TRACKS` (4 mạch, có thứ tự hiển thị) và hàm `nhomUnitTheoTrack()`.

Điểm thiết kế đáng nói: **nhóm mặc định được KHAI RÕ** (`macDinh: true`) thay vì để ngầm. Nhờ vậy
55 unit hướng chuyên sâu không phải sửa từng cái, mà nhóm hứng chúng vẫn có TÊN thật hiện trên
giao diện — không phải quy ước ngầm chỉ người viết mới biết. Chỉ 10 unit phải khai `track`.

**Giao diện** (`ProgrammingLevelPage.tsx`): danh sách unit chia thành các mục có tiêu đề `h3` +
một câu mô tả mạch; mục lục cột phải đổi sang trỏ tới MẠCH (4 mục quét được) thay vì 65 unit liền
một dải.

**Bậc P1–P5 KHÔNG đổi gì.** Không unit nào của chúng khai `track` nên hàm gom nhóm trả về đúng
một nhóm, và giao diện giữ nguyên danh sách phẳng như trước. Giao diện tự suy ra điều đó từ số
nhóm (`> 1`), không phải đặc biệt hoá riêng cho P6.

Số thứ tự "Unit N" lấy theo **vị trí toàn bậc**, không phải trong nhóm — nếu không thì ba mạch
đều bắt đầu từ "Unit 1" và nhãn không còn khớp mã unit trên URL.

## Một chú thích bị chính thay đổi này làm SAI, và đã sửa

`e2e/a11y.spec.ts` ghi bên cạnh `/lap-trinh/p1`: _"trang một bậc (6 bậc dùng chung layout)"_.
Câu đó **đúng cho tới PR này** — nay P6 có thêm một tầng tiêu đề nên không còn dùng chung layout
với P1 nữa.

Để nguyên thì hai chuyện xấu cùng lúc: chú thích nói dối phiên sau, và **bản CÓ CHIA MẠCH không
cổng a11y nào soi tới** (P1 render phẳng). Nên PR này thêm `/lap-trinh/p6` vào **cả hai** cổng
a11y (A/AA và AAA) và sửa lại chú thích cho đúng thực tế.

## Bằng chứng kiểm chứng

- **Cổng a11y A/AA**: `/lap-trinh/p6` — **0 vi phạm ở cả 5 theme** (đã chạy, 16,0s).
- **Cổng a11y AAA**: `/lap-trinh/p6` — **xanh cả 5 theme** (đã chạy, 14,4s).
- **2 test e2e chức năng** (đã chạy xanh): P6 hiện đủ 4 tiêu đề mạch và mục lục đổi sang đếm
  mạch; **P3 giữ nguyên danh sách phẳng** và nhãn nhóm mặc định KHÔNG rò ra.
- **6 test đơn vị mới** (`unitTracks.test.ts`) canh bất biến dữ liệu: đúng một nhóm mặc định ·
  mọi `track` khai trên unit đều tồn tại thật · **không mất unit nào khi gom** · giữ nguyên thứ
  tự trong nhóm · **chỉ P6 chia mạch, P1–P5 ra đúng một nhóm** · bậc rỗng không sinh nhóm rỗng.
- `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ · `npm test` **544 file / 11.105 test
  xanh** ✅ · `npm run build` ✅.

Test đơn vị canh đúng chỗ e2e không với tới: chỉ cần ai đó thêm `track` cho một unit của P2 là
bậc đó bỗng hiện tiêu đề "Hướng chuyên sâu" sai ngữ cảnh — e2e chỉ chốt P6 và P3, còn test này
quét cả 6 bậc.

## Một lỗi của tôi mà test bắt được

Test e2e đầu tiên đỏ vì locator `getByRole('heading', { name: 'Hướng chuyên sâu' })` dính **hai**
phần tử: `h3` tiêu đề mạch mới, và một `h2` có sẵn ở cột phải ("Hướng chuyên sâu tự chọn — …",
chặng dự án của bậc). Lỗi ở test chứ không ở mã; đã siết `exact: true` và ghi lý do ngay tại chỗ.

## Trạng thái chương trình M sau PR này

| Mạch                                             | Trạng thái              |
| ------------------------------------------------ | ----------------------- |
| Hạ tầng bash · swiftsim · kotlinsim (M1, M3, M7) | ✅ xong                 |
| Nội dung bash `p3-u11` (M2)                      | ✅ xong                 |
| Track Kotlin `p6-u5…u7` (M8, M9)                 | ✅ xong                 |
| Track Paradigm `p6-u13…u15` (M10, M11)           | ✅ xong                 |
| **Giao diện gom nhóm (M12)**                     | ✅ **xong — PR này**    |
| Nội dung Swift `p6-u8…u12` (M4–M6)               | ⛔ **kẹt cổng cứng §8** |

**Chương trình M xong 11/12 PR.** Việc còn lại duy nhất là mạch Swift, và nó **không phải việc
soạn nội dung mà là việc TAY**: chạy `npm run swift:conformance` trên máy có Swift toolchain.
Đã thử lại 2026-09-03 từ môi trường dựng: `download.swift.org` không tới được (mã 000),
`github.com/swiftlang/swift/releases` trả 403 — khác Kotlin, vốn tải được từ GitHub releases nên
mở được cổng ngay trong phiên (xem changelog 0248).

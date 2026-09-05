# 0274 — 2026-09-05 — Desktop giáo dục đợt 2: trang tổng quan môn học (+2 lỗi lặp nội dung)

PR: (điền khi tạo) · Nhánh: `claude/redesign-education-desktop-ui-j0ljlc`
Đặc tả: `docs/specs/2026-09-05-thiet-ke-lai-desktop-giao-duc.md` · Đợt trước: `0273` (PR #861, đã merge)

## Bối cảnh

Đợt 2/3 của chuỗi thiết kế lại UI/UX desktop cho các trang giáo dục. Nhóm trang lần này là
**tổng quan môn học**: nơi người học chọn học gì, chứ không phải nơi ngồi học.

Cách làm: **chụp ảnh thật ở 1440px trước khi sửa** rồi mới quyết, đúng tinh thần "ĐO, đừng đoán"
của mục 11.1 CLAUDE.md. Việc đó lộ ra hai lỗi mà đọc mã suông rất dễ bỏ sót (mục 2 dưới đây).

## 1. Việc bố cục đã làm

### `RoadmapTab.tsx` — 6 cấp CEFR xếp hai cột ở desktop

Đo trước khi sửa ở 1440px: trang `/lo-trinh-hoc` **cao 3332px**, sáu cấp A1→C2 xếp một cột dọc,
mỗi thẻ rộng ~1200px chỉ để chứa vài dòng "học xong bạn có thể…" ngắn. Phải cuộn hơn ba màn hình
mới nhìn hết — trong khi đây chính là **tấm bản đồ** cho biết mình đang ở đâu, thứ đáng lẽ phải
thấy trọn một lần.

Nay từ 1024px xếp hai cột: **3332px → 2294px**, bản đồ gọn còn khoảng một màn rưỡi và mỗi thẻ về
đúng bề rộng nội dung của nó cần.

Ở đây dùng `lg:` thuần CSS (khác đợt 1 vốn phải quyết ở JS) vì grid **chỉ đổi cách xếp chỗ** —
không nhân đôi phần tử nào trong DOM, nên không vướng bất biến "một nhánh duy nhất" của `TwoPane`.
`items-start` để thẻ tự cao theo nội dung, không kéo dài bằng nhau chừa khoảng trống dưới thẻ ngắn.

### `Subjects.tsx` — ba cột ở `xl`, thẻ cao bằng nhau

Ở 1440px cột nội dung rộng ~1150px, đủ chỗ cho ba thẻ ~360px — sáu môn hiện tại vừa đúng hai hàng,
thấy hết một lần thay vì cuộn ba hàng. Dưới `xl` giữ nguyên 2 cột. Thêm `items-stretch` + `h-full`
để nút "Vào phòng học" của các thẻ cùng hàng thẳng một đường thay vì so le theo độ dài mô tả.

## 2. Hai lỗi lặp nội dung phát hiện qua ảnh chụp

### 2.1 `Subjects.tsx` — mô tả môn học in HAI LẦN từ 768px trở lên 🐛

Chỗ đó có hai thẻ `<p>` cùng in `sub.description`: một nằm trong khối `flex … md:block`, một là
`hidden md:block`. Ý định là "dưới md hình đứng cạnh chữ, từ md trở lên chỉ còn chữ" — nhưng
**`md:block` chỉ đổi `display`, KHÔNG ẩn** khối thứ nhất; chỉ mỗi cái hình bên trong mới `md:hidden`.
Hệ quả: từ 768px trở lên mọi thẻ môn học in mô tả hai lần.

Sửa: còn đúng một `<p>`. Từ md trở lên hình bị ẩn nên khối flex còn một con, trông y hệt `block`.
Giữ `mb-3 md:mb-4` để khoảng cách khớp đúng cả hai khuôn cũ — dưới 1024px không xê dịch pixel nào.

### 2.2 `SubjectDetail.tsx` — trang có HAI `<h1>` nói cùng một điều 🐛

Hero in "Toán học" kèm mô tả môn, rồi ngay dưới `PageHeader` in "Gia Sư AI: Toán học" kèm **đúng
mô tả đó** nhét trong ngoặc đơn. Hai khối tiêu đề chồng nhau chiếm gần một phần ba màn hình đầu mà
không thêm thông tin nào; và về ngữ nghĩa thì trang có hai thẻ `<h1>`.

Sửa: bỏ hẳn `PageHeader` ở trang này, hero là tiêu đề duy nhất, cỡ chữ nâng lên khớp chuẩn tiêu đề
trang của app (`text-2xl sm:text-3xl`). Kết quả: khối "Nhập đề bài" — việc chính của trang — nay
nằm trong màn hình đầu.

### 2.3 `Subjects.tsx` — thông báo rỗng đổ tại từ khoá không tồn tại 🐛

Câu "Không tìm thấy môn học nào khớp với từ khóa "{searchQuery}"" chạy cả khi ô tìm kiếm **trống**,
in ra `khớp với từ khóa ""` — vừa vô nghĩa vừa đổ lỗi cho thao tác người dùng chưa hề làm. Danh
sách rỗng khi không có từ khoá là chuyện khác hẳn (bộ lọc không có môn nào, hoặc tải danh mục
hỏng), nên nay nói khác cho đúng.

## 3. Quyết định kèm theo

- **`EnglishHome.tsx` KHÔNG sửa.** Nó nằm trong phạm vi đợt 2, nhưng đo ở 1440px thì các lưới của
  nó đã lấp đủ bề ngang và cả trang vừa một màn hình. Sửa cho có là churn, nên để nguyên và ghi
  lại lý do ở đây thay vì im lặng bỏ qua.
- **Ba lỗi ở mục 2 áp dụng cho MỌI bề rộng**, không riêng desktop — khác cam kết "không đổi gì dưới
  1024px" của phần bố cục. Đây là chủ ý: nội dung in hai lần là lỗi ở mọi màn hình, vá nửa vời theo
  breakpoint thì để lại đúng cái lỗi đó trên tablet.

## 4. Bằng chứng kiểm chứng

| Cổng                                        | Kết quả                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `npm run build`                             | ✅ 1823 modules, 3.10s                                                  |
| `npm run typecheck`                         | ✅ (cả 4 tsconfig)                                                      |
| `npm run lint`                              | ✅ 0 cảnh báo                                                           |
| `npm run format`                            | ✅                                                                      |
| `npm test`                                  | ✅ **12160/12160** (574 file)                                           |
| `e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` | ✅ **402/402** (15 trang × 5 theme)                                     |
| Ảnh chụp trước/sau ở 1440px                 | ✅ 4 trang; `/lo-trinh-hoc` 3332px → 2294px; `/mon-hoc` 1695px → 1237px |

## 5. Còn lại của chuỗi

Đợt 3 — trang LUYỆN TẬP tương tác: `Speaking`, `Writing`, `Chat`, `Listening`.

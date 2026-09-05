# 0275 — 2026-09-05 — Desktop giáo dục đợt 3 (cuối): trang luyện tập tương tác

PR: (điền khi tạo) · Nhánh: `claude/redesign-education-desktop-ui-j0ljlc`
Đặc tả: `docs/specs/2026-09-05-thiet-ke-lai-desktop-giao-duc.md`
Đợt trước: `0273` (PR #861) · `0274` (PR #862) — cả hai đã merge

## Bối cảnh

Đợt **cuối** của chuỗi ba đợt. Nhóm trang: **luyện tập tương tác** — Chat, Speaking, Writing,
Listening. Vẫn theo cách của đợt 2: **chụp ảnh thật ở 1440px trước khi sửa** rồi mới quyết.

Lần này phép đo cho ra một con số khó tin và hoá ra là thật.

## 1. `/luyen-nghe` cao 37.266px — hơn bốn mươi màn hình cuộn

Đây là trang tệ nhất trong cả ba đợt, và không ai nhận ra vì đọc mã thì nó trông rất bình thường:
một lưới `grid-cols-1 sm:grid-cols-2`. Vấn đề là lưới **dừng ở nấc `sm:`**, nên ở 1440px vẫn chỉ
hai cột — trong khi danh sách có 139 hội thoại chia 7 cấp. Muốn tới hội thoại cấp B2 thì phải cuộn
qua toàn bộ A1–B1, và cuộn xong thì không còn biết mình đang ở cấp nào.

Hai việc:

- Thêm nấc `lg:grid-cols-3` cho cả danh sách hội thoại lẫn danh sách chủ đề câu.
- Thêm **mục lục cấp độ** ở cột phụ desktop, dùng lại `TocRail` + `useActiveSection` có sẵn — đúng
  ca mà `TocRail` sinh ra để giải quyết (xem chú thích đầu file đó). Mỗi cấp kèm số lượng hội
  thoại, bấm là nhảy thẳng, và cấp đang xem tự tô sáng theo vị trí cuộn.

Kết quả: **37.266px → 24.982px** (−33%), và quan trọng hơn con số: nay có đường tắt tới từng cấp
thay vì chỉ có cách cuộn.

Ghi chú kỹ thuật: phần này phải tách thành component riêng `DialogueGroups`. `useActiveSection` là
hook, mà chỗ dùng nó nằm **sau** hai nhánh `return` sớm của `DialoguesTab` (đang tải / rỗng) — gọi
hook sau `return` có điều kiện là vi phạm luật hook.

## 2. `Speaking` — tiêu đề lặp nguyên văn

Trang in "Luyện nói song ngữ" hai lần cách nhau ~300px: một ở `PageHeader`, một ở thẻ `<h2>` của
màn cài đặt ngay dưới. Đây là **lỗi thứ ba cùng loại** mà cách đo bằng ảnh chụp tìm ra trong chuỗi
này (hai lỗi kia ở đợt 2: `Subjects` và `SubjectDetail`).

Bỏ thẻ `<h2>`; **giữ** phụ đề bên dưới vì nó nói thêm cơ chế hai giọng — thông tin thật, không
phải nhắc lại.

## 3. Màn cài đặt của `Chat` và `Speaking` — bỏ căn giữa dọc ở desktop

Cả hai màn dùng `justify-center` trong khung `flex-1`. Trên điện thoại đó là đúng (màn ngắn, nội
dung vừa khít). Trên màn 900px thì nó đẩy thẻ cài đặt xuống quá nửa trang: đo được nút "Bắt đầu
luyện nói" ở y≈766 trong khi tiêu đề trang ở y≈95 — gần 700px trống ở giữa.

Từ `lg` trở lên đổi sang `justify-start` + `lg:pt-2`/`lg:py-6`. Dưới 1024px không đổi.

Khác `Speaking`, tiêu đề "Chọn tình huống luyện tập" của `Chat` được **giữ**: nó nói một bước khác
với tiêu đề trang "Chat với gia sư", không phải nhắc lại nguyên văn.

## 4. `Writing` — KHÔNG sửa

`/luyen-viet` nằm trong phạm vi đợt này nhưng đo ở 1440px thì nó **đã có sẵn** bố cục workspace hai
cột đúng như đặc tả mô tả (khu nhập đề + bài viết bên trái, cột kết quả chấm bên phải), làm từ đợt
trước. Không có gì để cải thiện, nên để nguyên và ghi lý do ở đây thay vì im lặng bỏ qua — giống
cách xử lý `EnglishHome` ở đợt 2.

## 5. Bằng chứng kiểm chứng

| Cổng                                        | Kết quả                                       |
| ------------------------------------------- | --------------------------------------------- |
| `npm run build`                             | ✅ 1823 modules, 2.28s                        |
| `npm run typecheck`                         | ✅ (cả 4 tsconfig)                            |
| `npm run lint`                              | ✅ 0 cảnh báo                                 |
| `npm run format`                            | ✅                                            |
| `npm test`                                  | ✅ **12160/12160** (574 file)                 |
| `e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` | ✅ **402/402** (15 trang × 5 theme)           |
| Ảnh chụp trước/sau ở 1440px                 | ✅ 4 trang; `/luyen-nghe` 37.266px → 24.982px |

## 6. Tổng kết cả chuỗi ba đợt

| Đợt | PR    | Nội dung chính                                                                                | Đo được                                             |
| --- | ----- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | #861  | `Lessons` → master–detail; `StoryReader` → cột phụ điều khiển + mục lục đoạn                  | danh sách bài không còn bị thay thế khi mở bài      |
| 2   | #862  | `RoadmapTab` 2 cột; `Subjects` 3 cột; **3 lỗi lặp nội dung**                                  | `/lo-trinh-hoc` 3332→2294px; `/mon-hoc` 1695→1237px |
| 3   | (này) | `Listening` 3 cột + mục lục cấp; `Speaking`/`Chat` bỏ khoảng trống dọc; **1 lỗi lặp tiêu đề** | `/luyen-nghe` 37.266→24.982px                       |

**Bài học đáng ghi lại:** cả **bốn** lỗi lặp nội dung của chuỗi này đều được tìm ra bằng cách
**chụp ảnh trang thật rồi nhìn**, không phải bằng đọc mã. Chúng vô hình khi đọc mã vì mỗi lỗi
trông hoàn toàn hợp lý ở dòng của nó (`md:block` trông như "chỉ hiện từ md"; một `PageHeader` và
một hero đứng cách nhau 40 dòng). Đề nghị: đưa "chụp ảnh trang ở 1440px và 390px" thành bước bắt
buộc của mọi đợt việc UI, ghi vào `docs/framework/QUY-TRINH-AUDIT.md`.

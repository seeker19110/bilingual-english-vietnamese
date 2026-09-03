# 0244 — 2026-09-03 — Bỏ qua tới nội dung chính, và nói rõ khi phiên học bị rút gọn

PR: #827 · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Đợt 6, làm nốt các điểm yếu còn lại trong khảo sát. Bắt đầu bằng một vòng **đo lại** thay vì
đọc danh sách cũ: đếm số điểm dừng Tab trên 10 trang ở 1440px.

| Trang                                          | Điểm dừng Tab |
| ---------------------------------------------- | ------------- |
| `/lo-trinh-hoc/a1`                             | **137**       |
| `/bai-hoc`                                     | 59            |
| `/lap-trinh`                                   | 53            |
| `/`                                            | 48            |
| `/tu-dien`                                     | 42            |
| `/lo-trinh-hoc` · `/on-thi` · `/trang-ca-nhan` | 37–40         |
| `/tien-do` · `/lich-su-hoc`                    | 26–27         |

Con số 137 KHÔNG cùng loại lỗi với 182 ô lịch của đợt trước: ở đây mỗi điểm dừng là một link
thật, người dùng có thể muốn tới. Nhưng đoạn ĐẦU của mọi trang luôn là cùng một menu đã đi qua
ở trang trước — và app không có cách nào bỏ qua nó.

## 1. "Bỏ qua tới nội dung chính" (WCAG 2.4.1, mức A)

- `packages/core-ui/SkipLink.tsx` — liên kết vô hình cho tới khi nhận tiêu điểm
  (`sr-only` + `focus:not-sr-only`). Người dùng chuột không bao giờ thấy; người dùng bàn phím
  bấm Tab một lần là thấy ngay.
- `PageShell` gắn `id={MAIN_CONTENT_ID}` + `tabIndex={-1}` cho `<main>`. `tabIndex={-1}`
  **không** thêm điểm dừng Tab mới nhưng cho phép nhận tiêu điểm bằng mã lệnh — thiếu nó thì
  nhảy tới `#noi-dung-chinh` chỉ CUỘN màn hình còn tiêu điểm vẫn kẹt trên thanh điều hướng,
  tức phím Tab tiếp theo lại quay về đầu menu. Đây là lỗi kinh điển của skip link làm nửa vời.
- `id` xuất ra thành hằng số dùng chung thay vì gõ chuỗi ở hai nơi: đổi một bên mà quên bên
  kia thì liên kết đứt **lặng lẽ** (trình duyệt không báo lỗi khi anchor không tồn tại).

**Đặt sai chỗ một lần rồi mới đo ra.** Bản đầu tôi đặt `SkipLink` trong `Layout`. Đo thật:
Tab lần 1 rơi vào **logo sidebar**, không phải skip link — vì `DesktopSidebar` render TRƯỚC
`Layout` trong cây. Một skip link không phải điểm dừng đầu tiên thì vô dụng. Nay đặt trong
`App`, ngay trước `DesktopSidebar`.

**Vì sao cổng a11y vẫn xanh dù thiếu tiêu chí mức A:** luật `bypass` của axe chấp nhận
landmark `<main>` là đủ, mà `PageShell` vốn đã render `<main>`. Landmark giúp người dùng
**trình đọc màn hình** (họ nhảy theo landmark); người dùng **bàn phím thuần** thì không.
Cổng xanh ở đây không có nghĩa là không còn việc phải làm.

## 2. Nói rõ khi phiên học bị rút gọn

Luồng "quay lại sau khi bỏ bẵng" (`lib/comeback.ts`) trỏ tới `?cap=3`, khiến lượt đầu chỉ còn
3 từ thay vì tốc độ đã chọn. App trước đây **không nói gì** — người học thấy ít bài hơn thường
lệ mà không biết vì sao, dễ tưởng mất tiến độ hoặc app lỗi.

Nay hiện: _"Phiên nhẹ để quay lại: 3 từ thay vì 10. Xong vẫn học tiếp được."_ Nêu đủ hai con
số để người học tự đối chiếu, và nói luôn rằng hết lượt vẫn học tiếp được — nếu không, "3 từ"
dễ đọc thành "hôm nay chỉ được học 3 từ".

Chỉ hiện khi cap thật sự NHỎ HƠN tốc độ thường; `?cap=` bằng hoặc lớn hơn thì không có gì để
giải thích.

## Bằng chứng kiểm chứng

- `e2e/skip-link.spec.ts` — 2 test, canh đủ bốn vế: (a) Tab lần đầu rơi đúng vào skip link;
  (b) nó HIỆN RA khi có tiêu điểm (đo `boundingBox`, vì `display:none` sẽ cho 0 và cũng gỡ
  luôn khỏi thứ tự Tab); (c) Enter đưa **tiêu điểm** — không chỉ cuộn — vào `#noi-dung-chinh`;
  (d) Tab kế tiếp rơi vào phần tử **bên trong** `<main>`, không quay về menu. Vế (d) mới là
  điều người dùng cần; ba vế đầu vô nghĩa nếu vế này sai.
- `e2e/session-cap.spec.ts` — 2 test, canh cả hai chiều: có `?cap=` thì giải thích, không có
  thì **im**. Một dòng giải thích hiện ra khi không có gì để giải thích cũng là lỗi.
- **Kiểm bằng trình duyệt thật** (Chromium 1440×1000): Tab 1 lần → liên kết hiện 203×36px;
  Enter → `document.activeElement` là `<main id="noi-dung-chinh">`; Tab tiếp → nút "Lộ trình
  A1 → C2" nằm trong `<main>`. Ảnh chụp đã đối chiếu.
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` — xem phần Validation
  của PR.

## Việc đã KIỂM và KHÔNG có việc phải làm

Khảo sát đợt trước ngờ rằng lịch không phải chỗ duy nhất cho `tabIndex={0}` hàng loạt phần tử
không tương tác. Đã rà: toàn kho mã còn **đúng một** kết quả `tabIndex={0}`, và đó là dòng chú
thích trong `ActivityCalendarCard`. Đo thêm số điểm dừng Tab trên 10 trang (bảng ở đầu) cũng
không thấy trang nào bất thường. Mục này đóng.

## Nợ kỹ thuật MỚI phát hiện — cổng a11y có thể cho xanh giả

Khi chữa CI đỏ của PR #826, tôi phát hiện cổng `e2e/a11y.spec.ts` chờ **cứng**
`waitForTimeout(1000)` rồi mới quét. Trên máy này, trang `/tien-do` sau 1 giây vẫn **chưa
render lịch** — đo được `gridcells: 0` — nên axe quét một trang gần như trống và cho **xanh
giả**; đúng lỗi ARIA mà CI bắt thì cục bộ không tái hiện được. Chờ theo trạng thái (đợi lưới
xuất hiện) thì ra ngay `aria-required-parent(182)`.

Nghĩa là cổng có thể đang bỏ sót lỗi ở **những trang khác** mà không ai biết. Sửa đúng là chờ
theo trạng thái thay vì theo thời gian, nhưng việc đó chạm 15 trang × 5 theme nên phải là một
đợt riêng có đo đạc, KHÔNG nhét vào đợt này. Đã ghi vào `PROGRESS.md`.

## Việc tiếp theo

- **Sửa cổng a11y chờ theo trạng thái** (nợ ở trên) — đáng làm nhất, vì nó quyết định mức tin
  cậy của mọi kết luận a11y khác.
- Di trú dần 915 nút cũ sang `Button` dùng chung của đợt 1.

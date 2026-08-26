# feat: panel "Luồng người mới" trong trang admin (2026-08-23)

`AdminIntakePanel` gắn vào tab **Analytics** của `/admin-s`, đọc `/api/admin-intake-stats`.

**Trình bày tách làm HAI khối, cố ý không gộp thành một bảng số:** khối 1 "Suy luận có đúng
không?" (nhận việc chính / đổi việc / bỏ qua), khối 2 "Có tác dụng thật không?" (làm xong, và làm
xong trong 7 ngày). Gộp lại thì người đọc chỉ thấy một con số "tỷ lệ thành công" mơ hồ và không
biết phải sửa gì. Mẫu số của khối 2 là những người **đã chọn việc**, không phải toàn bộ người trả
lời — người chưa chọn thì không có gì để làm xong.

Ghi thẳng lên giao diện hai điều dễ đọc sai: tỷ lệ "đổi việc" cao **không hẳn xấu**, và số "đã làm
xong" là **tự khai**.

**`formatRate` (tách sang `lib/statFormat.ts`):** `null` = chưa có dữ liệu → hiện dấu gạch, KHÔNG
hiện `0%`. Thấy 0% người ta kết luận "gợi ý trượt hoàn toàn" trong khi sự thật có thể là chưa ai
đi qua luồng này. Có test riêng cho luật này.

**Vá 4 lỗi a11y CÓ SẴN** trong `AdminFeedbackPanel` (3 `<select>` và 1 nút thiếu tên — mức
`critical`), phát hiện khi quét cả trang. Sửa chỉ là thêm `aria-label`, rủi ro bằng 0.

**Nợ ghi lại (KHÔNG sửa trong PR này):** trang `/admin-s` còn lỗi `color-contrast` ở **theme sáng**
(hộp báo lỗi `text-red-300`, nút tab `text-accent-300`) — thuộc các panel khác, và sửa đúng cách là
chỉnh token/biến thể `theme-light:` cho cả lớp lỗi này. Vì vậy `e2e/a11y-admin-intake.spec.ts` giới
hạn phạm vi quét vào `#admin-intake-panel`, để không biến nó thành cổng cho toàn bộ trang admin vốn
chưa từng được gác.

**Kiểm chứng:** 5077 test xanh (+4) · a11y **48/48** (chạy lại cả 3 spec mới để chắc bản vá
`AdminFeedbackPanel` không phá gì) · build/typecheck/lint xanh · e2e kiểm số liệu thật hiện đúng
(mẫu số 87 = 62+25, không phải 100) và ca "chưa có dữ liệu" hiện dấu gạch chứ không phải 0%.

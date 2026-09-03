# 0243 — 2026-09-02 — Lịch hoạt động: một điểm dừng Tab, bấm được từng ngày

PR: #826 · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Đợt 5, và **phần lớn là dọn hậu quả từ chính đợt 4**.

Đợt 4 mở lịch hoạt động từ 5 tuần lên 26 tuần. Điều tôi không tính tới: mỗi ô ngày mang
`tabIndex={0}`, nên số ô tăng đồng nghĩa số điểm dừng Tab tăng theo. Đo thật sau đợt 4:

> **182 trong tổng số 213 điểm dừng Tab của cả trang Tiến độ là ô lịch — 85%.**

Tức người dùng bàn phím muốn đi qua thẻ lịch để tới phần dưới phải bấm Tab 182 lần. Con số này
vốn đã tệ khi lịch còn 35 ô; đợt 4 làm nó tệ gấp năm. Việc mở rộng lịch vẫn đúng, nhưng nó phơi
ra một khiếm khuyết có sẵn mà kích thước nhỏ đang che đi.

## 1. Roving tabindex — cả lưới là một điểm dừng Tab

Mẫu chuẩn của WAI-ARIA cho lưới dữ liệu: đúng **một** ô mang `tabIndex=0` (ô đang chọn), các ô
còn lại `-1`; vào lưới bằng Tab, đi lại bên trong bằng phím mũi tên.

|                            | Trước | Sau    |
| -------------------------- | ----- | ------ |
| Điểm dừng Tab của cả trang | 213   | **32** |
| Trong đó là ô lịch         | 182   | **1**  |

- `packages/core-ui/rovingGrid.ts` — luật phím tách thành **hàm thuần** `resolveRovingGridKey`
  để kiểm chứng bằng test mà không phải dựng DOM (cùng triết lý với `core-examplan`).
- Hàm nhận `flow` vì hai bố cục đổ dữ liệu ngược nhau: desktop đổ theo CỘT (xuống = ngày kế
  tiếp, sang phải = cùng thứ tuần sau), mobile đổ theo HÀNG (ngược lại). Không tham số hoá chỗ
  này thì phím mũi tên đúng ở một khổ màn và sai ở khổ kia.
- **Kẹp ở hai đầu chứ không cuộn vòng**: lịch có mốc đầu và mốc cuối thật (ngày xa nhất và hôm
  nay), nên nhảy từ hôm nay về ngày xa nhất là mất phương hướng.
- Phím không dùng đến trả `null` để nơi gọi **không** `preventDefault` — nuốt phím không dùng
  sẽ chặn mất phím tắt của trình duyệt.
- Mặc định chọn **hôm nay** (ô cuối): vào lưới bằng Tab là đứng ngay ở ngày gần nhất, không
  phải ở ngày cách đây nửa năm.

## 2. Ô lịch bấm được — trả lời câu hỏi kế tiếp

Heatmap chỉ nói "ngày này đậm hơn ngày kia". Câu hỏi ngay sau đó của người học luôn là "hôm đó
mình đã làm gì?" — trước đợt này app không trả lời được. Nay chọn một ngày thì dòng ngay dưới
lưới ghi rõ: _"T6, 06/03 — 5 từ đã học · 2 lượt chat · 1 bài viết"_.

- `getDayBreakdown` (`lib/stats.ts`) đọc **theo yêu cầu**, chỉ khi bấm — không gói sẵn vào 182
  ngày của lịch. Hầu hết ô không bao giờ được bấm; gói sẵn là trả giá bộ nhớ cho thứ gần như
  không ai xem.
- Ô nay là nút bấm thật nên `role="img"` cũ không còn đúng → `role="grid"`/`gridcell` kèm
  `aria-selected`.
- Phần chi tiết mang `aria-live="polite"`: người dùng trình đọc màn hình đi bằng phím mũi tên
  phải **nghe** được nội dung đổi theo, chứ không chỉ nghe nhãn ô.
- Bảng nhãn hoạt động gõ khoá bằng `DayBreakdownItem['key']` chứ không phải `string` — thêm
  loại hoạt động mới mà quên nhãn thì TypeScript báo ngay, thay vì giao diện lặng lẽ hiện
  "undefined".

Khối lịch tách khỏi `Dashboard.tsx` thành `components/ActivityCalendarCard.tsx`: nó đã tự đủ
phức tạp để đứng riêng, và Dashboard vốn đã dài.

## Bằng chứng kiểm chứng

- `packages/core-ui/rovingGrid.test.ts` — **7 test hàm thuần**: hai chiều đổ dữ liệu, kẹp hai
  đầu, Home/End, PageUp/PageDown, và ca biên lưới rỗng / `span` = 0 (không được tính ra `NaN`).
- `e2e/calendar-keyboard.spec.ts` — **2 test E2E**: (a) lưới có hơn 100 ô nhưng **đúng 1** ô
  nhận Tab; (b) mũi tên đi từng tuần, `Home` về ngày xa nhất, `End` quay lại hôm nay, và phần
  chi tiết đổi theo từng bước.
- **Kiểm bằng trình duyệt thật** (Chromium 1440×1100): đếm lại điểm dừng Tab được **32** (trước
  213), và ảnh chụp cho thấy ô đang chọn có viền sáng cùng dòng chi tiết đúng nội dung.
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` — xem phần Validation của
  PR.

## Bài học ghi lại

Mở rộng một thành phần **nhân lên mọi khiếm khuyết có sẵn của nó**. Lịch 35 ô có 35 điểm dừng
Tab thừa — đủ nhỏ để không ai để ý; cùng khiếm khuyết đó ở 182 ô thì thành rào chắn thật sự.
Lần sau khi tăng số lượng phần tử lặp lại, kiểm luôn những thứ **tỉ lệ thuận với số lượng**:
điểm dừng Tab, số nút DOM, số ảnh, số lần tính lại.

## Việc tiếp theo

Còn 3 điểm yếu từ khảo sát: nói rõ khi phiên học bị rút gọn (`?cap=`); di trú dần 915 nút cũ
sang `Button` dùng chung của đợt 1; và rà xem còn chỗ nào khác trong app đang cho `tabIndex={0}`
hàng loạt phần tử không tương tác (lịch chắc không phải chỗ duy nhất).

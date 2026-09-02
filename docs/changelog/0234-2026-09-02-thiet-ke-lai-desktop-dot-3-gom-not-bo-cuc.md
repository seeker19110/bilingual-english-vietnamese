# 0234 — 2026-09-02 — Thiết kế lại desktop, đợt 3: gom nốt bố cục 2 cột

**PR:** (điền số PR sau khi tạo)
**Đặc tả:** `docs/specs/2026-09-02-thiet-ke-lai-desktop-toan-dien.md` (mục ⑦)
**Đợt trước:** `0232` (PR #815 — nền hệ thống) · `0233` (PR #816 — bề rộng chuẩn)

## Bối cảnh

Đợt 2 gom được 2 trong 6 bản chép tay bố cục 2 cột (Home, Dashboard). Đợt này xử lý 4 bản còn
lại — nhưng khi đọc kỹ từng cái thì **chúng không cùng một loại**, nên không thể gom tất:

| Trang           | Kiểu bố cục                                     | Xử lý                          |
| --------------- | ----------------------------------------------- | ------------------------------ |
| `Writing`       | cột phải dính-theo-cuộn, trang cuộn bình thường | ✅ gom vào `TwoPane`           |
| `CefrLevelPage` | master–detail, danh sách nằm **bên trái**       | ✅ gom, thêm `railSide="left"` |
| `Chat`          | toàn màn hình kiểu app chat (`flex min-h-0`)    | ❌ **cố ý giữ nguyên**         |
| `Speaking`      | toàn màn hình kiểu app chat (`flex min-h-0`)    | ❌ **cố ý giữ nguyên**         |

**Vì sao KHÔNG gom Chat/Speaking:** hai trang này là bố cục chiều-cao-cố-định (cột phải là
`flex flex-col min-h-0`, cuộn trong khung chat, KHÔNG `sticky`), trong khi `TwoPane` phục vụ
trang cuộn dọc bình thường (`sticky top-20` + `max-h`). Ép chúng vào cùng một component là áp
sai khuôn — sẽ phải thêm cờ điều kiện làm hỏng cả hai. Bề rộng cột phụ của chúng (`w-72 xl:w-80`)
vốn đã trùng đúng giá trị `normal` của `TwoPane`, nên phần "bề rộng lệch nhau" mà audit nêu thực
tế chỉ còn ở `Writing` (`w-80 xl:w-96`) — và đó là **cố ý**: bảng chấm bài nhiều chữ cần rộng hơn.

## Việc đã làm

1. **`TwoPane` thêm `railSide`** (`packages/core-ui/TwoPane.tsx`) — mặc định `right` cho cột ngữ
   cảnh; `left` cho master–detail. Đảo thứ tự bằng **thứ tự trong DOM**, không dùng `order-*` của
   CSS: trình đọc màn hình và phím Tab đi theo DOM, đảo bằng CSS sẽ làm hai luồng đó lệch nhau.
2. **`Writing`** → `PageShell` + `TwoPane` với `railWidth="wide"`.
3. **`CefrLevelPage`** → `PageShell` + `TwoPane` với `railSide="left"`.

## Lỗi tự phát hiện trong lúc làm

Sau khi chuyển `CefrLevelPage`, ảnh chụp cho thấy **màn tổng quan cấp bị kéo rộng từ 768px lên
1152px** — trang này toàn chữ và danh sách mục tiêu, ở 1152px thì dòng dài quá khổ đọc, mắt mất
dấu dòng khi xuống hàng. Nguyên nhân: tôi đặt cứng `width="standard"` cho cả hai trường hợp,
trong khi bản cũ dùng `max-w-3xl` khi KHÔNG có cột danh sách.

Sửa: bề rộng phụ thuộc có cột phụ hay không —
`width={isDesktop && master ? 'standard' : 'reading'}`.

Đây là lần thứ hai trong loạt việc mà **ảnh chụp kiểm chứng bắt được lỗi mà typecheck/test
không thấy** (lần trước: JSX hai phần tử gốc ở đợt 2). Ghi lại vì nó xác nhận: với thay đổi
bố cục, nhìn tận mắt là bước kiểm bắt buộc chứ không phải tuỳ chọn.

## Bằng chứng kiểm chứng

```
Build ✅ | Typecheck ✅ | Lint ✅ (0 cảnh báo) | Format ✅
Test ✅ 536 file / 10.925 test
Ngân sách: JS 128,20/140 kB (GIẢM 0,06 kB so với đợt 2) · CSS 17,35/20 kB (không đổi)
```

Kiểm trình duyệt thật 1440×900: `Luyện viết` (soạn bài trái, kết quả chấm rộng phải, mép thẳng
hàng header) và `Lộ trình A1` (khổ đọc đúng sau khi sửa).

## Trạng thái loạt việc "thiết kế lại desktop"

- ✅ Đợt 1 — nền hệ thống: thang chữ, token bề mặt/màu chữ, `PageShell`/`TwoPane`, công cụ đo
  tương phản. Áp lên `ProgrammingLessonPage`, `ProgrammingLevelPage`, `Profile`.
- ✅ Đợt 2 — bề rộng chuẩn 1152px cho cả header lẫn trang; gom `Home`, `Dashboard`.
- ✅ Đợt 3 (đợt này) — gom `Writing`, `CefrLevelPage`; kết luận có cơ sở về `Chat`/`Speaking`.
- ⬜ Còn lại: 10 trang môn Lập trình chưa có tầng desktop; phủ breadcrumb cho `/lap-trinh/**` và
  các trang trụ; (tuỳ chọn) đổi hue bảng màu nhấn.

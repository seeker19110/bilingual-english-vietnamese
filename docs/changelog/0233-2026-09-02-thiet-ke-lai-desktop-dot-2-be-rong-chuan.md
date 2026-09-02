# 0233 — 2026-09-02 — Thiết kế lại desktop, đợt 2: bề rộng chuẩn + gom bố cục 2 cột

**PR:** (điền số PR sau khi tạo)
**Đặc tả:** `docs/specs/2026-09-02-thiet-ke-lai-desktop-toan-dien.md` (mục ⑦, đợt 2)
**Đợt trước:** `0232` (PR #815 — nền hệ thống thiết kế)

## Bối cảnh — đo hình học thật, không suy từ class

Đợt 1 dựng `PageShell`/`TwoPane` và chọn `standard = lg:max-w-5xl` vì đó là bề rộng header. Đợt 2
bắt đầu bằng việc **đo mép đã render** ở 1440×900 thay vì đọc class Tailwind, và phát hiện suy
luận đó sai:

| Trang       | Mép header | Mép nội dung | Lệch                     |
| ----------- | ---------- | ------------ | ------------------------ |
| Trang chủ   | 336 → 1360 | 288 → 1408   | **nội dung thò ra 48px** |
| Tiến độ     | 336 → 1360 | 288 → 1408   | **thò ra 48px**          |
| Luyện viết  | 336 → 1360 | 288 → …      | **thò ra 48px**          |
| Lộ trình A1 | 336 → 1360 | 464 → 1232   | **thụt vào 128px**       |

Nguyên nhân: header là `max-w-5xl` (1024) còn mọi trang CÓ cột phải là `max-w-6xl` (1152) — nội
dung rộng hơn cả header, nên hai lớp lệch nhau ở mọi trang quan trọng nhất. Đây chính là lỗi mà
đợt 1 đặt tên ("mép nội dung không thẳng hàng header") nhưng chưa chữa đúng chỗ.

## Việc đã làm

1. **Chốt bề rộng chuẩn của app = 1152px (`max-w-6xl`).** Con số không tuỳ tiện: 1152 = cột chữ
   ~840px + cột phải 288px + khoảng cách, tức trang có cột phải vẫn giữ cột chữ trong khoảng đọc
   dễ chịu. Kéo **cả hai** về giá trị này:
   - `apps/dhcb/src/components/Layout.tsx` — header `lg:max-w-5xl` → `lg:max-w-6xl`
   - `packages/core-ui/PageShell.tsx` — cấp `standard` `lg:max-w-5xl` → `lg:max-w-6xl`

2. **Gom 2 trong 6 bản chép tay bố cục 2 cột** sang `PageShell` + `TwoPane`:
   - `apps/dhcb/src/pages/core/Home.tsx`
   - `apps/dhcb/src/pages/core/Dashboard.tsx`

   Giữ nhánh `!isDesktop` cho các khối mà **thứ tự nội dung ở mobile khác desktop** (mẹo thưởng,
   streak, mục tiêu tuần nằm xen trong luồng chính ở mobile nhưng nằm ở cột phải ở desktop). Đây
   là khác biệt thật về thông tin, không phải trùng lặp — và vẫn dựng đúng MỘT nhánh nên DOM
   không có bản sao.

3. **Sửa hai "thẻ rỗng" ở cột phải Trang chủ.** Cặp nút Tiến độ/Lịch sử có
   `grid-cols-2 lg:grid-cols-1`; trong cột phải, một cột khiến mỗi nút giãn hết bề ngang mà chỉ
   chứa một icon + một chữ, đọc như hai thẻ rỗng chiếm chỗ lớn. Bỏ `lg:grid-cols-1` → giữ hai cột
   ở mọi bề rộng, chúng trở lại đúng vai trò cặp nút điều hướng gọn.

## Bằng chứng kiểm chứng

**Đo lại sau khi sửa, cùng cách đo:**

```
/                            header 272→1424   nội dung 272→1424   lệch trái 0 / phải 0   tràn ngang: false
/tien-do                     header 272→1424   nội dung 272→1424   lệch trái 0 / phải 0   tràn ngang: false
/lap-trinh/bai-hoc/p1-u4-l1  header 272→1424   nội dung 272→1424   lệch trái 0 / phải 0   tràn ngang: false
/trang-ca-nhan               header 272→1424   nội dung 272→1424   lệch trái 0 / phải 0   tràn ngang: false
```

Từ 48px thò ra xuống **đúng 0px cả hai mép**, trên mọi trang đã di trú (gồm cả 3 trang của đợt 1,
vì chúng dùng `PageShell` nên tự hưởng bề rộng mới).

```
Build ✅ | Typecheck ✅ | Lint ✅ (0 cảnh báo) | Format ✅
Test ✅ 536 file / 10.925 test
Ngân sách: JS 128,26/140 kB · CSS 17,35/20 kB — gần như không đổi so với đợt 1
   (JS +0,03 kB, CSS y nguyên) vì đợt này chủ yếu GỠ class chép tay chứ không thêm
```

## Lỗi tự phát hiện trong lúc làm

Khi thêm chú thích cho chỗ sửa `grid-cols-1`, tôi đặt nó dạng `{/* … */}` ngay trước `<div>` bên
trong `const progressHistory = (…)` — làm biểu thức có **hai phần tử gốc**, Vite báo lỗi cú pháp
và trang trắng. Bắt được ngay nhờ chụp màn hình kiểm chứng sau mỗi thay đổi (không phải nhờ
test). Đã chuyển thành comment JS đặt ngoài biểu thức.

Bài học ghi lại: sau khi sửa JSX, **chụp lại màn hình** rẻ hơn nhiều so với phát hiện ở CI —
typecheck chạy sau đó cũng bắt được, nhưng ảnh cho biết ngay trang có render nổi không.

## Còn lại của loạt việc

- 4 bản chép tay bố cục 2 cột còn lại: `CefrLevelPage`, `Chat`, `Speaking`, `Writing`.
- Đợt 3 — 10 trang Lập trình còn lại. Đợt 4 — phần còn lại + phủ breadcrumb.
- Đợt riêng tuỳ chọn: đổi hue bảng màu nhấn (chưa làm, xem lý do ở changelog `0232`).

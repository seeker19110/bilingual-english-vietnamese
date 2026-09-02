# 0235 — 2026-09-02 — Thiết kế lại desktop, đợt 4: phủ nốt 45 trang còn lại

**PR:** (điền số PR sau khi tạo)
**Đặc tả:** `docs/specs/2026-09-02-thiet-ke-lai-desktop-toan-dien.md` (mục ⑦)
**Đợt trước:** `0232` (#815) · `0233` (#816) · `0234` (#817)

## Bối cảnh

Ba đợt trước dựng nền hệ thống và áp lên 9 trang. Người dùng yêu cầu làm nốt **toàn bộ các trang
chưa đụng tới**. Quét thực tế: 62 file trang có `max-w-*` mà chưa dùng `PageShell`.

**Loại ra khỏi phạm vi có chủ đích** (không phải bỏ sót):

- Đăng nhập · Onboarding · Đặt lại mật khẩu · Nhập liệu · Kết bạn — thẻ hẹp căn giữa
  (`max-w-sm`/`max-w-md`), không nằm trong vỏ app; kéo rộng là hỏng.
- `Landing` / `LandingEn` — trang marketing, hệ thiết kế riêng.
- `Chat` · `Speaking` — bố cục toàn màn hình kiểu app chat, đã kết luận ở đợt 3.
- `Pricing` — vốn đã có `lg:max-w-6xl`.
- `ProgrammingPlayground` — sandbox chạy code, bố cục riêng.
- `AdminDashboard` · `AvatarDemo` — trang nội bộ/demo.

Còn lại **45 trang** thật sự kẹt ở bề rộng cứng → đợt này di trú hết.

## Cách làm

Chia 3 nhóm theo khu vực, giao 3 luồng chạy song song (đúng luật phân việc CLAUDE.md mục 3):
môn Lập trình (11 trang) · Tiếng Anh + Học tập (17) · Lõi + các trụ (17).

Quy tắc chọn bề rộng, thống nhất cho cả ba nhóm:

| Loại nội dung                               | `width`    | Lý do                                  |
| ------------------------------------------- | ---------- | -------------------------------------- |
| Chữ dài để đọc (giới thiệu, đọc truyện, từ) | `reading`  | ~768px, giữ khổ đọc dễ chịu            |
| Biểu mẫu / luồng tuần tự (cài đặt, thi xếp) | `reading`  | hẹp là đúng, không phải thiếu sót      |
| Danh sách / lưới / nhiều thẻ                | `standard` | 1152px — rộng hơn = thấy nhiều mục hơn |
| Canvas/lưới thật sự rộng (Lean Canvas 9 ô)  | `wide`     | 1280px                                 |

`baseWidth` **luôn** truyền đúng class cũ của từng trang, nên di trú là thay đổi **thuần
desktop** — dưới 1024px không đổi gì.

## Lỗi tự phát hiện — thứ mà typecheck và lint KHÔNG bắt được

Cả ba luồng đều báo "typecheck, lint, prettier sạch", và đúng là sạch thật. Nhưng khi tự kiểm
bằng trình duyệt (quét 31 trang, đo hình học + dò lỗi render), phát hiện **3 trang có thẻ
`<main>` bọc ngoài `PageShell`** — mà `PageShell` tự render `<main>`:

- `subjects/english/Dictionary.tsx`
- `subjects/english/Lessons.tsx`
- `subjects/english/CommonPhrases.tsx`

Kết quả là **hai landmark `<main>` lồng nhau** — vi phạm a11y, và cả ba route đều nằm trong danh
sách quét của `e2e/a11y.spec.ts`, nên CI chắc chắn đỏ. Đã sửa thành `<div>` (giữ nguyên class bố
cục), kèm comment giải thích tại chỗ để không tái diễn.

**Vì sao ghi lại:** TypeScript không biết `<main>` lồng `<main>` là sai; ESLint cũng không.
Đây là lần thứ ba trong loạt việc này mà kiểm chứng bằng trình duyệt bắt được lỗi các cổng tĩnh
bỏ qua (lần 1: JSX hai phần tử gốc — đợt 2; lần 2: hồi quy khổ đọc — đợt 3). Kết luận vận hành:
**với thay đổi bố cục, chạy thật là bước kiểm bắt buộc, không phải tuỳ chọn** — và không được
commit dựa trên báo cáo "đã sạch" của luồng phụ mà chưa tự nhìn.

Phép kiểm cũng báo 3 trang "lệch 192px" nhưng đó là **dương tính giả**: trang `reading` (768px)
căn giữa trong header 1152px là đúng thiết kế đã chốt ở đợt 2 (nội dung luôn ≤ header, đối xứng).

### Lỗi thứ hai — chỉ E2E bắt được: `target-size` ở trang Bạn Đồng Hành

Sau khi sửa `<main>` lồng, E2E toàn bộ vẫn còn **4 test đỏ**: `/ban-dong-hanh` rớt `target-size`
(serious, 3 phần tử) ở 4/5 theme. Đây là hồi quy THẬT do đợt này gây ra.

Tái hiện: chỉ xuất hiện ở **1280×720** (viewport của Playwright), không thấy ở 1440×900 — nên
lượt kiểm trình duyệt của tôi ban đầu bỏ sót. Chạy axe trực tiếp ở đúng 1280px thì lộ ra hai nút
Studio bị **che một phần** ("smallest space is 101px by 10.4px").

Nguyên nhân: `Companion.tsx` là khung **chiều-cao-đầy** (`flex flex-1 flex-col`), bản cũ dùng
`py-4`. Khi di trú, `PageShell` áp `pt-6 lg:pt-8` + `pb-[calc(2rem+var(--bnav-h))]` — đệm dưới
lớn hơn đẩy nội dung chồng lên hàng nút Studio. Sửa: ép `!py-4` để giữ ĐÚNG đệm cũ, có comment
giải thích tại chỗ.

**Bài học:** với khung chiều-cao-đầy, `PageShell` không được đổi khoảng đệm — khác hẳn trang cuộn
bình thường nơi đệm lớn hơn là vô hại. Và: kiểm ở MỘT bề rộng là chưa đủ; lỗi này chỉ lộ ở
1280px.

## Phán đoán đúng của các luồng phụ (giữ lại, không ép khuôn)

- Màn **chi tiết** của `CommonPhrases` và `Lessons` dùng khung `h-[calc(100dvh-…)] overflow-hidden
flex flex-col` — kiểu app chiều-cao-cố-định, không phải trang cuộn → giữ nguyên. Hai thẻ `<main>`
  còn lại trong `CommonPhrases` nằm ở **hai nhánh return khác nhau**, không lồng nhau.
- `CareerStartup` và `WorkLife` chỉ là vỏ tab nhúng `Career`/`Startup`/`Work`/`Life` (đã có
  `PageShell` sau đợt này) → bỏ qua để tránh `PageShell` lồng `PageShell`.

## Bằng chứng kiểm chứng

```
Build ✅ | Typecheck ✅ (4 project) | Lint ✅ (0 cảnh báo) | Format ✅
Test ✅ 536 file / 10.925 test (chạy lại sau khi sửa <main> lồng)
E2E toàn bộ ✅ 657/657 (lượt đầu 653/4 đỏ → sửa target-size → chạy lại sạch)
Ngân sách: JS 128,28/140 kB · CSS 17,36/20 kB — cả hai trong hạn
Kiểm render 31 trang ở trình duyệt 1440×900: 0 vấn đề sau khi sửa
```

## Trạng thái loạt việc "thiết kế lại desktop"

- ✅ Đợt 1 (#815) — nền hệ thống: thang chữ, token bề mặt/màu chữ, `PageShell`/`TwoPane`, công cụ
  đo tương phản (62 test).
- ✅ Đợt 2 (#816) — bề rộng chuẩn 1152px cho cả header lẫn trang; gom `Home`, `Dashboard`.
- ✅ Đợt 3 (#817) — gom `Writing`, `CefrLevelPage`; `railSide` cho master–detail.
- ✅ Đợt 4 (đợt này) — phủ nốt 45 trang còn lại.
- ⬜ Còn lại: phủ breadcrumb cho `/lap-trinh/**` và các trang trụ; thêm cột ngữ cảnh cho những
  trang giờ đã đủ rộng để có; (tuỳ chọn) đổi hue bảng màu nhấn.

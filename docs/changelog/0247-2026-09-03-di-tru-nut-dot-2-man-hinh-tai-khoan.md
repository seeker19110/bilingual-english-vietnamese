# 0247 — 2026-09-03 — Di trú nút đợt 2: màn hình tài khoản và luồng người mới

PR: (điền sau) · Nhánh: `claude/viec-tiep-theo-mjoode`

## Bối cảnh

Nối tiếp đợt 1 (changelog 0246, PR #829) đã di trú 12 nút và **chốt cách làm**. Đợt này áp
đúng cách làm đó cho nhóm tiếp theo: **7 nút, 5 file** thuộc màn hình tài khoản (xác thực
email, xác thực hai bước, đặt lại mật khẩu) và luồng người mới (`/bat-dau`, thẻ việc đầu tiên).

Đợt 1 đề nghị ưu tiên màn hình **nằm ngoài tầm cổng a11y** vì ở đó không có gì khác canh lỗi
tương phản. Nhóm này đúng như vậy: cả 7 nút đều nằm sau đăng nhập hoặc sau một liên kết có
token, không thuộc 15 trang được `e2e/a11y.spec.ts` quét.

## Một việc phải làm TRƯỚC khi chạy cổng

Cổng `npm run typecheck` báo đỏ ngay từ đầu phiên với lỗi `TS5101: Option 'baseUrl' is
deprecated` — **ở file không hề đụng tới**. Đây đúng dấu hiệu lệch lockfile mà CLAUDE.md mục 8
mô tả. Kiểm: `npx tsc --version` ra **6.0.2** trong khi `package.json` khai `^5.2.2`.

`npm ci` đưa về TypeScript 5.9.3, typecheck xanh ngay, **không phải sửa một dòng cấu hình nào**.
Ghi lại vì đây là lần thứ hai bẫy này xuất hiện (lần đầu: CI #475, 2026-08-04) — trong container
phiên mới, chạy `npm ci` trước lần chạy cổng đầu tiên.

## Đã làm

| File                                | Số nút | Ghi chú                                          |
| ----------------------------------- | ------ | ------------------------------------------------ |
| `components/TwoFactorSection.tsx`   | 2      | "Xác nhận" và "Bật xác thực hai bước"            |
| `pages/core/Intake.tsx`             | 2      | "Được, mình bắt đầu" và "Tiếp" (dùng lại 2 bước) |
| `components/EmailVerifySection.tsx` | 1      | "Xác thực"                                       |
| `pages/core/ResetPassword.tsx`      | 1      | "Đặt mật khẩu mới"                               |
| `components/FirstTaskCard.tsx`      | 1      | "Mình làm xong rồi"                              |

Kèm theo: 4 nút đang tự dựng vòng quay bằng `<Loader2 className="animate-spin" />` nay chuyển
sang prop `loading` của `Button`. Đây **không chỉ là gọn mã** — `Button` kèm `aria-busy` và một
nhãn `sr-only`, nên trình đọc màn hình biết nút đang bận; bản cũ chỉ báo bằng hình. Ngữ nghĩa
khoá nút giữ nguyên vì `Button` tự tính `disabled={disabled || loading}`.

## Bằng chứng kiểm chứng

Đợt 1 dặn **đo lại trong trình duyệt thay vì tin rằng class mới tương đương**. Thay vì bấm tay
qua từng luồng (nhiều nút nằm sau đăng nhập, không tới được), đợt này dựng phép đo phủ rộng
hơn: nạp CSS thật của app rồi render **song song** chuỗi class CŨ và class MỚI của cả 7 nút,
so `getComputedStyle` trên 12 thuộc tính, lặp qua **cả 5 theme**.

Kết quả: **25/35 cặp (7 nút × 5 theme) trùng khớp tuyệt đối.** Quan trọng hơn con số đó —
`height`, `borderRadius`, `fontSize`, `fontWeight`, `backgroundColor`, `color` **giống hệt ở
mọi cặp, mọi theme**, tức không có thay đổi kích thước và **không có hồi quy tương phản**.

10 cặp lệch nằm ở đúng 2 nút, và lệch ở thuộc tính không đổi hình:

- **2FA · "Xác nhận"** — `justifyContent: normal → center`. Nút co theo nội dung, không giãn
  rộng, nên căn giữa không dịch chuyển gì.
- **ResetPassword · "Đặt mật khẩu mới"** — bản cũ là `display: block` (không flex), bản mới là
  flex căn giữa kèm `px-4`. Nút `w-full` và chữ vốn đã căn giữa sẵn bằng `text-align` mặc định
  của `<button>`, nên bề ngoài không đổi.

Cổng đã chạy đầy đủ sau `npm ci`: `npm run typecheck` ✅ · `npm run lint` (0 cảnh báo) ✅ ·
`npm test` **543 file / 10.969 test xanh** ✅ · `npm run build` ✅ · `npx prettier --check` ✅.

## KHÔNG di trú trong đợt này (và vì sao)

Bốn nút trông rất giống nhóm trên nhưng **thiếu class cỡ chữ**, nên cỡ chữ hiện đang thừa kế
từ thẻ cha — chuyển sang `Button` sẽ ép về `text-sm` và có thể làm chữ co lại ở nơi cha đang
đặt `text-base`. Muốn di trú thì phải **đo cỡ chữ thật trong trình duyệt trước**, không suy từ
class:

- `components/admin/AdminPlanFeaturesPanel.tsx` · `AdminGrantPlanPanel.tsx` ·
  `AdminPlanMarketingPanel.tsx` — thêm lệch `gap-1.5` (so với `gap-2`).
- `components/FeatureGate.tsx` — thêm lệch `px-5` (so với `px-4`).

Ngoài ra phần lớn nút accent còn lại dùng `rounded-2xl`, không khớp `rounded-xl` của `Button` —
vẫn thuộc diện "KHÔNG di trú" theo luật hình thức đã chốt ở đợt 1.

## Việc tiếp theo

Còn ~896 nút. Hai hướng cho đợt sau, theo thứ tự giá trị:

1. **Đo cỡ chữ thừa kế của 4 nút vừa hoãn ở trên** rồi di trú — chúng nằm trong bảng quản trị,
   đúng vùng cổng a11y không quét tới.
2. Quyết định xem `Button` có nên có biến thể bo `2xl` hay không. Đây là câu hỏi **thiết kế**,
   không phải câu hỏi kỹ thuật: hiện `rounded-2xl` là hình thức phổ biến nhất trong app nhưng
   `Button` lại chốt `rounded-xl`, nên phần lớn nút còn lại vĩnh viễn không di trú được nếu
   không trả lời câu này. Nên hỏi người dùng trước khi tự thêm biến thể.

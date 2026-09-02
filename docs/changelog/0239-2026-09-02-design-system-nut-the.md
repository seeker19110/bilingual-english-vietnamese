# 0239 — 2026-09-02 — Design system: nút và thẻ dùng chung, vá 17 lỗi tương phản

PR: #823 · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Bảy đợt trước (#815–#822, changelog 0232–0238) đã dựng xong **khung** desktop: sidebar trái,
breadcrumb, cột mục lục, bề rộng chuẩn `max-w-6xl`, tầng desktop cho 47 trang. Nhưng khung
đúng mà **thành phần bên trong khung vẫn lệch nhau**, nên tổng thể chưa đạt.

Đo thật trên `apps/dhcb/src` ngày 2026-09-02:

| Hạng mục                                                    | Số đo                                                                             |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Thẻ `<button>` trong app                                    | 915                                                                               |
| Component nút dùng chung                                    | **0**                                                                             |
| Biến thể class của riêng "nút chính" (`bg-accent-500`)      | ~50                                                                               |
| Màu chữ khác nhau trên cùng nền accent                      | **4** (`text-black` 88 · `text-white` 25 · `text-[#09090b]` 18 · `text-[#fff]` 2) |
| `rounded-xl` / `rounded-2xl` / `rounded-lg` / `rounded-3xl` | 894 / 603 / 283 / 124                                                             |

## Việc đã làm

1. **`packages/core-ui/buttonStyles.ts` + `Button.tsx`** — nút chuẩn, 4 biến thể theo VAI TRÒ
   (`primary`/`secondary`/`ghost`/`danger`), 3 cỡ (`md` = 44px đúng luật vùng chạm). Có
   `loading` tự khoá nút (chặn bấm hai lần gửi hai lần), `type="button"` mặc định, viền lấy
   nét `focus-visible` không biến thể nào được bỏ.
2. **`packages/core-ui/cardStyles.ts` + `Card.tsx`** — thẻ chuẩn (`plain`/`interactive`/
   `highlight`), dùng token ngữ nghĩa `surface-card`/`line-subtle` đã đo đạt WCAG.
3. Cả hai xuất kèm hàm `buttonClass()` / `cardClass()` để `<Link>` của react-router dùng chung
   một nguồn sự thật về hình thức mà `packages/` không phải phụ thuộc router của app.
4. **Vá 17 file dính lỗi tương phản thật** (xem dưới).
5. **Test canh gác** `Button.test.tsx` quét toàn bộ `apps/dhcb/src` + `packages/core-ui`, chặn
   CI nếu có file nào đặt `text-white` lên nền accent đặc trở lại.

## Lỗi tương phản đã vá (không phải việc thẩm mỹ)

`text-white` map sang biến `--c-white`. Biến này **bị đảo thành màu tối ở 3 theme nền sáng**,
nên ở các theme đó nó tình cờ đúng. Ở theme **nền tối** (Xanh đêm — mặc định, và Rực rỡ) nó là
chữ trắng thật trên nền accent:

- Xanh đêm: `#fff` trên `#10B981` → **≈ 2,3:1**
- Rực rỡ: `#fff` trên `#D946EF` → **≈ 3,4:1**

Sàn AA là 4,5:1 và CLAUDE.md mục 4.5 ghi rõ đây là **sàn cứng, dung sai 0**. 17 file vi phạm,
gồm 7 bảng quản trị, `ErrorBoundary`, `FeatureGate`, `EmailVerifySection`, `Profile`,
`ResetPassword`, `WorkKanban`, `SubjectDetail`, `QuestsPanel`, `AvatarDemo`,
`HomeUniversalAiBar`.

**Vì sao cổng a11y không bắt được:** `e2e/a11y.spec.ts` quét 15 trang × 5 theme, nhưng các nút
này nằm **sau đăng nhập** (bảng quản trị, cổng tính năng) nên trình duyệt không bao giờ dựng
tới chúng. Đây là lý do test canh gác mới phải là **test tĩnh quét mã nguồn**, không phải thêm
một trang vào danh sách quét.

Màu thay thế `#09090b` (giá trị đã dùng sẵn ở 18 chỗ) đo được ≥ 5,8:1 trên cả 5 theme, đạt AA
ở theme yếu nhất (Pink).

## Bằng chứng kiểm chứng

- `npx vitest run packages/core-ui/` → 9 file, **69 test xanh** (5 test mới của Button).
- `npm run typecheck` → sạch (4 tsconfig).
- `npm run lint` → **0 cảnh báo** (max-warnings 0). Quy tắc `react-refresh/only-export-components`
  là lý do hàm tạo class nằm ở file `*Styles.ts` riêng chứ không chung file component.
- `npm test` + `npm run build` → xem phần Validation của PR.
- Kiểm lại số file vi phạm sau khi vá: **0**.

## Quyết định kèm theo

- **Nút không nhận tham số màu chữ.** Màu chữ là hệ quả của biến thể, quyết một lần cho cả 5
  theme. Đây chính là cơ chế khiến lỗi trên không tái phát được.
- **`danger` dùng màu hồng-đỏ cố định, không theo accent.** Cảnh báo phải trông giống nhau ở
  mọi theme, không hoà vào màu thương hiệu.
- **Chưa thay thế hàng loạt 915 nút cũ trong đợt này.** Thay đúng 17 file có lỗi thật; phần
  còn lại di trú dần theo từng trang ở các đợt sau, để mỗi PR còn đọc được diff.

## Việc tiếp theo

Đợt sau áp `Button`/`Card` vào **các màn hình học** (lộ trình CEFR, luyện nói, tiến độ) — theo
yêu cầu ưu tiên trải nghiệm học tập của người dùng.

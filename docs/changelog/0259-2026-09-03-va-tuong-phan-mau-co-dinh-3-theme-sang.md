# 0259 — 2026-09-03 — 720 chỗ chữ rớt tương phản ở 3 theme nền sáng: vá xong + cổng chặn

**PR:** (điền sau) · **Loại:** `fix` — sửa lỗi a11y diện rộng + thêm cổng canh.

## Đính chính ngay: con số "423" ở đợt 0258 là ĐO HẸP

Đợt trước ghi nợ "423 chỗ màu Tailwind cứng", đo bằng 4 họ màu (`violet/purple/fuchsia/cyan`).
Đo lại **đủ 21 họ**: **~4.141 lần** trong `apps/` — `amber` 763 · `emerald` 700 · `rose` 480 ·
`sky` 328 · `indigo` 277 · `purple` 229 · `violet` 179 · `cyan` 143…

Hệ quả: kế hoạch ban đầu (token hoá 4 họ đó) là **tuỳ tiện** — không có lý do nào để token hoá
`purple` mà bỏ qua `amber` vốn nhiều gấp ba. Nên đợt này đổi cách tiếp cận: thay vì đuổi theo
"màu cứng là xấu" (chuyện thẩm mỹ), đi tìm **chỗ màu cứng gây HẠI THẬT** (chuyện đo được).

## Lỗi thật tìm được

Thang `zinc`/`accent`/`content` của dự án là biến CSS nên **tự đảo** ở 3 theme nền sáng
(blue-sky, pink, kid). Màu Tailwind gốc thì **không** — `text-amber-300` chọn cho nền tối vẫn là
`#fcd34d` khi nền đã thành trắng.

Đo bằng script mới (`scripts/fixed-color-contrast-audit.ts`, đọc thẳng mã nguồn, đối chiếu với
giá trị token thật của từng theme):

|                                                   |                                                 |
| ------------------------------------------------- | ----------------------------------------------- |
| Chỗ màu chữ rớt AA (4.5:1) ở **3 theme nền sáng** | **720**                                         |
| Chỗ rớt ở 2 theme nền tối                         | 4                                               |
| File dính                                         | 120                                             |
| Tệ nhất                                           | `text-amber-300` → **1,17:1** (gần như vô hình) |

**Vì sao hai cổng a11y không bắt được:** `e2e/a11y.spec.ts` + `a11y-aaa.spec.ts` quét **15 trang**
× 5 theme. Rất nhiều component chỉ hiện trong luồng sâu (modal, tab, trạng thái lỗi) không nằm
trong 15 trang đó. Cổng E2E đo cái **được render**; script này đọc **mã nguồn**, nên phủ cả
component chưa test E2E nào chạm tới. Hai cách bổ sung nhau, không thay thế nhau.

## Sửa

Dùng đúng **cách vá sẵn có của dự án** — biến thể `theme-light:text-<họ>-<bậc>` (đã có 73 tiền lệ
viết tay) — chứ không phát minh hệ token mới. Bậc chọn theo luật: **bậc SÁNG NHẤT đạt AAA trên cả
3 theme sáng × 3 bề mặt** (tính bằng máy, không chọn tay): `slate-700`; `blue/indigo/violet/purple-800`;
còn lại `-900`.

- **718 chỗ** vá bằng codemod (chỉ chạm class TRẦN; class có biến thể `hover:`/`group-hover:`
  không đụng tới vì bản vá cho chúng phải là `theme-light:hover:…` — bài toán khác).
- **4 chỗ** sửa tay: 1 chú thích đổi hẳn sang token `text-content-muted`; 2 chỗ override cũ chỉ
  đạt 4,07 nâng lên `-900`; 1 chỗ `text-rose-500` quá tối trên nền tối đổi thành `rose-400`.

Kết quả đo lại: **0 chỗ rớt ở cả 5 theme.**

## Cổng chặn + chống baseline trá hình

`scripts/fixed-color-contrast-audit.test.ts` (4 test) chạy trong `npm test`:

1. 0 chỗ rớt AA — thông báo lỗi chỉ luôn cách vá.
2. Ca hỏng cố ý phải bị bắt (script không im lặng cho qua).
3. Không báo nhầm khi chữ nằm trên **nền màu đặc** (`bg-amber-400 text-slate-950` — bề mặt thật
   là cái nền đó, không phải nền trang).
4. **Mỗi mục ALLOWLIST phải CÒN khớp thật.** ALLOWLIST hiện có đúng 2 mục, cùng một lý do:
   `text-*` đặt trên `<input type="checkbox">` là màu **dấu tích**, không phải màu chữ — script
   đo sai bản chất. Mục không còn khớp = mục chết, test đỏ, buộc phải xoá. Nhờ vậy danh sách
   không âm thầm phình thành baseline — đúng thứ luật a11y của dự án cấm.

## Bằng chứng kiểm chứng

| Cổng                            | Kết quả                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `npm run typecheck`             | ✅                                                                           |
| `npm run lint` (max-warnings 0) | ✅                                                                           |
| `npm test`                      | ✅ **547 file / 11.125 test**                                                |
| `npm run build`                 | ✅                                                                           |
| `npx size-limit` — CSS          | 17,85 → **18,03 kB** brotli (ngưỡng 20 kB; đo cả hai chiều bằng `git stash`) |
| `npx size-limit` — JS           | 128,5 kB (ngưỡng 140 kB), không đổi                                          |
| Script audit                    | 720 → **0**                                                                  |

## Còn mở (không thuộc đợt này)

Có nên đổi hẳn các họ màu này sang token vai trò để chúng đổi theo theme không — đó là **quyết
định thiết kế**, không phải lỗi, và chạm >4.000 chỗ. Đã ghi vào `PROGRESS.md` kèm đề xuất **giữ
nguyên**: sau đợt này chúng đã an toàn về tương phản, mà đổi thì rủi ro thị giác thật.

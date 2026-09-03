# 0246 — 2026-09-03 — Bắt đầu di trú nút cũ sang `Button` dùng chung

PR: #829 · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

`Button`/`buttonClass` dựng ở đợt 1 (changelog 0239) nhưng **chưa được dùng ở đâu** — 915 nút
cũ giữ nguyên. Đợt này bắt đầu di trú, và quan trọng hơn: **chốt cách làm** để các đợt sau lặp
lại được mà không phải nghĩ lại từ đầu.

Con số 915 không thể xử lý trong một PR: diff sẽ không ai đọc nổi, và một lỗi hình thức sẽ lan
ra toàn app cùng lúc. Nên đợt này cố ý nhỏ — **12 nút, 4 file** — đổi lại là mỗi nút đều kiểm
được.

## Cách chọn nút để di trú (dùng lại cho đợt sau)

**Chỉ di trú nhóm khớp 1-1.** Đếm các chuỗi class lặp lại rồi so từng thuộc tính với `Button`:

| Nút cũ (9 chỗ trong `Practice.tsx`) | `Button` `primary`/`md`/`fullWidth` | Khớp?                           |
| ----------------------------------- | ----------------------------------- | ------------------------------- |
| `py-3 min-h-11`                     | `h-11` (44px)                       | ✅                              |
| `rounded-xl`                        | `rounded-xl` (12px)                 | ✅                              |
| `text-sm font-semibold`             | `text-sm font-semibold`             | ✅                              |
| `bg-accent-500 hover:bg-accent-400` | như vậy                             | ✅                              |
| `text-black` (đen tuyệt đối)        | `text-[#09090b]`                    | ~ chênh không nhìn thấy         |
| `disabled:opacity-40`               | `disabled:opacity-50`               | ~ nhạt hơn một chút, đúng chuẩn |

Đo lại trong trình duyệt sau khi đổi: **736×44px, bo 12px, cỡ chữ 14px** — trùng nút cũ.

**KHÔNG di trú ba loại sau** (đã gặp ngay trong đợt này):

1. **Thẻ danh sách bấm được** — 8 "nút" trong `Practice.tsx` mang class
   `p-3.5 rounded-2xl bg-zinc-900/70 ... text-left`, bên trong có tiêu đề + mô tả nhiều dòng.
   `Button` có `justify-center`, `whitespace-nowrap`, `font-semibold` — ép vào là hỏng hẳn bố
   cục. Chúng là **thẻ**, không phải nút hành động, dù dùng thẻ `<button>`.
2. **Nút có thêm viền/bo khác** — 2 nút `bg-accent-500/15 border border-accent-500/30
rounded-2xl py-4`. `Button` biến thể `secondary` không có viền và bo `xl`. Muốn di trú thì
   phải truyền `className` đè hình thức — trái đúng điều `buttonStyles.ts` dặn ("`className`
   dùng cho bố cục, KHÔNG dùng để đè màu/bo góc"). Để nguyên, chờ khi nào design system có
   biến thể viền thật.
3. **Nút biểu tượng vuông** (`w-9 h-9 rounded-xl bg-violet-500/15 …`) — kích thước và màu theo
   ngữ cảnh từng mục, không thuộc thang `sm/md/lg`.

## Đã làm

| File                                          | Số nút | Ghi chú                                                     |
| --------------------------------------------- | ------ | ----------------------------------------------------------- |
| `pages/learning/Practice.tsx`                 | 9      | Nút "Kiểm tra"/"Câu tiếp theo" trong 8 chế độ luyện phản xạ |
| `components/admin/AdminVipWhitelistPanel.tsx` | 1      |                                                             |
| `components/admin/AdminPricePromoPanel.tsx`   | 1      |                                                             |
| `components/admin/AdminLimitsPanel.tsx`       | 1      |                                                             |

Ba file admin dùng chung một chuỗi class (`… text-[#09090b] … disabled:opacity-60`) — đúng
kiểu chép class sang màn hình mới mà `Button` sinh ra để chặn. Đây cũng là nhóm nằm **ngoài
tầm cổng a11y** (bảng quản trị sau đăng nhập, không thuộc 15 trang được quét), nên chuẩn hoá ở
đây có giá trị thực chất chứ không chỉ gọn mã.

## Một điều đã KIỂM và KHÔNG phải lỗi

`text-black` xuất hiện ở 88 chỗ. Vì `text-white` trong dự án map sang `--c-white` và **bị đảo
màu** ở theme nền sáng (nguồn của 17 lỗi tương phản đã vá ở đợt 1), tôi ngờ `text-black` cũng
vậy. Kiểm `apps/dhcb/tailwind.config.js`: chỉ `white` được map sang biến CSS, `black` **không**
— nên `text-black` luôn là đen thật ở mọi theme, tương phản trên nền accent luôn cao.

Không có lỗi ẩn. Ghi lại để đợt sau không đi kiểm lại cùng một giả thuyết.

## Bằng chứng kiểm chứng

- **Kiểm bằng trình duyệt thật**: mở chế độ "Sắp Xếp Câu Hoàn Chỉnh", đo nút sau di trú —
  736×44px, nền `rgb(16,185,129)`, chữ `rgb(9,9,11)`, bo 12px, cỡ chữ 14px. Ảnh chụp trước/sau
  đã đối chiếu.
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` — xem Validation của PR.
- Cổng `e2e/a11y.spec.ts` chạy lại đầy đủ (nay đã chờ theo trạng thái, changelog 0245).

## Việc tiếp theo

Còn ~903 nút. Cách làm đã chốt ở mục trên; mỗi đợt nên nhận 1–2 trang, di trú các nhóm khớp
1-1, và **đo lại kích thước trong trình duyệt** thay vì tin rằng class mới tương đương. Ưu
tiên các màn hình nằm ngoài tầm cổng a11y (bảng quản trị, cổng tính năng) vì ở đó không có gì
khác canh lỗi tương phản.

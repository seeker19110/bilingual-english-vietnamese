# 0266 — 2026-09-03 — Theme "Xanh đêm" chuyển sang phong cách Sci-Fi

**PR:** (điền sau) · **Loại:** `refactor` — chỉ đổi token màu/bo góc của MỘT theme, không thêm
tính năng nghiệp vụ, không đụng theme nào khác.

## Yêu cầu và phạm vi đã chốt

Người dùng hỏi "thiết kế UI/UX theo phong cách Sci-Fi được chứ?" — hỏi thăm trước khi làm.
Đã cảnh báo hai điểm trước khi bắt tay: (1) đợt D1–D3 vừa xong (`0263`–`0265`, PR #846–#848)
CHỦ ĐỘNG gỡ glow/pulse trang trí — làm Sci-Fi kiểu cũ (neon glow, nhấp nháy liên tục) là đi
ngược đúng luật vừa siết; (2) app phục vụ người mới học tiếng Anh, có theme "Nhi đồng" riêng
cho trẻ em, nên không áp Sci-Fi cho toàn bộ 5 theme. Người dùng chốt: **chỉ theme Xanh đêm**
(theme mặc định). Sau đó hỏi thêm 2 câu qua `AskUserQuestion`, chốt:

- Màu nhấn: đổi từ **emerald sang cyan** ("xanh băng") — emerald trùng với màu xanh lá NGỮ
  NGHĨA "đúng" (CLAUDE.md mục 4.8), cyan tách hẳn hai nghĩa; cyan cũng đúng chất HUD/hologram
  của Sci-Fi hơn.
- Mức độ: **vừa** — đổi bảng màu (nền/viền/accent) + vài chi tiết TĨNH (lưới toạ độ mờ, chữ số
  đều cột, bo góc gọn hơn một nấc). KHÔNG thêm glow/animation mới — đúng luật 5/6 mục 9 của
  `.agents/skills/ui-ux-craftsman` vừa siết ở đợt D.

## Thay đổi

- `packages/core-ui/theme.css` — khối `:root, [data-theme='dark-blue']`:
  - Thang `--z-*` (nền/chữ trung tính): tối hơn + ngả xanh (blue channel cao hơn red/green) —
    cảm giác "màn hình điều khiển" thay vì navy/slate xám ấm cũ. z-100..z-500 đo lại đạt
    AAA/AA trên cả 3 bề mặt (script + test đã có sẵn, không sửa ngưỡng).
  - `--glass-border`: ngả cyan nhẹ (đường kẻ HUD) thay slate trung tính.
  - Thang `--a-*` (accent): **emerald → cyan** (giá trị Tailwind `cyan` chuẩn).
  - `--theme-color`: `#0f172a` → `#0b1226` (đồng bộ `apps/dhcb/index.html`,
    `apps/hub/index.html`, `packages/core-ui/theme.ts`).
  - Thêm 4 biến `--r-lg/xl/2xl/3xl` (bo góc) NGAY TRONG khối màu này — chỉ theme Sci-Fi khai,
    4 theme còn lại dùng fallback `var(--r-lg, 0.5rem)` ở `tailwind.config.js` nên không đổi gì.
- `apps/dhcb/tailwind.config.js` — `borderRadius.lg/xl/2xl/3xl` đọc từ biến CSS thay vì số cứng,
  để một theme đổi được độ bo của toàn app (~1.900 chỗ dùng class) mà không sửa từng file.
- `apps/dhcb/src/index.css` — chi tiết Sci-Fi TĨNH, chỉ trong `[data-theme='dark-blue']`:
  `font-variant-numeric: tabular-nums` cho `body` (số liệu đều cột) + lưới toạ độ mờ vẽ bằng
  `body::before` (pseudo-element, KHÔNG phải `background-image` trên `body` thật — lý do: axe
  trong `e2e/a11y*.spec.ts` xếp nền là ảnh vào diện "incomplete" thay vì đo, làm yếu cổng AAA
  cho chữ nằm trực tiếp trên nền trang). Tắt lưới khi `prefers-contrast: more` hoặc in giấy.

## Hai bẫy đã dính và cách tránh cho người sửa sau

1. **Hai khối `[data-theme='dark-blue']` trùng tên ghi đè nhau.** Bản nháp đầu tiên tách bo góc
   ra một khối `[data-theme='dark-blue']` riêng, đứng SAU khối màu. Cả `themeContrast.test.ts`
   và `scripts/lib/contrast.ts` đọc `theme.css` bằng cách gom mỗi theme vào MỘT khoá theo tên —
   khối trùng tên đứng sau ÂM THẦM ghi đè khối trước, xoá sạch bảng màu. `themeContrast.test.ts`
   bắt được ngay (29 test đỏ, báo "thiếu --a-400"...). Sửa: gộp `--r-*` vào chung khối màu.
2. **Một dòng comment chứa ký tự `}` làm gãy một bộ phân tích CSS khác.** `scripts/lib/contrast.ts`
   (dùng bởi `scripts/contrast-audit.ts` + `scripts/fixed-color-contrast-audit.ts`) cắt một khối
   CSS tại ký tự đóng ngoặc nhọn ĐẦU TIÊN gặp được bằng regex `[^}]*` — không hiểu comment/chuỗi.
   Một câu giải thích trong comment có dán trực tiếp cú pháp `[data-theme=...]{...}` (chứa `}`)
   khiến nó cắt khối `dark-blue` giữa chừng, lẫn dữ liệu sang theme kế tiếp — hậu quả: cổng
   `fixed-color-contrast-audit.test.ts` báo hơn 3.500 cặp rớt AA GIẢ (đo nhầm nền sáng của
   `blue-sky` làm nền của `dark-blue`). Sửa: diễn đạt lại câu đó không dùng ký tự `}` trong
   comment, kèm cảnh báo tại chỗ cho người sửa sau. Đã thêm sẵn cảnh báo NGAY TRONG file để
   không lặp lại.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (11150/11150, 551 file)
```

Đã chạy riêng 3 cổng tương phản liên quan trước khi chạy full suite:
`scripts/contrast-audit.test.ts` + `scripts/fixed-color-contrast-audit.test.ts` +
`apps/dhcb/src/lib/themeContrast.test.ts` — cả ba xanh sau khi sửa 2 bẫy ở trên.

## Việc CHƯA làm (ngoài phạm vi đã chốt)

- 4 theme còn lại (Blue sky, Pink, Rực rỡ, Nhi đồng) và app `@dhcb/hub` giữ nguyên hoàn toàn.
- Không thêm glow/animation mới (đúng luật 5/6 mục 9 `.agents/skills/ui-ux-craftsman`).

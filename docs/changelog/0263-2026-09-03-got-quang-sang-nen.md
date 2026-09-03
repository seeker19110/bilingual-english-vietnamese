# 0263 — 2026-09-03 — Đợt D1 thiết kế lại UI/UX: gỡ quầng sáng nền trang trí

**PR:** (điền sau) · **Loại:** `refactor` — không thêm tính năng nghiệp vụ, chỉ đổi cách trình bày.
Phần đầu của đợt D (giảm nhiễu thị giác toàn app) đã hẹn ở `docs/changelog/0261-*.md` +
`0262-*.md`; tách D thành từng phần nhỏ (D1, D2, …) theo đúng nguyên tắc "chia nhỏ" của
CLAUDE.md — phạm vi đo được của D quá lớn (57 file bóng màu, 31 file `animate-pulse`, 10 file
`animate-ping`) để làm một PR.

## Vì sao có đợt D1 riêng

Luật 5 mục 9 (`.agents/skills/ui-ux-craftsman`) chặn "bóng phát sáng màu"/quầng sáng trang trí
không mang nghĩa trạng thái. Đo 2026-09-03: `blur-2xl`/`blur-3xl` xuất hiện ở 8 chỗ trong
`apps/`. Rà từng chỗ:

- **7 chỗ là quầng sáng trang trí thuần** — một `<div>` tuyệt đối định vị, bo tròn hết cỡ
  (`rounded-full`), nền màu mờ (`bg-<màu>-500/10`), làm mờ nét (`blur-2xl`/`blur-3xl`), không
  phản ứng sự kiện (`pointer-events-none`). Không mang nghĩa gì — xoá không đổi hành vi.
- **1 chỗ (`Layout.tsx`) là `backdrop-blur-2xl`** trên dropdown "Chuyển đổi Studio" — kính mờ
  thật (frosted glass) cho một bề mặt NỔI lên trên nội dung, cùng họ với tiện ích `.glass` đã
  có trong `index.css`. Đây không phải quầng sáng — **giữ nguyên**, không nằm trong luật 5.

## Đã gỡ (7 file)

`components/CompanionVoice/{ArticulatoryPhoneticsVisualizer,ScenarioHolodeckCard,
EchoShadowingCard,SocraticDiagnosticsCard,WorkplaceHarvesterCard,WearablesSyncCard}.tsx` +
`pages/subjects/english/Writing.tsx` — mỗi file có đúng một `<div>` quầng sáng (comment
"Background Glow"/"Neon Glow" hoặc không có comment) nằm ngay đầu thẻ bọc thẻ; xoá nguyên dòng
đó, giữ nguyên `relative overflow-hidden` trên thẻ bọc (vô hại dù không còn phần tử con định vị
tuyệt đối nào dùng tới, không đáng đổi thêm một dòng diff để dọn).

Component `HomeAiBriefingCard.tsx` cũng có 2 dòng quầng sáng nhưng đã được viết lại HOÀN TOÀN ở
đợt C (`docs/changelog/0262-*.md`, PR #845) — 2 dòng đó tự nhiên biến mất khi merge/rebase D1
lên `main` sau khi #845 vào; không tính là việc của D1.

## Test canh gác mới

`pages/core/UiNoise.design.test.ts` — quét TOÀN BỘ `.ts`/`.tsx` trong `apps/dhcb/src` (đọc mã
nguồn thật, không render — nhanh và không phụ thuộc runtime), cấm mẫu
`rounded-full` + `blur-2xl`/`blur-3xl` (quầng sáng), KHÔNG cấm `backdrop-blur` (kính mờ hợp lệ).
Có canh chống hàm quét thư mục bị hỏng rồi lặng lẽ trả về rỗng (đòi ≥100 file tìm được).

## Việc CHƯA làm (cố ý, để lại cho D2/D3)

- **Bóng phát sáng màu** (`shadow-<màu>-500/xx`, luật 5) — đo được 57 file, ~154 chỗ. Mỗi chỗ
  cần xét có mang nghĩa trạng thái không (đang ghi âm/đang chọn/tiêu điểm) trước khi gỡ — không
  làm mù trong đợt này.
- **`animate-pulse` trang trí** (luật 6) — 31 file, ~52 chỗ; nhiều chỗ là trạng thái sống thật
  (Companion đang nghe/nói) hợp lệ, cần rà từng chỗ.
- **`animate-ping` trang trí** (luật 6) — 10 file; một số là trạng thái thật (đang ghi âm ở
  `HomeUniversalAiBar.tsx`, live telemetry) — cần rà, không gỡ hàng loạt.
- **Nhãn HOA nhỏ giãn chữ** (luật 9, chỉ chặn sinh mới) — 54 file, để nguyên.

## Bằng chứng kiểm chứng

```
Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ (11147/11147, 551 file)
```

Lần chạy `npm test` đầu tiên có 1 ca đỏ (`scripts/seed-all.test.ts` — tác vụ giọng Gemini cho
truyện cổ tích), không liên quan tới thay đổi của D1 (D1 chỉ gỡ class Tailwind ở
`CompanionVoice/`, `Writing.tsx`). Xác minh: chạy riêng file đó → xanh (13/13); chạy lại TOÀN
BỘ suite lần thứ hai → xanh tuyệt đối 551/551 file, 11147/11147 test. Kết luận: flaky, không
phải lỗi thật, đã xác nhận không phải do D1.

# 0231 — 2026-09-02 — Sửa tài liệu UI/UX cho khớp code thực tế

**PR:** (điền số PR sau khi tạo)

## Bối cảnh

Rà soát UI/UX theo skill `.agents/skills/ui-ux-craftsman/` phát hiện hai chỗ tài liệu (CLAUDE.md

- chính skill đó) đã đi SAU code thực tế, không phải trước:

1. **Số theme:** CLAUDE.md mục 4.8/8/13 và skill `ui-ux-craftsman` mục 88 đều ghi "4 theme"
   (🌙 Xanh đêm · ☀️ Blue sky · 🌸 Pink · 🎉 Rực rỡ). Nhưng `packages/core-ui/theme.ts` và
   `e2e/a11y.spec.ts`/`e2e/a11y-aaa.spec.ts` (quét "15 trang × 5 theme") đã có theme thứ 5
   **"Nhi đồng" (`kid`)** từ trước, tách riêng khỏi mảng `THEMES` dùng cho `ThemeToggle` cycle
   (chọn bằng đường riêng, không qua nút gạt tuần tự).
2. **Avatar CyberTutor:** skill mô tả "CyberTutor 3D WebGL Avatar kết hợp PBR lighting ... và
   Interactive Gaze Tracking". Đọc code
   `apps/dhcb/src/components/Companion3D/CyberTutorAvatar3D.tsx` thấy component dùng
   `canvas.getContext('2d')` — **Canvas 2D thật, không phải WebGL**; không có `three`/
   `@react-three` trong dependencies. Tên gọi "3D WebGL" trong skill vượt trước năng lực thật
   của component.

## Việc đã làm

Sửa tại chỗ (không đổi code, không tạo tính năng mới) để tài liệu khớp thực trạng:

- `CLAUDE.md`: mục 4 điểm 8 (nguyên tắc bất biến), mục 13 (theme + audit UI), mục 2.1 (mô tả
  1 dòng của skill `ui-ux-craftsman`) — đổi "4 theme" → "5 theme" (thêm Nhi đồng), đổi
  "WebGL 15-visemes" → "Canvas 2D 15-visemes (WebGL chưa làm)".
- `.agents/skills/ui-ux-craftsman/SKILL.md`: mục "Sắc thái & Tâm trạng thị giác" đổi "4 theme"
  → "5 theme" kèm Nhi đồng; mục Studio 1 đổi mô tả "CyberTutor 3D WebGL Avatar ... PBR lighting
  ... Gaze Tracking" thành mô tả đúng: Canvas 2D, dải viseme 15 trạng thái, nâng WebGL là việc
  CHƯA làm cần quyết định riêng.

## Quyết định kèm theo

- KHÔNG nâng cấp avatar lên WebGL trong đợt này — chỉ sửa tài liệu cho đúng sự thật. Việc nâng
  WebGL (three.js/PBR/gaze tracking) để lại làm sau nếu người dùng muốn đầu tư.
- Giữ nguyên hành vi/logic code — đây là đợt sửa tài liệu thuần, không có thay đổi runtime nào.

## Bằng chứng kiểm chứng

- Đọc trực tiếp `packages/core-ui/theme.ts` (`export type Theme = 'dark-blue' | 'blue-sky' |
'pink' | 'vibrant' | 'kid'`) và `e2e/a11y.spec.ts` (comment + code lặp qua `THEMES` gồm 5 giá
  trị) xác nhận 5 theme là thật, không phải suy đoán.
- Đọc trực tiếp `CyberTutorAvatar3D.tsx` dòng 54 (`canvas.getContext('2d')`) và
  `package.json` (không có gói `three`) xác nhận Canvas 2D, không WebGL.
- Đợt việc thuần chỉnh sửa tài liệu Markdown — không chạm code nguồn, không cần chạy lại
  build/typecheck/lint/test.

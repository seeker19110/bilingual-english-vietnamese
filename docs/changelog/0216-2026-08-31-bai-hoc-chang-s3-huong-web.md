# 0216 — Bài học 8 bước thật cho chặng web-s3 (2 PR)

- **Ngày:** 2026-08-31
- **PR:** # (fix CI cho PR #780) + # (nội dung web-s3)
- **Đặc tả:** `docs/specs/2026-08-31-bai-hoc-chang-s3-huong-web.md`

## Việc đã làm

Soạn 6 bài học 8 bước thật cho chặng `web-s3` "Nâng cao — hiệu năng, kiến trúc, chất lượng" của
hướng chuyên sâu Web (`specializations/web.ts`, 5 module), ở 3 unit mới, làn `typescript`:

- `p6-u114` (module m1 "Hiệu năng web đo bằng số"): phân loại LCP/INP/CLS theo ba ngưỡng chuẩn
  Google — chính là ngưỡng CLAUDE.md của dự án này đặt (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1); ngân
  sách bundle chặn CI dùng số liệu thật của dự án (Initial JS ≤140KB).
- `p6-u115` (gộp module m2 "Render phía server" + m4 "Kiến trúc frontend lớn"): chọn chiến lược
  render (SSG/SSR/CSR) theo tần suất đổi nội dung + SEO + cá nhân hoá; kiểm vi phạm luật phụ
  thuộc module (feature-based, chặn import chéo feature).
- `p6-u116` (gộp module m3 "Kiểm thử tự động" + m5 "Bảo mật web thực chiến"): kiểm tỉ lệ kim tự
  tháp test khoẻ mạnh; phân loại lỗ hổng XSS/CSRF/SSRF theo triệu chứng + giới hạn tốc độ gọi.

Đăng ký cầu nối `specializations/stageUnits.ts`: `'web-s3': ['p6-u114', 'p6-u115', 'p6-u116']`.

## Sự cố CI giữa chừng và cách xử lý

PR #780 (`web-s2`, đợt trước) đỏ CI sau khi mở PR: `ProgrammingSpecializationPage.test.tsx`
(test app-level, KHÔNG nằm trong `packages/subject-programming`) hardcode danh sách
`['web-s1', 'web-s4']` làm "chặng web đã có bài", nên khi `web-s2` đăng ký thêm một chặng, trang
hiện 3 lối "Vào học" thay vì 2 như test kỳ vọng — lỗi thật, không phải flake. Tách riêng một
commit fix (chỉ sửa đúng 1 file test, thêm `web-s2`/`web-s3` vào mảng — mảng đã lọc qua
`unitsOfStage()` nên chặng chưa có bài tự động bị bỏ qua) và push thẳng vào PR #780 để không
lẫn với nội dung `web-s3` đang soạn song song trên cùng nhánh. Bài học kỹ thuật: một test ở tầng
UI có thể hardcode giả định về dữ liệu tầng dưới — `stageUnits.test.ts` xanh không đủ để chứng
minh không có test app-level nào khác đang giả định số chặng cố định; `npm test` (toàn bộ
monorepo) mới bắt được lớp lỗi này.

## Quyết định kèm theo

- 5 module gộp thành 3 unit (như `web-s2`) — m2+m4 (render + kiến trúc, cùng là "quyết định cấu
  trúc lớn"), m3+m5 (kiểm thử + bảo mật, cùng là "gác chất lượng/an toàn trước khi release").
- `p6-u114` tự soạn trực tiếp; `p6-u115`/`p6-u116` giao 2 subagent song song.
- Sửa `specializations/stageUnits.test.ts`: ca kiểm "chặng chưa soạn bài" đổi ví dụ từ `web-s3`
  (nay đã có bài) sang `architecture-s2` (vẫn chưa có bài).

## Bằng chứng kiểm chứng

- `npx tsc -b packages/subject-programming` sạch.
- `npx vitest run packages/subject-programming`: 49/49 file, 2980/2980 test xanh (bao gồm
  `lessonsTs.test.ts`, `lessons.test.ts`, `srsCards.test.ts`, `specializations/stageUnits.test.ts`).
- `npm test` (toàn bộ monorepo, 526 file): xanh 100%, bao gồm
  `ProgrammingSpecializationPage.test.tsx` sau khi sửa.
- `npm run typecheck` sạch (cả 4 tsconfig).
- `npm run lint` (`--max-warnings 0`) sạch.
- `npm run build` thành công (app + server + hub).
- `npm run budget`: Initial JS 127,35/140 kB (còn 12,65 kB), CSS 16,79/18 kB (còn 1,21 kB) — vẫn
  trong hạn mức.

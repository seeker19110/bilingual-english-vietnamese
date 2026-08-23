# ADR-0004 — Cải tổ cấu trúc platform DHCB (loạt S1→S6, 2026-08-23)

## Trạng thái

ĐÃ CHỐT và THI HÀNH (PR #625, #626, #627 + PR S5/S6). Người dùng duyệt từng cổng trong phiên
2026-08-23. Nguồn thi hành: `PROGRESS.md` + `docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md`.

## Bối cảnh

Quét toàn dự án 2026-08-23 (4 lượt khảo sát song song) cho thấy: workspace "giả" (17 gói không
package.json, import tương đối sâu 5 cấp), gốc repo đóng vai app english ngầm, `api/` phẳng
~90 handler, tên app nói ngược tầm nhìn platform, 33 API in-memory vi phạm 12-factor, 5 đường
AI trả tiền không đếm lượt. Người dùng chốt: DHCB là NỀN TẢNG đồng hành cá nhân, english chỉ
là một môn; mọi cấu trúc theo tiêu chuẩn cao nhất của ngành.

## Quyết định

1. **Workspace npm thật + TypeScript project references (phương án B — người dùng chọn thay
   esbuild):** mỗi gói `packages/*` có package.json (`@dhcb/*`) + tsconfig composite emit
   `dist/` riêng; import xuyên gói bằng tên gói KHÔNG đuôi, nội bộ gói tương đối có `.js`.
   Production phân giải qua `exports → dist`; dev (tsx/Vite/Vitest) về source qua tsconfig
   paths + alias.
2. **3 app đúng vai:** `apps/dhcb` (frontend nền tảng, gói `@dhcb/app` — đổi tên từ
   `apps/english`), `apps/hub` (landing), `apps/server` (`@dhcb/server`: `server.ts` +
   `routes.ts` + `api/` chia 8 trụ: core/billing/admin/personal/domains/learning/platform/
   subjects/english — URL không đổi).
3. **Khuôn môn học:** gói `subject-<môn>` + `api/subjects/<môn>` + `pages/subjects/<môn>` +
   schema Postgres riêng; english là môn đầu (`@dhcb/subject-english`).
4. **Hai bất biến hạ tầng:** output build GIỮ `dist/` (frontend) + `dist-server/server.js`
   (backend) — nginx/PM2/deploy.sh không đổi trong toàn bộ loạt cải tổ.
5. **Boundary enforce bằng ESLint:** `packages ↛ apps`, `packages ↛ api`; type dùng chung 2
   tầng ở `core-contracts`.
6. **Hoãn regroup components/lib theo trụ (S5 thu hẹp):** phân tích đồ thị import cho thấy
   nhóm mồ côi/chưa phân loại trùng đúng các cụm gamification thuộc diện GỘP/XOÁ ở N3 — dời
   trước rồi xoá là làm hai lần. Regroup thực hiện SAU khi N3 hợp nhất xong.

## Hệ quả

- Thêm môn mới không đòi sửa nền tảng (cắm theo khuôn mục 3).
- Build backend cần `npm run build:packages` trước `tsc -p tsconfig.server.json` (đã gói trong
  `build:server`); CI có boot check + npm audit + codemap cycles.
- Chi phí: import dài hơn ở vài chỗ; tsc -b thêm ~vài giây build.

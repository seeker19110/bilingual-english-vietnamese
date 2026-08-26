# refactor: PR-S3 — server thành app thật `apps/server/` + tách bảng route (2026-08-23)

**Bối cảnh:** bước S3 của lộ trình cải tổ (đặc tả platform mục 6), làm ngay sau khi PR #625
(S1+S2+S2b+N1) được merge. Nhánh làm mới từ main.

**Đã làm:**

1. `git mv server.ts → apps/server/src/server.ts`, `git mv api/ → apps/server/src/api/`;
   thêm `apps/server/package.json` (`@dhcb/server`, workspace thật).
2. **Tách `routes.ts`**: toàn bộ import handler + `wrapEdge` + `CSP_HEADER` + 3 parser body
   lớn + ~100 dòng `app.all('/api/...')` chuyển sang `apps/server/src/routes.ts`
   (`registerApiRoutes(app)`), giữ ĐÚNG thứ tự middleware cũ. `server.ts` còn 261 dòng:
   app/middleware/static/scheduler/WS/shutdown. Test gác `routes-registered.test.ts` đọc
   `routes.ts`.
3. Cập nhật mọi điểm trỏ đường cũ: `tsconfig.server.json` (include + `rootDir
apps/server/src` → **output VẪN `dist-server/server.js`**, PM2/deploy không đổi),
   `tsconfig.api.json`, vitest include/coverage, `npm start`, `API_ROUTES` dev middleware
   của Vite, codemap SCAN_ROOTS/ENTRY_POINTS, 2 script English trỏ `_lib`, 3 panel admin
   import type (đường tạm — S4 chuyển type về core-contracts).
4. **Xoá `voiceTierParity.test.ts`** (test mồ côi không có file nguồn, import ngược
   `apps/dhcb` vi phạm boundary — mục N2 danh sách rác, nay xử lý luôn vì chặn typecheck).

**Cổng đã chạy:** typecheck 4 project + server ✅ · lint ✅ · build đầy đủ ✅ · size ✅ (JS
120.71/123 · CSS 15.75/16) · boot check `node dist-server/server.js` (health 200 + `/api/*`
lạ 404 JSON) ✅ · dev middleware `/@fs` OK ✅ · codemap cycles = 0 ✅ · test+coverage ✅ (số
ghi ở commit/PR).

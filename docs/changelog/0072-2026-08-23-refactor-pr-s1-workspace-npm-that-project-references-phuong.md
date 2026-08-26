# refactor: PR-S1 — workspace npm THẬT + project references (phương án B, người dùng chốt 2026-08-23)

**Bối cảnh:** thực thi bước S1 của `docs/research/dac-ta-cai-to-cau-truc-2026-08-23.md`. Người
dùng chốt **phương án B** (TypeScript project references) thay vì esbuild. Nhánh:
`claude/project-upgrade-proposal-c3wb5h`.

**Đã làm:**

1. **18 gói `packages/*` thành npm workspace thật** — mỗi gói có `package.json`
   (`@dhcb/core-*`, `exports "./*"` trỏ `dist/`) + `tsconfig.json` composite
   (extends `tsconfig.package.base.json` mới, emit `dist/` riêng từng gói,
   `references` theo đồ thị phụ thuộc thật). `tsconfig.packages.json` gom 17 gói build được
   (`core-ui` là React/tsx, chỉ frontend dùng qua bundler — không build). Lệnh mới:
   `npm run build:packages` (`tsc -b`), chạy tự động trong `build:server`.
2. **Codemod 3 đợt, ~1.590 điểm import**: (a) mọi import tương đối xuyên gói →
   `@dhcb/<gói>/<file>` không đuôi (1.209 điểm/447 file); (b) 31 điểm quanh các file dời đợt 2;
   (c) 346 chuỗi `vi.mock`/`vi.importActual` trong 132 file test map theo đường mới (lượt test
   đầu 145 fail đều do mock lệch đường — đã chữa đúng gốc, không sửa test lẻ).
3. **Dời 21 file `api/_lib` bị packages import ngược** (điều kiện per-package build):
   gói MỚI `core-http` (http, validation, fetchTimeout, mailer, mailQuota) ·
   `core-auth` (passwordReset, trial, reservedNames) · `core-billing` (planFeatures, planGrant,
   planMarketing, pricePromo, prices, sepay) · `core-ai` (geminiApi, googleTts, ttsCrypto,
   visemeTimeline, voiceAccess, espeakPhonemes) · `core-chat` (friends). Kèm test đi cùng.
4. **Cắt 3 chu trình phụ thuộc CẤP GÓI** (điều kiện sống của `tsc -b`): 7 handler HTTP của
   `core-billing` (checkout, payment-webhook, payment-status/history, plan-prices/features/
   marketing) trả về `api/` (handler thuộc tầng server — khớp định hướng S4);
   `learningGoalAdapter` dời `core-learner` → `core-personal`. Xác minh lại: 0 chu trình.
5. **Resolver nhất quán 2 chế độ**: production `node dist-server/server.js` phân giải `@dhcb`
   qua `exports` → `dist/` từng gói; dev/test (tsx, Vite, Vitest) phân giải về SOURCE qua
   tsconfig `paths` + alias regex — đã kiểm chứng thật cả hai (boot server biên dịch + boot tsx
   sau khi giấu `dist/` của core-db). ESLint thêm luật `packages/ ↛ api/`.
6. **CI thêm boot check**: `node dist-server/server.js` phải trả `/api/health` 200.
7. Codemap hiểu alias `@dhcb/*` + `scripts/*.ts` vào ENTRY_POINTS (hết false-positive orphan)
   — giao subagent, 67/67 test lib codemap xanh.

**Cổng đã chạy:** typecheck ✅ (4 tsconfig + `tsc -b` 17 gói + `tsc -p tsconfig.server.json`) ·
lint ✅ (0 cảnh báo, thêm rule mới) · format ✅ · test ✅ (5070/5070 sau 2 vòng sửa
mock/route-test) + coverage trên sàn 90 · vite build ✅ · size ✅ (JS 120.71/123 kB,
CSS 15.75/16 kB) · hub build ✅ · boot check thật ✅ · codemap cycles = 0 ✅.

**Lưu ý vận hành:** deploy/nginx/PM2 KHÔNG đổi đường dẫn nào (`dist/` +
`dist-server/server.js` giữ nguyên). `package-lock.json` đổi do npm link 18 workspace.
Còn lại của lộ trình: S2→S6 (xem đặc tả).

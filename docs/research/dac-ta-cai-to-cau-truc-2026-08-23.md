# Đặc tả cải tổ cấu trúc dự án — sắp xếp lại cây thư mục theo chuẩn (2026-08-23)

> Nghiên cứu tiếp nối `de-xuat-nang-cap-cai-to-2026-08-23.md` (mục N4), đi sâu riêng phần
> **cấu trúc thư mục + workspace**. Đây là đặc tả để duyệt — CHƯA thực thi. Mỗi bước bên dưới
> là 1 PR riêng, có cổng kiểm chứng và đường lùi.

## 1. Hiện trạng và vì sao phải cải tổ

### 1.1. Cây thư mục hiện tại (rút gọn)

```
donghanh/
├─ index.html, vite.config.ts, tailwind.config.js, postcss.config.js   ← của app english, nằm ở GỐC
├─ server.ts                        ← Express, 562 dòng, gắn tay 100 route
├─ api/                             ← 87 handler PHẲNG + _lib/ (71 file, trộn 2 tầng)
├─ apps/
│  ├─ english/src/                  ← 482 file; KHÔNG có package.json/vite.config riêng
│  └─ hub/                          ← chuẩn (có package.json, vite.config, tsconfig riêng)
├─ packages/core-* (17 gói)         ← KHÔNG gói nào có package.json
├─ public/                          ← asset của app english, nằm ở gốc
├─ scripts/ (70 file, ~30% one-off) · e2e/ · postgres/ · docs/ · nginx/
└─ tsconfig.json (= tsconfig của app english) + 4 tsconfig khác
```

### 1.2. Vấn đề gốc rễ (đo thật)

1. **Workspace "giả"**: `package.json` khai `workspaces: ["packages/*", "apps/*"]` nhưng 17
   gói `packages/*` và `apps/english` đều không có `package.json` → không phải npm workspace
   thật. Hệ quả trực tiếp: import bằng đường dẫn tương đối sâu tới 5 cấp
   (`'../../../../../packages/core-contracts/proposedAction'`), không enforce được phụ thuộc
   giữa gói bằng công cụ.
2. **Gốc repo là "app english ngầm"**: `tsconfig.json` gốc `include: ["apps/english/src",
"packages/core-ui"]`; `index.html`/`vite.config.ts`/`public/` của english nằm ở gốc. Bất
   đối xứng hoàn toàn với `apps/hub` (đã chuẩn).
3. **Hai chế độ phân giải module tồn tại song song, alias bị cấm nửa hệ thống**: Vite có alias
   `@core`/`@english`, nhưng `api/` + `server.ts` biên dịch bằng `tsc -p tsconfig.server.json`
   (NodeNext, emit `dist-server/`, import ghi sẵn đuôi `.js`) — tsc KHÔNG rewrite alias nên
   backend phải dùng đường dẫn tương đối. Cùng một module `core-db/pgPool` được import 2 kiểu
   khác nhau tuỳ tầng.
4. **`api/` phẳng 87 handler**, nhóm chỉ thể hiện bằng tiền tố tên file (`admin-*`);
   `api/_lib/` trộn hạ tầng platform (http, validation, mailer, sepay) với logic riêng môn
   tiếng Anh (cefrTagging, dictionaryData, wordFreq, visemeTimeline…) — chưa có
   `packages/core-english` dù đã có `core-career/work/startup/life`.
5. **`apps/english` là "app tất cả trong một"**: chứa cả Personal OS
   (`pages/domains/{career,work,startup,life}`, `pages/companion/`) — tên thư mục nói dối về
   nội dung; trong khi hub (đúng nghĩa shell) chỉ có 3 file.
6. Rác cấu trúc: 49 shim `pages/*.tsx` mồ côi, 3 barrel không dùng, ~21 script one-off,
   `core-grading` 1.355 dòng không ai import, 4 gói "1 file" (career/work/startup/life).

### 1.3. Ràng buộc PHẢI tôn trọng khi di chuyển (đọc từ config thật)

| Ràng buộc                                                                                                                                                                | Nguồn                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Production chạy `node dist-server/server.js`, PM2 cluster — KHÔNG qua loader tsx (cluster + ESM loader từng crash)                                                       | `ecosystem.config.cjs`, `tsconfig.server.json` |
| Deploy = `git reset --hard origin/main` → `npm ci` → `migrate:pg` → `npm run build` → PM2 reload; mọi đường dẫn trong deploy.sh/ecosystem phải đổi ĐỒNG BỘ trong cùng PR | `scripts/deploy.sh`                            |
| Nginx trỏ `root /var/www/dhcb/dist` — đổi outDir là VIỆC TAY trên VPS (sửa nginx + certbot giữ nguyên)                                                                   | `nginx/en-vi.conf`                             |
| size-limit đo `dist/js/index-*.js` + 4 vendor chunk — đổi đường dẫn dist là phải sửa `.size-limit.json`                                                                  | `.size-limit.json`                             |
| Dev middleware của Vite gọi thẳng handler theo đường dẫn file (`API_ROUTES` trong `vite.config.ts`) — di chuyển handler là phải cập nhật bảng này                        | `vite.config.ts`                               |
| ESLint đang giữ boundary `packages/ ↛ apps/` bằng `no-restricted-imports` — cấu trúc mới phải giữ/thắt chặt rule này                                                     | `.eslintrc.cjs`                                |
| CI: 4 lệnh typecheck + coverage 90/90/90/90 + e2e (port 5179) + size — mọi PR cấu trúc phải xanh toàn bộ                                                                 | `.github/workflows/ci.yml`                     |
| KHÔNG nâng React/TS/Tailwind/ESLint (CLAUDE.md mục 6) — cải tổ cấu trúc không kèm nâng version                                                                           | CLAUDE.md                                      |

## 2. Cấu trúc đích đề xuất

```
donghanh/
├─ apps/
│  ├─ english/                      # Frontend (Vite) — app học tập
│  │  ├─ package.json               # name: "@dhcb/english"
│  │  ├─ index.html · vite.config.ts · tailwind.config.js · postcss.config.js
│  │  ├─ tsconfig.json              # kế thừa tsconfig.base.json
│  │  ├─ public/                    # dời từ public/ gốc
│  │  └─ src/
│  │     ├─ pages/{core,learning,companion,domains,subjects/english}   # đã đúng, giữ
│  │     ├─ components/{core,learning,companion,domains,english}/      # sắp lại KHỚP taxonomy pages
│  │     ├─ lib/{core,learning,companion,english}/                     # như trên
│  │     ├─ data/ · prompts/ · i18n/ · context/
│  │     └─ App.tsx · main.tsx · types.ts
│  ├─ hub/                          # giữ nguyên (đã chuẩn)
│  └─ server/                       # Backend Express — app thứ 3
│     ├─ package.json               # name: "@dhcb/server"
│     ├─ tsconfig.json
│     └─ src/
│        ├─ server.ts               # chỉ còn: khởi tạo app, middleware, listen, graceful shutdown
│        ├─ routes.ts               # bảng route TẬP TRUNG (tách khỏi server.ts, test bảo vệ sẵn có)
│        └─ api/
│           ├─ core/                # auth-adjacent: profile, progress, history, usage-summary, push…
│           ├─ english/             # dictionary, pronunciation, pronounce-assess, tutor-feedback,
│           │                       # challenge, echo-shadowing, acoustic/articulatory-phonetics…
│           ├─ admin/               # 15 file admin-* (bỏ tiền tố: admin/users.ts…)
│           ├─ personal/            # persons, memories, personal-facts, consents, life-*, proactive-*…
│           ├─ domains/             # career.ts, work.ts, startup.ts, life.ts
│           ├─ platform/            # health, healthDeep, app-settings, subjects, feedback, analytics…
│           └─ _lib/                # CHỈ còn hạ tầng HTTP thuần của server (http, validation…)
├─ packages/                        # mỗi gói có package.json  name: "@dhcb/<tên>"
│  ├─ core-contracts/               # type dùng chung 2 tầng (duy nhất frontend được import ngoài core-ui)
│  ├─ core-db/ · core-errors/ · core-config/
│  ├─ core-auth/ · core-billing/ · core-ai/ · core-chat/
│  ├─ core-english/                 # MỚI — logic môn tiếng Anh tách từ api/_lib:
│  │                                # cefrTagging, cefrjLookup, dictionaryData, wordFreq,
│  │                                # wordsCefrDataset, espeakPhonemes, visemeTimeline…
│  ├─ core-domains/                 # MỚI — gộp 4 gói 1-file: {career,work,startup,life}Service
│  ├─ core-learner/ · core-personal/ · core-integrations/
│  └─ core-ui/                      # UI dùng chung (theme, Toast, authHeader) — alias @core giữ nguyên
├─ e2e/ · playwright.config.ts      # giữ ở gốc (test xuyên app)
├─ postgres/ · nginx/ · docs/
├─ scripts/                         # chỉ còn script ĐANG vận hành (seed/backup/deploy/codemap/eval)
│  └─ archive/                      # ~21 script one-off (gen-*, ocr-*, patch-*…)
├─ package.json                     # root: workspaces + script điều phối (build/test/lint gọi xuống)
├─ tsconfig.base.json               # compilerOptions chung, các tsconfig con extends
└─ vitest.config.ts · .eslintrc.cjs · commitlint · prettier   # công cụ toàn repo ở gốc
```

**Gói bị xoá/gộp:** `core-grading` (xoá — 0 nơi dùng, khôi phục từ git khi làm STEM thật),
`core-career`+`core-work`+`core-startup`+`core-life` → `core-domains`, `core-config/env.ts`
(xoá — chỉ test của chính nó import).

### 2.1. Luật phụ thuộc (enforce bằng ESLint `no-restricted-imports` + codemap trong CI)

```
apps/english, apps/hub  →  chỉ được import: @dhcb/core-ui, @dhcb/core-contracts
apps/server             →  mọi packages/*, KHÔNG được import apps/*
packages/*              →  packages/* khác (không vòng), KHÔNG được import apps/* (rule sẵn có)
scripts/                →  packages/* + apps/server (không import apps/english trừ data tĩnh)
```

Ba vi phạm hiện hữu phải sửa kèm: 3 panel admin import type thẳng từ `api/admin-*.ts` (chuyển
type sang `core-contracts`); `CyberTutorAvatar3D.tsx` import `core-ai/visemeMorphingService`
(chuyển phần thuần trình duyệt sang `core-ui` hoặc `core-contracts`);
`api/_lib/voiceTierParity.test.ts` import ngược `apps/english` (xoá/viết lại).

## 3. Quyết định kỹ thuật then chốt: cách backend hết khổ vì đường dẫn

Vấn đề: muốn `apps/server` import `@dhcb/core-db` (tên gói) thay vì `../../packages/...js`,
nhưng production chạy `node dist-server/server.js` — Node phải phân giải được tên gói lúc
runtime, mà các gói là TS source. Hai phương án:

**Phương án A — Bundle server bằng esbuild (KHUYẾN NGHỊ).**
Build server = `esbuild apps/server/src/server.ts --bundle --platform=node --format=esm
--packages=external --outfile=dist-server/server.js`. esbuild tự phân giải workspace + alias +
TS, bundle toàn bộ code repo thành 1 file; `node_modules` thật (pg, ws, sharp, ioredis…) để
external như hiện nay. `tsc -p tsconfig.server.json` giữ lại CHỈ để typecheck (`noEmit`).

- Ưu: hết hẳn ràng buộc "cấm alias ở backend"; build server nhanh hơn tsc emit; PM2/deploy
  giữ nguyên đường dẫn `dist-server/server.js` (KHÔNG cần việc tay trên VPS); cluster mode
  không đổi gì (vẫn là JS thật).
- Rủi ro & cách đỡ: khác biệt hành vi bundle vs multi-file (import.meta.url, `__dirname`) —
  quét trước bằng grep `import.meta.url|__dirname` trong api/packages; dynamic import có biến
  — kiểm bằng smoke test `node dist-server/server.js` trong CI (thêm bước "boot check" chạy
  server 5s với env giả, đã có `/api/health`).

**Phương án B — TypeScript project references (`tsc -b`), mỗi gói tự emit `dist/`.**
Chuẩn "sách giáo khoa" hơn nhưng: 18 gói × (tsconfig composite + exports trỏ dist), build
chậm hơn, deploy phức tạp hơn (nhiều dist), và không giải quyết được chuyện Vite/dev tsx đọc
source trực tiếp. Chi phí cao hơn hẳn A với lợi ích thấp hơn ở quy mô 1 người làm.

→ Đề xuất chốt **A**. (Nếu sau này cần publish gói riêng thì mới nâng cấp lên B.)

Với frontend không có vấn đề này: Vite phân giải workspace tự nhiên qua `node_modules`
symlink, hoặc giữ alias như cũ.

## 4. Lộ trình thực thi — 6 PR, mỗi PR tự đứng được

Nguyên tắc chung mọi PR: dùng `git mv` (giữ lịch sử file); chạy
`npm run codemap -- impact <file>` cho file bị di chuyển nhiều nơi dùng; đủ cổng commit
CLAUDE.md mục 8; KHÔNG trộn refactor cấu trúc với thay đổi hành vi (diff chỉ gồm move +
sửa import + sửa config).

### PR-S1 — Workspace thật + esbuild server (nền của mọi bước sau)

1. Thêm `package.json` cho 17 gói (`name: "@dhcb/core-*"`, `"type": "module"`,
   `exports` trỏ source `.ts` — hợp lệ vì mọi consumer đều đi qua bundler/tsx/vitest).
2. Thêm build server bằng esbuild (phương án A), giữ `tsc` typecheck; xoá emit của
   `tsconfig.server.json` (chuyển `noEmit: true`).
3. Codemod đổi import tương đối sâu → `@dhcb/*` (script tự viết chạy 1 lần, ~500 điểm import;
   thuần cơ học, giao subagent mechanical được).
4. Cập nhật: `vitest.config.ts` (resolve workspace), ESLint boundary rule sang tên gói,
   `API_ROUTES` trong vite.config nếu đường dẫn module đổi.
5. Cổng riêng: CI thêm bước **boot check** `node dist-server/server.js` (env giả, chờ
   `/api/health` 200) — bảo hiểm cho mọi PR cấu trúc sau.
   _Không đụng: vị trí file nào ngoài package.json mới; nginx; PM2._

### PR-S2 — Trả gốc repo về đúng vai: app english về `apps/english/`

1. `git mv` `index.html`, `public/`, `tailwind.config.js`, `postcss.config.js`,
   `vite.config.ts` → `apps/english/`; thêm `apps/english/package.json` + `tsconfig.json`
   (extends `tsconfig.base.json` mới tách từ tsconfig gốc).
2. Root `npm run dev/build` → `npm run dev --workspace=@dhcb/english` (giữ tên lệnh cũ ở root
   để thói quen + CI + docs không gãy).
3. **Giữ nguyên outDir về `dist/` ở GỐC** (`build.outDir: '../../dist'`) — để nginx,
   deploy.sh, `.size-limit.json`, backup script KHÔNG phải đổi và KHÔNG có việc tay trên VPS
   ở bước này. (Việc dời dist là bước tuỳ chọn cuối, mục 6.)
4. Sửa đường dẫn trong `scripts/gen-data-manifest.mjs`/`gen-stories-json.mjs` nếu trỏ
   `public/`.

### PR-S3 — Server thành app: `server.ts` + `api/` → `apps/server/`

1. `git mv server.ts apps/server/src/server.ts`; `git mv api apps/server/src/api`.
2. Tách bảng gắn route ra `apps/server/src/routes.ts` (chỉ move code từ server.ts, không đổi
   logic); sửa luôn 2 lỗi cấu trúc sẵn có trong lúc tách: trùng đăng ký `/api/vision-solve`,
   `/api/*` không khớp trả JSON 404 thay vì HTML.
3. Cập nhật esbuild entry, `tsconfig.api.json` include, `API_ROUTES` vite.config,
   `api/routes-registered.test.ts` đường dẫn.
   _Output vẫn là `dist-server/server.js` → PM2/deploy/nginx không đổi._

### PR-S4 — Chia `api/` theo domain + tách `core-english`, `core-domains`

1. Trong `apps/server/src/api/`: chia 87 handler vào `{core,english,admin,personal,domains,platform}/`
   (bảng phân loại đầy đủ ở báo cáo khảo sát backend — mục 1). Bỏ tiền tố `admin-` khi đã nằm
   trong `admin/`. Đường dẫn URL `/api/...` GIỮ NGUYÊN 100% (chỉ file di chuyển).
2. `api/_lib/` tách 3 hướng: logic English → `packages/core-english/`; hạ tầng dùng chung
   nhiều tầng (sepay, prices, planFeatures đã có chỗ ở core-billing) → gói tương ứng; phần
   thuần HTTP server ở lại `_lib/`.
3. Gộp `core-career/work/startup/life` → `packages/core-domains/` (4 file service + test, đổi
   4 import).
4. Xoá `core-grading/` + `core-config/env.ts` + 2 test mồ côi (nếu chưa xoá ở đợt N2).

### PR-S5 — Sắp lại `apps/english/src` theo taxonomy + dọn di sản

1. Xoá 49 shim `pages/*.tsx` + 3 barrel mồ côi (nếu chưa làm ở N2).
2. `components/` (130 file, 24 thư mục con phẳng) sắp về `{core,learning,companion,domains,english}/`
   khớp taxonomy `pages/` — cơ học, giao subagent mechanical với bảng ánh xạ duyệt trước.
3. `lib/` (114 module) tương tự; cắt 3 vòng import cụm SRS trong lúc di chuyển (tách type
   thuần khỏi `srsTypes.ts`).

### PR-S6 — `scripts/` + tài liệu + gác cổng lâu dài

1. `git mv` ~21 script one-off → `scripts/archive/` (giữ chạy được, khỏi lẫn vào vận hành);
   thêm `scripts/*.ts` vào `ENTRY_POINTS` của codemap.
2. CI thêm 2 gate: `codemap -- cycles` = 0 và kiểm tra orphans không tăng (baseline hoá).
3. Cập nhật CLAUDE.md mục 6 "Cấu trúc" + PROJECT.md + docs liên quan về cây mới; vẽ sơ đồ
   phụ thuộc vào `docs/adr/` (ADR mới cho cải tổ này).

## 5. Rủi ro chính & cách đỡ

| Rủi ro                                     | Đỡ bằng                                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploy VPS gãy vì đường dẫn đổi            | PR-S1→S5 giữ bất biến 2 đường dẫn production: `dist/` (frontend) + `dist-server/server.js` (backend) → deploy.sh/nginx/PM2 không đổi dòng nào |
| esbuild bundle khác hành vi tsc multi-file | Boot check trong CI (PR-S1) + smoke test luồng chính trên VPS sau deploy đầu tiên; grep trước `__dirname`/`import.meta.url`                   |
| Codemod import sót/sai                     | tsc 4 project + eslint + vitest toàn bộ đều phải xanh; codemap so tổng số cạnh import trước/sau (chỉ được đổi hình thức, không đổi số lượng)  |
| Conflict với loạt PR D→G đang chạy         | Làm cải tổ cấu trúc SAU khi loạt bug-fix D→G xong, hoặc chen giữa 2 PR — không chạy song song 2 nhánh cùng đụng `apps/english/src`            |
| PR move file làm diff khổng lồ khó review  | Mỗi PR chỉ move + sửa import; mô tả PR kèm bảng ánh xạ cũ→mới; `git log --follow` vẫn tra được lịch sử                                        |
| Vitest/coverage lệch sau move              | Coverage tính theo glob toàn repo, không theo path cố định — chạy `test:coverage` ở từng PR, sàn 90 giữ nguyên                                |

## 6. Bước tuỳ chọn về sau (KHÔNG nằm trong 6 PR)

- Dời `dist/` về `apps/english/dist` + sửa nginx root (việc tay VPS) — chỉ làm khi thật sự
  cần build 2 app frontend song song.
- Kích hoạt `apps/hub` thật (cấu hình Nginx theo Host) hoặc bỏ khỏi build — theo quyết định
  Q1 của bản đề xuất tổng.
- Nâng phương án A → B (project references) nếu có nhu cầu publish gói.

## 7. Ước lượng & thứ tự khuyến nghị

| PR  | Khối lượng                                           | Độ rủi ro | Ghi chú                                 |
| --- | ---------------------------------------------------- | --------- | --------------------------------------- |
| S1  | ~2 ngày (17 package.json + esbuild + codemod import) | TB-cao    | Nền của tất cả; có boot check bảo hiểm  |
| S2  | ~0,5 ngày                                            | Thấp      | Move config, outDir giữ nguyên          |
| S3  | ~1 ngày                                              | TB        | Move server + tách routes.ts            |
| S4  | ~1,5 ngày                                            | TB        | Chia api/ + core-english + core-domains |
| S5  | ~1 ngày (phần lớn cơ học)                            | Thấp      | Giao mechanical với bảng ánh xạ         |
| S6  | ~0,5 ngày                                            | Thấp      | Archive + gate + docs                   |

Tổng ~6,5 ngày công, chia 6 PR độc lập, dừng được sau bất kỳ PR nào mà repo vẫn nhất quán.

**Cổng cần người dùng duyệt trước khi bắt đầu:** (1) chốt phương án A (esbuild) cho backend;
(2) chốt cây thư mục đích mục 2 (đặc biệt: `apps/server`, `core-english`, `core-domains`);
(3) chốt thời điểm — sau PR D→G hay chen vào giữa.

# refactor: PR-S2 — app english về đúng chỗ `apps/english/` (nay là `apps/dhcb/`, 2026-08-23)

**Bối cảnh:** bước S2 của `docs/research/dac-ta-cai-to-cau-truc-2026-08-23.md`, tiếp nối S1,
cùng nhánh `claude/project-upgrade-proposal-c3wb5h`.

**Đã làm:**

1. `git mv` `index.html` + `public/` + `vite.config.ts` + `tailwind.config.js` +
   `postcss.config.js` từ GỐC repo → `apps/english/`; thêm `apps/english/package.json`
   (`@dhcb/english`, thành workspace thật) + `apps/english/tsconfig.json`.
2. Tách `tsconfig.base.json` (compilerOptions + paths chung, baseUrl gốc repo) — tsconfig gốc
   giờ chỉ là solution file (extends base, `files: []`, references) nên tsx/editor vẫn đọc
   được paths `@dhcb/@core/@english`.
3. `vite.config.ts` tự khai `root` = thư mục app (không phụ thuộc cwd), env đọc từ gốc repo,
   **`outDir` giữ nguyên `dist/` gốc** (bất biến hạ tầng — nginx/deploy/PM2/size-limit không
   đổi); dev middleware nạp handler `api/`/`packages/` NGOÀI root qua `/@fs` + `server.fs.allow`.
4. Npm script gốc giữ nguyên TÊN (`dev`/`build`/`preview`/`typecheck`), chỉ đổi ruột sang
   `--config apps/english/vite.config.ts` / `tsc -p apps/english/tsconfig.json` — Playwright
   (`npm run dev -- --port 5179`), CI, thói quen cũ không gãy.
5. Cập nhật 5 điểm trỏ `public/` cũ: `gen-data-manifest.mjs`, `gen-stories-json.mjs`,
   `vitest.setup.ts`, `build-lessons-public.mjs`, `deploy.sh` (git clean path).
6. **2 hồi quy bị bắt và sửa ngay trong lúc làm** (đúng vai trò của gate size-limit):
   Tailwind plugin tìm config theo cwd → chỉ định đường tuyệt đối trong `postcss.config.js`;
   Tailwind v3 resolve `content` glob theo cwd (không theo vị trí config) → đổi glob sang
   đường tuyệt đối trong `tailwind.config.js`. CSS từ 2.44 kB (mất sạch utilities) về đúng
   15.75 kB brotli như trước khi dời.

**Cổng đã chạy:** typecheck ✅ (4 project) · lint ✅ · build đầy đủ ✅ (gen scripts + vite +
server + hub; `dist/` gốc đúng app english, đủ data manifest) · size ✅ (JS 120.66/123 kB, CSS
15.75/16 kB — khớp trước khi dời) · smoke dev server thật ✅ (index + `/src/main.tsx` +
`/api/app-settings` qua dev middleware `/@fs`) · test+coverage ✅ (xem số ở mô tả PR/commit).

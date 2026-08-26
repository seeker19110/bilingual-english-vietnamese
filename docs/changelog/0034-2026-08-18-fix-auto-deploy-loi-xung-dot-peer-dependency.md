# Fix auto-deploy lỗi — xung đột peer dependency (2026-08-18)

Workflow `deploy.yml` (chạy trên VPS qua SSH mỗi lần push `main`) đỏ liên tục từ run #519
(commit `0f41632`, PR #574): `npm ci` trên VPS lỗi `ERESOLVE` — không phải lỗi hạ tầng/VPS.
Nguyên nhân: 2 PR dependabot gần nhau bump lên bản đòi ESLint/parser mới hơn những gì dự án
đang ghim:

- PR #576: `@typescript-eslint/eslint-plugin` 7.18.0 → 8.67.0, nhưng `@typescript-eslint/parser`
  vẫn ở 7.18.0 (plugin 8.x đòi peer parser `^8.67.0`) → nâng parser lên `^8.67.0` khớp.
- PR #595: `eslint-plugin-react-refresh` 0.4.7 → 0.5.4, bản 0.5.x đòi peer `eslint ^9||^10`,
  trong khi dự án **cố tình giữ ESLint 8** (CLAUDE.md mục 6: "GIỮ NGUYÊN PHIÊN BẢN — KHÔNG nâng
  ESLint") → ghim lại `^0.4.26` (bản 0.4.x mới nhất còn hỗ trợ `eslint >=8.40`).

Đã xác minh thật: `npm ci` sạch trên máy dev, `npm run typecheck` ✅, `npm run build` ✅
(kể cả `build:server`), `npm test` ✅ 4202/4202. Đây đúng là bước `npm ci` mà `scripts/deploy.sh`
[4/7] chạy trên VPS — sửa xong là auto-deploy chạy lại được.

**[Cập nhật] Đã phát hiện + xử lý thêm 1 lỗi CI khi mở PR #603:** CI đỏ ở bước `Lint` — ban đầu
tưởng chỉ 1 rule `react-hooks/set-state-in-effect` (48/73 lỗi), soát lại kỹ thì **73 lỗi trải
trên 45+ file, thuộc 5 rule MỚI khác nhau** của `eslint-plugin-react-hooks@7` (React Compiler
rules: `set-state-in-effect` 48, `purity` 10, `exhaustive-deps` 10, `immutability` 8,
`static-components` 3) — cũng từ PR #574 (bump plugin 4.6.2 → 7.1.1). Sửa hết 73 lỗi ngay trong
PR fix-deploy này rủi ro cao (đụng logic hook ở hàng chục trang/component cùng lúc, ngoài phạm vi
"fix deploy"). Đã hỏi lại và quyết định: **ghim `eslint-plugin-react-hooks` về lại `^4.6.2`**
(bản trước PR #574) — an toàn nhất, không đụng code UI. Lint lại sạch 0 lỗi, đã chạy lại đủ
typecheck/build/test (4202/4202) — tất cả xanh.

**[Cập nhật] Đã phát hiện + xử lý thêm 1 lỗi CI khác — e2e a11y `color-contrast`:** job `e2e`
đỏ 8/292 test (`a11y.spec.ts` — `/tu-dien` + `/lo-trinh-hoc`, 4/5 theme không phải mặc định). Đối
chiếu lịch sử CI: **KHÔNG do PR #603 gây ra** — commit `db2f73f` (ngay trước chuỗi dependabot bump)
CI xanh toàn bộ; PR #595 (bump `@axe-core/playwright` 4.12.1 → 4.13.0, cùng nhóm 14 gói) đã bắt
được lỗi tương phản màu THẬT mà bản axe cũ bỏ sót. Vì lỗi này nằm trên nhánh PR (thừa hưởng từ
`main`) và chặn merge, đã chẩn đoán + sửa luôn (đúng trách nhiệm "đưa PR do mình tạo về xanh"):
`apps/english/src/components/WordCard.tsx` dòng ví dụ câu tiếng Anh (`extraExamples`) dùng
`text-accent-400/80 italic` — độ tương phản chỉ 1.8–4.44 (cần ≥4.5) ở theme Blue sky/Pink/Rực
rỡ/Nhi đồng. Sửa theo đúng pattern đã có sẵn trong `WordFormsBlock.tsx` (biến thể Tailwind
`theme-light:` — xem `tailwind.config.js`): đổi thành `text-accent-300 theme-light:text-accent-800`
(bỏ opacity `/80`, thêm sắc độ đậm hơn cho theme nền sáng). Đã xác minh: viết script debug tạm lấy
đúng phần tử/tỷ lệ tương phản qua axe-core trực tiếp (không chỉ đọc log CI), chạy lại toàn bộ
`e2e/a11y.spec.ts` + `e2e/a11y-aaa.spec.ts` (397 test, 396 xanh + 1 flake hạ tầng "Execution
context destroyed" xác nhận không liên quan, chạy lại riêng thì xanh), `npm run lint`/`typecheck`/
`build` vẫn xanh.

**Nợ kỹ thuật CÒN MỞ (chưa xử lý, để làm PR riêng có thời gian review kỹ):** nâng
`eslint-plugin-react-hooks` lên bản 7.x (React Compiler rules) + sửa đúng 73 lỗi thật ở 45+ file
— xem chi tiết rule/file/line trong mục "Nợ kỹ thuật còn mở" bên dưới.

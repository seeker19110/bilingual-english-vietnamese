# fix(build): build/format không còn làm bẩn cây git 131 file (2026-08-23)

**Bối cảnh:** nợ số 1 phát hiện khi làm N4 (PR #630). Người dùng chọn xử lý mục này trước.

**Gốc bệnh — HAI đường dẫn cũ sót lại từ PR-S2** (khi `public/` dời vào `apps/dhcb/`). Mẫu
ignore có chứa dấu `/` được NEO TỪ GỐC REPO, nên `public/data/` sau khi dời KHÔNG còn khớp gì:

1. `.prettierignore` có `public/data/` → Prettier bắt đầu "nhận" thư mục dữ liệu sinh tự động.
   Một lần chạy `npm run format` đã in lại 131 file JSON theo kiểu xuống dòng đẹp và bản đó
   được commit. Nhưng generator (`scripts/gen-stories-json.mjs`) ghi bằng `JSON.stringify`
   KHÔNG indent = rút gọn 1 dòng → **hai công cụ đá nhau**: build đổi sang rút gọn, format đổi
   ngược lại thành đẹp, mỗi lần chạy là 131 file "thay đổi" (dễ commit nhầm ~33.000 dòng rác).
2. `.gitignore` có `public/data/manifest.json` → file build artifact này lẽ ra không được
   commit, sau khi dời thì hết được bỏ qua và đã lọt vào git.

**Đã làm:**

1. Sửa cả hai đường dẫn thành `apps/dhcb/public/data/…`, kèm chú thích tại chỗ giải thích luật
   "mẫu có dấu / thì neo từ gốc repo" để lần sau dời thư mục không dẫm lại.
2. `git rm --cached apps/dhcb/public/data/manifest.json` — trả về đúng ý định ban đầu (build
   artifact, không commit). An toàn: `dataPrecache.ts` chỉ chạy ở bản PROD (đã đọc code xác
   nhận), dev không đụng tới file này.
3. Commit lại 130 file truyện ở ĐÚNG dạng generator sinh ra. Chọn hướng này (thay vì bắt
   generator in đẹp) vì các file này được người dùng TẢI VỀ MÁY để dùng offline —
   **rút gọn nhẹ hơn ~200KB** (2,3MB → 2,1MB, ~9%), lợi thật cho người học mạng chậm.

**Bằng chứng (chạy thật, đúng phép thử đã phát hiện lỗi):** sau `npm run build` → `git status`
SẠCH; sau `npm run format` → `git status` SẠCH; `prettier --check .` xanh. Kèm typecheck ✅ ·
lint ✅ · vitest 4948/4948 ✅ · e2e `listening` + `smoke` 6/6 ✅.

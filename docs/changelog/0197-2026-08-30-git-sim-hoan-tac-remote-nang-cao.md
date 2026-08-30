# 0197 — Mở rộng `gitSim`: hoàn tác + kho từ xa giả lập + nâng cao (PR 1/4 khoá Git)

PR 1 trong 4 của kế hoạch tách Git & GitHub thành khoá học riêng
(`docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md`). PR này CHỈ đụng hạ tầng mô phỏng —
chưa có nội dung khoá mới, chưa có bài học mới, chưa đụng `curriculum.ts`.

## Đã làm

- Mở rộng `packages/subject-programming/gitSim.ts` thêm ba tầng lệnh mới, giữ **nguyên hành vi**
  8 lệnh cũ (`init/status/add/commit/log/branch/switch/checkout/merge`):
  - **Hoàn tác:** `git diff` (+ `--staged`), `git restore` (+ `--staged`), `git reset`
    (`--soft/--mixed/--hard`), `git revert`, `git reflog`.
  - **Kho từ xa GIẢ LẬP** (không mạng thật — một object khác trong cùng bộ nhớ):
    `git remote add/-v`, `git push` (`-u`, `--force`/`--force-with-lease`), `git fetch`,
    `git pull`, `git clone`. Lệnh nội bộ `remote-seed` (chỉ dùng trong bối cảnh ẩn của bài học,
    không phải lệnh git thật) dựng cảnh "người khác đã push trước" — đây là thứ khiến bài `pull`
    và bài **giải xung đột thật** (chèn dấu `<<<<<<< HEAD`, dừng lại chờ học viên tự `git add` +
    `git commit`, KHÔNG tự động chọn bên nào) chấm được.
  - **Nâng cao:** `git stash` (push/list/pop/apply/drop), `git tag -a`, `git cherry-pick`,
    `git rebase` (chỉ ca tuyến tính — tìm tổ tiên chung theo cha-đầu-tiên).
- Quyết định thiết kế quan trọng: `git merge` (lệnh cục bộ, 8 lệnh cũ) **giữ nguyên** mô hình đơn
  giản đã có (tự động chọn bản của nhánh gộp vào, cảnh báo bằng chữ "XUNG DOT" trong output) để
  không phá bài `p3-u10-l2` đang chạy. `git pull` khi xung đột dùng mô hình **THẬT hơn**: chèn
  dấu xung đột vào file, không tự tạo commit. Hai mô hình khác nhau có chủ đích — dạy hai khái
  niệm khác nhau (gộp cục bộ đơn giản vs. quy trình giải xung đột thật khi cộng tác).
- Sửa 3 ca test cũ trong `lessonsGit.test.ts` từng khẳng định `push/pull/clone/rebase/stash`
  "chưa mô phỏng" — nay các lệnh này đã chạy thật nên cập nhật đúng hành vi mới (`bisect` vẫn bị
  chặn, `rebase -i` vẫn bị chặn, các lệnh ngoài phạm vi khác —
  `worktree`/`submodule`/`lfs`/`mergetool`/`archive`/`fsck` — có thông điệp lỗi riêng thay vì
  chung một danh sách).
- Thêm `packages/subject-programming/gitSim.test.ts` (**mới hoàn toàn** — trước đây `gitSim.ts`
  chỉ được phủ gián tiếp qua `lessonsGit.test.ts`), 38 ca kiểm từng lệnh mới + đủ ca lỗi.

## Lỗi phát hiện qua test (đã sửa)

- `git reset --soft` không cập nhật vùng chờ nên `git status` sau đó không hiện file nào là "đã
  chuẩn bị" — sửa bằng cách gán vùng chờ = ảnh chụp HEAD CŨ trước khi dời con trỏ nhánh (đúng
  hành vi git thật: index không đổi khi soft reset).
- `git pull` khi kho từ xa và cục bộ trỏ CÙNG một commit báo nhầm "tua nhanh" thay vì "đã cập
  nhật, không có gì mới" — do thiếu ca kiểm tra bằng nhau tuyệt đối trước khi xét tổ tiên.
- `git rebase` xác định sai điều kiện "tuyến tính": bản đầu chỉ chấp nhận khi nhánh đích nằm
  ngay trên chuỗi cha-đầu-tiên của nhánh hiện tại — sai với ca phổ biến nhất ("nhánh chính đã đi
  xa hơn, rebase để bắt kịp"). Sửa thành tìm tổ tiên chung thật sự bằng `laToTien()`.

## Bằng chứng kiểm chứng

- `npx vitest run packages/subject-programming` ✅ 1627/1627 (36 file, gồm 38 ca mới ở
  `gitSim.test.ts` + 48 ca đã cập nhật ở `lessonsGit.test.ts`).
- `npx vitest run` (toàn repo) ✅ 7722/7722 (504 file).
- `npm run typecheck` ✅ · `npm run lint` (file đã sửa, `--max-warnings 0`) ✅ · `npm run build`
  (client + server + hub) ✅.
- `npm run codemap -- impact packages/subject-programming/gitSim.ts`: 1 điểm chạm thật ngoài
  test (`apps/dhcb/src/lib/gitRunner.ts`) — không đụng vì chữ ký `chayLenh()`/`GitRunResult`
  không đổi; đã đọc lại file đó để xác nhận.

## Việc tiếp theo (PR 2/4)

Tầng `packages/subject-programming/courses/` + khoá `git` chỉ có chương C1 (2 bài đã có,
`p3-u10-l1`/`p3-u10-l2`, DÙNG LẠI bằng id — không chép, không xoá) — để chứng minh cơ chế tham
chiếu bài cũ chạy được trước khi soạn 14 bài mới ở PR 4.

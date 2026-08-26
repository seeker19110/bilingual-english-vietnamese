# refactor(docs): tách nhật ký đợt việc khỏi PROGRESS.md ra `docs/changelog/` (2026-08-26)

Người dùng yêu cầu làm sau khi chính vấn đề này gây xung đột lần thứ tư trong ngày.

## Vấn đề đo được

Mọi đợt việc đều chèn một mục vào **đầu** phần "Giai đoạn hiện tại" của `PROGRESS.md`. PR nào
cũng sửa **cùng một chỗ của cùng một file** → hai PR song song là xung đột. Riêng 2026-08-26 đã
xung đột **bốn lần liên tiếp** (PR #693, #695, #696, #697), lần nào cũng cùng một kiểu "cả hai
bên cùng thêm mục ở đầu file" và phải giải tay.

Quy mô lúc tách: `PROGRESS.md` dài **7954 dòng**, riêng phần "Giai đoạn hiện tại" chiếm **4754
dòng / 150 mục**.

## Đã làm

- **`docs/changelog/` — mỗi đợt việc MỘT FILE**, tên `NNNN-YYYY-MM-DD-slug.md`. File mới không
  bao giờ xung đột với file mới khác.
- **Di trú 150 mục cũ** thành `0001`–`0150`, số thứ tự tăng dần theo thời gian (mục cũ nhất là
  `0001`), nên `ls` là thấy đúng trình tự.
- **Cố ý KHÔNG commit file index sinh tự động.** Chính cái index đó sẽ lại là file mà mọi PR cùng
  sửa — tức dựng lại đúng vấn đề vừa bỏ. Thay bằng `npm run changelog` (`scripts/changelog.ts`)
  đọc thẳng thư mục: in N đợt gần nhất và gợi ý số kế tiếp.
- **`PROGRESS.md` giữ lại phần thật sự là trạng thái hiện tại** — nợ kỹ thuật, quyết định quan
  trọng, việc tiếp theo, việc cần làm tay. Những mục đó được sửa TẠI CHỖ chứ không chồng thêm,
  nên hiếm khi xung đột. File còn **3219 dòng** (giảm 4735).
- **Hook đầu phiên** (`.claude/report-status.sh`) đọc thẳng `docs/changelog/` thay vì grep
  `PROGRESS.md`, hiện 3 đợt gần nhất.
- **`CLAUDE.md`** cập nhật quy ước: mục 3 nay yêu cầu thêm file changelog mới, và nói rõ KHÔNG
  chồng thêm mục vào `PROGRESS.md`.

## Kiểm chứng

- **Không mất một dòng nào.** Ghép ngược 150 file rồi so từng dòng với nguyên bản:
  **3983 dòng có nội dung, khớp tuyệt đối** — không mất, không thêm, không đổi thứ tự.
- **6 test bất biến mới** (`scripts/changelog.test.ts`): khuôn tên file · dòng đầu là tiêu đề cấp
  1 · không file rỗng · `readEntries()` sắp mới nhất trước · và canh `PROGRESS.md` KHÔNG còn mục
  `###` nào trong phần "Giai đoạn hiện tại" (chặn thói quen cũ quay lại).
- Hook chạy thật, in đúng 3 đợt mới nhất.

## Đánh đổi đã cân nhắc

Hai PR song song có thể cùng lấy một số thứ tự. Chấp nhận: slug khác nhau nên tên file khác nhau,
git vẫn không xung đột; thứ tự trong cùng một ngày hiếm khi quan trọng. Đổi lại là không cần bất
kỳ cơ chế cấp phát số tập trung nào — mà cơ chế đó mới chính là thứ sẽ lại gây xung đột.

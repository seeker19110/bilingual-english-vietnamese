# chore(quy ước): PR luôn tạo ở trạng thái sẵn sàng, và không được tụt sau `main` (2026-08-27)

**Người dùng chốt 2026-08-27:** "thêm quy ước luôn xác nhận ready khi tạo PR, để CI xanh là tự
động merge."

## Vì sao có đợt này — một PR xanh mà vẫn nằm im

PR #709 (PR-M3) có **cả ba check bắt buộc xanh** (`quality` · `e2e` · `metadata`) và auto-merge
đã bật, nhưng vẫn không tự merge. Nguyên nhân đọc được từ trạng thái PR:
`mergeable_state: "behind"` — branch protection của repo đòi **nhánh phải cập nhật với `main`**
trước khi merge, mà `main` đã tiến thêm 4 commit (#703 nội dung P6, ba PR dependabot).

Nói cách khác: "bật auto-merge" chưa đủ để PR tự vào `main`. Có **ba** điều kiện, và điều kiện
thứ ba trước nay chưa được ghi thành luật.

## Quy ước mới (thêm vào `CLAUDE.md` mục 11)

Ba bước bắt buộc khi tạo PR, làm liền một mạch:

1. **Tạo PR ở trạng thái SẴN SÀNG (ready), không bao giờ để nháp** — GitHub từ chối bật
   auto-merge trên PR nháp ("Pull request is a draft", đã dính thật ở PR #693).
2. **Bật auto-merge (squash) ngay**, không hỏi lại.
3. **Giữ nhánh không tụt sau `main`** — nếu `mergeable_state` là `behind`:
   `git fetch origin main` → `git merge origin/main` → **chạy lại toàn bộ cổng trên kết quả đã
   gộp** (mục 9) → push. CI xanh lần nữa thì auto-merge tự nổ. **Không merge tay để đi tắt.**

Mục đích: **CI xanh là PR tự vào `main`, không cần ai bấm nút.** Việc của AI là giữ PR luôn ở
trạng thái auto-merge nổ được — ready · có auto-merge · không tụt sau `main`.

## Áp dụng ngay trong đợt này

Đã gộp `main` vào nhánh của PR #709 và chạy lại toàn bộ cổng trên kết quả đã gộp:

| Cổng                     | Kết quả sau khi gộp                                       |
| ------------------------ | --------------------------------------------------------- |
| `npm run typecheck`      | ✅ xanh                                                   |
| `npm run lint`           | ✅ 0 cảnh báo                                             |
| `npx prettier --check .` | ✅ sạch                                                   |
| `npm test`               | ✅ **6.642 test / 473 file** (gộp thêm 8 bài P6 của #703) |

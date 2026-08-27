# `docs/changelog/` — nhật ký từng đợt việc

Mỗi đợt việc (thường là một PR) **một file riêng**. Không có file tổng hợp nào phải sửa chung.

## Vì sao tách ra (quyết định 2026-08-26)

Trước đây mọi đợt việc đều chèn một mục vào **đầu** phần "Giai đoạn hiện tại" của `PROGRESS.md`.
Nghĩa là PR nào cũng sửa **cùng một chỗ của cùng một file**, nên hai PR chạy song song là xung
đột. Riêng ngày 2026-08-26 đã xung đột **bốn lần liên tiếp** (PR #693, #695, #696, #697) — lần
nào cũng cùng một kiểu "cả hai bên cùng thêm mục ở đầu file" và phải giải tay.

Tách mỗi đợt thành một file riêng thì hai PR ghi hai file khác nhau, git không có gì để xung đột.

Cố ý **KHÔNG** commit file index sinh tự động: chính cái index đó sẽ lại thành file mà mọi PR
cùng sửa, tức dựng lại đúng vấn đề vừa bỏ. Muốn xem danh sách thì chạy `npm run changelog` —
lệnh này đọc thẳng thư mục.

## Đặt tên

```
NNNN-YYYY-MM-DD-slug.md
```

- `NNNN` — số thứ tự **tăng dần theo thời gian**; số lớn nhất là đợt mới nhất.
- `YYYY-MM-DD` — ngày làm đợt việc đó.
- `slug` — chữ thường không dấu, nối bằng dấu gạch ngang.

Hai PR song song có thể cùng lấy một số — git không xung đột (slug khác nhau nên tên file khác
nhau), **nhưng `scripts/changelog.test.ts` CHẶN số trùng**: `readEntries()` phải sắp được thứ tự
nghiêm ngặt, hai file cùng số làm khẳng định đó sai. Test **không** chặn khoảng trống — chỉ chặn
trùng.

**Nhánh sống lâu thì phải dời số, và có thể phải dời nhiều lần.** Đã gặp thật ba lần liên tiếp
trên cùng một nhánh trong hai ngày 2026-08-26/27: `main` merge PR khác, PR đó lấy đúng số nhánh
đang giữ, CI đỏ ở `quality`. Mỗi lần lại dời lên một bậc rồi lại bị chiếm tiếp.

**Cách làm khi rơi vào cảnh đó:** đừng dời sát ngay sau số cuối của `main` — **chừa một khoảng
an toàn** (vài số) để những PR merge trước bạn có chỗ. Khoảng trống là hợp lệ: không test nào
chặn, `npm run changelog` sắp theo số nên vẫn đúng thứ tự, và hook đầu phiên chỉ đọc số lớn nhất.
Kiểm số của `main` ngay trước khi mở PR bằng:

```bash
git ls-tree --name-only origin/main docs/changelog/ | tail -3
```

## Dùng

```bash
npm run changelog             # 10 đợt gần nhất + gợi ý số kế tiếp
npm run changelog -- 30       # 30 đợt gần nhất
npm run changelog -- --all    # toàn bộ
```

## Viết một đợt mới

Tạo file mới theo đúng khuôn tên trên. Dòng đầu là tiêu đề cấp 1 (`# ...`) — hook đầu phiên và
`npm run changelog` đều đọc dòng này. Nội dung viết như trước: đã làm gì, quyết định gì, bằng
chứng kiểm chứng ra sao.

**150 file đầu tiên (`0001`–`0150`) là bản di trú nguyên văn** từ `PROGRESS.md`, đã đối chiếu
từng dòng: 3983 dòng có nội dung, khớp tuyệt đối, không mất và không đổi thứ tự.

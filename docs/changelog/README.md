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
nhau), **nhưng test `scripts/changelog.test.ts` CHẶN số trùng**: `readEntries()` phải sắp được
thứ tự nghiêm ngặt, hai file cùng số làm khẳng định đó sai. Nên khi merge `main` về mà thấy số
của mình đã bị PR khác dùng, **đổi số file của mình cho lớn hơn** rồi sửa các chỗ trỏ tới nó
(đã gặp thật 2026-08-26: `main` dùng 0155–0158, nhánh phải dời sang 0159–0161).

_(Đoạn này trước đây ghi "cùng số — không sao", trái với test đang chạy. Đã sửa lại theo hành vi
thật của test.)_

Bất biến này được canh bằng test: `scripts/changelog.test.ts`.

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

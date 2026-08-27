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

- `NNNN` — số thứ tự tăng dần theo thời gian; số lớn nhất là đợt mới nhất.
- `YYYY-MM-DD` — ngày làm đợt việc đó.
- `slug` — chữ thường không dấu, nối bằng dấu gạch ngang.

### Cấp số: quét rồi lấy số lớn nhất + 1

Mỗi nhánh/PR mới, khi thêm đợt việc đầu tiên của mình, chạy `npm run changelog` — dòng cuối in
sẵn **số kế tiếp** — rồi dùng số đó. Chỉ vậy, không cần hỏi ai, không cần khoá gì.

**Trùng số là CHUYỆN BÌNH THƯỜNG, không phải lỗi.** Hai nhánh soạn cùng lúc thì cùng thấy một
số lớn nhất nên cùng chọn một số — hệ quả tất yếu của cách cấp số phi tập trung. Tên file vẫn
khác nhau (slug khác nhau) nên git không xung đột, thứ tự đọc vẫn đúng, và **CI không đỏ**:
`scripts/changelog.test.ts` chấp nhận số trùng, chỉ đòi thứ tự không giảm. Đừng đổi tên file để
"chữa" — không có gì cần chữa.

Số trùng thì hai đợt nằm cạnh nhau, sắp theo quy tắc phá hoà cố định: **ngày mới hơn trước, rồi
tới tên file**.

> Luật này được đặt lại ngày 2026-08-27 sau khi PR #703 dính **bốn lượt CI đỏ** liên tiếp vì
> trùng số (0154, rồi 0155/0156/0157 cùng lúc, rồi 0159, rồi 0160), mỗi lượt tốn một vòng chạy
> và một lượt đổi tên file. Cổng cũ đòi số _tăng nghiêm ngặt_, trong khi `scripts/changelog.ts`
> vẫn ghi "trùng số không sao" — công cụ và cổng mâu thuẫn nhau, và cổng thắng.

Bất biến này được canh bằng test: `scripts/changelog.test.ts` (có ca thử số trùng và ca thử
thứ tự phá hoà, chạy trên thư mục giả nên không phụ thuộc nội dung thư mục thật).

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

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
3. **Chỉ gộp `main` khi thật sự cần** — xem mục "Sửa lần hai" bên dưới.

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

## Sửa lần hai trong cùng ngày — tắt "require up to date" thay vì sống chung với nó

Bản quy ước đầu (viết sáng 2026-08-27) bảo: hễ nhánh `behind` thì gộp `main` rồi chạy lại toàn
bộ cổng. Người dùng chỉ ra ngay đó là vòng lặp không lối ra: **mỗi lần có PR bất kỳ merge vào
`main` là mọi PR đang mở thành `behind`**, phải gộp rồi chờ CI ~15–20 phút, trong lúc đó `main`
lại có thể tiến tiếp — với repo có dependabot đẩy PR đều đặn thì có thể không bao giờ đuổi kịp.

Nhận xét đó đúng. Nguyên nhân gốc không nằm ở quy trình mà ở **một ô tick trong branch
protection: "Require branches to be up to date before merging"**. Người dùng **đã tắt ô này
(2026-08-27)**, giữ nguyên ba required check `quality` · `e2e` · `metadata`.

**Đánh đổi đã cân nhắc:** tắt ô đó thì mất khả năng bắt "xung đột ngữ nghĩa" — hai PR mỗi cái
xanh riêng nhưng gộp lại thì hỏng (A đổi tên hàm, B thêm chỗ gọi tên cũ; git không báo xung đột).
Chấp nhận được vì: dự án hầu như chỉ có 1 PR nội dung mở cùng lúc, phần còn lại là dependabot chỉ
đụng `.github/workflows`; và `main` vẫn chạy đủ ~6.600 test ngay sau merge nên lọt cũng biết
trong vài phút và revert được. Lựa chọn an toàn tuyệt đối là **merge queue**, nhưng repo private
cần gói Team nên tạm gác.

**Quy ước sau khi sửa:** chỉ gộp `main` khi GitHub báo **xung đột thật**, hoặc khi `main` vừa đổi
thứ mà PR này cũng đụng. Và chỉ chạy lại cổng ở máy khi merge có xung đột / chạm file chung —
merge sạch thì để CI làm, đừng làm hai lần cùng một việc.

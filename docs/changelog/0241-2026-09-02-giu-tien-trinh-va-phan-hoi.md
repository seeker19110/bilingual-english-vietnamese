# 0241 — 2026-09-02 — Giữ tiến trình bài kiểm tra, phản hồi khi học thuộc, tiến độ hội thoại

PR: (điền khi tạo) · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Đợt 3 của loạt nâng trải nghiệm học tập, làm nốt 3 trong 8 điểm yếu còn lại từ khảo sát ghi ở
`docs/changelog/0240-*`. Cả ba đều thuộc loại "người học trả giá cho một thứ không phải lỗi của
họ".

## 1. Bài kiểm tra làm dở không còn mất khi chuyển tab

Tab "Kiểm tra" dựng 10 câu và giữ toàn bộ tiến trình trong state của component. Chuyển sang tab
khác là component bị gỡ khỏi cây → **làm dở 9/10 câu rồi lỡ bấm nhầm tab là mất trắng**, không
cảnh báo, không khôi phục.

**Cách chọn giải pháp.** Cách rẻ nhất là hỏi "bạn chắc chưa?" khi rời tab. Nhưng hộp thoại đó
vẫn bắt người học trả giá cho một cú bấm nhầm, và chặn cả những lần rời tab **chính đáng** — mở
lại bài ngữ pháp vừa trả lời sai, đúng việc app khuyến khích. Lưu phiên thì không phải hỏi gì:
rời tab bao nhiêu lần cũng được, quay lại là học tiếp đúng chỗ.

- `apps/dhcb/src/lib/quizSession.ts` — hàm thuần `load`/`save`/`clear`, tách khỏi component nên
  kiểm chứng được bằng test.
- Dùng **`sessionStorage`, không phải `localStorage`**: một bài làm dở chỉ có nghĩa trong phiên
  duyệt hiện tại. Mai mở lại mà thấy bài cũ treo giữa chừng thì gây bối rối hơn là giúp — và bộ
  câu hỏi lúc đó cũng đã lạc hậu so với vốn từ vừa học thêm.
- Khoá tách theo **người dùng × cấp học**; trang từ điển dùng `sessionScope="dictionary"` riêng
  vì nó lấy câu hỏi từ vốn từ khác.
- `loadQuizSession` **kiểm hình dạng từng trường** thay vì tin `JSON.parse`: đây là dữ liệu
  ngoài (sửa được bằng devtools, và bản cũ của app có thể đã ghi hình dạng khác). Một trường
  sai kiểu lọt qua sẽ làm hỏng màn hình đang học chứ không báo lỗi ở chỗ dễ thấy.
- Làm xong cả bài thì **xoá phiên** — giữ lại sẽ khiến lần vào sau bị ném thẳng vào màn kết quả
  cũ thay vì được làm bài mới.

## 2. Bấm "Đã thuộc" đã có hồi đáp

Đây là thao tác lặp nhiều nhất trong app (20–100 lượt/ngày) và trước đợt này **không có phản
hồi nào**: bấm xong thẻ lật sang từ kế tiếp, hết. Nay hiện dấu `✓ +1` trôi lên rồi tự mờ.

Ràng buộc tự đặt: **không được làm chậm nhịp học**. Thẻ vẫn lật ngay lập tức, dấu tích chỉ trôi
bên cạnh và mang `pointer-events-none` nên không bao giờ chắn nút bên dưới.

## 3. Thanh tiến độ cho phần "Đóng vai"

Hội thoại chỉ có con số 11px ở góc phải ("3/12"), trong khi mọi dạng bài khác (quiz, flashcard,
luyện nghe) đều có thanh tiến độ. Với hội thoại dài, con số nhỏ đó không cho cảm giác "còn bao
xa" — mà chính cảm giác đó giữ người học đi hết bài. Dùng đúng chiều cao/bo góc của các thanh
khác cho nhất quán.

## Bằng chứng kiểm chứng

- `apps/dhcb/src/lib/quizSession.test.ts` — **6 test**, gồm ca tách khoá theo người dùng và
  theo cấp, và 8 hình dạng dữ liệu hỏng phải bị từ chối (`current` âm, `current` vượt số câu,
  `current` không nguyên, phần tử `answers` sai kiểu…).
- `e2e/quiz-session.spec.ts` — **1 test E2E**: trả lời 3 câu → đổi sang tab "Từ khó" (xác nhận
  component đã bị gỡ) → quay lại tab "Kiểm tra" → vẫn ở **câu 4/10**, không phải câu 1.
- **Kiểm bằng trình duyệt thật**: ảnh chụp xác nhận dấu `✓ +1` hiện đúng cạnh nút "Đã thuộc"
  mà không che nút, và bộ đếm câu giữ nguyên sau khi đổi tab qua lại.
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` — xem phần Validation của
  PR.

## Việc CỐ Ý KHÔNG làm

Khảo sát đề xuất **xếp danh sách unit thành 2 cột trên desktop** để đỡ phải cuộn. Đã cân nhắc
và bỏ: các unit là một **trình tự** ("Phần 1 → Phần 2 → …"), mà hai cột buộc mắt đọc theo hình
zig-zag, phá đúng cái ẩn dụ "con đường" mà lộ trình học dựa vào. Trang cũng đã có sẵn cột danh
sách bên trái ở các màn con (`TwoPane` + `railSide="left"`), tức nhu cầu "nhảy nhanh giữa các
phần" đã được phục vụ mà không phải bẻ trình tự. Đỡ cuộn không đáng đánh đổi bằng việc người
học mất dấu mình đang ở đâu trong lộ trình.

## Việc tiếp theo

Còn 5 điểm yếu từ khảo sát, đáng làm nhất: cho phép bấm vào cột hoạt động 7 ngày ở Dashboard để
xem ngày đó đã học gì; nói rõ khi phiên học bị rút gọn (`?cap=`) để người học không hoang mang
vì đột nhiên ít bài hơn; và badge số trên thanh tab đang dùng cỡ chữ 11px quá nhỏ so với tầm
quan trọng của nó.

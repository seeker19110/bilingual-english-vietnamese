# 0240 — 2026-09-02 — Phiên học trên desktop: bàn phím, phản hồi, phân cấp hành động

PR: #823 · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Người dùng yêu cầu **ưu tiên trải nghiệm học tập**. Khảo sát 5 màn hình học chính
(`CefrLevelPage`, `StudyTabs`, `CefrLessonViews`, `Speaking`, `Dashboard`) tìm ra 12 điểm yếu;
đợt này xử lý 4 điểm tác động lớn nhất tới người học.

## 1. Trắc nghiệm điều khiển được bằng bàn phím (điểm yếu số 1)

Trắc nghiệm là thao tác lặp nhiều nhất của app: một phiên vài chục câu. Trước đợt này **toàn
bộ** luồng trắc nghiệm chỉ có `onClick` — trên máy tính, mỗi câu buộc người học rời bàn phím,
rê chuột xuống đáp án, bấm, rồi rê tiếp xuống nút "Câu tiếp theo". Người không dùng được chuột
phải Tab qua từng đáp án.

- `packages/core-ui/useQuizKeyboard.ts` — `1`…`9` chọn đáp án, `Enter`/`Space` sang câu tiếp.
  Luật phím tách thành **hàm thuần `resolveQuizKey`** để kiểm chứng bằng test mà không cần dựng
  DOM (cùng triết lý với `core-examplan`).
- Đặt ở `packages/core-ui` vì trắc nghiệm không thuộc riêng môn nào — môn Anh, Lập trình và ba
  môn STEM dùng chung dạng bài này.
- `apps/dhcb/src/components/QuizOptionKey.tsx` — ô số hiện **trước** mỗi đáp án. Phím tắt không
  được hiển thị thì chỉ phục vụ người đã đọc tài liệu, tức gần như không ai. Ô số `hidden
lg:flex` (dưới 1024px gần như không có bàn phím rời) và `aria-hidden` (trình đọc màn hình
  phải nghe nội dung đáp án, không nghe con số).
- Lắp vào: `QuizTab` + mini-quiz mở batch (`StudyTabs.tsx`) và `ExamQuestionCard.tsx`.

**Quyết định đáng ghi:** hook đặt **bên trong `ExamQuestionCard`**, không ở từng trang cha.
Component đó sở hữu cả đáp án lẫn `onPick`/`onNext`, nên thi cuối cấp, test xếp lớp và luyện
nghe có phím tắt cùng lúc. Nếu để mỗi trang tự lắp thì ô số vẫn hiện ở trang quên lắp — giao
diện hứa một thao tác không tồn tại.

Ba luật phím có lý do người dùng, không phải tuỳ tiện:

- Đang gõ trong ô nhập → bỏ qua (gõ "1" vào ô tìm kiếm mà nhảy câu là lỗi kinh điển).
- Có phím bổ trợ → bỏ qua (`Ctrl+1` là lệnh đổi tab của trình duyệt).
- **Chưa trả lời thì `Enter` không nhảy câu** — bấm theo quán tính sẽ bỏ qua câu chưa kịp đọc.

### Thẻ từ vựng cũng nhận phím (điểm yếu số 3)

`1` = "Để sau", `2` = "Đã thuộc" trong `VocabFlash`. Đây là thao tác lặp nhiều nhất của người
học — 20–100 lượt mỗi ngày — nên mỗi lượt phải rời tay khỏi bàn phím là tốn thật. Tái dùng
đúng hook trên với `answered: false` (chỉ nhánh phím số sống), và **tắt khi đang ở màn
test-out** để phím số không vừa chọn đáp án vừa lật thẻ.

## 2. Phản hồi đúng/sai thành quy ước chung (điểm yếu số 2)

`animate-pop-correct`/`animate-shake` trước đây chỉ có ở 2 trong 6 nơi trả lời đúng/sai.
`ExamQuestionCard` — dùng cho **thi cuối cấp, test xếp lớp và luyện nghe** — là loại bài duy
nhất trả lời xong mà màn hình đứng im. Nay đã đồng bộ.

## 3. Phân cấp hành động ở trang cấp CEFR (điểm yếu số 8)

Thẻ "Thi cuối cấp" từng đứng **trên** thẻ "Học tiếp", cùng kiểu và cùng cỡ, nên hai hành động
trông ngang nhau — người đủ điều kiện thi dễ bấm thi trước khi học hết. Việc đúng gần như luôn
là "học tiếp", nên nay nó đứng trước và mang nền accent (hành động chính); thẻ thi lùi xuống
sau, giữ nền trung tính (hành động phụ).

## 4. Khung xương thay cho dòng chữ "Đang tải…" (điểm yếu số 6)

Trang cấp CEFR khi tải chỉ hiện một dòng chữ nhạt giữa khung trống, nên lúc dữ liệu vào là màn
hình nhảy dựng. Nay vẽ sẵn đúng hình dạng nội dung sắp hiện (thẻ tổng quan hai thanh tiến độ +
ba dòng danh sách), kèm `aria-busy` và nhãn ẩn cho trình đọc màn hình.

## Bằng chứng kiểm chứng

- **Kiểm bằng trình duyệt thật** (Playwright + Chromium, 1440×1000, đã đăng nhập giả): bấm
  phím `1` ở tab Kiểm tra → đáp án đầu được chọn, tô đỏ vì sai, đáp án đúng tự sáng xanh, nút
  "Câu tiếp theo" hiện ra. Ảnh chụp trước/sau đã đối chiếu.
- `e2e/quiz-keyboard.spec.ts` — **4 test E2E mới, xanh**: phím số chọn đáp án + Enter sang câu;
  phím `2` ở thẻ từ vựng chuyển sang từ kế tiếp (đo bằng bộ đếm "Từ n/16" tăng đúng 1); ô số
  hiện ở desktop và `aria-hidden`; ô số **ẩn** ở 390px.
- `packages/core-ui/useQuizKeyboard.test.ts` — **7 test hàm thuần**, gồm ca biên `Number('') === 0`
  và `Number(' ') === 0` (nếu chỉ kiểm `Number.isInteger` thì phím Space lúc chưa trả lời sẽ
  chọn nhầm đáp án).
- `npm run lint` · `npm run typecheck` · `npm test` — xem phần Validation của PR.

## Việc tiếp theo

Còn 8 điểm yếu đã ghi nhận trong khảo sát, đáng làm nhất:

- Tận dụng bề ngang desktop cho danh sách unit (đang một cột dài trong khi màn hình rộng).
- **Phản hồi thị giác** khi bấm "Đã thuộc" — đợt này mới cho nó nhận phím, chứ nút vẫn chưa có
  hồi đáp nào khi bấm.
- Thanh tiến độ cho phần "Đóng vai" của hội thoại (hiện chỉ có số đếm chữ nhỏ ở góc).
- Mất tiến trình khi lỡ chuyển tab giữa lúc làm dở bài kiểm tra 10 câu.

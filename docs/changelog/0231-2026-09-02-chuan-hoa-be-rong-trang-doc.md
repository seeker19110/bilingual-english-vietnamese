# 0231 — Nới bề rộng nội dung 8 trang đọc chính ở desktop (`lg:max-w-4xl`)

- **Ngày:** 2026-09-02
- **Nhánh:** `claude/redesign-desktop-ui-ux-t838bm`
- **Bối cảnh:** đợt 2/4 của việc nghiên cứu + thiết kế lại UI/UX desktop (tiếp theo #810).

## Vấn đề

Rà `max-w-*` của ~55 trang cho thấy phần lớn đã nhất quán theo LOẠI trang (form/quiz hẹp
`max-w-2xl`, dashboard hai cột `max-w-6xl`, còn lại `max-w-3xl`/`max-w-4xl`) — không phải
hỗn loạn cần dẹp toàn bộ. Chỗ lệch thật là 8 trang ĐỌC nội dung chính của môn Tiếng Anh +
trang giới thiệu Lập trình: cố định `max-w-3xl` (48rem) trên MỌI kích thước màn hình, kể cả
khi sidebar desktop đã chừa hẳn một cột trái — nội dung bị bó hẹp không cần thiết trong khi
màn hình rộng dư ra hai bên.

## Đã làm

Thêm `lg:max-w-4xl` (giữ nguyên `max-w-3xl` ở mobile/tablet, chỉ nới rộng từ 1024px trở
lên — đúng khuôn `max-w-3xl lg:max-w-5xl` đã có sẵn ở `Chat.tsx`/`Speaking.tsx`) cho:
`EnglishHome.tsx`, `Lessons.tsx` (cả 4 khối căn giữa trong màn đọc hội thoại — toolbar, danh
sách lượt thoại, thanh chấm điểm cuối — đổi ĐỒNG THỜI để không lệch hàng với nhau),
`Stories.tsx`, `Listening.tsx`, `CommonPhrases.tsx`, `Dictionary.tsx`, `EnglishSettings.tsx`,
`ProgrammingAbout.tsx`.

## Chưa làm (cố ý)

Không đụng các trang dashboard/canvas hai cột (đã `max-w-6xl`/`max-w-7xl`, đúng mục đích) hay
trang form/quiz hẹp (`max-w-2xl`, cố ý hẹp để dễ đọc câu hỏi). Cây điều hướng sâu hơn + flyout
khi thu gọn sidebar (lát 3/4), bảng lệnh ⌘K (lát 4/4).

## Bằng chứng

Build ✅ · Typecheck ✅ · Lint ✅ (0 cảnh báo) · Test ✅ 535 file / 10.863 test xanh (không
đổi số so với trước — thay đổi thuần CSS, không đụng logic) · Budget ✅ (JS 128,25/140 kB,
CSS 17,06/20 kB).

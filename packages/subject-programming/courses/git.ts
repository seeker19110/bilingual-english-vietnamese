// courses/git.ts — Khoá ngắn "Git & GitHub thực hành" (PR 2/4 khoá Git).
//
// PR NÀY CHỈ CÓ CHƯƠNG C1 — dùng lại NGUYÊN VẸN hai bài Git đã có (`p3-u10-l1`/`p3-u10-l2`
// của P3). Đây là bước chứng minh "dùng lại bài cũ chạy được" trước khi soạn 14 bài mới ở
// PR 4. Bốn chương còn lại (C2 Nhìn thấy việc mình làm → C5 Nâng cao) thêm dần ở PR 4, mỗi
// chương chỉ khai khi bài đã soạn xong thật — không hứa suông chương rỗng.
//
// Đặc tả đầy đủ (5 chương, 16 bài): docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md
import type { ShortCourse } from './types.js'

export const GIT_COURSE: ShortCourse = {
  id: 'git',
  title: 'Git & GitHub thực hành',
  canDo:
    'Tự tin dùng Git một mình: lưu lịch sử, làm việc theo nhánh, đưa dự án lên GitHub và cộng tác với người khác mà không sợ mất code.',
  duration: '2–4 tuần, học được mà không cần biết lập trình trước',
  prerequisites: [],
  chapters: [
    {
      id: 'git-c1',
      title: 'Nền móng',
      summary:
        'Biến một thư mục thành kho Git, lưu lại từng bước làm việc, và thử ý tưởng mới trên nhánh riêng mà không sợ hỏng bản đang chạy.',
      lessonIds: ['p3-u10-l1', 'p3-u10-l2'],
    },
  ],
}

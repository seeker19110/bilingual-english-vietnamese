// courses/git.ts — Khoá ngắn "Git & GitHub thực hành" (PR 4/4 khoá Git — đủ 5 chương).
//
// Chương C1 dùng lại NGUYÊN VẸN hai bài Git đã có (`p3-u10-l1`/`p3-u10-l2` của P3, thêm từ
// PR 2 — chứng minh "dùng lại bài cũ chạy được"). Bốn chương C2–C5 là 14 bài MỚI, unitId
// dạng `git-uN` ("unit ảo" của tầng khoá ngắn — xem ghi chú đầu `lessons/gitu2.ts` và cổng
// `lessons.test.ts`, không nằm trong curriculum.ts).
//
// Đặc tả đầy đủ: docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md
import type { ShortCourse } from './types.js'

export const GIT_COURSE: ShortCourse = {
  id: 'git',
  title: 'Git & GitHub thực hành',
  canDo:
    'Tự tin dùng Git một mình: lưu lịch sử, làm việc theo nhánh, hoàn tác đúng cách, đưa dự án lên GitHub và cộng tác với người khác — kể cả khi có xung đột — mà không sợ mất code.',
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
    {
      id: 'git-c2',
      title: 'Nhìn thấy việc mình làm',
      summary:
        'Đọc lại chính xác mình vừa đổi gì trước khi chốt (git diff), và lướt nhanh toàn bộ lịch sử (git log).',
      lessonIds: ['git-u2-l1', 'git-u2-l2', 'git-u2-l3'],
    },
    {
      id: 'git-c3',
      title: 'Hoàn tác',
      summary:
        'Phân biệt hoàn tác AN TOÀN (restore, revert) với hoàn tác NGUY HIỂM (reset) — và lưới cứu hộ reflog khi lỡ tay.',
      lessonIds: ['git-u3-l1', 'git-u3-l2', 'git-u3-l3'],
    },
    {
      id: 'git-c4',
      title: 'Cộng tác GitHub',
      summary:
        'Đưa code lên GitHub, kéo về mới nhất, chuẩn bị Pull Request, giải xung đột thật, và ép buộc an toàn khi cần.',
      lessonIds: ['git-u4-l1', 'git-u4-l2', 'git-u4-l3', 'git-u4-l4', 'git-u4-l5'],
    },
    {
      id: 'git-c5',
      title: 'Nâng cao',
      summary:
        'Cất việc đang làm dở (stash), chọn giữa rebase và merge, mang một commit sang nhánh khác và đánh dấu bản phát hành (cherry-pick, tag).',
      lessonIds: ['git-u5-l1', 'git-u5-l2', 'git-u5-l3'],
    },
  ],
}

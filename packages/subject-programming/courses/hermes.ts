// courses/hermes.ts — Khoá ngắn "Hermes Agent — trợ lý AI cho người đi làm" (PR 3/4 khoá
// Hermes — docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md).
//
// PR 3 chỉ khai chương C1 (7 bài `hermes-u1-l*` — unit ảo của tầng khoá ngắn, xem ghi chú đầu
// `lessons/hermesu1.ts`). Ba chương C2–C4 (15 bài) để dành PR 4 — cố ý KHÔNG khai chương rỗng,
// đúng tiền lệ khoá Git (PR #740).
import type { ShortCourse } from './types.js'

export const HERMES_COURSE: ShortCourse = {
  id: 'hermes',
  title: 'Hermes Agent — trợ lý AI cho người đi làm',
  canDo:
    'Tự dựng và điều khiển một tác tử AI thật: cấu hình model, nối vào Telegram, tách profile theo vai, quản phiên làm việc, dùng kho kỹ năng — và giao việc, theo dõi, nghiệm thu như điều phối một nhân viên. Dành cho nhân viên văn phòng và người điều phối dev, không cần biết code.',
  duration: '3–5 tuần, vào thẳng không cần học bậc nào trước',
  prerequisites: [],
  chapters: [
    {
      id: 'hermes-c1',
      title: 'Cơ bản',
      summary:
        'Dựng Hermes chạy bằng Docker, lắp model chính + curator, đi một vòng Dashboard/CLI, nối Telegram, tách profile theo vai, quản phiên mỗi-việc-một-phiên và dùng kho kỹ năng có sẵn.',
      lessonIds: [
        'hermes-u1-l1',
        'hermes-u1-l2',
        'hermes-u1-l3',
        'hermes-u1-l4',
        'hermes-u1-l5',
        'hermes-u1-l6',
        'hermes-u1-l7',
      ],
    },
  ],
}

// courses/openclaw.ts — Khoá ngắn "OpenClaw — dựng trợ lý AI của riêng bạn" (PR 2/3 khoá
// OpenClaw — docs/specs/2026-08-31-khoa-openclaw.md).
//
// PR 2 chỉ khai chương C1 (6 bài `openclaw-u1-l*` — unit ảo của tầng khoá ngắn, xem ghi chú
// đầu `lessons/openclawu1.ts`). Ba chương C2–C4 (14 bài) để dành PR 3 — cố ý KHÔNG khai
// chương rỗng, đúng tiền lệ khoá Git (PR #740) và khoá Hermes.
import type { ShortCourse } from './types.js'

export const OPENCLAW_COURSE: ShortCourse = {
  id: 'openclaw',
  title: 'OpenClaw — dựng trợ lý AI của riêng bạn',
  canDo:
    'Tự cài đặt và vận hành một trợ lý AI chạy TRÊN MÁY CỦA BẠN: onboard, bật gateway, chọn model, nối kênh nhắn tin với hàng rào an toàn mặc định, tự chẩn đoán khi trục trặc — dữ liệu không rời nhà. Dành cho người dùng cá nhân và người điều phối dev, không cần biết code.',
  duration: '3–4 tuần, vào thẳng không cần học bậc nào trước',
  prerequisites: [],
  chapters: [
    {
      id: 'openclaw-c1',
      title: 'Cài đặt & làm quen',
      summary:
        'Hiểu trợ lý tự host khác gì trợ lý đám mây, cài OpenClaw và onboard, nắm kiến trúc Gateway (control plane trên máy bạn), đi một vòng dashboard + chat terminal, chọn model và tự chẩn đoán bằng doctor.',
      lessonIds: [
        'openclaw-u1-l1',
        'openclaw-u1-l2',
        'openclaw-u1-l3',
        'openclaw-u1-l4',
        'openclaw-u1-l5',
        'openclaw-u1-l6',
      ],
    },
  ],
}

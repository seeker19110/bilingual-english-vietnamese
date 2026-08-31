// courses/openclaw.ts — Khoá ngắn "OpenClaw — dựng trợ lý AI của riêng bạn" (docs/specs/
// 2026-08-31-khoa-openclaw.md).
//
// PR 2 khai chương C1 (6 bài `openclaw-u1-l*` — unit ảo của tầng khoá ngắn, xem ghi chú đầu
// `lessons/openclawu1.ts`). PR 3 khai nốt ba chương C2–C4 (14 bài, tổng 20 bài toàn khoá).
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
    {
      id: 'openclaw-c2',
      title: 'Nối kênh & khoá cửa',
      summary:
        'Nối Telegram và WhatsApp/Discord vào Gateway, hiểu vì sao kênh mới luôn sinh ra ở trạng thái an toàn nhất, mở đúng người bằng allowFrom/dmPolicy, soát hàng rào toàn diện trước khi mở rộng cho nhóm đông, và luật sandbox: việc chạm máy thật luôn qua người duyệt.',
      lessonIds: [
        'openclaw-u2-l1',
        'openclaw-u2-l2',
        'openclaw-u2-l3',
        'openclaw-u2-l4',
        'openclaw-u2-l5',
      ],
    },
    {
      id: 'openclaw-c3',
      title: 'Skills & tự động hoá',
      summary:
        'Khám phá kho skills sẵn có, chỉnh trợ lý ngay trong chat bằng /config và /plugins, tự động hoá việc lặp bằng openclaw cron (kích tay trong mô phỏng), hiểu ý tưởng webhook qua hai loại trigger đã học, và chọn model — kể cả tinh thần model tự host.',
      lessonIds: [
        'openclaw-u3-l1',
        'openclaw-u3-l2',
        'openclaw-u3-l3',
        'openclaw-u3-l4',
        'openclaw-u3-l5',
      ],
    },
    {
      id: 'openclaw-c4',
      title: 'Nhiều agent & vận hành',
      summary:
        'Tách mỗi vai một agent riêng biệt, ghim đúng kênh vào đúng agent bằng routing binding, nắm ba việc vận hành dài hạn (backup, cập nhật, đọc log), và tổng kết bằng checklist "trợ lý của tôi đã an toàn chưa?" ráp lại mọi lệnh đã học trong khoá.',
      lessonIds: ['openclaw-u4-l1', 'openclaw-u4-l2', 'openclaw-u4-l3', 'openclaw-u4-l4'],
    },
  ],
}

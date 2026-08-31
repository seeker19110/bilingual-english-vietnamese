// courses/hermes.ts — Khoá ngắn "Hermes Agent — trợ lý AI cho người đi làm" (PR 3/3 khoá
// Hermes — docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md). Đủ 4 chương / 22 bài, bám
// đúng đề cương tham chiếu (2 ảnh Hermes Agent Course), góc nhìn văn phòng/điều phối dev.
import type { ShortCourse } from './types.js'

export const HERMES_COURSE: ShortCourse = {
  id: 'hermes',
  title: 'Hermes Agent — trợ lý AI cho người đi làm',
  canDo:
    'Tự dựng và điều khiển một tác tử AI thật: cấu hình model, nối vào Telegram, tách profile theo vai, quản phiên làm việc, dùng kho kỹ năng, đặt mục tiêu bền bỉ, dựng hạ tầng AI cho cả phòng (proxy, self-host, giao diện web), ghi nhớ và tra cứu thông tin qua Memos/Firecrawl/Honcho, và điều phối nhiều agent như một "công ty 0 người" qua Kanban/Herdr/Paperclip — như điều phối một đội nhân viên thật. Dành cho nhân viên văn phòng và người điều phối dev, không cần biết code.',
  duration: '5–8 tuần, vào thẳng không cần học bậc nào trước',
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
    {
      id: 'hermes-c2',
      title: 'Công cụ nâng cao',
      summary:
        'Đặt mục tiêu bền bỉ và lái giữa chừng (/goal, /steer), đúc việc lặp thành kỹ năng (/learn), rồi dựng hạ tầng AI cho cả phòng: LiteLLM kiểm soát chi phí, llama.cpp giữ dữ liệu không rời công ty, Open WebUI cho người không dùng terminal.',
      lessonIds: ['hermes-u2-l1', 'hermes-u2-l2', 'hermes-u2-l3', 'hermes-u2-l4', 'hermes-u2-l5'],
    },
    {
      id: 'hermes-c3',
      title: 'Tech stack ứng dụng',
      summary:
        'Ghi biên bản họp vào Memos, giao việc dev qua Linear như cho một teammate, bookmark tư liệu có ngữ cảnh, đọc-hiểu tài liệu/codebase trước khi hành động, và dùng skill thiết kế để làm landing page không cần dev.',
      lessonIds: ['hermes-u3-l1', 'hermes-u3-l2', 'hermes-u3-l3', 'hermes-u3-l4', 'hermes-u3-l5'],
    },
    {
      id: 'hermes-c4',
      title: 'Multi-agent và hệ sinh thái',
      summary:
        'Vận hành bảng Kanban chung cho người và agent, điều khiển nhiều agent song song qua Herdr, nghiên cứu thị trường có nguồn kiểm chứng bằng Firecrawl, giữ ngữ cảnh dài hạn bằng Honcho, và dựng "công ty 0 người" hoàn chỉnh bằng Paperclip.',
      lessonIds: ['hermes-u4-l1', 'hermes-u4-l2', 'hermes-u4-l3', 'hermes-u4-l4', 'hermes-u4-l5'],
    },
  ],
}

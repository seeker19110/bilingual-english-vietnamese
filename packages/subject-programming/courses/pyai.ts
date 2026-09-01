// courses/pyai.ts — Khoá 1/6 cụm "Kỹ sư AI thực chiến"
// (docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md).
import type { ShortCourse } from './types.js'

export const PYAI_COURSE: ShortCourse = {
  id: 'pyai',
  title: 'Python / AI Cơ Bản',
  canDo:
    'Viết được chương trình Python có hàm, cấu trúc dữ liệu, file và lớp; nói được AI học từ dữ liệu khác gì luật viết tay, qua 2 case study tự chạy.',
  duration: '17 bài · vào thẳng từ số 0 — cửa vào của chuỗi 6 khoá Kỹ sư AI',
  prerequisites: [],
  chapters: [
    {
      id: 'pyai-c1',
      title: 'Python nhập môn',
      summary: 'Biến, điều kiện, vòng lặp, hàm, chuỗi — đủ vốn để bắt đầu nghĩ bằng code.',
      lessonIds: ['pyai-u1-l1', 'pyai-u1-l2', 'pyai-u1-l3', 'pyai-u1-l4', 'pyai-u1-l5'],
    },
    {
      id: 'pyai-c2',
      title: 'Cấu trúc dữ liệu, file & OOP',
      summary: 'List, dict, đọc/ghi file, lớp và tổ chức chương trình có xử lý lỗi.',
      lessonIds: ['pyai-u2-l1', 'pyai-u2-l2', 'pyai-u2-l3', 'pyai-u2-l4', 'pyai-u2-l5'],
    },
    {
      id: 'pyai-c3',
      title: 'AI là gì',
      summary:
        'Luật viết tay vs học từ dữ liệu, bản đồ AI/ML/DL/GenAI, vòng đời dự án AI, đạo đức & giới hạn.',
      lessonIds: ['pyai-u3-l1', 'pyai-u3-l2', 'pyai-u3-l3', 'pyai-u3-l4'],
    },
    {
      id: 'pyai-c4',
      title: 'Case study chạy thật',
      summary: 'Hai case study trọn gói + bản đồ 5 khoá tiếp theo của chuỗi.',
      lessonIds: ['pyai-u4-l1', 'pyai-u4-l2', 'pyai-u4-l3'],
    },
  ],
}

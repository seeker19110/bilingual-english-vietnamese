// courses/mathai.ts — Khoá 2/6 cụm "Kỹ sư AI thực chiến".
import type { ShortCourse } from './types.js'

export const MATHAI_COURSE: ShortCourse = {
  id: 'mathai',
  title: 'Toán Thiết Yếu cho AI',
  canDo:
    'Tự cài được nhân ma trận, tính được xác suất/kỳ vọng, lấy đạo hàm số và chạy gradient descent hội tụ — đọc công thức trong tài liệu ML không còn sợ.',
  duration: '13 bài · nên học sau khoá Python / AI Cơ Bản',
  prerequisites: ['Khoá Python / AI Cơ Bản (pyai) hoặc biết Python căn bản'],
  chapters: [
    {
      id: 'mathai-c1',
      title: 'Xác suất & thống kê',
      summary:
        'Xác suất từ đếm, Bayes, kỳ vọng/phương sai, phân phối và thống kê mô tả — tự cài hết.',
      lessonIds: ['mathai-u1-l1', 'mathai-u1-l2', 'mathai-u1-l3', 'mathai-u1-l4', 'mathai-u1-l5'],
    },
    {
      id: 'mathai-c2',
      title: 'Đại số tuyến tính',
      summary: 'Vector, nhân ma trận 3 vòng lặp, cosine similarity và trực giác PCA.',
      lessonIds: ['mathai-u2-l1', 'mathai-u2-l2', 'mathai-u2-l3', 'mathai-u2-l4'],
    },
    {
      id: 'mathai-c3',
      title: 'Giải tích & tối ưu hoá',
      summary: 'Đạo hàm số, gradient, gradient descent tự cài và hàm mất mát trong ML thật.',
      lessonIds: ['mathai-u3-l1', 'mathai-u3-l2', 'mathai-u3-l3', 'mathai-u3-l4'],
    },
  ],
}

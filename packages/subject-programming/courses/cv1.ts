// courses/cv1.ts — Khoá 4/6 cụm "Kỹ sư AI thực chiến".
import type { ShortCourse } from './types.js'

export const CV1_COURSE: ShortCourse = {
  id: 'cv1',
  title: 'Deep Learning for Computer Vision cơ bản',
  canDo:
    'Giải thích và tự cài được forward pass của MLP và CNN (convolution/pooling), chạy được vòng huấn luyện trên bài toán ảnh nhỏ; đọc hiểu code PyTorch tương đương và biết Docker đóng gói mô hình để làm gì.',
  duration: '14 bài · 3 giai đoạn · nên học sau khoá Machine Learning & Data Science',
  prerequisites: ['Khoá Machine Learning & Data Science (mlds)'],
  chapters: [
    {
      id: 'cv1-c1',
      title: 'Nơ-ron & mạng MLP',
      summary:
        'Ảnh là ma trận số; nơ-ron, forward pass, hàm mất mát và trực giác lan truyền ngược.',
      lessonIds: ['cv1-u1-l1', 'cv1-u1-l2', 'cv1-u1-l3', 'cv1-u1-l4', 'cv1-u1-l5'],
    },
    {
      id: 'cv1-c2',
      title: 'CNN',
      summary:
        'Convolution/pooling tự cài, kiến trúc CNN, vòng huấn luyện đầy đủ, augment & overfit.',
      lessonIds: ['cv1-u2-l1', 'cv1-u2-l2', 'cv1-u2-l3', 'cv1-u2-l4', 'cv1-u2-l5'],
    },
    {
      id: 'cv1-c3',
      title: 'PyTorch, transfer learning & Docker',
      summary:
        'Đọc PyTorch bằng vốn tự cài, transfer learning, đánh giá mô hình ảnh, đóng gói triển khai.',
      lessonIds: ['cv1-u3-l1', 'cv1-u3-l2', 'cv1-u3-l3', 'cv1-u3-l4'],
    },
  ],
}

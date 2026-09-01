// courses/cv2.ts — Khoá 5/6 cụm "Kỹ sư AI thực chiến"
// (docs/specs/2026-09-01-cv2-bai-hoc-chi-tiet.md — canDo/prerequisites chép từ đặc tả).
import type { ShortCourse } from './types.js'

export const CV2_COURSE: ShortCourse = {
  id: 'cv2',
  title: 'Deep Learning for CV nâng cao',
  canDo:
    'Tự cài được attention một đầu và giải thích ViT; tự cài IoU + NMS của object detection; giải thích và mô phỏng được GAN, diffusion — đọc hiểu paper/kiến trúc CV 2026.',
  duration: '14 bài · 4 chương · nên học sau khoá Deep Learning for CV cơ bản',
  prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1)'],
  chapters: [
    {
      id: 'cv2-c1',
      title: 'Transformer & ViT',
      summary:
        'Vì sao cần attention, tự cài self-attention một đầu, multi-head + positional encoding, và ViT cắt ảnh thành patch.',
      lessonIds: ['cv2-u1-l1', 'cv2-u1-l2', 'cv2-u1-l3', 'cv2-u1-l4'],
    },
    {
      id: 'cv2-c2',
      title: 'Object detection',
      summary:
        'Hộp bao – lớp – điểm tin cậy, tự cài IoU và non-max suppression, chọn mô hình trong dòng họ hai pha vs một pha.',
      lessonIds: ['cv2-u2-l1', 'cv2-u2-l2', 'cv2-u2-l3', 'cv2-u2-l4'],
    },
    {
      id: 'cv2-c3',
      title: 'Mô hình sinh ảnh',
      summary:
        'GAN như trò chơi hai người, vì sao GAN khó huấn luyện (mode collapse), diffusion thêm/khử nhiễu, bức tranh sinh ảnh 2026.',
      lessonIds: ['cv2-u3-l1', 'cv2-u3-l2', 'cv2-u3-l3', 'cv2-u3-l4'],
    },
    {
      id: 'cv2-c4',
      title: 'Tổng hợp',
      summary:
        'Project nối conv + attention + NMS thành bộ dò vật sáng, rồi tổng kết và chọn lối đi tiếp.',
      lessonIds: ['cv2-u4-l1', 'cv2-u4-l2'],
    },
  ],
}

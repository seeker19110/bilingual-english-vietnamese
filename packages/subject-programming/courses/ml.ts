// courses/ml.ts — Khoá ngắn "Học máy — từ hồi quy đến AI tạo sinh" (docs/specs/
// 2026-08-31-khoa-hoc-may.md), nguồn: sơ đồ bản đồ Machine Learning 2026 người dùng gửi.
import type { ShortCourse } from './types.js'

export const ML_COURSE: ShortCourse = {
  id: 'ml',
  title: 'Học máy — từ hồi quy đến AI tạo sinh',
  canDo:
    'Đi trọn bản đồ Machine Learning: học có giám sát (hồi quy, phân loại), không giám sát (gom cụm, giảm chiều, luật kết hợp), ensemble/tăng cường/các kiểu học lai, tới học sâu và AI tạo sinh — mọi thuật toán lõi TỰ CÀI bằng Python thuần để hiểu ruột, không chỉ gọi thư viện. Dành cho người đã biết Python căn bản, muốn hiểu học máy từ gốc trước khi đi chuyên sâu.',
  duration: '4–6 tuần, nên biết Python căn bản trước (biến, hàm, vòng lặp, list)',
  prerequisites: [],
  chapters: [
    {
      id: 'ml-c1',
      title: 'Bản đồ ML & Học có giám sát',
      summary:
        'Học máy là gì so với luật viết tay, tự cài hồi quy tuyến tính và phân loại k-NN, chia train/test và đo accuracy đúng cách, nhận diện overfitting qua cặp sai số train/test.',
      lessonIds: ['ml-u1-l1', 'ml-u1-l2', 'ml-u1-l3', 'ml-u1-l4', 'ml-u1-l5'],
    },
    {
      id: 'ml-c2',
      title: 'Học không giám sát',
      summary:
        'Tự cài k-means gom cụm khách hàng, chuẩn hoá dữ liệu trước khi đo khoảng cách, trực giác giảm chiều (PCA) và luật kết hợp (Apriori), DBSCAN cho cụm hình dạng bất kỳ.',
      lessonIds: ['ml-u2-l1', 'ml-u2-l2', 'ml-u2-l3', 'ml-u2-l4', 'ml-u2-l5'],
    },
    {
      id: 'ml-c3',
      title: 'Ensemble, RL & các kiểu học lai',
      summary:
        'Bagging/random forest bỏ phiếu đa số, ý tưởng boosting tăng trọng số ca sai, hard vs soft voting, tự cài một bước Q-learning, pseudo-labeling khi thiếu nhãn.',
      lessonIds: ['ml-u3-l1', 'ml-u3-l2', 'ml-u3-l3', 'ml-u3-l4', 'ml-u3-l5'],
    },
    {
      id: 'ml-c4',
      title: 'Học sâu & AI tạo sinh',
      summary:
        'Forward pass của nơ-ron, tự cài gradient descent, convolution 1D, mô hình ngôn ngữ bigram (hạt giống của LLM), Naive Bayes — tổng kết bản đồ và lối đi tiếp sang hướng chuyên sâu AI.',
      lessonIds: ['ml-u4-l1', 'ml-u4-l2', 'ml-u4-l3', 'ml-u4-l4', 'ml-u4-l5'],
    },
  ],
}

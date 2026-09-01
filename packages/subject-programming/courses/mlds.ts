// courses/mlds.ts — Khoá ngắn "Machine Learning & Data Science", khoá 03 của cụm 6 khoá
// "Kỹ sư AI thực chiến" (docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md §03c; nội dung bài
// soạn đầy đủ ở docs/specs/2026-09-01-mlds-bai-hoc-chi-tiet.md).
//
// Luật số 1 của tầng khoá ngắn được áp ở đây một cách rõ rệt nhất trong toàn dự án: hai chương
// đầu THAM CHIẾU nguyên 10 bài của khoá `ml` bằng lessonIds, không nhúng và không sao chép.
// Sửa nội dung bản đồ ML thì sửa ở lessons/mlu1.ts + mlu2.ts, khoá này tự hưởng theo.
import type { ShortCourse } from './types.js'

export const MLDS_COURSE: ShortCourse = {
  id: 'mlds',
  title: 'Machine Learning & Data Science',
  canDo:
    'Đi trọn pipeline dữ liệu thật: làm sạch → khám phá → tạo đặc trưng → train và đánh giá mô hình, rồi làm 7 project nhỏ phủ hồi quy, phân loại, gom cụm, NLP, ảnh, chuỗi thời gian và hệ gợi ý — tự cài lõi bằng Python thuần, đọc được code sklearn tương ứng. Biết chọn thước đo theo cái giá của lỗi và nhận ra rò rỉ dữ liệu trước khi nó phá hỏng kết quả.',
  duration: '5–7 tuần, mỗi bài một buổi ngắn',
  prerequisites: ['Khoá Toán Thiết Yếu cho AI (mathai)', 'Khoá Python / AI Cơ Bản (pyai)'],
  chapters: [
    {
      id: 'mlds-c1',
      title: 'Bản đồ ML & học có giám sát',
      summary:
        'Dùng lại nền của khoá "Học máy": học máy khác luật viết tay ra sao, tự cài hồi quy tuyến tính và k-NN, chia train/test đo accuracy đúng cách, nhận diện overfitting.',
      lessonIds: ['ml-u1-l1', 'ml-u1-l2', 'ml-u1-l3', 'ml-u1-l4', 'ml-u1-l5'],
    },
    {
      id: 'mlds-c2',
      title: 'Học không giám sát',
      summary:
        'Cũng từ khoá "Học máy": k-means gom cụm khách hàng, chuẩn hoá trước khi đo khoảng cách, trực giác giảm chiều và luật kết hợp, DBSCAN cho cụm hình dạng bất kỳ.',
      lessonIds: ['ml-u2-l1', 'ml-u2-l2', 'ml-u2-l3', 'ml-u2-l4', 'ml-u2-l5'],
    },
    {
      id: 'mlds-c3',
      title: 'Data Science thực chiến',
      summary:
        'Bốn kỹ năng mà dữ liệu thật đòi hỏi nhưng dữ liệu bài tập không dạy: làm sạch (thiếu, trùng, ngoại lai bằng IQR), khám phá bằng group-by, tạo đặc trưng và chống rò rỉ dữ liệu, đánh giá bằng precision/recall/F1 thay vì accuracy.',
      lessonIds: ['mlds-u1-l1', 'mlds-u1-l2', 'mlds-u1-l3', 'mlds-u1-l4'],
    },
    {
      id: 'mlds-c4',
      title: 'Bảy project nhỏ',
      summary:
        'Bốn project trên dữ liệu bảng và văn bản (giá nhà, duyệt khoản vay, phân cụm khách hàng, lọc thư rác Naive Bayes) rồi ba project trên dữ liệu có cấu trúc riêng (ảnh 5×5, chuỗi thời gian, hệ gợi ý) — mỗi bài một project trọn gói, dữ liệu nhúng sẵn.',
      lessonIds: [
        'mlds-u2-l1',
        'mlds-u2-l2',
        'mlds-u2-l3',
        'mlds-u2-l4',
        'mlds-u3-l1',
        'mlds-u3-l2',
        'mlds-u3-l3',
      ],
    },
  ],
}

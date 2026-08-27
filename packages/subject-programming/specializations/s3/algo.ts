// s3/algo.ts — Chi tiết chặng S3 hướng THUẬT TOÁN: quy hoạch động và kỹ thuật nâng cao.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ALGO_S3_DETAIL: SpecStageDetail = {
  stageId: 'algo-s3',
  entryGate: [
    'Giải được ổn định các bài cấu trúc dữ liệu cơ bản và đồ thị (BFS/DFS/Dijkstra) trong giới hạn thời gian.',
    'Tự ước lượng được độ phức tạp trước khi gõ code, và ước lượng đúng phần lớn.',
    'Có thói quen viết bộ sinh dữ liệu ngẫu nhiên để tự kiểm bài giải.',
  ],
  moduleDrills: [
    {
      moduleId: 'algo-s3-m1',
      drill:
        'Giải 20 bài quy hoạch động thuộc 4 họ khác nhau, mỗi bài viết rõ trạng thái và công thức chuyển TRƯỚC khi gõ code.',
      evidence: '20 bài chấp nhận (AC) + 20 ghi chú trạng thái/chuyển, mỗi ghi chú ≤ 5 dòng.',
    },
    {
      moduleId: 'algo-s3-m2',
      drill:
        'Cài KMP, Z-function và Aho-Corasick từ đầu, mỗi cài đặt kiểm bằng đối chứng vét cạn trên 10.000 ca ngẫu nhiên.',
      evidence: '3 cài đặt × 10.000 ca ngẫu nhiên khớp 100% với bản vét cạn.',
    },
    {
      moduleId: 'algo-s3-m3',
      drill:
        'Giải 10 bài số học mô-đun / tổ hợp / hình học, trong đó ≥ 3 bài phải tránh tràn số và sai số thực.',
      evidence: '10 bài AC, kèm ghi chú 3 chỗ suýt tràn số hoặc sai số và cách xử lý.',
    },
    {
      moduleId: 'algo-s3-m4',
      drill:
        'Cài cây phân đoạn có cập nhật lười và dùng nó giải ≥ 5 bài truy vấn khoảng khác nhau.',
      evidence:
        '5 bài AC dùng chung 1 bản cài đặt, mỗi truy vấn O(log n) chứng minh bằng số đo thời gian.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Nhật ký thi đấu',
      pass: '≥ 10 kỳ thi, mỗi kỳ ghi rõ sai ở đâu và thiếu kiến thức gì.',
      fail: 'Chỉ lưu điểm số, không rút ra được gì.',
    },
    {
      criterion: 'Giải lại bài không làm được',
      pass: '100% bài chưa giải được trong kỳ thi được giải lại trong 7 ngày, có ghi chú.',
      fail: 'Bài khó bỏ qua, kỳ sau gặp lại vẫn không làm được.',
    },
    {
      criterion: 'Tiến bộ đo được',
      pass: 'Xếp hạng hoặc số bài giải được trong 2 giờ tăng ≥ 30% sau 3 tháng.',
      fail: 'Làm nhiều bài dễ, mức độ không nhích lên.',
    },
    {
      criterion: 'Tự kiểm trước khi nộp',
      pass: '≥ 80% bài có bộ sinh ngẫu nhiên đối chứng trước khi nộp.',
      fail: 'Nộp mò, dựa vào phản hồi của hệ thống chấm để dò lỗi.',
    },
  ],
  pitfalls: [
    'Học thuộc bài giải mẫu thay vì luyện cách NHẬN RA dạng bài.',
    'Chỉ làm bài trong vùng dễ chịu — số bài tăng nhưng năng lực đứng yên.',
    'Bỏ qua ca biên (n = 0, một phần tử, tràn số) rồi mất điểm ở đúng chỗ đó.',
  ],
  exitSignals: [
    'Đọc đề xong bạn phát biểu được trạng thái quy hoạch động trước khi gõ dòng nào.',
    'Bạn tự bắt lỗi bằng bộ sinh ngẫu nhiên thay vì chờ hệ thống chấm báo sai.',
    'Bạn nhận ra bài nào là biến thể của bài đã gặp, kèm tên kỹ thuật.',
    'Bạn ước lượng độ phức tạp trước và số đo thực tế khớp với ước lượng.',
  ],
  nextStagePrep:
    'S4 là dùng thuật toán ở công việc thật: chuẩn bị một bài toán tối ưu có ràng buộc trong hệ thống bạn đang làm.',
}

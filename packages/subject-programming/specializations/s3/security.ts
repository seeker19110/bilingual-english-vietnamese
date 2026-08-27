// s3/security.ts — Chi tiết chặng S3 hướng BẢO MẬT: tấn công chuyên sâu.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SECURITY_S3_DETAIL: SpecStageDetail = {
  stageId: 'security-s3',
  entryGate: [
    'Có môi trường cách ly (máy ảo, mạng riêng) và cam kết chỉ thử trên hệ thống mình được phép.',
    'Đã tìm và báo cáo ít nhất 1 lỗi ứng dụng web trong phòng lab hợp pháp.',
    'Đọc và sửa được C ở mức hiểu con trỏ và bố cục bộ nhớ.',
  ],
  moduleDrills: [
    {
      moduleId: 'security-s3-m1',
      drill:
        'Dịch ngược 1 nhị phân nhỏ trong máy ảo cách ly và vẽ lại luồng điều khiển của hàm chính.',
      evidence: 'Sơ đồ luồng ≥ 10 khối khớp với mã nguồn gốc khi đối chiếu lại.',
    },
    {
      moduleId: 'security-s3-m2',
      drill:
        'Tái hiện 1 lỗi bộ nhớ kinh điển trong bài lab, rồi viết lại đúng chương trình đó bằng ngôn ngữ an toàn bộ nhớ.',
      evidence: 'Bản C sập 10/10 lần với đầu vào thử; bản viết lại 0/10 lần.',
    },
    {
      moduleId: 'security-s3-m3',
      drill:
        'Chạy fuzzer theo độ phủ ≥ 24 giờ trên 1 thư viện mã nguồn mở và tối giản ca lỗi tìm được.',
      evidence: 'Độ phủ đạt ≥ 60% nhánh; ca lỗi tối giản còn ≤ 100 byte.',
    },
    {
      moduleId: 'security-s3-m4',
      drill:
        'Rà chuỗi cung ứng của 1 dự án thật: khoá phiên bản phụ thuộc, kiểm chữ ký, và thử một bài tiêm lệnh vào tính năng AI.',
      evidence: 'Báo cáo ≥ 3 rủi ro chuỗi cung ứng kèm bản vá đề xuất + 1 ca tiêm lệnh chặn được.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Lỗi tái hiện được',
      pass: '≥ 1 lỗi tái hiện 10/10 lần bằng ca tối giản, kèm hướng dẫn dựng môi trường.',
      fail: '"Thấy nó sập một lần" mà không dựng lại được.',
    },
    {
      criterion: 'Công bố có trách nhiệm',
      pass: 'Báo qua đúng kênh của dự án trong ≤ 72 giờ kể từ lúc tái hiện được, và chờ đủ thời hạn công bố đã cam kết (thường 90 ngày).',
      fail: 'Đăng chi tiết khai thác công khai trước khi có bản vá.',
    },
    {
      criterion: 'Kèm bản vá hoặc test hồi quy',
      pass: '≥ 1 bản vá hoặc test hồi quy đỏ trước khi vá, xanh sau khi vá.',
      fail: 'Chỉ nộp báo cáo, không giúp bên kia sửa được.',
    },
    {
      criterion: 'Phạm vi được phép',
      pass: '100% mục tiêu thử nằm trong phạm vi cho phép, có văn bản chứng minh.',
      fail: 'Thử lên hệ thống chưa được phép — đây là ranh giới pháp lý, không phải kỹ thuật.',
    },
  ],
  pitfalls: [
    'Say mê kỹ thuật khai thác mà quên biện pháp gốc rễ: ngôn ngữ an toàn bộ nhớ và thiết kế tối thiểu quyền.',
    'Chạy fuzzer lâu nhưng không đo độ phủ — chạy nhiều giờ mà chỉ quét đi quét lại một nhánh.',
    'Thử ngoài phạm vi cho phép; hậu quả pháp lý lớn hơn mọi lợi ích học tập.',
  ],
  exitSignals: [
    'Bạn hỏi "phạm vi cho phép tới đâu" trước khi hỏi "tấn công thế nào".',
    'Báo cáo của bạn được bên nhận vá ngay vì đủ thông tin tái hiện.',
    'Bạn đề xuất biện pháp gốc rễ, không chỉ vá từng ca khai thác.',
    'Bạn tự viết được luật phân tích tĩnh để cùng lớp lỗi đó không quay lại.',
  ],
  nextStagePrep:
    'S4 là phòng thủ ở quy mô tổ chức: chuẩn bị một hệ thống thật để luyện mô hình hoá mối đe doạ và ứng cứu sự cố.',
}

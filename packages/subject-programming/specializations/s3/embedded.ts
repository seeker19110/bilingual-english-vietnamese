// s3/embedded.ts — Chi tiết chặng S3 hướng NHÚNG: tin cậy và Linux nhúng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const EMBEDDED_S3_DETAIL: SpecStageDetail = {
  stageId: 'embedded-s3',
  entryGate: [
    'Đã làm 1 thiết bị chạy liên tục ≥ 24 giờ mà không treo.',
    'Đọc được sơ đồ chân và dùng được máy hiện sóng hoặc bộ phân tích logic để soi tín hiệu.',
    'Có ít nhất 2 bo mạch giống nhau để một bo dành riêng cho thử nghiệm tự động.',
  ],
  moduleDrills: [
    {
      moduleId: 'embedded-s3-m1',
      drill:
        'Gắn watchdog và cơ chế lưu trạng thái bền, rồi cắt điện đột ngột 100 lần để xem dữ liệu có hỏng không.',
      evidence: '100/100 lần cắt điện: thiết bị tự khởi động lại và dữ liệu còn nguyên vẹn.',
    },
    {
      moduleId: 'embedded-s3-m2',
      drill:
        'Tách lớp trừu tượng phần cứng để chạy được logic trên máy chủ, rồi nối 1 bo thật vào CI.',
      evidence:
        '≥ 30 test chạy trên máy chủ trong ≤ 60 giây + ≥ 5 test chạy trên bo thật mỗi lần đẩy mã.',
    },
    {
      moduleId: 'embedded-s3-m3',
      drill: 'Dựng ảnh Linux nhúng tối giản với hệ thống tệp chỉ đọc và đo thời gian khởi động.',
      evidence: 'Thời gian từ cấp điện tới sẵn sàng ≤ 10 giây, ảnh hệ thống ≤ 64 MB.',
    },
    {
      moduleId: 'embedded-s3-m4',
      drill:
        'Viết lại một trình điều khiển ngoại vi nhỏ bằng Rust no_std và so sánh với bản C về kích thước và an toàn.',
      evidence:
        'Bảng so sánh kích thước mã (byte) + danh sách ≥ 2 lớp lỗi mà bản Rust loại bỏ được.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Chạy trường kỳ',
      pass: '30 ngày liên tục không can thiệp, có nhật ký ghi thời gian hoạt động liên tục.',
      fail: 'Chạy 3 ngày rồi kết luận ổn định.',
    },
    {
      criterion: 'CI trên phần cứng thật',
      pass: '100% lần đẩy mã chạy test trên bo thật, kết quả lưu lại được.',
      fail: 'Chỉ chạy test trên máy tính, bo thật kiểm bằng tay khi nhớ ra.',
    },
    {
      criterion: 'Chịu mất điện',
      pass: '100 lần cắt điện đột ngột: 0 lần hỏng dữ liệu, 0 lần không khởi động lại được.',
      fail: 'Thử 5 lần và không có kịch bản tự động.',
    },
    {
      criterion: 'Bộ nhớ tất định',
      pass: 'Không cấp phát động sau khi khởi tạo; mức dùng RAM đỉnh đo được và còn dư ≥ 20%.',
      fail: 'Cấp phát trong vòng lặp chính, chạy vài ngày là phân mảnh.',
    },
  ],
  pitfalls: [
    'Kết luận ổn định từ vài giờ chạy thử; lỗi nhúng thường xuất hiện sau nhiều ngày.',
    'Bỏ qua nhiệt độ và nhiễu — phòng máy lạnh chạy tốt, ngoài trời thì không.',
    'Cập nhật phần mềm không có đường lui: một bản lỗi là phải mang thiết bị về.',
  ],
  exitSignals: [
    'Bạn thiết kế mọi thao tác ghi sao cho mất điện giữa chừng vẫn an toàn.',
    'Bạn có kịch bản tự động cắt điện, không thử bằng tay.',
    'Bạn biết mức RAM đỉnh của thiết bị bằng số, không bằng ước lượng.',
    'Bạn cập nhật được phần mềm từ xa và luôn quay lui được bản trước.',
  ],
  nextStagePrep:
    'S4 là sản xuất hàng loạt: chuẩn bị bài toán hiệu chuẩn từng thiết bị và cập nhật từ xa cho ≥ 10 thiết bị.',
}

// s3/devops.ts — Chi tiết chặng S3 hướng DEVOPS: Kubernetes và quan sát.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DEVOPS_S3_DETAIL: SpecStageDetail = {
  stageId: 'devops-s3',
  entryGate: [
    'Đã đóng gói được 1 ứng dụng thành container và tự dựng lại môi trường bằng hạ tầng dạng mã.',
    'Đã có 1 CI chạy đủ cổng và tự triển khai được lên môi trường thử.',
    'Biết đọc log và số liệu của dịch vụ đang chạy mà không cần SSH vào máy.',
  ],
  moduleDrills: [
    {
      moduleId: 'devops-s3-m1',
      drill:
        'Triển khai 1 dịch vụ lên cụm với giới hạn tài nguyên và thăm dò sống/sẵn sàng, rồi ép nó vượt giới hạn để xem hệ thống xử lý ra sao.',
      evidence:
        'Nhật ký cho thấy pod bị khởi động lại đúng như thiết kế, thời gian gián đoạn ≤ 30 giây.',
    },
    {
      moduleId: 'devops-s3-m2',
      drill:
        'Chuyển toàn bộ cấu hình sang GitOps: sửa cụm bằng cách gửi thay đổi vào Git, không gõ lệnh tay lên môi trường thật.',
      evidence: 'Nhật ký kiểm toán 7 ngày: 100% thay đổi cụm có commit tương ứng.',
    },
    {
      moduleId: 'devops-s3-m3',
      drill:
        'Dựng biểu đồ 4 chỉ số vàng (độ trễ, lưu lượng, lỗi, bão hoà) rồi tắt cảnh báo nào không dẫn tới hành động.',
      evidence: 'Số cảnh báo nhiễu giảm ≥ 50%; ≥ 5 cảnh báo còn lại đều có sổ tay xử lý.',
    },
    {
      moduleId: 'devops-s3-m4',
      drill:
        'Chạy một bài chaos có kiểm soát: giết 1 node vào giờ thấp điểm và bấm giờ tới lúc hệ thống tự phục hồi.',
      evidence: 'Thời gian tự phục hồi ≤ 5 phút, kèm biên bản: đã cảnh báo gì, ai thấy, làm gì.',
    },
  ],
  projectRubric: [
    {
      criterion: 'Mọi thay đổi qua Git',
      pass: '100% thay đổi cụm 7 ngày gần nhất truy được về commit.',
      fail: 'Có ít nhất một lần sửa tay "cho nhanh" lên môi trường thật.',
    },
    {
      criterion: 'Cảnh báo có ích',
      pass: '≥ 5 cảnh báo theo triệu chứng người dùng, mỗi cảnh báo 1 sổ tay xử lý ≤ 1 trang.',
      fail: 'Cảnh báo theo CPU, nổ suốt ngày, không ai đọc nữa.',
    },
    {
      criterion: 'Tự phục hồi',
      pass: 'Giết 1 node: dịch vụ trở lại bình thường trong ≤ 5 phút, không cần can thiệp tay.',
      fail: 'Phải người trực vào bấm mới sống lại.',
    },
    {
      criterion: 'Bí mật không nằm trong Git',
      pass: '0 bí mật trong kho mã, kiểm bằng công cụ quét tự động chạy trong CI.',
      fail: 'Token nằm trong file cấu hình đã đẩy lên.',
    },
  ],
  pitfalls: [
    'Đưa Kubernetes vào khi chỉ có 2 dịch vụ — chi phí vận hành lớn hơn lợi ích.',
    'Cảnh báo theo nguyên nhân (CPU cao) thay vì theo triệu chứng (người dùng chờ lâu).',
    'Bảng điều khiển đẹp mà không ai nhìn; thứ cần là cảnh báo dẫn tới hành động.',
  ],
  exitSignals: [
    'Cụm hỏng thì bạn khôi phục bằng cách khôi phục Git, không mò lệnh.',
    'Mỗi cảnh báo nổ ra bạn biết ngay mở sổ tay nào.',
    'Bạn dùng error budget để quyết định làm tính năng hay trả nợ độ tin cậy.',
    'Người mới vào đội triển khai được lần đầu trong ngày đầu, chỉ theo tài liệu.',
  ],
  nextStagePrep:
    'S4 là nền tảng cho nhiều đội: chuẩn bị bài toán nhiều môi trường và nhiều nhóm dùng chung hạ tầng.',
}

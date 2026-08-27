// s3/backend.ts — Chi tiết chặng S3 hướng BACKEND: hệ phân tán.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const BACKEND_S3_DETAIL: SpecStageDetail = {
  stageId: 'backend-s3',
  entryGate: [
    'Đã có 1 API chạy thật với CSDL quan hệ, có giao dịch (transaction) và di trú schema có phiên bản.',
    'Đo được p95 của endpoint chính bằng công cụ tải, không đoán bằng cảm giác.',
    'Giải thích được vì sao một endpoint ghi phải idempotent, kèm ví dụ hỏng thật.',
  ],
  moduleDrills: [
    {
      moduleId: 'backend-s3-m1',
      drill:
        'Dựng 2 tiến trình cùng ghi một bản ghi rồi tạo ra tình huống mất cập nhật, sau đó sửa bằng khoá lạc quan.',
      evidence: 'Kịch bản tái hiện lỗi 10/10 lần trước khi sửa, 0/10 lần sau khi sửa.',
    },
    {
      moduleId: 'backend-s3-m2',
      drill:
        'Thêm outbox cho một sự kiện nghiệp vụ: ghi CSDL và phát sự kiện phải cùng sống cùng chết.',
      evidence:
        'Giết tiến trình giữa 2 bước 20 lần — 0 sự kiện mất, 0 sự kiện phát 2 lần gây tác dụng phụ.',
    },
    {
      moduleId: 'backend-s3-m3',
      drill:
        'Bọc mọi lời gọi ra ngoài bằng timeout + retry có jitter + circuit breaker, rồi cố ý làm dịch vụ phụ thuộc treo.',
      evidence:
        'Khi dịch vụ phụ trợ treo 60 giây: API chính vẫn trả lời trong ≤ 1s ở chế độ suy giảm.',
    },
    {
      moduleId: 'backend-s3-m4',
      drill:
        'Gắn trace phân tán vào 1 luồng nghiệp vụ đi qua ≥ 3 dịch vụ và định nghĩa 2 SLI kèm SLO.',
      evidence: 'Ảnh chụp 1 trace đủ ≥ 3 span nối liền + 2 SLO ghi thành số (ví dụ 99,5%/30 ngày).',
    },
  ],
  projectRubric: [
    {
      criterion: 'Ranh giới dịch vụ có lý do',
      pass: 'Mỗi dịch vụ tách ra kèm 1 lý do viết ra được (dữ liệu riêng, nhịp thay đổi riêng, đội riêng); tối đa 4 dịch vụ ở đợt đầu.',
      fail: 'Tách theo tầng kỹ thuật, mỗi thao tác người dùng phải gọi 5 dịch vụ.',
    },
    {
      criterion: 'Không mất sự kiện',
      pass: 'Chạy 1.000 giao dịch có ngắt ngẫu nhiên: 0 sự kiện mất, số liệu hai bên khớp 100%.',
      fail: 'Sự kiện phát trước khi commit, ngắt điện là lệch dữ liệu.',
    },
    {
      criterion: 'Suy giảm thay vì sập',
      pass: 'Giết 1 dịch vụ bất kỳ: luồng chính vẫn phục vụ được ≥ 80% chức năng, có thông báo rõ cho người dùng.',
      fail: 'Một dịch vụ chết kéo toàn hệ thống trả 500.',
    },
    {
      criterion: 'Quan sát được',
      pass: 'Truy được 1 đơn hàng qua đủ các dịch vụ trong ≤ 2 phút bằng 1 id duy nhất.',
      fail: 'Phải SSH vào từng máy đọc log mới lần ra.',
    },
  ],
  pitfalls: [
    'Tách microservice khi chưa có đội thứ hai — trả giá vận hành mà không nhận lợi ích tổ chức.',
    'Retry mù không có jitter và không idempotent: một sự cố nhỏ thành bão retry.',
    'Tin vào đồng hồ máy chủ để sắp thứ tự sự kiện.',
  ],
  exitSignals: [
    'Khi mất kết nối, bạn hỏi "mất hay chỉ chậm?" trước khi quyết định retry.',
    'Đọc biểu đồ SLO xong quyết được nên làm tính năng mới hay đi trả nợ độ tin cậy.',
    'Thiết kế nào của bạn cũng nói rõ được: sự kiện này ít nhất một lần hay đúng một lần.',
    'Điều tra sự cố bắt đầu từ triệu chứng người dùng, không phải từ log ngẫu nhiên.',
  ],
  nextStagePrep:
    'S4 là quy mô lớn và chi phí: chuẩn bị một tập dữ liệu đủ lớn để phân mảnh thật sự cần thiết, thay vì mô phỏng.',
}

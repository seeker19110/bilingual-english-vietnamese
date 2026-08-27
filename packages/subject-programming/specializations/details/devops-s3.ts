// details/devops-s3.ts — Chi tiết chặng S3 hướng DEVOPS ("Kubernetes và quan sát").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DEVOPS_S3_DETAIL: SpecStageDetail = {
  stageId: 'devops-s3',
  modules: [
    {
      moduleId: 'devops-s3-m1',
      objective:
        'Vận hành được dịch vụ trên cụm container với giới hạn tài nguyên và thăm dò sức khoẻ đặt đúng.',
      practice: [
        'Triển khai một dịch vụ kèm giới hạn tài nguyên, thăm dò sống và thăm dò sẵn sàng.',
        'Ép dịch vụ vượt giới hạn bộ nhớ để xem cụm xử lý ra sao và mất bao lâu để trở lại.',
        'Bật tự mở rộng theo tải rồi tạo tải giả để quan sát số bản chạy thay đổi.',
      ],
      selfCheck: [
        {
          q: 'Thăm dò sống khác thăm dò sẵn sàng ở chỗ nào?',
          a: 'Sống hỏng thì khởi động lại tiến trình; sẵn sàng hỏng thì chỉ ngừng gửi lưu lượng tới bản đó.',
        },
        {
          q: 'Vì sao phải đặt giới hạn tài nguyên cho mọi dịch vụ?',
          a: 'Một dịch vụ ngốn hết bộ nhớ sẽ kéo các dịch vụ khác trên cùng máy chết theo.',
        },
      ],
      doneSignals: [
        'Bạn giải thích được vì sao một bản chạy bị khởi động lại, dựa trên sự kiện của cụm.',
        'Mọi dịch vụ trên cụm đều có giới hạn tài nguyên và thăm dò sức khoẻ.',
      ],
    },
    {
      moduleId: 'devops-s3-m2',
      objective:
        'Đưa toàn bộ cấu hình và bí mật vào quy trình có kiểm soát, để trạng thái mong muốn luôn nằm trong kho mã.',
      practice: [
        'Chuyển cấu hình cụm sang mô hình khai báo, sửa cụm bằng cách gửi thay đổi vào kho mã.',
        'Chuyển bí mật sang nơi quản lý riêng, kho mã chỉ giữ tham chiếu chứ không giữ giá trị.',
        'Dựng ba môi trường dùng chung một bộ khuôn với phần khác nhau tách riêng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao sửa tay lên môi trường thật là nợ kỹ thuật ngay lập tức?',
          a: 'Trạng thái thật lệch khỏi kho mã, lần triển khai sau sẽ ghi đè và không ai hiểu vì sao hỏng.',
        },
        {
          q: 'Bí mật nằm trong kho mã có nguy hiểm không nếu kho là riêng tư?',
          a: 'Có: lịch sử git giữ mãi, nhiều người truy cập, và bản sao lan ra máy cá nhân.',
        },
      ],
      doneSignals: [
        'Mọi thay đổi cụm trong tuần vừa qua đều truy được về một commit.',
        'Không có bí mật nào nằm trong kho mã, có công cụ quét canh việc đó.',
      ],
    },
    {
      moduleId: 'devops-s3-m3',
      objective:
        'Dựng được hệ quan sát đủ để phát hiện sự cố theo triệu chứng người dùng và loại bỏ cảnh báo nhiễu.',
      practice: [
        'Dựng biểu đồ bốn chỉ số vàng: độ trễ, lưu lượng, tỉ lệ lỗi và mức bão hoà.',
        'Rà lại toàn bộ cảnh báo hiện có và tắt những cảnh báo không dẫn tới hành động nào.',
        'Nối log và trace bằng một mã định danh chung để điều tra không phải mò từng máy.',
      ],
      selfCheck: [
        {
          q: 'Cảnh báo tốt phải trả lời được câu hỏi nào?',
          a: 'Ai đang khổ và tôi phải làm gì ngay bây giờ; nếu không trả lời được thì đó là nhiễu.',
        },
        {
          q: 'Vì sao bảng điều khiển đẹp không thay được cảnh báo?',
          a: 'Không ai ngồi nhìn bảng lúc nửa đêm; chỉ cảnh báo mới chủ động gọi người.',
        },
      ],
      doneSignals: [
        'Số cảnh báo nổ mỗi tuần giảm rõ mà thời gian phát hiện sự cố không tăng.',
        'Mỗi cảnh báo còn lại đều có sổ tay xử lý ngắn kèm theo.',
      ],
    },
    {
      moduleId: 'devops-s3-m4',
      objective:
        'Dùng mục tiêu chất lượng dịch vụ và ngân sách lỗi để quyết định công việc, thay vì quyết theo cảm tính.',
      practice: [
        'Định nghĩa mục tiêu chất lượng cho dịch vụ chính và tính ngân sách lỗi tương ứng.',
        'Chạy một bài chaos có kiểm soát vào giờ thấp điểm và bấm giờ tới lúc hệ thống tự phục hồi.',
        'Viết sổ tay trực: ai gọi ai, việc đầu tiên làm gì, khi nào leo thang.',
      ],
      selfCheck: [
        {
          q: 'Hết ngân sách lỗi thì đội nên làm gì?',
          a: 'Dừng phát hành tính năng mới và dồn sức vào việc làm hệ thống ổn định trở lại.',
        },
        {
          q: 'Bài chaos nên bắt đầu ở đâu?',
          a: 'Ở môi trường thử hoặc giờ thấp điểm, với phạm vi nhỏ và có nút dừng chuẩn bị sẵn.',
        },
      ],
      doneSignals: [
        'Bạn dùng số liệu ngân sách lỗi khi bàn thứ tự ưu tiên công việc.',
        'Đội có sổ tay xử lý cho từng cảnh báo và đã diễn tập ít nhất một lần.',
      ],
    },
  ],
  rubric: [
    {
      id: 'devops-s3-r1',
      text: 'Toàn bộ thay đổi cụm trong bảy ngày gần nhất đều truy được về commit, không có lần sửa tay nào.',
      howToProve:
        'Đối chiếu nhật ký kiểm toán của cụm với lịch sử kho mã trong cùng khoảng thời gian.',
    },
    {
      id: 'devops-s3-r2',
      text: 'Có ít nhất 5 cảnh báo theo triệu chứng người dùng, mỗi cảnh báo kèm sổ tay xử lý không quá một trang.',
      howToProve: 'Nộp danh sách cảnh báo kèm liên kết sổ tay và một lần diễn tập đã chạy.',
    },
    {
      id: 'devops-s3-r3',
      text: 'Giết một node khi đang chạy thì dịch vụ trở lại bình thường trong vòng 5 phút mà không cần can thiệp tay.',
      howToProve:
        'Ghi lại bài chaos: thời điểm giết, biểu đồ hồi phục, thời gian trở lại bình thường.',
    },
    {
      id: 'devops-s3-r4',
      text: 'Không có bí mật nào nằm trong kho mã, có công cụ quét tự động canh việc này trong CI.',
      howToProve:
        'Chạy công cụ quét bí mật trong CI và cho thấy nó đỏ khi cố tình thêm một khoá giả.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Đưa một dịch vụ thật lên cụm có giám sát và cảnh báo đầy đủ.',
      'Chuyển cấu hình sang mô hình khai báo với trạng thái mong muốn nằm trong kho mã.',
    ],
    scopeDont: [
      'Không đưa toàn bộ hệ thống lên cụm trong một đợt, vì rủi ro dồn cục và khó tìm nguyên nhân khi hỏng.',
      'Không tự dựng hệ quan sát riêng khi công cụ sẵn có đã đủ dùng.',
    ],
    touchpoints: [
      'Kho mã chứa khai báo hạ tầng và khuôn cấu hình theo môi trường.',
      'Nơi định nghĩa cảnh báo và nơi lưu sổ tay xử lý sự cố.',
    ],
    contracts: [
      'Mỗi dịch vụ khai báo rõ tài nguyên tối thiểu và ngưỡng tự mở rộng.',
      'Mọi cảnh báo có mã và liên kết tới sổ tay tương ứng.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với bằng chứng lấy từ hệ thống thật.',
      'Có ít nhất một lần diễn tập sự cố đã chạy và ghi lại kết quả.',
    ],
    invariants: [
      'Không thao tác nào lên môi trường thật đi ngoài quy trình đã chốt.',
      'Dữ liệu bí mật không bao giờ xuất hiện trong log hay trong kho mã.',
    ],
    conventions: [
      'Mọi cấu hình khác nhau giữa các môi trường tách khỏi phần dùng chung.',
      'Thay đổi hạ tầng đi qua đúng quy trình xem xét như thay đổi mã nguồn.',
    ],
  },
}

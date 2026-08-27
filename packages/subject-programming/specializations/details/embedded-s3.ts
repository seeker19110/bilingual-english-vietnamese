// details/embedded-s3.ts — Chi tiết chặng S3 hướng NHÚNG ("Tin cậy và Linux nhúng").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const EMBEDDED_S3_DETAIL: SpecStageDetail = {
  stageId: 'embedded-s3',
  modules: [
    {
      moduleId: 'embedded-s3-m1',
      objective:
        'Thiết kế thiết bị tự phục hồi sau lỗi và giữ được dữ liệu nguyên vẹn qua những lần mất điện đột ngột.',
      practice: [
        'Gắn watchdog và thử làm treo phần mềm để xem thiết bị có tự khởi động lại đúng không.',
        'Lưu trạng thái bền theo cách ghi rồi mới đổi con trỏ, sau đó cắt điện giữa chừng để kiểm.',
        'Bỏ cấp phát động sau khi khởi tạo và đo mức bộ nhớ đỉnh còn dư bao nhiêu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao nhiều hệ nhúng cấm cấp phát động sau khởi tạo?',
          a: 'Chạy dài ngày sẽ phân mảnh bộ nhớ và có lúc cấp phát thất bại ở chỗ không có đường xử lý.',
        },
        {
          q: 'Ghi dữ liệu an toàn khi có thể mất điện bất kỳ lúc nào bằng cách nào?',
          a: 'Ghi bản mới ra chỗ khác rồi mới đổi con trỏ, để mất điện giữa chừng vẫn còn bản cũ nguyên vẹn.',
        },
      ],
      doneSignals: [
        'Thiết bị của bạn tự trở lại hoạt động sau lỗi mà không cần ai chạm vào.',
        'Bạn nói được mức bộ nhớ đỉnh bằng con số, không bằng ước lượng.',
      ],
    },
    {
      moduleId: 'embedded-s3-m2',
      objective:
        'Kiểm thử được phần mềm nhúng bằng máy chủ và bằng bo mạch thật trong quy trình tự động.',
      practice: [
        'Tách lớp trừu tượng phần cứng để chạy logic trên máy chủ với phần cứng giả lập.',
        'Nối một bo mạch thật vào quy trình tích hợp liên tục và chạy vài test trên đó mỗi lần đẩy mã.',
        'Thử thiết bị ở nhiệt độ cao và có rung để xem hành vi có đổi không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao chỉ test trên máy chủ là chưa đủ với hệ nhúng?',
          a: 'Phần cứng thật có thời gian, nhiễu và lỗi ngoại vi mà bản giả lập không tái hiện hết.',
        },
        {
          q: 'Lớp trừu tượng phần cứng mang lại lợi ích gì cho kiểm thử?',
          a: 'Cho phép thay ngoại vi bằng bản giả nên phần lớn logic kiểm được nhanh trên máy chủ.',
        },
      ],
      doneSignals: [
        'Mỗi lần đẩy mã đều có test chạy trên bo mạch thật, không phải kiểm tay khi nhớ ra.',
        'Bạn tách được lỗi do logic và lỗi do phần cứng ngay từ kết quả test.',
      ],
    },
    {
      moduleId: 'embedded-s3-m3',
      objective: 'Dựng được hệ Linux nhúng tối giản khởi động nhanh và an toàn trước mất điện.',
      practice: [
        'Dựng ảnh hệ thống tối giản chỉ gồm phần cần thiết và đo thời gian khởi động.',
        'Đặt hệ thống tệp gốc ở chế độ chỉ đọc, phần ghi tách sang vùng riêng.',
        'Viết một trình điều khiển ở không gian người dùng cho một ngoại vi đơn giản.',
      ],
      selfCheck: [
        {
          q: 'Vì sao hệ thống tệp chỉ đọc lại an toàn hơn cho thiết bị hay mất điện?',
          a: 'Không ghi thì không hỏng cấu trúc tệp, phần ghi được cô lập vào vùng nhỏ dễ khôi phục.',
        },
        {
          q: 'Cây thiết bị mô tả cái gì?',
          a: 'Phần cứng có những ngoại vi nào và nối ở đâu, để cùng một nhân chạy được trên nhiều bo mạch.',
        },
      ],
      doneSignals: [
        'Thiết bị khởi động tới trạng thái sẵn sàng trong thời gian bạn cam kết.',
        'Cắt điện lúc đang chạy không làm hỏng hệ thống tệp.',
      ],
    },
    {
      moduleId: 'embedded-s3-m4',
      objective:
        'Dùng được ngôn ngữ an toàn bộ nhớ trong môi trường không hệ điều hành và biết khi nào C vẫn là lựa chọn đúng.',
      practice: [
        'Viết lại một trình điều khiển ngoại vi nhỏ bằng Rust không dùng thư viện chuẩn.',
        'So kích thước mã và các lớp lỗi bị loại bỏ giữa bản Rust và bản C.',
        'Xử lý một ngắt theo cách an toàn của Rust và đối chiếu với cách làm quen thuộc trong C.',
      ],
      selfCheck: [
        {
          q: 'An toàn bộ nhớ giúp gì cho hệ nhúng chạy dài ngày?',
          a: 'Loại bỏ cả lớp lỗi hỏng bộ nhớ vốn chỉ lộ ra sau nhiều ngày và rất khó tái hiện.',
        },
        {
          q: 'Khi nào C vẫn là lựa chọn hợp lý?',
          a: 'Khi hệ sinh thái nhà sản xuất, thư viện và đội ngũ đều đang ở C, chi phí chuyển lớn hơn lợi ích.',
        },
      ],
      doneSignals: [
        'Bạn chọn ngôn ngữ theo ràng buộc dự án, không theo sở thích.',
        'Mã xử lý ngắt của bạn không dùng dữ liệu chia sẻ thiếu bảo vệ.',
      ],
    },
  ],
  rubric: [
    {
      id: 'embedded-s3-r1',
      text: 'Thiết bị chạy liên tục 30 ngày không cần can thiệp, có nhật ký ghi thời gian hoạt động liên tục.',
      howToProve: 'Nộp nhật ký thời gian hoạt động và số lần khởi động lại trong suốt kỳ chạy.',
    },
    {
      id: 'embedded-s3-r2',
      text: 'Mỗi lần đẩy mã đều chạy test trên bo mạch thật và kết quả được lưu lại xem được về sau.',
      howToProve: 'Dán liên kết ba lần chạy tích hợp liên tục gần nhất có phần test phần cứng.',
    },
    {
      id: 'embedded-s3-r3',
      text: 'Chịu được 100 lần cắt điện đột ngột mà không hỏng dữ liệu và luôn khởi động lại được.',
      howToProve: 'Chạy kịch bản cắt điện tự động 100 lần và dán bảng kết quả từng lần.',
    },
    {
      id: 'embedded-s3-r4',
      text: 'Không cấp phát bộ nhớ động sau khởi tạo, mức bộ nhớ đỉnh đo được và còn dư ít nhất 20%.',
      howToProve: 'Dán số đo bộ nhớ đỉnh trong kỳ chạy dài kèm dung lượng bộ nhớ của thiết bị.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Làm một thiết bị chạy trường kỳ có kiểm thử tự động trên phần cứng thật.',
      'Bảo đảm dữ liệu an toàn qua các lần mất điện đột ngột.',
    ],
    scopeDont: [
      'Không thêm ngoại vi mới trong đợt này, vì mục tiêu là độ tin cậy chứ không phải mở rộng chức năng.',
      'Không cập nhật phần mềm từ xa nếu chưa có đường quay lui bản trước.',
    ],
    touchpoints: [
      'Vòng lặp chính của phần mềm thiết bị và nơi cấu hình watchdog.',
      'Cấu hình ảnh hệ thống và phân vùng lưu trạng thái.',
    ],
    contracts: [
      'Mọi thao tác ghi trạng thái phải an toàn khi bị cắt giữa chừng.',
      'Giao diện với ngoại vi đi qua lớp trừu tượng để thay được bằng bản giả.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với bằng chứng lấy từ thiết bị thật.',
      'Có nhật ký của một kỳ chạy dài liên tục ít nhất 30 ngày.',
    ],
    invariants: [
      'Mất điện bất kỳ lúc nào cũng không được làm hỏng dữ liệu đã ghi.',
      'Thiết bị luôn tự trở lại hoạt động mà không cần thao tác tay.',
    ],
    conventions: [
      'Mọi kết quả đo ghi kèm nhiệt độ môi trường và điện áp cấp nguồn.',
      'Cấu hình theo từng bo mạch tách khỏi phần logic dùng chung.',
    ],
  },
}

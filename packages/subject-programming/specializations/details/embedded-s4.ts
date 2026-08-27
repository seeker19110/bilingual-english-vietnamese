// details/embedded-s4.ts — Chi tiết chặng S4 hướng NHÚNG ("Chuyên gia — sản phẩm phần cứng
// thật"). Bản đồ chặng ở ../embedded.ts.
//
// Điều làm hướng này khác hẳn phần còn lại: sai lầm đi kèm CHI PHÍ VẬT LÝ. Một bản firmware
// hỏng trên nghìn thiết bị ngoài hiện trường không sửa được bằng một lần deploy — có khi phải
// cử người tới tận nơi. Nên toàn chặng xoay quanh: nạp đúng ngay từ xưởng, cập nhật có đường
// lui, và nhìn được sức khoẻ thiết bị khi không cầm nó trong tay.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const EMBEDDED_S4_DETAIL: SpecStageDetail = {
  stageId: 'embedded-s4',
  modules: [
    {
      moduleId: 'embedded-s4-m1',
      objective:
        'Đưa được sản phẩm từ nguyên mẫu sang sản xuất hàng loạt: nạp firmware, hiệu chuẩn và kiểm tra ngay tại xưởng.',
      practice: [
        'Thiết kế quy trình nạp và kiểm tại xưởng cho một thiết bị, bấm giờ mỗi máy mất bao lâu.',
        'Thêm bước hiệu chuẩn ghi tham số riêng của từng máy vào bộ nhớ không xoá.',
        'Đặt quy ước phiên bản gắn phần cứng với firmware, thử ghép sai phiên bản để xem hệ thống có chặn không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải thiết kế cho khả năng kiểm tra ngay từ giai đoạn mạch?',
          a: 'Vì tới lúc sản xuất mới nghĩ tới thì không còn điểm đo, và mỗi máy lỗi sẽ tốn công tháo ra dò tay.',
        },
        {
          q: 'Hiệu chuẩn từng máy giải quyết điều gì?',
          a: 'Sai lệch linh kiện giữa các máy, để phần mềm bù được và mọi máy cho cùng kết quả đo.',
        },
      ],
      doneSignals: [
        'Người ở xưởng nạp và kiểm được thiết bị mà không cần kỹ sư đứng cạnh.',
        'Mỗi thiết bị xuất xưởng có số hiệu, phiên bản phần cứng và firmware tra lại được.',
      ],
    },
    {
      moduleId: 'embedded-s4-m2',
      objective:
        'Bảo vệ thiết bị ngoài tầm tay: định danh bằng khoá lưu trong phần cứng và chỉ chạy firmware đã được ký.',
      practice: [
        'Cấp cho mỗi thiết bị một danh tính riêng, thử nhân bản danh tính đó sang máy khác để xác nhận bị từ chối.',
        'Bật khởi động an toàn và thử nạp một firmware không có chữ ký hợp lệ.',
        'Viết quy trình thu hồi khi một thiết bị bị mất hoặc bị can thiệp vật lý.',
      ],
      selfCheck: [
        {
          q: 'Vì sao khoá chung cho toàn bộ lô thiết bị là thiết kế nguy hiểm?',
          a: 'Lộ một thiết bị là lộ cả lô, và không có cách thu hồi từng máy mà không giết tất cả.',
        },
        {
          q: 'Khởi động an toàn bảo vệ khỏi tình huống nào?',
          a: 'Khỏi việc kẻ tấn công cầm được thiết bị và nạp firmware của họ để chiếm quyền lâu dài.',
        },
      ],
      doneSignals: [
        'Không thiết bị nào chạy được firmware chưa ký.',
        'Bạn thu hồi được đúng một thiết bị mà không ảnh hưởng phần còn lại của đội.',
      ],
    },
    {
      moduleId: 'embedded-s4-m3',
      objective:
        'Vận hành cả đội thiết bị từ xa: nhìn được sức khoẻ, chẩn đoán khi không cầm máy và cập nhật hàng loạt an toàn.',
      practice: [
        'Cho thiết bị báo về các chỉ số sức khoẻ tối thiểu và dựng bảng theo dõi toàn đội.',
        'Chạy một đợt cập nhật từ xa theo từng đợt nhỏ, có điều kiện dừng khi tỉ lệ thiết bị hỏng vượt ngưỡng.',
        'Dựng đường lui tự động: thiết bị không khởi động được bản mới thì quay lại bản cũ sau vài lần thử.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cập nhật từ xa phải có đường lui tự động ngay trên thiết bị?',
          a: 'Vì thiết bị chết không nối mạng được nữa thì không ai đẩy bản sửa xuống được, chỉ còn cách tới tận nơi.',
        },
        {
          q: 'Nên cập nhật cả đội cùng lúc hay theo đợt nhỏ?',
          a: 'Theo đợt nhỏ, để một lỗi chỉ ảnh hưởng vài máy và còn kịp dừng trước khi lan ra cả đội.',
        },
        {
          q: 'Chỉ số nào tối thiểu phải báo về từ mỗi thiết bị?',
          a: 'Phiên bản đang chạy, tình trạng nguồn hoặc pin, số lần khởi động lại và thời điểm liên lạc gần nhất.',
        },
      ],
      doneSignals: [
        'Bạn biết ngay có bao nhiêu thiết bị đang chạy phiên bản nào, không phải đi hỏi.',
        'Một đợt cập nhật hỏng dừng lại được trước khi lan ra toàn đội.',
      ],
    },
    {
      moduleId: 'embedded-s4-m4',
      objective:
        'Đáp ứng được yêu cầu chuẩn và an toàn của sản phẩm phần cứng, kèm tài liệu kỹ thuật đủ cho nơi sản xuất.',
      practice: [
        'Tìm hiểu chuẩn phát xạ điện từ áp dụng cho loại sản phẩm của bạn và liệt kê thứ phải thử.',
        'Phân tích một tình huống hỏng nguy hiểm và thiết kế cơ chế đưa thiết bị về trạng thái an toàn.',
        'Soạn bộ tài liệu kỹ thuật cho xưởng: quy trình lắp, nạp, kiểm và tiêu chí loại bỏ.',
      ],
      selfCheck: [
        {
          q: 'Trạng thái an toàn khi hỏng nghĩa là gì?',
          a: 'Là trạng thái mà nếu mọi thứ hỏng, thiết bị vẫn không gây hại, ví dụ ngắt tải và báo lỗi thay vì tiếp tục chạy.',
        },
        {
          q: 'Vì sao chứng nhận phải tính từ sớm chứ không để tới cuối?',
          a: 'Vì kết quả thử có thể buộc sửa mạch và vỏ, sửa muộn thì phải làm lại khuôn và trễ cả kế hoạch.',
        },
      ],
      doneSignals: [
        'Xưởng làm theo tài liệu của bạn mà không phải gọi hỏi lại từng bước.',
        'Bạn nêu được thiết bị của mình về trạng thái an toàn bằng cách nào khi mất nguồn hay mất kết nối.',
      ],
    },
  ],
  rubric: [
    {
      id: 'embedded-s4-r1',
      text: 'Có ít nhất mười thiết bị hoạt động ngoài hiện trường liên tục trong ít nhất một tháng.',
      howToProve: 'Dán bảng theo dõi thời gian hoạt động của từng thiết bị trong khoảng đó.',
    },
    {
      id: 'embedded-s4-r2',
      text: 'Bảng theo dõi sức khoẻ toàn đội cho biết phiên bản, tình trạng nguồn và lần liên lạc gần nhất của từng máy.',
      howToProve:
        'Chụp bảng theo dõi và chỉ ra một thiết bị đang bất thường cùng cách phát hiện ra.',
    },
    {
      id: 'embedded-s4-r3',
      text: 'Thực hiện một đợt cập nhật từ xa cho toàn đội thành công, có đường lui tự động đã thử trước.',
      howToProve: 'Dán nhật ký đợt cập nhật kèm một lần thử quay lui trên thiết bị thật.',
    },
    {
      id: 'embedded-s4-r4',
      text: 'Mỗi thiết bị có danh tính riêng và chỉ chạy được firmware đã ký, thử nạp bản không ký thì bị từ chối.',
      howToProve: 'Quay lại thử nghiệm nạp firmware không có chữ ký và dán thông báo từ chối.',
    },
    {
      id: 'embedded-s4-r5',
      text: 'Có tài liệu kỹ thuật cho sản xuất gồm quy trình nạp, hiệu chuẩn, kiểm và tiêu chí loại bỏ.',
      howToProve: 'Nhờ một người chưa biết dự án làm theo tài liệu và hoàn thành một máy.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Triển khai một sản phẩm nhúng nhiều thiết bị chạy thật ngoài hiện trường.',
      'Vận hành và cập nhật đội thiết bị từ xa, có đường lui.',
      'Soạn tài liệu kỹ thuật đủ cho nơi sản xuất làm theo.',
    ],
    scopeDont: [
      'Không tự thiết kế mạch mới trong cùng chặng, vì vòng làm mạch dài và rủi ro nằm ngoài bài học phần mềm.',
      'Không cập nhật đồng loạt cả đội, một lỗi lan ra hết thì phải tới tận nơi từng máy.',
      'Không lưu khoá dùng chung cho cả lô thiết bị.',
    ],
    touchpoints: [
      'Bộ nạp khởi động và nơi kiểm chữ ký firmware.',
      'Kênh báo chỉ số sức khoẻ và máy chủ nhận.',
      'Quy trình nạp và hiệu chuẩn tại xưởng.',
    ],
    contracts: [
      'Thiết bị báo về chỉ số sức khoẻ theo lược đồ cố định, có phiên bản.',
      'Gói cập nhật có chữ ký và phiên bản, thiết bị từ chối gói không hợp lệ.',
      'Sau ba lần khởi động thất bại, thiết bị tự quay lại bản trước.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng trên thiết bị thật.',
      'Không thiết bị nào phải mang về sửa vì lỗi cập nhật.',
    ],
    invariants: [
      'Thiết bị luôn quay lui được về bản firmware chạy được gần nhất.',
      'Mất nguồn hay mất kết nối thì thiết bị về trạng thái an toàn, không gây hại.',
    ],
    conventions: [
      'Mỗi thiết bị có số hiệu duy nhất tra được phiên bản phần cứng và firmware.',
      'Mọi thay đổi firmware có ghi chú phát hành và phiên bản tăng theo quy ước.',
    ],
  },
}

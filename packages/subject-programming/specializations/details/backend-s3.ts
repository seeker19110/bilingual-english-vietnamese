// details/backend-s3.ts — Chi tiết chặng S3 hướng BACKEND ("Hệ phân tán").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const BACKEND_S3_DETAIL: SpecStageDetail = {
  stageId: 'backend-s3',
  modules: [
    {
      moduleId: 'backend-s3-m1',
      objective:
        'Lý giải được vì sao gọi qua mạng khác hẳn gọi hàm, và thiết kế để hệ thống sống được khi một phần hỏng.',
      practice: [
        'Cho hai tiến trình cùng ghi một bản ghi để tạo ra tình huống mất cập nhật, rồi sửa bằng khoá lạc quan.',
        'Viết ra bảng các kiểu hỏng của một lời gọi mạng: chậm, mất, trả lời hai lần, trả lời sai thứ tự.',
        'Thử nhân bản dữ liệu sang một bản sao đọc và quan sát độ trễ đồng bộ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không nên dựa vào đồng hồ máy chủ để sắp thứ tự sự kiện?',
          a: 'Đồng hồ các máy lệch nhau và có thể nhảy lùi khi đồng bộ, nên thứ tự suy ra từ đó không đáng tin.',
        },
        {
          q: 'Khi gọi mạng thất bại, câu hỏi quan trọng nhất là gì?',
          a: 'Việc kia đã chạy hay chưa: mất phản hồi không có nghĩa là bên kia chưa làm.',
        },
      ],
      doneSignals: [
        'Trước khi retry bạn luôn hỏi thao tác đó có lặp lại an toàn không.',
        'Thiết kế của bạn nêu rõ dữ liệu chỗ nào chấp nhận nhất quán cuối cùng.',
      ],
    },
    {
      moduleId: 'backend-s3-m2',
      objective:
        'Cho các dịch vụ nói chuyện được với nhau mà không mất sự kiện và không khoá chặt nhau vào một phiên bản schema.',
      practice: [
        'Thêm outbox cho một sự kiện nghiệp vụ để ghi cơ sở dữ liệu và phát sự kiện cùng sống cùng chết.',
        'Giết tiến trình giữa hai bước 20 lần và kiểm lại không sự kiện nào mất hay gây tác dụng phụ hai lần.',
        'Tiến hoá một schema thông điệp theo cách thêm trường mà bản cũ vẫn đọc được.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phát sự kiện ngay trong luồng xử lý lại rủi ro?',
          a: 'Ghi cơ sở dữ liệu và phát sự kiện là hai việc riêng, ngắt giữa chừng là dữ liệu và sự kiện lệch nhau.',
        },
        {
          q: 'Saga giải quyết chuyện gì mà giao dịch thường không làm được?',
          a: 'Cho phép chuỗi thao tác trải nhiều dịch vụ tiến hoặc lùi bằng bước bù, thay vì khoá chung một giao dịch.',
        },
      ],
      doneSignals: [
        'Thêm trường mới vào thông điệp mà bên tiêu thụ cũ vẫn chạy bình thường.',
        'Bạn nói rõ được sự kiện của mình là ít nhất một lần hay đúng một lần.',
      ],
    },
    {
      moduleId: 'backend-s3-m3',
      objective:
        'Giữ cho hệ thống suy giảm có kiểm soát thay vì sập toàn bộ khi một thành phần phụ thuộc hỏng.',
      practice: [
        'Bọc mọi lời gọi ra ngoài bằng timeout, retry có độ trễ ngẫu nhiên và ngắt mạch.',
        'Cố ý làm một dịch vụ phụ thuộc treo 60 giây và kiểm xem luồng chính còn trả lời kịp không.',
        'Chạy một bài chaos nhỏ: giết một thành phần khi đang có tải và ghi lại hành vi hệ thống.',
      ],
      selfCheck: [
        {
          q: 'Vì sao retry không có độ trễ ngẫu nhiên lại nguy hiểm?',
          a: 'Mọi client thử lại cùng lúc tạo thành đợt sóng đồng pha, biến sự cố nhỏ thành bão retry.',
        },
        {
          q: 'Ngắt mạch bảo vệ ai là chính?',
          a: 'Bảo vệ dịch vụ đang hỏng khỏi bị dội thêm, và bảo vệ luồng chính khỏi chờ vô ích.',
        },
      ],
      doneSignals: [
        'Giết một dịch vụ phụ thì luồng chính vẫn phục vụ được phần lớn chức năng.',
        'Mọi lời gọi ra ngoài đều có thời hạn chờ, không có lời gọi nào chờ vô hạn.',
      ],
    },
    {
      moduleId: 'backend-s3-m4',
      objective:
        'Điều tra được sự cố từ triệu chứng người dùng ngược về nguyên nhân bằng số liệu, log và trace nối liền nhau.',
      practice: [
        'Gắn trace phân tán cho một luồng nghiệp vụ đi qua ít nhất ba dịch vụ.',
        'Định nghĩa hai chỉ số chất lượng dịch vụ kèm mục tiêu ghi thành số và ngân sách lỗi.',
        'Diễn tập một lần điều tra: bắt đầu từ than phiền của người dùng, kết thúc ở nguyên nhân.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cảnh báo nên đặt theo triệu chứng người dùng thay vì theo tài nguyên máy?',
          a: 'Máy bận chưa chắc người dùng khổ; cảnh báo theo triệu chứng mới dẫn tới hành động cần làm.',
        },
        {
          q: 'Ngân sách lỗi dùng để quyết định điều gì?',
          a: 'Còn ngân sách thì ưu tiên tính năng mới, hết ngân sách thì dừng lại trả nợ độ tin cậy.',
        },
      ],
      doneSignals: [
        'Truy được một đơn hàng qua đủ các dịch vụ chỉ bằng một mã định danh.',
        'Bạn dùng số liệu chất lượng dịch vụ để quyết định thứ tự công việc.',
      ],
    },
  ],
  rubric: [
    {
      id: 'backend-s3-r1',
      text: 'Mỗi dịch vụ tách ra có lý do viết thành câu rõ ràng, và đợt đầu không vượt quá bốn dịch vụ.',
      howToProve: 'Nộp sơ đồ ranh giới kèm một dòng lý do cho từng dịch vụ.',
    },
    {
      id: 'backend-s3-r2',
      text: 'Chạy 1.000 giao dịch có ngắt ngẫu nhiên mà không mất sự kiện nào và số liệu hai phía khớp nhau.',
      howToProve: 'Chạy kịch bản ngắt tự động rồi dán kết quả đối chiếu hai nguồn dữ liệu.',
    },
    {
      id: 'backend-s3-r3',
      text: 'Giết một dịch vụ bất kỳ khi đang chạy thì luồng chính vẫn phục vụ được ít nhất 80% chức năng.',
      howToProve:
        'Ghi lại bài chaos: giết cái gì, lúc nào, người dùng thấy gì, hệ thống hồi lại sau bao lâu.',
    },
    {
      id: 'backend-s3-r4',
      text: 'Trace được một đơn hàng đi qua đủ các dịch vụ trong vòng hai phút bằng một mã định danh duy nhất.',
      howToProve: 'Dán ảnh chụp một trace đủ các nhịp nối liền nhau trên công cụ quan sát.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tách một khối lớn thành các dịch vụ có ranh giới rõ và có lý do.',
      'Bảo đảm giao dịch xuyên dịch vụ không mất sự kiện.',
      'Dựng quan sát đủ để điều tra sự cố từ triệu chứng người dùng.',
    ],
    scopeDont: [
      'Không tách thành hàng chục dịch vụ nhỏ, vì chi phí vận hành sẽ vượt xa lợi ích khi đội chỉ có vài người.',
      'Không đổi công nghệ lưu trữ trong cùng đợt tách dịch vụ.',
    ],
    touchpoints: [
      'Ranh giới dữ liệu của từng dịch vụ và bảng thuộc về ai.',
      'Nơi phát và tiêu thụ sự kiện, gồm cả bảng outbox.',
    ],
    contracts: [
      'Thông điệp giữa các dịch vụ có schema có phiên bản, thêm trường không phá bản cũ.',
      'Mọi thao tác ghi qua mạng phải lặp lại an toàn bằng khoá idempotency.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với bằng chứng chạy thật, không phải mô tả.',
      'Có bài chaos đã chạy ít nhất một lần và ghi lại kết quả.',
    ],
    invariants: [
      'Không mất dữ liệu người dùng khi bất kỳ dịch vụ nào chết giữa chừng.',
      'Không thao tác ghi nào chạy hai lần gây hậu quả kép.',
    ],
    conventions: [
      'Mỗi request mang một mã định danh xuyên suốt để nối log và trace.',
      'Cấu hình và bí mật lấy từ biến môi trường, không nằm trong mã nguồn.',
    ],
  },
}

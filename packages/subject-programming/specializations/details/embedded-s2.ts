// details/embedded-s2.ts — Chi tiết chặng S2 hướng NHÚNG & IoT (RTOS, kết nối, OTA, pin).
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const EMBEDDED_S2_DETAIL: SpecStageDetail = {
  stageId: 'embedded-s2',
  modules: [
    {
      moduleId: 'embedded-s2-m1',
      objective:
        'Chia được firmware thành các tác vụ có độ ưu tiên rõ ràng và trao đổi dữ liệu an toàn giữa chúng.',
      practice: [
        'Chuyển vòng lặp lớn thành ba tác vụ có ưu tiên khác nhau, đo mức chiếm dụng bộ xử lý từng tác vụ.',
        'Dùng hàng đợi thay vì biến toàn cục để truyền dữ liệu giữa ngắt và tác vụ.',
        'Đo mức dùng ngăn xếp cao nhất của mỗi tác vụ và đặt hạn mức có dư.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không nên xử lý dài trong hàm phục vụ ngắt?',
          a: 'Ngắt chặn các ngắt khác và làm trễ toàn hệ thống; hàm ngắt chỉ nên ghi nhận rồi đẩy việc sang tác vụ.',
        },
        {
          q: 'Đảo ngược ưu tiên là gì?',
          a: 'Tác vụ ưu tiên cao phải chờ tác vụ ưu tiên thấp đang giữ khoá, trong khi tác vụ trung bình chạy chen vào.',
        },
      ],
      doneSignals: [
        'Biết mỗi tác vụ dùng bao nhiêu ngăn xếp, không đặt số ước chừng.',
        'Không còn dữ liệu chia sẻ nào không có cơ chế bảo vệ.',
      ],
    },
    {
      moduleId: 'embedded-s2-m2',
      objective:
        'Kết nối thiết bị lên mạng và giữ được dữ liệu khi mạng chập chờn hoặc mất hẳn nhiều giờ.',
      practice: [
        'Gửi số liệu định kỳ qua giao thức nhẹ, đo lượng byte mỗi lần gửi.',
        'Ngắt mạng hai mươi tư giờ và kiểm dữ liệu được đệm lại rồi gửi bù khi có mạng.',
        'Thêm mã hoá đường truyền và kiểm chứng chỉ máy chủ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao thiết bị nhúng cần bộ đệm cục bộ?',
          a: 'Mạng ở hiện trường không ổn định; không đệm là mất dữ liệu vĩnh viễn vì không ai gửi lại hộ.',
        },
        {
          q: 'Bộ đệm đầy thì bỏ dữ liệu nào?',
          a: 'Phải quyết định trước và ghi vào đặc tả — thường giữ dữ liệu mới nhất hoặc lấy mẫu thưa dần, không để tràn tuỳ hứng.',
        },
      ],
      doneSignals: [
        'Mất mạng một ngày không mất số liệu.',
        'Biết chính xác thiết bị tiêu tốn bao nhiêu dữ liệu mỗi tháng.',
      ],
    },
    {
      moduleId: 'embedded-s2-m3',
      objective:
        'Cài được cập nhật firmware từ xa có kiểm chữ ký và tự quay lui khi bản mới không khởi động được.',
      practice: [
        'Chia bộ nhớ thành hai vùng firmware và cài cơ chế đổi vùng khi cập nhật.',
        'Ký firmware và từ chối bản không đúng chữ ký.',
        'Nạp một bản lỗi có chủ đích, xác nhận thiết bị tự quay về bản cũ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cập nhật từ xa phải có đường quay lui tự động?',
          a: 'Thiết bị ở hiện trường không ai cắm cáp cứu được; một bản lỗi là mất trắng thiết bị.',
        },
        {
          q: 'Không kiểm chữ ký firmware thì rủi ro gì?',
          a: 'Kẻ tấn công đẩy được firmware của họ và chiếm toàn quyền thiết bị.',
        },
      ],
      doneSignals: [
        'Nạp bản lỗi mười lần, mười lần thiết bị đều tự cứu được.',
        'Bản không đúng chữ ký bị từ chối trước khi ghi vào bộ nhớ.',
      ],
    },
    {
      moduleId: 'embedded-s2-m4',
      objective: 'Đo và giảm được mức tiêu thụ điện để thiết bị đạt tuổi thọ pin đã cam kết.',
      practice: [
        'Đo dòng tiêu thụ ở từng chế độ và lập bảng ngân sách điện năng cho một ngày.',
        'Đưa thiết bị vào chế độ ngủ sâu giữa hai lần đo, kiểm dòng ở mức micro-ampe.',
        'Tính tuổi thọ pin dự kiến từ số đo thật rồi đối chiếu bằng một lần chạy dài.',
      ],
      selfCheck: [
        {
          q: 'Thành phần nào thường ngốn điện nhất trong thiết bị IoT?',
          a: 'Bộ thu phát vô tuyến lúc truyền; giảm số lần gửi thường hiệu quả hơn mọi tối ưu khác.',
        },
        {
          q: 'Vì sao phải đo dòng thật thay vì tính theo tài liệu linh kiện?',
          a: 'Tài liệu cho điều kiện lý tưởng; mạch thật luôn có thành phần rò và cấu hình chân chưa tối ưu.',
        },
      ],
      doneSignals: [
        'Có bảng ngân sách điện năng dựa trên số đo thật.',
        'Tuổi thọ pin dự kiến khớp với chạy thử trong sai số chấp nhận được.',
      ],
    },
  ],
  rubric: [
    {
      id: 'embedded-s2-r1',
      text: 'Mất mạng tới hai mươi tư giờ không mất số liệu đo.',
      howToProve:
        'Ngắt mạng theo lịch, so số bản ghi trên máy chủ với số lần đo trong nhật ký thiết bị.',
    },
    {
      id: 'embedded-s2-r2',
      text: 'Cập nhật từ xa thành công và tự quay lui được khi bản mới lỗi.',
      howToProve: 'Nạp một bản cố tình lỗi, quay video thiết bị tự khởi động lại về bản cũ.',
    },
    {
      id: 'embedded-s2-r3',
      text: 'Đạt tuổi thọ pin đã cam kết trong đặc tả, dựa trên số đo dòng thật.',
      howToProve: 'Bảng ngân sách điện năng kèm ảnh chụp thiết bị đo dòng ở từng chế độ.',
    },
    {
      id: 'embedded-s2-r4',
      text: 'Chạy liên tục bảy ngày không treo, không tự khởi động lại ngoài ý muốn.',
      howToProve: 'Nhật ký thời gian hoạt động và số lần khởi động lại ghi trên máy chủ.',
    },
    {
      id: 'embedded-s2-r5',
      text: 'Firmware chỉ nhận bản có chữ ký hợp lệ.',
      howToProve: 'Thử nạp bản không ký và bản sửa một byte, cả hai đều bị từ chối, dán nhật ký.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Trạm đo gửi số liệu định kỳ lên máy chủ, chạy bằng pin.',
      'Cập nhật firmware từ xa có chữ ký và đường quay lui.',
      'Bộ đệm cục bộ chịu được mất mạng dài.',
    ],
    scopeDont: [
      'KHÔNG làm giao diện web quản lý thiết bị — đó là việc của phía máy chủ, không phải chặng này.',
      'KHÔNG thiết kế mạch in mới; dùng bo mạch phát triển sẵn có.',
      'KHÔNG thêm cảm biến thứ hai trước khi cảm biến thứ nhất chạy ổn định bảy ngày.',
    ],
    touchpoints: [
      'Lớp trừu tượng phần cứng tách khỏi logic ứng dụng để đổi bo mạch không phải viết lại.',
      'Module bộ đệm cục bộ trên bộ nhớ không mất khi mất điện.',
      'Module cập nhật từ xa và bộ nạp khởi động.',
    ],
    contracts: [
      'Bản tin số liệu có phiên bản schema và dấu thời gian sinh tại thiết bị.',
      'Máy chủ xác nhận đã nhận thì thiết bị mới xoá khỏi bộ đệm.',
      'Firmware có ô siêu dữ liệu: phiên bản, chữ ký, mã băm — kiểm trước khi ghi.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có số đo và video kèm theo.',
      'Một lần chạy thật bảy ngày liên tục hoàn tất.',
    ],
    invariants: [
      'Không bao giờ ghi đè vùng firmware đang chạy.',
      'Dữ liệu chỉ bị xoá khỏi bộ đệm sau khi máy chủ xác nhận.',
      'Thiết bị luôn khởi động được về một bản firmware hợp lệ.',
    ],
    conventions: [
      'Mọi hằng số thời gian và ngưỡng đưa ra một file cấu hình, không rải trong mã.',
      'Nhật ký thiết bị đủ để chẩn đoán từ xa nhưng không chứa khoá bí mật.',
      'Số đo điện năng luôn ghi kèm điều kiện đo.',
    ],
  },
}

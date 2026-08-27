// details/backend-s1.ts — Chi tiết chặng S1 hướng BACKEND ("Dịch vụ đúng đắn").
// Bản đồ chặng nằm ở ../backend.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Chữ "đúng đắn" trong tên chặng là có chủ ý: ở S1 chưa bàn tới quy mô hay tốc độ, chỉ bàn tới
// chuyện dịch vụ có làm SAI dữ liệu hay không khi bị gọi lại, gọi song song, hoặc gọi bậy.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const BACKEND_S1_DETAIL: SpecStageDetail = {
  stageId: 'backend-s1',
  modules: [
    {
      moduleId: 'backend-s1-m1',
      objective:
        'Thiết kế được API dùng đúng động từ và mã trạng thái, phân trang và lọc không phá vỡ khi dữ liệu lớn dần.',
      practice: [
        'Viết bảng liệt kê mọi endpoint kèm động từ, mã trạng thái thành công và mã lỗi có thể xảy ra.',
        'Gọi API bằng công cụ dòng lệnh ở chế độ chi tiết, đọc từng dòng header của cả yêu cầu lẫn phản hồi.',
        'Đặt phiên bản cho API ngay từ đầu và thử thêm một trường mới mà không làm hỏng client cũ.',
      ],
      selfCheck: [
        {
          q: 'Trả về mã 200 kèm một trường báo lỗi bên trong thì sai ở đâu?',
          a: 'Tầng trung gian và công cụ giám sát đọc mã trạng thái để biết hỏng; giấu lỗi trong thân là làm mù chúng.',
        },
        {
          q: 'Vì sao đặt phiên bản cho API ngay từ đầu lại rẻ hơn thêm sau?',
          a: 'Thêm sau thì đã có client cũ đang chạy, phải vừa đỡ đường cũ vừa mở đường mới cùng lúc.',
        },
        {
          q: 'Khi nào mã 404 và mã 403 dễ bị dùng lẫn?',
          a: 'Khi tài nguyên có tồn tại nhưng người gọi không được xem — trả 404 để giấu sự tồn tại là chọn có chủ ý.',
        },
      ],
      doneSignals: [
        'Người khác đọc bảng endpoint của bạn là gọi được ngay, không cần hỏi thêm.',
        'Bạn giải thích được vì sao chọn từng mã trạng thái, không chọn theo thói quen.',
      ],
    },
    {
      moduleId: 'backend-s1-m2',
      objective:
        'Bảo đảm dữ liệu không hỏng khi client gửi bậy hoặc gửi lại: kiểm ở biên, ghi lũy đẳng, thời gian và tiền lưu đúng kiểu.',
      practice: [
        'Kiểm mọi thân yêu cầu bằng schema ở đúng một chỗ, thử gửi trường thừa và trường sai kiểu.',
        'Bấm nút đặt hàng hai lần thật nhanh, xác nhận chỉ có một đơn được tạo nhờ khoá lũy đẳng.',
        'Đổi toàn bộ cột tiền sang số nguyên đơn vị nhỏ nhất và viết test cộng dồn 1.000 dòng không lệch.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tiền không được lưu bằng số thực dấu phẩy động?',
          a: 'Số thực không biểu diễn chính xác nhiều giá trị thập phân nên cộng dồn nhiều lần sẽ lệch dần.',
        },
        {
          q: 'Khoá lũy đẳng giải quyết tình huống thực tế nào?',
          a: 'Mạng chập chờn khiến client gửi lại cùng một yêu cầu; server nhận ra khoá cũ và trả kết quả cũ.',
        },
        {
          q: 'Vì sao thời gian phải lưu theo giờ quốc tế?',
          a: 'Giờ địa phương đổi theo múi giờ và giờ mùa hè, so sánh hai mốc lưu theo giờ địa phương là sai.',
        },
      ],
      doneSignals: [
        'Gửi yêu cầu dị dạng thế nào cũng bị chặn ở biên, không lọt vào tầng nghiệp vụ.',
        'Bấm đúp nút thanh toán không bao giờ tạo ra hai bản ghi.',
      ],
    },
    {
      moduleId: 'backend-s1-m3',
      objective:
        'Phân loại được lỗi thành ba nhóm và ghi nhật ký có cấu trúc đủ để lần lại một yêu cầu qua nhiều tầng.',
      practice: [
        'Gắn một mã yêu cầu duy nhất ở cửa vào và truyền nó xuống mọi dòng nhật ký của yêu cầu đó.',
        'Gây ra ba loại lỗi khác nhau rồi kiểm tra nhật ký có phân biệt được lỗi của người dùng và lỗi hệ thống không.',
        'Rà toàn bộ dòng ghi nhật ký, xoá mọi chỗ đang in ra mật khẩu, token hay thông tin cá nhân.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lỗi do người dùng nhập sai không nên báo động cho đội trực?',
          a: 'Nó là chuyện bình thường xảy ra suốt ngày; trộn chung sẽ làm chìm mất lỗi hệ thống thật.',
        },
        {
          q: 'Nhật ký có cấu trúc hơn gì so với ghi một dòng chữ tự do?',
          a: 'Máy lọc và gộp được theo trường, nên tìm mọi lỗi của một yêu cầu chỉ mất một câu truy vấn.',
        },
        {
          q: 'In token vào nhật ký nguy hiểm thế nào dù nhật ký nằm ở máy chủ riêng?',
          a: 'Nhật ký thường được sao chép, gửi đi và giữ lâu; một chỗ rò là toàn bộ token trong đó bị lộ.',
        },
      ],
      doneSignals: [
        'Cho một mã yêu cầu là bạn dựng lại được toàn bộ đường đi của nó.',
        'Tìm trong nhật ký không còn thấy dữ liệu nhạy cảm nào.',
      ],
    },
    {
      moduleId: 'backend-s1-m4',
      objective:
        'Đóng gói được dịch vụ chạy từ máy trắng bằng một lệnh, có kiểm tra sức khoẻ và tắt êm không mất yêu cầu dở.',
      practice: [
        'Viết tệp đóng gói nhiều tầng rồi đo lại kích thước ảnh trước và sau khi tách tầng phụ thuộc.',
        'Đưa toàn bộ cấu hình ra biến môi trường, chạy thử với một bộ biến sai để thấy dịch vụ từ chối khởi động.',
        'Gửi tín hiệu dừng lúc đang có yêu cầu chạy dở, xác nhận yêu cầu đó vẫn hoàn tất trước khi tiến trình thoát.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cấu hình phải nằm ở biến môi trường chứ không trong ảnh đóng gói?',
          a: 'Một ảnh phải chạy được ở mọi môi trường; nhét cấu hình vào là phải dựng lại ảnh cho từng nơi.',
        },
        {
          q: 'Kiểm tra sức khoẻ nên trả lời câu hỏi gì mới có ích?',
          a: 'Dịch vụ có SẴN SÀNG nhận việc không, gồm cả phụ thuộc bắt buộc — không chỉ là tiến trình còn sống.',
        },
        {
          q: 'Tắt đột ngột giữa lúc đang xử lý gây ra hậu quả nào?',
          a: 'Yêu cầu dở dang bị cắt giữa chừng, có thể ghi nửa vời và client nhận lỗi dù việc đã làm một phần.',
        },
      ],
      doneSignals: [
        'Người khác chạy đúng một lệnh trên máy trắng là dịch vụ lên.',
        'Triển khai bản mới không có yêu cầu nào của người dùng bị rớt.',
      ],
    },
  ],
  rubric: [
    {
      id: 'backend-s1-r1',
      text: 'Mọi endpoint đều kiểm đầu vào bằng schema và trả lỗi theo một hình dạng thống nhất có mã máy đọc được.',
      howToProve:
        'Gửi thân yêu cầu sai kiểu vào từng endpoint, dán lại phản hồi cho thấy cùng một hình dạng lỗi.',
    },
    {
      id: 'backend-s1-r2',
      text: 'Đặt hàng là thao tác lũy đẳng: gửi lại cùng một khoá không bao giờ tạo ra đơn hàng thứ hai.',
      howToProve:
        'Chạy kịch bản gửi 20 yêu cầu song song cùng khoá, đếm số đơn trong cơ sở dữ liệu đúng bằng một.',
    },
    {
      id: 'backend-s1-r3',
      text: 'Chạy một lệnh dựng và khởi động là dịch vụ lên được từ máy chưa cài gì ngoài công cụ đóng gói.',
      howToProve:
        'Xoá sạch ảnh và ổ đĩa cũ, chạy lại một lệnh và gọi thử endpoint kiểm tra sức khoẻ.',
    },
    {
      id: 'backend-s1-r4',
      text: 'Bộ test tự động phủ được cả đường thành công lẫn đường lỗi của từng endpoint ghi dữ liệu.',
      howToProve: 'Chạy bộ test in ra danh sách ca kiểm và dán báo cáo độ phủ theo từng tệp.',
    },
    {
      id: 'backend-s1-r5',
      text: 'Nhật ký có mã yêu cầu xuyên suốt và không chứa mật khẩu, token hay thông tin định danh cá nhân.',
      howToProve:
        'Gọi một yêu cầu rồi lọc nhật ký theo mã của nó, dán lại toàn bộ dòng thu được để soát.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Dịch vụ API cho cửa hàng: quản lý món, tạo đơn hàng, xem lịch sử đơn của một người dùng.',
      'Kiểm đầu vào bằng schema, ghi nhật ký có cấu trúc, đóng gói chạy được bằng một lệnh.',
      'Bộ test tự động cho cả đường thành công và đường lỗi.',
    ],
    scopeDont: [
      'KHÔNG làm giao diện người dùng, vì trọng tâm chặng là hợp đồng API và tính đúng đắn của dữ liệu.',
      'KHÔNG tối ưu hiệu năng hay thêm bộ đệm khi chưa có số đo, đo trước rồi mới bàn.',
      'KHÔNG làm hàng đợi hay dịch vụ nền, một tiến trình là đủ cho chặng này.',
    ],
    touchpoints: [
      'Tầng định tuyến: khai endpoint, gắn schema kiểm đầu vào và tầng xác thực.',
      'Tầng nghiệp vụ: hàm thuần xử lý đơn hàng, tách khỏi mọi thứ liên quan tới HTTP.',
      'Tầng truy cập dữ liệu và tệp migration đánh số thứ tự.',
    ],
    contracts: [
      'Lỗi trả về dạng `{ code: string; message: string }`; client rẽ nhánh theo `code`, không đọc `message`.',
      'Mọi thao tác ghi nhận một khoá lũy đẳng ở header, thiếu khoá thì từ chối.',
      'Danh sách luôn trả kèm con trỏ trang tiếp theo, giá trị rỗng nghĩa là đã hết dữ liệu.',
    ],
    acceptance: [
      'Năm tiêu chí rubric ở trên đều đạt và có bằng chứng chạy lệnh kèm theo.',
      'Từ máy trắng chạy được toàn bộ: dựng, migration, khởi động, chạy test — không thao tác tay ngoài kịch bản.',
    ],
    invariants: [
      'Không endpoint nào tin định danh người dùng do client gửi lên trong thân yêu cầu.',
      'Tổng tiền của một đơn luôn bằng tổng các dòng hàng của đơn đó, có test canh.',
      'Không bí mật nào nằm trong mã nguồn hay trong ảnh đóng gói.',
    ],
    conventions: [
      'Kiểm dữ liệu ngoài lúc chạy bằng schema, không tin kiểu tĩnh của trình biên dịch.',
      'Hàm nghiệp vụ không nhận đối tượng yêu cầu HTTP, chỉ nhận dữ liệu đã kiểm.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

// details/mobile-s2.ts — Chi tiết chặng S2 hướng DI ĐỘNG (app nối API thật).
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MOBILE_S2_DETAIL: SpecStageDetail = {
  stageId: 'mobile-s2',
  modules: [
    {
      moduleId: 'mobile-s2-m1',
      objective:
        'Viết được lớp mạng chịu được sóng yếu: thử lại có giãn cách, hàng chờ ngoại tuyến và đồng bộ khi có mạng lại.',
      practice: [
        'Bật chế độ máy bay giữa lúc gửi đơn, kiểm đơn nằm trong hàng chờ và tự gửi khi có mạng.',
        'Giả lập mạng 2G để đo thời gian mở màn danh sách, ghi lại con số trước và sau khi thêm cache cục bộ.',
        'Đặt thời gian chờ và số lần thử lại cho mọi lời gọi mạng, không để mặc định vô hạn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao thử lại phải có giãn cách tăng dần?',
          a: 'Thử lại dồn dập lúc mạng chập chờn làm nghẽn thêm và ngốn pin; giãn cách cho hệ thống thời gian hồi phục.',
        },
        {
          q: 'Đơn hàng gửi lại sau khi có mạng có nguy cơ gì?',
          a: 'Có thể tạo đơn trùng nếu lần gửi trước đã tới server; phải kèm khoá lặp-lại-an-toàn.',
        },
      ],
      doneSignals: [
        'Dùng app trong thang máy mất sóng vẫn không mất thao tác đã làm.',
        'Không màn nào quay vòng tải mãi mà không báo lỗi.',
      ],
    },
    {
      moduleId: 'mobile-s2-m2',
      objective:
        'Cài đặt được đăng nhập trên điện thoại với token lưu ở kho bảo mật của hệ điều hành và tự làm mới phiên.',
      practice: [
        'Lưu token vào kho khoá của hệ điều hành thay vì bộ nhớ thường, xác nhận gỡ app là mất token.',
        'Cài luồng làm mới token khi hết hạn giữa chừng mà người dùng không bị đá ra màn đăng nhập.',
        'Thêm đăng nhập bằng sinh trắc học làm lớp mở khoá cục bộ, có đường lui bằng mã PIN.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không lưu token trong tệp cấu hình thường?',
          a: 'Trên máy đã can thiệp hệ thống, tệp thường đọc được; kho khoá được hệ điều hành mã hoá và bảo vệ.',
        },
        {
          q: 'Hết hạn token giữa lúc người dùng đang thao tác thì nên làm gì?',
          a: 'Tự làm mới ngầm rồi gửi lại yêu cầu; chỉ đá ra đăng nhập khi làm mới cũng thất bại.',
        },
      ],
      doneSignals: [
        'Mở lại app sau vài ngày vẫn còn đăng nhập, không phải nhập lại mật khẩu.',
        'Sinh trắc học hỏng vẫn còn đường vào bằng cách khác.',
      ],
    },
    {
      moduleId: 'mobile-s2-m3',
      objective:
        'Xin và xử lý quyền hệ thống đúng cách: hỏi đúng lúc, giải thích lý do, và chạy được khi người dùng từ chối.',
      practice: [
        'Xin quyền vị trí ngay trước thao tác cần nó, kèm một câu giải thích bằng tiếng Việt.',
        'Chạy thử toàn bộ app ở trạng thái người dùng từ chối mọi quyền, không màn nào được sập.',
        'Đọc và ghi lại danh sách quyền app đang khai báo, xoá quyền không dùng tới.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không nên xin hết quyền ngay màn hình đầu tiên?',
          a: 'Người dùng chưa hiểu để làm gì nên tỷ lệ từ chối cao, và từ chối lần đầu rất khó xin lại.',
        },
        {
          q: 'Người dùng từ chối quyền camera thì tính năng chụp nên xử lý ra sao?',
          a: 'Vẫn cho dùng đường khác như chọn ảnh có sẵn, và chỉ rõ cách bật lại trong cài đặt.',
        },
      ],
      doneSignals: [
        'Từ chối mọi quyền, app vẫn dùng được phần lớn chức năng.',
        'Mỗi quyền khai báo đều chỉ ra được màn hình nào cần tới.',
      ],
    },
    {
      moduleId: 'mobile-s2-m4',
      objective:
        'Đưa được bản thử tới tay người thật qua kênh phát hành thử và thu phản hồi có nhật ký sự cố.',
      practice: [
        'Dựng bản thử nội bộ và mời ít nhất năm người ngoài dự án cài đặt.',
        'Cài công cụ ghi nhận sự cố, tạo một sự cố cố ý và xác nhận nó hiện lên bảng theo dõi.',
        'Viết bộ kiểm thử giao diện tự động cho luồng đăng nhập và đặt đơn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải phát hành thử trước khi lên cửa hàng chính thức?',
          a: 'Máy thật muôn hình vạn trạng; bản thử phát hiện lỗi thiết bị và luồng cài đặt mà máy ảo không thấy.',
        },
        {
          q: 'Nhật ký sự cố cần kèm gì mới hữu ích?',
          a: 'Phiên bản app, đời máy, hệ điều hành và các bước dẫn tới lỗi; chỉ có vết ngăn xếp thì khó tái hiện.',
        },
      ],
      doneSignals: [
        'Có ít nhất năm người ngoài đã cài và gửi phản hồi.',
        'Sự cố trên máy người dùng hiện lên bảng theo dõi trong vài phút.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mobile-s2-r1',
      text: 'Đăng nhập thật với API server, token nằm trong kho bảo mật của hệ điều hành.',
      howToProve:
        'Quay màn hình luồng đăng nhập và chỉ ra đoạn mã ghi vào kho khoá, kèm kiểm chứng gỡ app là mất token.',
    },
    {
      id: 'mobile-s2-r2',
      text: 'Xem và tạo đơn được khi mất mạng; có mạng lại thì tự đồng bộ và không tạo đơn trùng.',
      howToProve:
        'Quay lại thao tác ở chế độ máy bay rồi bật mạng, đối chiếu số đơn trong CSDL server.',
    },
    {
      id: 'mobile-s2-r3',
      text: 'Từ chối toàn bộ quyền hệ thống mà app không sập và vẫn dùng được chức năng chính.',
      howToProve:
        'Chạy kịch bản kiểm thử tự động với mọi quyền bị từ chối, không có sự cố nào ghi nhận.',
    },
    {
      id: 'mobile-s2-r4',
      text: 'Có bản phát hành thử cài được trên máy người khác, ít nhất năm người đã dùng.',
      howToProve: 'Ảnh chụp danh sách người thử trong kênh phát hành thử và phản hồi họ gửi về.',
    },
    {
      id: 'mobile-s2-r5',
      text: 'Màn danh sách mở dưới 2 giây trên máy tầm trung với mạng 3G mô phỏng.',
      howToProve: 'Số đo từ công cụ hồ sơ hiệu năng của nền tảng, chạy ba lần lấy trung vị.',
    },
  ],
  specBrief: {
    scopeDo: [
      'App di động của dự án cửa hàng: đăng nhập, xem món, xem và tạo đơn.',
      'Bộ nhớ đệm cục bộ để dùng được khi mất mạng, đồng bộ khi có mạng lại.',
      'Phát hành thử nội bộ kèm ghi nhận sự cố.',
    ],
    scopeDont: [
      'KHÔNG làm phần quản trị cho chủ cửa hàng — web đã có, làm lại trên di động là phí.',
      'KHÔNG làm thông báo đẩy ở chặng này; nó kéo theo hạ tầng riêng, để chặng sau.',
      'KHÔNG hỗ trợ máy tính bảng và xoay ngang màn hình.',
    ],
    touchpoints: [
      'Lớp mạng: nơi duy nhất biết địa chỉ API và cách thử lại.',
      'Kho dữ liệu cục bộ: bảng đơn chờ gửi và bộ nhớ đệm danh mục.',
      'Màn hình đăng nhập, danh sách món, chi tiết đơn.',
    ],
    contracts: [
      'Mỗi đơn tạo ở máy khách sinh khoá lặp-lại-an-toàn ngay trên máy, gửi kèm mọi lần thử lại.',
      'Dữ liệu cục bộ có cột thời điểm đồng bộ để biết đang xem bản cũ tới mức nào.',
      'Lỗi mạng và lỗi nghiệp vụ tách bạch: một cái cho thử lại, một cái phải báo người dùng.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có video hoặc ảnh chụp kèm theo.',
      'Kiểm thử tự động luồng đăng nhập và đặt đơn chạy xanh trên máy ảo.',
    ],
    invariants: [
      'Một thao tác của người dùng không bao giờ sinh hai đơn trên server.',
      'Token không bao giờ nằm trong nhật ký hay được gửi tới bên thứ ba.',
      'Mất mạng không làm mất dữ liệu người dùng đã nhập.',
    ],
    conventions: [
      'Vùng chạm tối thiểu 44px, thiết kế màn nhỏ trước.',
      'Chữ hiển thị bằng tiếng Việt, có bản dịch tách khỏi mã.',
      'Không ghi bí mật vào mã nguồn; cấu hình theo môi trường.',
    ],
  },
}

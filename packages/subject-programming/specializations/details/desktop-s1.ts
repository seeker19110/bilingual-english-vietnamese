// details/desktop-s1.ts — Chi tiết chặng S1 hướng DESKTOP ("Ứng dụng cài được").
// Bản đồ chặng nằm ở ../desktop.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Đặc thù hướng này: ứng dụng chạy trên MÁY CỦA NGƯỜI KHÁC, với tệp thật của họ. Nên mất dữ
// liệu là lỗi nghiêm trọng nhất, và bất biến "không bao giờ làm mất dữ liệu gốc" đứng trên tất cả.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DESKTOP_S1_DETAIL: SpecStageDetail = {
  stageId: 'desktop-s1',
  modules: [
    {
      moduleId: 'desktop-s1-m1',
      objective:
        'Chọn được nền tảng desktop cho dự án bằng số đo thật về kích thước gói và mức tiêu tốn bộ nhớ, không chọn theo lời đồn.',
      practice: [
        'Dựng cùng một cửa sổ trống bằng hai nền tảng khác nhau và đo kích thước gói cài lẫn bộ nhớ chiếm.',
        'Thêm một mục vào menu hệ thống và một biểu tượng ở khay, xem mỗi nền tảng tốn bao nhiêu công.',
        'Đăng ký một phím tắt toàn cục và thử xem nó có xung đột với phím tắt của hệ điều hành không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao kích thước gói cài lại là tiêu chí đáng cân nhắc cho ứng dụng desktop?',
          a: 'Người dùng tải qua mạng và cân nhắc trước khi cài; gói vài trăm megabyte cho công cụ nhỏ dễ bị bỏ qua.',
        },
        {
          q: 'Nền tảng dựa trên nền web đánh đổi điều gì so với nền tảng gốc?',
          a: 'Được dùng lại kỹ năng web và chạy đa hệ, đổi lại tốn bộ nhớ hơn và khó chạm sâu vào hệ điều hành.',
        },
        {
          q: 'Phím tắt toàn cục khác phím tắt trong cửa sổ ở chỗ nào?',
          a: 'Toàn cục hoạt động cả khi ứng dụng không được chọn, nên dễ giành mất phím của phần mềm khác.',
        },
      ],
      doneSignals: [
        'Bạn bảo vệ được lựa chọn nền tảng của mình bằng số đo, không bằng cảm tính.',
        'Ứng dụng của bạn hoà vào hệ điều hành, không trông như trang web nhét trong khung.',
      ],
    },
    {
      moduleId: 'desktop-s1-m2',
      objective:
        'Đọc ghi tệp an toàn trên cả ba hệ điều hành, không bao giờ để lại tệp hỏng khi bị ngắt giữa chừng.',
      practice: [
        'Ghi ra tệp tạm rồi mới đổi tên đè lên tệp đích, thử tắt ứng dụng giữa chừng để kiểm tệp gốc còn nguyên.',
        'Xử lý đường dẫn có dấu tiếng Việt và có khoảng trắng trên cả ba hệ, tìm chỗ nào vỡ.',
        'Cài kéo thả nhiều tệp một lúc và kiểm tra thứ tự cùng tên tệp nhận được có đúng không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao ghi tệp tạm rồi đổi tên lại an toàn hơn ghi đè trực tiếp?',
          a: 'Đổi tên là thao tác gần như tức thời, nên mất điện giữa chừng thì tệp gốc vẫn nguyên vẹn chứ không hỏng dở.',
        },
        {
          q: 'Đường dẫn khác nhau giữa các hệ điều hành ở những điểm nào?',
          a: 'Ký tự phân cách, phân biệt hoa thường, độ dài tối đa và cả những ký tự bị cấm trong tên tệp.',
        },
        {
          q: 'Vì sao không nên ghép đường dẫn bằng cách nối chuỗi?',
          a: 'Nối tay dễ sai ký tự phân cách và dấu gạch thừa; hàm ghép của thư viện xử lý đúng cho từng hệ.',
        },
      ],
      doneSignals: [
        'Tắt ứng dụng giữa lúc đang ghi mà tệp gốc không bao giờ hỏng.',
        'Thư mục có dấu tiếng Việt không còn làm ứng dụng của bạn lỗi.',
      ],
    },
    {
      moduleId: 'desktop-s1-m3',
      objective:
        'Lưu dữ liệu người dùng vào đúng thư mục chuẩn của từng hệ điều hành và nâng cấp được cấu trúc dữ liệu bản cũ.',
      practice: [
        'Tìm đường dẫn thư mục cấu hình, đệm và dữ liệu chuẩn trên cả ba hệ rồi dùng đúng từng loại.',
        'Đổi schema cơ sở dữ liệu nhúng và viết migration, thử nâng cấp từ dữ liệu bản cũ có sẵn.',
        'Làm chức năng xuất toàn bộ dữ liệu ra một tệp mà người dùng nhập lại được ở máy khác.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không nên lưu dữ liệu người dùng cạnh tệp chương trình?',
          a: 'Thư mục cài đặt thường chỉ đọc với người dùng thường, và gỡ cài đặt sẽ xoá luôn dữ liệu của họ.',
        },
        {
          q: 'Thư mục đệm khác thư mục dữ liệu ở chỗ nào?',
          a: 'Đệm là thứ xoá đi vẫn dựng lại được; dữ liệu là thứ mất đi thì không lấy lại được, phải sao lưu.',
        },
        {
          q: 'Vì sao chức năng xuất dữ liệu lại quan trọng với ứng dụng chạy tại máy?',
          a: 'Nó là đường thoát cho người dùng khi đổi máy hoặc khi ứng dụng ngừng phát triển, tạo lòng tin.',
        },
      ],
      doneSignals: [
        'Gỡ cài đặt ứng dụng không làm mất dữ liệu người dùng.',
        'Nâng cấp qua ba phiên bản liên tiếp không lần nào mất dữ liệu.',
      ],
    },
    {
      moduleId: 'desktop-s1-m4',
      objective:
        'Tạo được trình cài đặt cho ít nhất hai hệ điều hành và hiểu vì sao hệ thống cảnh báo phần mềm chưa ký.',
      practice: [
        'Dựng gói cài cho hai hệ rồi tự cài lên máy sạch của mỗi hệ và ghi lại cảnh báo hiện ra.',
        'Tìm hiểu chi phí và quy trình ký mã cho từng hệ, viết ra quyết định làm hay chưa làm kèm lý do.',
        'Cài cơ chế kiểm tra bản mới, thử tình huống mạng hỏng để chắc ứng dụng vẫn chạy bình thường.',
      ],
      selfCheck: [
        {
          q: 'Vì sao hệ điều hành cảnh báo khi cài phần mềm chưa ký?',
          a: 'Không có chữ ký thì không ai bảo đảm tệp đến từ bạn và chưa bị sửa trên đường tải về.',
        },
        {
          q: 'Cập nhật tự động cần cẩn thận điều gì nhất?',
          a: 'Bản cập nhật hỏng sẽ lan tới mọi người dùng cùng lúc, nên phải có đường quay lui và phát dần theo đợt.',
        },
        {
          q: 'Vì sao phải thử cài trên máy sạch chứ không phải máy phát triển?',
          a: 'Máy phát triển đã có sẵn thư viện và công cụ, nên gói thiếu phụ thuộc vẫn chạy được ở đó.',
        },
      ],
      doneSignals: [
        'Người khác tải gói cài về và cài xong mà không cần bạn hướng dẫn.',
        'Bạn biết chính xác người dùng thấy cảnh báo gì và vì sao.',
      ],
    },
  ],
  rubric: [
    {
      id: 'desktop-s1-r1',
      text: 'Có gói cài chạy được cho ít nhất hai hệ điều hành, cài thành công trên máy sạch của mỗi hệ.',
      howToProve:
        'Cài trên máy ảo sạch của từng hệ và quay lại toàn bộ quá trình từ lúc mở gói cài.',
    },
    {
      id: 'desktop-s1-r2',
      text: 'Xử lý mười nghìn tệp một lượt mà giao diện không đứng, luôn hiện tiến độ và huỷ giữa chừng được.',
      howToProve:
        'Chạy thật trên mười nghìn tệp, quay màn hình cho thấy giao diện còn phản hồi và bấm huỷ dừng được.',
    },
    {
      id: 'desktop-s1-r3',
      text: 'Không thao tác nào làm mất tệp gốc: mọi thay đổi hàng loạt đều hoàn tác lại được về nguyên trạng.',
      howToProve:
        'Đổi tên hàng loạt rồi bấm hoàn tác, so danh sách tên tệp trước và sau cho thấy trùng khớp.',
    },
    {
      id: 'desktop-s1-r4',
      text: 'Ứng dụng chạy đầy đủ khi không có mạng và lưu dữ liệu vào đúng thư mục chuẩn của từng hệ.',
      howToProve:
        'Ngắt mạng rồi dùng trọn một luồng, và chỉ ra đường dẫn thư mục dữ liệu thật trên từng hệ.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Công cụ xử lý hàng loạt tệp tại máy: đổi tên theo mẫu và chuyển định dạng ảnh.',
      'Hiện tiến độ, cho huỷ giữa chừng và hoàn tác được toàn bộ một lượt xử lý.',
      'Gói cài cho ít nhất hai hệ điều hành.',
    ],
    scopeDont: [
      'KHÔNG đồng bộ lên đám mây, vì trọng tâm chặng là làm việc an toàn với tệp tại máy người dùng.',
      'KHÔNG ký mã ở chặng này, chi phí và thủ tục không dạy thêm kỹ năng lập trình nào.',
      'KHÔNG làm chỉnh sửa ảnh nâng cao, chuyển định dạng là đủ để học phần xử lý hàng loạt.',
    ],
    touchpoints: [
      'Tầng giao diện: chọn thư mục, xem trước kết quả, thanh tiến độ và nút huỷ.',
      'Tầng xử lý chạy nền, tách hẳn khỏi luồng giao diện.',
      'Tầng lưu trữ: cơ sở dữ liệu nhúng ghi nhật ký thao tác để hoàn tác.',
    ],
    contracts: [
      'Mọi thao tác ghi tệp đi qua một hàm duy nhất ghi tệp tạm rồi đổi tên.',
      'Mỗi lượt xử lý ghi một bản ghi nhật ký đủ để hoàn tác ngược lại từng tệp.',
      'Đường dẫn luôn ghép bằng hàm của thư viện, không nối chuỗi bằng tay.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng quay màn hình kèm theo.',
      'Người khác cài gói trên máy họ và chạy được một lượt xử lý thật.',
    ],
    invariants: [
      'Không bao giờ ghi đè tệp gốc mà chưa ghi xong bản nhật ký hoàn tác.',
      'Giao diện không bao giờ đứng quá một phần tư giây khi đang xử lý.',
      'Ứng dụng không gửi bất kỳ dữ liệu nào ra mạng.',
    ],
    conventions: [
      'Việc nặng luôn chạy ngoài luồng giao diện, không có ngoại lệ.',
      'Thông báo lỗi nói rõ tệp nào hỏng và vì sao, không gộp thành một câu chung.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

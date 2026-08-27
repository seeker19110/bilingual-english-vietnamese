// details/mobile-s4.ts — Chi tiết chặng S4 hướng DI ĐỘNG ("Chuyên gia — quy mô và nền tảng").
// Bản đồ chặng ở ../mobile.ts.
//
// Ràng buộc riêng của nền tảng di động, chi phối toàn chặng: bản đã phát hành nằm TRÊN MÁY
// NGƯỜI DÙNG và bạn không gỡ về được. Người ta có thể dùng bản sáu tháng tuổi, và chợ ứng
// dụng duyệt mất vài ngày. Nên mọi bài luyện ở đây xoay quanh phát hành an toàn và sửa từ xa.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MOBILE_S4_DETAIL: SpecStageDetail = {
  stageId: 'mobile-s4',
  modules: [
    {
      moduleId: 'mobile-s4-m1',
      objective:
        'Phát hành app một cách chuyên nghiệp: tự động hoá việc nộp chợ và dừng được bản hỏng trước khi nó lan rộng.',
      practice: [
        'Dựng đường ống tự build, chạy test và nộp bản mới lên chợ mà không thao tác tay.',
        'Phát hành theo tỉ lệ nhỏ và đặt điều kiện dừng tự động khi tỉ lệ lỗi vượt ngưỡng.',
        'Thử một luồng cập nhật bắt buộc: giả lập máy đang chạy bản cũ hết hỗ trợ và kiểm cách app xử lý.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phát hành theo tỉ lệ quan trọng với app di động hơn với web?',
          a: 'Vì bản lỗi đã cài lên máy người dùng không gỡ về được, và bản vá còn phải chờ chợ duyệt.',
        },
        {
          q: 'Máy chủ phải làm gì với bản app rất cũ còn ngoài thị trường?',
          a: 'Giữ tương thích ngược hoặc trả về thông báo buộc cập nhật rõ ràng, không được trả lỗi khó hiểu.',
        },
      ],
      doneSignals: [
        'Một bản mới lên chợ mà không ai phải bấm tay ngoài bước duyệt của chợ.',
        'Bạn dừng được một đợt phát hành đang lan khi thấy tỉ lệ lỗi tăng.',
      ],
    },
    {
      moduleId: 'mobile-s4-m2',
      objective:
        'Biết app đang chạy ra sao trên máy người dùng thật: đọc được sự cố, số đo trải nghiệm và thử nghiệm từ xa.',
      practice: [
        'Bật thu thập sự cố, tải bản đồ giải mã và xác nhận đọc được vết lỗi đã làm rối mã.',
        'Đo thời gian khởi động lạnh, tỉ lệ treo giao diện và tỉ lệ lỗi mạng theo dòng máy phổ biến ở Việt Nam.',
        'Bọc một tính năng sau cờ bật tắt, đổi trạng thái từ xa mà không phát hành bản mới.',
      ],
      selfCheck: [
        {
          q: 'Vì sao vết lỗi từ bản phát hành thường không đọc được trực tiếp?',
          a: 'Vì mã đã bị rút gọn và làm rối tên, phải có bản đồ giải mã đúng phiên bản mới dịch ngược được.',
        },
        {
          q: 'Cờ tính năng cứu bạn khỏi điều gì trên di động?',
          a: 'Khỏi phải chờ chợ duyệt bản vá, vì tắt tính năng hỏng được ngay từ xa.',
        },
      ],
      doneSignals: [
        'Bạn nói được tỉ lệ phiên bị sự cố của bản đang phát hành, bằng số.',
        'Tắt được một tính năng hỏng trong vài phút mà không cần phát hành bản mới.',
      ],
    },
    {
      moduleId: 'mobile-s4-m3',
      objective:
        'Dùng chung được logic giữa các nền tảng mà không đánh mất trải nghiệm gốc của từng hệ điều hành.',
      practice: [
        'Tách phần logic không phụ thuộc giao diện thành một lõi dùng chung cho cả hai nền tảng.',
        'Viết một module gốc cho phần mà cầu nối chung không đáp ứng nổi, đo chênh lệch hiệu năng.',
        'Đóng gói phần dùng chung thành thư viện nội bộ có phiên bản và cho ít nhất hai app dùng.',
      ],
      selfCheck: [
        {
          q: 'Phần nào của app nên dùng chung và phần nào nên viết riêng cho từng nền tảng?',
          a: 'Logic nghiệp vụ và mô hình dữ liệu nên dùng chung; điều hướng và thành phần giao diện nên theo chuẩn từng hệ.',
        },
        {
          q: 'Thư viện nội bộ cần gì để không thành gánh nặng cho đội dùng nó?',
          a: 'Cần phiên bản rõ ràng, ghi chú thay đổi và cam kết tương thích ngược trong một khoảng thời gian.',
        },
      ],
      doneSignals: [
        'Sửa một luật nghiệp vụ ở một chỗ là cả hai nền tảng cùng đúng.',
        'App vẫn giữ cảm giác gốc của từng hệ điều hành, người dùng không thấy lạ.',
      ],
    },
    {
      moduleId: 'mobile-s4-m4',
      objective:
        'Bảo vệ app di động ở mức hợp lý: bí mật để đúng chỗ, dữ liệu nhạy cảm không rò qua màn hình hay bản sao lưu.',
      practice: [
        'Rà toàn bộ khoá và bí mật trong app, chuyển thứ không được nằm ở client về máy chủ.',
        'Bật chống chụp màn cho màn hình nhạy cảm và kiểm dữ liệu nhạy cảm không lọt vào bản sao lưu tự động.',
        'Rà app theo danh sách rủi ro di động phổ biến và ghi lại rủi ro chấp nhận cùng lý do.',
      ],
      selfCheck: [
        {
          q: 'Vì sao giấu khoá bí mật trong mã app không phải là bảo mật?',
          a: 'Ai cũng dịch ngược được gói cài; thứ nằm trên máy người dùng phải coi như đã công khai.',
        },
        {
          q: 'Chống dịch ngược nên đặt kỳ vọng thế nào cho đúng?',
          a: 'Nó chỉ làm chậm người tấn công chứ không chặn được, nên không được thay thế cho kiểm quyền ở máy chủ.',
        },
      ],
      doneSignals: [
        'Không còn bí mật nào có giá trị nằm trong gói cài.',
        'Mọi quyết định quan trọng đều được máy chủ kiểm lại, không tin phía client.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mobile-s4-r1',
      text: 'App qua duyệt và tải công khai được trên ít nhất một chợ ứng dụng lớn.',
      howToProve: 'Dán liên kết trang app trên chợ và ngày bản đầu tiên được duyệt.',
    },
    {
      id: 'mobile-s4-r2',
      text: 'Đường ống tự build, chạy test và nộp bản mới lên chợ không cần thao tác tay.',
      howToProve: 'Dán nhật ký một lần chạy đầy đủ từ commit tới bản đã nộp.',
    },
    {
      id: 'mobile-s4-r3',
      text: 'Có bảng theo dõi sự cố và số đo khởi động sau phát hành, đọc được vết lỗi đã làm rối mã.',
      howToProve: 'Chụp bảng theo dõi kèm một vết lỗi đã giải mã tới đúng dòng mã nguồn.',
    },
    {
      id: 'mobile-s4-r4',
      text: 'Phát hành theo tỉ lệ có điều kiện dừng tự động khi tỉ lệ phiên bị sự cố vượt ngưỡng công bố.',
      howToProve: 'Dán cấu hình ngưỡng và một lần đợt phát hành bị dừng hoặc mô phỏng dừng.',
    },
    {
      id: 'mobile-s4-r5',
      text: 'Không còn bí mật có giá trị nằm trong gói cài, mọi kiểm quyền đều thực hiện ở máy chủ.',
      howToProve: 'Dịch ngược gói cài của chính mình và chỉ ra không tìm được khoá dùng được.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Đưa một app thật lên chợ ứng dụng với quy trình phát hành tự động.',
      'Theo dõi sự cố và trải nghiệm từ xa sau phát hành.',
      'Bọc tính năng rủi ro sau cờ bật tắt điều khiển từ xa.',
    ],
    scopeDont: [
      'Không hỗ trợ mọi phiên bản hệ điều hành cũ, vì chi phí kiểm thử vượt xa số người dùng thu được.',
      'Không dựa vào làm rối mã để bảo vệ dữ liệu, đó chỉ là rào chậm chứ không phải bảo mật.',
      'Không phát hành đồng loạt cho toàn bộ người dùng ngay lần đầu.',
    ],
    touchpoints: [
      'Đường ống build và cấu hình nộp chợ.',
      'Tầng gọi API và nơi xử lý bản app cũ còn ngoài thị trường.',
      'Nơi khai cờ tính năng và nơi thu thập sự cố.',
    ],
    contracts: [
      'API giữ tương thích ngược cho các bản app còn được hỗ trợ, hoặc trả mã buộc cập nhật rõ ràng.',
      'Cờ tính năng có giá trị mặc định an toàn khi không lấy được cấu hình từ xa.',
      'Dữ liệu nhạy cảm không ghi vào log và không vào bản sao lưu tự động.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng kiểm lại được.',
      'App chạy đúng trên ít nhất ba dòng máy phổ biến khác nhau.',
    ],
    invariants: [
      'Người dùng bản cũ không bao giờ gặp màn hình lỗi không hiểu được.',
      'Không quyết định nghiệp vụ quan trọng nào chỉ dựa vào phía client.',
    ],
    conventions: [
      'Vùng chạm tối thiểu 44px và thiết kế cho màn nhỏ trước.',
      'Mọi bản phát hành có ghi chú thay đổi và phiên bản tăng theo quy ước.',
    ],
  },
}

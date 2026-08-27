// details/desktop-s2.ts — Chi tiết chặng S2 hướng DESKTOP ("ứng dụng có chiều sâu").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DESKTOP_S2_DETAIL: SpecStageDetail = {
  stageId: 'desktop-s2',
  modules: [
    {
      moduleId: 'desktop-s2-m1',
      objective:
        'Đưa được việc nặng ra khỏi luồng giao diện, có báo tiến độ và huỷ được giữa chừng.',
      practice: [
        'Chuyển thao tác xử lý mười nghìn tệp sang luồng nền, giao diện vẫn kéo thả được trong lúc chạy.',
        'Thêm nút huỷ thật sự dừng công việc chứ không chỉ ẩn thanh tiến độ.',
        'Hiển thị tiến độ và ước lượng thời gian còn lại dựa trên tốc độ thực tế.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tuyệt đối không chạy việc dài trên luồng giao diện?',
          a: 'Cửa sổ ngừng vẽ và ngừng nhận sự kiện, hệ điều hành báo ứng dụng không phản hồi.',
        },
        {
          q: 'Huỷ một công việc đang chạy cần chú ý gì?',
          a: 'Phải dừng ở điểm an toàn và dọn dẹp tài nguyên, tránh để lại tệp tạm hay dữ liệu nửa chừng.',
        },
      ],
      doneSignals: [
        'Giao diện không bao giờ đứng dù đang xử lý nặng.',
        'Bấm huỷ là công việc dừng thật, kiểm được bằng mức dùng bộ xử lý.',
      ],
    },
    {
      moduleId: 'desktop-s2-m2',
      objective:
        'Xây được trải nghiệm chuyên nghiệp: hoàn tác nhiều bước, phím tắt và thao tác hàng loạt.',
      practice: [
        'Cài hoàn tác và làm lại tối thiểu hai mươi bước bằng cách lưu thao tác chứ không lưu toàn bộ trạng thái.',
        'Gán phím tắt cho mười thao tác hay dùng, theo quy ước của hệ điều hành.',
        'Thêm bảng lệnh tìm nhanh mọi chức năng bằng bàn phím.',
      ],
      selfCheck: [
        {
          q: 'Vì sao nên lưu thao tác thay vì lưu toàn bộ trạng thái để hoàn tác?',
          a: 'Bộ nhớ tăng theo số bước chứ không theo kích thước dữ liệu, và ghi lại được cả lịch sử thao tác.',
        },
        {
          q: 'Phím tắt tự nghĩ ra có vấn đề gì?',
          a: 'Người dùng đã có thói quen từ ứng dụng khác; lệch quy ước làm họ bấm nhầm liên tục.',
        },
      ],
      doneSignals: [
        'Người dùng thành thạo làm được mọi việc chính không cần chuột.',
        'Hoàn tác đi ngược đủ hai mươi bước không sai lệch dữ liệu.',
      ],
    },
    {
      moduleId: 'desktop-s2-m3',
      objective:
        'Cài được đồng bộ tuỳ chọn lên đám mây, giải quyết xung đột khi hai máy sửa cùng dữ liệu.',
      practice: [
        'Giữ ngoại tuyến làm mặc định: tắt mạng vẫn dùng đủ chức năng.',
        'Tạo xung đột thật bằng cách sửa cùng bản ghi ở hai máy, cài màn hình cho người dùng chọn.',
        'Mã hoá dữ liệu trước khi gửi lên đám mây và kiểm bằng cách đọc gói tin.',
      ],
      selfCheck: [
        {
          q: 'Vì sao ứng dụng desktop nên coi ngoại tuyến là mặc định?',
          a: 'Người dùng chọn desktop vì muốn làm việc được không phụ thuộc mạng; bắt buộc trực tuyến là mất lý do tồn tại.',
        },
        {
          q: 'Xung đột đồng bộ nên để máy tự quyết hay hỏi người dùng?',
          a: 'Tự quyết khi quy tắc rõ ràng và không mất dữ liệu; còn lại phải hỏi, vì đoán sai là mất công sức của họ.',
        },
      ],
      doneSignals: [
        'Rút mạng vẫn làm việc bình thường, cắm lại thì đồng bộ.',
        'Không tình huống đồng bộ nào âm thầm ghi đè dữ liệu người dùng.',
      ],
    },
    {
      moduleId: 'desktop-s2-m4',
      objective:
        'Chẩn đoán được sự cố trên máy người dùng qua nhật ký họ tự gửi, và có chế độ an toàn khi cấu hình hỏng.',
      practice: [
        'Ghi nhật ký cục bộ có xoay vòng, thêm nút xuất nhật ký cho người dùng gửi về.',
        'Hỏi ý kiến trước khi gửi báo cáo lỗi, hiện rõ dữ liệu sẽ gửi đi.',
        'Cài chế độ an toàn khởi động với cấu hình mặc định khi tệp cấu hình hỏng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải xin phép trước khi gửi báo cáo lỗi?',
          a: 'Nhật ký có thể chứa đường dẫn và tên tệp riêng tư; gửi lén là vi phạm lòng tin và thường cả quy định.',
        },
        {
          q: 'Chế độ an toàn giải quyết tình huống nào?',
          a: 'Cấu hình hoặc phần mở rộng hỏng làm ứng dụng chết ngay khi khởi động, người dùng không vào được để sửa.',
        },
      ],
      doneSignals: [
        'Nhận nhật ký người dùng gửi là chẩn đoán được, không phải hỏi thêm nhiều vòng.',
        'Làm hỏng tệp cấu hình thì ứng dụng vẫn mở được ở chế độ an toàn.',
      ],
    },
  ],
  rubric: [
    {
      id: 'desktop-s2-r1',
      text: 'Hoàn tác được ít nhất hai mươi bước, làm lại đúng như cũ.',
      howToProve:
        'Kịch bản kiểm thử thực hiện hai mươi lăm thao tác rồi hoàn tác hết, so khớp trạng thái ban đầu.',
    },
    {
      id: 'desktop-s2-r2',
      text: 'Xử lý mười nghìn tệp mà giao diện không đứng và huỷ được giữa chừng.',
      howToProve:
        'Quay màn hình thao tác trong lúc chạy và biểu đồ mức dùng bộ xử lý sau khi bấm huỷ.',
    },
    {
      id: 'desktop-s2-r3',
      text: 'Không bao giờ mất dữ liệu gốc: mọi thao tác phá huỷ đều hoàn tác hoặc phục hồi được.',
      howToProve:
        'Kịch bản giết tiến trình giữa lúc ghi hai mươi lần, mỗi lần kiểm dữ liệu gốc còn nguyên.',
    },
    {
      id: 'desktop-s2-r4',
      text: 'Chạy được ngoại tuyến hoàn toàn; đồng bộ là tuỳ chọn bật tắt.',
      howToProve: 'Ngắt mạng và thực hiện trọn một quy trình công việc, quay lại video.',
    },
    {
      id: 'desktop-s2-r5',
      text: 'Cài đặt được trên máy sạch của cả hai hệ điều hành mục tiêu.',
      howToProve:
        'Cài trên máy ảo mới dựng cho từng hệ điều hành, dán ảnh chụp màn hình chạy được.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Công cụ chuyên dụng cho một nghề cụ thể, chạy ngoại tuyến là chính.',
      'Hoàn tác nhiều bước, phím tắt, thao tác hàng loạt.',
      'Đồng bộ đám mây tuỳ chọn và cơ chế chẩn đoán từ xa.',
    ],
    scopeDont: [
      'KHÔNG làm bản web song song — hai nền tảng cùng lúc ở chặng này là chắc chắn trễ cả hai.',
      'KHÔNG làm hệ thống tài khoản riêng nếu chưa cần đồng bộ nhiều người.',
      'KHÔNG hỗ trợ hệ điều hành thứ ba ngoài hai hệ đã chọn.',
    ],
    touchpoints: [
      'Lõi nghiệp vụ thuần, không phụ thuộc khung giao diện.',
      'Lớp lưu trữ cục bộ và lớp đồng bộ tách bạch.',
      'Module nhật ký và chế độ an toàn nằm ở đường khởi động.',
    ],
    contracts: [
      'Mỗi thao tác của người dùng biểu diễn thành một lệnh có thể áp dụng và đảo ngược.',
      'Tệp dữ liệu có số phiên bản; mở tệp phiên bản mới hơn thì báo rõ, không cố đọc.',
      'Gói đồng bộ mã hoá trước khi rời máy, khoá không bao giờ rời máy người dùng.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có video hoặc ảnh chụp kèm theo.',
      'Một người ngoài cài và dùng được theo hướng dẫn của bạn.',
    ],
    invariants: [
      'Không thao tác nào làm mất dữ liệu gốc mà không có đường phục hồi.',
      'Ứng dụng luôn khởi động được, kể cả khi cấu hình hỏng.',
      'Không dữ liệu nào rời máy khi người dùng chưa bật đồng bộ.',
    ],
    conventions: [
      'Theo quy ước phím tắt và bố cục của từng hệ điều hành, không tự chế.',
      'Trợ năng bàn phím đầy đủ cho mọi chức năng chính.',
      'Ghi nhật ký có ngữ cảnh nhưng không ghi nội dung dữ liệu người dùng.',
    ],
  },
}

// details/desktop-s4.ts — Chi tiết chặng S4 hướng DESKTOP ("Chuyên gia — sản phẩm phần mềm bán
// được"). Bản đồ chặng ở ../desktop.ts.
//
// Chặng này ít về kỹ thuật cửa sổ và nhiều về VIỆC BÁN ĐƯỢC MỘT SẢN PHẨM: cấp phép, cập nhật
// an toàn trên máy người lạ, và hỗ trợ người dùng không kỹ thuật. Điểm khác web quan trọng
// nhất: dữ liệu nằm trên máy người dùng, nên di trú sai là mất dữ liệu của họ chứ không phải
// của bạn — và không có bản sao lưu nào ở phía bạn để khôi phục.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DESKTOP_S4_DETAIL: SpecStageDetail = {
  stageId: 'desktop-s4',
  modules: [
    {
      moduleId: 'desktop-s4-m1',
      objective:
        'Chọn được kênh phân phối và cơ chế cấp phép phù hợp, kể cả khi máy người dùng không nối mạng.',
      practice: [
        'So chi phí và ràng buộc giữa bán qua cửa hàng ứng dụng và bán trực tiếp, chọn một và ghi lý do.',
        'Cài cơ chế kích hoạt giấy phép hoạt động được cả khi offline, thử chỉnh đồng hồ máy để xem bản dùng thử có bị kéo dài không.',
        'Viết chính sách hoàn tiền và điều kiện bản dùng thử, đủ rõ để không phải tranh cãi với khách.',
      ],
      selfCheck: [
        {
          q: 'Vì sao chống bẻ khoá tuyệt đối là mục tiêu sai?',
          a: 'Phần mềm chạy trên máy người khác thì luôn bẻ được; đầu tư quá mức chỉ làm phiền khách hàng thật.',
        },
        {
          q: 'Kích hoạt offline cần chống được mẹo nào?',
          a: 'Chống việc chỉnh lùi đồng hồ máy để kéo dài bản dùng thử vô hạn.',
        },
      ],
      doneSignals: [
        'Khách mua xong dùng được ngay cả khi mạng chập chờn.',
        'Bạn nói được vì sao chọn kênh phân phối này, kèm con số chi phí.',
      ],
    },
    {
      moduleId: 'desktop-s4-m2',
      objective:
        'Cập nhật an toàn trên máy người lạ: di trú dữ liệu qua nhiều phiên bản và quay lui được khi bản mới hỏng.',
      practice: [
        'Dựng hai kênh phát hành ổn định và thử nghiệm, cho một nhóm nhỏ nhận bản mới trước.',
        'Viết di trú dữ liệu từ phiên bản cũ nhất còn hỗ trợ tới bản mới nhất, chạy thử trên dữ liệu thật đã sao lưu.',
        'Thử kịch bản cập nhật hỏng giữa chừng và xác nhận người dùng vẫn mở được dữ liệu của họ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao di trú dữ liệu trên desktop rủi ro hơn trên máy chủ?',
          a: 'Dữ liệu nằm trên máy người dùng, bạn không có bản sao lưu và không chạy lại được bản sửa cho tất cả.',
        },
        {
          q: 'Trước khi di trú dữ liệu người dùng nên làm gì đầu tiên?',
          a: 'Tạo bản sao dữ liệu cũ ngay trên máy họ, để hỏng thì còn đường quay lại.',
        },
        {
          q: 'Người dùng nhảy cóc nhiều phiên bản thì xử lý ra sao?',
          a: 'Chạy tuần tự các bước di trú theo thứ tự phiên bản, không viết đường tắt riêng cho từng cặp.',
        },
      ],
      doneSignals: [
        'Người dùng bản cũ hai năm vẫn mở được dữ liệu sau khi cập nhật.',
        'Bản hỏng được rút lại trong ngày và người đã cài quay lui được.',
      ],
    },
    {
      moduleId: 'desktop-s4-m3',
      objective:
        'Giữ an toàn cho máy khách hàng: xác minh bản cập nhật, xin đúng quyền cần và để dữ liệu ở lại máy họ.',
      practice: [
        'Ký bản cài và bản cập nhật, thử cài một bản bị sửa để xác nhận hệ thống từ chối.',
        'Rà lại toàn bộ quyền app đang xin và bỏ mọi quyền không thật sự cần, kiểm app vẫn chạy đúng.',
        'Rà các thư viện phụ thuộc và dựng quy trình cập nhật khi một thư viện lộ lỗ hổng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao app desktop không nên chạy với quyền quản trị?',
          a: 'Một lỗi nhỏ hoặc một thư viện bị chèn mã sẽ có toàn quyền trên máy khách hàng.',
        },
        {
          q: 'Ký bản cập nhật ngăn được tấn công nào?',
          a: 'Ngăn kẻ tấn công thay bản cập nhật trên đường truyền hoặc trên máy chủ tải về bằng bản có mã độc.',
        },
      ],
      doneSignals: [
        'Bản cài không ký hoặc bị sửa đều bị từ chối trên máy người dùng.',
        'App chạy đúng với bộ quyền tối thiểu, không đòi quyền quản trị để làm việc thường ngày.',
      ],
    },
    {
      moduleId: 'desktop-s4-m4',
      objective:
        'Hỗ trợ được người dùng không kỹ thuật: tái hiện lỗi từ mô tả mơ hồ và biến yêu cầu thật thành lộ trình sản phẩm.',
      practice: [
        'Thêm chức năng xuất báo cáo chẩn đoán một chạm để người dùng gửi kèm khi báo lỗi.',
        'Nhận một mô tả lỗi mơ hồ và tự đặt câu hỏi cho tới khi tái hiện được, ghi lại bộ câu hỏi đó thành mẫu.',
        'Gom yêu cầu người dùng trong một tháng, xếp theo số người bị ảnh hưởng rồi chọn ba việc làm trước.',
      ],
      selfCheck: [
        {
          q: 'Vì sao báo cáo chẩn đoán một chạm đáng làm sớm?',
          a: 'Vì người không kỹ thuật không mô tả được môi trường máy họ, và thiếu thông tin đó thì không tái hiện được lỗi.',
        },
        {
          q: 'Yêu cầu tính năng của người dùng nên đọc thế nào cho đúng?',
          a: 'Đọc lấy vấn đề đằng sau chứ không làm đúng giải pháp họ đề xuất, vì họ mô tả cách sửa mà họ nghĩ ra được.',
        },
      ],
      doneSignals: [
        'Phần lớn lỗi báo về tái hiện được mà không cần trao đổi qua lại nhiều vòng.',
        'Lộ trình sản phẩm của bạn có số người bị ảnh hưởng đứng sau mỗi mục.',
      ],
    },
  ],
  rubric: [
    {
      id: 'desktop-s4-r1',
      text: 'Có bản cài đã ký cho ít nhất hai hệ điều hành, cài chạy được trên máy sạch chưa từng cài công cụ lập trình.',
      howToProve: 'Cài thử trên máy ảo sạch của từng hệ điều hành và quay lại toàn bộ quá trình.',
    },
    {
      id: 'desktop-s4-r2',
      text: 'Cập nhật tự động chạy thật qua ít nhất ba phiên bản liên tiếp, không cần người dùng tải lại bản cài.',
      howToProve:
        'Quay video một máy đi từ phiên bản đầu tới phiên bản cuối chỉ bằng cập nhật tự động.',
    },
    {
      id: 'desktop-s4-r3',
      text: 'Di trú dữ liệu người dùng qua các phiên bản không mất mát, có test chạy trên dữ liệu thật đã sao lưu.',
      howToProve: 'Chạy bộ test di trú và so số bản ghi cùng nội dung trước sau khi di trú.',
    },
    {
      id: 'desktop-s4-r4',
      text: 'Có kênh phát hành thử nghiệm riêng và một lần rút lại bản hỏng trong vòng một ngày.',
      howToProve:
        'Dán lịch sử phát hành cho thấy bản bị rút và thời điểm người dùng quay lui được.',
    },
    {
      id: 'desktop-s4-r5',
      text: 'App chạy đúng với bộ quyền tối thiểu và không yêu cầu quyền quản trị cho thao tác thường ngày.',
      howToProve: 'Chạy app bằng tài khoản người dùng thường và làm trọn một luồng chính.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Hoàn thiện một phần mềm desktop có cấp phép, cập nhật tự động và kênh hỗ trợ.',
      'Bảo đảm di trú dữ liệu người dùng an toàn qua nhiều phiên bản.',
      'Xây quy trình nhận và xử lý báo lỗi từ người không kỹ thuật.',
    ],
    scopeDont: [
      'Không đầu tư sâu vào chống bẻ khoá, vì phần mềm chạy trên máy người khác thì luôn bẻ được và khách hàng thật chịu phiền.',
      'Không đổi định dạng lưu dữ liệu cùng lúc với đợt đổi giao diện lớn.',
      'Không gửi dữ liệu người dùng về máy chủ nếu tính năng không thật sự cần.',
    ],
    touchpoints: [
      'Bộ cài đặt, cơ chế cập nhật và nơi kiểm chữ ký.',
      'Lớp đọc ghi dữ liệu trên máy người dùng và các bước di trú.',
      'Kênh báo lỗi và chức năng xuất báo cáo chẩn đoán.',
    ],
    contracts: [
      'Định dạng lưu dữ liệu có số phiên bản; bản mới đọc được dữ liệu của các bản còn hỗ trợ.',
      'Bản cập nhật phải có chữ ký hợp lệ mới được cài.',
      'Báo cáo chẩn đoán không chứa nội dung tài liệu của người dùng.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí kiểm lại được trên máy sạch.',
      'Có ít nhất năm người ngoài đã cài và dùng thật, kèm phản hồi ghi lại.',
    ],
    invariants: [
      'Không bao giờ mất dữ liệu người dùng khi cập nhật, kể cả khi cập nhật hỏng giữa chừng.',
      'Dữ liệu ở lại trên máy người dùng trừ phần họ đã đồng ý gửi đi.',
    ],
    conventions: [
      'Sao lưu dữ liệu cũ trước mọi bước di trú.',
      'Mỗi bản phát hành có ghi chú thay đổi viết cho người dùng cuối, không viết cho lập trình viên.',
    ],
  },
}

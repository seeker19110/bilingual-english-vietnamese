// details/backend-s2.ts — Chi tiết chặng S2 hướng BACKEND ("Dữ liệu và đồng thời").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const BACKEND_S2_DETAIL: SpecStageDetail = {
  stageId: 'backend-s2',
  modules: [
    {
      moduleId: 'backend-s2-m1',
      objective:
        'Chọn đúng mức cô lập transaction và cách khoá cho từng nghiệp vụ, giải thích được vì sao chọn thế.',
      practice: [
        'Tái hiện lỗi mất cập nhật bằng hai phiên chạy song song, rồi sửa bằng khoá lạc quan có cột phiên bản.',
        'Chạy cùng một nghiệp vụ ở hai mức cô lập khác nhau và ghi lại khác biệt quan sát được.',
        'Đọc kế hoạch thực thi của ba truy vấn nặng nhất, thêm index tổ hợp đúng thứ tự cột.',
      ],
      selfCheck: [
        {
          q: 'Khoá lạc quan hợp với tình huống nào hơn khoá bi quan?',
          a: 'Khi tranh chấp hiếm: cho làm trước rồi kiểm phiên bản lúc ghi, tránh giữ khoá lâu làm nghẽn.',
        },
        {
          q: 'Thứ tự cột trong index tổ hợp có quan trọng không?',
          a: 'Rất quan trọng: truy vấn chỉ dùng được tiền tố trái của index, sai thứ tự là index nằm chơi.',
        },
      ],
      doneSignals: [
        'Viết được test tái hiện tranh chấp và test đó đỏ khi bỏ cơ chế khoá.',
        'Nói được mỗi truy vấn nóng đang dùng index nào.',
      ],
    },
    {
      moduleId: 'backend-s2-m2',
      objective: 'Thêm được lớp cache đúng chỗ và chứng minh nó không trả dữ liệu sai sau khi ghi.',
      practice: [
        'Cài cache-aside cho một truy vấn nóng, đo tỷ lệ trúng cache sau một giờ chạy thật.',
        'Tạo tình huống nhiều yêu cầu cùng lúc khi cache vừa hết hạn, chặn bằng khoá một-người-tính.',
        'Liệt kê ba loại dữ liệu trong hệ thống KHÔNG được cache và lý do.',
      ],
      selfCheck: [
        {
          q: 'Vì sao "hết hạn theo thời gian" chưa đủ khi dữ liệu vừa bị sửa?',
          a: 'Trong khoảng còn hạn người dùng vẫn thấy bản cũ; thao tác ghi phải chủ động xoá hoặc cập nhật khoá cache.',
        },
        {
          q: 'Cache stampede xảy ra thế nào?',
          a: 'Khoá hết hạn đúng lúc lưu lượng cao, hàng loạt yêu cầu cùng lao xuống CSDL và làm nó gục.',
        },
      ],
      doneSignals: [
        'Sửa dữ liệu là màn hình phản ánh ngay, không phải chờ hết hạn.',
        'Có số đo tỷ lệ trúng cache, không nói cảm tính.',
      ],
    },
    {
      moduleId: 'backend-s2-m3',
      objective:
        'Đưa được việc nặng ra hàng đợi chạy nền, xử lý đúng khi thông điệp bị giao lại nhiều lần.',
      practice: [
        'Chuyển việc gửi email sang hàng đợi, thử giao lại cùng thông điệp ba lần và xác nhận chỉ gửi một email.',
        'Dựng hàng đợi thư chết và thử lại có giãn cách tăng dần cho việc hỏng.',
        'Cho việc định kỳ chạy trên hai tiến trình cùng lúc, bảo đảm chỉ một tiến trình thực thi.',
      ],
      selfCheck: [
        {
          q: 'Vì sao "giao ít nhất một lần" buộc việc xử lý phải lặp lại được?',
          a: 'Hệ hàng đợi có thể giao lại khi chưa nhận được xác nhận, nên xử lý hai lần phải cho cùng kết quả.',
        },
        {
          q: 'Hàng đợi thư chết dùng để làm gì?',
          a: 'Giữ thông điệp hỏng sau nhiều lần thử để không chặn hàng đợi chính và còn dữ liệu mà điều tra.',
        },
      ],
      doneSignals: [
        'Tắt tiến trình xử lý giữa chừng rồi bật lại, không mất và không nhân đôi việc.',
        'Có bảng đếm số việc thành công, thất bại, đang chờ.',
      ],
    },
    {
      moduleId: 'backend-s2-m4',
      objective:
        'Viết được mã đồng thời có giới hạn tài nguyên và tái hiện được tranh chấp trong test.',
      practice: [
        'Bắn 100 yêu cầu đồng thời vào một nghiệp vụ có giới hạn số lượng, kiểm không bao giờ vượt hạn mức.',
        'Đặt trần đồng thời cho lời gọi ra ngoài và quan sát hàng chờ khi vượt trần.',
        'Viết một test tái hiện deadlock rồi sửa bằng cách thống nhất thứ tự lấy khoá.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cần backpressure thay vì cứ nhận hết yêu cầu?',
          a: 'Nhận quá khả năng chỉ đẩy hàng chờ dài ra, tăng độ trễ rồi sập; từ chối sớm giữ hệ thống còn phục vụ được.',
        },
        {
          q: 'Cách đơn giản nhất tránh deadlock giữa hai khoá là gì?',
          a: 'Luôn lấy khoá theo cùng một thứ tự ở mọi nhánh mã.',
        },
      ],
      doneSignals: [
        'Test tải chạy trong CI và đỏ khi bỏ cơ chế bảo vệ.',
        'Biết hệ thống chịu được bao nhiêu yêu cầu đồng thời trước khi độ trễ vọt lên.',
      ],
    },
  ],
  rubric: [
    {
      id: 'backend-s2-r1',
      text: 'Chạy 100 yêu cầu giữ chỗ đồng thời trên 10 chỗ trống: không bao giờ có chỗ thứ 11 được bán.',
      howToProve: 'Test tải tự động chạy trong CI, in ra tổng số đặt thành công và số chỗ còn lại.',
    },
    {
      id: 'backend-s2-r2',
      text: 'Gửi lại cùng khoá lặp-lại-an-toàn không tạo bản ghi thứ hai.',
      howToProve:
        'Test gọi endpoint hai lần với cùng khoá, khẳng định số dòng trong bảng không đổi.',
    },
    {
      id: 'backend-s2-r3',
      text: 'Email xác nhận đi qua hàng đợi, hỏng thì thử lại và cuối cùng rơi vào hàng đợi thư chết.',
      howToProve:
        'Cố tình cho dịch vụ gửi mail trả lỗi, dán nhật ký ba lần thử và bản ghi cuối trong hàng đợi thư chết.',
    },
    {
      id: 'backend-s2-r4',
      text: 'Có số đo độ trễ p50/p95 trước và sau khi thêm cache hoặc index.',
      howToProve: 'Bảng hai cột trước–sau lấy từ công cụ đo tải, kèm lệnh đã chạy.',
    },
    {
      id: 'backend-s2-r5',
      text: 'Dựng lại toàn bộ hệ thống trên máy trắng bằng một lệnh.',
      howToProve:
        'Chạy trên máy sạch hoặc trong container mới, dán nhật ký từ lệnh đầu tới khi kiểm tra sức khoẻ trả về xanh.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Dịch vụ giữ chỗ có số lượng hữu hạn, chịu được nhiều người bấm cùng lúc.',
      'Hàng đợi việc nền cho thông báo, có thử lại và hàng đợi thư chết.',
      'Bộ đo độ trễ và tỷ lệ lỗi phơi ra ở một endpoint.',
    ],
    scopeDont: [
      'KHÔNG chia nhỏ thành nhiều dịch vụ — một dịch vụ làm đúng đã đủ khó, chia sớm là tự thêm lỗi mạng.',
      'KHÔNG làm giao diện đẹp; một trang thử nghiệm tối giản là đủ.',
      'KHÔNG dùng công nghệ mới chưa từng chạy chỉ để cho vào hồ sơ.',
    ],
    touchpoints: [
      'Tầng nghiệp vụ giữ chỗ: nơi duy nhất giảm số chỗ còn lại.',
      'Tầng truy cập dữ liệu: câu lệnh transaction và khoá.',
      'Tiến trình xử lý hàng đợi chạy tách khỏi tiến trình phục vụ HTTP.',
    ],
    contracts: [
      'Mọi endpoint ghi nhận khoá lặp-lại-an-toàn ở tiêu đề yêu cầu và trả cùng kết quả cho cùng khoá.',
      'Thông điệp trong hàng đợi có phiên bản schema để đổi định dạng không làm chết tiến trình cũ.',
      'Endpoint kiểm tra sức khoẻ trả trạng thái của CSDL và hàng đợi, không chỉ trả "ok".',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có nhật ký hoặc số đo kèm theo.',
      'Test tải nằm trong CI và chặn merge khi vi phạm hạn mức chỗ.',
    ],
    invariants: [
      'Số chỗ đã bán không bao giờ vượt sức chứa, kể cả khi có nhiều tiến trình.',
      'Việc trong hàng đợi xử lý hai lần cho cùng kết quả như một lần.',
      'Không mất việc khi tiến trình xử lý bị tắt đột ngột.',
    ],
    conventions: [
      'Logic nhạy cảm nằm ở server, không tin dữ liệu client gửi lên.',
      'Mọi thao tác có thể hỏng đều có nhánh lỗi và được ghi nhật ký có ngữ cảnh.',
      'Thay đổi schema đi kèm migration có phiên bản, quay lui được.',
    ],
  },
}

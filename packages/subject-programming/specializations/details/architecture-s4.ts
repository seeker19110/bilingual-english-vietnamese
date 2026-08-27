// details/architecture-s4.ts — Chi tiết chặng S4 hướng KIẾN TRÚC ("Chuyên gia — tiến hoá kiến
// trúc và dẫn dắt"). Bản đồ chặng ở ../architecture.ts.
//
// Đặc thù của hướng nền này: dự án chặng KHÔNG phải xây cái mới, mà là DẪN một hệ thống đang
// sống qua thay đổi lớn mà không dừng dịch vụ. Nên rubric bám vào "không downtime, có đường
// lui, NFR trước–sau không tụt" thay vì bám vào tính năng làm ra được.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ARCHITECTURE_S4_DETAIL: SpecStageDetail = {
  stageId: 'architecture-s4',
  modules: [
    {
      moduleId: 'architecture-s4-m1',
      objective:
        'Biến yêu cầu phi chức năng mơ hồ thành ngưỡng số kiểm được bằng máy, rồi gắn ngưỡng đó vào cổng CI.',
      practice: [
        'Lấy năm yêu cầu kiểu "phải nhanh, phải an toàn" của dự án và viết lại thành năm ngưỡng đo được.',
        'Gắn ít nhất hai ngưỡng vào cổng CI, cố ý vượt ngưỡng một lần để xác nhận cổng đỏ thật.',
        'Viết ra đánh đổi đi kèm mỗi ngưỡng: đạt nó thì đắt thêm ở đâu, ai trả cái giá đó.',
      ],
      selfCheck: [
        {
          q: 'Vì sao nói yêu cầu phi chức năng không đo được là yêu cầu không tồn tại?',
          a: 'Không đo được thì không ai chứng minh được đạt hay chưa, nên nó không bao giờ chặn được việc gì.',
        },
        {
          q: 'Ngưỡng chất lượng nên nằm trong tài liệu hay trong cổng tự động?',
          a: 'Trong cổng tự động, vì tài liệu không chặn được ai còn cổng đỏ thì buộc phải xử lý.',
        },
        {
          q: 'Đặt ngưỡng quá chặt ngay từ đầu gây hại gì?',
          a: 'Cổng đỏ liên miên vì lý do không đáng, cả đội học cách bỏ qua và cổng mất tác dụng thật.',
        },
      ],
      doneSignals: [
        'Mọi ngưỡng bạn công bố đều có một lệnh chạy ra con số để đối chiếu.',
        'Bạn từ chối được một yêu cầu mơ hồ bằng câu hỏi "đo bằng gì" thay vì tranh cãi cảm tính.',
      ],
    },
    {
      moduleId: 'architecture-s4-m2',
      objective:
        'Thay thế dần một phần lõi của hệ thống đang chạy bằng cây bóp cổ, không dừng dịch vụ và luôn có đường lui.',
      practice: [
        'Chọn một luồng thật, dựng đường đi mới song song và chuyển tỉ lệ nhỏ lưu lượng sang đó.',
        'Chạy đối chiếu hai đường trong một khoảng thời gian, ghi lại mọi ca kết quả lệch nhau.',
        'Viết kế hoạch quay lui TRƯỚC khi bắt đầu chuyển, gồm điều kiện quay lui và ai được quyết.',
      ],
      selfCheck: [
        {
          q: 'Vì sao viết lại hệ thống từ đầu gần như luôn thất bại?',
          a: 'Hệ cũ chứa hàng nghìn ca biên đã học được qua nhiều năm, bản mới không có, còn hệ cũ vẫn phải chạy tiếp.',
        },
        {
          q: 'Chạy song song hai đường xử lý để làm gì trước khi cắt đường cũ?',
          a: 'Để đối chiếu kết quả trên lưu lượng thật, phát hiện lệch mà không ai phải chịu hậu quả.',
        },
        {
          q: 'Di trú dữ liệu lớn không downtime cần điều kiện gì ở tầng ghi?',
          a: 'Giai đoạn ghi cả hai nơi, để lúc nào cũng có một nơi đúng và quay lui không mất dữ liệu.',
        },
      ],
      doneSignals: [
        'Chuyển từng lát và mỗi lát đều dừng lại được giữa chừng mà hệ thống vẫn phục vụ.',
        'Có bằng chứng đối chiếu hai đường trước khi cắt đường cũ, không cắt theo niềm tin.',
      ],
    },
    {
      moduleId: 'architecture-s4-m3',
      objective:
        'Giữ kiến trúc không rữa theo thời gian bằng số đo sức khoẻ và cổng tự động thay cho kỷ luật cá nhân.',
      practice: [
        'Đo sức khoẻ kiến trúc hiện tại: vòng phụ thuộc, điểm nóng bị import nhiều nhất, module phình to nhất.',
        'Lập sổ nợ kỹ thuật có ước lượng "lãi" phải trả mỗi tháng nếu để nguyên, rồi trả một khoản theo kế hoạch.',
        'Thêm một cổng chặn dạng lỗi vừa gặp, để chính lỗi đó không quay lại lần thứ hai.',
      ],
      selfCheck: [
        {
          q: 'Kiến trúc rữa dần chủ yếu vì lý do gì?',
          a: 'Vì từng ngoại lệ nhỏ được cho qua với lý do chỉ lần này thôi, cộng dồn lại thành ranh giới không còn nghĩa.',
        },
        {
          q: 'Vòng phụ thuộc giữa các module gây hại cụ thể ra sao?',
          a: 'Không tách ra để test hay tái dùng được, và một thay đổi nhỏ lan sang cả vòng.',
        },
      ],
      doneSignals: [
        'Có một trang số liệu sức khoẻ kiến trúc cập nhật được, không phải đo lại bằng tay mỗi lần.',
        'Nợ kỹ thuật được trả theo kế hoạch chứ không đợi tới lúc không sửa nổi nữa.',
      ],
    },
    {
      moduleId: 'architecture-s4-m4',
      objective:
        'Chia được việc cho nhiều bên thi hành cùng lúc mà không đụng nhau, và chất lượng không phụ thuộc người viết đặc tả.',
      practice: [
        'Cắt một đợt việc thành các đặc tả kín, mỗi đặc tả đúng một ranh giới module để hai bên làm song song không xung đột.',
        'Chuẩn hoá khuôn đặc tả và khuôn nghiệm thu, rồi nhờ người khác thi hành thử một đặc tả của bạn.',
        'Ghi lại trạng thái dự án sao cho người tiếp quản đọc là đủ, không phải hỏi lại bạn.',
      ],
      selfCheck: [
        {
          q: 'Dấu hiệu nào cho thấy đặc tả của bạn chưa kín?',
          a: 'Bên thi hành phải hỏi lại hoặc tự đoán, và mỗi lượt thi hành lại ra một kết quả khác nhau.',
        },
        {
          q: 'Khi nào thì tự tay làm rẻ hơn viết đặc tả giao đi?',
          a: 'Khi việc nhỏ và dính chặt ngữ cảnh đang có trong đầu, viết đủ rõ còn tốn hơn tự làm.',
        },
      ],
      doneSignals: [
        'Hai người thi hành hai đặc tả của bạn cùng lúc mà không giẫm chân lên nhau.',
        'Người tiếp quản dự án bắt đầu làm được việc mà không cần một buổi bàn giao miệng.',
      ],
    },
  ],
  rubric: [
    {
      id: 'architecture-s4-r1',
      text: 'Thay đổi kiến trúc lớn hoàn tất mà không có phút downtime nào, có bằng chứng theo dõi trong suốt quá trình.',
      howToProve:
        'Dán biểu đồ sẵn sàng của dịch vụ trong khoảng thời gian chuyển đổi kèm mốc từng lát.',
    },
    {
      id: 'architecture-s4-r2',
      text: 'Có kế hoạch quay lui viết TRƯỚC khi bắt đầu, nêu điều kiện kích hoạt và người có quyền quyết.',
      howToProve:
        'Chỉ ra tài liệu kế hoạch với dấu thời gian sớm hơn commit đầu tiên của đợt chuyển.',
    },
    {
      id: 'architecture-s4-r3',
      text: 'Yêu cầu phi chức năng trước và sau đo bằng số, không chỉ số nào tụt so với trước khi chuyển.',
      howToProve: 'Dán bảng NFR hai cột trước–sau kèm lệnh đo đã dùng cho từng dòng.',
    },
    {
      id: 'architecture-s4-r4',
      text: 'Bản đồ kiến trúc và bộ ADR cập nhật đủ để người mới tiếp quản mà không cần bàn giao miệng.',
      howToProve:
        'Nhờ một người ngoài đọc tài liệu rồi tự chỉ ra ranh giới module và ba quyết định lớn.',
    },
    {
      id: 'architecture-s4-r5',
      text: 'Mỗi lát chuyển đổi có cổng nghiệm thu riêng và dừng lại được giữa chừng mà hệ thống vẫn phục vụ.',
      howToProve:
        'Liệt kê các lát kèm cổng nghiệm thu và chỉ ra ít nhất một lần dừng giữa chừng an toàn.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Dẫn một thay đổi kiến trúc lớn trên hệ thống đang phục vụ người dùng thật.',
      'Chuyển từng lát theo cây bóp cổ, mỗi lát có cổng nghiệm thu riêng.',
      'Cập nhật bản đồ kiến trúc và bộ ADR song song với việc chuyển.',
    ],
    scopeDont: [
      'Không viết lại hệ thống từ đầu, vì hệ cũ chứa hàng nghìn ca biên mà bản mới chưa học được.',
      'Không trộn thêm tính năng mới vào đợt chuyển — trộn vào thì không còn biết lỗi đến từ đâu.',
      'Không đổi cùng lúc cả tầng lưu trữ lẫn tầng giao tiếp, hai rủi ro lớn cộng lại không quản được.',
    ],
    touchpoints: [
      'Ranh giới module đang có và nơi đặt luật phụ thuộc.',
      'Tầng ghi dữ liệu, nơi phải ghi cả hai nơi trong giai đoạn chuyển.',
      'Cổng CI, nơi gắn ngưỡng phi chức năng.',
    ],
    contracts: [
      'Đường mới và đường cũ nhận cùng đầu vào và phải cho cùng kết quả trong giai đoạn đối chiếu.',
      'Mọi lát chuyển đổi bật tắt được bằng cấu hình, không cần phát hành lại.',
      'Dữ liệu ghi trong giai đoạn chuyển phải đọc lại được từ cả hai đường.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng người ngoài kiểm lại được.',
      'Không có sự cố nào ảnh hưởng người dùng trong suốt đợt chuyển.',
    ],
    invariants: [
      'Dịch vụ không dừng; mỗi thời điểm luôn có một nguồn dữ liệu đúng.',
      'Luôn quay lui được về trạng thái trước lát đang làm.',
    ],
    conventions: [
      'Quyết định lớn ghi thành ADR có phương án bị loại và điều kiện xem lại.',
      'Trạng thái dự án ghi lại sao cho phiên sau đọc là đủ, không phải hỏi lại.',
    ],
  },
}

// details/security-s2.ts — Chi tiết chặng S2 hướng AN TOÀN THÔNG TIN (đánh giá có phép).
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SECURITY_S2_DETAIL: SpecStageDetail = {
  stageId: 'security-s2',
  modules: [
    {
      moduleId: 'security-s2-m1',
      objective:
        'Tiến hành được một cuộc đánh giá có phạm vi được cho phép bằng văn bản, theo quy trình lặp lại được.',
      practice: [
        'Xin và lưu lại văn bản cho phép kiểm thử, ghi rõ hệ thống nào trong phạm vi và giờ được phép.',
        'Lập mô hình mối đe doạ cho hệ thống mục tiêu: ai tấn công, muốn gì, đường nào.',
        'Ghi nhật ký từng bước đã làm, đủ để người khác tái hiện.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phạm vi phải có bằng văn bản trước khi bắt đầu?',
          a: 'Kiểm thử ngoài phạm vi là hành vi trái phép, bất kể ý định tốt; văn bản là ranh giới pháp lý của cả hai bên.',
        },
        {
          q: 'Mô hình mối đe doạ dùng để làm gì trong một cuộc đánh giá?',
          a: 'Để tập trung công sức vào đường tấn công có hậu quả lớn thay vì quét bừa mọi thứ.',
        },
      ],
      doneSignals: [
        'Có văn bản phạm vi lưu lại trước mọi thao tác kỹ thuật.',
        'Nhật ký đủ chi tiết để người khác lặp lại từng bước.',
      ],
    },
    {
      moduleId: 'security-s2-m2',
      objective:
        'Tìm và chứng minh được lỗ hổng tầng web và API bằng bằng chứng tái hiện tối thiểu, không gây hại.',
      practice: [
        'Kiểm tra kiểm soát truy cập theo chiều ngang và dọc trên ít nhất mười endpoint.',
        'Thử chèn dữ liệu vào các điểm nhận đầu vào và ghi lại điểm nào lọt.',
        'Viết bằng chứng tái hiện nhỏ nhất cho mỗi phát hiện, không làm hỏng dữ liệu thật.',
      ],
      selfCheck: [
        {
          q: 'Lỗi kiểm soát truy cập theo chiều ngang là gì?',
          a: 'Người dùng hợp lệ đọc hoặc sửa được dữ liệu của người dùng khác cùng cấp bằng cách đổi định danh trong yêu cầu.',
        },
        {
          q: 'Vì sao bằng chứng tái hiện phải nhỏ nhất có thể?',
          a: 'Đủ chứng minh vấn đề mà không gây thiệt hại, và bên vá lỗi dễ kiểm chứng lại.',
        },
      ],
      doneSignals: [
        'Mỗi phát hiện có các bước tái hiện chạy được, không chỉ mô tả.',
        'Không thao tác nào làm hỏng hay lộ dữ liệu người dùng thật.',
      ],
    },
    {
      moduleId: 'security-s2-m3',
      objective:
        'Đánh giá được bề mặt tấn công ở tầng mạng và hạ tầng: dịch vụ phơi ra, cấu hình sai, bí mật bị lộ.',
      practice: [
        'Liệt kê toàn bộ cổng và dịch vụ đang phơi ra của mục tiêu trong phạm vi cho phép.',
        'Rà cấu hình lưu trữ và quyền truy cập xem có thứ gì công khai ngoài ý muốn.',
        'Tìm bí mật bị commit trong lịch sử mã nguồn công khai của dự án.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lịch sử git là chỗ hay lộ bí mật?',
          a: 'Xoá khoá ở commit mới không xoá nó khỏi lịch sử; phải coi như đã lộ và xoay khoá.',
        },
        {
          q: 'Cấu hình sai thường nguy hiểm hơn lỗ hổng phần mềm ở điểm nào?',
          a: 'Nó thường cho truy cập trực tiếp mà không cần khai thác gì, và rất dễ bị quét tự động tìm ra.',
        },
      ],
      doneSignals: [
        'Có danh sách bề mặt tấn công đầy đủ, mỗi mục ghi rõ mức rủi ro.',
        'Phân biệt được phát hiện thật và cảnh báo giả của công cụ quét.',
      ],
    },
    {
      moduleId: 'security-s2-m4',
      objective:
        'Viết được báo cáo mà đội phát triển sửa được ngay: mô tả, tác động, tái hiện, khuyến nghị vá.',
      practice: [
        'Viết báo cáo cho ba phát hiện theo cùng một khuôn, mỗi cái có mức độ và tác động nghiệp vụ.',
        'Xếp hạng ưu tiên theo hậu quả thực tế chứ không theo điểm công cụ.',
        'Trình bày lại cho người không chuyên bảo mật trong năm phút.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không xếp ưu tiên theo điểm mà công cụ đưa ra?',
          a: 'Điểm công cụ không biết ngữ cảnh: dữ liệu gì, ai truy cập được, tổn thất ra sao.',
        },
        {
          q: 'Báo cáo thiếu khuyến nghị vá thì hậu quả gì?',
          a: 'Đội phát triển không biết bắt đầu từ đâu, báo cáo nằm im và lỗ hổng vẫn còn.',
        },
      ],
      doneSignals: [
        'Đội phát triển đọc báo cáo là vá được, không phải hỏi lại.',
        'Ưu tiên trong báo cáo khớp với hậu quả nghiệp vụ thật.',
      ],
    },
  ],
  rubric: [
    {
      id: 'security-s2-r1',
      text: 'Có xác nhận phạm vi được phép bằng văn bản trước mọi thao tác kỹ thuật.',
      howToProve:
        'Đính kèm văn bản hoặc chính sách công bố lỗ hổng của dự án, có mốc thời gian trước ngày bắt đầu.',
    },
    {
      id: 'security-s2-r2',
      text: 'Ít nhất ba phát hiện có bằng chứng tái hiện được bởi người khác.',
      howToProve: 'Mỗi phát hiện kèm các bước tái hiện và bên nhận báo cáo xác nhận lặp lại được.',
    },
    {
      id: 'security-s2-r3',
      text: 'Báo cáo có mức độ, tác động nghiệp vụ và khuyến nghị vá cho từng phát hiện.',
      howToProve:
        'Bản báo cáo hoàn chỉnh theo khuôn thống nhất, dài ngắn tuỳ phát hiện nhưng không thiếu ô nào.',
    },
    {
      id: 'security-s2-r4',
      text: 'Không thao tác nào gây gián đoạn dịch vụ hay chạm vào dữ liệu người dùng thật.',
      howToProve:
        'Nhật ký thao tác cho thấy chỉ dùng tài khoản thử nghiệm và không có bước phá huỷ.',
    },
    {
      id: 'security-s2-r5',
      text: 'Công bố có trách nhiệm: báo cho chủ dự án trước, chờ vá rồi mới nói công khai.',
      howToProve: 'Dòng thời gian liên lạc: ngày gửi, ngày phản hồi, ngày vá, ngày công bố.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Đánh giá an toàn một dự án mã nguồn mở có chính sách cho phép kiểm thử.',
      'Rà tầng ứng dụng web, API và cấu hình hạ tầng công khai.',
      'Báo cáo có trách nhiệm và theo dõi tới khi được vá.',
    ],
    scopeDont: [
      'KHÔNG kiểm thử bất cứ hệ thống nào ngoài phạm vi văn bản cho phép — đó là ranh giới pháp lý, không phải lựa chọn kỹ thuật.',
      'KHÔNG thử tấn công từ chối dịch vụ hay thao tác phá huỷ dữ liệu.',
      'KHÔNG công bố chi tiết trước khi bên chủ quản có cơ hội vá.',
    ],
    touchpoints: [
      'Sổ nhật ký đánh giá: mỗi bước có thời điểm và lệnh đã chạy.',
      'Thư mục bằng chứng: mỗi phát hiện một thư mục con.',
      'Bản báo cáo cuối theo khuôn thống nhất.',
    ],
    contracts: [
      'Khuôn báo cáo cố định: mô tả, mức độ, tác động, tái hiện, khuyến nghị.',
      'Mọi phát hiện có định danh riêng dùng xuyên suốt trao đổi với bên chủ quản.',
      'Kênh liên lạc và thời hạn phản hồi thống nhất từ đầu.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có dòng thời gian liên lạc đầy đủ.',
      'Ít nhất một phát hiện được bên chủ quản xác nhận.',
    ],
    invariants: [
      'Không bước nào vượt ra ngoài phạm vi đã được cho phép.',
      'Dữ liệu người dùng thật không bị đọc, sao chép hay sửa.',
      'Bằng chứng lưu trữ không chứa dữ liệu nhạy cảm chưa che.',
    ],
    conventions: [
      'Nói rõ giới hạn của cuộc đánh giá: không tìm thấy không có nghĩa là không có.',
      'Ngôn ngữ báo cáo trung tính, mô tả rủi ro chứ không chê trách đội phát triển.',
      'Lưu bằng chứng ở nơi riêng tư, không đưa lên repo công khai.',
    ],
  },
}

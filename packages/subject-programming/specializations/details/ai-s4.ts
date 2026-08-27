// details/ai-s4.ts — Chi tiết chặng S4 hướng AI ("Chuyên gia — MLOps và hệ thống AI").
// Bản đồ chặng ở ../ai.ts.
//
// Chỗ khác biệt so với mọi hướng khác: mô hình HỎNG DẦN mà không ai sửa gì cả — thế giới đổi
// thì dữ liệu vào đổi theo, và mô hình đứng yên trở thành sai. Nên chặng này xoay quanh GIÁM
// SÁT và VÒNG CẬP NHẬT có kiểm duyệt, chứ không xoay quanh việc luyện mô hình cho giỏi hơn.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const AI_S4_DETAIL: SpecStageDetail = {
  stageId: 'ai-s4',
  modules: [
    {
      moduleId: 'ai-s4-m1',
      objective:
        'Đưa được mô hình vào phục vụ thật với phiên bản rõ ràng cho cả mã, dữ liệu lẫn trọng số, và chi phí nằm trong ngân sách.',
      practice: [
        'Đóng gói một mô hình kèm phiên bản dữ liệu và mã đã dùng, dựng lại đúng kết quả từ ba thành phần đó.',
        'So ba cách phục vụ trên cùng mô hình: theo lô, trực tuyến và chạy ngay trên máy người dùng, đo độ trễ và chi phí từng cách.',
        'Đặt ngân sách chi phí mỗi nghìn yêu cầu và tối ưu cho tới khi nằm dưới ngưỡng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải đánh phiên bản cho cả dữ liệu chứ không chỉ cho mã?',
          a: 'Cùng một mã chạy trên hai tập dữ liệu cho hai mô hình khác nhau, thiếu phiên bản dữ liệu thì không dựng lại được kết quả.',
        },
        {
          q: 'Khi nào phục vụ theo lô hợp lý hơn phục vụ trực tuyến?',
          a: 'Khi kết quả không cần ngay lập tức, vì gom lô rẻ hơn nhiều lần và chịu được lỗi tạm thời.',
        },
      ],
      doneSignals: [
        'Bạn dựng lại được đúng mô hình đang chạy từ mã và dữ liệu đã ghi phiên bản.',
        'Nói được chi phí phục vụ mỗi nghìn yêu cầu, bằng số tiền cụ thể.',
      ],
    },
    {
      moduleId: 'ai-s4-m2',
      objective:
        'Phát hiện mô hình đang xấu đi trước khi người dùng phàn nàn, và biến phản hồi người dùng thành dữ liệu cải thiện.',
      practice: [
        'Đo phân bố đầu vào theo tuần và cảnh báo khi nó lệch quá ngưỡng so với lúc huấn luyện.',
        'Thu phản hồi đúng sai từ người dùng và ghép ngược lại với dự đoán để tính chất lượng thực tế theo thời gian.',
        'Chạy thí nghiệm trực tuyến so mô hình mới với mô hình đang chạy trên một phần nhỏ lưu lượng.',
      ],
      selfCheck: [
        {
          q: 'Dịch chuyển dữ liệu là gì và vì sao nó làm mô hình xấu đi mà không có lỗi nào?',
          a: 'Là đầu vào thực tế dần khác dữ liệu huấn luyện; mô hình vẫn chạy trơn tru nhưng dự đoán ngày càng sai.',
        },
        {
          q: 'Vì sao chỉ theo dõi độ chính xác lúc huấn luyện là không đủ?',
          a: 'Vì con số đó cố định từ quá khứ, còn chất lượng thật chỉ đo được trên dữ liệu đang tới.',
        },
        {
          q: 'Phản hồi người dùng dùng thẳng làm dữ liệu huấn luyện có rủi ro gì?',
          a: 'Phản hồi thiên lệch theo nhóm người chịu phản hồi, dễ tạo vòng lặp tự khẳng định cho chính sai lệch đó.',
        },
      ],
      doneSignals: [
        'Có bảng theo dõi chất lượng mô hình theo ngày chứ không chỉ một con số lúc phát hành.',
        'Bạn biết mô hình xấu đi trước khi bộ phận hỗ trợ khách hàng báo lên.',
      ],
    },
    {
      moduleId: 'ai-s4-m3',
      objective:
        'Xây hệ tác tử gọi công cụ nhiều bước có giới hạn quyền và ngân sách cứng, đánh giá theo kết quả nhiệm vụ.',
      practice: [
        'Cho tác tử gọi ba công cụ có thật, mỗi công cụ khai rõ quyền và thứ nó được phép thay đổi.',
        'Đặt ngân sách cứng theo số bước và theo chi phí, thử một nhiệm vụ bất khả thi để xác nhận nó dừng chứ không chạy mãi.',
        'Dựng bộ đánh giá chấm theo kết quả nhiệm vụ có đạt hay không, không chấm theo câu chữ nghe hay.',
      ],
      selfCheck: [
        {
          q: 'Vì sao đánh giá tác tử theo văn phong là sai hướng?',
          a: 'Câu trả lời trôi chảy vẫn có thể sai việc; thứ đáng đo là nhiệm vụ có hoàn thành hay không.',
        },
        {
          q: 'Ngân sách cứng bảo vệ khỏi điều gì?',
          a: 'Khỏi vòng lặp vô hạn và hoá đơn tăng không kiểm soát khi tác tử loay hoay không xong việc.',
        },
        {
          q: 'Công cụ có tác dụng phụ nên được cấp quyền thế nào?',
          a: 'Quyền hẹp nhất có thể và tách khỏi công cụ chỉ đọc, để một quyết định sai không phá dữ liệu thật.',
        },
      ],
      doneSignals: [
        'Tác tử của bạn dừng đúng lúc và báo không làm được, thay vì chạy tới cạn ngân sách.',
        'Bạn có bộ nhiệm vụ chuẩn để so hai phiên bản tác tử bằng tỉ lệ hoàn thành.',
      ],
    },
    {
      moduleId: 'ai-s4-m4',
      objective:
        'Chịu trách nhiệm về hậu quả của hệ thống AI: đánh giá tác hại theo nhóm bị ảnh hưởng và nói rõ giới hạn cho người dùng.',
      practice: [
        'Liệt kê các nhóm người bị ảnh hưởng bởi quyết định của hệ thống và cách mỗi nhóm chịu thiệt khi mô hình sai.',
        'Rà nguồn dữ liệu huấn luyện về mặt quyền riêng tư và bản quyền, ghi rõ phần không dùng được.',
        'Viết đoạn thông báo giới hạn cho người dùng cuối và đường báo lỗi khi mô hình trả kết quả sai.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải xét tác hại theo từng nhóm thay vì theo độ chính xác trung bình?',
          a: 'Độ chính xác trung bình cao vẫn có thể che một nhóm bị phục vụ tệ hơn hẳn.',
        },
        {
          q: 'Người dùng cần biết gì về giới hạn của mô hình?',
          a: 'Biết nó có thể sai ở đâu, không nên dùng cho việc gì và báo lỗi bằng cách nào.',
        },
      ],
      doneSignals: [
        'Sản phẩm có đường để người dùng báo kết quả sai, và báo cáo đó thật sự được đọc.',
        'Bạn từ chối được một nguồn dữ liệu vì lý do quyền riêng tư hoặc bản quyền, có ghi lại lý do.',
      ],
    },
  ],
  rubric: [
    {
      id: 'ai-s4-r1',
      text: 'Có đường ống huấn luyện lại chạy tự động, kèm bước kiểm duyệt của con người trước khi phát hành mô hình mới.',
      howToProve: 'Chạy đường ống một lần và dán nhật ký gồm mốc chờ duyệt và người đã duyệt.',
    },
    {
      id: 'ai-s4-r2',
      text: 'Bảng theo dõi chất lượng và chi phí theo ngày, có cảnh báo khi phân bố đầu vào lệch quá ngưỡng.',
      howToProve: 'Chụp bảng theo dõi ở hai thời điểm và dán một lần cảnh báo đã kích hoạt.',
    },
    {
      id: 'ai-s4-r3',
      text: 'Mô hình đang chạy dựng lại được từ phiên bản mã, dữ liệu và cấu hình đã ghi.',
      howToProve: 'Dựng lại mô hình từ ba phiên bản đó và so chỉ số đánh giá với bản đang phục vụ.',
    },
    {
      id: 'ai-s4-r4',
      text: 'Có tài liệu rủi ro nêu nhóm bị ảnh hưởng, giới hạn của mô hình và cơ chế để người dùng báo lỗi.',
      howToProve: 'Chỉ ra tài liệu công bố và một ví dụ báo lỗi thật đã được xử lý.',
    },
    {
      id: 'ai-s4-r5',
      text: 'Chi phí phục vụ mỗi nghìn yêu cầu nằm dưới ngân sách công bố, có số đo trong ít nhất hai tuần.',
      howToProve: 'Dán biểu đồ chi phí theo ngày kèm ngưỡng ngân sách đã đặt.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Đưa một mô hình vào phục vụ người dùng thật kèm giám sát và quy trình cập nhật.',
      'Đo chất lượng thực tế theo thời gian và phát hiện dịch chuyển dữ liệu.',
      'Công bố giới hạn của mô hình và mở đường cho người dùng báo lỗi.',
    ],
    scopeDont: [
      'Không tự huấn luyện mô hình nền từ đầu, vì chi phí lớn mà không dạy thêm gì về vận hành.',
      'Không dùng dữ liệu người dùng thật để huấn luyện khi chưa có cơ sở pháp lý rõ ràng.',
      'Không tự động phát hành mô hình mới mà bỏ bước người duyệt — mô hình sai khác hẳn mã sai, nó hỏng âm thầm.',
    ],
    touchpoints: [
      'Đường ống huấn luyện và nơi ghi phiên bản dữ liệu.',
      'Tầng phục vụ suy luận và nơi đo độ trễ, chi phí.',
      'Kho phản hồi người dùng và bộ đánh giá.',
    ],
    contracts: [
      'Mỗi dự đoán ghi lại phiên bản mô hình đã sinh ra nó.',
      'Đầu vào được kiểm tra lược đồ trước khi tới mô hình; đầu vào lạ bị từ chối chứ không đoán bừa.',
      'Mọi lời gọi mô hình đều bị giới hạn theo ngân sách cứng.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng chạy lại được.',
      'Có ít nhất một chu kỳ cập nhật mô hình chạy trọn vẹn từ dữ liệu mới tới phát hành.',
    ],
    invariants: [
      'Không phát hành mô hình mới mà không có người duyệt và không có đường quay lui.',
      'Không dùng dữ liệu cá nhân ngoài mục đích đã thông báo cho người dùng.',
    ],
    conventions: [
      'Mọi thí nghiệm ghi lại đủ để dựng lại: dữ liệu, mã, tham số và kết quả.',
      'Chi phí gọi mô hình luôn được đếm và giới hạn theo người dùng.',
    ],
  },
}

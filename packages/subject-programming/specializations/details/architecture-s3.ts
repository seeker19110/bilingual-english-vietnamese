// details/architecture-s3.ts — Chi tiết chặng S3 hướng KIẾN TRÚC
// ("Đặc tả thi hành được & nghiệm thu code mình không tự gõ").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ARCHITECTURE_S3_DETAIL: SpecStageDetail = {
  stageId: 'architecture-s3',
  modules: [
    {
      moduleId: 'architecture-s3-m1',
      objective:
        'Viết được đặc tả kín tới mức người đọc bắt tay làm ngay mà không phải hỏi lại câu nào để bắt đầu.',
      practice: [
        'Viết lại một yêu cầu mơ hồ từng nhận thành đặc tả đủ sáu ô bắt buộc.',
        'Viết ô tiêu chí chấp nhận trước ô mô tả giải pháp, mỗi tiêu chí nêu rõ lệnh dùng để kiểm.',
        'Chia việc thành các lát nhỏ, mỗi lát chạy được và kiểm được riêng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao ô "KHÔNG làm" lại quan trọng ngang ô phạm vi?',
          a: 'Thiếu nó thì bên thi hành tự mở rộng phạm vi, khiến diff phình ra và review mệt gấp đôi.',
        },
        {
          q: 'Không viết nổi tiêu chí chấp nhận đo được nghĩa là gì?',
          a: 'Nghĩa là chính người giao việc chưa hiểu rõ việc mình đang giao, cần làm rõ trước khi giao.',
        },
      ],
      doneSignals: [
        'Người khác đọc đặc tả của bạn rồi làm luôn, không nhắn hỏi lại.',
        'Mỗi tiêu chí chấp nhận của bạn đều gắn với một lệnh chạy được.',
      ],
    },
    {
      moduleId: 'architecture-s3-m2',
      objective:
        'Giao được việc cho AI hoặc người mới với đúng mức tự quyết, và viết ra mọi giả định thay vì để bên kia đoán.',
      practice: [
        'Giao một lát việc chỉ bằng đặc tả, không kèm hội thoại nền, rồi đếm số vòng hỏi làm rõ.',
        'Phân loại việc theo mức tự quyết: cơ học, có đặc tả sẵn, hay cần tự quyết kỹ thuật.',
        'Yêu cầu bên thi hành dẫn nguồn bằng đường dẫn tệp và kết quả lệnh thay vì lời khẳng định.',
      ],
      selfCheck: [
        {
          q: 'Vì sao bên thi hành không thấy ngữ cảnh trước đó lại là giả định phải nhớ?',
          a: 'Mọi quy ước ngầm trong đầu người giao đều phải viết ra, nếu không bên kia sẽ tự bịa một kiểu khác.',
        },
        {
          q: 'Chống ảo giác khi nhận kết quả bằng cách nào?',
          a: 'Đòi bằng chứng chạy được: lệnh cụ thể kèm đầu ra, thay vì tin câu "đã kiểm tra, ổn".',
        },
      ],
      doneSignals: [
        'Bạn giao việc mà không phải trả lời quá một vòng hỏi làm rõ.',
        'Bạn nêu rõ phần nào tuyệt đối không được đụng tới trong mỗi lần giao.',
      ],
    },
    {
      moduleId: 'architecture-s3-m3',
      objective:
        'Nghiệm thu được kết quả của người khác theo tầng và bằng bằng chứng, không bằng cảm nhận khi đọc diff.',
      practice: [
        'Viết bộ test canh gác cho bất biến kiến trúc trước khi giao việc.',
        'Review theo tầng: đúng hợp đồng, đúng ranh giới, đúng ca biên, rồi mới tới phong cách.',
        'Ghi biên bản nghiệm thu: đã chạy lệnh nào, kết quả gì, còn để ngỏ gì.',
      ],
      selfCheck: [
        {
          q: 'Vì sao test canh gác phải viết trước khi giao việc?',
          a: 'Viết sau khi có code thì test chỉ chép lại hành vi đang có, không còn khả năng bắt sai lệch.',
        },
        {
          q: 'Loại lỗi nào công cụ không bắt được?',
          a: 'Lỗi nghiệp vụ, ca rỗng, đua điều kiện và xử lý thời gian; những lỗi này phải soi bằng ca biên.',
        },
      ],
      doneSignals: [
        'Bạn phát hiện lỗi bằng test canh gác chứ không bằng cách đọc từng dòng.',
        'Biên bản nghiệm thu của bạn có đầu ra lệnh thật, không có câu chung chung.',
      ],
    },
    {
      moduleId: 'architecture-s3-m4',
      objective:
        'Giữ được sổ quyết định để phương án đã loại không quay lại và người sau hiểu vì sao hệ thống như hiện tại.',
      practice: [
        'Viết hai bản ghi quyết định cho hai lựa chọn lớn của tính năng.',
        'Ghi rõ phương án bị loại và lý do loại, kèm đánh đổi đã chấp nhận.',
        'Khi muốn đổi quyết định cũ, viết bản ghi mới thay thế thay vì lặng lẽ làm khác.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải ghi cả phương án bị loại?',
          a: 'Không ghi thì vài tháng sau chính đội đó lại đề xuất đúng phương án ấy và bàn lại từ đầu.',
        },
        {
          q: 'Bản ghi quyết định khác tài liệu thiết kế ở chỗ nào?',
          a: 'Nó ghi bối cảnh và lý do tại thời điểm quyết định, chứ không mô tả hệ thống hiện tại.',
        },
      ],
      doneSignals: [
        'Phiên làm việc sau không đề xuất lại phương án đã bị loại.',
        'Bạn nói không với một thay đổi vì nó phá bất biến đã ghi, và chỉ ra được chỗ ghi.',
      ],
    },
  ],
  rubric: [
    {
      id: 'architecture-s3-r1',
      text: 'Đặc tả đủ sáu ô bắt buộc và được thi hành đúng ngay lượt đầu với không quá một vòng hỏi làm rõ.',
      howToProve:
        'Nộp đặc tả cùng nhật ký trao đổi, đếm số câu hỏi phải trả lời trước khi bên kia bắt đầu.',
    },
    {
      id: 'architecture-s3-r2',
      text: 'Bộ test canh gác viết trước khi giao việc và bắt đỏ được ít nhất một lỗi thật ở bản nộp đầu.',
      howToProve:
        'Đối chiếu dấu thời gian commit của test với lúc giao việc, kèm lần chạy đỏ đầu tiên.',
    },
    {
      id: 'architecture-s3-r3',
      text: 'Có ít nhất hai bản ghi quyết định, mỗi bản nêu rõ phương án bị loại kèm lý do và đánh đổi.',
      howToProve: 'Nộp hai bản ghi và chỉ ra phần phương án bị loại trong từng bản.',
    },
    {
      id: 'architecture-s3-r4',
      text: 'Biên bản nghiệm thu ghi đủ lệnh đã chạy, kết quả thật, tiêu chí chưa đạt và phần còn để ngỏ.',
      howToProve: 'Nộp biên bản có dán đầu ra lệnh, không chấp nhận câu tóm tắt chung chung.',
    },
    {
      id: 'architecture-s3-r5',
      text: 'Phần cài đặt do bên khác viết, người đặc tả không tự gõ dòng code cài đặt nào.',
      howToProve:
        'Đối chiếu lịch sử commit để thấy phần cài đặt không do người viết đặc tả tạo ra.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Viết đặc tả kín cho một tính năng thật và nghiệm thu kết quả của bên thi hành.',
      'Chuẩn bị bộ test canh gác và bản ghi quyết định trước khi giao việc.',
    ],
    scopeDont: [
      'Không tự gõ phần cài đặt, vì như thế mất luôn phép thử quan trọng nhất là đặc tả có kín hay không.',
      'Không mở rộng phạm vi giữa chừng khi thấy tiện tay.',
    ],
    touchpoints: [
      'Tài liệu đặc tả và nơi lưu các bản ghi quyết định.',
      'Bộ test canh gác cho bất biến kiến trúc của phần bị chạm.',
    ],
    contracts: [
      'Hợp đồng vào ra của tính năng viết bằng kiểu cụ thể, không mô tả bằng lời chung chung.',
      'Ca lỗi là một phần hợp đồng, không phải phụ lục thêm sau.',
    ],
    acceptance: [
      'Đạt đủ năm tiêu chí rubric, trong đó tiêu chí không tự gõ cài đặt là bắt buộc.',
      'Bên thi hành làm đúng ngay lượt đầu với không quá một vòng làm rõ.',
    ],
    invariants: [
      'Không nhận lời khẳng định thay cho bằng chứng chạy được.',
      'Không đổi quyết định cũ mà không viết bản ghi thay thế.',
    ],
    conventions: [
      'Đặc tả theo khuôn sáu ô của dự án, viết tiêu chí chấp nhận trước phần giải pháp.',
      'Mỗi lát việc giao đi phải chạy được và kiểm được riêng.',
    ],
  },
}

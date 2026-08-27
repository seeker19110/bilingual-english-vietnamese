// details/backend-s4.ts — Chi tiết chặng S4 hướng BACKEND ("Chuyên gia — quy mô lớn và trách
// nhiệm vận hành"). Bản đồ chặng ở ../backend.ts.
//
// Chặng này khác S3 ở chỗ: S3 hỏi "chạy đúng chưa", S4 hỏi "chịu được bao nhiêu, và khi hỏng
// thì ai chịu trách nhiệm gì". Nên phần lớn bài luyện là ĐO và DIỄN TẬP chứ không phải viết
// thêm tính năng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const BACKEND_S4_DETAIL: SpecStageDetail = {
  stageId: 'backend-s4',
  modules: [
    {
      moduleId: 'backend-s4-m1',
      objective:
        'Ước lượng được dung lượng hệ thống bằng số trước khi xây, và chọn cách chia dữ liệu hợp với hình dạng truy vấn.',
      practice: [
        'Ước lượng QPS, dung lượng lưu và băng thông cho một dịch vụ thật, ghi rõ giả định của từng con số.',
        'Chọn khoá phân mảnh cho bảng lớn nhất, thử một truy vấn phải quét mọi mảnh để thấy giá của lựa chọn sai.',
        'Đo độ trễ khi đọc từ bản sao ở vùng khác và tính xem người dùng cảm nhận được từ mốc nào.',
      ],
      selfCheck: [
        {
          q: 'Chọn khoá phân mảnh sai thì hậu quả nặng nhất là gì?',
          a: 'Truy vấn phải hỏi mọi mảnh, mất luôn lợi ích chia mảnh mà vẫn gánh đủ phức tạp của nó.',
        },
        {
          q: 'Đọc từ bản sao đánh đổi cái gì?',
          a: 'Được giảm tải cho bản chính nhưng nhận dữ liệu trễ vài chục mili giây tới vài giây.',
        },
        {
          q: 'Vì sao ước lượng dung lượng phải ghi kèm giả định?',
          a: 'Vì con số chỉ đúng trong giả định đó; đổi giả định mà không đổi số là nguồn sai lớn nhất.',
        },
      ],
      doneSignals: [
        'Nói được hệ thống của mình chịu được bao nhiêu yêu cầu mỗi giây và nghẽn ở đâu trước.',
        'Từ chối được một thiết kế chia mảnh vì nó không hợp với truy vấn hay chạy nhất.',
      ],
    },
    {
      moduleId: 'backend-s4-m2',
      objective:
        'Biết khi nào phải rời khỏi cơ sở dữ liệu quan hệ và chứng minh khôi phục dữ liệu chạy được bằng diễn tập thật.',
      practice: [
        'Lấy một truy vấn quan hệ chạy chậm và thử lại trên kho chuyên biệt hợp hơn, so số đo hai bên.',
        'Diễn tập khôi phục thật: xoá dữ liệu trong môi trường thử rồi khôi phục từ bản sao lưu, bấm giờ.',
        'Ghi lại thời gian khôi phục và lượng dữ liệu mất tối đa, đối chiếu với mức tổ chức chấp nhận được.',
      ],
      selfCheck: [
        {
          q: 'Vì sao có bản sao lưu vẫn chưa đủ để nói là an toàn?',
          a: 'Bản sao lưu chưa từng khôi phục thử thì không ai biết nó dùng được; nhiều bản chỉ hỏng khi cần đến.',
        },
        {
          q: 'LSM tree hợp với dạng tải nào hơn B-tree?',
          a: 'Ghi nhiều và ghi liên tục, vì nó gom ghi tuần tự thay vì sửa tại chỗ.',
        },
      ],
      doneSignals: [
        'Nói được số phút khôi phục và lượng dữ liệu mất tối đa của hệ mình, dựa trên một lần diễn tập thật.',
        'Chọn kho lưu trữ theo hình dạng truy vấn chứ không theo tên công nghệ đang thịnh.',
      ],
    },
    {
      moduleId: 'backend-s4-m3',
      objective:
        'Đặt được xác thực giữa các dịch vụ và phân quyền tối thiểu, kèm nhật ký kiểm toán cho dữ liệu cá nhân.',
      practice: [
        'Bắt hai dịch vụ nội bộ xác thực lẫn nhau, thử gọi bằng danh tính giả để xác nhận bị chặn.',
        'Rà toàn bộ quyền đang cấp và cắt mọi quyền không dùng tới trong 30 ngày qua.',
        'Ghi nhật ký mọi lần đọc dữ liệu cá nhân, gồm ai đọc, đọc của ai và vì việc gì.',
      ],
      selfCheck: [
        {
          q: 'Nguyên tắc đặc quyền tối thiểu nói gì?',
          a: 'Mỗi thành phần chỉ được đúng quyền cần cho việc của nó, và chỉ trong thời gian cần.',
        },
        {
          q: 'Vì sao cần nhật ký kiểm toán truy cập dữ liệu cá nhân?',
          a: 'Để trả lời được ai đã xem dữ liệu của ai khi có khiếu nại hoặc rò rỉ, chứ không đoán.',
        },
      ],
      doneSignals: [
        'Không dịch vụ nào chạy bằng tài khoản quản trị dùng chung.',
        'Trả lời được trong vài phút câu hỏi ai đã truy cập dữ liệu của một người dùng cụ thể.',
      ],
    },
    {
      moduleId: 'backend-s4-m4',
      objective:
        'Vận hành có kỷ luật khi sự cố xảy ra: phân loại, leo thang, và biến bài học thành hành động sửa gốc rễ.',
      practice: [
        'Viết quy trình trực sự cố có mức độ, ai được gọi ở mức nào và trong bao lâu phải phản hồi.',
        'Tổ chức một buổi diễn tập sự cố có kịch bản, bấm giờ từ lúc phát hiện tới lúc phục hồi.',
        'Viết post-mortem không đổ lỗi cho buổi diễn tập, mỗi hành động sửa có người nhận và hạn.',
      ],
      selfCheck: [
        {
          q: 'Post-mortem không đổ lỗi nhằm mục đích gì?',
          a: 'Để người trong cuộc kể thật chuyện đã xảy ra; sợ bị đổ lỗi thì thông tin quan trọng nhất bị giấu.',
        },
        {
          q: 'Một post-mortem không sinh ra hành động nào có ích không?',
          a: 'Gần như không, vì cùng sự cố sẽ lặp lại; hành động phải có người nhận và hạn cụ thể.',
        },
      ],
      doneSignals: [
        'Sự cố lặp lại giảm dần vì hành động sửa gốc rễ được theo tới cùng.',
        'Người trực biết chính xác phải làm gì trong mười phút đầu mà không phải hỏi ai.',
      ],
    },
  ],
  rubric: [
    {
      id: 'backend-s4-r1',
      text: 'Có test tải chứng minh dịch vụ đạt mục tiêu độ sẵn sàng và độ trễ ở mức tải công bố.',
      howToProve: 'Dán báo cáo test tải kèm cấu hình tải, số phân vị độ trễ và tỉ lệ lỗi.',
    },
    {
      id: 'backend-s4-r2',
      text: 'Thực hiện một lần di trú schema lớn không downtime, có kịch bản quay lui đã thử trước.',
      howToProve: 'Dán các bước di trú kèm dấu thời gian và biểu đồ sẵn sàng trong khoảng đó.',
    },
    {
      id: 'backend-s4-r3',
      text: 'Diễn tập khôi phục dữ liệu thật, đo được thời gian khôi phục và lượng dữ liệu mất tối đa.',
      howToProve:
        'Ghi lại buổi diễn tập kèm hai con số đo được và so với mức chấp nhận đã cam kết.',
    },
    {
      id: 'backend-s4-r4',
      text: 'Có một buổi diễn tập sự cố kèm post-mortem viết thành văn bản và hành động sửa có người nhận.',
      howToProve: 'Chỉ ra tài liệu post-mortem và trạng thái hoàn thành của từng hành động sửa.',
    },
    {
      id: 'backend-s4-r5',
      text: 'Mọi truy cập dữ liệu cá nhân đều được ghi nhật ký kiểm toán truy vấn lại được.',
      howToProve:
        'Chạy một truy vấn tra cứu lịch sử truy cập của một tài khoản mẫu và dán kết quả.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Xây và vận hành một dịch vụ có mục tiêu độ sẵn sàng công bố rõ ràng.',
      'Chứng minh khả năng chịu tải và khả năng khôi phục bằng diễn tập thật.',
      'Đặt xác thực giữa dịch vụ, phân quyền tối thiểu và nhật ký kiểm toán.',
    ],
    scopeDont: [
      'Không tự dựng hạ tầng đa vùng ở đợt này, vì chi phí và độ phức tạp vượt xa giá trị học được.',
      'Không tối ưu sớm phần chưa đo — mọi thay đổi hiệu năng phải bắt đầu từ một số đo.',
      'Không đổi ngôn ngữ hay khung nền giữa đợt, rủi ro không nằm trong phạm vi bài học.',
    ],
    touchpoints: [
      'Tầng truy cập dữ liệu và nơi đặt khoá phân mảnh.',
      'Cấu hình xác thực giữa dịch vụ và kho bí mật.',
      'Đường ống sao lưu và quy trình khôi phục.',
    ],
    contracts: [
      'Mọi endpoint ghi phải lặp lại an toàn hoặc nêu rõ vì sao không cần.',
      'Lỗi trả về có mã máy đọc được và không lộ chi tiết nội bộ ra ngoài.',
      'Di trú schema chia thành các bước tương thích ngược với bản mã đang chạy.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng chạy lại được.',
      'Không có sự cố ảnh hưởng người dùng phát sinh từ đợt việc này.',
    ],
    invariants: [
      'Không mất dữ liệu đã xác nhận ghi thành công cho người dùng.',
      'Không dịch vụ nào có quyền vượt quá việc nó thật sự làm.',
    ],
    conventions: [
      'Bí mật nằm trong biến môi trường hoặc kho bí mật, không bao giờ trong mã nguồn.',
      'Mọi thay đổi schema có phiên bản và quay lui được.',
    ],
  },
}

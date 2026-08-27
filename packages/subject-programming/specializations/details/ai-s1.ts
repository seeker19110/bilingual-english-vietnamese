// details/ai-s1.ts — Chi tiết chặng S1 hướng AI ("Ứng dụng LLM — làm sản phẩm trước").
// Bản đồ chặng nằm ở ../ai.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Tên chặng đã nói rõ thứ tự có chủ ý: làm SẢN PHẨM trước, huấn luyện mô hình để chặng sau.
// Vì thế rubric ở đây đo bộ đánh giá và chi phí, không đo kiến trúc mạng nơ-ron.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const AI_S1_DETAIL: SpecStageDetail = {
  stageId: 'ai-s1',
  modules: [
    {
      moduleId: 'ai-s1-m1',
      objective:
        'Gọi được mô hình với đầu ra ràng buộc theo schema, xử lý đúng khi mô hình chậm, lỗi hoặc trả về sai định dạng.',
      practice: [
        'Ép mô hình trả về đúng một cấu trúc dữ liệu và kiểm bằng schema, đếm tỉ lệ trả sai định dạng trên 50 lượt.',
        'Đo số token vào ra và chi phí của một lượt gọi thật, rồi thử rút ngắn lời nhắc và đo lại.',
        'Chủ động đặt thời gian chờ ngắn để gây lỗi, xác nhận ứng dụng thử lại có giới hạn chứ không lặp vô hạn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải kiểm đầu ra của mô hình bằng schema dù đã dặn kỹ trong lời nhắc?',
          a: 'Mô hình sinh văn bản theo xác suất nên vẫn có lượt lệch định dạng; lời dặn không phải ràng buộc kỹ thuật.',
        },
        {
          q: 'Cửa sổ ngữ cảnh đầy thì chuyện gì xảy ra với hội thoại dài?',
          a: 'Phần cũ nhất bị cắt đi, nên mô hình quên mất thông tin đầu cuộc mà người dùng tưởng nó vẫn nhớ.',
        },
        {
          q: 'Thử lại vô điều kiện khi gặp lỗi gây rủi ro gì?',
          a: 'Nhân đôi chi phí và có thể nhân đôi tác dụng phụ nếu lượt trước đã thực sự chạy xong ở phía máy chủ.',
        },
      ],
      doneSignals: [
        'Ứng dụng của bạn không bao giờ vỡ vì mô hình trả về văn bản lạ.',
        'Bạn nói được một lượt gọi tốn bao nhiêu tiền, không đoán.',
      ],
    },
    {
      moduleId: 'ai-s1-m2',
      objective:
        'Dựng được luồng trả lời dựa trên tài liệu có trích dẫn kiểm chứng được, kết hợp tìm theo nghĩa và tìm theo từ khoá.',
      practice: [
        'Thử ba cách chia đoạn khác nhau trên cùng bộ tài liệu và đo tỉ lệ tìm đúng đoạn chứa câu trả lời.',
        'Chạy song song tìm theo vector và tìm theo từ khoá, gộp kết quả rồi xếp hạng lại, so với dùng một cách.',
        'Cố tình hỏi một câu tài liệu KHÔNG có đáp án, kiểm tra hệ thống nói không biết thay vì bịa.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tìm theo vector một mình thường bỏ sót mã sản phẩm hay tên riêng?',
          a: 'Vector nắm nghĩa gần đúng nên chuỗi ký tự hiếm bị hoà lẫn; tìm từ khoá khớp chính xác lại rất mạnh ở đó.',
        },
        {
          q: 'Chia đoạn quá nhỏ và quá to hỏng theo hai cách khác nhau thế nào?',
          a: 'Quá nhỏ thì mất ngữ cảnh nên đoạn tìm được không đủ trả lời; quá to thì lẫn nhiễu và tốn token.',
        },
        {
          q: 'Trích dẫn nguồn giúp chống bịa đặt bằng cơ chế nào?',
          a: 'Nó buộc câu trả lời gắn với một đoạn có thật và cho người đọc đường kiểm lại ngay tại chỗ.',
        },
      ],
      doneSignals: [
        'Mọi câu trả lời đều bấm được vào nguồn và nguồn đó thật sự chứa ý đó.',
        'Hỏi câu ngoài phạm vi tài liệu thì hệ thống nhận là không biết.',
      ],
    },
    {
      moduleId: 'ai-s1-m3',
      objective:
        'Xây được bộ đánh giá tự động chặn hồi quy chất lượng trong quy trình tích hợp, không phải chấm bằng cảm nhận.',
      practice: [
        'Tự tay soạn 50 câu hỏi kèm đáp án chuẩn, lấy từ tài liệu thật chứ không sinh bằng mô hình.',
        'Chọn chỉ số phù hợp với tác vụ của bạn rồi chạy đo, ghi lại con số nền để so về sau.',
        'Sửa lời nhắc theo hướng mình nghĩ là tốt hơn, chạy lại bộ đánh giá và xem con số có thật sự tăng không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao đáp án chuẩn không nên do chính mô hình sinh ra?',
          a: 'Bộ đánh giá sẽ đo lại đúng thói quen của mô hình đó, nên mọi lỗi hệ thống của nó thành ra hợp lệ.',
        },
        {
          q: 'Khi nào dùng mô hình chấm mô hình là tin được?',
          a: 'Khi đã đối chiếu với người chấm trên một mẫu và biết mức lệch; không kiểm thì con số chỉ là cảm giác.',
        },
        {
          q: 'Vì sao sửa lời nhắc mà không chạy lại bộ đánh giá là nguy hiểm?',
          a: 'Sửa cho tốt ca mình vừa thấy rất hay làm hỏng ca khác, và không ai phát hiện tới khi người dùng gặp.',
        },
      ],
      doneSignals: [
        'Mỗi lần đổi lời nhắc bạn đều có bảng số trước và sau để so.',
        'Chất lượng tụt là quy trình tích hợp báo đỏ, không đợi người dùng phàn nàn.',
      ],
    },
    {
      moduleId: 'ai-s1-m4',
      objective:
        'Chặn được tiêm lệnh qua nội dung người dùng và giữ chi phí mỗi lượt trong mức đã đặt bằng bộ đệm và chọn mô hình.',
      practice: [
        'Nhét câu ra lệnh vào chính tài liệu được nạp, xem hệ thống có nghe theo không rồi tìm cách bịt.',
        'Bật bộ đệm cho câu hỏi lặp lại và đo lại chi phí trung bình trên một trăm lượt trước và sau.',
        'Định tuyến câu dễ sang mô hình rẻ và câu khó sang mô hình mạnh, đo cả chi phí lẫn chất lượng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao nội dung tài liệu nạp vào phải bị coi là dữ liệu không đáng tin?',
          a: 'Người ngoài viết được nội dung đó, và mô hình không phân biệt được đâu là lệnh của bạn đâu là chữ trong tài liệu.',
        },
        {
          q: 'Giới hạn lượt gọi bảo vệ bạn khỏi chuyện gì cụ thể?',
          a: 'Một người hoặc một kịch bản lỗi gọi liên tục có thể đốt hết ngân sách trong vài phút.',
        },
        {
          q: 'Ghi nhật ký lời nhắc và câu trả lời có rủi ro riêng tư nào?',
          a: 'Chúng thường chứa nguyên văn dữ liệu người dùng nhập, nên nhật ký thành một bản sao dữ liệu nhạy cảm.',
        },
      ],
      doneSignals: [
        'Nhét lệnh vào tài liệu không còn khiến hệ thống đổi hành vi.',
        'Chi phí trung bình mỗi câu hỏi nằm trong mức bạn đã đặt trước.',
      ],
    },
  ],
  rubric: [
    {
      id: 'ai-s1-r1',
      text: 'Bộ đánh giá có ít nhất 50 câu hỏi kèm đáp án chuẩn do người soạn, chạy được bằng một lệnh duy nhất.',
      howToProve: 'Chạy lệnh đánh giá và dán toàn bộ bảng kết quả kèm chỉ số tổng của lần chạy đó.',
    },
    {
      id: 'ai-s1-r2',
      text: 'Mọi câu trả lời kèm trích dẫn trỏ tới đoạn tài liệu có thật, mở ra kiểm được ngay tại chỗ.',
      howToProve:
        'Lấy ngẫu nhiên mười câu trả lời, mở từng trích dẫn và xác nhận đoạn đó chứa đúng ý đã nêu.',
    },
    {
      id: 'ai-s1-r3',
      text: 'Câu hỏi nằm ngoài phạm vi tài liệu nhận được câu trả lời thừa nhận không biết, không bịa nội dung.',
      howToProve:
        'Chuẩn bị mười câu ngoài phạm vi, chạy qua hệ thống và đếm số câu bị bịa, phải bằng không.',
    },
    {
      id: 'ai-s1-r4',
      text: 'Báo cáo chi phí trung bình mỗi câu hỏi tính từ số token thật, kèm mức trần đã đặt cho mỗi người dùng.',
      howToProve:
        'Dán bảng thống kê token của một trăm lượt gọi thật và phép tính ra chi phí trung bình.',
    },
    {
      id: 'ai-s1-r5',
      text: 'Tài liệu chứa câu ra lệnh cài cắm không làm hệ thống đổi hành vi, có ca kiểm tự động canh việc này.',
      howToProve:
        'Chạy ca kiểm tiêm lệnh trong bộ test và dán kết quả cho thấy hành vi giữ nguyên.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Ứng dụng hỏi đáp trên một tập tài liệu do bạn chọn, mỗi câu trả lời kèm trích dẫn nguồn.',
      'Bộ đánh giá tự động chạy trong quy trình tích hợp và chặn khi chất lượng tụt.',
      'Theo dõi chi phí theo token và giới hạn lượt cho mỗi người dùng.',
    ],
    scopeDont: [
      'KHÔNG huấn luyện hay tinh chỉnh mô hình, vì chưa có bộ đánh giá tin cậy thì không biết tinh chỉnh có tốt hơn không.',
      'KHÔNG làm hội thoại nhiều lượt có trí nhớ dài, một lượt hỏi đáp đã đủ dạy hết phần cốt lõi.',
      'KHÔNG tự dựng cơ sở dữ liệu vector riêng, dùng thư viện sẵn có để dành thời gian cho chất lượng.',
    ],
    touchpoints: [
      'Kịch bản nạp tài liệu: chia đoạn, sinh vector, ghi vào kho tìm kiếm.',
      'Tầng truy hồi: tìm theo vector, tìm theo từ khoá, gộp và xếp hạng lại.',
      'Kịch bản đánh giá và tệp dữ liệu câu hỏi kèm đáp án chuẩn.',
    ],
    contracts: [
      'Câu trả lời trả về kèm mảng trích dẫn, mỗi trích dẫn có mã tài liệu và vị trí đoạn.',
      'Đầu ra của mô hình luôn đi qua kiểm schema trước khi tới người dùng.',
      'Mọi lượt gọi mô hình ghi lại số token vào ra để tính chi phí, không ghi nguyên văn dữ liệu cá nhân.',
    ],
    acceptance: [
      'Năm tiêu chí rubric ở trên đều đạt và có bằng chứng chạy lệnh kèm theo.',
      'Đổi lời nhắc rồi chạy lại bộ đánh giá thấy được bảng so sánh trước và sau.',
    ],
    invariants: [
      'Không câu trả lời nào ra ngoài mà thiếu trích dẫn nguồn.',
      'Nội dung tài liệu luôn bị coi là dữ liệu, không bao giờ được coi là lệnh.',
      'Chi phí mỗi người dùng có trần cứng, chạm trần thì từ chối chứ không tiếp tục gọi.',
    ],
    conventions: [
      'Lời nhắc để riêng trong tệp của nó, không rải chuỗi trong mã xử lý.',
      'Mỗi lần đổi lời nhắc phải kèm bảng so sánh kết quả đánh giá trong mô tả thay đổi.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

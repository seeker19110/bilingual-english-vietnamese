// details/ai-s3.ts — Chi tiết chặng S3 hướng AI ("Học sâu").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const AI_S3_DETAIL: SpecStageDetail = {
  stageId: 'ai-s3',
  modules: [
    {
      moduleId: 'ai-s3-m1',
      objective:
        'Huấn luyện được mạng nơ-ron và gỡ được lỗi huấn luyện theo trình tự, thay vì thử mò từng siêu tham số.',
      practice: [
        'Huấn luyện tới khi khớp trọn một tập nhỏ 100 mẫu — phép thử chuẩn để biết đường ống không hỏng.',
        'Lập danh sách phép thử theo thứ tự cho tình huống mất mát không giảm, rồi áp dụng đúng thứ tự đó.',
        'Thử ba lịch học tốc độ khác nhau trên cùng dữ liệu và ghi lại đường cong mất mát.',
      ],
      selfCheck: [
        {
          q: 'Vì sao khớp được một tập rất nhỏ lại là phép thử đầu tiên?',
          a: 'Nếu không khớp nổi 100 mẫu thì lỗi nằm ở đường ống hoặc nhãn, chứ chưa phải ở sức mô hình.',
        },
        {
          q: 'Dropout và chuẩn hoá giúp gì?',
          a: 'Giảm khớp quá mức và giúp huấn luyện ổn định hơn, nhưng không cứu được dữ liệu bẩn.',
        },
      ],
      doneSignals: [
        'Mất mát không giảm thì bạn có quy trình chẩn đoán, không thử ngẫu nhiên.',
        'Bạn chạy lại được một lần huấn luyện cũ và ra kết quả tương đương.',
      ],
    },
    {
      moduleId: 'ai-s3-m2',
      objective:
        'Chọn được kiến trúc phù hợp cho dữ liệu ảnh hay dữ liệu chuỗi và tận dụng học chuyển giao đúng cách.',
      practice: [
        'Tinh chỉnh một mô hình có sẵn cho bài toán của mình và so với huấn luyện từ đầu ở cùng ngân sách tính toán.',
        'Vẽ lại cơ chế chú ý bằng tay trên một ví dụ nhỏ để chắc là hiểu, không chỉ gọi thư viện.',
        'Thay phần đầu ra của mô hình có sẵn và đóng băng dần các lớp, ghi lại tác động tới kết quả.',
      ],
      selfCheck: [
        {
          q: 'Khi nào học chuyển giao không giúp được gì?',
          a: 'Khi dữ liệu của mình khác hẳn dữ liệu mô hình gốc từng học, đặc trưng sẵn có không dùng lại được.',
        },
        {
          q: 'Vì sao Transformer hợp với dữ liệu chuỗi dài?',
          a: 'Cơ chế chú ý nối trực tiếp mọi vị trí với nhau nên phụ thuộc xa không bị mờ dần như mạng hồi tiếp.',
        },
      ],
      doneSignals: [
        'Bạn chọn kiến trúc kèm lý do gắn với dạng dữ liệu, không theo trào lưu.',
        'Mọi kết quả bạn báo đều có đường cơ sở để so.',
      ],
    },
    {
      moduleId: 'ai-s3-m3',
      objective:
        'Xử lý được phần dữ liệu — nhãn, tăng cường và dịch chuyển phân phối — vì đó thường là chỗ quyết định chất lượng.',
      practice: [
        'Gán nhãn 200 mẫu cùng một người khác, đo độ đồng thuận rồi sửa hướng dẫn gán nhãn cho tới khi tăng.',
        'Thử ba cách tăng cường dữ liệu và đo tác động riêng của từng cách.',
        'So phân phối dữ liệu huấn luyện với dữ liệu thật gần đây để phát hiện dịch chuyển.',
      ],
      selfCheck: [
        {
          q: 'Độ đồng thuận giữa người gán nhãn thấp nói lên điều gì?',
          a: 'Định nghĩa nhãn còn mơ hồ, nên mô hình học từ dữ liệu đó cũng sẽ mâu thuẫn.',
        },
        {
          q: 'Dịch chuyển phân phối gây hại thế nào sau khi lên chạy thật?',
          a: 'Chất lượng tụt dần dù mô hình không đổi, vì dữ liệu thật đã khác dữ liệu huấn luyện.',
        },
      ],
      doneSignals: [
        'Trước khi đổi mô hình lớn hơn, bạn kiểm chất lượng nhãn trước.',
        'Bạn theo dõi phân phối dữ liệu thật theo thời gian, không chỉ điểm số lúc huấn luyện.',
      ],
    },
    {
      moduleId: 'ai-s3-m4',
      objective:
        'Quyết định được khi nào tinh chỉnh mô hình ngôn ngữ là đáng tiền và khi nào một prompt tốt là đủ.',
      practice: [
        'Tinh chỉnh bằng phương pháp hiệu quả tham số rồi so với một prompt viết kỹ trên cùng bộ đánh giá.',
        'Lượng tử hoá mô hình và đo lại chất lượng cùng độ trễ sau khi lượng tử.',
        'Ước tính chi phí cho mỗi nghìn lượt gọi của cả hai cách để có căn cứ quyết định.',
      ],
      selfCheck: [
        {
          q: 'Tinh chỉnh giải quyết được gì mà prompt khó làm?',
          a: 'Định dạng đầu ra ổn định và phong cách chuyên biệt trên tập việc hẹp, với độ trễ và chi phí thấp hơn khi lượng gọi lớn.',
        },
        {
          q: 'Vì sao phải có bộ đánh giá cố định trước khi so hai cách?',
          a: 'Không có thước đo chung thì mọi so sánh chỉ là cảm nhận trên vài ví dụ tự chọn.',
        },
      ],
      doneSignals: [
        'Bạn dám kết luận không tinh chỉnh khi số liệu nói prompt là đủ.',
        'Mỗi lựa chọn của bạn kèm cả chất lượng lẫn chi phí, không chỉ chất lượng.',
      ],
    },
  ],
  rubric: [
    {
      id: 'ai-s3-r1',
      text: 'Kết quả tốt hơn cả mô hình gốc lẫn giải pháp prompt thuần ít nhất 5 điểm phần trăm ở chỉ số chính.',
      howToProve:
        'Nộp bảng ba cột: mô hình gốc, prompt thuần, mô hình của mình trên cùng bộ đánh giá.',
    },
    {
      id: 'ai-s3-r2',
      text: 'Có thẻ mô hình ghi đủ nguồn dữ liệu, giới hạn, rủi ro dùng sai và cách đánh giá đã dùng.',
      howToProve: 'Nộp thẻ mô hình và chỉ ra ít nhất hai tình huống mô hình chắc chắn sẽ hỏng.',
    },
    {
      id: 'ai-s3-r3',
      text: 'Chạy được suy luận trên phần cứng bình dân với độ trễ p95 dưới 500 mili giây, đo trên 100 lượt.',
      howToProve: 'Chạy kịch bản đo độ trễ 100 lượt và dán phân vị 95 kèm cấu hình máy.',
    },
    {
      id: 'ai-s3-r4',
      text: 'Dựng lại được toàn bộ kết quả từ đầu bằng một lệnh, sai lệch không quá 1 điểm phần trăm.',
      howToProve: 'Chạy lại từ kho mã sạch và so kết quả với lần chạy đã báo cáo.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tinh chỉnh một mô hình cho bài toán tiếng Việt cụ thể và đánh giá trung thực.',
      'Ghi lại thẻ mô hình và cách dựng lại kết quả.',
    ],
    scopeDont: [
      'Không huấn luyện mô hình nền từ đầu, vì chi phí lớn mà không phục vụ mục tiêu học của chặng.',
      'Không dùng dữ liệu người dùng thật khi chưa có cơ sở pháp lý rõ ràng.',
    ],
    touchpoints: [
      'Bộ dữ liệu và mã chia tập huấn luyện, kiểm tra, đánh giá.',
      'Kịch bản huấn luyện và kịch bản đo độ trễ suy luận.',
    ],
    contracts: [
      'Đầu vào và đầu ra của mô hình có kiểu rõ ràng, kể cả trường hợp mô hình từ chối trả lời.',
      'Bộ đánh giá cố định, không đổi giữa các lần so sánh.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric kèm số đo chạy lại được.',
      'Có ghi chú rõ những gì mô hình không nên được dùng để làm.',
    ],
    invariants: [
      'Không chỉnh siêu tham số trên tập kiểm tra cuối cùng.',
      'Không rò dữ liệu giữa tập huấn luyện và tập đánh giá.',
    ],
    conventions: [
      'Mọi lần chạy ghi lại hạt giống ngẫu nhiên và phiên bản dữ liệu.',
      'Chi phí tính toán ghi kèm mỗi kết quả để so sánh công bằng.',
    ],
  },
}

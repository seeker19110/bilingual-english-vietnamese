// details/mathforcode-s3.ts — Chi tiết chặng S3 hướng TOÁN HỌC CHO LẬP TRÌNH
// ("Đại số tuyến tính ứng dụng"). Bản đồ chặng ở ../mathforcode.ts.
//
// Đặc thù S3: lần đầu người học được dùng numpy, nhưng CHỈ làm thư viện đối chiếu. Cài tay trước,
// gọi thư viện sau — nếu đảo thứ tự thì kết quả vẫn đúng mà người học không học được gì.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MATHFORCODE_S3_DETAIL: SpecStageDetail = {
  stageId: 'mathforcode-s3',
  modules: [
    {
      moduleId: 'mathforcode-s3-m1',
      objective:
        'Dùng vector để trả lời câu hỏi hình học trong code: hai vật đang đi cùng hướng hay ngược, cách nhau bao xa.',
      practice: [
        'Cài lớp vector hai chiều với cộng, trừ, nhân vô hướng, độ dài và chuẩn hoá bằng Python thuần.',
        'Tính góc giữa hai vector bằng tích vô hướng rồi kiểm lại bằng hình vẽ trên matplotlib.',
        'Xử lý ca vector không: chuẩn hoá phải báo lỗi rõ ràng thay vì chia cho 0.',
      ],
      selfCheck: [
        {
          q: 'Tích vô hướng bằng 0 nói lên điều gì về hai vector?',
          a: 'Hai vector vuông góc với nhau, miễn là cả hai đều khác vector không.',
        },
        {
          q: 'Chuẩn hoá vector để làm gì trong game hai chiều?',
          a: 'Để giữ lại hướng nhưng bỏ độ dài, nhờ đó nhân với tốc độ mong muốn cho ra vận tốc đúng.',
        },
        {
          q: 'Dấu của tích vô hướng cho biết gì về góc giữa hai vector?',
          a: 'Dương là góc nhọn, âm là góc tù, nên nó phân biệt được cùng hướng hay ngược hướng.',
        },
      ],
      doneSignals: [
        'Bạn diễn đạt được một quy tắc chuyển động bằng phép toán vector thay vì bằng chuỗi if.',
        'Lớp vector của bạn từ chối chuẩn hoá vector không bằng lỗi rõ ràng.',
      ],
    },
    {
      moduleId: 'mathforcode-s3-m2',
      objective:
        'Ghép nhiều phép biến đổi hình học thành một ma trận duy nhất và giải thích được vì sao đổi thứ tự lại ra hình khác.',
      practice: [
        'Cài nhân ma trận bằng ba vòng lặp lồng rồi so kết quả với numpy trên ma trận ngẫu nhiên có hạt giống.',
        'Áp ma trận xoay rồi tịnh tiến lên một hình, sau đó đảo thứ tự và vẽ hai kết quả cạnh nhau.',
        'Dùng toạ độ thuần nhất để gộp cả tịnh tiến vào một ma trận ba nhân ba duy nhất.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phép nhân ma trận không hoán vị được?',
          a: 'Vì mỗi ma trận là một phép biến đổi, làm xoay trước rồi dời khác hẳn dời trước rồi xoay.',
        },
        {
          q: 'Toạ độ thuần nhất giải quyết vấn đề gì?',
          a: 'Nó biến tịnh tiến vốn là phép cộng thành phép nhân ma trận, nhờ đó gộp chung được với xoay và co giãn.',
        },
        {
          q: 'Quy ước hàng-cột sai thì hậu quả trông ra sao?',
          a: 'Hình bị biến đổi ngược hoặc lệch trục, và lỗi khó tìm vì code vẫn chạy không báo gì.',
        },
      ],
      doneSignals: [
        'Bạn dự đoán đúng hình dạng kết quả trước khi vẽ khi đổi thứ tự nhân ma trận.',
        'Bản nhân ma trận tự cài của bạn khớp numpy trong ngưỡng sai số đã đặt.',
      ],
    },
    {
      moduleId: 'mathforcode-s3-m3',
      objective:
        'Giải hệ phương trình tuyến tính bằng khử Gauss tự cài và nhận ra khi nào hệ không có nghiệm duy nhất.',
      practice: [
        'Cài khử Gauss có chọn trụ theo giá trị tuyệt đối lớn nhất, so nghiệm với numpy trên nhiều hệ ngẫu nhiên.',
        'Chạy bộ giải trên một ma trận suy biến và xác nhận nó báo lỗi thay vì trả số vô nghĩa.',
        'So sai số nghiệm giữa bản có chọn trụ và bản không chọn trụ trên hệ có phần tử rất nhỏ.',
      ],
      selfCheck: [
        {
          q: 'Định thức bằng 0 nói gì về hệ phương trình?',
          a: 'Hệ không có nghiệm duy nhất, tức là vô nghiệm hoặc có vô số nghiệm tuỳ vế phải.',
        },
        {
          q: 'Vì sao phải chọn trụ chính có giá trị tuyệt đối lớn nhất?',
          a: 'Chia cho số rất nhỏ khuếch đại sai số làm nghiệm sai lệch mạnh, chọn trụ lớn giữ sai số nhỏ lại.',
        },
        {
          q: 'Hệ gần suy biến khác hệ suy biến hẳn ở chỗ nào trong thực tế?',
          a: 'Hệ gần suy biến vẫn cho nghiệm nhưng nghiệm rất nhạy với sai số đầu vào, nên kết quả kém tin cậy.',
        },
      ],
      doneSignals: [
        'Bộ giải của bạn phân biệt được vô nghiệm và vô số nghiệm chứ không gộp thành một lỗi chung.',
        'Bạn chỉ ra được bằng số đo lợi ích của việc chọn trụ trên một ví dụ cụ thể.',
      ],
    },
    {
      moduleId: 'mathforcode-s3-m4',
      objective:
        'Giải thích được vector riêng bằng hình ảnh trực giác và tìm hướng trội bằng lặp luỹ thừa tự cài.',
      practice: [
        'Vẽ ảnh của nhiều vector qua cùng một ma trận để nhận ra hướng nào không bị đổi hướng.',
        'Cài lặp luỹ thừa, ghi lại vector sau mỗi vòng và quan sát nó hội tụ về đâu.',
        'Dựng PageRank rút gọn cho một đồ thị năm trang và đối chiếu thứ hạng với trực giác về liên kết.',
      ],
      selfCheck: [
        {
          q: 'Vector riêng của một ma trận là gì nói theo hình học?',
          a: 'Là hướng mà phép biến đổi chỉ kéo dài hoặc co lại chứ không xoay đi hướng khác.',
        },
        {
          q: 'Lặp luỹ thừa hội tụ về vector riêng nào?',
          a: 'Về vector riêng ứng với giá trị riêng có độ lớn lớn nhất, vì thành phần đó lấn át sau nhiều vòng.',
        },
        {
          q: 'Vì sao xếp hạng trang web lại quy về bài toán vector riêng?',
          a: 'Vì điểm của một trang phụ thuộc điểm các trang trỏ tới nó, tạo thành hệ tự tham chiếu ổn định ở vector riêng.',
        },
      ],
      doneSignals: [
        'Bạn nhìn một ma trận hai nhân hai là đoán được nó kéo giãn theo hướng nào.',
        'Bảng giá trị từng vòng lặp của bạn cho thấy rõ quá trình hội tụ chứ không chỉ có kết quả cuối.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mathforcode-s3-r1',
      text: 'Các phép nhân ma trận, xoay, co giãn và tịnh tiến tự cài khớp numpy với sai số tuyệt đối dưới một phần tỉ.',
      howToProve:
        'Chạy pytest đối chiếu trên ma trận ngẫu nhiên có hạt giống và dán sai số lớn nhất đo được.',
    },
    {
      id: 'mathforcode-s3-r2',
      text: 'Bộ giải hệ phương trình báo lỗi rõ ràng với ma trận suy biến và không trả về kết quả rác.',
      howToProve: 'Dán ca test truyền ma trận suy biến cùng thông báo lỗi mà chương trình sinh ra.',
    },
    {
      id: 'mathforcode-s3-r3',
      text: 'Có hình vẽ trước và sau khi áp chuỗi biến đổi, kèm ma trận tổng hợp đã dùng để tạo ra hình đó.',
      howToProve: 'Dán hai hình cạnh nhau cùng ma trận ba nhân ba và thứ tự nhân đã áp dụng.',
    },
    {
      id: 'mathforcode-s3-r4',
      text: 'Lặp luỹ thừa hội tụ về vector riêng trội trên ma trận thử, có bảng giá trị theo từng vòng lặp.',
      howToProve:
        'Dán bảng ít nhất mười vòng lặp gồm vector hiện tại và mức thay đổi so với vòng trước.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Cài bằng Python thuần lớp vector, phép nhân ma trận và các phép biến đổi hình học hai chiều.',
      'Cài khử Gauss có chọn trụ, xử lý rõ ràng ca ma trận suy biến.',
      'Cài lặp luỹ thừa và vẽ hình minh hoạ kết quả biến đổi.',
    ],
    scopeDont: [
      'KHÔNG dùng numpy trong nhân tính toán, nó chỉ được xuất hiện ở tầng đối chiếu vì đó là thước đo.',
      'KHÔNG làm hình học ba chiều, chặng này giữ ở mặt phẳng để tập trung vào ý nghĩa phép biến đổi.',
      'KHÔNG tối ưu tốc độ nhân ma trận, ba vòng lặp rõ ràng có giá trị học tập hơn bản nhanh khó đọc.',
    ],
    touchpoints: [
      'Mô-đun vector và ma trận: hàm thuần, không phụ thuộc thư viện ngoài.',
      'Mô-đun đối chiếu: nơi duy nhất được phép import numpy để so kết quả.',
      'Mô-đun vẽ hình: nhận toạ độ đã tính sẵn, không tự tính biến đổi.',
    ],
    contracts: [
      'Ma trận biểu diễn theo danh sách các hàng, quy ước này giữ nguyên trong toàn dự án.',
      'Mọi hàm so sánh kết quả nhận ngưỡng sai số làm tham số, mặc định ghi rõ trong tài liệu.',
      'Hàm giải hệ ném lỗi có kiểu riêng khi ma trận suy biến, không trả về giá trị đặc biệt.',
    ],
    acceptance: [
      'Đủ bốn tiêu chí rubric, mỗi tiêu chí kèm kết quả chạy thật hoặc hình vẽ.',
      'Toàn bộ test đối chiếu với numpy chạy xanh bằng một lệnh duy nhất.',
    ],
    invariants: [
      'Không hàm nào trong nhân tính toán import numpy hay thư viện toán ngoài.',
      'Độ dài vector sau chuẩn hoá luôn bằng một trong ngưỡng sai số đã công bố.',
      'Ma trận xoay giữ nguyên độ dài mọi vector, đây là bất biến có test canh riêng.',
    ],
    conventions: [
      'Ký hiệu toán trong comment tiếng Việt dùng đúng tên đã thống nhất, không đổi giữa chừng.',
      'Mỗi phép biến đổi có một test canh bất biến hình học tương ứng của nó.',
      'Commit theo conventional commits, tách riêng phần cài tay và phần đối chiếu thư viện.',
    ],
  },
}

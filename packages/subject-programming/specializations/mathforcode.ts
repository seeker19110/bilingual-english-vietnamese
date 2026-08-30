// Hướng TOÁN HỌC CHO LẬP TRÌNH — hướng nền cắt ngang thứ ba, học song song hướng sản phẩm.
//
// Vì sao tách riêng khỏi hướng THUẬT TOÁN: thuật toán dạy cách nghĩ ra lời giải; hướng này dạy
// thứ nằm DƯỚI lời giải — số được máy biểu diễn thế nào, xác suất va chạm là bao nhiêu, gradient
// đi về đâu. Người học xong hướng này cài lại được công thức bằng code chứ không chỉ đọc hiểu.
import type { ProgrammingSpecialization } from './types.js'

export const MATHFORCODE_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'mathforcode',
  name: 'Toán học cho Lập trình',
  tagline: 'Hiểu thật phần toán nằm dưới thuật toán, đồ hoạ và AI — rồi tự cài lại bằng code.',
  forWho:
    'Hợp với người đã qua P3 (thạo hàm, list, một chút OOP) nhưng thấy mình đang dùng thư viện toán như hộp đen. KHÔNG hợp với người chỉ cần ghép thư viện cho xong việc — hướng này bắt cài tay trước khi được gọi hàm có sẵn.',
  prerequisite: 'p3',
  duration: '7–11 tháng (học song song một hướng sản phẩm)',
  languages: ['Python'],
  coreTools: [
    'Python chuẩn (không thư viện) để cài tay',
    'numpy — chỉ dùng ở S3/S4 làm thư viện ĐỐI CHIẾU',
    'matplotlib để vẽ kiểm tra trực giác',
    'pytest để canh kết quả công thức',
  ],
  crossCutting: true,
  architecture: {
    modules: [
      {
        name: 'Mô hình toán',
        role: 'Phát biểu bài toán thành ký hiệu: biến nào, miền giá trị nào, bất biến toán học nào phải luôn đúng. Không chứa code tính toán.',
      },
      {
        name: 'Nhân tính toán',
        role: 'Chuyển công thức thành hàm thuần, tất định, không I/O. Chịu trách nhiệm cả việc chọn thứ tự phép tính sao cho sai số không phình.',
      },
      {
        name: 'Bộ đối chiếu',
        role: 'So kết quả nhân tính toán với lời giải tay hoặc thư viện tham chiếu, theo sai số tuyệt đối đã công bố. Không sửa dữ liệu đầu vào.',
      },
      {
        name: 'Sinh dữ liệu thử',
        role: 'Sinh đầu vào ngẫu nhiên có hạt giống và các ca biên toán học: số 0, số âm, giá trị rất lớn, ma trận suy biến.',
      },
      {
        name: 'Trực quan hoá',
        role: 'Vẽ đồ thị hàm số, quỹ đạo hội tụ, phân bố dữ liệu để mắt bắt được lỗi mà con số đơn lẻ giấu đi.',
      },
    ],
    contracts: [
      'Mỗi hàm toán ghi rõ miền xác định của tham số và điều gì xảy ra khi ra ngoài miền đó.',
      'Kết quả dấu phẩy động luôn kèm sai số cho phép; so sánh bằng ngưỡng chứ không bằng dấu bằng.',
      'Mọi hàm có yếu tố ngẫu nhiên nhận hạt giống, cùng hạt giống cho cùng kết quả.',
      'Vector và ma trận cố định quy ước hàng-cột ngay từ đầu và không đổi giữa chừng.',
    ],
    keyDecisions: [
      'Dùng số nguyên/phân số chính xác hay dấu phẩy động: chọn sai thì sai số tích luỹ không cứu được về sau.',
      'Cài tay hay gọi thư viện: cài tay để hiểu, gọi thư viện để chạy nhanh — quyết định theo mục tiêu từng phần, ghi rõ trong đặc tả.',
      'Ngưỡng sai số chấp nhận đặt bằng bao nhiêu và đo theo sai số tuyệt đối hay tương đối.',
      'Quy ước lưu ma trận theo hàng hay theo cột, vì nó quyết định cả công thức lẫn hiệu năng bộ nhớ.',
    ],
    nfrs: [
      'Sai số so với lời giải tham chiếu nằm dưới ngưỡng đã công bố trên toàn bộ dữ liệu thử.',
      'Thời gian chạy có trần ở kích thước dữ liệu lớn nhất được hỗ trợ, đo lặp lại được.',
      'Tất định: cùng đầu vào và cùng hạt giống thì cho cùng kết quả tới từng chữ số.',
      'Không tràn số và không chia cho 0 im lặng — mọi trường hợp suy biến báo lỗi rõ ràng.',
    ],
    specChecklist: [
      'Công thức toán viết ra đầy đủ, kèm nguồn hoặc cách suy ra.',
      'Miền giá trị hợp lệ của từng tham số và hành vi khi vượt miền.',
      'Ngưỡng sai số chấp nhận và lời giải tham chiếu dùng để đối chiếu.',
      'Ca biên toán học bắt buộc đúng: 0, số âm, ma trận suy biến, hàm không khả vi tại một điểm.',
      'Quy ước ký hiệu và đơn vị, để người thi hành không tự đặt lại giữa chừng.',
    ],
  },
  stages: [
    {
      id: 'mathforcode-s1',
      tier: 's1',
      name: 'Nền tảng rời rạc cho lập trình viên',
      canDo:
        'Giải thích được máy lưu số thế nào và chứng minh được độ phức tạp của vòng lặp bằng lập luận toán học.',
      duration: '7–9 tuần',
      modules: [
        {
          id: 'mathforcode-s1-m1',
          title: 'Hệ đếm và biểu diễn số',
          topics: [
            'Nhị phân, thập lục phân, chuyển đổi qua lại bằng tay',
            'Số nguyên có dấu bằng bù 2, tràn số khi cộng',
            'Dấu phẩy động IEEE 754: vì sao 0.1 + 0.2 khác 0.3',
            'So sánh số thực bằng ngưỡng sai số thay vì bằng dấu bằng',
          ],
        },
        {
          id: 'mathforcode-s1-m2',
          title: 'Đại số Boolean và logic mệnh đề',
          topics: [
            'Bảng chân trị, phép và/hoặc/phủ định',
            'Luật De Morgan để rút gọn điều kiện if lồng nhau',
            'Phép toán trên bit: AND, OR, XOR, dịch bit và mặt nạ cờ',
            'Đánh giá ngắn mạch và thứ tự điều kiện ảnh hưởng tới kết quả',
          ],
        },
        {
          id: 'mathforcode-s1-m3',
          title: 'Số học modulo',
          topics: [
            'Đồng dư, phép chia lấy dư với số âm trong Python và trong C',
            'Băm bằng modulo và chọn kích thước bảng băm',
            'Buffer vòng và lịch xoay ca bằng chỉ số modulo',
            'Chữ số kiểm tra: ISBN-10, thuật toán Luhn cho số thẻ',
          ],
        },
        {
          id: 'mathforcode-s1-m4',
          title: 'Big-O bằng ngôn ngữ toán',
          topics: [
            'Định nghĩa O lớn qua chặn trên và hằng số, không phải qua cảm giác',
            'Tổng cấp số cộng và cấp số nhân xuất hiện trong vòng lặp lồng',
            'Chứng minh bằng quy nạp cho công thức đếm số phép tính',
            'Tăng trưởng logarit: vì sao chia đôi cho ra log₂n bước',
          ],
        },
      ],
      project: {
        name: 'Thư viện số học rời rạc tự cài',
        brief:
          'Một gói Python thuần cài các phép toán nền: chuyển hệ đếm, bù 2, kiểm tra Luhn/ISBN và đếm phép tính của vài thuật toán.',
        requirements: [
          'Chuyển đổi hệ đếm và bù 2 khớp kết quả của hàm dựng sẵn Python trên 1000 giá trị ngẫu nhiên có hạt giống',
          'Bộ kiểm Luhn và ISBN-10 chạy đúng trên danh sách mã hợp lệ và mã bị đổi một chữ số',
          'Một trang ghi chú giải thích bằng ví dụ cụ thể vì sao 0.1 + 0.2 không bằng 0.3',
          'Đếm số phép tính thực tế của ba vòng lặp và đối chiếu với công thức tổng đã chứng minh',
        ],
      },
    },
    {
      id: 'mathforcode-s2',
      tier: 's2',
      name: 'Tổ hợp và xác suất cho lập trình viên',
      canDo:
        'Đếm được số trường hợp của một bài toán trước khi vét cạn và ước lượng được rủi ro va chạm bằng xác suất.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'mathforcode-s2-m1',
          title: 'Đếm, hoán vị, tổ hợp',
          topics: [
            'Quy tắc cộng và quy tắc nhân khi liệt kê trường hợp',
            'Hoán vị, chỉnh hợp, tổ hợp và cách phân biệt bằng câu hỏi thứ tự có quan trọng không',
            'Ước lượng kích thước không gian tìm kiếm trước khi viết vòng lặp vét cạn',
            'Sinh bộ ca kiểm phủ hết tổ hợp tham số của một hàm',
          ],
        },
        {
          id: 'mathforcode-s2-m2',
          title: 'Xác suất rời rạc và kỳ vọng',
          topics: [
            'Không gian mẫu, biến cố, xác suất có điều kiện',
            'Kỳ vọng và tính tuyến tính của kỳ vọng',
            'Bài toán sinh nhật và xác suất va chạm trong bảng băm',
            'Đọc kết quả A/B testing: khác biệt thật hay chỉ là nhiễu',
          ],
        },
        {
          id: 'mathforcode-s2-m3',
          title: 'Số giả ngẫu nhiên',
          topics: [
            'Bộ sinh đồng dư tuyến tính, chu kỳ và hạt giống',
            'Vì sao cùng hạt giống lại tái hiện được toàn bộ chuỗi',
            'Lấy mẫu đều, trộn Fisher-Yates và lỗi thiên lệch hay gặp khi trộn sai',
            'Ngẫu nhiên cho mô phỏng khác ngẫu nhiên cho mật mã ở chỗ nào',
          ],
        },
        {
          id: 'mathforcode-s2-m4',
          title: 'Thống kê mô tả khi đo hiệu năng',
          topics: [
            'Trung bình, trung vị, phương sai, độ lệch chuẩn',
            'Vì sao độ trễ luôn báo theo phân vị p95/p99 thay vì trung bình',
            'Giá trị ngoại lai và cách nhận ra lần đo bị nhiễu',
            'Số lần lặp cần thiết để con số đo ổn định',
          ],
        },
      ],
      project: {
        name: 'Phòng thí nghiệm xác suất cho bảng băm',
        brief: 'Mô phỏng va chạm bảng băm và so kết quả mô phỏng với công thức xác suất tính tay.',
        requirements: [
          'Mô phỏng có hạt giống, chạy lại cho ra đúng cùng kết quả',
          'Bảng so sánh tỉ lệ va chạm mô phỏng với giá trị lý thuyết từ bài toán sinh nhật, lệch dưới 2%',
          'Báo cáo thời gian tra cứu theo p50/p95/p99 ở ba mức hệ số tải khác nhau',
          'Giải thích được bằng chữ vì sao tăng kích thước bảng lại giảm va chạm theo hình dạng đã đo',
        ],
      },
    },
    {
      id: 'mathforcode-s3',
      tier: 's3',
      name: 'Đại số tuyến tính ứng dụng',
      canDo:
        'Cài tay được phép biến đổi vector và ma trận rồi chứng minh kết quả khớp numpy trên dữ liệu thử.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'mathforcode-s3-m1',
          title: 'Vector và hình học 2D',
          topics: [
            'Cộng, trừ, nhân vô hướng, độ dài vector',
            'Tích vô hướng và góc giữa hai vector, kiểm tra vuông góc',
            'Chuẩn hoá vector và vì sao chia cho độ dài 0 phải chặn sớm',
            'Ứng dụng: hướng di chuyển và va chạm trong game 2D',
          ],
        },
        {
          id: 'mathforcode-s3-m2',
          title: 'Ma trận và phép biến đổi',
          topics: [
            'Nhân ma trận bằng tay và quy ước hàng-cột',
            'Ma trận xoay, co giãn, phản chiếu trong mặt phẳng',
            'Toạ độ thuần nhất để gộp tịnh tiến vào phép nhân ma trận',
            'Ghép nhiều phép biến đổi và vì sao thứ tự nhân không hoán vị được',
          ],
        },
        {
          id: 'mathforcode-s3-m3',
          title: 'Hệ phương trình tuyến tính',
          topics: [
            'Khử Gauss từng bước cài bằng Python thuần',
            'Định thức, ma trận suy biến và ý nghĩa của vô nghiệm hay vô số nghiệm',
            'Sai số khi trụ chính quá nhỏ và cách chọn trụ theo giá trị lớn nhất',
            'Ứng dụng: cân bằng luồng trong một hệ thống nhiều nút',
          ],
        },
        {
          id: 'mathforcode-s3-m4',
          title: 'Không gian trạng thái và giá trị riêng ở mức trực giác',
          topics: [
            'Ma trận như một phép biến đổi lặp lại trên trạng thái',
            'Vector riêng là hướng không bị đổi hướng sau phép biến đổi',
            'Lặp luỹ thừa để tìm hướng chiếm ưu thế, cài bằng vòng lặp đơn giản',
            'PageRank rút gọn: vì sao xếp hạng trang là một bài toán vector riêng',
          ],
        },
      ],
      project: {
        name: 'Bộ biến đổi hình học tự cài',
        brief:
          'Cài bằng Python thuần các phép biến đổi 2D và bộ giải hệ phương trình, đối chiếu với numpy.',
        requirements: [
          'Nhân ma trận, xoay, co giãn, tịnh tiến khớp numpy với sai số tuyệt đối dưới 1e-9',
          'Bộ giải hệ phương trình xử lý đúng ma trận suy biến bằng lỗi rõ ràng, không trả kết quả rác',
          'Ảnh hoặc hình vẽ trước và sau khi áp chuỗi biến đổi, kèm ma trận tổng hợp đã dùng',
          'Lặp luỹ thừa hội tụ về vector riêng trội trên một ma trận thử, có bảng giá trị từng vòng',
        ],
      },
    },
    {
      id: 'mathforcode-s4',
      tier: 's4',
      name: 'Giải tích và tối ưu cho AI/ML',
      canDo:
        'Cài gradient descent từ số 0 và giải thích được vì sao mô hình hội tụ hay không hội tụ.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'mathforcode-s4-m1',
          title: 'Đạo hàm và gradient descent',
          topics: [
            'Đạo hàm là tốc độ đổi, hiểu qua hệ số góc tiếp tuyến',
            'Đạo hàm số bằng sai phân hữu hạn để kiểm tra công thức tay',
            'Cài gradient descent bằng Python thuần cho hàm một biến rồi nhiều biến',
            'Tốc độ học quá lớn gây phân kỳ, quá nhỏ gây chậm — quan sát bằng đồ thị',
          ],
        },
        {
          id: 'mathforcode-s4-m2',
          title: 'Hàm mất mát và tính lồi',
          topics: [
            'Sai số bình phương trung bình và sai số tuyệt đối, khác nhau khi có ngoại lai',
            'Hàm lồi có một cực tiểu, hàm không lồi có nhiều cực tiểu địa phương',
            'Điểm yên ngựa và cao nguyên phẳng làm quá trình học đứng lại',
            'Hồi quy tuyến tính giải bằng công thức đóng và giải bằng lặp, so hai kết quả',
          ],
        },
        {
          id: 'mathforcode-s4-m3',
          title: 'Đạo hàm riêng và ý tưởng lan truyền ngược',
          topics: [
            'Đạo hàm riêng theo từng tham số và vector gradient',
            'Quy tắc chuỗi khi hàm được ghép nhiều tầng',
            'Lan truyền ngược ở mức trực giác: chia phần lỗi ngược về từng tham số',
            'Kiểm gradient bằng sai phân hữu hạn để bắt lỗi cài đặt',
          ],
        },
        {
          id: 'mathforcode-s4-m4',
          title: 'Tối ưu cho bài toán thực tế',
          topics: [
            'Đặt bài toán kinh doanh thành hàm mục tiêu và ràng buộc',
            'Định giá động: tối ưu doanh thu theo đường cầu ước lượng',
            'Lập lịch và phân bổ tài nguyên bằng tìm kiếm cục bộ có hướng',
            'Khi nào dừng tối ưu: chi phí tính toán vượt giá trị mang lại',
          ],
        },
      ],
      project: {
        name: 'Mô hình học từ số 0, không thư viện',
        brief:
          'Cài hồi quy tuyến tính và một mạng nơ-ron một tầng ẩn bằng Python thuần, huấn luyện bằng gradient descent tự viết.',
        requirements: [
          'Gradient tính tay khớp gradient số bằng sai phân hữu hạn, lệch tương đối dưới 1e-6',
          'Hồi quy tuyến tính cho hệ số khớp nghiệm công thức đóng với sai số dưới 1e-6',
          'Đồ thị hàm mất mát giảm đơn điệu ở tốc độ học đã chọn, kèm một lần chạy phân kỳ để đối chứng',
          'Mạng một tầng ẩn đạt độ chính xác công bố trên tập kiểm tra tách riêng, có hạt giống cố định',
        ],
      },
    },
  ],
  capstone: {
    name: 'Cài lại một mô hình toán từ số 0 và chứng minh nó đúng',
    brief:
      'Chọn một thuật toán có nền toán rõ ràng, cài hoàn toàn bằng Python thuần, rồi chứng minh kết quả khớp một thư viện tham chiếu.',
    requirements: [
      'Toàn bộ phần toán tự cài, không gọi hàm cao cấp của numpy hay scikit-learn trong nhân tính toán',
      'Kết quả khớp thư viện tham chiếu trên bộ dữ liệu thử với sai số công bố bằng số cụ thể',
      'Bộ test tự động chạy bằng một lệnh, gồm ca biên suy biến và ca dữ liệu lớn',
      'Bài viết dẫn từ công thức toán tới từng dòng code, đủ để người khác cài lại được',
    ],
  },
  expertSignals: [
    'Nhìn công thức trong bài báo là ước lượng được nó thành bao nhiêu vòng lặp và tốn bao nhiêu bộ nhớ',
    'Chặn sớm các ca suy biến toán học thay vì để chương trình trả ra NaN rồi mới đi tìm',
    'Chọn được giữa cài tay và gọi thư viện dựa trên yêu cầu sai số và thời gian, nói rõ lý do',
    'Kiểm gradient hoặc kiểm bất biến toán học trước khi tin vào kết quả huấn luyện',
  ],
  careers: [
    'Data / Machine Learning Engineer',
    'Game / Graphics Programmer',
    'Quantitative Developer',
    'Backend Engineer làm phần tối ưu và tính toán nặng',
  ],
  pitfalls: [
    'Học thuộc công thức mà không cài lại được bằng code, nên gặp biến thể là bí',
    'Dùng thư viện như hộp đen, tới lúc kết quả sai thì không biết bắt đầu tìm từ đâu',
    'Bỏ qua sai số dấu phẩy động rồi so hai số thực bằng dấu bằng',
    'Nhảy thẳng vào học máy khi chưa nắm vector và đạo hàm, dẫn tới chỉnh tham số theo may rủi',
  ],
  resources: [
    'Mathematics for Machine Learning — Deisenroth, Faisal, Ong',
    'Concrete Mathematics — Graham, Knuth, Patashnik',
    'Linear Algebra Done Right — Sheldon Axler',
    '3Blue1Brown — Essence of Linear Algebra và Essence of Calculus',
    'What Every Computer Scientist Should Know About Floating-Point Arithmetic — David Goldberg',
  ],
}

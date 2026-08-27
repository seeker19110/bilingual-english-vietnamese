// details/algo-s1.ts — Chi tiết chặng S1 hướng THUẬT TOÁN ("Nền tảng và độ phức tạp").
// Bản đồ chặng nằm ở ../algo.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Hướng này mang cờ `crossCutting`: học SONG SONG với hướng chính, không thay thế nó.
// Đặc thù S1: thứ đáng đo không phải số bài đã giải mà là bài giải LẠI được sau hai tuần —
// nên rubric ở đây đo trí nhớ dài hạn và kỷ luật kiểm thử, không đo số lượng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ALGO_S1_DETAIL: SpecStageDetail = {
  stageId: 'algo-s1',
  modules: [
    {
      moduleId: 'algo-s1-m1',
      objective:
        'Đọc ràng buộc của đề bài là suy ra được lớp thuật toán nào chấp nhận được, và kiểm lại lý thuyết bằng đo thời gian thật.',
      practice: [
        'Với năm đề có ràng buộc khác nhau, viết ra lớp độ phức tạp tối đa được phép trước khi nghĩ lời giải.',
        'Chạy một thuật toán bậc hai trên dữ liệu tăng gấp đôi nhiều lần, vẽ đồ thị thời gian và đối chiếu lý thuyết.',
        'Tìm một đoạn mã có vòng lặp lồng nhưng thực ra chỉ chạy tuyến tính, giải thích vì sao.',
      ],
      selfCheck: [
        {
          q: 'Ràng buộc kích thước dữ liệu cho biết điều gì về thuật toán cần dùng?',
          a: 'Nó chặn trên số phép tính chấp nhận được, nên loại thẳng những lớp thuật toán quá chậm trước khi nghĩ.',
        },
        {
          q: 'Phân tích khấu hao khác phân tích trường hợp xấu nhất ở chỗ nào?',
          a: 'Khấu hao chia đều chi phí một thao tác đắt hiếm gặp cho cả dãy thao tác, nên phản ánh chi phí thật hơn.',
        },
        {
          q: 'Vì sao đo thời gian thật vẫn cần dù đã phân tích được big-O?',
          a: 'Hằng số ẩn và tính cục bộ của bộ nhớ ảnh hưởng lớn ở kích thước thật, big-O không nói gì về chúng.',
        },
      ],
      doneSignals: [
        'Bạn loại được phương án quá chậm trước khi viết dòng mã nào.',
        'Đồ thị thời gian đo được khớp với hình dạng bạn dự đoán.',
      ],
    },
    {
      moduleId: 'algo-s1-m2',
      objective:
        'Chọn đúng cấu trúc dữ liệu tuyến tính cho từng bài toán dựa trên chi phí thật của thao tác chính, không theo thói quen.',
      practice: [
        'Tự cài mảng động có nhân đôi dung lượng, đếm số lần sao chép khi thêm một triệu phần tử.',
        'So thời gian chèn vào giữa của mảng động và danh sách liên kết ở nhiều kích thước khác nhau.',
        'Cố tình tạo va chạm hàng loạt trong bảng băm và quan sát thời gian tra cứu xấu đi thế nào.',
      ],
      selfCheck: [
        {
          q: 'Vì sao mảng động thường nhanh hơn danh sách liên kết dù cùng độ phức tạp lý thuyết?',
          a: 'Phần tử nằm liền nhau trong bộ nhớ nên bộ đệm của bộ xử lý hoạt động hiệu quả, còn con trỏ thì nhảy lung tung.',
        },
        {
          q: 'Bảng băm có chi phí tra cứu hằng số trong điều kiện nào?',
          a: 'Khi hàm băm phân tán đều; va chạm nhiều thì tra cứu thoái hoá về tuyến tính trong nhóm va chạm.',
        },
        {
          q: 'Nhân đôi dung lượng khi mảng đầy mang lại lợi ích gì?',
          a: 'Chi phí sao chép được khấu hao thành hằng số cho mỗi lần thêm, thay vì tuyến tính nếu tăng từng ô.',
        },
      ],
      doneSignals: [
        'Bạn giải thích được vì sao chọn cấu trúc này thay vì cấu trúc kia bằng chi phí thao tác.',
        'Bạn nhận ra ngay khi một bài đang dùng sai cấu trúc dữ liệu.',
      ],
    },
    {
      moduleId: 'algo-s1-m3',
      objective:
        'Nhận ra được dạng bài phù hợp với hai con trỏ, cửa sổ trượt, tổng tiền tố hay tìm kiếm nhị phân trên đáp án.',
      practice: [
        'Giải một bài bằng cách vét cạn trước, rồi tối ưu bằng cửa sổ trượt và so kết quả hai bản.',
        'Dùng tổng tiền tố để trả lời nhiều truy vấn đoạn con, đo lại thời gian so với cộng lại từng lần.',
        'Giải một bài tối ưu hoá bằng cách nhị phân trên đáp án, viết rõ hàm kiểm tính khả thi.',
      ],
      selfCheck: [
        {
          q: 'Dấu hiệu nào cho biết một bài dùng được cửa sổ trượt?',
          a: 'Đáp án tính trên đoạn liên tiếp và khi cửa sổ dịch một bước thì cập nhật được mà không tính lại từ đầu.',
        },
        {
          q: 'Nhị phân trên đáp án dùng được khi nào?',
          a: 'Khi tính khả thi đơn điệu theo đáp án: khả thi với giá trị nào thì cũng khả thi với mọi giá trị dễ hơn.',
        },
        {
          q: 'Tổng tiền tố đánh đổi cái gì để lấy tốc độ truy vấn?',
          a: 'Tốn thêm bộ nhớ và phải dựng lại khi dữ liệu đổi, đổi lấy mỗi truy vấn chỉ còn một phép trừ.',
        },
      ],
      doneSignals: [
        'Đọc đề xong bạn nhận ra dạng quen thuộc trong vài phút.',
        'Bản tối ưu của bạn luôn cho cùng kết quả với bản vét cạn trên mọi dữ liệu thử.',
      ],
    },
    {
      moduleId: 'algo-s1-m4',
      objective:
        'Giữ kỷ luật giải bài: nghĩ ca biên trước khi viết mã và dùng kiểm thử ngẫu nhiên đối chiếu với bản đơn giản chắc đúng.',
      practice: [
        'Trước mỗi bài, viết ra danh sách ca biên rồi mới viết mã, sau đó đếm bao nhiêu ca bạn đã đoán trúng.',
        'Viết bản vét cạn chắc đúng làm chuẩn rồi sinh dữ liệu ngẫu nhiên so hai bản cho tới khi tìm ra ca lệch.',
        'Ghi nhật ký cho mỗi bài gồm ý tưởng, độ phức tạp và ca biên, rồi giải lại bài đó sau hai tuần.',
      ],
      selfCheck: [
        {
          q: 'Vì sao viết bản vét cạn chắc đúng lại đáng công dù nó chậm?',
          a: 'Nó là thước đo để phát hiện lời giải nhanh sai ở đâu, thứ mà đọc mã bằng mắt gần như không tìm ra.',
        },
        {
          q: 'Kiểm thử ngẫu nhiên mạnh hơn tự nghĩ ca kiểm ở điểm nào?',
          a: 'Nó tìm ra những tổ hợp bạn không nghĩ tới, đúng chỗ trực giác của bạn đang có điểm mù.',
        },
        {
          q: 'Vì sao giải lại bài cũ sau hai tuần lại là bài kiểm tra tốt?',
          a: 'Nó phân biệt hiểu thật với nhớ tạm; nhớ tạm thì hai tuần sau đã bay mất.',
        },
      ],
      doneSignals: [
        'Bạn tìm ra lỗi của mình bằng kiểm thử ngẫu nhiên chứ không bằng đọc lại mã.',
        'Bài đã giải cách đây hai tuần bạn làm lại được mà không nhìn lời giải cũ.',
      ],
    },
  ],
  rubric: [
    {
      id: 'algo-s1-r1',
      text: 'Đủ 80 bài mức dễ tới trung bình, mỗi bài có nhật ký ghi ý tưởng, độ phức tạp và ca biên đã nghĩ.',
      howToProve:
        'Dán mục lục nhật ký kèm ba mục bất kỳ đầy đủ ba phần để soát chất lượng ghi chép.',
    },
    {
      id: 'algo-s1-r2',
      text: 'Ít nhất 15 bài đã được giải lại sau hai tuần mà không nhìn lời giải cũ, có ghi ngày cả hai lần.',
      howToProve:
        'Dán bảng 15 bài kèm ngày giải lần đầu và ngày giải lại, cùng kết quả nộp của lần hai.',
    },
    {
      id: 'algo-s1-r3',
      text: 'Có bộ kiểm thử ngẫu nhiên đối chiếu hai lời giải cho ít nhất năm bài, chạy được bằng một lệnh.',
      howToProve:
        'Chạy bộ kiểm thử và dán kết quả, kèm một ca lệch mà nó từng tìm ra trong lúc bạn làm.',
    },
    {
      id: 'algo-s1-r4',
      text: 'Có ít nhất một bài kèm đồ thị đo thời gian thật đối chiếu với độ phức tạp lý thuyết đã phân tích.',
      howToProve:
        'Dán bảng số liệu đo ở nhiều kích thước đầu vào cùng đồ thị và nhận xét về hằng số ẩn.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Giải 80 bài mức dễ tới trung bình phủ đủ bốn module của chặng, mỗi bài kèm nhật ký cách nghĩ.',
      'Bộ kiểm thử ngẫu nhiên đối chiếu lời giải nhanh với bản vét cạn cho ít nhất năm bài.',
      'Một lượt giải lại 15 bài cũ sau hai tuần để kiểm tra trí nhớ dài hạn.',
    ],
    scopeDont: [
      'KHÔNG đụng tới quy hoạch động hay đồ thị, vì đó là nội dung chặng sau và học sớm sẽ hổng phần nền.',
      'KHÔNG chạy đua số lượng bài, 80 bài có nhật ký tốt hơn 300 bài giải xong quên ngay.',
      'KHÔNG chép lời giải rồi ghi nhật ký theo, nhật ký phải phản ánh cách bạn thật sự nghĩ.',
    ],
    touchpoints: [
      'Thư mục lời giải: mỗi bài một tệp, tên tệp có mã bài để tra lại.',
      'Tệp nhật ký: mỗi bài một mục gồm ý tưởng, độ phức tạp, ca biên và ngày giải.',
      'Thư mục kiểm thử ngẫu nhiên: bộ sinh dữ liệu, bản vét cạn và kịch bản so kết quả.',
    ],
    contracts: [
      'Mỗi lời giải ghi rõ độ phức tạp thời gian và bộ nhớ ngay đầu tệp.',
      'Bản vét cạn và bản tối ưu nhận cùng định dạng đầu vào để so trực tiếp được.',
      'Bộ sinh dữ liệu nhận một hạt giống để tái hiện lại đúng ca lệch đã tìm ra.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng kèm theo.',
      'Người khác chạy bộ kiểm thử ngẫu nhiên của bạn với cùng hạt giống và ra cùng kết quả.',
    ],
    invariants: [
      'Không bài nào vào nhật ký mà chưa tự giải được ít nhất một lần.',
      'Mọi lời giải tối ưu đều đã được đối chiếu với một bản chắc đúng hoặc với bộ ca kiểm chính thức.',
      'Ngày giải ghi đúng thời điểm thật, không ghi lùi để cho đủ khoảng hai tuần.',
    ],
    conventions: [
      'Nhật ký viết bằng tiếng Việt, đủ để chính bạn hai tuần sau đọc lại hiểu được.',
      'Đặt tên biến theo ý nghĩa trong bài toán, không dùng một chữ cái trừ chỉ số vòng lặp.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

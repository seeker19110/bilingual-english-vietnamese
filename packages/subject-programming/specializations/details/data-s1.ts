// details/data-s1.ts — Chi tiết chặng S1 hướng DỮ LIỆU ("SQL và phân tích cơ bản").
// Bản đồ chặng nằm ở ../data.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Điểm khác biệt của hướng này ngay từ S1: sản phẩm không phải là mã CHẠY ĐƯỢC mà là kết luận
// ĐÚNG. Nên rubric ở đây đo tính tái lập và tính trung thực, không đo tính năng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DATA_S1_DETAIL: SpecStageDetail = {
  stageId: 'data-s1',
  modules: [
    {
      moduleId: 'data-s1-m1',
      objective:
        'Viết được truy vấn nhiều bước có hàm cửa sổ để trả lời câu hỏi so sánh theo kỳ mà không cần xuất ra bảng tính.',
      practice: [
        'Chia một truy vấn dài quá hai màn hình thành các bước đặt tên bằng CTE, đọc lại xem có hiểu ngay không.',
        'Tính tổng luỹ kế và xếp hạng theo nhóm bằng hàm cửa sổ, đối chiếu kết quả với cách tự nối bảng.',
        'Cố tình đặt điều kiện lọc ở mệnh đề sai chỗ để thấy kết quả đổi, rồi giải thích vì sao.',
      ],
      selfCheck: [
        {
          q: 'Điều kiện lọc đặt ở WHERE và ở HAVING khác nhau ra sao?',
          a: 'WHERE lọc từng dòng trước khi gộp nhóm; HAVING lọc trên kết quả đã gộp nên dùng được hàm tổng hợp.',
        },
        {
          q: 'Hàm cửa sổ làm được gì mà GROUP BY không làm được?',
          a: 'Giữ nguyên từng dòng mà vẫn tính được giá trị theo nhóm, nên so được dòng với tổng của nhóm nó.',
        },
        {
          q: 'Nối trái và nối trong cho kết quả khác nhau ở tình huống nào?',
          a: 'Khi bảng bên phải thiếu dòng khớp: nối trong bỏ luôn, nối trái giữ lại và điền giá trị rỗng.',
        },
      ],
      doneSignals: [
        'Trả lời một câu hỏi kinh doanh mới chỉ bằng SQL, không xuất ra bảng tính để làm tay.',
        'Người khác đọc truy vấn của bạn hiểu được từng bước mà không cần bạn giải thích.',
      ],
    },
    {
      moduleId: 'data-s1-m2',
      objective:
        'Biến các bước làm sạch dữ liệu thành mã chạy lại được và ghi lại mọi giả định để người sau kiểm được.',
      practice: [
        'Lập bảng thống kê tỉ lệ thiếu, trùng và sai kiểu của từng cột trước khi đụng vào việc sửa.',
        'Viết toàn bộ bước làm sạch thành mã chạy từ dữ liệu thô, xoá kết quả rồi chạy lại xem có ra y hệt không.',
        'Ghi thành danh sách mọi giả định đã đặt, ví dụ coi dòng thiếu ngày là bỏ hay là điền.',
      ],
      selfCheck: [
        {
          q: 'Vì sao sửa dữ liệu bằng tay trực tiếp trên tệp là sai quy trình?',
          a: 'Không ai lặp lại được và không ai biết bạn đã sửa gì; dữ liệu mới về là phải làm lại từ đầu bằng tay.',
        },
        {
          q: 'Điền giá trị thiếu bằng trung bình có rủi ro gì?',
          a: 'Nó làm hẹp độ phân tán và có thể giấu mất chính cái quy luật khiến dữ liệu bị thiếu.',
        },
        {
          q: 'Vì sao phải chuẩn hoá múi giờ trước khi gộp dữ liệu nhiều nguồn?',
          a: 'Cùng một mốc thời gian ghi ở hai múi giờ sẽ rơi vào hai ngày khác nhau và làm lệch mọi con số theo ngày.',
        },
      ],
      doneSignals: [
        'Xoá sạch dữ liệu đã xử lý rồi chạy lại một lệnh là dựng lại được y nguyên.',
        'Nói được với mỗi cột bạn đã bỏ bao nhiêu dòng và vì sao.',
      ],
    },
    {
      moduleId: 'data-s1-m3',
      objective:
        'Chọn đúng chỉ số tóm tắt cho dữ liệu lệch và chỉ ra được chỗ mẫu bị chọn thiên vị trước khi kết luận.',
      practice: [
        'Lấy một cột lệch mạnh, tính cả trung bình lẫn trung vị rồi giải thích vì sao hai số cách xa nhau.',
        'Tìm trong dữ liệu của bạn một cặp biến tương quan cao nhưng chắc chắn không nhân quả, viết ra lý do.',
        'Mô tả cách tập dữ liệu của bạn được thu thập và chỉ ra ai bị bỏ sót khỏi tập đó.',
      ],
      selfCheck: [
        {
          q: 'Khi nào trung vị mô tả dữ liệu tốt hơn trung bình?',
          a: 'Khi phân bố lệch hoặc có ngoại lệ lớn — vài giá trị cực đoan kéo trung bình đi xa phần đông.',
        },
        {
          q: 'Tương quan cao giữa hai biến có thể đến từ đâu ngoài nhân quả?',
          a: 'Từ một biến thứ ba tác động lên cả hai, hoặc từ cách chọn mẫu, hoặc thuần tuý trùng hợp.',
        },
        {
          q: 'Sai lầm sống sót trong chọn mẫu là gì?',
          a: 'Chỉ nhìn những trường hợp còn lại tới lúc đo, nên mọi kết luận đều lệch về phía đã thành công.',
        },
      ],
      doneSignals: [
        'Trước khi kết luận, bạn tự hỏi dữ liệu này thiếu ai và trả lời được.',
        'Không còn dùng chữ "ảnh hưởng" khi mới chỉ đo được tương quan.',
      ],
    },
    {
      moduleId: 'data-s1-m4',
      objective:
        'Vẽ được biểu đồ nói đúng một ý cho người không kỹ thuật, không dùng thủ thuật trục làm phóng đại khác biệt.',
      practice: [
        'Vẽ cùng một dữ liệu hai lần, một lần trục cắt gốc một lần không, đặt cạnh nhau xem cảm giác khác thế nào.',
        'Lấy một biểu đồ đang nhồi bốn ý, tách thành bốn biểu đồ mỗi cái một ý rồi hỏi người ngoài xem cái nào dễ đọc.',
        'Đặt tiêu đề cho mỗi biểu đồ bằng chính KẾT LUẬN chứ không bằng tên hai trục.',
      ],
      selfCheck: [
        {
          q: 'Trục dọc không bắt đầu từ số không thì gây hiểu sai thế nào?',
          a: 'Chênh lệch nhỏ trông thành khổng lồ, người đọc kết luận mạnh hơn nhiều so với dữ liệu cho phép.',
        },
        {
          q: 'Vì sao biểu đồ tròn thường là lựa chọn kém khi có nhiều phần?',
          a: 'Mắt người so góc kém hơn so chiều dài, nhiều phần gần bằng nhau là không phân biệt nổi.',
        },
        {
          q: 'Tiêu đề biểu đồ nên viết theo kiểu nào thì có ích nhất?',
          a: 'Viết thành câu kết luận để người đọc biết phải nhìn thấy gì, không chỉ ghi tên dữ liệu.',
        },
      ],
      doneSignals: [
        'Người không làm kỹ thuật nhìn biểu đồ ba giây là nói được ý chính.',
        'Bạn tự bắt được biểu đồ của người khác đang phóng đại bằng thủ thuật trục.',
      ],
    },
  ],
  rubric: [
    {
      id: 'data-s1-r1',
      text: 'Toàn bộ bước làm sạch viết thành mã chạy lại được từ dữ liệu thô, cho kết quả giống hệt sau mỗi lần chạy.',
      howToProve:
        'Xoá thư mục kết quả, chạy lại kịch bản hai lần và so mã băm của tệp đầu ra giữa hai lần.',
    },
    {
      id: 'data-s1-r2',
      text: 'Năm câu hỏi kinh doanh đều có câu trả lời kèm truy vấn tương ứng, không câu nào trả lời bằng cảm nhận.',
      howToProve: 'Với mỗi câu hỏi dán truy vấn đã dùng và bảng kết quả nó sinh ra.',
    },
    {
      id: 'data-s1-r3',
      text: 'Mỗi kết luận nêu rõ giới hạn của dữ liệu: khoảng thời gian, phạm vi thu thập và nhóm bị bỏ sót.',
      howToProve: 'Đọc lại từng kết luận và chỉ ra câu nào trong báo cáo nói về giới hạn của nó.',
    },
    {
      id: 'data-s1-r4',
      text: 'Bản trình bày một trang cho người không kỹ thuật, mọi biểu đồ có trục đầy đủ nhãn và đơn vị.',
      howToProve: 'Đưa cho một người ngoài ngành đọc trong ba phút rồi hỏi lại họ hiểu được ý nào.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Chọn một tập dữ liệu mở của Việt Nam đủ lớn và trả lời năm câu hỏi kinh doanh có ý nghĩa.',
      'Viết toàn bộ bước tải, làm sạch và phân tích thành mã chạy lại được.',
      'Bản trình bày một trang dành cho người không làm kỹ thuật.',
    ],
    scopeDont: [
      'KHÔNG dựng bảng điều khiển tương tác, vì trọng tâm chặng là hỏi đúng câu và trả lời trung thực.',
      'KHÔNG dùng học máy để dự đoán, thống kê mô tả đã đủ trả lời năm câu hỏi này.',
      'KHÔNG tự thu thập dữ liệu bằng cách quét web, chuyện pháp lý và đạo đức để dành chặng sau.',
    ],
    touchpoints: [
      'Thư mục dữ liệu thô: giữ nguyên bản tải về, tuyệt đối không sửa trực tiếp.',
      'Kịch bản làm sạch: đọc dữ liệu thô, ghi ra thư mục dữ liệu đã xử lý.',
      'Tệp truy vấn phân tích và tệp sinh biểu đồ, mỗi câu hỏi một mục rõ ràng.',
    ],
    contracts: [
      'Dữ liệu thô là chỉ đọc; mọi thay đổi đều ghi ra thư mục khác để so lại được.',
      'Mỗi bảng đã xử lý kèm một tệp mô tả cột: tên, kiểu, đơn vị, ý nghĩa.',
      'Mỗi biểu đồ trong báo cáo truy ngược được về đúng một truy vấn đã đặt tên.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng chạy lệnh kèm theo.',
      'Người khác lấy mã về chạy lại được toàn bộ phân tích và ra cùng con số.',
    ],
    invariants: [
      'Không bao giờ sửa dữ liệu thô tại chỗ, kể cả sửa một ô rõ ràng sai.',
      'Mọi con số xuất hiện trong báo cáo đều sinh ra từ mã, không gõ tay vào.',
      'Mỗi giả định làm sạch được ghi lại kèm số dòng bị ảnh hưởng.',
    ],
    conventions: [
      'Đặt tên cột theo chữ thường có gạch dưới, thống nhất trong toàn bộ dự án.',
      'Ghi ngày giờ theo chuẩn quốc tế, chỉ đổi sang giờ địa phương lúc hiển thị.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

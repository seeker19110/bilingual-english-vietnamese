// details/systems-s2.ts — Chi tiết chặng S2 hướng LẬP TRÌNH HỆ THỐNG (tiến trình, vào/ra, socket).
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SYSTEMS_S2_DETAIL: SpecStageDetail = {
  stageId: 'systems-s2',
  modules: [
    {
      moduleId: 'systems-s2-m1',
      objective:
        'Tạo và điều khiển được tiến trình con, nối ống giữa chúng và xử lý tín hiệu đúng cách.',
      practice: [
        'Viết shell nhỏ chạy được lệnh, nối ống nhiều tầng và chuyển hướng vào/ra.',
        'Bắt tín hiệu ngắt để dừng tiến trình con gọn gàng thay vì để tiến trình mồ côi.',
        'Thu mã thoát của tiến trình con và phân biệt thoát thường với bị tín hiệu giết.',
      ],
      selfCheck: [
        {
          q: 'Tiến trình xác sống xuất hiện khi nào?',
          a: 'Khi tiến trình con kết thúc mà cha chưa thu trạng thái thoát; bảng tiến trình vẫn giữ một mục.',
        },
        {
          q: 'Ống giữa hai tiến trình thật ra là gì?',
          a: 'Một bộ đệm trong nhân với hai đầu mô tả tệp; bên đọc chậm thì bên ghi bị chặn.',
        },
      ],
      doneSignals: [
        'Shell tự viết chạy được chuỗi lệnh nối ống ba tầng.',
        'Nhấn tổ hợp ngắt không để lại tiến trình lơ lửng.',
      ],
    },
    {
      moduleId: 'systems-s2-m2',
      objective:
        'Đọc ghi tệp hiệu quả và an toàn: đệm, ghi nguyên tử, và xử lý đúng khi lời gọi hệ thống trả về thiếu.',
      practice: [
        'So sánh tốc độ đọc theo từng byte, theo khối và ánh xạ bộ nhớ trên tệp một gigabyte.',
        'Cài ghi nguyên tử bằng cách ghi tệp tạm rồi đổi tên, thử ngắt điện giữa chừng bằng cách giết tiến trình.',
        'Xử lý ca lời gọi ghi trả về ít byte hơn yêu cầu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao ghi đè trực tiếp lên tệp cũ là nguy hiểm?',
          a: 'Nếu tiến trình chết giữa chừng, tệp còn lại nửa cũ nửa mới; ghi tạm rồi đổi tên là thao tác nguyên tử.',
        },
        {
          q: 'Lời gọi ghi trả về ít byte hơn yêu cầu thì phải làm gì?',
          a: 'Lặp lại phần còn lại; coi mỗi lời gọi luôn ghi hết là lỗi kinh điển.',
        },
      ],
      doneSignals: [
        'Có bảng số đo ba cách đọc trên cùng tệp.',
        'Giết tiến trình giữa lúc ghi không bao giờ để lại tệp hỏng.',
      ],
    },
    {
      moduleId: 'systems-s2-m3',
      objective: 'Viết được máy chủ TCP phục vụ nhiều kết nối đồng thời bằng vào/ra không chặn.',
      practice: [
        'Viết máy chủ dùng cơ chế theo dõi nhiều mô tả tệp, phục vụ ít nhất một nghìn kết nối.',
        'Đo mức dùng bộ nhớ và độ trễ khi số kết nối tăng dần.',
        'Xử lý đúng ca đối tác đóng nửa chừng và ca ghi bị chặn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao mô hình một luồng cho mỗi kết nối không mở rộng tốt?',
          a: 'Mỗi luồng tốn ngăn xếp và chi phí chuyển ngữ cảnh; tới hàng nghìn kết nối là bộ nhớ và bộ lập lịch chịu không nổi.',
        },
        {
          q: 'Vào/ra không chặn giải quyết điều gì?',
          a: 'Một luồng theo dõi nhiều kết nối và chỉ xử lý cái nào thật sự có dữ liệu, không ngồi chờ từng cái.',
        },
      ],
      doneSignals: [
        'Máy chủ giữ được một nghìn kết nối mà bộ nhớ không phình theo cấp số nhân.',
        'Ngắt kết nối đột ngột không làm máy chủ chết.',
      ],
    },
    {
      moduleId: 'systems-s2-m4',
      objective:
        'Viết lại được một thành phần hệ thống bằng ngôn ngữ có kiểm soát bộ nhớ lúc biên dịch và so sánh đánh đổi.',
      practice: [
        'Viết lại phần xử lý kết nối bằng Rust và đo lại hiệu năng so với bản cũ.',
        'Dùng công cụ kiểm tra bộ nhớ trên bản C và ghi lại các rò rỉ tìm được.',
        'Ghi lại chỗ nào phải dùng mã không an toàn và vì sao.',
      ],
      selfCheck: [
        {
          q: 'Quyền sở hữu trong Rust ngăn được lớp lỗi nào?',
          a: 'Dùng sau khi giải phóng, giải phóng hai lần và tranh chấp dữ liệu giữa luồng — chặn ngay lúc biên dịch.',
        },
        {
          q: 'Rust có làm chương trình luôn nhanh hơn C không?',
          a: 'Không; hiệu năng tương đương, cái được là an toàn bộ nhớ, cái mất là thời gian học và một số khuôn mẫu phải viết dài hơn.',
        },
      ],
      doneSignals: [
        'Có số đo hai bản cài đặt trên cùng kịch bản tải.',
        'Mọi khối mã không an toàn đều có comment giải thích vì sao cần.',
      ],
    },
  ],
  rubric: [
    {
      id: 'systems-s2-r1',
      text: 'Shell tự viết chạy được ống nhiều tầng, chuyển hướng vào/ra và chạy nền.',
      howToProve: 'Chạy một kịch bản mẫu gồm ba lệnh nối ống, dán kết quả so với shell hệ thống.',
    },
    {
      id: 'systems-s2-r2',
      text: 'Máy chủ TCP phục vụ ít nhất một nghìn kết nối đồng thời không sập.',
      howToProve:
        'Công cụ tạo tải mở một nghìn kết nối, dán số kết nối thành công và mức dùng bộ nhớ.',
    },
    {
      id: 'systems-s2-r3',
      text: 'Không rò rỉ bộ nhớ trong kịch bản chạy dài một giờ.',
      howToProve: 'Kết quả công cụ kiểm tra bộ nhớ và đồ thị mức dùng bộ nhớ theo thời gian.',
    },
    {
      id: 'systems-s2-r4',
      text: 'Mọi lời gọi hệ thống đều kiểm mã lỗi, không bỏ qua giá trị trả về.',
      howToProve:
        'Rà mã bằng công cụ phân tích tĩnh, dán kết quả không còn cảnh báo bỏ qua giá trị trả về.',
    },
    {
      id: 'systems-s2-r5',
      text: 'Ghi tệp là nguyên tử: giết tiến trình giữa chừng không để lại tệp hỏng.',
      howToProve:
        'Kịch bản giết tiến trình ngẫu nhiên hai mươi lần, mỗi lần kiểm tệp vẫn đọc được.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Một shell chạy được lệnh, ống, chuyển hướng và việc chạy nền.',
      'Một máy chủ TCP đa kết nối dùng vào/ra không chặn.',
      'Bộ đo hiệu năng và bộ nhớ cho cả hai.',
    ],
    scopeDont: [
      'KHÔNG hỗ trợ đầy đủ cú pháp shell chuẩn — mục tiêu là hiểu cơ chế, không phải thay thế shell hệ thống.',
      'KHÔNG viết giao thức tầng ứng dụng phức tạp trên máy chủ TCP.',
      'KHÔNG tối ưu vi mô trước khi có số đo.',
    ],
    touchpoints: [
      'Mã shell: phần phân tích dòng lệnh tách khỏi phần thực thi tiến trình.',
      'Mã máy chủ: vòng lặp sự kiện tách khỏi phần xử lý giao thức.',
      'Kịch bản đo tải và kịch bản kiểm bộ nhớ để cạnh mã.',
    ],
    contracts: [
      'Mã thoát tuân theo quy ước hệ điều hành: 0 là thành công, khác 0 là lỗi có ý nghĩa.',
      'Máy chủ không bao giờ giữ mô tả tệp sau khi kết nối đóng.',
      'Mọi hàm trả về mã lỗi thay vì thoát chương trình từ bên trong.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, kèm số đo thật.',
      'Chạy được trên Linux sạch chỉ với trình biên dịch và thư viện chuẩn.',
    ],
    invariants: [
      'Không tiến trình mồ côi hay xác sống sau khi shell thoát.',
      'Không rò rỉ bộ nhớ và không rò rỉ mô tả tệp.',
      'Mọi giá trị trả về của lời gọi hệ thống đều được kiểm.',
    ],
    conventions: [
      'Mọi khối mã không an toàn có comment nêu rõ bất biến người viết phải tự giữ.',
      'Số đo hiệu năng ghi kèm cấu hình máy và lệnh đã chạy.',
      'Không dùng thư viện ngoài cho phần lõi — mục tiêu là hiểu cơ chế.',
    ],
  },
}

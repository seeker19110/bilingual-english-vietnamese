// details/embedded-s1.ts — Chi tiết chặng S1 hướng NHÚNG ("Điều khiển phần cứng").
// Bản đồ chặng nằm ở ../embedded.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Đặc thù hướng này: lỗi có thể nằm ở PHẦN CỨNG chứ không phải phần mềm, và không công cụ phần
// mềm nào bắt được. Vì thế máy đo là phần bắt buộc của quy trình, không phải món xa xỉ.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const EMBEDDED_S1_DETAIL: SpecStageDetail = {
  stageId: 'embedded-s1',
  modules: [
    {
      moduleId: 'embedded-s1-m1',
      objective:
        'Nạp được firmware lên vi điều khiển thật, điều khiển chân vào ra và in được thông tin gỡ lỗi qua cổng nối tiếp.',
      practice: [
        'Nháy một đèn bằng cách ghi thẳng vào thanh ghi, rồi làm lại bằng thư viện và so hai cách.',
        'Nối một nút bấm có điện trở kéo lên, đọc trạng thái và giải thích vì sao thiếu điện trở thì đọc lung tung.',
        'Mở kênh gỡ lỗi qua cổng nối tiếp và in ra giá trị một biến trong lúc mạch đang chạy.',
      ],
      selfCheck: [
        {
          q: 'Điện trở kéo lên giải quyết vấn đề gì với chân đầu vào?',
          a: 'Khi nút chưa bấm, chân bị thả nổi và đọc ra giá trị ngẫu nhiên; điện trở giữ nó ở mức xác định.',
        },
        {
          q: 'Vì sao đọc sơ đồ chân trước khi nối dây là bắt buộc?',
          a: 'Nối nhầm chân nguồn hoặc quá dòng có thể làm hỏng vĩnh viễn cả vi điều khiển lẫn cảm biến.',
        },
        {
          q: 'In gỡ lỗi qua cổng nối tiếp có ảnh hưởng gì tới chương trình?',
          a: 'Nó tốn thời gian đáng kể, nên đặt trong đoạn nhạy thời gian sẽ làm thay đổi chính hành vi đang đo.',
        },
      ],
      doneSignals: [
        'Bạn nạp và chạy được firmware mới trong vòng một phút, không mò mẫm.',
        'Nhìn sơ đồ chân là bạn nối đúng ngay lần đầu.',
      ],
    },
    {
      moduleId: 'embedded-s1-m2',
      objective:
        'Đọc được cảm biến qua các chuẩn giao tiếp phổ biến và tra được thông số cần dùng trực tiếp từ tài liệu kỹ thuật.',
      practice: [
        'Tự tìm trong tài liệu kỹ thuật của một cảm biến địa chỉ thiết bị và thanh ghi chứa giá trị đo.',
        'Đọc một giá trị tương tự rồi chuyển sang đơn vị vật lý đúng, đối chiếu với một thiết bị đo khác.',
        'Điều chỉnh độ sáng đèn bằng tín hiệu băm xung, thay đổi chu kỳ và quan sát kết quả.',
      ],
      selfCheck: [
        {
          q: 'Vì sao kỹ năng đọc tài liệu kỹ thuật quan trọng hơn nhớ thư viện?',
          a: 'Mỗi con chip một khác và thư viện không phải lúc nào cũng có; tài liệu mới là nguồn sự thật duy nhất.',
        },
        {
          q: 'Giao tiếp hai dây và giao tiếp bốn dây khác nhau ở điểm nào khi chọn?',
          a: 'Hai dây tiết kiệm chân và nối được nhiều thiết bị; bốn dây nhanh hơn nhiều nhưng tốn chân hơn.',
        },
        {
          q: 'Băm xung điều chỉnh độ sáng bằng cơ chế nào?',
          a: 'Bật tắt rất nhanh với tỉ lệ thời gian bật khác nhau; mắt người trung bình hoá thành mức sáng.',
        },
      ],
      doneSignals: [
        'Đưa cho bạn một cảm biến lạ kèm tài liệu là bạn đọc được nó trong một buổi.',
        'Giá trị đo của bạn khớp với thiết bị đo tham chiếu trong sai số cho phép.',
      ],
    },
    {
      moduleId: 'embedded-s1-m3',
      objective:
        'Viết được thường trình phục vụ ngắt ngắn và an toàn, chia sẻ dữ liệu đúng cách với vòng lặp chính.',
      practice: [
        'Chuyển việc đọc nút từ hỏi vòng sang dùng ngắt, đo lại độ trễ phản hồi giữa hai cách.',
        'Đặt một phép tính dài trong thường trình ngắt để thấy hệ thống trễ, rồi chuyển nó ra vòng lặp chính.',
        'Lọc dội phím bằng cả cách phần mềm và cách phần cứng, so kết quả trên máy phân tích logic.',
      ],
      selfCheck: [
        {
          q: 'Vì sao thường trình phục vụ ngắt phải càng ngắn càng tốt?',
          a: 'Trong lúc nó chạy, các ngắt khác bị hoãn nên hệ thống bỏ lỡ sự kiện và mất tính đáp ứng.',
        },
        {
          q: 'Biến chia sẻ giữa ngắt và vòng lặp chính cần khai báo đặc biệt vì sao?',
          a: 'Bộ biên dịch có thể giữ giá trị trong thanh ghi và không đọc lại bộ nhớ, nên vòng chính thấy giá trị cũ.',
        },
        {
          q: 'Dội phím là hiện tượng gì và gây lỗi kiểu nào?',
          a: 'Tiếp điểm cơ khí đóng mở nhiều lần trong vài mili giây, khiến một lần bấm bị đếm thành nhiều lần.',
        },
      ],
      doneSignals: [
        'Một lần bấm nút luôn được đếm đúng một lần.',
        'Hệ thống vẫn phản hồi kịp khi có nhiều sự kiện xảy ra gần nhau.',
      ],
    },
    {
      moduleId: 'embedded-s1-m4',
      objective:
        'Cô lập được lỗi thuộc phần cứng hay phần mềm bằng máy đo, thay vì đoán bằng cách sửa mã thử.',
      practice: [
        'Bắt tín hiệu bus giữa vi điều khiển và cảm biến bằng máy phân tích logic, đọc từng byte trao đổi.',
        'Đo dòng tiêu thụ ở trạng thái chạy và trạng thái ngủ, so với con số ghi trong tài liệu kỹ thuật.',
        'Tháo cảm biến ra và thay bằng giá trị giả trong mã, xác định lỗi nằm ở bên nào.',
      ],
      selfCheck: [
        {
          q: 'Máy phân tích logic cho biết điều gì mà lệnh in ra không cho biết?',
          a: 'Tín hiệu thật trên dây, nên bạn biết vi điều khiển có gửi đi hay không và thiết bị kia có trả lời không.',
        },
        {
          q: 'Cách nhanh nhất để biết lỗi ở phần cứng hay phần mềm là gì?',
          a: 'Thay một bên bằng giá trị giả đã biết chắc đúng; bên còn lại chạy đúng nghĩa là lỗi nằm ở bên vừa thay.',
        },
        {
          q: 'Vì sao đo dòng tiêu thụ lại là công cụ chẩn đoán?',
          a: 'Dòng cao bất thường lúc đáng lẽ ngủ cho biết một ngoại vi chưa được tắt hoặc chương trình không vào chế độ ngủ.',
        },
      ],
      doneSignals: [
        'Gặp lỗi là bạn cắm máy đo trước, không sửa mã thử vận may.',
        'Bạn nói được thiết bị của mình tiêu thụ bao nhiêu, không ước lượng.',
      ],
    },
  ],
  rubric: [
    {
      id: 'embedded-s1-r1',
      text: 'Thiết bị đọc được ít nhất hai cảm biến qua bus hai dây và hiển thị giá trị lên màn hình tại chỗ.',
      howToProve:
        'Quay lại cảnh thiết bị đang chạy hiển thị cả hai giá trị và thay đổi theo môi trường thật.',
    },
    {
      id: 'embedded-s1-r2',
      text: 'Thiết bị chạy liên tục 72 giờ không treo, không tự khởi động lại và không trôi giá trị đo.',
      howToProve:
        'Ghi nhật ký giá trị theo giờ trong suốt 72 giờ và dán biểu đồ cho thấy không có khoảng đứt.',
    },
    {
      id: 'embedded-s1-r3',
      text: 'Tài liệu dự án có ảnh chụp tín hiệu bus từ máy phân tích logic kèm giải thích từng byte trao đổi.',
      howToProve:
        'Dán ảnh chụp màn hình máy đo và chú thích byte địa chỉ, byte thanh ghi và byte dữ liệu.',
    },
    {
      id: 'embedded-s1-r4',
      text: 'Ngưỡng cảnh báo tại chỗ hoạt động đúng ở cả hai chiều vượt ngưỡng và trở lại bình thường.',
      howToProve:
        'Tác động thật lên cảm biến để vượt ngưỡng rồi thả về, quay lại cảnh cảnh báo bật và tắt.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Trạm đo nhiệt độ và độ ẩm chạy độc lập, hiển thị tại chỗ và cảnh báo khi vượt ngưỡng.',
      'Đọc ít nhất hai cảm biến qua bus hai dây, có xử lý khi cảm biến không trả lời.',
      'Tài liệu kèm ảnh chụp tín hiệu bus và bảng đo dòng tiêu thụ.',
    ],
    scopeDont: [
      'KHÔNG gửi dữ liệu lên mạng, vì kết nối không dây kéo theo cả một mảng nguồn và giao thức riêng ở chặng sau.',
      'KHÔNG làm vỏ hộp hay mạch in, mạch thử trên bo cắm là đủ cho chặng này.',
      'KHÔNG tối ưu tiêu thụ điện sâu, chỉ cần đo được con số hiện tại.',
    ],
    touchpoints: [
      'Tệp cấu hình chân và khởi tạo ngoại vi.',
      'Tầng đọc cảm biến: một hàm cho mỗi cảm biến, trả về giá trị đã đổi đơn vị.',
      'Vòng lặp chính và thường trình phục vụ ngắt, tách bạch rõ ràng.',
    ],
    contracts: [
      'Hàm đọc cảm biến trả về mã lỗi rõ ràng khi thiết bị không trả lời, không trả giá trị bịa.',
      'Thường trình ngắt chỉ đặt cờ và ghi dữ liệu thô, mọi xử lý nằm ở vòng lặp chính.',
      'Giá trị đo lưu theo đơn vị vật lý chuẩn, việc đổi đơn vị làm ngay tại tầng đọc.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng ảnh chụp hoặc nhật ký kèm theo.',
      'Người khác dựng lại mạch theo sơ đồ trong tài liệu và nạp firmware là chạy được.',
    ],
    invariants: [
      'Cảm biến hỏng hoặc rút dây không bao giờ làm thiết bị treo, chỉ báo lỗi và chạy tiếp.',
      'Thường trình ngắt không bao giờ chứa phép tính dài hay lệnh chờ.',
      'Thiết bị tự phục hồi sau mất điện mà không cần thao tác tay.',
    ],
    conventions: [
      'Mọi hằng số phần cứng như địa chỉ và thanh ghi đặt tên rõ, không ghi số trần trong mã.',
      'Ghi lại phiên bản tài liệu kỹ thuật đã tra vào chú thích của hàm đọc cảm biến.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

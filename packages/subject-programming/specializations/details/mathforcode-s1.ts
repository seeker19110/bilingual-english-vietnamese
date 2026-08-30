// details/mathforcode-s1.ts — Chi tiết chặng S1 hướng TOÁN HỌC CHO LẬP TRÌNH
// ("Nền tảng rời rạc cho lập trình viên"). Bản đồ chặng ở ../mathforcode.ts.
//
// Đặc thù S1: mọi bài luyện đều KIỂM ĐƯỢC bằng máy — chuyển hệ đếm so với hàm dựng sẵn, mã kiểm
// tra so với danh sách mã thật, số phép tính đếm được so với công thức tổng. Không có ô nào phải
// chấm bằng cảm tính, nên người học tự biết mình đúng hay sai ngay trong buổi học.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MATHFORCODE_S1_DETAIL: SpecStageDetail = {
  stageId: 'mathforcode-s1',
  modules: [
    {
      moduleId: 'mathforcode-s1-m1',
      objective:
        'Đọc được một số bất kỳ dưới dạng máy thật sự lưu nó, và dự đoán trước chỗ nào phép tính dấu phẩy động sẽ lệch.',
      practice: [
        'Chuyển tay mười số sang nhị phân và bù 2 tám bit, rồi viết script Python đối chiếu từng số.',
        'In ra 20 chữ số thập phân của 0.1, 0.2 và tổng của chúng, giải thích chênh lệch bằng biểu diễn nhị phân.',
        'Cộng dồn 0.1 một triệu lần rồi so với phép nhân 0.1 × 1_000_000, đo sai số tích luỹ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao 0.1 + 0.2 trong máy lại không cho đúng 0.3?',
          a: 'Vì 0.1 và 0.2 không biểu diễn hữu hạn được trong nhị phân, máy lưu số gần đúng nên tổng lệch một lượng nhỏ.',
        },
        {
          q: 'Bù 2 giúp phần cứng đơn giản hơn ở chỗ nào?',
          a: 'Phép trừ trở thành phép cộng với số bù, nên chỉ cần một mạch cộng duy nhất cho cả hai phép.',
        },
        {
          q: 'So sánh hai số thực trong code thì nên viết thế nào?',
          a: 'So hiệu tuyệt đối của chúng với một ngưỡng sai số đã chọn, không dùng dấu bằng trực tiếp.',
        },
      ],
      doneSignals: [
        'Bạn đoán trúng chỗ nào trong một đoạn tính tiền sẽ sinh sai số trước khi chạy thử.',
        'Bạn viết được hàm so sánh số thực có ngưỡng và giải thích được ngưỡng đó chọn từ đâu.',
      ],
    },
    {
      moduleId: 'mathforcode-s1-m2',
      objective:
        'Rút gọn được điều kiện logic lồng nhau bằng luật De Morgan mà chứng minh được hai bản cho cùng kết quả.',
      practice: [
        'Lấy một hàm thật có ba điều kiện lồng nhau, rút gọn bằng De Morgan rồi so bảng chân trị hai bản.',
        'Viết script duyệt hết mọi tổ hợp giá trị đầu vào để chứng minh bản cũ và bản mới không lệch ca nào.',
        'Cài một tập cờ bằng phép toán trên bit: bật, tắt, kiểm tra cờ bằng mặt nạ.',
      ],
      selfCheck: [
        {
          q: 'Phủ định của "A và B" viết lại thành gì theo De Morgan?',
          a: 'Thành "không A hoặc không B" — phủ định vào trong thì và đổi thành hoặc.',
        },
        {
          q: 'Đánh giá ngắn mạch ảnh hưởng gì tới thứ tự viết điều kiện?',
          a: 'Điều kiện rẻ và hay sai nên đặt trước, vì nó chặn sớm và tránh chạy phần đắt phía sau.',
        },
        {
          q: 'XOR khác OR ở điểm nào khi cả hai vế đều đúng?',
          a: 'OR cho kết quả đúng, còn XOR cho sai vì nó chỉ đúng khi đúng một trong hai vế.',
        },
      ],
      doneSignals: [
        'Bạn viết lại được điều kiện phức tạp thành dạng gọn hơn mà bảng chân trị không đổi.',
        'Bạn dùng mặt nạ bit thay cho một loạt biến cờ rời rạc khi thấy hợp lý.',
      ],
    },
    {
      moduleId: 'mathforcode-s1-m3',
      objective:
        'Dùng phép chia lấy dư đúng cách cho băm, buffer vòng và chữ số kiểm tra, kể cả khi gặp số âm.',
      practice: [
        'So kết quả phép lấy dư với số âm giữa Python và một ngôn ngữ kiểu C, giải thích chênh lệch.',
        'Cài buffer vòng bằng chỉ số modulo và chứng minh nó không bao giờ ghi ra ngoài mảng.',
        'Cài thuật toán Luhn và kiểm ISBN-10, chạy trên danh sách mã hợp lệ và mã đã đổi một chữ số.',
      ],
      selfCheck: [
        {
          q: 'Vì sao kích thước bảng băm nên tránh là số chẵn đẹp như luỹ thừa của 10?',
          a: 'Vì khoá thật thường có quy luật theo cơ số đó nên dư bị dồn vào ít ô, làm va chạm tăng vọt.',
        },
        {
          q: 'Chữ số kiểm tra bắt được loại lỗi nào?',
          a: 'Bắt được lỗi gõ sai một chữ số và phần lớn lỗi đảo hai chữ số liền nhau khi nhập tay.',
        },
        {
          q: 'Buffer vòng dùng modulo để làm gì?',
          a: 'Để chỉ số chạy hết mảng thì quay về đầu, nhờ đó tái dùng bộ nhớ cố định mà không cấp phát thêm.',
        },
      ],
      doneSignals: [
        'Bạn kiểm tra hành vi của phép lấy dư với số âm trước khi tin vào nó trong code.',
        'Bộ kiểm mã của bạn phát hiện đúng mọi mã bị sửa một chữ số trong dữ liệu thử.',
      ],
    },
    {
      moduleId: 'mathforcode-s1-m4',
      objective:
        'Chứng minh được số phép tính của một vòng lặp bằng công thức tổng hoặc quy nạp, rồi kiểm lại bằng bộ đếm thật.',
      practice: [
        'Đặt bộ đếm vào ba vòng lặp lồng khác nhau, so số đếm thực tế với công thức tổng đã suy ra.',
        'Chứng minh bằng quy nạp công thức tổng 1 + 2 + ... + n rồi chỉ ra nó xuất hiện ở đâu trong sắp xếp chèn.',
        'Giải thích bằng cấp số nhân vì sao chia đôi liên tiếp cho ra số bước theo logarit cơ số hai.',
      ],
      selfCheck: [
        {
          q: 'Định nghĩa O lớn nói chính xác điều gì?',
          a: 'Tồn tại hằng số và ngưỡng để từ ngưỡng đó trở đi hàm chi phí bị chặn trên bởi hằng số nhân hàm chuẩn.',
        },
        {
          q: 'Vì sao hai vòng lặp lồng chưa chắc đã là bậc hai?',
          a: 'Vì vòng trong có thể chạy ít lần dần theo vòng ngoài, cho tổng là cấp số cộng chứ không phải tích đầy đủ.',
        },
        {
          q: 'Quy nạp chứng minh công thức đếm gồm hai bước nào?',
          a: 'Kiểm trường hợp cơ sở, rồi giả sử đúng với n và chứng minh nó kéo theo đúng với n cộng một.',
        },
      ],
      doneSignals: [
        'Số đếm thực tế của bạn khớp công thức đã chứng minh ở mọi kích thước thử.',
        'Bạn chỉ ra được vòng lặp nào trong code đang quyết định độ phức tạp tổng.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mathforcode-s1-r1',
      text: 'Hàm chuyển hệ đếm và bù 2 tự cài cho kết quả khớp hàm dựng sẵn của Python trên 1000 giá trị ngẫu nhiên có hạt giống.',
      howToProve:
        'Chạy script đối chiếu với hạt giống cố định và dán dòng kết quả cho biết số ca đã so và số ca lệch.',
    },
    {
      id: 'mathforcode-s1-r2',
      text: 'Bộ kiểm Luhn và ISBN-10 nhận đúng toàn bộ mã hợp lệ và từ chối mọi mã bị sửa một chữ số trong tập thử.',
      howToProve:
        'Chạy pytest trên tập mã hợp lệ và tập mã đã cố tình sửa, dán bảng số ca đạt trên tổng số ca.',
    },
    {
      id: 'mathforcode-s1-r3',
      text: 'Có ghi chú giải thích hiện tượng sai số dấu phẩy động bằng ví dụ số cụ thể chứ không nói chung chung.',
      howToProve:
        'Dán đoạn ghi chú kèm kết quả in 20 chữ số thập phân của phép cộng đã dùng làm ví dụ.',
    },
    {
      id: 'mathforcode-s1-r4',
      text: 'Ba vòng lặp có số phép tính đếm được khớp công thức tổng đã chứng minh, sai lệch bằng không.',
      howToProve:
        'Dán bảng ba cột gồm kích thước đầu vào, số đếm thực tế và giá trị công thức ở ít nhất năm kích thước.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Cài bằng Python thuần các hàm chuyển hệ đếm, bù 2 và phép toán trên bit cơ bản.',
      'Cài bộ kiểm chữ số Luhn và ISBN-10 kèm bộ test cho cả mã đúng lẫn mã sai.',
      'Đo và đối chiếu số phép tính thực tế của ba vòng lặp với công thức tổng đã chứng minh.',
    ],
    scopeDont: [
      'KHÔNG dùng thư viện ngoài cho phần tính toán, vì mục tiêu chặng này là hiểu chứ không phải chạy nhanh.',
      'KHÔNG động tới đại số tuyến tính hay xác suất — đó là nội dung chặng S2 và S3.',
      'KHÔNG làm giao diện đồ hoạ, một script chạy bằng dòng lệnh là đủ cho chặng này.',
    ],
    touchpoints: [
      'Thư mục nhân tính toán: mỗi nhóm phép toán một tệp, hàm thuần không in ra màn hình.',
      'Thư mục test: bộ test pytest cho từng hàm, có cả ca biên số 0 và số âm.',
      'Tệp ghi chú: giải thích sai số dấu phẩy động bằng ví dụ số đã chạy thật.',
    ],
    contracts: [
      'Hàm chuyển hệ đếm nhận số nguyên và trả chuỗi, số âm được xử lý theo bù 2 với số bit khai báo rõ.',
      'Bộ sinh dữ liệu ngẫu nhiên nhận hạt giống, cùng hạt giống cho cùng dãy giá trị.',
      'Bộ kiểm mã trả về giá trị đúng sai, không tự sửa mã đầu vào.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric đều đạt và có bằng chứng chạy thật kèm theo.',
      'Người khác chạy lại script với cùng hạt giống và nhận đúng cùng kết quả đối chiếu.',
    ],
    invariants: [
      'Không hàm nào trong nhân tính toán đọc ghi tệp hay in ra màn hình.',
      'Mọi so sánh số thực đều đi qua ngưỡng sai số, không có dấu bằng trực tiếp giữa hai số thực.',
      'Số bit dùng cho bù 2 luôn là tham số rõ ràng, không mặc định ngầm trong thân hàm.',
    ],
    conventions: [
      'Comment tiếng Việt ở chỗ công thức toán, kèm cách suy ra hoặc nguồn tra cứu.',
      'Tên hàm nói rõ phép toán và hệ đếm, tránh viết tắt một chữ cái.',
      'Commit nhỏ theo conventional commits, mỗi commit một nhóm phép toán kèm test của nó.',
    ],
  },
}

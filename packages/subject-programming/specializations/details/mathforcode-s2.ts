// details/mathforcode-s2.ts — Chi tiết chặng S2 hướng TOÁN HỌC CHO LẬP TRÌNH
// ("Tổ hợp và xác suất cho lập trình viên"). Bản đồ chặng ở ../mathforcode.ts.
//
// Đặc thù S2: đây là chặng đầu tiên kết quả KHÔNG tất định, nên kỷ luật hạt giống và ngưỡng sai
// lệch trở thành phần bắt buộc của đặc tả — không có nó thì "chạy lại ra số khác" bị nhầm thành lỗi.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MATHFORCODE_S2_DETAIL: SpecStageDetail = {
  stageId: 'mathforcode-s2',
  modules: [
    {
      moduleId: 'mathforcode-s2-m1',
      objective:
        'Đếm được kích thước không gian tìm cạn trước khi viết vòng lặp, để biết bài toán chạy nổi hay không.',
      practice: [
        'Với ba bài vét cạn khác nhau, tính trước số trường hợp rồi đối chiếu với số vòng lặp đếm được khi chạy.',
        'Sinh bộ ca kiểm phủ hết tổ hợp giá trị của bốn tham số nhị phân và đếm xem có đúng số ca lý thuyết không.',
        'Cài hàm tính tổ hợp chập k của n bằng tam giác Pascal, so với công thức giai thừa ở n lớn.',
      ],
      selfCheck: [
        {
          q: 'Phân biệt chỉnh hợp và tổ hợp bằng một câu hỏi nào?',
          a: 'Hỏi thứ tự có làm kết quả khác đi không: có thì là chỉnh hợp, không thì là tổ hợp.',
        },
        {
          q: 'Vì sao nên tính số trường hợp trước khi viết vòng lặp vét cạn?',
          a: 'Vì con số đó cho biết ngay chương trình chạy vài giây hay vài năm, tránh phí công viết rồi mới biết.',
        },
        {
          q: 'Tính tổ hợp bằng tam giác Pascal lợi gì so với công thức giai thừa?',
          a: 'Chỉ dùng phép cộng số nguyên nên không tràn số sớm và không mất chính xác như khi chia giai thừa lớn.',
        },
      ],
      doneSignals: [
        'Bạn nói được con số ước lượng trước khi bấm chạy, và số đó khớp với thực tế.',
        'Bạn từ chối phương án vét cạn khi phép đếm cho thấy nó không khả thi.',
      ],
    },
    {
      moduleId: 'mathforcode-s2-m2',
      objective:
        'Ước lượng được rủi ro va chạm và giá trị trung bình dài hạn của một cơ chế ngẫu nhiên bằng xác suất và kỳ vọng.',
      practice: [
        'Tính tay xác suất trùng khoá theo bài toán sinh nhật rồi so với tỉ lệ mô phỏng trên cùng kích thước bảng.',
        'Tính kỳ vọng số lần thử lại của một cơ chế giới hạn tần suất ngẫu nhiên, kiểm bằng mô phỏng.',
        'Lấy một kết quả A/B thử nghiệm và xác định chênh lệch quan sát có nằm trong dao động ngẫu nhiên không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao bảng băm rất dễ va chạm dù số khoá còn ít so với số ô?',
          a: 'Vì xác suất tính trên mọi cặp khoá, số cặp tăng theo bình phương nên trùng xuất hiện sớm hơn trực giác.',
        },
        {
          q: 'Tính tuyến tính của kỳ vọng có ích ở chỗ nào?',
          a: 'Cho phép cộng kỳ vọng từng phần lại dù các phần phụ thuộc nhau, nên bài khó tính trực tiếp lại tính được.',
        },
        {
          q: 'Một thử nghiệm A/B cho B nhỉnh hơn A thì đã đủ kết luận chưa?',
          a: 'Chưa, phải xét cỡ mẫu và mức dao động ngẫu nhiên, vì chênh lệch nhỏ trên mẫu bé có thể chỉ là nhiễu.',
        },
      ],
      doneSignals: [
        'Số mô phỏng của bạn hội tụ về giá trị lý thuyết khi tăng số lần chạy.',
        'Bạn nói được cần bao nhiêu mẫu thì mới tin được một chênh lệch quan sát.',
      ],
    },
    {
      moduleId: 'mathforcode-s2-m3',
      objective:
        'Cài được bộ sinh giả ngẫu nhiên có hạt giống và nói rõ vì sao không được dùng nó cho mật mã.',
      practice: [
        'Cài bộ sinh đồng dư tuyến tính, vẽ các cặp giá trị liên tiếp lên mặt phẳng để thấy cấu trúc lộ ra.',
        'Cài trộn Fisher-Yates đúng và một bản trộn sai, chạy vạn lần rồi so phân bố vị trí của từng phần tử.',
        'Chứng minh bằng thực nghiệm rằng cùng hạt giống cho lại đúng dãy số cũ, kể cả sau khi khởi động lại chương trình.',
      ],
      selfCheck: [
        {
          q: 'Vì sao bộ sinh giả ngẫu nhiên thông thường không dùng được cho mật mã?',
          a: 'Vì biết vài giá trị đầu ra là suy ngược được trạng thái nội bộ, từ đó đoán trước toàn bộ dãy tiếp theo.',
        },
        {
          q: 'Hạt giống cố định giúp gì cho việc gỡ lỗi?',
          a: 'Nó tái hiện lại đúng lần chạy đã lỗi, nhờ đó lỗi ngẫu nhiên trở thành lỗi lặp lại được để lần ra.',
        },
        {
          q: 'Trộn mảng sai cách gây hậu quả gì mà mắt thường không thấy?',
          a: 'Một số hoán vị xuất hiện nhiều hơn hẳn, dữ liệu trông vẫn xáo trộn nhưng kết quả thống kê bị lệch.',
        },
      ],
      doneSignals: [
        'Bản trộn của bạn cho phân bố vị trí đều trong phạm vi dao động thống kê chấp nhận được.',
        'Mọi mô phỏng bạn viết đều nhận hạt giống làm tham số, không lấy ngẫu nhiên ngầm.',
      ],
    },
    {
      moduleId: 'mathforcode-s2-m4',
      objective:
        'Báo cáo kết quả đo hiệu năng bằng phân vị và độ phân tán thay vì một con số trung bình dễ gây hiểu nhầm.',
      practice: [
        'Đo thời gian một hàm 1000 lần, tính trung bình, trung vị, p95, p99 và so bốn con số đó.',
        'Cố tình chèn vài lần đo nhiễu rất chậm rồi quan sát trung bình và trung vị dịch chuyển khác nhau thế nào.',
        'Tăng dần số lần lặp cho tới khi p95 ổn định, ghi lại ngưỡng số lần lặp đó.',
      ],
      selfCheck: [
        {
          q: 'Vì sao độ trễ dịch vụ luôn báo theo p95 hoặc p99?',
          a: 'Vì trung bình che mất phần đuôi chậm, trong khi chính phần đuôi mới là trải nghiệm tệ mà người dùng gặp.',
        },
        {
          q: 'Trung vị bền hơn trung bình trước giá trị ngoại lai ở chỗ nào?',
          a: 'Trung vị chỉ phụ thuộc vị trí giữa của dãy nên vài giá trị cực đoan không kéo nó đi.',
        },
        {
          q: 'Độ lệch chuẩn lớn khi đo hiệu năng nói lên điều gì?',
          a: 'Kết quả dao động mạnh, nên phải tăng số lần đo hoặc tìm nguồn nhiễu trước khi kết luận.',
        },
      ],
      doneSignals: [
        'Báo cáo đo của bạn luôn kèm phân vị và số lần lặp, không chỉ một con số trung bình.',
        'Bạn nhận ra lần đo nào bị nhiễu và loại nó có lý do rõ ràng chứ không loại tuỳ tiện.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mathforcode-s2-r1',
      text: 'Mô phỏng va chạm bảng băm chạy lại với cùng hạt giống cho ra kết quả giống hệt tới từng con số.',
      howToProve: 'Chạy mô phỏng hai lần với cùng hạt giống và dán kết quả hai lần đặt cạnh nhau.',
    },
    {
      id: 'mathforcode-s2-r2',
      text: 'Tỉ lệ va chạm mô phỏng lệch dưới hai phần trăm so với giá trị tính bằng công thức bài toán sinh nhật.',
      howToProve:
        'Dán bảng ba cột gồm số khoá, tỉ lệ lý thuyết và tỉ lệ mô phỏng ở ít nhất năm mức khác nhau.',
    },
    {
      id: 'mathforcode-s2-r3',
      text: 'Báo cáo thời gian tra cứu theo p50, p95 và p99 ở ba mức hệ số tải, kèm số lần lặp của mỗi phép đo.',
      howToProve: 'Chạy script đo và dán bảng phân vị đầy đủ ba mức tải cùng số lần lặp đã dùng.',
    },
    {
      id: 'mathforcode-s2-r4',
      text: 'Có phần giải thích bằng chữ vì sao tăng kích thước bảng làm giảm va chạm, bám đúng số liệu đã đo.',
      howToProve:
        'Dán đoạn giải thích kèm đồ thị tỉ lệ va chạm theo kích thước bảng lấy từ chính dữ liệu mô phỏng.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Mô phỏng va chạm bảng băm ở nhiều hệ số tải, có hạt giống và chạy lại được.',
      'Tính giá trị lý thuyết bằng công thức bài toán sinh nhật và đặt cạnh kết quả mô phỏng.',
      'Đo thời gian tra cứu rồi báo cáo theo phân vị kèm đồ thị.',
    ],
    scopeDont: [
      'KHÔNG tối ưu bản cài bảng băm, vì mục tiêu chặng là đo và giải thích chứ không phải làm cho nhanh.',
      'KHÔNG dùng bộ sinh ngẫu nhiên không nhận hạt giống — mất hạt giống là mất khả năng tái hiện.',
      'KHÔNG đụng tới đại số tuyến tính, phần đó thuộc chặng S3.',
    ],
    touchpoints: [
      'Mô-đun bảng băm thử nghiệm: cài đơn giản, đủ để đếm va chạm chứ không cần tối ưu.',
      'Mô-đun mô phỏng: nhận hạt giống, số khoá và kích thước bảng làm tham số.',
      'Mô-đun báo cáo: tính phân vị và xuất bảng cùng đồ thị.',
    ],
    contracts: [
      'Mọi hàm mô phỏng nhận hạt giống làm tham số bắt buộc, không lấy ngẫu nhiên từ hệ thống.',
      'Hàm tính lý thuyết và hàm mô phỏng nhận cùng bộ tham số để so trực tiếp được.',
      'Kết quả đo trả về danh sách thời gian thô, việc tính phân vị nằm ở tầng báo cáo.',
    ],
    acceptance: [
      'Đủ bốn tiêu chí rubric, mỗi tiêu chí kèm bảng số hoặc đồ thị lấy từ lần chạy thật.',
      'Người khác chạy lại với hạt giống trong báo cáo và ra đúng cùng các con số.',
    ],
    invariants: [
      'Cùng hạt giống luôn cho cùng kết quả, không phụ thuộc thứ tự chạy hay máy chạy.',
      'Tỉ lệ va chạm luôn nằm trong khoảng từ 0 tới 1, giá trị ngoài khoảng là lỗi cài đặt.',
      'Số lần lặp của phép đo được ghi kèm mọi con số phân vị công bố.',
    ],
    conventions: [
      'Mọi bảng số trong báo cáo ghi rõ đơn vị và số lần lặp đã dùng.',
      'Công thức lý thuyết viết trong comment tiếng Việt ngay trên hàm cài nó.',
      'Commit theo conventional commits, tách riêng commit mô phỏng và commit báo cáo.',
    ],
  },
}

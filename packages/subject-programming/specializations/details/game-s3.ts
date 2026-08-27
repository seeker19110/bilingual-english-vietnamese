// details/game-s3.ts — Chi tiết chặng S3 hướng GAME ("Đồ hoạ và hiệu năng").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const GAME_S3_DETAIL: SpecStageDetail = {
  stageId: 'game-s3',
  modules: [
    {
      moduleId: 'game-s3-m1',
      objective:
        'Hiểu đường ống dựng hình đủ để biết mỗi lệnh vẽ tốn gì và vì sao thứ tự vẽ lại quan trọng.',
      practice: [
        'Đếm số lệnh vẽ mỗi khung hình rồi gộp lô để giảm xuống, giữ nguyên hình ảnh hiển thị.',
        'Bật tắt bộ đệm chiều sâu và quan sát thứ tự vẽ ảnh hưởng tới kết quả ra sao.',
        'So ảnh chụp trước và sau khi gộp lô từng điểm ảnh để chắc là không đổi hình.',
      ],
      selfCheck: [
        {
          q: 'Vì sao nhiều lệnh vẽ nhỏ lại chậm hơn ít lệnh vẽ lớn?',
          a: 'Mỗi lệnh có chi phí chuẩn bị ở phía CPU và phía trình điều khiển, cộng dồn lại lớn hơn phần vẽ.',
        },
        {
          q: 'Vật trong suốt cần vẽ theo thứ tự nào?',
          a: 'Vẽ sau các vật đục và vẽ từ xa tới gần, vì trộn màu phụ thuộc thứ tự.',
        },
      ],
      doneSignals: [
        'Bạn biết mỗi khung hình game của mình có bao nhiêu lệnh vẽ.',
        'Bạn tối ưu mà chứng minh được hình ảnh không đổi.',
      ],
    },
    {
      moduleId: 'game-s3-m2',
      objective:
        'Tự viết được shader phục vụ lối chơi và kiểm soát được chi phí của nó trên máy mục tiêu.',
      practice: [
        'Viết hai shader có mục đích chơi rõ ràng, ví dụ đánh dấu mục tiêu và hiệu ứng trúng đòn.',
        'Đo thời gian mỗi shader chiếm trong một khung hình trên máy mục tiêu.',
        'Thử một hiệu ứng hậu xử lý rồi cân nhắc chi phí so với giá trị nó mang lại cho người chơi.',
      ],
      selfCheck: [
        {
          q: 'Vì sao hiệu ứng hậu xử lý dễ ngốn hiệu năng?',
          a: 'Nó chạy trên mọi điểm ảnh của màn hình, nên chi phí tỉ lệ thẳng với độ phân giải.',
        },
        {
          q: 'Biến đồng nhất khác dữ liệu theo đỉnh ở chỗ nào?',
          a: 'Biến đồng nhất giống nhau cho cả lệnh vẽ, còn dữ liệu theo đỉnh thay đổi theo từng đỉnh.',
        },
      ],
      doneSignals: [
        'Bạn giải thích được từng dòng trong shader mình viết.',
        'Mỗi hiệu ứng bạn thêm đều kèm số mili giây nó chiếm.',
      ],
    },
    {
      moduleId: 'game-s3-m3',
      objective:
        'Giữ được nhịp khung hình ổn định bằng ngân sách khung hình, cắt tỉa và mức chi tiết theo khoảng cách.',
      practice: [
        'Chia ngân sách 16,6 mili giây cho phần CPU và phần GPU rồi đo phần nào đang vượt.',
        'Bật cắt tỉa vật ngoài tầm nhìn và mức chi tiết theo khoảng cách, đo lại sau mỗi bước.',
        'Tải nội dung theo luồng để tránh khựng khi vào vùng mới.',
      ],
      selfCheck: [
        {
          q: 'Vì sao số khung hình trung bình là thước đo dễ gây hiểu lầm?',
          a: 'Người chơi cảm nhận những khung tệ nhất; trung bình đẹp vẫn có thể giật rõ ràng.',
        },
        {
          q: 'Cắt tỉa giúp gì cho hiệu năng?',
          a: 'Bỏ qua sớm những vật không thể nhìn thấy nên không tốn công chuẩn bị và vẽ chúng.',
        },
      ],
      doneSignals: [
        'Bạn theo dõi biểu đồ thời gian khung hình chứ không nhìn con số ở góc màn hình.',
        'Bạn nói được mỗi khung hình tiêu bao nhiêu cho CPU và bao nhiêu cho GPU.',
      ],
    },
    {
      moduleId: 'game-s3-m4',
      objective:
        'Dựng được thế giới 3D cơ bản: biến đổi toạ độ, điều khiển camera và hoà trộn hoạt ảnh mượt.',
      practice: [
        'Cài camera 3D có điều khiển và xử lý trường hợp camera đâm vào tường.',
        'Hoà trộn hoạt ảnh giữa ba trạng thái di chuyển sao cho không nhảy tư thế khi chuyển.',
        'Dùng quaternion cho phép quay và kiểm bằng trường hợp quay quanh nhiều trục liên tiếp.',
      ],
      selfCheck: [
        {
          q: 'Vì sao dùng góc Euler cho phép quay dễ gặp rắc rối?',
          a: 'Có thể mất một bậc tự do khi hai trục trùng nhau, làm phép quay nhảy hoặc kẹt.',
        },
        {
          q: 'Hoà trộn hoạt ảnh giải quyết vấn đề gì?',
          a: 'Chuyển dần giữa hai tư thế trong một khoảng thời gian, thay vì nhảy đột ngột gây khó chịu.',
        },
      ],
      doneSignals: [
        'Nhân vật chuyển trạng thái di chuyển mà không thấy nhảy tư thế.',
        'Camera của bạn không xuyên tường và không gây chóng mặt.',
      ],
    },
  ],
  rubric: [
    {
      id: 'game-s3-r1',
      text: 'Giữ được ít nhất 60 khung hình mỗi giây với 99% khung dưới 16,6 mili giây trên máy mục tiêu.',
      howToProve: 'Nộp biểu đồ thời gian khung hình của 60 giây chơi thật, không phải cảnh tĩnh.',
    },
    {
      id: 'game-s3-r2',
      text: 'Có ít nhất hai shader tự viết phục vụ lối chơi, mỗi shader chiếm không quá 1 mili giây mỗi khung.',
      howToProve: 'Dán số đo GPU cho từng shader kèm ảnh chụp hiệu ứng trong game.',
    },
    {
      id: 'game-s3-r3',
      text: 'Báo cáo tối ưu gồm ít nhất ba bước, mỗi bước có ảnh chụp profiler trước và sau.',
      howToProve: 'Nộp báo cáo theo từng bước kèm ảnh chụp và số đo tương ứng.',
    },
    {
      id: 'game-s3-r4',
      text: 'Có ít nhất 5 người chơi thử và 3 người chơi hết vòng đầu mà không cần ai hướng dẫn.',
      howToProve: 'Ghi lại buổi chơi thử: ai chơi, chỗ nào họ bị kẹt, bao nhiêu người chơi hết.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Làm một game 3D nhỏ đạt nhịp khung hình ổn định trên máy mục tiêu.',
      'Tự viết shader phục vụ lối chơi và đo chi phí của chúng.',
    ],
    scopeDont: [
      'Không mở rộng nội dung game trong đợt này, vì mục tiêu là hiệu năng và đồ hoạ chứ không phải khối lượng màn chơi.',
      'Không tự viết engine mới khi engine sẵn có đã đủ cho mục tiêu chặng.',
    ],
    touchpoints: [
      'Vòng lặp dựng hình và nơi khai báo vật liệu, shader.',
      'Hệ thống tải nội dung và cấu hình mức chi tiết.',
    ],
    contracts: [
      'Mỗi hiệu ứng khai báo rõ ngân sách thời gian nó được phép chiếm.',
      'Nội dung tải theo luồng phải có trạng thái chờ rõ ràng, không khoá vòng lặp chính.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric, gồm cả tiêu chí chơi thử với người thật.',
      'Không có khung hình vượt 33 mili giây trong 60 giây chơi thử.',
    ],
    invariants: [
      'Tối ưu không được làm đổi hình ảnh hiển thị nếu chưa nói trước.',
      'Lối chơi không bị hy sinh để lấy điểm hiệu năng.',
    ],
    conventions: [
      'Mọi số đo ghi kèm cấu hình máy mục tiêu và độ phân giải đã dùng.',
      'Nội dung nặng phải kiểm trên máy yếu nhất trong danh sách hỗ trợ.',
    ],
  },
}

// details/architecture-s2.ts — Chi tiết chặng S2 hướng KIẾN TRÚC ("Hợp đồng & mô hình miền").
// Hướng nền cắt ngang: học song song một hướng sản phẩm, dự án chặng áp thẳng lên dự án đó.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ARCHITECTURE_S2_DETAIL: SpecStageDetail = {
  stageId: 'architecture-s2',
  modules: [
    {
      moduleId: 'architecture-s2-m1',
      objective:
        'Mô hình hoá được miền nghiệp vụ bằng đúng ngôn ngữ người làm nghề dùng, tách rõ thực thể và giá trị.',
      practice: [
        'Phỏng vấn một người làm nghiệp vụ thật và lập từ điển thuật ngữ, đối chiếu với tên đang có trong mã.',
        'Chỉ ra một chữ mang hai nghĩa ở hai bộ phận và tách nó thành hai kiểu riêng.',
        'Viết ra năm bất biến nghiệp vụ luôn đúng bất kể thao tác nào.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tên trong mã phải trùng tên người làm nghiệp vụ dùng?',
          a: 'Mỗi lần dịch qua lại giữa hai bộ từ vựng là một cơ hội hiểu sai, và người kiểm thử không đọc được mã.',
        },
        {
          q: 'Thực thể khác giá trị ở điểm nào?',
          a: 'Thực thể có định danh riêng và theo dõi qua thời gian; giá trị chỉ là dữ liệu, hai cái bằng nhau là một.',
        },
      ],
      doneSignals: [
        'Người làm nghiệp vụ đọc tên kiểu và hàm là hiểu được.',
        'Mỗi bất biến nghiệp vụ chỉ ra được nơi duy nhất bảo vệ nó.',
      ],
    },
    {
      moduleId: 'architecture-s2-m2',
      objective:
        'Viết được hợp đồng dữ liệu kiểm được lúc chạy, làm cho trạng thái sai trở nên không biểu diễn được.',
      practice: [
        'Đưa toàn bộ dữ liệu đi qua một ranh giới về schema kiểm được lúc chạy.',
        'Thay các cờ boolean rời rạc bằng một kiểu hợp phân biệt cho trạng thái đơn hàng.',
        'Viết ra bảng ca lỗi của một endpoint và coi nó là một phần hợp đồng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao kiểu tĩnh chưa đủ ở ranh giới hệ thống?',
          a: 'Dữ liệu từ mạng, tệp hay CSDL không được trình biên dịch kiểm; phải kiểm lúc chạy mới biết thật sự nhận được gì.',
        },
        {
          q: '"Làm cho trạng thái sai không biểu diễn được" nghĩa là gì?',
          a: 'Thiết kế kiểu sao cho tổ hợp vô nghĩa không viết ra được, thay vì viết ra rồi kiểm bằng if.',
        },
      ],
      doneSignals: [
        'Không còn ranh giới nào nhận dữ liệu mà không kiểm.',
        'Ca lỗi được liệt kê trước khi viết mã, không bổ sung sau.',
      ],
    },
    {
      moduleId: 'architecture-s2-m3',
      objective:
        'Tiến hoá được hợp đồng đang chạy mà không phá bên đang dùng, theo lối mở rộng rồi mới thu hẹp.',
      practice: [
        'Thực hiện một lần đổi schema thật theo ba bước: thêm mới, chuyển dần, bỏ cũ.',
        'Viết migration quay lui được và diễn tập một lần quay lui.',
        'Đánh phiên bản một endpoint và cho hai phiên bản chạy song song một thời gian.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không đổi thẳng tên một cột đang dùng?',
          a: 'Mọi bên đọc cũ gãy ngay lúc triển khai; thêm cột mới rồi chuyển dần cho phép hai bên cùng chạy trong lúc chuyển.',
        },
        {
          q: 'Thêm trường bắt buộc vào response có phá vỡ không?',
          a: 'Thường không với bên đọc bỏ qua trường lạ, nhưng thêm trường bắt buộc vào request thì phá vỡ ngay.',
        },
      ],
      doneSignals: [
        'Đổi schema mà không có phút ngừng dịch vụ nào.',
        'Có đường quay lui đã diễn tập, không phải chỉ nằm trên giấy.',
      ],
    },
    {
      moduleId: 'architecture-s2-m4',
      objective:
        'Chốt được nguồn sự thật cho từng loại dữ liệu và xử lý đúng ba chỗ sai đắt nhất: thời gian, tiền, định danh.',
      practice: [
        'Lập bảng dữ liệu nào do module nào sở hữu, ai được ghi, ai chỉ đọc.',
        'Rà toàn bộ chỗ xử lý thời gian trong dự án, chuẩn hoá về một múi giờ lưu trữ duy nhất.',
        'Đổi mọi phép tính tiền sang số nguyên đơn vị nhỏ nhất và viết test ca làm tròn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không lưu tiền bằng số thực?',
          a: 'Số thực nhị phân không biểu diễn chính xác phần thập phân, cộng dồn nhiều lần là lệch tiền thật.',
        },
        {
          q: 'Vì sao phải chốt một nguồn sự thật duy nhất?',
          a: 'Hai nơi cùng được ghi thì sớm muộn cũng lệch, và lúc đó không ai biết bên nào đúng.',
        },
      ],
      doneSignals: [
        'Mỗi loại dữ liệu chỉ ra được đúng một nơi được ghi.',
        'Không còn phép tính tiền nào dùng số thực.',
      ],
    },
  ],
  rubric: [
    {
      id: 'architecture-s2-r1',
      text: 'Mọi ranh giới module và mọi endpoint dùng schema từ gói hợp đồng dùng chung, không định nghĩa lại.',
      howToProve:
        'Tìm kiếm toàn repo không còn khai báo kiểu trùng lặp; quy tắc lint chặn import chéo bật lên.',
    },
    {
      id: 'architecture-s2-r2',
      text: 'Ít nhất năm bất biến nghiệp vụ viết thành test, cố tình phá là test đỏ.',
      howToProve: 'Sửa mã cho vi phạm từng bất biến một, dán năm lần chạy test đỏ tương ứng.',
    },
    {
      id: 'architecture-s2-r3',
      text: 'Một lần tiến hoá schema thật theo lối mở rộng rồi thu hẹp, không có phút ngừng dịch vụ.',
      howToProve:
        'Nhật ký ba lần triển khai kèm kiểm tra sức khoẻ xanh liên tục trong suốt quá trình.',
    },
    {
      id: 'architecture-s2-r4',
      text: 'Bảng nguồn sự thật đầy đủ: mỗi loại dữ liệu có đúng một nơi được phép ghi.',
      howToProve:
        'Bảng trong tài liệu kiến trúc, đối chiếu bằng tìm kiếm mã cho ba loại dữ liệu bất kỳ.',
    },
    {
      id: 'architecture-s2-r5',
      text: 'Có ADR cho mỗi quyết định lớn, nêu rõ phương án bị loại và điều kiện xem lại.',
      howToProve: 'Ít nhất ba ADR theo khuôn `docs/templates/adr.md`, mỗi cái đủ hai ô hay bị bỏ.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tách toàn bộ dữ liệu đi qua ranh giới của dự án ra một gói hợp đồng dùng chung.',
      'Viết bất biến nghiệp vụ thành test canh gác.',
      'Thực hiện một lần tiến hoá schema thật không ngừng dịch vụ.',
    ],
    scopeDont: [
      'KHÔNG viết lại kiến trúc từ đầu — mục tiêu là tách hợp đồng khỏi mã đang chạy, viết lại là đánh tráo bài toán.',
      'KHÔNG chia hệ thống thành nhiều dịch vụ ở chặng này.',
      'KHÔNG đổi công nghệ nền chỉ vì đang tiện tay sửa.',
    ],
    touchpoints: [
      'Gói hợp đồng dùng chung: nơi duy nhất khai kiểu đi qua ranh giới.',
      'Tầng nghiệp vụ thuần: nơi duy nhất giữ bất biến.',
      'Thư mục ADR: một file cho mỗi quyết định lớn.',
    ],
    contracts: [
      'Schema chỉ được thêm trường tuỳ chọn; xoá hoặc đổi nghĩa là thay đổi phá vỡ, phải qua phiên bản mới.',
      'Mọi ca lỗi có mã máy đọc được, khai cùng chỗ với schema.',
      'Migration luôn có đường quay lui và chạy được từ CSDL trống.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, kèm nhật ký triển khai thật.',
      'Người khác đọc gói hợp đồng là biết hệ thống trao đổi những gì, không cần đọc mã cài đặt.',
    ],
    invariants: [
      'Không có kiểu dữ liệu ranh giới nào được khai ở hai nơi.',
      'Mỗi loại dữ liệu chỉ có một nơi được phép ghi.',
      'Không thay đổi phá vỡ nào được triển khai mà không có bước chuyển tiếp.',
    ],
    conventions: [
      'ADR viết theo `docs/templates/adr.md`, bắt buộc có ô phương án bị loại và ô điều kiện xem lại.',
      'Đặc tả giao việc viết theo `docs/templates/dac-ta-tinh-nang.md`, đủ sáu ô.',
      'Dữ liệu ngoài luôn validate lúc chạy, không tin kiểu tĩnh.',
    ],
  },
}

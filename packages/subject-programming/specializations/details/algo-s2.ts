// details/algo-s2.ts — Chi tiết chặng S2 hướng THUẬT TOÁN (cây, đồ thị, đệ quy, tham lam).
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ALGO_S2_DETAIL: SpecStageDetail = {
  stageId: 'algo-s2',
  modules: [
    {
      moduleId: 'algo-s2-m1',
      objective:
        'Thiết kế được lời giải đệ quy có chứng minh dừng và biết khi nào phải chuyển sang lặp.',
      practice: [
        'Giải mười bài quay lui, mỗi bài viết rõ điều kiện cắt tỉa trước khi code.',
        'Chuyển một lời giải đệ quy sâu sang lặp dùng ngăn xếp tường minh, so mức dùng bộ nhớ.',
        'Viết bộ sinh dữ liệu ngẫu nhiên đối chiếu lời giải nhanh với lời giải vét cạn.',
      ],
      selfCheck: [
        {
          q: 'Một lời giải đệ quy cần gì để chắc chắn dừng?',
          a: 'Mỗi lời gọi phải thu nhỏ bài toán theo một đại lượng giảm dần và có trường hợp cơ sở chặn lại.',
        },
        {
          q: 'Cắt tỉa sai thì hậu quả gì?',
          a: 'Bỏ mất nghiệm đúng mà chương trình vẫn chạy trơn tru — loại lỗi chỉ kiểm thử đối chiếu mới bắt được.',
        },
      ],
      doneSignals: [
        'Ước lượng được số nhánh phải duyệt trước khi chạy.',
        'Có bộ kiểm thử ngẫu nhiên đối chiếu cho ít nhất năm bài.',
      ],
    },
    {
      moduleId: 'algo-s2-m2',
      objective:
        'Chọn và cài đặt đúng cấu trúc cây cho bài toán, giải thích được độ phức tạp từng thao tác.',
      practice: [
        'Cài cây tìm kiếm nhị phân và đo suy biến khi chèn dữ liệu đã sắp xếp.',
        'Dùng hàng đợi ưu tiên giải bài toán chọn k phần tử lớn nhất trên luồng dữ liệu.',
        'Cài cây tiền tố cho gợi ý từ khoá và đo bộ nhớ so với danh sách phẳng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cây tìm kiếm nhị phân không cân bằng lại nguy hiểm?',
          a: 'Dữ liệu đã sắp xếp biến nó thành danh sách liên kết, thao tác từ logarit tụt xuống tuyến tính.',
        },
        {
          q: 'Khi nào hàng đợi ưu tiên hơn hẳn sắp xếp toàn bộ?',
          a: 'Khi chỉ cần k phần tử đầu trên tập rất lớn hoặc trên luồng dữ liệu không giữ hết được.',
        },
      ],
      doneSignals: [
        'Nói được độ phức tạp từng thao tác mà không tra lại.',
        'Chọn cấu trúc dựa trên đặc điểm dữ liệu, không theo thói quen.',
      ],
    },
    {
      moduleId: 'algo-s2-m3',
      objective:
        'Mô hình hoá được bài toán đời thật thành đồ thị và chọn đúng thuật toán đường đi cho nó.',
      practice: [
        'Chuyển một bài toán thật thành đồ thị: định nghĩa rõ đỉnh là gì, cạnh là gì, trọng số là gì.',
        'Cài Dijkstra và so sánh thời gian với tìm kiếm theo chiều rộng trên đồ thị không trọng số.',
        'Dùng hợp-tìm để gom nhóm trên tập ít nhất mười nghìn phần tử.',
      ],
      selfCheck: [
        {
          q: 'Khi nào không được dùng Dijkstra?',
          a: 'Khi có cạnh trọng số âm; lúc đó phải dùng thuật toán chịu được cạnh âm.',
        },
        {
          q: 'Bước khó nhất khi giải bài toán đồ thị là gì?',
          a: 'Mô hình hoá: quyết định cái gì là đỉnh và cái gì là cạnh, vì chọn sai là thuật toán nào cũng không cứu được.',
        },
      ],
      doneSignals: [
        'Nhìn một bài toán mới là nhận ra được cấu trúc đồ thị bên dưới.',
        'Có số đo thời gian thật trên đồ thị lớn, không chỉ lý thuyết.',
      ],
    },
    {
      moduleId: 'algo-s2-m4',
      objective:
        'Nhận ra được khi nào chiến lược tham lam đúng và biết bác bỏ nó bằng phản ví dụ khi sai.',
      practice: [
        'Giải năm bài lịch biểu bằng tham lam, mỗi bài viết một dòng lý do vì sao chọn tham lam đó đúng.',
        'Tìm phản ví dụ bác bỏ một ý tưởng tham lam nghe rất hợp lý.',
        'So sánh lời giải tham lam với quy hoạch động trên cùng bộ dữ liệu.',
      ],
      selfCheck: [
        {
          q: 'Làm sao biết một chiến lược tham lam là đúng?',
          a: 'Phải chứng minh được lựa chọn tốt nhất tại chỗ không loại mất nghiệm tối ưu toàn cục; cảm giác hợp lý không phải chứng minh.',
        },
        {
          q: 'Phản ví dụ có giá trị gì?',
          a: 'Một phản ví dụ đủ bác bỏ hoàn toàn, tiết kiệm hàng giờ cố cứu một hướng sai.',
        },
      ],
      doneSignals: [
        'Trước khi code đã biết tham lam có đúng hay không.',
        'Có sổ ghi các phản ví dụ đã tìm được để dùng lại.',
      ],
    },
  ],
  rubric: [
    {
      id: 'algo-s2-r1',
      text: 'Chạy được trên dữ liệu thật có ít nhất mười nghìn đỉnh, hoàn tất trong ngưỡng thời gian đã đặt.',
      howToProve: 'Bảng thời gian chạy trên ba kích thước dữ liệu tăng dần, kèm cấu hình máy.',
    },
    {
      id: 'algo-s2-r2',
      text: 'So sánh ít nhất hai thuật toán cho cùng bài toán, có số đo và kết luận chọn cái nào.',
      howToProve: 'Bảng so sánh thời gian và bộ nhớ, kèm lệnh chạy để người khác lặp lại.',
    },
    {
      id: 'algo-s2-r3',
      text: 'Có kiểm thử đối chiếu ngẫu nhiên với lời giải vét cạn cho ít nhất năm bài.',
      howToProve: 'Chạy bộ sinh ngẫu nhiên mười nghìn ca, không ca nào lệch.',
    },
    {
      id: 'algo-s2-r4',
      text: 'Mọi thuật toán trong dự án đều ghi rõ độ phức tạp thời gian và bộ nhớ.',
      howToProve: 'Bảng tổng hợp trong tài liệu dự án, đối chiếu với số đo thực nghiệm.',
    },
    {
      id: 'algo-s2-r5',
      text: 'Xử lý đúng các ca biên: đồ thị rỗng, không có đường đi, đồ thị không liên thông.',
      howToProve: 'Bộ kiểm thử liệt kê từng ca biên và kết quả mong đợi, chạy xanh.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Bộ giải một bài toán đồ thị đời thật: chỉ đường, xếp lịch hoặc gợi ý.',
      'So sánh thực nghiệm ít nhất hai thuật toán.',
      'Bộ kiểm thử đối chiếu ngẫu nhiên và ca biên.',
    ],
    scopeDont: [
      'KHÔNG làm giao diện đồ hoạ cầu kỳ — mục tiêu là thuật toán, in ra dòng lệnh là đủ.',
      'KHÔNG tối ưu vi mô trước khi chọn đúng thuật toán; đổi thuật toán thắng mọi vi tối ưu.',
      'KHÔNG dùng thư viện có sẵn cho chính thuật toán đang học.',
    ],
    touchpoints: [
      'Module đọc và mô hình hoá dữ liệu thành đồ thị, tách khỏi thuật toán.',
      'Mỗi thuật toán một file, cùng một giao diện hàm để hoán đổi được.',
      'Bộ sinh dữ liệu ngẫu nhiên và bộ đo thời gian.',
    ],
    contracts: [
      'Mọi thuật toán nhận cùng cấu trúc đồ thị và trả cùng kiểu kết quả, để so sánh được trực tiếp.',
      'Đồ thị không có đường đi thì trả kết quả rỗng rõ ràng, không ném lỗi.',
      'Hạt giống ngẫu nhiên khai báo rõ để tái hiện được lần chạy.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có bảng số đo kèm theo.',
      'Người khác chạy lại được toàn bộ số đo bằng một lệnh.',
    ],
    invariants: [
      'Kết quả không đổi giữa các lần chạy với cùng dữ liệu vào.',
      'Lời giải nhanh luôn khớp lời giải vét cạn trên dữ liệu nhỏ.',
      'Không thuật toán nào sửa dữ liệu đồ thị đầu vào.',
    ],
    conventions: [
      'Mọi số đo ghi kèm cấu hình máy và lệnh đã chạy.',
      'Đặt tên biến theo ngôn ngữ bài toán, không dùng một chữ cái cho mọi thứ.',
      'Mỗi nhánh logic phức tạp có ít nhất một kiểm thử ca biên.',
    ],
  },
}

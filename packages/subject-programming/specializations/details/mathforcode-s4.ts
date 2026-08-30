// details/mathforcode-s4.ts — Chi tiết chặng S4 hướng TOÁN HỌC CHO LẬP TRÌNH
// ("Giải tích và tối ưu cho AI/ML"). Bản đồ chặng ở ../mathforcode.ts.
//
// Đặc thù S4: mô hình học máy có thể "chạy được" mà vẫn sai — mất mát vẫn giảm dù gradient cài
// nhầm. Vì vậy rubric ở đây bắt kiểm gradient bằng sai phân hữu hạn, thứ duy nhất bắt được lỗi đó.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MATHFORCODE_S4_DETAIL: SpecStageDetail = {
  stageId: 'mathforcode-s4',
  modules: [
    {
      moduleId: 'mathforcode-s4-m1',
      objective:
        'Cài gradient descent từ số 0 và đọc được đồ thị hội tụ để biết nên tăng hay giảm tốc độ học.',
      practice: [
        'Cài gradient descent cho hàm một biến, vẽ quỹ đạo điểm hiện tại trên đồ thị hàm số.',
        'Chạy cùng bài toán với ba tốc độ học khác nhau và đặt ba đường mất mát lên cùng một hình.',
        'Tính đạo hàm bằng sai phân hữu hạn rồi so với đạo hàm suy ra bằng tay tại nhiều điểm.',
      ],
      selfCheck: [
        {
          q: 'Gradient chỉ về hướng nào và ta đi theo hướng nào?',
          a: 'Gradient chỉ hướng tăng nhanh nhất, nên muốn giảm mất mát thì đi ngược lại hướng đó.',
        },
        {
          q: 'Tốc độ học quá lớn thì đồ thị mất mát trông thế nào?',
          a: 'Nó dao động mạnh hoặc tăng vọt lên rồi tràn số, thay vì giảm dần đều.',
        },
        {
          q: 'Sai phân hữu hạn dùng để làm gì khi cài gradient?',
          a: 'Dùng làm thước đo độc lập để kiểm đạo hàm tính tay có đúng không, vì hai cách phải cho gần cùng giá trị.',
        },
      ],
      doneSignals: [
        'Nhìn đồ thị mất mát bạn nói được nên chỉnh tốc độ học theo hướng nào.',
        'Bạn luôn kiểm gradient bằng sai phân trước khi tin vào kết quả huấn luyện.',
      ],
    },
    {
      moduleId: 'mathforcode-s4-m2',
      objective:
        'Chọn được hàm mất mát phù hợp với dữ liệu và nhận ra khi nào quá trình học kẹt ở cực tiểu địa phương.',
      practice: [
        'Huấn luyện cùng dữ liệu có ngoại lai bằng sai số bình phương và sai số tuyệt đối, so hai đường khớp.',
        'Chạy gradient descent từ nhiều điểm khởi đầu trên một hàm không lồi và ghi lại các nghiệm khác nhau.',
        'Giải hồi quy tuyến tính bằng công thức đóng rồi bằng lặp, so hệ số hai cách.',
      ],
      selfCheck: [
        {
          q: 'Vì sao sai số bình phương nhạy với giá trị ngoại lai hơn sai số tuyệt đối?',
          a: 'Vì sai lệch bị bình phương nên một điểm lệch xa đóng góp phần lỗi rất lớn, kéo cả mô hình về phía nó.',
        },
        {
          q: 'Hàm lồi có lợi thế gì cho việc tối ưu?',
          a: 'Nó chỉ có một cực tiểu, nên tìm được cực tiểu địa phương nào cũng chính là nghiệm tốt nhất.',
        },
        {
          q: 'Dấu hiệu nào cho thấy quá trình học đang kẹt ở cao nguyên phẳng?',
          a: 'Mất mát gần như đứng yên qua nhiều vòng dù gradient chưa về 0, và đổi điểm khởi đầu lại thoát ra được.',
        },
      ],
      doneSignals: [
        'Bạn giải thích được lựa chọn hàm mất mát bằng đặc điểm dữ liệu chứ không theo thói quen.',
        'Kết quả bản lặp của bạn trùng nghiệm công thức đóng trong ngưỡng sai số đã đặt.',
      ],
    },
    {
      moduleId: 'mathforcode-s4-m3',
      objective:
        'Lần được phần lỗi ngược về từng tham số bằng quy tắc chuỗi và tự kiểm lại phép lan truyền đó bằng số.',
      practice: [
        'Vẽ tay sơ đồ tính của một mạng một tầng ẩn rồi viết đạo hàm riêng theo từng trọng số.',
        'Cài lan truyền ngược cho mạng đó bằng Python thuần, không dùng thư viện tự động vi phân.',
        'Kiểm mọi gradient bằng sai phân hữu hạn và ghi lại sai lệch tương đối lớn nhất.',
      ],
      selfCheck: [
        {
          q: 'Quy tắc chuỗi nói gì khi hàm được ghép nhiều tầng?',
          a: 'Đạo hàm của hàm ghép bằng tích các đạo hàm từng tầng, nên lỗi được nhân dồn ngược từ đầu ra về đầu vào.',
        },
        {
          q: 'Vì sao mất mát giảm chưa chứng minh gradient cài đúng?',
          a: 'Gradient sai hướng một chút vẫn có thể làm mất mát giảm chậm, nên phải kiểm bằng sai phân mới chắc.',
        },
        {
          q: 'Sai lệch tương đối bao nhiêu thì coi là gradient đúng?',
          a: 'Thường dưới một phần triệu; lớn hơn đáng kể là dấu hiệu công thức hoặc cài đặt có lỗi.',
        },
      ],
      doneSignals: [
        'Bạn viết được đạo hàm riêng theo từng trọng số mà không cần tra công thức có sẵn.',
        'Bảng kiểm gradient của bạn cho sai lệch tương đối dưới ngưỡng ở mọi tham số.',
      ],
    },
    {
      moduleId: 'mathforcode-s4-m4',
      objective:
        'Chuyển một bài toán kinh doanh thành hàm mục tiêu có ràng buộc rồi tối ưu nó bằng công cụ đã tự cài.',
      practice: [
        'Ước lượng đường cầu từ dữ liệu bán hàng rồi tìm mức giá tối đa hoá doanh thu.',
        'Mô hình hoá một bài xếp lịch thành hàm phạt và cải thiện lời giải bằng tìm kiếm cục bộ.',
        'Ghi lại chi phí tính toán từng vòng và xác định điểm nên dừng vì lợi ích thêm quá nhỏ.',
      ],
      selfCheck: [
        {
          q: 'Ràng buộc trong bài toán thực tế thường được xử lý thế nào khi tối ưu bằng lặp?',
          a: 'Đưa vào hàm mục tiêu dưới dạng khoản phạt, hoặc chiếu nghiệm về lại miền hợp lệ sau mỗi bước.',
        },
        {
          q: 'Khi nào nên dừng tối ưu dù còn cải thiện được?',
          a: 'Khi phần cải thiện thêm nhỏ hơn chi phí tính toán và rủi ro của việc thay đổi hệ thống.',
        },
        {
          q: 'Vì sao tối ưu doanh thu không đơn giản là tăng giá?',
          a: 'Vì lượng bán giảm theo giá, doanh thu là tích của hai đại lượng ngược chiều nên có điểm cực đại ở giữa.',
        },
      ],
      doneSignals: [
        'Bạn viết được hàm mục tiêu và ràng buộc trước khi nghĩ tới thuật toán tối ưu.',
        'Bạn nêu được điểm dừng bằng con số chứ không dừng vì hết kiên nhẫn.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mathforcode-s4-r1',
      text: 'Gradient tính tay khớp gradient tính bằng sai phân hữu hạn với sai lệch tương đối dưới một phần triệu.',
      howToProve:
        'Chạy script kiểm gradient trên toàn bộ tham số và dán sai lệch tương đối lớn nhất đo được.',
    },
    {
      id: 'mathforcode-s4-r2',
      text: 'Hệ số hồi quy tuyến tính từ vòng lặp trùng nghiệm công thức đóng với sai lệch dưới một phần triệu.',
      howToProve: 'Dán bảng hệ số hai cách đặt cạnh nhau kèm sai lệch từng hệ số.',
    },
    {
      id: 'mathforcode-s4-r3',
      text: 'Đồ thị mất mát giảm đơn điệu ở tốc độ học đã chọn, kèm một lần chạy phân kỳ để đối chứng.',
      howToProve: 'Dán hai đồ thị mất mát cùng ba giá trị tốc độ học đã dùng cho mỗi lần chạy.',
    },
    {
      id: 'mathforcode-s4-r4',
      text: 'Mạng một tầng ẩn tự cài đạt độ chính xác đã công bố trên tập kiểm tra tách riêng, hạt giống cố định.',
      howToProve:
        'Chạy lại huấn luyện với hạt giống trong báo cáo và dán độ chính xác trên tập kiểm tra.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Cài gradient descent, hồi quy tuyến tính và mạng một tầng ẩn hoàn toàn bằng Python thuần.',
      'Cài bộ kiểm gradient bằng sai phân hữu hạn chạy được trên mọi tham số.',
      'Vẽ đồ thị mất mát và báo cáo độ chính xác trên tập kiểm tra tách riêng.',
    ],
    scopeDont: [
      'KHÔNG dùng thư viện tự động vi phân, vì mục tiêu chặng là hiểu lan truyền ngược chứ không phải dùng nó.',
      'KHÔNG chạm vào dữ liệu kiểm tra trong lúc chỉnh tham số, làm vậy thì con số cuối mất ý nghĩa.',
      'KHÔNG mở rộng thành mạng nhiều tầng, một tầng ẩn đã đủ để lộ hết cơ chế cần hiểu.',
    ],
    touchpoints: [
      'Mô-đun mô hình: hàm dự đoán, hàm mất mát và hàm gradient viết tách riêng nhau.',
      'Mô-đun huấn luyện: vòng lặp cập nhật tham số, nhận tốc độ học và hạt giống làm tham số.',
      'Mô-đun kiểm gradient: so gradient giải tích với sai phân hữu hạn trên mọi tham số.',
    ],
    contracts: [
      'Hàm gradient nhận cùng bộ tham số với hàm mất mát và trả về vector cùng số chiều với tham số.',
      'Tập huấn luyện và tập kiểm tra tách bằng hạt giống cố định, không trộn lại giữa các lần chạy.',
      'Mọi ngưỡng sai số dùng để nghiệm thu ghi thành hằng số có tên, không rải số ma thuật trong code.',
    ],
    acceptance: [
      'Đủ bốn tiêu chí rubric, mỗi tiêu chí kèm số đo hoặc đồ thị từ lần chạy thật.',
      'Người khác chạy lại toàn bộ bằng một lệnh với hạt giống công bố và ra cùng kết quả.',
    ],
    invariants: [
      'Không dòng nào trong nhân tính toán gọi thư viện tự động vi phân hay mô hình dựng sẵn.',
      'Tập kiểm tra không bao giờ tham gia vào bước cập nhật tham số.',
      'Cùng hạt giống và cùng siêu tham số luôn cho lại đúng đường mất mát cũ.',
    ],
    conventions: [
      'Mỗi công thức đạo hàm có comment tiếng Việt nói rõ nó suy ra từ bước nào của quy tắc chuỗi.',
      'Báo cáo luôn ghi kèm siêu tham số và hạt giống đã dùng cho từng con số công bố.',
      'Commit theo conventional commits, tách riêng commit mô hình, commit huấn luyện và commit báo cáo.',
    ],
  },
}

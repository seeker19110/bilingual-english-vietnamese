// details/data-s4.ts — Chi tiết chặng S4 hướng DỮ LIỆU ("Chuyên gia — nền tảng dữ liệu").
// Bản đồ chặng ở ../data.ts.
//
// Điểm xoay của chặng: người làm dữ liệu ở mức chuyên gia chịu trách nhiệm về ĐỘ TIN CẬY CỦA
// CON SỐ mà cả tổ chức dùng để ra quyết định — nên rubric bám vào SLO dữ liệu và định nghĩa
// chỉ số dùng chung, không bám vào số đường ống đã dựng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DATA_S4_DETAIL: SpecStageDetail = {
  stageId: 'data-s4',
  modules: [
    {
      moduleId: 'data-s4-m1',
      objective:
        'Thiết kế nền tảng dữ liệu để người không biết code tự trả lời được câu hỏi của họ mà không cần hỏi đội kỹ thuật.',
      practice: [
        'Lập danh mục cho mọi bảng phục vụ: mô tả, chủ sở hữu, nguồn gốc và mức nhạy cảm.',
        'Dựng một lớp bảng đã dọn sẵn cho người dùng nghiệp vụ tự truy vấn, đo xem họ tự làm được bao nhiêu phần trăm câu hỏi.',
        'Thử khôi phục một bảng lớn từ bản sao lưu và bấm giờ toàn bộ quá trình.',
      ],
      selfCheck: [
        {
          q: 'Bảng không có chủ sở hữu gây ra vấn đề gì về lâu dài?',
          a: 'Không ai chịu trách nhiệm khi số sai hay lược đồ đổi, và cũng không ai dám xoá khi nó đã chết.',
        },
        {
          q: 'Định dạng bảng mở giải quyết được điều gì cho kho dữ liệu?',
          a: 'Cho nhiều công cụ đọc cùng một dữ liệu và cho phép sửa, xoá theo dòng mà không chép lại toàn bộ.',
        },
      ],
      doneSignals: [
        'Người nghiệp vụ tự lấy được số họ cần cho câu hỏi thường gặp mà không mở phiếu yêu cầu.',
        'Mọi bảng phục vụ đều tra được chủ sở hữu và nguồn gốc trong danh mục.',
      ],
    },
    {
      moduleId: 'data-s4-m2',
      objective:
        'Cam kết được độ tin cậy của dữ liệu bằng SLO đo được và phát hiện bất thường trước khi người dùng phát hiện.',
      practice: [
        'Công bố SLO cho ba bảng quan trọng nhất: độ tươi, độ đầy đủ và độ chính xác, mỗi thứ một ngưỡng số.',
        'Cài kiểm tra tự động chạy sau mỗi lần nạp, cố ý nạp thiếu một phần dữ liệu để xác nhận cảnh báo kêu.',
        'Viết post-mortem cho một lần số liệu sai, truy ngược tới bước nào trong đường ống gây ra.',
      ],
      selfCheck: [
        {
          q: 'Độ tươi của dữ liệu nghĩa là gì và đo bằng cách nào?',
          a: 'Là khoảng cách từ sự kiện thật tới lúc nó xuất hiện trong bảng, đo bằng hiệu hai mốc thời gian.',
        },
        {
          q: 'Vì sao dữ liệu sai nguy hiểm hơn dữ liệu thiếu?',
          a: 'Thiếu thì người ta biết mà chờ, còn sai thì người ta tin và ra quyết định dựa trên nó.',
        },
        {
          q: 'Kiểm tra chất lượng nên chạy ở đâu trong đường ống?',
          a: 'Ngay sau mỗi bước nạp và trước khi dữ liệu được công bố cho người dùng cuối.',
        },
      ],
      doneSignals: [
        'Bạn biết dữ liệu sai trước khi người dùng nghiệp vụ gọi điện hỏi.',
        'Mỗi bảng quan trọng có ngưỡng độ tươi công bố và số đo thực tế đối chiếu.',
      ],
    },
    {
      moduleId: 'data-s4-m3',
      objective:
        'Dựng tầng chỉ số dùng chung để một khái niệm nghiệp vụ chỉ có đúng một định nghĩa trong toàn tổ chức.',
      practice: [
        'Chọn một chỉ số đang bị hiểu khác nhau giữa hai phòng ban và viết định nghĩa duy nhất có phiên bản.',
        'Chuyển ít nhất hai báo cáo sang dùng định nghĩa chung, đối chiếu số cũ và số mới rồi giải thích chênh lệch.',
        'Ghi quy trình đổi định nghĩa: ai duyệt, báo trước bao lâu, báo cáo cũ xử lý thế nào.',
      ],
      selfCheck: [
        {
          q: 'Vì sao hai phòng ban ra hai con số khác nhau cho cùng một chỉ số?',
          a: 'Vì mỗi bên tự định nghĩa bộ lọc và mốc thời gian riêng, không có định nghĩa dùng chung nào chặn việc đó.',
        },
        {
          q: 'Định nghĩa chỉ số cần có phiên bản để làm gì?',
          a: 'Để so số cũ với số mới biết được chênh lệch đến từ đổi định nghĩa hay từ thay đổi thật của nghiệp vụ.',
        },
      ],
      doneSignals: [
        'Cuộc họp không còn dừng lại để tranh cãi con số của ai đúng.',
        'Mỗi chỉ số quan trọng tra ra được định nghĩa, phiên bản và người sở hữu.',
      ],
    },
    {
      moduleId: 'data-s4-m4',
      objective:
        'Xử lý dữ liệu cá nhân đúng pháp luật và nhận ra thiên lệch trong dữ liệu trước khi nó thành quyết định bất công.',
      practice: [
        'Phân loại dữ liệu cá nhân trong hệ thống và đặt thời hạn lưu cho từng loại, kèm cách xoá khi hết hạn.',
        'Kiểm một tập dữ liệu huấn luyện hoặc báo cáo xem nhóm nào bị thiếu đại diện và hậu quả nếu dùng nguyên trạng.',
        'Viết một đoạn ghi rõ giới hạn của số liệu để kèm theo mỗi báo cáo quan trọng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải đặt thời hạn lưu cho dữ liệu cá nhân?',
          a: 'Giữ lâu hơn mục đích thu thập là rủi ro pháp lý và làm tăng thiệt hại khi có rò rỉ.',
        },
        {
          q: 'Thiên lệch dữ liệu dẫn tới bất công như thế nào?',
          a: 'Nhóm ít xuất hiện trong dữ liệu sẽ bị mô hình hoặc báo cáo phục vụ tệ hơn mà không ai thấy trong số tổng.',
        },
      ],
      doneSignals: [
        'Mỗi báo cáo quan trọng đi kèm một đoạn nói rõ số này không dùng được cho việc gì.',
        'Dữ liệu cá nhân hết hạn được xoá tự động, không phụ thuộc ai nhớ.',
      ],
    },
  ],
  rubric: [
    {
      id: 'data-s4-r1',
      text: 'Danh mục dữ liệu phủ 100% bảng phục vụ, mỗi bảng có mô tả, chủ sở hữu và mức nhạy cảm.',
      howToProve: 'Chạy truy vấn đếm bảng phục vụ chưa có chủ sở hữu và cho ra kết quả bằng không.',
    },
    {
      id: 'data-s4-r2',
      text: 'Công bố SLO độ tươi cho các bảng quan trọng và có số đo thực tế đối chiếu trong ít nhất bốn tuần.',
      howToProve: 'Dán biểu đồ độ tươi theo ngày kèm ngưỡng đã công bố và số lần vi phạm.',
    },
    {
      id: 'data-s4-r3',
      text: 'Kiểm soát quyền theo vai trò cho mọi bảng chứa dữ liệu cá nhân, kèm nhật ký truy cập tra lại được.',
      howToProve:
        'Thử truy cập bằng một vai trò không đủ quyền và dán cả kết quả bị chặn lẫn dòng nhật ký.',
    },
    {
      id: 'data-s4-r4',
      text: 'Có tầng chỉ số dùng chung, ít nhất ba chỉ số quan trọng chỉ tồn tại một định nghĩa có phiên bản.',
      howToProve: 'Chỉ ra mã nguồn định nghĩa chỉ số và các báo cáo đang tham chiếu tới nó.',
    },
    {
      id: 'data-s4-r5',
      text: 'Có ít nhất một post-mortem cho sự cố số liệu sai, truy được nguyên nhân tới bước cụ thể trong đường ống.',
      howToProve: 'Dán tài liệu post-mortem kèm hành động sửa và trạng thái hoàn thành.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Xây nền tảng dữ liệu tự phục vụ cho người dùng nghiệp vụ.',
      'Cam kết và đo độ tin cậy dữ liệu bằng SLO có ngưỡng số.',
      'Dựng tầng chỉ số dùng chung có phiên bản và người sở hữu.',
    ],
    scopeDont: [
      'Không chuyển toàn bộ kho dữ liệu sang công nghệ mới trong cùng đợt, vì rủi ro lớn hơn lợi ích học được.',
      'Không mở quyền rộng cho nhanh rồi siết sau — siết sau gần như không bao giờ xảy ra.',
      'Không tự xây công cụ trực quan hoá riêng, dùng công cụ có sẵn để tập trung vào chất lượng dữ liệu.',
    ],
    touchpoints: [
      'Các đường ống nạp dữ liệu và nơi đặt kiểm tra chất lượng.',
      'Danh mục dữ liệu và nơi khai chủ sở hữu.',
      'Tầng định nghĩa chỉ số dùng chung.',
    ],
    contracts: [
      'Mỗi bảng phục vụ có lược đồ khai báo rõ, đổi lược đồ phải báo trước cho bên dùng.',
      'Đường ống chạy lại được với cùng đầu vào và cho cùng kết quả.',
      'Dữ liệu cá nhân chỉ ra khỏi vùng an toàn khi đã khử định danh.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí chứng minh bằng truy vấn hoặc số đo.',
      'Người dùng nghiệp vụ tự trả lời được các câu hỏi thường gặp mà không cần đội kỹ thuật.',
    ],
    invariants: [
      'Không báo cáo nào công bố số mà không truy được nguồn gốc.',
      'Dữ liệu cá nhân không bao giờ nằm trong bảng mà mọi người đọc được.',
    ],
    conventions: [
      'Mọi định nghĩa chỉ số nằm trong mã nguồn có phiên bản, không nằm trong từng báo cáo.',
      'Đặt tên bảng và cột theo quy ước thống nhất, không viết tắt tuỳ hứng.',
    ],
  },
}

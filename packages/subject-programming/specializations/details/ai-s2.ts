// details/ai-s2.ts — Chi tiết chặng S2 hướng AI & HỌC MÁY ("Học máy cổ điển").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const AI_S2_DETAIL: SpecStageDetail = {
  stageId: 'ai-s2',
  modules: [
    {
      moduleId: 'ai-s2-m1',
      objective:
        'Chia được dữ liệu thành tập huấn luyện, kiểm định và kiểm tra sao cho con số đo được không tự lừa mình.',
      practice: [
        'Tìm và chỉ ra ít nhất một trường bị rò rỉ thông tin tương lai trong bộ dữ liệu của bạn.',
        'Chia dữ liệu theo thời gian rồi so kết quả với cách chia ngẫu nhiên, ghi lại chênh lệch.',
        'Dựng mô hình cơ sở ngây thơ trước khi thử bất cứ mô hình phức tạp nào.',
      ],
      selfCheck: [
        {
          q: 'Rò rỉ dữ liệu là gì và vì sao nó nguy hiểm?',
          a: 'Là dùng thông tin mà lúc dự đoán thật chưa có; nó cho điểm rất đẹp lúc thử nhưng sập hoàn toàn khi chạy thật.',
        },
        {
          q: 'Vì sao luôn cần mô hình cơ sở?',
          a: 'Không có mốc so sánh thì không biết mô hình phức tạp có đáng công sức hay chỉ đang đoán bằng trung bình.',
        },
      ],
      doneSignals: [
        'Giải thích được vì sao chia dữ liệu theo cách đó chứ không phải cách khác.',
        'Điểm trên tập kiểm tra không chênh lệch bất thường so với tập kiểm định.',
      ],
    },
    {
      moduleId: 'ai-s2-m2',
      objective:
        'Xây được đặc trưng có ý nghĩa nghiệp vụ và huấn luyện mô hình cây tăng cường thắng rõ mô hình cơ sở.',
      practice: [
        'Tạo mười đặc trưng từ hiểu biết nghiệp vụ và đo mức đóng góp của từng cái.',
        'Tinh chỉnh siêu tham số bằng tìm kiếm có kiểm định chéo, ghi lại bộ tham số tốt nhất.',
        'So sánh mô hình tuyến tính, cây đơn và cây tăng cường trên cùng một cách chia dữ liệu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cây tăng cường thường thắng trên dữ liệu bảng?',
          a: 'Nó bắt được tương tác phi tuyến giữa cột mà không cần chuẩn hoá, hợp với dữ liệu bảng lẫn lộn kiểu.',
        },
        {
          q: 'Tinh chỉnh siêu tham số trên tập kiểm tra thì sao?',
          a: 'Tập kiểm tra hết vai trò trung lập, điểm báo cáo sẽ lạc quan giả tạo.',
        },
      ],
      doneSignals: [
        'Có bảng so sánh ít nhất ba mô hình trên cùng chỉ số.',
        'Bỏ một đặc trưng là biết ngay ảnh hưởng bao nhiêu.',
      ],
    },
    {
      moduleId: 'ai-s2-m3',
      objective:
        'Chọn được chỉ số đánh giá theo hậu quả của sai lầm chứ không theo thói quen, và đặt ngưỡng quyết định có lý do.',
      practice: [
        'Viết ra hậu quả thực tế của sai dương và sai âm trong bài toán của bạn, quy ra tiền hoặc thời gian.',
        'Vẽ ma trận nhầm lẫn ở ba ngưỡng khác nhau và chọn ngưỡng theo hậu quả đã viết.',
        'Chạy kiểm định chéo theo thời gian cho dữ liệu chuỗi, so với kiểm định chéo thường.',
      ],
      selfCheck: [
        {
          q: 'Vì sao độ chính xác tổng thể có thể là chỉ số tệ?',
          a: 'Với dữ liệu mất cân bằng, đoán luôn lớp đa số đã cho điểm rất cao mà mô hình chẳng học được gì.',
        },
        {
          q: 'Ngưỡng quyết định nên do ai chọn?',
          a: 'Do người hiểu hậu quả nghiệp vụ chọn; mặc định 0,5 chỉ là con số cho sẵn, không có ý nghĩa nghiệp vụ.',
        },
      ],
      doneSignals: [
        'Nói được một câu vì sao dùng chỉ số này mà không dùng chỉ số kia.',
        'Ngưỡng quyết định gắn với một con số hậu quả cụ thể.',
      ],
    },
    {
      moduleId: 'ai-s2-m4',
      objective:
        'Giải thích được mô hình dự đoán dựa vào đâu và kiểm tra được nó không đối xử lệch giữa các nhóm.',
      practice: [
        'Tính mức đóng góp của từng đặc trưng cho ba dự đoán cụ thể và diễn giải bằng tiếng Việt.',
        'So sánh sai số giữa các nhóm người dùng, ghi lại nhóm nào bị thiệt.',
        'Thử thay mô hình phức tạp bằng mô hình đơn giản và xem mất bao nhiêu điểm.',
      ],
      selfCheck: [
        {
          q: 'Vì sao đôi khi nên chọn mô hình đơn giản hơn dù điểm thấp hơn chút?',
          a: 'Vì giải thích được, gỡ lỗi được và chạy rẻ hơn — những thứ đó có giá trị thật khi vận hành.',
        },
        {
          q: 'Mô hình học từ dữ liệu quá khứ có thiên lệch thì sao?',
          a: 'Nó sẽ lặp lại và khuếch đại thiên lệch đó, nên phải đo sai số theo từng nhóm chứ không chỉ nhìn tổng.',
        },
      ],
      doneSignals: [
        'Trình bày được cho người không kỹ thuật vì sao mô hình dự đoán như vậy.',
        'Có bảng sai số theo nhóm, không chỉ một con số tổng.',
      ],
    },
  ],
  rubric: [
    {
      id: 'ai-s2-r1',
      text: 'Mô hình thắng mô hình cơ sở ngây thơ ở chỉ số đã chọn, chênh lệch nêu rõ bằng số.',
      howToProve: 'Bảng so sánh cơ sở và mô hình trên cùng tập kiểm tra, kèm mã chạy lại được.',
    },
    {
      id: 'ai-s2-r2',
      text: 'Đánh giá theo thời gian, không xáo trộn ngẫu nhiên với dữ liệu có yếu tố thời gian.',
      howToProve: 'Chỉ ra đoạn mã chia dữ liệu theo mốc thời gian và mốc đó nằm ở đâu.',
    },
    {
      id: 'ai-s2-r3',
      text: 'Không có rò rỉ dữ liệu: mọi đặc trưng đều có sẵn tại thời điểm dự đoán thật.',
      howToProve:
        'Bảng liệt kê từng đặc trưng kèm thời điểm sẵn có, và một lần rà soát tìm rò rỉ đã ghi lại.',
    },
    {
      id: 'ai-s2-r4',
      text: 'Toàn bộ quy trình chạy lại được từ dữ liệu thô tới kết quả bằng một lệnh.',
      howToProve:
        'Chạy lệnh trên máy sạch, hai lần chạy cho cùng chỉ số với cùng hạt giống ngẫu nhiên.',
    },
    {
      id: 'ai-s2-r5',
      text: 'Có phần giải thích mô hình và bảng sai số theo nhóm.',
      howToProve:
        'Biểu đồ đóng góp đặc trưng cho ba ca cụ thể và bảng sai số chia theo ít nhất hai nhóm.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Một mô hình dự đoán phục vụ nhu cầu thật của dự án cửa hàng, ví dụ nhu cầu món theo ngày.',
      'Quy trình chạy lại được: từ dữ liệu thô, qua đặc trưng, tới đánh giá.',
      'Báo cáo đánh giá kèm giải thích và giới hạn của mô hình.',
    ],
    scopeDont: [
      'KHÔNG huấn luyện mạng nơ-ron sâu — dữ liệu bảng quy mô nhỏ không cần và sẽ thua cây tăng cường.',
      'KHÔNG đưa mô hình lên phục vụ trực tuyến ở chặng này.',
      'KHÔNG thu thập thêm dữ liệu cá nhân chỉ để tăng điểm.',
    ],
    touchpoints: [
      'Thư mục dữ liệu: bản thô chỉ đọc, bản đã xử lý sinh ra bằng mã.',
      'Mã tạo đặc trưng tách riêng khỏi mã huấn luyện để dùng lại được khi dự đoán.',
      'Sổ tay thí nghiệm ghi mỗi lần chạy: tham số, chỉ số, ngày.',
    ],
    contracts: [
      'Hàm tạo đặc trưng nhận dữ liệu thô và mốc thời gian, không được nhìn dữ liệu sau mốc đó.',
      'Kết quả dự đoán kèm mức tin cậy và phiên bản mô hình đã dùng.',
      'Hạt giống ngẫu nhiên khai báo rõ để chạy lại cho cùng kết quả.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có sổ tay thí nghiệm kèm theo.',
      'Người khác chạy lại được quy trình trên máy họ và ra cùng chỉ số.',
    ],
    invariants: [
      'Không đặc trưng nào dùng thông tin của tương lai so với thời điểm dự đoán.',
      'Tập kiểm tra chỉ được dùng đúng một lần ở cuối, không dùng để tinh chỉnh.',
      'Dữ liệu thô không bị sửa tại chỗ.',
    ],
    conventions: [
      'Mọi con số trong báo cáo phải chỉ ra được lệnh sinh ra nó.',
      'Không khoe điểm mà không kèm mô hình cơ sở để so.',
      'Bí mật kết nối dữ liệu lấy từ biến môi trường.',
    ],
  },
}

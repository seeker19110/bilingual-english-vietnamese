// details/security-s3.ts — Chi tiết chặng S3 hướng BẢO MẬT ("Bảo mật tấn công chuyên sâu").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SECURITY_S3_DETAIL: SpecStageDetail = {
  stageId: 'security-s3',
  modules: [
    {
      moduleId: 'security-s3-m1',
      objective:
        'Đọc được mã máy của một nhị phân nhỏ và dựng lại luồng điều khiển của nó trong môi trường cách ly.',
      practice: [
        'Dịch ngược một nhị phân nhỏ trong máy ảo cách ly và vẽ lại luồng điều khiển của hàm chính.',
        'Đối chiếu sơ đồ đã vẽ với mã nguồn gốc để tự chấm mình đọc đúng tới đâu.',
        'Phân tích một mẫu mã độc trong phòng lab đóng, không nối mạng ngoài.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phân tích mã độc phải làm trong môi trường cách ly?',
          a: 'Mẫu có thể lây sang máy thật hoặc gọi ra ngoài, làm lộ chính bạn và mạng của bạn.',
        },
        {
          q: 'Nhận ra vòng lặp trong mã máy bằng dấu hiệu nào?',
          a: 'Một lệnh nhảy ngược về địa chỉ trước đó kèm điều kiện so sánh ở cuối khối.',
        },
      ],
      doneSignals: [
        'Bạn dựng lại được cấu trúc chương trình mà không cần mã nguồn.',
        'Mọi thao tác phân tích của bạn đều nằm trong môi trường cách ly.',
      ],
    },
    {
      moduleId: 'security-s3-m2',
      objective:
        'Hiểu và tái hiện được các lớp lỗi bộ nhớ trong bài lab, và giải thích vì sao biện pháp gốc rễ là ngôn ngữ an toàn bộ nhớ.',
      practice: [
        'Tái hiện một lỗi bộ nhớ kinh điển trong bài lab và xác định chính xác dòng gây lỗi.',
        'Viết lại đúng chương trình đó bằng ngôn ngữ an toàn bộ nhớ rồi thử lại cùng đầu vào.',
        'Ghi lại các biện pháp phòng thủ của hệ điều hành gặp phải và vai trò của từng biện pháp.',
      ],
      selfCheck: [
        {
          q: 'Vì sao vá từng lỗi tràn bộ nhớ không phải giải pháp gốc rễ?',
          a: 'Cùng lớp lỗi sẽ quay lại ở chỗ khác; chỉ đổi cách quản lý bộ nhớ mới chặn được cả lớp.',
        },
        {
          q: 'Dùng lại vùng nhớ đã giải phóng nguy hiểm ở chỗ nào?',
          a: 'Vùng đó có thể đã được cấp cho dữ liệu khác, nên đọc ghi vào đấy làm hỏng trạng thái chương trình.',
        },
      ],
      doneSignals: [
        'Bạn nói được lớp lỗi, không chỉ nói được một ca lỗi cụ thể.',
        'Bạn đề xuất biện pháp gốc rễ trước khi đề xuất bản vá tại chỗ.',
      ],
    },
    {
      moduleId: 'security-s3-m3',
      objective:
        'Tìm được lỗi bằng công cụ tự động và thu ca lỗi về mức nhỏ nhất để bên bảo trì tái hiện được ngay.',
      practice: [
        'Chạy fuzzer theo độ phủ trên một thư viện mã nguồn mở trong ít nhất 24 giờ.',
        'Tối giản ca lỗi tìm được xuống mức nhỏ nhất mà vẫn tái hiện.',
        'Viết một luật phân tích tĩnh bắt đúng lớp lỗi vừa tìm được.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải theo dõi độ phủ khi chạy fuzzer?',
          a: 'Không có độ phủ thì fuzzer có thể quét đi quét lại một nhánh suốt nhiều giờ mà không tiến thêm.',
        },
        {
          q: 'Ca lỗi tối giản giúp gì cho bên nhận báo cáo?',
          a: 'Họ tái hiện trong vài giây và biết ngay phần mã nào có lỗi, nên vá nhanh hơn nhiều.',
        },
      ],
      doneSignals: [
        'Bạn nộp ca lỗi nhỏ gọn kèm hướng dẫn dựng lại môi trường.',
        'Bạn viết được luật canh để lớp lỗi đó không quay lại.',
      ],
    },
    {
      moduleId: 'security-s3-m4',
      objective:
        'Đánh giá được rủi ro chuỗi cung ứng, cấu hình đám mây và các lớp tấn công mới nhắm vào tính năng AI.',
      practice: [
        'Rà phụ thuộc của một dự án thật: khoá phiên bản, kiểm nguồn gốc và chữ ký khi có.',
        'Rà quyền trên đám mây theo nguyên tắc tối thiểu và tìm quyền thừa.',
        'Thử một bài tiêm lệnh vào tính năng AI của dự án rồi thiết kế cách chặn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao khoá phiên bản phụ thuộc lại là biện pháp bảo mật?',
          a: 'Không khoá thì một bản mới bị chiếm quyền sẽ tự động vào hệ thống của bạn ở lần cài kế tiếp.',
        },
        {
          q: 'Tiêm lệnh khác tiêm SQL ở điểm nào?',
          a: 'Không có ranh giới cú pháp rõ ràng để thoát chuỗi, nên phải giới hạn quyền và kiểm đầu ra thay vì lọc đầu vào.',
        },
      ],
      doneSignals: [
        'Bạn nêu được rủi ro chuỗi cung ứng cụ thể của dự án mình đang làm.',
        'Tính năng AI của bạn chạy với quyền tối thiểu, không tin đầu vào từ nội dung ngoài.',
      ],
    },
  ],
  rubric: [
    {
      id: 'security-s3-r1',
      text: 'Có ít nhất một lỗi tái hiện được 10 trên 10 lần bằng ca tối giản kèm hướng dẫn dựng môi trường.',
      howToProve: 'Chạy ca tối giản mười lần liên tiếp và dán kết quả từng lần.',
    },
    {
      id: 'security-s3-r2',
      text: 'Báo cáo đi qua đúng kênh công bố có trách nhiệm của dự án trong vòng 72 giờ kể từ khi tái hiện được.',
      howToProve: 'Dán dấu thời gian gửi báo cáo và trích dẫn chính sách công bố của dự án.',
    },
    {
      id: 'security-s3-r3',
      text: 'Kèm ít nhất một bản vá đề xuất hoặc một test hồi quy đỏ trước khi vá và xanh sau khi vá.',
      howToProve: 'Chạy test hồi quy trên hai commit trước và sau bản vá rồi dán kết quả.',
    },
    {
      id: 'security-s3-r4',
      text: 'Toàn bộ mục tiêu thử nằm trong phạm vi được phép, có văn bản hoặc chính sách chứng minh.',
      howToProve: 'Nộp trích dẫn chính sách bug bounty hoặc thư đồng ý của bên chủ quản hệ thống.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tìm lỗi bằng công cụ tự động trên mục tiêu được phép và báo cáo có trách nhiệm.',
      'Đề xuất biện pháp gốc rễ kèm luật canh cho lớp lỗi đã tìm.',
    ],
    scopeDont: [
      'Không thử lên hệ thống chưa được phép, vì đây là ranh giới pháp lý chứ không phải ranh giới kỹ thuật.',
      'Không công bố chi tiết khai thác trước khi bên bảo trì có bản vá.',
    ],
    touchpoints: [
      'Môi trường lab cách ly và cấu hình mạng của nó.',
      'Kho mã của thư viện mục tiêu và nơi đặt bộ fuzzer cùng ca lỗi.',
    ],
    contracts: [
      'Ca lỗi nộp kèm phiên bản chính xác và các bước dựng lại môi trường.',
      'Báo cáo ghi rõ mức ảnh hưởng và điều kiện cần để khai thác được.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric, trong đó tiêu chí phạm vi được phép là bắt buộc tuyệt đối.',
      'Có luật canh hoặc test hồi quy cho lớp lỗi đã tìm.',
    ],
    invariants: [
      'Không bao giờ thử ngoài phạm vi được phép, kể cả khi thấy lỗ hổng rõ ràng.',
      'Không mang mẫu mã độc ra khỏi môi trường cách ly.',
    ],
    conventions: [
      'Mọi thao tác phân tích ghi nhật ký lại để dựng lại được trình tự.',
      'Dữ liệu nhạy cảm gặp phải trong quá trình thử không được lưu lại.',
    ],
  },
}

// details/devops-s4.ts — Chi tiết chặng S4 hướng DEVOPS ("Chuyên gia — kỹ thuật nền tảng").
// Bản đồ chặng ở ../devops.ts.
//
// Chỗ rẽ của chặng: người làm nền tảng ở mức chuyên gia có KHÁCH HÀNG LÀ CÁC ĐỘI KHÁC. Nên
// thước đo không phải "tôi deploy được" mà là "một đội mới lên sản xuất mất bao lâu" — rubric
// vì thế bám vào DORA và vào thời gian từ khuôn mẫu tới sản xuất.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DEVOPS_S4_DETAIL: SpecStageDetail = {
  stageId: 'devops-s4',
  modules: [
    {
      moduleId: 'devops-s4-m1',
      objective:
        'Dựng lối đi lát sẵn để một đội mới đưa dịch vụ lên sản xuất trong một ngày mà không cần hỏi đội nền tảng.',
      practice: [
        'Làm khuôn mẫu dịch vụ có sẵn CI, log, số đo và cảnh báo, rồi tạo thử một dịch vụ mới từ khuôn.',
        'Bấm giờ toàn bộ hành trình từ lúc tạo kho mã tới lúc có URL chạy thật, ghi lại từng chỗ phải chờ người.',
        'Đo bốn chỉ số DORA của một đội thật trước và sau khi dùng nền tảng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lối đi lát sẵn hiệu quả hơn tài liệu hướng dẫn?',
          a: 'Tài liệu bị đọc sai và lạc hậu, còn khuôn mẫu chạy được thì luôn đúng với thực tế hiện tại.',
        },
        {
          q: 'Bốn chỉ số DORA đo cái gì?',
          a: 'Tần suất phát hành, thời gian từ commit tới sản xuất, tỉ lệ thay đổi gây sự cố và thời gian phục hồi.',
        },
        {
          q: 'Nền tảng nội bộ thất bại thường vì lý do gì?',
          a: 'Vì nó bắt buộc dùng mà lại chậm hơn cách cũ, nên các đội tìm đường vòng để né.',
        },
      ],
      doneSignals: [
        'Đội khác tự lên sản xuất mà không mở phiếu nhờ bạn làm hộ.',
        'Bạn nói được thời gian trung bình từ commit tới sản xuất của tổ chức, bằng số.',
      ],
    },
    {
      moduleId: 'devops-s4-m2',
      objective:
        'Bảo vệ chuỗi cung ứng phần mềm: biết bản chạy trên sản xuất được dựng từ mã nào và không ai chèn được vào giữa.',
      practice: [
        'Sinh SBOM cho một dịch vụ và tra xem nó đang phụ thuộc gián tiếp vào những gì.',
        'Ký tạo tác build và bắt bước triển khai từ chối tạo tác không có chữ ký hợp lệ.',
        'Chuyển bí mật về kho tập trung và bật xoay vòng tự động, thử thu hồi một khoá để xem hệ thống xử lý ra sao.',
      ],
      selfCheck: [
        {
          q: 'SBOM giúp gì khi một thư viện phổ biến vừa lộ lỗ hổng?',
          a: 'Trả lời được trong vài phút hệ thống nào đang dùng thư viện đó và ở phiên bản nào.',
        },
        {
          q: 'Vì sao ký tạo tác quan trọng hơn kiểm mã nguồn?',
          a: 'Vì thứ chạy trên sản xuất là tạo tác; mã nguồn sạch mà tạo tác bị thay giữa đường thì vẫn hỏng.',
        },
      ],
      doneSignals: [
        'Không tạo tác nào lên được sản xuất mà thiếu chữ ký và xuất xứ build.',
        'Bạn tra được trong vài phút mọi dịch vụ đang dùng một thư viện cụ thể.',
      ],
    },
    {
      moduleId: 'devops-s4-m3',
      objective:
        'Giữ hệ thống chạy khi một vùng hạ tầng gặp sự cố, và quy được chi phí về từng đội để họ tự quyết đánh đổi.',
      practice: [
        'Diễn tập chuyển vùng: tắt một vùng trong môi trường thử và bấm giờ tới lúc dịch vụ phục hồi.',
        'Gắn nhãn chi phí theo đội và dựng báo cáo chi phí hằng tuần gửi thẳng cho đội đó.',
        'So chi phí và công vận hành giữa tự vận hành và dùng dịch vụ quản lý sẵn cho một thành phần cụ thể.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải quy chi phí về từng đội thay vì gộp một hoá đơn chung?',
          a: 'Chi phí gộp thì không ai thấy phần của mình, nên không ai có động lực và cũng không ai có quyền cắt.',
        },
        {
          q: 'Tự vận hành rẻ hơn dịch vụ quản lý sẵn ở điểm nào và đắt hơn ở điểm nào?',
          a: 'Rẻ hơn ở tiền thuê nhưng đắt hơn ở thời gian con người trực, vá lỗi và chịu trách nhiệm khi hỏng.',
        },
      ],
      doneSignals: [
        'Có ít nhất một lần diễn tập chuyển vùng thành công với thời gian phục hồi đo được.',
        'Mỗi đội biết tháng trước mình tiêu bao nhiêu và vì việc gì.',
      ],
    },
    {
      moduleId: 'devops-s4-m4',
      objective:
        'Xây văn hoá vận hành bền: giảm việc thủ công lặp lại có kế hoạch và biến sự cố thành hành động sửa được theo dõi.',
      practice: [
        'Ghi lại một tuần mọi việc thủ công lặp lại, ước tính giờ tiêu tốn và tự động hoá việc tốn giờ nhất.',
        'Chủ trì một post-mortem không đổ lỗi, mỗi hành động sửa có người nhận và hạn cụ thể.',
        'Chuẩn bị cho một sự kiện tải cao đã biết trước: dự trù dung lượng, kịch bản giảm tải và người trực.',
      ],
      selfCheck: [
        {
          q: 'Việc thủ công lặp lại nguy hiểm ra sao ngoài chuyện tốn giờ?',
          a: 'Nó tăng theo quy mô hệ thống và bào mòn đội trực, khiến sai sót do mệt trở thành nguyên nhân sự cố.',
        },
        {
          q: 'Hành động sửa sau sự cố cần gì để không nằm chết trong tài liệu?',
          a: 'Cần người nhận cụ thể, hạn hoàn thành và một chỗ theo dõi trạng thái như mọi việc khác.',
        },
      ],
      doneSignals: [
        'Tỉ lệ thời gian làm việc thủ công lặp lại giảm theo quý, có số liệu đối chiếu.',
        'Sự cố cùng loại không lặp lại lần thứ ba.',
      ],
    },
  ],
  rubric: [
    {
      id: 'devops-s4-r1',
      text: 'Một dịch vụ mới đi từ khuôn mẫu tới sản xuất trong dưới một ngày làm việc, có bằng chứng bấm giờ.',
      howToProve: 'Ghi lại hành trình tạo một dịch vụ thật kèm mốc thời gian từng bước.',
    },
    {
      id: 'devops-s4-r2',
      text: 'Mọi tạo tác lên sản xuất đều được ký và có SBOM, bước triển khai từ chối tạo tác không hợp lệ.',
      howToProve: 'Thử triển khai một tạo tác không chữ ký và dán log cho thấy bị từ chối.',
    },
    {
      id: 'devops-s4-r3',
      text: 'Báo cáo bốn chỉ số DORA trước và sau khi có nền tảng, ít nhất hai chỉ số cải thiện đo được.',
      howToProve: 'Dán bảng bốn chỉ số hai mốc thời gian kèm nguồn dữ liệu tính ra chúng.',
    },
    {
      id: 'devops-s4-r4',
      text: 'Diễn tập chuyển vùng khi sự cố thành công, đo được thời gian từ lúc mất vùng tới lúc phục hồi.',
      howToProve: 'Dán biên bản diễn tập kèm biểu đồ sẵn sàng trong khoảng thời gian đó.',
    },
    {
      id: 'devops-s4-r5',
      text: 'Bí mật nằm trong kho tập trung có xoay vòng tự động, không còn bí mật nào trong kho mã nguồn.',
      howToProve: 'Chạy công cụ quét bí mật trên toàn bộ lịch sử kho mã và cho ra kết quả sạch.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Xây bộ khuôn mẫu và tự động hoá để đội mới lên sản xuất trong một ngày.',
      'Ký tạo tác, sinh SBOM và tập trung quản lý bí mật.',
      'Đo và công bố bốn chỉ số DORA cùng chi phí theo đội.',
    ],
    scopeDont: [
      'Không bắt các đội chuyển hết sang nền tảng ngay, vì ép dùng một nền tảng chưa đủ tốt sẽ giết niềm tin.',
      'Không tự viết hệ điều phối container riêng, dùng thứ đã có để tập trung vào trải nghiệm lập trình viên.',
      'Không gộp việc đổi hạ tầng đám mây vào cùng đợt, hai rủi ro lớn cộng lại không quản được.',
    ],
    touchpoints: [
      'Khuôn mẫu dịch vụ và đường ống CI dùng chung.',
      'Bước triển khai, nơi kiểm chữ ký và chính sách.',
      'Kho bí mật và cấu hình xoay vòng khoá.',
    ],
    contracts: [
      'Mọi dịch vụ sinh từ khuôn mẫu đều có log, số đo và kiểm tra sức khoẻ theo cùng một chuẩn.',
      'Tạo tác không có chữ ký hợp lệ thì không được triển khai, không có ngoại lệ thủ công.',
      'Chính sách viết thành mã nguồn, đổi chính sách phải qua review như đổi mã.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng chạy lại được.',
      'Ít nhất một đội thật đã dùng nền tảng và xác nhận nhanh hơn cách cũ.',
    ],
    invariants: [
      'Không có đường vòng nào cho phép lên sản xuất mà bỏ qua cổng kiểm.',
      'Không bí mật nào nằm trong mã nguồn hay trong log.',
    ],
    conventions: [
      'Hạ tầng khai báo bằng mã nguồn có phiên bản, không sửa tay trên bảng điều khiển.',
      'Mọi thay đổi hạ tầng quay lui được và có người chịu trách nhiệm rõ.',
    ],
  },
}

// details/desktop-s3.ts — Chi tiết chặng S3 hướng DESKTOP ("Hiệu năng và mở rộng").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DESKTOP_S3_DETAIL: SpecStageDetail = {
  stageId: 'desktop-s3',
  modules: [
    {
      moduleId: 'desktop-s3-m1',
      objective:
        'Xử lý được tệp và tập dữ liệu rất lớn trên máy người dùng mà không nạp hết mọi thứ vào bộ nhớ.',
      practice: [
        'Mở một tệp cỡ một gigabyte bằng cách đọc theo luồng và hiển thị bằng danh sách ảo hoá.',
        'Dựng chỉ mục cục bộ cho tìm kiếm toàn văn và đo thời gian tìm trên tập lớn.',
        'Đo mức chiếm bộ nhớ khi cuộn hết danh sách một triệu dòng.',
      ],
      selfCheck: [
        {
          q: 'Danh sách ảo hoá tiết kiệm ở chỗ nào?',
          a: 'Chỉ dựng thành phần cho phần đang nhìn thấy, nên số phần tử trong bộ nhớ không tăng theo dữ liệu.',
        },
        {
          q: 'Vì sao đọc theo luồng lại quan trọng với tệp lớn?',
          a: 'Nạp trọn tệp vào bộ nhớ sẽ hết RAM trên máy phổ thông và làm treo cả ứng dụng.',
        },
      ],
      doneSignals: [
        'Bạn nói được ứng dụng chiếm bao nhiêu bộ nhớ với tệp lớn nhất mình hỗ trợ.',
        'Mở tệp lớn không còn làm đóng băng giao diện.',
      ],
    },
    {
      moduleId: 'desktop-s3-m2',
      objective:
        'Rút ngắn được thời gian mở ứng dụng và giảm mức chiếm bộ nhớ bằng tải lười và phần lõi viết bằng ngôn ngữ biên dịch.',
      practice: [
        'Đo thời gian mở ứng dụng mười lần rồi tải lười các phần không cần ngay lúc khởi động.',
        'Chuyển một phần lõi tính toán nặng sang ngôn ngữ biên dịch và gọi lại từ giao diện.',
        'Đo mức chiếm bộ nhớ ở trạng thái nghỉ và tìm phần giữ dữ liệu không cần thiết.',
      ],
      selfCheck: [
        {
          q: 'Vì sao báo cáo trung vị của mười lần đo tốt hơn lấy lần nhanh nhất?',
          a: 'Lần nhanh nhất thường là trường hợp may mắn khi cache nóng, không phản ánh trải nghiệm thật.',
        },
        {
          q: 'Tải lười có rủi ro gì?',
          a: 'Chuyển độ trễ sang lần dùng đầu tiên, nên phải chọn phần ít dùng và có trạng thái chờ rõ ràng.',
        },
      ],
      doneSignals: [
        'Thời gian mở ứng dụng có ngưỡng theo dõi và không phình dần qua các bản.',
        'Bạn biết phần nào chiếm bộ nhớ nhiều nhất khi ứng dụng nghỉ.',
      ],
    },
    {
      moduleId: 'desktop-s3-m3',
      objective:
        'Thiết kế được hệ plugin có phiên bản và chạy plugin trong hộp cát để lỗi của người khác không làm sập ứng dụng.',
      practice: [
        'Thiết kế giao diện lập trình cho plugin, có phiên bản và quy tắc bỏ dần rõ ràng.',
        'Chạy plugin trong hộp cát với quyền giới hạn và cố ý viết một plugin gây lỗi để kiểm.',
        'Viết hai plugin ví dụ kèm tài liệu để người ngoài thử theo được.',
      ],
      selfCheck: [
        {
          q: 'Vì sao plugin không nên chạy cùng quyền với ứng dụng chính?',
          a: 'Một plugin xấu sẽ đọc ghi được dữ liệu người dùng và làm hỏng cả ứng dụng.',
        },
        {
          q: 'Đổi giao diện plugin không có phiên bản gây hậu quả gì?',
          a: 'Bản cập nhật làm chết toàn bộ plugin của cộng đồng và người dùng mất tính năng họ quen dùng.',
        },
      ],
      doneSignals: [
        'Người ngoài viết được plugin đầu tiên chỉ nhờ tài liệu và ví dụ.',
        'Plugin lỗi bị cô lập và ứng dụng chính vẫn chạy bình thường.',
      ],
    },
    {
      moduleId: 'desktop-s3-m4',
      objective:
        'Kiểm thử được ứng dụng trên cả ba hệ điều hành, gồm cả luồng cài đặt và cập nhật.',
      practice: [
        'Dựng ma trận kiểm thử tự động chạy trên Windows, macOS và Linux.',
        'Viết test cho luồng cài đặt lần đầu và luồng cập nhật từ bản cũ lên bản mới.',
        'Ghi lại các khác biệt riêng của từng hệ điều hành đã gặp và cách xử lý.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải test riêng luồng cập nhật?',
          a: 'Cập nhật chạy trên máy đã có dữ liệu cũ, nên gặp lỗi mà bản cài mới hoàn toàn không gặp.',
        },
        {
          q: 'Khác biệt hệ điều hành hay lộ ra ở đâu nhất?',
          a: 'Đường dẫn tệp, quyền truy cập và cách xử lý phím tắt cùng hộp thoại hệ thống.',
        },
      ],
      doneSignals: [
        'Bạn phát hành mà không lo hệ điều hành nào chưa được kiểm.',
        'Lỗi riêng của một hệ điều hành bị bắt trong CI chứ không do người dùng báo.',
      ],
    },
  ],
  rubric: [
    {
      id: 'desktop-s3-r1',
      text: 'Giao diện lập trình cho plugin có tài liệu và ít nhất hai ví dụ chạy được ngay.',
      howToProve: 'Nhờ một người ngoài viết plugin đầu tiên và bấm giờ, mục tiêu dưới một giờ.',
    },
    {
      id: 'desktop-s3-r2',
      text: 'Plugin lỗi không làm sập ứng dụng chính trong cả 10 lần thử với các kiểu lỗi khác nhau.',
      howToProve:
        'Chạy bộ plugin lỗi cố ý và dán kết quả từng lần kèm thông báo hiện cho người dùng.',
    },
    {
      id: 'desktop-s3-r3',
      text: 'Quy trình tích hợp chạy kiểm thử trên đủ ba hệ điều hành ở 100% số lần đẩy mã.',
      howToProve: 'Dán ba lần chạy tích hợp gần nhất có đủ ba nền tảng cùng xanh.',
    },
    {
      id: 'desktop-s3-r4',
      text: 'Mở được tệp cỡ một gigabyte trong dưới 5 giây với mức chiếm bộ nhớ dưới 300 megabyte.',
      howToProve: 'Dán số đo thời gian mở và mức bộ nhớ đỉnh trên máy mục tiêu đã nêu cấu hình.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Bổ sung hệ plugin có hộp cát cho ứng dụng máy tính đang có.',
      'Tối ưu thời gian mở ứng dụng và khả năng xử lý dữ liệu lớn.',
    ],
    scopeDont: [
      'Không viết lại giao diện bằng khung khác, vì rủi ro cao và không phục vụ mục tiêu của chặng.',
      'Không mở quyền plugin rộng ra để tiện làm việc.',
    ],
    touchpoints: [
      'Điểm nạp plugin và ranh giới quyền của tiến trình chạy plugin.',
      'Đường mở tệp và thành phần hiển thị danh sách lớn.',
    ],
    contracts: [
      'Giao diện plugin có phiên bản, thay đổi phá vỡ phải tăng phiên bản chính.',
      'Plugin chỉ giao tiếp với ứng dụng qua kênh đã khai báo, không đụng trực tiếp bộ nhớ chung.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với bằng chứng chạy trên cả ba hệ điều hành.',
      'Có tài liệu plugin đủ để người ngoài bắt đầu mà không hỏi lại.',
    ],
    invariants: [
      'Plugin lỗi không bao giờ làm mất dữ liệu người dùng.',
      'Dữ liệu người dùng giữ nguyên khi cập nhật từ bản cũ lên bản mới.',
    ],
    conventions: [
      'Đường dẫn tệp xử lý theo quy ước riêng của từng hệ điều hành, không ghép chuỗi bằng tay.',
      'Số đo hiệu năng ghi kèm cấu hình máy và cỡ dữ liệu đã dùng.',
    ],
  },
}

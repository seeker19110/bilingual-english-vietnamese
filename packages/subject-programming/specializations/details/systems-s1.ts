// details/systems-s1.ts — Chi tiết chặng S1 hướng HỆ THỐNG ("Bộ nhớ và C").
// Bản đồ chặng nằm ở ../systems.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Đặc thù hướng này: ngôn ngữ không đỡ bạn. Lỗi bộ nhớ không nổ tại chỗ gây ra mà nổ ở nơi
// khác, lúc khác — nên công cụ đo (bộ dò rò rỉ, bộ gỡ lỗi) không phải phần phụ mà là phần chính.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SYSTEMS_S1_DETAIL: SpecStageDetail = {
  stageId: 'systems-s1',
  modules: [
    {
      moduleId: 'systems-s1-m1',
      objective:
        'Chỉ ra được từng biến trong chương trình nằm ở vùng nhớ nào và giải thích được vì sao con trỏ treo lại nguy hiểm.',
      practice: [
        'In địa chỉ của biến cục bộ, biến toàn cục và vùng cấp phát động rồi xếp chúng theo thứ tự địa chỉ.',
        'Trả về con trỏ trỏ vào biến cục bộ của một hàm, chạy thử và quan sát chương trình sai ở chỗ nào.',
        'In kích thước của các kiểu cơ bản và của một cấu trúc, giải thích khoảng trống do căn chỉnh sinh ra.',
      ],
      selfCheck: [
        {
          q: 'Vì sao con trỏ trỏ vào biến cục bộ đã hết phạm vi lại không báo lỗi ngay?',
          a: 'Vùng ngăn xếp đó vẫn tồn tại về mặt vật lý, chỉ là sẽ bị lần gọi hàm sau ghi đè lên bất kỳ lúc nào.',
        },
        {
          q: 'Kích thước một cấu trúc lớn hơn tổng kích thước các trường vì lý do gì?',
          a: 'Bộ biên dịch chèn khoảng đệm để từng trường nằm ở địa chỉ chia hết theo yêu cầu căn chỉnh của bộ xử lý.',
        },
        {
          q: 'Vùng ngăn xếp và vùng cấp phát động khác nhau ở điểm nào quan trọng nhất?',
          a: 'Ngăn xếp tự thu hồi khi hàm kết thúc; vùng động sống tới khi bạn tự giải phóng, quên là rò rỉ.',
        },
      ],
      doneSignals: [
        'Nhìn một đoạn mã là bạn nói được biến nào sống tới khi nào.',
        'Bạn dự đoán được kích thước một cấu trúc trước khi in ra kiểm.',
      ],
    },
    {
      moduleId: 'systems-s1-m2',
      objective:
        'Viết được chương trình C nhiều tệp có quy ước rõ ai giải phóng bộ nhớ, và tránh được lỗi tràn khi xử lý chuỗi.',
      practice: [
        'Viết một hàm cấp phát và trả về vùng nhớ, ghi rõ trong chú thích rằng người gọi phải giải phóng.',
        'Cố tình chép một chuỗi dài vào bộ đệm ngắn, chạy dưới bộ dò lỗi để xem nó bắt được ở đâu.',
        'Tách chương trình thành nhiều tệp có tệp tiêu đề riêng và viết tệp biên dịch tự động cho nó.',
      ],
      selfCheck: [
        {
          q: 'Vì sao quy ước ai giải phóng bộ nhớ phải ghi vào tài liệu của hàm?',
          a: 'Ngôn ngữ không diễn đạt được điều đó, nên người gọi chỉ có thể biết qua tài liệu hoặc đoán sai.',
        },
        {
          q: 'Giải phóng hai lần cùng một vùng nhớ dẫn tới chuyện gì?',
          a: 'Cấu trúc quản lý bộ nhớ bị hỏng, và lần cấp phát sau đó có thể trả về vùng đang được dùng.',
        },
        {
          q: 'Chuỗi trong C kết thúc bằng gì và điều đó tạo ra loại lỗi nào?',
          a: 'Kết thúc bằng ký tự rỗng; thiếu nó thì mọi hàm xử lý chuỗi đọc tràn sang vùng nhớ bên cạnh.',
        },
      ],
      doneSignals: [
        'Mọi hàm cấp phát của bạn đều nói rõ ai chịu trách nhiệm giải phóng.',
        'Bạn không còn dùng các hàm chuỗi không giới hạn độ dài.',
      ],
    },
    {
      moduleId: 'systems-s1-m3',
      objective:
        'Dùng được bộ gỡ lỗi và bộ dò bộ nhớ để tìm ra nguyên nhân gốc thay vì rải lệnh in ra khắp chương trình.',
      practice: [
        'Lấy một chương trình đổ vỡ, dừng ở điểm ngắt và đọc ngược ngăn xếp lời gọi để tìm nơi bắt đầu sai.',
        'Chạy chương trình có rò rỉ dưới bộ dò bộ nhớ, đọc báo cáo và sửa cho tới khi báo cáo sạch.',
        'Tạo một tệp đổ bộ nhớ khi chương trình chết rồi mở lại nó bằng bộ gỡ lỗi để xem trạng thái lúc đó.',
      ],
      selfCheck: [
        {
          q: 'Vì sao rải lệnh in ra để gỡ lỗi bộ nhớ thường không hiệu quả?',
          a: 'Lỗi bộ nhớ biểu hiện ở nơi khác chỗ gây ra, và bản thân lệnh in có thể làm lỗi biến mất.',
        },
        {
          q: 'Ngăn xếp lời gọi cho bạn biết thông tin gì quý nhất?',
          a: 'Đường đi dẫn tới chỗ chết, nên bạn lần ngược được hàm nào đã truyền vào giá trị sai.',
        },
        {
          q: 'Tệp đổ bộ nhớ có ích trong tình huống nào mà gỡ lỗi trực tiếp không có?',
          a: 'Khi lỗi xảy ra ở máy khác hoặc rất hiếm gặp — nó lưu lại đúng trạng thái lúc chết để xem sau.',
        },
      ],
      doneSignals: [
        'Gặp chương trình đổ vỡ là bạn mở bộ gỡ lỗi trước, không mở trình soạn thảo.',
        'Bộ dò bộ nhớ chạy trên chương trình của bạn ra báo cáo sạch.',
      ],
    },
    {
      moduleId: 'systems-s1-m4',
      objective:
        'Giải thích được từng giai đoạn từ mã nguồn tới tệp chạy được và tự chẩn đoán được lỗi thiếu ký hiệu lúc liên kết.',
      practice: [
        'Dừng quá trình dựng ở từng giai đoạn để xem đầu ra trung gian, đọc kết quả sau bước tiền xử lý.',
        'Cố tình khai báo một hàm mà không cài đặt nó, đọc thông báo lỗi lúc liên kết và giải thích.',
        'Dựng cùng một chương trình theo hai kiểu thư viện tĩnh và động, so kích thước tệp và cách chạy.',
      ],
      selfCheck: [
        {
          q: 'Lỗi lúc biên dịch khác lỗi lúc liên kết ở chỗ nào?',
          a: 'Biên dịch bắt lỗi cú pháp và kiểu trong một tệp; liên kết bắt lỗi thiếu hoặc trùng ký hiệu giữa các tệp.',
        },
        {
          q: 'Thư viện động tiết kiệm gì và đánh đổi gì?',
          a: 'Tệp chạy nhỏ hơn và dùng chung được, đổi lại máy đích phải có đúng phiên bản thư viện mới chạy nổi.',
        },
        {
          q: 'Bước tiền xử lý làm gì với tệp tiêu đề?',
          a: 'Chép toàn bộ nội dung tệp tiêu đề vào đúng chỗ, nên tệp tiêu đề nặng làm thời gian dựng tăng theo.',
        },
      ],
      doneSignals: [
        'Gặp lỗi thiếu ký hiệu là bạn biết ngay phải tìm ở khâu nào.',
        'Bạn đọc được assembly của một hàm nhỏ và khớp nó với mã nguồn.',
      ],
    },
  ],
  rubric: [
    {
      id: 'systems-s1-r1',
      text: 'Bộ cấp phát tự viết hỗ trợ đủ cấp phát, giải phóng và gộp hai khối trống liền kề thành một khối lớn.',
      howToProve:
        'Viết ca kiểm cấp phát rồi giải phòng xen kẽ, in ra danh sách khối trống cho thấy chúng đã gộp.',
    },
    {
      id: 'systems-s1-r2',
      text: 'Toàn bộ bộ test chạy dưới công cụ dò bộ nhớ mà không còn báo rò rỉ hay truy cập ngoài vùng nào.',
      howToProve: 'Chạy bộ test dưới công cụ dò và dán nguyên phần tóm tắt cuối báo cáo.',
    },
    {
      id: 'systems-s1-r3',
      text: 'Có bảng so sánh hiệu năng giữa bộ cấp phát tự viết và bộ cấp phát chuẩn kèm giải thích khác biệt.',
      howToProve:
        'Chạy cùng một kịch bản đo trên cả hai, dán bảng số và viết lý do cho chênh lệch quan sát được.',
    },
    {
      id: 'systems-s1-r4',
      text: 'Chương trình dựng lại được từ mã nguồn bằng một lệnh, tệp biên dịch tự động chỉ dựng lại phần đã đổi.',
      howToProve: 'Sửa một tệp rồi chạy lại lệnh dựng, cho thấy chỉ tệp đó được biên dịch lại.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tự viết một bộ cấp phát bộ nhớ đơn giản trên vùng nhớ xin trực tiếp từ hệ điều hành.',
      'Bộ test bao gồm cả các mẫu cấp phát xen kẽ gây phân mảnh.',
      'Bảng đo hiệu năng so với bộ cấp phát chuẩn kèm giải thích.',
    ],
    scopeDont: [
      'KHÔNG làm bộ cấp phát an toàn cho nhiều luồng, vì đồng bộ hoá là chủ đề riêng của chặng sau.',
      'KHÔNG đuổi theo hiệu năng bằng mọi giá, đúng đắn và không rò rỉ mới là mục tiêu chặng này.',
      'KHÔNG dùng lại mã của thư viện có sẵn, tự viết mới học được gì.',
    ],
    touchpoints: [
      'Tệp cài đặt bộ cấp phát và tệp tiêu đề công khai của nó.',
      'Thư mục test: các ca cấp phát, giải phóng, gộp khối và ca biên.',
      'Tệp biên dịch tự động và kịch bản đo hiệu năng.',
    ],
    contracts: [
      'Hàm cấp phát trả về con trỏ rỗng khi không còn bộ nhớ, không bao giờ tự kết thúc chương trình.',
      'Giải phóng con trỏ rỗng là thao tác hợp lệ và không làm gì cả.',
      'Vùng nhớ trả về luôn được căn chỉnh đúng cho mọi kiểu dữ liệu cơ bản.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng chạy lệnh kèm theo.',
      'Bộ test chạy sạch dưới công cụ dò bộ nhớ trên máy của người khác.',
    ],
    invariants: [
      'Không bao giờ trả về vùng nhớ đang được cấp cho chỗ khác.',
      'Tổng bộ nhớ đã xin từ hệ điều hành luôn bằng tổng khối đang dùng cộng khối trống.',
      'Chương trình kết thúc mà không còn khối nào chưa giải phóng.',
    ],
    conventions: [
      'Mọi hàm công khai ghi rõ ai chịu trách nhiệm giải phóng vùng nhớ trả về.',
      'Không dùng hàm xử lý chuỗi không giới hạn độ dài trong toàn bộ dự án.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

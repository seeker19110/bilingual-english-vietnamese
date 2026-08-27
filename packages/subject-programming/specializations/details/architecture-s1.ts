// details/architecture-s1.ts — Chi tiết chặng S1 hướng KIẾN TRÚC ("Ranh giới — chia hệ thống thành module").
// Bản đồ chặng nằm ở ../architecture.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Lưu ý hai tầng: chặng này ĐÃ có bài học 8 bước ở `p6-u19`…`p6-u21` (xem ../stageUnits.ts).
// Ở đó mỗi luật kiến trúc được biến thành MỘT HÀM THUẦN chấm được bằng test-case; còn file này
// là bản đồ luyện tay trên hệ thống THẬT, nơi không có test-case nào chấm hộ.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ARCHITECTURE_S1_DETAIL: SpecStageDetail = {
  stageId: 'architecture-s1',
  modules: [
    {
      moduleId: 'architecture-s1-m1',
      objective:
        'Cắt được hệ thống thành module theo nghiệp vụ và chứng minh mỗi module chỉ đổi vì một lý do bằng lịch sử thay đổi thật.',
      practice: [
        'Lấy mười thay đổi gần nhất trong kho mã, đếm mỗi lần phải mở bao nhiêu thư mục khác nhau.',
        'Chọn một thư mục gom theo loại tệp và thử sắp lại theo nghiệp vụ, xem con số vừa đếm đổi thế nào.',
        'Với một module bất kỳ, liệt kê thứ nó đang để lộ ra ngoài và thứ đáng lẽ phải giấu đi.',
      ],
      selfCheck: [
        {
          q: 'Câu hỏi nào đo được độ kết dính của một cách chia module?',
          a: 'Đổi một yêu cầu nghiệp vụ thì phải mở bao nhiêu thư mục — càng nhiều thì cắt càng sai.',
        },
        {
          q: 'Vì sao gom theo loại tệp lại hay dẫn tới thay đổi rải rác?',
          a: 'Một tính năng luôn cần cả giao diện, logic và dữ liệu, nên chúng bị đẩy vào ba nơi khác nhau.',
        },
        {
          q: 'Một module nên giấu đi những gì?',
          a: 'Cấu trúc dữ liệu bên trong, thư viện đang dùng và cách lưu trữ — đó là thứ sẽ đổi mà không ai được biết.',
        },
      ],
      doneSignals: [
        'Bạn chỉ ra được cho mỗi module lý do duy nhất khiến nó phải đổi.',
        'Một thay đổi nghiệp vụ điển hình chỉ động vào một thư mục.',
      ],
    },
    {
      moduleId: 'architecture-s1-m2',
      objective:
        'Bắt luật phụ thuộc một chiều bằng công cụ chặn tự động thay vì bằng lời nhắc trong lúc soát mã.',
      practice: [
        'Vẽ chiều phụ thuộc thật của dự án bằng công cụ và tìm mọi mũi tên đi ngược từ hạ tầng vào lõi.',
        'Đảo một phụ thuộc ngược: định nghĩa cổng ở lõi rồi cắm cài đặt hạ tầng vào từ bên ngoài.',
        'Thêm luật chặn vào cấu hình lint rồi cố tình vi phạm để xác nhận nó thật sự báo đỏ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lõi nghiệp vụ không được biết gì về cơ sở dữ liệu đang dùng?',
          a: 'Đổi kho lưu trữ là chuyện xảy ra thật; lõi biết tới nó thì mọi quy tắc nghiệp vụ phải viết lại theo.',
        },
        {
          q: 'Đảo phụ thuộc hoạt động bằng cơ chế nào?',
          a: 'Lõi khai giao diện nó cần và tầng ngoài cài đặt giao diện đó, nên mũi tên biên dịch đổi chiều.',
        },
        {
          q: 'Vì sao chặn bằng công cụ tốt hơn nhắc nhau khi soát mã?',
          a: 'Người soát mệt và bỏ sót, còn công cụ chạy mọi lần và không bao giờ nể nang ai.',
        },
      ],
      doneSignals: [
        'Vi phạm luật phụ thuộc làm quy trình kiểm tra đỏ ngay, không cần ai để ý.',
        'Danh sách vòng phụ thuộc của dự án về không và giữ được ở đó.',
      ],
    },
    {
      moduleId: 'architecture-s1-m3',
      objective:
        'Vẽ được sơ đồ trả lời một câu hỏi cụ thể và tự bỏ đi những sơ đồ không trả lời câu hỏi nào.',
      practice: [
        'Vẽ hai tầng sơ đồ cho một hệ thống thật rồi dừng lại, không vẽ tiếp tầng chi tiết hơn.',
        'Với mỗi sơ đồ đã vẽ, viết ở dưới đúng một câu hỏi mà nó trả lời; sơ đồ nào không viết được thì xoá.',
        'Vẽ sơ đồ tuần tự cho đúng một luồng đang gây tranh cãi trong nhóm, không vẽ luồng ai cũng hiểu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao vẽ tới tầng chi tiết nhất thường là lãng phí?',
          a: 'Tầng đó đổi theo từng lần tái cấu trúc nên sơ đồ lạc hậu ngay, trong khi mã nguồn đã nói rõ hơn.',
        },
        {
          q: 'Một sơ đồ tốt phải làm được gì?',
          a: 'Trả lời một câu hỏi cụ thể mà đọc mã nguồn không trả lời nhanh được, ví dụ dữ liệu đi qua đâu.',
        },
        {
          q: 'Sơ đồ tuần tự hợp với loại vấn đề nào nhất?',
          a: 'Luồng có nhiều bên tham gia và thứ tự quan trọng, nhất là khi có thời điểm chờ hoặc lỗi giữa chừng.',
        },
      ],
      doneSignals: [
        'Mọi sơ đồ trong tài liệu của bạn đều gắn với một câu hỏi viết ra rõ ràng.',
        'Người mới đọc sơ đồ hai tầng là hình dung được hệ thống trong mười phút.',
      ],
    },
    {
      moduleId: 'architecture-s1-m4',
      objective:
        'Đọc được hệ thống người khác viết: lần một luồng từ đầu vào tới kho lưu trữ và chỉ ra chỗ ranh giới bị rò rỉ.',
      practice: [
        'Chọn một dự án mã nguồn mở lạ và lần trọn một luồng từ điểm vào tới câu lệnh ghi dữ liệu.',
        'Dùng công cụ tìm ra tệp bị nhiều nơi phụ thuộc nhất và đọc kỹ nó để hiểu vì sao nó thành điểm nóng.',
        'Tìm ba chỗ một module đang biết quá nhiều về bên trong module khác, ghi lại đường dẫn làm bằng chứng.',
      ],
      selfCheck: [
        {
          q: 'Tệp bị import nhiều nhất mang rủi ro gì?',
          a: 'Sửa nó ảnh hưởng khắp nơi, nên nó vừa khó đổi vừa là chỗ một lỗi nhỏ lan ra toàn hệ thống.',
        },
        {
          q: 'Ranh giới bị rò rỉ biểu hiện ra sao trong mã?',
          a: 'Module ngoài đụng thẳng vào cấu trúc dữ liệu bên trong module khác thay vì gọi qua giao diện công khai.',
        },
        {
          q: 'Vì sao lần theo một luồng lại hiệu quả hơn đọc từng thư mục?',
          a: 'Luồng cho thấy các phần phối hợp thế nào, còn đọc rời từng thư mục chỉ thấy danh sách tên.',
        },
      ],
      doneSignals: [
        'Đưa cho bạn một kho mã lạ là bạn dựng được bản đồ thô trong một buổi.',
        'Bạn chỉ ra chỗ rò rỉ ranh giới kèm đường dẫn tệp, không nói chung chung.',
      ],
    },
  ],
  rubric: [
    {
      id: 'architecture-s1-r1',
      text: 'Có sơ đồ hai tầng cho một hệ thống thật kèm bảng module ghi rõ lý do duy nhất khiến từng module phải đổi.',
      howToProve:
        'Dán sơ đồ và bảng, rồi lấy ba thay đổi có thật trong lịch sử kho mã đối chiếu với lý do đã ghi.',
    },
    {
      id: 'architecture-s1-r2',
      text: 'Chỉ ra được ít nhất ba chỗ ranh giới bị rò rỉ, mỗi chỗ kèm đường dẫn tệp và chiều phụ thuộc cụ thể.',
      howToProve:
        'Với mỗi chỗ dán đoạn mã kèm đường dẫn và mô tả mũi tên phụ thuộc đang đi hướng nào.',
    },
    {
      id: 'architecture-s1-r3',
      text: 'Danh sách vòng phụ thuộc lấy hoàn toàn bằng công cụ, kèm lệnh chạy để người khác lặp lại được.',
      howToProve: 'Dán lệnh đã chạy và nguyên văn kết quả công cụ in ra, không chép tay lại.',
    },
    {
      id: 'architecture-s1-r4',
      text: 'Đề xuất cắt lại ranh giới cho một chỗ, nói rõ được gì và mất gì chứ không chỉ nêu phương án tốt.',
      howToProve:
        'Viết đề xuất có mục đánh đổi và đưa cho một người khác phản biện, ghi lại phản biện đó.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Dựng lại bản đồ kiến trúc thật của một hệ thống đang chạy, của bạn hoặc mã nguồn mở.',
      'Đo chiều phụ thuộc và vòng phụ thuộc bằng công cụ, không bằng đọc tay.',
      'Đề xuất cắt lại ranh giới cho đúng một chỗ, kèm phân tích đánh đổi.',
    ],
    scopeDont: [
      'KHÔNG viết lại hệ thống theo đề xuất, vì mục tiêu chặng là nhìn ra ranh giới chứ chưa phải đổi nó.',
      'KHÔNG vẽ tới tầng chi tiết nhất, hai tầng là đủ và tầng sâu hơn lạc hậu ngay sau lần tái cấu trúc kế tiếp.',
      'KHÔNG chọn hệ thống quá lớn, một dự án vài chục nghìn dòng là vừa sức.',
    ],
    touchpoints: [
      'Tài liệu bản đồ: sơ đồ hai tầng kèm câu hỏi mà mỗi sơ đồ trả lời.',
      'Bảng module: tên, trách nhiệm duy nhất, thứ giấu bên trong, thứ để lộ ra ngoài.',
      'Kịch bản chạy công cụ đo phụ thuộc và tệp kết quả nó sinh ra.',
    ],
    contracts: [
      'Mọi khẳng định về phụ thuộc phải truy được về một lệnh công cụ chạy lại được.',
      'Mỗi sơ đồ ghi kèm đúng một câu hỏi nó trả lời, không có sơ đồ trang trí.',
      'Bảng module dùng cùng tên module với tên thư mục thật trong kho mã.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng kèm theo.',
      'Người khác chạy lại lệnh đo của bạn và ra cùng danh sách vòng phụ thuộc.',
    ],
    invariants: [
      'Không kết luận nào về cấu trúc được đưa ra mà chỉ dựa vào đọc mắt.',
      'Mỗi chỗ rò rỉ nêu ra đều có đường dẫn tệp cụ thể để kiểm lại.',
      'Đề xuất nào cũng phải có mục nói rõ mất gì, không chỉ nói được gì.',
    ],
    conventions: [
      'Tài liệu viết bằng tiếng Việt, thuật ngữ tiếng Anh giữ nguyên trong ngoặc lần đầu xuất hiện.',
      'Sơ đồ lưu ở dạng văn bản sinh ra hình để soát được thay đổi qua kho mã.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

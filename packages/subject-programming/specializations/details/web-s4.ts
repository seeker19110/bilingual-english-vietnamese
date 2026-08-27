// details/web-s4.ts — Chi tiết chặng S4 hướng WEB ("Chuyên gia — quy mô, thời gian thực, vận hành").
// Bản đồ chặng ở ../web.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Riêng hướng này, chặng S4 đã có BÀI HỌC 8 BƯỚC thật (p6-u22…p6-u24, xem stageUnits.ts).
// Hai tầng bổ sung nhau: bài học chấm được ba phán đoán lõi bằng test-case; chi tiết dưới
// đây là phần dự án và nghiệm thu mà bộ chạy trong trình duyệt không mô phỏng được.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const WEB_S4_DETAIL: SpecStageDetail = {
  stageId: 'web-s4',
  modules: [
    {
      moduleId: 'web-s4-m1',
      objective:
        'Dựng được luồng dữ liệu thời gian thực đúng cả khi server chạy nhiều tiến trình và client rớt mạng giữa chừng.',
      practice: [
        'Đẩy thay đổi qua WebSocket có đánh số thứ tự, rồi cố ý đảo và nhân đôi gói để xem trạng thái cuối có lệch không.',
        'Chạy server hai tiến trình trở lên với pub/sub dùng chung, kiểm hai client nối vào hai tiến trình khác nhau vẫn thấy giống nhau.',
        'Ngắt mạng 30 giây rồi nối lại, xác nhận client nói được "tôi đang ở mốc nào" và server gửi bù đúng phần thiếu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không được tin thứ tự gói tin đến dù WebSocket giữ thứ tự trên một kết nối?',
          a: 'Hệ thật có nhiều tiến trình và client nối lại vào tiến trình khác, nên thứ tự đến không còn là thứ tự xảy ra.',
        },
        {
          q: 'Danh sách người đang online nên dựng từ cái gì?',
          a: 'Từ dấu vết sống có hạn dùng, vì sự kiện rời đi không đáng tin khi mất sóng hay đóng máy đột ngột.',
        },
        {
          q: 'Khi nào mới cần tới CRDT thay vì đánh số thứ tự?',
          a: 'Khi hai thay đổi thật sự đồng thời và không được phép mất bên nào, nghĩa là không sắp thứ tự sẵn tại nguồn được.',
        },
      ],
      doneSignals: [
        'Đảo thứ tự và nhân đôi gói tin trong test mà trạng thái cuối vẫn ra một kết quả.',
        'Nói được app của mình chịu được mất kết nối bao lâu, kèm con số hạn dùng đã chọn và lý do.',
      ],
    },
    {
      moduleId: 'web-s4-m2',
      objective:
        'Cho app chạy tiếp khi mất mạng và đồng bộ lại mà không mất dữ liệu người dùng đã nhập.',
      practice: [
        'Phân loại mọi tài nguyên của app theo rủi ro rồi gán chiến lược cache, giải thích được từng lựa chọn.',
        'Ghi thao tác lúc offline vào hàng đợi có id riêng, thử gửi lại hai lần để xác nhận không tạo bản ghi thừa.',
        'Sửa cùng một bản ghi trên hai máy lúc offline rồi cho cả hai lên mạng, kiểm hai máy hội tụ về cùng kết quả.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không được cache dữ liệu riêng của người dùng vào cache dùng chung?',
          a: 'Trên máy chung, người đăng nhập sau mở đúng đường dẫn là đọc được dữ liệu của người trước.',
        },
        {
          q: 'Mốc thời gian dùng để phân định thắng thua khi đồng bộ nên do ai đóng dấu?',
          a: 'Do server, vì đồng hồ máy khách có thể lệch hoặc bị chỉnh và làm thay đổi cũ đè lên thay đổi mới.',
        },
        {
          q: 'Bản service worker mới có nên chiếm quyền ngay khi cài xong không?',
          a: 'Không nên ép giữa lúc người dùng đang thao tác; hỏi một câu rồi tải lại là cách an toàn.',
        },
      ],
      doneSignals: [
        'Bật chế độ máy bay giữa lúc đang nhập liệu mà không mất chữ nào sau khi có mạng lại.',
        'Chỉ ra được trên bảng phân loại tài nguyên nào bị cấm cache và vì sao.',
      ],
    },
    {
      moduleId: 'web-s4-m3',
      objective:
        'Vận hành được sản phẩm đang sống: biết nó đang khoẻ hay yếu bằng số, và bị đánh thức đúng lúc đáng bị đánh thức.',
      practice: [
        'Ghi log có cấu trúc kèm mã tương quan để lần được một request đi qua mọi tầng.',
        'Công bố một SLO cho luồng chính, tính ngân sách lỗi và dựng cảnh báo hai cửa sổ theo tốc độ tiêu.',
        'Phát hành một thay đổi sau cờ tính năng, bật cho 5% người dùng rồi tắt lại trong dưới năm phút.',
      ],
      selfCheck: [
        {
          q: 'Vì sao độ trễ trung bình là con số dễ gây hiểu lầm?',
          a: 'Đuôi dài bị hàng nghìn request nhanh pha loãng, nên nhóm người dùng khổ nhất biến mất khỏi bảng theo dõi.',
        },
        {
          q: 'Nên đánh thức người trực lúc nửa đêm vì tín hiệu loại nào?',
          a: 'Vì triệu chứng người dùng như tỉ lệ lỗi hay độ trễ, còn CPU và RAM chỉ để chẩn đoán sau đó.',
        },
        {
          q: 'Ngân sách lỗi giải quyết tranh cãi nào trong đội?',
          a: 'Tranh cãi làm tính năng mới hay quay về sửa ổn định, vì nó biến câu hỏi đó thành một con số.',
        },
      ],
      doneSignals: [
        'Trả lời được tuần vừa rồi đã tiêu bao nhiêu phần trăm ngân sách lỗi, bằng số chứ không bằng cảm giác.',
        'Quay lui một bản phát hành hỏng trong vài phút mà không cần deploy lại từ đầu.',
      ],
    },
    {
      moduleId: 'web-s4-m4',
      objective:
        'Dẫn được phần kỹ thuật của một đợt việc có nhiều người: quyết định có ghi lại, việc chia được lát giao dần.',
      practice: [
        'Viết ADR cho một quyết định lớn của dự án, có nêu phương án bị loại và điều kiện sẽ xem lại quyết định.',
        'Review một PR của người khác theo hướng dạy được: mỗi góp ý kèm lý do và cách sửa cụ thể.',
        'Chia một tính năng lớn thành các lát giao được từng phần, mỗi lát tự nó đã có giá trị dùng được.',
      ],
      selfCheck: [
        {
          q: 'Một ADR thiếu phần phương án bị loại thì hỏng ở chỗ nào?',
          a: 'Người sau không biết đã cân nhắc gì, nên sẽ đề xuất lại đúng phương án từng bị loại vì lý do cũ.',
        },
        {
          q: 'Vì sao chia lát theo tầng kỹ thuật là cách chia tệ?',
          a: 'Làm xong tầng dữ liệu mà chưa ai dùng được gì; lát phải cắt dọc để mỗi lát giao được giá trị thật.',
        },
      ],
      doneSignals: [
        'Người mới đọc bộ ADR là hiểu được vì sao dự án ra hình dạng hiện tại, không phải hỏi lại.',
        'Ước lượng của bạn lệch trong khoảng chấp nhận được, và bạn nói sớm khi biết sẽ trễ.',
      ],
    },
  ],
  rubric: [
    {
      id: 'web-s4-r1',
      text: 'Đồng bộ thời gian thực chạy đúng khi server có từ hai tiến trình trở lên, kiểm bằng hai client nối vào hai tiến trình khác nhau.',
      howToProve:
        'Quay màn hình hai client cạnh nhau khi server chạy nhiều tiến trình và dán cấu hình đã dùng.',
    },
    {
      id: 'web-s4-r2',
      text: 'Mất mạng tạm thời không mất dữ liệu: thao tác lúc offline lên đủ sau khi có mạng lại, gửi lại không nhân đôi.',
      howToProve:
        'Chạy kịch bản tắt mạng 30 giây, dán dữ liệu trước và sau khi đồng bộ để đối chiếu.',
    },
    {
      id: 'web-s4-r3',
      text: 'Có bảng vận hành hiển thị tỉ lệ lỗi, độ trễ phân vị và số phiên đang mở, cập nhật theo thời gian thực.',
      howToProve: 'Chụp bảng ở hai thời điểm khác nhau và nêu nguồn số liệu của từng ô.',
    },
    {
      id: 'web-s4-r4',
      text: 'Công bố một SLO cho luồng chính kèm cảnh báo theo tốc độ tiêu ngân sách lỗi, có hai cửa sổ thời gian.',
      howToProve: 'Dán cấu hình cảnh báo và một lần bắn thử cho thấy nó kêu đúng lúc đáng kêu.',
    },
    {
      id: 'web-s4-r5',
      text: 'Có ít nhất ba ADR ghi quyết định lớn, mỗi ADR nêu phương án bị loại và điều kiện xem lại.',
      howToProve: 'Liệt kê ba ADR kèm ngày và người quyết định trong kho tài liệu của dự án.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Xây một sản phẩm web nhiều người dùng cùng lúc thấy thay đổi của nhau tức thì.',
      'Cho sản phẩm chạy tiếp khi mất mạng tạm thời và đồng bộ lại không mất dữ liệu.',
      'Dựng bảng vận hành và cảnh báo theo triệu chứng người dùng.',
    ],
    scopeDont: [
      'Không tự viết thuật toán hợp nhất kiểu CRDT ở đợt này, vì nó là một dự án riêng chứ không phải một phần nhỏ.',
      'Không mở rộng phạm vi nghiệp vụ — sản phẩm nhỏ mà chạy đúng lúc mất mạng đáng giá hơn sản phẩm to mà đồng bộ sai.',
      'Không tự vận hành cụm máy chủ riêng, thuê dịch vụ quản lý sẵn cho phần hạ tầng.',
    ],
    touchpoints: [
      'Tầng đẩy tin thời gian thực và nơi giữ số thứ tự của từng luồng dữ liệu.',
      'Lớp lưu trữ dưới trình duyệt và hàng đợi thao tác lúc offline.',
      'Nơi ghi log, đo số liệu và cấu hình cảnh báo.',
    ],
    contracts: [
      'Mỗi thay đổi mang id riêng và số thứ tự; nhận lại lần hai không được đổi trạng thái.',
      'Client báo mốc đang ở đâu khi nối lại; server chỉ gửi phần còn thiếu.',
      'Mốc thời gian phân định xung đột do server đóng dấu, client không tự đặt.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric của chặng, mỗi tiêu chí có bằng chứng chạy lại được.',
      'Toàn bộ cổng chất lượng của dự án vẫn xanh, trợ năng không tụt.',
    ],
    invariants: [
      'Không mất dữ liệu người dùng đã nhập, kể cả khi mạng đứt giữa lúc gửi.',
      'Hai máy nhận cùng tập thay đổi phải hội tụ về cùng một trạng thái.',
    ],
    conventions: [
      'Logic nhạy cảm và kiểm quyền nằm ở server, client không được tin.',
      'Màu lấy từ token của dự án; vùng chạm tối thiểu 44px, thiết kế màn nhỏ trước.',
    ],
  },
}

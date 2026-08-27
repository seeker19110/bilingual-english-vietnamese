// details/game-s4.ts — Chi tiết chặng S4 hướng GAME ("Chuyên gia — nhiều người chơi và quy mô
// phát hành"). Bản đồ chặng ở ../game.ts.
//
// Hai thứ chi phối chặng này và không có ở hướng khác: (1) độ trễ mạng KHÔNG giấu được, chỉ
// che bớt bằng dự đoán và hoà giải; (2) người chơi có động cơ gian lận, nên client không bao
// giờ được là nơi quyết định. Phần kiếm tiền cố ý đặt cạnh phần số liệu vì cùng một bảng số
// vừa dùng để cân bằng game vừa dùng để bóc lột người chơi.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const GAME_S4_DETAIL: SpecStageDetail = {
  stageId: 'game-s4',
  modules: [
    {
      moduleId: 'game-s4-m1',
      objective:
        'Dựng lớp mạng cho game nhiều người chơi giữ quyền quyết định ở server mà vẫn cho cảm giác mượt ở máy người chơi.',
      practice: [
        'Cho server là nơi duy nhất quyết định trạng thái, client chỉ gửi ý định và nhận kết quả.',
        'Cài dự đoán phía client và hoà giải khi server trả kết quả khác, xử lý cho hình ảnh không giật ngược.',
        'Chạy thử ở độ trễ mô phỏng 150 mili giây và ghi lại chỗ nào người chơi cảm nhận rõ nhất.',
      ],
      selfCheck: [
        {
          q: 'Vì sao client không bao giờ được là nơi quyết định trạng thái game?',
          a: 'Người chơi kiểm soát máy của họ nên mọi con số client gửi lên đều có thể bị sửa để gian lận.',
        },
        {
          q: 'Dự đoán phía client giải quyết vấn đề gì và tạo ra vấn đề gì?',
          a: 'Nó giấu độ trễ để thao tác thấy tức thì, nhưng khi server bác lại thì phải hoà giải cho hình ảnh không nhảy.',
        },
        {
          q: 'Bù trễ đứng về phía ai và đánh đổi ra sao?',
          a: 'Nó ưu tiên trải nghiệm người bắn, nhưng có thể khiến người bị bắn thấy mình đã nấp kịp mà vẫn trúng.',
        },
      ],
      doneSignals: [
        'Sửa dữ liệu ở client không đổi được kết quả trận đấu.',
        'Ở độ trễ 150 mili giây, game vẫn chơi được và bạn nói được chỗ nào phải chấp nhận cảm giác lệch.',
      ],
    },
    {
      moduleId: 'game-s4-m2',
      objective:
        'Xây công cụ nội bộ và quy trình tài nguyên để người làm mỹ thuật và người lập trình không chặn nhau.',
      practice: [
        'Làm một công cụ chỉnh thông số trong lúc game đang chạy để thử cân bằng không cần build lại.',
        'Đặt quy trình tài nguyên với kho lưu tệp lớn, thử một lần đưa tài nguyên mới vào từ đầu tới cuối.',
        'Dựng build tự động cho ít nhất hai nền tảng và cho người không kỹ thuật tải bản thử.',
      ],
      selfCheck: [
        {
          q: 'Vì sao công cụ nội bộ đáng đầu tư dù nó không nằm trong sản phẩm bán ra?',
          a: 'Vì mỗi vòng thử cân bằng nhanh hơn vài phút sẽ nhân lên hàng nghìn lần trong suốt dự án.',
        },
        {
          q: 'Tệp tài nguyên lớn gây hại gì cho kho mã nếu quản như mã nguồn thường?',
          a: 'Kho phình rất nhanh và mọi thao tác chậm dần, vì mỗi phiên bản ảnh hay âm thanh đều được lưu trọn.',
        },
      ],
      doneSignals: [
        'Người làm mỹ thuật tự đưa tài nguyên vào game mà không cần lập trình viên làm hộ.',
        'Bản thử cho người ngoài chơi được tạo tự động sau mỗi lần gộp mã.',
      ],
    },
    {
      moduleId: 'game-s4-m3',
      objective:
        'Cân bằng trò chơi bằng số liệu người chơi thật và chọn mô hình kiếm tiền không dựa vào bóc lột.',
      practice: [
        'Đo tỉ lệ bỏ cuộc theo từng màn và tìm màn nào đang chặn người chơi mới nhiều nhất.',
        'Mô phỏng nền kinh tế trong game trên bảng tính trước khi cài, xem lạm phát sau vài trăm giờ chơi.',
        'Rà các cơ chế kiếm tiền của mình theo tiêu chí có ép người chơi bằng cảm giác sợ mất mát hay không.',
      ],
      selfCheck: [
        {
          q: 'Tỉ lệ bỏ cuộc theo màn nói lên điều gì mà tổng thời gian chơi không nói được?',
          a: 'Nó chỉ đúng chỗ người chơi rời đi, còn tổng thời gian gộp chung che mất điểm nghẽn cụ thể.',
        },
        {
          q: 'Dấu hiệu nào cho thấy một cơ chế kiếm tiền đã sang phía bóc lột?',
          a: 'Khi nó bán cách thoát khỏi khó chịu do chính game cố tình tạo ra, nhắm vào người dễ tổn thương.',
        },
      ],
      doneSignals: [
        'Mỗi thay đổi cân bằng của bạn đi kèm một số liệu trước và sau.',
        'Bạn từ chối được một cơ chế kiếm tiền có lãi vì lý do đạo đức, và ghi lại lý do.',
      ],
    },
    {
      moduleId: 'game-s4-m4',
      objective:
        'Đưa game ra thị trường thật: qua được yêu cầu kỹ thuật của nền tảng và duy trì sản phẩm sau phát hành.',
      practice: [
        'Đọc yêu cầu kỹ thuật của một nền tảng phát hành và tự chấm game mình còn thiếu gì.',
        'Bản địa hoá toàn bộ chuỗi hiển thị sang tiếng Việt và một ngôn ngữ khác, kiểm chỗ vỡ bố cục.',
        'Thêm các tuỳ chọn trợ năng cơ bản: đổi cỡ chữ, giảm hiệu ứng chớp và chơi được không cần nghe.',
      ],
      selfCheck: [
        {
          q: 'Vì sao bản địa hoá không chỉ là dịch chuỗi ký tự?',
          a: 'Độ dài chuỗi đổi làm vỡ bố cục, và định dạng ngày, số, tiền tệ cùng ngữ cảnh văn hoá cũng phải đổi theo.',
        },
        {
          q: 'Trợ năng trong game mang lại lợi ích cho ai ngoài người khuyết tật?',
          a: 'Cho cả người chơi trên màn nhỏ, nơi ồn ào hay khi mệt, nên nó mở rộng tệp người chơi nói chung.',
        },
      ],
      doneSignals: [
        'Game qua được vòng kiểm kỹ thuật của nền tảng ngay lần nộp đầu hoặc chỉ sửa nhỏ.',
        'Có kế hoạch cập nhật sau phát hành, không phải phát hành xong rồi bỏ đó.',
      ],
    },
  ],
  rubric: [
    {
      id: 'game-s4-r1',
      text: 'Server giữ quyền quyết định trạng thái và chặn được các cách gian lận cơ bản từ phía client.',
      howToProve:
        'Thử sửa dữ liệu ở client hoặc gửi gói tin giả và cho thấy kết quả trận không đổi.',
    },
    {
      id: 'game-s4-r2',
      text: 'Chơi được mượt ở độ trễ mô phỏng 150 mili giây, có dự đoán phía client và hoà giải khi lệch.',
      howToProve: 'Quay video phiên chơi ở độ trễ mô phỏng kèm cấu hình mô phỏng đã dùng.',
    },
    {
      id: 'game-s4-r3',
      text: 'Có mặt trên một nền tảng phát hành thật và thu được số liệu người chơi sau phát hành.',
      howToProve: 'Dán liên kết trang game và bảng số liệu người chơi của ít nhất hai tuần.',
    },
    {
      id: 'game-s4-r4',
      text: 'Có báo cáo cân bằng dựa trên số liệu: tỉ lệ bỏ cuộc theo màn trước và sau khi chỉnh.',
      howToProve: 'Dán biểu đồ tỉ lệ bỏ cuộc theo màn ở hai mốc kèm mô tả thay đổi đã làm.',
    },
    {
      id: 'game-s4-r5',
      text: 'Có ít nhất ba tuỳ chọn trợ năng hoạt động thật và toàn bộ chuỗi hiển thị đã bản địa hoá.',
      howToProve: 'Quay video bật từng tuỳ chọn và đổi ngôn ngữ mà bố cục không vỡ.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Làm một game có chế độ nhiều người chơi qua mạng với server giữ quyền quyết định.',
      'Phát hành thật trên một nền tảng thương mại và thu số liệu người chơi.',
      'Cân bằng trò chơi dựa trên số liệu và thêm tuỳ chọn trợ năng.',
    ],
    scopeDont: [
      'Không tự viết engine đồ hoạ từ đầu, vì nó là một dự án riêng và không phải bài học của chặng này.',
      'Không thêm cơ chế kiếm tiền dựa vào áp lực tâm lý, kể cả khi nó có lãi.',
      'Không mở rộng nội dung game khi phần mạng còn chưa ổn định.',
    ],
    touchpoints: [
      'Vòng lặp mô phỏng ở server và nơi nhận ý định từ client.',
      'Lớp dự đoán và hoà giải ở client.',
      'Đường ống build đa nền tảng và kho tài nguyên.',
    ],
    contracts: [
      'Client chỉ gửi ý định; mọi thay đổi trạng thái do server quyết và phát lại cho mọi người.',
      'Gói tin có số thứ tự và dấu thời gian để hoà giải được khi tới sai thứ tự.',
      'Mọi chuỗi hiển thị nằm trong tệp ngôn ngữ, không ghi cứng trong mã.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng người ngoài kiểm được.',
      'Có ít nhất một đợt cho người ngoài chơi thử và ghi nhận phản hồi.',
    ],
    invariants: [
      'Không hành động nào của người chơi được tin mà không qua kiểm tra ở server.',
      'Không thay đổi cân bằng nào được phát hành mà thiếu số liệu đối chiếu.',
    ],
    conventions: [
      'Tài nguyên lớn quản trong kho tệp lớn, không đưa thẳng vào kho mã.',
      'Mọi thay đổi ảnh hưởng người chơi có ghi chú phát hành.',
    ],
  },
}

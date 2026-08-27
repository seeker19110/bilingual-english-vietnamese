// details/security-s4.ts — Chi tiết chặng S4 hướng BẢO MẬT ("Chuyên gia — phòng thủ và kiến
// trúc an toàn"). Bản đồ chặng ở ../security.ts.
//
// Luật đạo đức của chặng, ghi ở đây vì nó ràng buộc mọi bài luyện bên dưới: chỉ tấn công hệ
// thống của CHÍNH MÌNH hoặc môi trường luyện tập được phép. Mọi kỹ thuật ở đây là để phòng
// thủ; dùng lên hệ thống người khác khi chưa được cho phép là vi phạm pháp luật.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SECURITY_S4_DETAIL: SpecStageDetail = {
  stageId: 'security-s4',
  modules: [
    {
      moduleId: 'security-s4-m1',
      objective:
        'Thiết kế kiến trúc an toàn theo ranh giới tin cậy thay vì dựa vào một hàng rào mạng duy nhất bên ngoài.',
      practice: [
        'Vẽ ranh giới tin cậy của hệ thống mình và chỉ ra thứ gì đi qua từng ranh giới, ai xác thực ở đó.',
        'Chuyển một cặp dịch vụ nội bộ sang xác thực lẫn nhau, giả định mạng nội bộ không còn được tin.',
        'Đưa một bước rà bảo mật vào giai đoạn thiết kế, thử áp cho một tính năng đang chuẩn bị làm.',
      ],
      selfCheck: [
        {
          q: 'Mô hình zero trust khác mô hình hàng rào ngoài ở điểm nào?',
          a: 'Nó không coi mạng nội bộ là an toàn, nên mọi yêu cầu đều phải xác thực và phân quyền lại.',
        },
        {
          q: 'Vì sao vá bảo mật ở giai đoạn thiết kế rẻ hơn nhiều lần?',
          a: 'Vì đổi thiết kế chỉ tốn giấy, còn sửa sau khi đã chạy thật thì kéo theo di trú dữ liệu và rủi ro cho người dùng.',
        },
      ],
      doneSignals: [
        'Mọi luồng qua ranh giới tin cậy đều nói được ai xác thực và xác thực bằng gì.',
        'Tính năng mới đi qua một bước rà thiết kế trước khi viết dòng mã đầu tiên.',
      ],
    },
    {
      moduleId: 'security-s4-m2',
      objective:
        'Phát hiện được tấn công đang diễn ra bằng luật dựa trên nhật ký, và biết phải làm gì trong giờ đầu tiên.',
      practice: [
        'Gom nhật ký từ ba nguồn khác nhau về một chỗ và viết ba luật phát hiện cho ba hành vi đáng ngờ.',
        'Đo tỉ lệ báo nhầm của từng luật trên dữ liệu một tuần, chỉnh cho tới khi người trực chịu đọc nổi.',
        'Diễn tập quy trình ứng cứu: ngăn chặn, diệt trừ, phục hồi, bấm giờ từng giai đoạn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao luật phát hiện có tỉ lệ báo nhầm cao lại nguy hiểm?',
          a: 'Người trực học cách bỏ qua cảnh báo, nên khi cảnh báo thật xuất hiện cũng không ai nhìn.',
        },
        {
          q: 'Bước đầu tiên khi phát hiện tấn công đang diễn ra là gì?',
          a: 'Ngăn chặn để hạn chế thiệt hại, đồng thời giữ chứng cứ chứ không xoá vội máy đang bị nhiễm.',
        },
        {
          q: 'Khung MITRE ATT&CK dùng để làm gì?',
          a: 'Để đối chiếu xem mình đã phát hiện được những kỹ thuật nào và còn hổng ở đâu, thay vì đoán.',
        },
      ],
      doneSignals: [
        'Mỗi luật phát hiện có con số báo nhầm đo được, không phải cảm giác.',
        'Người trực biết chính xác ba việc phải làm trong mười phút đầu.',
      ],
    },
    {
      moduleId: 'security-s4-m3',
      objective:
        'Thu thập chứng cứ giữ nguyên tính toàn vẹn và dựng lại dòng thời gian sự cố từ nhiều nguồn nhật ký khác nhau.',
      practice: [
        'Thu thập nhật ký của một sự cố mô phỏng, tính mã băm và ghi lại chuỗi bàn giao chứng cứ.',
        'Ghép nhật ký ba nguồn có lệch múi giờ thành một dòng thời gian duy nhất.',
        'Viết báo cáo sự cố hai phiên bản: một cho lãnh đạo và một cho đội kỹ thuật.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải tính mã băm chứng cứ ngay khi thu thập?',
          a: 'Để chứng minh về sau rằng chứng cứ không bị sửa; thiếu bước này thì mọi kết luận đều có thể bị bác.',
        },
        {
          q: 'Sai lệch múi giờ giữa các nguồn nhật ký gây hại gì?',
          a: 'Nó làm thứ tự sự kiện sai, dẫn tới quy nhầm nguyên nhân và kết luận sai về đường tấn công.',
        },
      ],
      doneSignals: [
        'Dòng thời gian bạn dựng chịu được câu hỏi làm sao biết cái này xảy ra trước cái kia.',
        'Báo cáo cho lãnh đạo trả lời được ảnh hưởng và việc cần quyết, không sa vào chi tiết kỹ thuật.',
      ],
    },
    {
      moduleId: 'security-s4-m4',
      objective:
        'Quản trị rủi ro có hệ thống: đánh giá rủi ro bên thứ ba và đưa được nhận thức an toàn tới người không kỹ thuật.',
      practice: [
        'Lập sổ rủi ro cho hệ thống, mỗi rủi ro có khả năng xảy ra, mức thiệt hại và biện pháp kiểm soát.',
        'Đánh giá một nhà cung cấp bên thứ ba đang giữ dữ liệu của bạn, ghi rõ phần rủi ro không chuyển đi được.',
        'Tổ chức một buổi đào tạo ngắn cho người không kỹ thuật và đo bằng một bài thử lừa đảo mô phỏng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao thuê dịch vụ ngoài không chuyển hết trách nhiệm cho nhà cung cấp?',
          a: 'Trách nhiệm với người dùng và với pháp luật vẫn thuộc về bạn, hợp đồng chỉ chia phần bồi thường.',
        },
        {
          q: 'Đo hiệu quả đào tạo nhận thức bằng cách nào cho thật?',
          a: 'Bằng bài thử mô phỏng có số liệu trước sau, không bằng số người đã ngồi nghe.',
        },
      ],
      doneSignals: [
        'Sổ rủi ro được cập nhật định kỳ và có người chịu trách nhiệm cho từng dòng.',
        'Tỉ lệ người bấm vào liên kết lừa đảo mô phỏng giảm sau đào tạo, có số liệu.',
      ],
    },
  ],
  rubric: [
    {
      id: 'security-s4-r1',
      text: 'Có mô hình đe doạ viết thành văn bản cho một sản phẩm thật, mỗi mối đe doạ gắn với một biện pháp kiểm soát.',
      howToProve: 'Dán bảng đe doạ và kiểm soát, chỉ ra biện pháp đã cài đặt thật trong hệ thống.',
    },
    {
      id: 'security-s4-r2',
      text: 'Quét bảo mật tự động chặn CI và toàn bộ lịch sử kho mã không còn bí mật nào lộ ra.',
      howToProve:
        'Chạy công cụ quét bí mật trên toàn lịch sử và dán kết quả sạch kèm cấu hình cổng CI.',
    },
    {
      id: 'security-s4-r3',
      text: 'Có ít nhất ba luật phát hiện chạy trên nhật ký thật, mỗi luật đo được tỉ lệ báo nhầm.',
      howToProve: 'Dán ba luật kèm số cảnh báo và số ca đúng trong khoảng ít nhất một tuần.',
    },
    {
      id: 'security-s4-r4',
      text: 'Diễn tập ứng cứu sự cố có báo cáo, đo được thời gian phát hiện và thời gian ngăn chặn.',
      howToProve: 'Dán biên bản diễn tập kèm dòng thời gian và hai con số đo được.',
    },
    {
      id: 'security-s4-r5',
      text: 'Mọi truy cập dữ liệu nhạy cảm cần quyền tối thiểu và được ghi nhật ký kiểm toán tra lại được.',
      howToProve:
        'Thử truy cập bằng vai trò thiếu quyền rồi dán cả kết quả bị chặn lẫn dòng nhật ký.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Áp đủ vòng an toàn cho một sản phẩm thật: mô hình đe doạ, kiểm soát, phát hiện, diễn tập.',
      'Dựng luật phát hiện trên nhật ký và đo tỉ lệ báo nhầm.',
      'Lập sổ rủi ro và đánh giá rủi ro bên thứ ba.',
    ],
    scopeDont: [
      'Không kiểm thử xâm nhập lên hệ thống của người khác khi chưa có văn bản cho phép, vì đó là vi phạm pháp luật.',
      'Không mua thêm công cụ trước khi dùng hết thứ đang có — công cụ không cấu hình đúng chỉ tạo cảm giác an toàn.',
      'Không công bố chi tiết lỗ hổng chưa vá ra ngoài, kể cả trong báo cáo học tập.',
    ],
    touchpoints: [
      'Ranh giới tin cậy giữa các dịch vụ và nơi xác thực.',
      'Đường gom nhật ký và nơi đặt luật phát hiện.',
      'Cổng CI, nơi đặt quét bảo mật và quét bí mật.',
    ],
    contracts: [
      'Mọi truy cập dữ liệu nhạy cảm sinh một bản ghi kiểm toán không sửa được.',
      'Chứng cứ thu thập kèm mã băm và chuỗi bàn giao.',
      'Cảnh báo gửi tới người trực phải kèm bước xử lý đầu tiên, không chỉ có mô tả.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí có bằng chứng kiểm lại được.',
      'Không có biện pháp kiểm soát nào chỉ tồn tại trên giấy mà chưa cài đặt.',
    ],
    invariants: [
      'Không bao giờ tấn công hay dò quét hệ thống ngoài phạm vi được phép.',
      'Chứng cứ sự cố không bị sửa hay xoá trước khi điều tra xong.',
    ],
    conventions: [
      'Bí mật nằm trong kho bí mật, không nằm trong mã nguồn hay biến trong log.',
      'Báo cáo sự cố có hai phiên bản: cho lãnh đạo và cho đội kỹ thuật.',
    ],
  },
}

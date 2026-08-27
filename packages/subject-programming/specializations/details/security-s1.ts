// details/security-s1.ts — Chi tiết chặng S1 hướng BẢO MẬT ("Nền tảng và tư duy phòng thủ").
// Bản đồ chặng nằm ở ../security.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// LUẬT ĐẠO ĐỨC, áp cho toàn bộ nội dung dưới đây và mọi chặng sau của hướng này:
// chỉ tấn công hệ thống của CHÍNH MÌNH hoặc môi trường đã được cho phép bằng văn bản.
// Phòng lab phải chạy trong container cô lập và KHÔNG BAO GIỜ phơi ra Internet.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SECURITY_S1_DETAIL: SpecStageDetail = {
  stageId: 'security-s1',
  modules: [
    {
      moduleId: 'security-s1-m1',
      objective:
        'Lập được mô hình mối đe doạ cho một hệ thống có thật: liệt kê tài sản, bề mặt tấn công và xếp ưu tiên rủi ro.',
      practice: [
        'Vẽ sơ đồ luồng dữ liệu của một hệ thống bạn biết rõ và đánh dấu mọi chỗ dữ liệu vượt ranh giới tin cậy.',
        'Với mỗi ranh giới, liệt kê mối đe doạ theo sáu nhóm rồi xếp ưu tiên theo tác động nhân khả năng.',
        'Chọn một chức năng và cắt bớt quyền của nó xuống mức tối thiểu, ghi lại thứ gì hỏng theo.',
      ],
      selfCheck: [
        {
          q: 'Ranh giới tin cậy là gì và vì sao phải đánh dấu nó?',
          a: 'Là chỗ dữ liệu đi từ vùng ít tin sang vùng tin hơn; mọi lỗ hổng nghiêm trọng đều nằm ngay tại đó.',
        },
        {
          q: 'Vì sao xếp ưu tiên rủi ro quan trọng hơn liệt kê được nhiều mối đe doạ?',
          a: 'Nguồn lực có hạn; danh sách dài mà không xếp hạng dẫn tới vá chỗ dễ và bỏ chỗ nguy hiểm.',
        },
        {
          q: 'Phòng thủ nhiều lớp khác gì với việc làm thật chặt một lớp?',
          a: 'Một lớp nào cũng có ngày bị vượt; nhiều lớp bảo đảm một lỗi đơn lẻ chưa dẫn tới mất trắng.',
        },
      ],
      doneSignals: [
        'Nhìn một tính năng mới là bạn hỏi ngay dữ liệu vào từ đâu và ai tin được.',
        'Bạn xếp được thứ tự nên vá cái gì trước và bảo vệ được thứ tự đó.',
      ],
    },
    {
      moduleId: 'security-s1-m2',
      objective:
        'Chọn đúng công cụ mật mã cho từng bài toán và nhận ra ngay những cách dùng sai phổ biến nhất trong mã thật.',
      practice: [
        'Với ba bài toán lưu mật khẩu, giữ bí mật cấu hình và xác thực nguồn gốc, chọn công cụ và viết lý do.',
        'Băm cùng một mật khẩu hai lần bằng thuật toán có muối, quan sát hai kết quả khác nhau và giải thích.',
        'Xem chuỗi chứng chỉ của một trang thật và chỉ ra từng mắt xích ai ký cho ai.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lưu mật khẩu phải dùng hàm băm chậm chứ không dùng hàm băm nhanh?',
          a: 'Hàm nhanh cho phép thử hàng tỉ mật khẩu mỗi giây; hàm chậm làm việc dò trở nên quá tốn kém.',
        },
        {
          q: 'Muối trong hàm băm mật khẩu chống được kiểu tấn công nào?',
          a: 'Chống bảng tra sẵn: mỗi người một muối nên kẻ tấn công phải dò lại từ đầu cho từng tài khoản.',
        },
        {
          q: 'Mã hoá và ký số khác nhau ở mục đích nào?',
          a: 'Mã hoá giữ cho người khác không đọc được; ký số chứng minh nội dung đúng nguồn và chưa bị sửa.',
        },
      ],
      doneSignals: [
        'Bạn nhìn một đoạn mã là biết nó đang dùng sai công cụ mật mã.',
        'Không lần nào bạn định tự nghĩ ra thuật toán riêng nữa.',
      ],
    },
    {
      moduleId: 'security-s1-m3',
      objective:
        'Tự tay tái hiện được các lỗ hổng web phổ biến trong phòng lab cô lập của mình, rồi vá và viết test chặn hồi quy.',
      practice: [
        'Dựng một ứng dụng cố ý dễ tổn thương chạy trong container không nối ra Internet.',
        'Khai thác từng lỗ hổng và chụp lại bằng chứng, rồi vá và viết một test tự động chặn nó quay lại.',
        'Đổi định danh trong đường dẫn sang của người khác để tự kiểm chức năng phân quyền của mình.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lỗ hổng tham chiếu đối tượng trực tiếp lại phổ biến đến thế?',
          a: 'Vì giao diện chỉ hiện dữ liệu của bạn nên lập trình viên quên rằng ai cũng sửa được số trong đường dẫn.',
        },
        {
          q: 'Chống chèn mã bằng cách lọc ký tự lạ có đủ không?',
          a: 'Không — danh sách cấm luôn thiếu; phải tách dữ liệu khỏi câu lệnh bằng tham số hoặc mã hoá đúng ngữ cảnh.',
        },
        {
          q: 'Vì sao vá xong vẫn phải viết test hồi quy?',
          a: 'Lần tái cấu trúc sau rất dễ vô tình gỡ mất bản vá mà không ai nhận ra tới khi bị khai thác.',
        },
      ],
      doneSignals: [
        'Bạn tự tìm ra được lỗ hổng phân quyền trong dự án cũ của chính mình.',
        'Mỗi lỗ hổng đã vá đều có một test đỏ lên nếu bản vá bị gỡ.',
      ],
    },
    {
      moduleId: 'security-s1-m4',
      objective:
        'Thiết kế được luồng danh tính an toàn từ đăng nhập tới khôi phục tài khoản, và kiểm soát truy cập ở đúng tầng.',
      practice: [
        'Vẽ toàn bộ vòng đời một phiên đăng nhập từ lúc tạo tới lúc hết hạn hoặc bị thu hồi.',
        'Thử chiếm phiên bằng cách sao chép mã phiên sang trình duyệt khác, rồi tìm cách phát hiện và chặn.',
        'Rà lại luồng quên mật khẩu của một hệ thống bạn viết, tìm chỗ nó có thể bị lợi dụng để chiếm tài khoản.',
      ],
      selfCheck: [
        {
          q: 'Vì sao luồng khôi phục tài khoản thường là mắt xích yếu nhất?',
          a: 'Nó cố tình dễ dùng cho người quên mật khẩu, nên cũng là con đường dễ nhất cho kẻ giả danh.',
        },
        {
          q: 'Xác thực và phân quyền khác nhau thế nào?',
          a: 'Xác thực trả lời bạn là ai; phân quyền trả lời bạn được làm gì — thiếu vế sau là lỗ hổng phổ biến nhất.',
        },
        {
          q: 'Vì sao mã phiên phải đổi sau khi đăng nhập thành công?',
          a: 'Nếu giữ nguyên, kẻ tấn công đưa trước mã phiên cho nạn nhân sẽ chiếm được phiên đã đăng nhập.',
        },
      ],
      doneSignals: [
        'Bạn kiểm được quyền ở tầng máy chủ cho mọi thao tác, không dựa vào giao diện.',
        'Luồng khôi phục tài khoản của bạn chịu được bài thử giả danh.',
      ],
    },
  ],
  rubric: [
    {
      id: 'security-s1-r1',
      text: 'Phòng lab có ít nhất mười lỗ hổng cố ý, mỗi lỗ hổng kèm bằng chứng khai thác tái hiện được từng bước.',
      howToProve: 'Với mỗi lỗ hổng dán lệnh hoặc thao tác khai thác kèm ảnh chụp kết quả thu được.',
    },
    {
      id: 'security-s1-r2',
      text: 'Mỗi lỗ hổng đã được vá và có một test tự động đỏ lên ngay khi bản vá bị gỡ ra.',
      howToProve:
        'Gỡ thử một bản vá, chạy bộ test và cho thấy đúng ca kiểm tương ứng chuyển sang đỏ.',
    },
    {
      id: 'security-s1-r3',
      text: 'Phòng lab chỉ chạy trong container cô lập, không có cổng nào phơi ra ngoài máy của bạn.',
      howToProve:
        'Dán cấu hình container và kết quả liệt kê cổng đang mở cho thấy không có ánh xạ ra ngoài.',
    },
    {
      id: 'security-s1-r4',
      text: 'Báo cáo viết theo khuôn nghề: mỗi mục có mức độ, tác động thực tế và khuyến nghị khắc phục cụ thể.',
      howToProve:
        'Đưa báo cáo cho một người khác đọc và nhờ họ chỉ ra mục nào thiếu một trong ba phần bắt buộc.',
    },
    {
      id: 'security-s1-r5',
      text: 'Có mô hình mối đe doạ cho chính phòng lab, xếp thứ tự ưu tiên rủi ro kèm lý do xếp hạng.',
      howToProve:
        'Dán bảng xếp hạng rủi ro và giải thích vì sao mục đứng đầu lại đứng trên mục thứ hai.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tự dựng một ứng dụng web có mười lỗ hổng cố ý, khai thác từng cái rồi vá và viết test hồi quy.',
      'Mô hình mối đe doạ cho chính ứng dụng đó, có xếp hạng ưu tiên.',
      'Báo cáo viết theo khuôn nghề dành cho người sẽ đi sửa.',
    ],
    scopeDont: [
      'TUYỆT ĐỐI KHÔNG quét hay tấn công hệ thống của người khác, vì đó là hành vi phạm pháp bất kể mục đích học tập.',
      'KHÔNG phơi phòng lab ra Internet dù chỉ một phút, máy dễ tổn thương bị chiếm rất nhanh.',
      'KHÔNG dùng công cụ khai thác tự động ở chặng này, tự viết tay mới hiểu cơ chế.',
    ],
    touchpoints: [
      'Thư mục ứng dụng lab: mỗi lỗ hổng nằm ở một chức năng riêng, có ghi chú đánh dấu.',
      'Thư mục khai thác: mỗi lỗ hổng một kịch bản tái hiện được.',
      'Thư mục test hồi quy và tệp báo cáo cuối.',
    ],
    contracts: [
      'Mỗi lỗ hổng có một mã định danh dùng thống nhất ở mã lab, kịch bản khai thác, test và báo cáo.',
      'Container lab không khai báo bất kỳ ánh xạ cổng nào ra máy chủ.',
      'Dữ liệu trong lab toàn bộ là dữ liệu giả, không lấy từ hệ thống thật nào.',
    ],
    acceptance: [
      'Năm tiêu chí rubric ở trên đều đạt và có bằng chứng kèm theo.',
      'Người khác dựng lại lab theo README và tái hiện được ít nhất năm lỗ hổng.',
    ],
    invariants: [
      'Lab không bao giờ chạy ngoài môi trường cô lập.',
      'Mọi lỗ hổng đã vá đều có ít nhất một test canh, không có ngoại lệ.',
      'Báo cáo không chứa dữ liệu thật của bất kỳ người nào.',
    ],
    conventions: [
      'Đặt tên lỗ hổng theo phân loại chuẩn của ngành để tra cứu lại được.',
      'Mỗi bản vá đi kèm test trong cùng một commit, không tách ra sau.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

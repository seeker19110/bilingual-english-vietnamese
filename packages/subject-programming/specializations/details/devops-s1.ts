// details/devops-s1.ts — Chi tiết chặng S1 hướng DEVOPS ("Linux, mạng và tự động hoá cơ bản").
// Bản đồ chặng nằm ở ../devops.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Luật riêng của hướng này ngay từ S1: thứ chưa DIỄN TẬP thì coi như chưa có. Một bản sao lưu
// chưa từng được khôi phục thử không phải là bản sao lưu, chỉ là một tệp nằm đâu đó.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DEVOPS_S1_DETAIL: SpecStageDetail = {
  stageId: 'devops-s1',
  modules: [
    {
      moduleId: 'devops-s1-m1',
      objective:
        'Vận hành được một máy chủ Linux qua dịch vụ nền và nhật ký hệ thống, chẩn đoán được máy hết tài nguyên loại nào.',
      practice: [
        'Đưa ứng dụng của bạn thành một dịch vụ tự khởi động lại khi hỏng, thử giết tiến trình để xem nó sống lại.',
        'Làm đầy ổ đĩa của một máy thử nghiệm rồi quan sát hệ thống hỏng theo cách nào trước tiên.',
        'Tắt hẳn đăng nhập bằng mật khẩu, chỉ để lại khoá công khai, rồi thử đăng nhập lại từ máy khác.',
      ],
      selfCheck: [
        {
          q: 'Vì sao chạy ứng dụng bằng dịch vụ nền tốt hơn chạy trong phiên đăng nhập?',
          a: 'Đóng phiên là tiến trình chết theo; dịch vụ nền sống độc lập, tự khởi động lại và có nhật ký chuẩn.',
        },
        {
          q: 'Máy hết mô tả tệp biểu hiện ra ngoài như thế nào?',
          a: 'Ứng dụng đột nhiên không mở được kết nối hay tệp mới dù CPU và bộ nhớ vẫn còn dư.',
        },
        {
          q: 'Vì sao đăng nhập bằng khoá công khai an toàn hơn mật khẩu?',
          a: 'Khoá riêng không bao giờ rời máy bạn nên đoán mò hay dò từ điển đều vô dụng.',
        },
      ],
      doneSignals: [
        'Máy chủ khởi động lại là ứng dụng tự lên, không cần bạn đăng nhập.',
        'Gặp máy chậm là bạn biết đo cái gì trước, không mò lung tung.',
      ],
    },
    {
      moduleId: 'devops-s1-m2',
      objective:
        'Chẩn đoán được sự cố mạng từ tên miền tới chứng chỉ bằng công cụ dòng lệnh, và cấu hình được máy chủ đứng trước.',
      practice: [
        'Lần theo một tên miền từ khâu phân giải tới lúc bắt tay bảo mật, ghi lại từng bước mất bao lâu.',
        'Cấu hình máy chủ đứng trước chuyển tiếp về ứng dụng, bật chứng chỉ và kiểm bằng trình duyệt máy khác.',
        'Đóng hết cổng trừ cổng cần thiết trên tường lửa, rồi tự quét lại máy mình để xác nhận.',
      ],
      selfCheck: [
        {
          q: 'Chứng chỉ hết hạn gây ra triệu chứng gì mà người dùng nhìn thấy?',
          a: 'Trình duyệt chặn hẳn và cảnh báo không an toàn, dù ứng dụng phía sau vẫn chạy hoàn toàn bình thường.',
        },
        {
          q: 'Máy chủ đứng trước mang lại lợi ích gì ngoài chuyển tiếp yêu cầu?',
          a: 'Kết thúc mã hoá, phục vụ tệp tĩnh, giới hạn tốc độ và cho phép đổi ứng dụng phía sau mà không đổi cổng ra ngoài.',
        },
        {
          q: 'Vì sao phải hỏi tên miền ở nhiều máy chủ phân giải khác nhau khi nghi ngờ sự cố?',
          a: 'Bản ghi mới lan không đồng đều, nên chỗ này thấy đúng chỗ kia vẫn trả giá trị cũ.',
        },
      ],
      doneSignals: [
        'Trang không mở được là bạn khoanh vùng được lỗi ở tầng nào trong vài phút.',
        'Quét lại máy chủ của mình không còn cổng nào mở ngoài dự tính.',
      ],
    },
    {
      moduleId: 'devops-s1-m3',
      objective:
        'Viết được kịch bản tự động dừng ngay khi có lỗi thay vì chạy tiếp, và giữ mọi bí mật ra ngoài kho mã.',
      practice: [
        'Viết một kịch bản cố tình có lệnh hỏng ở giữa, chạy hai lần có và không có chế độ dừng khi lỗi để so.',
        'Quét toàn bộ lịch sử kho mã tìm khoá bí mật đã lỡ commit, kể cả những commit đã bị ghi đè.',
        'Chạy kịch bản của bạn hai lần liên tiếp trên cùng một máy, xác nhận lần hai không làm hỏng gì.',
      ],
      selfCheck: [
        {
          q: 'Vì sao kịch bản không dừng khi gặp lỗi lại nguy hiểm hơn là hỏng hẳn?',
          a: 'Nó chạy tiếp trên giả định sai và có thể phá thứ đang tốt, còn hỏng hẳn thì bạn biết ngay mà sửa.',
        },
        {
          q: 'Xoá một khoá bí mật khỏi tệp rồi commit tiếp có đủ an toàn không?',
          a: 'Không — lịch sử vẫn giữ nguyên giá trị cũ, phải coi khoá đó đã lộ và xoay khoá mới.',
        },
        {
          q: 'Lũy đẳng nghĩa là gì với một kịch bản triển khai?',
          a: 'Chạy một lần hay mười lần đều cho ra cùng một trạng thái máy, không cộng dồn tác dụng phụ.',
        },
      ],
      doneSignals: [
        'Kịch bản của bạn hỏng là dừng ngay và in ra dòng lệnh gây lỗi.',
        'Quét kho mã không còn tìm thấy bí mật nào trong lịch sử.',
      ],
    },
    {
      moduleId: 'devops-s1-m4',
      objective:
        'Thiết lập được sao lưu tự động ra ngoài máy chủ và chứng minh khôi phục được bằng một lần diễn tập có bấm giờ.',
      practice: [
        'Đặt lịch sao lưu hằng ngày lên một nơi lưu trữ khác máy chủ, kiểm tra tệp thật sự có mặt ở đó.',
        'Dựng một máy trống rồi khôi phục từ bản sao lưu, bấm giờ từ lúc bắt đầu tới lúc dịch vụ chạy lại.',
        'Viết ra bằng số bạn chấp nhận mất bao nhiêu dữ liệu và chờ bao lâu, rồi đối chiếu với số vừa đo.',
      ],
      selfCheck: [
        {
          q: 'Vì sao sao lưu nằm cùng máy chủ gần như vô dụng?',
          a: 'Sự cố hay gặp nhất là mất luôn cả máy: ổ hỏng, xoá nhầm, bị chiếm quyền — bản sao chết theo.',
        },
        {
          q: 'Hai con số RPO và RTO nói lên điều gì khác nhau?',
          a: 'RPO là lượng dữ liệu chấp nhận mất tính bằng thời gian; RTO là thời gian chấp nhận dịch vụ ngừng.',
        },
        {
          q: 'Vì sao phải diễn tập khôi phục định kỳ chứ không chỉ một lần?',
          a: 'Hệ thống đổi liên tục, một thay đổi nhỏ có thể làm bản sao lưu thiếu thứ cần mà không ai biết.',
        },
      ],
      doneSignals: [
        'Bạn nói được lần khôi phục gần nhất là ngày nào và mất bao lâu.',
        'Mất trắng máy chủ không còn là thảm hoạ, chỉ là một quy trình có bấm giờ.',
      ],
    },
  ],
  rubric: [
    {
      id: 'devops-s1-r1',
      text: 'Từ một máy chủ trắng dựng lại được toàn bộ hệ thống trong dưới 30 phút, không thao tác tay ngoài kịch bản.',
      howToProve: 'Tạo máy mới, chạy kịch bản và quay lại toàn bộ quá trình có hiển thị đồng hồ.',
    },
    {
      id: 'devops-s1-r2',
      text: 'Sao lưu chạy tự động hằng ngày ra nơi lưu trữ ngoài máy chủ và có ít nhất một lần khôi phục thật đã bấm giờ.',
      howToProve:
        'Dán nhật ký của ba lần sao lưu gần nhất kèm biên bản lần khôi phục có ghi thời gian bắt đầu và kết thúc.',
    },
    {
      id: 'devops-s1-r3',
      text: 'Tên miền phục vụ qua kết nối mã hoá với chứng chỉ hợp lệ và tự gia hạn được, không cần can thiệp tay.',
      howToProve:
        'Kiểm chứng chỉ bằng công cụ dòng lệnh cho thấy ngày hết hạn, và dán cấu hình lịch gia hạn tự động.',
    },
    {
      id: 'devops-s1-r4',
      text: 'Không có bí mật nào nằm trong kho mã, kể cả trong lịch sử các commit đã bị ghi đè.',
      howToProve:
        'Chạy công cụ quét bí mật trên toàn bộ lịch sử kho mã và dán báo cáo kết quả rỗng.',
    },
    {
      id: 'devops-s1-r5',
      text: 'Mọi kịch bản triển khai chạy được nhiều lần liên tiếp mà trạng thái máy chủ không đổi thêm.',
      howToProve:
        'Chạy kịch bản hai lần liền, so sánh trạng thái dịch vụ và tệp cấu hình giữa hai lần.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Dựng một máy chủ chạy thật từ máy trắng tới ứng dụng có kết nối mã hoá, toàn bộ bằng kịch bản.',
      'Sao lưu tự động hằng ngày ra nơi lưu trữ ngoài máy chủ, kèm một lần diễn tập khôi phục.',
      'Tường lửa chỉ mở cổng cần thiết và đăng nhập chỉ bằng khoá công khai.',
    ],
    scopeDont: [
      'KHÔNG dựng cụm nhiều máy hay cân bằng tải, vì một máy chưa vận hành vững thì nhiều máy chỉ nhân lên rắc rối.',
      'KHÔNG dùng công cụ điều phối container ở chặng này, nó che mất phần Linux cần học.',
      'KHÔNG làm quy trình tích hợp tự động vội, để dành cho chặng sau.',
    ],
    touchpoints: [
      'Thư mục kịch bản dựng máy: cài gói, tạo người dùng, cấu hình dịch vụ nền.',
      'Tệp cấu hình máy chủ đứng trước và cấu hình chứng chỉ.',
      'Kịch bản sao lưu và kịch bản khôi phục, mỗi cái chạy độc lập được.',
    ],
    contracts: [
      'Mọi kịch bản nhận cấu hình qua biến môi trường, không ghi cứng địa chỉ hay tên miền vào mã.',
      'Kịch bản trả mã thoát khác không khi có bất kỳ bước nào hỏng, không nuốt lỗi.',
      'Tên tệp sao lưu chứa dấu thời gian theo chuẩn quốc tế để sắp xếp được bằng tên.',
    ],
    acceptance: [
      'Năm tiêu chí rubric ở trên đều đạt và có bằng chứng nhật ký hoặc bản quay màn hình.',
      'Người khác đọc README và dựng lại được cùng hệ thống trên máy chủ của họ.',
    ],
    invariants: [
      'Không bao giờ mở cổng ra Internet mà không ghi lại lý do trong tài liệu.',
      'Bản sao lưu chưa từng khôi phục thử thì không được tính là đã có sao lưu.',
      'Không kịch bản nào yêu cầu gõ mật khẩu bằng tay giữa chừng.',
    ],
    conventions: [
      'Kịch bản shell luôn bật chế độ dừng khi lỗi và báo lỗi biến chưa đặt.',
      'Mỗi thay đổi cấu hình máy chủ đều đi qua kho mã, không sửa thẳng trên máy.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

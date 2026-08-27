// details/devops-s2.ts — Chi tiết chặng S2 hướng DEVOPS ("Container và CI/CD").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DEVOPS_S2_DETAIL: SpecStageDetail = {
  stageId: 'devops-s2',
  modules: [
    {
      moduleId: 'devops-s2-m1',
      objective:
        'Đóng gói được ứng dụng thành ảnh container nhỏ, không chạy bằng quyền quản trị và không chứa bí mật.',
      practice: [
        'Giảm kích thước ảnh ít nhất một nửa bằng ảnh gốc tối thiểu và build nhiều tầng, ghi lại số đo trước sau.',
        'Chạy quét lỗ hổng ảnh và xử lý hết mức nghiêm trọng cao.',
        'Đổi sang người dùng thường trong container rồi kiểm ứng dụng vẫn chạy.',
      ],
      selfCheck: [
        {
          q: 'Container khác máy ảo ở điểm cốt lõi nào?',
          a: 'Container dùng chung nhân hệ điều hành, chỉ cách ly bằng namespace và cgroup nên nhẹ hơn nhưng ranh giới bảo mật yếu hơn.',
        },
        {
          q: 'Vì sao không nên chạy tiến trình bằng quyền quản trị trong container?',
          a: 'Một lỗ hổng thoát container sẽ có ngay quyền cao trên máy chủ.',
        },
      ],
      doneSignals: [
        'Ảnh dựng lại từ cùng commit cho cùng kết quả.',
        'Không bí mật nào nằm trong tầng ảnh, kiểm bằng lệnh xem lịch sử ảnh.',
      ],
    },
    {
      moduleId: 'devops-s2-m2',
      objective:
        'Dựng được pipeline tự động build, kiểm chất lượng và phát hành, có đường quay lui nhanh.',
      practice: [
        'Chia pipeline thành các việc chạy song song và đo thời gian tường trước sau.',
        'Gắn cổng chất lượng chặn merge: lint, kiểm kiểu, test, quét bảo mật.',
        'Diễn tập quay lui về bản trước và bấm giờ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tạo tác phát hành phải có phiên bản cố định?',
          a: 'Để biết chính xác bản đang chạy là commit nào và quay lui về đúng thứ đã chạy được, không phải build lại.',
        },
        {
          q: 'Deploy theo tỷ lệ nhỏ trước có lợi gì?',
          a: 'Lỗi chỉ ảnh hưởng một phần người dùng và phát hiện được trước khi lan ra toàn bộ.',
        },
      ],
      doneSignals: [
        'Merge là tự deploy, không ai bấm nút thủ công.',
        'Biết chính xác quay lui mất bao nhiêu phút vì đã diễn tập.',
      ],
    },
    {
      moduleId: 'devops-s2-m3',
      objective:
        'Khai báo được hạ tầng bằng mã: dựng lại toàn bộ môi trường từ đầu mà không thao tác tay.',
      practice: [
        'Khai báo máy chủ, mạng và tường lửa bằng mã hạ tầng rồi huỷ và dựng lại một lần.',
        'Tách trạng thái hạ tầng ra nơi lưu chung và bật khoá để hai người không chạy đè nhau.',
        'Xem xét một thay đổi hạ tầng qua kế hoạch trước khi áp dụng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao trạng thái hạ tầng không được để trên máy cá nhân?',
          a: 'Mất máy là mất khả năng quản lý hạ tầng, và hai người chạy song song sẽ ghi đè nhau.',
        },
        {
          q: 'Sửa tay trên bảng điều khiển đám mây gây hậu quả gì?',
          a: 'Mã và thực tế lệch nhau, lần áp dụng sau sẽ đảo ngược hoặc phá hỏng thay đổi tay đó.',
        },
      ],
      doneSignals: [
        'Huỷ sạch môi trường thử rồi dựng lại bằng một lệnh.',
        'Không còn thay đổi tay nào nằm ngoài mã.',
      ],
    },
    {
      moduleId: 'devops-s2-m4',
      objective:
        'Chọn và cấu hình được dịch vụ đám mây với quyền tối thiểu và biết trước chi phí hằng tháng.',
      practice: [
        'Lập bảng chi phí ước tính hằng tháng cho kiến trúc của bạn, kèm khoản nào dễ vọt.',
        'Cấu hình quyền theo nguyên tắc tối thiểu và thử một thao tác bị từ chối đúng như mong đợi.',
        'Bật cảnh báo chi phí khi vượt ngưỡng.',
      ],
      selfCheck: [
        {
          q: 'Khoản chi phí đám mây nào hay gây bất ngờ nhất?',
          a: 'Lưu lượng đi ra và các dịch vụ tính theo lượt gọi — chúng tăng theo người dùng chứ không cố định.',
        },
        {
          q: 'Quyền tối thiểu nghĩa là gì trong thực hành?',
          a: 'Mỗi thành phần chỉ được cấp đúng hành động trên đúng tài nguyên nó cần, không cấp quyền quản trị cho tiện.',
        },
      ],
      doneSignals: [
        'Nói được hoá đơn tháng tới rơi vào khoảng nào và vì sao.',
        'Không tài khoản nào đang mang quyền quản trị vì cho tiện.',
      ],
    },
  ],
  rubric: [
    {
      id: 'devops-s2-r1',
      text: 'Merge vào nhánh chính là tự động deploy, không có bước bấm tay.',
      howToProve:
        'Nhật ký pipeline của một lần merge thật, từ commit tới khi dịch vụ trả về khoẻ mạnh.',
    },
    {
      id: 'devops-s2-r2',
      text: 'Quay lui về bản trước xong trong dưới 5 phút, đã diễn tập thật.',
      howToProve: 'Bấm giờ một lần diễn tập, dán mốc thời gian bắt đầu và kết thúc.',
    },
    {
      id: 'devops-s2-r3',
      text: 'Toàn bộ hạ tầng khai báo bằng mã, dựng lại được từ con số không.',
      howToProve:
        'Huỷ môi trường thử rồi chạy lệnh dựng lại, dán kết quả kiểm tra sức khoẻ sau đó.',
    },
    {
      id: 'devops-s2-r4',
      text: 'Không bí mật nào nằm trong repo hay trong tầng ảnh container.',
      howToProve: 'Chạy công cụ quét bí mật trên repo và lệnh xem lịch sử ảnh, dán kết quả sạch.',
    },
    {
      id: 'devops-s2-r5',
      text: 'Ảnh container không chạy bằng quyền quản trị và đã qua quét lỗ hổng.',
      howToProve: 'Dán kết quả quét và lệnh kiểm định danh người dùng đang chạy trong container.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Pipeline từ commit tới sản xuất cho dự án cửa hàng.',
      'Hạ tầng khai báo bằng mã: máy chủ, mạng, tường lửa, CSDL quản lý sẵn.',
      'Cơ chế quay lui và cảnh báo chi phí.',
    ],
    scopeDont: [
      'KHÔNG dựng cụm điều phối container đầy đủ — quy mô một dịch vụ chưa cần, và nó là cả một chặng riêng.',
      'KHÔNG tự dựng hệ thống giám sát; dùng dịch vụ sẵn có.',
      'KHÔNG tối ưu chi phí trước khi có hoá đơn thật để nhìn.',
    ],
    touchpoints: [
      'Tệp khai báo pipeline trong repo ứng dụng.',
      'Thư mục mã hạ tầng tách riêng, có trạng thái lưu chung.',
      'Tệp dựng ảnh container và kịch bản khởi động.',
    ],
    contracts: [
      'Mỗi bản phát hành có nhãn phiên bản gắn với commit, dùng chung cho ảnh và bản ghi triển khai.',
      'Endpoint kiểm tra sức khoẻ là hợp đồng giữa ứng dụng và hệ thống deploy.',
      'Biến môi trường bắt buộc được liệt kê ở một chỗ, thiếu là dừng khởi động ngay.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, có nhật ký thật kèm theo.',
      'Một người khác theo tài liệu của bạn dựng lại được môi trường.',
    ],
    invariants: [
      'Không thay đổi hạ tầng nào tồn tại ngoài mã.',
      'Không bản phát hành nào lên sản xuất mà chưa qua cổng chất lượng.',
      'Bí mật chỉ nằm trong kho bí mật, không trong repo và không trong nhật ký.',
    ],
    conventions: [
      'Cổng chất lượng chạy song song, tên cổng bắt buộc không được đổi tuỳ tiện.',
      'Mỗi thay đổi hạ tầng đi qua một lần xem xét như xem xét mã.',
      'Tài liệu vận hành cập nhật cùng lúc với thay đổi, không để nợ lại.',
    ],
  },
}

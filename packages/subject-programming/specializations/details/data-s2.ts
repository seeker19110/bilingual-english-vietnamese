// details/data-s2.ts — Chi tiết chặng S2 hướng DỮ LIỆU ("Kỹ sư dữ liệu — đường ống").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DATA_S2_DETAIL: SpecStageDetail = {
  stageId: 'data-s2',
  modules: [
    {
      moduleId: 'data-s2-m1',
      objective:
        'Viết được bước nạp dữ liệu gia tăng chạy lại nhiều lần cho cùng kết quả, không nhân đôi bản ghi.',
      practice: [
        'Nạp một ngày dữ liệu ba lần liên tiếp và đếm số dòng để chứng minh không nhân đôi.',
        'Giữ nguyên bản thô của nguồn rồi dựng lại lớp sạch hoàn toàn từ nó.',
        'Đánh dấu mốc đã xử lý bằng cột thời gian hoặc số thứ tự, xử lý ca dữ liệu tới muộn.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải giữ dữ liệu thô nguyên vẹn?',
          a: 'Logic biến đổi chắc chắn sẽ sai hoặc đổi; có bản thô thì dựng lại được, không có thì mất vĩnh viễn.',
        },
        {
          q: 'Dữ liệu của ngày hôm qua tới muộn sau khi đã chạy xong thì sao?',
          a: 'Phải chạy bù đúng khoảng ngày đó và bước nạp phải ghi đè sạch phần đó thay vì cộng thêm.',
        },
      ],
      doneSignals: [
        'Chạy lại một ngày bất kỳ cho ra đúng con số như lần đầu.',
        'Xoá lớp sạch rồi dựng lại từ lớp thô mà không cần gọi lại nguồn.',
      ],
    },
    {
      moduleId: 'data-s2-m2',
      objective:
        'Mô hình hoá được dữ liệu phân tích thành bảng sự kiện và bảng chiều để câu hỏi nghiệp vụ trả lời bằng một truy vấn.',
      practice: [
        'Chuyển schema vận hành của cửa hàng thành một bảng sự kiện đơn hàng và ba bảng chiều.',
        'Cài chiều biến đổi chậm cho bảng khách hàng, giữ lịch sử đổi địa chỉ.',
        'Viết năm câu hỏi nghiệp vụ và trả lời cả năm chỉ bằng truy vấn trên lớp phục vụ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao không phân tích thẳng trên CSDL vận hành?',
          a: 'Truy vấn phân tích nặng làm chậm hệ thống bán hàng, và schema vận hành tối ưu cho ghi chứ không cho tổng hợp.',
        },
        {
          q: 'Chiều biến đổi chậm giải quyết vấn đề gì?',
          a: 'Giữ được giá trị tại thời điểm phát sinh sự kiện, để báo cáo quá khứ không đổi khi dữ liệu hiện tại đổi.',
        },
      ],
      doneSignals: [
        'Người không kỹ thuật đọc tên bảng và cột là hiểu, không cần từ điển riêng.',
        'Báo cáo tháng trước chạy lại hôm nay vẫn ra cùng số.',
      ],
    },
    {
      moduleId: 'data-s2-m3',
      objective:
        'Dựng được đồ thị phụ thuộc các bước, chạy lại được một phần và cảnh báo khi trễ hạn.',
      practice: [
        'Khai báo pipeline dạng đồ thị phụ thuộc, cố tình cho một bước hỏng để xem bước sau có bị chặn không.',
        'Chạy bù ba mươi ngày quá khứ và ghi lại tổng thời gian.',
        'Đặt ngưỡng thời gian hoàn thành và gửi cảnh báo khi vượt.',
      ],
      selfCheck: [
        {
          q: 'Vì sao bước sau phải bị chặn khi bước trước hỏng?',
          a: 'Chạy tiếp trên dữ liệu thiếu sinh ra báo cáo sai mà không ai biết — im lặng còn tệ hơn dừng.',
        },
        {
          q: 'Chạy bù khác chạy hằng ngày ở chỗ nào?',
          a: 'Chạy bù xử lý nhiều ngày quá khứ nên phải giới hạn đồng thời và tuyệt đối lũy đẳng.',
        },
      ],
      doneSignals: [
        'Nhìn một màn hình là biết hôm nay bước nào xong, bước nào trễ.',
        'Chạy lại một bước không phải chạy lại cả pipeline.',
      ],
    },
    {
      moduleId: 'data-s2-m4',
      objective: 'Cài được bộ kiểm chất lượng chặn dữ liệu hỏng trước khi nó tới người dùng cuối.',
      practice: [
        'Viết ít nhất tám kiểm tra: không rỗng, duy nhất, khoảng giá trị, khớp tổng với nguồn.',
        'Cho một kiểm tra thất bại có chủ đích và xác nhận pipeline dừng, có cảnh báo.',
        'Ghi lại nguồn gốc từng bảng: dữ liệu này sinh ra từ bảng nào, bước nào.',
      ],
      selfCheck: [
        {
          q: 'Kiểm tra chất lượng nên chặn hay chỉ cảnh báo?',
          a: 'Kiểm tra sống còn thì chặn; kiểm tra mang tính quan sát thì cảnh báo — phải phân loại rõ, không để lẫn.',
        },
        {
          q: 'Vì sao cần theo vết nguồn gốc dữ liệu?',
          a: 'Khi một con số sai, phải lần ngược được tới bảng và bước sinh ra nó thay vì đọc mò toàn bộ pipeline.',
        },
      ],
      doneSignals: [
        'Dữ liệu hỏng bị chặn ở pipeline chứ không bị phát hiện bởi người xem báo cáo.',
        'Trả lời được trong vài phút câu hỏi "con số này lấy từ đâu".',
      ],
    },
  ],
  rubric: [
    {
      id: 'data-s2-r1',
      text: 'Pipeline chạy tự động hằng ngày và chạy lại được cho một ngày bất kỳ trong quá khứ.',
      howToProve:
        'Chạy bù một ngày cũ, đối chiếu số dòng và tổng doanh thu trước sau — phải bằng nhau.',
    },
    {
      id: 'data-s2-r2',
      text: 'Có ít nhất tám kiểm tra chất lượng, thất bại là chặn bước tiếp theo.',
      howToProve:
        'Sửa một dòng dữ liệu cho vi phạm ràng buộc, dán nhật ký pipeline dừng đúng bước.',
    },
    {
      id: 'data-s2-r3',
      text: 'Lớp phục vụ trả lời được năm câu hỏi nghiệp vụ, mỗi câu bằng đúng một truy vấn.',
      howToProve: 'Dán năm truy vấn kèm kết quả và thời gian chạy.',
    },
    {
      id: 'data-s2-r4',
      text: 'Chạy lại toàn bộ pipeline hai lần liên tiếp cho ra dữ liệu giống hệt nhau.',
      howToProve: 'So khớp mã băm của bảng kết quả sau hai lần chạy.',
    },
    {
      id: 'data-s2-r5',
      text: 'Có bản đồ nguồn gốc chỉ ra mỗi bảng phục vụ sinh ra từ bảng thô nào.',
      howToProve: 'Sơ đồ hoặc bảng liệt kê sinh ra từ khai báo pipeline, không vẽ tay.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Pipeline hằng ngày từ CSDL vận hành của cửa hàng sang kho phân tích.',
      'Ba lớp dữ liệu: thô, sạch, phục vụ.',
      'Bộ kiểm chất lượng và cảnh báo khi trễ hoặc hỏng.',
    ],
    scopeDont: [
      'KHÔNG làm xử lý theo thời gian thực — nhu cầu thật ở đây là báo cáo ngày, làm luồng sự kiện chỉ tăng độ phức tạp.',
      'KHÔNG dựng bảng điều khiển đẹp; một trang biểu đồ tối giản là đủ.',
      'KHÔNG đưa dữ liệu cá nhân nhạy cảm vào kho phân tích.',
    ],
    touchpoints: [
      'Thư mục khai báo pipeline: mỗi bước một file, phụ thuộc khai báo rõ.',
      'Thư mục truy vấn biến đổi: một file cho mỗi bảng sạch và bảng phục vụ.',
      'Thư mục kiểm tra chất lượng đặt cạnh bảng mà nó canh.',
    ],
    contracts: [
      'Hợp đồng dữ liệu với nguồn: tên cột, kiểu, ý nghĩa và ai được phép đổi.',
      'Bảng phục vụ chỉ thêm cột, không đổi nghĩa cột cũ; đổi nghĩa là tạo cột mới.',
      'Mỗi bảng có cột thời điểm cập nhật để người dùng biết dữ liệu tới đâu.',
    ],
    acceptance: [
      'Năm tiêu chí rubric đạt, kèm nhật ký chạy thật.',
      'Một lần chạy bù ba mươi ngày hoàn tất, có ghi thời gian.',
    ],
    invariants: [
      'Chạy lại không bao giờ nhân đôi dữ liệu.',
      'Không bước nào chạy khi bước phụ thuộc phía trước chưa thành công.',
      'Dữ liệu thô không bao giờ bị sửa tại chỗ.',
    ],
    conventions: [
      'Bí mật kết nối lấy từ biến môi trường, không nằm trong khai báo pipeline.',
      'Tên bảng và cột đặt theo một quy ước duy nhất, viết ra thành tài liệu.',
      'Mọi thay đổi schema kho có phiên bản và quay lui được.',
    ],
  },
}

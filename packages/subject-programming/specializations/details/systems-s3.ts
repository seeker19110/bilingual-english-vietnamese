// details/systems-s3.ts — Chi tiết chặng S3 hướng HỆ THỐNG ("Hiệu năng và nhân hệ điều hành").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SYSTEMS_S3_DETAIL: SpecStageDetail = {
  stageId: 'systems-s3',
  modules: [
    {
      moduleId: 'systems-s3-m1',
      objective:
        'Giải thích được tốc độ chương trình bằng cơ chế phần cứng: phân cấp cache, dự đoán rẽ nhánh và lệnh vector.',
      practice: [
        'Viết hai bản của cùng một vòng lặp, một bản thân thiện cache và một bản không, rồi đo chênh lệch.',
        'Đếm số lần trượt cache bằng bộ đếm phần cứng để chứng minh nguyên nhân chênh lệch.',
        'Sắp lại bố cục dữ liệu để tránh việc nhiều luồng cùng ghi chung một dòng cache.',
      ],
      selfCheck: [
        {
          q: 'Vì sao duyệt mảng theo đúng thứ tự bộ nhớ lại nhanh hơn nhiều?',
          a: 'Bộ nhớ nạp theo từng dòng cache, duyệt tuần tự thì mỗi lần nạp dùng được trọn dòng.',
        },
        {
          q: 'Chia sẻ giả gây chậm bằng cách nào?',
          a: 'Hai lõi ghi hai biến khác nhau nhưng chung một dòng cache nên phải liên tục đồng bộ dòng đó.',
        },
      ],
      doneSignals: [
        'Bạn giải thích chênh lệch tốc độ bằng số liệu phần cứng, không bằng phỏng đoán.',
        'Bạn xem bố cục dữ liệu trước khi nghĩ tới việc thêm luồng.',
      ],
    },
    {
      moduleId: 'systems-s3-m2',
      objective:
        'Đo được hiệu năng một cách lặp lại và chọn đúng chỗ đáng tối ưu thay vì tối ưu chỗ dễ thấy.',
      practice: [
        'Dựng vi chuẩn có khởi động nóng, chạy ít nhất mười lần và báo cáo trung vị.',
        'Đọc flame graph để tìm hàm chiếm nhiều thời gian nhất trước khi sửa bất cứ dòng nào.',
        'Tính giới hạn cải thiện tối đa của một phần trước khi bỏ công tối ưu phần đó.',
      ],
      selfCheck: [
        {
          q: 'Vì sao vi chuẩn dễ tự lừa mình?',
          a: 'Trình biên dịch có thể loại bỏ phần tính toán không dùng tới, nên bạn đo một vòng lặp gần như rỗng.',
        },
        {
          q: 'Tối ưu phần chiếm 2% tổng thời gian thì lợi tối đa bao nhiêu?',
          a: 'Không quá 2%, dù có làm phần đó nhanh vô hạn; nên phải chọn phần chiếm nhiều thời gian trước.',
        },
      ],
      doneSignals: [
        'Mười lần đo của bạn lệch nhau rất ít, đủ để tin vào chênh lệch nhỏ.',
        'Bạn luôn có số đo gốc trước khi sửa dòng đầu tiên.',
      ],
    },
    {
      moduleId: 'systems-s3-m3',
      objective:
        'Làm việc được với mã mức nhân: hiểu lập lịch, bộ nhớ ảo và quan sát hệ thống đang chạy.',
      practice: [
        'Viết một module nhân ký tự đơn giản hoặc một chương trình quan sát chạy trong nhân.',
        'Đo số lời gọi hệ thống của một tiến trình đang chạy và giải thích các lời gọi nhiều nhất.',
        'Quan sát ảnh hưởng của phân trang khi chương trình dùng nhiều bộ nhớ hơn bộ nhớ vật lý.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lời gọi hệ thống đắt hơn lời gọi hàm thường?',
          a: 'Phải chuyển sang chế độ nhân, lưu và khôi phục trạng thái, nên tốn hơn nhiều lần.',
        },
        {
          q: 'Bộ nhớ ảo giúp gì cho việc cách ly tiến trình?',
          a: 'Mỗi tiến trình thấy không gian địa chỉ riêng nên không đọc ghi được vùng nhớ của tiến trình khác.',
        },
      ],
      doneSignals: [
        'Bạn nạp và gỡ được mã mức nhân mà không làm treo máy thử.',
        'Bạn quan sát được hoạt động hệ thống thật thay vì đoán từ log ứng dụng.',
      ],
    },
    {
      moduleId: 'systems-s3-m4',
      objective:
        'Viết được cấu trúc dữ liệu đồng thời và kiểm chứng tính đúng bằng công cụ chứ không bằng chạy thử vài lần.',
      practice: [
        'Cài một hàng đợi dùng thao tác nguyên tử cho một nhà sản xuất và một người tiêu thụ.',
        'Chạy công cụ phát hiện đua điều kiện với bốn luồng và ít nhất một triệu thao tác.',
        'Đọc lại mô hình bộ nhớ để đặt đúng hàng rào, rồi thử bỏ hàng rào để thấy lỗi xuất hiện.',
      ],
      selfCheck: [
        {
          q: 'Vì sao chạy thử không lỗi không chứng minh mã đồng thời là đúng?',
          a: 'Lỗi đua chỉ hiện ở một số thứ tự thực thi hiếm gặp, chạy thử thường không rơi vào thứ tự đó.',
        },
        {
          q: 'Hàng rào bộ nhớ để làm gì?',
          a: 'Ngăn bộ xử lý và trình biên dịch sắp xếp lại lệnh vượt qua điểm cần giữ thứ tự.',
        },
      ],
      doneSignals: [
        'Bạn kiểm chứng mã đồng thời bằng công cụ trước khi tin là đúng.',
        'Bạn chọn khoá thay vì lock-free khi lợi ích chưa đủ trả cho rủi ro.',
      ],
    },
  ],
  rubric: [
    {
      id: 'systems-s3-r1',
      text: 'Chương trình sau tối ưu nhanh hơn bản đầu ít nhất 5 lần, đo 10 lần với độ lệch dưới 5%.',
      howToProve: 'Dán bảng 10 lần đo của cả hai bản kèm cấu hình máy và cách cố định tần số.',
    },
    {
      id: 'systems-s3-r2',
      text: 'Mỗi bước tối ưu ghi rõ giả thuyết, số đo trước và số đo sau, với ít nhất bốn bước.',
      howToProve: 'Nộp nhật ký tối ưu theo từng bước kèm ảnh chụp profiler tương ứng.',
    },
    {
      id: 'systems-s3-r3',
      text: 'Kết quả tính toán của bản nhanh khớp bản gốc trên ít nhất 1.000 ca kiểm thử đối chiếu.',
      howToProve: 'Chạy bộ đối chiếu tự động và dán số ca đã so cùng số ca lệch.',
    },
    {
      id: 'systems-s3-r4',
      text: 'Có ít nhất một module nhân hoặc chương trình quan sát mức hệ thống chạy thật và in ra số liệu.',
      howToProve: 'Dán đầu ra thật của chương trình khi quan sát một tiến trình đang chạy.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tăng tốc một chương trình có thật bằng cách tối ưu theo số đo phần cứng.',
      'Viết một thành phần quan sát mức hệ thống để hiểu chương trình chạy ra sao.',
    ],
    scopeDont: [
      'Không đổi thuật toán và tối ưu vi mô cùng lúc, vì sẽ không tách được đóng góp của từng thay đổi.',
      'Không tối ưu phần chiếm tỉ lệ thời gian nhỏ chỉ vì phần đó dễ sửa.',
    ],
    touchpoints: [
      'Vòng lặp nóng của chương trình và bố cục dữ liệu nó đọc ghi.',
      'Kịch bản đo và cấu hình máy dùng để đo.',
    ],
    contracts: [
      'Đầu ra của bản tối ưu phải khớp bản gốc trên toàn bộ bộ đối chiếu.',
      'Mọi số đo báo cáo kèm số lần chạy và độ phân tán.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với số đo lặp lại được.',
      'Nhật ký tối ưu đủ để người khác dựng lại từng bước.',
    ],
    invariants: [
      'Không đánh đổi tính đúng để lấy tốc độ.',
      'Không đo trên máy có tiến trình nặng khác chạy nền.',
    ],
    conventions: [
      'Mọi kết quả đo ghi kèm phiên bản trình biên dịch và cờ tối ưu đã dùng.',
      'Mã mức nhân chỉ thử trên máy ảo, không thử trên máy làm việc chính.',
    ],
  },
}

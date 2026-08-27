// details/data-s3.ts — Chi tiết chặng S3 hướng DỮ LIỆU ("Quy mô và thời gian thực").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const DATA_S3_DETAIL: SpecStageDetail = {
  stageId: 'data-s3',
  modules: [
    {
      moduleId: 'data-s3-m1',
      objective:
        'Xử lý được khối dữ liệu lớn hơn bộ nhớ máy bằng định dạng cột, phân vùng và engine phân tán.',
      practice: [
        'Chuyển một tập dữ liệu lớn từ CSV sang định dạng cột có phân vùng rồi đo lại cùng một truy vấn.',
        'Tạo tình huống lệch phân bố khoá để thấy một phần việc chạy lâu hơn hẳn phần còn lại, rồi xử lý.',
        'Chạy một tác vụ tới mức tràn bộ nhớ và đọc nhật ký để hiểu nó tràn ở bước nào.',
      ],
      selfCheck: [
        {
          q: 'Định dạng cột nhanh hơn định dạng dòng ở loại truy vấn nào?',
          a: 'Truy vấn chỉ đọc vài cột trên nhiều dòng, vì không phải đọc các cột không dùng tới.',
        },
        {
          q: 'Lệch phân bố khoá gây hại thế nào khi xử lý phân tán?',
          a: 'Một phần việc ôm phần lớn dữ liệu nên chạy lâu nhất, cả tác vụ phải chờ đúng phần đó.',
        },
      ],
      doneSignals: [
        'Trước khi tăng tài nguyên máy, bạn xem phân bố khoá và lượng dữ liệu quét trước.',
        'Bạn chọn cách phân vùng dựa trên truy vấn thật, không phân vùng theo thói quen.',
      ],
    },
    {
      moduleId: 'data-s3-m2',
      objective:
        'Xây được luồng gần thời gian thực xử lý đúng cả khi sự kiện tới muộn hoặc tới không đúng thứ tự.',
      practice: [
        'Dựng luồng đọc sự kiện có cửa sổ thời gian và bơm thêm 5% sự kiện tới muộn để xem kết quả sai chỗ nào.',
        'Tách rõ thời gian sự kiện và thời gian xử lý trong mã, rồi kiểm lại số liệu theo múi giờ.',
        'So kết quả luồng với kết quả theo lô trên cùng một ngày dữ liệu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao lẫn thời gian sự kiện với thời gian xử lý là lỗi nặng?',
          a: 'Sự kiện tới muộn sẽ bị tính vào sai khung giờ, biểu đồ vẫn đẹp nhưng con số sai.',
        },
        {
          q: 'Đúng một lần đắt ở chỗ nào?',
          a: 'Phải giữ trạng thái và phối hợp giữa các bước, nên chậm và phức tạp hơn cách lặp lại an toàn.',
        },
      ],
      doneSignals: [
        'Số liệu luồng và số liệu theo lô của bạn khớp nhau hằng ngày, có bằng chứng.',
        'Bạn nêu rõ luồng chịu được sự kiện muộn tới bao lâu.',
      ],
    },
    {
      moduleId: 'data-s3-m3',
      objective:
        'Thiết kế và đọc được thực nghiệm A/B một cách trung thực, không dừng sớm để lấy kết quả đẹp.',
      practice: [
        'Tính cỡ mẫu và chốt ngày dừng trước khi chạy, lưu lại bản thiết kế có dấu thời gian.',
        'Phân tích đúng theo kế hoạch đã chốt, kể cả khi kết quả không như mong đợi.',
        'Phân biệt chỉ số dẫn dắt và chỉ số kết quả cho chính bài toán của mình.',
      ],
      selfCheck: [
        {
          q: 'Vì sao dừng thực nghiệm ngay khi thấy kết quả đẹp là gian lận?',
          a: 'Nhìn liên tục rồi dừng lúc có lợi làm tỉ lệ báo động giả tăng vọt, kết quả không còn đáng tin.',
        },
        {
          q: 'Khi không thể làm thực nghiệm thì suy luận nhân quả bằng cách nào?',
          a: 'Dùng thiết kế quan sát có kiểm soát yếu tố gây nhiễu, và nói rõ giả định của phương pháp.',
        },
      ],
      doneSignals: [
        'Bạn từ chối kết luận từ một thực nghiệm chưa đủ cỡ mẫu, kèm con số cụ thể.',
        'Mỗi thực nghiệm của bạn có bản thiết kế viết trước khi chạy.',
      ],
    },
    {
      moduleId: 'data-s3-m4',
      objective:
        'Kiểm soát được chi phí vận hành dữ liệu và giữ đúng nghĩa vụ bảo vệ dữ liệu cá nhân.',
      practice: [
        'Ước tính chi phí truy vấn hằng tháng rồi cắt bớt bằng phân vùng, chọn cột và lịch chạy hợp lý.',
        'Che hoặc băm các trường nhạy cảm ở tầng phục vụ và thêm test canh cho quy tắc đó.',
        'Viết vòng đời dữ liệu: giữ bao lâu, ai được xem, xoá theo yêu cầu bằng cách nào.',
      ],
      selfCheck: [
        {
          q: 'Ba cách rẻ nhất để giảm chi phí truy vấn trên đám mây là gì?',
          a: 'Đọc ít cột hơn, phân vùng để quét ít dữ liệu hơn, và chạy thưa hơn khi nghiệp vụ cho phép.',
        },
        {
          q: 'Vì sao che dữ liệu cá nhân phải làm ở tầng phục vụ?',
          a: 'Người phân tích truy cập qua tầng đó, nếu chỉ dặn nhau thì sớm muộn cũng có bảng lộ dữ liệu thật.',
        },
      ],
      doneSignals: [
        'Bạn nói được luồng của mình tốn khoảng bao nhiêu tiền mỗi tháng.',
        'Có test canh chặn việc lộ trường nhạy cảm ra bảng phân tích.',
      ],
    },
  ],
  rubric: [
    {
      id: 'data-s3-r1',
      text: 'Luồng xử lý đúng các sự kiện tới muộn tới 60 phút, kiểm bằng bộ dữ liệu thử có nhãn sẵn.',
      howToProve: 'Chạy bộ dữ liệu thử và dán bảng đối chiếu kết quả mong đợi với kết quả thật.',
    },
    {
      id: 'data-s3-r2',
      text: 'Số liệu luồng thời gian thực khớp số liệu theo lô với sai lệch dưới 0,1% trong bảy ngày liên tiếp.',
      howToProve: 'Dán bảng đối chiếu bảy ngày kèm truy vấn dùng để tính sai lệch.',
    },
    {
      id: 'data-s3-r3',
      text: 'Có ước tính chi phí vận hành hằng tháng và ngưỡng cảnh báo khi vượt 120% mức dự kiến.',
      howToProve: 'Nộp bảng chi phí theo truy vấn và ảnh chụp cấu hình cảnh báo đang bật.',
    },
    {
      id: 'data-s3-r4',
      text: 'Mọi trường nhạy cảm được che hoặc băm ở tầng phục vụ và có test tự động canh quy tắc này.',
      howToProve:
        'Chạy test canh cho một bảng có trường nhạy cảm và cho thấy nó đỏ khi bỏ lớp che.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Xây một luồng dữ liệu gần thời gian thực có đối chiếu với bản theo lô.',
      'Kiểm soát chi phí và quyền truy cập cho dữ liệu phục vụ phân tích.',
    ],
    scopeDont: [
      'Không xây kho dữ liệu cho toàn tổ chức trong đợt này, vì phạm vi đó cần hợp đồng dữ liệu giữa nhiều nhóm.',
      'Không thay công cụ điều phối đang chạy ổn định.',
    ],
    touchpoints: [
      'Nguồn sự kiện và nơi khai báo cửa sổ thời gian của luồng.',
      'Tầng phục vụ nơi đặt quy tắc che dữ liệu cá nhân.',
    ],
    contracts: [
      'Mỗi sự kiện có thời gian sự kiện riêng, tách khỏi thời gian hệ thống nhận được.',
      'Bảng kết quả có khoá duy nhất để chạy lại không tạo bản ghi trùng.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với bằng chứng truy vấn được.',
      'Có tài liệu vận hành ngắn: chạy lại thế nào khi luồng chết giữa chừng.',
    ],
    invariants: [
      'Chạy lại một khoảng thời gian không làm nhân đôi số liệu.',
      'Không có dữ liệu cá nhân thô trong bảng phục vụ phân tích.',
    ],
    conventions: [
      'Mọi mốc thời gian lưu theo giờ quốc tế, đổi sang giờ địa phương chỉ khi hiển thị.',
      'Truy vấn nặng phải ghi rõ lượng dữ liệu quét ước tính khi đưa vào lịch chạy.',
    ],
  },
}

// details/algo-s3.ts — Chi tiết chặng S3 hướng THUẬT TOÁN
// ("Quy hoạch động và kỹ thuật nâng cao").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ALGO_S3_DETAIL: SpecStageDetail = {
  stageId: 'algo-s3',
  modules: [
    {
      moduleId: 'algo-s3-m1',
      objective:
        'Nhận ra được bài quy hoạch động và phát biểu trạng thái cùng công thức chuyển trước khi viết dòng code nào.',
      practice: [
        'Giải 20 bài quy hoạch động thuộc bốn họ khác nhau, mỗi bài ghi trạng thái và chuyển trong năm dòng.',
        'Chuyển một lời giải đệ quy có nhớ sang bản lặp và giảm bộ nhớ xuống một chiều.',
        'Tự đặt lại một bài đã giải theo trạng thái khác để thấy cách chọn trạng thái đổi độ phức tạp ra sao.',
      ],
      selfCheck: [
        {
          q: 'Trạng thái trong quy hoạch động phải thoả tính chất gì?',
          a: 'Phải đủ thông tin để tính bước sau mà không cần nhớ lại cách đi tới trạng thái đó.',
        },
        {
          q: 'Vì sao thứ tự tính lại quan trọng?',
          a: 'Mỗi trạng thái chỉ tính được khi các trạng thái nó phụ thuộc đã có kết quả.',
        },
      ],
      doneSignals: [
        'Đọc đề xong bạn phát biểu được trạng thái trước khi gõ code.',
        'Bạn ước lượng độ phức tạp trước và số đo thực tế khớp với ước lượng.',
      ],
    },
    {
      moduleId: 'algo-s3-m2',
      objective:
        'Cài và kiểm chứng được các thuật toán chuỗi kinh điển thay vì chỉ gọi thư viện có sẵn.',
      practice: [
        'Cài ba thuật toán chuỗi từ đầu và kiểm mỗi cài đặt bằng đối chứng vét cạn trên dữ liệu ngẫu nhiên.',
        'Dùng băm chuỗi cho một bài rồi tự tạo trường hợp va chạm để thấy giới hạn của cách này.',
        'Áp dụng khoảng cách chỉnh sửa vào một bài toán thực tế như gợi ý sửa lỗi chính tả.',
      ],
      selfCheck: [
        {
          q: 'Vì sao băm chuỗi cần cẩn thận khi dùng trong thi đấu?',
          a: 'Có thể bị dựng dữ liệu gây va chạm, nên phải chọn mô-đun và cơ số đủ tốt hoặc dùng hai bộ băm.',
        },
        {
          q: 'Cấu trúc Aho-Corasick giải bài toán gì?',
          a: 'Tìm đồng thời nhiều mẫu trong một văn bản chỉ với một lần duyệt.',
        },
      ],
      doneSignals: [
        'Bạn kiểm cài đặt bằng đối chứng vét cạn trước khi tin nó đúng.',
        'Bạn chọn thuật toán chuỗi theo ràng buộc đề bài, không theo thói quen.',
      ],
    },
    {
      moduleId: 'algo-s3-m3',
      objective:
        'Xử lý được các bài toán rời rạc và hình học cơ bản mà không mắc lỗi tràn số hay sai số dấu phẩy động.',
      practice: [
        'Giải mười bài số học mô-đun, tổ hợp và hình học, trong đó ít nhất ba bài dễ tràn số.',
        'Ghi lại ba chỗ suýt tràn số hoặc sai số và cách đã xử lý.',
        'Cài sàng nguyên tố rồi đo thời gian trên giới hạn lớn nhất của đề.',
      ],
      selfCheck: [
        {
          q: 'Vì sao so sánh số thực bằng dấu bằng là bẫy?',
          a: 'Sai số dấu phẩy động làm hai giá trị đáng lẽ bằng nhau lại lệch một chút, nên phải so theo ngưỡng.',
        },
        {
          q: 'Nhân hai số lớn theo mô-đun cần lưu ý gì?',
          a: 'Tích trung gian có thể vượt kiểu số đang dùng, nên phải chọn kiểu đủ rộng hoặc nhân theo cách an toàn.',
        },
      ],
      doneSignals: [
        'Bạn kiểm giới hạn số trước khi chọn kiểu dữ liệu.',
        'Bạn dùng số nguyên thay cho số thực bất cứ khi nào bài toán cho phép.',
      ],
    },
    {
      moduleId: 'algo-s3-m4',
      objective:
        'Dùng thành thạo cấu trúc dữ liệu truy vấn khoảng và biết khi nào một cấu trúc phức tạp là thừa.',
      practice: [
        'Cài cây phân đoạn có cập nhật lười rồi dùng lại đúng bản cài đó cho năm bài khác nhau.',
        'So cây phân đoạn với cây chỉ số nhị phân trên cùng một bài để thấy khi nào bản đơn giản là đủ.',
        'Đo thời gian truy vấn trên dữ liệu lớn nhất của đề để xác nhận độ phức tạp thực tế.',
      ],
      selfCheck: [
        {
          q: 'Cập nhật lười giải quyết vấn đề gì?',
          a: 'Cho phép cập nhật cả một khoảng trong thời gian lôgarit thay vì sửa từng phần tử.',
        },
        {
          q: 'Khi nào cây chỉ số nhị phân là lựa chọn tốt hơn?',
          a: 'Khi chỉ cần tổng tiền tố và cập nhật điểm: mã ngắn hơn, hằng số nhỏ hơn và ít lỗi hơn.',
        },
      ],
      doneSignals: [
        'Bạn dùng lại một bản cài đặt đã kiểm kỹ thay vì viết lại mỗi lần.',
        'Bạn chọn cấu trúc đơn giản nhất còn đáp ứng được ràng buộc đề bài.',
      ],
    },
  ],
  rubric: [
    {
      id: 'algo-s3-r1',
      text: 'Có nhật ký ít nhất 10 kỳ thi, mỗi kỳ ghi rõ sai ở đâu và thiếu mảng kiến thức nào.',
      howToProve: 'Nộp nhật ký theo từng kỳ kèm liên kết tới bài đã nộp trong kỳ đó.',
    },
    {
      id: 'algo-s3-r2',
      text: 'Toàn bộ bài không giải được trong kỳ thi đều được giải lại trong vòng 7 ngày kèm ghi chú.',
      howToProve:
        'Đối chiếu danh sách bài chưa giải với thời điểm nộp lại thành công của từng bài.',
    },
    {
      id: 'algo-s3-r3',
      text: 'Số bài giải được trong hai giờ hoặc mức xếp hạng tăng ít nhất 30% sau ba tháng luyện.',
      howToProve: 'Nộp số liệu của kỳ đầu và kỳ cuối trong quãng ba tháng, cùng định dạng thi.',
    },
    {
      id: 'algo-s3-r4',
      text: 'Ít nhất 80% bài nộp có bộ sinh dữ liệu ngẫu nhiên đối chứng chạy trước khi nộp.',
      howToProve: 'Nộp kịch bản sinh dữ liệu và nhật ký đối chứng của các bài đã làm.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Luyện thi đấu có nhật ký và giải lại toàn bộ bài chưa làm được.',
      'Xây bộ cài đặt chuẩn dùng lại được cho các cấu trúc dữ liệu nâng cao.',
    ],
    scopeDont: [
      'Không học thuộc lời giải mẫu, vì mục tiêu là nhận ra dạng bài chứ không phải nhớ đáp án.',
      'Không chỉ làm bài trong vùng dễ chịu để tăng số lượng bài đã giải.',
    ],
    touchpoints: [
      'Kho mã chứa các bản cài đặt chuẩn và bộ sinh dữ liệu đối chứng.',
      'Nhật ký thi đấu và danh sách bài cần giải lại.',
    ],
    contracts: [
      'Mỗi bản cài đặt chuẩn ghi rõ độ phức tạp và giới hạn dữ liệu áp dụng được.',
      'Mỗi bài nộp có bộ sinh dữ liệu và bản giải vét cạn để đối chứng.',
    ],
    acceptance: [
      'Đạt đủ bốn tiêu chí rubric với số liệu thi đấu thật.',
      'Bộ cài đặt chuẩn đã được dùng lại ở ít nhất năm bài khác nhau.',
    ],
    invariants: [
      'Không nộp bài khi chưa kiểm ca biên nhỏ nhất và lớn nhất.',
      'Không bỏ qua bài khó sau kỳ thi; mọi bài chưa làm được đều phải quay lại.',
    ],
    conventions: [
      'Mỗi bản cài đặt lưu kèm một bài đã dùng nó để có ví dụ chạy thật.',
      'Ghi chú sau mỗi kỳ thi viết ngay trong ngày, khi còn nhớ mình nghĩ gì lúc làm bài.',
    ],
  },
}

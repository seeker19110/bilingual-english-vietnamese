// details/algo-s4.ts — Chi tiết chặng S4 hướng THUẬT TOÁN ("Chuyên gia — thuật toán trong hệ
// thống thật"). Bản đồ chặng ở ../algo.ts.
//
// Hướng NỀN nên chặng S4 cố ý không có sản phẩm riêng: người học mang tư duy thuật toán vào
// một hệ thống ĐANG CHẠY của chính mình. Rubric vì thế đòi cải thiện đo được trên tình huống
// thật, kèm chứng minh tính đúng — nhanh hơn mà sai thì không tính.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const ALGO_S4_DETAIL: SpecStageDetail = {
  stageId: 'algo-s4',
  modules: [
    {
      moduleId: 'algo-s4-m1',
      objective:
        'Dùng được cấu trúc dữ liệu xác suất để đổi một chút sai số lấy hàng chục lần bộ nhớ và độ trễ.',
      practice: [
        'Thay một tập kiểm tra trùng khổng lồ bằng Bloom filter, đo bộ nhớ trước sau và tỉ lệ báo nhầm thực tế.',
        'Đếm số người dùng duy nhất bằng HyperLogLog và so với số đếm chính xác trên cùng dữ liệu.',
        'Dựng tìm kiếm lân cận gần đúng cho một tập vector và đo đánh đổi giữa độ chính xác và thời gian trả lời.',
      ],
      selfCheck: [
        {
          q: 'Bloom filter sai theo chiều nào và vì sao chiều đó chấp nhận được?',
          a: 'Nó báo có nhầm nhưng không bao giờ báo không nhầm, nên dùng làm bộ lọc trước rồi kiểm chính xác sau.',
        },
        {
          q: 'Khi nào KHÔNG được dùng cấu trúc xác suất?',
          a: 'Khi một lần sai gây hậu quả không đảo ngược được, ví dụ tính tiền hay quyết định pháp lý.',
        },
      ],
      doneSignals: [
        'Nói được sai số mà cấu trúc bạn chọn cho phép, bằng con số chứ không bằng cảm giác.',
        'Có ít nhất một chỗ trong hệ thật đã thay bằng cấu trúc xác suất kèm số đo trước sau.',
      ],
    },
    {
      moduleId: 'algo-s4-m2',
      objective:
        'Nhận ra bài toán NP-khó sớm và chuyển sang lời giải xấp xỉ đủ tốt thay vì đuổi theo lời giải hoàn hảo.',
      practice: [
        'Lấy một bài xếp lịch hoặc chia tuyến trong dự án và chỉ ra vì sao tìm lời giải tối ưu là không khả thi.',
        'Cài một heuristic tham lam rồi cải thiện bằng tìm kiếm cục bộ, đo chất lượng lời giải sau mỗi bước.',
        'So lời giải xấp xỉ với cận dưới tính được để biết mình còn cách tối ưu bao xa.',
      ],
      selfCheck: [
        {
          q: 'Vì sao biết một bài là NP-khó lại có ích trong thực tế?',
          a: 'Vì bạn ngừng phí thời gian tìm lời giải hoàn hảo và chuyển sang xấp xỉ đủ tốt có giới hạn sai lệch.',
        },
        {
          q: 'Cận dưới dùng để làm gì khi đánh giá heuristic?',
          a: 'Để biết lời giải hiện tại cách tối ưu tối đa bao nhiêu, thay vì chỉ so với chính mình.',
        },
      ],
      doneSignals: [
        'Trình bày được cho người không chuyên vì sao lời giải đủ tốt là lựa chọn đúng ở đây.',
        'Lời giải xấp xỉ của bạn có con số nói rõ nó cách tối ưu bao xa.',
      ],
    },
    {
      moduleId: 'algo-s4-m3',
      objective:
        'Viết được thuật toán hợp với bộ nhớ thật: thân thiện cache, chia được để chạy song song, và chạy được khi dữ liệu lớn hơn RAM.',
      practice: [
        'Đổi cách duyệt một mảng hai chiều theo đúng thứ tự bộ nhớ và đo chênh lệch thời gian chạy.',
        'Chia một phép tính nặng thành các phần độc lập chạy song song, đo tăng tốc thực tế so với lý thuyết.',
        'Xử lý một tệp lớn hơn RAM bằng cách chia lô và trộn, xác nhận bộ nhớ dùng luôn nằm dưới ngưỡng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cùng độ phức tạp mà hai cách duyệt lại chênh lệch thời gian nhiều lần?',
          a: 'Vì một cách đọc liên tiếp trong bộ nhớ nên tận dụng được cache, cách kia nhảy lung tung nên trượt cache liên tục.',
        },
        {
          q: 'Tăng tốc khi chạy song song bị chặn bởi điều gì?',
          a: 'Bởi phần bắt buộc chạy tuần tự và chi phí đồng bộ, nên gấp đôi lõi không cho gấp đôi tốc độ.',
        },
      ],
      doneSignals: [
        'Bạn đo trước khi tối ưu và bỏ đi những tối ưu không cho cải thiện đo được.',
        'Chương trình của bạn giữ được mức bộ nhớ ổn định dù dữ liệu đầu vào lớn dần.',
      ],
    },
    {
      moduleId: 'algo-s4-m4',
      objective:
        'Trình bày được lời giải thành lời cho người khác hiểu, cả trong phỏng vấn lẫn khi dạy lại đồng đội.',
      practice: [
        'Giải một bài khó bằng cách nghĩ thành tiếng, làm rõ đề và nêu giả định trước khi viết dòng code đầu.',
        'Thiết kế một hệ thống trong 45 phút có ước lượng dung lượng và nêu rõ phần bạn cố ý bỏ qua.',
        'Dạy lại một thuật toán cho người chưa biết và nhờ họ giải thích lại để kiểm tra bạn dạy có tới không.',
      ],
      selfCheck: [
        {
          q: 'Vì sao làm rõ đề trước khi code lại quan trọng hơn tốc độ viết code?',
          a: 'Hiểu sai đề thì code nhanh chỉ dẫn tới lời giải sai nhanh hơn, và người phỏng vấn đánh giá chính bước này.',
        },
        {
          q: 'Dấu hiệu nào cho thấy bạn hiểu thuật toán đủ sâu?',
          a: 'Bạn giải thích được cho người ngoài ngành bằng ví dụ đời thường mà không cần thuật ngữ.',
        },
      ],
      doneSignals: [
        'Người nghe tóm tắt lại đúng ý tưởng của bạn sau khi bạn giải thích một lần.',
        'Bạn nêu được đánh đổi của lời giải chứ không chỉ nêu độ phức tạp.',
      ],
    },
  ],
  rubric: [
    {
      id: 'algo-s4-r1',
      text: 'Tìm được một điểm nghẽn thuật toán trong hệ thống thật và cải thiện đo được ít nhất mười lần ở tình huống thật.',
      howToProve: 'Dán số đo trước và sau trên cùng dữ liệu và cùng máy, kèm cách tạo lại phép đo.',
    },
    {
      id: 'algo-s4-r2',
      text: 'Chứng minh tính đúng của lời giải mới bằng test đối chiếu kết quả với bản cũ trên dữ liệu thật.',
      howToProve: 'Chạy bộ test đối chiếu trên tập dữ liệu lớn và dán số ca đã so khớp.',
    },
    {
      id: 'algo-s4-r3',
      text: 'Nêu rõ đánh đổi đã chọn, gồm sai số cho phép hoặc bộ nhớ tăng thêm, bằng con số cụ thể.',
      howToProve: 'Dán bảng đánh đổi ba cột: chỉ số, bản cũ, bản mới, kèm ngưỡng chấp nhận.',
    },
    {
      id: 'algo-s4-r4',
      text: 'Viết một bài giải thích đủ để người khác học lại được lời giải mà không cần đọc mã nguồn.',
      howToProve: 'Nhờ một người đọc bài rồi tự cài lại được ý tưởng chính và đối chiếu kết quả.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tìm và thay điểm nghẽn thuật toán trong một hệ thống đang chạy thật.',
      'Chứng minh tính đúng và đo cải thiện trên dữ liệu thật.',
      'Viết lại lời giải thành bài học cho người khác.',
    ],
    scopeDont: [
      'Không viết lại toàn bộ mô-đun chỉ để đổi thuật toán, vì phần sửa lớn làm số đo mất ý nghĩa.',
      'Không tối ưu phần chưa đo — mọi thay đổi phải bắt đầu từ một số đo có thật.',
      'Không dùng cấu trúc xác suất cho chỗ tính tiền, sai một lần là không đảo ngược được.',
    ],
    touchpoints: [
      'Hàm hoặc truy vấn đang là điểm nghẽn và nơi gọi nó.',
      'Bộ dữ liệu thật dùng để đo và để đối chiếu kết quả.',
      'Bộ test hiện có, nơi thêm test đối chiếu bản cũ và bản mới.',
    ],
    contracts: [
      'Bản mới nhận cùng đầu vào và trả kết quả tương đương bản cũ, trừ sai số đã công bố.',
      'Phép đo chạy lại được với cùng dữ liệu và cùng cấu hình máy.',
      'Sai số cho phép ghi rõ thành số, không mô tả bằng chữ.',
    ],
    acceptance: [
      'Đạt đủ 4 tiêu chí rubric, mỗi tiêu chí có số đo hoặc test kèm theo.',
      'Không chức năng nào đang chạy bị đổi hành vi ngoài phần đã công bố.',
    ],
    invariants: [
      'Kết quả nghiệp vụ không đổi so với bản cũ trong phạm vi sai số đã công bố.',
      'Bộ nhớ dùng không vượt ngưỡng đã đặt dù dữ liệu lớn dần.',
    ],
    conventions: [
      'Mọi tối ưu kèm một test canh giữ tính đúng, không chỉ kèm số đo tốc độ.',
      'Ghi lại phép đo đủ chi tiết để người khác chạy lại ra cùng kết luận.',
    ],
  },
}

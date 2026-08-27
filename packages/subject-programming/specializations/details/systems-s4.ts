// details/systems-s4.ts — Chi tiết chặng S4 hướng HỆ THỐNG ("Chuyên gia — trình biên dịch, máy
// ảo, hệ điều hành"). Bản đồ chặng ở ../systems.ts.
//
// Chặng dài nhất của cả 13 hướng (16–20 tuần) vì dự án của nó là thứ duy nhất không rút ngắn
// được: một ngôn ngữ chạy được, hoặc một nhân khởi động được. Lời khuyên soạn kèm: chọn MỘT
// trong hai đường (ngôn ngữ hoặc nhân) và đi tới cùng, đừng làm dở cả hai.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const SYSTEMS_S4_DETAIL: SpecStageDetail = {
  stageId: 'systems-s4',
  modules: [
    {
      moduleId: 'systems-s4-m1',
      objective:
        'Viết được trình biên dịch đủ vòng: từ chuỗi ký tự tới cây cú pháp, qua kiểm tra ngữ nghĩa rồi ra mã chạy được.',
      practice: [
        'Cài lexer và parser cho một ngôn ngữ nhỏ có biểu thức, hàm và điều kiện, kèm thông báo lỗi có số dòng.',
        'Thêm bước phân tích ngữ nghĩa bắt được biến chưa khai báo và sai kiểu trước khi sinh mã.',
        'Sinh mã cho biểu diễn trung gian rồi thêm một tối ưu đơn giản, đo chênh lệch trên chương trình mẫu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tách biểu diễn trung gian ra khỏi cú pháp lại đáng công?',
          a: 'Vì tối ưu và sinh mã làm việc trên cấu trúc gọn hơn, và đổi ngôn ngữ nguồn hay máy đích không phá phần còn lại.',
        },
        {
          q: 'Thông báo lỗi biên dịch tốt cần gì ngoài mô tả lỗi?',
          a: 'Cần vị trí chính xác và gợi ý sửa, vì phần lớn thời gian người dùng ngôn ngữ là đọc lỗi chứ không phải đọc tài liệu.',
        },
      ],
      doneSignals: [
        'Trình biên dịch của bạn chạy được chương trình mẫu có đệ quy và cấu trúc dữ liệu.',
        'Lỗi cú pháp và lỗi kiểu đều chỉ đúng dòng gây lỗi.',
      ],
    },
    {
      moduleId: 'systems-s4-m2',
      objective:
        'Hiểu và cài được runtime: máy ảo chạy bytecode và bộ thu gom rác không làm chương trình đứng quá lâu.',
      practice: [
        'Cài máy ảo dựa ngăn xếp chạy được tập lệnh của bạn, đo số lệnh mỗi giây trên chương trình mẫu.',
        'Cài thu gom rác đánh dấu quét, đo thời gian dừng dài nhất rồi cải thiện bằng cách chia theo thế hệ.',
        'Đo lượng bộ nhớ đỉnh trước và sau khi thêm thu gom rác trên cùng chương trình.',
      ],
      selfCheck: [
        {
          q: 'Thu gom rác theo thế hệ dựa trên giả thiết nào?',
          a: 'Phần lớn đối tượng chết rất trẻ, nên quét vùng mới thường xuyên còn vùng cũ thì thưa hơn.',
        },
        {
          q: 'Thời gian dừng dài của bộ thu gom rác ảnh hưởng gì tới chương trình thật?',
          a: 'Nó làm ứng dụng đơ ngay giữa thao tác người dùng, và đây mới là điều người ta cảm nhận được.',
        },
      ],
      doneSignals: [
        'Bạn nói được thời gian dừng dài nhất của bộ thu gom rác mình viết, bằng mili giây.',
        'Máy ảo chạy được chương trình có cấp phát nhiều mà không rò bộ nhớ.',
      ],
    },
    {
      moduleId: 'systems-s4-m3',
      objective:
        'Dựng được nhân hệ điều hành tối giản chạy trên máy ảo: khởi động, phân trang, lập lịch và một hệ thống tệp đơn giản.',
      practice: [
        'Cho nhân khởi động được trên máy ảo, in ra màn hình và nhận ngắt bàn phím.',
        'Bật bảng trang, cấp phát bộ nhớ cho hai tiến trình và chứng minh chúng không đọc được của nhau.',
        'Cài bộ lập lịch xoay vòng và chuyển ngữ cảnh, chạy hai tiến trình đếm số xen kẽ nhau.',
      ],
      selfCheck: [
        {
          q: 'Bảng trang cho phép hệ điều hành làm gì mà không có nó thì không làm được?',
          a: 'Tách không gian địa chỉ từng tiến trình, nên một tiến trình lỗi không phá bộ nhớ của tiến trình khác.',
        },
        {
          q: 'Chuyển ngữ cảnh phải lưu lại những gì?',
          a: 'Toàn bộ trạng thái nhìn thấy được của tiến trình: thanh ghi, con trỏ ngăn xếp và vị trí lệnh kế tiếp.',
        },
      ],
      doneSignals: [
        'Nhân của bạn chạy hai tiến trình xen kẽ mà không hỏng trạng thái của nhau.',
        'Truy cập bộ nhớ ngoài phần được cấp bị chặn thay vì âm thầm đọc rác.',
      ],
    },
    {
      moduleId: 'systems-s4-m4',
      objective:
        'Nhìn được lỗ hổng ở tầng thấp và dùng fuzzing để tìm lỗi mà mắt người và test tay không tìm ra.',
      practice: [
        'Viết một chương trình có lỗi tràn bộ đệm trong môi trường luyện tập của mình rồi bật từng lớp phòng thủ để xem lỗi khó khai thác thêm ra sao.',
        'Chạy fuzzing có dẫn hướng theo độ phủ lên chính trình biên dịch hoặc máy ảo bạn viết, tìm ít nhất một lỗi thật.',
        'Viết lại một bất biến quan trọng thành khẳng định kiểm được và bật nó trong bản dựng thử.',
      ],
      selfCheck: [
        {
          q: 'Vì sao fuzzing tìm được lỗi mà test viết tay bỏ sót?',
          a: 'Nó sinh hàng triệu đầu vào lạ theo hướng tăng độ phủ, còn người viết test chỉ nghĩ ra ca mình tưởng tượng được.',
        },
        {
          q: 'Các lớp phòng thủ như ngẫu nhiên hoá địa chỉ có làm lỗi biến mất không?',
          a: 'Không, chúng chỉ làm việc khai thác khó và kém tin cậy hơn; lỗi vẫn phải được sửa tận gốc.',
        },
      ],
      doneSignals: [
        'Fuzzing của bạn đã tìm ra ít nhất một lỗi thật và bạn có ca tái hiện nó.',
        'Bạn đọc được vì sao một đoạn mã tầng thấp là không an toàn trước khi nó gây sự cố.',
      ],
    },
  ],
  rubric: [
    {
      id: 'systems-s4-r1',
      text: 'Chạy được bộ chương trình mẫu không tầm thường, gồm đệ quy và ít nhất một cấu trúc dữ liệu động.',
      howToProve: 'Chạy bộ chương trình mẫu và dán đầu ra kèm cách dựng lại môi trường chạy.',
    },
    {
      id: 'systems-s4-r2',
      text: 'Có bộ test tự động và fuzzing đã tìm ra ít nhất một lỗi thật, kèm ca tái hiện lỗi đó.',
      howToProve: 'Dán đầu vào gây lỗi, commit sửa lỗi và test hồi quy tương ứng.',
    },
    {
      id: 'systems-s4-r3',
      text: 'Có tài liệu thiết kế giải thích các đánh đổi lớn, mỗi đánh đổi nêu phương án đã loại.',
      howToProve: 'Chỉ ra tài liệu và nhờ một người đọc tóm tắt lại được ba quyết định chính.',
    },
    {
      id: 'systems-s4-r4',
      text: 'Đo được hiệu năng lõi bằng số: số lệnh mỗi giây của máy ảo hoặc thời gian dừng của bộ thu gom rác.',
      howToProve: 'Dán kết quả đo trên cùng máy và cùng chương trình mẫu ở hai mốc cải tiến.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Chọn MỘT đường: một ngôn ngữ chạy được, hoặc một nhân khởi động được trên máy ảo.',
      'Viết bộ test tự động và chạy fuzzing lên chính sản phẩm của mình.',
      'Ghi tài liệu thiết kế nêu rõ đánh đổi đã chọn.',
    ],
    scopeDont: [
      'Không làm cả trình biên dịch lẫn nhân trong một chặng, vì làm dở cả hai thì không chứng minh được gì.',
      'Không đuổi theo hiệu năng trước khi chạy đúng — sai nhanh vẫn là sai.',
      'Không dùng thư viện làm hộ phần lõi đang học, vì phần đó chính là bài học.',
    ],
    touchpoints: [
      'Bộ phân tích cú pháp và biểu diễn trung gian, hoặc mã khởi động và bảng trang.',
      'Bộ test tự động và cấu hình fuzzing.',
      'Chương trình mẫu dùng để đo hiệu năng.',
    ],
    contracts: [
      'Tập lệnh hoặc lời gọi hệ thống được đặc tả bằng văn bản trước khi cài.',
      'Thông báo lỗi có vị trí chính xác trong mã nguồn đầu vào.',
      'Chương trình mẫu chạy lại nhiều lần cho cùng kết quả.',
    ],
    acceptance: [
      'Đạt đủ 4 tiêu chí rubric, mỗi tiêu chí có bằng chứng chạy lại được.',
      'Người khác dựng lại được môi trường và chạy được bộ chương trình mẫu.',
    ],
    invariants: [
      'Chương trình hợp lệ không bao giờ bị từ chối; chương trình sai luôn báo lỗi có vị trí.',
      'Tiến trình không đọc hay ghi được vùng nhớ ngoài phần được cấp.',
    ],
    conventions: [
      'Mỗi lỗi tìm được có một ca tái hiện trong bộ test trước khi sửa.',
      'Đánh đổi thiết kế ghi lại ngay khi quyết định, không viết bù sau.',
    ],
  },
}

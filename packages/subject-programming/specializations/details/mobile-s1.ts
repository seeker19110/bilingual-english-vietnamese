// details/mobile-s1.ts — Chi tiết chặng S1 hướng DI ĐỘNG ("App đầu tiên trên máy thật").
// Bản đồ chặng nằm ở ../mobile.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Trọng tâm S1 của hướng này là chữ THẬT trong "máy thật": chạy trên máy ảo là chưa xong.
// Vòng đời app và chuyện hệ điều hành tự giết tiến trình là thứ chỉ máy thật dạy được.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MOBILE_S1_DETAIL: SpecStageDetail = {
  stageId: 'mobile-s1',
  modules: [
    {
      moduleId: 'mobile-s1-m1',
      objective:
        'Chọn được nền tảng cho dự án của mình kèm lý do viết ra giấy, và cài được bản dựng lên điện thoại thật.',
      practice: [
        'Viết một trang so sánh native và đa nền tảng cho ĐÚNG dự án của bạn, không so sánh chung chung.',
        'Cài bản dựng lên điện thoại thật của mình, rồi tắt máy tính đi và mở app lên xem còn chạy không.',
        'Bật app, chuyển sang app khác vài phút rồi quay lại, ghi lại app mất gì và giữ được gì.',
      ],
      selfCheck: [
        {
          q: 'Vì sao chạy trên máy ảo không thay thế được chạy trên điện thoại thật?',
          a: 'Máy ảo không có giới hạn bộ nhớ thật, không bị hệ điều hành giết tiến trình và không có cảm ứng thật.',
        },
        {
          q: 'Hệ điều hành giết app đang chạy nền vào lúc nào?',
          a: 'Khi cần bộ nhớ cho app đang ở trước mặt người dùng; app phải tự lưu trạng thái trước đó.',
        },
        {
          q: 'Chọn đa nền tảng thì đánh đổi cái gì rõ nhất?',
          a: 'Được một mã nguồn cho hai hệ, đổi lại chậm hơn khi cần tính năng riêng của từng hệ và phụ thuộc cầu nối.',
        },
      ],
      doneSignals: [
        'App có icon và tên riêng nằm trên màn hình chính điện thoại của bạn.',
        'Nói được app mình mất dữ liệu ở tình huống nào và vì sao.',
      ],
    },
    {
      moduleId: 'mobile-s1-m2',
      objective:
        'Dựng được giao diện khai báo chạy mượt với danh sách dài và hiển thị đúng trên mọi kích thước màn kể cả khi xoay ngang.',
      practice: [
        'Đổ một danh sách 5.000 dòng vào màn hình, đo lại độ mượt trước và sau khi bật ảo hoá danh sách.',
        'Xoay điện thoại ngang ở từng màn, ghi lại màn nào bị cắt nội dung hoặc đè lên vùng tai thỏ.',
        'Tự vẽ lại một màn theo cách khai báo thuần: từ state suy ra giao diện, không sửa trực tiếp phần tử.',
      ],
      selfCheck: [
        {
          q: 'Vì sao danh sách dài phải ảo hoá thay vì dựng hết một lần?',
          a: 'Dựng hết tốn bộ nhớ và thời gian cho những dòng người dùng không nhìn thấy, máy yếu là giật ngay.',
        },
        {
          q: 'Vùng an toàn của màn hình là gì và bỏ qua nó thì sao?',
          a: 'Là phần màn không bị tai thỏ hay thanh điều hướng che; bỏ qua thì nút bị che và người dùng bấm không được.',
        },
        {
          q: 'Giao diện khai báo khác giao diện mệnh lệnh ở điểm cốt lõi nào?',
          a: 'Khai báo mô tả giao diện ứng với state hiện tại; mệnh lệnh phải tự nhớ và tự sửa từng thay đổi.',
        },
      ],
      doneSignals: [
        'Cuộn danh sách dài không thấy khựng trên máy đời cũ nhất bạn có.',
        'Xoay ngang mọi màn đều đọc được, không mất nút nào.',
      ],
    },
    {
      moduleId: 'mobile-s1-m3',
      objective:
        'Cài đặt được điều hướng nhiều tầng giữ nguyên trạng thái khi xoay máy và mở đúng màn từ liên kết sâu.',
      practice: [
        'Dựng điều hướng ngăn xếp lồng trong thanh tab, thử bấm lùi ở từng nhánh xem có về đúng chỗ không.',
        'Xoay máy khi đang ở màn thứ ba của một luồng, xác nhận vẫn ở đúng màn với đúng dữ liệu đã nhập.',
        'Mở app bằng một liên kết sâu trỏ thẳng vào màn chi tiết, kiểm tra nút lùi vẫn có đường về hợp lý.',
      ],
      selfCheck: [
        {
          q: 'Vì sao truyền dữ liệu giữa các màn bằng biến toàn cục là bẫy?',
          a: 'Màn nào cũng ghi được nên không truy được nguồn; app bị khôi phục lại là biến rỗng mà màn vẫn mở.',
        },
        {
          q: 'Xoay máy làm gì với màn hình đang mở?',
          a: 'Nhiều hệ dựng lại toàn bộ màn, nên thứ chỉ nằm trong bộ nhớ tạm mà không được lưu sẽ mất.',
        },
        {
          q: 'Liên kết sâu mở thẳng màn trong cùng thì nút lùi phải làm gì?',
          a: 'Phải dựng sẵn ngăn xếp hợp lý để người dùng lùi về màn cha, không đá thẳng ra khỏi app.',
        },
      ],
      doneSignals: [
        'Xoay máy ở bất kỳ màn nào cũng không mất dữ liệu đang nhập dở.',
        'Gửi một liên kết sâu cho người khác, họ mở ra đúng màn bạn định.',
      ],
    },
    {
      moduleId: 'mobile-s1-m4',
      objective:
        'Lưu được dữ liệu bền qua lần tắt app, nâng cấp cấu trúc dữ liệu bản cũ mà không làm mất dữ liệu người dùng.',
      practice: [
        'Chọn giữa lưu khoá-giá trị và cơ sở dữ liệu nhúng cho dự án của bạn, viết ra lý do bằng số lượng bản ghi.',
        'Cài bản cũ, nhập ít dữ liệu, rồi cài đè bản mới có schema khác và xác nhận dữ liệu cũ còn nguyên.',
        'Đưa một chuỗi giả làm mã bí mật vào kho khoá của hệ điều hành thay vì lưu chung với dữ liệu thường.',
      ],
      selfCheck: [
        {
          q: 'Khi nào lưu khoá-giá trị không còn đủ và phải chuyển sang cơ sở dữ liệu?',
          a: 'Khi cần truy vấn, lọc, sắp xếp hoặc số bản ghi lớn — đọc hết rồi lọc trong bộ nhớ sẽ chậm và tốn RAM.',
        },
        {
          q: 'Vì sao migration trên di động khó hơn trên máy chủ?',
          a: 'Mỗi điện thoại giữ một phiên bản dữ liệu khác nhau và bạn không chạy lệnh trên máy họ được.',
        },
        {
          q: 'Dữ liệu nhạy cảm để trong tệp thường của app có an toàn không?',
          a: 'Không — máy đã bẻ khoá hoặc bản sao lưu đều đọc được; phải để trong kho khoá do hệ điều hành bảo vệ.',
        },
      ],
      doneSignals: [
        'Tắt app hoàn toàn rồi mở lại, dữ liệu còn nguyên vẹn.',
        'Nâng cấp từ bản cũ lên bản mới không lần nào mất dữ liệu thử nghiệm.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mobile-s1-r1',
      text: 'App có ít nhất ba màn với điều hướng thật, xoay máy ở màn bất kỳ không mất trạng thái đang nhập.',
      howToProve: 'Quay màn hình cảnh nhập dở dữ liệu rồi xoay máy hai lần, dữ liệu vẫn còn.',
    },
    {
      id: 'mobile-s1-r2',
      text: 'Dữ liệu chi tiêu bền qua lần tắt app hoàn toàn và qua một lần nâng cấp phiên bản có đổi schema.',
      howToProve:
        'Cài bản cũ, nhập năm bản ghi, cài đè bản mới rồi mở lại cho thấy đủ năm bản ghi.',
    },
    {
      id: 'mobile-s1-r3',
      text: 'Bản dựng cài chạy được trên điện thoại thật, có icon riêng và tên app riêng trên màn hình chính.',
      howToProve: 'Chụp ảnh màn hình chính điện thoại thật có icon app, kèm ảnh app đang mở.',
    },
    {
      id: 'mobile-s1-r4',
      text: 'Biểu đồ chi tiêu theo tháng vẽ đúng từ dữ liệu đã lưu và chạy hoàn toàn khi tắt mạng.',
      howToProve: 'Bật chế độ máy bay, mở app và quay lại cảnh biểu đồ vẫn hiện đủ số liệu.',
    },
  ],
  specBrief: {
    scopeDo: [
      'App sổ chi tiêu chạy hoàn toàn ngoại tuyến: thêm, sửa, xoá khoản chi và xem biểu đồ theo tháng.',
      'Lưu dữ liệu bằng cơ sở dữ liệu nhúng, có đường nâng cấp schema từ bản trước.',
      'Bản dựng cài được lên điện thoại thật của chính bạn.',
    ],
    scopeDont: [
      'KHÔNG làm đồng bộ lên máy chủ vì đồng bộ kéo theo tài khoản, xung đột và mạng — để dành chặng sau.',
      'KHÔNG đưa lên cửa hàng ứng dụng ở chặng này, thủ tục xét duyệt không dạy thêm kỹ năng lập trình nào.',
      'KHÔNG làm nhiều loại tiền tệ, một loại là đủ để học xong phần lưu trữ.',
    ],
    touchpoints: [
      'Thư mục màn hình: danh sách khoản chi, thêm hoặc sửa khoản chi, biểu đồ tháng.',
      'Tầng dữ liệu: khai schema, các hàm đọc ghi, và tệp migration theo số phiên bản.',
      'Tệp cấu hình bản dựng: tên app, icon, định danh gói.',
    ],
    contracts: [
      'Số tiền lưu bằng số nguyên đơn vị nhỏ nhất, không dùng số thực để tránh sai lệch cộng dồn.',
      'Mọi hàm đọc ghi dữ liệu nằm sau một tầng duy nhất, màn hình không chạm thẳng vào cơ sở dữ liệu.',
      'Ngày giờ lưu theo chuẩn quốc tế, chuyển sang giờ địa phương chỉ khi hiển thị.',
    ],
    acceptance: [
      'Bốn tiêu chí rubric ở trên đều đạt và có bằng chứng quay màn hình hoặc ảnh chụp.',
      'Người khác lấy mã về dựng được bản cài trên máy họ theo đúng hướng dẫn trong README.',
    ],
    invariants: [
      'Không thao tác nào của người dùng làm mất dữ liệu đã lưu mà không hỏi lại.',
      'App mở được và dùng được đầy đủ khi không có mạng.',
      'Tổng chi của một tháng luôn bằng tổng các khoản chi trong tháng đó.',
    ],
    conventions: [
      'Đặt tên màn hình theo việc người dùng làm, không theo tên component kỹ thuật.',
      'Mỗi thay đổi schema là một tệp migration mới, không sửa tệp migration đã phát hành.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

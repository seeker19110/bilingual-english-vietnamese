// details/web-s1.ts — Chi tiết chặng S1 hướng WEB ("Nền web vững — trình duyệt thật sự làm gì").
// Bản đồ chặng nằm ở ../web.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Lưu ý hai tầng: chặng này ĐÃ có bài học 8 bước ở `p6-u16`…`p6-u18` (xem ../stageUnits.ts).
// Chi tiết chặng KHÔNG thay thế bài học — bài học dạy từng khái niệm chấm được bằng test-case,
// còn file này là bản đồ luyện tay + nghiệm thu dự án chặng.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const WEB_S1_DETAIL: SpecStageDetail = {
  stageId: 'web-s1',
  modules: [
    {
      moduleId: 'web-s1-m1',
      objective:
        'Giải thích được bằng lời và bằng DevTools chuyện gì xảy ra từ lúc gõ URL tới lúc thấy pixel, và vì sao giao diện đứng hình.',
      practice: [
        'Mở tab Network của một trang bất kỳ, xếp các yêu cầu theo thứ tự thời gian rồi tự kể lại câu chuyện tải trang đó.',
        'Viết một vòng lặp chạy 3 giây trong trình duyệt, quan sát nút bấm ngừng phản hồi, rồi chuyển việc đó sang xử lý bất đồng bộ.',
        'Đặt một `setTimeout(…, 0)` và một `Promise.resolve().then(…)` cạnh nhau, đoán thứ tự in ra trước khi chạy.',
      ],
      selfCheck: [
        {
          q: 'Vì sao một phép tính nặng trong JavaScript làm cả trang không bấm được?',
          a: 'JavaScript chạy trên một luồng dùng chung với việc dựng hình; luồng bận thì sự kiện phải xếp hàng chờ.',
        },
        {
          q: 'Microtask và macrotask khác nhau ở chỗ nào khi chạy?',
          a: 'Microtask chạy hết sạch ngay sau tác vụ hiện tại, trước khi trình duyệt lấy macrotask kế tiếp.',
        },
        {
          q: 'Tab Network nói cho bạn biết điều gì mà đọc mã nguồn không biết?',
          a: 'Thứ tự thật, thời gian thật và kích thước thật của từng yêu cầu, gồm cả thứ tải chậm chặn phần còn lại.',
        },
      ],
      doneSignals: [
        'Nhìn một trang lạ là chỉ ra được yêu cầu nào đang làm trang chậm.',
        'Không còn giải thích lỗi giao diện bằng câu "chắc do máy chậm".',
      ],
    },
    {
      moduleId: 'web-s1-m2',
      objective:
        'Dựng được bố cục nhiều vùng bằng Grid và Flex, chạy đúng từ màn điện thoại lên màn lớn mà không cần viết lại.',
      practice: [
        'Dựng một bố cục ba vùng bằng Grid, rồi dựng lại đúng bố cục đó bằng Flex và viết ra hai dòng so sánh.',
        'Bắt đầu từ màn 360px rồi mở rộng dần, chỉ thêm điểm ngắt khi bố cục thật sự gãy chứ không thêm sẵn.',
        'Thay toàn bộ mã màu ghi cứng trong một trang bằng biến CSS, đổi một biến để thấy cả trang đổi theo.',
      ],
      selfCheck: [
        {
          q: 'Khi nào chọn Grid thay vì Flex cho một bố cục?',
          a: 'Khi cần sắp theo cả hai chiều cùng lúc; Flex hợp với một chiều và các phần tử tự co giãn.',
        },
        {
          q: 'Vì sao thiết kế từ màn nhỏ lên lại dễ hơn từ màn lớn xuống?',
          a: 'Màn nhỏ ép chọn thứ thật sự quan trọng; mở rộng ra là thêm chỗ trống, còn thu hẹp lại là phải cắt bỏ.',
        },
        {
          q: 'Design token giải quyết vấn đề gì mà biến trong tệp CSS thường không giải quyết?',
          a: 'Nó đặt tên theo Ý NGHĨA chứ không theo màu, nên đổi chủ đề chỉ cần đổi giá trị, không đi sửa từng chỗ.',
        },
      ],
      doneSignals: [
        'Thu nhỏ cửa sổ trình duyệt từ từ mà không có đoạn nào bố cục vỡ.',
        'Đổi một biến màu là toàn trang đổi, không sót chỗ nào.',
      ],
    },
    {
      moduleId: 'web-s1-m3',
      objective:
        'Viết được component React trong đó mọi thứ nhìn thấy đều suy ra từ state, và biết chính xác khi nào KHÔNG cần useEffect.',
      practice: [
        'Tìm trong dự án của bạn một `useEffect` chỉ để tính giá trị dẫn xuất, xoá nó và tính thẳng khi dựng hình.',
        'Lấy hai component đang giữ state trùng nhau, nâng state lên cha rồi truyền xuống, xác nhận không còn lệch.',
        'Chia lại một component to theo dữ liệu nó cần chứ không theo khối giao diện nhìn thấy.',
      ],
      selfCheck: [
        {
          q: 'useEffect nên dùng cho loại việc nào là đúng mục đích?',
          a: 'Đồng bộ với thứ nằm NGOÀI React — mạng, hẹn giờ, đăng ký sự kiện — không phải để tính giá trị.',
        },
        {
          q: 'Hai chỗ giữ cùng một dữ liệu thì hỏng ở đâu?',
          a: 'Sớm muộn hai chỗ lệch nhau và không ai biết chỗ nào đúng; phải có đúng một nguồn sự thật.',
        },
        {
          q: 'Vì sao chia component theo giao diện lại hay dẫn tới truyền props lòng vòng?',
          a: 'Ranh giới giao diện không trùng ranh giới dữ liệu, nên dữ liệu phải đi xuyên qua các tầng không dùng tới nó.',
        },
      ],
      doneSignals: [
        'Chỉ ra được cho mỗi thứ trên màn hình nó đến từ state nào.',
        'Số `useEffect` trong dự án giảm đi sau khi rà lại, và không có lỗi mới.',
      ],
    },
    {
      moduleId: 'web-s1-m4',
      objective:
        'Dùng union phân biệt để bốn trạng thái màn hình không thể lẫn nhau, và kiểm dữ liệu API lúc chạy thay vì ép kiểu.',
      practice: [
        'Khai kiểu trạng thái màn hình dạng union có nhãn, để trình biên dịch báo lỗi khi bạn quên một nhánh.',
        'Tìm mọi chỗ dùng `as` cho dữ liệu từ mạng trong dự án và thay bằng kiểm bằng schema lúc chạy.',
        'Cố tình trả về dữ liệu thiếu trường từ API giả lập, xác nhận ứng dụng báo lỗi tử tế chứ không vỡ ở nơi khác.',
      ],
      selfCheck: [
        {
          q: 'Vì sao `as` không phải là cách kiểm dữ liệu từ máy chủ?',
          a: 'Nó chỉ tắt lời cảnh báo của trình biên dịch; lúc chạy không có ai kiểm gì cả, dữ liệu sai vẫn đi tiếp.',
        },
        {
          q: 'Union phân biệt hơn gì so với bốn biến boolean rời rạc?',
          a: 'Bốn boolean cho phép trạng thái vô nghĩa như vừa tải vừa lỗi; union chỉ cho đúng một nhãn tại một lúc.',
        },
        {
          q: 'Kiểu tĩnh của TypeScript tồn tại tới lúc nào?',
          a: 'Chỉ tới lúc biên dịch; mã chạy trong trình duyệt không còn kiểu nào cả.',
        },
      ],
      doneSignals: [
        'Thêm một trạng thái mới thì trình biên dịch tự chỉ ra mọi chỗ phải sửa.',
        'API trả dữ liệu lạ thì lỗi hiện ngay tại chỗ nhận, không lan đi xa.',
      ],
    },
    {
      moduleId: 'web-s1-m5',
      objective:
        'Đi hết được mọi luồng chính chỉ bằng bàn phím và đạt tương phản màu đủ chuẩn mà không cần công cụ nhắc.',
      practice: [
        'Rút phích chuột ra, thao tác trọn một luồng của dự án chỉ bằng phím Tab, Enter và Escape.',
        'Thay các thẻ `div` bấm được bằng thẻ ngữ nghĩa đúng, xem bao nhiêu dòng mã xử lý phím tự biến mất.',
        'Đo tương phản của mọi cặp màu chữ trên nền trong trang và ghi lại cặp nào chưa đạt.',
      ],
      selfCheck: [
        {
          q: 'Vì sao dùng HTML ngữ nghĩa trước rồi mới tới ARIA?',
          a: 'Thẻ chuẩn đã mang sẵn vai trò, tiêu điểm và hành vi bàn phím; ARIA chỉ mô tả thêm, không tự tạo hành vi.',
        },
        {
          q: 'Viền tiêu điểm bị xoá đi thì ai chịu thiệt?',
          a: 'Người dùng bàn phím mất dấu vị trí hiện tại và không biết mình đang đứng ở đâu trên trang.',
        },
        {
          q: 'Vùng chạm nhỏ hơn 44px gây khó cho ai nhất?',
          a: 'Người dùng điện thoại và người có vận động tay khó khăn — bấm trượt liên tục.',
        },
      ],
      doneSignals: [
        'Làm xong một đơn hàng thử mà không đụng vào chuột.',
        'Điểm Accessibility của công cụ đo không còn báo lỗi mức nghiêm trọng.',
      ],
    },
  ],
  rubric: [
    {
      id: 'web-s1-r1',
      text: 'Ứng dụng có ít nhất bốn màn định tuyến thật, bấm F5 ở màn bất kỳ vẫn ở đúng màn đó với đúng dữ liệu.',
      howToProve:
        'Quay màn hình cảnh mở từng màn rồi tải lại trang, cho thấy URL và nội dung khớp nhau.',
    },
    {
      id: 'web-s1-r2',
      text: 'Mỗi màn chính hiển thị đủ bốn trạng thái đang tải, rỗng, lỗi và có dữ liệu — không màn nào thiếu.',
      howToProve:
        'Chụp bốn ảnh cho một màn, dựng trạng thái lỗi bằng cách chặn yêu cầu trong công cụ nhà phát triển.',
    },
    {
      id: 'web-s1-r3',
      text: 'Luồng đặt hàng đi trọn được chỉ bằng bàn phím, viền tiêu điểm luôn nhìn thấy ở mọi bước.',
      howToProve:
        'Quay màn hình một lượt đi hết luồng, không dùng chuột, thấy rõ viền tiêu điểm di chuyển.',
    },
    {
      id: 'web-s1-r4',
      text: 'Điểm Accessibility của công cụ đo đạt từ 95 trở lên ở chế độ mobile trên toàn bộ các màn chính.',
      howToProve: 'Chạy công cụ đo trên từng màn, lưu báo cáo và dán lại số điểm của mỗi màn.',
    },
    {
      id: 'web-s1-r5',
      text: 'Toàn bộ màu chữ và màu nền lấy từ biến CSS đặt tên theo ý nghĩa, không còn mã màu ghi cứng trong component.',
      howToProve:
        'Tìm kiếm mã màu dạng thập lục phân trong thư mục component và cho thấy kết quả rỗng.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Giao diện quản trị cửa hàng phía client: danh sách món, chi tiết món, giỏ hàng, danh sách đơn.',
      'Dữ liệu lấy từ API giả lập chạy tại máy, có độ trễ giả để thấy trạng thái đang tải.',
      'Định tuyến thật bằng URL, mỗi màn có địa chỉ riêng chia sẻ được.',
    ],
    scopeDont: [
      'KHÔNG viết máy chủ thật ở chặng này — API thật là việc của chặng S2, làm sớm sẽ loãng trọng tâm giao diện.',
      'KHÔNG làm đăng nhập thật, chỉ giả lập một người dùng cố định vì xác thực kéo theo bảo mật chưa học.',
      'KHÔNG tối ưu tốc độ dựng hình khi chưa đo, đo trước rồi mới bàn.',
    ],
    touchpoints: [
      'Thư mục trang: mỗi màn một tệp, tên tệp trùng tên đường dẫn.',
      'Thư mục component dùng chung: nút, ô nhập, khung trạng thái rỗng và lỗi.',
      'Tệp khai báo biến CSS: toàn bộ màu, khoảng cách và cỡ chữ của ứng dụng.',
    ],
    contracts: [
      'Mọi dữ liệu từ API đi qua một hàm kiểm schema trước khi vào state, không có đường tắt.',
      'Trạng thái màn hình khai bằng union có nhãn: `loading` | `empty` | `error` | `ready`.',
      'Component dùng chung nhận màu qua biến CSS, không nhận mã màu qua props.',
    ],
    acceptance: [
      'Năm tiêu chí rubric ở trên đều đạt và có bằng chứng kèm theo.',
      'Người khác tải mã về, chạy đúng hai lệnh là mở được ứng dụng, không hỏi thêm.',
    ],
    invariants: [
      'Không màn nào để trắng khi đang tải hoặc khi lỗi — luôn có thứ để đọc.',
      'Không có mã màu ghi cứng bên ngoài tệp khai báo biến CSS.',
      'Mọi phần tử bấm được đều tới được bằng phím Tab.',
    ],
    conventions: [
      'Component đặt tên kiểu PascalCase, hàm tiện ích đặt tên kiểu camelCase.',
      'Comment tiếng Việt ở chỗ có quyết định, không comment lại điều mã đã nói rõ.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

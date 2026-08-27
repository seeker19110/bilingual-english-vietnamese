// details/web-s2.ts — Chi tiết chặng S2 hướng WEB ("Full-stack thật sự").
// Bản đồ chặng (module, dự án) nằm ở ../web.ts; file này chỉ bổ sung phần THI HÀNH ĐƯỢC:
// mục tiêu · bài luyện tay · câu tự kiểm · dấu hiệu đã nắm · rubric nghiệm thu · đặc tả mẫu.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const WEB_S2_DETAIL: SpecStageDetail = {
  stageId: 'web-s2',
  modules: [
    {
      moduleId: 'web-s2-m1',
      objective:
        'Thiết kế và viết được một API HTTP có tài nguyên rõ ràng, mã lỗi máy đọc được và phân trang không vỡ khi dữ liệu tăng.',
      practice: [
        'Viết 6 endpoint CRUD cho một tài nguyên, mỗi endpoint validate input bằng schema chứ không tin client.',
        'Đổi phân trang từ offset sang con trỏ (cursor) và đo lại thời gian ở trang thứ 500.',
        'Trả lỗi theo một hình dạng thống nhất `{ code, message }`; client ánh xạ `code` sang câu tiếng Việt.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phân trang bằng offset chậm dần ở trang xa?',
          a: 'CSDL vẫn phải quét và bỏ qua toàn bộ bản ghi phía trước; con trỏ thì nhảy thẳng bằng index.',
        },
        {
          q: 'PUT khác PATCH ở điểm nào quan trọng nhất khi thi hành?',
          a: 'PUT thay toàn bộ tài nguyên nên gửi lại nhiều lần cho cùng kết quả; PATCH sửa một phần nên phải tự bảo đảm tính lặp lại.',
        },
        {
          q: 'Vì sao UI không được so khớp chuỗi thông báo lỗi?',
          a: 'Đổi câu chữ là UI gãy im lặng; mã lỗi mới là hợp đồng, câu chữ chỉ để người đọc.',
        },
      ],
      doneSignals: [
        'Người khác đọc danh sách endpoint là gọi được, không cần hỏi thêm.',
        'Thêm một trường mới vào response mà client cũ vẫn chạy bình thường.',
      ],
    },
    {
      moduleId: 'web-s2-m2',
      objective:
        'Thiết kế được schema quan hệ có ràng buộc thật và viết migration chạy được từ cơ sở dữ liệu trống.',
      practice: [
        'Dựng schema cửa hàng với khoá ngoại, `not null`, `check` và ràng buộc duy nhất — không để tầng ứng dụng gánh thay.',
        'Viết migration có phiên bản, chạy từ CSDL trống rồi chạy lại lần hai để kiểm tính lũy đẳng.',
        'Đọc `EXPLAIN` của một truy vấn chậm rồi thêm index đúng chỗ, ghi lại thời gian trước và sau.',
      ],
      selfCheck: [
        {
          q: 'Ràng buộc nên đặt ở CSDL hay ở tầng ứng dụng?',
          a: 'Ở CSDL: ứng dụng có nhiều đường ghi và có thể bị bỏ qua, còn CSDL là chốt chặn cuối cùng.',
        },
        {
          q: 'Vì sao migration phải chạy được từ CSDL trống?',
          a: 'Đó là đường cài mới và đường dựng lại sau sự cố; migration chỉ chạy đúng trên máy mình là bẫy kinh điển.',
        },
        {
          q: 'Khi nào thêm index lại làm hệ thống chậm đi?',
          a: 'Khi bảng ghi nhiều: mỗi lần ghi phải cập nhật thêm index, và index không được truy vấn dùng tới là chi phí thuần.',
        },
      ],
      doneSignals: [
        'Xoá sạch CSDL rồi dựng lại bằng lệnh migration, ứng dụng chạy như cũ.',
        'Chỉ ra được truy vấn nào dùng index nào, không đoán.',
      ],
    },
    {
      moduleId: 'web-s2-m3',
      objective:
        'Cài đặt được đăng nhập an toàn: mật khẩu băm, phiên có hạn, và mọi endpoint tự kiểm quyền ở server.',
      practice: [
        'Băm mật khẩu bằng thuật toán chậm có muối, thử đăng nhập sai 10 lần để thấy cơ chế chặn hoạt động.',
        'So sánh hai lựa chọn cookie phiên và token, viết lại lựa chọn của mình kèm cách chống giả mạo yêu cầu.',
        'Cố tình gọi API của người dùng khác bằng công cụ dòng lệnh và xác nhận server trả 403, không phải UI ẩn nút.',
      ],
      selfCheck: [
        {
          q: 'Ẩn nút "Xoá" ở giao diện có phải là kiểm quyền không?',
          a: 'Không. Đó chỉ là trang trí; ai cũng gọi thẳng API được nên quyền phải kiểm ở server.',
        },
        {
          q: 'Vì sao không tự nghĩ ra cách băm mật khẩu riêng?',
          a: 'Thuật toán chuẩn được thiết kế để chậm và chống bảng tra sẵn; tự chế gần như luôn nhanh và yếu.',
        },
        {
          q: 'Token để trong localStorage có rủi ro gì?',
          a: 'Mọi mã JavaScript trên trang đọc được, nên một lỗ hổng chèn kịch bản là mất phiên đăng nhập.',
        },
      ],
      doneSignals: [
        'Tự chỉ ra được mỗi endpoint kiểm quyền ở dòng nào.',
        'Không có endpoint nào tin `user_id` do client gửi lên.',
      ],
    },
    {
      moduleId: 'web-s2-m4',
      objective:
        'Quản lý được dữ liệu từ server ở client: tải, cache, thử lại, và luôn hiển thị đủ bốn trạng thái màn hình.',
      practice: [
        'Tách trạng thái server ra khỏi trạng thái giao diện; liệt kê những gì đang nằm nhầm chỗ trong dự án của bạn.',
        'Dựng đủ bốn trạng thái cho một màn: đang tải, rỗng, lỗi, có dữ liệu — chụp màn hình cả bốn.',
        'Bật giả lập mạng chậm và huỷ yêu cầu giữa chừng, kiểm tra không có dữ liệu cũ đè lên dữ liệu mới.',
      ],
      selfCheck: [
        {
          q: 'Vì sao dữ liệu server không nên nằm chung một kho toàn cục với trạng thái giao diện?',
          a: 'Dữ liệu server có tuổi thọ và cần làm mới; nhét chung khiến không biết dữ liệu đang cũ hay mới.',
        },
        {
          q: 'Trạng thái "rỗng" khác trạng thái "lỗi" thế nào với người dùng?',
          a: 'Rỗng là chưa có gì, mời tạo mới; lỗi là hệ thống hỏng, phải nói rõ và cho thử lại.',
        },
        {
          q: 'Hai yêu cầu trả về không đúng thứ tự gửi thì sao?',
          a: 'Kết quả cũ có thể ghi đè kết quả mới; phải huỷ yêu cầu cũ hoặc bỏ qua phản hồi lỗi thời.',
        },
      ],
      doneSignals: [
        'Không màn nào của dự án còn thiếu một trong bốn trạng thái.',
        'Tắt mạng giữa chừng thì ứng dụng báo lỗi tử tế, không treo trắng.',
      ],
    },
    {
      moduleId: 'web-s2-m5',
      objective:
        'Đưa được ứng dụng lên Internet công khai với HTTPS, biến môi trường và đường lui khi bản mới hỏng.',
      practice: [
        'Deploy lên một máy chủ thật, cấu hình chứng chỉ HTTPS và kiểm bằng trình duyệt ở máy khác.',
        'Tách toàn bộ bí mật ra biến môi trường, quét lại repo để chắc chắn không còn khoá nào bị commit.',
        'Diễn tập một lần quay về bản trước và bấm giờ xem mất bao lâu.',
      ],
      selfCheck: [
        {
          q: 'Vì sao bí mật không được nằm trong mã nguồn dù repo là riêng tư?',
          a: 'Lịch sử git giữ lại vĩnh viễn và repo có thể đổi trạng thái; lộ một lần là phải xoay khoá.',
        },
        {
          q: 'Deploy xong mới phát hiện lỗi nặng thì việc đầu tiên nên làm là gì?',
          a: 'Đưa hệ thống về bản chạy được trước đã, rồi mới ngồi tìm nguyên nhân.',
        },
      ],
      doneSignals: [
        'Người lạ mở được URL công khai và dùng thử không cần bạn ngồi cạnh.',
        'Bạn quay về bản trước được mà không cần build lại từ đầu.',
      ],
    },
  ],
  rubric: [
    {
      id: 'web-s2-r1',
      text: 'Đăng ký và đăng nhập chạy thật, mật khẩu lưu dưới dạng băm có muối — không có mật khẩu thô trong CSDL.',
      howToProve:
        'Truy vấn thẳng bảng người dùng và dán kết quả cho thấy cột mật khẩu là chuỗi băm.',
    },
    {
      id: 'web-s2-r2',
      text: 'Mọi endpoint ghi đều kiểm quyền ở server: người dùng A không đọc/sửa được dữ liệu của B.',
      howToProve:
        'Gọi API bằng token của A vào tài nguyên của B, chụp lại phản hồi 403 cho ít nhất 3 endpoint.',
    },
    {
      id: 'web-s2-r3',
      text: 'Migration có phiên bản, dựng lại toàn bộ CSDL từ trống bằng một lệnh và chạy lại được lần hai.',
      howToProve:
        'Xoá CSDL thử nghiệm, chạy lệnh migration hai lần liên tiếp, cả hai lần đều thoát mã 0.',
    },
    {
      id: 'web-s2-r4',
      text: 'URL công khai truy cập được qua HTTPS và mở được trên điện thoại của người khác.',
      howToProve: 'Nhờ một người mở link trên máy họ và gửi lại ảnh chụp màn hình có ổ khoá HTTPS.',
    },
    {
      id: 'web-s2-r5',
      text: 'Mỗi màn hình chính có đủ bốn trạng thái: đang tải, rỗng, lỗi, có dữ liệu.',
      howToProve:
        'Chụp bốn ảnh cho một màn, tạo lỗi bằng cách chặn API trong công cụ nhà phát triển.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Frontend, API và CSDL của một cửa hàng nhỏ: danh mục món, giỏ hàng, đơn hàng.',
      'Đăng nhập bằng email và mật khẩu, phiên có hạn.',
      'Deploy công khai kèm biến môi trường và đường quay lui.',
    ],
    scopeDont: [
      'KHÔNG làm thanh toán thật — chỉ ghi nhận đơn ở trạng thái chờ; thanh toán kéo theo tuân thủ pháp lý, để chặng sau.',
      'KHÔNG làm ứng dụng di động riêng ở chặng này.',
      'KHÔNG tối ưu hiệu năng trước khi có số đo — chỉ đo và ghi lại.',
    ],
    touchpoints: [
      'Thư mục frontend: trang danh sách món, trang đơn hàng, trang đăng nhập.',
      'Thư mục server: bộ định tuyến API, tầng truy cập CSDL, middleware xác thực.',
      'Thư mục migration: một file cho mỗi thay đổi schema, đặt tên có số thứ tự.',
    ],
    contracts: [
      'Kiểu dữ liệu giữa frontend và backend khai một lần ở gói dùng chung, hai bên cùng import.',
      'Lỗi trả về dạng `{ code: string; message: string }`; giao diện ánh xạ `code`, không đọc `message` để rẽ nhánh.',
      'Danh sách trả về luôn kèm con trỏ trang tiếp theo, `null` nghĩa là hết.',
    ],
    acceptance: [
      'Toàn bộ 5 tiêu chí rubric ở trên đạt, có bằng chứng kèm theo.',
      'Chạy từ máy trắng: cài phụ thuộc, chạy migration, khởi động — không thao tác tay ngoài kịch bản.',
    ],
    invariants: [
      'Không endpoint nào tin định danh người dùng do client gửi lên.',
      'Tổng tiền đơn hàng luôn bằng tổng các dòng hàng — có test canh.',
      'Không bí mật nào nằm trong mã nguồn hay lịch sử git.',
    ],
    conventions: [
      'Kiểm dữ liệu ngoài lúc chạy bằng schema, không tin kiểu tĩnh.',
      'Mỗi thao tác có thể hỏng đều có nhánh lỗi hiển thị được cho người dùng.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

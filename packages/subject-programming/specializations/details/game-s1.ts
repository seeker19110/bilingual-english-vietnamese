// details/game-s1.ts — Chi tiết chặng S1 hướng GAME ("Trò chơi hoàn chỉnh đầu tiên").
// Bản đồ chặng nằm ở ../game.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
//
// Đặc thù chặng này: tiêu chí khó nhất không phải kỹ thuật mà là HOÀN THÀNH. Rất nhiều người
// học làm game bỏ dở ở giữa, nên rubric đo cả việc đã phát hành và đã có người ngoài chơi thử.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const GAME_S1_DETAIL: SpecStageDetail = {
  stageId: 'game-s1',
  modules: [
    {
      moduleId: 'game-s1-m1',
      objective:
        'Viết được vòng lặp game chạy giống nhau trên máy nhanh và máy chậm, với máy trạng thái tách bạch cho màn hình và nhân vật.',
      practice: [
        'Nhân mọi chuyển động với khoảng thời gian giữa hai khung hình, rồi khoá khung hình xuống 30 để kiểm.',
        'Vẽ ra giấy máy trạng thái của nhân vật với mọi chuyển tiếp hợp lệ trước khi viết một dòng mã nào.',
        'Gộp mọi nguồn nhập liệu về một lớp trung gian, rồi thêm tay cầm mà không sửa mã điều khiển nhân vật.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cộng thẳng một hằng số vào vị trí mỗi khung hình lại sai?',
          a: 'Máy nhanh chạy nhiều khung hơn nên nhân vật đi nhanh hơn hẳn; tốc độ phải tính theo thời gian thật.',
        },
        {
          q: 'Máy trạng thái giúp gì so với một loạt biến boolean cho nhân vật?',
          a: 'Nó chặn các tổ hợp vô nghĩa như vừa nhảy vừa ngồi, và làm mọi chuyển tiếp trở nên nhìn thấy được.',
        },
        {
          q: 'Vì sao nên tách lớp trung gian cho nhập liệu?',
          a: 'Mã trò chơi chỉ quan tâm hành động chứ không quan tâm phím nào, nên thêm thiết bị mới không phải sửa nó.',
        },
      ],
      doneSignals: [
        'Game chạy cùng tốc độ trên hai máy có cấu hình khác nhau.',
        'Thêm một trạng thái mới cho nhân vật không làm hỏng trạng thái cũ.',
      ],
    },
    {
      moduleId: 'game-s1-m2',
      objective:
        'Dùng được vector và nội suy để chuyển động mượt, và cài đặt phát hiện va chạm đúng cho hình chữ nhật và hình tròn.',
      practice: [
        'Cài đặt phép cộng, nhân vô hướng và chuẩn hoá vector rồi dùng chúng thay cho tính từng trục riêng lẻ.',
        'Viết hàm kiểm va chạm hai hình chữ nhật, thử với trường hợp chạm đúng cạnh và trường hợp lồng nhau.',
        'Cho camera bám nhân vật bằng nội suy thay vì gán thẳng, so cảm giác giữa hai cách.',
      ],
      selfCheck: [
        {
          q: 'Vì sao phải chuẩn hoá vector hướng trước khi nhân với tốc độ?',
          a: 'Không chuẩn hoá thì đi chéo nhanh hơn đi thẳng, vì độ dài vector chéo lớn hơn.',
        },
        {
          q: 'Va chạm giữa hai hình chữ nhật kiểm bằng cách nào là đủ và nhanh?',
          a: 'Kiểm chồng lấn trên từng trục; chỉ cần một trục không chồng là chắc chắn không va chạm.',
        },
        {
          q: 'Nội suy camera mang lại cảm giác gì mà gán thẳng không có?',
          a: 'Camera đuổi theo mềm mại nên mắt người theo kịp, thay vì giật cứng mỗi khi nhân vật đổi hướng.',
        },
      ],
      doneSignals: [
        'Nhân vật đi chéo không còn nhanh hơn đi thẳng.',
        'Không còn trường hợp nhân vật lọt xuyên qua tường khi chạy nhanh.',
      ],
    },
    {
      moduleId: 'game-s1-m3',
      objective:
        'Chỉnh được cảm giác điều khiển bằng những tham số cụ thể và bằng vòng lặp chơi thử rồi sửa số, không sửa theo cảm hứng.',
      practice: [
        'Đưa gia tốc, ma sát và lực nhảy ra thành tham số chỉnh được lúc chạy, thử mười bộ số khác nhau.',
        'Thêm khoảng thời gian vẫn nhảy được sau khi rời mép, đo xem người chơi thử có thấy dễ hơn không.',
        'Thêm rung màn và âm thanh cho một hành động, cho người khác chơi thử hai bản có và không có.',
      ],
      selfCheck: [
        {
          q: 'Vì sao cho phép nhảy trong một khoảnh khắc sau khi đã rời mép lại làm game dễ chịu hơn?',
          a: 'Người chơi bấm trễ vài phần trăm giây là chuyện bình thường; cơ chế này tha thứ cho độ trễ đó.',
        },
        {
          q: 'Cảm giác chơi nên đánh giá bằng cách nào cho đáng tin?',
          a: 'Cho người chưa từng chơi thử và quan sát họ, vì bạn đã quen tay nên tự đánh giá luôn lệch.',
        },
        {
          q: 'Phản hồi hình ảnh và âm thanh phục vụ điều gì ngoài đẹp mắt?',
          a: 'Chúng xác nhận cho người chơi biết hành động đã có tác dụng, thiếu thì thao tác cảm giác vô hồn.',
        },
      ],
      doneSignals: [
        'Người chơi thử vượt qua màn đầu mà không cần bạn hướng dẫn.',
        'Bạn đổi cảm giác điều khiển bằng cách chỉnh số, không phải viết lại mã.',
      ],
    },
    {
      moduleId: 'game-s1-m4',
      objective:
        'Quản lý được tài nguyên hình ảnh và âm thanh cho game tải nhanh, rồi đóng gói và phát hành lên nền tảng công khai.',
      practice: [
        'Gộp các ảnh rời thành một tấm lớn, đo lại số lần tải và thời gian khởi động trước và sau.',
        'Gắn âm thanh vào đúng sự kiện trong mã thay vì phát rải rác, kiểm tra không có tiếng nào chồng lấn khó chịu.',
        'Đóng gói bản chơi được trên web và đưa lên một nền tảng công khai, tự chơi thử từ máy khác.',
      ],
      selfCheck: [
        {
          q: 'Vì sao gộp nhiều ảnh nhỏ vào một tấm lớn lại nhanh hơn?',
          a: 'Giảm số lần tải và số lần đổi kết cấu khi vẽ, hai thứ đều tốn hơn nhiều so với bản thân dữ liệu ảnh.',
        },
        {
          q: 'Phát hành sớm một bản nhỏ có lợi gì hơn hoàn thiện rồi mới đưa ra?',
          a: 'Bạn nhận phản hồi thật khi còn kịp sửa, và tránh được cảnh làm mãi không bao giờ xong.',
        },
        {
          q: 'Vì sao phải tự chơi thử bản đã phát hành từ máy khác?',
          a: 'Máy bạn đã có sẵn tài nguyên trong bộ đệm nên không phát hiện được lỗi thiếu tệp hay tải chậm.',
        },
      ],
      doneSignals: [
        'Người lạ mở đường liên kết là chơi được ngay, không cần cài gì.',
        'Bạn có ít nhất năm phản hồi thật từ người ngoài.',
      ],
    },
  ],
  rubric: [
    {
      id: 'game-s1-r1',
      text: 'Trò chơi đi trọn từ màn mở đầu qua phần chơi tới màn kết thúc mà không có lỗi chặn đường nào.',
      howToProve: 'Quay màn hình một lượt chơi trọn vẹn từ đầu tới cuối, không cắt ghép.',
    },
    {
      id: 'game-s1-r2',
      text: 'Giữ được 60 khung hình mỗi giây ổn định trên máy cấu hình trung bình trong suốt một lượt chơi.',
      howToProve:
        'Bật hiển thị số khung hình và quay lại toàn bộ lượt chơi cho thấy con số không tụt.',
    },
    {
      id: 'game-s1-r3',
      text: 'Tốc độ nhân vật không đổi giữa máy nhanh và máy chậm, chuyển động tính theo thời gian thật.',
      howToProve:
        'Khoá số khung hình xuống ba mức khác nhau và đo thời gian nhân vật đi hết cùng một đoạn.',
    },
    {
      id: 'game-s1-r4',
      text: 'Trò chơi đã đưa lên một nền tảng công khai và có ít nhất năm người ngoài chơi thử kèm phản hồi.',
      howToProve:
        'Dán đường liên kết công khai và tóm tắt năm phản hồi thu được, mỗi phản hồi một dòng.',
    },
    {
      id: 'game-s1-r5',
      text: 'Điểm số cao nhất lưu lại được qua lần tắt trình duyệt hoặc tắt ứng dụng.',
      howToProve: 'Chơi đạt một mức điểm, tắt hẳn rồi mở lại và cho thấy điểm vẫn còn.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Một trò chơi hai chiều chơi được khoảng mười phút, có menu, phần chơi chính và màn kết thúc.',
      'Lưu điểm cao nhất tại máy người chơi và hiển thị ở menu.',
      'Đóng gói chơi được trên trình duyệt và đưa lên một nền tảng công khai.',
    ],
    scopeDont: [
      'KHÔNG làm chơi mạng nhiều người, vì đồng bộ trạng thái qua mạng là cả một hướng riêng ở chặng sau.',
      'KHÔNG làm đồ hoạ ba chiều, hai chiều đã đủ dạy hết vòng lặp game và cảm giác chơi.',
      'KHÔNG tự vẽ toàn bộ tài nguyên, dùng bộ tài nguyên miễn phí để dồn sức vào phần chơi.',
    ],
    touchpoints: [
      'Vòng lặp chính: cập nhật trạng thái, xử lý va chạm, vẽ khung hình.',
      'Tệp tham số cảm giác chơi: gia tốc, ma sát, lực nhảy, thời gian tha thứ.',
      'Tầng quản lý tài nguyên và tầng lưu điểm tại máy.',
    ],
    contracts: [
      'Mọi chuyển động nhân được với khoảng thời gian giữa hai khung hình, không có ngoại lệ.',
      'Nhập liệu đi qua một lớp trung gian trả về hành động, mã trò chơi không đọc thẳng phím.',
      'Điểm lưu tại máy có kèm số phiên bản để bản sau đọc được dữ liệu bản trước.',
    ],
    acceptance: [
      'Năm tiêu chí rubric ở trên đều đạt và có bằng chứng quay màn hình hoặc đường liên kết.',
      'Có ít nhất năm người ngoài chơi thử và bạn đã ghi lại phản hồi của họ.',
    ],
    invariants: [
      'Không tình huống nào khiến người chơi kẹt cứng không thoát ra được.',
      'Điểm cao nhất không bao giờ giảm đi sau một lượt chơi điểm thấp.',
      'Trò chơi không bao giờ tải tài nguyên từ mạng ngoài trong lúc đang chơi.',
    ],
    conventions: [
      'Tham số cảm giác chơi để trong một tệp riêng, không rải hằng số trong mã.',
      'Tài nguyên đặt tên theo vai trò trong game, không theo tên tệp gốc tải về.',
      'Commit nhỏ theo conventional commits, mỗi commit một thay đổi logic.',
    ],
  },
}

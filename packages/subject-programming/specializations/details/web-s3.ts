// details/web-s3.ts — Chi tiết chặng S3 hướng WEB ("Nâng cao — hiệu năng, kiến trúc, chất lượng").
// Bản đồ chặng nằm ở ../web.ts; file này bổ sung phần THI HÀNH ĐƯỢC.
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const WEB_S3_DETAIL: SpecStageDetail = {
  stageId: 'web-s3',
  modules: [
    {
      moduleId: 'web-s3-m1',
      objective:
        'Chẩn đoán được web chậm bằng số đo trên thiết bị thật và sửa đúng nguyên nhân thay vì sửa theo cảm giác.',
      practice: [
        'Đo LCP, INP, CLS của chính dự án mình trên máy tầm trung với mạng 4G mô phỏng, ghi lại 3 lần đo.',
        'Sửa 3 nguyên nhân chậm nhất theo đúng thứ tự tác động, mỗi lần sửa đo lại ngay để biết bước nào có tác dụng.',
        'Cài ngân sách bundle có ngưỡng cứng chặn CI để kích thước không phình dần theo từng PR.',
      ],
      selfCheck: [
        {
          q: 'Vì sao đo hiệu năng trên máy của người lập trình lại cho kết quả sai lệch?',
          a: 'Máy làm việc mạnh và mạng nhanh hơn máy người dùng thật, nên che mất đúng phần chậm cần thấy.',
        },
        {
          q: 'INP đo cái gì mà LCP không đo được?',
          a: 'INP đo độ trễ phản hồi khi người dùng tương tác; LCP chỉ đo lúc nội dung lớn nhất hiện ra.',
        },
        {
          q: 'Vì sao ngân sách bundle phải chặn CI thay vì ghi trong tài liệu?',
          a: 'Tài liệu không chặn được ai; chỉ có cổng đỏ mới giữ được ngưỡng qua nhiều tháng và nhiều người.',
        },
      ],
      doneSignals: [
        'Nhìn waterfall là đoán được nguyên nhân chậm trước khi mở profiler, và đoán đúng phần lớn.',
        'Từ chối được một thư viện mới vì nó vượt ngân sách bundle, kèm số kB cụ thể.',
      ],
    },
    {
      moduleId: 'web-s3-m2',
      objective:
        'Chọn được cách render cho từng loại trang và giải thích lựa chọn bằng dữ liệu chứ không bằng sở thích.',
      practice: [
        'Chuyển một trang cần SEO sang render phía server và giữ nguyên hành vi cho người dùng.',
        'So HTML trả về lần đầu trước và sau khi chuyển, đo thời gian hiển thị nội dung đầu.',
        'Viết ra lý do vì sao hai trang còn lại KHÔNG nên chuyển — đây là phần khó hơn phần chuyển.',
      ],
      selfCheck: [
        {
          q: 'Hydration tốn kém ở chỗ nào?',
          a: 'Trình duyệt phải tải và chạy lại mã để gắn sự kiện lên HTML đã có, nên trang hiện sớm mà vẫn chưa bấm được.',
        },
        {
          q: 'Trang nào thì render phía client là lựa chọn đúng?',
          a: 'Trang sau đăng nhập, dữ liệu riêng từng người và không cần máy tìm kiếm đọc được.',
        },
      ],
      doneSignals: [
        'Nói được vì sao trang này SSR còn trang kia thì không, kèm số đo đi kèm.',
        'Đổi cách render mà không làm hỏng trạng thái đăng nhập hay dữ liệu đang nhập dở.',
      ],
    },
    {
      moduleId: 'web-s3-m3',
      objective:
        'Viết được bộ kiểm thử tự động giữ cho dự án lớn không vỡ khi nhiều người cùng sửa.',
      practice: [
        'Viết E2E cho 3 luồng chính, bám vào vai trò và nhãn truy cập chứ không bám vào class CSS.',
        'Cố ý làm hỏng một dòng lõi nghiệp vụ để chứng minh bộ test bắt được, rồi khôi phục lại.',
        'Thêm test ca biên: danh sách rỗng, null khác 0, số rất lớn, mạng chậm và request bị huỷ.',
      ],
      selfCheck: [
        {
          q: 'Vì sao E2E bám vào class CSS là bẫy?',
          a: 'Đổi giao diện là test đỏ hàng loạt dù chức năng vẫn đúng, cuối cùng cả đội bỏ luôn bộ test.',
        },
        {
          q: 'Một bộ test luôn xanh nói lên điều gì đáng ngờ?',
          a: 'Có thể nó chưa từng bắt lỗi nào; phải thử phá code để xác nhận test thật sự canh được.',
        },
      ],
      doneSignals: [
        'Người khác sửa code của bạn thì CI bắt lỗi, không phải người review phát hiện.',
        'Bộ E2E chạy trong CI dưới 10 phút và không đỏ ngẫu nhiên.',
      ],
    },
    {
      moduleId: 'web-s3-m4',
      objective:
        'Đặt được ranh giới module cho frontend lớn và bắt máy canh ranh giới đó thay vì trông vào kỷ luật cá nhân.',
      practice: [
        'Vẽ ranh giới module của dự án, mỗi module ghi rõ chịu trách nhiệm gì và KHÔNG được làm gì.',
        'Cài luật phụ thuộc bằng lint để import vi phạm là lỗi, thử vi phạm hai chiều để xác nhận luật nổ.',
        'Gom lại các component dùng chung thành một hệ thiết kế có tài liệu ngắn cho từng thành phần.',
      ],
      selfCheck: [
        {
          q: 'Vì sao chia thư mục theo loại file lại đuối khi dự án lớn?',
          a: 'Một tính năng nằm rải ở nhiều thư mục, sửa một việc phải mở năm chỗ và dễ bỏ sót.',
        },
        {
          q: 'Trạng thái từ server và trạng thái của giao diện nên để chung hay riêng?',
          a: 'Để riêng: dữ liệu server có cache và hết hạn, nhét chung vào store toàn cục là nguồn lỗi phổ biến nhất.',
        },
      ],
      doneSignals: [
        'Người mới vào dự án đặt file mới đúng chỗ mà không cần hỏi.',
        'Import vi phạm ranh giới bị lint chặn ngay trên máy, trước cả khi mở PR.',
      ],
    },
    {
      moduleId: 'web-s3-m5',
      objective:
        'Tự tấn công được ứng dụng của mình ở các lớp lỗ hổng web phổ biến và vá kèm test hồi quy.',
      practice: [
        'Thử XSS ở mọi ô nhập hiển thị lại, thử IDOR bằng cách đổi id trên URL sang tài khoản khác.',
        'Gọi một API tốn tiền 100 lần liên tiếp để kiểm tra rate limit và hạn mức theo người dùng.',
        'Bật Content Security Policy và đặt cookie phiên SameSite kèm HttpOnly, rồi kiểm lại luồng đăng nhập.',
      ],
      selfCheck: [
        {
          q: 'Vì sao ẩn nút trên giao diện không phải là kiểm quyền?',
          a: 'Ai cũng gọi thẳng API được; quyền phải kiểm ở server trên từng request.',
        },
        {
          q: 'IDOR xảy ra khi nào?',
          a: 'Khi server nhận id từ client mà không kiểm id đó có thuộc về người đang đăng nhập hay không.',
        },
      ],
      doneSignals: [
        'Mỗi lỗ hổng đã vá đều có một test hồi quy đỏ trước khi vá và xanh sau khi vá.',
        'Bạn kiểm quyền ở server cho mọi endpoint ghi, không dựa vào việc UI không hiển thị nút.',
      ],
    },
  ],
  rubric: [
    {
      id: 'web-s3-r1',
      text: 'Có báo cáo hiệu năng trước và sau: LCP ≤ 2,5s, INP ≤ 200ms ở lần đo sau, mỗi chỉ số đo lặp 3 lần.',
      howToProve: 'Dán bảng 3 chỉ số × 2 mốc đo kèm cấu hình máy và mạng đã dùng.',
    },
    {
      id: 'web-s3-r2',
      text: 'Ngân sách bundle có ngưỡng cứng chặn CI và kích thước ban đầu giảm ít nhất 20% so với lúc nhận dự án.',
      howToProve: 'Chạy lệnh kiểm ngân sách trong CI và dán số kB trước, sau kèm ngưỡng.',
    },
    {
      id: 'web-s3-r3',
      text: 'Bộ E2E phủ ít nhất 3 luồng chính, chạy trong CI dưới 10 phút và không đỏ ngẫu nhiên.',
      howToProve: 'Dán liên kết 3 lần chạy CI liên tiếp cùng kết quả và thời gian chạy.',
    },
    {
      id: 'web-s3-r4',
      text: 'Sửa ít nhất 2 lỗ hổng bảo mật tìm được, mỗi lỗ hổng kèm một test hồi quy tái hiện được.',
      howToProve: 'Chạy test hồi quy trên commit trước bản vá cho đỏ, trên commit sau cho xanh.',
    },
    {
      id: 'web-s3-r5',
      text: 'Trợ năng không tụt sau khi tối ưu: 0 vi phạm mức A và AA trên toàn bộ trang đã sửa.',
      howToProve: 'Chạy công cụ quét a11y tự động cho từng trang và dán số vi phạm bằng 0.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tối ưu hiệu năng và gia cố bảo mật cho một web app đang chạy thật.',
      'Bổ sung bộ kiểm thử tự động cho các luồng chính và cho ca biên.',
      'Đặt ranh giới module kèm luật phụ thuộc chặn bằng lint.',
    ],
    scopeDont: [
      'Không thiết kế lại giao diện — trộn hai việc thì không còn biết số đo cải thiện nhờ đâu.',
      'Không đổi khung ứng dụng hay thư viện nền, vì rủi ro lớn hơn nhiều so với lợi ích đợt này.',
      'Không đụng schema cơ sở dữ liệu trong cùng một đợt tối ưu.',
    ],
    touchpoints: [
      'Điểm vào ứng dụng và cấu hình đóng gói (nơi đặt ngân sách bundle và chia mã).',
      'Các trang thuộc luồng chính được chọn để đo và để viết E2E.',
      'Tầng gọi API và nơi kiểm quyền ở server.',
    ],
    contracts: [
      'Kiểu dữ liệu giữa client và server khai báo một lần, hai phía cùng dùng.',
      'Lỗi trả về có mã máy đọc được; giao diện ánh xạ mã sang câu tiếng Việt.',
      'Mọi endpoint ghi phải lặp lại an toàn hoặc nêu rõ lý do không cần.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric của chặng, mỗi tiêu chí có bằng chứng chạy được.',
      'Toàn bộ cổng chất lượng của dự án vẫn xanh sau thay đổi.',
    ],
    invariants: [
      'Không tính năng đang chạy nào bị mất; luồng đăng nhập giữ nguyên hành vi.',
      'Không hạ mức trợ năng để đổi lấy điểm hiệu năng.',
    ],
    conventions: [
      'Màu lấy từ token của dự án, không ghi cứng mã màu trong component.',
      'Vùng chạm tối thiểu 44px và thiết kế cho màn nhỏ trước.',
    ],
  },
}

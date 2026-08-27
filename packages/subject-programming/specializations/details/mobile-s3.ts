// details/mobile-s3.ts — Chi tiết chặng S3 hướng DI ĐỘNG ("Nâng cao — mượt, nhẹ, tiết kiệm pin").
import type { SpecStageDetail } from '../stageDetailTypes.js'

export const MOBILE_S3_DETAIL: SpecStageDetail = {
  stageId: 'mobile-s3',
  modules: [
    {
      moduleId: 'mobile-s3-m1',
      objective:
        'Tìm và sửa được nguyên nhân giật của giao diện di động bằng profiler, đo trên máy đời thấp chứ không trên máy làm việc.',
      practice: [
        'Cuộn một màn danh sách 30 giây trên máy đời thấp và đếm số khung vượt 16ms bằng profiler.',
        'Bỏ render thừa và đưa việc giải mã ảnh ra khỏi luồng giao diện, đo lại sau mỗi thay đổi.',
        'Đặt cache ảnh nhiều tầng rồi kiểm lại mức chiếm bộ nhớ khi cuộn dài.',
      ],
      selfCheck: [
        {
          q: 'Vì sao ngân sách một khung hình là khoảng 16ms?',
          a: 'Màn hình 60Hz vẽ 60 khung mỗi giây, quá 16ms là lỡ nhịp và người dùng thấy giật.',
        },
        {
          q: 'Đo hiệu năng trên máy ảo có gì khác máy thật?',
          a: 'Máy ảo mượn sức CPU của máy tính nên che mất phần chậm mà máy điện thoại thật gặp phải.',
        },
      ],
      doneSignals: [
        'Trước khi tối ưu bạn luôn có số đo gốc trên máy mục tiêu.',
        'Cuộn danh sách dài trên máy đời thấp không còn khung rơi thấy được.',
      ],
    },
    {
      moduleId: 'mobile-s3-m2',
      objective:
        'Giảm được mức hao pin, mức chiếm bộ nhớ và dung lượng gói cài xuống mức đo được, không dựa vào cảm nhận.',
      practice: [
        'Đo mức pin tiêu thụ khi app chạy nền một giờ, rồi chuyển việc nền sang cơ chế chuẩn của hệ điều hành.',
        'Dùng công cụ bắt rò bộ nhớ, sửa ít nhất một chỗ giữ tham chiếu quá lâu.',
        'Tách tài nguyên và bỏ mã chết để giảm dung lượng gói cài, ghi lại số trước và sau.',
      ],
      selfCheck: [
        {
          q: 'Vì sao tự hẹn giờ chạy nền lại hao pin hơn cơ chế của hệ điều hành?',
          a: 'Hệ điều hành gom việc của nhiều app vào cùng một lần đánh thức, còn hẹn giờ riêng đánh thức máy liên tục.',
        },
        {
          q: 'Dấu hiệu nào cho thấy app đang rò bộ nhớ?',
          a: 'Mức chiếm bộ nhớ tăng dần sau mỗi vòng mở và đóng màn, không trở về mức ban đầu.',
        },
      ],
      doneSignals: [
        'Bạn nói được app chiếm bao nhiêu bộ nhớ ở màn nặng nhất bằng con số.',
        'Dung lượng gói cài có ngưỡng theo dõi, không phình lặng lẽ qua từng bản.',
      ],
    },
    {
      moduleId: 'mobile-s3-m3',
      objective:
        'Tách được lớp dữ liệu khỏi lớp trình bày để phần logic kiểm thử được mà không cần chạy giao diện.',
      practice: [
        'Chuyển một tính năng sang tách lớp rõ ràng, phần trình bày chỉ nhận trạng thái và phát sự kiện.',
        'Viết ít nhất 10 test cho lớp dữ liệu, chạy trên máy chủ không cần máy ảo.',
        'Chia dự án theo tính năng và đo lại thời gian build sau khi chia.',
      ],
      selfCheck: [
        {
          q: 'Vì sao logic nằm trong màn hình lại khó kiểm thử?',
          a: 'Muốn chạy được phải dựng cả vòng đời giao diện, nên test chậm, dễ vỡ và ít người viết.',
        },
        {
          q: 'Tiêm phụ thuộc giúp gì cho việc kiểm thử?',
          a: 'Cho phép thay phần gọi mạng hay cơ sở dữ liệu bằng bản giả, nên test chạy nhanh và tất định.',
        },
      ],
      doneSignals: [
        'Bộ test lớp dữ liệu chạy xong trong vài giây và nằm trong CI.',
        'Đổi giao diện của một màn không phải sửa dòng logic nghiệp vụ nào.',
      ],
    },
    {
      moduleId: 'mobile-s3-m4',
      objective:
        'Làm cho app dùng được đúng thói quen của từng nền tảng, kể cả khi bật trình đọc màn hình và cỡ chữ lớn.',
      practice: [
        'Đi trọn luồng chính chỉ bằng trình đọc màn hình, ghi lại chỗ nào bị kẹt.',
        'Đặt cỡ chữ hệ thống lớn nhất và sửa mọi chỗ vỡ bố cục.',
        'Kiểm chế độ tối, đa ngôn ngữ và định dạng số, ngày theo vùng.',
      ],
      selfCheck: [
        {
          q: 'Vì sao nút chỉ có biểu tượng lại là lỗi trợ năng?',
          a: 'Trình đọc màn hình không có gì để đọc ngoài chữ "nút", người dùng không biết nút làm gì.',
        },
        {
          q: 'Cỡ chữ hệ thống ảnh hưởng gì tới bố cục?',
          a: 'Chữ to lên đẩy vỡ các khung có chiều cao cố định, nên bố cục phải co giãn theo nội dung.',
        },
      ],
      doneSignals: [
        'App dùng được bằng trình đọc màn hình mà không cần bản riêng.',
        'Không màn nào vỡ bố cục ở cỡ chữ hệ thống lớn nhất.',
      ],
    },
  ],
  rubric: [
    {
      id: 'mobile-s3-r1',
      text: 'Báo cáo trước và sau về số khung rơi khi cuộn 30 giây trên máy mục tiêu đời thấp, khung rơi còn dưới 1%.',
      howToProve: 'Dán hai ảnh chụp profiler kèm tên máy và phiên bản hệ điều hành đã đo.',
    },
    {
      id: 'mobile-s3-r2',
      text: 'Thời gian khởi động lạnh giảm ít nhất 30% và còn dưới 2 giây trên máy mục tiêu.',
      howToProve:
        'Đo 10 lần bằng công cụ của nền tảng, báo cáo trung vị chứ không lấy lần nhanh nhất.',
    },
    {
      id: 'mobile-s3-r3',
      text: 'Luồng chính đi trọn được bằng trình đọc màn hình, không nút nào thiếu nhãn mô tả.',
      howToProve: 'Quay video đi hết luồng bằng trình đọc màn hình, không tắt giữa chừng.',
    },
    {
      id: 'mobile-s3-r4',
      text: 'Kiến trúc tách lớp rõ ràng và lớp dữ liệu có ít nhất 10 test chạy không cần giao diện.',
      howToProve: 'Chạy bộ test trên máy chủ và dán thời gian chạy cùng số test đã qua.',
    },
    {
      id: 'mobile-s3-r5',
      text: 'Dung lượng gói cài giảm ít nhất 15% và có ngưỡng theo dõi cho các bản sau.',
      howToProve: 'Dán kích thước gói trước và sau kèm cấu hình ngưỡng đang dùng.',
    },
  ],
  specBrief: {
    scopeDo: [
      'Tối ưu độ mượt, thời gian khởi động, mức pin và dung lượng gói cài.',
      'Tách lớp dữ liệu khỏi lớp trình bày cho các tính năng chính.',
      'Đưa trợ năng của luồng chính lên mức dùng được bằng trình đọc màn hình.',
    ],
    scopeDont: [
      'Không thêm tính năng mới trong đợt này, vì sẽ không còn so được số đo trước và sau.',
      'Không đổi ngôn ngữ hay khung giao diện — rủi ro lớn, lợi ích không thuộc mục tiêu chặng.',
    ],
    touchpoints: [
      'Màn danh sách nặng nhất và màn khởi động đầu tiên của ứng dụng.',
      'Nơi cấu hình việc chạy nền và nơi khai báo tài nguyên đóng gói.',
    ],
    contracts: [
      'Lớp trình bày chỉ nhận trạng thái đã tính sẵn và phát sự kiện người dùng.',
      'Lớp dữ liệu trả về kiểu rõ ràng cho trạng thái tải, rỗng, lỗi và có dữ liệu.',
    ],
    acceptance: [
      'Đạt đủ 5 tiêu chí rubric, mỗi tiêu chí kèm số đo trên máy mục tiêu.',
      'Không tính năng nào đang chạy bị hỏng sau khi tách lớp.',
    ],
    invariants: [
      'Dữ liệu người dùng đã lưu không mất khi đổi kiến trúc lưu trữ.',
      'Mọi thao tác chạm giữ vùng chạm tối thiểu 44px.',
    ],
    conventions: [
      'Chuỗi hiển thị tách khỏi mã nguồn để dịch được sang ngôn ngữ khác.',
      'Số đo luôn ghi kèm tên máy và phiên bản hệ điều hành đã dùng.',
    ],
  },
}

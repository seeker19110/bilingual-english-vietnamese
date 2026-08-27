// Hướng MOBILE — ứng dụng chạy trên điện thoại, nơi mạng chập chờn và pin là tài nguyên hữu hạn.
import type { ProgrammingSpecialization } from './types.js'

export const MOBILE_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'mobile',
  name: 'Ứng dụng di động',
  tagline: 'Đưa sản phẩm vào túi người dùng: iOS, Android, đăng được lên chợ ứng dụng thật.',
  forWho:
    'Hợp với người muốn làm app người thân cài được ngay trên máy. Cần kiên nhẫn với quy trình duyệt của Apple/Google và với việc thiết bị thật muôn hình vạn trạng.',
  prerequisite: 'p4',
  duration: '9–14 tháng',
  languages: ['Kotlin', 'Swift', 'TypeScript (React Native)', 'Dart (Flutter)'],
  coreTools: ['Android Studio', 'Xcode', 'React Native hoặc Flutter', 'Firebase', 'Fastlane'],
  architecture: {
    modules: [
      {
        name: 'Màn hình (UI)',
        role: 'Vẽ và nhận thao tác. KHÔNG gọi mạng trực tiếp, không chứa quy tắc nghiệp vụ.',
      },
      {
        name: 'ViewModel / presenter',
        role: 'Giữ trạng thái màn, biến sự kiện thành thao tác. Sống sót qua xoay máy.',
      },
      {
        name: 'Kho dữ liệu (repository)',
        role: 'Nguồn sự thật cho UI: quyết định lấy từ cục bộ hay mạng. UI không biết dữ liệu từ đâu.',
      },
      { name: 'Nguồn cục bộ', role: 'CSDL trên máy + hàng đợi thao tác chờ đồng bộ.' },
      {
        name: 'Nguồn mạng',
        role: 'Gọi API, timeout, thử lại. Nơi duy nhất biết hình dạng response.',
      },
    ],
    contracts: [
      'UI chỉ nhận model của riêng nó, không nhận thẳng model API — đổi API không được làm vỡ màn hình.',
      'Mọi thao tác ghi khi offline vào hàng đợi có khoá idempotent, đồng bộ lại không nhân đôi.',
      'Migration CSDL cục bộ bắt buộc có phiên bản: người dùng nhảy từ bản cũ 6 tháng trước lên vẫn phải chạy.',
    ],
    keyDecisions: [
      'Native hay đa nền tảng — khoá luôn chi phí đội ngũ và giới hạn khi cần module native.',
      'Offline-first hay online-first: quyết định sớm, đổi sau là viết lại tầng dữ liệu.',
      'Xử lý xung đột khi hai máy sửa cùng bản ghi: bên nào thắng, hay phải hỏi người dùng.',
    ],
    nfrs: [
      'Khởi động lạnh ≤ 2s trên máy mục tiêu; giữ 60 khung hình/giây ở màn danh sách.',
      'Tỷ lệ phiên không crash ≥ 99,5%.',
      'App dùng được đủ chức năng chính khi mất mạng.',
    ],
    specChecklist: [
      'Hành vi khi mất mạng và khi có mạng lại — nêu cả ca đồng bộ thất bại.',
      'Quyền nào phải xin, xin lúc nào, và app cư xử ra sao nếu bị từ chối.',
      'Trạng thái nào phải sống sót qua xoay máy hoặc bị hệ điều hành giết.',
      'Bản cũ ngoài thị trường có bị ảnh hưởng không; cần migration dữ liệu gì.',
    ],
  },
  stages: [
    {
      id: 'mobile-s1',
      tier: 's1',
      name: 'App đầu tiên trên máy thật',
      canDo: 'Dựng app nhiều màn, lưu dữ liệu cục bộ, cài chạy được trên điện thoại của mình.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'mobile-s1-m1',
          title: 'Chọn nền tảng và hiểu đánh đổi',
          topics: [
            'Native (Kotlin/Swift) vs đa nền tảng (React Native/Flutter)',
            'Vòng đời app: foreground, background, bị hệ điều hành giết',
            'Cấu trúc dự án, build và cài lên máy thật',
          ],
        },
        {
          id: 'mobile-s1-m2',
          title: 'Giao diện khai báo',
          topics: [
            'Compose / SwiftUI / JSX: UI là hàm của state',
            'Danh sách dài phải ảo hoá, không render hết',
            'Bố cục theo kích thước màn, safe area, xoay ngang',
          ],
        },
        {
          id: 'mobile-s1-m3',
          title: 'Điều hướng và trạng thái',
          topics: [
            'Stack, tab, deep link',
            'Giữ trạng thái khi xoay máy hoặc app bị khôi phục',
            'Truyền dữ liệu giữa màn mà không dùng biến toàn cục',
          ],
        },
        {
          id: 'mobile-s1-m4',
          title: 'Lưu trữ cục bộ',
          topics: [
            'Key-value nhỏ vs SQLite/Room/CoreData',
            'Migration khi đổi cấu trúc dữ liệu của bản cũ',
            'Dữ liệu nhạy cảm để vào keystore/keychain',
          ],
        },
      ],
      project: {
        name: 'Sổ chi tiêu ngoại tuyến',
        brief: 'App ghi chi tiêu chạy hoàn toàn offline, có biểu đồ theo tháng.',
        requirements: [
          'Ít nhất 3 màn + điều hướng, giữ trạng thái khi xoay máy',
          'Dữ liệu bền qua khi tắt app',
          'Cài chạy được trên điện thoại thật, có icon và tên app riêng',
        ],
      },
    },
    {
      id: 'mobile-s2',
      tier: 's2',
      name: 'App nối mạng và có tài khoản',
      canDo: 'App đồng bộ với server, đăng nhập được, dùng được cả khi mạng chập chờn.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'mobile-s2-m1',
          title: 'Mạng ở môi trường xấu',
          topics: [
            'Timeout, retry có backoff, huỷ request khi rời màn',
            'Offline-first: hàng đợi thao tác, đồng bộ khi có mạng',
            'Xử lý xung đột khi hai máy sửa cùng bản ghi',
          ],
        },
        {
          id: 'mobile-s2-m2',
          title: 'Xác thực trên điện thoại',
          topics: [
            'OAuth với trình duyệt hệ thống, không nhúng WebView',
            'Refresh token an toàn, đăng xuất mọi thiết bị',
            'Sinh trắc học (vân tay, Face ID) làm lớp mở khoá',
          ],
        },
        {
          id: 'mobile-s2-m3',
          title: 'Quyền và cảm biến',
          topics: [
            'Xin quyền đúng lúc, giải thích lý do trước khi xin',
            'Camera, vị trí, thông báo đẩy',
            'Ứng xử khi người dùng từ chối quyền — app vẫn phải dùng được',
          ],
        },
        {
          id: 'mobile-s2-m4',
          title: 'Kiểm thử và phát hành thử',
          topics: [
            'Unit test logic, UI test luồng chính',
            'TestFlight / Internal testing, thu phản hồi bản thử',
            'Ký số, phiên bản, quy tắc đặt versionCode/build',
          ],
        },
      ],
      project: {
        name: 'App cửa hàng nối API thật',
        brief: 'Phiên bản di động của dự án cửa hàng: đăng nhập, xem đơn, đặt hàng.',
        requirements: [
          'Đăng nhập thật, token lưu an toàn',
          'Xem và tạo đơn được khi đang mất mạng, tự đồng bộ khi có lại',
          'Có bản thử phát cho ít nhất 3 người ngoài dùng và ghi lại phản hồi',
        ],
      },
    },
    {
      id: 'mobile-s3',
      tier: 's3',
      name: 'Nâng cao — mượt, nhẹ, tiết kiệm pin',
      canDo: 'Đo và sửa được app giật, app nặng, app hao pin; kiến trúc chịu được nhiều màn.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'mobile-s3-m1',
          title: 'Hiệu năng giao diện',
          topics: [
            'Ngân sách 16ms/khung hình, tìm khung rơi bằng profiler',
            'Tránh render thừa, ghi nhớ (memo) đúng chỗ',
            'Ảnh: giải mã nền, cache nhiều tầng',
          ],
        },
        {
          id: 'mobile-s3-m2',
          title: 'Pin, bộ nhớ, dung lượng',
          topics: [
            'Công việc nền: WorkManager / BackgroundTasks đúng cách',
            'Rò bộ nhớ và cách bắt bằng công cụ',
            'Giảm kích thước gói cài: tách tài nguyên, nén, bỏ mã chết',
          ],
        },
        {
          id: 'mobile-s3-m3',
          title: 'Kiến trúc app lớn',
          topics: [
            'MVVM / MVI, tách lớp dữ liệu khỏi lớp trình bày',
            'Module hoá theo tính năng, build tăng tốc',
            'Dependency injection ở mức đủ dùng',
          ],
        },
        {
          id: 'mobile-s3-m4',
          title: 'Trải nghiệm chuẩn nền tảng',
          topics: [
            'Chuyển động có ý nghĩa, cử chỉ quen tay từng hệ điều hành',
            'Trợ năng: TalkBack/VoiceOver, cỡ chữ hệ thống',
            'Chế độ tối, đa ngôn ngữ, định dạng số/ngày theo vùng',
          ],
        },
      ],
      project: {
        name: 'Đưa một app giật thành mượt',
        brief: 'Chọn app (của mình hoặc mã nguồn mở) và cải thiện hiệu năng có số đo.',
        requirements: [
          'Báo cáo trước–sau: số khung rơi, thời gian khởi động lạnh, kích thước gói',
          'Đọc được app bằng trình đọc màn hình ở luồng chính',
          'Kiến trúc tách lớp, có test cho lớp dữ liệu',
        ],
      },
    },
    {
      id: 'mobile-s4',
      tier: 's4',
      name: 'Chuyên gia — quy mô và nền tảng',
      canDo: 'Chịu trách nhiệm một app có hàng chục nghìn người dùng: phát hành, đo, sửa từ xa.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'mobile-s4-m1',
          title: 'Phát hành chuyên nghiệp',
          topics: [
            'CI/CD build và nộp chợ tự động (Fastlane)',
            'Phát hành theo tỷ lệ, dừng phát hành khi lỗi tăng',
            'Cập nhật bắt buộc, tương thích ngược với bản cũ còn ngoài thị trường',
          ],
        },
        {
          id: 'mobile-s4-m2',
          title: 'Quan sát từ xa',
          topics: [
            'Crash reporting, đọc stack trace đã làm rối mã (obfuscated)',
            'Số đo trải nghiệm: ANR, khởi động lạnh, tỷ lệ lỗi mạng',
            'A/B test và feature flag trên client',
          ],
        },
        {
          id: 'mobile-s4-m3',
          title: 'Nền tảng và mã dùng chung',
          topics: [
            'Chia sẻ logic đa nền tảng (KMP / lõi TypeScript)',
            'Viết module native khi cầu nối không đủ',
            'Thư viện nội bộ có phiên bản cho nhiều app dùng',
          ],
        },
        {
          id: 'mobile-s4-m4',
          title: 'Bảo mật ứng dụng di động',
          topics: [
            'Chống dịch ngược ở mức hợp lý, không dựa vào bảo mật bằng giấu',
            'Lưu bí mật đúng chỗ, chống chụp màn ở màn nhạy cảm',
            'Chuẩn OWASP Mobile Top 10',
          ],
        },
      ],
      project: {
        name: 'App lên chợ ứng dụng với quy trình tự động',
        brief: 'Một app thật của bạn có mặt trên App Store hoặc Google Play.',
        requirements: [
          'Qua duyệt và tải được công khai',
          'CI tự build, chạy test và nộp bản mới không thao tác tay',
          'Có bảng theo dõi crash và số đo khởi động sau phát hành',
        ],
      },
    },
  ],
  capstone: {
    name: 'App có người dùng thật và vòng đời phát hành',
    brief: 'Ứng dụng bạn duy trì qua nhiều phiên bản, có người dùng ngoài và số liệu chứng minh.',
    requirements: [
      '≥ 5 bản phát hành, mỗi bản có ghi chú thay đổi',
      'Tỷ lệ phiên không crash ≥ 99,5%',
      'Hoạt động đủ khi mất mạng, kiểm chứng bằng kịch bản test',
      'Tài liệu kiến trúc + quyết định chọn nền tảng kèm đánh đổi',
    ],
  },
  expertSignals: [
    'Biết trước tính năng nào sẽ bị chợ ứng dụng từ chối và vì sao',
    'Đọc crash trace bản phát hành ra được nguyên nhân, không cần tái hiện',
    'Thiết kế tính năng với giả định "mạng sẽ hỏng" ngay từ đầu',
    'Cân được giữa mượt và tốn pin bằng số đo, không bằng cảm giác',
  ],
  careers: [
    'Android Engineer',
    'iOS Engineer',
    'Cross-platform Mobile Engineer',
    'Mobile Platform / Release Engineer',
  ],
  pitfalls: [
    'Chỉ thử trên máy mình — máy mới, mạng khoẻ, pin đầy',
    'Coi offline là ca ngoại lệ thay vì trạng thái bình thường',
    'Nhồi logic nghiệp vụ vào màn hình, sau không test được',
    'Bỏ qua trợ năng vì "người dùng của tôi không cần"',
  ],
  resources: [
    'Android Developers + Material Design guidelines',
    'Apple Human Interface Guidelines + Swift documentation',
    'OWASP Mobile Application Security Verification Standard',
  ],
}

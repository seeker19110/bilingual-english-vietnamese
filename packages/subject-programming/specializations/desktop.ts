// Hướng DESKTOP — phần mềm cài trên máy: chạy offline, đụng thẳng vào tệp và hệ điều hành.
import type { ProgrammingSpecialization } from './types.js'

export const DESKTOP_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'desktop',
  name: 'Ứng dụng Desktop & Công cụ',
  tagline: 'Phần mềm cài đặt được, chạy offline, xử lý tệp lớn — thứ dân chuyên nghiệp mở cả ngày.',
  forWho:
    'Hợp với người muốn làm công cụ cho người làm nghề: kế toán, thiết kế, kỹ thuật viên. Cần chịu khó lo cả chuyện cài đặt, cập nhật, và ba hệ điều hành khác nhau.',
  prerequisite: 'p4',
  duration: '8–12 tháng',
  languages: ['TypeScript', 'Rust', 'C#', 'Python'],
  coreTools: [
    'Tauri hoặc Electron',
    '.NET/Qt',
    'SQLite',
    'trình đóng gói cài đặt',
    'CI đa nền tảng',
  ],
  architecture: {
    modules: [
      {
        name: 'Giao diện',
        role: 'Vẽ và nhận thao tác. KHÔNG bao giờ làm việc nặng trên luồng này.',
      },
      {
        name: 'Lõi tài liệu / dữ liệu',
        role: 'Mô hình dữ liệu người dùng + lịch sử hoàn tác. Nguồn sự thật.',
      },
      {
        name: 'Việc nền',
        role: 'Xử lý nặng, huỷ được, báo tiến độ. Giao tiếp với UI qua thông điệp.',
      },
      {
        name: 'Tầng lưu trữ',
        role: 'Đọc/ghi tệp và CSDL cục bộ. Ghi an toàn: tệp tạm rồi đổi tên.',
      },
      {
        name: 'Đồng bộ (tuỳ chọn)',
        role: 'Cắm thêm được, gỡ ra app vẫn chạy đủ chức năng offline.',
      },
      {
        name: 'Cập nhật & cấp phép',
        role: 'Tách hẳn khỏi nghiệp vụ; hỏng phần này không được làm hỏng dữ liệu.',
      },
    ],
    contracts: [
      'Mọi thao tác sửa dữ liệu phải hoàn tác được hoặc có bản sao trước khi ghi đè.',
      'Định dạng tệp/CSDL có phiên bản và đường nâng cấp; bản cũ luôn mở được.',
      'Việc nền giao tiếp với UI qua thông điệp bất biến, không chia sẻ trạng thái sửa được.',
      'Đường dẫn thư mục cấu hình/dữ liệu theo chuẩn từng hệ điều hành, không ghi cứng.',
    ],
    keyDecisions: [
      'Nền tảng: web-based hay native — khoá luôn kích thước gói, mức RAM và khả năng tích hợp hệ.',
      'Offline là mặc định hay bắt buộc có mạng; quyết định toàn bộ tầng dữ liệu.',
      'Có hệ plugin hay không — có thì API phải ổn định và chạy trong hộp cát ngay từ đầu.',
    ],
    nfrs: [
      'Thời gian mở ứng dụng và mức chiếm RAM có trần trên máy cấu hình thấp.',
      'Giao diện không đứng quá 100ms khi đang xử lý nặng.',
      'Không có ca mất dữ liệu người dùng nào; kiểm bằng test cắt điện giữa chừng.',
    ],
    specChecklist: [
      'Thao tác này hoàn tác thế nào; ảnh hưởng gì tới lịch sử hoàn tác.',
      'Có đổi định dạng dữ liệu không; bản cũ nâng cấp ra sao.',
      'Chạy trên hệ điều hành nào, phiên bản tối thiểu nào.',
      'Việc nặng chạy ở đâu, huỷ được không, báo tiến độ thế nào.',
    ],
  },
  stages: [
    {
      id: 'desktop-s1',
      tier: 's1',
      name: 'Ứng dụng cài được',
      canDo: 'Làm ứng dụng desktop có giao diện, đọc/ghi tệp, cài đặt được trên máy người khác.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'desktop-s1-m1',
          title: 'Chọn nền tảng',
          topics: [
            'Web-based (Tauri/Electron) vs native (Qt/.NET) — đánh đổi thật',
            'Kích thước gói cài, mức tiêu tốn RAM',
            'Tích hợp hệ điều hành: menu, khay hệ thống, phím tắt',
          ],
        },
        {
          id: 'desktop-s1-m2',
          title: 'Làm việc với tệp',
          topics: [
            'Hộp thoại chọn tệp, kéo thả',
            'Đường dẫn khác nhau giữa Windows/macOS/Linux',
            'Ghi an toàn: ghi tệp tạm rồi đổi tên, chống mất dữ liệu',
          ],
        },
        {
          id: 'desktop-s1-m3',
          title: 'Lưu trữ cục bộ',
          topics: [
            'SQLite nhúng, migration khi đổi cấu trúc',
            'Thư mục cấu hình/đệm/dữ liệu theo chuẩn từng hệ',
            'Sao lưu và xuất dữ liệu người dùng',
          ],
        },
        {
          id: 'desktop-s1-m4',
          title: 'Đóng gói và cài đặt',
          topics: [
            'Trình cài đặt cho ba hệ điều hành',
            'Ký mã, tránh cảnh báo "phần mềm lạ"',
            'Cập nhật tự động',
          ],
        },
      ],
      project: {
        name: 'Công cụ xử lý tệp hàng loạt',
        brief: 'Ứng dụng đổi tên/chuyển định dạng hàng loạt tệp, chạy hoàn toàn offline.',
        requirements: [
          'Có bản cài cho ít nhất 2 hệ điều hành',
          'Xử lý 10.000 tệp không treo giao diện',
          'Không bao giờ làm mất dữ liệu gốc — có thao tác hoàn tác',
        ],
      },
    },
    {
      id: 'desktop-s2',
      tier: 's2',
      name: 'Ứng dụng có chiều sâu',
      canDo: 'Xây ứng dụng nhiều cửa sổ, có nền xử lý nặng, đồng bộ tuỳ chọn với đám mây.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'desktop-s2-m1',
          title: 'Đa luồng trong ứng dụng có giao diện',
          topics: [
            'Không bao giờ chặn luồng giao diện',
            'Tiến trình con, hàng đợi việc, huỷ giữa chừng',
            'Báo tiến độ và ước lượng thời gian còn lại',
          ],
        },
        {
          id: 'desktop-s2-m2',
          title: 'Trải nghiệm chuyên nghiệp',
          topics: [
            'Hoàn tác/làm lại nhiều bước',
            'Phím tắt, thao tác hàng loạt, bảng lệnh',
            'Trợ năng cho ứng dụng desktop',
          ],
        },
        {
          id: 'desktop-s2-m3',
          title: 'Đồng bộ tuỳ chọn',
          topics: [
            'Offline là mặc định, đám mây là tuỳ chọn',
            'Xung đột khi hai máy sửa cùng dữ liệu',
            'Mã hoá dữ liệu người dùng khi đồng bộ',
          ],
        },
        {
          id: 'desktop-s2-m4',
          title: 'Chẩn đoán từ xa',
          topics: [
            'Nhật ký cục bộ người dùng gửi được',
            'Báo lỗi có sự đồng ý của người dùng',
            'Chế độ an toàn khi cấu hình hỏng',
          ],
        },
      ],
      project: {
        name: 'Ứng dụng quản lý dữ liệu chuyên nghiệp',
        brief: 'Công cụ cho một nghề cụ thể (ví dụ quản lý kho ảnh, sổ sách cửa hàng offline).',
        requirements: [
          'Hoàn tác được ≥ 20 bước',
          'Xử lý nặng chạy nền, huỷ được, giao diện không đứng',
          'Có ít nhất 3 người dùng thật và phản hồi được ghi lại',
        ],
      },
    },
    {
      id: 'desktop-s3',
      tier: 's3',
      name: 'Hiệu năng và mở rộng',
      canDo: 'Xử lý dữ liệu lớn trên máy người dùng và cho phép người khác mở rộng ứng dụng.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'desktop-s3-m1',
          title: 'Dữ liệu lớn trên máy đơn',
          topics: [
            'Đọc theo luồng thay vì nạp hết vào RAM',
            'Chỉ mục cục bộ, tìm kiếm toàn văn',
            'Ảo hoá danh sách hàng triệu dòng',
          ],
        },
        {
          id: 'desktop-s3-m2',
          title: 'Tối ưu khởi động và bộ nhớ',
          topics: [
            'Thời gian mở ứng dụng, tải lười module',
            'Đo và giảm mức chiếm RAM',
            'Phần lõi nặng viết bằng Rust/C++ gọi từ giao diện',
          ],
        },
        {
          id: 'desktop-s3-m3',
          title: 'Hệ thống mở rộng',
          topics: [
            'Kiến trúc plugin, API ổn định có phiên bản',
            'Chạy plugin trong hộp cát, giới hạn quyền',
            'Kịch bản tự động hoá cho người dùng nâng cao',
          ],
        },
        {
          id: 'desktop-s3-m4',
          title: 'Kiểm thử ứng dụng desktop',
          topics: [
            'Test giao diện tự động đa nền tảng',
            'Test cài đặt và cập nhật',
            'Ma trận nền tảng trong CI',
          ],
        },
      ],
      project: {
        name: 'Ứng dụng có hệ plugin',
        brief: 'Công cụ cho phép người khác viết plugin mở rộng chức năng.',
        requirements: [
          'API plugin có tài liệu và ví dụ chạy được',
          'Plugin lỗi không làm sập ứng dụng chính',
          'CI chạy test trên cả Windows, macOS, Linux',
        ],
      },
    },
    {
      id: 'desktop-s4',
      tier: 's4',
      name: 'Chuyên gia — sản phẩm phần mềm bán được',
      canDo: 'Vận hành một phần mềm desktop có người dùng trả tiền: cấp phép, hỗ trợ, cập nhật.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'desktop-s4-m1',
          title: 'Phân phối và cấp phép',
          topics: [
            'Cửa hàng ứng dụng vs tải trực tiếp',
            'Cấp phép, kích hoạt offline, chống bẻ khoá ở mức hợp lý',
            'Chính sách hoàn tiền và bản dùng thử',
          ],
        },
        {
          id: 'desktop-s4-m2',
          title: 'Cập nhật an toàn',
          topics: [
            'Kênh phát hành ổn định/beta',
            'Di trú dữ liệu người dùng qua nhiều phiên bản',
            'Quay lui khi bản mới hỏng trên máy người dùng',
          ],
        },
        {
          id: 'desktop-s4-m3',
          title: 'Bảo mật máy khách',
          topics: [
            'Chuỗi cung ứng phụ thuộc, ký và xác minh bản cập nhật',
            'Quyền tệp, tránh chạy với quyền quản trị',
            'Quyền riêng tư: dữ liệu ở lại trên máy người dùng',
          ],
        },
        {
          id: 'desktop-s4-m4',
          title: 'Hỗ trợ người dùng',
          topics: [
            'Tài liệu, câu hỏi thường gặp, kênh báo lỗi',
            'Tái hiện lỗi từ mô tả của người không kỹ thuật',
            'Lộ trình sản phẩm dựa trên yêu cầu thật',
          ],
        },
      ],
      project: {
        name: 'Phần mềm desktop có người dùng trả tiền',
        brief: 'Sản phẩm hoàn chỉnh với cấp phép, cập nhật tự động và hỗ trợ.',
        requirements: [
          'Có bản cài đã ký cho ≥ 2 hệ điều hành',
          'Cập nhật tự động chạy thật qua ≥ 3 phiên bản',
          'Di trú dữ liệu người dùng không mất mát, có test',
        ],
      },
    },
  ],
  capstone: {
    name: 'Công cụ desktop được dân trong nghề dùng hằng ngày',
    brief: 'Ứng dụng bạn phát hành và duy trì, có người dùng thật ngoài vòng quen biết.',
    requirements: [
      '≥ 50 lượt cài đặt từ người ngoài',
      'Chu kỳ phát hành ổn định ≥ 3 tháng',
      'Không có sự cố mất dữ liệu người dùng nào chưa được xử lý',
    ],
  },
  expertSignals: [
    'Coi dữ liệu người dùng là bất khả xâm phạm: mọi thao tác đều hoàn tác hoặc sao lưu được',
    'Thử trên máy yếu và hệ điều hành cũ, không chỉ máy mình',
    'Thiết kế cho offline trước, đồng bộ sau',
    'Biết chính xác ứng dụng chiếm bao nhiêu RAM và vì sao',
  ],
  careers: [
    'Desktop Application Engineer',
    'Developer Tools Engineer',
    'Cross-platform Application Engineer',
    'Independent Software Vendor (tự làm sản phẩm)',
  ],
  pitfalls: [
    'Đóng gói web app thành desktop mà không tận dụng gì của máy',
    'Chặn luồng giao diện khi xử lý tệp lớn',
    'Ghi đè thẳng tệp gốc, mất dữ liệu khi mất điện giữa chừng',
    'Bỏ qua chuyện ký mã, người dùng gặp cảnh báo và không dám cài',
  ],
  resources: [
    'Tài liệu chính thức Tauri / Electron',
    'Qt hoặc .NET desktop documentation',
    'Human Interface Guidelines (macOS) + Windows App design',
    'SQLite documentation',
  ],
}

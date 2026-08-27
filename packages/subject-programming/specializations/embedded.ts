// Hướng NHÚNG & IoT — phần mềm sống trong thiết bị, ít RAM, không có ai bấm nút khởi động lại.
import type { ProgrammingSpecialization } from './types.js'

export const EMBEDDED_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'embedded',
  name: 'Nhúng & IoT',
  tagline: 'Lập trình thiết bị thật: cảm biến, động cơ, pin — chạy nhiều tháng không ai đụng vào.',
  forWho:
    'Hợp với người thích phần cứng và ràng buộc chặt. Cần kiên nhẫn khi lỗi có thể nằm ở dây nối chứ không phải ở code.',
  prerequisite: 'p4',
  duration: '10–16 tháng',
  languages: ['C', 'C++', 'Rust (embedded)', 'Python (MicroPython, công cụ)'],
  coreTools: ['ESP32/STM32', 'PlatformIO', 'máy hiện sóng / phân tích logic', 'FreeRTOS', 'MQTT'],
  architecture: {
    modules: [
      {
        name: 'Lớp trừu tượng phần cứng (HAL)',
        role: 'Nơi DUY NHẤT chạm thanh ghi. Đổi chip chỉ sửa ở đây.',
      },
      {
        name: 'Driver thiết bị',
        role: 'Nói chuyện với một cảm biến/ngoại vi qua HAL. Không chứa quy tắc nghiệp vụ.',
      },
      {
        name: 'Lõi ứng dụng',
        role: 'Logic thiết bị làm gì. Thuần, test được TRÊN MÁY TÍNH không cần bo mạch.',
      },
      {
        name: 'Tầng kết nối',
        role: 'Mạng + hàng đợi cục bộ khi mất sóng. Lõi không biết đang dùng Wi-Fi hay LoRa.',
      },
      {
        name: 'Quản lý nguồn',
        role: 'Chế độ ngủ và điều kiện đánh thức. Tập trung một chỗ, không rải khắp nơi.',
      },
      { name: 'Cập nhật OTA', role: 'Phân vùng A/B, xác minh chữ ký, quay lui khi bản mới hỏng.' },
    ],
    contracts: [
      'Lõi ứng dụng chỉ gọi HAL qua giao diện — điều kiện để test trên máy tính và để đổi phần cứng.',
      'Thường trình ngắt chỉ đặt cờ và đẩy dữ liệu vào hàng đợi; xử lý nặng ở tác vụ thường.',
      'Dữ liệu bền phải chịu được mất điện ở BẤT KỲ thời điểm nào (ghi rồi mới đổi con trỏ).',
      'Gói tin gửi lên server có phiên bản; thiết bị firmware cũ ngoài hiện trường vẫn phải hiểu được.',
    ],
    keyDecisions: [
      'Có RTOS hay vòng lặp siêu đơn giản — đổi về sau chạm mọi module.',
      'Cấp phát động hay cấm hẳn (nhiều hệ nhúng cấm để tránh phân mảnh sau vài tuần chạy).',
      'Ngân sách năng lượng: quyết định tần suất gửi dữ liệu, tức là quyết định luôn tuổi thọ pin.',
      'Có đường OTA ngay từ đầu hay không — thiếu nó thì mỗi lỗi là một chuyến đi hiện trường.',
    ],
    nfrs: [
      'Chạy liên tục N ngày không treo, có watchdog và bằng chứng chạy trường kỳ.',
      'Tuổi thọ pin tính toán khớp đo thực tế trong sai số đã cam kết.',
      'Ngân sách RAM và ngăn xếp cho từng tác vụ, không vượt.',
    ],
    specChecklist: [
      'Phần cứng mục tiêu, chân kết nối, ràng buộc điện.',
      'Hành vi khi mất điện đột ngột và khi mất sóng dài ngày.',
      'Ngân sách năng lượng, RAM, dung lượng flash cho phần thêm vào.',
      'Có ảnh hưởng tới thiết bị firmware cũ ngoài hiện trường không.',
    ],
  },
  stages: [
    {
      id: 'embedded-s1',
      tier: 's1',
      name: 'Điều khiển phần cứng',
      canDo: 'Lập trình vi điều khiển đọc cảm biến, điều khiển thiết bị, gỡ lỗi bằng công cụ đo.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'embedded-s1-m1',
          title: 'Vi điều khiển nhập môn',
          topics: [
            'GPIO, thanh ghi, sơ đồ chân',
            'Chuỗi công cụ, nạp firmware, gỡ lỗi qua UART',
            'Điện cơ bản: điện áp, dòng, điện trở kéo lên/xuống',
          ],
        },
        {
          id: 'embedded-s1-m2',
          title: 'Ngoại vi',
          topics: [
            'ADC, PWM, bộ định thời',
            'Giao tiếp I2C, SPI, UART',
            'Đọc datasheet — kỹ năng sống còn của nghề',
          ],
        },
        {
          id: 'embedded-s1-m3',
          title: 'Ngắt và thời gian',
          topics: [
            'Ngắt, thường trình phục vụ ngắt phải ngắn',
            'Cờ volatile và chia sẻ dữ liệu với vòng lặp chính',
            'Chống dội phím, lọc nhiễu cảm biến',
          ],
        },
        {
          id: 'embedded-s1-m4',
          title: 'Gỡ lỗi phần cứng',
          topics: [
            'Máy phân tích logic đọc bus I2C/SPI',
            'Đo dòng tiêu thụ',
            'Cô lập lỗi: phần cứng hay phần mềm',
          ],
        },
      ],
      project: {
        name: 'Trạm đo môi trường',
        brief: 'Thiết bị đo nhiệt độ/độ ẩm, hiển thị và cảnh báo tại chỗ.',
        requirements: [
          'Đọc ≥ 2 cảm biến qua I2C, hiển thị lên màn hình',
          'Chạy liên tục 72 giờ không treo',
          'Có ảnh chụp bus từ máy phân tích logic trong tài liệu',
        ],
      },
    },
    {
      id: 'embedded-s2',
      tier: 's2',
      name: 'Hệ thời gian thực và kết nối',
      canDo: 'Dùng RTOS, kết nối thiết bị lên mạng, cập nhật firmware từ xa.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'embedded-s2-m1',
          title: 'RTOS',
          topics: [
            'Tác vụ, độ ưu tiên, lập lịch chiếm quyền',
            'Hàng đợi, semaphore, đảo ngược ưu tiên',
            'Ngân sách ngăn xếp cho từng tác vụ',
          ],
        },
        {
          id: 'embedded-s2-m2',
          title: 'Kết nối',
          topics: [
            'Wi-Fi, BLE, LoRa — chọn theo khoảng cách và năng lượng',
            'MQTT, CoAP, định dạng gói tin nhỏ',
            'Mất kết nối là bình thường: hàng đợi cục bộ, gửi lại',
          ],
        },
        {
          id: 'embedded-s2-m3',
          title: 'Cập nhật từ xa (OTA)',
          topics: [
            'Phân vùng A/B, quay lui khi bản mới hỏng',
            'Ký firmware, khởi động an toàn',
            'Phát hành theo tỷ lệ cho đội thiết bị',
          ],
        },
        {
          id: 'embedded-s2-m4',
          title: 'Năng lượng',
          topics: [
            'Chế độ ngủ sâu, đánh thức theo sự kiện',
            'Tính tuổi thọ pin bằng số đo dòng thật',
            'Đánh đổi giữa tần suất gửi dữ liệu và pin',
          ],
        },
      ],
      project: {
        name: 'Thiết bị IoT gửi dữ liệu lên máy chủ',
        brief: 'Trạm đo gửi số liệu định kỳ, cập nhật firmware từ xa, chạy bằng pin.',
        requirements: [
          'Không mất dữ liệu khi mất mạng tới 24 giờ',
          'OTA thành công và quay lui được khi bản mới lỗi',
          'Tuổi thọ pin tính toán khớp đo thực tế trong sai số 20%',
        ],
      },
    },
    {
      id: 'embedded-s3',
      tier: 's3',
      name: 'Tin cậy và Linux nhúng',
      canDo: 'Xây thiết bị chạy nhiều tháng không cần chạm, và làm việc với Linux nhúng.',
      duration: '10–14 tuần',
      modules: [
        {
          id: 'embedded-s3-m1',
          title: 'Độ tin cậy',
          topics: [
            'Watchdog, tự phục hồi sau lỗi',
            'Phân mảnh heap — vì sao nhiều hệ nhúng cấm cấp phát động',
            'Lưu trạng thái bền qua mất điện đột ngột',
          ],
        },
        {
          id: 'embedded-s3-m2',
          title: 'Kiểm thử phần cứng',
          topics: [
            'Test trên máy chủ với lớp trừu tượng phần cứng giả lập',
            'Hardware-in-the-loop trong CI',
            'Thử nghiệm môi trường: nhiệt, rung, nhiễu',
          ],
        },
        {
          id: 'embedded-s3-m3',
          title: 'Linux nhúng',
          topics: [
            'Yocto/Buildroot, cây thiết bị',
            'Viết driver không gian người dùng, sysfs',
            'Hệ thống tệp chỉ đọc, khởi động nhanh',
          ],
        },
        {
          id: 'embedded-s3-m4',
          title: 'Rust cho nhúng',
          topics: [
            'no_std, HAL, an toàn bộ nhớ không cần bộ thu gom rác',
            'Xử lý ngắt an toàn kiểu Rust',
            'Khi nào C vẫn là lựa chọn đúng',
          ],
        },
      ],
      project: {
        name: 'Thiết bị chạy trường kỳ có CI phần cứng',
        brief: 'Sản phẩm nhúng có bộ test tự động chạy trên thiết bị thật.',
        requirements: [
          'Chạy 30 ngày liên tục không cần can thiệp, có nhật ký chứng minh',
          'CI chạy test trên bo mạch thật mỗi lần đẩy mã',
          'Chịu được mất điện đột ngột 100 lần không hỏng dữ liệu',
        ],
      },
    },
    {
      id: 'embedded-s4',
      tier: 's4',
      name: 'Chuyên gia — sản phẩm phần cứng thật',
      canDo:
        'Đưa một sản phẩm nhúng từ nguyên mẫu tới sản xuất hàng loạt và vận hành đội thiết bị.',
      duration: '12–18 tuần',
      modules: [
        {
          id: 'embedded-s4-m1',
          title: 'Từ nguyên mẫu tới sản xuất',
          topics: [
            'Thiết kế cho sản xuất và cho kiểm tra',
            'Nạp firmware và hiệu chuẩn tại xưởng',
            'Quản lý phiên bản phần cứng và phần mềm đi kèm',
          ],
        },
        {
          id: 'embedded-s4-m2',
          title: 'Bảo mật thiết bị',
          topics: [
            'Định danh thiết bị, khoá lưu trong phần cứng',
            'Khởi động an toàn, chống can thiệp vật lý',
            'Vòng đời khoá và thu hồi thiết bị',
          ],
        },
        {
          id: 'embedded-s4-m3',
          title: 'Vận hành đội thiết bị',
          topics: [
            'Đo sức khoẻ thiết bị từ xa',
            'Chẩn đoán khi không cầm được thiết bị trong tay',
            'Quản lý phiên bản trên hàng nghìn thiết bị ngoài hiện trường',
          ],
        },
        {
          id: 'embedded-s4-m4',
          title: 'Chuẩn và an toàn',
          topics: [
            'Chuẩn phát xạ điện từ, chứng nhận',
            'An toàn chức năng mức khái niệm',
            'Tài liệu kỹ thuật cho sản xuất',
          ],
        },
      ],
      project: {
        name: 'Sản phẩm nhúng nhiều thiết bị chạy ngoài đời',
        brief: 'Triển khai ≥ 10 thiết bị thật, vận hành và cập nhật từ xa.',
        requirements: [
          '≥ 10 thiết bị hoạt động ngoài hiện trường ≥ 1 tháng',
          'Bảng theo dõi sức khoẻ đội thiết bị',
          'Một đợt OTA toàn đội thành công, có kế hoạch quay lui',
        ],
      },
    },
  ],
  capstone: {
    name: 'Thiết bị của bạn chạy ở nơi bạn không tới được',
    brief: 'Sản phẩm nhúng hoàn chỉnh, có người dùng thật, cập nhật và giám sát từ xa.',
    requirements: [
      'Chạy ổn định ≥ 3 tháng ngoài hiện trường',
      'Firmware được ký, OTA có quay lui',
      'Tài liệu phần cứng + phần mềm đủ để người khác dựng lại',
    ],
  },
  expertSignals: [
    'Đọc datasheet ra đáp án nhanh hơn tìm trên diễn đàn',
    'Nghi ngờ phần cứng và phần mềm ngang nhau khi gỡ lỗi',
    'Thiết kế với giả định mất điện có thể xảy ra ở bất kỳ dòng nào',
    'Tính pin bằng số đo dòng thật, không bằng ước lượng datasheet',
  ],
  careers: [
    'Embedded Software Engineer',
    'Firmware Engineer',
    'IoT Platform Engineer',
    'Embedded Linux Engineer',
  ],
  pitfalls: [
    'Cấp phát động tuỳ tiện rồi phân mảnh heap sau vài tuần chạy',
    'Làm việc nặng trong thường trình ngắt',
    'Không có đường cập nhật từ xa — mỗi lỗi là một chuyến đi hiện trường',
    'Chỉ thử ở nhiệt độ phòng',
  ],
  resources: [
    'Making Embedded Systems — Elecia White',
    'Tài liệu FreeRTOS + datasheet nhà sản xuất chip',
    'The Embedded Rust Book',
    'Yocto Project documentation',
  ],
}

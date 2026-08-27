// Hướng HỆ THỐNG — tầng dưới cùng: bộ nhớ, tiến trình, nhân hệ điều hành, trình biên dịch.
import type { ProgrammingSpecialization } from './types.js'

export const SYSTEMS_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'systems',
  name: 'Lập trình hệ thống',
  tagline: 'Hiểu máy tính tới tận thanh ghi: viết phần mềm nhanh, gọn, không phụ thuộc runtime.',
  forWho:
    'Hợp với người muốn biết "bên dưới" thật sự chạy thế nào và chịu được việc gỡ lỗi mất cả ngày cho một byte sai. Không hợp nếu bạn cần thấy giao diện đẹp mỗi tuần.',
  prerequisite: 'p5',
  duration: '12–18 tháng',
  languages: ['C', 'Rust', 'C++', 'Assembly (đọc hiểu)'],
  coreTools: ['gcc/clang', 'gdb', 'valgrind', 'perf', 'cargo', 'Linux'],
  stages: [
    {
      id: 'systems-s1',
      tier: 's1',
      name: 'Bộ nhớ và C',
      canDo: 'Viết chương trình C có cấp phát động đúng, không rò rỉ, gỡ lỗi bằng gdb.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'systems-s1-m1',
          title: 'Mô hình bộ nhớ',
          topics: [
            'Stack, heap, data, text — cái gì nằm ở đâu',
            'Con trỏ, số học con trỏ, con trỏ treo',
            'Endianness, căn chỉnh (alignment), kích thước kiểu',
          ],
        },
        {
          id: 'systems-s1-m2',
          title: 'C thực dụng',
          topics: [
            'malloc/free và ai chịu trách nhiệm giải phóng',
            'Chuỗi C, tràn bộ đệm và cách tránh',
            'Header, đơn vị biên dịch, Makefile',
          ],
        },
        {
          id: 'systems-s1-m3',
          title: 'Công cụ gỡ lỗi',
          topics: [
            'gdb: breakpoint, backtrace, đọc biến',
            'valgrind / AddressSanitizer bắt rò rỉ và truy cập sai',
            'Đọc core dump',
          ],
        },
        {
          id: 'systems-s1-m4',
          title: 'Từ mã nguồn tới chương trình',
          topics: [
            'Tiền xử lý → biên dịch → hợp dịch → liên kết',
            'Thư viện tĩnh vs động, ký hiệu (symbol)',
            'Đọc được assembly cơ bản của một hàm nhỏ',
          ],
        },
      ],
      project: {
        name: 'Cấp phát bộ nhớ của riêng bạn',
        brief: 'Tự viết malloc/free đơn giản trên vùng nhớ xin từ hệ điều hành.',
        requirements: [
          'Cấp phát, giải phóng, gộp khối liền kề',
          'Chạy qua bộ test không rò rỉ dưới valgrind',
          'So sánh hiệu năng với malloc chuẩn và giải thích khác biệt',
        ],
      },
    },
    {
      id: 'systems-s2',
      tier: 's2',
      name: 'Hệ điều hành nhìn từ chương trình',
      canDo: 'Dùng thành thạo tiến trình, luồng, file, socket qua lời gọi hệ thống.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'systems-s2-m1',
          title: 'Tiến trình và luồng',
          topics: [
            'fork/exec/wait, tín hiệu (signal)',
            'pthread, mutex, condition variable',
            'Deadlock, race — và công cụ ThreadSanitizer',
          ],
        },
        {
          id: 'systems-s2-m2',
          title: 'Vào/ra và file',
          topics: [
            'File descriptor, pipe, redirect',
            'Buffered vs unbuffered, fsync và độ bền dữ liệu',
            'mmap và bộ nhớ ảo',
          ],
        },
        {
          id: 'systems-s2-m3',
          title: 'Mạng ở tầng socket',
          topics: [
            'TCP/UDP qua socket API',
            'select/poll/epoll — vào/ra không chặn',
            'Tự viết một máy chủ chịu nhiều kết nối',
          ],
        },
        {
          id: 'systems-s2-m4',
          title: 'Rust vào cuộc',
          topics: [
            'Ownership, borrow, lifetime — an toàn bộ nhớ lúc biên dịch',
            'Result/Option thay cho mã lỗi',
            'unsafe: khi nào cần và trách nhiệm kèm theo',
          ],
        },
      ],
      project: {
        name: 'Shell và máy chủ TCP',
        brief: 'Một shell chạy được lệnh, pipe, redirect; và một máy chủ TCP đa kết nối.',
        requirements: [
          'Shell hỗ trợ pipe nhiều tầng và chạy nền',
          'Máy chủ phục vụ ≥ 1000 kết nối đồng thời bằng epoll',
          'Viết lại máy chủ đó bằng Rust và so sánh',
        ],
      },
    },
    {
      id: 'systems-s3',
      tier: 's3',
      name: 'Hiệu năng và nhân hệ điều hành',
      canDo: 'Tối ưu theo kiến trúc phần cứng và làm việc được với mã mức nhân.',
      duration: '12–14 tuần',
      modules: [
        {
          id: 'systems-s3-m1',
          title: 'Phần cứng quyết định tốc độ',
          topics: [
            'Phân cấp cache, cache line, false sharing',
            'Dự đoán rẽ nhánh, đường ống lệnh',
            'SIMD và tối ưu tự động của trình biên dịch',
          ],
        },
        {
          id: 'systems-s3-m2',
          title: 'Đo trước khi sửa',
          topics: [
            'perf, flame graph, đếm sự kiện phần cứng',
            'Vi chuẩn (microbenchmark) không tự lừa mình',
            'Định luật Amdahl và chọn chỗ đáng tối ưu',
          ],
        },
        {
          id: 'systems-s3-m3',
          title: 'Bên trong nhân',
          topics: [
            'Lập lịch, bộ nhớ ảo, phân trang',
            'Module nhân Linux, driver ký tự đơn giản',
            'eBPF để quan sát hệ thống đang chạy',
          ],
        },
        {
          id: 'systems-s3-m4',
          title: 'Đồng thời không khoá',
          topics: [
            'Nguyên tử (atomic), mô hình bộ nhớ, hàng rào',
            'Hàng đợi lock-free và vì sao nó khó đúng',
            'Kiểm chứng bằng công cụ, không bằng chạy thử vài lần',
          ],
        },
      ],
      project: {
        name: 'Tăng tốc một chương trình gấp nhiều lần',
        brief: 'Chọn bài toán tính toán nặng, tối ưu có phương pháp, ghi lại từng bước.',
        requirements: [
          'Nhanh hơn ≥ 5 lần so với bản đầu, có số đo lặp lại được',
          'Mỗi bước tối ưu kèm giả thuyết và bằng chứng profiler',
          'Kèm một module nhân hoặc chương trình eBPF quan sát được hoạt động',
        ],
      },
    },
    {
      id: 'systems-s4',
      tier: 's4',
      name: 'Chuyên gia — trình biên dịch, máy ảo, hệ điều hành',
      canDo: 'Xây được công cụ nền: trình thông dịch/biên dịch, runtime, hoặc nhân tối giản.',
      duration: '16–20 tuần',
      modules: [
        {
          id: 'systems-s4-m1',
          title: 'Trình biên dịch',
          topics: [
            'Lexer, parser, AST, phân tích ngữ nghĩa',
            'Biểu diễn trung gian, tối ưu cơ bản, sinh mã',
            'Hệ thống kiểu và suy diễn kiểu',
          ],
        },
        {
          id: 'systems-s4-m2',
          title: 'Runtime và bộ thu gom rác',
          topics: [
            'Máy ảo dựa ngăn xếp, bytecode',
            'Thu gom rác: đánh dấu-quét, thế hệ, tăng dần',
            'JIT mức khái niệm',
          ],
        },
        {
          id: 'systems-s4-m3',
          title: 'Hệ điều hành từ số 0',
          topics: [
            'Khởi động, chế độ bảo vệ, bảng trang',
            'Bộ lập lịch tối giản, chuyển ngữ cảnh',
            'Hệ thống tệp đơn giản',
          ],
        },
        {
          id: 'systems-s4-m4',
          title: 'An toàn ở tầng thấp',
          topics: [
            'Khai thác tràn bộ đệm và các lớp phòng thủ (ASLR, stack canary, W^X)',
            'Fuzzing có dẫn hướng theo độ phủ',
            'Kiểm chứng hình thức mức nhập môn',
          ],
        },
      ],
      project: {
        name: 'Ngôn ngữ hoặc nhân của riêng bạn',
        brief: 'Một trình thông dịch/biên dịch hoàn chỉnh, hoặc một nhân chạy được trên QEMU.',
        requirements: [
          'Chạy được bộ chương trình mẫu không tầm thường (đệ quy, cấu trúc dữ liệu)',
          'Có bộ test tự động và fuzzing tìm được ít nhất một lỗi thật',
          'Tài liệu thiết kế giải thích các đánh đổi',
        ],
      },
    },
  ],
  capstone: {
    name: 'Công cụ nền được người khác dùng',
    brief: 'Dự án mã nguồn mở tầng hệ thống có người ngoài dùng và đóng góp.',
    requirements: [
      'Không có lỗi bộ nhớ dưới sanitizer trên toàn bộ test',
      'Có chuẩn đo hiệu năng chạy trong CI, chặn hồi quy',
      'Có tài liệu và ít nhất một người ngoài gửi đóng góp được chấp nhận',
    ],
  },
  expertSignals: [
    'Đọc mã là hình dung được cấp phát và truy cập bộ nhớ diễn ra thế nào',
    'Đo bằng perf trước khi đoán nguyên nhân chậm',
    'Biết chính xác mình đang đánh đổi an toàn lấy tốc độ ở chỗ nào',
    'Viết được bản tái hiện tối giản cho một lỗi khó',
  ],
  careers: [
    'Systems Engineer',
    'Kernel / Driver Engineer',
    'Compiler / Runtime Engineer',
    'Performance Engineer',
  ],
  pitfalls: [
    'Tối ưu theo cảm giác, không đo',
    'Dùng unsafe trong Rust để "cho nhanh" rồi mất luôn bảo đảm an toàn',
    'Bỏ qua sanitizer vì test vẫn xanh — lỗi bộ nhớ thường im lặng',
    'Học C bằng cách tránh con trỏ',
  ],
  resources: [
    'Computer Systems: A Programmer’s Perspective (CS:APP)',
    'The Rust Programming Language (sách chính thức)',
    'Operating Systems: Three Easy Pieces',
    'Crafting Interpreters — Robert Nystrom',
  ],
}

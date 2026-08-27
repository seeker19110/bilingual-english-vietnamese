// Hướng BACKEND — phần không ai nhìn thấy nhưng hỏng là cả sản phẩm chết.
import type { ProgrammingSpecialization } from './types.js'

export const BACKEND_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'backend',
  name: 'Backend & Hệ phân tán',
  tagline: 'Xây dịch vụ chịu tải: dữ liệu không mất, tiền không tính sai, hỏng một máy vẫn chạy.',
  forWho:
    'Hợp với người thích logic, dữ liệu và độ tin cậy hơn là giao diện. Cần chịu được việc thành quả đẹp nhất của mình là "không ai nhận ra có gì xảy ra".',
  prerequisite: 'p4',
  duration: '10–16 tháng',
  languages: ['Go', 'Python', 'TypeScript (Node.js)', 'Java/Kotlin', 'SQL'],
  coreTools: ['PostgreSQL', 'Redis', 'Kafka hoặc NATS', 'Docker', 'gRPC', 'OpenTelemetry'],
  stages: [
    {
      id: 'backend-s1',
      tier: 's1',
      name: 'Dịch vụ đúng đắn',
      canDo: 'Viết API có kiểm đầu vào, có test, có log, chạy được bằng Docker.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'backend-s1-m1',
          title: 'HTTP tới tận gốc',
          topics: [
            'Request/response, header, mã trạng thái dùng đúng nghĩa',
            'Keep-alive, HTTP/2, nén, kích thước payload',
            'Thiết kế API: tài nguyên, phiên bản, phân trang, lọc',
          ],
        },
        {
          id: 'backend-s1-m2',
          title: 'Đúng đắn dữ liệu',
          topics: [
            'Validate ở biên (schema), không tin bất cứ input nào',
            'Idempotency key cho thao tác ghi — bấm hai lần không trừ tiền hai lần',
            'Thời gian luôn UTC, tiền luôn số nguyên đơn vị nhỏ nhất',
          ],
        },
        {
          id: 'backend-s1-m3',
          title: 'Lỗi và log',
          topics: [
            'Phân biệt lỗi người dùng, lỗi hệ thống, lỗi phụ thuộc',
            'Log có cấu trúc, có request id xuyên suốt',
            'Không log dữ liệu cá nhân, không log token',
          ],
        },
        {
          id: 'backend-s1-m4',
          title: 'Đóng gói và chạy',
          topics: [
            'Dockerfile nhiều tầng, ảnh nhỏ',
            'Cấu hình bằng biến môi trường, 12-factor',
            'Health check, graceful shutdown',
          ],
        },
      ],
      project: {
        name: 'API cửa hàng chuẩn nghề',
        brief: 'Dịch vụ CRUD + đặt hàng, có test, log, Docker.',
        requirements: [
          'Mọi endpoint validate input và trả lỗi có mã',
          'Đặt hàng idempotent — gửi lại cùng key không tạo đơn thứ hai',
          '`docker compose up` là chạy được từ máy trắng',
        ],
      },
    },
    {
      id: 'backend-s2',
      tier: 's2',
      name: 'Dữ liệu và đồng thời',
      canDo: 'Thiết kế schema chịu được truy vấn thật, xử lý đúng khi nhiều request tranh nhau.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'backend-s2-m1',
          title: 'CSDL quan hệ chuyên sâu',
          topics: [
            'Mức cô lập transaction, lost update, phantom read',
            'Khoá lạc quan (version) vs khoá bi quan',
            'Index: B-tree, composite, partial — và khi index làm chậm',
          ],
        },
        {
          id: 'backend-s2-m2',
          title: 'Cache',
          topics: [
            'Cache-aside, write-through, TTL và cách làm mất hiệu lực',
            'Cache stampede và cách chặn',
            'Cái gì KHÔNG nên cache',
          ],
        },
        {
          id: 'backend-s2-m3',
          title: 'Hàng đợi và việc nền',
          topics: [
            'Producer/consumer, at-least-once và hệ quả phải idempotent',
            'Dead letter queue, retry có backoff',
            'Việc định kỳ chạy đúng một lần khi có nhiều tiến trình',
          ],
        },
        {
          id: 'backend-s2-m4',
          title: 'Đồng thời trong ngôn ngữ',
          topics: [
            'Goroutine/async: mô hình bất đồng bộ khác luồng thật ra sao',
            'Race condition, deadlock, và cách tái hiện được trong test',
            'Giới hạn đồng thời, backpressure',
          ],
        },
      ],
      project: {
        name: 'Hệ thống đặt chỗ chống bán trùng',
        brief: 'Dịch vụ giữ chỗ có số lượng hữu hạn, chịu được nhiều người bấm cùng lúc.',
        requirements: [
          'Test tải mô phỏng 100 request đồng thời — không bao giờ bán vượt số ghế',
          'Việc gửi email xác nhận chạy qua hàng đợi, retry được',
          'Có báo cáo giải thích chọn khoá lạc quan hay bi quan và vì sao',
        ],
      },
    },
    {
      id: 'backend-s3',
      tier: 's3',
      name: 'Hệ phân tán',
      canDo: 'Tách dịch vụ có lý do, xử lý được lỗi từng phần và dữ liệu nhất quán cuối cùng.',
      duration: '10–14 tuần',
      modules: [
        {
          id: 'backend-s3-m1',
          title: 'Nền tảng lý thuyết',
          topics: [
            'CAP, nhất quán cuối cùng, đồng hồ không đáng tin',
            'Nhân bản, phân mảnh (sharding), bầu chủ',
            'Vì sao "gọi mạng" khác hẳn "gọi hàm"',
          ],
        },
        {
          id: 'backend-s3-m2',
          title: 'Giao tiếp giữa dịch vụ',
          topics: [
            'gRPC/protobuf, tiến hoá schema không phá bản cũ',
            'Kiến trúc hướng sự kiện, outbox pattern',
            'Saga cho giao dịch trải nhiều dịch vụ',
          ],
        },
        {
          id: 'backend-s3-m3',
          title: 'Chịu lỗi',
          topics: [
            'Timeout, retry, circuit breaker, bulkhead',
            'Suy giảm có kiểm soát thay vì sập toàn bộ',
            'Chaos test: chủ động giết một thành phần',
          ],
        },
        {
          id: 'backend-s3-m4',
          title: 'Quan sát hệ thống',
          topics: [
            'Metric, log, trace: ba trụ và cách nối chúng lại',
            'SLI/SLO/error budget',
            'Điều tra sự cố từ triệu chứng người dùng ngược về nguyên nhân',
          ],
        },
      ],
      project: {
        name: 'Tách một khối lớn thành nhiều dịch vụ',
        brief: 'Lấy dự án cửa hàng và tách phần thanh toán/thông báo thành dịch vụ riêng.',
        requirements: [
          'Giao dịch xuyên dịch vụ dùng outbox hoặc saga, không mất sự kiện',
          'Giết một dịch vụ khi đang chạy — hệ thống suy giảm chứ không sập',
          'Trace một đơn hàng đi qua đủ các dịch vụ trên công cụ quan sát',
        ],
      },
    },
    {
      id: 'backend-s4',
      tier: 's4',
      name: 'Chuyên gia — quy mô lớn và trách nhiệm vận hành',
      canDo: 'Thiết kế hệ thống cho lưu lượng lớn, dẫn dắt khắc phục sự cố và viết post-mortem.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'backend-s4-m1',
          title: 'Thiết kế hệ thống quy mô',
          topics: [
            'Ước lượng dung lượng: QPS, dung lượng lưu, băng thông',
            'Phân mảnh dữ liệu, đọc bản sao, CQRS khi cần',
            'Đa vùng địa lý và cái giá của độ trễ ánh sáng',
          ],
        },
        {
          id: 'backend-s4-m2',
          title: 'Lưu trữ chuyên biệt',
          topics: [
            'Khi nào rời khỏi CSDL quan hệ: tìm kiếm, chuỗi thời gian, đồ thị',
            'Log-structured storage, LSM tree vs B-tree',
            'Sao lưu, khôi phục, và diễn tập khôi phục thật',
          ],
        },
        {
          id: 'backend-s4-m3',
          title: 'Bảo mật hệ thống',
          topics: [
            'Xác thực giữa dịch vụ, mTLS, quản lý bí mật',
            'Phân quyền chi tiết, nguyên tắc đặc quyền tối thiểu',
            'Kiểm toán truy cập dữ liệu cá nhân',
          ],
        },
        {
          id: 'backend-s4-m4',
          title: 'Kỷ luật vận hành',
          topics: [
            'Trực sự cố, phân loại mức độ, quy trình leo thang',
            'Post-mortem không đổ lỗi, hành động sửa gốc rễ',
            'Di trú dữ liệu lớn không downtime',
          ],
        },
      ],
      project: {
        name: 'Dịch vụ chịu tải có SLO cam kết',
        brief: 'Xây và vận hành một dịch vụ với mục tiêu độ sẵn sàng công bố rõ.',
        requirements: [
          'Test tải chứng minh đạt SLO ở tải mục tiêu',
          'Di trú schema lớn thực hiện không downtime, có kịch bản rollback',
          'Một buổi diễn tập sự cố + post-mortem viết thành văn bản',
        ],
      },
    },
  ],
  capstone: {
    name: 'Hệ thống phân tán chạy thật',
    brief: 'Nhiều dịch vụ, hàng đợi, lưu trữ, quan sát đầy đủ — bạn tự vận hành.',
    requirements: [
      'Kiến trúc có tài liệu + ADR cho mỗi quyết định lớn',
      'Đạt SLO công bố trong ≥ 1 tháng, có số liệu',
      'Khôi phục được từ bản sao lưu trong bài diễn tập có bấm giờ',
      'Không có bí mật nào nằm trong mã nguồn, kiểm chứng bằng quét tự động',
    ],
  },
  expertSignals: [
    'Hỏi "cái gì xảy ra nếu lệnh gọi này timeout" trước khi viết dòng đầu tiên',
    'Ước lượng được dung lượng và chi phí trước khi chọn kiến trúc',
    'Chọn nhất quán mạnh hay cuối cùng theo yêu cầu nghiệp vụ, nói được cái giá',
    'Post-mortem chỉ ra lỗi hệ thống, không chỉ ra người',
  ],
  careers: [
    'Backend Engineer',
    'Distributed Systems Engineer',
    'Platform Engineer',
    'Site Reliability Engineer',
  ],
  pitfalls: [
    'Chia microservice từ ngày đầu khi chưa có vấn đề nào cần chia',
    'Bỏ qua idempotency rồi tính tiền khách hai lần',
    'Tin đồng hồ máy chủ và thứ tự sự kiện qua mạng',
    'Thêm cache để giấu truy vấn chậm thay vì sửa truy vấn',
  ],
  resources: [
    'Designing Data-Intensive Applications — Martin Kleppmann',
    'Google SRE Book + SRE Workbook',
    'Database Internals — Alex Petrov',
    'Tài liệu chính thức PostgreSQL (phần MVCC và index)',
  ],
}

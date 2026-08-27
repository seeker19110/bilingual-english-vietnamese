// Hướng BẢO MẬT — nghĩ như kẻ tấn công để xây được thứ khó phá.
// Lưu ý đạo đức: mọi nội dung tấn công CHỈ thực hành trên môi trường của chính mình hoặc
// phòng lab hợp pháp, và chỉ kiểm thử hệ thống khi có văn bản cho phép.
import type { ProgrammingSpecialization } from './types.js'

export const SECURITY_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'security',
  name: 'An toàn thông tin',
  tagline: 'Tìm ra lỗ hổng trước kẻ xấu, và xây hệ thống sai một chỗ vẫn không mất tất cả.',
  forWho:
    'Hợp với người tò mò, thích phá để hiểu, và có kỷ luật đạo đức. Nghề này chỉ tồn tại được trên nền tin cậy — vượt ranh giới cho phép là mất nghề.',
  prerequisite: 'p5',
  duration: '12–18 tháng',
  languages: ['Python', 'Bash', 'C (đọc hiểu)', 'JavaScript'],
  coreTools: ['Burp Suite', 'nmap', 'Wireshark', 'Ghidra', 'Semgrep', 'Docker lab'],
  stages: [
    {
      id: 'security-s1',
      tier: 's1',
      name: 'Nền tảng và tư duy phòng thủ',
      canDo: 'Hiểu và tự tay tái hiện các lỗ hổng web phổ biến trong phòng lab của mình.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'security-s1-m1',
          title: 'Mô hình mối đe doạ',
          topics: [
            'Tài sản, tác nhân đe doạ, bề mặt tấn công',
            'STRIDE, cây tấn công',
            'Đặc quyền tối thiểu, phòng thủ nhiều lớp',
          ],
        },
        {
          id: 'security-s1-m2',
          title: 'Mật mã ứng dụng',
          topics: [
            'Băm vs mã hoá vs ký số — dùng đúng chỗ',
            'TLS, chứng chỉ, ghim chứng chỉ',
            'Luật vàng: không tự chế thuật toán mật mã',
          ],
        },
        {
          id: 'security-s1-m3',
          title: 'OWASP Top 10 thực hành',
          topics: [
            'Injection, XSS, IDOR, lỗi xác thực/phân quyền',
            'SSRF, giải tuần tự không an toàn, cấu hình sai',
            'Tự dựng lab dễ tổn thương và tự khai thác',
          ],
        },
        {
          id: 'security-s1-m4',
          title: 'Bảo mật danh tính',
          topics: [
            'Lưu mật khẩu, xác thực hai yếu tố, khôi phục tài khoản',
            'Phiên, cookie, chiếm phiên',
            'Kiểm soát truy cập: RBAC, ABAC',
          ],
        },
      ],
      project: {
        name: 'Phòng lab dễ tổn thương và báo cáo của bạn',
        brief: 'Tự dựng ứng dụng có 10 lỗ hổng cố ý, khai thác từng cái, rồi vá.',
        requirements: [
          'Mỗi lỗ hổng: bằng chứng khai thác + bản vá + test hồi quy',
          'Lab chạy trong container, không phơi ra Internet',
          'Báo cáo viết theo khuôn nghề: mức độ, tác động, khuyến nghị',
        ],
      },
    },
    {
      id: 'security-s2',
      tier: 's2',
      name: 'Kiểm thử xâm nhập ứng dụng',
      canDo: 'Thực hiện đánh giá an toàn cho một ứng dụng web/API và viết báo cáo dùng được.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'security-s2-m1',
          title: 'Quy trình đánh giá',
          topics: [
            'Phạm vi, thoả thuận, quy tắc giao chiến',
            'Thu thập thông tin, lập bản đồ bề mặt tấn công',
            'Ghi chép để tái hiện lại được',
          ],
        },
        {
          id: 'security-s2-m2',
          title: 'Web và API sâu hơn',
          topics: [
            'Lỗi logic nghiệp vụ — thứ máy quét không tìm ra',
            'Lạm dụng chuỗi nhiều bước, đua điều kiện',
            'GraphQL, JWT sai cách, tải tệp lên',
          ],
        },
        {
          id: 'security-s2-m3',
          title: 'Mạng và hạ tầng',
          topics: [
            'Quét cổng, nhận dạng dịch vụ, cấu hình sai phổ biến',
            'Container thoát ly, quyền IAM quá rộng trên cloud',
            'Bí mật lộ trong repo và ảnh container',
          ],
        },
        {
          id: 'security-s2-m4',
          title: 'Báo cáo và giao tiếp',
          topics: [
            'Chấm mức độ (CVSS) và ưu tiên theo rủi ro thật',
            'Viết cho lập trình viên sửa được, không doạ nạt',
            'Công bố có trách nhiệm',
          ],
        },
      ],
      project: {
        name: 'Đánh giá an toàn một dự án mã nguồn mở',
        brief: 'Chọn dự án cho phép kiểm thử, đánh giá và báo cáo có trách nhiệm.',
        requirements: [
          'Có xác nhận phạm vi được phép trước khi bắt đầu',
          '≥ 3 phát hiện có bằng chứng tái hiện được',
          'Báo cáo kèm bản vá đề xuất, gửi theo kênh công bố của dự án',
        ],
      },
    },
    {
      id: 'security-s3',
      tier: 's3',
      name: 'Bảo mật tấn công chuyên sâu',
      canDo: 'Phân tích nhị phân, viết fuzzer, hiểu và tái hiện lỗ hổng bộ nhớ.',
      duration: '12–14 tuần',
      modules: [
        {
          id: 'security-s3-m1',
          title: 'Dịch ngược',
          topics: [
            'Đọc assembly, nhận dạng cấu trúc điều khiển',
            'Ghidra/IDA mức làm việc được',
            'Phân tích mã độc trong môi trường cách ly',
          ],
        },
        {
          id: 'security-s3-m2',
          title: 'Khai thác bộ nhớ',
          topics: [
            'Tràn ngăn xếp/đống, use-after-free',
            'Vượt qua ASLR/DEP mức khái niệm, ROP',
            'Vì sao ngôn ngữ an toàn bộ nhớ là biện pháp gốc rễ',
          ],
        },
        {
          id: 'security-s3-m3',
          title: 'Tìm lỗi tự động',
          topics: [
            'Fuzzing theo độ phủ, tối giản ca lỗi',
            'Phân tích tĩnh, luật Semgrep tự viết',
            'Thực thi tượng trưng mức nhập môn',
          ],
        },
        {
          id: 'security-s3-m4',
          title: 'Bảo mật hệ thống hiện đại',
          topics: [
            'Bảo mật chuỗi cung ứng phần mềm',
            'Bảo mật cloud: IAM, ranh giới tài khoản',
            'Bảo mật AI: tiêm lệnh, đầu độc dữ liệu',
          ],
        },
      ],
      project: {
        name: 'Tìm lỗi thật bằng công cụ tự động',
        brief: 'Fuzz một thư viện mã nguồn mở và xử lý phát hiện đến nơi đến chốn.',
        requirements: [
          'Ít nhất một lỗi tái hiện được, có ca tối giản',
          'Báo cáo theo quy trình công bố có trách nhiệm của dự án',
          'Kèm bản vá hoặc test hồi quy đề xuất',
        ],
      },
    },
    {
      id: 'security-s4',
      tier: 's4',
      name: 'Chuyên gia — phòng thủ và kiến trúc an toàn',
      canDo: 'Thiết kế kiến trúc an toàn cho tổ chức, dẫn dắt ứng cứu sự cố.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'security-s4-m1',
          title: 'Kiến trúc an toàn',
          topics: [
            'Zero trust, phân đoạn mạng, ranh giới tin cậy',
            'Quản lý khoá và bí mật ở quy mô tổ chức',
            'Bảo mật từ thiết kế trong vòng đời phát triển',
          ],
        },
        {
          id: 'security-s4-m2',
          title: 'Phát hiện và ứng cứu',
          topics: [
            'Nhật ký, SIEM, luật phát hiện',
            'Săn lùng mối đe doạ, MITRE ATT&CK',
            'Quy trình ứng cứu: ngăn chặn, diệt trừ, phục hồi',
          ],
        },
        {
          id: 'security-s4-m3',
          title: 'Điều tra số',
          topics: [
            'Thu thập chứng cứ giữ nguyên tính toàn vẹn',
            'Dòng thời gian sự cố từ nhiều nguồn nhật ký',
            'Báo cáo sự cố cho lãnh đạo và cơ quan quản lý',
          ],
        },
        {
          id: 'security-s4-m4',
          title: 'Quản trị và tuân thủ',
          topics: [
            'Đánh giá rủi ro, rủi ro bên thứ ba',
            'Nghị định bảo vệ dữ liệu cá nhân tại Việt Nam, ISO 27001 mức khái niệm',
            'Đào tạo nhận thức cho người không kỹ thuật',
          ],
        },
      ],
      project: {
        name: 'Chương trình an toàn cho một sản phẩm thật',
        brief: 'Áp dụng đủ vòng: mô hình đe doạ → kiểm soát → phát hiện → diễn tập.',
        requirements: [
          'Mô hình đe doạ viết thành văn bản với các kiểm soát tương ứng',
          'Quét bảo mật tự động chặn CI, không có bí mật trong repo',
          'Một buổi diễn tập ứng cứu sự cố có báo cáo',
        ],
      },
    },
  ],
  capstone: {
    name: 'Đóng góp an toàn được cộng đồng ghi nhận',
    brief: 'Bằng chứng nghề: lỗ hổng đã công bố có trách nhiệm hoặc hệ thống phòng thủ vận hành.',
    requirements: [
      'Ít nhất một CVE/báo cáo được ghi nhận, hoặc một chương trình phòng thủ vận hành ≥ 3 tháng',
      'Hồ sơ luôn có văn bản cho phép trước khi kiểm thử',
      'Tài liệu chia sẻ lại cho người khác học được',
    ],
  },
  expertSignals: [
    'Luôn xác định phạm vi được phép trước khi gõ lệnh đầu tiên',
    'Tìm lỗi logic nghiệp vụ, thứ không máy quét nào bắt được',
    'Đề xuất biện pháp gốc rễ thay vì vá từng triệu chứng',
    'Viết báo cáo mà lập trình viên đọc xong sửa được ngay',
  ],
  careers: [
    'Application Security Engineer',
    'Penetration Tester',
    'Security Engineer / SOC Analyst',
    'Incident Response / Forensics',
  ],
  pitfalls: [
    'Thực hành trên hệ thống không được phép — vi phạm pháp luật, mất nghề',
    'Chỉ chạy máy quét và dán kết quả làm báo cáo',
    'Học khai thác mà không học cách vá',
    'Doạ nạt đội phát triển thay vì hợp tác với họ',
  ],
  resources: [
    'OWASP Testing Guide + OWASP Top 10',
    'The Web Application Hacker’s Handbook',
    'PortSwigger Web Security Academy (lab miễn phí)',
    'MITRE ATT&CK, NIST SP 800-61 (ứng cứu sự cố)',
  ],
}

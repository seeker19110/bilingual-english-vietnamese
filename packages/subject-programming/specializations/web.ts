// Hướng WEB — làm ra sản phẩm chạy trên trình duyệt, từ trang tĩnh tới nền tảng nhiều người dùng.
import type { ProgrammingSpecialization } from './types.js'

export const WEB_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'web',
  name: 'Lập trình Web',
  tagline: 'Xây web app người thật dùng được: nhanh, truy cập được, không sập khi đông người.',
  forWho:
    'Hợp với người thích thấy kết quả ngay trên màn hình và thích làm sản phẩm cho người dùng cuối. Không hợp nếu bạn ghét việc giao diện phải chạy đúng trên 5 loại trình duyệt.',
  prerequisite: 'p4',
  duration: '9–14 tháng (song song đi làm)',
  languages: ['TypeScript', 'JavaScript', 'HTML/CSS', 'SQL'],
  coreTools: ['React', 'Vite', 'Node.js', 'PostgreSQL', 'Playwright', 'Git/CI'],
  architecture: {
    modules: [
      {
        name: 'UI (component + route)',
        role: 'Chỉ trình bày và bắt sự kiện. KHÔNG chứa quy tắc nghiệp vụ.',
      },
      {
        name: 'Server state / API client',
        role: 'Nói chuyện với server, cache, thử lại. Nơi DUY NHẤT biết URL và hình dạng response.',
      },
      {
        name: 'Lõi nghiệp vụ (thuần)',
        role: 'Tính tiền, kiểm hợp lệ, chuyển trạng thái. Hàm thuần, không đụng mạng/DOM.',
      },
      {
        name: 'API handler (server)',
        role: 'Kiểm quyền + validate input + gọi lõi. KHÔNG chứa SQL rải rác.',
      },
      { name: 'Tầng lưu trữ', role: 'Truy vấn CSDL. Nơi duy nhất biết tên bảng và tên cột.' },
    ],
    contracts: [
      'Kiểu dữ liệu giữa frontend và backend định nghĩa MỘT LẦN ở gói hợp đồng dùng chung, cả hai bên import.',
      'Response luôn validate lúc chạy ở client — server đúng không có nghĩa mạng giữa đường không hỏng.',
      'Lỗi trả về có mã máy đọc được; UI ánh xạ mã sang câu tiếng Việt, không so khớp chuỗi.',
      'Mọi endpoint ghi phải idempotent hoặc nêu rõ vì sao không cần.',
    ],
    keyDecisions: [
      'Render ở server hay client cho từng loại trang — quyết định này khoá luôn SEO và thời gian hiển thị đầu.',
      'Server state để riêng khỏi client state; nhét chung vào một store toàn cục là bệnh phổ biến nhất.',
      'Nguồn sự thật của phiên đăng nhập: cookie phiên hay token — kéo theo cả cách chống CSRF.',
    ],
    nfrs: [
      'LCP ≤ 2,5s và INP ≤ 200ms trên máy tầm trung, mạng 4G mô phỏng.',
      'Ngân sách bundle ban đầu có ngưỡng cứng chặn CI.',
      'Không vi phạm a11y mức A/AA ở mọi theme; nội dung đọc đạt AAA.',
    ],
    specChecklist: [
      'Bốn trạng thái của mỗi màn: tải / rỗng / lỗi / có dữ liệu — không được bỏ trạng thái nào.',
      'Ai được xem, ai được sửa; server kiểm quyền chứ không phải UI ẩn nút.',
      'Hành vi khi mạng chậm hoặc request bị huỷ giữa chừng.',
      'Ngưỡng hiệu năng và ngân sách bundle cho phần thêm vào.',
    ],
  },
  stages: [
    {
      id: 'web-s1',
      tier: 's1',
      name: 'Nền web vững — trình duyệt thật sự làm gì',
      canDo:
        'Dựng được web app nhiều trang bằng React + TypeScript, tự giải thích được mỗi lần bấm chuột trình duyệt làm gì.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'web-s1-m1',
          title: 'Trình duyệt hoạt động ra sao',
          topics: [
            'Từ URL tới pixel: DNS → HTTP → HTML → CSSOM → render tree → paint',
            'Event loop, macrotask/microtask, vì sao UI "đứng hình"',
            'DevTools: Network, Elements, Performance đọc được',
          ],
        },
        {
          id: 'web-s1-m2',
          title: 'CSS hiện đại đúng cách',
          topics: [
            'Flexbox và Grid: chọn cái nào cho bố cục nào',
            'Mobile-first, container query, đơn vị tương đối',
            'Design token bằng biến CSS thay vì màu ghi cứng',
          ],
        },
        {
          id: 'web-s1-m3',
          title: 'React đúng mô hình tư duy',
          topics: [
            'State là nguồn sự thật, UI là hàm của state',
            'useEffect chỉ dùng để đồng bộ thứ ngoài React — không dùng để tính toán',
            'Nâng state lên, chia component theo dữ liệu không theo giao diện',
          ],
        },
        {
          id: 'web-s1-m4',
          title: 'TypeScript cho UI',
          topics: [
            'Kiểu props, union phân biệt (discriminated union) cho trạng thái tải/lỗi/rỗng',
            'Validate dữ liệu API lúc chạy bằng Zod — không tin `as`',
          ],
        },
        {
          id: 'web-s1-m5',
          title: 'Accessibility nhập môn',
          topics: [
            'HTML ngữ nghĩa trước, ARIA sau',
            'Bàn phím đi hết được mọi luồng, focus nhìn thấy được',
            'Tương phản màu, kích thước vùng chạm ≥ 44px',
          ],
        },
      ],
      project: {
        name: 'Bảng quản trị cửa hàng (client)',
        brief: 'Web app quản lý món/đơn của cửa hàng, dữ liệu lấy từ API giả lập.',
        requirements: [
          'Ít nhất 4 màn có định tuyến thật, F5 không mất trạng thái',
          'Mọi màn có đủ 4 trạng thái: tải / rỗng / lỗi / có dữ liệu',
          'Đi hết luồng đặt hàng chỉ bằng bàn phím',
          'Lighthouse Accessibility ≥ 95 trên mobile',
        ],
      },
    },
    {
      id: 'web-s2',
      tier: 's2',
      name: 'Full-stack — có backend của mình',
      canDo:
        'Tự dựng API có xác thực, nối cơ sở dữ liệu thật, deploy được cả frontend lẫn backend.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'web-s2-m1',
          title: 'API HTTP tử tế',
          topics: [
            'REST: tài nguyên, mã trạng thái, phân trang, idempotency',
            'Validate mọi input ở server — không tin client',
            'Lỗi có mã máy đọc được, không chỉ chuỗi tiếng Việt',
          ],
        },
        {
          id: 'web-s2-m2',
          title: 'Cơ sở dữ liệu quan hệ',
          topics: [
            'Thiết kế schema, khoá ngoại, chuẩn hoá vừa đủ',
            'Index và cách đọc EXPLAIN',
            'Transaction và bài toán đọc-sửa-ghi đồng thời',
          ],
        },
        {
          id: 'web-s2-m3',
          title: 'Xác thực & phiên',
          topics: [
            'Hash mật khẩu (argon2/bcrypt), không bao giờ lưu thô',
            'Session cookie vs JWT: đánh đổi thật, chọn theo bài toán',
            'OAuth 2.0 / OIDC mức dùng được',
          ],
        },
        {
          id: 'web-s2-m4',
          title: 'Tải dữ liệu ở client',
          topics: [
            'Cache, invalidate, optimistic update',
            'Race condition khi gõ tìm kiếm — huỷ request cũ',
            'Server state khác client state, đừng nhét hết vào một store',
          ],
        },
        {
          id: 'web-s2-m5',
          title: 'Deploy và môi trường',
          topics: [
            'Biến môi trường, secret không nằm trong repo',
            'HTTPS, domain, reverse proxy',
            'Migration cơ sở dữ liệu có phiên bản, rollback được',
          ],
        },
      ],
      project: {
        name: 'Cửa hàng full-stack chạy trên Internet',
        brief: 'Frontend + API + PostgreSQL, có đăng nhập, deploy công khai.',
        requirements: [
          'Đăng ký/đăng nhập thật, mật khẩu hash',
          'CRUD món + đơn, mọi endpoint tự kiểm quyền theo người dùng',
          'Migration có phiên bản, chạy được từ CSDL trống',
          'URL công khai truy cập được, có HTTPS',
        ],
        stretch: ['Thêm tải ảnh món lên object storage'],
      },
    },
    {
      id: 'web-s3',
      tier: 's3',
      name: 'Nâng cao — hiệu năng, kiến trúc, chất lượng',
      canDo:
        'Chẩn đoán và sửa được web chậm bằng số đo, viết được bộ test giữ cho dự án lớn không vỡ.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'web-s3-m1',
          title: 'Hiệu năng web đo bằng số',
          topics: [
            'Core Web Vitals: LCP, INP, CLS — đo ở thiết bị thật',
            'Chia bundle, tải lười, ảnh đúng định dạng/kích thước',
            'Ngân sách bundle chặn CI, không để phình dần',
          ],
        },
        {
          id: 'web-s3-m2',
          title: 'Render phía server',
          topics: [
            'SSR / SSG / streaming: chọn theo loại trang',
            'Hydration và cái giá của nó',
            'SEO, thẻ meta, dữ liệu có cấu trúc',
          ],
        },
        {
          id: 'web-s3-m3',
          title: 'Kiểm thử tự động',
          topics: [
            'Kim tự tháp test: unit / integration / E2E',
            'Playwright cho luồng chính, test a11y tự động',
            'Test ca biên: rỗng, null vs 0, số lớn, mạng chậm',
          ],
        },
        {
          id: 'web-s3-m4',
          title: 'Kiến trúc frontend lớn',
          topics: [
            'Ranh giới module, luật phụ thuộc chặn bằng lint',
            'Feature-based structure thay vì gom theo loại file',
            'Thiết kế design system dùng chung, tài liệu component',
          ],
        },
        {
          id: 'web-s3-m5',
          title: 'Bảo mật web thực chiến',
          topics: [
            'XSS, CSRF, SSRF, IDOR — cách sinh ra và cách chặn',
            'Content Security Policy, cookie SameSite/HttpOnly',
            'Rate limit và chống lạm dụng API tốn tiền',
          ],
        },
      ],
      project: {
        name: 'Tối ưu & gia cố một web app có thật',
        brief: 'Nhận dự án đang chậm (của mình hoặc mã nguồn mở) và cải thiện có số đo trước–sau.',
        requirements: [
          'Báo cáo trước–sau: LCP/INP/CLS và kích thước bundle',
          'Bộ E2E phủ ≥ 3 luồng chính, chạy trong CI',
          'Sửa ít nhất 2 lỗ hổng bảo mật tìm được, có test hồi quy',
        ],
      },
    },
    {
      id: 'web-s4',
      tier: 's4',
      name: 'Chuyên gia — quy mô, thời gian thực, vận hành',
      canDo:
        'Thiết kế được hệ thống web nhiều người dùng đồng thời, chịu trách nhiệm vận hành sản phẩm thật.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'web-s4-m1',
          title: 'Thời gian thực',
          topics: [
            'WebSocket, SSE, pub/sub khi có nhiều tiến trình',
            'Presence, reconnect, gửi lại thứ tự đúng',
            'CRDT / OT mức khái niệm cho soạn thảo cộng tác',
          ],
        },
        {
          id: 'web-s4-m2',
          title: 'Offline và web nâng cao',
          topics: [
            'Service worker, chiến lược cache, cập nhật không phá phiên đang dùng',
            'IndexedDB, đồng bộ khi có mạng lại',
            'WebAssembly khi JavaScript không đủ nhanh',
          ],
        },
        {
          id: 'web-s4-m3',
          title: 'Vận hành sản phẩm',
          topics: [
            'Log có cấu trúc, trace, metric — ba thứ khác nhau',
            'Cảnh báo theo triệu chứng người dùng, không theo CPU',
            'Feature flag, canary, rollback trong vài phút',
          ],
        },
        {
          id: 'web-s4-m4',
          title: 'Dẫn dắt kỹ thuật',
          topics: [
            'Viết ADR: quyết định kiến trúc kèm đánh đổi',
            'Review code dạy được người khác, không chỉ bắt lỗi',
            'Ước lượng và chia lát giao được từng phần',
          ],
        },
      ],
      project: {
        name: 'Nền tảng cộng tác thời gian thực',
        brief: 'Sản phẩm nhiều người dùng cùng lúc thấy thay đổi của nhau tức thì.',
        requirements: [
          'Đồng bộ thời gian thực chạy đúng khi server có nhiều tiến trình',
          'Hoạt động được khi mất mạng tạm thời, không mất dữ liệu',
          'Có dashboard vận hành: lỗi, độ trễ, số phiên đang mở',
        ],
      },
    },
  ],
  capstone: {
    name: 'Sản phẩm web có người dùng thật',
    brief: 'Một web app bạn tự vận hành, có người ngoài dùng và có số liệu chứng minh.',
    requirements: [
      'Chạy công khai ≥ 3 tháng, có người dùng ngoài bạn bè',
      'CI/CD tự động, deploy không cần thao tác tay',
      'Có SLO (ví dụ 99% request < 500ms) và số đo thực tế đối chiếu',
      'Tài liệu kiến trúc + ≥ 3 ADR giải thích quyết định lớn',
    ],
  },
  expertSignals: [
    'Nhìn waterfall Network là đoán đúng nút thắt trước khi đo',
    'Chọn SSR hay CSR bằng lý do đo được, không theo trend',
    'Sửa lỗi bằng cách viết test tái hiện trước, rồi mới sửa',
    'Nói được cái giá của mỗi thư viện định thêm vào bundle',
  ],
  careers: [
    'Frontend Engineer',
    'Full-stack Engineer',
    'Web Performance Engineer',
    'Design System Engineer',
  ],
  pitfalls: [
    'Học framework mà không học nền: HTTP, CSS, event loop',
    'Nhồi mọi state vào một store toàn cục rồi không gỡ ra được',
    'Coi accessibility là việc làm sau cùng — làm sau luôn đắt hơn',
    'Đổi framework mỗi năm thay vì đào sâu một cái tới mức hiểu ruột',
  ],
  resources: [
    'MDN Web Docs — chuẩn tra cứu của nghề',
    'web.dev (Google) — hiệu năng và Core Web Vitals',
    'WCAG 2.2 + WAI-ARIA Authoring Practices',
    'Designing Data-Intensive Applications (phần lưu trữ, cho chặng S4)',
  ],
}

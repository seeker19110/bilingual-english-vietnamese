// Hướng KIẾN TRÚC — dành cho người sẽ QUYẾT ĐỊNH và ĐẶC TẢ, để người khác (hoặc AI) thi hành.
//
// Đây là hướng NỀN cắt ngang: nó không dạy một công nghệ nào, nó dạy cách chia hệ thống thành
// module có ranh giới rõ, cách viết hợp đồng giữa chúng, và cách nghiệm thu phần việc mình
// không tự gõ. Với người làm việc cùng AI, đây là kỹ năng quyết định chất lượng sản phẩm —
// vì AI viết code rất nhanh, nhưng chỉ viết đúng thứ mà đặc tả nói rõ.
import type { ProgrammingSpecialization } from './types.js'

export const ARCHITECTURE_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'architecture',
  name: 'Kiến trúc hệ thống & Đặc tả cho AI thi hành',
  tagline:
    'Chia hệ thống thành module có ranh giới, viết đặc tả kín, nghiệm thu được code mình không tự gõ.',
  forWho:
    'Hợp với người đã code đủ để biết cái gì hay hỏng, và nay muốn quyết định thay vì gõ từng dòng — đặc biệt khi phần lớn code do AI hoặc người khác viết. KHÔNG hợp nếu bạn chưa từng tự tay làm một dự án hoàn chỉnh: không có trải nghiệm gãy thật thì đặc tả sẽ chỉ là chữ đẹp.',
  prerequisite: 'p4',
  duration: '8–14 tháng (học song song một hướng sản phẩm)',
  crossCutting: true,
  languages: ['Không gắn với ngôn ngữ nào — ví dụ dùng TypeScript và SQL'],
  coreTools: [
    'Sơ đồ C4 + sequence',
    'ADR (bản ghi quyết định kiến trúc)',
    'JSON Schema / Zod / OpenAPI',
    'Công cụ tra phụ thuộc (như `npm run codemap` của dự án này)',
    'Lint luật phụ thuộc + test canh gác trong CI',
  ],
  architecture: {
    modules: [
      {
        name: 'Bản đồ hệ thống (C4)',
        role: 'Trả lời "có những hộp nào, hộp nào gọi hộp nào". KHÔNG chứa chi tiết cài đặt.',
      },
      {
        name: 'Sổ hợp đồng',
        role: 'Nơi duy nhất định nghĩa dữ liệu đi qua ranh giới. Không module nào tự định nghĩa lại.',
      },
      {
        name: 'Sổ quyết định (ADR)',
        role: 'Ghi vì sao chọn cách này và bỏ cách kia. KHÔNG phải tài liệu hướng dẫn dùng.',
      },
      {
        name: 'Đặc tả thi hành',
        role: 'Đơn vị giao việc: phạm vi, điểm chạm, tiêu chí chấp nhận. Không bàn lại lý do.',
      },
      {
        name: 'Bộ canh gác',
        role: 'Test + lint bắt đỏ khi ai đó phá ranh giới hay bất biến. Không dùng để bắt lỗi cú pháp.',
      },
    ],
    contracts: [
      'Mọi thứ đi qua ranh giới module phải có schema kiểm được lúc chạy — không truyền "object bất kỳ".',
      'Hợp đồng chỉ được MỞ RỘNG (thêm trường tuỳ chọn), phá vỡ thì phải có phiên bản mới song song.',
      'Bên gọi không bao giờ được biết bên trong bên bị gọi lưu dữ liệu thế nào.',
      'Mọi lỗi qua ranh giới có mã máy đọc được, không chỉ chuỗi tiếng Việt cho người đọc.',
    ],
    keyDecisions: [
      'Ranh giới module cắt theo NGHIỆP VỤ hay theo LOẠI FILE — cắt sai thì mỗi thay đổi nhỏ động vào chục file.',
      'Một khối liền (monolith) có module rõ, hay nhiều dịch vụ tách rời — tách sớm là tự chuốc bài toán phân tán.',
      'Dữ liệu là nguồn sự thật duy nhất ở đâu; ai được ghi, ai chỉ được đọc.',
      'Cái gì đồng bộ, cái gì qua hàng đợi — quyết định này khoá luôn cách xử lý lỗi về sau.',
    ],
    nfrs: [
      'Thời gian một người mới (hoặc một phiên AI mới) hiểu được module: đọc ≤ 1 file bản đồ + 1 hợp đồng.',
      'Đổi một quyết định nghiệp vụ chỉ chạm ≤ 2 module.',
      'Mọi bất biến quan trọng có ít nhất 1 test canh gác chặn CI.',
      'Không có vòng phụ thuộc giữa các module (kiểm bằng công cụ, không bằng trí nhớ).',
    ],
    specChecklist: [
      'Phạm vi: làm gì và KHÔNG làm gì (mục "không làm" quan trọng ngang mục "làm").',
      'Điểm chạm: đường dẫn file cụ thể sẽ sửa/thêm, không nói chung chung "sửa phần backend".',
      'Hợp đồng: kiểu dữ liệu vào/ra viết ra hẳn, kèm ca lỗi.',
      'Tiêu chí chấp nhận: đo được, và nói rõ chạy lệnh nào để chứng minh.',
      'Bất biến không được phá + test nào canh nó.',
      'Quy ước dự án liên quan (bên thi hành không thấy được hội thoại trước đó).',
    ],
  },
  stages: [
    {
      id: 'architecture-s1',
      tier: 's1',
      name: 'Ranh giới — chia hệ thống thành module',
      canDo:
        'Vẽ được bản đồ một hệ thống có thật, chỉ ra ranh giới module và chứng minh phụ thuộc đi đúng một chiều.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'architecture-s1-m1',
          title: 'Module là gì và không là gì',
          topics: [
            'Trách nhiệm duy nhất: mỗi module đổi vì MỘT lý do',
            'Kết dính cao — ghép nối lỏng, đo bằng câu hỏi "đổi cái này thì phải mở mấy file"',
            'Cắt theo nghiệp vụ (feature) thay vì theo loại file (components/, utils/)',
            'Module ẩn cái gì: cấu trúc dữ liệu bên trong, thư viện đang dùng, cách lưu trữ',
          ],
        },
        {
          id: 'architecture-s1-m2',
          title: 'Luật phụ thuộc',
          topics: [
            'Phụ thuộc chỉ đi một chiều: lõi nghiệp vụ không biết gì về giao diện và hạ tầng',
            'Đảo phụ thuộc: định nghĩa cổng ở lõi, cắm cài đặt từ ngoài vào',
            'Vòng phụ thuộc là bệnh, không phải phong cách — phát hiện bằng công cụ',
            'Chặn bằng lint thay vì bằng nhắc nhở trong review',
          ],
        },
        {
          id: 'architecture-s1-m3',
          title: 'Vẽ để nghĩ, không phải để trang trí',
          topics: [
            'Mô hình C4: bối cảnh → hộp lớn → thành phần (dừng ở tầng đủ dùng)',
            'Sơ đồ tuần tự cho một luồng khó, chỉ vẽ luồng có tranh cãi',
            'Sơ đồ nào cũng phải trả lời được một câu hỏi cụ thể, không thì đừng vẽ',
          ],
        },
        {
          id: 'architecture-s1-m4',
          title: 'Đọc hệ thống người khác',
          topics: [
            'Lần theo một luồng từ đầu vào tới cơ sở dữ liệu',
            'Tìm điểm nóng: file bị import nhiều nhất = rủi ro cao nhất',
            'Nhận diện mã "biết quá nhiều" và ranh giới bị rò rỉ',
          ],
        },
      ],
      project: {
        name: 'Bản đồ kiến trúc một hệ thống có thật',
        brief:
          'Lấy một dự án đang chạy (của bạn hoặc mã nguồn mở) và dựng lại bản đồ module thật của nó.',
        requirements: [
          'Sơ đồ C4 hai tầng + bảng module kèm trách nhiệm duy nhất của từng module',
          'Chỉ ra ≥ 3 chỗ ranh giới bị rò rỉ, kèm bằng chứng (đường dẫn file, chiều import)',
          'Đề xuất cắt lại ranh giới cho MỘT chỗ, nói rõ đánh đổi',
          'Danh sách vòng phụ thuộc lấy bằng công cụ, không bằng đọc tay',
        ],
      },
    },
    {
      id: 'architecture-s2',
      tier: 's2',
      name: 'Hợp đồng & mô hình miền',
      canDo:
        'Thiết kế được hợp đồng dữ liệu giữa các module, tiến hoá nó mà không phá bản đang chạy.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'architecture-s2-m1',
          title: 'Mô hình hoá miền',
          topics: [
            'Ngôn ngữ chung: tên trong code phải trùng tên người làm nghiệp vụ dùng',
            'Ngữ cảnh giới hạn: cùng một chữ "đơn hàng" nghĩa khác nhau ở kho và ở kế toán',
            'Thực thể vs giá trị; cái gì có định danh, cái gì chỉ là dữ liệu',
            'Bất biến nghiệp vụ: điều luôn đúng bất kể thao tác nào (tồn kho không âm)',
          ],
        },
        {
          id: 'architecture-s2-m2',
          title: 'Hợp đồng kiểm được',
          topics: [
            'Schema là hợp đồng: Zod/JSON Schema/OpenAPI — kiểm lúc chạy, không chỉ lúc biên dịch',
            'Kiểu làm sai trở nên bất khả biểu diễn (union phân biệt cho trạng thái)',
            'Ca lỗi cũng là một phần hợp đồng, không phải phụ lục',
          ],
        },
        {
          id: 'architecture-s2-m3',
          title: 'Tiến hoá không phá',
          topics: [
            'Chỉ thêm trường tuỳ chọn; xoá/đổi nghĩa là phá vỡ',
            'Mở rộng rồi mới thu hẹp: chạy song song hai bản, chuyển dần, rồi mới bỏ bản cũ',
            'Phiên bản hoá API và schema cơ sở dữ liệu, migration quay lui được',
          ],
        },
        {
          id: 'architecture-s2-m4',
          title: 'Dữ liệu là phần khó đổi nhất',
          topics: [
            'Nguồn sự thật duy nhất; ai được ghi, ai chỉ đọc',
            'Nhân bản dữ liệu để tiện đọc và cái giá phải trả khi nó lệch',
            'Thời gian, tiền, định danh: ba chỗ sai kiến trúc đắt nhất',
          ],
        },
      ],
      project: {
        name: 'Bộ hợp đồng cho dự án của bạn',
        brief:
          'Tách toàn bộ dữ liệu đi qua ranh giới của dự án cửa hàng ra một gói hợp đồng dùng chung.',
        requirements: [
          'Mọi endpoint và mọi ranh giới module dùng schema từ gói hợp đồng, không định nghĩa lại',
          'Ít nhất 5 bất biến nghiệp vụ viết thành test, chạy đỏ khi cố tình phá',
          'Một lần tiến hoá schema thật theo lối mở-rộng-rồi-thu-hẹp, không downtime',
          'Ca lỗi có mã, có tài liệu, có test',
        ],
      },
    },
    {
      id: 'architecture-s3',
      tier: 's3',
      name: 'Đặc tả thi hành được & nghiệm thu code mình không tự gõ',
      canDo:
        'Viết được đặc tả đủ kín để người khác hoặc AI làm đúng ngay lượt đầu, và chứng minh được kết quả đúng.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'architecture-s3-m1',
          title: 'Đặc tả kín',
          topics: [
            'Kín nghĩa là: đọc xong không phải hỏi lại câu nào để bắt đầu',
            'Sáu ô bắt buộc: phạm vi (làm / KHÔNG làm) · điểm chạm file · hợp đồng vào-ra · tiêu chí chấp nhận · bất biến · quy ước dự án',
            'Viết tiêu chí chấp nhận trước khi viết mô tả giải pháp',
            'Chia lát: mỗi lát nhỏ, chạy được, kiểm được — không giao một cục lớn',
          ],
        },
        {
          id: 'architecture-s3-m2',
          title: 'Giao việc cho AI (hoặc cho người mới)',
          topics: [
            'Bên thi hành KHÔNG thấy ngữ cảnh trước đó — mọi giả định phải viết ra',
            'Chọn độ tự quyết: việc cơ học / việc vừa có đặc tả / việc phức tạp cần tự quyết',
            'Chống ảo giác: bắt dẫn nguồn (đường dẫn file, kết quả lệnh) thay vì tin lời khẳng định',
            'Cấm mở rộng phạm vi: nói rõ cái gì KHÔNG được đụng tới',
          ],
        },
        {
          id: 'architecture-s3-m3',
          title: 'Nghiệm thu',
          topics: [
            'Test canh gác: bất biến kiến trúc bị phá là CI đỏ, không đợi review phát hiện',
            'Review theo tầng: đúng hợp đồng → đúng ranh giới → đúng ca biên → mới tới phong cách',
            'Đòi bằng chứng chạy thật (lệnh + output), không nhận "chắc là chạy được"',
            'Loại lỗi công cụ không bắt được: logic nghiệp vụ, ca rỗng, đua điều kiện, thời gian',
          ],
        },
        {
          id: 'architecture-s3-m4',
          title: 'Sổ quyết định (ADR)',
          topics: [
            'Một ADR = bối cảnh, phương án đã cân nhắc, quyết định, đánh đổi, hệ quả',
            'Ghi cả phương án BỊ LOẠI và lý do — nếu không, phiên sau sẽ đề xuất lại đúng nó',
            'ADR là bất biến cho bên thi hành: muốn đổi thì viết ADR mới thay thế, không lặng lẽ làm khác',
          ],
        },
      ],
      project: {
        name: 'Một tính năng thật do bên khác thi hành theo đặc tả của bạn',
        brief:
          'Bạn viết đặc tả và nghiệm thu; phần code do AI hoặc người khác viết. Bạn không tự gõ phần cài đặt.',
        requirements: [
          'Đặc tả có đủ sáu ô bắt buộc, được thi hành đúng ngay lượt đầu (≤ 1 vòng làm rõ)',
          'Bộ test canh gác viết TRƯỚC khi giao việc, bắt đỏ được ít nhất một lỗi thật',
          '≥ 2 ADR cho các quyết định lớn của tính năng',
          'Biên bản nghiệm thu: chạy lệnh nào, kết quả gì, còn để ngỏ gì',
        ],
        stretch: ['Giao cùng một đặc tả cho hai bên thi hành và so kết quả để tìm chỗ đặc tả hở'],
      },
    },
    {
      id: 'architecture-s4',
      tier: 's4',
      name: 'Chuyên gia — tiến hoá kiến trúc và dẫn dắt',
      canDo:
        'Dẫn kiến trúc của một hệ thống đang sống qua thay đổi lớn mà không dừng dịch vụ, và giữ được nó qua nhiều đợt người/AI khác nhau.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'architecture-s4-m1',
          title: 'Yêu cầu phi chức năng thành số',
          topics: [
            'Hiệu năng, sẵn sàng, bảo mật, trợ năng, chi phí — mỗi thứ một ngưỡng đo được',
            'NFR không đo được là NFR không tồn tại',
            'Gắn ngưỡng vào cổng CI (ngân sách bundle, sàn coverage, quét a11y)',
            'Đánh đổi công khai: nhanh hơn thì đắt hơn ở đâu',
          ],
        },
        {
          id: 'architecture-s4-m2',
          title: 'Thay thế dần thay vì viết lại',
          topics: [
            'Cây bóp cổ (strangler fig): dựng cái mới bên cạnh, chuyển từng luồng',
            'Chạy song song và đối chiếu kết quả trước khi cắt cái cũ',
            'Di trú dữ liệu lớn không downtime, luôn có đường lui',
            'Vì sao "viết lại từ đầu" gần như luôn thất bại',
          ],
        },
        {
          id: 'architecture-s4-m3',
          title: 'Giữ kiến trúc không rữa',
          topics: [
            'Kiến trúc rữa dần vì mỗi ngoại lệ nhỏ đều "chỉ lần này thôi"',
            'Quản nợ kỹ thuật: ghi ra, ước lượng lãi, trả có kế hoạch',
            'Cổng tự động thay cho kỷ luật cá nhân',
            'Đo sức khoẻ kiến trúc: vòng phụ thuộc, điểm nóng, kích thước module',
          ],
        },
        {
          id: 'architecture-s4-m4',
          title: 'Dẫn dắt nhiều bên thi hành',
          topics: [
            'Chia việc song song không đụng nhau: một đặc tả = một ranh giới module',
            'Chuẩn hoá khuôn đặc tả và khuôn nghiệm thu để chất lượng không phụ thuộc người viết',
            'Ghi trạng thái dự án sao cho phiên sau đọc là đủ, không phải hỏi lại',
            'Biết khi nào phải tự tay làm: việc mà đặc tả tốn hơn tự làm',
          ],
        },
      ],
      project: {
        name: 'Dẫn một thay đổi kiến trúc lớn trên hệ thống đang sống',
        brief:
          'Ví dụ: tách một khối lớn thành gói có ranh giới, hoặc đổi tầng lưu trữ, trong khi hệ thống vẫn phục vụ.',
        requirements: [
          'Không downtime, có kế hoạch quay lui viết trước khi bắt đầu',
          'Chuyển từng lát, mỗi lát có cổng nghiệm thu riêng',
          'NFR trước–sau đo bằng số, không tụt',
          'Bộ ADR + bản đồ kiến trúc cập nhật, đủ để người mới tiếp quản',
        ],
      },
    },
  ],
  capstone: {
    name: 'Hệ thống bạn KHÔNG tự gõ phần lớn code nhưng chịu trách nhiệm về nó',
    brief:
      'Sản phẩm thật do AI hoặc đội khác thi hành theo đặc tả của bạn, chạy được và giữ được chất lượng.',
    requirements: [
      '≥ 10 đặc tả đã thi hành, mỗi cái có biên bản nghiệm thu',
      'Bộ canh gác trong CI: luật phụ thuộc, bất biến nghiệp vụ, NFR có ngưỡng',
      'Sổ ADR đầy đủ cho mọi quyết định lớn, có ít nhất một ADR thay thế ADR cũ',
      'Một người mới đọc tài liệu là bắt tay vào việc được, kiểm chứng bằng người thật',
      'Không có vòng phụ thuộc giữa các module, chứng minh bằng công cụ',
    ],
  },
  expertSignals: [
    'Viết tiêu chí chấp nhận trước khi viết mô tả giải pháp',
    'Nói được đặc tả của mình hở ở đâu trước khi bên thi hành hỏi',
    'Từ chối một yêu cầu vì nó phá ranh giới, và đề xuất cách khác đạt cùng mục tiêu',
    'Đòi bằng chứng chạy thật thay vì tin lời khẳng định — kể cả lời của chính mình',
    'Chọn giải pháp nhàm chán khi nó đủ dùng, và nói rõ vì sao không chọn cái hay hơn',
  ],
  careers: [
    'Software Architect',
    'Tech Lead / Staff Engineer',
    'Platform Architect',
    'Người dẫn dắt sản phẩm có AI thi hành phần lớn code',
  ],
  pitfalls: [
    'Đặc tả nói "làm gì" mà không nói "KHÔNG làm gì" — bên thi hành tự mở rộng phạm vi',
    'Vẽ sơ đồ đẹp nhưng không ai kiểm nó còn khớp code hay không',
    'Chốt kiến trúc phức tạp cho vấn đề chưa xảy ra (microservice từ ngày đầu)',
    'Nhận code chạy được là xong, không kiểm bất biến và ca biên',
    'Không ghi phương án bị loại, để rồi mỗi phiên lại đề xuất lại đúng nó',
    'Đặc tả kiến trúc mà bản thân chưa từng tự tay làm hỏng thứ gì tương tự',
  ],
  resources: [
    'A Philosophy of Software Design — John Ousterhout (độ sâu module, che giấu thông tin)',
    'Domain-Driven Design Distilled — Vaughn Vernon',
    'Fundamentals of Software Architecture — Richards & Ford (đánh đổi, đặc tính kiến trúc)',
    'Documenting Architecture Decisions — Michael Nygard (khuôn ADR)',
    'The C4 model for visualising software architecture — Simon Brown',
  ],
}

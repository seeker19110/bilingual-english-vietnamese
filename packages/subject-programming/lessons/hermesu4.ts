// lessons/hermesu4.ts — Chương C4 "Multi-agent và hệ sinh thái" của khoá Hermes (PR 3/3 —
// docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md §② bảng chương).
//
// Năm bài bám đúng 5 mục phần IV của đề cương tham chiếu: Kanban board · Herdr · Firecrawl ·
// Honcho · Paperclip. Mô phỏng ở mức LUỒNG VIỆC (bảng việc nhiều mục, phân biệt việc-người
// vs việc-agent) qua hermesSim — không dựng lại UI/API thật của từng sản phẩm ngoài.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const HERMES_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'hermes-u4-l1',
    unitId: 'hermes-u4',
    language: 'hermes',
    title: 'Kanban board — bảng việc cho đội người + agent',
    hook: 'Ba việc giao cho agent, hai việc giao cho đồng nghiệp, một việc bạn tự làm — nếu ba nơi theo dõi khác nhau thì cuối ngày không ai biết cái gì đang kẹt ở đâu. Kanban board gom hết về một mặt bàn.',
    theory:
      'Bảng Kanban chia việc theo CỘT trạng thái (đang có ở hermesSim: cho-duyet · xong · tu-choi) — nhìn một lượt là biết việc nào đang nghẽn.\n\nGiá trị lớn nhất khi đội có CẢ người lẫn agent: xem `trangthai` là thấy TOÀN BỘ việc, không phân biệt ai làm — người điều phối không phải hỏi vòng quanh "việc kia ai đang cầm". Việc bị `tu-choi` mà không giao lại là dấu hiệu RÕ RÀNG của việc bị bỏ quên — bảng Kanban là nơi phát hiện sớm nhất.\n\nKỷ luật vận hành: mỗi lần mở bảng, quét đủ ba cột — `cho-duyet` (đang chờ MÌNH nghiệm thu, đừng để đọng), `tu-choi` (đã có phản hồi, cần giao lại có sửa), `xong` (chỉ để đối chiếu, không cần hành động).',
    workedExample: {
      code: `giao "viet email thong bao lich nghi le"
giao "cap nhat bang gia dich vu quy 4"
duyet v1
trangthai`,
      stdinLines: [],
    },
    predict: {
      code: `giao "viec A"
giao "viec B"
tuchoi v2 "chua du so lieu"
trangthai`,
      question: 'Quét bảng việc sau các lệnh trên — v2 nằm ở cột nào?',
      choices: ['tu-choi', 'cho-duyet', 'xong', 'Khong xuat hien tren bang'],
      answerIndex: 0,
      explain:
        'tuchoi chuyển việc sang cột tu-choi — đây là tín hiệu "cần giao lại có sửa", khác hẳn cho-duyet (đang chờ) hay xong (đã xong). Bảng Kanban giúp thấy ngay việc nào đang kẹt.',
    },
    parsons: {
      prompt:
        'Xếp một vòng vận hành bảng: giao hai việc → nghiệm thu một → quét toàn bảng để biết việc còn lại đang ở đâu.',
      lines: [
        'giao "viet email thong bao lich nghi le"',
        'giao "cap nhat bang gia dich vu quy 4"',
        'duyet v1',
        'trangthai',
      ],
    },
    make: {
      prompt:
        'Đầu ngày, kiểm bảng việc chung của đội:\n\n1. Giao hai việc: soan thong bao noi bo ve doi giay lam viec, và ra soat lai hop dong thue van phong\n2. Duyệt việc đầu tiên (v1) vì đã xong tốt.\n3. Quét toàn bảng để biết việc nào còn kẹt.',
      starterCode: `# 1. giao hai viec\n\n# 2. duyet viec dau\n\n# 3. quet toan bang\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'v1 [xong]',
          match: 'contains',
          hidden: false,
          label: 'Việc v1 đã nghiệm thu xong',
        },
        {
          stdinLines: [],
          expected: 'v2 [cho-duyet] ra soat lai hop dong thue van phong',
          match: 'contains',
          hidden: false,
          label: 'Việc v2 còn đang chờ — bảng cho thấy đúng chỗ kẹt',
        },
      ],
      hints: [
        'Hai lệnh giao, rồi duyet v1, rồi trangthai.',
        'Nội dung việc giữ đúng như đề để bảng hiện đúng chữ.',
        'giao "soan thong bao noi bo ve doi giay lam viec" → giao "ra soat lai hop dong thue van phong" → duyet v1 → trangthai.',
      ],
      sampleSolution: `giao "soan thong bao noi bo ve doi giay lam viec"
giao "ra soat lai hop dong thue van phong"
duyet v1
trangthai`,
    },
    homework:
      'Làm thật (không chấm): mở một bảng Kanban thật (Linear, Trello, hoặc giấy dán) cho công việc của bạn tuần này. Thêm một cột "chờ AI làm" bên cạnh các cột người thường dùng — thử hình dung một tuần vận hành với cả người và agent trên cùng một bảng.',
    srsCards: [
      {
        hoi: 'Giá trị lớn nhất của Kanban khi đội có cả người và agent?',
        dap: 'Xem trạng thái là thấy TOÀN BỘ việc không phân biệt ai làm — người điều phối không phải hỏi vòng quanh việc đang ở tay ai.',
      },
      {
        hoi: 'Ba cột trạng thái và ý nghĩa vận hành của từng cột?',
        dap: 'cho-duyet: đang chờ mình nghiệm thu, đừng để đọng. tu-choi: đã có phản hồi, cần giao lại có sửa. xong: chỉ đối chiếu, không cần hành động.',
      },
    ],
  },
  {
    id: 'hermes-u4-l2',
    unitId: 'hermes-u4',
    language: 'hermes',
    title: 'Herdr — bảng điều khiển nhiều agent cùng lúc',
    hook: 'Một agent xử lý một việc là quản đơn giản. Ba việc độc lập chạy song song trên ba profile khác nhau — không có một chỗ nhìn tổng thì bạn phải nhảy qua nhảy lại ba cửa sổ, dễ quên mất việc nào vừa xong.',
    theory:
      'Herdr là bảng điều khiển multi-agent: một màn hình xem nhiều "con" agent (nhiều profile/phiên) đang chạy việc gì, tới đâu — thay vì mở nhiều cửa sổ terminal/chat riêng lẻ.\n\nKhi nào cần tới mức này? Khi bạn thật sự điều phối NHIỀU LUỒNG việc độc lập cùng lúc — ví dụ ba dự án ba profile (bài "Cấu hình profile" ở C1) đều đang có việc chạy. Với một nhân viên văn phòng chỉ dùng một agent cho việc hằng ngày, Herdr là thừa; nó đúng vai với người điều phối dev quản nhiều luồng.\n\nMô phỏng ở đây (không dựng lại UI thật của Herdr): luyện đúng kỷ luật NỀN TẢNG mà bất kỳ bảng điều khiển multi-agent nào cũng cần — mỗi luồng việc một phiên (bài C1), quét TOÀN BỘ bảng việc thường xuyên chứ không chỉ theo luồng mình vừa mở, và không để một luồng nào "chờ duyệt" quá lâu chỉ vì nó không nằm trên màn hình bạn đang nhìn.',
    workedExample: {
      code: `/new du-an-A
giao "viet tai lieu API cho du an A"
/new du-an-B
giao "sua bug hien thi tren du an B"
trangthai`,
      stdinLines: [],
    },
    predict: {
      code: `/new luong-1
giao "viec 1"
/new luong-2
giao "viec 2"
trangthai`,
      question:
        'Lệnh trangthai được gọi ở phiên luong-2 — nó cho thấy việc của CẢ hai luồng hay chỉ luồng hiện tại?',
      choices: [
        'Ca hai — bang viec la chung, khong theo tung phien',
        'Chi luong-2, vi dang dung o phien do',
        'Chi luong-1, vi tao truoc',
        'Bao loi vi khong cung phien',
      ],
      answerIndex: 0,
      explain:
        'Bảng việc là CHUNG cho toàn bộ, không tách theo phiên/luồng — đây chính là điểm Herdr giải quyết: một chỗ nhìn thấy hết, dù việc được giao từ luồng nào.',
    },
    parsons: {
      prompt:
        'Xếp luồng điều phối hai dự án song song: mở luồng A, giao việc → mở luồng B, giao việc → quét TOÀN BỘ bảng.',
      lines: [
        '/new du-an-A',
        'giao "viet tai lieu API cho du an A"',
        '/new du-an-B',
        'giao "sua bug hien thi tren du an B"',
        'trangthai',
      ],
    },
    make: {
      prompt:
        'Bạn điều phối hai dự án cùng lúc, mỗi dự án một phiên riêng:\n\n1. Mở phiên du-an-A, giao việc: viet test cho module thanh toan\n2. Mở phiên du-an-B, giao việc: cap nhat giao dien trang chu\n3. Quét TOÀN BỘ bảng việc — phải thấy cả hai việc, dù đang đứng ở phiên nào.',
      starterCode: `# 1. phien du an A + giao viec\n\n# 2. phien du an B + giao viec\n\n# 3. quet toan bang\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'v1 [cho-duyet] viet test cho module thanh toan',
          match: 'contains',
          hidden: false,
          label: 'Việc dự án A hiện trên bảng chung',
        },
        {
          stdinLines: [],
          expected: 'v2 [cho-duyet] cap nhat giao dien trang chu',
          match: 'contains',
          hidden: false,
          label: 'Việc dự án B cũng hiện trên cùng bảng, dù khác luồng',
        },
      ],
      hints: [
        'Mở phiên bằng /new <tên>, giao việc bằng giao "…".',
        'Hai cặp mở-phiên/giao-việc, rồi trangthai ở cuối.',
        '/new du-an-A → giao "…" → /new du-an-B → giao "…" → trangthai.',
      ],
      sampleSolution: `/new du-an-A
giao "viet test cho module thanh toan"
/new du-an-B
giao "cap nhat giao dien trang chu"
trangthai`,
    },
    homework:
      'Nếu hiện bạn đang điều phối từ hai việc/dự án độc lập trở lên: viết ra một dòng trạng thái cho MỖI luồng (đang chờ ai, kẹt ở đâu) — đây chính là thứ một bảng Herdr thật hiển thị tự động. Nếu bạn thấy khó nhớ hết khi viết tay, đó là dấu hiệu nên dùng công cụ điều khiển multi-agent thật.',
    srsCards: [
      {
        hoi: 'Herdr giải quyết vấn đề gì khi điều phối nhiều luồng agent?',
        dap: 'Một màn hình xem nhiều "con" agent đang chạy gì, tới đâu — thay vì nhảy qua lại nhiều cửa sổ riêng lẻ, dễ quên việc vừa xong ở luồng khác.',
      },
      {
        hoi: 'Khi nào Herdr thừa, khi nào cần?',
        dap: 'Một agent xử lý việc hằng ngày thì thừa. Cần khi thật sự điều phối NHIỀU luồng việc độc lập song song — đúng vai người điều phối dev quản nhiều dự án.',
      },
    ],
  },
  {
    id: 'hermes-u4-l3',
    unitId: 'hermes-u4',
    language: 'hermes',
    title: 'Firecrawl — tìm kiếm và trích xuất thông tin từ web',
    hook: 'Nghiên cứu thị trường theo cách cũ là mở hai chục tab, copy-paste vào Word, rồi quên nguồn ở đâu. Firecrawl là công cụ cho agent TỰ ĐỘNG đọc và trích xuất nội dung từ nhiều trang web, có nguồn kèm theo.',
    theory:
      'Firecrawl là công cụ trích xuất web: đưa cho agent địa chỉ trang (hoặc từ khoá tìm kiếm), nó lấy về nội dung sạch (bỏ quảng cáo, menu, rác HTML) để agent đọc và tổng hợp.\n\nHai việc văn phòng dùng ngay được:\n- Nghiên cứu thị trường/đối thủ: giao "tìm 5 nguồn nói về xu hướng ngành X quý này, tóm tắt kèm link nguồn" — kết quả có TRÍCH DẪN, không phải agent bịa từ trí nhớ.\n- Theo dõi tin tức ngành: ghép với /goal (C2) thành việc bền bỉ "mỗi sáng quét tin mới".\n\nLuật bắt buộc khi giao việc trích xuất web: PHẢI ĐÒI NGUỒN. Một bản tổng hợp không kèm link là không kiểm chứng được — không phân biệt được agent lấy thật hay bịa. Đây là phiên bản áp dụng luật "số liệu phải kèm nguồn" đã có trong CLAUDE.md của chính dự án — không phải luật riêng của bài học, mà luật sống của việc dùng AI an toàn.',
    workedExample: {
      code: `giao "dung Firecrawl tim 3 bai viet ve xu huong ban le online 2026, tom tat kem link nguon"
duyet v1`,
      stdinLines: [],
    },
    predict: {
      code: `giao "tong hop xu huong nganh, khong can ghi nguon cho nhanh"
trangthai`,
      question: 'Yêu cầu bỏ qua nguồn "cho nhanh" — rủi ro lớn nhất là gì?',
      choices: [
        'Khong kiem chung duoc thong tin la that hay bi bia',
        'Ban tom tat se dai hon',
        'Agent se cham hon vi phai tim nguon',
        'Khong co rui ro, bo nguon van chinh xac',
      ],
      answerIndex: 0,
      explain:
        'Không có nguồn thì không cách nào kiểm chứng thông tin có thật hay agent tổng hợp sai/bịa — luật "số liệu phải kèm nguồn" tồn tại chính để chặn rủi ro này.',
    },
    parsons: {
      prompt:
        'Xếp một lượt nghiên cứu thị trường đúng luật: giao việc trích xuất kèm yêu cầu nguồn → xem trạng thái → nghiệm thu.',
      lines: [
        'giao "dung Firecrawl tim 3 bai viet ve xu huong ban le online 2026, tom tat kem link nguon"',
        'trangthai',
        'duyet v1',
      ],
    },
    make: {
      prompt:
        'Sếp cần báo cáo nhanh về đối thủ cạnh tranh, phải có nguồn kiểm chứng được:\n\n1. Giao việc: dung Firecrawl tim 3 nguon noi ve chien luoc gia cua doi thu, tom tat kem link nguon\n2. Xem bảng việc.\n3. Đọc thấy có đủ link nguồn — duyệt.',
      starterCode: `# 1. giao viec doi hoi nguon\n\n# 2. xem bang viec\n\n# 3. nghiem thu\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'kem link nguon',
          match: 'contains',
          hidden: false,
          label: 'Yêu cầu việc có đòi nguồn kiểm chứng',
        },
        {
          stdinLines: [],
          expected: 'Da duyet v1',
          match: 'contains',
          hidden: false,
          label: 'Đã nghiệm thu sau khi kiểm nguồn',
        },
      ],
      hints: [
        'Ba lệnh: giao "…" → trangthai → duyet v1.',
        'Nội dung việc PHẢI có cụm "kem link nguon" — đúng luật của bài học.',
        'giao "dung Firecrawl tim 3 nguon noi ve chien luoc gia cua doi thu, tom tat kem link nguon"',
      ],
      sampleSolution: `giao "dung Firecrawl tim 3 nguon noi ve chien luoc gia cua doi thu, tom tat kem link nguon"
trangthai
duyet v1`,
    },
    homework:
      'Làm thật (không chấm): đọc firecrawl.dev, mục Search/Extract API. Chọn một chủ đề nghiên cứu thị trường thật của phòng bạn, viết yêu cầu trích xuất đúng luật "kèm nguồn" theo khuôn bài này — sẵn sàng dùng khi có Firecrawl thật.',
    srsCards: [
      {
        hoi: 'Firecrawl giúp agent làm được việc gì mà đọc bằng mắt không làm nhanh bằng?',
        dap: 'Tự động lấy nội dung sạch từ nhiều trang web (bỏ rác HTML), để agent đọc và tổng hợp — thay vì mở hai chục tab copy-paste tay.',
      },
      {
        hoi: 'Luật bắt buộc khi giao việc trích xuất/tổng hợp thông tin web là gì, vì sao?',
        dap: 'Phải đòi kèm link nguồn — không có nguồn thì không kiểm chứng được thông tin thật hay agent bịa.',
      },
    ],
  },
  {
    id: 'hermes-u4-l4',
    unitId: 'hermes-u4',
    language: 'hermes',
    title: 'Honcho — bộ nhớ dài hạn để agent nhớ ngữ cảnh phòng ban',
    hook: 'Agent xử lý việc rất tốt trong MỘT phiên, nhưng phiên sau lại phải nhắc lại từ đầu "phòng mình dùng khuôn báo cáo kiểu này, khách hàng X hay yêu cầu vậy". Honcho là bộ nhớ SỐNG QUA nhiều phiên — dặn một lần, nhớ mãi.',
    theory:
      'Honcho là nhà cung cấp bộ nhớ dài hạn cho agent: mô hình hoá NGƯỜI DÙNG/NGỮ CẢNH qua thời gian, không chỉ trong một cuộc trò chuyện. Khác gì với session (C1) và skill (C2)?\n\n- Session: ngữ cảnh trong MỘT mạch việc, mất khi đổi việc khác.\n- Skill: QUY TRÌNH làm một loại việc, không đổi theo ai giao.\n- Honcho (bộ nhớ dài hạn): NGỮ CẢNH VỀ CON NGƯỜI/PHÒNG BAN tích luỹ qua thời gian — "khách hàng X luôn muốn giao hàng nhanh", "phòng kế toán chốt sổ vào ngày 25".\n\nBa cái không thay thế nhau, chúng CHỒNG LÊN NHAU: một việc chạy trong một session, dùng một skill, và agent còn nhớ ngữ cảnh dài hạn về người/phòng liên quan tới việc đó.\n\nRủi ro cần nói thẳng: bộ nhớ dài hạn càng nhiều càng dễ LỖI THỜI — ngữ cảnh "khách hàng X luôn muốn giao nhanh" có thể sai nếu khách đã đổi yêu cầu. Người điều phối phải định kỳ RÀ LẠI ngữ cảnh agent đang nhớ, không mặc định nó luôn đúng mãi mãi.',
    workedExample: {
      code: `giao "ghi nho: khach hang Cong ty ABC luon yeu cau xuat hoa don VAT rieng"
duyet v1
giao "soan bao gia cho Cong ty ABC, nho ap dung yeu cau hoa don da ghi nho truoc"`,
      stdinLines: [],
    },
    predict: {
      code: `giao "ghi nho: khach hang XYZ chi lam viec qua email, khong goi dien"
duyet v1
/new phien-moi
giao "lien he khach hang XYZ ve don hang moi"`,
      question:
        'Ở phiên MỚI (khác hẳn phiên đã ghi nhớ), agent còn "nhớ" ngữ cảnh về khách XYZ không?',
      choices: [
        'Co — do la diem khac session: bo nho dai han song QUA nhieu phien',
        'Khong, vi phien moi la ngu canh trang moi hoan toan',
        'Chi nho neu dung lai dung ten phien cu',
        'Chi nho neu chua qua 24 gio',
      ],
      answerIndex: 0,
      explain:
        'Đây chính là điểm khác biệt cốt lõi của bộ nhớ dài hạn so với session: session mất khi đổi phiên, còn ngữ cảnh về người/khách hàng đã "ghi nhớ" qua Honcho thì sống QUA nhiều phiên, nhiều việc khác nhau.',
    },
    parsons: {
      prompt:
        'Xếp việc dùng bộ nhớ dài hạn: ghi nhớ ngữ cảnh về khách → nghiệm thu → giao việc sau tự động áp dụng ngữ cảnh đã nhớ.',
      lines: [
        'giao "ghi nho: khach hang Cong ty ABC luon yeu cau xuat hoa don VAT rieng"',
        'duyet v1',
        'giao "soan bao gia cho Cong ty ABC, nho ap dung yeu cau hoa don da ghi nho truoc"',
      ],
    },
    make: {
      prompt:
        'Phòng kế toán muốn agent luôn nhớ một quy định nội bộ:\n\n1. Giao việc ghi nhớ: ghi nho: phong ke toan chot so vao ngay 25 hang thang\n2. Nghiệm thu ghi nhớ đó.\n3. Giao việc khác có dùng lại ngữ cảnh: len lich nhac chuan bi ho so chot so, nho ap dung ngay da ghi nho',
      starterCode: `# 1. giao viec ghi nho ngu canh\n\n# 2. nghiem thu\n\n# 3. giao viec dung lai ngu canh da nho\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'ghi nho: phong ke toan chot so vao ngay 25 hang thang',
          match: 'contains',
          hidden: false,
          label: 'Ngữ cảnh dài hạn đã được giao ghi nhớ',
        },
        {
          stdinLines: [],
          expected: 'Da duyet v1',
          match: 'contains',
          hidden: false,
          label: 'Ngữ cảnh đã nghiệm thu trước khi tin dùng',
        },
        {
          stdinLines: [],
          expected: 'nho ap dung ngay da ghi nho',
          match: 'contains',
          hidden: false,
          label: 'Việc sau có nhắc dùng lại ngữ cảnh đã ghi nhớ',
        },
      ],
      hints: [
        'Ba lệnh: giao "ghi nho: …" → duyet v1 → giao "… nho ap dung …".',
        'Nội dung việc ghi nhớ phải bắt đầu bằng "ghi nho:" theo đúng đề.',
        'giao "ghi nho: phong ke toan chot so vao ngay 25 hang thang" → duyet v1 → giao "len lich nhac chuan bi ho so chot so, nho ap dung ngay da ghi nho"',
      ],
      sampleSolution: `giao "ghi nho: phong ke toan chot so vao ngay 25 hang thang"
duyet v1
giao "len lich nhac chuan bi ho so chot so, nho ap dung ngay da ghi nho"`,
    },
    homework:
      'Liệt kê 3 ngữ cảnh dài hạn phòng bạn muốn agent luôn nhớ (quy định nội bộ, đặc điểm khách hàng quen, hạn chót định kỳ). Với mỗi ngữ cảnh, viết thêm: bao lâu thì cần RÀ LẠI xem nó còn đúng không — bộ nhớ dài hạn không phải sự thật vĩnh viễn.',
    srsCards: [
      {
        hoi: 'Bộ nhớ dài hạn (Honcho) khác session và skill ở điểm nào?',
        dap: 'Session là ngữ cảnh trong một mạch việc, mất khi đổi việc. Skill là quy trình làm việc. Bộ nhớ dài hạn là ngữ cảnh VỀ NGƯỜI/PHÒNG BAN, sống qua nhiều phiên khác nhau.',
      },
      {
        hoi: 'Rủi ro chính của bộ nhớ dài hạn, và cách phòng tránh?',
        dap: 'Ngữ cảnh dễ lỗi thời (khách đổi yêu cầu, quy định đổi) — người điều phối phải định kỳ rà lại, không mặc định nó luôn đúng mãi.',
      },
    ],
  },
  {
    id: 'hermes-u4-l5',
    unitId: 'hermes-u4',
    language: 'hermes',
    title: 'Paperclip — "công ty 0 người": sơ đồ tổ chức agent, ngân sách, nghiệm thu',
    hook: 'Một agent làm một việc thì bạn quản bằng mắt. Năm agent chia nhau năm mảng việc của cả một dự án — không có sơ đồ ai làm gì và giới hạn tiêu bao nhiêu, bạn đang điều hành một đội vô kỷ luật.',
    theory:
      'Paperclip là công cụ điều phối NHIỀU agent kiểu "công ty 0 người": sơ đồ tổ chức (agent nào phụ trách mảng nào), giới hạn ngân sách, và chấm việc theo ĐƠN VỊ NGUYÊN TỬ (mỗi việc nhỏ, độc lập, nghiệm thu riêng — không phải một khối việc mơ hồ).\n\nĐây là điểm HỘI TỤ của cả khoá — mọi kỷ luật đã học ghép lại thành một mô hình điều phối hoàn chỉnh:\n- Profile (C1) → mỗi "phòng ban ảo" một profile.\n- Skill (C2) → mỗi vai trò có quy trình chuẩn riêng.\n- Kanban (C4-l1) → bảng việc chung theo dõi tất cả.\n- Việc NGUYÊN TỬ + nghiệm thu bằng NGƯỜI (xuyên suốt khoá) → đơn vị nhỏ nhất, không nhận "chắc là xong".\n\nGiới hạn ngân sách (`/permission`, model rẻ/đắt ở C1–C2) là lưới an toàn bắt buộc khi số lượng agent tăng: càng nhiều "nhân viên ảo" càng dễ tiêu tiền không kiểm soát nếu không đặt trần từ đầu. "Công ty 0 người" không có nghĩa là 0 người GIÁM SÁT — người điều phối vẫn là người duy nhất chịu trách nhiệm nghiệm thu.',
    workedExample: {
      code: `hermes profile create phong-noi-dung
giao "viet 3 bai dang mang xa hoi ve san pham moi"
hermes profile create phong-cham-soc-khach-hang
giao "soan mau tra loi cho 5 cau hoi thuong gap"
trangthai`,
      stdinLines: [],
    },
    predict: {
      code: `hermes profile create phong-A
giao "viec lon: lam toan bo ke hoach marketing quy 4"
trangthai`,
      question: 'Theo nguyên tắc việc NGUYÊN TỬ của Paperclip, việc này có vấn đề gì?',
      choices: [
        'Qua lon va mo ho — nen chia thanh nhieu viec nho, doc lap, nghiem thu rieng tung viec',
        'Khong van de gi, viec lon giao thang cho nhanh',
        'Phai doi ten thanh "ke hoach" moi giao duoc',
        'Chi co the giao viec nho hon 5 tu',
      ],
      answerIndex: 0,
      explain:
        '"Toàn bộ kế hoạch marketing quý 4" là một khối lớn, khó biết khi nào thật sự XONG và khó nghiệm thu từng phần. Đúng nguyên tắc: chia nhỏ thành các việc nguyên tử (viết bài, làm ảnh, lên lịch đăng…), mỗi việc nghiệm thu riêng.',
    },
    parsons: {
      prompt:
        'Xếp mô hình "công ty 0 người" thu nhỏ: dựng phòng ban ảo (profile) → giao việc nguyên tử cho phòng này → dựng phòng ban khác → giao việc nguyên tử → quét bảng chung.',
      lines: [
        'hermes profile create phong-noi-dung',
        'giao "viet 3 bai dang mang xa hoi ve san pham moi"',
        'hermes profile create phong-cham-soc-khach-hang',
        'giao "soan mau tra loi cho 5 cau hoi thuong gap"',
        'trangthai',
      ],
    },
    make: {
      prompt:
        'Bạn dựng một "công ty 0 người" thu nhỏ cho chiến dịch ra mắt sản phẩm, việc chia NGUYÊN TỬ theo từng phòng ban ảo:\n\n1. Dựng phòng ban nội dung: hermes profile create phong-noi-dung, giao viec nguyen tu: viet 1 bai gioi thieu san pham dai 300 tu\n2. Dựng phòng ban thiết kế: hermes profile create phong-thiet-ke, giao viec nguyen tu: thiet ke 1 anh bia cho bai gioi thieu\n3. Quét bảng chung — phải thấy cả hai việc nguyên tử, mỗi việc chờ nghiệm thu riêng.',
      starterCode: `# 1. phong noi dung + viec nguyen tu\n\n# 2. phong thiet ke + viec nguyen tu\n\n# 3. quet bang chung\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da tao profile "phong-noi-dung"',
          match: 'contains',
          hidden: false,
          label: 'Phòng ban ảo nội dung đã dựng',
        },
        {
          stdinLines: [],
          expected: 'v1 [cho-duyet] viet 1 bai gioi thieu san pham dai 300 tu',
          match: 'contains',
          hidden: false,
          label: 'Việc nguyên tử của phòng nội dung đang chờ nghiệm thu riêng',
        },
        {
          stdinLines: [],
          expected: 'v2 [cho-duyet] thiet ke 1 anh bia cho bai gioi thieu',
          match: 'contains',
          hidden: false,
          label: 'Việc nguyên tử của phòng thiết kế cũng chờ nghiệm thu riêng',
        },
      ],
      hints: [
        'Tạo profile bằng: hermes profile create <tên>.',
        'Mỗi việc phải NHỎ và CỤ THỂ (một bài, một ảnh) — đúng nguyên tắc nguyên tử, không gộp thành một việc lớn.',
        'hermes profile create phong-noi-dung → giao "viet 1 bai…" → hermes profile create phong-thiet-ke → giao "thiet ke 1 anh…" → trangthai.',
      ],
      sampleSolution: `hermes profile create phong-noi-dung
giao "viet 1 bai gioi thieu san pham dai 300 tu"
hermes profile create phong-thiet-ke
giao "thiet ke 1 anh bia cho bai gioi thieu"
trangthai`,
    },
    homework:
      'Vẽ sơ đồ tổ chức "công ty 0 người" cho một dự án thật của bạn: các phòng ban ảo (profile), mỗi phòng phụ trách mảng gì, và liệt kê 5 việc NGUYÊN TỬ đầu tiên (không việc nào lớn hơn "làm trong một buổi"). Đây là bài tổng kết — nếu vẽ được sơ đồ này, bạn đã nắm trọn tinh thần điều phối của cả khoá.',
    srsCards: [
      {
        hoi: 'Paperclip là gì, và nó hội tụ những kỷ luật nào đã học trong khoá?',
        dap: 'Công cụ điều phối "công ty 0 người": sơ đồ tổ chức + ngân sách + việc nguyên tử. Hội tụ profile (C1), skill (C2), Kanban (C4), và nghiệm thu bằng người (xuyên suốt khoá).',
      },
      {
        hoi: 'Vì sao việc giao cho agent nên chia NGUYÊN TỬ thay vì giao một khối lớn?',
        dap: 'Việc lớn khó biết khi nào thật sự xong và khó nghiệm thu từng phần; việc nguyên tử — nhỏ, độc lập — nghiệm thu riêng từng cái, không nhận "chắc là xong".',
      },
      {
        hoi: '"Công ty 0 người" có nghĩa là 0 người giám sát không?',
        dap: 'Không — người điều phối vẫn là người duy nhất chịu trách nhiệm nghiệm thu; "0 người" chỉ nói tới việc thực thi do agent làm, không phải bỏ giám sát.',
      },
    ],
  },
]

// lessons/hermesu3.ts — Chương C3 "Tech stack ứng dụng" của khoá Hermes (PR 3/3 —
// docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md §② bảng chương).
//
// Năm bài bám đúng 5 mục phần III của đề cương tham chiếu: Memos · Linear · Bookmark ·
// Understand-anything · Design & Frontend skill. Mô phỏng ở mức LUỒNG VIỆC qua bộ lệnh
// giao/trangthai/duyet/tuchoi của hermesSim (đặc tả §② — không dựng lại UI/API thật của
// từng sản phẩm ngoài); phần cài đặt/khám phá công cụ thật để ở homework.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const HERMES_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'hermes-u3-l1',
    unitId: 'hermes-u3',
    language: 'hermes',
    title: 'Memos — ghi chú và sắp xếp thông tin phòng ban',
    hook: 'Biên bản họp nằm rải rác trong Word, Zalo, email — hỏi lại "tuần trước quyết cái gì" là cả phòng lục tung lịch sử chat. Memos là kho ghi chú tự host mà agent viết trực tiếp vào, tìm lại bằng một câu hỏi.',
    theory:
      'Memos là ứng dụng ghi chú mã nguồn mở, tự host — mỗi ghi chú là một "memo" ngắn, gắn thẻ, tìm lại nhanh. Ghép với Hermes: thay vì bạn gõ tay biên bản họp vào Memos, GIAO cho agent làm — nó tổng hợp từ ghi âm/ghi chú thô rồi lưu vào kho chung.\n\nQuy trình văn phòng chuẩn: mỗi cuộc họp là MỘT việc giao cho agent, kết quả là một memo có cấu trúc cố định (mục tiêu họp, quyết định, việc cần làm, người phụ trách) — không phải văn xuôi tự do. Cấu trúc cố định là thứ giúp tra cứu sau này nhanh, và là thứ bạn NGHIỆM THU trước khi memo đó thành "sự thật chính thức" của phòng.\n\nGóc quan trọng: kho Memos càng lớn càng có giá trị, nhưng chỉ khi memo nào cũng đã qua duyệt. Một biên bản họp sai lọt vào kho là thông tin sai lan ra cả phòng — đây là lý do nghiệm thu bằng NGƯỜI (bài "luật sư phạm 1" ở C1) áp dụng thẳng vào đây.',
    workedExample: {
      code: `giao "ghi bien ban hop giao ban sang thu hai vao Memos"
trangthai
duyet v1`,
      stdinLines: [],
    },
    predict: {
      code: `giao "ghi bien ban hop len Memos"
trangthai`,
      question: 'Việc vừa giao đang ở trạng thái nào trên bảng việc, TRƯỚC khi bạn duyệt?',
      choices: ['cho-duyet', 'xong', 'tu-choi', 'dang-lam'],
      answerIndex: 0,
      explain:
        'Mọi việc giao xong bản nháp đều dừng ở cho-duyet — biên bản họp là "sự thật chính thức" của phòng, không được tự động thành xong mà chưa ai đọc lại.',
    },
    parsons: {
      prompt:
        'Xếp quy trình ghi biên bản họp vào kho chung: giao việc → xem trạng thái → nghiệm thu để memo chính thức vào kho.',
      lines: ['giao "ghi bien ban hop giao ban vao Memos"', 'trangthai', 'duyet v1'],
    },
    make: {
      prompt:
        'Vừa họp xong với khách hàng, cần lưu lại có cấu trúc:\n\n1. Giao việc: ghi bien ban hop khach hang X vao Memos, gom quyet dinh va viec can lam\n2. Xem bảng việc để chắc đã nhận việc.\n3. Đọc xong bản nháp, ổn — nghiệm thu.',
      starterCode: `# 1. giao viec ghi bien ban\n\n# 2. xem bang viec\n\n# 3. nghiem thu\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da nhan viec v1',
          match: 'contains',
          hidden: false,
          label: 'Việc ghi biên bản đã được nhận',
        },
        {
          stdinLines: [],
          expected: 'v1 [cho-duyet]',
          match: 'contains',
          hidden: false,
          label: 'Bảng việc cho thấy đang chờ duyệt trước khi vào kho',
        },
        {
          stdinLines: [],
          expected: 'Da duyet v1',
          match: 'contains',
          hidden: false,
          label: 'Đã nghiệm thu — memo chính thức vào kho chung',
        },
      ],
      hints: [
        'Ba lệnh quen thuộc: giao "…" → trangthai → duyet v1.',
        'Nội dung việc đặt trong cặp nháy kép.',
        'giao "ghi bien ban hop khach hang X vao Memos, gom quyet dinh va viec can lam"',
      ],
      sampleSolution: `giao "ghi bien ban hop khach hang X vao Memos, gom quyet dinh va viec can lam"
trangthai
duyet v1`,
    },
    homework:
      'Làm thật (không chấm): dựng Memos qua Docker theo usememos.com, tạo thử một ghi chú và gắn thẻ. Rồi lấy MỘT biên bản họp cũ của phòng bạn (Word/email/chat), viết lại theo cấu trúc cố định "mục tiêu · quyết định · việc cần làm · người phụ trách" — đây chính là khuôn bạn sẽ giao cho agent làm về sau.',
    srsCards: [
      {
        hoi: 'Vì sao biên bản họp giao cho agent nên có cấu trúc cố định thay vì văn xuôi tự do?',
        dap: 'Cấu trúc cố định (mục tiêu · quyết định · việc cần làm · người phụ trách) giúp tra cứu nhanh sau này và dễ nghiệm thu trước khi thành "sự thật chính thức" của phòng.',
      },
      {
        hoi: 'Vì sao memo do agent viết phải qua duyệt trước khi coi là chính thức?',
        dap: 'Một biên bản sai lọt vào kho chung là thông tin sai lan ra cả phòng — nghiệm thu bằng NGƯỜI chặn đúng rủi ro này.',
      },
    ],
  },
  {
    id: 'hermes-u3-l2',
    unitId: 'hermes-u3',
    language: 'hermes',
    title: 'Linear — người và agent làm việc cùng nhau',
    hook: 'Giao việc cho một dev thực tập và giao việc cho agent thật ra cùng một kỷ luật: mô tả rõ, có người nghiệm thu, có nơi theo dõi. Linear là nơi cả hai — người và agent — cùng đứng trên MỘT bảng việc.',
    theory:
      'Linear là công cụ quản lý việc phổ biến trong đội kỹ thuật (issue, project, cycle). Điểm khác với bảng việc excel truyền thống: agent có thể là một THÀNH VIÊN nhận việc trực tiếp trên đó, y như một dev trong team.\n\nKhi điều phối dev qua Hermes, luồng khớp thẳng với Linear:\n    giao "<mô tả việc>"   ↔  tạo issue, gán cho agent\n    trangthai              ↔  xem cột Kanban (Todo/In Progress/In Review)\n    duyet <id>              ↔  review xong, đóng issue\n    tuchoi <id> "<lý do>"   ↔  trả về "Changes requested" kèm nhận xét\n\nBài học quan trọng nhất của bài này: giao việc cho agent qua Linear PHẢI rõ ràng như giao cho một dev con người — mục tiêu, phạm vi, tiêu chí xong. Mô tả issue mập mờ ("sửa cho đẹp hơn") thì cả dev lẫn agent đều đoán mò như nhau.\n\nMột đội thật thường có NHIỀU việc chạy song song — vài việc của người, vài việc của agent, cùng hiện trên một bảng. Người điều phối nhìn MỘT bảng duy nhất là đủ, không phải hai hệ thống tách rời.',
    workedExample: {
      code: `giao "them nut Xoa tai khoan vao trang Cai dat, co hop thoai xac nhan"
trangthai
duyet v1`,
      stdinLines: [],
    },
    predict: {
      code: `giao "sua cho dep hon"
trangthai
tuchoi v1 "mo ta khong ro pham vi can sua"`,
      question: 'Việc bị từ chối vì mô tả mập mờ — bài học rút ra áp dụng cho ai?',
      choices: [
        'Ca dev con nguoi lan agent — mo ta ro la ky luat chung, khong rieng AI',
        'Chi ap dung cho agent, dev con nguoi tu hieu y',
        'Chi ap dung khi giao qua Linear, khong ap dung khi noi truc tiep',
        'Khong ap dung duoc gi, do la loi cua nguoi lam',
      ],
      answerIndex: 0,
      explain:
        'Mô tả mập mờ hại cả hai bên nhận việc như nhau — Linear chỉ là nơi hiện luồng việc, kỷ luật giao việc rõ ràng là chung cho mọi thành viên team, người hay agent.',
    },
    parsons: {
      prompt: 'Xếp một vòng review chuẩn: giao issue có phạm vi rõ → xem bảng → review và duyệt.',
      lines: [
        'giao "them nut Xoa tai khoan vao trang Cai dat, co hop thoai xac nhan"',
        'trangthai',
        'duyet v1',
      ],
    },
    make: {
      prompt:
        'Đội bạn dùng chung một bảng việc cho người và agent. Tạo và xử lý một issue rõ ràng:\n\n1. Giao việc rõ phạm vi: sua loi form dang ky khong hien thong bao khi email da ton tai\n2. Xem bảng việc — issue phải đang chờ review.\n3. Đọc thấy đạt — duyệt, đóng issue.',
      starterCode: `# 1. tao issue ro pham vi\n\n# 2. xem bang viec\n\n# 3. review va duyet\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'v1 [cho-duyet] sua loi form dang ky khong hien thong bao khi email da ton tai',
          match: 'contains',
          hidden: false,
          label: 'Issue rõ phạm vi đang chờ review',
        },
        {
          stdinLines: [],
          expected: 'Nghiem thu la viec cua NGUOI',
          match: 'contains',
          hidden: false,
          label: 'Đã duyệt — người chốt, không phải agent tự chốt',
        },
      ],
      hints: [
        'Ba lệnh quen thuộc: giao "…" → trangthai → duyet v1.',
        'Mô tả việc phải RÕ PHẠM VI — đúng câu trong đề bài, không rút gọn thành "sửa lỗi form".',
        'giao "sua loi form dang ky khong hien thong bao khi email da ton tai"',
      ],
      sampleSolution: `giao "sua loi form dang ky khong hien thong bao khi email da ton tai"
trangthai
duyet v1`,
    },
    homework:
      'Làm thật (không chấm): tạo workspace Linear miễn phí, viết một issue thật cho một việc bạn đang định làm. Tự chấm mô tả của mình bằng 3 câu hỏi: mục tiêu có rõ không? phạm vi "không làm" có ghi không? tiêu chí xong có đo được không? Sửa lại issue nếu thiếu — đây chính là kỷ luật sẽ dùng khi giao cho agent thật.',
    srsCards: [
      {
        hoi: 'Vì sao Linear phù hợp làm nơi người và agent cùng nhận việc?',
        dap: 'Agent nhận issue trực tiếp như một thành viên team — luồng giao/theo dõi/nghiệm thu hiện chung trên một bảng, người điều phối không cần hai hệ thống tách rời.',
      },
      {
        hoi: 'Bài học chính khi giao việc qua Linear cho agent?',
        dap: 'Mô tả issue phải rõ như giao cho dev con người: mục tiêu, phạm vi, tiêu chí xong — mập mờ thì cả người lẫn agent đều đoán mò như nhau.',
      },
    ],
  },
  {
    id: 'hermes-u3-l3',
    unitId: 'hermes-u3',
    language: 'hermes',
    title: 'Bookmark mọi thứ bằng Hermes Agent',
    hook: 'Bạn lưu một bài viết hay vào "Đọc sau" — sáu tháng sau không nhớ vì sao đã lưu nó. Giao cho agent bookmark thay bạn, nó không chỉ CẤT mà còn TÓM TẮT và GẮN THẺ ngay lúc lưu — tương lai bạn cảm ơn hiện tại bạn.',
    theory:
      'Bookmark tưởng đơn giản (chỉ là lưu link) nhưng cái LÀM NÊN GIÁ TRỊ là xử lý lúc lưu: agent đọc nội dung, tóm tắt hai dòng, gắn thẻ theo chủ đề phòng ban — biến một đường link chết thành một mục tra cứu sống.\n\nSo với ghi chú cuộc họp (bài Memos): bookmark là kho TƯ LIỆU BÊN NGOÀI (bài báo, tài liệu đối thủ, quy định pháp luật mới) — khác kho QUYẾT ĐỊNH NỘI BỘ của Memos. Hai kho phục vụ hai mục đích khác nhau, đừng trộn chung.\n\nQuy trình: giao việc bookmark kèm NGỮ CẢNH (vì sao lưu cái này, liên quan dự án nào) — agent tóm tắt và gắn thẻ theo đúng ngữ cảnh đó. Việc lặp nhiều lần theo cùng một khuôn ("lưu tin ngành, tóm tắt, gắn thẻ theo mảng") chính là ứng viên tốt để đúc thành skill (bài /learn ở C2) — một việc nhỏ nhưng lặp hằng ngày là nơi tự động hoá đáng giá nhất.',
    workedExample: {
      code: `giao "bookmark bai bao ve quy dinh thue moi, tom tat 2 dong, gan the phap-ly"
trangthai
duyet v1`,
      stdinLines: [],
    },
    predict: {
      code: `giao "bookmark bai viet ve doi thu canh tranh, gan the nghien-cuu-thi-truong"
duyet v1
/learn bookmark-doi-thu`,
      question: 'Việc bookmark lặp lại hằng tuần — dòng lệnh cuối làm gì?',
      choices: [
        'Dong goi ca quy trinh (doc, tom tat, gan the) thanh ky nang dung lai',
        'Chi luu rieng bookmark nay vao muc yeu thich',
        'Xoa bookmark vua tao',
        'Bao loi vi chua co du lieu de hoc',
      ],
      answerIndex: 0,
      explain:
        '/learn không liên quan gì tới lưu-trữ — nó đóng gói CÁCH LÀM vừa rồi (đọc → tóm tắt → gắn thẻ) thành kỹ năng, để lần bookmark sau agent tự làm đúng quy trình mà không cần dặn lại.',
    },
    parsons: {
      prompt:
        'Xếp một lượt bookmark có ngữ cảnh: giao kèm lý do lưu → xem trạng thái → duyệt để chốt vào kho.',
      lines: [
        'giao "bookmark bai bao ve quy dinh thue moi, tom tat 2 dong, gan the phap-ly"',
        'trangthai',
        'duyet v1',
      ],
    },
    make: {
      prompt:
        'Bạn vừa đọc lướt một bài phân tích thị trường đáng lưu lại cho cả phòng:\n\n1. Giao việc bookmark kèm ngữ cảnh: bookmark bai phan tich thi truong quy 3, tom tat 2 dong, gan the thi-truong\n2. Xem bảng việc.\n3. Đọc bản tóm tắt, đạt — duyệt.',
      starterCode: `# 1. giao viec bookmark co ngu canh\n\n# 2. xem bang viec\n\n# 3. duyet\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'bookmark bai phan tich thi truong quy 3, tom tat 2 dong, gan the thi-truong',
          match: 'contains',
          hidden: false,
          label: 'Việc bookmark có kèm ngữ cảnh tóm tắt + gắn thẻ',
        },
        {
          stdinLines: [],
          expected: 'Da duyet v1',
          match: 'contains',
          hidden: false,
          label: 'Đã nghiệm thu bookmark vào kho tư liệu',
        },
      ],
      hints: [
        'Ba lệnh: giao "…" → trangthai → duyet v1.',
        'Nội dung việc phải NÊU RÕ tóm tắt bao nhiêu dòng và gắn thẻ gì — bookmark không có ngữ cảnh là link chết.',
        'giao "bookmark bai phan tich thi truong quy 3, tom tat 2 dong, gan the thi-truong"',
      ],
      sampleSolution: `giao "bookmark bai phan tich thi truong quy 3, tom tat 2 dong, gan the thi-truong"
trangthai
duyet v1`,
    },
    homework:
      'Trong một tuần, mỗi lần định bấm "lưu để đọc sau" ở đâu đó, hãy viết ra thay vào: (1) vì sao lưu, (2) nên gắn thẻ gì. Cuối tuần đếm xem có bao nhiêu lần lặp CÙNG một khuôn ngữ cảnh — đó chính là ứng viên để đúc thành skill /learn.',
    srsCards: [
      {
        hoi: 'Cái gì làm bookmark bằng agent khác lưu link đơn thuần?',
        dap: 'Agent đọc nội dung ngay lúc lưu: tóm tắt + gắn thẻ theo ngữ cảnh — biến một đường link chết thành mục tra cứu sống.',
      },
      {
        hoi: 'Kho bookmark khác kho Memos ở chỗ nào?',
        dap: 'Bookmark là tư liệu BÊN NGOÀI (bài báo, tài liệu đối thủ); Memos là quyết định NỘI BỘ (biên bản họp). Hai mục đích khác nhau, không trộn chung.',
      },
    ],
  },
  {
    id: 'hermes-u3-l4',
    unitId: 'hermes-u3',
    language: 'hermes',
    title: 'Understand-anything — hiểu tài liệu/codebase trước khi giao việc',
    hook: 'Giao việc "sửa module thanh toán" cho agent chưa từng đọc codebase cũng như giao việc "sửa hợp đồng" cho người chưa đọc hợp đồng — cả hai đều đoán mò. Understand-anything là bước ĐỌC HIỂU bắt buộc trước khi giao việc thật.',
    theory:
      'Trước khi giao một việc phức tạp (sửa module code, rà một bộ hợp đồng), giao một việc NHỎ HƠN trước: yêu cầu agent ĐỌC và TÓM TẮT cấu trúc/nội dung. Chỉ khi bản tóm tắt đó đúng, bạn mới tin việc chính sẽ làm đúng chỗ.\n\nÁp dụng cho hai đối tượng khoá này:\n- Nhân viên văn phòng: giao đọc một bộ hợp đồng dài, tóm tắt điều khoản rủi ro trước khi ký.\n- Người điều phối dev: giao đọc một codebase lạ, tóm tắt module nào làm gì trước khi giao việc sửa.\n\nQuy trình hai bước, không được gộp làm một: ① giao việc ĐỌC HIỂU, nghiệm thu bản tóm tắt trước → ② mới giao việc HÀNH ĐỘNG (sửa/viết) dựa trên hiểu biết đã xác nhận đúng. Gộp làm một là để agent vừa đọc vừa sửa cùng lúc — sai hiểu ở đâu thì việc sửa sai theo đó, mà không ai phát hiện ra vì không có bước dừng lại kiểm tra.',
    workedExample: {
      code: `giao "doc module thanh toan, tom tat cac ham chinh va luong du lieu"
duyet v1
giao "sua ham tinhPhiGiaoHang de tinh dung khi don hang co giam gia"`,
      stdinLines: [],
    },
    predict: {
      code: `giao "doc va sua luon module xac thuc nguoi dung cho dung chuan"
trangthai`,
      question: 'Việc này gộp "đọc hiểu" và "sửa" làm một bước — rủi ro chính là gì?',
      choices: [
        'Hieu sai codebase thi sua sai theo, ma khong co buoc dung lai de phat hien',
        'Agent se tu choi vi lenh qua dai',
        'Khong co rui ro gi, gop lam mot nhanh hon',
        'He thong tu tach thanh hai viec rieng',
      ],
      answerIndex: 0,
      explain:
        'Không có nghiệm thu bản tóm tắt trước khi hành động, agent hiểu sai module thì sửa sai luôn theo cái hiểu sai đó — không ai kịp phát hiện vì thiếu bước dừng lại kiểm tra.',
    },
    parsons: {
      prompt:
        'Xếp đúng hai bước tách bạch: đọc hiểu trước, nghiệm thu bản tóm tắt, RỒI mới hành động.',
      lines: [
        'giao "doc module thanh toan, tom tat cac ham chinh"',
        'duyet v1',
        'giao "sua ham tinhPhiGiaoHang de tinh dung khi co giam gia"',
      ],
    },
    make: {
      prompt:
        'Bạn cần agent sửa một hàm trong module chưa quen — làm đúng hai bước tách bạch:\n\n1. Giao việc đọc hiểu trước: doc module gio hang, tom tat cac ham chinh va luong du lieu\n2. Đọc bản tóm tắt, đúng — nghiệm thu.\n3. CHỈ SAU KHI nghiệm thu, mới giao việc sửa: sua ham tinhTongGioHang de bo qua san pham het hang',
      starterCode: `# 1. giao viec doc hieu truoc\n\n# 2. nghiem thu ban tom tat\n\n# 3. giao viec hanh dong SAU khi da hieu dung\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da nhan viec v1: doc module gio hang, tom tat cac ham chinh va luong du lieu',
          match: 'contains',
          hidden: false,
          label: 'Bước đọc hiểu được giao trước',
        },
        {
          stdinLines: [],
          expected: 'Da duyet v1',
          match: 'contains',
          hidden: false,
          label: 'Bản tóm tắt đã nghiệm thu trước khi hành động',
        },
        {
          stdinLines: [],
          expected: 'Da nhan viec v2: sua ham tinhTongGioHang de bo qua san pham het hang',
          match: 'contains',
          hidden: false,
          label: 'Việc sửa chỉ giao SAU khi hiểu đã được xác nhận đúng',
        },
      ],
      hints: [
        'Hai việc tách bạch, KHÔNG gộp chung một lệnh giao.',
        'Việc đọc hiểu phải nghiệm thu (duyet v1) trước khi giao việc sửa (sẽ thành v2).',
        'Ba lệnh: giao "doc…" → duyet v1 → giao "sua…".',
      ],
      sampleSolution: `giao "doc module gio hang, tom tat cac ham chinh va luong du lieu"
duyet v1
giao "sua ham tinhTongGioHang de bo qua san pham het hang"`,
    },
    homework:
      'Chọn một tài liệu dài (hợp đồng, quy chế) hoặc một đoạn code lạ bạn chưa từng đọc. Viết yêu cầu "đọc và tóm tắt" cho nó theo đúng khuôn bài này, rồi tự chấm bản tóm tắt tưởng tượng: nếu nó SAI một chi tiết, việc hành động dựa trên đó sẽ hỏng ở đâu?',
    srsCards: [
      {
        hoi: 'Quy trình hai bước "hiểu trước khi hành động" gồm gì, vì sao không được gộp?',
        dap: 'Giao đọc hiểu → nghiệm thu bản tóm tắt → mới giao hành động. Gộp làm một thì hiểu sai sẽ kéo theo sửa sai mà không ai kịp phát hiện.',
      },
      {
        hoi: 'Áp dụng bước "hiểu trước" cho nhân viên văn phòng và điều phối dev khác nhau thế nào?',
        dap: 'Văn phòng: đọc tóm tắt rủi ro hợp đồng trước khi ký. Điều phối dev: đọc tóm tắt codebase lạ trước khi giao việc sửa.',
      },
    ],
  },
  {
    id: 'hermes-u3-l5',
    unitId: 'hermes-u3',
    language: 'hermes',
    title: 'Design & Frontend skill — làm landing page không cần dev',
    hook: 'Phòng marketing cần một trang giới thiệu sản phẩm mới trong chiều nay, nhưng đội dev đang bận việc khác. Với một kỹ năng thiết kế/frontend đã đúc sẵn, agent làm được trang đó — người điều phối chỉ cần nghiệm thu.',
    theory:
      'Đây là ví dụ cụ thể áp dụng lại TOÀN BỘ những gì đã học: /learn (C2) đúc một kỹ năng "làm landing page" một lần từ một dự án mẫu đã ưng ý, rồi từ đó việc tương tự agent làm nhanh theo đúng chuẩn (bố cục, màu sắc thương hiệu, các khối nội dung cố định: hero, tính năng, kêu gọi hành động).\n\nGóc điều phối dev: đây là ranh giới rõ nhất giữa "việc lặp lại, giao được" và "việc cần chuyên môn sâu, phải hỏi người". Landing page theo khuôn có sẵn → giao thẳng cho agent, nghiệm thu bằng mắt. Thiết kế sản phẩm mới hoàn toàn, cần nghiên cứu người dùng → đó là việc CON NGƯỜI, đừng cố giao.\n\nQuy trình một việc landing page: giao rõ NỘI DUNG (tên sản phẩm, tính năng chính, lời kêu gọi) — không rõ nội dung thì thiết kế đẹp mấy cũng vô nghĩa; nghiệm thu bằng cách đọc thử như một khách hàng lạ, không phải như người đã biết sản phẩm.',
    workedExample: {
      code: `giao "lam landing page cho san pham Vi Dien Tu Nhanh, dung skill thiet-ke-chuan, gom hero + 3 tinh nang + nut Dang ky"
duyet v1`,
      stdinLines: [],
    },
    predict: {
      code: `giao "lam landing page dep cho san pham moi"
trangthai`,
      question: 'Yêu cầu này thiếu điều gì khiến việc khó nghiệm thu?',
      choices: [
        'Thieu NOI DUNG cu the: ten san pham, tinh nang, loi keu goi',
        'Thieu mau sac thuong hieu',
        'Thieu ten skill de dung',
        'Khong thieu gi, "dep" la du ro rang',
      ],
      answerIndex: 0,
      explain:
        '"Đẹp" là cảm tính, còn nội dung cụ thể (tên sản phẩm, tính năng, lời kêu gọi) mới là thứ quyết định trang có ĐÚNG hay không — thiết kế đẹp mà sai nội dung vẫn là việc hỏng.',
    },
    parsons: {
      prompt:
        'Xếp việc landing page dùng skill đã đúc: giao rõ nội dung + skill → xem trạng thái → nghiệm thu như một khách hàng lạ.',
      lines: [
        'giao "lam landing page cho San Pham X, dung skill thiet-ke-chuan"',
        'trangthai',
        'duyet v1',
      ],
    },
    make: {
      prompt:
        'Marketing cần gấp một trang giới thiệu sản phẩm mới:\n\n1. Giao việc đủ nội dung: lam landing page cho San Pham Y, dung skill thiet-ke-chuan, gom hero, 3 tinh nang, nut Mua ngay\n2. Xem bảng việc.\n3. Đọc thử như khách hàng lạ, ổn — duyệt.',
      starterCode: `# 1. giao viec du noi dung\n\n# 2. xem bang viec\n\n# 3. nghiem thu\n`,
      testCases: [
        {
          stdinLines: [],
          expected:
            'lam landing page cho San Pham Y, dung skill thiet-ke-chuan, gom hero, 3 tinh nang, nut Mua ngay',
          match: 'contains',
          hidden: false,
          label: 'Việc giao đủ nội dung cụ thể, không chung chung',
        },
        {
          stdinLines: [],
          expected: 'Nghiem thu la viec cua NGUOI',
          match: 'contains',
          hidden: false,
          label: 'Trang đã được người nghiệm thu trước khi dùng',
        },
      ],
      hints: [
        'Ba lệnh: giao "…" → trangthai → duyet v1.',
        'Nội dung việc phải NÊU RÕ tên sản phẩm, số tính năng, và nút kêu gọi — như đề bài.',
        'giao "lam landing page cho San Pham Y, dung skill thiet-ke-chuan, gom hero, 3 tinh nang, nut Mua ngay"',
      ],
      sampleSolution: `giao "lam landing page cho San Pham Y, dung skill thiet-ke-chuan, gom hero, 3 tinh nang, nut Mua ngay"
trangthai
duyet v1`,
    },
    homework:
      'Viết yêu cầu landing page cho một sản phẩm/dịch vụ có thật của bạn, đủ NỘI DUNG cụ thể theo khuôn bài này (không dùng từ "đẹp"/"chuyên nghiệp" chung chung). So với yêu cầu đầu tiên bạn định viết trước khi học bài này — khác nhau ở đâu?',
    srsCards: [
      {
        hoi: 'Ranh giới giữa việc landing page nên giao cho agent và việc nên để người làm?',
        dap: 'Theo khuôn có sẵn, lặp lại → giao agent, nghiệm thu bằng mắt. Thiết kế sản phẩm mới hoàn toàn cần nghiên cứu người dùng → việc của con người.',
      },
      {
        hoi: 'Vì sao yêu cầu landing page ghi "làm cho đẹp" là yêu cầu tồi?',
        dap: '"Đẹp" là cảm tính, không nghiệm thu được. Yêu cầu tốt phải nêu rõ NỘI DUNG cụ thể: tên sản phẩm, tính năng, lời kêu gọi hành động.',
      },
    ],
  },
]

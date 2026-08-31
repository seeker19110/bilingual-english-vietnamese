// lessons/hermesu1.ts — Chương C1 "Cơ bản" của khoá "Hermes Agent — trợ lý AI cho người đi
// làm" (PR 3/4 khoá Hermes — docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md).
//
// unitId 'hermes-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Bảy bài bám đúng 7 mục phần I của đề cương tham chiếu (đặc tả §1.2), mỗi bài đặt trong bối
// cảnh văn phòng/điều phối dev. Mọi lệnh trong bài đều nằm trong bộ lệnh đóng của hermesSim.ts;
// phần LÀM THẬT (cài Docker, tạo bot BotFather…) để ở bước ⑦ homework, không chấm — đúng luật
// soạn bài công cụ thật của đặc tả §②.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const HERMES_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'hermes-u1-l1',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Hermes Agent là gì — dựng trợ lý chạy bằng Docker',
    hook: 'Bạn có một "thực tập sinh" làm việc 24/7: soạn email, tổng hợp báo cáo, nhắc việc — không lương, chỉ tốn tiền điện và API. Đó là tác tử AI. Bài này dựng nó lên và nhìn tận mắt trạng thái của nó.',
    theory:
      'TÁC TỬ (agent) khác chatbot ở một chữ: HÀNH ĐỘNG. Chatbot chỉ trả lời chữ; tác tử có công cụ (đọc file, gửi tin, chạy lệnh) và tự làm việc nhiều bước cho tới khi xong.\n\nHermes Agent là tác tử mã nguồn mở của Nous Research. Cách dựng ngoài đời có hai đường:\n1. Script cài một dòng (nhanh nhất, cài thẳng vào máy).\n2. Docker — đóng cả agent vào một "hộp" tách biệt: không đụng gì vào máy bạn, xoá hộp là sạch, chạy được cả trên máy chủ công ty. Dân văn phòng nên chọn Docker khi dùng chung máy với dữ liệu quan trọng.\n\nDựng xong, gõ lệnh `hermes` là thấy bảng trạng thái: đang dùng profile nào, model nào, gateway Telegram bật chưa, đang ở phiên làm việc nào. Đọc được bảng này là bước một của mọi buổi làm việc — như liếc bảng đồng hồ trước khi lái xe.\n\nLưu ý thật thà: terminal trong bài là BỘ MÔ PHỎNG của DHCB (dòng [GIA LAP] đầu output). Lệnh là lệnh thật của Hermes, nhưng phản hồi ngoài đời do AI sinh nên sẽ khác từng lần — còn ở đây phải cố định để chấm bài được.',
    workedExample: {
      code: `hermes`,
      stdinLines: [],
    },
    predict: {
      code: `hermes`,
      question:
        'Vừa dựng xong, chưa cấu hình gì thêm — dòng "gateway telegram" in ra trạng thái nào?',
      choices: ['chua-cau-hinh', 'da-cau-hinh', 'dang-chay', 'Khong in dong nao ve gateway'],
      answerIndex: 0,
      explain:
        'Gateway (cổng nối Telegram) phải tự tay cấu hình bằng "hermes gateway setup" — mới dựng thì luôn là chua-cau-hinh. Đây là chủ ý an toàn: agent không tự nối đi đâu khi chưa được bảo.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự một buổi ra mắt trợ lý: xem trạng thái → cấu hình Telegram → bật gateway → mở phiên việc đầu tiên.',
      lines: ['hermes', 'hermes gateway setup', 'hermes gateway start', '/new viec-dau-tien'],
    },
    make: {
      prompt:
        'Bạn vừa dựng Hermes bằng Docker cho phòng mình. Trước khi khoe với sếp, hãy kiểm tra "bảng đồng hồ":\n\n1. Gõ lệnh xem trạng thái tổng của agent.\n2. Đọc kỹ output: profile nào, model chính là gì, gateway Telegram đã bật chưa.',
      starterCode: `# 1. xem trang thai tong cua agent\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'gateway telegram: chua-cau-hinh',
          match: 'contains',
          hidden: false,
          label: 'Bảng trạng thái cho thấy gateway Telegram chưa cấu hình',
        },
        {
          stdinLines: [],
          expected: 'model: hermes-4',
          match: 'contains',
          hidden: false,
          label: 'Bảng trạng thái in ra model đang dùng',
        },
      ],
      hints: [
        'Chỉ cần MỘT lệnh — tên của chính con agent.',
        'Gõ: hermes (không tham số gì thêm).',
        'Lệnh `hermes` không kèm gì in bảng trạng thái: profile, model, gateway, phiên hiện tại.',
      ],
      sampleSolution: `hermes`,
    },
    homework:
      'Làm thật trên máy bạn (không chấm): cài Docker Desktop, rồi dựng Hermes theo tài liệu chính thức (github.com/NousResearch/hermes-agent — có Dockerfile sẵn). Checklist tự kiểm: ① container chạy không báo lỗi; ② gõ hermes thấy bảng trạng thái; ③ tắt container rồi bật lại, cấu hình vẫn còn. Chưa có máy cài được thì đọc trang cài đặt và ghi ra 2 khác biệt giữa cài script và cài Docker.',
    srsCards: [
      {
        hoi: 'Tác tử (agent) khác chatbot ở điểm cốt lõi nào?',
        dap: 'Tác tử có CÔNG CỤ và tự HÀNH ĐỘNG nhiều bước cho tới khi xong việc; chatbot chỉ trả lời chữ.',
      },
      {
        hoi: 'Vì sao dân văn phòng nên dựng Hermes bằng Docker thay vì cài thẳng?',
        dap: 'Docker đóng agent vào hộp tách biệt: không đụng vào máy/dữ liệu, xoá hộp là sạch, chạy được trên máy chủ công ty.',
      },
      {
        hoi: 'Lệnh nào xem "bảng đồng hồ" trạng thái của Hermes?',
        dap: '`hermes` không kèm tham số — in profile, model, trạng thái gateway, phiên hiện tại.',
      },
    ],
  },
  {
    id: 'hermes-u1-l2',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Cấu hình AI model và curator model',
    hook: 'Trợ lý giỏi cỡ nào là do "bộ não" bạn lắp cho nó — và hoá đơn cuối tháng cũng vậy. Hermes cho lắp HAI bộ não: một mạnh để làm việc, một rẻ để dọn dẹp ngữ cảnh. Chọn đúng cặp là tiết kiệm một nửa chi phí.',
    theory:
      'Hermes nói chuyện được với hơn 35 nhà cung cấp model (Nous, OpenRouter, Anthropic, OpenAI…). Cấu hình nằm trong file ~/.hermes/config.yaml, nhưng đổi nhanh thì dùng lệnh:\n\n    hermes model <tên>            — đặt MODEL CHÍNH (bộ não làm việc)\n    hermes model curator <tên>    — đặt CURATOR MODEL\n    /model                        — xem lại cả hai\n\nCURATOR MODEL là gì? Khi trò chuyện dài, agent phải NÉN bớt ngữ cảnh cũ để không tràn bộ nhớ. Việc nén này đơn giản, không cần model đắt — nên Hermes giao cho một model phụ rẻ hơn. Giống văn phòng thuê chuyên gia làm việc chính và một bạn part-time dọn hồ sơ: đừng trả lương chuyên gia cho việc dọn hồ sơ.\n\nQuy tắc chọn cho phòng ban:\n- Việc chính (soạn văn bản, phân tích): model mạnh vừa đủ, không phải mạnh nhất.\n- Curator: rẻ nhất còn dùng được.\n- Dữ liệu nhạy cảm: xem bài llama.cpp (chương C2) — self-host để dữ liệu không rời công ty.',
    workedExample: {
      code: `hermes model hermes-4-405b
hermes model curator tieu-hao-thap
/model`,
      stdinLines: [],
    },
    predict: {
      code: `hermes model hermes-4-405b
/model`,
      question: 'Chỉ đổi model chính, không đụng curator — /model in ra curator nào?',
      choices: ['hermes-4-mini', 'hermes-4-405b', 'tieu-hao-thap', 'Khong in dong curator'],
      answerIndex: 0,
      explain:
        'Curator mặc định là hermes-4-mini và KHÔNG đổi theo model chính — hai bộ não độc lập, đổi cái nào phải gõ lệnh cho cái đó. Quên đổi curator là quên một nửa hoá đơn.',
    },
    parsons: {
      prompt: 'Xếp thứ tự thay cả hai bộ não rồi kiểm tra lại — kiểm tra luôn đi CUỐI.',
      lines: ['hermes model hermes-4-405b', 'hermes model curator tieu-hao-thap', '/model'],
    },
    make: {
      prompt:
        'Phòng bạn được duyệt ngân sách AI mới. Cấu hình cho agent:\n\n1. Model chính: hermes-4-405b (việc chính cần chất lượng).\n2. Curator model: tieu-hao-thap (nén ngữ cảnh thì rẻ thôi).\n3. Xem lại cả hai để chắc chắn đã ăn.',
      starterCode: `# 1. dat model chinh\n\n# 2. dat curator model\n\n# 3. xem lai\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'model chinh: hermes-4-405b',
          match: 'contains',
          hidden: false,
          label: 'Model chính đã là hermes-4-405b',
        },
        {
          stdinLines: [],
          expected: 'model curator: tieu-hao-thap',
          match: 'contains',
          hidden: false,
          label: 'Curator model đã là tieu-hao-thap',
        },
      ],
      hints: [
        'Ba lệnh, đúng thứ tự trong đề: đặt chính → đặt curator → xem lại.',
        'Đặt curator phải có chữ curator: hermes model curator <tên>. Thiếu chữ đó là đè nhầm model CHÍNH.',
        'Xem lại bằng /model (hoặc hermes model không tham số).',
      ],
      sampleSolution: `hermes model hermes-4-405b
hermes model curator tieu-hao-thap
/model`,
    },
    homework:
      'Làm thật (không chấm): mở ~/.hermes/config.yaml trên bản Hermes thật, tìm mục providers và model. Ghi ra: model chính đang là gì, curator là gì, và giá mỗi triệu token của từng cái (tra trang nhà cung cấp). Tính thử: nếu curator dùng chung model chính thì mỗi tháng phòng bạn tốn thêm bao nhiêu?',
    srsCards: [
      {
        hoi: 'Curator model của Hermes làm việc gì, vì sao nên chọn model rẻ?',
        dap: 'Nén ngữ cảnh cũ khi hội thoại dài — việc đơn giản, không cần model đắt; giao model rẻ là tiết kiệm mà chất lượng việc chính không đổi.',
      },
      {
        hoi: 'Lệnh đặt model chính và lệnh đặt curator khác nhau chỗ nào?',
        dap: '`hermes model <tên>` đặt model chính; thêm chữ curator — `hermes model curator <tên>` — mới đặt curator. Hai bộ não độc lập.',
      },
      {
        hoi: 'Đổi model chính xong, curator có tự đổi theo không?',
        dap: 'KHÔNG — curator giữ nguyên cho tới khi tự tay đổi. Muốn xem cả hai: /model.',
      },
    ],
  },
  {
    id: 'hermes-u1-l3',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Làm quen Dashboard và Hermes CLI',
    hook: 'Ngày đầu nhận việc, ai cũng được dẫn đi một vòng văn phòng: đây là phòng họp, đây là kho, đây là nút báo cháy. Bài này là vòng dẫn tour đó — nhưng cho trợ lý AI của bạn: các lệnh gạch chéo, chế độ quyền, và nút dừng khẩn cấp.',
    theory:
      'Hermes có HAI cửa: dashboard web (bảng điều khiển nhìn bằng mắt: phiên, lịch sử, cấu hình) và CLI — gõ lệnh trực tiếp. Dashboard để NHÌN, CLI để LÀM; khoá này luyện CLI vì nó dùng được cả trong Telegram.\n\nTrong CLI có hai họ lệnh:\n- Lệnh `hermes …` — quản trị từ ngoài (model, profile, gateway). Như nói chuyện với PHÒNG IT.\n- Lệnh gạch chéo `/…` — gõ NGAY TRONG cuộc trò chuyện với agent. Như nói trực tiếp với trợ lý.\n\nBa lệnh gạch chéo phải thuộc từ hôm nay:\n    /permission   — xem/đổi chế độ quyền: "hoi" (việc nhạy cảm phải hỏi lại bạn) hay "tu-do" (tự làm hết). Mặc định là hoi — và với dữ liệu văn phòng, NÊN giữ hoi.\n    /skills       — xem kho kỹ năng agent đang có.\n    /stop         — DỪNG NGAY việc đang chạy. Nút báo cháy: agent làm sai hướng thì bấm, đừng ngồi nhìn nó chạy hết.',
    workedExample: {
      code: `hermes
/permission
/skills
/stop`,
      stdinLines: [],
    },
    predict: {
      code: `/permission`,
      question: 'Chưa từng đổi gì — /permission in ra chế độ quyền nào?',
      choices: ['hoi', 'tu-do', 'chua-cau-hinh', 'Bao loi vi thieu tham so'],
      answerIndex: 0,
      explain:
        'Mặc định là "hoi": việc nhạy cảm agent phải hỏi lại bạn trước khi làm. Đây là lưới an toàn — bài An toàn (C4) sẽ cho thấy tắt nó đi thì mất gì.',
    },
    parsons: {
      prompt: 'Xếp vòng "dẫn tour" hợp lý: trạng thái tổng → chế độ quyền → kho kỹ năng.',
      lines: ['hermes', '/permission', '/skills'],
    },
    make: {
      prompt:
        'Ngày đầu bàn giao agent cho bạn quản lý. Đi một vòng kiểm kê:\n\n1. Xem chế độ quyền hiện tại (phải là "hoi" — nếu ai đó đã bật tu-do thì bạn cần biết).\n2. Xem kho kỹ năng agent đang có.',
      starterCode: `# 1. che do quyen\n\n# 2. kho ky nang\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Che do quyen hien tai: hoi',
          match: 'contains',
          hidden: false,
          label: 'Đã xem chế độ quyền (đang là hoi)',
        },
        {
          stdinLines: [],
          expected: '- soan-email',
          match: 'contains',
          hidden: false,
          label: 'Đã mở kho kỹ năng (thấy soan-email có sẵn)',
        },
      ],
      hints: [
        'Cả hai đều là lệnh gạch chéo — gõ trong cuộc trò chuyện.',
        '/permission không kèm tham số là XEM (kèm tham số mới là ĐỔI).',
        'Kho kỹ năng: /skills.',
      ],
      sampleSolution: `/permission
/skills`,
    },
    homework:
      'Làm thật (không chấm): mở dashboard của bản Hermes thật trong trình duyệt, tìm đúng 3 thứ vừa học ở dạng nhìn-bằng-mắt: chỗ xem phiên, chỗ xem kỹ năng, chỗ đổi quyền. Ghi ra một việc dashboard làm dễ hơn CLI và một việc CLI làm dễ hơn dashboard — biết chọn cửa nào cho việc nào là kỹ năng thật.',
    srsCards: [
      {
        hoi: 'Lệnh `hermes …` và lệnh `/…` khác nhau thế nào?',
        dap: '`hermes …` là quản trị từ ngoài (model, profile, gateway); `/…` gõ ngay trong cuộc trò chuyện với agent (phiên, kỹ năng, quyền, dừng).',
      },
      {
        hoi: 'Agent đang làm sai hướng — lệnh nào dừng ngay?',
        dap: '/stop — dừng việc đang chạy, trạng thái công việc giữ nguyên. Đừng ngồi nhìn nó chạy hết rồi mới sửa.',
      },
      {
        hoi: 'Chế độ quyền mặc định của agent là gì, vì sao nên giữ?',
        dap: '"hoi" — việc nhạy cảm agent phải hỏi lại người trước khi làm. Giữ vì dữ liệu văn phòng khó hoàn tác khi xoá/gửi nhầm.',
      },
    ],
  },
  {
    id: 'hermes-u1-l4',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Kết nối Telegram — trợ lý trong túi áo',
    hook: 'Trợ lý chỉ dùng được khi ngồi máy tính thì mới là nửa trợ lý. Nối Hermes vào Telegram xong, bạn đang họp vẫn nhắn "tóm tắt file sếp vừa gửi" — cả phòng ai cũng dùng được, không ai phải học terminal.',
    theory:
      'Hermes có GATEWAY — cổng nối agent vào ứng dụng nhắn tin: Telegram, Discord, Slack, WhatsApp… cùng một cổng. Telegram là đường phổ biến nhất vì tạo bot miễn phí trong 2 phút.\n\nLuồng thật ngoài đời gồm 3 bước:\n1. Nhắn cho @BotFather trên Telegram → tạo bot mới → nhận về TOKEN (chuỗi bí mật định danh bot).\n2. `hermes gateway setup` — khai token, Hermes lưu vào ~/.hermes/config.yaml.\n3. `hermes gateway start` — bật dịch vụ chạy nền; từ giờ nhắn tin cho bot là agent trả lời, lệnh gạch chéo (/new, /skills…) gõ trong Telegram vẫn chạy.\n\nHai điều dân văn phòng hay vấp:\n- Chạy start khi CHƯA setup → lỗi. Thứ tự là bắt buộc: chưa khai token thì không có gì để bật.\n- TOKEN LÀ CHÌA KHOÁ NHÀ: ai cầm token là điều khiển được bot của bạn. Không dán vào nhóm chat, không commit lên Git — cùng một luật với mật khẩu.',
    workedExample: {
      code: `hermes gateway setup
hermes gateway start`,
      stdinLines: [],
    },
    predict: {
      code: `hermes gateway start`,
      question: 'Chưa từng chạy setup mà bật start luôn — chuyện gì xảy ra?',
      choices: [
        'Bao loi: gateway chua duoc cau hinh, chay setup truoc',
        'Gateway van chay, dung token mac dinh',
        'Hermes tu mo @BotFather de tao bot',
        'Khong in gi ca',
      ],
      answerIndex: 0,
      explain:
        'Chưa khai token thì không có gì để bật — Hermes báo lỗi và chỉ đúng lệnh kế tiếp. Không có "token mặc định": bot là của riêng bạn, phải tự tạo.',
    },
    parsons: {
      prompt: 'Xếp đúng luồng nối Telegram rồi mở phiên việc đầu tiên ngay trong đó.',
      lines: ['hermes gateway setup', 'hermes gateway start', '/new viec-tu-dien-thoai'],
    },
    make: {
      prompt:
        'Sếp muốn cả phòng nhắn được cho agent qua Telegram từ chiều nay. Bạn đã tạo bot với @BotFather và cầm token trong tay. Trên máy chủ:\n\n1. Cấu hình gateway (khai token).\n2. Bật gateway lên.\n3. Kiểm tra bảng trạng thái — dòng gateway phải là dang-chay.',
      starterCode: `# 1. cau hinh gateway\n\n# 2. bat gateway\n\n# 3. kiem tra trang thai\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Gateway Telegram dang chay',
          match: 'contains',
          hidden: false,
          label: 'Gateway đã bật thành công',
        },
        {
          stdinLines: [],
          expected: 'gateway telegram: dang-chay',
          match: 'contains',
          hidden: false,
          label: 'Bảng trạng thái xác nhận dang-chay',
        },
      ],
      hints: [
        'Thứ tự bắt buộc: setup TRƯỚC, start SAU — ngược lại là lỗi.',
        'Hai lệnh đầu: hermes gateway setup, rồi hermes gateway start.',
        'Kiểm tra cuối bằng lệnh trạng thái tổng quen thuộc: hermes.',
      ],
      sampleSolution: `hermes gateway setup
hermes gateway start
hermes`,
    },
    homework:
      'Làm thật (không chấm): nhắn @BotFather trên Telegram, gõ /newbot, đặt tên và nhận token — chưa cần nối vào đâu cả. Checklist tự kiểm: ① token đang nằm ở đâu (đúng chỗ: trình quản lý mật khẩu; sai chỗ: ghi chú công khai, nhóm chat)? ② thử hình dung: nếu token lộ, người lạ làm được gì với bot mang tên bạn?',
    srsCards: [
      {
        hoi: 'Ba bước nối Hermes vào Telegram?',
        dap: 'Tạo bot với @BotFather nhận token → hermes gateway setup (khai token) → hermes gateway start (bật dịch vụ).',
      },
      {
        hoi: 'Vì sao token bot phải giữ như mật khẩu?',
        dap: 'Ai cầm token là điều khiển được bot của bạn — đọc tin nhắn, trả lời mạo danh. Không dán vào chat/Git.',
      },
      {
        hoi: 'Chạy "hermes gateway start" khi chưa setup thì sao?',
        dap: 'Lỗi "gateway chua duoc cau hinh" — chưa khai token thì không có gì để bật. Thứ tự setup → start là bắt buộc.',
      },
    ],
  },
  {
    id: 'hermes-u1-l5',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Cấu hình profile agent — mỗi vai một bộ nhớ',
    hook: 'Một trợ lý vừa soạn hợp đồng khách A, vừa viết nội dung mạng xã hội, vừa theo dự án nội bộ — sớm muộn cũng lẫn chuyện nọ sang chuyện kia. Người thì khó tách vai, nhưng agent thì tách được: mỗi vai một PROFILE.',
    theory:
      'PROFILE là một "con" Hermes độc lập: cấu hình riêng, bộ nhớ riêng, phiên riêng, khoá API riêng. Tạo bằng:\n\n    hermes profile create <tên>    — tạo và chuyển sang profile mới\n    hermes profile                 — xem danh sách, dấu * là profile đang dùng\n\nKhi nào nên tách profile? Quy tắc: tách theo RANH GIỚI DỮ LIỆU, không phải theo loại việc.\n- "thu-ky" (lịch, email nội bộ) tách khỏi "tro-ly-khach-hang" (dữ liệu khách) — vì hai vùng dữ liệu không được lẫn nhau.\n- Người điều phối dev: profile "dieu-phoi-du-an-X" riêng cho từng dự án — agent dự án này không mang nhầm ngữ cảnh dự án kia vào đặc tả.\n\nPhân biệt với PHIÊN (bài sau): phiên là các cuộc trò chuyện TRONG một profile — cùng bộ nhớ, khác mạch chuyện. Profile là tách cả bộ nhớ. Tách nhầm tầng là dùng khổ: cần tách dữ liệu mà chỉ mở phiên mới thì bộ nhớ vẫn chung.',
    workedExample: {
      code: `hermes profile create thu-ky
hermes profile create tro-ly-du-an
hermes profile`,
      stdinLines: [],
    },
    predict: {
      code: `hermes profile create thu-ky
hermes profile`,
      question: 'Sau khi tạo profile "thu-ky", danh sách in ra đánh dấu * ở đâu?',
      choices: ['* thu-ky', '* mac-dinh', 'Ca hai deu co *', 'Khong co dau * nao'],
      answerIndex: 0,
      explain:
        'Tạo profile là CHUYỂN SANG nó luôn — dấu * (đang dùng) nằm ở thu-ky, còn mac-dinh vẫn trong danh sách nhưng không còn active.',
    },
    parsons: {
      prompt: 'Dựng hai vai cho phòng: tạo thư ký → tạo trợ lý dự án → xem lại danh sách.',
      lines: [
        'hermes profile create thu-ky',
        'hermes profile create tro-ly-du-an',
        'hermes profile',
      ],
    },
    make: {
      prompt:
        'Phòng bạn cần hai vai tách bạch dữ liệu:\n\n1. Tạo profile thu-ky (lịch + email nội bộ).\n2. Tạo profile tro-ly-du-an (tài liệu dự án).\n3. Xem danh sách — profile đang dùng phải là tro-ly-du-an (cái tạo sau cùng).',
      starterCode: `# 1. tao profile thu-ky\n\n# 2. tao profile tro-ly-du-an\n\n# 3. xem danh sach\n`,
      testCases: [
        {
          stdinLines: [],
          expected: '* tro-ly-du-an',
          match: 'contains',
          hidden: false,
          label: 'Đang đứng ở profile tro-ly-du-an',
        },
        {
          stdinLines: [],
          expected: 'Da tao profile "thu-ky"',
          match: 'contains',
          hidden: false,
          label: 'Profile thu-ky đã được tạo',
        },
      ],
      hints: [
        'Cú pháp tạo: hermes profile create <tên> — tên không dấu, nối bằng gạch ngang.',
        'Tạo cái nào là chuyển sang cái đó — nên tạo tro-ly-du-an SAU để nó là profile đang dùng.',
        'Xem danh sách: hermes profile (không tham số).',
      ],
      sampleSolution: `hermes profile create thu-ky
hermes profile create tro-ly-du-an
hermes profile`,
    },
    homework:
      'Bài tập giấy bút (không chấm): liệt kê các mảng việc bạn định giao cho agent, rồi vẽ ranh giới DỮ LIỆU giữa chúng (dữ liệu khách / nội bộ / cá nhân / từng dự án). Mỗi vùng ranh giới = một profile. Đặt tên sẵn theo kiểu không dấu gạch ngang — tuần sau dựng thật là có bản thiết kế.',
    srsCards: [
      {
        hoi: 'Profile của Hermes tách những gì?',
        dap: 'Cả cấu hình + bộ nhớ + phiên + khoá API — mỗi profile là một "con" agent độc lập.',
      },
      {
        hoi: 'Quy tắc quyết định khi nào tách profile?',
        dap: 'Tách theo RANH GIỚI DỮ LIỆU (dữ liệu khách vs nội bộ, dự án A vs B), không phải theo loại việc.',
      },
      {
        hoi: 'Profile khác phiên (session) thế nào?',
        dap: 'Phiên là các mạch trò chuyện TRONG một profile (chung bộ nhớ); profile tách cả bộ nhớ. Cần cách ly dữ liệu thì phải tách profile.',
      },
    ],
  },
  {
    id: 'hermes-u1-l6',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Quản lý session — mỗi việc một phiên',
    hook: 'Nhét việc "soạn hợp đồng" và việc "lên ý tưởng tiệc cuối năm" vào cùng một cuộc trò chuyện, đến chiều agent bắt đầu chèn không khí tiệc tùng vào hợp đồng. Không phải nó kém — là bạn để hai mạch chuyện chảy chung một ống.',
    theory:
      'SESSION (phiên) là một mạch trò chuyện có ngữ cảnh riêng. Hai lệnh:\n\n    /new [tên]       — mở phiên mới (không đặt tên thì tự đánh số phien-2, phien-3…)\n    /resume <tên>    — quay lại phiên cũ, toàn bộ ngữ cảnh vẫn còn nguyên\n\nNguyên tắc vàng: MỖI VIỆC MỘT PHIÊN. Lý do không phải cho đẹp:\n1. Ngữ cảnh sạch — agent không lẫn yêu cầu việc này sang việc kia.\n2. Quay lại được — tuần sau mở /resume hop-dong-khach-A là tiếp tục đúng chỗ dừng, không kể lại từ đầu.\n3. Rẻ hơn — phiên ngắn thì ít ngữ cảnh phải nạp lại mỗi lượt.\n\nMẹo đặt tên của dân văn phòng: tên phiên là TÊN VIỆC, không dấu, nối gạch ngang: bao-cao-thang-8, hop-dong-khach-A. Ba tháng sau nhìn danh sách phiên vẫn biết cái nào là cái nào — giống đặt tên file tử tế.',
    workedExample: {
      code: `/new bao-cao-thang
/new hop-dong-khach-A
/resume bao-cao-thang`,
      stdinLines: [],
    },
    predict: {
      code: `/resume ke-hoach-quy-4`,
      question: 'Chưa từng có phiên tên ke-hoach-quy-4 — lệnh này cho ra gì?',
      choices: [
        'Loi: khong co phien do, goi y /new ke-hoach-quy-4',
        'Tu dong tao phien moi ten do',
        'Quay ve phien-1',
        'Khong in gi',
      ],
      answerIndex: 0,
      explain:
        '/resume chỉ QUAY LẠI phiên đã có — không tự tạo, vì gõ nhầm tên mà lặng lẽ mở phiên trắng thì bạn tưởng ngữ cảnh cũ đã mất. Lỗi chỉ đúng đường: muốn tạo thì /new.',
    },
    parsons: {
      prompt:
        'Sáng thứ hai: mở phiên báo cáo → việc gấp chen vào, mở phiên riêng cho nó → xong việc gấp, quay lại báo cáo.',
      lines: ['/new bao-cao-tuan', '/new viec-gap-cua-sep', '/resume bao-cao-tuan'],
    },
    make: {
      prompt:
        'Một buổi sáng thực tế:\n\n1. Mở phiên bao-cao-thang cho việc chính.\n2. Sếp ném vào việc gấp — mở phiên soan-thu-moi riêng cho nó (đừng làm bẩn phiên báo cáo).\n3. Xong việc gấp, quay lại phiên bao-cao-thang làm tiếp.',
      starterCode: `# 1. phien cho viec chinh\n\n# 2. phien rieng cho viec gap\n\n# 3. quay lai viec chinh\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da mo phien moi "soan-thu-moi"',
          match: 'contains',
          hidden: false,
          label: 'Việc gấp có phiên riêng',
        },
        {
          stdinLines: [],
          expected: 'Da quay lai phien "bao-cao-thang"',
          match: 'contains',
          hidden: false,
          label: 'Quay lại đúng phiên việc chính, ngữ cảnh còn nguyên',
        },
      ],
      hints: [
        'Mở phiên có tên: /new <tên> — tên không dấu, gạch ngang.',
        'Quay lại phiên cũ: /resume <tên> — đúng tên đã đặt ở bước 1.',
        'Thứ tự: /new bao-cao-thang → /new soan-thu-moi → /resume bao-cao-thang.',
      ],
      sampleSolution: `/new bao-cao-thang
/new soan-thu-moi
/resume bao-cao-thang`,
    },
    homework:
      'Nhìn lại lịch sử chat AI bạn đang dùng hằng ngày (bất kỳ công cụ nào): tìm MỘT cuộc trò chuyện đang trộn từ hai việc trở lên. Tách nó ra trên giấy: nếu làm lại, bạn sẽ mở những phiên tên gì? Từ mai áp dụng luật mỗi-việc-một-phiên trong chính công cụ đó — luật này không riêng gì Hermes.',
    srsCards: [
      {
        hoi: 'Nguyên tắc vàng khi dùng session là gì, cho ba lợi ích nào?',
        dap: 'Mỗi việc một phiên — ngữ cảnh sạch (không lẫn việc), quay lại được đúng chỗ dừng, rẻ hơn vì ít ngữ cảnh nạp lại.',
      },
      {
        hoi: '/resume phiên chưa tồn tại thì Hermes làm gì?',
        dap: 'Báo lỗi và gợi ý /new — không lặng lẽ tạo phiên trắng, để bạn không tưởng nhầm ngữ cảnh cũ đã mất.',
      },
      {
        hoi: 'Cách đặt tên phiên tử tế?',
        dap: 'Tên phiên = tên việc, không dấu, nối gạch ngang (bao-cao-thang-8) — ba tháng sau đọc vẫn hiểu.',
      },
    ],
  },
  {
    id: 'hermes-u1-l7',
    unitId: 'hermes-u1',
    language: 'hermes',
    title: 'Sử dụng skill — kho kỹ năng có sẵn',
    hook: 'Mỗi lần nhờ agent soạn email lại phải dặn "giọng lịch sự, mở đầu chào theo chức danh, chốt bằng đề xuất lịch họp…" — dặn đến lần thứ mười thì bạn thành cái máy lặp. SKILL sinh ra để dặn MỘT LẦN, dùng mãi.',
    theory:
      'SKILL (kỹ năng) là một quy trình làm việc được đóng gói có tên: cách soạn email chuẩn của công ty, khuôn tổng hợp biên bản họp… Agent gặp việc khớp kỹ năng là làm theo đúng quy trình đó, không cần dặn lại.\n\n    /skills          — xem kho kỹ năng đang có\n    /learn <tên>     — đóng gói CÁCH LÀM VỪA RỒI thành kỹ năng mới (học từ chính việc vừa làm cùng bạn)\n\nHermes mới dựng đã có sẵn kỹ năng dùng ngay (trong mô phỏng: tom-tat-tai-lieu, soan-email). Cộng đồng chia sẻ hàng trăm kỹ năng qua kho agentskills.io — cài về là dùng, như cài tiện ích trình duyệt.\n\nGóc điều phối: kỹ năng chính là QUY TRÌNH PHÒNG BAN dạng chạy được. Quy trình nằm trong file Word thì mỗi người làm một kiểu; đóng thành skill thì agent làm đồng nhất trăm lần như một — và người mới vào phòng dùng được ngay ngày đầu. Bài /learn chuyên sâu nằm ở chương C2; hôm nay dùng kho có sẵn và học thử một kỹ năng đầu tiên.',
    workedExample: {
      code: `/skills
/learn bao-cao-tuan
/skills`,
      stdinLines: [],
    },
    predict: {
      code: `/learn tom-tat-tai-lieu`,
      question: 'Kỹ năng tom-tat-tai-lieu ĐÃ CÓ SẴN trong kho — /learn trùng tên thì sao?',
      choices: [
        'Bao loi: ky nang da co',
        'Ghi de ky nang cu',
        'Tao ban thu hai cung ten',
        'Doi ten tu dong thanh tom-tat-tai-lieu-2',
      ],
      answerIndex: 0,
      explain:
        'Trùng tên là lỗi — không lặng lẽ ghi đè, vì kỹ năng cũ có thể đang được cả phòng dùng. Muốn quy trình mới thì đặt tên mới, đây cũng là luật khi sửa quy trình chung của phòng.',
    },
    parsons: {
      prompt:
        'Xếp luồng làm quen kho kỹ năng: xem kho → dạy kỹ năng mới → xem lại để chắc đã vào kho.',
      lines: ['/skills', '/learn quy-trinh-duyet-chi', '/skills'],
    },
    make: {
      prompt:
        'Bạn vừa cùng agent làm xong một bản báo cáo tuần ưng ý và muốn cách làm này thành quy trình của phòng:\n\n1. Xem kho kỹ năng hiện có.\n2. Đóng gói cách làm vừa rồi thành kỹ năng bao-cao-tuan.\n3. Xem lại kho — kỹ năng mới phải nằm trong danh sách.',
      starterCode: `# 1. xem kho\n\n# 2. dong goi ky nang moi\n\n# 3. xem lai kho\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'thanh ky nang "bao-cao-tuan"',
          match: 'contains',
          hidden: false,
          label: 'Đã đóng gói kỹ năng bao-cao-tuan',
        },
        {
          stdinLines: [],
          expected: '- bao-cao-tuan',
          match: 'contains',
          hidden: false,
          label: 'Kho kỹ năng đã chứa bao-cao-tuan',
        },
      ],
      hints: [
        'Xem kho: /skills. Dạy kỹ năng: /learn <tên>.',
        'Tên kỹ năng theo đúng đề: bao-cao-tuan (không dấu, gạch ngang).',
        'Ba lệnh: /skills → /learn bao-cao-tuan → /skills.',
      ],
      sampleSolution: `/skills
/learn bao-cao-tuan
/skills`,
    },
    homework:
      'Chọn MỘT việc lặp lại hằng tuần của bạn (tổng hợp số liệu, soạn agenda họp…) và viết quy trình của nó ra 5–7 bước rõ ràng — đây chính là "ruột" của một skill. Mở agentskills.io xem có kỹ năng tương tự chưa; có thì so với quy trình của bạn xem thiếu gì. Sang chương C2 (/learn chuyên sâu) sẽ dùng chính bản nháp này.',
    srsCards: [
      {
        hoi: 'Skill của agent là gì, giải quyết nỗi khổ nào?',
        dap: 'Quy trình làm việc đóng gói có tên — dặn một lần, agent làm đồng nhất mãi; hết cảnh lặp lại cùng một lời dặn mỗi lần giao việc.',
      },
      {
        hoi: 'Hai lệnh làm việc với kỹ năng?',
        dap: '/skills xem kho đang có; /learn <tên> đóng gói cách làm vừa rồi thành kỹ năng mới.',
      },
      {
        hoi: 'Vì sao /learn trùng tên kỹ năng cũ lại báo lỗi thay vì ghi đè?',
        dap: 'Kỹ năng cũ có thể cả phòng đang dùng — ghi đè lặng lẽ là đổi quy trình chung sau lưng mọi người. Quy trình mới thì tên mới.',
      },
    ],
  },
]

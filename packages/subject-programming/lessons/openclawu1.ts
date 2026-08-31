// lessons/openclawu1.ts — Chương C1 "Cài đặt & làm quen" của khoá "OpenClaw — dựng trợ lý AI
// của riêng bạn" (PR 2/3 khoá OpenClaw — docs/specs/2026-08-31-khoa-openclaw.md).
//
// unitId 'openclaw-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'/
// 'hermes-u*'.
//
// Sáu bài bám đúng 6 mục chương C1 của đặc tả, góc nhìn TỰ CHỦ HẠ TẦNG (trợ lý chạy trên máy
// của bạn, dữ liệu không rời nhà). Mọi lệnh trong bài đều nằm trong bộ lệnh đóng của
// openclawSim.ts; phần LÀM THẬT (chạy script cài thật, mở dashboard thật…) để ở bước ⑦
// homework, không chấm — đúng luật soạn bài công cụ thật của đặc tả §②.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const OPENCLAW_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'openclaw-u1-l1',
    unitId: 'openclaw-u1',
    language: 'openclaw',
    title: 'OpenClaw là gì — trợ lý tự host vs trợ lý đám mây',
    hook: 'Trợ lý AI bạn đang dùng chạy trên máy chủ của người khác: dữ liệu của bạn ở nhà họ, luật chơi của họ, họ tắt là bạn mất. OpenClaw đi đường ngược lại — trợ lý chạy TRÊN MÁY CỦA BẠN. Bài này cài "viên gạch đầu tiên" và hiểu vì sao khác biệt đó đáng tiền.',
    theory:
      'OpenClaw là trợ lý AI cá nhân MÃ NGUỒN MỞ, TỰ HOST: toàn bộ chương trình chạy trên máy của bạn (laptop, máy chủ mini ở nhà, VPS thuê). Khác trợ lý đám mây ở ba điểm:\n1. DỮ LIỆU Ở NHÀ — ghi chú, tin nhắn, file bạn đưa cho trợ lý không rời máy (trừ phần văn bản gửi lên model AI để suy nghĩ — và bài llama.cpp kiểu tự host sẽ đóng nốt cả đường đó).\n2. BẠN LÀ CHỦ — muốn nối kênh nào, đặt luật gì, bật tắt lúc nào là quyền của bạn; không có công ty nào đổi giá hay khoá tính năng.\n3. BẠN CHỊU TRÁCH NHIỆM — tự cài, tự vá, tự khoá cửa an toàn. Khoá này dạy đúng phần đó.\n\nBước khởi đầu ngoài đời: chạy script cài một dòng, rồi gõ `openclaw onboard` — trình hướng dẫn tự làm 3 việc: kiểm tra nối được model AI chưa, tạo workspace ~/.openclaw/ (nhà kho chứa config + dữ liệu), và chuẩn bị Gateway (bài 3 nói kỹ).\n\nLưu ý thật thà: terminal trong bài là BỘ MÔ PHỎNG của DHCB (dòng [GIA LAP] đầu output). Lệnh là lệnh thật của OpenClaw, nhưng phản hồi ngoài đời do AI sinh nên sẽ khác từng lần — còn ở đây phải cố định để chấm bài được.',
    workedExample: {
      code: `openclaw onboard`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw gateway start`,
      question: 'Máy trắng tinh, CHƯA hề chạy onboard — gõ lệnh bật gateway luôn thì sao?',
      choices: [
        'Bao loi: chua cai dat/onboard, chay openclaw onboard truoc',
        'Gateway van bat voi cau hinh mac dinh',
        'OpenClaw tu chay onboard ngam roi bat gateway',
        'Khong in gi ca',
      ],
      answerIndex: 0,
      explain:
        'Chưa onboard thì chưa có workspace, chưa có config — không có gì để bật. Lỗi chỉ đúng lệnh kế tiếp thay vì lặng lẽ tự làm hộ: tự host nghĩa là mọi bước dựng nhà đều qua tay CHỦ NHÀ.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự buổi khai trương trợ lý: dựng nhà (onboard) → bật control plane → nhìn tổng thể.',
      lines: ['openclaw onboard', 'openclaw gateway start', 'openclaw gateway status'],
    },
    make: {
      prompt:
        'Bạn vừa cài xong OpenClaw trên máy của mình. Chạy trình hướng dẫn khởi tạo và ĐỌC KỸ output:\n\n1. Gõ lệnh onboard.\n2. Đối chiếu: workspace được tạo ở đâu, và lệnh nào được gợi ý cho bước kế tiếp.',
      starterCode: `# 1. chay trinh huong dan khoi tao\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Chao mung den OpenClaw!',
          match: 'contains',
          hidden: false,
          label: 'Trình hướng dẫn onboard đã chạy',
        },
        {
          stdinLines: [],
          expected: 'Tao workspace tai ~/.openclaw/',
          match: 'contains',
          hidden: false,
          label: 'Workspace đã được tạo tại ~/.openclaw/',
        },
      ],
      hints: [
        'Chỉ cần MỘT lệnh — trình hướng dẫn làm cả 3 việc.',
        'Cú pháp: openclaw <tên bước khởi tạo> — tên đó là "onboard".',
        'Gõ: openclaw onboard.',
      ],
      sampleSolution: `openclaw onboard`,
    },
    homework:
      'Làm thật trên máy bạn (không chấm): mở trang cài đặt chính thức của OpenClaw (docs.openclaw.ai), đọc phần Getting started. Checklist tự kiểm: ① máy bạn thuộc hệ nào (macOS/Linux/Windows) và dòng lệnh cài tương ứng là gì; ② ghi ra 2 khác biệt giữa trợ lý tự host và trợ lý đám mây BẰNG LỜI CỦA BẠN; ③ nếu có máy phù hợp, chạy script cài thật và openclaw onboard thật — output thật sẽ nhiều màu mè hơn mô phỏng, nhưng 3 việc cốt lõi y hệt.',
    srsCards: [
      {
        hoi: 'Trợ lý TỰ HOST khác trợ lý đám mây ở ba điểm nào?',
        dap: 'Dữ liệu ở nhà (không rời máy bạn) · bạn là chủ (tự đặt luật, không ai đổi giá/khoá tính năng) · bạn chịu trách nhiệm (tự cài, tự vá, tự khoá cửa).',
      },
      {
        hoi: '`openclaw onboard` làm 3 việc gì?',
        dap: 'Kiểm tra kết nối model AI · tạo workspace ~/.openclaw/ (config + dữ liệu) · chuẩn bị Gateway.',
      },
      {
        hoi: 'Chưa onboard mà gõ lệnh khác của OpenClaw thì sao?',
        dap: 'Lỗi "chua cai dat/onboard" kèm gợi ý chạy openclaw onboard — chưa có workspace thì chưa có gì để điều khiển.',
      },
    ],
  },
  {
    id: 'openclaw-u1-l2',
    unitId: 'openclaw-u1',
    language: 'openclaw',
    title: 'Cài đặt OpenClaw — script một dòng hay Docker?',
    hook: 'Cùng một phần mềm, hai cách đưa vào máy: rót thẳng vào hệ thống, hoặc đóng vào một chiếc hộp tách biệt. Chọn sai không chết ai — nhưng chọn đúng thì gỡ lúc chán chỉ mất một lệnh, và máy công ty không bao giờ bị vấy bẩn.',
    theory:
      'Ngoài đời OpenClaw có mấy đường cài:\n1. SCRIPT MỘT DÒNG — `curl -fsSL https://openclaw.ai/install.sh | bash` (Windows có bản PowerShell). Nhanh nhất, cài thẳng vào máy. Hợp máy cá nhân.\n2. DOCKER — đóng OpenClaw vào một "hộp" (container) tách biệt: không đụng gì vào hệ thống, xoá hộp là sạch, chạy được trên máy chủ. Hợp máy dùng chung, máy công ty.\n3. Đường khác (Nix…) cho người đã quen công cụ đó.\n\nDù cài đường nào, bước tiếp theo LUÔN là `openclaw onboard`. Có một biến thể đáng biết: `openclaw setup --baseline` tạo config nền KHÔNG qua trình hướng dẫn — dùng khi dựng máy hàng loạt theo kịch bản; người mới cứ đi đường onboard.\n\nMột điều quan trọng: cài + onboard xong, trợ lý CHƯA chạy — gateway (trái tim của nó, bài sau) vẫn đứng yên cho tới khi bạn tự bật. Kiểm tra bằng `openclaw gateway status`. Tự host là thế: không có gì tự động chạy sau lưng bạn.',
    workedExample: {
      code: `openclaw onboard
openclaw models`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw onboard
openclaw onboard`,
      question: 'Lỡ tay chạy onboard lần thứ hai — chuyện gì xảy ra?',
      choices: [
        'Bao loi: da onboard roi, goi y dung doctor de kiem tra',
        'Chay lai tu dau, xoa sach cau hinh cu',
        'Tao workspace thu hai ~/.openclaw-2/',
        'Khong in gi ca',
      ],
      answerIndex: 0,
      explain:
        'Onboard là việc làm MỘT LẦN — chạy lại không lặng lẽ xoá nhà đang ở. Muốn kiểm tra sức khoẻ hệ thống đã dựng thì có lệnh riêng: openclaw doctor (bài 6).',
    },
    parsons: {
      prompt:
        'Xếp đúng luồng "cài xong kiểm hàng": khởi tạo → xem gateway đang đứng hay chạy → xem model mặc định được lắp sẵn.',
      lines: ['openclaw onboard', 'openclaw gateway status', 'openclaw models'],
    },
    make: {
      prompt:
        'Bạn vừa cài OpenClaw bằng Docker trên máy chủ mini ở nhà. Nghiệm thu việc cài:\n\n1. Chạy trình khởi tạo.\n2. Xem trạng thái gateway — phải thấy nó đang ĐỨNG (dung), vì tự host không có gì tự chạy khi chưa được bảo.',
      starterCode: `# 1. khoi tao\n\n# 2. xem trang thai gateway\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Chuan bi Gateway — chua chay',
          match: 'contains',
          hidden: false,
          label: 'Onboard xác nhận gateway được chuẩn bị nhưng chưa chạy',
        },
        {
          stdinLines: [],
          expected: 'gateway: dung',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái gateway là dung (đứng yên chờ lệnh)',
        },
      ],
      hints: [
        'Hai lệnh, đúng thứ tự trong đề: onboard trước, xem trạng thái sau.',
        'Xem trạng thái gateway: openclaw gateway status.',
        'Thứ tự: openclaw onboard → openclaw gateway status.',
      ],
      sampleSolution: `openclaw onboard
openclaw gateway status`,
    },
    homework:
      'Làm thật (không chấm): quyết định ĐƯỜNG CÀI cho hoàn cảnh của bạn và ghi lý do ra 3 dòng — máy cá nhân dùng một mình (script) hay máy dùng chung/máy chủ (Docker)? Nếu chọn Docker: cài Docker Desktop, đọc phần Docker trong tài liệu OpenClaw. Checklist: ① biết lệnh cài của đường mình chọn; ② biết lệnh GỠ của đường đó (cài mà không biết gỡ là chưa làm chủ); ③ nếu cài thật, chạy openclaw gateway status đối chiếu với bài.',
    srsCards: [
      {
        hoi: 'Khi nào cài OpenClaw bằng Docker thay vì script một dòng?',
        dap: 'Máy dùng chung / máy công ty / máy chủ: Docker đóng trợ lý vào hộp tách biệt, không đụng hệ thống, xoá hộp là sạch.',
      },
      {
        hoi: 'Cài + onboard xong, trợ lý đã chạy chưa?',
        dap: 'CHƯA — gateway vẫn đứng (dung) cho tới khi tự tay bật. Tự host: không gì tự chạy sau lưng bạn.',
      },
      {
        hoi: '`openclaw setup --baseline` khác `openclaw onboard` chỗ nào?',
        dap: 'Tạo config nền KHÔNG qua trình hướng dẫn — cho dựng máy hàng loạt theo kịch bản; người mới đi đường onboard.',
      },
    ],
  },
  {
    id: 'openclaw-u1-l3',
    unitId: 'openclaw-u1',
    language: 'openclaw',
    title: 'Kiến trúc Gateway — control plane trên máy bạn',
    hook: 'Mọi toà nhà văn phòng có một quầy lễ tân: ai vào cũng qua đó, chuyển phòng nào cũng do đó điều. OpenClaw có đúng một "quầy lễ tân" như vậy — GATEWAY. Hiểu nó là hiểu cả kiến trúc; quên nó là mọi lệnh sau này lỗi mà không hiểu vì sao.',
    theory:
      'GATEWAY là CONTROL PLANE của OpenClaw — tiến trình trung tâm chạy trên máy bạn, quản tất cả: phiên trò chuyện, công cụ, sự kiện, và kết nối tới các kênh nhắn tin. Ba cửa nhìn vào nó — Control UI (web), CLI (dòng lệnh), TUI — đều chỉ là CỬA: thứ đứng sau luôn là gateway.\n\nBa lệnh vòng đời:\n    openclaw gateway start    — bật (từ đây kênh, chat, dashboard mới sống)\n    openclaw gateway status   — đang đứng hay chạy, bao nhiêu kênh, model gì\n    openclaw gateway stop     — dừng; mọi kênh tạm ngắt, CẤU HÌNH GIỮ NGUYÊN\n\nHệ quả kiến trúc phải khắc vào đầu: CONTROL PLANE TRƯỚC, MỌI THỨ SAU. Chat, dashboard, nối kênh — tất cả đi qua gateway, nên gateway chưa chạy thì các lệnh đó lỗi. Đây không phải phiền phức mà là thiết kế: một cổng duy nhất nghĩa là một chỗ duy nhất để khoá cửa, xem log, rút phích khi cần.\n\nVới người điều phối: "trợ lý bị đơ" thì câu hỏi đầu tiên luôn là "gateway có đang chạy không?" — openclaw gateway status trả lời trong một giây.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw gateway status
openclaw gateway stop`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw gateway stop`,
      question: 'Gateway đang ĐỨNG sẵn (chưa hề start) mà gõ stop — chuyện gì xảy ra?',
      choices: [
        'Bao loi: gateway dang dung san roi',
        'Dung "sau hon" — tat han tien trinh',
        'Tu bat len roi tat de lam dung y ban',
        'Xoa cau hinh gateway',
      ],
      answerIndex: 0,
      explain:
        'Dừng thứ đang đứng là vô nghĩa — máy nói thẳng thay vì im lặng giả vờ đã làm. Nguyên tắc đọc trạng thái trước khi ra lệnh: status trước, start/stop sau.',
    },
    parsons: {
      prompt:
        'Xếp một phiên làm việc trọn vòng đời: bật control plane → kiểm tra → làm việc xong thì dừng.',
      lines: ['openclaw gateway start', 'openclaw gateway status', 'openclaw gateway stop'],
    },
    make: {
      prompt:
        'Máy đã onboard sẵn (bối cảnh dựng sẵn). Thực hành trọn vòng đời control plane:\n\n1. Bật gateway.\n2. Xem trạng thái — phải là dang-chay.\n3. Dừng gateway (giả sử hết giờ làm) — cấu hình vẫn giữ nguyên.',
      starterCode: `# 1. bat gateway\n\n# 2. xem trang thai\n\n# 3. dung gateway\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'gateway: dang-chay',
          match: 'contains',
          hidden: false,
          label: 'Trạng thái xác nhận gateway đang chạy',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da dung gateway — moi kenh tam ngat, cau hinh giu nguyen',
          match: 'contains',
          hidden: false,
          label: 'Dừng xong, cấu hình giữ nguyên',
        },
      ],
      hints: [
        'Ba lệnh cùng bắt đầu bằng: openclaw gateway …',
        'Thứ tự trong đề: start → status → stop.',
        'Gõ: openclaw gateway start → openclaw gateway status → openclaw gateway stop.',
      ],
      sampleSolution: `openclaw gateway start
openclaw gateway status
openclaw gateway stop`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, chạy trọn vòng start → status → stop và đọc output thật. Checklist: ① tìm trong tài liệu xem gateway thật còn lệnh gì ngoài 3 lệnh này (gợi ý: restart); ② trả lời bằng lời của bạn: vì sao "một cổng duy nhất" lại AN TOÀN hơn là mỗi tính năng tự mở một cổng riêng? (gợi ý: nghĩ về số cửa phải khoá khi có chuyện).',
    srsCards: [
      {
        hoi: 'Gateway của OpenClaw là gì, quản những gì?',
        dap: 'Control plane — tiến trình trung tâm trên máy bạn: quản phiên, công cụ, sự kiện, kết nối kênh. Control UI/CLI/TUI chỉ là cửa nhìn vào nó.',
      },
      {
        hoi: 'Nguyên tắc kiến trúc "control plane trước, mọi thứ sau" nghĩa là gì?',
        dap: 'Chat, dashboard, kênh đều đi QUA gateway — gateway chưa chạy thì các lệnh đó lỗi. Trợ lý "đơ" thì kiểm gateway status đầu tiên.',
      },
      {
        hoi: '`openclaw gateway stop` có mất cấu hình không?',
        dap: 'KHÔNG — chỉ dừng tiến trình, kênh tạm ngắt, cấu hình giữ nguyên; start lại là như cũ.',
      },
    ],
  },
  {
    id: 'openclaw-u1-l4',
    unitId: 'openclaw-u1',
    language: 'openclaw',
    title: 'Dashboard và chat terminal — hai cửa nói chuyện với trợ lý',
    hook: 'Có trợ lý rồi thì… nói chuyện với nó ở đâu? OpenClaw mở sẵn hai cửa ngay trên máy: một cửa sổ web để NHÌN (dashboard) và một dòng lệnh để NÓI (chat). Chưa cần nối Telegram gì cả — hôm nay bạn đã trò chuyện được với trợ lý của mình.',
    theory:
      'Hai cửa có sẵn sau khi gateway chạy:\n\n1. `openclaw dashboard` — mở CONTROL UI trong trình duyệt (chạy ngay trên máy bạn, địa chỉ localhost — không phải website ngoài Internet, dữ liệu không rời nhà). Dashboard để NHÌN: phiên đang mở, kênh đã nối, lịch sử, cấu hình.\n2. `openclaw chat "<tin nhắn>"` — gửi tin cho trợ lý ngay trong terminal, không cần app nào. Đây là đường thử nhanh nhất: cấu hình xong gõ một câu chat là biết trợ lý sống hay chưa.\n\nCả hai đều là CỬA nhìn vào gateway (bài trước) — nên gateway chưa chạy thì cả hai đều lỗi, và lỗi sẽ chỉ đúng lệnh bật.\n\nMẹo phân vai: việc XEM (soát lịch sử, kiểm kênh) → dashboard cho nhanh; việc LÀM (gửi lệnh, thử cấu hình) → CLI, vì lệnh gõ được thì tự động hoá được (chương C3). Người điều phối nên thạo CLI trước — dashboard tự khắc biết dùng.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw dashboard
openclaw chat "tom tat giup toi lich hop tuan nay"`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw dashboard`,
      question: 'Gateway đang ĐỨNG mà gõ mở dashboard — chuyện gì xảy ra?',
      choices: [
        'Bao loi: gateway chua chay, bat truoc bang openclaw gateway start',
        'Dashboard van mo nhung trong tron',
        'Dashboard tu bat gateway ho ban',
        'May tu mo trinh duyet den trang chu OpenClaw',
      ],
      answerIndex: 0,
      explain:
        'Dashboard chỉ là CỬA SỔ nhìn vào gateway — nhà chưa mở đèn thì cửa sổ không có gì để nhìn. Lỗi nhắc đúng lệnh bật: control plane trước, mọi thứ sau (bài 3).',
    },
    parsons: {
      prompt:
        'Xếp buổi chào hỏi đầu tiên: bật control plane → mở cửa nhìn → gửi câu chat đầu tiên.',
      lines: [
        'openclaw gateway start',
        'openclaw dashboard',
        'openclaw chat "xin chao tro ly moi"',
      ],
    },
    make: {
      prompt:
        'Máy đã onboard sẵn (bối cảnh dựng sẵn). Buổi trò chuyện đầu tiên với trợ lý của chính bạn:\n\n1. Bật gateway.\n2. Mở dashboard xem "mặt mũi" trợ lý.\n3. Gửi câu chat: xin chao tro ly moi (đặt trong nháy kép).',
      starterCode: `# 1. bat gateway\n\n# 2. mo dashboard\n\n# 3. gui cau chat dau tien\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da mo Control UI tai http://localhost:18789',
          match: 'contains',
          hidden: false,
          label: 'Dashboard đã mở (địa chỉ localhost — chạy trên máy bạn)',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Agent (mo phong): da nhan "xin chao tro ly moi"',
          match: 'contains',
          hidden: false,
          label: 'Trợ lý đã nhận câu chat đầu tiên',
        },
      ],
      hints: [
        'Nhớ bài 3: hai cửa đều cần gateway đang chạy — bật nó TRƯỚC.',
        'Chat có cú pháp: openclaw chat "<tin nhắn>" — tin nhắn nằm trong nháy kép.',
        'Thứ tự: openclaw gateway start → openclaw dashboard → openclaw chat "xin chao tro ly moi".',
      ],
      sampleSolution: `openclaw gateway start
openclaw dashboard
openclaw chat "xin chao tro ly moi"`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, chạy openclaw dashboard và dạo một vòng Control UI. Checklist: ① tìm được 3 chỗ: danh sách phiên, danh sách kênh, cấu hình; ② gửi một câu chat thật (qua UI hoặc openclaw chat) và đọc phản hồi — để ý phản hồi thật do AI sinh, mỗi lần một khác, đúng như bài học đã dặn; ③ ghi ra một việc bạn thấy dashboard tiện hơn CLI và một việc ngược lại.',
    srsCards: [
      {
        hoi: 'Hai cửa nói chuyện với OpenClaw ngay trên máy là gì, phân vai ra sao?',
        dap: '`openclaw dashboard` (Control UI web, để NHÌN: phiên/kênh/lịch sử) và `openclaw chat "…"` (terminal, để LÀM/thử nhanh). Cả hai đều cần gateway đang chạy.',
      },
      {
        hoi: 'Dashboard của OpenClaw mở ở địa chỉ dạng nào, vì sao điều đó quan trọng?',
        dap: 'localhost — chạy ngay trên máy bạn, KHÔNG phải website ngoài Internet: nhìn vào trợ lý không làm dữ liệu rời nhà.',
      },
      {
        hoi: 'Vì sao người điều phối nên thạo CLI trước dashboard?',
        dap: 'Lệnh gõ được thì tự động hoá được (cron, kịch bản — chương C3); dashboard chỉ để nhìn, không ghép vào quy trình tự động.',
      },
    ],
  },
  {
    id: 'openclaw-u1-l5',
    unitId: 'openclaw-u1',
    language: 'openclaw',
    title: 'Cấu hình model — chọn bộ não cho trợ lý',
    hook: 'Trợ lý của bạn thông minh cỡ nào — và hoá đơn AI cuối tháng dày cỡ nào — nằm ở một lựa chọn: MODEL. OpenClaw cho đổi bộ não bằng một lệnh, nên chọn sai hôm nay không sao; không biết mình đang dùng gì mới là vấn đề.',
    theory:
      'OpenClaw không tự có "trí khôn" — nó GỌI một model AI để suy nghĩ. Bạn chọn model nào là quyền của bạn (hơn 35 nhà cung cấp ngoài đời, kể cả model tự host — bài llama.cpp chương C3).\n\nHai lệnh:\n    openclaw models              — xem danh sách, dấu * là model đang dùng\n    openclaw models use <tên>    — chuyển model chính\n\nTrong mô phỏng có 3 model tên trung tính (ngoài đời tên sẽ là model thật của từng hãng):\n- gon-nhe — rẻ và nhanh nhất: hỏi đáp ngắn, việc lặt vặt.\n- can-bang — mặc định: đủ tốt cho hầu hết việc văn phòng.\n- suy-luan-sau — đắt nhất: phân tích dài, việc cần nghĩ nhiều bước.\n\nQuy tắc chọn của người giữ ví: bắt đầu bằng can-bang; việc nào thấy trả lời hụt hơi mới nâng lên suy-luan-sau; việc vặt hằng ngày hạ xuống gon-nhe. Đắt nhất KHÔNG đồng nghĩa hợp nhất — trả tiền suy-luan-sau để hỏi "mấy giờ rồi" là đốt tiền. Cấu hình nằm trong ~/.openclaw/openclaw.json, lệnh chỉ là cách đổi nhanh.',
    workedExample: {
      code: `openclaw onboard
openclaw models
openclaw models use suy-luan-sau
openclaw models`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw models use gpt-9`,
      question: 'Gõ tên một model không có trong danh sách — chuyện gì xảy ra?',
      choices: [
        'Bao loi va ke ra danh sach model dang co',
        'Tu tai model do tu Internet ve',
        'Chuyen sang model gan giong ten nhat',
        'Giu model cu va im lang',
      ],
      answerIndex: 0,
      explain:
        'Máy không đoán ý — tên sai là lỗi kèm danh sách tên đúng để bạn chọn lại. Im lặng giữ model cũ mới nguy hiểm: bạn tưởng đã đổi mà hoá đơn vẫn tính giá cũ.',
    },
    parsons: {
      prompt: 'Xếp luồng đổi bộ não có kiểm chứng: xem đang dùng gì → đổi → xem lại cho chắc.',
      lines: ['openclaw models', 'openclaw models use suy-luan-sau', 'openclaw models'],
    },
    make: {
      prompt:
        'Máy đã onboard sẵn (bối cảnh dựng sẵn). Tuần này bạn cần trợ lý phân tích một tập tài liệu dài — đáng nâng cấp bộ não:\n\n1. Xem danh sách model, để ý dấu * đang ở đâu.\n2. Chuyển sang suy-luan-sau.\n3. Xem lại danh sách — dấu * phải đã dời sang model mới.',
      starterCode: `# 1. xem danh sach model\n\n# 2. chuyen model\n\n# 3. xem lai\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da chuyen model chinh: suy-luan-sau',
          match: 'contains',
          hidden: false,
          label: 'Đã chuyển sang model suy-luan-sau',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: '* suy-luan-sau',
          match: 'contains',
          hidden: false,
          label: 'Danh sách xác nhận dấu * ở model mới',
        },
      ],
      hints: [
        'Xem danh sách: openclaw models (không tham số).',
        'Đổi model phải có chữ use: openclaw models use <tên>.',
        'Ba lệnh: openclaw models → openclaw models use suy-luan-sau → openclaw models.',
      ],
      sampleSolution: `openclaw models
openclaw models use suy-luan-sau
openclaw models`,
    },
    homework:
      'Làm thật (không chấm): mở bảng giá của 2 nhà cung cấp model bất kỳ (trang chính thức của họ), chọn ra cặp "một model cân bằng + một model rẻ" bạn sẽ dùng. Checklist: ① ghi giá mỗi triệu token của từng cái; ② ước lượng: một tháng bạn nhờ trợ lý khoảng bao nhiêu việc, việc trung bình tốn cỡ nào — hoá đơn dự kiến là bao nhiêu; ③ nếu đã cài thật: mở ~/.openclaw/openclaw.json tìm mục model và đối chiếu với openclaw models.',
    srsCards: [
      {
        hoi: 'Hai lệnh làm việc với model của OpenClaw?',
        dap: '`openclaw models` xem danh sách (dấu * = đang dùng); `openclaw models use <tên>` chuyển model chính.',
      },
      {
        hoi: 'Quy tắc chọn model của người giữ ví?',
        dap: 'Bắt đầu bằng model cân bằng; việc hụt hơi mới nâng lên model suy luận sâu; việc vặt hạ xuống model rẻ. Đắt nhất không đồng nghĩa hợp nhất.',
      },
      {
        hoi: 'Đổi model bằng tên không tồn tại thì sao?',
        dap: 'Lỗi kèm danh sách model đang có — máy không đoán ý, không lặng lẽ giữ model cũ.',
      },
    ],
  },
  {
    id: 'openclaw-u1-l6',
    unitId: 'openclaw-u1',
    language: 'openclaw',
    title: 'openclaw doctor — tự chẩn đoán khi trục trặc',
    hook: 'Trợ lý tự host nghĩa là không có tổng đài nào để gọi khi nó "đơ" — NHƯNG có bác sĩ nội trú ngay trong máy: `openclaw doctor` khám một lượt và nói thẳng chỗ nào ổn, chỗ nào cần bạn ra tay. Đây là lệnh đầu tiên phải nhớ khi có chuyện.',
    theory:
      '`openclaw doctor` kiểm tra sức khoẻ toàn hệ thống và in từng dòng [OK] / [CHU Y]:\n- workspace ~/.openclaw/ còn đọc được không;\n- gateway đang chạy hay đứng;\n- kênh nào đang treo (ví dụ cho-token — thêm rồi mà chưa dán token, chương C2 học kỹ);\n- model chính là gì.\n\nCách dùng đúng — QUY TRÌNH 3 BƯỚC khi trợ lý trục trặc:\n1. `openclaw doctor` — đọc TỪNG dòng [CHU Y], mỗi dòng đều kèm lệnh sửa.\n2. Sửa theo đúng lệnh được gợi ý (thường gặp nhất: gateway đứng → start).\n3. `openclaw doctor` LẦN NỮA — xác nhận dòng đó đã thành [OK]. Sửa mà không kiểm lại là chưa sửa.\n\nThói quen tốt của người vận hành: chạy doctor MỖI KHI vừa thay đổi cấu hình (thêm kênh, đổi model) chứ không đợi hỏng — bắt bệnh lúc mới chớm rẻ hơn nhiều lúc đã lăn ra. Với người điều phối: output doctor chính là thứ dán vào tin nhắn khi cần nhờ người khác giúp — thay cho "máy em nó bị gì ấy".',
    workedExample: {
      code: `openclaw onboard
openclaw doctor
openclaw gateway start
openclaw doctor`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw doctor`,
      question:
        'Máy đã onboard, gateway ĐANG ĐỨNG, chưa có kênh nào — dòng gateway trong doctor in gì?',
      choices: [
        '[CHU Y] gateway dang dung — kem lenh bat',
        '[OK] gateway dang chay',
        '[LOI] gateway hong, phai cai lai',
        'Khong co dong nao ve gateway',
      ],
      answerIndex: 0,
      explain:
        'Doctor đọc trạng thái THẬT: gateway đứng là [CHU Y] kèm đúng lệnh sửa (openclaw gateway start) — không hù doạ "hỏng" (đứng là trạng thái hợp lệ), cũng không im lặng cho qua.',
    },
    parsons: {
      prompt: 'Xếp quy trình chẩn đoán 3 bước: khám → sửa theo gợi ý → khám lại xác nhận.',
      lines: ['openclaw doctor', 'openclaw gateway start', 'openclaw doctor'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard và đã thêm kênh telegram (nhưng chưa dán token — kênh đang treo cho-token). Sáng nay trợ lý "không trả lời". Chẩn đoán đúng quy trình:\n\n1. Chạy doctor — đọc các dòng [CHU Y].\n2. Sửa cái sửa được ngay: bật gateway.\n3. Chạy doctor lần nữa — gateway phải thành [OK]; kênh cho-token vẫn [CHU Y] (việc của chương C2, hôm nay biết là đủ).',
      starterCode: `# 1. kham benh\n\n# 2. sua: bat gateway\n\n# 3. kham lai\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard', 'openclaw channel add telegram'],
          expected: '[CHU Y] gateway dang dung',
          match: 'contains',
          hidden: false,
          label: 'Lần khám đầu chỉ ra gateway đang đứng',
        },
        {
          stdinLines: ['openclaw onboard', 'openclaw channel add telegram'],
          expected: '[OK] gateway dang chay',
          match: 'contains',
          hidden: false,
          label: 'Khám lại xác nhận gateway đã chạy',
        },
        {
          stdinLines: ['openclaw onboard', 'openclaw channel add telegram'],
          expected: '1 kenh cho-token: telegram',
          match: 'contains',
          hidden: false,
          label: 'Doctor vẫn nhắc kênh telegram đang treo (bài chương C2)',
        },
      ],
      hints: [
        'Quy trình 3 bước trong lý thuyết: doctor → sửa → doctor.',
        'Cái sửa được ngay hôm nay là gateway: openclaw gateway start.',
        'Ba lệnh: openclaw doctor → openclaw gateway start → openclaw doctor.',
      ],
      sampleSolution: `openclaw doctor
openclaw gateway start
openclaw doctor`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, chạy openclaw doctor và đọc từng dòng — output thật kiểm nhiều mục hơn mô phỏng. Checklist: ① mỗi dòng [CHU Y]/cảnh báo, ghi ra lệnh sửa tương ứng; ② tự gây một "bệnh" nhẹ (dừng gateway) rồi khám — doctor có bắt được không; ③ sửa xong khám lại đủ 3 bước. Chưa cài thật thì viết ra quy trình 3 bước bằng lời của bạn, dán vào ghi chú vận hành — sang chương C2 sẽ dùng liên tục.',
    srsCards: [
      {
        hoi: '`openclaw doctor` kiểm tra những gì?',
        dap: 'Workspace đọc được không · gateway chạy hay đứng · kênh nào đang treo (vd cho-token) · model chính — mỗi mục một dòng [OK]/[CHU Y] kèm lệnh sửa.',
      },
      {
        hoi: 'Quy trình 3 bước khi trợ lý trục trặc?',
        dap: 'doctor (đọc từng [CHU Y]) → sửa theo đúng lệnh được gợi ý → doctor lần nữa xác nhận thành [OK]. Sửa mà không kiểm lại là chưa sửa.',
      },
      {
        hoi: 'Khi nào nên chạy doctor ngoài lúc hỏng?',
        dap: 'MỖI KHI vừa đổi cấu hình (thêm kênh, đổi model) — bắt bệnh lúc mới chớm rẻ hơn lúc đã lăn ra.',
      },
    ],
  },
]

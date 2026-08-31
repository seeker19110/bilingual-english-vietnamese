// lessons/openclawu4.ts — Chương C4 "Nhiều agent & vận hành" của khoá "OpenClaw — dựng trợ lý
// AI của riêng bạn" (PR 3/3 khoá OpenClaw — docs/specs/2026-08-31-khoa-openclaw.md).
//
// unitId 'openclaw-u4' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế openclaw-u1/u2/u3.
//
// Bốn bài, MỘT điều chỉnh so với đề cương gốc (openclawSim.ts đọc kỹ trước khi soạn):
//   - Bài 3 vốn đề "backup config, cập nhật phiên bản, đọc log" nhưng sim KHÔNG có lệnh
//     backup/update/log riêng (đúng luật soạn bài công cụ thật của đặc tả §②: phần LÀM THẬT ở
//     homework, không chấm). Lý thuyết dạy đủ ba việc bằng lời + đường dẫn thật; phần Make dùng
//     đúng lệnh có thật (openclaw doctor làm "khám sức khoẻ định kỳ trước khi backup").
import type { ProgrammingLesson } from '../lessonTypes.js'

export const OPENCLAW_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'openclaw-u4-l1',
    unitId: 'openclaw-u4',
    language: 'openclaw',
    title: 'openclaw agents — mỗi vai một agent',
    hook: 'Một trợ lý vừa trả lời khách hàng vừa ghi chú họp riêng của bạn — sớm muộn nó cũng lẫn lộn ngữ cảnh. OpenClaw cho tách hẳn: mỗi "vai" một agent riêng, workspace riêng, bộ nhớ riêng, không đụng nhau.',
    theory:
      'Một AGENT trong OpenClaw là một "nhân cách" riêng biệt: bộ nhớ, workspace, và (bài sau) kênh ghim đều TÁCH BIỆT với các agent khác — dù tất cả vẫn chạy chung một Gateway. Bốn lệnh:\n    openclaw agents list             — xem tất cả agent hiện có\n    openclaw agents add <ten>        — tạo agent mới\n    openclaw agents delete <ten>     — xoá một agent (KHÔNG xoá được agent "mac-dinh")\n\nMáy luôn có sẵn MỘT agent tên "mac-dinh" ngay từ đầu — mọi chat/kênh chưa ghim (bài sau) đều thuộc về nó. Agent "mac-dinh" không xoá được vì luôn cần một nơi để mọi thứ chưa phân loại rơi vào.\n\nVí dụ chia vai thực tế: agent "cham-khach" chỉ nhớ hội thoại với khách hàng, không bao giờ thấy ghi chú họp nội bộ; agent "tro-ly-ca-nhan" chỉ phục vụ một mình bạn. Tách vai không chỉ để đỡ lẫn lộn — còn là ranh giới RIÊNG TƯ: dữ liệu của agent này không rò sang agent kia.',
    workedExample: {
      code: `openclaw onboard
openclaw agents list
openclaw agents add cham-khach
openclaw agents list`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw agents delete mac-dinh`,
      question: 'Thử xoá agent "mac-dinh" — chuyện gì xảy ra?',
      choices: [
        'Bao loi: khong xoa duoc agent mac-dinh',
        'Xoa thanh cong, may khong con agent nao',
        'Xoa nhung tu dong tao lai ngay sau do',
        'Doi ten agent mac-dinh thanh "cu"',
      ],
      answerIndex: 0,
      explain:
        'Agent mặc định là nơi mọi thứ chưa phân loại rơi vào — xoá nó là để máy không còn "nhà chung", nên OpenClaw chặn thẳng, không cho xoá.',
    },
    parsons: {
      prompt:
        'Xếp buổi tách vai đầu tiên: dựng nhà → xem agent hiện có → tạo agent chuyên trách khách hàng → xem lại danh sách.',
      lines: [
        'openclaw onboard',
        'openclaw agents list',
        'openclaw agents add cham-khach',
        'openclaw agents list',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard (agent "mac-dinh" có sẵn). Bạn muốn tách riêng việc chăm khách khỏi trợ lý cá nhân:\n\n1. Tạo agent "cham-khach".\n2. Xem lại danh sách agent — phải thấy đủ 2 agent: mac-dinh và cham-khach.',
      starterCode: `# 1. tao agent cham-khach\n\n# 2. xem lai danh sach\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da tao agent "cham-khach" — workspace/bo nho/skill tach biet',
          match: 'contains',
          hidden: false,
          label: 'Agent cham-khach đã tạo',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: 'mac-dinh — kenh ghim: (khong)',
          match: 'contains',
          hidden: false,
          label: 'Danh sách vẫn còn agent mac-dinh',
        },
      ],
      hints: [
        'Tạo agent mới: openclaw agents add <tên>.',
        'Xem lại danh sách: openclaw agents list.',
        'Hai lệnh: openclaw agents add cham-khach → openclaw agents list.',
      ],
      sampleSolution: `openclaw agents add cham-khach
openclaw agents list`,
    },
    homework:
      'Làm thật (không chấm): nghĩ về công việc của bạn — có bao nhiêu "vai" khác nhau bạn muốn trợ lý đảm nhận (cá nhân, công việc, một dự án riêng…)? Checklist: ① liệt kê 2–3 vai và lý do cần tách; ② nếu đã cài OpenClaw thật, tạo thử một agent bằng openclaw agents add <tên> và openclaw agents list xác nhận; ③ ghi ra: nếu KHÔNG tách vai, rủi ro cụ thể nào có thể xảy ra với dữ liệu/ngữ cảnh của bạn?',
    srsCards: [
      {
        hoi: 'Một "agent" trong OpenClaw tách biệt những gì với các agent khác?',
        dap: 'Bộ nhớ, workspace, và kênh ghim — dù tất cả agent vẫn chạy chung một Gateway.',
      },
      {
        hoi: 'Agent "mac-dinh" có gì đặc biệt?',
        dap: 'Luôn có sẵn từ đầu, là nơi chat/kênh chưa ghim rơi vào — KHÔNG xoá được, vì máy luôn cần một "nhà chung".',
      },
      {
        hoi: 'Vì sao tách agent theo vai không chỉ để đỡ lẫn lộn?',
        dap: 'Còn là ranh giới RIÊNG TƯ — dữ liệu/bộ nhớ của agent này không rò sang agent khác (vd chăm khách không thấy ghi chú họp nội bộ).',
      },
    ],
  },
  {
    id: 'openclaw-u4-l2',
    unitId: 'openclaw-u4',
    language: 'openclaw',
    title: 'Routing bindings — ghim kênh nào vào agent nào',
    hook: 'Có nhiều agent rồi, nhưng tin nhắn Telegram của khách vẫn đang đi thẳng vào agent cá nhân của bạn — tách vai chưa xong nếu chưa NỐI đúng dây. Bind là sợi dây đó: kênh nào báo cho agent nào biết.',
    theory:
      'ROUTING BINDING (ghim) quyết định TIN NHẮN TỪ MỘT KÊNH đi vào AGENT nào xử lý:\n    openclaw agents bind <agent> <kenh>      — ghim kênh vào agent, đòi kênh đã tồn tại (channel add trước)\n    openclaw agents unbind <agent> <kenh>    — bỏ ghim\n\nMột kênh ghim vào MỘT agent thì tin nhắn kênh đó "do agent này lo" — bộ nhớ, ngữ cảnh trả lời đều theo agent đã ghim, không lẫn với agent khác dù cùng chạy trên một Gateway.\n\nThứ tự bắt buộc: kênh phải đã được ĐĂNG KÝ (openclaw channel add — chương C2) trước khi ghim được; ghim vào một agent chưa tồn tại cũng bị chặn — agent phải TẠO trước (bài trước). Ba lớp phải xếp đúng thứ tự: có agent → có kênh → mới ghim được hai cái lại với nhau.\n\nVí dụ vận hành: kênh Telegram công khai (khách nhắn vào) ghim với agent "cham-khach"; kênh Telegram riêng (chỉ bạn dùng) ghim với agent "mac-dinh" hoặc một agent cá nhân khác — cùng nền tảng Telegram nhưng hai bot/kênh khác nhau, phục vụ hai vai khác nhau.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw agents add cham-khach
openclaw channel add telegram
openclaw agents bind cham-khach telegram
openclaw agents list`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw agents bind cham-khach whatsapp`,
      question: 'Agent "cham-khach" đã tạo, nhưng kênh "whatsapp" CHƯA hề add — ghim thì sao?',
      choices: [
        'Bao loi: chua co kenh whatsapp, them truoc bang openclaw channel add',
        'Tu dong them kenh whatsapp roi ghim luon',
        'Ghim thanh cong voi kenh rong',
        'Bao loi vi agent cham-khach khong ton tai',
      ],
      answerIndex: 0,
      explain:
        'Ghim đòi kênh đã tồn tại trước — không tự tạo hộ. Đúng thứ tự bắt buộc: channel add trước, agents bind sau.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự dựng dây nối: tạo agent → đăng ký kênh → ghim kênh vào agent → xem lại.',
      lines: [
        'openclaw agents add cham-khach',
        'openclaw channel add telegram',
        'openclaw agents bind cham-khach telegram',
        'openclaw agents list',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy, agent "cham-khach" đã tạo, kênh telegram đã đăng ký. Nối dây cho đúng vai:\n\n1. Ghim kênh telegram vào agent cham-khach.\n2. Xem lại danh sách agent — phải thấy cham-khach có kênh ghim là telegram.',
      starterCode: `# 1. ghim kenh vao agent\n\n# 2. xem lai danh sach\n`,
      testCases: [
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw agents add cham-khach',
            'openclaw channel add telegram',
          ],
          expected: 'Da ghim kenh telegram vao agent "cham-khach"',
          match: 'contains',
          hidden: false,
          label: 'Kênh telegram đã ghim vào agent cham-khach',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw agents add cham-khach',
            'openclaw channel add telegram',
          ],
          expected: 'cham-khach — kenh ghim: telegram',
          match: 'contains',
          hidden: false,
          label: 'Danh sách xác nhận cham-khach đã ghim telegram',
        },
      ],
      hints: [
        'Ghim dùng: openclaw agents bind <agent> <kênh>.',
        'Xem lại: openclaw agents list.',
        'Hai lệnh: openclaw agents bind cham-khach telegram → openclaw agents list.',
      ],
      sampleSolution: `openclaw agents bind cham-khach telegram
openclaw agents list`,
    },
    homework:
      'Làm thật (không chấm): vẽ ra (giấy hoặc ghi chú) sơ đồ "kênh nào → agent nào" bạn muốn cho công việc thật của mình. Checklist: ① mỗi kênh chỉ nên ghim vào MỘT agent chính — nếu thấy cần ghim một kênh vào nhiều agent, tự hỏi có đang lẫn vai không; ② nếu đã cài OpenClaw thật, chạy thử agents bind và agents list đối chiếu; ③ ghi rõ agent nào KHÔNG nên có quyền thấy dữ liệu của agent nào — đây là ranh giới riêng tư cần giữ.',
    srsCards: [
      {
        hoi: 'Routing binding (ghim) làm việc gì?',
        dap: 'Quyết định tin nhắn từ MỘT KÊNH đi vào AGENT nào xử lý — bộ nhớ/ngữ cảnh theo đúng agent đã ghim.',
      },
      {
        hoi: 'Thứ tự bắt buộc trước khi ghim được một kênh vào một agent?',
        dap: 'Agent phải đã tạo (agents add) VÀ kênh phải đã đăng ký (channel add) — thiếu một trong hai thì bind bị chặn.',
      },
      {
        hoi: 'Lệnh bỏ ghim một kênh khỏi agent?',
        dap: '`openclaw agents unbind <agent> <kênh>` — gỡ đúng dây nối, kênh vẫn còn, agent vẫn còn.',
      },
    ],
  },
  {
    id: 'openclaw-u4-l3',
    unitId: 'openclaw-u4',
    language: 'openclaw',
    title: 'Vận hành dài hạn — backup, cập nhật, đọc log',
    hook: 'Cài xong, chạy vài tuần yên ổn — rồi một hôm ổ cứng hỏng, hoặc bản mới ra mà bạn không biết. Trợ lý tự host là CỦA BẠN, nghĩa là ba việc bảo trì này cũng LÀ VIỆC CỦA BẠN, không ai làm hộ.',
    theory:
      'Mô phỏng của DHCB KHÔNG có lệnh backup/update/log riêng (không đụng file hệ thống thật) — ba việc này học bằng LỜI, làm THẬT ở homework:\n\n1. BACKUP CẤU HÌNH — toàn bộ "trí nhớ" của trợ lý nằm trong workspace ~/.openclaw/ (config, kênh, agent, lịch sử). Sao lưu thư mục này định kỳ (copy sang ổ khác, hoặc đồng bộ lên nơi lưu trữ riêng) là đủ — không cần công cụ đặc biệt, đây là THƯ MỤC THƯỜNG trên máy bạn.\n2. CẬP NHẬT PHIÊN BẢN — OpenClaw mã nguồn mở cập nhật thường xuyên (vá lỗi, tính năng mới). Theo dõi bản phát hành trên kho mã nguồn chính thức; trước khi cập nhật bản lớn, đọc ghi chú thay đổi (changelog) xem có gì phá vỡ cấu hình cũ không.\n3. ĐỌC LOG — khi trợ lý làm gì đó lạ, log là nơi tìm nguyên nhân TRƯỚC khi đoán mò hay cài lại từ đầu.\n\nCó MỘT thói quen mô phỏng dạy được: trước khi backup hay cập nhật, luôn `openclaw doctor` một lượt — backup một hệ thống đang có lỗi lặt vặt (kênh treo cho-token, gateway đứng bất thường) là backup luôn cả vấn đề đó vào bản sao lưu. Khám trước, sao lưu sau.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw doctor`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw doctor`,
      question: 'Trước khi backup cấu hình định kỳ hằng tuần, thói quen mô phỏng dạy là gì?',
      choices: [
        'Chay openclaw doctor truoc, sua het [CHU Y] roi moi backup',
        'Backup ngay khong can kiem tra gi',
        'Tat gateway roi backup, khong can doctor',
        'Xoa workspace cu roi tao lai truoc khi backup',
      ],
      answerIndex: 0,
      explain:
        'Backup một hệ thống đang có lỗi lặt vặt là sao lưu luôn cả vấn đề đó — khám bằng doctor trước, sửa các dòng [CHU Y], rồi mới backup, đúng tinh thần bài học.',
    },
    parsons: {
      prompt:
        'Xếp thói quen bảo trì định kỳ: dựng nhà → bật control plane → khám sức khoẻ toàn hệ thống trước khi làm gì thêm.',
      lines: ['openclaw onboard', 'openclaw gateway start', 'openclaw doctor'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, đã thêm kênh discord nhưng CHƯA reconnect (còn treo cho-token). Sáng thứ Hai — thói quen bảo trì trước khi backup cấu hình tuần này:\n\n1. Bật gateway (nếu đang đứng).\n2. Khám sức khoẻ toàn hệ thống — phải thấy nhắc kênh discord còn treo, để bạn xử lý trước khi sao lưu.',
      starterCode: `# 1. bat gateway\n\n# 2. kham suc khoe truoc khi backup\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard', 'openclaw channel add discord'],
          expected: 'gateway dang chay',
          match: 'contains',
          hidden: false,
          label: 'Gateway đã bật trước khi khám',
        },
        {
          stdinLines: ['openclaw onboard', 'openclaw channel add discord'],
          expected: 'kenh cho-token: discord',
          match: 'contains',
          hidden: false,
          label: 'Doctor nhắc kênh discord còn treo, cần xử lý trước khi backup',
        },
      ],
      hints: [
        'Bật gateway trước: openclaw gateway start.',
        'Khám toàn hệ thống là lệnh đã học ở chương C1: openclaw doctor.',
        'Hai lệnh: openclaw gateway start → openclaw doctor.',
      ],
      sampleSolution: `openclaw gateway start
openclaw doctor`,
    },
    homework:
      'Làm thật (không chấm) — ba việc bảo trì thật sự: ① nếu đã cài OpenClaw thật, tìm thư mục ~/.openclaw/ trên máy và thử sao lưu nó sang một nơi khác (ổ ngoài, dịch vụ lưu trữ riêng) — ghi lại đường dẫn và cách bạn vừa làm; ② mở kho mã nguồn chính thức OpenClaw, xem bản phát hành (release) mới nhất và đọc 3 dòng đầu ghi chú thay đổi; ③ tìm xem log của OpenClaw nằm ở đâu trên máy bạn (thường trong workspace hoặc thư mục log hệ thống) — mở thử một dòng log gần nhất và đoán nó đang ghi lại việc gì.',
    srsCards: [
      {
        hoi: 'Ba việc vận hành dài hạn quan trọng nhất với trợ lý tự host?',
        dap: 'Backup cấu hình (thư mục ~/.openclaw/), cập nhật phiên bản (theo dõi kho mã nguồn + đọc changelog), đọc log khi có chuyện lạ.',
      },
      {
        hoi: 'Vì sao workspace ~/.openclaw/ backup được bằng cách sao chép thư mục thường?',
        dap: 'Toàn bộ "trí nhớ" của trợ lý (config, kênh, agent, lịch sử) nằm trong đó — không cần công cụ đặc biệt, copy thư mục là đủ.',
      },
      {
        hoi: 'Thói quen nên làm TRƯỚC khi backup hoặc cập nhật?',
        dap: 'Chạy openclaw doctor một lượt — backup/cập nhật một hệ thống đang có lỗi lặt vặt là mang luôn vấn đề đó vào bản sao lưu/bản mới.',
      },
    ],
  },
  {
    id: 'openclaw-u4-l4',
    unitId: 'openclaw-u4',
    language: 'openclaw',
    title: 'Tổng kết — checklist "trợ lý của tôi đã an toàn chưa?"',
    hook: 'Ba chương, một trợ lý chạy trên máy bạn, biết nghe nhiều kênh, biết tự động hoá, có nhiều vai. Bài cuối không dạy lệnh mới — nó ráp LẠI mọi lệnh đã học thành đúng MỘT checklist bạn chạy trước khi giao trợ lý cho việc thật.',
    theory:
      'Checklist an toàn cuối khoá — bốn câu hỏi, mỗi câu một lệnh (hoặc một cặp lệnh) đã học:\n\n1. HỆ THỐNG CÓ KHOẺ KHÔNG? → `openclaw doctor` — không còn dòng [CHU Y] nào chưa xử lý.\n2. AI ĐANG NÓI CHUYỆN ĐƯỢC VỚI TRỢ LÝ? → `openclaw channel list` — soát TỪNG kênh: dmPolicy đúng ý định, allowFrom chỉ có đúng người cần, không thừa không thiếu.\n3. VIỆC CHẠM MÁY THẬT CÓ AI DUYỆT KHÔNG? → nhớ lại luật sư phạm số 2 (chương C2): mọi hành động máy thật LUÔN qua hàng chờ, không có "agent tự làm luôn" — nếu bạn thấy agent tự làm việc chạm máy thật mà không hỏi, đó là dấu hiệu bất thường cần kiểm ngay.\n4. MỖI VAI CÓ ĐÚNG RANH GIỚI CỦA NÓ KHÔNG? → `openclaw agents list` — mỗi agent chỉ ghim đúng kênh của vai đó, không lẫn.\n\nĐây không phải checklist làm MỘT LẦN rồi quên — chạy lại mỗi khi thêm kênh mới, thêm agent mới, hoặc đơn giản là định kỳ hằng tháng. Trợ lý càng làm được nhiều việc, checklist càng đáng chạy thường xuyên hơn, không phải ít hơn.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw channel add telegram
openclaw channel reconnect telegram
openclaw channel allow telegram sep_a
openclaw agents add cham-khach
openclaw agents bind cham-khach telegram
openclaw doctor
openclaw channel list
openclaw agents list`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw doctor`,
      question:
        'Chạy đủ 4 bước checklist một lần vào tháng trước — tháng này có cần chạy lại không?',
      choices: [
        'Co — checklist chay dinh ky, dac biet sau khi them kenh/agent moi',
        'Khong, chay mot lan la du vinh vien',
        'Chi can chay lai neu trinh duyet bao loi',
        'Chi can chay lai khi doi may',
      ],
      answerIndex: 0,
      explain:
        'Checklist an toàn không phải việc làm một lần — cấu hình thay đổi theo thời gian (thêm kênh, thêm agent, đổi allowFrom), nên chạy lại định kỳ và mỗi khi có thay đổi mới.',
    },
    parsons: {
      prompt:
        'Xếp đúng 4 bước checklist an toàn cuối khoá theo thứ tự đã học: khám hệ thống → soát kênh → soát agent.',
      lines: ['openclaw doctor', 'openclaw channel list', 'openclaw agents list'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy, kênh telegram đã nối và mở cho "sep_a", agent "cham-khach" đã tạo và ghim telegram. Trước khi chính thức đưa trợ lý vào dùng, chạy checklist an toàn:\n\n1. Khám sức khoẻ toàn hệ thống.\n2. Soát danh sách kênh — xác nhận telegram đã nối và có đúng người trong allowFrom.\n3. Soát danh sách agent — xác nhận cham-khach đã ghim đúng kênh.',
      starterCode: `# 1. kham he thong\n\n# 2. soat kenh\n\n# 3. soat agent\n`,
      testCases: [
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel allow telegram sep_a',
            'openclaw agents add cham-khach',
            'openclaw agents bind cham-khach telegram',
          ],
          expected: '[OK] gateway dang chay',
          match: 'contains',
          hidden: false,
          label: 'Doctor xác nhận gateway khoẻ',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel allow telegram sep_a',
            'openclaw agents add cham-khach',
            'openclaw agents bind cham-khach telegram',
          ],
          expected: 'telegram [da-noi] dmPolicy: chan-nguoi-la · allowFrom: sep_a',
          match: 'contains',
          hidden: false,
          label: 'Kênh telegram đã nối, đúng người trong allowFrom',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel allow telegram sep_a',
            'openclaw agents add cham-khach',
            'openclaw agents bind cham-khach telegram',
          ],
          expected: 'cham-khach — kenh ghim: telegram',
          match: 'contains',
          hidden: false,
          label: 'Agent cham-khach đã ghim đúng kênh',
        },
      ],
      hints: [
        'Ba lệnh đúng thứ tự lý thuyết đã nêu: doctor → channel list → agents list.',
        'Không lệnh nào cần tham số thêm — cả ba đều là lệnh xem tổng quan đã học.',
        'openclaw doctor → openclaw channel list → openclaw agents list.',
      ],
      sampleSolution: `openclaw doctor
openclaw channel list
openclaw agents list`,
    },
    homework:
      'Làm thật (không chấm) — chạy checklist này trên máy bạn (mô phỏng hoặc thật) và TỰ CHẤM bằng 4 câu hỏi:\n① openclaw doctor — còn dòng [CHU Y] nào không?\n② openclaw channel list — mỗi kênh, allowFrom có đúng và đủ không, thừa ai không?\n③ Tự hỏi lại: mọi việc chạm máy thật có LUÔN qua hàng chờ duyệt không, hay có chỗ nào bạn lỡ bật "tự làm luôn"?\n④ openclaw agents list — mỗi agent có đúng ranh giới của vai nó không?\nGhi lại kết quả 4 câu thành một ghi chú "an toàn hệ thống" và đặt lịch chạy lại checklist này (gợi ý: đầu mỗi tháng, hoặc mỗi lần thêm kênh/agent mới).',
    srsCards: [
      {
        hoi: 'Bốn câu hỏi của checklist an toàn cuối khoá, mỗi câu ứng với lệnh nào?',
        dap: '① Hệ thống khoẻ? → doctor. ② Ai nói chuyện được? → channel list. ③ Việc máy thật có ai duyệt? → nhớ luật hàng chờ duyệt. ④ Vai có đúng ranh giới? → agents list.',
      },
      {
        hoi: 'Checklist an toàn này chạy MỘT LẦN là đủ hay cần lặp lại?',
        dap: 'Cần chạy ĐỊNH KỲ và mỗi khi thêm kênh/agent mới — cấu hình thay đổi theo thời gian, an toàn không phải trạng thái cố định.',
      },
      {
        hoi: 'Dấu hiệu bất thường nào ở bước ③ cần kiểm ngay?',
        dap: 'Agent tự làm một việc chạm máy thật mà KHÔNG xếp vào hàng chờ duyệt — vi phạm luật sư phạm số 2 của chương C2.',
      },
    ],
  },
]

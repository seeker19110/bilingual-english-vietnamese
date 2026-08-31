// lessons/openclawu3.ts — Chương C3 "Skills & tự động hoá" của khoá "OpenClaw — dựng trợ lý AI
// của riêng bạn" (PR 3/3 khoá OpenClaw — docs/specs/2026-08-31-khoa-openclaw.md).
//
// unitId 'openclaw-u3' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế openclaw-u1/u2.
//
// Năm bài bám đề cương §② với HAI điều chỉnh (openclawSim.ts đọc kỹ trước khi soạn):
//   - Bài 4 vốn đề "webhook" nhưng sim KHÔNG mô phỏng mạng/webhook thật (đặc tả §② — không
//     Docker/mạng thật). Đổi thành bài ÔN TẬP khái niệm "trigger/sự kiện" bằng hai công cụ có
//     thật trong sim: cron (trigger theo LỊCH, kích tay) và channel test (trigger theo TIN NHẮN
//     ĐẾN, mô phỏng). Lý thuyết nói thẳng vì sao webhook thật không có trong mô phỏng.
//   - Bài 5 vốn đề "model tự host" nhưng sim không có model tự host riêng biệt (chỉ 3 model tên
//     trung tính đại diện các lớp, kể cả tự host). Lý thuyết nói khái niệm tự host thật (endpoint
//     kiểu OpenAI, llama.cpp/Ollama), phần Make dùng đúng lệnh models có thật trong sim.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const OPENCLAW_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'openclaw-u3-l1',
    unitId: 'openclaw-u3',
    language: 'openclaw',
    title: 'Kho skills — kỹ năng đóng gói sẵn cho agent',
    hook: 'Agent không phải sinh ra đã biết tóm tắt trang web hay nhắc việc đúng cách bạn thích — nó DÙNG một kỹ năng đã đóng gói sẵn. Bài này mở kho, xem trợ lý của bạn đang cầm sẵn những "dụng cụ" gì.',
    theory:
      'Một SKILL (kỹ năng) là một quy trình đã được đóng gói sẵn cho một loại việc lặp lại — thay vì agent phải tự nghĩ cách làm từ đầu mỗi lần, nó theo đúng quy trình đã có. Hai lệnh:\n    openclaw skills               — xem toàn bộ kho kỹ năng đang có\n    openclaw skills info <ten>    — soi chi tiết một kỹ năng\n\nKỹ năng khác skill của con người ở chỗ: bật/tắt được, chia sẻ được (chép file cấu hình sang máy khác), và cập nhật được mà không phải "học lại từ đầu" — cộng đồng OpenClaw có kho skills công khai, ai cũng thêm được kỹ năng mới cho trợ lý của mình.\n\nGóc điều phối dev: trước khi tự viết một quy trình phức tạp cho agent, luôn kiểm kho skills trước — rất có thể đã có người làm sẵn kỹ năng tương tự, đỡ mất công dựng lại từ số 0.',
    workedExample: {
      code: `openclaw onboard
openclaw skills
openclaw skills info tom-tat-web`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw skills info dich-thuat`,
      question: 'Soi một kỹ năng không có trong kho ("dich-thuat") — chuyện gì xảy ra?',
      choices: [
        'Bao loi: khong co ky nang do, goi y xem kho bang openclaw skills',
        'Tu tai ky nang do tu Internet ve',
        'Hien thi ky nang gan giong ten nhat',
        'Tra ve trang thai rong khong bao loi',
      ],
      answerIndex: 0,
      explain:
        'Kho kỹ năng là danh sách CÓ SẴN — soi tên không tồn tại thì báo lỗi kèm gợi ý đúng lệnh xem kho, không đoán ý, không tự tải thêm.',
    },
    parsons: {
      prompt:
        'Xếp một buổi khám phá kho kỹ năng: dựng nhà → xem toàn bộ kho → soi chi tiết một kỹ năng.',
      lines: ['openclaw onboard', 'openclaw skills', 'openclaw skills info nhac-viec'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard. Trước khi giao việc nhắc lịch cho trợ lý, kiểm xem nó có kỹ năng đó sẵn chưa:\n\n1. Xem toàn bộ kho kỹ năng.\n2. Soi chi tiết kỹ năng "nhac-viec".',
      starterCode: `# 1. xem kho ky nang\n\n# 2. soi chi tiet ky nang nhac-viec\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Ky nang dang co:',
          match: 'contains',
          hidden: false,
          label: 'Đã xem được danh sách kho kỹ năng',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Ky nang nhac-viec: quy trinh dong goi san',
          match: 'contains',
          hidden: false,
          label: 'Đã soi chi tiết kỹ năng nhac-viec',
        },
      ],
      hints: [
        'Xem toàn bộ kho: openclaw skills (không tham số).',
        'Soi một kỹ năng cần thêm chữ info và đúng tên: openclaw skills info <tên>.',
        'Hai lệnh: openclaw skills → openclaw skills info nhac-viec.',
      ],
      sampleSolution: `openclaw skills
openclaw skills info nhac-viec`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, chạy openclaw skills và đọc kho kỹ năng thật (nhiều hơn 2 kỹ năng của mô phỏng). Checklist: ① tìm 2 kỹ năng bạn thấy hữu ích ngay cho công việc của mình; ② đọc tài liệu xem cộng đồng chia sẻ skill qua đâu (kho GitHub, thư mục cấu hình…); ③ ghi ra một việc lặp lại hằng tuần của bạn — có kỹ năng nào trong kho khớp không, hay bạn cần tự viết mới.',
    srsCards: [
      {
        hoi: 'Một "skill" của OpenClaw là gì?',
        dap: 'Một quy trình đã đóng gói sẵn cho một loại việc lặp lại — agent theo đúng quy trình đó thay vì tự nghĩ cách làm từ đầu mỗi lần.',
      },
      {
        hoi: 'Hai lệnh làm việc với kho kỹ năng?',
        dap: '`openclaw skills` xem toàn bộ kho; `openclaw skills info <tên>` soi chi tiết một kỹ năng.',
      },
      {
        hoi: 'Vì sao nên kiểm kho skills trước khi tự viết quy trình mới cho agent?',
        dap: 'Rất có thể đã có người làm sẵn kỹ năng tương tự — kiểm kho trước đỡ mất công dựng lại từ số 0.',
      },
    ],
  },
  {
    id: 'openclaw-u3-l2',
    unitId: 'openclaw-u3',
    language: 'openclaw',
    title: '/config và /plugins — chỉnh trợ lý ngay trong chat',
    hook: 'Không cần thoát ra sửa file cấu hình rồi khởi động lại — OpenClaw cho chỉnh nhiều thứ NGAY TRONG CUỘC CHAT bằng lệnh gạch chéo. Bật một plugin, xem cấu hình hiện tại — tất cả trong một dòng gõ.',
    theory:
      'Hai lệnh gạch chéo (khác lệnh `openclaw ...` — đây là lệnh gõ TRONG phiên chat):\n    /config              — xem cấu hình đang chạy: model chính, kênh đã nối, agent hiện có\n    /plugins              — xem kho plugin và trạng thái bật/tắt\n    /plugins bat <ten>    — bật một plugin\n\nPlugin khác skill ở chỗ: skill là MỘT quy trình cho MỘT loại việc; plugin thường là một KHỐI TÍNH NĂNG rộng hơn (ví dụ nối với một công cụ ngoài như lịch, ghi chú) mà agent có thể gọi tới khi cần trong nhiều loại việc khác nhau.\n\nMẹo dùng: `/config` là câu hỏi đầu tiên nên gõ khi "trợ lý sao nay trả lời lạ vậy" — xem đúng model/agent nào đang chạy trước khi nghi ngờ điều gì khác. Plugin mặc định đều TẮT — bật đúng cái cần dùng, đừng bật hết "cho chắc" vì mỗi plugin bật thêm là một khả năng agent làm việc ngoài ý bạn.',
    workedExample: {
      code: `openclaw onboard
/config
/plugins
/plugins bat ghi-chu
/plugins`,
      stdinLines: [],
    },
    predict: {
      code: `/plugins bat dich-vu-la`,
      question: 'Bật một plugin không có trong kho ("dich-vu-la") — chuyện gì xảy ra?',
      choices: [
        'Bao loi va ke ra kho plugin dang co',
        'Tu dong tao plugin moi voi ten do',
        'Bat thanh cong nhung khong lam gi',
        'Lang le bo qua, khong bao loi',
      ],
      answerIndex: 0,
      explain:
        'Kho plugin là danh sách CÓ SẴN, giống kho skills — bật tên không tồn tại thì báo lỗi kèm danh sách đúng, không tự tạo, không đoán ý.',
    },
    parsons: {
      prompt:
        'Xếp buổi chỉnh cấu hình trong chat: dựng nhà → xem cấu hình → xem kho plugin → bật đúng plugin cần.',
      lines: ['openclaw onboard', '/config', '/plugins', '/plugins bat lich-hop'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard. Bạn cần trợ lý ghi chú lại các ý trong buổi họp — kiểm cấu hình rồi bật đúng plugin:\n\n1. Xem cấu hình hiện tại.\n2. Bật plugin "ghi-chu".',
      starterCode: `# 1. xem cau hinh\n\n# 2. bat plugin ghi-chu\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'model chinh: can-bang',
          match: 'contains',
          hidden: false,
          label: 'Cấu hình hiện tại đã hiện ra (model mặc định can-bang)',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da bat plugin ghi-chu',
          match: 'contains',
          hidden: false,
          label: 'Plugin ghi-chu đã được bật',
        },
      ],
      hints: [
        'Xem cấu hình bằng đúng lệnh gạch chéo: /config.',
        'Bật plugin cần thêm chữ bat và đúng tên: /plugins bat <tên>.',
        'Hai lệnh: /config → /plugins bat ghi-chu.',
      ],
      sampleSolution: `/config
/plugins bat ghi-chu`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, gõ /config trong một phiên chat và đối chiếu với file ~/.openclaw/openclaw.json. Checklist: ① thông tin /config hiện đúng khớp file cấu hình không; ② liệt kê các plugin có sẵn thật (nhiều hơn 2 cái của mô phỏng), chọn ra ĐÚNG MỘT cái cần cho công việc hằng ngày của bạn và bật nó; ③ tự hỏi: nếu bật hết mọi plugin "cho chắc", rủi ro là gì? (gợi ý: mỗi plugin là một khả năng hành động thêm agent có thể dùng).',
    srsCards: [
      {
        hoi: 'Hai lệnh gạch chéo dùng NGAY TRONG chat để chỉnh trợ lý?',
        dap: '`/config` xem cấu hình đang chạy (model, kênh, agent); `/plugins` xem kho plugin, `/plugins bat <tên>` bật một plugin.',
      },
      {
        hoi: 'Plugin khác skill ở điểm nào?',
        dap: 'Skill là một quy trình cho MỘT loại việc; plugin là một khối tính năng rộng hơn (nối công cụ ngoài) mà agent gọi tới trong nhiều loại việc khác nhau.',
      },
      {
        hoi: 'Vì sao không nên bật hết mọi plugin "cho chắc"?',
        dap: 'Plugin mặc định đều TẮT — mỗi plugin bật thêm là một khả năng agent làm việc ngoài ý bạn; chỉ bật đúng cái cần dùng.',
      },
    ],
  },
  {
    id: 'openclaw-u3-l3',
    unitId: 'openclaw-u3',
    language: 'openclaw',
    title: 'openclaw cron — việc lặp chạy theo lịch',
    hook: 'Bạn không muốn mỗi sáng phải nhớ gõ "tóm tắt tin ngành cho tôi". Cron biến một việc lặp lại thành một dòng cấu hình một lần — trợ lý tự nhớ hộ bạn, dù mô phỏng hôm nay chưa có đồng hồ thật để tự bấm giờ.',
    theory:
      'openclaw cron quản LỊCH việc lặp — bốn lệnh:\n    openclaw cron add "<lich>" "<ten viec>"    — tạo việc, trả về id (vd c1)\n    openclaw cron list                          — xem tất cả việc, bật/tắt, lịch\n    openclaw cron enable/disable <id>           — bật/tắt việc, KHÔNG xoá lịch\n    openclaw cron run <id>                       — CHẠY NGAY việc đó\n\nĐIỂM QUAN TRỌNG NHẤT của bài này, đọc kỹ: mô phỏng KHÔNG có đồng hồ thật — nó không tự biết "đã tới giờ" để chạy việc. Tạo xong một việc `cron add`, việc đó KHÔNG tự chạy dù bạn đợi bao lâu trong mô phỏng — phải TỰ TAY kích bằng `openclaw cron run <id>`. Ngoài đời, OpenClaw thật có đồng hồ hệ thống nên việc TỰ chạy đúng giờ; mô phỏng bỏ phần đó đi để một bài học chấm được (không thể chờ "đến 8 giờ sáng" trong một bài kiểm tra tự động).\n\nDisable không xoá lịch — chỉ tạm ngưng, bật lại (enable) là chạy tiếp đúng như cũ. Chạy một việc đang tắt (disable) thì bị chặn, phải enable trước.',
    workedExample: {
      code: `openclaw onboard
openclaw cron add "moi sang 8h" "tong hop tin nganh"
openclaw cron list
openclaw cron run c1`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw cron add "moi sang 8h" "chao buoi sang"`,
      question:
        'Vừa tạo xong việc cron "moi sang 8h" — đợi tới 8h sáng hôm sau trong mô phỏng, việc có tự chạy không?',
      choices: [
        'Khong bao gio tu chay trong mo phong — phai kich tay bang openclaw cron run <id>',
        'Tu chay dung 8h sang hom sau',
        'Chay ngay lap tuc sau khi tao',
        'Chi chay khi gateway khoi dong lai',
      ],
      answerIndex: 0,
      explain:
        'Mô phỏng KHÔNG có đồng hồ (`Date`) hay ngẫu nhiên — lịch chỉ là DỮ LIỆU, muốn chạy phải kích tay bằng cron run. Đây là điều bài học phải nói thẳng để không ai hiểu lầm.',
    },
    parsons: {
      prompt: 'Xếp một vòng dùng cron: dựng nhà → tạo việc → xem danh sách → kích tay chạy thử.',
      lines: [
        'openclaw onboard',
        'openclaw cron add "moi sang 8h" "tong hop tin nganh"',
        'openclaw cron list',
        'openclaw cron run c1',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard. Bạn muốn trợ lý tự nhắc "chao buoi sang, kiem tra lich hop" mỗi sáng — thiết lập và thử ngay hôm nay (vì mô phỏng không tự chạy theo giờ):\n\n1. Tạo việc định kỳ với lịch "moi sang 8h" và tên "chao buoi sang, kiem tra lich hop".\n2. Kích tay chạy thử ngay việc vừa tạo.',
      starterCode: `# 1. tao viec dinh ky\n\n# 2. kich tay chay thu\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da tao viec c1: "chao buoi sang, kiem tra lich hop"',
          match: 'contains',
          hidden: false,
          label: 'Việc định kỳ đã tạo với id c1',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da chay viec c1 (kich tay): "chao buoi sang, kiem tra lich hop" — xong.',
          match: 'contains',
          hidden: false,
          label: 'Việc đã được kích tay chạy thành công',
        },
      ],
      hints: [
        'Tạo việc cần đủ hai đoạn trong nháy kép: lịch trước, tên việc sau — openclaw cron add "<lịch>" "<tên>".',
        'Kích tay chạy dùng: openclaw cron run <id> — id đầu tiên trong một phiên luôn là c1.',
        'Hai lệnh: openclaw cron add "moi sang 8h" "chao buoi sang, kiem tra lich hop" → openclaw cron run c1.',
      ],
      sampleSolution: `openclaw cron add "moi sang 8h" "chao buoi sang, kiem tra lich hop"
openclaw cron run c1`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, tạo một việc cron thật cho một tác vụ bạn thực sự muốn lặp lại (vd nhắc uống nước mỗi 2 giờ). Checklist: ① đọc tài liệu cú pháp lịch thật (cron expression hoặc mô tả tự nhiên tuỳ bản OpenClaw); ② chạy openclaw cron list xác nhận việc đã tạo đúng; ③ khác với mô phỏng, việc thật SẼ tự chạy đúng giờ — canh giờ và xác nhận nó có chạy không, rồi ghi lại kết quả.',
    srsCards: [
      {
        hoi: 'Bốn lệnh quản lý cron của OpenClaw?',
        dap: '`cron add "<lịch>" "<tên>"` tạo việc · `cron list` xem tất cả · `cron enable/disable <id>` bật/tắt · `cron run <id>` chạy ngay.',
      },
      {
        hoi: 'Tạo xong một việc cron trong MÔ PHỎNG, việc đó có tự chạy đúng giờ không?',
        dap: 'KHÔNG — mô phỏng không có đồng hồ thật, phải kích tay bằng `openclaw cron run <id>`. Ngoài đời (OpenClaw thật) thì việc tự chạy đúng giờ.',
      },
      {
        hoi: '`cron disable <id>` có xoá lịch của việc đó không?',
        dap: 'KHÔNG — chỉ tạm ngưng, lịch vẫn giữ nguyên; `cron enable` lại là chạy tiếp đúng như cũ.',
      },
    ],
  },
  {
    id: 'openclaw-u3-l4',
    unitId: 'openclaw-u3',
    language: 'openclaw',
    title: 'Ôn "phản ứng theo sự kiện" — vì sao webhook thật không có trong mô phỏng',
    hook: 'Ngoài đời, trợ lý có thể phản ứng NGAY khi có một sự kiện xảy ra ở đâu đó trên mạng — đơn hàng mới, PR mới, tin nhắn mới — không cần bạn tự gõ lệnh. Bài này gọi tên đúng công nghệ đó (webhook) và ôn lại hai công cụ mô phỏng ĐÃ có để hiểu ý tưởng, không cần mạng thật.',
    theory:
      'WEBHOOK là một địa chỉ web mà một dịch vụ NGOÀI (cửa hàng, GitHub, hệ thống đặt lịch…) tự động GỌI TỚI mỗi khi có sự kiện — OpenClaw thật lắng nghe địa chỉ đó và phản ứng ngay lập tức, không cần ai gõ lệnh. Đây là cách "trợ lý biết chuyện" mà không cần bạn báo tay.\n\nMÔ PHỎNG CỦA DHCB KHÔNG CÓ webhook thật — lý do giống hệt lý do cron không tự chạy theo giờ (bài trước): không gọi mạng thật, không nhận yêu cầu từ Internet, để một bài học luôn chấm được TẤT ĐỊNH. Đừng đi tìm lệnh `openclaw webhook` trong mô phỏng — nó không tồn tại.\n\nThay vào đó, hai công cụ ĐÃ HỌC chính là mô hình thu nhỏ của ý tưởng "trigger" (cò súng kích hoạt):\n- CRON (bài trước) — trigger theo LỊCH: "cứ tới giờ này thì làm việc kia" (mô phỏng: kích tay bằng cron run).\n- CHANNEL TEST (chương C2) — trigger theo TIN NHẮN ĐẾN: "cứ có ai nhắn thì gateway phản ứng" (mô phỏng: giả một tin nhắn đến).\n\nWebhook chỉ là THÊM MỘT LOẠI trigger nữa — "cứ có sự kiện web này thì làm việc kia" — cùng họ với hai cái trên, chỉ khác nguồn kích hoạt là mạng ngoài thay vì đồng hồ hay tin nhắn.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw channel add telegram
openclaw channel reconnect telegram
openclaw channel allow telegram sep_a
openclaw cron add "8h sang" "chao buoi sang"
openclaw cron run c1
openclaw channel test telegram sep_a`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw cron run c1`,
      question:
        'Muốn trợ lý phản ứng NGAY khi có đơn hàng mới trên một website bán hàng (không phải theo lịch, không phải tin nhắn) — mô phỏng của DHCB có lệnh nào làm việc này không?',
      choices: [
        'Khong co — mo phong khong goi mang that, khong mo phong duoc webhook',
        'Co, dung openclaw webhook add',
        'Co, dung openclaw cron voi lich "ngay lap tuc"',
        'Co, dung openclaw channel add webhook',
      ],
      answerIndex: 0,
      explain:
        'Mô phỏng chỉ có hai loại trigger: theo lịch (cron, kích tay) và theo tin nhắn (channel test, giả lập). Webhook cần gọi mạng thật nên nằm ngoài phạm vi mô phỏng — OpenClaw thật mới làm được việc này.',
    },
    parsons: {
      prompt:
        'Xếp một vòng ôn hai loại trigger đã học: trigger theo lịch (tạo + kích tay) rồi trigger theo tin nhắn (giả sự kiện đến).',
      lines: [
        'openclaw cron add "8h sang" "chao buoi sang"',
        'openclaw cron run c1',
        'openclaw channel test telegram sep_a',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy, kênh telegram đã nối và đã mở cửa cho "sep_a". Ôn lại hai loại trigger mô phỏng có thật, thay cho webhook mạng thật:\n\n1. Tạo việc định kỳ "chao buoi sang" (trigger theo LỊCH).\n2. Kích tay chạy việc đó.\n3. Giả một tin nhắn đến từ "sep_a" (trigger theo TIN NHẮN).',
      starterCode: `# 1. tao viec dinh ky\n\n# 2. kich tay chay\n\n# 3. gia tin nhan den\n`,
      testCases: [
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel allow telegram sep_a',
          ],
          expected: 'Da tao viec c1: "chao buoi sang"',
          match: 'contains',
          hidden: false,
          label: 'Trigger theo lịch đã tạo',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel allow telegram sep_a',
          ],
          expected: 'Da chay viec c1 (kich tay): "chao buoi sang" — xong.',
          match: 'contains',
          hidden: false,
          label: 'Trigger theo lịch đã kích hoạt tay',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel allow telegram sep_a',
          ],
          expected: '"sep_a" nhan tin -> DUOC NHAN',
          match: 'contains',
          hidden: false,
          label: 'Trigger theo tin nhắn đã kích hoạt (mô phỏng sự kiện đến)',
        },
      ],
      hints: [
        'Trigger theo lịch dùng đúng bộ lệnh cron của bài trước: cron add rồi cron run.',
        'Trigger theo tin nhắn dùng lệnh của chương C2: channel test <kênh> <ai>.',
        'Ba lệnh: openclaw cron add "8h sang" "chao buoi sang" → openclaw cron run c1 → openclaw channel test telegram sep_a.',
      ],
      sampleSolution: `openclaw cron add "8h sang" "chao buoi sang"
openclaw cron run c1
openclaw channel test telegram sep_a`,
    },
    homework:
      'Làm thật (không chấm): đọc tài liệu OpenClaw về webhook thật (docs.openclaw.ai, mục automation/webhooks). Checklist: ① tìm một dịch vụ bạn dùng có hỗ trợ gửi webhook không (nhiều dịch vụ thương mại điện tử, GitHub, form khảo sát đều có); ② ghi ra một tình huống ở chỗ bạn mà "phản ứng ngay khi có sự kiện" hữu ích hơn "kiểm tra định kỳ theo lịch" (gợi ý: việc càng khẩn thì webhook càng đáng, việc không gấp thì cron đủ); ③ so hai chi phí: một webhook cần dịch vụ ngoài GỌI ĐƯỢC vào máy bạn (cần địa chỉ public, bảo mật riêng) — cron thì không cần gì thêm.',
    srsCards: [
      {
        hoi: 'Webhook là gì, khác cron ở điểm cốt lõi nào?',
        dap: 'Địa chỉ web mà dịch vụ NGOÀI tự động gọi tới khi có sự kiện, phản ứng NGAY. Cron phản ứng theo LỊCH (thời gian); webhook phản ứng theo SỰ KIỆN (mạng ngoài báo).',
      },
      {
        hoi: 'Vì sao mô phỏng OpenClaw của DHCB không có lệnh webhook?',
        dap: 'Webhook cần gọi mạng thật — mô phỏng không gọi mạng để giữ bài học TẤT ĐỊNH và chấm được tự động, giống lý do cron không tự chạy theo giờ.',
      },
      {
        hoi: 'Hai công cụ mô phỏng nào đóng vai "trigger" thay cho webhook trong bài học?',
        dap: 'cron run <id> (trigger theo lịch, kích tay) và channel test <kênh> <ai> (trigger theo tin nhắn đến, giả lập).',
      },
    ],
  },
  {
    id: 'openclaw-u3-l5',
    unitId: 'openclaw-u3',
    language: 'openclaw',
    title: 'Model tự host — khi cả "suy nghĩ" cũng không rời máy',
    hook: 'Tự host trợ lý mà vẫn phải gửi mọi câu chat lên một hãng AI ngoài — vậy dữ liệu vẫn rời nhà một nửa. Bước cuối cùng để "tự chủ hạ tầng" trọn vẹn: chạy CHÍNH MODEL AI cũng ngay trên máy bạn.',
    theory:
      'Ngoài đời, OpenClaw nối được với MODEL TỰ HOST — một chương trình chạy model AI ngay trên máy bạn (llama.cpp, Ollama, hoặc máy chủ nội bộ công ty), mở ra một ĐỊA CHỈ kiểu OpenAI (cùng khuôn API mà rất nhiều công cụ AI hiểu được) để OpenClaw nối vào y như nối một hãng AI ngoài — chỉ khác địa chỉ đó nằm trên máy bạn, không phải trên Internet. Lợi ích: KHÔNG một chữ nào trong cuộc chat rời khỏi máy, kể cả phần gửi cho model suy nghĩ; đánh đổi: máy bạn phải đủ mạnh, và model tự host thường không mạnh bằng model lớn nhất của các hãng.\n\nMô phỏng của DHCB KHÔNG có model tự host RIÊNG BIỆT — 3 model tên trung tính đã học ở chương C1 (gon-nhe/can-bang/suy-luan-sau) đại diện chung cho MỌI lớp model, kể cả tự host, để nội dung khoá không mục theo tên phần mềm tự host cụ thể (thị trường công cụ này đổi rất nhanh). Tinh thần chọn dùng vẫn y hệt bài C1: việc vặt hằng ngày (câu hỏi ngắn, không nhạy cảm) hợp với model nhẹ — đúng bản chất "tự host cho việc thường ngày, nhẹ tay tiền bạc lẫn tài nguyên máy".\n\nDấu hiệu nên cân nhắc model tự host thật: dữ liệu công ty tuyệt đối không được rời máy (hợp đồng, thông tin khách hàng), hoặc chi phí gọi model ngoài đã vượt ngân sách một cách rõ rệt.',
    workedExample: {
      code: `openclaw onboard
openclaw models
openclaw models use gon-nhe
openclaw models`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw models use gon-nhe`,
      question:
        'Việc "hỏi giờ mở cửa văn phòng" — câu hỏi ngắn, không nhạy cảm, lặp lại nhiều lần trong ngày — hợp dùng model nào theo tinh thần bài học?',
      choices: [
        'gon-nhe — viec vat, khong can suy nghi sau',
        'suy-luan-sau — luon dung model dat nhat cho chac an toan',
        'can-bang — luon giu mac dinh du viec gi',
        'Khong model nao xu ly duoc cau hoi don gian',
      ],
      answerIndex: 0,
      explain:
        'Tinh thần "tự host cho việc thường ngày" nghĩa là việc vặt không cần bộ não đắt nhất — dùng model nhẹ, tiết kiệm cả tiền lẫn tài nguyên, y hệt quy tắc chọn model ở chương C1.',
    },
    parsons: {
      prompt:
        'Xếp buổi đổi bộ não có kiểm chứng: xem đang dùng gì → đổi sang model nhẹ cho việc vặt → xem lại cho chắc.',
      lines: ['openclaw models', 'openclaw models use gon-nhe', 'openclaw models'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard. Bạn dựng một trợ lý chỉ để trả lời câu hỏi thường ngày trong nhóm (giờ làm việc, địa chỉ văn phòng…) — không cần bộ não đắt tiền, tinh thần giống chọn model tự host cho việc nhẹ:\n\n1. Xem danh sách model hiện có.\n2. Chuyển sang model nhẹ nhất: gon-nhe.\n3. Xem lại — dấu * phải ở gon-nhe.',
      starterCode: `# 1. xem danh sach\n\n# 2. chuyen sang model nhe\n\n# 3. xem lai\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard'],
          expected: 'Da chuyen model chinh: gon-nhe',
          match: 'contains',
          hidden: false,
          label: 'Đã chuyển sang model nhẹ gon-nhe',
        },
        {
          stdinLines: ['openclaw onboard'],
          expected: '* gon-nhe',
          match: 'contains',
          hidden: false,
          label: 'Danh sách xác nhận dấu * ở gon-nhe',
        },
      ],
      hints: [
        'Xem danh sách không tham số: openclaw models.',
        'Đổi model dùng chữ use: openclaw models use <tên>.',
        'Ba lệnh: openclaw models → openclaw models use gon-nhe → openclaw models.',
      ],
      sampleSolution: `openclaw models
openclaw models use gon-nhe
openclaw models`,
    },
    homework:
      'Làm thật (không chấm): tìm hiểu MỘT công cụ chạy model tự host (Ollama là dễ bắt đầu nhất) — đọc trang chủ, xem yêu cầu phần cứng tối thiểu. Checklist: ① máy bạn có đủ RAM/ổ đĩa cho model nhỏ nhất họ gợi ý không; ② tìm trong tài liệu OpenClaw cách trỏ tới một địa chỉ model kiểu OpenAI tự host; ③ ghi ra: với công việc/dữ liệu của BẠN, có lý do bắt buộc nào phải dùng model tự host không, hay model hãng ngoài đã đủ? (không có câu trả lời sai — đây là quyết định thực tế, không phải bài kiểm tra).',
    srsCards: [
      {
        hoi: 'Model tự host là gì, khác model của hãng ngoài (đám mây) ở điểm nào?',
        dap: 'Chương trình chạy model AI ngay trên máy bạn, mở địa chỉ kiểu OpenAI để OpenClaw nối vào — KHÔNG một chữ nào trong chat rời máy, kể cả phần gửi cho model suy nghĩ.',
      },
      {
        hoi: 'Vì sao mô phỏng không có model tự host riêng biệt?',
        dap: '3 model tên trung tính (gon-nhe/can-bang/suy-luan-sau) đại diện chung cho mọi lớp model kể cả tự host — để nội dung không mục theo tên phần mềm tự host cụ thể (đổi rất nhanh).',
      },
      {
        hoi: 'Hai dấu hiệu nên cân nhắc model tự host thật?',
        dap: 'Dữ liệu tuyệt đối không được rời máy (hợp đồng, thông tin khách hàng), hoặc chi phí gọi model ngoài đã vượt ngân sách rõ rệt.',
      },
    ],
  },
]

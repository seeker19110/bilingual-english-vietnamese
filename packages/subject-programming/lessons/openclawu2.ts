// lessons/openclawu2.ts — Chương C2 "Nối kênh & khoá cửa" của khoá "OpenClaw — dựng trợ lý AI
// của riêng bạn" (PR 3/3 khoá OpenClaw — docs/specs/2026-08-31-khoa-openclaw.md).
//
// unitId 'openclaw-u2' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế openclaw-u1.
//
// Năm bài bám sát đề cương §② với HAI điều chỉnh (openclawSim.ts đọc kỹ trước khi soạn):
//   - Bài 2 gộp iMessage/Signal vào LÝ THUYẾT (chỉ nhắc tên, không có bài riêng) — sim chỉ mô
//     phỏng 3 kênh telegram/whatsapp/discord (đặc tả §②, KENH_HOP_LE trong openclawSim.ts).
//   - Bài 4 vốn đề "groupPolicy" nhưng sim KHÔNG có lệnh groupPolicy riêng — chỉ có dmPolicy
//     (cấp DUY NHẤT: chan-nguoi-la/mo, gắn ở mức kênh). Đổi đề thành "hàng rào toàn diện qua
//     openclaw doctor + channel test", vẫn đúng chủ đề "kiểm hàng rào trước khi mở cửa cho
//     nhóm/đông người", chỉ đổi LỆNH thể hiện cho khớp sim thật.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const OPENCLAW_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'openclaw-u2-l1',
    unitId: 'openclaw-u2',
    language: 'openclaw',
    title: 'Nối Telegram — token giữ như mật khẩu',
    hook: 'Chương C1 bạn đã chat được với trợ lý ngay trong terminal. Nhưng terminal không ở trong túi bạn cả ngày — Telegram thì có. Bài này mở cửa đầu tiên ra thế giới thật: trợ lý của bạn nghe được tin nhắn Telegram gửi tới.',
    theory:
      'Nối một kênh nhắn tin gồm hai việc tách bạch: XIN GIẤY PHÉP (ngoài OpenClaw) và ĐĂNG KÝ (trong OpenClaw).\n\nVới Telegram, giấy phép là TOKEN lấy từ BotFather (một bot có sẵn của Telegram, nhắn "/newbot" là nó dắt tay làm hết). Token đó chính là chìa khoá vào bot của bạn — AI CÓ TOKEN LÀ ĐIỀU KHIỂN ĐƯỢC BOT, nên giữ nó y như mật khẩu: không dán vào chat, không commit lên GitHub, không chụp màn hình public.\n\nBa lệnh cho một kênh:\n    openclaw channel add <kenh>         — đăng ký kênh, trạng thái ban đầu LUÔN là cho-token\n    (dán token vào ~/.openclaw/openclaw.json — việc làm tay, không phải lệnh)\n    openclaw channel reconnect <kenh>   — nối lại sau khi đã có token, cần GATEWAY ĐANG CHẠY\n\nLuật sư phạm đầu tiên của cả chương: kênh mới thêm LUÔN sinh ra ở trạng thái an toàn nhất — dmPolicy chặn người lạ, allowFrom rỗng. Nối xong KHÔNG có nghĩa là ai nhắn cũng được trả lời; bài sau học cách mở cửa đúng người.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw channel add telegram
openclaw channel reconnect telegram
openclaw channel status telegram`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw channel reconnect telegram`,
      question:
        'Máy trắng tinh — CHƯA hề onboard — gõ thẳng lệnh nối lại kênh telegram, chuyện gì xảy ra?',
      choices: [
        'Bao loi: chua cai dat/onboard, chay openclaw onboard truoc',
        'Tu dong onboard ngam roi noi kenh',
        'Noi thanh cong voi cau hinh mac dinh',
        'Bao loi thieu token nhung van tao kenh',
      ],
      answerIndex: 0,
      explain:
        'Mọi lệnh của OpenClaw (trừ onboard) đều cần workspace đã dựng — chưa onboard thì chưa có nơi lưu kênh, lưu token. Lỗi chỉ đúng lệnh kế tiếp thay vì lặng lẽ tự làm hộ.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự nối kênh Telegram lần đầu: dựng nhà → bật control plane → đăng ký kênh → nối sau khi đã có token.',
      lines: [
        'openclaw onboard',
        'openclaw gateway start',
        'openclaw channel add telegram',
        'openclaw channel reconnect telegram',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy. Bạn vừa lấy được token bot Telegram từ BotFather (đã dán vào config — việc làm tay, không cần gõ lại ở đây). Nối kênh:\n\n1. Đăng ký kênh telegram.\n2. Nối lại kênh (token coi như đã dán).',
      starterCode: `# 1. dang ky kenh telegram\n\n# 2. noi lai sau khi da co token\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard', 'openclaw gateway start'],
          expected: 'Da them kenh telegram — trang thai: cho-token',
          match: 'contains',
          hidden: false,
          label: 'Kênh telegram đã đăng ký, trạng thái cho-token',
        },
        {
          stdinLines: ['openclaw onboard', 'openclaw gateway start'],
          expected: 'Kenh telegram da noi thanh cong',
          match: 'contains',
          hidden: false,
          label: 'Nối lại kênh sau khi có token thành công',
        },
      ],
      hints: [
        'Đăng ký kênh trước khi nối — cú pháp: openclaw channel add <kênh>.',
        'Nối lại dùng lệnh reconnect, không phải add lần hai.',
        'Hai lệnh: openclaw channel add telegram → openclaw channel reconnect telegram.',
      ],
      sampleSolution: `openclaw channel add telegram
openclaw channel reconnect telegram`,
    },
    homework:
      'Làm thật (không chấm): mở Telegram, nhắn @BotFather, gõ /newbot, đặt tên bot theo hướng dẫn. Checklist tự kiểm: ① đã lấy được token (một chuỗi dài dạng số:chữ); ② token đã dán vào ~/.openclaw/openclaw.json chứ KHÔNG dán vào bất kỳ đoạn chat/tin nhắn nào; ③ nếu đã cài OpenClaw thật, chạy openclaw channel add telegram rồi openclaw channel reconnect telegram, đối chiếu output với bài; ④ tự hỏi: nếu token này lộ ra ngoài, ai đó có thể làm gì với bot của bạn? (gợi ý: đọc mọi tin nhắn, giả danh bot trả lời).',
    srsCards: [
      {
        hoi: 'Nối một kênh nhắn tin gồm hai việc tách bạch nào?',
        dap: 'Xin giấy phép NGOÀI OpenClaw (vd token BotFather cho Telegram) và đăng ký + kết nối TRONG OpenClaw (channel add rồi reconnect).',
      },
      {
        hoi: 'Vì sao token bot Telegram phải giữ như mật khẩu?',
        dap: 'Ai có token là điều khiển được bot — đọc tin, giả danh trả lời. Không dán vào chat, không commit lên Git, không chụp màn hình public.',
      },
      {
        hoi: 'Kênh vừa `channel add` xong có trả lời được tin nhắn ngay không?',
        dap: 'KHÔNG — trạng thái ban đầu luôn cho-token (chưa nối) và sau khi nối vẫn chặn người lạ mặc định (dmPolicy chan-nguoi-la, allowFrom rỗng).',
      },
    ],
  },
  {
    id: 'openclaw-u2-l2',
    unitId: 'openclaw-u2',
    language: 'openclaw',
    title: 'WhatsApp/Discord — một Gateway nhiều kênh',
    hook: 'Phòng bạn có người dùng Telegram, người dùng Discord để họp, khách hàng thì nhắn WhatsApp. Không cần ba trợ lý riêng cho ba kênh — MỘT Gateway cắm được nhiều kênh cùng lúc, mỗi kênh một cửa vào cùng một bộ não.',
    theory:
      'Cú pháp nối kênh GIỐNG HỆT nhau bất kể kênh nào — đó chính là điểm hay của kiến trúc Gateway (bài C1): mọi kênh đều là CỬA đi qua cùng một control plane.\n    openclaw channel add whatsapp\n    openclaw channel add discord\n    openclaw channel list          — xem tất cả kênh đã đăng ký, mỗi kênh một trạng thái riêng\n\nMỗi kênh có allowFrom và dmPolicy RIÊNG của nó — mở cửa Telegram không tự mở cửa Discord. Đây là điều nên nhớ khi vận hành nhiều kênh: kiểm từng kênh, đừng giả định "đã an toàn ở kênh này thì kênh kia cũng vậy".\n\nNgoài ba kênh trên, thế giới thật còn iMessage và Signal — OpenClaw có hỗ trợ, nhưng khoá này KHÔNG có bài riêng cho hai kênh đó (chỉ nhắc tên ở đây): cách nối về nguyên lý giống hệt add → cấp quyền hệ điều hành/thiết bị → reconnect, không có gì mới để dạy thêm ngoài phần cài đặt đặc thù hệ điều hành nằm ngoài phạm vi mô phỏng.\n\nMẹo vận hành nhiều kênh: kênh nào ít dùng thì đừng vội add — mỗi kênh thêm là một cửa phải khoá đúng, thêm mà bỏ quên khoá còn nguy hiểm hơn không thêm.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw channel add whatsapp
openclaw channel add discord
openclaw channel list`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw channel add imessage`,
      question:
        'Gõ thêm kênh "imessage" — kênh không nằm trong bộ kênh của mô phỏng — chuyện gì xảy ra?',
      choices: [
        'Bao loi va ke ra danh sach kenh ho tro (telegram, whatsapp, discord)',
        'Tu dong tao kenh imessage voi cau hinh trong',
        'Coi imessage nhu bi danh khac cua telegram',
        'Them thanh cong nhung khong bao gio noi duoc',
      ],
      answerIndex: 0,
      explain:
        'Danh sách kênh hỗ trợ là đóng — máy không đoán ý mà báo đúng tên các kênh đang có để bạn chọn lại. Đây là mô phỏng, không phải giới hạn thật của OpenClaw ngoài đời (ngoài đời có thêm iMessage/Signal).',
    },
    parsons: {
      prompt:
        'Xếp buổi nối đa kênh: bật control plane → thêm kênh 1 → thêm kênh 2 → xem tổng quan.',
      lines: [
        'openclaw gateway start',
        'openclaw channel add whatsapp',
        'openclaw channel add discord',
        'openclaw channel list',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy, đã có sẵn kênh telegram. Phòng bạn vừa quyết định thêm kênh họp qua Discord và hỗ trợ khách qua WhatsApp:\n\n1. Đăng ký kênh discord.\n2. Đăng ký kênh whatsapp.\n3. Xem danh sách — phải thấy đủ 3 kênh (telegram có sẵn + 2 kênh vừa thêm).',
      starterCode: `# 1. dang ky discord\n\n# 2. dang ky whatsapp\n\n# 3. xem danh sach\n`,
      testCases: [
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
          ],
          expected: 'Da them kenh discord — trang thai: cho-token',
          match: 'contains',
          hidden: false,
          label: 'Kênh discord đã đăng ký',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
          ],
          expected: 'Da them kenh whatsapp — trang thai: cho-token',
          match: 'contains',
          hidden: false,
          label: 'Kênh whatsapp đã đăng ký',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
          ],
          expected: 'telegram [cho-token]',
          match: 'contains',
          hidden: false,
          label: 'Danh sách vẫn còn kênh telegram cũ',
        },
      ],
      hints: [
        'Cú pháp thêm kênh giống hệt bài trước, chỉ đổi tên kênh: openclaw channel add <kênh>.',
        'Ba lệnh, mỗi lệnh một dòng, add xong hai kênh mới rồi mới xem danh sách.',
        'openclaw channel add discord → openclaw channel add whatsapp → openclaw channel list.',
      ],
      sampleSolution: `openclaw channel add discord
openclaw channel add whatsapp
openclaw channel list`,
    },
    homework:
      'Làm thật (không chấm): chọn MỘT kênh thứ hai phù hợp với bạn (WhatsApp Business API hoặc Discord bot) và đọc phần tài liệu OpenClaw tương ứng. Checklist: ① kênh đó cần loại "giấy phép" gì (token, API key, hay OAuth)? ② nếu đã cài OpenClaw thật, chạy openclaw channel list và đối chiếu số kênh với thực tế bạn đã nối; ③ ghi ra: nếu bạn KHÔNG bao giờ dùng iMessage/Signal, có nên nối chúng "phòng khi cần" không? Vì sao (gợi ý: mỗi kênh thêm là một cửa phải khoá đúng).',
    srsCards: [
      {
        hoi: 'Vì sao nối nhiều kênh (Telegram, WhatsApp, Discord) không cần nhiều trợ lý riêng?',
        dap: 'Mọi kênh đều là CỬA đi qua cùng một Gateway (control plane) — cú pháp nối giống hệt nhau: openclaw channel add <kênh>.',
      },
      {
        hoi: 'Mở cửa (allowFrom) cho Telegram có tự mở cửa cho Discord không?',
        dap: 'KHÔNG — mỗi kênh có allowFrom và dmPolicy RIÊNG. Phải kiểm và mở từng kênh, không giả định kênh này an toàn thì kênh kia cũng vậy.',
      },
      {
        hoi: 'Vì sao khoá này không có bài riêng cho iMessage/Signal dù OpenClaw hỗ trợ?',
        dap: 'Nguyên lý nối giống hệt (add → cấp quyền → reconnect); phần khác biệt chỉ là cài đặt đặc thù hệ điều hành, ngoài phạm vi mô phỏng.',
      },
    ],
  },
  {
    id: 'openclaw-u2-l3',
    unitId: 'openclaw-u2',
    language: 'openclaw',
    title: 'allowFrom & dmPolicy — mặc định chặn người lạ',
    hook: 'Kênh đã nối không có nghĩa là ai nhắn cũng được trả lời — đúng ngược lại: mặc định KHÔNG AI được trả lời cho tới khi bạn tự tay mở từng người. Bài này học cách mở đúng cửa, đúng người — và cách kiểm tra hàng rào có thật sự đứng vững.',
    theory:
      'Mỗi kênh có hai thuộc tính an toàn:\n- dmPolicy — "chan-nguoi-la" (mặc định) hoặc "mo".\n- allowFrom — danh sách CHÍNH XÁC những ai được nhận tin, rỗng khi kênh mới thêm.\n\nMở cửa cho một người:\n    openclaw channel allow <kenh> <ai>\n\nQuyền hẹp nhất đủ dùng: chỉ mở đúng người cần, không mở "cho chắc". Mở nhầm một tài khoản lạ nghĩa là ai đó ngoài kia điều khiển được một phần trợ lý của bạn.\n\nKiểm tra hàng rào có hoạt động thật hay không — mô phỏng có lệnh riêng để "giả một tin nhắn đến" (KHÔNG có ngoài đời, chỉ để học và tự kiểm trong bài):\n    openclaw channel test <kenh> <ai>\n\nNgười lạ (chưa có trong allowFrom) sẽ bị chặn kèm giải thích rõ ràng — agent không đọc, không trả lời. Người đã mở thì tin được nhận, agent trả lời bình thường. Thói quen của người vận hành cẩn thận: mở xong MỘT người, test lại NGAY bằng đúng tên đó và một tên chưa mở, để chắc hàng rào đúng như mình nghĩ — đừng tin bằng mắt, tin bằng kết quả.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw channel add telegram
openclaw channel reconnect telegram
openclaw channel allow telegram sep_a
openclaw channel test telegram sep_a
openclaw channel test telegram nguoi_la`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw channel test telegram nguoi_la`,
      question:
        'Kênh đã nối, allowFrom còn RỖNG — giả tin nhắn từ "nguoi_la" đến, chuyện gì xảy ra?',
      choices: [
        'Bi chan: khong nam trong allowFrom, agent khong doc khong tra loi',
        'Duoc nhan vi day la lan dau agent thay nguoi nay',
        'Bao loi he thong vi allowFrom rong',
        'Tu dong them nguoi do vao allowFrom',
      ],
      answerIndex: 0,
      explain:
        'allowFrom rỗng + dmPolicy chan-nguoi-la (mặc định của kênh mới) nghĩa là KHÔNG AI lọt qua cho tới khi được mở tay — đây là luật sư phạm số 1 của chương: an toàn mặc định, không phải an toàn "nếu bạn nhớ cấu hình".',
    },
    parsons: {
      prompt:
        'Xếp quy trình mở cửa có kiểm chứng: nối kênh → mở đúng một người → test đúng người đó → test một người lạ để chắc vẫn chặn.',
      lines: [
        'openclaw channel reconnect telegram',
        'openclaw channel allow telegram sep_a',
        'openclaw channel test telegram sep_a',
        'openclaw channel test telegram nguoi_la',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy, kênh telegram đã nối (allowFrom còn rỗng). Sếp của bạn (tài khoản "sep_a") cần trợ lý trả lời tin nhắn Telegram của mình:\n\n1. Mở cửa cho "sep_a" trên kênh telegram.\n2. Kiểm tra bằng cách giả tin từ "sep_a" — phải ĐƯỢC NHẬN.\n3. Kiểm tra thêm bằng tin từ "nguoi_la" — phải vẫn BỊ CHẶN (chưa mở cho ai khác).',
      starterCode: `# 1. mo cua cho sep_a\n\n# 2. test dung nguoi da mo\n\n# 3. test nguoi chua mo\n`,
      testCases: [
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
          ],
          expected: 'Da mo cua cho "sep_a" tren kenh telegram',
          match: 'contains',
          hidden: false,
          label: 'Đã mở cửa cho sep_a',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
          ],
          expected: '"sep_a" nhan tin -> DUOC NHAN',
          match: 'contains',
          hidden: false,
          label: 'sep_a nhận được tin (đã mở cửa)',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
          ],
          expected: '"nguoi_la" nhan tin -> BI CHAN',
          match: 'contains',
          hidden: false,
          label: 'nguoi_la vẫn bị chặn (chưa mở cửa)',
        },
      ],
      hints: [
        'Mở cửa dùng: openclaw channel allow <kênh> <ai>.',
        'Test dùng: openclaw channel test <kênh> <ai> — thử với hai người khác nhau.',
        'Ba lệnh: allow sep_a → test sep_a → test nguoi_la (thứ tự đúng như đề).',
      ],
      sampleSolution: `openclaw channel allow telegram sep_a
openclaw channel test telegram sep_a
openclaw channel test telegram nguoi_la`,
    },
    homework:
      'Làm thật (không chấm): nếu đã nối kênh Telegram thật, lập danh sách CHÍNH XÁC những ai cần trợ lý trả lời (tên/username Telegram thật) và mở đúng từng người bằng openclaw channel allow. Checklist: ① liệt kê tối đa 3–5 người thật sự cần; ② với mỗi người, tự hỏi "nếu tài khoản này bị chiếm, thiệt hại lớn cỡ nào?" trước khi mở; ③ chạy openclaw channel status telegram xác nhận allowFrom đúng như danh sách; ④ không bao giờ đặt dmPolicy thành "mo" trên kênh thật trừ khi bạn hiểu rõ hậu quả (ai nhắn cũng được trả lời).',
    srsCards: [
      {
        hoi: 'Kênh mới nối, allowFrom rỗng — ai nhắn tin thì được trả lời?',
        dap: 'KHÔNG AI — dmPolicy mặc định chan-nguoi-la + allowFrom rỗng nghĩa là mọi người đều bị chặn cho tới khi được mở tay.',
      },
      {
        hoi: 'Lệnh mở cửa cho một người trên một kênh?',
        dap: 'openclaw channel allow <kênh> <ai> — quyền hẹp nhất đủ dùng, chỉ mở đúng người cần.',
      },
      {
        hoi: 'Vì sao nên `channel test` cả người ĐÃ mở lẫn người CHƯA mở sau khi cấu hình?',
        dap: 'Đừng tin bằng mắt, tin bằng kết quả — test người đã mở để chắc mở đúng, test người lạ để chắc hàng rào vẫn đứng vững, không mở nhầm diện rộng.',
      },
    ],
  },
  {
    id: 'openclaw-u2-l4',
    unitId: 'openclaw-u2',
    language: 'openclaw',
    title: 'Hàng rào toàn diện — doctor trước khi mở rộng cửa',
    hook: 'Bạn đã biết mở cửa cho từng người. Nhưng trước khi mời cả một nhóm đông vào chat với trợ lý — buổi họp phòng, nhóm khách hàng — có một thói quen bắt buộc: KHÁM TOÀN BỘ hàng rào một lượt, đừng kiểm từng viên gạch rồi quên viên còn lại.',
    theory:
      'Mô phỏng OpenClaw của DHCB KHÔNG có lệnh "groupPolicy" riêng — hàng rào của một kênh chỉ có HAI lớp: dmPolicy + allowFrom (bài trước), áp dụng CHUNG cho mọi người nhắn tới kênh đó, kể cả trong nhóm chat. Vì vậy "mở cửa cho một nhóm đông" không phải một lệnh mới — nó là VIỆC RÀ SOÁT: trước khi thêm nhiều người cùng lúc, khám lại toàn bộ hàng rào bằng công cụ đã học ở chương C1.\n\n    openclaw doctor    — khám sức khoẻ TOÀN HỆ THỐNG, trong đó có mục kênh nào đang treo (cho-token — thêm rồi mà chưa nối)\n\nDoctor không đọc được allowFrom chi tiết (đó là việc của channel status/list), nhưng nó bắt đúng loại lỗi nguy hiểm nhất khi mở rộng nhóm: kênh TƯỞNG đã sẵn sàng nhưng thực ra còn treo cho-token — mời cả nhóm vào một kênh chưa thật sự nối là mời vào phòng chưa xây xong.\n\nQuy trình trước khi mở rộng cho nhóm đông:\n1. `openclaw doctor` — chắc mọi kênh liên quan đã [OK], không còn treo cho-token.\n2. `openclaw channel list` — soát lại TỪNG kênh: dmPolicy và allowFrom có đúng ý định không.\n3. Chỉ khi cả hai bước trên sạch mới mở thêm người bằng channel allow.',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw channel add telegram
openclaw channel add discord
openclaw channel reconnect telegram
openclaw doctor
openclaw channel list`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw doctor`,
      question:
        'Máy đã thêm kênh discord nhưng CHƯA reconnect (còn treo cho-token) — dòng kênh trong doctor in gì?',
      choices: [
        '[CHU Y] ... kenh cho-token: discord — dan token roi chay openclaw channel reconnect',
        '[OK] tat ca kenh da san sang',
        '[LOI] kenh discord bi hong, phai xoa',
        'Khong nhac gi den kenh discord',
      ],
      answerIndex: 0,
      explain:
        'Doctor liệt kê ĐÚNG TÊN từng kênh còn treo cho-token kèm lệnh sửa — đây chính là "hàng rào toàn diện" của bài này: một lệnh soát hết mọi kênh, không phải kiểm tay từng kênh rồi bỏ sót.',
    },
    parsons: {
      prompt:
        'Xếp quy trình soát hàng rào trước khi mở rộng cho nhóm đông: khám tổng thể → soát từng kênh chi tiết → mới mở thêm người.',
      lines: [
        'openclaw doctor',
        'openclaw channel list',
        'openclaw channel allow telegram truong_phong',
      ],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy, kênh telegram đã nối và discord đã thêm nhưng CHƯA reconnect (còn treo cho-token). Ngày mai có buổi họp nhóm qua Discord — nghiệm thu hàng rào trước khi mời cả nhóm:\n\n1. Khám tổng thể bằng doctor — phải thấy nhắc đúng kênh discord còn treo.\n2. Xem danh sách kênh chi tiết — xác nhận discord vẫn ở trạng thái cho-token.',
      starterCode: `# 1. kham tong the\n\n# 2. soat tung kenh\n`,
      testCases: [
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel add discord',
          ],
          expected: 'kenh cho-token: discord',
          match: 'contains',
          hidden: false,
          label: 'Doctor nhắc đúng kênh discord còn treo cho-token',
        },
        {
          stdinLines: [
            'openclaw onboard',
            'openclaw gateway start',
            'openclaw channel add telegram',
            'openclaw channel reconnect telegram',
            'openclaw channel add discord',
          ],
          expected: 'discord [cho-token]',
          match: 'contains',
          hidden: false,
          label: 'Danh sách kênh xác nhận discord chưa nối',
        },
      ],
      hints: [
        'Khám tổng thể là lệnh đã học ở chương C1: openclaw doctor.',
        'Soát chi tiết từng kênh: openclaw channel list.',
        'Hai lệnh, đúng thứ tự đề bài: doctor → channel list.',
      ],
      sampleSolution: `openclaw doctor
openclaw channel list`,
    },
    homework:
      'Làm thật (không chấm): trước lần mời một NHÓM (không phải một người) vào chat với trợ lý thật, chạy openclaw doctor rồi openclaw channel status <kênh> cho đúng kênh đó. Checklist: ① không còn dòng [CHU Y] nào về kênh liên quan; ② allowFrom đã liệt kê đủ và ĐÚNG những ai trong nhóm cần được trả lời (không có tên thừa); ③ nếu nhóm sẽ giải tán sau sự kiện, ghi lại lịch để openclaw channel remove hoặc dọn allowFrom sau đó — đừng để cửa mở mãi cho một nhóm đã hết việc.',
    srsCards: [
      {
        hoi: 'OpenClaw có lệnh "groupPolicy" riêng cho nhóm chat không?',
        dap: 'Mô phỏng KHÔNG có — hàng rào chỉ có dmPolicy + allowFrom ở mức KÊNH, áp dụng chung cho cả tin riêng lẫn tin trong nhóm.',
      },
      {
        hoi: 'Trước khi mời một nhóm đông vào chat với trợ lý, quy trình soát hàng rào là gì?',
        dap: 'openclaw doctor (khám tổng thể, bắt kênh còn treo cho-token) → openclaw channel list (soát chi tiết từng kênh) → mới mở thêm người bằng channel allow.',
      },
      {
        hoi: 'Vì sao "kênh còn treo cho-token" là lỗi nguy hiểm nhất khi mở rộng cho nhóm?',
        dap: 'Mời cả nhóm vào một kênh TƯỞNG đã sẵn sàng nhưng thực ra chưa nối thật — giống mời khách vào phòng chưa xây xong.',
      },
    ],
  },
  {
    id: 'openclaw-u2-l5',
    unitId: 'openclaw-u2',
    language: 'openclaw',
    title: 'Sandbox & approvals — người duyệt trước khi agent chạm máy thật',
    hook: 'Agent nghe lời rất giỏi — giỏi tới mức nguy hiểm nếu bạn lỡ nhờ nó "xoá bớt file cũ" mà nó hiểu nhầm ý. Luật cuối cùng của chương này chặn đúng chỗ đó: mọi việc chạm vào MÁY THẬT phải qua một NGƯỜI duyệt, không có ngoại lệ.',
    theory:
      'Khi bạn chat một câu có ý HÀNH ĐỘNG trên máy thật (xoá, cài đặt, chạy lệnh, khởi động lại…), agent KHÔNG tự làm — nó xếp việc đó vào HÀNG CHỜ DUYỆT và trả một mã (id).\n\n    openclaw chat "<yeu cau co hanh dong>"    — agent xếp hàng, trả về id (vd d1)\n    duyet <id>                                  — bạn (người) đồng ý, agent mới thực hiện\n    tuchoi <id> "<ly do>"                       — bạn từ chối, PHẢI kèm lý do\n\nĐây là luật sư phạm số 2 của cả khoá: "sandbox" không phải một cái hộp cách ly kỹ thuật — nó là một QUY TRÌNH: agent luôn có quyền ĐỀ XUẤT, nhưng chỉ NGƯỜI mới có quyền BẤM NÚT thực thi khi việc đó đụng máy thật. Một luật liên quan cùng nhóm: dán chuỗi dạng mật khẩu/API key vào tin nhắn chat bị TỪ CHỐI LUÔN, không vào hàng chờ — vì lưu một secret vào lịch sử chat là rủi ro không đảo ngược được, khác với chạy nhầm một lệnh (còn sửa được).\n\nMẹo đọc yêu cầu cho agent: nếu câu bạn gõ có động từ như "xoá", "dọn sạch", "cài đặt", "tắt máy", "khởi động lại" — agent hiểu đó là việc chạm máy thật và tự xếp hàng, bạn không cần tự nhớ "việc này có cần duyệt không".',
    workedExample: {
      code: `openclaw onboard
openclaw gateway start
openclaw chat "xoa cac file tam trong thu muc downloads"
duyet d1`,
      stdinLines: [],
    },
    predict: {
      code: `openclaw chat "mat khau la matkhau123"`,
      question: 'Chat có chứa cụm dạng "mật khẩu là …" — chuyện gì xảy ra?',
      choices: [
        'Bao loi tu choi luu, nhac dat secret vao kho rieng thay vi dan vao chat',
        'Luu binh thuong vao lich su chat',
        'Xep vao hang cho duyet nhu moi hanh dong khac',
        'Tu dong xoa tin nhan sau 1 phut',
      ],
      answerIndex: 0,
      explain:
        'Secret dán vào chat bị TỪ CHỐI NGAY, không xếp hàng chờ — khác với hành động máy thật (còn có đường lùi là tuchoi). Lưu một secret vào lịch sử chat là rủi ro không đảo ngược, phải chặn từ gốc.',
    },
    parsons: {
      prompt:
        'Xếp một vòng "agent đề xuất, người quyết": bật control plane → nhờ agent làm việc chạm máy thật → agent xếp hàng → người xem xét và duyệt.',
      lines: ['openclaw gateway start', 'openclaw chat "don sach thu muc tam"', 'duyet d1'],
    },
    make: {
      prompt:
        'Bối cảnh dựng sẵn: máy đã onboard, gateway đã chạy. Bạn nhờ trợ lý dọn dẹp:\n\n1. Nhờ agent qua chat: don sach thu muc tam (agent sẽ xếp vào hàng chờ vì đây là hành động máy thật).\n2. Sau khi xem lại thấy hợp lý, duyệt đúng mã (id) vừa được cấp — d1.',
      starterCode: `# 1. nho agent don sach\n\n# 2. duyet viec do\n`,
      testCases: [
        {
          stdinLines: ['openclaw onboard', 'openclaw gateway start'],
          expected: 'da xep vao hang cho duyet, id d1',
          match: 'contains',
          hidden: false,
          label: 'Việc dọn sạch đã vào hàng chờ với id d1',
        },
        {
          stdinLines: ['openclaw onboard', 'openclaw gateway start'],
          expected: 'Da duyet d1',
          match: 'contains',
          hidden: false,
          label: 'Đã duyệt đúng mã d1',
        },
      ],
      hints: [
        'Câu chat phải có ý hành động máy thật — dùng đúng động từ như trong đề: "don sach".',
        'Agent trả về id ở output — id đầu tiên trong một phiên luôn là d1.',
        'Hai lệnh: openclaw chat "don sach thu muc tam" → duyet d1.',
      ],
      sampleSolution: `openclaw chat "don sach thu muc tam"
duyet d1`,
    },
    homework:
      'Làm thật (không chấm): nếu đã cài OpenClaw thật, thử nhờ agent một việc có ý hành động (vd "xoá file test.txt trong thư mục hiện tại" — chọn file KHÔNG quan trọng) và quan sát nó có xin duyệt trước khi làm không. Checklist: ① agent có dừng lại chờ bạn không, hay tự làm luôn? ② nếu tự làm luôn, đọc lại tài liệu approvals của OpenClaw xem cấu hình mặc định là gì (có thể cần bật thủ công); ③ ghi ra một tình huống thật ở chỗ bạn mà luật "phải qua người duyệt" từng (hoặc sẽ) cứu bạn khỏi một sai lầm.',
    srsCards: [
      {
        hoi: 'Khi chat yêu cầu agent làm việc chạm MÁY THẬT (xoá, cài đặt…) thì chuyện gì xảy ra?',
        dap: 'Agent KHÔNG tự làm — xếp vào hàng chờ duyệt (id kiểu d1), chỉ chạy sau khi NGƯỜI gõ `duyet <id>`.',
      },
      {
        hoi: 'Dán một chuỗi dạng mật khẩu/API key vào chat thì sao?',
        dap: 'Bị TỪ CHỐI NGAY, không xếp hàng chờ — vì lưu secret vào lịch sử chat là rủi ro không đảo ngược được.',
      },
      {
        hoi: '`tuchoi <id> "<lý do>"` khác `duyet <id>` chỗ nào, và có bắt buộc gì?',
        dap: 'Từ chối thực hiện việc đó — BẮT BUỘC kèm lý do trong nháy kép, để agent (và người xem lại sau) hiểu vì sao không làm.',
      },
    ],
  },
]

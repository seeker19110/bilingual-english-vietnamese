// lessons/hermesu2.ts — Chương C2 "Công cụ nâng cao" của khoá Hermes (PR 3/3 —
// docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md §② bảng chương).
//
// Năm bài bám đúng 5 mục phần II của đề cương tham chiếu: /goal & /steer · /learn ·
// LiteLLM · llama.cpp · Open WebUI. Ba bài công cụ ngoài (LiteLLM/llama.cpp/Open WebUI)
// theo luật soạn bài công cụ thật của đặc tả: khái niệm + phần mô phỏng được ở bước ①–⑥
// (trỏ model qua tiền tố provider — đúng cách LiteLLM/llama.cpp xuất hiện trong cấu hình
// Hermes thật), phần LÀM THẬT ở homework kèm checklist, không chấm.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const HERMES_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'hermes-u2-l1',
    unitId: 'hermes-u2',
    language: 'hermes',
    title: '/goal và /steer — agent bền bỉ theo mục tiêu',
    hook: 'Giao việc lẻ thì agent làm xong là quên. Nhưng "mỗi sáng tổng hợp tin ngành cho cả phòng" không phải việc lẻ — đó là MỤC TIÊU sống nhiều ngày. /goal cho agent một mục tiêu bám dài hạn, /steer cho bạn tay lái để chỉnh giữa đường.',
    theory:
      'Hai lệnh, hai vai:\n\n    /goal "<mục tiêu>"     — đặt mục tiêu DÀI HẠN, agent bền bỉ theo nó qua nhiều phiên\n    /steer "<chỉ dẫn>"     — LÁI giữa chừng: chỉnh cách làm mà KHÔNG đổi mục tiêu\n    /goal                  — xem mục tiêu đang theo\n    /goal thay "<mới>"     — thay hẳn mục tiêu (phải nói rõ chữ thay)\n\nPhân biệt quan trọng nhất: mục tiêu là ĐÍCH, steer là VÔ LĂNG. "Tổng hợp tin ngành mỗi sáng" là đích; "chỉ lấy tin tiếng Việt", "ngắn thôi, 5 gạch đầu dòng" là những cú đánh lái — đích không đổi.\n\nLuật một-mục-tiêu: đã có goal mà đặt goal mới, agent bắt bạn gõ rõ /goal thay. Vì sao khó tính vậy? Hai mục tiêu dài hạn chạy song song là công thức để agent tự mâu thuẫn — giống giao một nhân viên "ưu tiên tốc độ" và "ưu tiên rẻ nhất" cùng lúc rồi trách nó làm sai.\n\nGóc điều phối dev: goal là chỗ đặt "định hướng sprint" ("giữ cho bộ test luôn xanh"), còn steer là code review bằng lời ("từ giờ đặt tên biến tiếng Anh").',
    workedExample: {
      code: `/goal "moi sang tong hop tin nganh ban le cho ca phong"
/steer "chi lay tin tieng Viet, toi da 5 gach dau dong"
/goal`,
      stdinLines: [],
    },
    predict: {
      code: `/goal "giu bo test luon xanh"
/goal "giam chi phi API"`,
      question: 'Đặt goal thứ hai khi goal thứ nhất còn sống — agent phản ứng thế nào?',
      choices: [
        'Bao loi, doi go ro /goal thay',
        'Lang le thay goal cu',
        'Chay ca hai goal song song',
        'Tu gop hai goal lam mot',
      ],
      answerIndex: 0,
      explain:
        'Luật một-mục-tiêu: agent bắt bạn nói rõ /goal thay "…" — không lặng lẽ thay (mất đích cũ không ai hay), không chạy song song (hai đích dài hạn dễ mâu thuẫn nhau).',
    },
    parsons: {
      prompt:
        'Xếp một tuần làm việc với goal: đặt đích → lái lần một → xem lại đích → thay đích khi quý mới sang.',
      lines: [
        '/goal "tong hop tin nganh moi sang"',
        '/steer "chi lay tin tieng Viet"',
        '/goal',
        '/goal thay "tong hop bao cao quy"',
      ],
    },
    make: {
      prompt:
        'Sếp muốn cả phòng có bản tin ngành mỗi sáng, và bạn là người điều phối:\n\n1. Đặt mục tiêu: moi sang 8h tong hop tin nganh vao phien tin-tuc\n2. Sau vài hôm thấy tin tiếng Anh khó đọc — lái: chi lay tin tieng Viet\n3. Xem lại mục tiêu để chắc nó vẫn đúng đích cũ (lái không được đổi đích).',
      starterCode: `# 1. dat muc tieu\n\n# 2. lai giua chung\n\n# 3. xem lai muc tieu\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da dat muc tieu: moi sang 8h tong hop tin nganh vao phien tin-tuc',
          match: 'contains',
          hidden: false,
          label: 'Mục tiêu dài hạn đã đặt',
        },
        {
          stdinLines: [],
          expected: 'Muc tieu van giu nguyen',
          match: 'contains',
          hidden: false,
          label: 'Steer chỉnh cách làm mà không đổi đích',
        },
        {
          stdinLines: [],
          expected: 'Muc tieu dang theo: moi sang 8h tong hop tin nganh vao phien tin-tuc',
          match: 'contains',
          hidden: false,
          label: 'Xem lại: đích vẫn nguyên sau cú lái',
        },
      ],
      hints: [
        'Nội dung goal/steer đặt trong cặp nháy kép.',
        'Bước 2 dùng /steer (không phải /goal — đổi goal là đổi đích).',
        'Ba lệnh: /goal "…" → /steer "…" → /goal (không tham số).',
      ],
      sampleSolution: `/goal "moi sang 8h tong hop tin nganh vao phien tin-tuc"
/steer "chi lay tin tieng Viet"
/goal`,
    },
    homework:
      'Viết ra MỘT mục tiêu dài hạn bạn muốn giao cho agent (công việc thật của bạn), rồi liệt kê 3 cú steer bạn đoán sẽ phải đánh trong tháng đầu. Kiểm tra chéo: nếu một "cú steer" của bạn thật ra đổi cả đích — nó phải là /goal thay, và đó là dấu hiệu mục tiêu ban đầu chưa nghĩ kỹ.',
    srsCards: [
      {
        hoi: '/goal và /steer chia vai thế nào?',
        dap: '/goal đặt ĐÍCH dài hạn agent bền bỉ theo qua nhiều phiên; /steer là VÔ LĂNG — chỉnh cách làm giữa chừng, đích không đổi.',
      },
      {
        hoi: 'Vì sao agent bắt gõ rõ /goal thay khi đã có mục tiêu?',
        dap: 'Hai mục tiêu dài hạn song song dễ tự mâu thuẫn, còn lặng lẽ thay thì mất đích cũ không ai hay — nên phải nói rõ ý định thay.',
      },
      {
        hoi: 'Người điều phối dev dùng goal/steer vào việc gì?',
        dap: 'Goal giữ định hướng sprint (vd "bộ test luôn xanh"); steer là góp ý giữa chừng ("đặt tên biến tiếng Anh") mà không phải giao lại từ đầu.',
      },
    ],
  },
  {
    id: 'hermes-u2-l2',
    unitId: 'hermes-u2',
    language: 'hermes',
    title: '/learn — biến việc vừa làm thành kỹ năng của phòng',
    hook: 'Lần đầu hướng dẫn agent làm báo cáo tuần mất 20 phút chỉnh tới chỉnh lui. Nếu tuần sau lại mất 20 phút nữa thì bạn đang thuê trợ lý mất trí nhớ. /learn là nút "nhớ lấy cách này" — chỉnh MỘT lần, chạy cả năm.',
    theory:
      'Quy trình chuẩn để "đúc" một kỹ năng tốt gồm ba pha — pha nào cũng có lý do:\n\n1. LÀM CÙNG: giao việc, xem kết quả, lái/từ chối cho tới khi ĐẠT. Kỹ năng đúc từ lần làm chưa đạt là đúc sai vĩnh viễn.\n2. NGHIỆM THU: duyet — chốt rằng cách làm này đúng là cách phòng muốn.\n3. ĐÓNG GÓI: /learn <tên> — agent tự ghi lại các bước vừa làm thành kỹ năng có tên.\n\nTừ đó việc tương tự agent làm theo đúng quy trình đã đúc — và kỹ năng của Hermes còn TỰ CẢI THIỆN qua sử dụng: mỗi lần chạy nó tinh chỉnh thêm.\n\nHai luật đặt tên đã học ở C1 vẫn giữ: tên không dấu nối gạch ngang, trùng tên kỹ năng cũ là lỗi (không ghi đè quy trình cả phòng đang dùng).\n\nGóc điều phối: kỹ năng là cách NHÂN BẢN người giỏi nhất. Người làm báo cáo tốt nhất phòng ngồi đúc kỹ năng một buổi — từ đó ai giao việc báo cáo, agent cũng làm theo chuẩn của người giỏi nhất.',
    workedExample: {
      code: `giao "tong hop bao cao tuan tu ghi chu cac buoi hop"
duyet v1
/learn bao-cao-tuan-chuan
/skills`,
      stdinLines: [],
    },
    predict: {
      code: `giao "soan email nhac han thanh toan"
tuchoi v1 "giong qua cung, khach lau nam"
/learn email-nhac-han`,
      question: 'Việc vừa bị TỪ CHỐI mà đã /learn ngay — kỹ năng đúc ra sẽ thế nào?',
      choices: [
        'Dong goi ca cach lam CHUA dat — sai vinh vien',
        'Agent tu sua cho dat roi moi dong goi',
        '/learn bao loi vi viec chua duoc duyet',
        'Ky nang chi luu ly do tu choi',
      ],
      answerIndex: 0,
      explain:
        '/learn đóng gói cách làm VỪA RỒI — đạt hay chưa nó không tự biết, người quyết là bạn. Đúc kỹ năng từ lần làm bị chê là nhân bản cái sai. Luật: làm cùng cho ĐẠT, duyệt, RỒI mới /learn.',
    },
    parsons: {
      prompt: 'Xếp đúng ba pha đúc kỹ năng: làm cùng → nghiệm thu → đóng gói → kiểm kho.',
      lines: [
        'giao "tong hop bao cao tuan tu ghi chu hop"',
        'duyet v1',
        '/learn bao-cao-tuan-chuan',
        '/skills',
      ],
    },
    make: {
      prompt:
        'Bạn vừa cùng agent chốt được cách soạn agenda họp ưng ý. Đúc nó thành quy trình phòng:\n\n1. Giao việc: soan agenda hop giao ban tu danh sach viec dang mo\n2. Kết quả đạt — nghiệm thu việc v1.\n3. Đóng gói cách làm thành kỹ năng agenda-giao-ban.\n4. Mở kho kỹ năng kiểm tra thành phẩm.',
      starterCode: `# 1. giao viec\n\n# 2. nghiem thu\n\n# 3. dong goi ky nang\n\n# 4. kiem kho\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da duyet v1',
          match: 'contains',
          hidden: false,
          label: 'Đã nghiệm thu trước khi đúc kỹ năng',
        },
        {
          stdinLines: [],
          expected: 'thanh ky nang "agenda-giao-ban"',
          match: 'contains',
          hidden: false,
          label: 'Kỹ năng agenda-giao-ban đã đóng gói',
        },
        {
          stdinLines: [],
          expected: '- agenda-giao-ban',
          match: 'contains',
          hidden: false,
          label: 'Kho kỹ năng đã chứa quy trình mới',
        },
      ],
      hints: [
        'Đúng thứ tự ba pha: giao "…" → duyet v1 → /learn <tên> → /skills.',
        'Tên kỹ năng theo đề: agenda-giao-ban.',
        'duyet cần id việc — việc đầu tiên luôn là v1.',
      ],
      sampleSolution: `giao "soan agenda hop giao ban tu danh sach viec dang mo"
duyet v1
/learn agenda-giao-ban
/skills`,
    },
    homework:
      'Lấy bản nháp quy trình 5–7 bước bạn viết ở bài "Sử dụng skill" (C1). Tuần này làm việc đó CÙNG một AI bất kỳ, chỉnh tới khi đạt, rồi ghi lại phiên bản cuối của quy trình. So với bản nháp đầu: bao nhiêu bước đã đổi? Đó chính là lý do pha "làm cùng cho đạt" phải đứng trước pha đóng gói.',
    srsCards: [
      {
        hoi: 'Ba pha đúc một kỹ năng tốt bằng /learn?',
        dap: 'Làm cùng cho tới khi ĐẠT (giao/steer/tuchoi) → nghiệm thu (duyet) → đóng gói (/learn <tên>). Đúc từ lần làm chưa đạt là nhân bản cái sai.',
      },
      {
        hoi: 'Kỹ năng của Hermes có đứng yên sau khi đúc không?',
        dap: 'Không — kỹ năng tự cải thiện qua sử dụng: mỗi lần chạy nó tinh chỉnh thêm. Nhưng nền ban đầu vẫn phải đúc từ lần làm đã đạt.',
      },
      {
        hoi: 'Vì sao nói kỹ năng là cách "nhân bản người giỏi nhất phòng"?',
        dap: 'Người làm tốt nhất đúc quy trình một lần; từ đó mọi người giao việc đó đều được agent làm theo chuẩn của người giỏi nhất.',
      },
    ],
  },
  {
    id: 'hermes-u2-l3',
    unitId: 'hermes-u2',
    language: 'hermes',
    title: 'LiteLLM — một proxy quản mọi model, kiểm soát chi phí cả phòng',
    hook: 'Phòng 8 người dùng AI, mỗi người một khoá API riêng — cuối tháng kế toán cầm 8 hoá đơn không biết ai đốt tiền vào đâu, và một bạn lỡ commit khoá lên Git. LiteLLM gom tất cả về MỘT cửa: một đầu mối, một hoá đơn, một chỗ khoá van.',
    theory:
      'LiteLLM là PROXY — trạm trung chuyển đứng giữa mọi người dùng và mọi nhà cung cấp model. Thay vì mỗi người cầm khoá API thật, tất cả trỏ vào LiteLLM, và LiteLLM mới cầm khoá thật đi gọi Anthropic/OpenAI/Nous…\n\nVì sao một phòng nên có nó:\n1. MỘT hoá đơn — thấy ai dùng bao nhiêu, model nào tốn nhất.\n2. Đặt TRẦN chi tiêu theo người/nhóm — hết ngân sách là van tự khoá, không có bất ngờ cuối tháng.\n3. Khoá API thật chỉ nằm MỘT chỗ (trên máy chủ proxy) — nhân viên không ai cầm, không ai lỡ làm lộ.\n4. Đổi nhà cung cấp không ai phải cấu hình lại — đổi ở proxy là xong.\n\nVới Hermes, nối vào LiteLLM chỉ là trỏ model qua proxy — tên model mang tiền tố litellm/: \n\n    hermes model litellm/hermes-4\n    hermes model curator litellm/hermes-4-mini\n\nTừ đó mọi cuộc gọi của agent đi qua trạm, được đếm và được giới hạn. Dựng trạm LiteLLM thật là việc của homework.',
    workedExample: {
      code: `hermes model litellm/hermes-4-70b
hermes model curator litellm/curator-mini
/model`,
      stdinLines: [],
    },
    predict: {
      code: `hermes model litellm/hermes-4
/model`,
      question:
        'Trỏ model chính qua proxy nhưng QUÊN curator — chuyện gì với chi phí nén ngữ cảnh?',
      choices: [
        'Cuoc goi cua curator van di thang, KHONG qua tram dem',
        'Curator tu di qua proxy theo model chinh',
        'Curator ngung hoat dong',
        'Khong sao, curator khong ton tien',
      ],
      answerIndex: 0,
      explain:
        'Curator độc lập với model chính (bài C1): quên trỏ nó qua proxy thì các cuộc gọi nén ngữ cảnh vẫn đi thẳng — ngoài tầm đếm và ngoài trần chi tiêu. Lỗ hổng ngân sách kinh điển.',
    },
    parsons: {
      prompt: 'Xếp thứ tự đưa TOÀN BỘ cuộc gọi của agent qua trạm LiteLLM rồi kiểm tra.',
      lines: [
        'hermes model litellm/hermes-4',
        'hermes model curator litellm/hermes-4-mini',
        '/model',
      ],
    },
    make: {
      prompt:
        'Công ty vừa dựng trạm LiteLLM và yêu cầu MỌI cuộc gọi AI của phòng đi qua đó:\n\n1. Trỏ model chính qua proxy: litellm/hermes-4\n2. Trỏ luôn curator (đừng để lỗ hổng ngân sách): litellm/hermes-4-mini\n3. Xem lại cả hai — cả hai tên đều phải mang tiền tố litellm/.',
      starterCode: `# 1. model chinh qua proxy\n\n# 2. curator qua proxy\n\n# 3. xem lai\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'model chinh: litellm/hermes-4',
          match: 'contains',
          hidden: false,
          label: 'Model chính đã đi qua trạm LiteLLM',
        },
        {
          stdinLines: [],
          expected: 'model curator: litellm/hermes-4-mini',
          match: 'contains',
          hidden: false,
          label: 'Curator cũng qua trạm — không còn lỗ hổng ngân sách',
        },
      ],
      hints: [
        'Tên model qua proxy = tiền tố litellm/ + tên model.',
        'Hai lệnh đặt model như bài C1, chỉ khác tên model có tiền tố.',
        'hermes model litellm/hermes-4 → hermes model curator litellm/hermes-4-mini → /model.',
      ],
      sampleSolution: `hermes model litellm/hermes-4
hermes model curator litellm/hermes-4-mini
/model`,
    },
    homework:
      'Làm thật (không chấm): đọc trang chủ docs.litellm.ai, mục Proxy Server. Ghi ra: ① lệnh khởi động proxy; ② cách khai 2 model trong file cấu hình; ③ cách đặt trần chi tiêu (budget) cho một người dùng. Nếu phòng bạn đang dùng AI: đếm xem hiện có bao nhiêu người cầm khoá API riêng — đó là số lý do để dựng proxy.',
    srsCards: [
      {
        hoi: 'LiteLLM đứng ở đâu và giải quyết bài toán gì cho một phòng dùng AI?',
        dap: 'Proxy đứng giữa người dùng và mọi nhà cung cấp model: một hoá đơn chung, trần chi tiêu theo người, khoá API thật chỉ nằm một chỗ.',
      },
      {
        hoi: 'Nối Hermes vào LiteLLM bằng cách nào?',
        dap: 'Trỏ model qua tiền tố proxy: hermes model litellm/<tên> — và phải trỏ CẢ curator, không thì cuộc gọi nén ngữ cảnh vẫn đi thẳng ngoài tầm đếm.',
      },
      {
        hoi: 'Vì sao đổi nhà cung cấp model dễ hơn khi có proxy?',
        dap: 'Mọi người chỉ biết proxy; khoá và tên nhà cung cấp thật khai ở proxy — đổi một chỗ, cả phòng theo, không ai phải cấu hình lại.',
      },
    ],
  },
  {
    id: 'hermes-u2-l4',
    unitId: 'hermes-u2',
    language: 'hermes',
    title: 'llama.cpp — self-host model, dữ liệu không rời công ty',
    hook: 'Sếp hỏi câu làm cả phòng khựng lại: "Mấy bản hợp đồng mình đưa AI đọc… đang nằm trên máy chủ của ai?". Nếu câu trả lời là "của nhà cung cấp nước ngoài" thì bài này dành cho phòng bạn: chạy model NGAY TRÊN MÁY MÌNH.',
    theory:
      'llama.cpp là phần mềm mã nguồn mở chạy model AI trên máy thường — không cần card đồ hoạ đắt tiền, nhờ kỹ thuật nén model (quantization: đổi vài phần trăm chất lượng lấy giảm nhiều lần bộ nhớ).\n\nĐiểm ăn tiền với văn phòng: llama.cpp mở một API GIẢ DẠNG OpenAI (OpenAI-compatible) ngay trên máy bạn. Hermes không cần biết gì đặc biệt — chỉ cần trỏ model vào đó, tiền tố llama-cpp/:\n\n    hermes model llama-cpp/vi-7b\n\nĐánh đổi phải nói thật, không tô hồng:\n- ĐƯỢC: dữ liệu KHÔNG rời máy công ty (hợp đồng, lương, thông tin khách) · không tốn phí API · không phụ thuộc mạng.\n- MẤT: model nhỏ (7B–70B) kém hẳn model lớn thương mại ở việc khó · tốc độ tuỳ máy · tự lo vận hành.\n\nCách dùng khôn của phòng có dữ liệu nhạy cảm: chạy HAI đường — việc chạm dữ liệu mật đi model self-host, việc thường (soạn thảo chung chung) đi model thương mại cho chất lượng. Chọn đường nào cho việc nào chính là một quyết định điều phối.',
    workedExample: {
      code: `hermes model llama-cpp/vi-7b
/model`,
      stdinLines: [],
    },
    predict: {
      code: `hermes model llama-cpp/vi-7b
/model`,
      question: 'Sau lệnh này, việc agent đọc hợp đồng sẽ chạy ở đâu?',
      choices: [
        'Tren may minh — du lieu khong roi cong ty',
        'Van len may chu nha cung cap, chi doi ten',
        'Nua tren may, nua tren may chu',
        'Khong chay duoc vi thieu card do hoa',
      ],
      answerIndex: 0,
      explain:
        'llama-cpp/ trỏ vào API llama.cpp chạy trên máy bạn — mọi token đi và về đều trong nhà. Card đồ hoạ không bắt buộc: model đã nén chạy được bằng CPU, chỉ chậm hơn.',
    },
    parsons: {
      prompt:
        'Xếp kịch bản "hai đường" của phòng: chuyển sang model nội bộ cho việc mật → làm việc mật → trả về model thương mại cho việc thường.',
      lines: [
        'hermes model llama-cpp/vi-7b',
        'giao "tom tat hop dong luong nam 2026"',
        'duyet v1',
        'hermes model litellm/hermes-4',
      ],
    },
    make: {
      prompt:
        'Phòng nhân sự cần agent đọc tài liệu lương — tuyệt đối không được rời máy công ty:\n\n1. Chuyển model chính sang bản self-host: llama-cpp/vi-7b\n2. Giao việc: tom tat bang luong thang nay theo phong ban\n3. Kết quả ổn — nghiệm thu v1.\n4. Xem lại model để chắc chắn việc vừa rồi chạy nội bộ.',
      starterCode: `# 1. chuyen model self-host\n\n# 2. giao viec du lieu nhay cam\n\n# 3. nghiem thu\n\n# 4. xem lai model\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da dat model chinh: llama-cpp/vi-7b',
          match: 'contains',
          hidden: false,
          label: 'Đã chuyển sang model self-host TRƯỚC khi giao việc mật',
        },
        {
          stdinLines: [],
          expected: 'v1',
          match: 'contains',
          hidden: false,
          label: 'Việc dữ liệu nhạy cảm đã được giao và có mã việc',
        },
        {
          stdinLines: [],
          expected: 'model chinh: llama-cpp/vi-7b',
          match: 'contains',
          hidden: false,
          label: 'Xác nhận lại: việc chạy trên model nội bộ',
        },
      ],
      hints: [
        'Thứ tự sống còn: đổi model TRƯỚC, giao việc SAU — ngược lại là dữ liệu đã kịp rời công ty.',
        'Giao việc bằng giao "…", nghiệm thu bằng duyet v1.',
        'Bốn lệnh: hermes model llama-cpp/vi-7b → giao "…" → duyet v1 → /model.',
      ],
      sampleSolution: `hermes model llama-cpp/vi-7b
giao "tom tat bang luong thang nay theo phong ban"
duyet v1
/model`,
    },
    homework:
      'Làm thật (không chấm): vào github.com/ggml-org/llama.cpp, đọc phần Quick start. Ghi ra: ① lệnh chạy server API tương thích OpenAI; ② một model tiếng Việt đã nén (định dạng GGUF) tải được từ Hugging Face và dung lượng của nó; ③ máy bạn có bao nhiêu GB RAM — đủ chạy bản nén nào? Rồi liệt kê 3 loại tài liệu của phòng bạn mà theo bạn KHÔNG được phép rời máy công ty.',
    srsCards: [
      {
        hoi: 'llama.cpp cho văn phòng cái gì mà model thương mại không cho được?',
        dap: 'Chạy model ngay trên máy công ty qua API giả dạng OpenAI — dữ liệu nhạy cảm (hợp đồng, lương) không rời nhà, không phí API.',
      },
      {
        hoi: 'Đánh đổi khi self-host model là gì?',
        dap: 'Model nhỏ kém model lớn thương mại ở việc khó, tốc độ tuỳ máy, tự lo vận hành — nên dùng chiến lược hai đường: việc mật đi nội bộ, việc thường đi thương mại.',
      },
      {
        hoi: 'Trong kịch bản hai đường, lỗi thứ tự nào làm lộ dữ liệu?',
        dap: 'Giao việc mật TRƯỚC khi đổi model sang self-host — việc đã chạy trên máy chủ ngoài rồi mới đổi thì vô nghĩa. Luôn đổi model trước, giao việc sau.',
      },
    ],
  },
  {
    id: 'hermes-u2-l5',
    unitId: 'hermes-u2',
    language: 'hermes',
    title: 'Open WebUI — giao diện web chat cho người không dùng terminal',
    hook: 'Bạn đã quen gõ lệnh, nhưng chị kế toán thì không — và không nên phải quen. Open WebUI cho cả phòng một trang web chat quen mắt như ChatGPT, đằng sau vẫn là đúng hạ tầng model mà bạn đã dựng.',
    theory:
      'Open WebUI là giao diện web chat mã nguồn mở, tự host trong công ty. Nó là LỚP MẶT TIỀN: đằng sau trỏ vào bất kỳ backend nào nói giọng OpenAI-compatible — trạm LiteLLM của phòng (bài l3) hay llama.cpp nội bộ (bài l4) đều cắm được.\n\nGhép ba mảnh lại thành hạ tầng AI hoàn chỉnh của một phòng:\n- llama.cpp / nhà cung cấp ngoài — nơi model CHẠY;\n- LiteLLM — trạm ĐẾM và GIỚI HẠN mọi cuộc gọi;\n- Open WebUI — cửa cho NGƯỜI KHÔNG DÙNG TERMINAL; Hermes CLI/Telegram — cửa cho người dùng lệnh và cho tác tử tự hành động.\n\nPhân vai rõ: Open WebUI để HỎI-ĐÁP (tra cứu, soạn thảo, brainstorm); Hermes để GIAO VIỆC (agent tự hành động nhiều bước, có bảng việc, có nghiệm thu). Chọn nhầm cửa không hỏng gì, nhưng phí: đem việc nhiều bước vào cửa hỏi-đáp thì bạn phải tự tay làm từng bước.\n\nViệc của người điều phối trước khi mở cửa cho cả phòng: kiểm hạ tầng phía sau — model đã trỏ qua trạm đếm chưa, gateway chạy chưa — rồi mới đưa link Open WebUI cho mọi người.',
    workedExample: {
      code: `hermes model litellm/hermes-4-70b
hermes gateway setup
hermes gateway start
hermes`,
      stdinLines: [],
    },
    predict: {
      code: `hermes`,
      question: 'Chị kế toán cần tra cứu nhanh chính sách thuế — nên đưa chị ấy vào cửa nào?',
      choices: [
        'Open WebUI — hoi-dap khong can terminal',
        'Hermes CLI — go lenh cho chuyen nghiep',
        'Bat chi ay hoc /new va giao viec',
        'Khong cua nao, in tai lieu ra giay',
      ],
      answerIndex: 0,
      explain:
        'Hỏi-đáp một lượt là đúng vai của Open WebUI — quen mắt, không phải học gì. Hermes mới cần đến khi giao VIỆC nhiều bước có nghiệm thu. Chọn cửa theo loại việc, không theo độ "ngầu".',
    },
    parsons: {
      prompt:
        'Xếp thứ tự người điều phối chuẩn bị hạ tầng trước khi mở Open WebUI cho phòng: trỏ model qua trạm đếm → dựng gateway → bật → kiểm tra tổng.',
      lines: [
        'hermes model litellm/hermes-4',
        'hermes gateway setup',
        'hermes gateway start',
        'hermes',
      ],
    },
    make: {
      prompt:
        'Chiều nay bàn giao "góc AI" cho cả phòng: người gõ lệnh dùng Hermes, người không gõ lệnh dùng Open WebUI — chung một hạ tầng. Chuẩn bị phía sau:\n\n1. Trỏ model chính qua trạm đếm của phòng: litellm/hermes-4\n2. Cấu hình rồi bật gateway.\n3. Kiểm tra bảng trạng thái tổng — gateway phải dang-chay, model phải qua litellm/.',
      starterCode: `# 1. model qua tram dem\n\n# 2. dung + bat gateway\n\n# 3. kiem tra tong\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Gateway Telegram dang chay',
          match: 'contains',
          hidden: false,
          label: 'Gateway đã bật cho cửa nhắn tin',
        },
        {
          stdinLines: [],
          expected: 'model: litellm/hermes-4',
          match: 'contains',
          hidden: false,
          label: 'Bảng tổng xác nhận model đi qua trạm đếm',
        },
      ],
      hints: [
        'Bốn lệnh, đã học hết ở các bài trước — bài này là ghép chúng thành một buổi bàn giao.',
        'Gateway vẫn luật cũ: setup trước, start sau.',
        'hermes model litellm/hermes-4 → hermes gateway setup → hermes gateway start → hermes.',
      ],
      sampleSolution: `hermes model litellm/hermes-4
hermes gateway setup
hermes gateway start
hermes`,
    },
    homework:
      'Làm thật (không chấm): đọc docs.openwebui.com phần Getting Started — ghi ra lệnh Docker dựng Open WebUI và chỗ khai địa chỉ backend OpenAI-compatible. Rồi vẽ sơ đồ hạ tầng AI cho phòng bạn trên MỘT trang giấy: các ô llama.cpp/nhà cung cấp · LiteLLM · Open WebUI · Hermes, mũi tên ai gọi ai. Vẽ được sơ đồ này là bạn đã nắm cả chương C2.',
    srsCards: [
      {
        hoi: 'Open WebUI đóng vai gì trong hạ tầng AI của phòng?',
        dap: 'Lớp mặt tiền web chat tự host cho người không dùng terminal — cắm vào backend OpenAI-compatible (LiteLLM, llama.cpp) đã dựng sẵn.',
      },
      {
        hoi: 'Chia việc giữa Open WebUI và Hermes thế nào?',
        dap: 'Open WebUI cho HỎI-ĐÁP một lượt (tra cứu, soạn thảo); Hermes cho GIAO VIỆC nhiều bước — agent tự hành động, có bảng việc và nghiệm thu.',
      },
      {
        hoi: 'Ba mảnh hạ tầng AI hoàn chỉnh của một phòng và vai từng mảnh?',
        dap: 'Nơi model chạy (llama.cpp/nhà cung cấp) · trạm đếm-giới hạn (LiteLLM) · các cửa vào (Open WebUI cho người thường, Hermes cho người điều phối và tác tử).',
      },
    ],
  },
]

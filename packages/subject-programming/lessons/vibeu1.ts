// lessons/vibeu1.ts — Chương C1 "Tư duy & vòng lặp" của khoá "Vibe Code — từ số 0 đến
// chuyên gia" (đặc tả docs/specs/2026-08-31-khoa-vibe-code.md §③b).
//
// unitId 'vibe-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Sáu bài bám đúng bảng C1 của đề cương §③b. Mọi lệnh trong bài nằm trong bộ lệnh đóng của
// vibeSim.ts; phần LÀM THẬT (Claude Code, Cursor, Lovable…) để ở bước ⑦ homework, không
// chấm — đúng luật soạn bài công cụ thật của đặc tả §②.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const VIBE_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'vibe-u1-l1',
    unitId: 'vibe-u1',
    language: 'vibe',
    title: 'Vibe code là gì — lập trình bằng mô tả',
    hook: 'Năm 2025, một nhà nghiên cứu AI nổi tiếng (Andrej Karpathy) đặt tên cho cách làm phần mềm mới: không gõ code, chỉ MÔ TẢ thứ mình muốn cho AI rồi lặp. Ông gọi nó là "vibe coding". Khoá này dạy bạn cách đó — và dạy luôn phần ông không nói: làm sao để thứ bạn xây KHÔNG SẬP.',
    theory:
      'VIBE CODE = lập trình bằng mô tả: bạn nói cho tác tử AI biết mình muốn gì bằng tiếng người, AI viết code, bạn xem kết quả rồi mô tả tiếp. Vòng lặp cốt lõi chỉ có ba nhịp: MÔ TẢ → XEM → NHẬN.\n\nNhưng ngành phần mềm đã học được bài học đắt: có HAI MỨC vibe code.\n- Mức NGÂY THƠ: nhận mọi thứ AI đưa mà không đọc. Nhanh cho đồ chơi cuối tuần; nguy hiểm cho thứ có người dùng thật — các sự cố nổi tiếng đều cùng khuôn: lộ khoá API, không có test nên hỏng không biết, không có mốc quay lại nên AI sửa một chỗ phá ba chỗ.\n- Mức CHUYÊN GIA: vẫn không tự gõ code, nhưng có KỶ LUẬT — mô tả rõ như đặc tả, xem diff trước khi nhận, test làm trọng tài, lưu mốc trước thay đổi lớn. Khoá này đưa bạn từ số 0 lên mức đó.\n\nCông cụ đầu tiên phải thuộc: lệnh `vibe` — bảng trạng thái dự án. Nó trả lời 4 câu: đã nhận bao nhiêu tính năng? còn bản nháp nào chờ xem? test đang xanh hay đỏ? mốc gần nhất là gì? Liếc bảng này trước mỗi buổi làm việc, như liếc đồng hồ xăng trước khi lái.\n\nLưu ý thật thà: terminal trong bài là BỘ MÔ PHỎNG của DHCB (dòng [GIA LAP] đầu output), không nhại một sản phẩm nào. Quy trình là quy trình thật; còn ngoài đời phản hồi do AI sinh nên mỗi lần mỗi khác — ở đây phải cố định để chấm bài được.',
    workedExample: {
      code: `vibe`,
      stdinLines: [],
    },
    predict: {
      code: `vibe`,
      question: 'Dự án mới tinh, chưa giao việc gì — dòng "test" trong bảng trạng thái in gì?',
      choices: ['test: chua-chay', 'test: xanh', 'test: do', 'Khong in dong test'],
      answerIndex: 0,
      explain:
        'Chưa có tính năng nào thì chưa có gì để kiểm — test là "chua-chay", không phải "xanh". Xanh là kết quả của việc ĐÃ KIỂM, không phải trạng thái mặc định. Phân biệt này là nền của chương C2.',
    },
    parsons: {
      prompt: 'Xếp đúng vòng lặp vibe code cơ bản: xem trạng thái → mô tả việc → đọc diff → nhận.',
      lines: [
        'vibe',
        'mota "them may tinh chia tien an trua, chia deu, bao loi khi so nguoi bang 0"',
        'xemdiff v1',
        'nhan v1',
      ],
    },
    make: {
      prompt:
        'Bạn vừa mở dự án đầu tiên của đời mình. Trước khi giao việc gì cho AI, hãy nhìn "bảng đồng hồ":\n\n1. Gõ lệnh xem trạng thái dự án.\n2. Đọc kỹ output: đã nhận mấy tính năng, test đang ở trạng thái nào, có mốc nào chưa.',
      starterCode: `# 1. xem trang thai du an\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'tinh nang da nhan: 0',
          match: 'contains',
          hidden: false,
          label: 'Bảng trạng thái: chưa nhận tính năng nào',
        },
        {
          stdinLines: [],
          expected: 'test: chua-chay',
          match: 'contains',
          hidden: false,
          label: 'Bảng trạng thái: test chưa chạy',
        },
      ],
      hints: [
        'Chỉ cần MỘT lệnh — tên của chính cách làm việc này.',
        'Gõ: vibe (không tham số gì thêm).',
        'Lệnh `vibe` không kèm gì in bảng trạng thái: tính năng đã nhận, bản nháp chờ xem, test, mốc.',
      ],
      sampleSolution: `vibe`,
    },
    homework:
      'Làm thật (không chấm): chọn MỘT công cụ vibe code thật — Claude Code, Cursor, Lovable, v0 hay Replit — và mở trang giới thiệu của nó. Ghi ra: ① công cụ đó nhận mô tả ở đâu (khung chat? terminal?); ② nó cho bạn XEM code trước khi áp không. Đọc thêm bài đăng gốc của Karpathy về "vibe coding" (tìm "Karpathy vibe coding") và ghi lại một câu ông cảnh báo về giới hạn của cách làm này.',
    srsCards: [
      {
        hoi: 'Vòng lặp cốt lõi của vibe code gồm ba nhịp nào?',
        dap: 'MÔ TẢ (nói cho AI thứ mình muốn) → XEM (đọc thứ AI làm ra) → NHẬN (đưa vào dự án). Thiếu nhịp XEM là rơi xuống mức ngây thơ.',
      },
      {
        hoi: 'Vibe code mức ngây thơ khác mức chuyên gia ở điểm cốt lõi nào?',
        dap: 'Ngây thơ = nhận mọi thứ AI đưa mà không đọc; chuyên gia = vẫn không tự gõ code nhưng có kỷ luật: mô tả rõ, xem diff, test làm trọng tài, lưu mốc.',
      },
      {
        hoi: 'Lệnh nào xem "bảng đồng hồ" của dự án vibe code, và nó trả lời gì?',
        dap: '`vibe` không kèm tham số — trả lời 4 câu: đã nhận bao nhiêu tính năng, còn bản nháp nào chờ xem, test xanh hay đỏ, mốc gần nhất là gì.',
      },
    ],
  },
  {
    id: 'vibe-u1-l2',
    unitId: 'vibe-u1',
    language: 'vibe',
    title: 'Mô tả như đặc tả — mơ hồ thì agent hỏi lại',
    hook: 'Giao việc cho người thật mà chỉ nói "làm cái web hay hay" thì nhận về thứ không ai muốn. AI cũng vậy — chỉ tệ hơn: nó không dám cãi, nó ĐOÁN. Bài này dạy công thức mô tả khiến AI hết phải đoán.',
    theory:
      'Chất lượng thứ AI xây ra bằng đúng chất lượng MÔ TẢ của bạn — đây là định luật số một của vibe code. Lệnh giao việc: mota "<yêu cầu>".\n\nMô tả tốt trả lời đủ BA VẾ:\n1. AI DÙNG cho ai, để làm gì — "máy tính chia tiền cho nhóm bạn ăn trưa".\n2. VÀO / RA — nhập gì (tổng tiền, số người), ra gì (mỗi người trả bao nhiêu).\n3. CA ĐẶC BIỆT — số người bằng 0 thì sao? danh sách rỗng thì sao?\n\nAgent trong khoá này có một tính cách được cài chủ ý: mô tả quá mơ hồ thì nó KHÔNG ĐOÁN — nó hỏi lại đúng 3 câu (ai dùng? vào/ra? ca đặc biệt?) và không xây gì cả. Đó cũng là cách nhận ra agent tốt ngoài đời: dám hỏi lại thay vì đoán mò.\n\nLưu ý thật thà: mô phỏng đo độ mơ hồ bằng ĐỘ DÀI (mô tả quá ngắn coi như mơ hồ) vì máy chấm phải tất định; agent ngoài đời đo bằng ngữ nghĩa nên thông minh hơn — nhưng bài học thì một: mô tả ngắn cũn hầu như luôn thiếu cả ba vế.\n\nMô tả đạt thì agent viết BẢN NHÁP (v1, v2…) ở trạng thái "cho-xem" — chưa vào dự án. Nó vào dự án hay không là quyết định của BẠN, ở bài sau.',
    workedExample: {
      code: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra so tien moi nguoi, bao loi khi so nguoi bang 0"
vibe`,
      stdinLines: [],
    },
    predict: {
      code: `mota "lam web"`,
      question: 'Mô tả cụt lủn thế này — agent làm gì?',
      choices: [
        'Hoi lai 3 cau va KHONG xay gi',
        'Doan y va xay mot trang web mau',
        'Bao loi he thong',
        'Tao ban nhap rong',
      ],
      answerIndex: 0,
      explain:
        '"lam web" thiếu cả ba vế: ai dùng, vào/ra, ca đặc biệt. Agent được cài để hỏi lại thay vì đoán — vì thứ xây từ phỏng đoán gần như chắc chắn phải đập đi làm lại, tốn hơn nhiều so với trả lời 3 câu hỏi.',
    },
    parsons: {
      prompt:
        'Xếp một mô tả tốt theo đúng ba vế: ai dùng → vào/ra → ca đặc biệt (mỗi dòng một vế, dòng lệnh đứng đầu).',
      lines: [
        'mota "them so thu chi ca nhan cho sinh vien:',
        'nhap khoan thu hoac chi kem ten,',
        'ra tong con lai cuoi thang,',
        'bao loi khi so tien bang 0"',
      ],
    },
    make: {
      prompt:
        'Nhóm bạn của bạn hay quên ai đã trả tiền ăn trưa. Giao cho AI xây tính năng đầu tiên:\n\n1. Viết MỘT lệnh mota có đủ ba vế (ai dùng/để làm gì · vào/ra · ca đặc biệt). Tự nghĩ nội dung — miễn đủ rõ.\n2. Gõ vibe xem bản nháp đã nằm chờ.',
      starterCode: `# 1. mo ta du ba ve (dung de mo ta cut lun!)\n\n# 2. xem trang thai\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'ban nhap v1',
          match: 'contains',
          hidden: false,
          label: 'Agent nhận mô tả và tạo bản nháp v1',
        },
        {
          stdinLines: [],
          expected: 'ban nhap cho xem: 1',
          match: 'contains',
          hidden: false,
          label: 'Bảng trạng thái thấy 1 bản nháp chờ xem',
        },
      ],
      hints: [
        'Khuôn: mota "<mô tả>" rồi dòng sau gõ vibe. Mô tả phải ĐỦ DÀI và đủ ý — cụt lủn là agent hỏi lại thay vì xây.',
        'Đủ ba vế: ai dùng để làm gì, nhập gì ra gì, ca đặc biệt nào. Ví dụ vế ba: "bao loi khi so nguoi bang 0".',
        'Mẫu chạy được: mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0" — rồi vibe.',
      ],
      sampleSolution: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"
vibe`,
    },
    homework:
      'Làm thật (không chấm): mở công cụ vibe code bạn đã chọn ở bài trước và giao đúng bài "máy tính chia tiền ăn trưa" — nhưng giao HAI LẦN ở hai phiên khác nhau: lần một chỉ gõ "làm máy tính chia tiền", lần hai gõ mô tả đủ ba vế. So hai kết quả: cái nào phải sửa ít hơn? Ghi lại một chỗ AI đã ĐOÁN sai ở lần một.',
    srsCards: [
      {
        hoi: 'Một mô tả tốt cho AI phải trả lời đủ ba vế nào?',
        dap: '① Ai dùng, để làm gì; ② dữ liệu VÀO và kết quả RA; ③ ca đặc biệt phải xử lý (rỗng, số 0, quá dài…). Thiếu vế nào AI đoán vế đó.',
      },
      {
        hoi: 'Agent tốt phản ứng thế nào trước một mô tả mơ hồ?',
        dap: 'HỎI LẠI thay vì đoán — vì thứ xây từ phỏng đoán gần như chắc chắn phải đập đi làm lại, đắt hơn nhiều so với trả lời vài câu hỏi làm rõ.',
      },
      {
        hoi: 'Sau lệnh mota thành công, thứ AI tạo ra đã nằm trong dự án chưa?',
        dap: 'CHƯA — nó là bản nháp trạng thái "cho-xem". Vào dự án hay không là quyết định của người, qua lệnh nhan sau khi đã xem diff.',
      },
    ],
  },
  {
    id: 'vibe-u1-l3',
    unitId: 'vibe-u1',
    language: 'vibe',
    title: 'Kế hoạch trước, code sau',
    hook: 'Thợ giỏi không đập tường ngay khi chủ nhà nói "mở rộng phòng khách" — họ vẽ phác trước, chủ gật đầu rồi mới đập. Với việc lớn, bắt AI trình kế hoạch trước khi viết code là kỹ năng ăn tiền thứ hai của khoá này.',
    theory:
      'Lệnh kehoach "<yêu cầu>" bắt agent làm một việc duy nhất: TRÌNH BÀY các bước nó ĐỊNH làm — chưa đụng một dòng code nào. Bạn đọc kế hoạch, thấy hướng sai thì chỉnh MÔ TẢ, thấy đúng thì mới giao thật bằng mota.\n\nVì sao đáng một lệnh riêng? Vì sửa KẾ HOẠCH rẻ hơn sửa CODE hàng chục lần. Kế hoạch sai đọc 30 giây là thấy; code sai từ kế hoạch sai thì phải xem diff, thử, nghi ngờ, quay lại — mất cả buổi.\n\nKhi nào cần kehoach:\n- Việc LỚN hoặc MỜ: đụng nhiều phần, bạn chưa hình dung rõ các bước.\n- Việc bạn không rành: đọc kế hoạch chính là cách học nhanh nhất xem việc này gồm những gì.\nKhi nào bỏ qua: việc bé và rõ ("đổi màu nút") — kế hoạch cho việc 2 phút là nghi thức rườm rà.\n\nkehoach chịu chung phép kiểm với mota: mô tả mơ hồ thì agent hỏi lại thay vì phác bừa — kế hoạch xây trên phỏng đoán cũng vô giá trị như code xây trên phỏng đoán.',
    workedExample: {
      code: `kehoach "them bang xep hang thanh vien dong tien dung han cho nhom an trua, ra danh sach xep theo so lan"
vibe`,
      stdinLines: [],
    },
    predict: {
      code: `kehoach "them bang xep hang thanh vien dong tien dung han cho nhom an trua, ra danh sach xep theo so lan"
vibe`,
      question: 'Sau khi xem kế hoạch, bảng trạng thái in "ban nhap cho xem" bằng mấy?',
      choices: ['0', '1', '2', 'Bao loi'],
      answerIndex: 0,
      explain:
        'kehoach CHỈ trình bày các bước — không tạo bản nháp, không đụng code. Muốn agent làm thật phải giao bằng mota. Tách "bàn" khỏi "làm" chính là giá trị của lệnh này.',
    },
    parsons: {
      prompt:
        'Xếp đúng nhịp làm việc lớn: hỏi kế hoạch → đọc thấy ổn → giao thật → xem trạng thái.',
      lines: [
        'kehoach "them bang xep hang thanh vien dong tien dung han, ra danh sach xep theo so lan"',
        'mota "them bang xep hang thanh vien dong tien dung han, ra danh sach xep theo so lan, bao khi danh sach rong"',
        'vibe',
      ],
    },
    make: {
      prompt:
        'Nhóm muốn thêm "bảng xếp hạng ai đóng tiền đúng hạn" — việc này đụng dữ liệu của mọi người nên bạn muốn nhìn hướng đi trước.\n\n1. Bắt agent trình kế hoạch cho việc đó (mô tả đủ rõ).\n2. Đọc kế hoạch — thấy có bước nói về ca biên không?',
      starterCode: `# 1. hoi ke hoach (chua giao that)\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ke hoach cho:',
          match: 'contains',
          hidden: false,
          label: 'Agent trình bày kế hoạch',
        },
        {
          stdinLines: [],
          expected: 'Chua dung vao code',
          match: 'contains',
          hidden: false,
          label: 'Kế hoạch không đụng vào code',
        },
      ],
      hints: [
        'Dùng lệnh kehoach (không phải mota) — và mô tả vẫn phải đủ rõ, mơ hồ là bị hỏi lại.',
        'Khuôn: kehoach "<mô tả đủ dài, nói rõ vào/ra>".',
        'Mẫu chạy được: kehoach "them bang xep hang thanh vien dong tien dung han cho nhom an trua, ra danh sach xep theo so lan".',
      ],
      sampleSolution: `kehoach "them bang xep hang thanh vien dong tien dung han cho nhom an trua, ra danh sach xep theo so lan"`,
    },
    homework:
      'Làm thật (không chấm): các công cụ thật đều có "chế độ kế hoạch" — Claude Code có plan mode, Cursor cho phép nhắn "trình kế hoạch trước, đừng sửa code". Chọn một việc bạn định làm và bắt công cụ trình kế hoạch. Đọc rồi ghi ra: một bước bạn KHÔNG ngờ tới, và một bước bạn muốn gạch bỏ. Đó chính là giá trị của việc bàn trước khi làm.',
    srsCards: [
      {
        hoi: 'Lệnh kehoach khác mota ở điểm cốt lõi nào?',
        dap: 'kehoach chỉ bắt agent TRÌNH BÀY các bước định làm, không đụng code, không tạo bản nháp; mota mới là giao việc thật ra bản nháp.',
      },
      {
        hoi: 'Vì sao với việc lớn nên bắt AI trình kế hoạch trước khi viết code?',
        dap: 'Sửa kế hoạch rẻ hơn sửa code hàng chục lần: kế hoạch sai đọc 30 giây là thấy, còn code sai từ kế hoạch sai tốn cả buổi xem diff và làm lại.',
      },
      {
        hoi: 'Việc thế nào thì NÊN bỏ qua bước kế hoạch?',
        dap: 'Việc bé và rõ (kiểu "đổi màu nút") — kế hoạch cho việc 2 phút là nghi thức rườm rà. Kế hoạch dành cho việc lớn, mờ, hoặc lĩnh vực mình không rành.',
      },
    ],
  },
  {
    id: 'vibe-u1-l4',
    unitId: 'vibe-u1',
    language: 'vibe',
    title: 'Xem diff — không nhận code chưa đọc',
    hook: 'Ký hợp đồng không đọc là chuyện không ai dám làm với tiền của mình — nhưng hàng nghìn người đang "ký" code AI viết mỗi ngày mà không liếc lấy một dòng. Bài này cài cho bạn phản xạ ngược lại: chưa đọc thì chưa nhận, không có ngoại lệ.',
    theory:
      'DIFF = bản liệt kê "thứ sắp thay đổi": dòng bắt đầu bằng dấu + là thứ được thêm vào. Lệnh xemdiff <id> in tóm tắt diff của bản nháp và đánh dấu bạn ĐÃ XEM.\n\nAgent của khoá này có luật cứng: nhan một bản nháp CHƯA XEM DIFF là bị từ chối thẳng. Vì sao cứng vậy? Vì trách nhiệm không chuyển giao được: khi sản phẩm hỏng, người chịu là BẠN, không phải AI. Xem diff là khoảnh khắc duy nhất bạn còn đứng giữa "AI đề xuất" và "dự án của mình thay đổi".\n\nĐọc diff tóm tắt như thế nào khi không biết code? Đọc như đọc MỤC LỤC:\n- Từng dòng + có nằm trong phạm vi việc mình giao không? Giao "thêm nút" mà diff đòi sửa cả phần đăng nhập là cờ đỏ.\n- Có dòng cảnh báo nào không? Mô phỏng in rõ "(chua thay nhanh xu ly ca bien — de y khi doc)" khi mô tả của bạn quên vế ca đặc biệt — ngoài đời không ai in hộ, nên phản xạ dò tìm phải thành của bạn.\n\nXem xong mới tới quyền quyết định: nhan (bài sau) hoặc sua kèm góp ý.',
    workedExample: {
      code: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"
xemdiff v1`,
      stdinLines: [],
    },
    predict: {
      code: `nhan v1`,
      question: 'Bản nháp v1 đang chờ nhưng bạn CHƯA xemdiff — lệnh nhan v1 cho kết quả gì?',
      choices: [
        'Tu choi: khong nhan code chua doc',
        'Nhan binh thuong',
        'Tu dong mo diff roi nhan',
        'Bao khong co ban nhap',
      ],
      answerIndex: 0,
      explain:
        'Luật cứng của agent: chưa xem diff thì không nhận được — kèm lời nhắc "nguoi chiu trach nhiem la ban, khong phai AI". Ngoài đời không công cụ nào chặn hộ bạn; phản xạ này phải tự cài.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự từ giao việc đến trước ngưỡng cửa nhận: mô tả → xem trạng thái → đọc diff.',
      lines: [
        'mota "them o tim kiem ten mon an trong danh sach, go chu ra mon khop, bao khi khong co mon nao"',
        'vibe',
        'xemdiff v1',
      ],
    },
    make: {
      prompt:
        'Agent vừa báo xong bản nháp v1 (đề đã dựng sẵn cảnh này). Việc của bạn trước khi quyết bất cứ điều gì:\n\n1. Mở diff của v1 ra đọc.\n2. Để ý dòng cuối: diff này có nhánh xử lý ca biên không?',
      starterCode: `# v1 dang cho-xem — mo diff cua no ra doc\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
          ],
          expected: 'diff cua v1',
          match: 'contains',
          hidden: false,
          label: 'Mở được diff của bản nháp v1',
        },
        {
          stdinLines: [
            'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
          ],
          expected: 'DA XEM',
          match: 'contains',
          hidden: false,
          label: 'Bản nháp được đánh dấu đã xem',
        },
      ],
      hints: [
        'Một lệnh duy nhất, kèm id bản nháp.',
        'Khuôn: xemdiff <id> — id bản nháp đầu tiên luôn là v1.',
        'Gõ: xemdiff v1.',
      ],
      sampleSolution: `xemdiff v1`,
    },
    homework:
      'Làm thật (không chấm): giao một việc nhỏ cho công cụ thật của bạn và TRƯỚC KHI bấm chấp nhận, đọc phần diff nó hiện (mọi công cụ tử tế đều hiện). Đếm: bao nhiêu file bị chạm? Có file nào NGOÀI phạm vi việc bạn giao không? Nếu có — đó chính là lý do bài này tồn tại. Ghi lại một dòng + mà bạn không hiểu, để dành hỏi ở bài "giaithich".',
    srsCards: [
      {
        hoi: 'Trong diff, dòng bắt đầu bằng dấu + nghĩa là gì?',
        dap: 'Thứ sắp được THÊM vào dự án nếu bạn nhận bản nháp — diff là bản liệt kê thay đổi để người quyết định đọc trước khi ký.',
      },
      {
        hoi: 'Vì sao agent từ chối lệnh nhan khi bạn chưa xem diff?',
        dap: 'Vì trách nhiệm không chuyển giao được: sản phẩm hỏng thì người chịu là bạn, không phải AI — xem diff là khoảnh khắc duy nhất bạn còn đứng giữa đề xuất của AI và dự án của mình.',
      },
      {
        hoi: 'Không biết code thì đọc diff tóm tắt kiểu gì cho có ích?',
        dap: 'Đọc như đọc mục lục: từng dòng + có nằm trong phạm vi việc mình giao không, và có dòng cảnh báo thiếu ca biên không. Lệch phạm vi hoặc thiếu cảnh báo xử lý ca biên là cờ đỏ.',
      },
    ],
  },
  {
    id: 'vibe-u1-l5',
    unitId: 'vibe-u1',
    language: 'vibe',
    title: 'Nhận & yêu cầu sửa — vòng phản hồi',
    hook: 'Đầu bếp bưng món ra, bạn nếm rồi mới gật — mặn quá thì nói "mặn quá, bớt muối" chứ không nói "dở, làm lại". Với AI cũng thế: nhận hay trả lại là quyền của bạn, và chất lượng lời góp ý quyết định chất lượng bản sửa.',
    theory:
      'Sau khi xem diff, bạn có hai quyền:\n\n1. nhan <id> — đưa bản nháp vào dự án. Từ khoảnh khắc này nó là CỦA BẠN: test quay về "chua-chay" nhắc bạn phải kiểm (chương C2), và mọi hậu quả thuộc về bạn.\n\n2. sua <id> "<góp ý>" — trả lại kèm góp ý. Luật vàng của góp ý: CỤ THỂ như góp ý món ăn. "Chưa được, làm lại" khiến AI đoán lần nữa — và thường đoán sang cái sai khác. "Đổi màu nút sang xanh lá cho nổi trên nền tối" thì AI sửa trúng ngay.\n\nĐiểm nhiều người ngã: BẢN SỬA LÀ BẢN MỚI. Agent xoá dấu "đã xem" của bản cũ — bạn phải xemdiff lại rồi mới nhan được. Vì sao? Vì khi sửa chỗ bạn góp ý, AI hoàn toàn có thể đụng thêm chỗ khác; tin rằng "nó chỉ sửa đúng chỗ mình nói" là niềm tin đã làm sập nhiều dự án thật.\n\nVòng phản hồi chuẩn: mota → xemdiff → (sua → xemdiff)* → nhan. Vòng lặp ở giữa chạy bao nhiêu lần tuỳ chất lượng mô tả ban đầu của bạn — mô tả càng tốt, vòng càng ngắn.',
    workedExample: {
      code: `mota "them nut doi giao dien sang che do toi cho de nhin ban dem, nho lua chon cho lan sau"
xemdiff v1
sua v1 "doi mau nut sang xanh la cho noi tren nen toi"
xemdiff v1
nhan v1`,
      stdinLines: [],
    },
    predict: {
      code: `sua v1 "doi mau nut sang xanh la cho noi tren nen toi"
nhan v1`,
      question: 'v1 đã được xem diff TRƯỚC khi sửa. Chuỗi lệnh này cho kết quả gì?',
      choices: [
        'nhan bi tu choi vi ban sua chua duoc xem',
        'nhan thanh cong',
        'sua bi tu choi vi v1 da xem roi',
        'Ca hai lenh deu loi',
      ],
      answerIndex: 0,
      explain:
        'sua tạo BẢN MỚI và xoá dấu "đã xem" — dấu cũ thuộc về bản cũ. Phải xemdiff lại rồi mới nhan được: AI sửa chỗ này có thể đụng thêm chỗ khác, bản nào cũng phải đọc bản đó.',
    },
    parsons: {
      prompt: 'Xếp đúng một vòng phản hồi trọn vẹn: giao → đọc → góp ý → đọc lại → nhận.',
      lines: [
        'mota "them nut doi giao dien sang che do toi cho de nhin ban dem, nho lua chon cho lan sau"',
        'xemdiff v1',
        'sua v1 "doi mau nut sang xanh la cho noi tren nen toi"',
        'xemdiff v1',
        'nhan v1',
      ],
    },
    make: {
      prompt:
        'Bản nháp v1 (nút chế độ tối) đã nằm chờ và bạn ĐÃ xem diff lần đầu (đề dựng sẵn). Đọc xong bạn muốn nút màu xanh lá cho nổi trên nền tối.\n\n1. Trả lại v1 kèm góp ý cụ thể đó.\n2. Đọc bản sửa (nhớ luật bản-mới!).\n3. Ưng rồi — nhận v1 vào dự án.',
      starterCode: `# 1. tra lai kem gop y cu the\n\n# 2. doc ban sua\n\n# 3. nhan\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them nut doi giao dien sang che do toi cho de nhin ban dem, nho lua chon cho lan sau"',
            'xemdiff v1',
          ],
          expected: 'ban sua la ban MOI',
          match: 'contains',
          hidden: false,
          label: 'Agent nhắc: bản sửa là bản mới, phải đọc lại',
        },
        {
          stdinLines: [
            'mota "them nut doi giao dien sang che do toi cho de nhin ban dem, nho lua chon cho lan sau"',
            'xemdiff v1',
          ],
          expected: 'Da nhan v1',
          match: 'contains',
          hidden: false,
          label: 'Nhận được v1 sau khi xem lại bản sửa',
        },
      ],
      hints: [
        'Ba bước: sua v1 "<góp ý>" → xemdiff v1 → nhan v1. Bỏ bước giữa là nhan bị từ chối.',
        'Góp ý phải nằm trong nháy kép và CỤ THỂ (màu gì, vì sao) — góp ý suông kiểu "chua dep" cũng chạy nhưng ngoài đời sẽ nhận về bản đoán mò.',
        'Mẫu: sua v1 "doi mau nut sang xanh la cho noi tren nen toi" → xemdiff v1 → nhan v1.',
      ],
      sampleSolution: `sua v1 "doi mau nut sang xanh la cho noi tren nen toi"
xemdiff v1
nhan v1`,
    },
    homework:
      'Làm thật (không chấm): lấy kết quả AI làm mà bạn chưa ưng (bài trước, hoặc việc mới). Góp ý hai kiểu ở hai lượt chat: lượt một chỉ nói "chưa được, sửa lại"; lượt hai nói cụ thể cái gì sai, muốn ra sao, vì sao. So sánh hai bản sửa và ghi lại: lượt một AI đã đoán sai theo hướng nào?',
    srsCards: [
      {
        hoi: 'Góp ý thế nào để AI sửa trúng ngay lượt đầu?',
        dap: 'Cụ thể như góp ý món ăn: cái gì sai, muốn ra sao, vì sao — "đổi màu nút sang xanh lá cho nổi trên nền tối" thay vì "chưa đẹp, làm lại".',
      },
      {
        hoi: 'Vì sao sau lệnh sua phải xemdiff lại rồi mới nhan được?',
        dap: 'Bản sửa là BẢN MỚI: khi sửa chỗ được góp ý, AI có thể đụng thêm chỗ khác — dấu "đã xem" của bản cũ không dùng lại được, bản nào phải đọc bản đó.',
      },
      {
        hoi: 'Sau lệnh nhan, điều gì đổi trong trách nhiệm và trạng thái dự án?',
        dap: 'Tính năng thành CỦA BẠN — mọi hậu quả thuộc về bạn; đồng thời test quay về "chua-chay" nhắc phải kiểm tra trước khi đi tiếp.',
      },
    ],
  },
  {
    id: 'vibe-u1-l6',
    unitId: 'vibe-u1',
    language: 'vibe',
    title: 'Hỏi cho hiểu — giaithich',
    hook: '"Không cần biết code" là lời hứa của vibe coding — nhưng "không cần hiểu hệ thống của mình" thì chưa ai dám hứa. May là bạn có một gia sư ngồi sẵn trong terminal: chính con AI vừa viết ra đoạn code đó.',
    theory:
      'Lệnh giaithich <id> bắt agent giải thích bản nháp/tính năng BẰNG LỜI THƯỜNG: phần này làm gì, chạy theo đường nào, đổi chỗ nào thì ảnh hưởng gì.\n\nVì sao kỹ năng này ăn tiền? Ba tình huống bạn sẽ gặp thật:\n1. Diff có dòng + bạn không hiểu → hỏi trước khi nhận, đừng nhận trong mù mờ.\n2. Sáu tháng sau mở lại dự án, quên sạch → giaithich từng phần là cách đọc lại nhanh nhất.\n3. Sắp đụng vùng nhạy cảm (chương C4 sẽ học) → luật ở đó là PHẢI hiểu mới được đụng, và giaithich là công cụ để hiểu.\n\nHỏi xong một câu đừng dừng — hỏi tiếp như học trò giỏi: "vì sao chọn cách này mà không phải cách kia?", "nếu ngày mai cần thêm X thì phần nào phải đổi?". Agent trả lời được hết, và mỗi câu trả lời là một viên gạch hiểu-hệ-thống của bạn.\n\nMẹo dùng cả đời: sau MỖI tính năng nhận vào, bỏ 60 giây gõ giaithich và đọc. Người vibe code lâu năm khác người mới ở đúng chỗ này — dự án của họ không có vùng tối.',
    workedExample: {
      code: `mota "them phan luu ten cac thanh vien nhom an trua de khoi go lai moi lan chia tien"
giaithich v1`,
      stdinLines: [],
    },
    predict: {
      code: `giaithich v9`,
      question: 'Dự án chỉ có bản nháp v1 — lệnh giaithich v9 cho kết quả gì?',
      choices: [
        'Bao khong co ban nhap "v9", chi xem bang "vibe"',
        'Giai thich chung chung ve du an',
        'Tu tao ban nhap v9',
        'Im lang bo qua',
      ],
      answerIndex: 0,
      explain:
        'Agent chỉ giải thích được thứ TỒN TẠI — id lạ là báo ngay và chỉ chỗ tra danh sách. Máy móc rõ ràng kiểu này đáng tin hơn một câu trả lời bịa cho có.',
    },
    parsons: {
      prompt:
        'Xếp nhịp "nhận có hiểu": giao việc → đọc diff → chưa rõ thì hỏi → hiểu rồi mới nhận.',
      lines: [
        'mota "them phan luu ten cac thanh vien nhom an trua de khoi go lai moi lan chia tien"',
        'xemdiff v1',
        'giaithich v1',
        'nhan v1',
      ],
    },
    make: {
      prompt:
        'Bản nháp v1 (lưu tên thành viên nhóm) đang chờ — diff có dòng bạn chưa hiểu (đề dựng sẵn cảnh, kể cả việc bạn đã xem diff).\n\n1. Bắt agent giải thích v1 bằng lời thường.\n2. Hiểu rồi — nhận v1 vào dự án.',
      starterCode: `# 1. hoi cho hieu\n\n# 2. nhan\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them phan luu ten cac thanh vien nhom an trua de khoi go lai moi lan chia tien"',
            'xemdiff v1',
          ],
          expected: 'Giai thich v1 bang loi thuong',
          match: 'contains',
          hidden: false,
          label: 'Agent giải thích v1 bằng lời thường',
        },
        {
          stdinLines: [
            'mota "them phan luu ten cac thanh vien nhom an trua de khoi go lai moi lan chia tien"',
            'xemdiff v1',
          ],
          expected: 'Da nhan v1',
          match: 'contains',
          hidden: false,
          label: 'Nhận v1 sau khi đã hiểu',
        },
      ],
      hints: [
        'Hai lệnh, đúng thứ tự đề bài: hỏi trước, nhận sau.',
        'Khuôn hỏi: giaithich <id>.',
        'Gõ: giaithich v1 rồi dòng sau nhan v1 (diff đã được xem sẵn trong cảnh của đề).',
      ],
      sampleSolution: `giaithich v1
nhan v1`,
    },
    homework:
      'Làm thật (không chấm): quay lại dòng diff bạn không hiểu ở homework bài "Xem diff" và hỏi công cụ thật: "giải thích đoạn này bằng lời thường cho người không biết code". Rồi hỏi tiếp một câu "vì sao chọn cách này?". Ghi lại câu trả lời khiến bạn hiểu thêm hệ thống của mình — và tự chấm: trước khi hỏi, bạn có dám sửa vùng đó không? Sau khi hỏi thì sao?',
    srsCards: [
      {
        hoi: 'Ba tình huống nào khiến lệnh giaithich thành công cụ ăn tiền?',
        dap: '① Diff có dòng không hiểu — hỏi trước khi nhận; ② mở lại dự án cũ đã quên — đọc lại nhanh nhất; ③ sắp đụng vùng nhạy cảm — nơi luật là phải hiểu mới được đụng.',
      },
      {
        hoi: 'Sau khi agent giải thích xong một phần, nên hỏi tiếp những câu nào?',
        dap: '"Vì sao chọn cách này mà không phải cách kia?" và "nếu mai cần thêm X thì phần nào phải đổi?" — mỗi câu trả lời là một viên gạch hiểu hệ thống.',
      },
      {
        hoi: 'Thói quen 60 giây nào tách người vibe code lâu năm khỏi người mới?',
        dap: 'Sau mỗi tính năng nhận vào, gõ giaithich và đọc — dự án của họ nhờ vậy không có vùng tối nào mình không nói lại được bằng lời thường.',
      },
    ],
  },
]

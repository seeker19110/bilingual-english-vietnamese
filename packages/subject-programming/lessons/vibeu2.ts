// lessons/vibeu2.ts — Chương C2 "Lưới an toàn" của khoá "Vibe Code — từ số 0 đến chuyên gia"
// (đặc tả docs/specs/2026-08-31-khoa-vibe-code.md §③b).
//
// unitId 'vibe-u2' là unit ảo (xem lessons/vibeu1.ts đầu file cho lời giải thích đầy đủ).
// Năm bài bám đúng bảng C2 của đề cương §③b.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const VIBE_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'vibe-u2-l1',
    unitId: 'vibe-u2',
    language: 'vibe',
    title: 'kiemtra — test là trọng tài',
    hook: '"Chắc chạy được rồi" là câu nói đắt nhất trong lập trình — nó không mất tiền ngay, nó mất tiền vào lúc bạn ít ngờ tới nhất. Bài này thay cảm giác bằng bằng chứng.',
    theory:
      'Lệnh kiemtra chạy bộ test trên MỌI tính năng đã nhan vào dự án và báo kết quả xanh/đỏ theo từng cái. Đây là TRỌNG TÀI — không phải bạn, không phải AI, quyết định "xong hay chưa".\n\nNhịp bắt buộc: mỗi lần nhan xong, test tự động quay về "chua-chay" (bạn đã thấy ở bài "Nhận & sửa"). Đó là lời nhắc: đừng coi ĐÃ NHẬN = ĐÃ XONG. Nhận chỉ là "vào dự án", kiemtra mới là "kiểm chứng nó làm đúng".\n\nMẹo đọc kết quả: dòng "X xanh, Y do" cho biết CÓ VẤN ĐỀ hay không; dòng "DO <id> (...)" đi kèm cho biết vấn đề Ở ĐÂU và VÌ SAO — luôn đọc cả hai, đừng chỉ nhìn số.\n\nVì sao "cảm giác" không đủ? Vì AI viết code chính rất giỏi, và phần lớn lỗi không nằm ở đường đi thường mà ở những ca ít gặp — bài kế tiếp đào sâu đúng điều đó.',
    workedExample: {
      code: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"
xemdiff v1
nhan v1
kiemtra`,
      stdinLines: [],
    },
    predict: {
      code: `mota "them nut xoa mot khoan chi trong so thu chi, bao khi danh sach rong"
xemdiff v1
nhan v1
kiemtra`,
      question: 'Mô tả có nhắc ca rỗng ngay từ đầu — kiemtra cho kết quả gì?',
      choices: ['xanh het', '1 do', 'Bao chua nhan tinh nang nao', 'Khong in gi'],
      answerIndex: 0,
      explain:
        'Mô tả gốc đã nhắc "bao khi danh sach rong" (ca biên) nên bản nháp không bị đánh dấu quên ca biên — kiểm tra ra xanh hết. Bài sau sẽ thấy điều ngược lại khi mô tả quên nhắc.',
    },
    parsons: {
      prompt: 'Xếp đúng nhịp "nhận rồi phải kiểm": mô tả → xem → nhận → kiểm tra.',
      lines: [
        'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
        'xemdiff v1',
        'nhan v1',
        'kiemtra',
      ],
    },
    make: {
      prompt:
        'Bạn vừa nhận tính năng "máy tính chia tiền" vào dự án (đề dựng sẵn cảnh, mô tả gốc đã nhắc ca số 0).\n\n1. Gõ lệnh kiểm tra để có bằng chứng, không dựa vào cảm giác.',
      starterCode: `# 1. kiem tra, dung tin vao cam giac\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
            'xemdiff v1',
            'nhan v1',
          ],
          expected: 'xanh het',
          match: 'contains',
          hidden: false,
          label: 'Kiểm tra ra xanh hết vì mô tả đã nhắc ca biên',
        },
      ],
      hints: [
        'Chỉ một lệnh, không tham số.',
        'Tên lệnh là chính khái niệm bài học: kiểm tra.',
        'Gõ: kiemtra.',
      ],
      sampleSolution: `kiemtra`,
    },
    homework:
      'Làm thật (không chấm): với dự án bạn đang làm trên công cụ thật, hỏi thẳng: "viết test cho tính năng vừa xong". Chạy test đó. Ghi lại: nó có bắt ra vấn đề gì bạn không ngờ tới không? Nếu chưa từng viết test trong đời, đây là lần đầu bạn thấy "trọng tài" hoạt động thay vì tự đoán.',
    srsCards: [
      {
        hoi: 'Vì sao lệnh kiemtra được gọi là "trọng tài" thay vì để cảm giác quyết định?',
        dap: 'Vì "chắc chạy được" không phải bằng chứng — kiemtra chạy test thật và báo xanh/đỏ theo từng tính năng, tách rõ ĐÃ NHẬN (vào dự án) khỏi ĐÃ XONG (được kiểm chứng).',
      },
      {
        hoi: 'Sau lệnh nhan, trạng thái test tự động chuyển về đâu và vì sao?',
        dap: '"chua-chay" — nhắc rằng nhận chỉ là đưa vào dự án, chưa phải kiểm chứng; phải chủ động gõ kiemtra mới có bằng chứng.',
      },
    ],
  },
  {
    id: 'vibe-u2-l2',
    unitId: 'vibe-u2',
    language: 'vibe',
    title: 'Ca biên — AI hay quên ca rỗng/số 0',
    hook: 'AI viết đường-đi-thường cực giỏi: nhập số, tính, ra kết quả — mượt. Nhưng hỏi "nếu người dùng nhập số 0 thì sao?" thì im lặng là câu trả lời phổ biến nhất. Bài này biến sự im lặng đó thành thứ bạn PHÁT HIỆN được, không phải thứ bạn hy vọng không xảy ra.',
    theory:
      'CA BIÊN là những đầu vào KHÁC với trường hợp thường: danh sách RỖNG, số 0, số ÂM, chuỗi QUÁ DÀI, mất mạng giữa chừng. Đây là danh sách nên thuộc lòng khi đọc bất cứ mô tả nào của mình: "mình đã nói AI xử lý ca nào trong số này chưa?"\n\nMô phỏng cài đúng thói quen thật của AI ngoài đời: mô tả KHÔNG nhắc ca biên nào → bản nháp bị đánh dấu "quên ca biên" ngầm; kiemtra sẽ bắt được, in rõ "DO <id> (...): quen ca bien". Đây không phải AI cố tình làm ẩu — nó chỉ làm đúng những gì được mô tả, và ca biên là thứ hay bị BỎ SÓT khi mô tả, không phải khi viết code.\n\nCách sửa: sua <id> "<góp ý nhắc ca biên cụ thể>" rồi xemdiff lại, nhan lại, kiemtra lại. Vòng này (đỏ → sửa → xanh) chính là công việc thật của một buổi vibe code — không phải thất bại, mà là quy trình.\n\nGóp ý mơ hồ kiểu "xử lý lỗi đi" không đủ — nói rõ CA NÀO: "khi danh sách rỗng thì báo chưa có dữ liệu" mới là góp ý AI sửa trúng.',
    workedExample: {
      code: `mota "them nut doi mau giao dien sang xanh duong cho de nhin"
xemdiff v1
nhan v1
kiemtra`,
      stdinLines: [],
    },
    predict: {
      code: `kiemtra`,
      question:
        'Bản nháp v1 đã nhận, mô tả gốc chỉ nói "doi mau nut" — không nhắc ca biên nào. kiemtra cho kết quả gì?',
      choices: [
        '1 do, neu dich danh "quen ca bien"',
        'xanh het vi viec don gian khong can ca bien',
        'Bao loi he thong khong kiem duoc',
        'Tu dong bo qua vi khong quan trong',
      ],
      answerIndex: 0,
      explain:
        'Quy tắc là quy tắc: mô tả không nhắc ca biên nào thì bản nháp mang cờ quên ca biên — dù việc "trông có vẻ đơn giản". Đây chính là bài học: chủ quan "chắc không cần" là cách lỗi ca biên lọt vào sản phẩm thật.',
    },
    parsons: {
      prompt:
        'Xếp đúng vòng sửa ca biên: kiểm ra đỏ → sửa kèm ca biên → xem lại → nhận lại → kiểm lại.',
      lines: [
        'kiemtra',
        'sua v1 "them xu ly khi ten nhap vao la chuoi rong thi bao chua co ten"',
        'xemdiff v1',
        'nhan v1',
        'kiemtra',
      ],
    },
    make: {
      prompt:
        'Bản nháp v1 (đổi màu nút) đã nhận nhưng mô tả gốc quên nhắc ca biên (đề dựng sẵn cảnh).\n\n1. Kiểm tra để thấy đỏ.\n2. Sửa v1 kèm góp ý nhắc RÕ một ca biên cụ thể (chuỗi rỗng, số 0…).\n3. Xem lại diff, nhận lại.\n4. Kiểm lại cho xanh.',
      starterCode: `# 1. kiem tra truoc\n\n# 2. sua kem ca bien cu the\n\n# 3. xem lai roi nhan lai\n\n# 4. kiem lai\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them nut doi mau giao dien sang xanh duong cho de nhin"',
            'xemdiff v1',
            'nhan v1',
          ],
          expected: 'xanh het',
          match: 'contains',
          hidden: false,
          label: 'Sau khi sửa kèm ca biên, kiểm tra ra xanh hết',
        },
      ],
      hints: [
        'Bốn bước đúng thứ tự đề: kiemtra (thấy đỏ) → sua v1 "<góp ý nhắc ca biên>" → xemdiff v1 → nhan v1 → kiemtra.',
        'Góp ý phải nhắc MỘT từ khoá ca biên cụ thể: rỗng, số 0, âm, quá dài, giới hạn, lỗi.',
        'Mẫu: kiemtra rồi sua v1 "them xu ly khi ten nhap vao la chuoi rong thi bao chua co ten" rồi xemdiff v1 rồi nhan v1 rồi kiemtra.',
      ],
      sampleSolution: `kiemtra
sua v1 "them xu ly khi ten nhap vao la chuoi rong thi bao chua co ten"
xemdiff v1
nhan v1
kiemtra`,
    },
    homework:
      'Làm thật (không chấm): lấy một tính năng AI vừa viết cho bạn (công cụ thật) và tự tay thử 4 ca biên: rỗng, số 0, số âm, chuỗi rất dài. Ghi lại ca nào làm nó hỏng. Đây là công việc "kiểm thử thủ công" — thứ mọi kỹ sư đều làm dù có AI hay không.',
    srsCards: [
      {
        hoi: 'Danh sách ca biên cần rà khi đọc lại một mô tả gồm những gì?',
        dap: 'Rỗng, số 0, số âm, chuỗi/dữ liệu quá dài, và lỗi giữa chừng (mất mạng…) — hỏi "mình đã nói AI xử lý ca nào trong số này chưa?" trước khi coi mô tả là đủ.',
      },
      {
        hoi: 'Vì sao AI hay quên ca biên không phải vì nó "làm ẩu"?',
        dap: 'AI làm đúng những gì được MÔ TẢ — ca biên là thứ hay bị bỏ sót khi VIẾT MÔ TẢ, không phải khi viết code; sửa gốc rễ là mô tả rõ hơn, không phải trách AI.',
      },
      {
        hoi: 'Vòng "đỏ → sửa → xanh" khi gặp ca biên bị bỏ sót nên hiểu thế nào?',
        dap: 'Đó là QUY TRÌNH bình thường của vibe code có kỷ luật, không phải thất bại — kiểm ra đỏ, sửa kèm góp ý nhắc rõ ca biên, xem lại, nhận lại, kiểm lại.',
      },
    ],
  },
  {
    id: 'vibe-u2-l3',
    unitId: 'vibe-u2',
    language: 'vibe',
    title: 'Secret không bao giờ vào mô tả',
    hook: 'Khoá API của bạn có giá — ai cầm được nó là tiêu tiền bằng thẻ của bạn. Gõ nó thẳng vào ô chat với AI thì nó đi vào lịch sử chat, log máy chủ, có khi cả ảnh chụp màn hình bạn lỡ chia sẻ. Bài này dạy luật cứng nhất của khoá: secret KHÔNG BAO GIỜ vào mô tả.',
    theory:
      'SECRET = khoá API, mật khẩu, token — bất cứ chuỗi nào mà ai cầm được cũng dùng thay bạn được. Ba lý do nó không được vào mô tả:\n1. Mô tả có thể nằm trong LỊCH SỬ CHAT lưu lại vô thời hạn.\n2. Log của công cụ/máy chủ có thể ghi lại nguyên văn.\n3. Bạn có thể lỡ dán màn hình chia sẻ lúc đang trình bày.\n\nAgent trong khoá này từ chối thẳng khi mô tả chứa chuỗi dạng secret ("sk-…", "mat khau la…", "api key: …") — không tạo bản nháp, không "giúp bạn cho lẹ". Đây là luật cứng nhất khoá vì hậu quả không thể hoàn tác: secret lộ rồi thì phải HUỶ NÓ (thu hồi khoá, đổi mật khẩu), không có "quaylai" nào cứu được thứ đã rời khỏi máy bạn.\n\nĐường đúng: secret nằm trong BIẾN MÔI TRƯỜNG (file .env, kho secret của nền tảng deploy) — mô tả chỉ nói "lấy khoá từ biến môi trường", KHÔNG BAO GIỜ dán giá trị thật. Agent đọc biến môi trường lúc chạy, không cần biết giá trị lúc bạn mô tả.\n\nDự án DHCB mà bạn đang học tự áp đúng luật này (CLAUDE.md mục 6: "KHÔNG đưa API key/mật khẩu vào code — luôn dùng .env").',
    workedExample: {
      code: `mota "them phan goi API thoi tiet de hien nhiet do, khoa lay tu bien moi truong, bao khi goi that bai"`,
      stdinLines: [],
    },
    predict: {
      code: `mota "them phan goi API thoi tiet voi khoa sk-abc12345xyz de hien nhiet do"`,
      question: 'Mô tả này có dán thẳng một chuỗi dạng khoá API — agent làm gì?',
      choices: [
        'Tu choi, khong tao gi ca',
        'Tao ban nhap binh thuong, dung khoa do luon',
        'Tao ban nhap nhung xoa khoa di',
        'Hoi lai co chac muon dung khoa nay khong',
      ],
      answerIndex: 0,
      explain:
        'Luật cứng: chuỗi dạng secret trong mô tả → từ chối thẳng, không tạo bản nháp, không thương lượng. Hậu quả lộ secret không hoàn tác được nên đây là luật không có ngoại lệ, khác với luật ca biên có thể sửa-rồi-qua.',
    },
    parsons: {
      prompt:
        'Xếp đúng cách giao việc gọi API mà không lộ khoá: nói rõ lấy khoá từ đâu, không dán giá trị thật (ba phần của cùng một mô tả, đúng thứ tự đọc).',
      lines: [
        'mota "them phan goi API thoi tiet de hien nhiet do,',
        'khoa lay tu bien moi truong,',
        'bao khi goi that bai"',
      ],
    },
    make: {
      prompt:
        'Bạn muốn thêm tính năng gọi API tỷ giá ngoại tệ để hiện trong app chia tiền.\n\n1. Viết mô tả ĐÚNG cách: nói rõ khoá lấy từ biến môi trường, KHÔNG dán bất kỳ chuỗi khoá thật nào.',
      starterCode: `# 1. mo ta goi API ma khong lo khoa\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'ban nhap v1',
          match: 'contains',
          hidden: false,
          label: 'Mô tả không chứa secret nên tạo được bản nháp bình thường',
        },
      ],
      hints: [
        'Đừng bao giờ gõ chuỗi dạng "sk-..." hay "mat khau la ..." trong mô tả — kể cả để thử.',
        'Nói RÕ nguồn lấy khoá: "khoa lay tu bien moi truong" — không kèm giá trị.',
        'Mẫu: mota "them phan goi API ty gia ngoai te de hien trong app, khoa lay tu bien moi truong, bao khi goi that bai".',
      ],
      sampleSolution: `mota "them phan goi API ty gia ngoai te de hien trong app, khoa lay tu bien moi truong, bao khi goi that bai"`,
    },
    homework:
      'Làm thật (không chấm, CẨN THẬN): mở project bạn đang vibe code — tìm xem có khoá API/mật khẩu nào bị gõ THẲNG vào code hay lịch sử chat không (tìm chữ "key", "password", "token", "sk-"). Nếu có: thu hồi khoá đó ngay (đổi khoá mới ở nơi cấp), rồi chuyển sang biến môi trường. Đây không phải bài tập — nếu tìm thấy thật, đó là việc phải làm hôm nay, không phải để dành.',
    srsCards: [
      {
        hoi: 'Ba lý do secret không được vào mô tả cho AI là gì?',
        dap: 'Mô tả có thể nằm trong lịch sử chat lưu vô thời hạn; log công cụ/máy chủ có thể ghi nguyên văn; và có thể lỡ dán vào ảnh chụp màn hình chia sẻ.',
      },
      {
        hoi: 'Vì sao luật cấm secret trong mô tả không có ngoại lệ, khác luật ca biên?',
        dap: 'Hậu quả không hoàn tác được: secret lộ rồi phải HUỶ nó (thu hồi khoá, đổi mật khẩu) — không có "quaylai" nào lấy lại được thứ đã rời khỏi máy, khác lỗi ca biên có thể sửa-rồi-qua.',
      },
      {
        hoi: 'Đường đúng để agent dùng được API key mà mô tả không lộ giá trị thật?',
        dap: 'Đặt khoá vào BIẾN MÔI TRƯỜNG (file .env, kho secret của nền tảng); mô tả chỉ nói "lấy khoá từ biến môi trường" — agent đọc lúc chạy, không cần biết giá trị lúc mô tả.',
      },
    ],
  },
  {
    id: 'vibe-u2-l4',
    unitId: 'vibe-u2',
    language: 'vibe',
    title: 'luu/lichsu — mốc trước thay đổi lớn',
    hook: 'Người leo núi cắm chốt an toàn không phải vì họ định ngã — mà vì NẾU ngã, họ chỉ rơi tới chốt gần nhất, không phải rơi hết cả vách núi. Mốc trong vibe code đóng đúng vai trò đó.',
    theory:
      'Lệnh luu "<tên mốc>" ghi lại trạng thái dự án NGAY LÚC NÀY — số tính năng đã nhận, làm điểm có thể quay về sau. lichsu liệt kê mọi mốc đã lưu, đọc được như nhật ký dự án.\n\nLƯU KHI NÀO — hai thời điểm chuẩn:\n1. TRƯỚC một thay đổi lớn (sắp cho AI sửa một phần quan trọng, sắp thử hướng mới chưa chắc đúng).\n2. SAU mỗi lần kiemtra ra xanh hết (chốt một cột mốc chắc chắn hoạt động).\n\nTÊN MỐC phải TỰ GIẢI THÍCH — sáu tháng sau đọc lichsu phải hiểu ngay không cần nhớ lại: "ban chay duoc dau tien" tốt hơn "moc 1", "truoc khi doi sang thanh toan moi" tốt hơn "luu tam".\n\nMốc khác NHAN ở chỗ nào? nhan đưa MỘT bản nháp vào dự án; luu chụp lại TOÀN BỘ trạng thái dự án tại một thời điểm — như ảnh toàn cảnh chứ không phải một bức tường. Bài sau (quaylai) sẽ dùng chính mốc này để hoàn tác.',
    workedExample: {
      code: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"
xemdiff v1
nhan v1
kiemtra
luu "ban chay duoc dau tien"
lichsu`,
      stdinLines: [],
    },
    predict: {
      code: `luu "thu nghiem"
luu "thu nghiem"
lichsu`,
      question: 'Lưu hai mốc CÙNG TÊN "thu nghiem" — lichsu in ra bao nhiêu dòng mốc?',
      choices: [
        '2 dong, cung ten',
        '1 dong (mac dinh gop trung ten)',
        'Bao loi trung ten',
        '0 dong',
      ],
      answerIndex: 0,
      explain:
        'Mỗi lần luu là một mốc MỚI, kể cả tên trùng — mô phỏng không tự gộp. Đây cũng là lý do bài học nhấn mạnh: tên mốc PHẢI tự giải thích, vì trùng tên vô nghĩa như "thu nghiem" x2 thì lichsu chẳng còn tác dụng nhật ký.',
    },
    parsons: {
      prompt:
        'Xếp đúng nhịp chốt một cột mốc: nhận → kiểm xanh → lưu mốc có tên rõ nghĩa → xem lại lịch sử.',
      lines: ['nhan v1', 'kiemtra', 'luu "ban chay duoc dau tien"', 'lichsu'],
    },
    make: {
      prompt:
        'Bạn vừa nhận và kiểm tra xanh tính năng đầu tiên của dự án (đề dựng sẵn cảnh).\n\n1. Lưu một mốc với TÊN TỰ GIẢI THÍCH (nói rõ đây là gì).\n2. Xem lại lịch sử mốc để chắc chắn đã lưu.',
      starterCode: `# 1. luu moc, dat ten ro nghia\n\n# 2. xem lai lich su\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
            'xemdiff v1',
            'nhan v1',
            'kiemtra',
          ],
          expected: '(1 tinh nang)',
          match: 'contains',
          hidden: false,
          label: 'Mốc ghi đúng số tính năng đã nhận (1)',
        },
      ],
      hints: [
        'Hai lệnh: luu "<tên mốc>" rồi lichsu.',
        'Tên mốc để trong nháy kép, nên nói rõ đây là gì để đọc lại còn hiểu.',
        'Mẫu: luu "ban chay duoc dau tien" rồi lichsu.',
      ],
      sampleSolution: `luu "ban chay duoc dau tien"
lichsu`,
    },
    homework:
      'Làm thật (không chấm): công cụ thật của bạn hầu như luôn có Git đi kèm (khoá Git của DHCB dạy riêng phần này). Sau tính năng tiếp theo bạn hoàn thành và test xanh, hãy commit với một tên mô tả rõ ràng — coi đó là "luu" ngoài đời thật. Ghi lại tên bạn đặt.',
    srsCards: [
      {
        hoi: 'Hai thời điểm chuẩn nên lưu một mốc là gì?',
        dap: 'TRƯỚC một thay đổi lớn (sắp thử hướng chưa chắc đúng), và SAU mỗi lần kiểm tra ra xanh hết — chốt một điểm chắc chắn hoạt động.',
      },
      {
        hoi: 'Tên mốc tốt phải đạt tiêu chuẩn nào?',
        dap: 'Tự giải thích — sáu tháng sau đọc lichsu hiểu ngay không cần nhớ lại, kiểu "ban chay duoc dau tien" thay vì "moc 1" hay "luu tam".',
      },
      {
        hoi: 'Lệnh luu khác lệnh nhan ở phạm vi ghi lại thứ gì?',
        dap: 'nhan đưa MỘT bản nháp vào dự án; luu chụp lại TOÀN BỘ trạng thái dự án tại một thời điểm — như ảnh toàn cảnh, không phải một bức tường riêng lẻ.',
      },
    ],
  },
  {
    id: 'vibe-u2-l5',
    unitId: 'vibe-u2',
    language: 'vibe',
    title: 'quaylai — hoàn tác không sợ hãi',
    hook: 'Câu hỏi "lỡ AI phá hỏng mọi thứ thì sao?" là lý do nhiều người mới không dám để AI thử điều gì táo bạo. Câu trả lời của bài này: có mốc thì không có gì "hỏng mọi thứ" cả — chỉ có "quay lại điểm chắc chắn" thôi.',
    theory:
      'Lệnh quaylai đưa dự án về đúng trạng thái của MỐC GẦN NHẤT: mọi tính năng đã nhan SAU mốc đó quay về "cho-xem" — không mất, chỉ bị đưa RA KHỎI dự án, sẵn sàng để bạn xem lại/sửa/nhận lại nếu muốn.\n\nĐây là lý do vòng lặp §③ luôn nhắc "luu TRƯỚC thay đổi lớn": có mốc thì dám cho AI thử cách táo bạo, dám giao việc mờ hơn bình thường, vì biết chắc CÓ ĐƯỜNG VỀ. Không có mốc, quaylai từ chối kèm đúng lời nhắc: đây là hậu quả của việc quên lưu, không phải lỗi hệ thống.\n\nSau quaylai, test tự động về "chua-chay" — dự án cần được kiểm lại từ đầu, đúng logic "test đi theo trạng thái tính năng hiện tại", không phải trạng thái quá khứ.\n\nTâm lý quan trọng hơn cú pháp: người mới sợ AI vì sợ hỏng không sửa được. Thợ có kỷ luật không sợ AI thử sai — vì họ luôn có mốc. Nỗi sợ giảm đi không phải vì AI đáng tin hơn, mà vì HỌ có lưới an toàn.',
    workedExample: {
      code: `mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"
xemdiff v1
nhan v1
luu "ban chay duoc dau tien"
mota "them tinh nang gui email tu dong cho tung nguoi, bao khi dia chi rong"
xemdiff v2
nhan v2
quaylai
vibe`,
      stdinLines: [],
    },
    predict: {
      code: `quaylai`,
      question: 'Dự án chưa hề gọi luu lần nào — quaylai làm gì?',
      choices: [
        'Tu choi, kem loi khuyen phai luu truoc',
        'Quay ve du an rong',
        'Khong lam gi, im lang',
        'Bao loi he thong khong xac dinh',
      ],
      answerIndex: 0,
      explain:
        'Không có mốc thì không có gì để "quay về" — agent từ chối và nhắc thẳng: đây là lý do phải luu TRƯỚC khi cho AI làm thay đổi lớn. Bài học găm ở đây: mốc là công cụ phòng ngừa, không phải công cụ cấp cứu tự nhiên mà có.',
    },
    parsons: {
      prompt:
        'Xếp đúng vòng "thử táo bạo có lưới đỡ": lưu mốc → thử tính năng mới → không ưng → quay lại.',
      lines: [
        'luu "ban chay duoc dau tien"',
        'mota "them tinh nang gui email tu dong cho tung nguoi, bao khi dia chi rong"',
        'xemdiff v2',
        'nhan v2',
        'quaylai',
      ],
    },
    make: {
      prompt:
        'Dự án đã có mốc "ban chay duoc dau tien" (1 tính năng), sau đó bạn thử thêm một tính năng nữa nhưng giờ muốn quay lại (đề dựng sẵn cảnh: đã có v2 mới nhận sau mốc).\n\n1. Quay về mốc gần nhất.\n2. Xem lại trạng thái dự án để xác nhận.',
      starterCode: `# 1. quay ve moc gan nhat\n\n# 2. xac nhan lai trang thai\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them may tinh chia tien an trua: nhap tong tien va so nguoi, ra tien moi nguoi, bao loi khi so nguoi bang 0"',
            'xemdiff v1',
            'nhan v1',
            'luu "ban chay duoc dau tien"',
            'mota "them tinh nang gui email tu dong cho tung nguoi, bao khi dia chi rong"',
            'xemdiff v2',
            'nhan v2',
          ],
          expected: 'tinh nang da nhan: 1',
          match: 'contains',
          hidden: false,
          label: 'Sau khi quay lại, dự án chỉ còn đúng 1 tính năng (đúng mốc)',
        },
      ],
      hints: [
        'Hai lệnh: quaylai rồi vibe (để xem lại trạng thái).',
        'quaylai không cần tham số — nó tự tìm mốc GẦN NHẤT.',
        'Gõ: quaylai rồi dòng sau vibe.',
      ],
      sampleSolution: `quaylai
vibe`,
    },
    homework:
      'Làm thật (không chấm): thử một thay đổi bạn KHÔNG chắc chắn trên công cụ thật (đổi cả cách trình bày một trang, ví dụ) sau khi đã commit (mốc). Không ưng thì dùng lệnh hoàn tác của Git (git checkout/git reset — khoá Git dạy chi tiết) để quay lại. Cảm nhận sự khác biệt tâm lý so với khi bạn thử mà KHÔNG có mốc trước đó — ghi lại một câu.',
    srsCards: [
      {
        hoi: 'Sau lệnh quaylai, những tính năng nhận SAU mốc đi đâu — mất hẳn hay còn lại?',
        dap: 'KHÔNG mất — quay về trạng thái "cho-xem", bị đưa ra khỏi dự án nhưng vẫn xem lại/sửa/nhận lại được nếu muốn.',
      },
      {
        hoi: 'Vì sao có thói quen lưu mốc lại giúp người ta dám cho AI thử cách táo bạo hơn?',
        dap: 'Vì biết chắc có ĐƯỜNG VỀ — nỗi sợ AI làm hỏng không giảm vì AI đáng tin hơn, mà vì người dùng có lưới an toàn (mốc) để quay lại nếu sai.',
      },
      {
        hoi: 'quaylai từ chối trong trường hợp nào, và vì sao đó không phải lỗi hệ thống?',
        dap: 'Khi CHƯA từng luu mốc nào — đó là hậu quả của việc quên lưu trước, không phải lỗi hệ thống; bài học là phải lưu mốc TRƯỚC khi cần, không phải lúc cần mới nhớ ra.',
      },
    ],
  },
]

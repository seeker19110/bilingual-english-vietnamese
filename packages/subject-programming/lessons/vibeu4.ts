// lessons/vibeu4.ts — Chương C4 "Bậc chuyên gia" của khoá "Vibe Code — từ số 0 đến chuyên
// gia" (đặc tả docs/specs/2026-08-31-khoa-vibe-code.md §③b).
//
// unitId 'vibe-u4' là unit ảo (xem lessons/vibeu1.ts đầu file cho lời giải thích đầy đủ).
// Năm bài bám đúng bảng C4 của đề cương §③b — chương chốt khoá, tổng hợp toàn bộ kỷ luật
// đã học ở C1–C3 thành checklist chuyên gia.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const VIBE_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'vibe-u4-l1',
    unitId: 'vibe-u4',
    language: 'vibe',
    title: 'Đặc tả có mục "KHÔNG làm"',
    hook: 'Giao việc mà không nói RANH GIỚI là mời gọi AI làm luôn cả những thứ bạn chẳng cần — mỗi thứ thừa đó là một chỗ có thể hỏng mà bạn không ngờ tới. Dân chuyên nghiệp luôn viết rõ "và tuyệt đối KHÔNG làm gì" bên cạnh "làm gì".',
    theory:
      'DHCB — chính dự án bạn đang học — dùng một khuôn đặc tả 6 ô cho mọi việc giao (xem CLAUDE.md mục 2: "khuôn đặc tả giao việc"), trong đó có một ô bắt buộc: **phạm vi, với mục "KHÔNG làm"**. Bài này chưng cất đúng ý đó cho vibe code cá nhân.\n\nVì sao "không làm" quan trọng ngang "làm": AI có xu hướng LÀM THÊM khi thấy cơ hội — sửa luôn cả phần liên quan, "tiện thể" cải tiến chỗ khác. Mỗi thứ thêm ngoài ý bạn là một chỗ diff dài hơn, khó đọc hơn, và có khả năng phá thứ đang chạy tốt.\n\nCách viết: sau khi mô tả THỨ CẦN, thêm một câu "khong lam: …" liệt kê rõ ranh giới. Ví dụ: "them nut thich cho bai viet... khong lam: khong doi giao dien cac trang khac, khong them binh luan."\n\nMục "không làm" không làm chậm bạn — nó CHẶN việc phải dọn dẹp sau này khi AI đã "tiện thể" đổi thứ bạn không hỏi.',
    workedExample: {
      code: `mota "them nut thich cho bai viet, bao khi bai chua ton tai. khong lam: khong doi giao dien trang khac, khong them binh luan"
xemdiff v1`,
      stdinLines: [],
    },
    predict: {
      code: `mota "them nut thich cho bai viet, bao khi bai chua ton tai"`,
      question: 'Mô tả này ĐỦ RÕ nhưng KHÔNG có mục "khong lam" — agent xử lý ra sao?',
      choices: [
        'Van tao ban nhap binh thuong (mo phong khong bat buoc muc nay)',
        'Tu choi vi thieu muc khong lam',
        'Tu dong them muc khong lam ho',
        'Hoi lai nguoi dung co muon them muc khong lam khong',
      ],
      answerIndex: 0,
      explain:
        'Mô phỏng không BẮT BUỘC mục "khong lam" (chỉ luật 1 mơ hồ và luật 4 secret mới chặn cứng) — nhưng bài học vẫn khuyên NÊN thêm, vì đây là thói quen chuyên gia tự nguyện, không phải luật máy móc bắt buộc. Kỷ luật thật nằm ở người, không phải ở cổng chặn.',
    },
    parsons: {
      prompt: 'Xếp một mô tả chuyên gia: nói thứ cần làm → nói rõ ranh giới không được đụng.',
      lines: [
        'mota "them nut thich cho bai viet, bao khi bai chua ton tai.',
        'khong lam: khong doi giao dien trang khac,',
        'khong them binh luan"',
      ],
    },
    make: {
      prompt:
        'Bạn muốn thêm "nút thích" cho bài viết, nhưng KHÔNG muốn AI tiện thể đụng vào giao diện trang khác.\n\n1. Viết mô tả có đủ vế cần làm + một vế "khong lam" liệt kê rõ ranh giới.',
      starterCode: `# 1. mo ta co muc "khong lam"\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'ban nhap v1',
          match: 'contains',
          hidden: false,
          label: 'Mô tả đủ rõ (kèm ranh giới) tạo được bản nháp',
        },
      ],
      hints: [
        'Mô tả vẫn phải đủ ba vế cũ (ai dùng, vào/ra, ca đặc biệt) — thêm câu "khong lam: ..." vào CUỐI.',
        'Ví dụ ranh giới: "khong doi giao dien trang khac, khong them binh luan".',
        'Mẫu: mota "them nut thich cho bai viet, bao khi bai chua ton tai. khong lam: khong doi giao dien trang khac, khong them binh luan".',
      ],
      sampleSolution: `mota "them nut thich cho bai viet, bao khi bai chua ton tai. khong lam: khong doi giao dien trang khac, khong them binh luan"`,
    },
    homework:
      'Làm thật (không chấm): xem lại một mô tả bạn đã giao ở các bài homework trước. Viết thêm cho nó một câu "và tuyệt đối không được đụng vào: …". Giao lại trên công cụ thật và so diff với lần trước — diff lần này có gọn hơn không?',
    srsCards: [
      {
        hoi: 'Vì sao mục "KHÔNG làm" trong đặc tả quan trọng ngang mục "LÀM"?',
        dap: 'AI có xu hướng làm thêm khi thấy cơ hội (sửa luôn phần liên quan, "tiện thể" cải tiến) — mỗi thứ thêm ngoài ý muốn là một chỗ diff dài hơn và có khả năng phá thứ đang chạy tốt.',
      },
      {
        hoi: 'DHCB (dự án bạn đang học) áp dụng nguyên tắc "không làm" ở đâu?',
        dap: 'Trong khuôn đặc tả giao việc 6 ô (docs/templates/dac-ta-tinh-nang.md) — ô "phạm vi" luôn có mục "KHÔNG làm" bắt buộc bên cạnh việc phải làm.',
      },
    ],
  },
  {
    id: 'vibe-u4-l2',
    unitId: 'vibe-u4',
    language: 'vibe',
    title: 'Tiêu chí chấp nhận đo được TRƯỚC khi mô tả',
    hook: '"Xong chưa?" mà trả lời bằng cảm giác thì mỗi người một đáp án. Chuyên gia trả lời bằng một danh sách đo được, viết ra TRƯỚC khi giao việc — không phải bịa ra sau khi AI đã làm xong để biện minh.',
    theory:
      'TIÊU CHÍ CHẤP NHẬN là danh sách các điều kiện CỤ THỂ, ĐO ĐƯỢC để biết một tính năng đã "xong": không phải "chạy được" (mơ hồ) mà "nhập số 0 người thì báo lỗi rõ ràng, không crash" (đo được — thử là biết đúng/sai ngay).\n\nThứ tự đúng: viết tiêu chí chấp nhận TRƯỚC → dùng kehoach đối chiếu xem kế hoạch của AI có phủ hết tiêu chí không → rồi mới mota giao thật. Viết tiêu chí SAU khi đã nhận code là tự lừa mình: não người có xu hướng hạ chuẩn để khớp với thứ đã có sẵn ("thôi vậy cũng được").\n\nMẹo viết tiêu chí nhanh: biến mỗi VẾ trong mô tả ba-vế (bài "Mô tả như đặc tả") thành MỘT dòng kiểm được — vào/ra thành "nhập X thì ra Y đúng", ca đặc biệt thành "gặp Z thì phải K". Đây chính là cách bài Make của khoá này được chấm — mỗi testCase LÀ một tiêu chí chấp nhận viết dưới dạng kiểm tự động.',
    workedExample: {
      code: `kehoach "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"
mota "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"`,
      stdinLines: [],
    },
    predict: {
      code: `kehoach "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"
mota "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"
xemdiff v1`,
      question: 'Diff của v1 có nhắc tới nhánh xử lý ca biên không, dựa trên mô tả đã cho?',
      choices: [
        'Co — mo ta da nhac ro ca "% giam lon hon 100"',
        'Khong — mo ta qua chung chung',
        'Khong the biet neu chua kehoach',
        'Co nhung khong lien quan mo ta',
      ],
      answerIndex: 0,
      explain:
        'Mô tả đã nhắc rõ ca biên ("bao loi khi % giam lon hon 100") nên diff không bị đánh dấu thiếu nhánh ca biên — đúng nguyên tắc: mỗi vế trong mô tả là một tiêu chí, viết đủ vế thì diff phản ánh đủ.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự chuyên gia: xin kế hoạch → đối chiếu tiêu chí (đọc kỹ) → giao thật khi đã khớp.',
      lines: [
        'kehoach "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"',
        'vibe',
        'mota "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"',
      ],
    },
    make: {
      prompt:
        'Bạn muốn thêm "máy tính giảm giá". Trước khi giao thật:\n\n1. Xin kế hoạch cho việc đó (đủ ba vế, có ca đặc biệt % giảm > 100).\n2. Đối chiếu thấy ổn — giao thật bằng mota với ĐÚNG nội dung đó.',
      starterCode: `# 1. xin ke hoach\n\n# 2. giao that\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Ke hoach cho:',
          match: 'contains',
          hidden: false,
          label: 'Có kế hoạch trước khi giao thật',
        },
        {
          stdinLines: [],
          expected: 'ban nhap v1',
          match: 'contains',
          hidden: false,
          label: 'Sau đối chiếu, giao thật tạo được bản nháp',
        },
      ],
      hints: [
        'Hai lệnh, CÙNG một mô tả: kehoach "<mô tả>" rồi mota "<mô tả y hệt>".',
        'Mô tả phải nhắc rõ ca đặc biệt (số cụ thể như "lon hon 100") để tiêu chí đo được, không chung chung.',
        'Mẫu: kehoach "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100" rồi mota với đúng nội dung đó.',
      ],
      sampleSolution: `kehoach "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"
mota "them may tinh giam gia: nhap gia goc va % giam, ra gia sau giam, bao loi khi % giam lon hon 100"`,
    },
    homework:
      'Làm thật (không chấm): trước khi giao việc tiếp theo cho công cụ thật, viết ra GIẤY (hoặc file riêng) 3–5 tiêu chí đo được của việc đó, TRƯỚC khi mở chat với AI. Sau khi AI làm xong, tự chấm từng tiêu chí đúng/sai — đừng để kết quả AI làm ra quyết định lại tiêu chí của bạn.',
    srsCards: [
      {
        hoi: 'Tiêu chí chấp nhận "đo được" khác gì với cảm giác "chạy được"?',
        dap: 'Đo được là điều kiện cụ thể, kiểm là biết ngay đúng/sai (vd "nhập số 0 thì báo lỗi rõ, không crash"); "chạy được" là cảm giác mơ hồ, mỗi người hiểu một kiểu.',
      },
      {
        hoi: 'Vì sao phải viết tiêu chí chấp nhận TRƯỚC khi giao việc, không phải sau khi nhận code?',
        dap: 'Viết sau là tự lừa mình — não người có xu hướng hạ chuẩn để khớp với thứ đã có sẵn ("thôi vậy cũng được"); viết trước giữ tiêu chí khách quan.',
      },
    ],
  },
  {
    id: 'vibe-u4-l3',
    unitId: 'vibe-u4',
    language: 'vibe',
    title: 'Mỗi tính năng một mốc — nhịp chuyên gia',
    hook: 'Người mới lưu mốc khi nhớ ra. Chuyên gia lưu mốc như một PHẢN XẠ gắn liền với "xanh" — không cần nhớ, vì nó đã thành nhịp thở của công việc.',
    theory:
      'Bài này không có khái niệm mới — nó CỦNG CỐ một thói quen thành phản xạ: mỗi khi kiemtra báo "xanh het", NGAY LẬP TỨC luu một mốc trước khi làm bất cứ điều gì khác. Không phải "để lát nữa lưu", không phải "để cuối buổi lưu một thể" — XANH LÀ LƯU, tức thì.\n\nVì sao tức thì mà không gộp cuối buổi: giữa lúc xanh và lúc bạn "định lưu sau", bạn có thể lỡ tay giao thêm việc, AI có thể sửa gì đó, và mốc "sạch" đó biến mất — bạn phải làm lại bước kiểm để có một mốc đáng tin.\n\nlichsu khi đó không còn là danh sách rời rạc — nó là NHẬT KÝ DỰ ÁN đọc được: mỗi dòng là một cột mốc "đã hoạt động thật", tên tự giải thích, theo đúng thứ tự thời gian. Một dự án vibe code kỷ luật, mở lichsu ra là thấy cả câu chuyện phát triển của nó.',
    workedExample: {
      code: `mota "them nut xoa mot khoan chi, bao khi id khong ton tai"
xemdiff v1
nhan v1
kiemtra
luu "them xoa khoan chi"
mota "them sap xep danh sach theo ngay, bao khi danh sach rong"
xemdiff v2
nhan v2
kiemtra
luu "them sap xep theo ngay"
lichsu`,
      stdinLines: [],
    },
    predict: {
      code: `lichsu`,
      question:
        'Đã lưu hai mốc theo thứ tự "them xoa khoan chi" rồi "them sap xep theo ngay" — lichsu in ra thứ tự nào?',
      choices: [
        '1. them xoa khoan chi ...  2. them sap xep theo ngay ...',
        '1. them sap xep theo ngay ...  2. them xoa khoan chi ...',
        'Chi in moc gan nhat',
        'Sap xep theo bang chu cai ten moc',
      ],
      answerIndex: 0,
      explain:
        'lichsu giữ đúng THỨ TỰ THỜI GIAN lưu — không sắp xếp lại theo tên hay đảo ngược. Đọc từ trên xuống là đọc đúng câu chuyện phát triển của dự án.',
    },
    parsons: {
      prompt: 'Xếp nhịp "xanh là lưu" lặp hai lần cho hai tính năng khác nhau.',
      lines: ['kiemtra', 'luu "them xoa khoan chi"', 'kiemtra', 'luu "them sap xep theo ngay"'],
    },
    make: {
      prompt:
        'Dự án đã có hai tính năng nhận vào và kiểm xanh lần lượt — nhưng CHƯA lưu mốc nào (đề dựng sẵn cảnh: v1, v2 đã nhận, đã kiemtra xanh cả hai).\n\n1. Lưu mốc cho tính năng đầu.\n2. Lưu mốc cho tính năng sau (tên khác tính năng đầu).\n3. Xem lại lịch sử — phải thấy đủ hai mốc.',
      starterCode: `# 1. luu moc tinh nang dau\n\n# 2. luu moc tinh nang sau\n\n# 3. xem lai lich su\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them nut xoa mot khoan chi, bao khi id khong ton tai"',
            'xemdiff v1',
            'nhan v1',
            'kiemtra',
            'mota "them sap xep danh sach theo ngay, bao khi danh sach rong"',
            'xemdiff v2',
            'nhan v2',
            'kiemtra',
          ],
          expected: '2.',
          match: 'contains',
          hidden: false,
          label: 'Lịch sử có đủ hai mốc',
        },
      ],
      hints: [
        'Hai lệnh luu với TÊN KHÁC NHAU, rồi lichsu.',
        'Tên mốc phải tự giải thích, không trùng nhau.',
        'Mẫu: luu "them xoa khoan chi" rồi luu "them sap xep theo ngay" rồi lichsu.',
      ],
      sampleSolution: `luu "them xoa khoan chi"
luu "them sap xep theo ngay"
lichsu`,
    },
    homework:
      'Làm thật (không chấm): trong tuần làm việc tiếp theo trên công cụ thật của bạn, tự đặt luật "test xanh là commit ngay, không trì hoãn". Cuối tuần mở lại lịch sử commit — đọc nó như một câu chuyện. Có đoạn nào lịch sử "đứt quãng" (nhiều thay đổi gộp một commit mơ hồ) không? Đó là dấu hiệu bạn đã trì hoãn lúc nào đó.',
    srsCards: [
      {
        hoi: 'Phản xạ "xanh là lưu" nghĩa là gì, và vì sao phải làm NGAY LẬP TỨC?',
        dap: 'Mỗi khi kiemtra báo xanh hết thì luu mốc TỨC THÌ, không để dành cuối buổi — vì giữa lúc xanh và lúc "định lưu sau" có thể lỡ giao thêm việc, mốc sạch biến mất, phải kiểm lại mới có mốc đáng tin.',
      },
      {
        hoi: 'lichsu của một dự án kỷ luật đọc được như thứ gì?',
        dap: 'Một NHẬT KÝ DỰ ÁN: mỗi dòng là một cột mốc đã hoạt động thật, tên tự giải thích, đúng thứ tự thời gian — đọc từ trên xuống là đọc câu chuyện phát triển của dự án.',
      },
    ],
  },
  {
    id: 'vibe-u4-l4',
    unitId: 'vibe-u4',
    language: 'vibe',
    title: 'Khi nào KHÔNG vibe code — vùng cấm',
    hook: 'Có những phòng trong nhà bạn không giao chìa khoá cho thợ lạ, dù họ giỏi tới đâu. Vibe code cũng có những "phòng" như vậy — và bài học lớn nhất của chuyên gia không phải là biết dùng AI giỏi hơn, mà là biết KHI NÀO không dùng.',
    theory:
      'BỐN VÙNG CẤM — nơi mô tả rồi nhận mà không tự mình HIỂU RÕ từng dòng là đánh cược:\n1. THANH TOÁN — tính sai một dòng là mất tiền thật, của bạn hoặc của người dùng.\n2. BẢO MẬT/PHIÊN ĐĂNG NHẬP — sai một chỗ là ai cũng đăng nhập được vào tài khoản người khác.\n3. DỮ LIỆU NGƯỜI DÙNG THẬT — xoá/sửa nhầm là mất thứ không lấy lại được, ảnh hưởng người thật.\n4. HÀNH ĐỘNG KHÓ HOÀN TÁC — xoá hàng loạt, gửi hàng loạt (giống luật 3 của khoá Hermes).\n\nVùng cấm không có nghĩa là "cấm dùng AI ở đó" — nghĩa là NGƯỠNG HIỂU BIẾT phải cao hơn hẳn: bạn phải giaithich cho tới khi tự giải thích lại được TOÀN BỘ luồng, không chỉ đọc diff lướt qua. Nếu giaithich xong vẫn không tự nói lại được, đó là tín hiệu: việc này CẦN người biết code thật, hoặc bạn cần học thêm trước khi đụng vào.\n\nĐây là điểm khác biệt cốt lõi giữa "biết dùng AI" và "biết TRÁCH NHIỆM khi dùng AI" — kỹ năng thứ hai mới là thứ khiến một người vibe code sống sót lâu dài với sản phẩm thật.',
    workedExample: {
      code: `mota "them phan tru diem thuong khi thanh vien rut khoi nhom, bao khi diem hien tai la 0"
giaithich v1
xemdiff v1
nhan v1`,
      stdinLines: [],
    },
    predict: {
      code: `giaithich v1
xemdiff v1
nhan v1`,
      question:
        'Việc này chạm dữ liệu điểm thưởng của thành viên — bước giaithich đứng ở đâu trong chuỗi và vì sao?',
      choices: [
        'TRUOC xemdiff — hieu tong quan roi moi doc diff chi tiet',
        'SAU nhan — hieu sau khi da vao du an cung duoc',
        'Khong can neu da doc diff',
        'Thay the hoan toan cho xemdiff',
      ],
      answerIndex: 0,
      explain:
        'Với vùng nhạy cảm, hiểu TỔNG QUAN trước (giaithich) rồi mới soi CHI TIẾT (xemdiff) là thứ tự hợp lý — không thay thế nhau, cả hai đều cần trước khi nhan. Vùng càng nhạy cảm, càng không được bỏ bước nào.',
    },
    parsons: {
      prompt:
        'Xếp đúng nhịp cho việc chạm vùng nhạy cảm: hiểu tổng quan → soi chi tiết → mới nhận.',
      lines: ['giaithich v1', 'xemdiff v1', 'nhan v1'],
    },
    make: {
      prompt:
        'Bản nháp v1 chạm tới điểm thưởng (dữ liệu) của thành viên (đề dựng sẵn cảnh).\n\n1. Hỏi cho hiểu tổng quan trước.\n2. Soi diff chi tiết.\n3. Hiểu đủ rồi mới nhận.',
      starterCode: `# 1. hieu tong quan\n\n# 2. soi chi tiet\n\n# 3. nhan khi da hieu\n`,
      testCases: [
        {
          stdinLines: [
            'mota "them phan tru diem thuong khi thanh vien rut khoi nhom, bao khi diem hien tai la 0"',
          ],
          expected: 'Giai thich v1 bang loi thuong',
          match: 'contains',
          hidden: false,
          label: 'Hỏi giải thích trước khi soi diff',
        },
        {
          stdinLines: [
            'mota "them phan tru diem thuong khi thanh vien rut khoi nhom, bao khi diem hien tai la 0"',
          ],
          expected: 'Da nhan v1',
          match: 'contains',
          hidden: false,
          label: 'Nhận sau khi đã hiểu và xem diff',
        },
      ],
      hints: [
        'Ba lệnh đúng thứ tự: giaithich v1 → xemdiff v1 → nhan v1.',
        'Vùng nhạy cảm (chạm dữ liệu thành viên) thì KHÔNG bỏ bước giaithich, dù đã quen bỏ qua ở việc bình thường.',
        'Gõ: giaithich v1 rồi xemdiff v1 rồi nhan v1.',
      ],
      sampleSolution: `giaithich v1
xemdiff v1
nhan v1`,
    },
    homework:
      'Làm thật (không chấm, QUAN TRỌNG): liệt kê trong dự án của bạn (hoặc dự án bạn định làm) những phần rơi vào bốn vùng cấm: thanh toán, đăng nhập/phiên, dữ liệu người dùng thật, hành động khó hoàn tác. Với MỖI phần đó, tự hỏi: "mình có tự giải thích lại được luồng này không, hay chỉ đang tin AI?" Ghi ra phần nào bạn CHƯA đủ tự tin — đó là việc cần học thêm hoặc nhờ người biết code trước khi động vào production.',
    srsCards: [
      {
        hoi: 'Bốn vùng cấm — nơi phải HIỂU trước khi vibe code — là gì?',
        dap: 'Thanh toán, bảo mật/phiên đăng nhập, dữ liệu người dùng thật, và hành động khó hoàn tác (xoá/gửi hàng loạt).',
      },
      {
        hoi: 'Ở vùng cấm, "vùng cấm" nghĩa là cấm dùng AI hay là gì khác?',
        dap: 'KHÔNG phải cấm dùng AI — nghĩa là ngưỡng HIỂU BIẾT phải cao hơn hẳn: phải giaithich tới mức tự nói lại được toàn bộ luồng, không chỉ đọc diff lướt qua.',
      },
      {
        hoi: 'Tín hiệu nào cho biết một việc CẦN người biết code thật thay vì tự vibe code tiếp?',
        dap: 'Sau khi giaithich xong mà vẫn KHÔNG tự giải thích lại được luồng đó bằng lời của mình — đó là dấu hiệu cần học thêm hoặc nhờ người có chuyên môn.',
      },
    ],
  },
  {
    id: 'vibe-u4-l5',
    unitId: 'vibe-u4',
    language: 'vibe',
    title: 'Tổng kết — checklist chuyên gia trọn vòng đời',
    hook: 'Bạn đã đi từ "vibe code là gì" tới việc biết cả lúc nào KHÔNG nên vibe code. Bài cuối này không dạy gì mới — nó ghép toàn bộ 19 bài trước thành MỘT checklist bạn mang theo suốt đời làm phần mềm.',
    theory:
      'CHECKLIST CHUYÊN GIA — bảy điều tách mức ngây thơ khỏi mức kỷ luật, mỗi điều là một bài đã học:\n\n1. Mô tả đủ BA VẾ (ai dùng · vào/ra · ca đặc biệt) — không giao việc mơ hồ.\n2. Việc LỚN xin KẾ HOẠCH trước, việc nhạy cảm HỎI cho hiểu trước khi đụng.\n3. LUÔN xem diff — không nhận code chưa đọc, dù đang vội tới đâu.\n4. TEST là trọng tài — không tin cảm giác "chắc chạy được".\n5. MỖI TÍNH NĂNG một mốc — xanh là lưu, tức thì.\n6. SECRET không bao giờ vào mô tả — luôn qua biến môi trường.\n7. Biết VÙNG CẤM — nơi phải hiểu sâu hơn bình thường mới được đụng.\n\nSo hai mức lần cuối: NGÂY THƠ là nhận mọi thứ AI đưa, tin vào cảm giác, không có đường lui. CHUYÊN GIA vẫn không tự gõ code — nhưng đi qua đủ bảy điều trên mỗi lần, biến một thao tác từng run tay thành một quy trình đáng tin.\n\nBài Make cuối cùng của khoá là một bài TỔNG HỢP (capstone): hai tính năng, một cái cố ý thiếu ca biên để bạn phải tự cứu bằng đúng vòng đã học, mỗi tính năng một mốc, rồi triển khai. Làm được bài này nghĩa là bạn đã đi hết đường "từ số 0 đến chuyên gia".',
    workedExample: {
      code: `mota "them nut doi ten nhom chia tien, bao khi ten moi rong"
xemdiff v1
nhan v1
kiemtra
luu "them doi ten nhom"
mota "them xuat danh sach chi tieu ra file"
xemdiff v2
kiemtra`,
      stdinLines: [],
    },
    predict: {
      code: `vibe`,
      question:
        'Ở cuối workedExample, v2 mới chỉ xemdiff, CHƯA nhan — kiemtra ngay sau đó kiểm cái gì?',
      choices: [
        'Chi kiem v1 (da nhan) — v2 chua tinh vao du an',
        'Kiem ca v1 va v2',
        'Bao loi vi v2 chua nhan',
        'Tu dong nhan v2 truoc khi kiem',
      ],
      answerIndex: 0,
      explain:
        'kiemtra chỉ kiểm tính năng ĐÃ NHAN — v2 còn "cho-xem" thì không nằm trong phạm vi kiểm, dù đã xem diff. Đây đúng là điều bảng cảnh báo "con X ban nhap cho xem" nhắc ở bài kiemtra chương C2.',
    },
    parsons: {
      prompt: 'Xếp checklist chuyên gia cho MỘT tính năng, đủ bảy bước cô đọng thành sáu lệnh.',
      lines: [
        'mota "them nut doi ten nhom chia tien, bao khi ten moi rong"',
        'xemdiff v1',
        'nhan v1',
        'kiemtra',
        'luu "them doi ten nhom"',
        'trienkhai',
      ],
    },
    make: {
      prompt:
        'CAPSTONE — tổng kết trọn khoá. Từ dự án trống:\n\n1. Giao tính năng thứ NHẤT với mô tả đủ ba vế (kể cả ca biên) — đặt tên bạn muốn.\n2. Xem diff, nhận, kiểm tra (phải xanh), lưu mốc.\n3. Giao tính năng thứ HAI nhưng CỐ Ý mô tả không nhắc ca biên nào.\n4. Xem diff, nhận, kiểm tra — sẽ thấy đỏ. Sửa (sua) kèm góp ý nhắc rõ ca biên, xem lại, nhận lại.\n5. Kiểm tra lại cho xanh hết cả hai. Lưu mốc thứ hai.\n6. Triển khai.',
      starterCode: `# 1. tinh nang thu nhat, mo ta du ba ve\n\n# 2. xem, nhan, kiem, luu\n\n# 3. tinh nang thu hai, CO Y quen ca bien\n\n# 4. xem, nhan, kiem (se do) -> sua -> xem lai -> nhan lai\n\n# 5. kiem lai cho xanh, luu moc thu hai\n\n# 6. trien khai\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'xanh het',
          match: 'contains',
          hidden: false,
          label: 'Kiểm tra cuối cùng cả hai tính năng đều xanh',
        },
        {
          stdinLines: [],
          expected: '2.',
          match: 'contains',
          hidden: true,
          label: 'Lịch sử có đủ hai mốc (ca ẩn)',
        },
        {
          stdinLines: [],
          expected: 'Da trien khai',
          match: 'contains',
          hidden: false,
          label: 'Triển khai thành công cuối chuỗi',
        },
      ],
      hints: [
        'Đủ chuỗi cho tính năng 1: mota (đủ 3 vế) → xemdiff → nhan → kiemtra → luu. Rồi lặp lại cho tính năng 2 nhưng KHÔNG nhắc ca biên trong mota lần này.',
        'Sau kiemtra tính năng 2 ra đỏ: sua v2 "<góp ý nhắc rõ một từ khoá ca biên: rong/so 0/am/qua dai/gioi han/loi>" → xemdiff v2 → nhan v2.',
        'Kết thúc bằng: kiemtra (phải "xanh het") → luu "<tên mốc 2>" → trienkhai. Nhớ: lichsu phải có đúng 2 mốc, mốc đầu đặt trước khi làm tính năng 2.',
      ],
      sampleSolution: `mota "them nut doi ten nhom chia tien, bao khi ten moi rong"
xemdiff v1
nhan v1
kiemtra
luu "them doi ten nhom"
mota "them mau sac rieng cho tung thanh vien trong danh sach"
xemdiff v2
nhan v2
kiemtra
sua v2 "khi so thanh vien qua dai (hon 20 nguoi) thi tu dong lap lai bang mau"
xemdiff v2
nhan v2
kiemtra
luu "them mau rieng cho thanh vien"
lichsu
trienkhai`,
    },
    homework:
      'Làm thật (không chấm) — bài tập cuối khoá: chọn MỘT ý tưởng phần mềm nhỏ của riêng bạn. Đi trọn checklist bảy điều trên công cụ thật, từ mô tả đầu tiên tới lúc deploy. Khi xong, tự chấm bằng chính bảy điều đã học: điều nào bạn làm tốt, điều nào bạn còn quên? Đó là bản đồ luyện tập tiếp theo của bạn — khoá học kết thúc ở đây, nhưng việc luyện kỷ luật thì không.',
    srsCards: [
      {
        hoi: 'Bảy điều trong checklist chuyên gia vibe code là gì?',
        dap: 'Mô tả đủ ba vế · xin kế hoạch/hỏi hiểu trước việc lớn/nhạy cảm · luôn xem diff · test là trọng tài · mỗi tính năng một mốc · secret không vào mô tả · biết vùng cấm.',
      },
      {
        hoi: 'Người vibe code mức chuyên gia khác mức ngây thơ ở việc TỰ GÕ CODE hay ở việc gì?',
        dap: 'Không ở việc tự gõ code (cả hai đều không tự gõ) — mà ở việc đi qua đủ bảy điều kỷ luật mỗi lần, biến thao tác từng run tay thành quy trình đáng tin.',
      },
    ],
  },
]

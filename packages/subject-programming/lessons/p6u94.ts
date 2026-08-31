// lessons/p6u94.ts — Unit "Đặc tả giao việc cho AI" của chặng principal-s1 "Vận hành AI hiệu
// quả" (giai đoạn P5 "Tầm trưởng"). Xem docs/specs/2026-08-31-dot-4-p5-tam-truong.md mục ③.
//
// Bài học dạy TRỰC GIÁC của khuôn đặc tả 6 ô (tham khảo docs/templates/dac-ta-tinh-nang.md,
// diễn đạt lại bằng lời riêng — không copy nguyên văn), không dạy công cụ AI thật nào.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6_U94_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u94-l1',
    unitId: 'p6-u94',
    language: 'python',
    title: 'Đặc tả giao việc cho AI — 6 ô không được thiếu',
    hook: 'Bạn nhờ AI "sửa lại trang đăng nhập cho đẹp hơn" — nó xoá luôn nút quên mật khẩu vì "không đẹp". Không phải AI ngu, mà là bạn giao việc thiếu: không nói RÕ phạm vi, không nói CÁI GÌ KHÔNG ĐƯỢC ĐỘNG, không nói SAO ĐỂ BIẾT LÀ XONG. Một bản đặc tả tốt trả lời hết những câu đó TRƯỚC khi AI chạm dòng code đầu tiên.',
    theory:
      'Giao việc cho AI (hoặc cho đồng nghiệp) khác nói chuyện thường: AI làm ĐÚNG NHỮNG GÌ BẠN VIẾT, không đoán ý ngoài lời. Một bản đặc tả đủ tin cậy cần 6 Ô, thiếu ô nào là để hở một cửa cho AI tự quyết sai:\n\n1. PHẠM VI (có mục "KHÔNG LÀM") — không chỉ nói làm gì, phải nói rõ KHÔNG được đụng gì. "Sửa nút Đăng nhập" mà không ghi "không đổi nút Quên mật khẩu" thì AI có quyền đổi luôn.\n2. ĐIỂM CHẠM FILE — liệt kê đúng những file/thư mục việc này sẽ sửa. Không ghi thì AI có thể sửa nhầm file dùng chung, gãy chỗ khác.\n3. HỢP ĐỒNG VÀO-RA — với một hàm/API: đầu vào kiểu gì, đầu ra kiểu gì, ca lỗi xử lý sao. Không có hợp đồng thì "làm xong" của AI và của bạn là hai thứ khác nhau.\n4. TIÊU CHÍ CHẤP NHẬN ĐO ĐƯỢC — mỗi tiêu chí phải kiểm được bằng mắt hoặc bằng lệnh, không phải "cảm thấy ổn" (bài sau đào sâu điều này).\n5. BẤT BIẾN + TEST CANH — những điều LUÔN đúng dù code đổi thế nào (vd "giá tiền không bao giờ âm"), kèm một test tự động canh giữ điều đó.\n6. QUY ƯỚC DỰ ÁN — style code, tên biến, cách đặt file... để AI viết ra thứ khớp với phần còn lại, không phải một đảo riêng.\n\nThiếu một trong sáu ô, phần thiếu đó AI phải TỰ ĐOÁN — và đoán sai là chuyện thường, không phải lỗi hiếm.',
    workedExample: {
      code: `# Kiem tra mot ban dac ta co du 6 o hay khong
sau_o_chuan = [
    "pham vi", "diem cham", "hop dong",
    "tieu chi chap nhan", "bat bien", "quy uoc",
]

ban_dac_ta = ["Pham vi", "Hop dong", "Quy uoc"]  # ban nay thieu 3 o
co = set(o.strip().lower() for o in ban_dac_ta)

for o_chuan in sau_o_chuan:
    if o_chuan not in co:
        print(f"Thieu: {o_chuan}")`,
      stdinLines: [],
    },
    predict: {
      code: `sau_o_chuan = ["pham vi", "diem cham", "hop dong"]\nco = set(["pham vi", "hop dong"])\nfor o in sau_o_chuan:\n    if o not in co:\n        print(f"Thieu: {o}")`,
      question: 'Đoạn này in ra dòng nào?',
      choices: ['Thieu: diem cham', 'Thieu: pham vi', 'Thieu: hop dong', 'Không in gì'],
      answerIndex: 0,
      explain:
        '"pham vi" và "hop dong" đều có trong tập co, chỉ "diem cham" bị thiếu — vòng lặp duyệt đúng thứ tự sau_o_chuan nên chỉ dòng "Thieu: diem cham" xuất hiện.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: chuẩn hoá 1 ô sang chữ thường không dấu → so với danh sách chuẩn.',
      lines: [
        'def chuan_hoa(o):',
        '    o = o.strip().lower()',
        '    return o',
        'co = set(chuan_hoa(o) for o in ban_dac_ta)',
        'thieu = [o for o in sau_o_chuan if o not in co]',
      ],
    },
    make: {
      prompt:
        'Viết chương trình kiểm bản đặc tả có đủ 6 ô bắt buộc không.\n\nSáu ô chuẩn (không dấu, chữ thường): "pham vi", "diem cham", "hop dong", "tieu chi chap nhan", "bat bien", "quy uoc".\n\nChương trình đọc 1 dòng input(): tên các ô người soạn ĐÃ VIẾT, cách nhau bởi dấu phẩy (vd "Pham vi, Diem cham"). Tên ô trong input có thể viết hoa/thường lẫn lộn và có thể có dấu tiếng Việt (vd "Phạm vi", "Điểm chấm") — phải so sánh KHÔNG PHÂN BIỆT hoa/thường và KHÔNG PHÂN BIỆT dấu.\n\nVới từng ô trong 6 ô chuẩn (ĐÚNG THỨ TỰ liệt kê ở trên), nếu ô đó KHÔNG có trong input thì in "Thieu: <ten o chuan>" (một dòng cho mỗi ô thiếu). Nếu đủ cả 6 ô thì in đúng 1 dòng "Du 6 o".',
      starterCode: `import unicodedata\n\ndef chuan_hoa(s):\n    s = s.strip().lower()\n    s = unicodedata.normalize("NFD", s)\n    s = "".join(c for c in s if unicodedata.category(c) != "Mn")\n    s = s.replace("\\u0111", "d")  # 'd' co gach ngang -> 'd' thuong\n    return s\n\nsau_o_chuan = [\n    "pham vi", "diem cham", "hop dong",\n    "tieu chi chap nhan", "bat bien", "quy uoc",\n]\ndong = input("Cac o da viet: ")\n# Tach dong theo dau phay, chuan hoa tung o, roi so voi sau_o_chuan\n`,
      testCases: [
        {
          stdinLines: ['Pham vi, Diem cham, Hop dong, Tieu chi chap nhan, Bat bien, Quy uoc'],
          expected: 'Du 6 o',
          match: 'contains',
          hidden: false,
          label: 'Đủ cả 6 ô (viết hoa chữ đầu) → "Du 6 o"',
        },
        {
          stdinLines: ['pham vi,diem cham,hop dong,tieu chi chap nhan'],
          expected: 'Thieu: bat bien\nThieu: quy uoc',
          match: 'contains',
          hidden: false,
          label: 'Thiếu 2 ô cuối, in theo đúng thứ tự chuẩn',
        },
        {
          stdinLines: ['Phạm vi,Điểm chấm,Hợp đồng,Tiêu chí chấp nhận,Bất biến'],
          expected: 'Thieu: quy uoc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: input có dấu tiếng Việt, chỉ thiếu "quy uoc"',
        },
      ],
      hints: [
        'Chuẩn hoá một ô: strip() bỏ khoảng trắng thừa, lower() hạ chữ thường, rồi bỏ dấu tiếng Việt bằng unicodedata.normalize("NFD", s) và lọc bỏ ký tự loại "Mn" (dấu kết hợp); nhớ đổi riêng "đ" thành "d" vì nó không tách được bằng NFD.',
        'Tách input bằng dong.split(","), chuẩn hoá từng phần tử, đưa vào một set() để tra nhanh "có hay không".',
        'Duyệt sau_o_chuan ĐÚNG THỨ TỰ, ô nào không có trong set thì print(f"Thieu: {o}"); dùng một biến đếm hoặc list để biết cuối cùng có in "Du 6 o" hay không.',
      ],
      sampleSolution: `import unicodedata\n\ndef chuan_hoa(s):\n    s = s.strip().lower()\n    s = unicodedata.normalize("NFD", s)\n    s = "".join(c for c in s if unicodedata.category(c) != "Mn")\n    s = s.replace("\\u0111", "d")\n    return s\n\nsau_o_chuan = [\n    "pham vi", "diem cham", "hop dong",\n    "tieu chi chap nhan", "bat bien", "quy uoc",\n]\ndong = input("Cac o da viet: ")\nco = set(chuan_hoa(o) for o in dong.split(","))\nthieu = [o for o in sau_o_chuan if o not in co]\nif not thieu:\n    print("Du 6 o")\nelse:\n    for o in thieu:\n        print(f"Thieu: {o}")`,
    },
    homework:
      'Lấy một yêu cầu bạn từng giao cho AI (hoặc định giao) — vd "viết hàm tính tiền điện", "sửa giao diện trang chủ". Viết lại thành đủ 6 ô: phạm vi + KHÔNG làm gì, file sẽ đụng, hợp đồng vào-ra, ít nhất 2 tiêu chí đo được, 1 bất biến, quy ước cần theo. So với câu gốc — ô nào bạn hay bỏ quên nhất?',
    srsCards: [
      {
        hoi: 'Đặc tả giao việc cho AI cần đủ 6 ô nào?',
        dap: 'Phạm vi (có mục KHÔNG làm) · điểm chạm file · hợp đồng vào-ra · tiêu chí chấp nhận đo được · bất biến + test canh · quy ước dự án. Thiếu ô nào, phần đó AI phải tự đoán.',
      },
      {
        hoi: 'Vì sao "sửa trang đăng nhập cho đẹp hơn" là đặc tả tệ?',
        dap: 'Không nói phạm vi kèm mục KHÔNG LÀM (AI có thể đụng cả nút không liên quan) và không có tiêu chí chấp nhận đo được ("đẹp hơn" không đo được) — AI phải tự bịa ranh giới, dễ làm sai ý.',
      },
    ],
  },
  {
    id: 'p6-u94-l2',
    unitId: 'p6-u94',
    language: 'python',
    title: 'Tiêu chí chấp nhận: có số, có cách đo — hay chỉ là mơ hồ?',
    hook: '"Trang phải load nhanh" — nhanh là bao nhiêu? 1 giây hay 10 giây đều có thể gọi là "nhanh" tuỳ người. "Trang phải load dưới 2 giây" thì ai đo cũng ra cùng một kết quả đúng/sai. Khác biệt giữa hai câu đó chính là ranh giới giữa tiêu chí MƠ HỒ và tiêu chí ĐO ĐƯỢC.',
    theory:
      'Tiêu chí chấp nhận (acceptance criteria) là câu trả lời cho "làm sao biết là XONG?". Một tiêu chí chỉ hữu dụng khi hai người khác nhau, đo độc lập, ra CÙNG một kết luận đúng/sai.\n\nLuật tối giản: TIÊU CHÍ ĐO ĐƯỢC phải có SỐ và CÁCH ĐO đi kèm. "Phản hồi dưới 200ms" — có số (200), có cách đo (đo thời gian phản hồi). "Nhanh", "dễ dùng", "ổn định", "gọn gàng" — không có số, mỗi người hiểu một kiểu, đó là tiêu chí MƠ HỒ.\n\nBài học nay dùng luật cực kỳ đơn giản để rèn TRỰC GIÁC: câu có chứa ít nhất một chữ số thì tạm coi là đo được, không có chữ số nào thì mơ hồ. Luật này KHÔNG hoàn hảo (đời thật còn cần đơn vị đo, ngưỡng hợp lý, ai đo bằng công cụ gì...) nhưng đủ để bạn tập phản xạ: thấy một câu yêu cầu, việc đầu tiên là hỏi "số đâu?".\n\nMẹo sửa câu mơ hồ thành đo được: thêm một trong ba thứ — ngưỡng số (dưới 200ms), tỷ lệ phần trăm (95% người dùng thấy được), hoặc phép so sánh có mốc (nhanh hơn bản cũ ít nhất 30%). Không thêm được thứ nào trong ba, câu đó vẫn còn mơ hồ dù nghe kêu cỡ nào.',
    workedExample: {
      code: `# Phan biet tieu chi DO DUOC va MO HO bang luat co-so-hay-khong
tieu_chi = [
    "Website phai dep",
    "Trang chu load duoi 2 giay",
    "He thong on dinh",
    "It nhat 95% request thanh cong",
]

for cau in tieu_chi:
    co_so = any(ky_tu.isdigit() for ky_tu in cau)
    loai = "DO DUOC" if co_so else "MO HO"
    print(f"{cau}: {loai}")`,
      stdinLines: [],
    },
    predict: {
      code: `cau = "He thong phai xu ly duoc 100 nguoi dung cung luc"\nco_so = any(k.isdigit() for k in cau)\nprint("DO DUOC" if co_so else "MO HO")`,
      question: 'Đoạn này in ra gì?',
      choices: ['DO DUOC', 'MO HO', 'True', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Câu chứa chữ số "100" nên any(k.isdigit() ...) trả True, kết quả là "DO DUOC" — theo luật tối giản của bài, có số trong câu là đủ điều kiện gọi là đo được.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: kiểm câu có chữ số → in nhãn tương ứng.',
      lines: [
        'for cau in danh_sach:',
        '    co_so = any(k.isdigit() for k in cau)',
        '    if co_so:',
        '        print(f"{cau}: DO DUOC")',
        '    else:',
        '        print(f"{cau}: MO HO")',
      ],
    },
    make: {
      prompt:
        'Viết máy phân loại tiêu chí chấp nhận: ĐO ĐƯỢC hay MƠ HỒ.\n\nChương trình đọc 1 dòng input(): danh sách câu tiêu chí, cách nhau bằng dấu chấm phẩy ";" (vd "Website phai nhanh;Phan hoi duoi 200ms").\n\nVới MỖI câu, theo đúng thứ tự xuất hiện: nếu câu có chứa ÍT NHẤT một chữ số thì in "<cau>: DO DUOC", ngược lại in "<cau>: MO HO". Mỗi câu in đúng 1 dòng.',
      starterCode: `dong = input("Cac tieu chi: ")\n# Tach bang dong.split(";"), voi tung cau kiem co chua chu so hay khong roi in nhan\n`,
      testCases: [
        {
          stdinLines: ['Website phai nhanh;Phan hoi duoi 200ms'],
          expected: 'Website phai nhanh: MO HO\nPhan hoi duoi 200ms: DO DUOC',
          match: 'contains',
          hidden: false,
          label: 'Câu 1 không số → mơ hồ, câu 2 có số → đo được',
        },
        {
          stdinLines: ['Giao dien dep'],
          expected: 'Giao dien dep: MO HO',
          match: 'contains',
          hidden: false,
          label: 'Một câu không số → mơ hồ',
        },
        {
          stdinLines: ['Ho tro 100 nguoi dung;De dung;Tra loi trong 3 giay'],
          expected: 'Ho tro 100 nguoi dung: DO DUOC\nDe dung: MO HO\nTra loi trong 3 giay: DO DUOC',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 3 câu trộn lẫn, giữ đúng thứ tự đọc vào',
        },
      ],
      hints: [
        'Tách dòng nhập bằng dong.split(";") ra list các câu, giữ nguyên thứ tự.',
        'Kiểm câu có chữ số bằng any(ky_tu.isdigit() for ky_tu in cau) — trả True nếu có ít nhất một ký tự số.',
        'In đúng mẫu f"{cau}: DO DUOC" hoặc f"{cau}: MO HO" cho từng câu, theo thứ tự xuất hiện.',
      ],
      sampleSolution: `dong = input("Cac tieu chi: ")\nfor cau in dong.split(";"):\n    co_so = any(ky_tu.isdigit() for ky_tu in cau)\n    print(f"{cau}: {'DO DUOC' if co_so else 'MO HO'}")`,
    },
    homework:
      'Lấy 3 tiêu chí mơ hồ bạn từng viết hoặc từng nghe ("chạy mượt", "UI đẹp", "code sạch") và viết lại mỗi câu thành bản đo được — thêm ngưỡng số, tỷ lệ phần trăm, hoặc mốc so sánh. Với mỗi bản mới, tự hỏi: hai người khác nhau đo độc lập có ra cùng kết luận đúng/sai không?',
    srsCards: [
      {
        hoi: 'Tiêu chí chấp nhận "đo được" khác "mơ hồ" ở điểm nào?',
        dap: 'Đo được: có số + cách đo đi kèm, hai người đo độc lập ra cùng kết luận đúng/sai (vd "phản hồi dưới 200ms"). Mơ hồ: không có số, mỗi người hiểu một kiểu (vd "nhanh", "dễ dùng").',
      },
      {
        hoi: 'Ba cách thường dùng để sửa một câu mơ hồ thành đo được?',
        dap: 'Thêm ngưỡng số (dưới 200ms) · thêm tỷ lệ phần trăm (95% request thành công) · thêm mốc so sánh (nhanh hơn bản cũ ít nhất 30%). Thiếu cả ba, câu vẫn còn mơ hồ dù nghe kêu.',
      },
    ],
  },
]

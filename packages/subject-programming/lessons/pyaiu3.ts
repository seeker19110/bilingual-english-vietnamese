// lessons/pyaiu3.ts — Chương C3 "AI là gì" của khoá "Python / AI Cơ Bản" (pyai)
// (docs/specs/2026-09-01-pyai-bai-hoc-chi-tiet.md).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const PYAI_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u3-l1',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Luật viết tay vs học từ dữ liệu — cùng bài toán lọc thư rác',
    hook: 'Bạn viết luật chặn thư rác: "có chữ TRUNG THUONG thì chặn". Kẻ gửi rác đổi câu chữ một chút là luật vỡ, bạn lại ngồi vá. Cách thứ hai: đưa máy vài trăm lá thư đã dán nhãn rác / không rác, để MÁY TỰ RÚT RA đâu là từ đáng ngờ. Hôm nay bạn viết cả hai cách, trên cùng một hộp thư, rồi so kết quả.',
    theory:
      'HAI CÁCH GIẢI cùng một bài toán:\n\nCÁCH 1 — LUẬT VIẾT TAY (rule-based): con người nghĩ ra quy tắc, code cứng vào chương trình. Ưu: minh bạch tuyệt đối (giải thích được vì sao chặn), chạy ngay, không cần dữ liệu. Nhược: người viết chỉ nghĩ ra được vài chục luật, thế giới thì đổi hàng ngày; luật càng nhiều càng đá nhau; mỗi tình huống mới lại phải sửa code.\n\nCÁCH 2 — HỌC TỪ DỮ LIỆU (machine learning): con người đưa VÍ DỤ ĐÃ CÓ NHÃN, chương trình tự rút ra quy luật. Ở bài này quy luật là một TẬP TỪ ĐÁNG NGỜ: những từ xuất hiện trong thư rác nhưng không xuất hiện trong thư sạch. Ưu: thêm dữ liệu là "luật" tự cập nhật, KHÔNG SỬA MỘT DÒNG CODE nào; bắt được cả những dấu hiệu con người không nghĩ ra. Nhược: cần dữ liệu có nhãn, khó giải thích hơn, và học sai nếu dữ liệu lệch.\n\nĐIỂM CỐT LÕI phải mang theo cả khoá: trong cách 2, thứ quyết định kết quả nằm ở DỮ LIỆU chứ không ở code. Đưa bộ dữ liệu khác vào là máy cho ra bộ luật khác — code y nguyên. Đó chính là câu "lập trình bằng dữ liệu".\n\nCẢ HAI ĐỀU SAI ĐƯỢC, theo hai kiểu:\n- BỎ SÓT (false negative): thư rác lọt lưới — luật viết tay hay dính vì kẻ gửi rác đổi chữ.\n- BÁO NHẦM (false positive): thư sạch bị chặn oan — nguy hiểm hơn nhiều, vì người dùng mất thư quan trọng. Khoá Machine Learning sau này sẽ gọi tên hai loại lỗi này là precision và recall.',
    workedExample: {
      code: `# Du lieu HUAN LUYEN: nhung la thu da co nhan
RAC = ["trung thuong lon", "mien phi 100 phan tram", "trung thuong ngay"]
SACH = ["hop luc 3 gio chieu", "gui bao cao giup minh"]

# CACH 1 - luat viet tay: nguoi tu nghi ra tu khoa
TU_KHOA = ["trung", "thuong"]

# CACH 2 - HOC tu du lieu: tu nao co trong thu rac ma khong co trong thu sach
tu_sach = set()
for thu in SACH:
    for tu in thu.split():
        tu_sach.add(tu)

nghi_ngo = set()
for thu in RAC:
    for tu in thu.split():
        if tu not in tu_sach:        # chi giu tu CHI xuat hien o thu rac
            nghi_ngo.add(tu)

print(f"So tu dang ngo hoc duoc: {len(nghi_ngo)}")   # 9 tu

thu_moi = "mien phi tang ban"
la_rac_luat = any(tu in TU_KHOA for tu in thu_moi.split())
la_rac_hoc = any(tu in nghi_ngo for tu in thu_moi.split())
print("Luat viet tay: rac" if la_rac_luat else "Luat viet tay: sach")
print("Hoc tu du lieu: rac" if la_rac_hoc else "Hoc tu du lieu: sach")`,
      stdinLines: [],
    },
    predict: {
      code: `TU_KHOA = ["trung", "thuong"]\nthu = "mien phi tang ban"\nprint(any(tu in TU_KHOA for tu in thu.split()))`,
      question: 'Luật viết tay có bắt được lá thư "mien phi tang ban" không?',
      choices: ['False', 'True', 'Báo lỗi', 'None'],
      answerIndex: 0,
      explain:
        'Lá thư này không chứa từ "trung" hay "thuong" nên luật viết tay cho False: thư rác LỌT LƯỚI. Muốn bắt được thì người phải nghĩ ra và thêm tay từ khoá "mien"/"phi" — còn cách học từ dữ liệu tự có chúng vì chúng xuất hiện trong thư rác mẫu.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự bước "học" tập từ đáng ngờ: gom từ của thư sạch trước, rồi lọc từ thư rác.',
      lines: [
        'tu_sach = set()',
        'for thu in SACH:',
        '    for tu in thu.split():',
        '        tu_sach.add(tu)',
        'nghi_ngo = set()',
        'for thu in RAC:',
        '    for tu in thu.split():',
        '        if tu not in tu_sach:',
        '            nghi_ngo.add(tu)',
      ],
    },
    make: {
      prompt:
        'Viết bộ lọc thư rác GIẢI HAI CÁCH trên cùng một lá thư.\n\nDữ liệu huấn luyện và từ khoá đã cho sẵn trong code khởi đầu (RAC, SACH, TU_KHOA) — giữ nguyên, không sửa.\n\nĐọc 1 dòng input() là lá thư cần kiểm (tiếng Việt không dấu).\n\nIn đúng 2 dòng:\nLuat viet tay: rac   (nếu thư chứa ít nhất một từ trong TU_KHOA) hoặc Luat viet tay: sach\nHoc tu du lieu: rac  (nếu thư chứa ít nhất một từ ĐÁNG NGỜ học được: từ có trong thư RAC mà không có trong thư SACH) hoặc Hoc tu du lieu: sach\n\nVí dụ "mien phi tang ban" → "Luat viet tay: sach" nhưng "Hoc tu du lieu: rac".',
      starterCode: `RAC = ["trung thuong lon", "mien phi 100 phan tram", "trung thuong ngay"]
SACH = ["hop luc 3 gio chieu", "gui bao cao giup minh"]
TU_KHOA = ["trung", "thuong"]

thu = input("La thu: ")
# 1) Luat viet tay: thu co tu nao trong TU_KHOA khong?
# 2) Hoc tu du lieu: gom tu cua SACH, roi lay tu cua RAC khong nam trong do
`,
      testCases: [
        {
          stdinLines: ['trung thuong ngay hom nay'],
          expected: 'Luat viet tay: rac\nHoc tu du lieu: rac',
          match: 'contains',
          hidden: false,
          label: 'Thư rác rõ ràng — cả hai cách đều bắt được',
        },
        {
          stdinLines: ['mien phi tang ban'],
          expected: 'Luat viet tay: sach\nHoc tu du lieu: rac',
          match: 'contains',
          hidden: false,
          label: 'Luật viết tay LỌT LƯỚI, cách học từ dữ liệu bắt được',
        },
        {
          stdinLines: ['gui bao cao thuong ky'],
          expected: 'Luat viet tay: rac\nHoc tu du lieu: rac',
          match: 'contains',
          hidden: false,
          label: 'Thư công việc bị BÁO NHẦM vì chứa chữ "thuong" — cả hai cách đều sai',
        },
        {
          stdinLines: ['hop luc 3 gio chieu'],
          expected: 'Luat viet tay: sach\nHoc tu du lieu: sach',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: thư sạch đúng như mẫu huấn luyện — cả hai cách đều cho sach',
        },
      ],
      hints: [
        'Tách thư thành từ bằng thu.split() rồi kiểm tra bằng vòng lặp hoặc any(...): any(tu in TU_KHOA for tu in thu.split()).',
        'Bước "học": gom tất cả từ của SACH vào một set trước; sau đó duyệt từ của RAC, chỉ giữ từ KHÔNG có trong set đó.',
        'In gọn bằng biểu thức điều kiện: print("Luat viet tay: rac" if la_rac_luat else "Luat viet tay: sach").',
      ],
      sampleSolution: `RAC = ["trung thuong lon", "mien phi 100 phan tram", "trung thuong ngay"]
SACH = ["hop luc 3 gio chieu", "gui bao cao giup minh"]
TU_KHOA = ["trung", "thuong"]

thu = input("La thu: ")
cac_tu = thu.split()

la_rac_luat = False
for tu in cac_tu:
    if tu in TU_KHOA:
        la_rac_luat = True

tu_sach = set()
for t in SACH:
    for tu in t.split():
        tu_sach.add(tu)

nghi_ngo = set()
for t in RAC:
    for tu in t.split():
        if tu not in tu_sach:
            nghi_ngo.add(tu)

la_rac_hoc = False
for tu in cac_tu:
    if tu in nghi_ngo:
        la_rac_hoc = True

print("Luat viet tay: rac" if la_rac_luat else "Luat viet tay: sach")
print("Hoc tu du lieu: rac" if la_rac_hoc else "Hoc tu du lieu: sach")`,
    },
    homework:
      'Thêm 3 lá thư rác mới vào danh sách RAC (không sửa một dòng logic nào) rồi chạy lại với lá thư trước đó bị lọt lưới — xem kết quả của cách 2 tự đổi theo. Đó chính là trải nghiệm cốt lõi của học máy: cải thiện hệ thống bằng cách thêm DỮ LIỆU chứ không phải thêm CODE. Sau đó thử ngược lại: thêm một lá thư sạch chứa chữ "thuong" (vd "bao cao thuong nien") vào SACH và xem tập từ đáng ngờ co lại thế nào.',
    srsCards: [
      {
        hoi: 'Luật viết tay và học từ dữ liệu khác nhau ở chỗ nào khi cần cải thiện hệ thống?',
        dap: 'Luật viết tay: muốn tốt hơn phải SỬA CODE, thêm luật do người nghĩ ra. Học từ dữ liệu: chỉ cần thêm VÍ DỤ có nhãn, quy luật tự cập nhật mà code giữ nguyên — thứ quyết định kết quả nằm ở dữ liệu.',
      },
      {
        hoi: 'Hai kiểu sai của một bộ lọc là gì, kiểu nào nguy hiểm hơn?',
        dap: 'BỎ SÓT (thư rác lọt lưới) và BÁO NHẦM (thư sạch bị chặn oan). Báo nhầm thường nguy hiểm hơn vì người dùng mất thư quan trọng mà không biết. Khoá ML sau này gọi tên chúng qua precision và recall.',
      },
      {
        hoi: 'Nhược điểm chính của cách học từ dữ liệu là gì?',
        dap: 'Cần dữ liệu ĐÃ CÓ NHÃN với số lượng đủ, khó giải thích vì sao ra quyết định đó, và học sai nếu dữ liệu lệch hoặc thiên vị — máy chỉ trung thành với dữ liệu bạn đưa, kể cả khi dữ liệu đó phản ánh sai thực tế.',
      },
    ],
  },
  {
    id: 'pyai-u3-l2',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Bản đồ AI / ML / DL / GenAI — cái nào nằm trong cái nào',
    hook: 'Báo chí dùng lẫn lộn bốn chữ AI, machine learning, deep learning, AI tạo sinh như thể chúng là một. Chúng KHÔNG phải là một — chúng lồng vào nhau như bốn cái hộp, và biết cái nào nằm trong cái nào sẽ giúp bạn đọc mọi tin tức công nghệ mà không bị dắt mũi.',
    theory:
      'BỐN VÒNG TRÒN LỒNG NHAU, từ ngoài vào trong:\n\n1. AI (trí tuệ nhân tạo) — vòng NGOÀI CÙNG, rộng nhất: mọi cách làm cho máy hành xử "thông minh". Bao gồm cả hệ chuyên gia dựa trên LUẬT VIẾT TAY, thuật toán tìm kiếm, máy chơi cờ tính nước đi. Nhiều thứ trong ô này không hề học từ dữ liệu.\n\n2. ML (học máy) — nằm TRONG AI: máy học quy luật từ dữ liệu thay vì được lập trình luật. Lọc thư rác, dự đoán giá nhà, gợi ý sản phẩm.\n\n3. DL (học sâu) — nằm TRONG ML: dùng mạng nơ-ron NHIỀU LỚP. Mạnh với dữ liệu thô phức tạp (ảnh, âm thanh, văn bản) vì tự học ra đặc trưng thay vì để người chọn tay. Nhận diện khuôn mặt, nhận dạng giọng nói.\n\n4. GenAI (AI tạo sinh) — nằm TRONG DL: mạng nơ-ron TẠO RA nội dung mới (chữ, ảnh, nhạc, code) thay vì chỉ phân loại hay đoán số. ChatGPT, Midjourney thuộc ô này.\n\nQuan hệ đọc là: MỌI GenAI đều là DL, mọi DL đều là ML, mọi ML đều là AI — nhưng ngược lại thì KHÔNG. Máy chơi cờ bằng luật viết tay là AI mà không phải ML; hồi quy tuyến tính là ML mà không phải DL.\n\nMỘT MẸO PHÂN LOẠI NHANH: hỏi hai câu. Hệ này có học từ dữ liệu không? Không → chỉ là AI. Có → hỏi tiếp: nó có dùng mạng nơ-ron nhiều lớp không? Không → ML cổ điển. Có, và nó SINH RA nội dung mới → GenAI; có, nhưng chỉ phân loại/dự đoán → DL.',
    workedExample: {
      code: `# Bang tra: moi cong nghe thuoc vong tron nao
BANG = {
    "may tinh choi co bang luat": "AI",
    "loc thu rac": "ML",
    "nhan dien khuon mat": "DL",
    "chatgpt": "GenAI",
}

for ten, vung in BANG.items():
    print(f"{ten} -> {vung}")

# Tra mot cong nghe chua co trong bang: dung .get de khong bao loi
print(BANG.get("xe tu lai", "Chua ro"))

# Quan he bao nhau: tu ngoai vao trong
print("AI > ML > DL > GenAI")`,
      stdinLines: [],
    },
    predict: {
      code: `BANG = {"chatgpt": "GenAI"}\nprint(BANG.get("may hut bui", "Chua ro"))`,
      question: 'Dòng này in ra gì?',
      choices: ['Chua ro', 'GenAI', 'None', 'Báo lỗi KeyError'],
      answerIndex: 0,
      explain:
        'Khoá "may hut bui" không có trong bảng nên .get trả về giá trị mặc định "Chua ro". Nếu viết BANG["may hut bui"] thì chương trình đã chết vì KeyError — đúng lý do nên dùng .get khi tra bảng dữ liệu chưa đầy đủ.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc số dòng → lặp đọc từng tên → tra bảng → in kết quả.',
      lines: [
        'n = int(input("So cong nghe: "))',
        'for _ in range(n):',
        '    ten = input()',
        '    vung = BANG.get(ten, "Chua ro")',
        '    print(f"{ten} -> {vung}")',
      ],
    },
    make: {
      prompt:
        'Viết máy tra bản đồ AI. Bảng BANG đã cho sẵn trong code khởi đầu — giữ nguyên.\n\nĐọc từ input():\n- Dòng 1: số công nghệ n.\n- n dòng tiếp theo, mỗi dòng là tên một công nghệ (chữ thường, không dấu).\n\nVới mỗi công nghệ in một dòng:\n<ten> -> <vung>\nTrong đó vung tra từ BANG; nếu không có trong bảng thì in Chua ro.\n\nVí dụ nhập 2 · "chatgpt" · "loc thu rac" → "chatgpt -> GenAI" và "loc thu rac -> ML".',
      starterCode: `BANG = {
    "may tinh choi co bang luat": "AI",
    "loc thu rac": "ML",
    "du doan gia nha": "ML",
    "nhan dien khuon mat": "DL",
    "nhan dang giong noi": "DL",
    "chatgpt": "GenAI",
    "ve tranh bang ai": "GenAI",
}

n = int(input("So cong nghe: "))
# Lap n lan: doc ten, tra BANG (dung .get voi mac dinh "Chua ro"), in ket qua
`,
      testCases: [
        {
          stdinLines: ['2', 'chatgpt', 'loc thu rac'],
          expected: 'chatgpt -> GenAI',
          match: 'contains',
          hidden: false,
          label: 'Tra công nghệ có trong bảng (chatgpt)',
        },
        {
          stdinLines: ['2', 'chatgpt', 'loc thu rac'],
          expected: 'loc thu rac -> ML',
          match: 'contains',
          hidden: false,
          label: 'Tra công nghệ có trong bảng (loc thu rac)',
        },
        {
          stdinLines: ['1', 'nhan dien khuon mat'],
          expected: 'nhan dien khuon mat -> DL',
          match: 'contains',
          hidden: false,
          label: 'Nhận diện khuôn mặt thuộc học sâu',
        },
        {
          stdinLines: ['2', 'may tinh choi co bang luat', 've tranh bang ai'],
          expected: 'may tinh choi co bang luat -> AI',
          match: 'contains',
          hidden: false,
          label: 'Hai đầu bản đồ: luật viết tay là AI',
        },
        {
          stdinLines: ['2', 'may tinh choi co bang luat', 've tranh bang ai'],
          expected: 've tranh bang ai -> GenAI',
          match: 'contains',
          hidden: false,
          label: 'Hai đầu bản đồ: vẽ tranh là GenAI',
        },
        {
          stdinLines: ['1', 'xe tu lai'],
          expected: 'xe tu lai -> Chua ro',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: công nghệ ngoài bảng — phải in Chua ro, không được chết vì KeyError',
        },
      ],
      hints: [
        'Đọc đúng n dòng bằng for _ in range(n): — đừng đọc dư hay thiếu, test so khớp theo từng dòng.',
        'Tra bảng bằng BANG.get(ten, "Chua ro") thay vì BANG[ten], để tên lạ không làm chương trình chết.',
        'Định dạng đúng có khoảng trắng hai bên mũi tên: print(f"{ten} -> {vung}").',
      ],
      sampleSolution: `BANG = {
    "may tinh choi co bang luat": "AI",
    "loc thu rac": "ML",
    "du doan gia nha": "ML",
    "nhan dien khuon mat": "DL",
    "nhan dang giong noi": "DL",
    "chatgpt": "GenAI",
    "ve tranh bang ai": "GenAI",
}

n = int(input("So cong nghe: "))
for _ in range(n):
    ten = input()
    vung = BANG.get(ten, "Chua ro")
    print(f"{ten} -> {vung}")`,
    },
    homework:
      'Lấy 5 tin công nghệ bạn đọc được tuần này và tự xếp mỗi cái vào một trong bốn ô, viết ra LÝ DO một câu. Với những cái bạn xếp là "AI" mà không phải "ML", hãy tự hỏi: nếu nó không học từ dữ liệu thì nó lấy quy luật ở đâu ra? Bài tập này rèn đúng thói quen quan trọng nhất khi đọc tin AI: phân biệt hệ thống HỌC từ dữ liệu với hệ thống chạy theo luật ai đó đã viết sẵn.',
    srsCards: [
      {
        hoi: 'Bốn khái niệm AI, ML, DL, GenAI lồng nhau theo thứ tự nào?',
        dap: 'AI bao ML, ML bao DL, DL bao GenAI. Mọi GenAI đều là DL, mọi DL đều là ML, mọi ML đều là AI — nhưng chiều ngược lại không đúng: máy chơi cờ bằng luật viết tay là AI mà không phải ML.',
      },
      {
        hoi: 'Deep learning khác machine learning cổ điển ở điểm nào?',
        dap: 'Deep learning dùng mạng nơ-ron NHIỀU LỚP và tự học ra đặc trưng từ dữ liệu thô (ảnh, âm thanh, văn bản), trong khi ML cổ điển thường cần người chọn tay đặc trưng trước. Đổi lại DL cần nhiều dữ liệu và nhiều sức tính hơn hẳn.',
      },
      {
        hoi: 'AI tạo sinh (GenAI) khác phần còn lại của deep learning ở chỗ nào?',
        dap: 'Đầu ra là NỘI DUNG MỚI (chữ, ảnh, nhạc, code) thay vì chỉ một nhãn phân loại hay một con số dự đoán. ChatGPT sinh văn bản, Midjourney sinh ảnh; còn nhận diện khuôn mặt chỉ trả về danh tính nên là DL mà không phải GenAI.',
      },
    ],
  },
  {
    id: 'pyai-u3-l3',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Vòng đời một dự án AI — từ dữ liệu tới triển khai',
    hook: 'Người mới hình dung làm AI là ngồi viết mô hình. Thực tế trong một dự án thật, phần huấn luyện mô hình chiếm chưa tới 20% thời gian; phần lớn công sức đổ vào thu thập và làm sạch dữ liệu, còn phần quyết định thành bại là ĐÁNH GIÁ: mô hình này đủ tốt để đem ra dùng chưa?',
    theory:
      'NĂM BƯỚC của một dự án AI, theo đúng thứ tự:\n\n1. THU THẬP DỮ LIỆU — dữ liệu ở đâu, ai gán nhãn, đủ nhiều và đủ đa dạng chưa. Bước tốn công nhất và hay bị xem nhẹ nhất.\n2. LÀM SẠCH DỮ LIỆU — thiếu, trùng, sai định dạng, giá trị ngoại lai. Dữ liệu rác vào thì mô hình rác ra (garbage in, garbage out) — không thuật toán nào cứu được.\n3. HUẤN LUYỆN MÔ HÌNH — chọn thuật toán, cho máy học trên phần dữ liệu HUẤN LUYỆN.\n4. ĐÁNH GIÁ — đo trên phần dữ liệu KIỂM TRA mà mô hình CHƯA TỪNG THẤY. Đây là điểm sống còn: đo trên chính dữ liệu đã học thì con số luôn đẹp và luôn dối, vì mô hình có thể chỉ học vẹt.\n5. TRIỂN KHAI — đưa vào dùng thật, rồi THEO DÕI: dữ liệu ngoài đời trôi dạt theo thời gian (data drift), mô hình tốt hôm nay có thể tệ sau sáu tháng.\n\nĐÂY LÀ VÒNG LẶP, KHÔNG PHẢI ĐƯỜNG THẲNG. Đánh giá xong mà chưa đạt thì quay lại — và quay lại đâu là một quyết định nghề nghiệp:\n- Kết quả quá thấp (mô hình đoán gần như bừa) → thường là thiếu dữ liệu hoặc dữ liệu không mang thông tin cần thiết → quay về bước 1.\n- Kết quả khá nhưng chưa đạt ngưỡng → tinh chỉnh mô hình, thêm đặc trưng → quay về bước 3.\n- Đạt ngưỡng → triển khai, rồi tiếp tục theo dõi.\n\nNGƯỠNG CHẤP NHẬN phải chốt TRƯỚC khi làm, cùng với người dùng thật, chứ không phải chọn sau khi đã nhìn kết quả — nếu không bạn sẽ tự hạ chuẩn cho vừa con số mình có.',
    workedExample: {
      code: `BUOC = [
    "1. Thu thap du lieu",
    "2. Lam sach du lieu",
    "3. Huan luyen mo hinh",
    "4. Danh gia",
    "5. Trien khai",
]

for b in BUOC:
    print(b)

do_chinh_xac = 0.72                  # ket qua do tren du lieu KIEM TRA

# Quyet dinh quay lai buoc nao - nguong da chot TRUOC khi lam
if do_chinh_xac < 0.6:
    print("Quay lai: thu thap them du lieu")
elif do_chinh_xac < 0.8:
    print("Quay lai: cai tien mo hinh")
else:
    print("Trien khai")`,
      stdinLines: [],
    },
    predict: {
      code: `acc = 0.8\nif acc < 0.6:\n    print("Quay lai: thu thap them du lieu")\nelif acc < 0.8:\n    print("Quay lai: cai tien mo hinh")\nelse:\n    print("Trien khai")`,
      question: 'Với độ chính xác đúng bằng 0.8, chương trình quyết định gì?',
      choices: [
        'Trien khai',
        'Quay lai: cai tien mo hinh',
        'Quay lai: thu thap them du lieu',
        'Không in gì',
      ],
      answerIndex: 0,
      explain:
        '0.8 không nhỏ hơn 0.6 và cũng không nhỏ hơn 0.8, nên rơi vào else: triển khai. Ngưỡng "đạt từ 0.8 trở lên" phải viết đúng như vậy — nếu viết acc <= 0.8 ở nhánh giữa thì mô hình vừa đủ chuẩn lại bị đẩy về sửa, một lỗi ranh giới tốn cả tuần làm việc.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự vòng đời dự án AI, từ dữ liệu tới quyết định triển khai.',
      lines: [
        'print("1. Thu thap du lieu")',
        'print("2. Lam sach du lieu")',
        'print("3. Huan luyen mo hinh")',
        'print("4. Danh gia")',
        'print("5. Trien khai")',
        'acc = float(input("Do chinh xac: "))',
        'print("Trien khai" if acc >= 0.8 else "Quay lai: cai tien mo hinh")',
      ],
    },
    make: {
      prompt:
        'Viết trợ lý quyết định vòng đời dự án AI.\n\nĐọc 1 dòng input() là độ chính xác đo trên dữ liệu kiểm tra (số thực từ 0 đến 1, vd "0.75").\n\nIn TRƯỚC 5 dòng vòng đời, đúng thứ tự và đúng chữ:\n1. Thu thap du lieu\n2. Lam sach du lieu\n3. Huan luyen mo hinh\n4. Danh gia\n5. Trien khai\n\nRồi in đúng MỘT dòng quyết định:\n- Nhỏ hơn 0.6: Quay lai: thu thap them du lieu\n- Từ 0.6 đến dưới 0.8: Quay lai: cai tien mo hinh\n- Từ 0.8 trở lên: Trien khai',
      starterCode: `BUOC = [
    "1. Thu thap du lieu",
    "2. Lam sach du lieu",
    "3. Huan luyen mo hinh",
    "4. Danh gia",
    "5. Trien khai",
]
acc = float(input("Do chinh xac: "))
# In lan luot 5 buoc, roi in dong quyet dinh theo nguong
`,
      testCases: [
        {
          stdinLines: ['0.5'],
          expected:
            '1. Thu thap du lieu\n2. Lam sach du lieu\n3. Huan luyen mo hinh\n4. Danh gia\n5. Trien khai\nQuay lai: thu thap them du lieu',
          match: 'contains',
          hidden: false,
          label: 'Độ chính xác 0.5 → quá thấp, quay về thu thập dữ liệu',
        },
        {
          stdinLines: ['0.75'],
          expected: 'Quay lai: cai tien mo hinh',
          match: 'contains',
          hidden: false,
          label: '0.75 nằm giữa hai ngưỡng → cải tiến mô hình',
        },
        {
          stdinLines: ['0.8'],
          expected: 'Trien khai',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng ngưỡng 0.8 — "từ 0.8 trở lên" nghĩa là ĐẠT',
        },
      ],
      hints: [
        'In 5 bước bằng vòng lặp for b in BUOC: print(b) — chép tay 5 dòng print cũng được nhưng dễ sai chính tả.',
        'Đổi input sang float chứ không int, vì độ chính xác là số thực trong khoảng 0..1.',
        'Ranh giới: "từ 0.8 trở lên là đạt" nên nhánh giữa phải là acc < 0.8, không phải acc <= 0.8.',
      ],
      sampleSolution: `BUOC = [
    "1. Thu thap du lieu",
    "2. Lam sach du lieu",
    "3. Huan luyen mo hinh",
    "4. Danh gia",
    "5. Trien khai",
]
acc = float(input("Do chinh xac: "))
for b in BUOC:
    print(b)
if acc < 0.6:
    print("Quay lai: thu thap them du lieu")
elif acc < 0.8:
    print("Quay lai: cai tien mo hinh")
else:
    print("Trien khai")`,
    },
    homework:
      'Chọn một ý tưởng AI của riêng bạn (vd chấm bài tự động, gợi ý món ăn, nhận dạng chữ viết tay) và viết ra giấy đủ 5 bước cho nó: dữ liệu lấy ở đâu và ai dán nhãn, dữ liệu bẩn kiểu gì, đo bằng chỉ số nào, và NGƯỠNG bao nhiêu thì bạn dám đem ra dùng thật. Câu khó nhất — và cũng quan trọng nhất — là câu cuối: hãy chốt ngưỡng TRƯỚC khi bắt tay làm, để sau này không tự hạ chuẩn cho vừa kết quả mình có.',
    srsCards: [
      {
        hoi: 'Năm bước của vòng đời một dự án AI là gì?',
        dap: 'Thu thập dữ liệu → làm sạch dữ liệu → huấn luyện mô hình → đánh giá → triển khai và theo dõi. Đây là VÒNG LẶP: đánh giá chưa đạt thì quay lại bước thu thập hoặc bước huấn luyện tuỳ mức độ kém.',
      },
      {
        hoi: 'Vì sao phải đánh giá mô hình trên dữ liệu mô hình chưa từng thấy?',
        dap: 'Vì đo trên chính dữ liệu đã học thì con số luôn đẹp và luôn dối — mô hình có thể chỉ học vẹt các ví dụ đã gặp. Chỉ dữ liệu kiểm tra tách riêng mới cho biết mô hình có tổng quát hoá được sang ca mới hay không.',
      },
      {
        hoi: 'Vì sao ngưỡng chấp nhận phải chốt trước khi làm?',
        dap: 'Vì nếu chọn ngưỡng sau khi đã nhìn kết quả, người ta luôn có xu hướng hạ chuẩn cho vừa con số mình có. Chốt trước, cùng người dùng thật, giữ cho quyết định triển khai là quyết định trung thực.',
      },
    ],
  },
  {
    id: 'pyai-u3-l4',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Đạo đức & giới hạn — thiên lệch dữ liệu, ảo giác, khi nào KHÔNG dùng AI',
    hook: 'Một công ty lớn từng làm AI lọc hồ sơ xin việc, huấn luyện trên 10 năm hồ sơ tuyển dụng cũ. Mô hình học rất giỏi — nó học luôn cả thói quen thiên lệch trong dữ liệu cũ và bắt đầu tự động hạ điểm hồ sơ của phụ nữ. Không ai lập trình điều đó. Dữ liệu đã dạy nó.',
    theory:
      'MÁY TRUNG THÀNH VỚI DỮ LIỆU, KHÔNG TRUNG THÀNH VỚI CÔNG BẰNG. Ba giới hạn phải thuộc:\n\n1. THIÊN LỆCH DỮ LIỆU (bias). Nếu dữ liệu huấn luyện phản ánh một thực tế bất công hoặc chỉ đại diện cho một nhóm, mô hình sẽ tái tạo và KHUẾCH ĐẠI điều đó — rồi khoác lên nó vẻ khách quan của con số. Dấu hiệu sớm dễ đo nhất: một nhóm chiếm quá ít trong dữ liệu (dưới ~20%), mô hình gần như chắc chắn phục vụ nhóm đó tệ hơn. Cách chữa nằm ở DỮ LIỆU và ở việc đo riêng cho từng nhóm, không nằm ở thuật toán.\n\n2. ẢO GIÁC (hallucination) của AI tạo sinh. Mô hình ngôn ngữ được huấn luyện để nói câu NGHE HỢP LÝ, không phải nói câu ĐÚNG. Vì thế nó bịa ra tên sách, điều luật, số liệu, trích dẫn với giọng rất tự tin. Nguyên tắc dùng: mọi con số, tên riêng, điều luật do AI đưa ra đều phải KIỂM CHỨNG ở nguồn gốc trước khi dùng.\n\n3. KHÔNG GIẢI THÍCH ĐƯỢC (black box). Mô hình lớn không nói được vì sao nó quyết định như vậy. Với việc ảnh hưởng tới quyền lợi con người, điều đó là vấn đề pháp lý và đạo đức chứ không chỉ kỹ thuật.\n\nKHI NÀO KHÔNG NÊN DÙNG AI:\n- Khi quyết định ảnh hưởng lớn tới đời người (tuyển dụng, tín dụng, y tế, tư pháp) mà KHÔNG có người chịu trách nhiệm rà lại từng ca.\n- Khi một luật rõ ràng đã giải quyết xong bài toán — đừng dùng ML cho việc "trên 18 tuổi thì đủ điều kiện".\n- Khi không có dữ liệu đủ và đại diện; khi sai một lần là thảm hoạ không sửa được.\n- Khi bạn không đo được nó đúng bao nhiêu phần trăm. Không đo được thì không triển khai.\n\nMột câu đáng nhớ: AI nên đứng ở vị trí TRỢ GIÚP người quyết định, không phải thay thế người chịu trách nhiệm.',
    workedExample: {
      code: `# Kiem tra can bang du lieu truoc khi huan luyen
nhom_a = 90                       # so mau nhom thu nhat
nhom_b = 10                       # so mau nhom thu hai

tong = nhom_a + nhom_b
it_hon = nhom_a
if nhom_b < nhom_a:
    it_hon = nhom_b

ti_le = it_hon / tong             # ti le cua nhom it hon
print(f"Ti le nhom it hon: {ti_le}")

if ti_le < 0.2:                   # nguong canh bao lech du lieu
    print("Canh bao: du lieu lech")
else:
    print("Du lieu can bang")`,
      stdinLines: [],
    },
    predict: {
      code: `print(10 / 100)`,
      question: 'Nhóm thiểu số có 10 mẫu trên tổng 100 — tỉ lệ in ra là bao nhiêu?',
      choices: ['0.1', '10', '10%', '10.0'],
      answerIndex: 0,
      explain:
        'Phép / cho số thực: 10 / 100 = 0.1, tức 10%. Ngưỡng cảnh báo thường đặt ở 0.2 (20%), nên bộ dữ liệu này bị đánh dấu lệch — mô hình huấn luyện trên nó gần như chắc chắn phục vụ nhóm thiểu số tệ hơn.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự bước kiểm tra cân bằng dữ liệu trước khi huấn luyện.',
      lines: [
        'a, b = input().split(",")',
        'a = int(a)',
        'b = int(b)',
        'it_hon = a if a < b else b',
        'ti_le = it_hon / (a + b)',
        'print(f"Ti le nhom it hon: {ti_le}")',
        'print("Canh bao: du lieu lech" if ti_le < 0.2 else "Du lieu can bang")',
      ],
    },
    make: {
      prompt:
        'Viết bộ kiểm tra thiên lệch dữ liệu — bước bắt buộc trước khi huấn luyện bất kỳ mô hình nào.\n\nĐọc 1 dòng input() gồm hai số nguyên cách nhau bởi dấu phẩy: số mẫu của nhóm A và nhóm B (vd "90,10").\n\nTính tỉ lệ của nhóm ÍT HƠN trên tổng số mẫu, rồi in đúng 2 dòng:\nTi le nhom it hon: <ti le>\nCanh bao: du lieu lech    (nếu tỉ lệ NHỎ HƠN 0.2)\nhoặc\nDu lieu can bang          (nếu tỉ lệ từ 0.2 trở lên)\n\nVí dụ "90,10" → "Ti le nhom it hon: 0.1" và "Canh bao: du lieu lech".',
      starterCode: `dong = input("So mau hai nhom: ")
# Tach bang split(","), doi sang int
# Tim nhom it hon, chia cho tong, so voi nguong 0.2
`,
      testCases: [
        {
          stdinLines: ['90,10'],
          expected: 'Ti le nhom it hon: 0.1\nCanh bao: du lieu lech',
          match: 'contains',
          hidden: false,
          label: '10 trên 100 → 0.1, dưới ngưỡng → cảnh báo lệch',
        },
        {
          stdinLines: ['50,50'],
          expected: 'Ti le nhom it hon: 0.5\nDu lieu can bang',
          match: 'contains',
          hidden: false,
          label: 'Cân bằng hoàn hảo → 0.5',
        },
        {
          stdinLines: ['10,90'],
          expected: 'Ti le nhom it hon: 0.1',
          match: 'contains',
          hidden: false,
          label: 'Nhóm ít hơn đứng TRƯỚC — kết quả phải như nhau',
        },
        {
          stdinLines: ['80,20'],
          expected: 'Ti le nhom it hon: 0.2\nDu lieu can bang',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng ngưỡng 0.2 — "từ 0.2 trở lên" là cân bằng',
        },
      ],
      hints: [
        'Nhóm ít hơn có thể đứng ở vị trí nào cũng được — phải so sánh rồi mới lấy, đừng mặc định số thứ hai nhỏ hơn.',
        'Tỉ lệ = số mẫu nhóm ít hơn chia cho TỔNG hai nhóm, dùng phép / để ra số thực.',
        'Ranh giới: cảnh báo khi ti_le < 0.2; đúng 0.2 thì coi là cân bằng.',
      ],
      sampleSolution: `dong = input("So mau hai nhom: ")
a, b = dong.split(",")
a = int(a)
b = int(b)
it_hon = a
if b < a:
    it_hon = b
ti_le = it_hon / (a + b)
print(f"Ti le nhom it hon: {ti_le}")
if ti_le < 0.2:
    print("Canh bao: du lieu lech")
else:
    print("Du lieu can bang")`,
    },
    homework:
      'Tìm một ứng dụng AI bạn đang dùng thật (gợi ý nội dung, dịch máy, trợ lý viết) và trả lời ba câu bằng văn viết: (1) Nếu nó sai một lần, hậu quả với bạn là gì — khó chịu, hay mất tiền, hay mất cơ hội? (2) Bạn có kiểm chứng được đầu ra của nó không, bằng cách nào? (3) Nếu chính bạn xây nó, dữ liệu huấn luyện sẽ thiếu đại diện cho nhóm người nào? Giữ lại câu trả lời — cuối khoá bạn sẽ đọc lại chúng bằng con mắt khác.',
    srsCards: [
      {
        hoi: 'Thiên lệch dữ liệu (bias) sinh ra như thế nào và chữa ở đâu?',
        dap: 'Sinh ra khi dữ liệu huấn luyện phản ánh thực tế bất công hoặc thiếu đại diện cho một nhóm; mô hình học lại và khuếch đại điều đó dưới vẻ khách quan của con số. Chữa ở khâu DỮ LIỆU và ở việc đo kết quả riêng cho từng nhóm, không chữa được bằng cách đổi thuật toán.',
      },
      {
        hoi: 'Vì sao AI tạo sinh hay bịa (ảo giác), và phải dùng nó thế nào cho an toàn?',
        dap: 'Vì nó được huấn luyện để sinh câu NGHE HỢP LÝ chứ không phải câu ĐÚNG, nên bịa tên sách, điều luật, số liệu với giọng rất tự tin. Nguyên tắc: mọi con số, tên riêng, trích dẫn do AI đưa ra đều phải kiểm chứng ở nguồn gốc trước khi dùng.',
      },
      {
        hoi: 'Kể ba tình huống KHÔNG nên dùng AI.',
        dap: 'Khi quyết định ảnh hưởng lớn tới đời người (tuyển dụng, tín dụng, y tế, tư pháp) mà không có người rà lại từng ca; khi một luật rõ ràng đã giải quyết xong bài toán; và khi bạn không đo được nó đúng bao nhiêu phần trăm — không đo được thì không triển khai.',
      },
    ],
  },
]

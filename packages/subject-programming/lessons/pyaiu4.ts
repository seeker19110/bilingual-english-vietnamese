// lessons/pyaiu4.ts — Chương C4 "Case study chạy thật" của khoá "Python / AI Cơ Bản" (pyai)
// (docs/specs/2026-09-01-pyai-bai-hoc-chi-tiet.md).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const PYAI_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u4-l1',
    unitId: 'pyai-u4',
    language: 'python',
    title: 'Case study 1 — máy gợi ý món ăn theo ngân sách',
    hook: 'Trưa nào cũng câu hỏi cũ: hôm nay ăn gì, còn bao nhiêu tiền. Hệ gợi ý của Shopee hay Netflix, bóc hết lớp toán ra, cũng chỉ làm đúng ba việc: LỌC những thứ hợp điều kiện, CHẤM ĐIỂM theo sở thích, rồi SẮP XẾP đưa cái tốt nhất lên đầu. Hôm nay bạn tự viết cả ba.',
    theory:
      'HỆ GỢI Ý đơn giản nhất gồm ba bước, và mọi hệ phức tạp sau này đều giữ đúng ba bước đó:\n\n1. LỌC (filter) — loại thẳng những lựa chọn KHÔNG khả thi: quá ngân sách, hết hàng, sai chế độ ăn. Đây là luật cứng, không thương lượng.\n2. CHẤM ĐIỂM (score) — với những cái còn lại, gán một con số thể hiện mức phù hợp với người dùng. Ở bài này điểm rất thô: đúng loại ưa thích thì xếp trước.\n3. SẮP XẾP (rank) — đưa điểm cao lên đầu, và phải quy định rõ cách PHÁ HOÀ khi hai món cùng điểm, nếu không thứ tự sẽ chập chờn giữa các lần chạy.\n\nSẮP XẾP NHIỀU TIÊU CHÍ trong Python dùng một tuple làm khoá:\nsorted(mon, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))\nPython so sánh tuple theo TỪ TRÁI SANG PHẢI: so phần tử đầu trước, chỉ khi bằng nhau mới so phần tử sau. Ở đây: đúng loại ưa thích (0) đứng trước loại khác (1); trong cùng nhóm thì giá rẻ đứng trước.\n\nTUPLE là dãy giống list nhưng KHÔNG SỬA ĐƯỢC, viết trong ngoặc tròn: ("Com tam", 35000, "man"). Dùng cho bản ghi cố định nhiều trường. Truy cập vẫn bằng chỉ số: m[0] là tên, m[1] là giá, m[2] là loại.\n\nMỘT ĐIỀU HAY BỊ QUÊN: phải xử lý ca KHÔNG CÓ GÌ PHÙ HỢP. Trả về danh sách rỗng mà không nói gì là trải nghiệm tệ nhất của mọi hệ gợi ý — luôn có một câu trả lời tử tế cho tình huống đó.',
    workedExample: {
      code: `# Moi mon la mot tuple: (ten, gia, loai)
MENU = [
    ("Com tam", 35000, "man"),
    ("Pho bo", 45000, "man"),
    ("Bun chay", 30000, "chay"),
    ("Salad", 25000, "chay"),
    ("Banh mi", 20000, "man"),
]

ngan_sach = 30000
uu_tien = "chay"

# Buoc 1: LOC theo ngan sach
hop_le = []
for m in MENU:
    if m[1] <= ngan_sach:
        hop_le.append(m)

# Buoc 2+3: CHAM DIEM va SAP XEP - dung loai uu tien truoc, roi gia re truoc
hop_le = sorted(hop_le, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))

if len(hop_le) == 0:
    print("Khong co mon phu hop")
else:
    for m in hop_le:
        print(f"{m[0]} - {m[1]} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `mon = [("A", 30, "chay"), ("B", 25, "man"), ("C", 20, "chay")]\nkq = sorted(mon, key=lambda m: (0 if m[2] == "chay" else 1, m[1]))\nprint(kq[0][0])`,
      question: 'Món nào được xếp lên đầu?',
      choices: ['C', 'A', 'B', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Khoá sắp xếp so phần tử đầu trước: A và C là "chay" nên được 0, B được 1 và tụt xuống cuối dù rẻ hơn A. Giữa A (30) và C (20) mới xét tới giá, C rẻ hơn nên đứng đầu. Đúng luật so sánh tuple: trái sang phải, chỉ khi hoà mới xét tiếp.',
    },
    parsons: {
      prompt: 'Xếp đúng ba bước của hệ gợi ý: lọc theo điều kiện cứng → sắp xếp theo ưu tiên → in.',
      lines: [
        'hop_le = []',
        'for m in MENU:',
        '    if m[1] <= ngan_sach:',
        '        hop_le.append(m)',
        'hop_le = sorted(hop_le, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))',
        'for m in hop_le:',
        '    print(f"{m[0]} - {m[1]} dong")',
      ],
    },
    make: {
      prompt:
        'Viết máy gợi ý món ăn. MENU đã cho sẵn trong code khởi đầu — giữ nguyên.\n\nĐọc từ input():\n- Dòng 1: ngân sách (số nguyên, đồng).\n- Dòng 2: loại ưa thích ("chay" hoặc "man").\n\nLọc các món có giá NHỎ HƠN HOẶC BẰNG ngân sách, rồi sắp xếp: món đúng loại ưa thích lên trước; trong cùng nhóm thì giá rẻ lên trước. In mỗi món một dòng:\n<ten> - <gia> dong\n\nNếu không món nào hợp ngân sách, in đúng một dòng: Khong co mon phu hop\n\nVí dụ ngân sách 30000, ưa thích "chay" → Salad - 25000 dong · Bun chay - 30000 dong · Banh mi - 20000 dong.',
      starterCode: `MENU = [
    ("Com tam", 35000, "man"),
    ("Pho bo", 45000, "man"),
    ("Bun chay", 30000, "chay"),
    ("Salad", 25000, "chay"),
    ("Banh mi", 20000, "man"),
]

ngan_sach = int(input("Ngan sach: "))
uu_tien = input("Loai ua thich: ")
# 1) Loc theo ngan sach  2) Sap xep uu tien roi gia  3) In hoac bao khong co mon
`,
      testCases: [
        {
          stdinLines: ['30000', 'chay'],
          expected: 'Salad - 25000 dong\nBun chay - 30000 dong\nBanh mi - 20000 dong',
          match: 'contains',
          hidden: false,
          label: 'Hai món chay rẻ nhất lên trước, món mặn xuống cuối dù rẻ hơn',
        },
        {
          stdinLines: ['20000', 'man'],
          expected: 'Banh mi - 20000 dong',
          match: 'contains',
          hidden: false,
          label: 'Ngân sách vừa đúng 20000 → Banh mi vẫn hợp lệ',
        },
        {
          stdinLines: ['50000', 'man'],
          expected:
            'Banh mi - 20000 dong\nCom tam - 35000 dong\nPho bo - 45000 dong\nSalad - 25000 dong\nBun chay - 30000 dong',
          match: 'contains',
          hidden: false,
          label: 'Đủ tiền cả menu: ba món mặn theo giá tăng, rồi tới hai món chay',
        },
        {
          stdinLines: ['15000', 'chay'],
          expected: 'Khong co mon phu hop',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không món nào trong ngân sách — phải báo tử tế, không im lặng',
        },
      ],
      hints: [
        'Điều kiện lọc là "nhỏ hơn HOẶC BẰNG" ngân sách: m[1] <= ngan_sach. Viết < sẽ loại oan món đúng bằng ngân sách.',
        'Sắp hai tiêu chí bằng một tuple khoá: key=lambda m: (0 if m[2] == uu_tien else 1, m[1]). Python tự so từ trái sang phải.',
        'Nhớ nhánh rỗng: kiểm tra len(hop_le) == 0 rồi in "Khong co mon phu hop" thay vì để chương trình không in gì cả.',
      ],
      sampleSolution: `MENU = [
    ("Com tam", 35000, "man"),
    ("Pho bo", 45000, "man"),
    ("Bun chay", 30000, "chay"),
    ("Salad", 25000, "chay"),
    ("Banh mi", 20000, "man"),
]

ngan_sach = int(input("Ngan sach: "))
uu_tien = input("Loai ua thich: ")

hop_le = []
for m in MENU:
    if m[1] <= ngan_sach:
        hop_le.append(m)

hop_le = sorted(hop_le, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))

if len(hop_le) == 0:
    print("Khong co mon phu hop")
else:
    for m in hop_le:
        print(f"{m[0]} - {m[1]} dong")`,
    },
    homework:
      'Nâng máy gợi ý lên một bậc bằng cách CHẤM ĐIỂM thật thay vì chỉ chia hai nhóm: mỗi món cộng 2 điểm nếu đúng loại ưa thích, cộng 1 điểm nếu giá dưới 70% ngân sách (rẻ thì thích hơn), trừ 1 điểm nếu bạn đã ăn nó hôm qua (thêm một dòng input là tên món hôm qua). Sắp theo điểm giảm dần rồi giá tăng dần. Bạn vừa chạm tới ý tưởng "hàm điểm" — thứ mà mọi hệ gợi ý thật đều có, chỉ khác là điểm của họ do mô hình HỌC ra từ hành vi người dùng chứ không do bạn gán tay.',
    srsCards: [
      {
        hoi: 'Ba bước của một hệ gợi ý đơn giản là gì?',
        dap: 'LỌC (loại thẳng những lựa chọn không khả thi — quá ngân sách, hết hàng), CHẤM ĐIỂM (gán số thể hiện mức phù hợp với người dùng), SẮP XẾP (đưa điểm cao lên đầu kèm luật phá hoà rõ ràng). Hệ thật phức tạp hơn nhưng vẫn đúng ba bước này.',
      },
      {
        hoi: 'Python so sánh hai tuple khoá sắp xếp theo cách nào?',
        dap: 'Từ TRÁI SANG PHẢI: so phần tử đầu trước, chỉ khi chúng bằng nhau mới so tới phần tử sau. Nhờ vậy key=lambda m: (nhom, gia) cho ra "đúng nhóm ưu tiên lên trước, trong nhóm thì giá rẻ lên trước".',
      },
      {
        hoi: 'Vì sao hệ gợi ý luôn phải xử lý riêng ca "không có kết quả"?',
        dap: 'Vì trả về danh sách rỗng mà không nói gì là trải nghiệm tệ nhất — người dùng không biết hệ hỏng hay thật sự không có gì. Luôn in một câu trả lời tử tế (vd "Khong co mon phu hop") cho nhánh rỗng.',
      },
    ],
  },
  {
    id: 'pyai-u4-l2',
    unitId: 'pyai-u4',
    language: 'python',
    title: 'Case study 2 — chấm cảm xúc câu bằng từ điển điểm',
    hook: 'Một quán có 2.000 đánh giá trên mạng. Đọc hết thì mất cả tuần. Máy đọc trong một giây — bằng cách ngây thơ đến bất ngờ: cho mỗi từ một điểm cảm xúc, cộng lại, dương là khen, âm là chê. Đó là bản tổ tiên của phân tích cảm xúc (sentiment analysis) mà ngày nay mọi sàn thương mại đều chạy.',
    theory:
      'PHÂN TÍCH CẢM XÚC bằng TỪ ĐIỂN ĐIỂM (lexicon-based) hoạt động ba bước: tách câu thành từ, tra điểm từng từ trong từ điển, cộng tổng rồi phân loại theo dấu.\n\nTỪ ĐIỂN là một dict {tu: diem}: từ tích cực điểm dương ("vui": 2, "thich": 1), từ tiêu cực điểm âm ("buon": -2, "chan": -1). Từ không có trong từ điển được coi là 0 — dùng .get(tu, 0) để không phải kiểm tra khoá.\n\nPHÂN LOẠI theo tổng điểm: lớn hơn 0 là tích cực, bằng 0 là trung tính, nhỏ hơn 0 là tiêu cực. Ranh giới 0 phải rõ: đúng bằng 0 KHÔNG phải tích cực.\n\nƯU ĐIỂM: minh bạch tuyệt đối (chỉ ra được từ nào góp bao nhiêu điểm), chạy tức thì, không cần dữ liệu huấn luyện. Đây vẫn là lựa chọn đúng khi bạn chưa có dữ liệu có nhãn.\n\nBỐN CHỖ NÓ SAI, và đây mới là phần đáng học:\n1. PHỦ ĐỊNH: "khong vui" bị chấm dương vì máy chỉ thấy từ "vui".\n2. MỈA MAI: "hay lam, doi ba tieng dong ho" — toàn từ dương mà nghĩa âm.\n3. NGỮ CẢNH: "gia re" là khen với quán ăn, nhưng "chat luong re tien" lại là chê.\n4. TỪ NGOÀI TỪ ĐIỂN: tiếng lóng, từ mới, viết tắt đều thành 0 điểm.\n\nBa lỗi đầu chính là lý do người ta chuyển sang mô hình HỌC TỪ DỮ LIỆU: thay vì người gán điểm cho từng từ, máy tự học trọng số từ hàng chục nghìn đánh giá đã có nhãn — và học được cả những mẫu như "khong + từ dương". Khoá Machine Learning sẽ làm đúng bước nâng cấp đó bằng Naive Bayes.',
    workedExample: {
      code: `TU_DIEN = {
    "vui": 2, "tuyet": 2, "thich": 1, "ngon": 2,
    "buon": -2, "te": -2, "chan": -1, "cham": -1,
}

cau = "hom nay toi rat vui va thich mon nay"

diem = 0
for tu in cau.split():
    d = TU_DIEN.get(tu, 0)        # tu ngoai tu dien thi 0 diem
    if d != 0:
        print(f"  {tu}: {d}")     # in dau vet de giai thich duoc ket qua
    diem = diem + d

print(f"Diem: {diem}")            # 2 (vui) + 1 (thich) = 3
if diem > 0:
    print("Cam xuc: tich cuc")
elif diem == 0:
    print("Cam xuc: trung tinh")
else:
    print("Cam xuc: tieu cuc")`,
      stdinLines: [],
    },
    predict: {
      code: `TU_DIEN = {"vui": 2}\ncau = "toi khong vui"\ndiem = 0\nfor tu in cau.split():\n    diem = diem + TU_DIEN.get(tu, 0)\nprint(diem)`,
      question: 'Câu "toi khong vui" được chấm mấy điểm?',
      choices: ['2', '-2', '0', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Máy chỉ cộng điểm từng từ rời rạc: "khong" không có trong từ điển nên 0 điểm, "vui" được 2. Tổng là 2, tức máy kết luận TÍCH CỰC cho một câu chê. Đây đúng là điểm yếu phủ định của phương pháp từ điển — lý do người ta chuyển sang mô hình học từ dữ liệu.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc câu → cộng dồn điểm từng từ → phân loại theo dấu.',
      lines: [
        'cau = input("Cau: ")',
        'diem = 0',
        'for tu in cau.split():',
        '    diem = diem + TU_DIEN.get(tu, 0)',
        'print(f"Diem: {diem}")',
        'if diem > 0:',
        '    print("Cam xuc: tich cuc")',
        'elif diem == 0:',
        '    print("Cam xuc: trung tinh")',
        'else:',
        '    print("Cam xuc: tieu cuc")',
      ],
    },
    make: {
      prompt:
        'Viết máy chấm cảm xúc. TU_DIEN đã cho sẵn trong code khởi đầu — giữ nguyên, không thêm từ.\n\nĐọc 1 dòng input() là một câu tiếng Việt KHÔNG DẤU, các từ cách nhau bởi khoảng trắng.\n\nCộng điểm của tất cả các từ (từ không có trong từ điển tính 0 điểm), rồi in đúng 2 dòng:\nDiem: <tong diem>\nCam xuc: tich cuc   (nếu tổng LỚN HƠN 0)\nCam xuc: trung tinh (nếu tổng BẰNG 0)\nCam xuc: tieu cuc   (nếu tổng NHỎ HƠN 0)\n\nVí dụ "hom nay toi rat vui va thich mon nay" → Diem: 3 → tich cuc.',
      starterCode: `TU_DIEN = {
    "vui": 2, "tuyet": 2, "thich": 1, "ngon": 2,
    "buon": -2, "te": -2, "chan": -1, "cham": -1,
}

cau = input("Cau: ")
# Cong diem tung tu bang TU_DIEN.get(tu, 0), roi phan loai theo dau
`,
      testCases: [
        {
          stdinLines: ['hom nay toi rat vui va thich mon nay'],
          expected: 'Diem: 3\nCam xuc: tich cuc',
          match: 'contains',
          hidden: false,
          label: 'vui (2) + thich (1) = 3 → tích cực',
        },
        {
          stdinLines: ['phim nay chan va te'],
          expected: 'Diem: -3\nCam xuc: tieu cuc',
          match: 'contains',
          hidden: false,
          label: 'chan (-1) + te (-2) = -3 → tiêu cực',
        },
        {
          stdinLines: ['mon ngon nhung phuc vu te'],
          expected: 'Diem: 0\nCam xuc: trung tinh',
          match: 'contains',
          hidden: false,
          label: 'ngon (2) + te (-2) = 0 → trung tính, khen chê bù nhau',
        },
        {
          stdinLines: ['hom nay troi mua'],
          expected: 'Diem: 0\nCam xuc: trung tinh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không từ nào trong từ điển — vẫn phải ra 0 và trung tính',
        },
      ],
      hints: [
        'Dùng TU_DIEN.get(tu, 0) để từ lạ tự tính 0 điểm — nếu viết TU_DIEN[tu] thì câu nào có từ ngoài từ điển sẽ chết vì KeyError.',
        'Ba nhánh phân loại phải xét đúng ranh giới: > 0 tích cực, == 0 trung tính, còn lại tiêu cực. Đúng 0 KHÔNG phải tích cực.',
        'In đủ hai dòng, dòng điểm trước dòng cảm xúc, đúng chính tả "Cam xuc: tich cuc" (không dấu, chữ thường ở nhãn).',
      ],
      sampleSolution: `TU_DIEN = {
    "vui": 2, "tuyet": 2, "thich": 1, "ngon": 2,
    "buon": -2, "te": -2, "chan": -1, "cham": -1,
}

cau = input("Cau: ")
diem = 0
for tu in cau.split():
    diem = diem + TU_DIEN.get(tu, 0)
print(f"Diem: {diem}")
if diem > 0:
    print("Cam xuc: tich cuc")
elif diem == 0:
    print("Cam xuc: trung tinh")
else:
    print("Cam xuc: tieu cuc")`,
    },
    homework:
      'Vá lỗi phủ định: nếu từ đứng NGAY TRƯỚC một từ có điểm là "khong", hãy ĐẢO DẤU điểm của từ đó ("khong vui" thành -2). Gợi ý: duyệt bằng chỉ số for i in range(len(cac_tu)) để nhìn được từ liền trước. Rồi thử tiếp với "khong the khong thich" và tự thấy vá kiểu này không bao giờ hết việc — đó chính là lý do ngành chuyển sang cho máy HỌC quy luật từ hàng chục nghìn câu đã dán nhãn, thay vì để người vá từng luật một.',
    srsCards: [
      {
        hoi: 'Phân tích cảm xúc bằng từ điển điểm hoạt động thế nào?',
        dap: 'Tách câu thành từ, tra điểm mỗi từ trong dict {tu: diem} (từ lạ tính 0 qua .get(tu, 0)), cộng tổng rồi phân loại theo dấu: dương là tích cực, bằng 0 là trung tính, âm là tiêu cực.',
      },
      {
        hoi: 'Kể ba tình huống làm phương pháp từ điển điểm chấm sai.',
        dap: 'Phủ định ("khong vui" bị chấm dương vì máy chỉ thấy từ "vui"), mỉa mai (toàn từ dương mà nghĩa âm), và ngữ cảnh (chữ "re" là khen với giá nhưng là chê với chất lượng). Thêm nữa, từ ngoài từ điển luôn tính 0 điểm.',
      },
      {
        hoi: 'Ưu điểm nào khiến phương pháp từ điển vẫn đáng dùng?',
        dap: 'Minh bạch tuyệt đối — chỉ ra được từ nào góp bao nhiêu điểm nên giải thích được mọi kết quả; chạy tức thì; và không cần dữ liệu huấn luyện có nhãn, nên là lựa chọn đúng khi dự án chưa có dữ liệu.',
      },
    ],
  },
  {
    id: 'pyai-u4-l3',
    unitId: 'pyai-u4',
    language: 'python',
    title: 'Tổng kết khoá & bản đồ 5 khoá tiếp theo',
    hook: 'Mười sáu bài trước, bạn đi từ dòng print đầu tiên tới hai hệ thống nhỏ chạy được thật. Khoá này không dạy bạn làm AI — nó dạy bạn ĐỦ NỀN để bước vào chuỗi năm khoá tiếp theo mà không hụt chân. Bài cuối là tấm bản đồ: bạn đang đứng đâu, và đi tiếp theo hướng nào.',
    theory:
      'BẠN ĐÃ CÓ GÌ SAU KHOÁ NÀY:\n- Python nền: biến và kiểu, if/else, vòng lặp for/while, hàm, chuỗi (chương 1).\n- Cấu trúc dữ liệu và tổ chức chương trình: list, dict, đọc/ghi file CSV, lớp và đối tượng, try/except (chương 2).\n- Khung tư duy AI: luật viết tay vs học từ dữ liệu, bản đồ AI/ML/DL/GenAI, năm bước vòng đời dự án, giới hạn và đạo đức (chương 3).\n- Hai hệ thống chạy được: máy gợi ý món ăn và máy chấm cảm xúc (chương 4).\n\nCHUỖI SÁU KHOÁ, theo thứ tự phụ thuộc:\n1. pyai — Python / AI Cơ Bản (khoá này, cửa vào).\n2. mathai — Toán Thiết Yếu cho AI: xác suất, thống kê, đại số tuyến tính, đạo hàm và gradient descent. Đây là khoá làm cho mọi công thức ở các khoá sau hết đáng sợ.\n3. mlds — Machine Learning & Data Science: pipeline dữ liệu thật, đánh giá mô hình cho đúng, 7 project nhỏ.\n4. cv1 — Deep Learning cho thị giác máy tính, cơ bản: nơ-ron, MLP, convolution, vòng huấn luyện.\n5. cv2 — Deep Learning cho thị giác, nâng cao: Transformer, ViT, phát hiện vật thể, GAN, diffusion.\n6. llmagent — LLMs & AI Agents: tokenizer, RAG, vòng lặp agent, triển khai.\n\nMỘT LỜI KHUYÊN VỀ NHỊP HỌC: đừng nhảy cóc qua khoá toán. Người bỏ qua nó vẫn chạy được code ở khoá 3 và 4, nhưng tới lúc mô hình không hội tụ hoặc kết quả vô lý thì không biết bắt đầu gỡ từ đâu, vì mọi manh mối đều nằm trong ngôn ngữ toán. Ai muốn nền lập trình dày hơn nữa thì học song song bậc P1–P2 của xương sống môn Lập trình; ai thích đi thẳng vào một nghề cụ thể thì xem 14 hướng chuyên sâu của môn.',
    workedExample: {
      code: `CHUOI = ["pyai", "mathai", "mlds", "cv1", "cv2", "llmagent"]
TEN = {
    "pyai": "Python / AI Co Ban",
    "mathai": "Toan Thiet Yeu cho AI",
    "mlds": "Machine Learning & Data Science",
    "cv1": "Deep Learning CV co ban",
    "cv2": "Deep Learning CV nang cao",
    "llmagent": "LLMs & AI Agents",
}

hien_tai = "pyai"
vi_tri = CHUOI.index(hien_tai)          # tim chi so trong danh sach
print(f"Ban dang o: {TEN[hien_tai]}")

con_lai = CHUOI[vi_tri + 1:]            # cat lat: moi khoa SAU khoa hien tai
if len(con_lai) == 0:
    print("Ban da di het chuoi")
else:
    for i, ma in enumerate(con_lai, start=1):   # danh so tu 1
        print(f"{i}. {TEN[ma]}")`,
      stdinLines: [],
    },
    predict: {
      code: `CHUOI = ["a", "b", "c"]\nprint(CHUOI[1 + 1:])`,
      question: 'Phép cắt lát này cho ra gì?',
      choices: ["['c']", "['b', 'c']", "['a', 'b']", '[]'],
      answerIndex: 0,
      explain:
        'CHUOI[2:] lấy từ chỉ số 2 tới hết, tức chỉ còn phần tử "c". Cắt lát bắt đầu từ chỉ số ĐÃ CHO và không bao gồm phần tử trước đó — đúng thứ ta cần để liệt kê "những khoá còn lại sau khoá hiện tại".',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc mã khoá → tìm vị trí → cắt lấy phần còn lại → in đánh số.',
      lines: [
        'hien_tai = input("Khoa hien tai: ")',
        'vi_tri = CHUOI.index(hien_tai)',
        'print(f"Ban dang o: {TEN[hien_tai]}")',
        'con_lai = CHUOI[vi_tri + 1:]',
        'for i, ma in enumerate(con_lai, start=1):',
        '    print(f"{i}. {TEN[ma]}")',
      ],
    },
    make: {
      prompt:
        'Viết bản đồ lộ trình. CHUOI và TEN đã cho sẵn trong code khởi đầu — giữ nguyên.\n\nĐọc 1 dòng input() là mã khoá bạn vừa học xong (một trong: pyai, mathai, mlds, cv1, cv2, llmagent).\n\nIn dòng đầu:\nBan dang o: <ten day du cua khoa do>\nRồi liệt kê các khoá CÒN LẠI phía sau, đánh số từ 1:\n1. <ten khoa ke tiep>\n2. <ten khoa sau nua>\n...\nNếu đã ở khoá cuối cùng, thay danh sách bằng đúng một dòng: Ban da di het chuoi\n\nVí dụ "cv2" → "Ban dang o: Deep Learning CV nang cao" rồi "1. LLMs & AI Agents".',
      starterCode: `CHUOI = ["pyai", "mathai", "mlds", "cv1", "cv2", "llmagent"]
TEN = {
    "pyai": "Python / AI Co Ban",
    "mathai": "Toan Thiet Yeu cho AI",
    "mlds": "Machine Learning & Data Science",
    "cv1": "Deep Learning CV co ban",
    "cv2": "Deep Learning CV nang cao",
    "llmagent": "LLMs & AI Agents",
}

hien_tai = input("Khoa hien tai: ")
# Tim vi tri bang CHUOI.index(...), cat lat phan con lai, in danh so tu 1
`,
      testCases: [
        {
          stdinLines: ['pyai'],
          expected:
            'Ban dang o: Python / AI Co Ban\n1. Toan Thiet Yeu cho AI\n2. Machine Learning & Data Science\n3. Deep Learning CV co ban\n4. Deep Learning CV nang cao\n5. LLMs & AI Agents',
          match: 'contains',
          hidden: false,
          label: 'Đứng ở khoá đầu → còn đúng 5 khoá phía sau',
        },
        {
          stdinLines: ['cv2'],
          expected: 'Ban dang o: Deep Learning CV nang cao\n1. LLMs & AI Agents',
          match: 'contains',
          hidden: false,
          label: 'Áp chót → chỉ còn một khoá',
        },
        {
          stdinLines: ['mlds'],
          expected: '1. Deep Learning CV co ban\n2. Deep Learning CV nang cao\n3. LLMs & AI Agents',
          match: 'contains',
          hidden: false,
          label: 'Đứng giữa chuỗi → đánh số lại từ 1',
        },
        {
          stdinLines: ['llmagent'],
          expected: 'Ban dang o: LLMs & AI Agents\nBan da di het chuoi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: khoá cuối — danh sách rỗng phải in câu riêng',
        },
      ],
      hints: [
        'CHUOI.index("cv2") trả về chỉ số của phần tử trong list. Lấy phần còn lại bằng cắt lát CHUOI[vi_tri + 1:].',
        'Đánh số từ 1 gọn nhất bằng enumerate(con_lai, start=1) — trả về từng cặp (số thứ tự, giá trị).',
        'Nhớ nhánh rỗng: nếu len(con_lai) == 0 thì in "Ban da di het chuoi" thay vì không in gì.',
      ],
      sampleSolution: `CHUOI = ["pyai", "mathai", "mlds", "cv1", "cv2", "llmagent"]
TEN = {
    "pyai": "Python / AI Co Ban",
    "mathai": "Toan Thiet Yeu cho AI",
    "mlds": "Machine Learning & Data Science",
    "cv1": "Deep Learning CV co ban",
    "cv2": "Deep Learning CV nang cao",
    "llmagent": "LLMs & AI Agents",
}

hien_tai = input("Khoa hien tai: ")
vi_tri = CHUOI.index(hien_tai)
print(f"Ban dang o: {TEN[hien_tai]}")
con_lai = CHUOI[vi_tri + 1:]
if len(con_lai) == 0:
    print("Ban da di het chuoi")
else:
    for i, ma in enumerate(con_lai, start=1):
        print(f"{i}. {TEN[ma]}")`,
    },
    homework:
      'Viết một trang tổng kết cho chính bạn, gồm ba phần: (1) liệt kê 5 khái niệm bạn thấy khó nhất trong 17 bài vừa qua và tự giải thích lại bằng lời của mình — chỗ nào giải thích lắp bắp là chỗ chưa thật sự hiểu, quay lại bài đó; (2) mở lại chương trình quản lý điểm bạn viết ở cuối chương 2 và cải tiến một chỗ bất kỳ bằng thứ học được ở chương 4; (3) đặt lịch cụ thể cho khoá tiếp theo (mathai): ngày bắt đầu, mấy buổi một tuần. Lộ trình chỉ có tác dụng khi có ngày tháng gắn vào nó.',
    srsCards: [
      {
        hoi: 'Chuỗi sáu khoá "Kỹ sư AI thực chiến" gồm những khoá nào, theo thứ tự?',
        dap: 'pyai (Python / AI cơ bản) → mathai (Toán thiết yếu cho AI) → mlds (Machine Learning & Data Science) → cv1 (Deep Learning CV cơ bản) → cv2 (Deep Learning CV nâng cao) → llmagent (LLMs & AI Agents).',
      },
      {
        hoi: 'Vì sao không nên nhảy cóc qua khoá toán (mathai)?',
        dap: 'Vì không có nó bạn vẫn chạy được code, nhưng khi mô hình không hội tụ hay kết quả vô lý thì không biết gỡ từ đâu — mọi manh mối đều nằm trong ngôn ngữ xác suất, đại số tuyến tính và đạo hàm mà khoá đó dạy.',
      },
      {
        hoi: 'Cắt lát danh_sach[i + 1:] cho ra cái gì?',
        dap: 'Một list mới gồm mọi phần tử ĐỨNG SAU chỉ số i (bắt đầu từ i + 1 tới hết); nếu i là chỉ số cuối thì kết quả là list rỗng. Đây là cách gọn nhất để lấy "phần còn lại phía trước" của một lộ trình.',
      },
    ],
  },
]

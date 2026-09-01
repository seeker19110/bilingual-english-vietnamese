// lessons/llmagentu2.ts — Chương "RAG" của khoá ngắn "LLMs & AI Agents"
// (docs/specs/2026-09-01-llmagent-bai-hoc-chi-tiet.md).
//
// unitId 'llmagent-u2' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn,
// được lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi bài language 'python', code được chấm là Python THUẦN (chỉ
// thư viện chuẩn `math`) để Pyodide trình duyệt và python3 CI chấm y hệt nhau; mọi output
// in ra bằng tiếng Việt KHÔNG DẤU, số thực luôn round() cho test-case ổn định.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const LLMAGENT_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'llmagent-u2-l1',
    unitId: 'llmagent-u2',
    language: 'python',
    title: 'Vì sao cần RAG — kiến thức đóng băng vs tra cứu',
    hook: 'Hỏi một LLM giá vé tàu hôm nay, nó trả lời rất tự tin bằng con số của hai năm trước — hoặc bằng con số nó bịa ra. Nó không nói dối: kiến thức của nó bị ĐÓNG BĂNG tại ngày kết thúc huấn luyện. Cách sửa không phải là huấn luyện lại, mà là đưa cho nó tài liệu để TRA.',
    theory:
      'Một LLM sau khi huấn luyện xong thì kiến thức đứng yên. Ba hệ quả:\n\n1. CŨ. Mọi thứ xảy ra sau ngày cắt dữ liệu (knowledge cutoff), nó không biết.\n2. KHÔNG CÓ DỮ LIỆU RIÊNG. Tài liệu nội bộ công ty bạn, sổ tay sản phẩm, cơ sở dữ liệu khách hàng — không có trong kho huấn luyện internet.\n3. BỊA. Tệ nhất: khi không biết, nó không im lặng mà sinh ra thứ nghe hợp lý.\n\nCó ba đường sửa, và chọn sai đường là đốt tiền:\n- HUẤN LUYỆN LẠI từ đầu: đúng đắn nhất về lý thuyết, tốn hàng triệu đô và hàng tháng. Loại.\n- FINE-TUNING: rẻ hơn nhiều, nhưng dạy được PHONG CÁCH và ĐỊNH DẠNG chứ không phải sự thật thay đổi hằng ngày; mỗi lần dữ liệu đổi lại phải luyện lại, và mô hình vẫn không trích được nguồn.\n- RAG (Retrieval-Augmented Generation — sinh có tra cứu): giữ nguyên mô hình, chỉ TÌM các đoạn tài liệu liên quan tới câu hỏi rồi CHÈN vào prompt trước khi hỏi. Cập nhật kiến thức = sửa file tài liệu, không đụng gì tới mô hình.\n\nRAG có 4 nhịp: ① chẻ tài liệu thành các đoạn (chunk) → ② nhúng mỗi đoạn thành vector và lưu lại → ③ khi có câu hỏi, nhúng câu hỏi rồi tìm các đoạn có cosine cao nhất → ④ dán các đoạn đó vào prompt kèm câu hỏi, yêu cầu mô hình CHỈ trả lời dựa trên tài liệu được cho.\n\nBốn cái lợi thẳng thừng: kiến thức cập nhật tức thì; TRÍCH ĐƯỢC NGUỒN (người dùng bấm xem đoạn gốc); giảm ảo giác vì câu trả lời bị neo vào tài liệu; và gỡ được — xoá một tài liệu là mô hình thôi biết nó ngay, điều mà fine-tuning không làm nổi.\n\nRAG cũng có giới hạn thật: nếu bước TÌM trả về sai đoạn thì câu trả lời sai theo (rác vào, rác ra), và prompt dài thêm nên tốn token hơn. Đo chất lượng bước tìm là việc của bài 3.',
    workedExample: {
      code: `# Cung mot cau hoi, hai che do: tra loi tu tri nho vs tra cuu tai lieu
KIEN_THUC_CU = {"thu do": "Ha Noi", "gia ve": "20000 dong"}   # hoc tu 2 nam truoc
TAI_LIEU_MOI = {"gia ve": "35000 dong", "gio mo cua": "8h sang"}  # file cap nhat

cau_hoi = "gia ve"

# Che do NOI TAI: chi biet nhung gi da hoc -> tra ve gia CU
print("Noi tai:", KIEN_THUC_CU.get(cau_hoi, "Toi khong chac (co the ao giac)"))

# Che do RAG: tra tai lieu moi TRUOC, khong co moi lui ve kien thuc cu
if cau_hoi in TAI_LIEU_MOI:
    print("RAG:", TAI_LIEU_MOI[cau_hoi])
elif cau_hoi in KIEN_THUC_CU:
    print("RAG:", KIEN_THUC_CU[cau_hoi])
else:
    print("RAG:", "Khong tim thay trong tai lieu")`,
      stdinLines: [],
    },
    predict: {
      code: `KIEN_THUC_CU = {"thu do": "Ha Noi", "gia ve": "20000 dong"}\nprint(KIEN_THUC_CU.get("gio mo cua", "Toi khong chac (co the ao giac)"))`,
      question: 'Hỏi một thứ không có trong kiến thức đã học, chương trình in gì?',
      choices: [
        'Toi khong chac (co the ao giac)',
        'None',
        'gio mo cua',
        'Chương trình báo lỗi KeyError',
      ],
      answerIndex: 0,
      explain:
        'dict.get(khoa, mac_dinh) trả về giá trị mặc định khi không có khoá — khác hẳn KIEN_THUC_CU["gio mo cua"] vốn ném KeyError. Ở đây mặc định được chọn là câu thú nhận không biết. Một LLM thật KHÔNG có nhánh này: khi thiếu dữ liệu nó vẫn sinh ra một câu nghe hợp lý — đó chính là ảo giác, và là lý do RAG tồn tại.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự ưu tiên của chế độ RAG: tra tài liệu mới trước → lùi về kiến thức cũ → cuối cùng mới thú nhận không tìm thấy.',
      lines: [
        'if cau_hoi in TAI_LIEU_MOI:',
        '    tra_loi = TAI_LIEU_MOI[cau_hoi]',
        'elif cau_hoi in KIEN_THUC_CU:',
        '    tra_loi = KIEN_THUC_CU[cau_hoi]',
        'else:',
        '    tra_loi = "Khong tim thay trong tai lieu"',
        'print(f"Tra loi: {tra_loi}")',
      ],
    },
    make: {
      prompt:
        'Mô phỏng sự khác nhau giữa "trả lời từ trí nhớ" và "trả lời có tra cứu".\n\nHai kho dữ liệu đã nhúng sẵn trong starter code (KIEN_THUC_CU = kiến thức đóng băng lúc huấn luyện, TAI_LIEU_MOI = tài liệu cập nhật hôm nay) — không được đổi.\n\nĐọc 2 dòng input():\n- Dòng 1: câu hỏi (đúng một khoá, ví dụ "gia ve").\n- Dòng 2: chế độ, là "rag" hoặc "noi_tai".\n\nLuật trả lời:\n- Chế độ "rag": tra TAI_LIEU_MOI trước; không có thì lùi về KIEN_THUC_CU; vẫn không có thì trả "Khong tim thay trong tai lieu".\n- Chế độ "noi_tai": chỉ tra KIEN_THUC_CU; không có thì trả "Toi khong chac (co the ao giac)".\n\nIn đúng 1 dòng:\nTra loi: <câu trả lời>',
      starterCode: `KIEN_THUC_CU = {"thu do": "Ha Noi", "gia ve": "20000 dong"}\nTAI_LIEU_MOI = {"gia ve": "35000 dong", "gio mo cua": "8h sang"}\n\ncau_hoi = input("Cau hoi: ")\nche_do = input("Che do: ")\n# Neu che_do == "rag": uu tien TAI_LIEU_MOI, roi KIEN_THUC_CU, roi cau khong tim thay\n# Nguoc lai: chi tra KIEN_THUC_CU, khong co thi thu nhan co the ao giac\n`,
      testCases: [
        {
          stdinLines: ['gia ve', 'noi_tai'],
          expected: 'Tra loi: 20000 dong',
          match: 'contains',
          hidden: false,
          label: 'Chế độ nội tại → trả giá CŨ, đã lỗi thời',
        },
        {
          stdinLines: ['gia ve', 'rag'],
          expected: 'Tra loi: 35000 dong',
          match: 'contains',
          hidden: false,
          label: 'Cùng câu hỏi, chế độ RAG → trả giá MỚI từ tài liệu',
        },
        {
          stdinLines: ['gio mo cua', 'noi_tai'],
          expected: 'Tra loi: Toi khong chac (co the ao giac)',
          match: 'contains',
          hidden: false,
          label: 'Nội tại không biết → phải thú nhận, không được bịa',
        },
        {
          stdinLines: ['dan so', 'rag'],
          expected: 'Tra loi: Khong tim thay trong tai lieu',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: RAG cũng chịu khi cả hai kho đều không có',
        },
      ],
      hints: [
        'Kiểm tra khoá có trong dict: if cau_hoi in TAI_LIEU_MOI. Nhớ thứ tự ưu tiên của chế độ rag: mới trước, cũ sau.',
        'Dùng if / elif / else lồng trong nhánh chế độ — hoặc gán vào một biến tra_loi rồi in một lần ở cuối cho gọn.',
        'Chuỗi phải khớp CHÍNH XÁC từng chữ, kể cả dấu ngoặc: "Toi khong chac (co the ao giac)" và "Khong tim thay trong tai lieu".',
      ],
      sampleSolution: `KIEN_THUC_CU = {"thu do": "Ha Noi", "gia ve": "20000 dong"}\nTAI_LIEU_MOI = {"gia ve": "35000 dong", "gio mo cua": "8h sang"}\n\ncau_hoi = input("Cau hoi: ")\nche_do = input("Che do: ")\nif che_do == "rag":\n    if cau_hoi in TAI_LIEU_MOI:\n        tra_loi = TAI_LIEU_MOI[cau_hoi]\n    elif cau_hoi in KIEN_THUC_CU:\n        tra_loi = KIEN_THUC_CU[cau_hoi]\n    else:\n        tra_loi = "Khong tim thay trong tai lieu"\nelse:\n    if cau_hoi in KIEN_THUC_CU:\n        tra_loi = KIEN_THUC_CU[cau_hoi]\n    else:\n        tra_loi = "Toi khong chac (co the ao giac)"\nprint(f"Tra loi: {tra_loi}")`,
    },
    homework:
      'Viết ra 5 câu hỏi mà một trợ lý AI cho CHÍNH bạn cần trả lời được (thời khoá biểu, mật khẩu wifi nhà, món ăn bạn dị ứng...). Với mỗi câu, đánh dấu: LLM thuần có trả lời được không? Nếu không, tài liệu nào cần đưa vào kho RAG để nó trả lời được? Đó chính là bản thiết kế kho tài liệu đầu tiên của bạn.',
    srsCards: [
      {
        hoi: 'RAG là gì và giải quyết vấn đề nào của LLM?',
        dap: 'RAG (Retrieval-Augmented Generation) = tìm các đoạn tài liệu liên quan tới câu hỏi rồi chèn vào prompt trước khi hỏi mô hình. Nó chữa ba bệnh của kiến thức đóng băng: thông tin cũ, không có dữ liệu riêng của bạn, và bịa khi không biết.',
      },
      {
        hoi: 'Bốn nhịp của một hệ RAG?',
        dap: '① Chẻ tài liệu thành các đoạn (chunk). ② Nhúng mỗi đoạn thành vector và lưu lại. ③ Khi có câu hỏi thì nhúng câu hỏi và tìm các đoạn có cosine cao nhất. ④ Dán các đoạn đó vào prompt kèm câu hỏi, yêu cầu mô hình chỉ trả lời dựa trên tài liệu được cho.',
      },
      {
        hoi: 'Khi nào chọn RAG, khi nào chọn fine-tuning?',
        dap: 'RAG cho SỰ THẬT hay thay đổi và dữ liệu riêng: cập nhật tức thì, trích được nguồn, xoá tài liệu là mô hình thôi biết ngay. Fine-tuning cho PHONG CÁCH và ĐỊNH DẠNG trả lời cố định: nó không nhớ được sự thật thay đổi hằng ngày và không trích nguồn được.',
      },
    ],
  },
  {
    id: 'llmagent-u2-l2',
    unitId: 'llmagent-u2',
    language: 'python',
    title: 'RAG mini tự cài — 10 đoạn văn, vector tần suất từ, top-2',
    hook: 'Bài trước RAG còn là một cái dict tra khoá cứng: hỏi sai một chữ là trượt. Bài này bạn cài bước TÌM thật — hỏi "dong vat nuoi" mà kho không có đúng cụm đó, hệ thống vẫn lôi ra được câu về con mèo. Đây là trái tim của mọi hệ RAG, và nó gọn trong 20 dòng Python.',
    theory:
      'Bước TÌM (retrieval) của RAG chạy như sau:\n\n1. XÂY TỪ ĐIỂN. Gom mọi từ xuất hiện trong toàn bộ kho tài liệu thành một danh sách có THỨ TỰ CỐ ĐỊNH. Thứ tự này là hệ trục toạ độ: từ thứ i luôn ứng với chiều thứ i của mọi vector.\n2. NHÚNG BAG-OF-WORDS. Mỗi đoạn văn thành một vector: chiều thứ i = số lần từ thứ i xuất hiện trong đoạn. Gọi là "túi từ" vì nó vứt bỏ thứ tự từ — "meo can cho" và "cho can meo" cho vector y hệt. Thô, nhưng đủ để bạn thấy trọn cơ chế.\n3. NHÚNG CÂU HỎI theo đúng từ điển đó, đúng hệ trục đó.\n4. XẾP HẠNG bằng cosine với TỪNG đoạn, lấy top-k đoạn điểm cao nhất.\n5. (Ở hệ thật) dán top-k vào prompt rồi mới gọi LLM.\n\nHai chi tiết kỹ thuật mà bỏ qua là hỏng:\n- ĐỘ DÀI. Đoạn dài có nhiều từ hơn nên vector dài hơn, nếu chấm bằng tích vô hướng thuần thì đoạn dài luôn thắng. Cosine chia cho độ dài nên đã tự chuẩn hoá — lý do bài 2 chương 1 dạy cosine trước.\n- HOÀ ĐIỂM. Hai đoạn cùng điểm thì phải có luật xếp trước-sau CỐ ĐỊNH, nếu không mỗi lần chạy ra một thứ tự khác. Ta chốt: điểm giảm dần, hoà thì đoạn có chỉ số nhỏ hơn đứng trước — viết bằng key=(-diem, chi_so).\n\nGiới hạn của bag-of-words, và cũng là lý do embedding thật tồn tại: nó khớp CHỮ chứ không khớp NGHĨA. Hỏi "xe hai banh" thì đoạn viết "xe may" vẫn ra điểm 0. Embedding thật (bài 2 chương 1) học từ hàng tỉ câu nên hai cụm đó có vector gần nhau. Đổi từ bài này sang hệ thật chỉ là thay hàm nhúng — toàn bộ phần còn lại, kể cả công thức cosine và luật xếp hạng, giữ nguyên không sửa một dòng.',
    workedExample: {
      code: `import math

DOAN = ["meo la dong vat nuoi", "python la ngon ngu lap trinh"]

tu_dien = []                          # he truc toa do dung chung
for d in DOAN:
    for t in d.split():
        if t not in tu_dien:          # giu thu tu gap dau tien, khong sap xep
            tu_dien.append(t)

def vector(cau):                      # bag-of-words: dem tan suat tung tu
    tu = cau.split()
    return [tu.count(t) for t in tu_dien]

def cosine(a, b):
    tich = sum(a[i] * b[i] for i in range(len(a)))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if na == 0 or nb == 0:            # cau hoi khong co tu nao trong kho
        return 0.0
    return tich / (na * nb)

print("Tu dien:", tu_dien)
v = vector("dong vat")                # nhung cau hoi theo dung he truc do
for i in range(len(DOAN)):
    print(i, round(cosine(v, vector(DOAN[i])), 4))`,
      stdinLines: [],
    },
    predict: {
      code: `diem = [(0.5, 0), (0.8, 1), (0.5, 2)]\ndiem.sort(key=lambda c: (-c[0], c[1]))\nprint(diem)`,
      question: 'Danh sách (điểm, chỉ số) sau khi sắp xếp là gì?',
      choices: [
        '[(0.8, 1), (0.5, 0), (0.5, 2)]',
        '[(0.5, 0), (0.5, 2), (0.8, 1)]',
        '[(0.8, 1), (0.5, 2), (0.5, 0)]',
        '[(0.5, 2), (0.5, 0), (0.8, 1)]',
      ],
      answerIndex: 0,
      explain:
        'key=(-c[0], c[1]) nghĩa là: sắp theo điểm ĐẢO DẤU tăng dần — tức điểm gốc GIẢM dần, nên 0.8 lên đầu. Khi hoà (hai đoạn cùng 0.5), khoá thứ hai là chỉ số tăng dần nên đoạn 0 đứng trước đoạn 2. Không có luật hoà điểm này thì thứ tự trả về phụ thuộc cài đặt và test sẽ chập chờn.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự bước TÌM của RAG: nhúng câu hỏi → chấm điểm mọi đoạn → xếp hạng có luật hoà → in top-2.',
      lines: [
        'v = vector(truy_van)',
        'diem = [(cosine(v, vector(DOAN[i])), i) for i in range(len(DOAN))]',
        'diem.sort(key=lambda c: (-c[0], c[1]))',
        'for hang in range(2):',
        '    d, i = diem[hang]',
        '    print(f"Top {hang + 1}: {DOAN[i]} (diem {round(d, 4)})")',
      ],
    },
    make: {
      prompt:
        'Cài trọn bước TÌM của một hệ RAG mini trên 10 đoạn văn.\n\nMười đoạn đã nhúng sẵn trong starter code (biến DOAN) — không được sửa, không được thêm bớt.\n\nĐọc MỘT dòng input() là câu truy vấn.\n\nCác bước:\n1. Xây từ điển: duyệt 10 đoạn theo thứ tự, mỗi từ MỚI thì thêm vào cuối danh sách (giữ thứ tự gặp đầu tiên, KHÔNG sắp xếp).\n2. Hàm vector(cau): trả về list số lần xuất hiện của từng từ trong từ điển.\n3. Hàm cosine(a, b): công thức chuẩn, trả 0.0 nếu một vector có độ dài 0.\n4. Chấm điểm cả 10 đoạn, sắp theo điểm giảm dần; hoà điểm thì đoạn có chỉ số nhỏ hơn đứng trước.\n\nIn đúng 2 dòng:\nTop 1: <nội dung đoạn> (diem <điểm làm tròn 4 chữ số>)\nTop 2: <nội dung đoạn> (diem <điểm làm tròn 4 chữ số>)',
      starterCode: `import math\n\nDOAN = [\n    "meo la dong vat nuoi trong nha",\n    "cho la dong vat trung thanh",\n    "python la ngon ngu lap trinh",\n    "javascript chay tren trinh duyet",\n    "ha noi la thu do cua viet nam",\n    "sai gon la thanh pho lon nhat",\n    "pho la mon an noi tieng",\n    "ca phe sua da rat ngon",\n    "mua he troi rat nong",\n    "mua dong troi lanh va kho",\n]\n\n# 1. Xay tu_dien tu 10 doan (giu thu tu gap dau tien)\n# 2. def vector(cau): dem tan suat theo tu_dien\n# 3. def cosine(a, b): tich vo huong / (do dai a * do dai b), chan chia 0\n# 4. Cham diem 10 doan, sap xep, in top 2\ntruy_van = input("Cau hoi: ")\n`,
      testCases: [
        {
          stdinLines: ['dong vat nuoi'],
          expected:
            'Top 1: meo la dong vat nuoi trong nha (diem 0.6547)\nTop 2: cho la dong vat trung thanh (diem 0.4714)',
          match: 'contains',
          hidden: false,
          label: 'Truy vấn về động vật → hai đoạn về mèo và chó lên đầu',
        },
        {
          stdinLines: ['ngon ngu lap trinh'],
          expected:
            'Top 1: python la ngon ngu lap trinh (diem 0.8165)\nTop 2: javascript chay tren trinh duyet (diem 0.2236)',
          match: 'contains',
          hidden: false,
          label: 'Đoạn khớp gần trọn vẹn được 0.8165; đoạn chỉ chung chữ "trinh" được 0.2236',
        },
        {
          stdinLines: ['troi nong'],
          expected:
            'Top 1: mua he troi rat nong (diem 0.6325)\nTop 2: mua dong troi lanh va kho (diem 0.2887)',
          match: 'contains',
          hidden: false,
          label: 'Truy vấn 2 từ, cả hai đoạn mùa đều có chữ "troi"',
        },
        {
          stdinLines: ['mua dong lanh'],
          expected: 'Top 1: mua dong troi lanh va kho (diem 0.7071)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: truy vấn 3 từ khớp đúng đoạn mùa đông',
        },
      ],
      hints: [
        'Xây từ điển đúng thứ tự: duyệt DOAN rồi duyệt d.split(), chỉ append khi "t not in tu_dien". Đừng dùng set() — set không giữ thứ tự nên vector sẽ lệch trục giữa các lần chạy.',
        'Vector bag-of-words gọn trong một dòng: [tu.count(t) for t in tu_dien], với tu = cau.split(). Chú ý đếm trên LIST các từ, không phải trên chuỗi (chuỗi sẽ đếm cả từ nằm lồng trong từ khác).',
        'Xếp hạng có luật hoà: gom thành list các cặp (diem, chi_so) rồi diem.sort(key=lambda c: (-c[0], c[1])). In theo đúng khuôn: f"Top {hang + 1}: {DOAN[i]} (diem {round(d, 4)})".',
      ],
      sampleSolution: `import math\n\nDOAN = [\n    "meo la dong vat nuoi trong nha",\n    "cho la dong vat trung thanh",\n    "python la ngon ngu lap trinh",\n    "javascript chay tren trinh duyet",\n    "ha noi la thu do cua viet nam",\n    "sai gon la thanh pho lon nhat",\n    "pho la mon an noi tieng",\n    "ca phe sua da rat ngon",\n    "mua he troi rat nong",\n    "mua dong troi lanh va kho",\n]\n\ntu_dien = []\nfor d in DOAN:\n    for t in d.split():\n        if t not in tu_dien:\n            tu_dien.append(t)\n\ndef vector(cau):\n    tu = cau.split()\n    return [tu.count(t) for t in tu_dien]\n\ndef cosine(a, b):\n    tich = sum(a[i] * b[i] for i in range(len(a)))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(x * x for x in b))\n    if na == 0 or nb == 0:\n        return 0.0\n    return tich / (na * nb)\n\ntruy_van = input("Cau hoi: ")\nv = vector(truy_van)\ndiem = [(cosine(v, vector(DOAN[i])), i) for i in range(len(DOAN))]\ndiem.sort(key=lambda c: (-c[0], c[1]))\nfor hang in range(2):\n    d, i = diem[hang]\n    print(f"Top {hang + 1}: {DOAN[i]} (diem {round(d, 4)})")`,
    },
    homework:
      'Thử gõ vào chương trình của bạn một truy vấn ĐỒNG NGHĨA nhưng khác chữ với kho, ví dụ "thu cung trong nha" (kho viết "dong vat nuoi"). Điểm ra bao nhiêu? Rồi thử một truy vấn hoàn toàn lạc đề như "bong da". Viết ra hai câu: (1) bag-of-words hỏng ở đâu, (2) vì sao hệ thật vẫn phải trả về top-k dù mọi điểm đều thấp — và bạn sẽ đặt NGƯỠNG điểm tối thiểu bao nhiêu để thà nói "không tìm thấy" còn hơn đưa rác vào prompt.',
    srsCards: [
      {
        hoi: 'Vector bag-of-words được xây thế nào, và nó vứt mất thông tin gì?',
        dap: 'Gom mọi từ trong kho thành một từ điển có thứ tự cố định; mỗi đoạn thành vector mà chiều thứ i là số lần từ thứ i xuất hiện. Nó vứt mất THỨ TỰ TỪ: "meo can cho" và "cho can meo" cho vector y hệt nhau.',
      },
      {
        hoi: 'Vì sao bước xếp hạng của RAG phải có luật xử lý HOÀ ĐIỂM cố định?',
        dap: 'Vì hai đoạn cùng điểm mà không có luật thì thứ tự trả về phụ thuộc chi tiết cài đặt, khiến kết quả chập chờn giữa các lần chạy và test không ổn định. Luật chốt ở bài: điểm giảm dần, hoà thì chỉ số nhỏ hơn đứng trước — key=(-diem, chi_so).',
      },
      {
        hoi: 'Bag-of-words hỏng ở đâu so với embedding thật, và đổi sang embedding thật tốn công gì?',
        dap: 'Bag-of-words khớp CHỮ chứ không khớp NGHĨA: "xe hai banh" và "xe may" cho điểm 0. Embedding thật học từ hàng tỉ câu nên hai cụm đó gần nhau. Đổi sang hệ thật chỉ cần thay hàm nhúng — cosine và luật xếp hạng giữ nguyên.',
      },
    ],
  },
  {
    id: 'llmagent-u2-l3',
    unitId: 'llmagent-u2',
    language: 'python',
    title: 'Chunking & đánh giá retrieval — precision@k tự tính',
    hook: 'Hệ RAG của bạn trả lời sai. Lỗi ở mô hình hay ở bước tìm? Không đo thì chỉ có đoán, và đoán thì sửa mãi không hết. Có một con số chấm riêng bước tìm, tính được bằng ba dòng Python: precision@k.',
    theory:
      'RAG có HAI chỗ hỏng độc lập: bước TÌM lôi sai đoạn, hoặc bước SINH đọc đúng đoạn mà vẫn trả lời bậy. Đo riêng bước tìm trước, vì rác vào thì chắc chắn rác ra — sửa mô hình lúc đó là vô ích.\n\nPRECISION@K = trong k kết quả đầu tiên trả về, bao nhiêu phần thật sự liên quan?\n\nprecision@k = (số kết quả đúng trong k đầu) / k\n\nRECALL@K = trong toàn bộ các đoạn đúng có trong kho, bao nhiêu phần lọt vào k đầu?\n\nrecall@k = (số kết quả đúng trong k đầu) / (tổng số đoạn đúng)\n\nHai số này kéo nhau ngược chiều khi tăng k: k càng lớn thì recall càng cao (bắt được nhiều đoạn đúng hơn) nhưng precision càng dễ tụt (lẫn thêm rác). Với RAG, k chính là số đoạn bạn dán vào prompt — nên k lớn còn kéo theo chi phí token và nguy cơ "lost in the middle".\n\nMẫu số luôn là k, KHÔNG phải số kết quả thực tế trả về. Nếu hệ thống chỉ trả 2 kết quả mà bạn hỏi precision@5 thì mẫu vẫn là 5 — nó bị phạt vì trả thiếu, đúng như ý định.\n\nCHUNKING — chẻ tài liệu thế nào — là đòn bẩy mạnh nhất lên chính hai con số đó:\n- CHUNK NHỎ (1–2 câu): điểm cosine sắc nét, precision cao; nhưng dễ đứt ngữ cảnh — câu trả lời nằm vắt qua hai chunk thì cả hai đều nửa vời.\n- CHUNK TO (cả trang): giữ trọn ngữ cảnh; nhưng vector bị "loãng" vì trộn nhiều chủ đề, điểm cosine mờ đi, và tốn token khi dán vào prompt.\n- CHỒNG LẤN (overlap): cho hai chunk liền nhau dùng chung một đoạn cuối/đầu (thường 10–20%), để câu trả lời vắt ngang không bị cắt đôi. Đây là cách chữa thực dụng nhất.\n- Chẻ THEO CẤU TRÚC (theo đề mục, theo đoạn văn) gần như luôn tốt hơn chẻ theo số ký tự cứng.\n\nQuy trình làm việc chuẩn: dựng một bộ đánh giá gồm 20–50 câu hỏi kèm đáp án là các đoạn ĐÚNG, rồi mỗi lần đổi cách chunk hay đổi mô hình nhúng thì chạy lại và so precision@k. Không có bộ đó thì mọi "cải tiến" chỉ là cảm giác.',
    workedExample: {
      code: `# Cham rieng buoc TIM: he thong tra ve gi, dap an dung la gi
ket_qua = ["d1", "d2", "d3", "d4"]   # thu tu he thong xep hang
dung = ["d2", "d4", "d9"]            # cac doan that su lien quan

k = 2
dau_k = ket_qua[:k]                  # chi xet k ket qua dau tien
so_trung = 0
for m in dau_k:
    if m in dung:                    # dem cai nao nam trong dap an
        so_trung += 1

print("k =", k, "->", dau_k, "trung", so_trung)
print("Precision@2:", round(so_trung / k, 4))          # mau la k
print("Recall@2:", round(so_trung / len(dung), 4))     # mau la tong doan dung

k = 4                                # tang k: recall len, precision co the tut
dau_k = ket_qua[:k]
so_trung = sum(1 for m in dau_k if m in dung)
print("Precision@4:", round(so_trung / k, 4))
print("Recall@4:", round(so_trung / len(dung), 4))`,
      stdinLines: [],
    },
    predict: {
      code: `ket_qua = ["d1", "d2"]\ndung = ["d2", "d5"]\nk = 5\nso_trung = sum(1 for m in ket_qua[:k] if m in dung)\nprint(round(so_trung / k, 4))`,
      question: 'Hệ thống chỉ trả về 2 kết quả nhưng ta hỏi precision@5. In ra gì?',
      choices: ['0.2', '0.5', '1.0', 'Chương trình báo lỗi IndexError'],
      answerIndex: 0,
      explain:
        'ket_qua[:5] trên list 2 phần tử trả về cả 2 phần tử, KHÔNG lỗi (lát cắt Python không bao giờ vượt biên). Trong đó chỉ "d2" đúng nên số trúng = 1. Mẫu số vẫn là k = 5 chứ không phải 2, nên precision = 1/5 = 0.2 — hệ thống bị phạt vì trả thiếu, đúng như thiết kế của độ đo.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự tính precision@k: cắt k đầu → đếm số trúng → chia cho k → in.',
      lines: [
        'dau_k = ket_qua[:k]',
        'so_trung = 0',
        'for m in dau_k:',
        '    if m in dung:',
        '        so_trung += 1',
        'print(f"Precision@{k}: {round(so_trung / k, 4)}")',
      ],
    },
    make: {
      prompt:
        'Tự cài độ đo precision@k để chấm bước tìm của hệ RAG.\n\nĐọc 3 dòng input():\n- Dòng 1: danh sách kết quả hệ thống trả về, theo thứ tự xếp hạng, cách nhau bởi dấu phẩy (ví dụ "d1,d2,d3").\n- Dòng 2: danh sách các kết quả ĐÚNG, cách nhau bởi dấu phẩy (ví dụ "d2,d5").\n- Dòng 3: số nguyên k.\n\nTính: chỉ xét k kết quả đầu tiên, đếm bao nhiêu cái nằm trong danh sách đúng, rồi chia cho k (mẫu số LUÔN là k, kể cả khi hệ thống trả về ít hơn k kết quả).\n\nIn đúng 2 dòng:\nSo trung trong <k> dau: <số trúng>\nPrecision@<k>: <kết quả làm tròn 4 chữ số>',
      starterCode: `ket_qua = input("Ket qua tra ve: ").split(",")\ndung = input("Dap an dung: ").split(",")\nk = int(input("k: "))\n# Cat k phan tu dau bang ket_qua[:k], dem bao nhieu cai nam trong dung\n# Chia cho k (khong phai cho so ket qua thuc te), lam tron 4 chu so\n`,
      testCases: [
        {
          stdinLines: ['d1,d2,d3', 'd2,d5', '3'],
          expected: 'So trung trong 3 dau: 1\nPrecision@3: 0.3333',
          match: 'contains',
          hidden: false,
          label: '3 kết quả đầu chỉ có d2 đúng → 1/3 ≈ 0.3333',
        },
        {
          stdinLines: ['d1,d2,d3', 'd1,d3', '2'],
          expected: 'So trung trong 2 dau: 1\nPrecision@2: 0.5',
          match: 'contains',
          hidden: false,
          label: 'd3 đúng nhưng nằm ngoài top-2 nên không được tính → 0.5',
        },
        {
          stdinLines: ['a,b,c,d', 'a,b,c,d', '4'],
          expected: 'Precision@4: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Bước tìm hoàn hảo → 1.0',
        },
        {
          stdinLines: ['x,y', 'a,b', '2'],
          expected: 'Precision@2: 0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không trúng cái nào → 0.0, không được lỗi chia',
        },
      ],
      hints: [
        'Tách chuỗi thành list: input().split(",") — kết quả đã là list các chuỗi, không cần đổi kiểu.',
        'Cắt k phần tử đầu: ket_qua[:k]. Lát cắt an toàn cả khi list ngắn hơn k, nên không cần kiểm tra độ dài.',
        'Kiểm tra một phần tử có nằm trong list khác: "if m in dung". Nhớ chia cho k chứ không phải len(dau_k) — đó là chỗ sai kinh điển của độ đo này.',
      ],
      sampleSolution: `ket_qua = input("Ket qua tra ve: ").split(",")\ndung = input("Dap an dung: ").split(",")\nk = int(input("k: "))\ndau_k = ket_qua[:k]\nso_trung = 0\nfor m in dau_k:\n    if m in dung:\n        so_trung += 1\np = so_trung / k\nprint(f"So trung trong {k} dau: {so_trung}")\nprint(f"Precision@{k}: {round(p, 4)}")`,
    },
    homework:
      'Mở lại chương trình RAG mini ở bài trước. Tự viết 5 câu hỏi và với mỗi câu ghi ra đoạn (hoặc các đoạn) mà BẠN cho là đáp án đúng — đó là bộ đánh giá đầu tay của bạn. Chạy RAG mini, lấy top-2, rồi tính precision@2 trung bình của 5 câu bằng chương trình vừa viết. Sau đó thử chẻ 10 đoạn thành 20 đoạn nửa câu và đo lại: precision lên hay xuống?',
    srsCards: [
      {
        hoi: 'Precision@k và recall@k khác nhau ở mẫu số nào, và tăng k thì mỗi số đi về đâu?',
        dap: 'precision@k = số kết quả đúng trong k đầu / k. recall@k = số kết quả đúng trong k đầu / TỔNG số đoạn đúng có trong kho. Tăng k thì recall tăng (hoặc giữ nguyên) còn precision dễ tụt vì lẫn thêm rác.',
      },
      {
        hoi: 'Chunk nhỏ và chunk to đánh đổi nhau thế nào, và chồng lấn (overlap) chữa được gì?',
        dap: 'Chunk nhỏ cho điểm cosine sắc nét, precision cao, nhưng dễ đứt ngữ cảnh. Chunk to giữ trọn ngữ cảnh nhưng vector loãng, điểm mờ và tốn token. Chồng lấn 10–20% giữa hai chunk liền nhau giúp câu trả lời vắt ngang ranh giới không bị cắt đôi.',
      },
      {
        hoi: 'Khi RAG trả lời sai, vì sao phải đo bước TÌM trước khi đụng tới mô hình?',
        dap: 'Vì hai chỗ hỏng là độc lập, và nếu bước tìm lôi sai đoạn thì rác vào ắt rác ra — chỉnh mô hình lúc đó vô ích. Đo precision@k trên một bộ 20–50 câu hỏi có đáp án cho biết ngay lỗi nằm ở đâu.',
      },
    ],
  },
  {
    id: 'llmagent-u2-l4',
    unitId: 'llmagent-u2',
    language: 'python',
    title: 'RAG sản xuất — vector DB, hybrid search, rerank',
    hook: 'RAG mini của bạn quét cả 10 đoạn cho mỗi câu hỏi. Với 10 triệu đoạn thì cách đó chết. Và có một loại truy vấn mà cosine luôn thua: hỏi mã đơn hàng "DH-2026-0917" — không embedding nào nhớ nổi một chuỗi ký tự vô nghĩa. Hệ thật giải cả hai bằng một kiến trúc ba tầng.',
    theory:
      'Ba thứ tách một hệ RAG đồ chơi khỏi một hệ chạy thật:\n\n1. VECTOR DATABASE. Quét tuần tự là O(n) — 10 triệu đoạn thì mỗi câu hỏi tốn hàng giây. Vector DB (pgvector, Qdrant, Milvus...) dùng chỉ mục ANN (approximate nearest neighbor, thường là HNSW) để tìm gần đúng trong thời gian gần như hằng số. Chữ "approximate" là đánh đổi CÓ Ý THỨC: đổi vài phần trăm recall lấy tốc độ gấp hàng nghìn lần. Vector DB còn lo hai việc mà bài mini bỏ qua: lọc theo metadata (chỉ tìm trong tài liệu người dùng này được phép xem) và cập nhật/xoá từng đoạn mà không phải nhúng lại cả kho.\n\n2. HYBRID SEARCH. Tìm theo vector (ngữ nghĩa) giỏi khoản đồng nghĩa nhưng dốt khoản chuỗi chính xác: mã sản phẩm, tên riêng, số hiệu, từ khoá hiếm. Tìm theo từ khoá (BM25 — họ hàng nâng cấp của bag-of-words) thì ngược lại. Hybrid = chạy CẢ HAI rồi trộn điểm:\n\ndiem_lai = alpha × diem_vector + (1 − alpha) × diem_tu_khoa\n\nalpha là núm xoay: alpha = 1 thuần ngữ nghĩa, alpha = 0 thuần từ khoá, thực tế hay đặt 0.5–0.7 rồi chỉnh theo bộ đánh giá ở bài 3. (Cách trộn khác, RRF — Reciprocal Rank Fusion — trộn theo THỨ HẠNG thay vì theo điểm, tiện khi hai thang điểm không cùng đơn vị.)\n\n3. RERANK. Hai tầng đầu ưu tiên nhanh nên chấm thô. Tầng ba lấy khoảng 20–50 ứng viên đầu bảng và chấm lại bằng một mô hình CROSS-ENCODER — mô hình này đọc CẶP (câu hỏi, đoạn) cùng lúc nên chính xác hơn hẳn, nhưng đắt gấp nhiều lần nên không thể chạy cho cả kho. Kiến trúc "lọc thô rộng rồi chấm tinh hẹp" này là khuôn mẫu chung của mọi hệ tìm kiếm lớn.\n\nĐỐI CHIẾU CHÍNH APP NÀY: `/api/agent` của DHCB là bước SINH — nhận prompt đã lắp sẵn ngữ cảnh rồi gọi mô hình, có đếm lượt và giới hạn theo gói (Free/Pro). Nó cho thấy một điều thực tế: trong sản xuất, bước tìm và bước sinh là HAI dịch vụ tách rời — tìm ở tầng dữ liệu, sinh ở tầng API có kiểm quyền và đếm chi phí. Tách như vậy thì đổi cách tìm không phải đụng tới đường gọi mô hình, và ngược lại.',
    workedExample: {
      code: `# Hybrid search: tron diem ngu nghia va diem tu khoa bang mot nut xoay alpha
vec = [0.9, 0.2]        # diem cosine tu vector DB
tu_khoa = [0.1, 0.8]    # diem BM25 tu chi muc tu khoa

for alpha in [1.0, 0.5, 0.0]:            # thu ba nac cua nut xoay
    lai = [round(alpha * vec[i] + (1 - alpha) * tu_khoa[i], 4)
           for i in range(len(vec))]
    tot_nhat = 0
    for i in range(len(lai)):
        if lai[i] > lai[tot_nhat]:       # > chu khong >=: hoa thi giu doc dau
            tot_nhat = i
    print(f"alpha={alpha} -> {lai}, tot nhat la doc {tot_nhat + 1}")`,
      stdinLines: [],
    },
    predict: {
      code: `vec = [0.9, 0.2]\ntu_khoa = [0.1, 0.8]\nalpha = 0.5\nprint([round(alpha * vec[i] + (1 - alpha) * tu_khoa[i], 4) for i in range(2)])`,
      question: 'Trộn nửa-nửa hai bảng điểm này cho ra gì?',
      choices: ['[0.5, 0.5]', '[0.9, 0.8]', '[1.0, 1.0]', '[0.45, 0.1]'],
      answerIndex: 0,
      explain:
        'Doc 1: 0.5×0.9 + 0.5×0.1 = 0.45 + 0.05 = 0.5. Doc 2: 0.5×0.2 + 0.5×0.8 = 0.1 + 0.4 = 0.5. Hai đoạn hoà nhau — một đoạn mạnh về ngữ nghĩa, một đoạn mạnh về từ khoá, trộn nửa-nửa thì ngang bằng. Đây đúng là lúc cần tầng RERANK phân xử, vì bản thân điểm trộn không còn phân biệt được nữa.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự trộn điểm hybrid rồi chọn đoạn tốt nhất (hoà thì giữ đoạn đứng trước).',
      lines: [
        'lai = [round(alpha * vec[i] + (1 - alpha) * tu_khoa[i], 4) for i in range(len(vec))]',
        'tot_nhat = 0',
        'for i in range(len(lai)):',
        '    if lai[i] > lai[tot_nhat]:',
        '        tot_nhat = i',
        'print("Diem: " + " ".join(str(d) for d in lai))',
        'print(f"Tot nhat: doc {tot_nhat + 1}")',
      ],
    },
    make: {
      prompt:
        'Cài bộ trộn điểm của hybrid search.\n\nĐọc 3 dòng input():\n- Dòng 1: các điểm tìm-theo-vector, cách nhau bởi dấu phẩy (ví dụ "0.9,0.2").\n- Dòng 2: các điểm tìm-theo-từ-khoá, cùng số lượng (ví dụ "0.1,0.8").\n- Dòng 3: alpha, một số thực trong khoảng 0 tới 1.\n\nTính điểm lai cho từng đoạn: alpha × điểm_vector + (1 − alpha) × điểm_từ_khoá, LÀM TRÒN 4 chữ số. Rồi tìm đoạn có điểm lai cao nhất; nếu hoà thì giữ đoạn đứng TRƯỚC (so bằng dấu > chứ không phải >=).\n\nIn đúng 2 dòng:\nDiem: <các điểm lai cách nhau bởi khoảng trắng>\nTot nhat: doc <số thứ tự đoạn, đếm từ 1>',
      starterCode: `vec = [float(x) for x in input("Diem vector: ").split(",")]\ntu_khoa = [float(x) for x in input("Diem tu khoa: ").split(",")]\nalpha = float(input("Alpha: "))\n# lai[i] = round(alpha * vec[i] + (1 - alpha) * tu_khoa[i], 4)\n# Tim chi so co diem cao nhat (hoa thi giu cai dung truoc), in ra dem tu 1\n`,
      testCases: [
        {
          stdinLines: ['0.9,0.2', '0.1,0.8', '0.5'],
          expected: 'Diem: 0.5 0.5\nTot nhat: doc 1',
          match: 'contains',
          hidden: false,
          label: 'Trộn nửa-nửa → hoà 0.5, luật hoà giữ đoạn 1',
        },
        {
          stdinLines: ['0.9,0.2', '0.1,0.8', '0.8'],
          expected: 'Diem: 0.74 0.32\nTot nhat: doc 1',
          match: 'contains',
          hidden: false,
          label: 'Nghiêng về ngữ nghĩa (alpha 0.8) → đoạn 1 thắng rõ',
        },
        {
          stdinLines: ['0.1,0.9', '0.9,0.1', '0.9'],
          expected: 'Diem: 0.18 0.82\nTot nhat: doc 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: alpha cao làm đoạn mạnh ngữ nghĩa (đoạn 2) lật ngược thế cờ',
        },
      ],
      hints: [
        'Đổi chuỗi sang số thực: [float(x) for x in chuoi.split(",")]. Nhớ round(..., 4) NGAY khi tính điểm lai, nếu không sẽ in ra 0.7400000000000001.',
        'Tìm chỉ số lớn nhất thủ công: đặt tot_nhat = 0 rồi duyệt, chỉ đổi khi lai[i] > lai[tot_nhat]. Dùng > (không phải >=) chính là cách hiện thực luật "hoà thì giữ đoạn trước".',
        'In list số thành chuỗi cách nhau bởi khoảng trắng: " ".join(str(d) for d in lai). Số thứ tự in ra phải đếm từ 1 nên nhớ + 1.',
      ],
      sampleSolution: `vec = [float(x) for x in input("Diem vector: ").split(",")]\ntu_khoa = [float(x) for x in input("Diem tu khoa: ").split(",")]\nalpha = float(input("Alpha: "))\nlai = [round(alpha * vec[i] + (1 - alpha) * tu_khoa[i], 4) for i in range(len(vec))]\ntot_nhat = 0\nfor i in range(len(lai)):\n    if lai[i] > lai[tot_nhat]:\n        tot_nhat = i\nprint("Diem: " + " ".join(str(d) for d in lai))\nprint(f"Tot nhat: doc {tot_nhat + 1}")`,
    },
    homework:
      'Vẽ ra giấy kiến trúc RAG cho một trợ lý tra cứu nội quy trường/công ty của bạn: tài liệu lấy từ đâu, chẻ chunk theo gì, nhúng bằng mô hình nào, lưu ở đâu, có cần hybrid không (có mã số/tên riêng nào cần khớp chính xác không?), có cần rerank không. Với MỖI ô, viết một câu lý do. Sau đó khoanh ô nào bạn sẽ làm ở phiên bản đầu tiên và ô nào để sau — bản đơn giản nhất chạy được luôn thắng bản hoàn hảo chưa xong.',
    srsCards: [
      {
        hoi: 'Vector database làm được gì mà vòng lặp quét tuần tự không làm nổi?',
        dap: 'Nó dùng chỉ mục ANN (thường HNSW) để tìm gần đúng trong thời gian gần như hằng số thay vì O(n) — đổi vài phần trăm recall lấy tốc độ gấp hàng nghìn lần. Nó còn lo lọc theo metadata (quyền xem) và cập nhật/xoá từng đoạn mà không nhúng lại cả kho.',
      },
      {
        hoi: 'Hybrid search trộn cái gì với cái gì, và vì sao cần?',
        dap: 'Trộn điểm tìm-theo-vector (ngữ nghĩa, giỏi đồng nghĩa) với điểm tìm-theo-từ-khoá BM25 (giỏi chuỗi chính xác như mã sản phẩm, tên riêng, từ hiếm) theo công thức alpha × vector + (1 − alpha) × từ khoá. Cần vì hai cách tìm hỏng ở hai chỗ khác nhau.',
      },
      {
        hoi: 'Rerank là gì và vì sao không chạy nó cho cả kho?',
        dap: 'Là tầng ba: lấy 20–50 ứng viên đầu bảng rồi chấm lại bằng cross-encoder — mô hình đọc CẶP (câu hỏi, đoạn) cùng lúc nên chính xác hơn hẳn. Nó đắt gấp nhiều lần nên chỉ chạy trên tập nhỏ đã lọc thô: khuôn mẫu "lọc thô rộng rồi chấm tinh hẹp".',
      },
    ],
  },
]

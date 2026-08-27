// lessons/p6u1.ts — P6-U1: Track AI ứng dụng (làn A, `python`).
//
// Hiến chương P6 §5: phần CHẤM ĐƯỢC là TRUY HỒI (cắt đoạn · cosine · xếp hạng) — nó không cần
// khoá API và cũng chính là phần quyết định chất lượng một hệ RAG. Gọi LLM thật nằm ở bước ⑦
// (làn C), với khoá riêng của học viên; môn KHÔNG proxy khoá bên thứ ba (luật P4 §5).
//
// Chấm điểm cosine tới 3 chữ số thập phân là CÓ CHỦ ĐÍCH: nó buộc tính cosine thật chứ không
// đếm từ trùng cho qua. Phép toán chỉ gồm + * / sqrt trên IEEE754, thứ tự cộng cố định theo
// thứ tự chèn của dict, nên python3 và Pyodide cho cùng con số.
//
// Ba bài, đi đúng thứ tự một hệ RAG được dựng: l1 TRUY HỒI (cosine, xếp hạng) → l2 CẮT
// tài liệu (chunk + chồng lấn) → l3 GỌI API (thử lại có phân loại lỗi, chi phí token).
// l2/l3 chấm bằng con số thuần (số chunk, số lần gọi, số giây chờ) nên không cần khoá API —
// giữ đúng luật P4 §5: môn KHÔNG proxy khoá bên thứ ba, gọi LLM thật nằm ở bước ⑦.
//
// Hai bẫy được cài có chủ đích vì chúng là lỗi thật hay gặp: l2 có ca chồng lấn ≥ số câu
// trong chunk (vòng lặp vô hạn nếu quên max(1, ...)) và ca câu dài hơn giới hạn; l3 có ca
// lỗi 400/401 (thử lại là vô ích) và ca hết trần (không được chờ sau lần thử cuối).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u1-l1',
    unitId: 'p6-u1',
    language: 'python',
    title: 'RAG: dạy máy trả lời bằng TÀI LIỆU CỦA BẠN, không bằng trí nhớ của nó',
    hook: 'Bạn muốn làm trợ lý trả lời khách cho quán. Hỏi thẳng một mô hình ngôn ngữ "quán mở cửa mấy giờ?" thì nó bịa — nó chưa từng thấy quán bạn. Nhồi cả cuốn sổ tay vào câu hỏi thì tốn tiền và có ngày vượt giới hạn. Cách làm thật nằm ở giữa, và phần khó của nó không phải là gọi API.',
    theory:
      'RAG (Retrieval-Augmented Generation — sinh câu trả lời có truy hồi) là khuôn của gần như mọi trợ lý AI dùng dữ liệu riêng. Ba bước:\n\n1. TRUY HỒI: từ câu hỏi, tìm vài ĐOẠN tài liệu liên quan nhất.\n2. GHÉP NGỮ CẢNH: đưa mấy đoạn đó vào câu nhắc gửi cho mô hình.\n3. SINH: mô hình trả lời DỰA TRÊN mấy đoạn đó, và trích dẫn nguồn.\n\nĐiều gần như ai mới học cũng hiểu ngược: **bước khó và quyết định chất lượng là bước 1, không phải bước 3.** Truy hồi sai đoạn thì mô hình dù giỏi tới đâu cũng chỉ trả lời trôi chảy một điều sai — tệ hơn là nói "không biết". Nên bài này luyện đúng bước 1; bước gọi mô hình nằm ở phần về nhà, với khoá riêng của bạn (môn học không gọi hộ, không cầm khoá của ai).\n\nCẮT ĐOẠN (chunking). Không thể so cả tài liệu với câu hỏi — phải cắt nhỏ. Hai cái sai kinh điển:\n- Đoạn QUÁ TO: một đoạn chứa cả giờ mở cửa lẫn bảng giá lẫn wifi thì đoạn nào cũng "hơi liên quan" tới mọi câu hỏi, và xếp hạng mất hết ý nghĩa.\n- Đoạn QUÁ NHỎ: câu trả lời bị cắt làm đôi, truy hồi được nửa đầu mà mất nửa sau.\nCách chữa cho cái sai thứ hai là CHỒNG LẤN: mỗi đoạn lặp lại vài từ cuối của đoạn trước, để câu nằm vắt qua ranh giới vẫn còn nguyên ở một đoạn nào đó.\n\nĐO TƯƠNG ĐỒNG. Đơn giản nhất: biến mỗi đoạn văn thành một VECTOR đếm từ, rồi đo góc giữa hai vector bằng cosine:\n  cosine(a, b) = (tổng a[t] × b[t]) / (độ dài a × độ dài b)\nKết quả từ 0 (không chung từ nào) tới 1 (giống hệt về thành phần từ).\n\nVì sao chia cho độ dài chứ không chỉ đếm từ trùng: nếu chỉ đếm, đoạn nào DÀI cũng thắng, vì dài thì trùng nhiều. Cosine chuẩn hoá độ dài đi, nên nó so TỈ LỆ chứ không so số lượng. Đây là lý do gần như mọi hệ truy hồi dùng cosine.\n\nTrong sản phẩm thật, vector đếm từ được thay bằng vector nhúng (embedding) do một mô hình sinh ra — nó hiểu được "giá bao nhiêu" gần nghĩa với "mất bao nhiêu tiền" dù không chung từ nào. Nhưng CÔNG THỨC xếp hạng thì y hệt cái bạn sắp viết: vẫn là cosine, vẫn là lấy top-k. Học đúng chỗ này rồi thì đổi sang embedding chỉ là thay một hàm.\n\nMột luật nghề, quan trọng ngang phần kỹ thuật: câu trả lời phải KÈM NGUỒN — đoạn nào đã được dùng. Không có nguồn thì người dùng không có cách nào phân biệt câu đúng với câu bịa, và bạn cũng không sửa được khi nó sai.',
    workedExample: {
      code: `import math

TAI_LIEU = ("Quan mo cua tu 7 gio sang den 10 gio toi moi ngay. "
            "Quan nhan dat ban truoc qua so dien thoai. "
            "Tra da gia 5000 dong con nuoc cam gia 15000 dong. "
            "Quan co wifi mien phi va cho ngoi ngoai troi.")


def tach_doan(van_ban, kich_thuoc, chong_lan):
    tu = van_ban.split()
    doan, i = [], 0
    while i < len(tu):
        doan.append(" ".join(tu[i:i + kich_thuoc]))
        if i + kich_thuoc >= len(tu):     # đã chạm cuối -> dừng, tránh lặp vô tận
            break
        i += kich_thuoc - chong_lan       # lùi lại "chong_lan" từ -> phần chồng lấn
    return doan


def vecto(s):
    d = {}
    for t in s.lower().split():
        d[t] = d.get(t, 0) + 1            # vector đếm từ
    return d


def tuong_dong(a, b):
    va, vb = vecto(a), vecto(b)
    tich = sum(va[t] * vb.get(t, 0) for t in va)
    dai_a = math.sqrt(sum(v * v for v in va.values()))
    dai_b = math.sqrt(sum(v * v for v in vb.values()))
    if dai_a == 0 or dai_b == 0:
        return 0.0                        # đoạn rỗng -> không chia cho 0
    return tich / (dai_a * dai_b)         # chuẩn hoá độ dài: đoạn dài không thắng oan


doan = tach_doan(TAI_LIEU, 8, 3)
print("So doan:", len(doan))

cau_hoi = "nuoc cam bao nhieu tien"
# Sắp theo điểm GIẢM DẦN, hoà thì lấy đoạn đứng trước -> kết quả tất định
xep = sorted(((tuong_dong(cau_hoi, d), i) for i, d in enumerate(doan)), key=lambda x: (-x[0], x[1]))
for diem, i in xep[:2]:
    print(f"#{i} diem {diem:.3f}: {doan[i]}")

# Đây mới là chỗ gọi mô hình — và nó chỉ được nhìn thấy mấy đoạn trên:
print("Cau nhac se gui:", f"Dua vao cac doan sau, tra loi: {cau_hoi}")`,
      stdinLines: [],
    },
    predict: {
      code: `def dem_tu_trung(cau_hoi, doan):
    tu = set(cau_hoi.lower().split())
    return sum(1 for t in doan.lower().split() if t in tu)

CAU_HOI = "quan co wifi khong"
NGAN = "Quan co wifi mien phi"
DAI = "Quan mo cua tu 7 gio sang den 10 gio toi moi ngay quan nhan dat ban truoc quan co cho ngoi"

print(dem_tu_trung(CAU_HOI, NGAN), dem_tu_trung(CAU_HOI, DAI))`,
      question: 'Xếp hạng bằng cách ĐẾM TỪ TRÙNG. Đoạn nào được điểm cao hơn?',
      choices: ['3 4', '4 3', '3 3', '4 4'],
      answerIndex: 0,
      explain:
        'Đoạn NGẮN được 3, đoạn DÀI được 4 — tức cách đếm này xếp đoạn dài lên trên, dù đoạn ngắn mới đúng là câu trả lời cho "quán có wifi không". Lý do: đoạn dài chứa chữ "quan" ba lần, và mỗi lần đều được cộng điểm. Đây chính là vì sao truy hồi thật dùng COSINE chứ không đếm: cosine chia cho độ dài vector, nên nó hỏi "TỈ LỆ đoạn này nói về chuyện đó là bao nhiêu" thay vì "đoạn này trùng được mấy từ". Đổi sang cosine thì con số đảo hẳn — đoạn ngắn 0,671 còn đoạn dài chỉ 0,365.',
    },
    parsons: {
      prompt: 'Xếp lại hàm đo tương đồng cosine — nhớ chặn phép chia cho 0.',
      lines: [
        'def tuong_dong(a, b):',
        '    va, vb = vecto(a), vecto(b)',
        '    tich = sum(va[t] * vb.get(t, 0) for t in va)',
        '    dai_a = math.sqrt(sum(v * v for v in va.values()))',
        '    dai_b = math.sqrt(sum(v * v for v in vb.values()))',
        '    if dai_a == 0 or dai_b == 0:',
        '        return 0.0',
        '    return tich / (dai_a * dai_b)',
      ],
    },
    make: {
      prompt:
        'Viết phần TRUY HỒI cho trợ lý của quán. Chép nguyên TAI_LIEU của ví dụ mẫu vào bài làm.\n\nViết ba hàm đúng như ví dụ mẫu:\n1. tach_doan(van_ban, kich_thuoc, chong_lan) — cắt theo TỪ; mỗi đoạn kich_thuoc từ, đoạn sau lùi lại chong_lan từ; chạm cuối thì dừng.\n2. vecto(s) — dict đếm từ, chữ thường.\n3. tuong_dong(a, b) — cosine; vector rỗng thì trả 0.0.\n\nChương trình chính đọc MỘT dòng input() là câu hỏi. Cắt tài liệu với kich_thuoc = 8, chong_lan = 3. Xếp các đoạn theo điểm GIẢM DẦN, hoà thì đoạn có chỉ số nhỏ hơn đứng trước. Rồi in đúng ba dòng:\nSo doan: <so doan cat duoc>\nDoan tot nhat: #<chi so> diem <diem lam tron 3 chu so>\nNoi dung: <noi dung doan do>\n\nĐiểm in bằng f"{diem:.3f}". Ca kiểm so tới 3 chữ số thập phân, nên đếm từ trùng thay cho cosine sẽ ra số khác.',
      starterCode: `import math

TAI_LIEU = ("Quan mo cua tu 7 gio sang den 10 gio toi moi ngay. "
            "Quan nhan dat ban truoc qua so dien thoai. "
            "Tra da gia 5000 dong con nuoc cam gia 15000 dong. "
            "Quan co wifi mien phi va cho ngoi ngoai troi.")


def tach_doan(van_ban, kich_thuoc, chong_lan):
    # Cắt theo TỪ, có chồng lấn; nhớ điều kiện dừng khi chạm cuối
    ...


def vecto(s):
    ...


def tuong_dong(a, b):
    # cosine; vector rỗng -> 0.0
    ...


cau_hoi = input("Cau hoi: ")
doan = tach_doan(TAI_LIEU, 8, 3)
# Xếp hạng rồi in ba dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['nuoc cam bao nhieu tien'],
          expected: 'So doan: 8',
          match: 'contains',
          hidden: false,
          label: 'Cắt 8 từ/đoạn, chồng lấn 3 → 8 đoạn',
        },
        {
          stdinLines: ['nuoc cam bao nhieu tien'],
          expected: 'Doan tot nhat: #5 diem 0.316',
          match: 'contains',
          hidden: false,
          label: 'Hỏi giá → đúng đoạn có bảng giá, điểm cosine 0.316',
        },
        {
          stdinLines: ['nuoc cam bao nhieu tien'],
          expected: 'Noi dung: 5000 dong con nuoc cam gia 15000 dong.',
          match: 'contains',
          hidden: false,
          label: 'Nội dung đoạn truy hồi được — đây là thứ sẽ đưa cho mô hình',
        },
        {
          stdinLines: ['quan mo cua luc may gio'],
          expected: 'Doan tot nhat: #0 diem 0.577',
          match: 'contains',
          hidden: false,
          label: 'Hỏi giờ mở cửa → đoạn đầu tiên',
        },
        {
          stdinLines: ['co wifi khong'],
          expected: 'Doan tot nhat: #6 diem 0.408',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: câu hỏi ngắn — đếm từ trùng sẽ chọn đoạn dài hơn và trượt',
        },
        {
          stdinLines: ['zzz qqq wwww'],
          expected: 'Doan tot nhat: #0 diem 0.000',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: không chung từ nào → điểm 0 và hoà toàn tập, phải lấy đoạn #0 (xếp hạng tất định)',
        },
      ],
      hints: [
        'Vòng lặp cắt đoạn phải có điều kiện dừng: khi i + kich_thuoc >= len(tu) thì thêm đoạn cuối rồi break. Thiếu nó, với chong_lan >= kich_thuoc thì i không tiến và chương trình treo.',
        'Bước nhảy là kich_thuoc - chong_lan (ở đây 8 - 3 = 5), không phải kich_thuoc. Nhảy đủ kich_thuoc là bạn vừa bỏ hết phần chồng lấn.',
        'Cosine chia cho TÍCH hai độ dài: tich / (dai_a * dai_b). Chia cho tổng, hay quên chia hẳn, đều cho ra số khác ở chữ số thập phân thứ ba và ca kiểm sẽ đỏ.',
        'Xếp hạng phải tất định: sorted(..., key=lambda x: (-x[0], x[1])) — điểm giảm dần, hoà thì chỉ số nhỏ trước. Không có vế thứ hai thì hai đoạn cùng điểm có thể đổi chỗ nhau.',
        'Khung tham chiếu cho phần in:\n\nxep = sorted(((tuong_dong(cau_hoi, d), i) for i, d in enumerate(doan)), key=lambda x: (-x[0], x[1]))\ndiem, i = xep[0]\nprint(f"So doan: {len(doan)}")\nprint(f"Doan tot nhat: #{i} diem {diem:.3f}")\nprint(f"Noi dung: {doan[i]}")',
      ],
      sampleSolution: `import math

TAI_LIEU = ("Quan mo cua tu 7 gio sang den 10 gio toi moi ngay. "
            "Quan nhan dat ban truoc qua so dien thoai. "
            "Tra da gia 5000 dong con nuoc cam gia 15000 dong. "
            "Quan co wifi mien phi va cho ngoi ngoai troi.")


def tach_doan(van_ban, kich_thuoc, chong_lan):
    tu = van_ban.split()
    doan, i = [], 0
    while i < len(tu):
        doan.append(" ".join(tu[i:i + kich_thuoc]))
        if i + kich_thuoc >= len(tu):
            break                          # chạm cuối -> dừng, tránh lặp vô tận
        i += kich_thuoc - chong_lan        # bước nhảy nhỏ hơn -> sinh phần chồng lấn
    return doan


def vecto(s):
    d = {}
    for t in s.lower().split():
        d[t] = d.get(t, 0) + 1
    return d


def tuong_dong(a, b):
    va, vb = vecto(a), vecto(b)
    tich = sum(va[t] * vb.get(t, 0) for t in va)
    dai_a = math.sqrt(sum(v * v for v in va.values()))
    dai_b = math.sqrt(sum(v * v for v in vb.values()))
    if dai_a == 0 or dai_b == 0:
        return 0.0
    return tich / (dai_a * dai_b)          # chia cho độ dài -> đoạn dài không thắng oan


cau_hoi = input("Cau hoi: ")
doan = tach_doan(TAI_LIEU, 8, 3)

xep = sorted(
    ((tuong_dong(cau_hoi, d), i) for i, d in enumerate(doan)),
    key=lambda x: (-x[0], x[1]),           # hoà thì đoạn đứng trước thắng -> tất định
)
diem, i = xep[0]

print(f"So doan: {len(doan)}")
print(f"Doan tot nhat: #{i} diem {diem:.3f}")
print(f"Noi dung: {doan[i]}")`,
    },
    homework:
      'Hai việc, việc thứ hai làm TRÊN MÁY THẬT với khoá của riêng bạn — môn học không gọi hộ và không cầm khoá của ai.\n\n1. Đổi kich_thuoc và chong_lan (thử 4/0, 8/3, 30/5) rồi hỏi lại cùng ba câu. Ghi lại: đoạn quá to hỏng thế nào, đoạn quá nhỏ hỏng thế nào? Đây là thứ tinh chỉnh mà mọi hệ RAG thật đều phải làm bằng tay.\n\n2. Đăng ký free tier một nhà cung cấp mô hình, lấy khoá, đặt vào biến môi trường (bài U8 bậc P5 — đừng viết khoá vào code). Rồi ghép: lấy 2 đoạn top, dựng câu nhắc dạng "Chỉ dựa vào các đoạn sau, trả lời câu hỏi. Nếu các đoạn không đủ thông tin, nói không biết." và gọi mô hình. Thử hỏi một câu mà tài liệu KHÔNG có câu trả lời — nó có nói "không biết" không, hay bịa? Đó là phép thử quan trọng nhất của một hệ RAG.',
    srsCards: [
      {
        hoi: 'Trong ba bước của RAG, bước nào quyết định chất lượng nhiều nhất?',
        dap: 'Bước TRUY HỒI (tìm đúng đoạn). Truy hồi sai thì mô hình dù giỏi tới đâu cũng chỉ trả lời trôi chảy một điều sai — tệ hơn cả việc nói "không biết".',
      },
      {
        hoi: 'Vì sao khi cắt đoạn lại cần phần chồng lấn?',
        dap: 'Để câu trả lời nằm vắt qua ranh giới hai đoạn không bị cắt làm đôi. Mỗi đoạn lặp lại vài từ cuối của đoạn trước, nên câu đó còn nguyên vẹn ở ít nhất một đoạn.',
      },
      {
        hoi: 'Vì sao xếp hạng bằng cosine tốt hơn đếm số từ trùng?',
        dap: 'Vì đếm từ trùng thì đoạn càng DÀI càng thắng (dài thì trùng nhiều). Cosine chia cho độ dài vector nên nó so TỈ LỆ đoạn nói về chuyện đó, không so số lượng từ trùng.',
      },
      {
        hoi: 'Câu trả lời của hệ RAG bắt buộc phải kèm gì?',
        dap: 'Kèm NGUỒN — đoạn tài liệu nào đã được dùng. Không có nguồn thì người dùng không phân biệt được câu đúng với câu bịa, và bạn cũng không truy được chỗ sai để sửa.',
      },
    ],
  },
  {
    id: 'p6-u1-l2',
    unitId: 'p6-u1',
    language: 'python',
    title: 'Cắt tài liệu thành đoạn: chỗ RAG hỏng thường nằm ở đây, không nằm ở model',
    hook: 'Bạn nối RAG vào một model rất mạnh, hỏi "phí giao hàng nội thành bao nhiêu?" — nó trả lời sai. Đổi sang model đắt gấp mười lần: vẫn sai. Vấn đề không nằm ở model: câu trả lời đã bị CẮT ĐÔI từ lúc bạn chia tài liệu.',
    theory:
      'Bài trước bạn đã dựng phần truy hồi: có câu hỏi, tìm đoạn tài liệu giống nhất, đưa cho model. Nhưng "đoạn tài liệu" ở đâu ra? Tài liệu thật là file dài hàng chục trang — không ai nhét cả file vào một lần gọi được (vừa vượt giới hạn ngữ cảnh, vừa đắt, vừa làm model lạc). Nên trước khi truy hồi, phải CẮT (chunking).\n\nCắt nghe như việc vặt, nhưng nó quyết định trần chất lượng của cả hệ. Lý do: truy hồi trả về NGUYÊN một đoạn. Nếu thông tin cần thiết bị cắt làm đôi — nửa trên ở đoạn 7, nửa dưới ở đoạn 8 — thì dù xếp hạng có hoàn hảo, model cũng chỉ nhận được nửa sự thật. Và model nhận nửa sự thật thì nó không im lặng, nó bịa nốt nửa còn lại.\n\nBA ĐIỀU CHỈNH, và mỗi cái là một đánh đổi thật:\n\n1. **Cắt theo RANH GIỚI TỰ NHIÊN, đừng cắt theo số ký tự chẵn.** Cắt cứ mỗi 500 ký tự là cách dễ viết nhất và tệ nhất — nó cắt giữa câu, giữa bảng giá, giữa một dòng "Phí nội thành: 25.000đ". Hãy cắt theo câu (hoặc theo đoạn văn, theo đề mục) rồi mới gom câu lại cho vừa giới hạn.\n\n2. **KÍCH THƯỚC đoạn: nhỏ thì chính xác, to thì đủ ngữ cảnh.** Đoạn nhỏ (1–2 câu) cho điểm tương đồng rất sắc — tìm đúng câu chứa con số. Nhưng câu đó có thể là "Mức này áp dụng cho đơn dưới 2kg." — đúng câu, mà thiếu vế "mức này" là mức nào. Đoạn to thì có đủ ngữ cảnh nhưng điểm tương đồng bị loãng: một đoạn 20 câu nói về mười thứ thì chẳng giống hẳn câu hỏi nào. Thực tế phần lớn hệ dùng đoạn cỡ vài trăm ký tự.\n\n3. **CHỒNG LẤN (overlap): cho các đoạn liền kề dùng chung vài câu cuối.** Đây là cách chữa trực tiếp cho bệnh "cắt đôi thông tin": nếu đoạn 8 bắt đầu bằng đúng hai câu cuối của đoạn 7, thì thông tin nằm vắt qua ranh giới vẫn còn nguyên vẹn ở ít nhất một đoạn. Giá phải trả: dữ liệu phình ra, tốn thêm chỗ lưu và thêm tiền embedding — chồng lấn 2 câu trên đoạn 5 câu nghĩa là bạn lưu gần gấp rưỡi.\n\nHAI CÁI BẪY khi tự viết hàm cắt, và cả hai đều là lỗi thật hay gặp:\n\n**Bẫy thứ nhất — vòng lặp vô hạn.** Bạn nhảy tới đoạn kế bằng cách lùi lại chong_lan câu. Nếu chồng lấn lớn hơn hoặc bằng số câu vừa nhét được vào đoạn, bước nhảy thành 0 hoặc âm: chương trình đứng im mãi mãi, hoặc đẻ ra vô số đoạn giống hệt nhau. Chữa: ép bước nhảy tối thiểu là 1 — buoc = max(1, so_cau_trong_doan - chong_lan).\n\n**Bẫy thứ hai — câu dài hơn cả giới hạn.** Một câu duy nhất dài 300 ký tự trong khi giới hạn là 200 thì sao? Nếu bạn viết "chỉ nhét câu vào khi còn chỗ", câu đó không bao giờ được nhét, và vòng lặp lại đứng. Nguyên tắc: mỗi đoạn LUÔN nhận ít nhất một câu, kể cả khi câu đó làm đoạn vượt giới hạn. Thà một đoạn hơi quá cỡ còn hơn mất hẳn nội dung của nó.\n\nCách kiểm tra bộ cắt của bạn có tốt không mà không cần gọi model: lấy mười câu hỏi thật của người dùng, với mỗi câu tự tay chỉ ra đoạn nào ĐÁNG LẼ phải chứa câu trả lời, rồi xem bộ truy hồi có trả đúng đoạn đó trong top-3 không. Chỉ số đó gọi là recall của khâu truy hồi, và nó là trần cứng: truy hồi không lấy được thì model không cứu nổi.',
    workedExample: {
      code: `# Cắt theo CÂU rồi gom lại cho vừa giới hạn — không cắt theo số ký tự chẵn.
def tach_cau(van_ban):
    """Tách thô theo dấu chấm. Tài liệu thật nên dùng thư viện, ở đây đủ để thấy ý."""
    cau = [c.strip() for c in van_ban.split(".")]
    return [c + "." for c in cau if c]


def chia_chunk(cau, max_ky_tu, chong_lan):
    if not cau:
        return []
    chunks = []
    i = 0
    while i < len(cau):
        j = i
        do_dai = 0
        while j < len(cau):
            # Câu thứ hai trở đi tốn thêm 1 ký tự cho dấu cách nối
            them = len(cau[j]) if j == i else len(cau[j]) + 1
            # j > i: đoạn LUÔN nhận ít nhất một câu, kể cả câu dài hơn giới hạn
            if do_dai + them > max_ky_tu and j > i:
                break
            do_dai += them
            j += 1
        chunks.append(" ".join(cau[i:j]))
        if j >= len(cau):
            break
        # max(1, ...) chặn vòng lặp vô hạn khi chong_lan >= số câu vừa nhét
        i += max(1, (j - i) - chong_lan)
    return chunks


tai_lieu = (
    "Phi giao hang noi thanh la 25000 dong. "
    "Muc nay ap dung cho don duoi 2kg. "
    "Don tren 2kg tinh them 5000 dong moi kg. "
    "Mien phi giao cho don tu 500000 dong."
)
cau = tach_cau(tai_lieu)

print("Khong chong lan:")
for c in chia_chunk(cau, 90, 0):
    print("  -", c)

print("Chong lan 1 cau — vet noi khong con cat doi thong tin:")
for c in chia_chunk(cau, 90, 1):
    print("  -", c)`,
      stdinLines: [],
    },
    predict: {
      code: `cau = ["Cau A.", "Cau B.", "Cau C.", "Cau D."]

def chia_SAI(cau, max_ky_tu, chong_lan):
    chunks = []
    i = 0
    while i < len(cau):
        j = i
        do_dai = 0
        while j < len(cau) and do_dai + len(cau[j]) + 1 <= max_ky_tu:
            do_dai += len(cau[j]) + 1
            j += 1
        chunks.append(" ".join(cau[i:j]))
        if len(chunks) > 5:          # chan de bai in ra duoc
            return chunks
        i = i + (j - i) - chong_lan  # KHONG co max(1, ...)
    return chunks

print(len(chia_SAI(cau, 14, 2)))`,
      question: 'Mỗi đoạn nhét được 2 câu, chồng lấn cũng là 2. Chương trình in ra số mấy?',
      choices: ['6', '2', '3', '0'],
      answerIndex: 0,
      explain:
        'In ra 6 — và 6 chỉ vì có dòng chặn "len(chunks) > 5" cứu; không có nó thì chương trình chạy mãi mãi. Lý do: mỗi đoạn nhét được 2 câu, chồng lấn 2 câu, nên bước nhảy là 2 - 2 = 0. Biến i không bao giờ nhích lên, vòng while cứ cắt đi cắt lại đúng một chỗ. Đây là lỗi vòng lặp vô hạn kinh điển của hàm cắt tài liệu, và nó không nổ ra lúc bạn thử với chồng lấn nhỏ — nó chờ tới ngày ai đó chỉnh chồng lấn lên cao. Cách chữa duy nhất đáng tin: ép bước nhảy tối thiểu bằng 1, tức i += max(1, (j - i) - chong_lan).',
    },
    parsons: {
      prompt:
        'Xếp lại vòng lặp cắt tài liệu. Chú ý hai dòng phòng thủ: dòng cho phép đoạn luôn nhận ít nhất một câu, và dòng chặn bước nhảy 0.',
      lines: [
        'i = 0',
        'while i < len(cau):',
        '    j = i',
        '    do_dai = 0',
        '    while j < len(cau):',
        '        them = len(cau[j]) if j == i else len(cau[j]) + 1',
        '        if do_dai + them > max_ky_tu and j > i:',
        '            break',
        '        do_dai += them',
        '        j += 1',
        '    chunks.append(" ".join(cau[i:j]))',
        '    i += max(1, (j - i) - chong_lan)',
      ],
    },
    make: {
      prompt:
        'Viết bộ cắt tài liệu cho hệ RAG của bạn.\n\nHàm chia_chunk(cau, max_ky_tu, chong_lan) nhận danh sách câu, trả về danh sách đoạn (mỗi đoạn là các câu nối bằng MỘT dấu cách):\n- Gom câu vào đoạn tới khi thêm câu nữa sẽ vượt max_ky_tu. Nhớ tính cả dấu cách nối: câu thứ hai trở đi tốn thêm 1 ký tự.\n- Mỗi đoạn LUÔN nhận ít nhất một câu, kể cả khi một mình câu đó đã dài hơn max_ky_tu.\n- Đoạn kế tiếp bắt đầu lùi lại chong_lan câu so với chỗ vừa dừng, NHƯNG bước nhảy không bao giờ được nhỏ hơn 1.\n- Danh sách câu rỗng → trả về danh sách rỗng.\n\nChương trình chính đọc 3 dòng input(): n, max_ky_tu, chong_lan. Dựng câu theo đúng công thức này rồi in đúng hai dòng:\ncau = [f"Cau so {i} noi ve chu de {i % 5}." for i in range(n)]\n\nSo chunk: <số đoạn>\nChunk dai nhat: <độ dài đoạn dài nhất> ky tu\n\n(Không có đoạn nào thì cả hai số đều là 0.)\n\nTrước khi nộp, tự chạy ca chong_lan = 5 và tự hỏi: chương trình có dừng không?',
      starterCode: `def chia_chunk(cau, max_ky_tu, chong_lan):
    if not cau:
        return []
    chunks = []
    i = 0
    while i < len(cau):
        # Gom câu vào đoạn — nhớ: đoạn LUÔN nhận ít nhất một câu
        ...
        # Nhảy tới đoạn kế — nhớ: bước nhảy không được bằng 0
        ...
    return chunks


n = int(input("So cau: "))
max_ky_tu = int(input("Gioi han ky tu: "))
chong_lan = int(input("Chong lan (so cau): "))
cau = [f"Cau so {i} noi ve chu de {i % 5}." for i in range(n)]
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['12', '80', '1'],
          expected: 'So chunk: 6',
          match: 'contains',
          hidden: false,
          label: '12 câu, giới hạn 80, chồng lấn 1 câu → 6 đoạn',
        },
        {
          stdinLines: ['12', '80', '1'],
          expected: 'Chunk dai nhat: 78 ky tu',
          match: 'contains',
          hidden: false,
          label: 'Đoạn dài nhất 78 ký tự — đã tính cả dấu cách nối giữa các câu',
        },
        {
          stdinLines: ['12', '80', '0'],
          expected: 'So chunk: 4',
          match: 'contains',
          hidden: false,
          label: 'Cùng tài liệu, bỏ chồng lấn → chỉ còn 4 đoạn (chồng lấn làm dữ liệu phình ra)',
        },
        {
          stdinLines: ['12', '20', '1'],
          expected: 'So chunk: 12',
          match: 'contains',
          hidden: false,
          label: 'BẪY: mọi câu đều dài hơn giới hạn 20 → mỗi câu một đoạn, không được bỏ câu nào',
        },
        {
          stdinLines: ['12', '80', '5'],
          expected: 'So chunk: 10',
          match: 'contains',
          hidden: false,
          label: 'BẪY: chồng lấn lớn hơn số câu trong đoạn → phải dừng, không lặp vô hạn',
        },
        {
          stdinLines: ['0', '80', '1'],
          expected: 'So chunk: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: không có câu nào → 0 đoạn, không nổ lỗi',
        },
        {
          stdinLines: ['1', '80', '2'],
          expected: 'Chunk dai nhat: 25 ky tu',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng một câu, chồng lấn lớn hơn cả tài liệu',
        },
        {
          stdinLines: ['40', '120', '2'],
          expected: 'So chunk: 19',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: quy mô lớn hơn — không hardcode theo một bộ dữ liệu',
        },
      ],
      hints: [
        'Chia bài thành hai vòng lặp lồng nhau: vòng trong gom câu vào MỘT đoạn, vòng ngoài quyết định đoạn kế bắt đầu ở đâu. Đừng cố làm cả hai việc trong một vòng.',
        'Vòng trong dừng khi thêm câu nữa sẽ vượt giới hạn — nhưng chỉ dừng khi đoạn ĐÃ có ít nhất một câu (điều kiện j > i). Thiếu vế đó, ca giới hạn 20 sẽ đứng máy vì không câu nào nhét vừa.',
        'Nhớ dấu cách nối: nối 2 câu bằng " " thì độ dài là len(a) + 1 + len(b), không phải len(a) + len(b). Câu ĐẦU của đoạn không tốn ký tự nối đó.',
        'Ca chồng lấn 5: bước nhảy tính ra 3 - 5 = -2, tức i lùi lại — chương trình chạy mãi. Viết i += max(1, (j - i) - chong_lan) là hết cả bẫy âm lẫn bẫy bằng 0.',
        'Đoạn dài nhất: max((len(c) for c in chunks), default=0). Tham số default cứu ca danh sách rỗng — không có nó, max() trên dãy rỗng ném ValueError.',
      ],
      sampleSolution: `def chia_chunk(cau, max_ky_tu, chong_lan):
    if not cau:
        return []
    chunks = []
    i = 0
    while i < len(cau):
        j = i
        do_dai = 0
        while j < len(cau):
            # Câu thứ hai trở đi tốn thêm 1 ký tự cho dấu cách nối
            them = len(cau[j]) if j == i else len(cau[j]) + 1
            # j > i: đoạn LUÔN nhận ít nhất một câu, kể cả câu dài hơn giới hạn
            if do_dai + them > max_ky_tu and j > i:
                break
            do_dai += them
            j += 1
        chunks.append(" ".join(cau[i:j]))
        if j >= len(cau):
            break
        # max(1, ...) chặn bước nhảy 0 hoặc âm khi chong_lan quá lớn
        i += max(1, (j - i) - chong_lan)
    return chunks


n = int(input("So cau: "))
max_ky_tu = int(input("Gioi han ky tu: "))
chong_lan = int(input("Chong lan (so cau): "))
cau = [f"Cau so {i} noi ve chu de {i % 5}." for i in range(n)]

chunks = chia_chunk(cau, max_ky_tu, chong_lan)
print(f"So chunk: {len(chunks)}")
print(f"Chunk dai nhat: {max((len(c) for c in chunks), default=0)} ky tu")`,
    },
    homework:
      'Lấy một tài liệu THẬT của bạn — nội quy công ty, hướng dẫn sử dụng một món đồ, hay chính bảng giá dịch vụ bạn đang bán.\n\n1. Chạy bộ cắt của bạn lên nó với ba cấu hình: (200 ký tự, chồng lấn 0), (200, 1), (600, 1). In ra vài đoạn đầu của mỗi cấu hình rồi ĐỌC BẰNG MẮT: cấu hình nào cắt đôi một ý đang dở?\n\n2. Viết ra giấy 10 câu hỏi bạn nghĩ người dùng sẽ hỏi tài liệu đó. Với mỗi câu, tự tay ghi ra đoạn nào đáng lẽ chứa câu trả lời. Rồi nối bộ truy hồi của bài trước vào và đếm: bao nhiêu câu có đoạn đúng nằm trong top-3? Con số đó chính là trần chất lượng của cả hệ RAG — model có giỏi tới đâu cũng không vượt qua nó.\n\n3. Câu hỏi để tự trả lời: tài liệu của bạn có bảng biểu hoặc danh sách gạch đầu dòng không? Nếu có, cắt theo dấu chấm sẽ phá nát chúng. Bạn sẽ cắt theo ranh giới nào thay thế?',
    srsCards: [
      {
        hoi: 'Vì sao khâu cắt tài liệu quyết định trần chất lượng của hệ RAG?',
        dap: 'Vì truy hồi trả về nguyên một đoạn: thông tin bị cắt làm đôi giữa hai đoạn thì model chỉ nhận được nửa sự thật, và nó thường bịa nốt nửa còn lại. Xếp hạng hoàn hảo cũng không cứu được đoạn đã cắt hỏng.',
      },
      {
        hoi: 'Chồng lấn (overlap) giữa các đoạn dùng để làm gì, và giá phải trả là gì?',
        dap: 'Cho đoạn sau bắt đầu bằng vài câu cuối của đoạn trước, để thông tin nằm vắt qua ranh giới vẫn còn nguyên ở ít nhất một đoạn. Giá phải trả: dữ liệu phình ra, tốn thêm chỗ lưu và thêm tiền embedding.',
      },
      {
        hoi: 'Đoạn nhỏ và đoạn to, mỗi bên hỏng theo kiểu nào?',
        dap: 'Đoạn nhỏ cho điểm tương đồng rất sắc nhưng dễ thiếu ngữ cảnh (tìm đúng câu chứa số mà không biết số đó áp dụng cho ai). Đoạn to đủ ngữ cảnh nhưng điểm tương đồng bị loãng vì nó nói về quá nhiều thứ cùng lúc.',
      },
      {
        hoi: 'Hai điều kiện nào phải có trong vòng lặp cắt để nó không bao giờ chạy mãi?',
        dap: 'Một: mỗi đoạn luôn nhận ít nhất một câu, kể cả câu dài hơn giới hạn (điều kiện j > i). Hai: bước nhảy tối thiểu bằng 1, tức i += max(1, so_cau_trong_doan - chong_lan), chặn ca chồng lấn lớn hơn đoạn.',
      },
    ],
  },
  {
    id: 'p6-u1-l3',
    unitId: 'p6-u1',
    language: 'python',
    title: 'Gọi API thật: thử lại cho đúng lỗi, và biết chắc mình chỉ mất bao nhiêu tiền',
    hook: 'Code chạy ngon cả tuần trên máy bạn. Đưa lên chạy thật, tối thứ Bảy nhà cung cấp quá tải, API trả 429 — và chương trình của bạn thử lại 3.000 lần trong hai phút, vừa bị khoá khoá API vừa nhận hoá đơn ngoài dự tính.',
    theory:
      'Khác biệt lớn nhất giữa code học và code chạy thật không phải là thuật toán — mà là code chạy thật phải sống chung với một bên thứ ba KHÔNG đáng tin: mạng rớt, nhà cung cấp quá tải, phản hồi chậm bất thường. Gọi LLM API là ví dụ đậm nhất, vì nó vừa chậm (tính bằng giây) vừa tính tiền theo lượng dùng.\n\n**PHÂN LOẠI LỖI TRƯỚC KHI NGHĨ TỚI THỬ LẠI.** Đây là điều quan trọng nhất của bài, và cũng là chỗ nhiều người làm sai nhất: họ bọc mọi thứ trong một khối try rồi thử lại tất. Lỗi chia làm hai loại khác hẳn nhau:\n\n- **Lỗi TẠM THỜI (thử lại có ích):** 429 quá nhiều yêu cầu · 500, 503 phía nhà cung cấp trục trặc · timeout · mạng đứt. Nguyên nhân nằm ngoài bạn và có thể tự hết sau vài giây.\n- **Lỗi CỦA BẠN (thử lại vô ích, và có hại):** 400 dữ liệu gửi lên sai khuôn · 401 khoá API sai hoặc hết hạn · 404 gọi nhầm đường dẫn · 413 gửi quá dài. Gửi lại đúng cái đó thì đúng cái lỗi đó quay về. Thử lại chỉ làm bạn chậm hơn, tốn hơn, và che mất lỗi thật khỏi log.\n\nQuy tắc: **thử lại lỗi tạm thời, dừng ngay ở lỗi của mình.**\n\n**CHỜ TĂNG DẦN (exponential backoff).** Thử lại ngay lập tức là đổ thêm dầu vào lửa: nhà cung cấp đang quá tải, mà bạn dồn thêm yêu cầu vào. Cách chuẩn của ngành là chờ gấp đôi mỗi lần: 1 giây, rồi 2, rồi 4, rồi 8. Vì sao gấp đôi chứ không phải cộng thêm 1: nếu sự cố kéo dài, số lần gọi vô ích tăng theo log chứ không theo tuyến tính — bạn giảm áp lực cho nhà cung cấp đúng lúc họ cần nhất.\n\nMột chi tiết dân chuyên nghiệp luôn thêm mà sách nhập môn hay bỏ: **nhiễu ngẫu nhiên (jitter)** — cộng thêm một khoảng chờ ngẫu nhiên nhỏ. Không có nó, một nghìn máy chủ cùng gặp sự cố sẽ cùng thử lại đúng giây thứ 1, thứ 2, thứ 4 — thành từng đợt sóng đập vào nhà cung cấp. Bài hôm nay bỏ jitter để kết quả chấm được, nhưng code thật thì phải có.\n\n**TRẦN LẦN THỬ, không thử mãi.** Luôn có số lần tối đa (thường 3–5). Hết trần thì báo lỗi lên trên và ghi log — thất bại rõ ràng tốt hơn treo vô hạn. Và đừng chờ sau lần thử CUỐI: chờ xong rồi bỏ cuộc là phí thời gian của người dùng, một lỗi nhỏ nhưng rất hay gặp.\n\n**TIỀN: đếm trước khi gửi, đừng đợi hoá đơn.** LLM tính tiền theo token — mảnh chữ nhỏ hơn từ. Chi phí một lần gọi ≈ (token vào × giá vào) + (token ra × giá ra), và giá ra thường đắt hơn giá vào vài lần. Ba thói quen giữ hoá đơn khỏi bất ngờ: (1) đặt trần token ra cho mỗi lần gọi; (2) cắt bớt ngữ cảnh nhồi vào — đây chính là lý do bài trước phải cắt tài liệu cho gọn; (3) đếm và ghi log số token của từng lần gọi, để khi hoá đơn tăng bạn biết chỗ nào tăng. Nhớ thêm: mỗi lần THỬ LẠI là một lần tính tiền nữa — thử lại bừa bãi là một khoản chi thật, không phải chuyện lý thuyết.',
    workedExample: {
      code: `# Thử lại có chờ tăng dần — nhưng CHỈ với lỗi tạm thời.
LOI_TAM_THOI = {429, 500, 503}   # 429 quá tải, 5xx phía nhà cung cấp


def goi_co_thu_lai(api, so_lan_toi_da=4):
    """Trả về (ket_qua, so_lan_goi, tong_thoi_gian_cho)."""
    cho = 0
    for lan in range(1, so_lan_toi_da + 1):
        ma = api()
        if ma == 200:
            return "ok", lan, cho
        if ma not in LOI_TAM_THOI:
            # Lỗi CỦA MÌNH: gửi lại y hệt thì lỗi y hệt quay về -> dừng ngay
            return "that bai", lan, cho
        if lan < so_lan_toi_da:
            cho += 2 ** (lan - 1)   # 1, 2, 4 giây — KHÔNG chờ sau lần cuối
    return "that bai", so_lan_toi_da, cho


def lam_api(ma_loi, so_lan_hong):
    """API giả lập: hỏng so_lan_hong lần đầu rồi mới thành công."""
    dem = {"n": 0}

    def api():
        dem["n"] += 1
        return ma_loi if dem["n"] <= so_lan_hong else 200

    return api


print("429 hong 2 lan :", goi_co_thu_lai(lam_api(429, 2)))   # qua o lan 3
print("429 hong mai   :", goi_co_thu_lai(lam_api(429, 99)))  # het tran, cho 1+2+4
print("400 sai du lieu:", goi_co_thu_lai(lam_api(400, 99)))  # dung NGAY, khong cho giay nao

# Ước tính tiền trước khi bấm nút chạy hàng loạt
gia_vao, gia_ra = 0.15, 0.60      # đô la cho mỗi triệu token
token_vao, token_ra, so_cau_hoi = 1200, 300, 10000
tien = (token_vao * gia_vao + token_ra * gia_ra) / 1_000_000 * so_cau_hoi
print(f"Uoc tinh {so_cau_hoi} cau hoi: {tien:.2f} do la")`,
      stdinLines: [],
    },
    predict: {
      code: `LOI_TAM_THOI = {429, 500, 503}

def goi_SAI(api, so_lan_toi_da=4):
    cho = 0
    for lan in range(1, so_lan_toi_da + 1):
        ma = api()
        if ma == 200:
            return "ok", lan, cho
        cho += 2 ** (lan - 1)      # thu lai MOI loi, khong phan loai
    return "that bai", so_lan_toi_da, cho

def lam_api(ma_loi):
    def api():
        return ma_loi
    return api

print(goi_SAI(lam_api(401)))`,
      question: 'Khoá API sai (401 — sai từ phía mình). Hàm thử lại này in ra gì?',
      choices: ["('that bai', 4, 15)", "('that bai', 1, 0)", "('that bai', 4, 7)", "('ok', 1, 0)"],
      answerIndex: 0,
      explain:
        "In ra ('that bai', 4, 15): gọi đủ 4 lần và chờ 1 + 2 + 4 + 8 = 15 giây, rồi vẫn thất bại. Hai cái sai chồng lên nhau. Thứ nhất: 401 là lỗi CỦA MÌNH — khoá API sai thì gửi lại y hệt vẫn sai, ba lần gọi sau là hoàn toàn vô ích, chỉ tốn tiền và che mất lỗi thật khỏi log. Thứ hai: nó chờ cả sau lần thử CUỐI CÙNG (8 giây) rồi mới bỏ cuộc — 8 giây đó không dùng để làm gì cả, chỉ là người dùng ngồi đợi thêm. Bản đúng dừng ngay ở lần 1 với 0 giây chờ.",
    },
    parsons: {
      prompt:
        'Xếp lại vòng thử lại. Chú ý thứ tự ba câu hỏi: thành công chưa → có phải lỗi của mình không → còn lần thử nào nữa không.',
      lines: [
        'cho = 0',
        'for lan in range(1, so_lan_toi_da + 1):',
        '    ma = api()',
        '    if ma == 200:',
        '        return "ok", lan, cho',
        '    if ma not in LOI_TAM_THOI:',
        '        return "that bai", lan, cho',
        '    if lan < so_lan_toi_da:',
        '        cho += 2 ** (lan - 1)',
        'return "that bai", so_lan_toi_da, cho',
      ],
    },
    make: {
      prompt:
        'Viết lớp vỏ gọi API cho hệ RAG của bạn — phần quyết định chương trình sống sót hay tự bắn vào chân khi nhà cung cấp trục trặc.\n\nHàm goi_co_thu_lai(api, so_lan_toi_da=4) gọi hàm api() (trả về mã HTTP) và trả về bộ ba (ket_qua, so_lan_goi, tong_cho):\n- Mã 200 → trả về ("ok", số lần đã gọi, tổng chờ).\n- Mã 429, 500, 503 là lỗi TẠM THỜI → chờ rồi thử lại. Chờ tăng gấp đôi: trước lần thử thứ 2 chờ 1 giây, trước lần 3 chờ 2 giây, trước lần 4 chờ 4 giây. KHÔNG chờ sau lần thử cuối cùng.\n- Mọi mã khác là lỗi CỦA MÌNH → dừng ngay, trả về ("that bai", số lần đã gọi, tổng chờ) — không thử lại lần nào.\n- Hết trần mà vẫn lỗi tạm thời → ("that bai", so_lan_toi_da, tổng chờ).\n\nĐừng dùng time.sleep — chỉ CỘNG DỒN số giây vào một biến (bài chấm tự động, không ai ngồi đợi thật).\n\nChương trình chính đọc 2 dòng input(): ma_loi (mã lỗi API sẽ trả về) và so_lan_hong (số lần đầu API hỏng, sau đó trả 200). Dựng API giả lập rồi in đúng ba dòng:\nKet qua: <ok hoặc that bai>\nSo lan goi: <số>\nTong cho: <số> giay',
      starterCode: `LOI_TAM_THOI = {429, 500, 503}


def goi_co_thu_lai(api, so_lan_toi_da=4):
    cho = 0
    for lan in range(1, so_lan_toi_da + 1):
        ma = api()
        # 1. Thành công? 2. Lỗi của mình? 3. Còn lần thử nào nữa không?
        ...
    return "that bai", so_lan_toi_da, cho


def lam_api(ma_loi, so_lan_hong):
    dem = {"n": 0}

    def api():
        dem["n"] += 1
        return ma_loi if dem["n"] <= so_lan_hong else 200

    return api


ma_loi = int(input("Ma loi: "))
so_lan_hong = int(input("So lan hong: "))
# Gọi goi_co_thu_lai(lam_api(ma_loi, so_lan_hong)) rồi in ba dòng theo khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['429', '2'],
          expected: 'So lan goi: 3',
          match: 'contains',
          hidden: false,
          label: 'Quá tải 2 lần rồi qua → gọi 3 lần',
        },
        {
          stdinLines: ['429', '2'],
          expected: 'Tong cho: 3 giay',
          match: 'contains',
          hidden: false,
          label: 'Chờ 1 + 2 = 3 giây (tăng gấp đôi, không phải cộng thêm 1)',
        },
        {
          stdinLines: ['429', '5'],
          expected: 'Tong cho: 7 giay',
          match: 'contains',
          hidden: false,
          label: 'Hết trần: chờ 1 + 2 + 4 = 7 — KHÔNG chờ thêm 8 giây sau lần thử cuối',
        },
        {
          stdinLines: ['400', '5'],
          expected: 'So lan goi: 1',
          match: 'contains',
          hidden: false,
          label: 'BẪY: 400 là lỗi của mình → dừng ngay, không thử lại lần nào',
        },
        {
          stdinLines: ['400', '5'],
          expected: 'Tong cho: 0 giay',
          match: 'contains',
          hidden: false,
          label: 'Lỗi của mình thì không chờ giây nào — chờ cũng chẳng đổi được gì',
        },
        {
          stdinLines: ['429', '0'],
          expected: 'Ket qua: ok',
          match: 'contains',
          hidden: false,
          label: 'Ca thường: qua ngay lần đầu, không chờ',
        },
        {
          stdinLines: ['500', '1'],
          expected: 'Tong cho: 1 giay',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 500 cũng là lỗi tạm thời, không chỉ mình 429',
        },
        {
          stdinLines: ['401', '1'],
          expected: 'So lan goi: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: khoá API sai — thử lại vô ích, phải dừng ngay',
        },
        {
          stdinLines: ['429', '3'],
          expected: 'Ket qua: ok',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hỏng đúng 3 lần → lần thử thứ 4 (lần cuối) vẫn kịp cứu',
        },
      ],
      hints: [
        'Trong vòng lặp, hỏi ba câu THEO ĐÚNG THỨ TỰ: thành công chưa (200)? có phải lỗi của mình không (không nằm trong LOI_TAM_THOI)? còn lần thử nào nữa không (lan < so_lan_toi_da)?',
        'Ca 400: nếu bạn thấy "So lan goi: 4" nghĩa là code đang thử lại cả lỗi của mình. Vế "if ma not in LOI_TAM_THOI: return" phải nằm TRƯỚC chỗ cộng thời gian chờ.',
        'Chờ tăng gấp đôi viết gọn bằng luỹ thừa: 2 ** (lan - 1) cho ra 1, 2, 4, 8 ứng với lan = 1, 2, 3, 4.',
        'Ca "Tong cho: 7" chứ không phải 15: chỉ cộng chờ khi CÒN lần thử nữa (lan < so_lan_toi_da). Chờ 8 giây rồi bỏ cuộc là bắt người dùng đợi không vì cái gì.',
        'Đếm số lần gọi: chính là biến lan tại lúc bạn return, vì mỗi vòng lặp gọi api() đúng một lần. Không cần biến đếm riêng.',
      ],
      sampleSolution: `LOI_TAM_THOI = {429, 500, 503}


def goi_co_thu_lai(api, so_lan_toi_da=4):
    cho = 0
    for lan in range(1, so_lan_toi_da + 1):
        ma = api()
        if ma == 200:
            return "ok", lan, cho
        if ma not in LOI_TAM_THOI:
            # Lỗi CỦA MÌNH (400, 401, 404...): gửi lại y hệt thì lỗi y hệt quay về
            return "that bai", lan, cho
        if lan < so_lan_toi_da:
            # Chờ gấp đôi mỗi lần: 1, 2, 4 — và KHÔNG chờ sau lần thử cuối
            cho += 2 ** (lan - 1)
    return "that bai", so_lan_toi_da, cho


def lam_api(ma_loi, so_lan_hong):
    dem = {"n": 0}

    def api():
        dem["n"] += 1
        return ma_loi if dem["n"] <= so_lan_hong else 200

    return api


ma_loi = int(input("Ma loi: "))
so_lan_hong = int(input("So lan hong: "))

ket_qua, so_lan, tong_cho = goi_co_thu_lai(lam_api(ma_loi, so_lan_hong))
print(f"Ket qua: {ket_qua}")
print(f"So lan goi: {so_lan}")
print(f"Tong cho: {tong_cho} giay")`,
    },
    homework:
      'Ba việc, làm được cái nào hay cái đó — cả ba dùng lại được cho mọi API sau này.\n\n1. **Thêm jitter.** Cộng vào mỗi lần chờ một khoảng ngẫu nhiên nhỏ, ví dụ random.uniform(0, 0.5). Rồi tự trả lời: nếu 1.000 máy chủ cùng gặp 429 một lúc, có jitter khác không jitter ở chỗ nào?\n\n2. **Ước tính tiền TRƯỚC khi chạy.** Lấy bảng giá thật của nhà cung cấp, viết hàm nhận (số câu hỏi, token vào, token ra) và in tiền dự tính. Chạy thử với 100, 10.000, 1.000.000 câu hỏi — con số cuối thường là lúc người ta nhận ra phải cắt ngữ cảnh cho gọn.\n\n3. **Nối vào bài trước.** Bọc goi_co_thu_lai quanh một lần gọi LLM thật bằng khoá riêng của bạn, kèm đoạn tài liệu mà bộ truy hồi trả về. Ghi log mỗi lần: token vào, token ra, số lần thử. Một tuần sau nhìn log, bạn biết tiền đi đâu — điều hoá đơn tổng không cho biết.',
    srsCards: [
      {
        hoi: 'Lỗi API nào nên thử lại, lỗi nào không?',
        dap: 'Thử lại lỗi TẠM THỜI (429 quá tải, 500/503 phía nhà cung cấp, timeout, mạng đứt) vì nguyên nhân nằm ngoài mình và có thể tự hết. Dừng ngay ở lỗi CỦA MÌNH (400, 401, 404, 413) vì gửi lại y hệt thì lỗi y hệt quay về.',
      },
      {
        hoi: 'Vì sao chờ tăng GẤP ĐÔI chứ không cộng thêm một khoảng cố định?',
        dap: 'Vì khi sự cố kéo dài, số lần gọi vô ích tăng theo log thay vì theo tuyến tính — bạn giảm áp lực cho nhà cung cấp đúng lúc họ đang quá tải, thay vì đổ thêm yêu cầu vào chỗ đang cháy.',
      },
      {
        hoi: 'Jitter trong cơ chế thử lại là gì và tại sao cần?',
        dap: 'Là khoảng chờ ngẫu nhiên nhỏ cộng thêm vào mỗi lần chờ. Không có nó, hàng nghìn máy cùng gặp sự cố sẽ cùng thử lại đúng giây thứ 1, 2, 4 — thành từng đợt sóng đồng loạt đập vào nhà cung cấp.',
      },
      {
        hoi: 'Vì sao không nên chờ sau lần thử CUỐI CÙNG?',
        dap: 'Vì chờ xong rồi bỏ cuộc thì khoảng chờ đó không dùng để làm gì cả — chỉ bắt người dùng đợi thêm vô ích. Chỉ cộng thời gian chờ khi còn một lần thử nữa thật sự sắp diễn ra.',
      },
    ],
  },
]

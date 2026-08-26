// lessons/p6u1.ts — P6-U1: Track AI ứng dụng (làn A, `python`).
//
// Hiến chương P6 §5: phần CHẤM ĐƯỢC là TRUY HỒI (cắt đoạn · cosine · xếp hạng) — nó không cần
// khoá API và cũng chính là phần quyết định chất lượng một hệ RAG. Gọi LLM thật nằm ở bước ⑦
// (làn C), với khoá riêng của học viên; môn KHÔNG proxy khoá bên thứ ba (luật P4 §5).
//
// Chấm điểm cosine tới 3 chữ số thập phân là CÓ CHỦ ĐÍCH: nó buộc tính cosine thật chứ không
// đếm từ trùng cho qua. Phép toán chỉ gồm + * / sqrt trên IEEE754, thứ tự cộng cố định theo
// thứ tự chèn của dict, nên python3 và Pyodide cho cùng con số.
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
]

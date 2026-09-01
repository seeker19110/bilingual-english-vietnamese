// lessons/mathaiu2.ts — Chương C2 "Đại số tuyến tính" của khoá "Toán Thiết Yếu cho AI"
// (mathai) (docs/specs/2026-09-01-mathai-bai-hoc-chi-tiet.md).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const MATHAI_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'mathai-u2-l1',
    unitId: 'mathai-u2',
    language: 'python',
    title: 'Vector — cộng, nhân vô hướng, tích vô hướng và ý nghĩa hình học',
    hook: 'Một bộ phim trong hệ gợi ý của Netflix không phải cái tên — nó là một dãy số: [hài 0.9, kinh dị 0.1, dài 120]. Một khách hàng cũng là một dãy số. Toàn bộ AI hiện đại nói chuyện bằng thứ ngôn ngữ đó, và đơn vị nhỏ nhất của nó gọi là VECTOR.',
    theory:
      'VECTOR là một danh sách số có thứ tự: [3, 4] hay [0.9, 0.1, 120]. Trong Python thuần ta biểu diễn nó bằng list. Hai cách nhìn, cùng một thứ:\n- Cách ĐẠI SỐ: một bộ n con số (n gọi là số chiều).\n- Cách HÌNH HỌC: một mũi tên từ gốc toạ độ tới điểm (3, 4) — có HƯỚNG và có ĐỘ DÀI.\n\nBa phép toán phải thuộc lòng:\n1. CỘNG hai vector — cộng từng vị trí tương ứng: [1,2] + [3,4] = [4,6]. Hình học: nối đuôi hai mũi tên. Bắt buộc cùng số chiều.\n2. NHÂN VÔ HƯỚNG (scalar) — nhân mọi thành phần với một số: 2 * [1,2] = [2,4]. Hình học: kéo dài/thu ngắn mũi tên, số âm thì lật ngược hướng.\n3. TÍCH VÔ HƯỚNG (dot product) — nhân từng cặp rồi CỘNG LẠI, cho ra MỘT SỐ (không phải vector): [1,2,3]·[4,5,6] = 1·4 + 2·5 + 3·6 = 32.\n\nTích vô hướng là phép toán quan trọng nhất của cả ngành AI. Ý nghĩa: nó đo mức CÙNG HƯỚNG của hai vector — dương là cùng hướng, 0 là vuông góc (chẳng liên quan gì nhau), âm là ngược hướng. Mọi nơ-ron trong mạng nơ-ron chỉ làm đúng một việc: lấy tích vô hướng của vector đầu vào với vector trọng số, cộng bias, rồi cho qua hàm kích hoạt.\n\nĐỘ DÀI (chuẩn Euclid) của vector = căn bậc hai của tích vô hướng với chính nó: |v| = (v[0]² + v[1]² + ...) ** 0.5. Vector [3,4] có độ dài 5.\n\nKHÔNG dùng numpy trong khoá này: mọi phép trên viết bằng list comprehension và vòng lặp, để bạn thấy rõ từng phép cộng, phép nhân mà thư viện giấu đi.',
    workedExample: {
      code: `a = [1, 2, 3]
b = [4, 5, 6]

tong = [a[i] + b[i] for i in range(len(a))]   # cong tung vi tri
print(f"a + b = {tong}")

gap_doi = [2 * v for v in a]                  # nhan vo huong
print(f"2 * a = {gap_doi}")

dot = 0
for i in range(len(a)):                       # tich vo huong: nhan roi cong don
    dot += a[i] * b[i]
print(f"a . b = {dot}")

do_dai = sum(v * v for v in a) ** 0.5          # do dai Euclid
print(f"|a| = {round(do_dai, 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `a = [1, 2, 3]\nb = [4, 5, 6]\nprint(sum(a[i] * b[i] for i in range(3)))`,
      question: 'Tích vô hướng của [1,2,3] và [4,5,6] in ra là bao nhiêu?',
      choices: ['32', '[4, 10, 18]', '21', '6'],
      answerIndex: 0,
      explain:
        '1·4 + 2·5 + 3·6 = 4 + 10 + 18 = 32. Chú ý kết quả là MỘT SỐ chứ không phải vector — tích vô hướng "nén" hai vector thành một con số đo mức cùng hướng. Đáp án [4, 10, 18] là phép nhân từng-vị-trí (elementwise), một phép khác hẳn.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc hai vector → cộng từng vị trí → cộng dồn tích vô hướng → in.',
      lines: [
        'a = [float(v) for v in input("Vector a: ").split(",")]',
        'b = [float(v) for v in input("Vector b: ").split(",")]',
        'tong = [a[i] + b[i] for i in range(len(a))]',
        'dot = sum(a[i] * b[i] for i in range(len(a)))',
        'print("Tong: " + ",".join(str(v) for v in tong))',
        'print(f"Tich vo huong: {dot}")',
      ],
    },
    make: {
      prompt:
        'Tự cài hai phép vector nền tảng.\n\nChương trình đọc 2 dòng input(): vector a và vector b, mỗi vector là các số cách nhau dấu phẩy và HAI VECTOR LUÔN CÙNG SỐ CHIỀU. Ví dụ "1,2,3" và "4,5,6".\n\nIn đúng 2 dòng:\nTong: <các thành phần của a + b, cách nhau dấu phẩy, KHÔNG có dấu cách>\nTich vo huong: <tích vô hướng của a và b>\n\nĐọc số bằng float() nên "1,2,3" + "4,5,6" phải in "Tong: 5.0,7.0,9.0" và "Tich vo huong: 32.0".',
      starterCode: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\n# tong = [a[i] + b[i] for i in range(len(a))]\n# Ghep chuoi bang ",".join(str(v) for v in tong)\n# dot = sum(a[i] * b[i] for i in range(len(a)))\n`,
      testCases: [
        {
          stdinLines: ['1,2,3', '4,5,6'],
          expected: 'Tong: 5.0,7.0,9.0\nTich vo huong: 32.0',
          match: 'contains',
          hidden: false,
          label: 'Vector 3 chiều kinh điển → dot 32.0',
        },
        {
          stdinLines: ['1,0', '0,1'],
          expected: 'Tong: 1.0,1.0\nTich vo huong: 0.0',
          match: 'contains',
          hidden: false,
          label: 'Hai vector VUÔNG GÓC → tích vô hướng 0.0',
        },
        {
          stdinLines: ['-1,2', '3,4'],
          expected: 'Tong: 2.0,6.0\nTich vo huong: 5.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: có thành phần ÂM → -3 + 8 = 5.0',
        },
      ],
      hints: [
        'Cộng vector là cộng theo TỪNG VỊ TRÍ: dùng range(len(a)) để đi qua các chỉ số chung của cả hai list.',
        'Ghép list số thành chuỗi: ",".join(str(v) for v in tong) — join chỉ nhận chuỗi nên phải str() từng phần tử.',
        'Tích vô hướng cộng dồn: dot = sum(a[i] * b[i] for i in range(len(a))), rồi print(f"Tich vo huong: {dot}").',
      ],
      sampleSolution: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\ntong = [a[i] + b[i] for i in range(len(a))]\ndot = sum(a[i] * b[i] for i in range(len(a)))\nprint("Tong: " + ",".join(str(v) for v in tong))\nprint(f"Tich vo huong: {dot}")`,
    },
    homework:
      'Mô tả CHÍNH BẠN bằng một vector 4 chiều: [số giờ học/ngày, số giờ ngủ, số buổi tập thể thao/tuần, số giờ dùng mạng xã hội]. Nhờ 2 người bạn làm tương tự. Tính tích vô hướng giữa vector của bạn với từng người, và độ dài của mỗi vector. Rồi trả lời: tích vô hướng lớn có chắc nghĩa là "giống nhau" không, hay chỉ vì ai đó có mọi con số đều to? (Bài sau sẽ chữa đúng vấn đề này.)',
    srsCards: [
      {
        hoi: 'Tích vô hướng (dot product) của hai vector tính thế nào, kết quả là gì?',
        dap: 'Nhân từng cặp thành phần tương ứng rồi cộng tất cả lại: [1,2,3]·[4,5,6] = 4+10+18 = 32. Kết quả là MỘT SỐ (không phải vector), đo mức hai vector cùng hướng: dương = cùng hướng, 0 = vuông góc, âm = ngược hướng.',
      },
      {
        hoi: 'Vì sao tích vô hướng là phép toán trung tâm của mạng nơ-ron?',
        dap: 'Vì mỗi nơ-ron chỉ làm đúng một việc: lấy tích vô hướng giữa vector đầu vào và vector trọng số, cộng bias rồi cho qua hàm kích hoạt. Một lớp mạng = nhiều tích vô hướng song song, tức là một phép nhân ma trận.',
      },
      {
        hoi: 'Độ dài (chuẩn Euclid) của vector tính thế nào?',
        dap: '|v| = căn bậc hai của tổng bình phương các thành phần — trong Python: sum(x*x for x in v) ** 0.5. Đó cũng chính là căn của tích vô hướng của vector với chính nó. Vector [3,4] có độ dài 5.',
      },
    ],
  },
  {
    id: 'mathai-u2-l2',
    unitId: 'mathai-u2',
    language: 'python',
    title: 'Ma trận & nhân ma trận tự cài — vì sao mạng nơ-ron toàn phép nhân này',
    hook: 'Card đồ hoạ giá nghìn đô trong máy chủ AI về cơ bản là một cỗ máy làm đúng MỘT việc thật nhanh: nhân ma trận. Hôm nay bạn tự cài phép đó bằng ba vòng lặp Python — hiểu xong ba vòng lặp này là hiểu thứ mà toàn bộ ngành đang đốt điện để chạy.',
    theory:
      'MA TRẬN là bảng số hai chiều — trong Python thuần: LIST CỦA CÁC LIST, mỗi list con là một hàng. [[1,2],[3,4]] là ma trận 2 hàng 2 cột (2×2).\n\nNHÂN MA TRẬN C = A × B: phần tử C[i][j] là TÍCH VÔ HƯỚNG của hàng i trong A với cột j trong B.\n\nQuy tắc kích thước bất di bất dịch: A cỡ (n × m) nhân được với B cỡ (m × p) — số CỘT của A phải bằng số HÀNG của B — và kết quả cỡ (n × p). Lệch là không nhân được; lỗi "shape mismatch" là lỗi phổ biến nhất đời một kỹ sư ML.\n\nBa vòng lặp lồng nhau, thuộc lòng cấu trúc này:\n- vòng i chạy qua các HÀNG của A (và của kết quả),\n- vòng j chạy qua các CỘT của B (và của kết quả),\n- vòng k cộng dồn A[i][k] * B[k][j] — đây chính là tích vô hướng của bài trước.\n\nHai điều phải nhớ: (1) nhân ma trận KHÔNG giao hoán — A×B khác B×A, thậm chí một chiều nhân được còn chiều kia thì không; (2) ma trận ĐƠN VỊ (đường chéo toàn 1, còn lại 0) đóng vai số 1: nhân với nó thì không đổi gì.\n\nVÌ SAO AI CẦN: một lớp mạng nơ-ron dày đặc chính là phép nhân ma trận đầu-vào × trọng-số. Xử lý 64 mẫu cùng lúc (batch) = xếp 64 vector thành ma trận rồi nhân MỘT lần thay vì 64 lần — đó là lý do GPU (làm hàng nghìn phép nhân song song) chiếm ngôi trong AI. Bạn sẽ dùng lại đúng hàm này ở khoá cv1 khi cài forward pass của MLP.',
    workedExample: {
      code: `A = [[1, 2],
     [3, 4]]        # 2 hang, 2 cot
B = [[5, 6],
     [7, 8]]

n = len(A)          # so hang cua A
m = len(B)          # so hang cua B = so cot cua A
p = len(B[0])       # so cot cua B

for i in range(n):              # vong 1: tung hang cua A
    hang_kq = []
    for j in range(p):          # vong 2: tung cot cua B
        tong = 0
        for k in range(m):      # vong 3: tich vo huong hang i x cot j
            tong += A[i][k] * B[k][j]
        hang_kq.append(tong)
    print(hang_kq)              # in tung hang ket qua`,
      stdinLines: [],
    },
    predict: {
      code: `A = [[1, 2], [3, 4]]\nB = [[1, 0], [0, 1]]\nprint(A[0][0] * B[0][0] + A[0][1] * B[1][0])`,
      question: 'Phần tử C[0][0] của tích A × B với B là ma trận đơn vị bằng bao nhiêu?',
      choices: ['1', '2', '3', '0'],
      answerIndex: 0,
      explain:
        '1·1 + 2·0 = 1 — đúng bằng A[0][0] ban đầu. Ma trận đơn vị (đường chéo toàn 1) đóng vai trò "số 1" của phép nhân ma trận: nhân với nó thì ma trận không đổi. Đây là mẹo kiểm tra nhanh code nhân ma trận của bạn có đúng không.',
    },
    parsons: {
      prompt: 'Xếp đúng ba vòng lặp nhân ma trận: hàng A → cột B → cộng dồn tích vô hướng.',
      lines: [
        'for i in range(len(A)):',
        '    hang = []',
        '    for j in range(len(B[0])):',
        '        tong = 0.0',
        '        for k in range(len(B)):',
        '            tong += A[i][k] * B[k][j]',
        '        hang.append(tong)',
        '    print(",".join(str(v) for v in hang))',
      ],
    },
    make: {
      prompt:
        'Tự cài phép nhân ma trận bằng ba vòng lặp Python thuần (KHÔNG numpy).\n\nĐỊNH DẠNG input(): mỗi ma trận nằm trên MỘT dòng; các HÀNG cách nhau bởi dấu chấm phẩy ";", các phần tử trong một hàng cách nhau bởi dấu phẩy ",". Ví dụ "1,2;3,4" là ma trận [[1,2],[3,4]].\n\nChương trình đọc 2 dòng input(): ma trận A rồi ma trận B (đề luôn cho kích thước nhân được).\n\nIn kết quả A × B: MỖI HÀNG một dòng, các phần tử cách nhau dấu phẩy, KHÔNG có dấu cách. Đọc số bằng float().\n\nVí dụ A = "1,2;3,4", B = "5,6;7,8" → in 2 dòng:\n19.0,22.0\n43.0,50.0',
      starterCode: `def doc(s):\n    return [[float(x) for x in hang.split(",")] for hang in s.split(";")]\n\nA = doc(input("Ma tran A: "))\nB = doc(input("Ma tran B: "))\n# n = len(A) hang cua A, m = len(B) hang cua B, p = len(B[0]) cot cua B\n# Ba vong lap i, j, k roi in tung hang bang ",".join(str(v) for v in hang)\n`,
      testCases: [
        {
          stdinLines: ['1,2;3,4', '5,6;7,8'],
          expected: '19.0,22.0\n43.0,50.0',
          match: 'contains',
          hidden: false,
          label: 'Hai ma trận 2×2 kinh điển',
        },
        {
          stdinLines: ['1,0;0,1', '2,3;4,5'],
          expected: '2.0,3.0\n4.0,5.0',
          match: 'contains',
          hidden: false,
          label: 'Nhân với ma trận đơn vị → giữ nguyên B',
        },
        {
          stdinLines: ['1,2,3', '1;1;1'],
          expected: '6.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: (1×3) nhân (3×1) → kết quả 1×1 là 6.0',
        },
      ],
      hints: [
        'Đọc ma trận: tách hàng bằng s.split(";") trước, rồi tách phần tử mỗi hàng bằng .split(",").',
        'Kích thước: số hàng kết quả = len(A), số cột kết quả = len(B[0]), vòng trong chạy len(B) lần (số hàng của B = số cột của A).',
        'ĐỪNG cứng hoá số 2: dùng đúng len(A), len(B), len(B[0]) thì ca ẩn ma trận không vuông mới chạy được.',
      ],
      sampleSolution: `def doc(s):\n    return [[float(x) for x in hang.split(",")] for hang in s.split(";")]\n\nA = doc(input("Ma tran A: "))\nB = doc(input("Ma tran B: "))\nn = len(A)\nm = len(B)\np = len(B[0])\nfor i in range(n):\n    hang = []\n    for j in range(p):\n        tong = 0.0\n        for k in range(m):\n            tong += A[i][k] * B[k][j]\n        hang.append(tong)\n    print(",".join(str(v) for v in hang))`,
    },
    homework:
      'Dùng code của bạn kiểm hai điều bằng thực nghiệm: (1) nhân ma trận KHÔNG giao hoán — chạy "1,2;3,4" × "5,6;7,8" rồi đổi thứ tự hai ma trận, kết quả có giống nhau không? (2) Thử nhân một ma trận 2×3 với một ma trận 2×3 xem chương trình gãy ở đâu, rồi giải thích bằng lời quy tắc "số cột của A phải bằng số hàng của B". Cuối cùng đếm xem nhân hai ma trận 1000×1000 cần bao nhiêu phép nhân (đáp: 10⁹ — nay bạn hiểu vì sao AI cần GPU).',
    srsCards: [
      {
        hoi: 'Phần tử C[i][j] của tích hai ma trận được tính thế nào?',
        dap: 'Bằng tích vô hướng của HÀNG i trong A với CỘT j trong B: tổng của A[i][k]·B[k][j] khi k chạy hết chiều chung. Cài bằng ba vòng lặp lồng nhau i (hàng A), j (cột B), k (cộng dồn).',
      },
      {
        hoi: 'Quy tắc kích thước khi nhân ma trận?',
        dap: 'A cỡ (n×m) nhân được với B cỡ (m×p) — số CỘT của A phải bằng số HÀNG của B — và kết quả có cỡ (n×p). Lệch kích thước là lỗi "shape mismatch", lỗi phổ biến nhất khi làm mạng nơ-ron.',
      },
      {
        hoi: 'Vì sao AI chạy trên GPU lại nhanh hơn hẳn CPU?',
        dap: 'Vì lõi tính toán của mạng nơ-ron là nhân ma trận (mỗi lớp = đầu vào × trọng số), gồm hàng tỷ phép nhân-cộng ĐỘC LẬP nhau; GPU có hàng nghìn nhân song song nên làm chúng cùng lúc, còn CPU làm gần như tuần tự.',
      },
    ],
  },
  {
    id: 'mathai-u2-l3',
    unitId: 'mathai-u2',
    language: 'python',
    title: 'Cosine similarity — đo độ giống nhau, nền của embedding và RAG',
    hook: 'Bạn hỏi chatbot công ty "chính sách nghỉ phép thế nào?", nó lục đúng đoạn tài liệu cần trong 500 trang. Nó không dò từ khoá — nó biến câu hỏi và từng đoạn văn thành vector rồi đo GÓC giữa chúng. Phép đo đó tên là cosine similarity, và hôm nay bạn tự cài nó.',
    theory:
      'Tích vô hướng có một tật: vector nào cũng DÀI thì tích vô hướng cũng to, dù hai vector chẳng cùng hướng lắm. Muốn đo riêng phần "cùng hướng", ta chia cho độ dài của cả hai:\n\ncosine(a, b) = (a · b) / (|a| × |b|)\n\nĐây đúng là cos của GÓC giữa hai vector, nên nó luôn nằm trong đoạn từ -1 đến 1:\n- 1 = cùng hướng hoàn toàn (rất giống nhau),\n- 0 = vuông góc (không liên quan),\n- -1 = ngược hướng hoàn toàn.\n\nĐiểm mấu chốt: cosine BỎ QUA ĐỘ DÀI, chỉ giữ HƯỚNG. Hai vector [1,2,3] và [2,4,6] có cosine = 1 vì cùng hướng, dù cái sau dài gấp đôi. Trong xử lý văn bản, điều đó nghĩa là: một bài dài 2.000 từ và một bài 200 từ nói cùng chủ đề vẫn được coi là giống nhau — thứ mà tích vô hướng trần trụi không làm nổi.\n\nEMBEDDING là cách AI biến một từ / câu / bức ảnh thành vector vài trăm tới vài nghìn chiều, sao cho những thứ có nghĩa gần nhau thì vector nằm gần nhau về hướng. Ghép hai thứ lại thành công thức làm nên nửa số sản phẩm AI hiện nay:\n- TÌM KIẾM NGỮ NGHĨA / RAG: nhúng câu hỏi thành vector, tính cosine với mọi đoạn tài liệu, lấy vài đoạn cao điểm nhất đưa cho LLM đọc.\n- HỆ GỢI Ý: hai người xem phim giống nhau thì vector sở thích có cosine cao.\n- CHỐNG ĐẠO VĂN, gom cụm tin tức, khử trùng lặp dữ liệu.\n\nKhoá llmagent (khoá 06 của cụm) cài RAG mini bằng đúng hàm bạn viết hôm nay.',
    workedExample: {
      code: `def cosine(a, b):
    dot = sum(a[i] * b[i] for i in range(len(a)))   # tich vo huong
    do_dai_a = sum(v * v for v in a) ** 0.5          # do dai a
    do_dai_b = sum(v * v for v in b) ** 0.5          # do dai b
    return dot / (do_dai_a * do_dai_b)               # chia de bo do dai

bai_ngan = [1, 2, 3]      # dem tu khoa trong bai ngan
bai_dai = [2, 4, 6]       # cung chu de, bai dai gap doi
bai_khac = [3, 0, 0]      # chu de khac han

print(f"Ngan vs dai: {round(cosine(bai_ngan, bai_dai), 4)}")
print(f"Ngan vs khac: {round(cosine(bai_ngan, bai_khac), 4)}")
print(f"Tich vo huong ngan-dai: {sum(bai_ngan[i] * bai_dai[i] for i in range(3))}")`,
      stdinLines: [],
    },
    predict: {
      code: `a = [3, 0]\nb = [6, 0]\ndot = a[0] * b[0] + a[1] * b[1]\ndo_a = (a[0] ** 2 + a[1] ** 2) ** 0.5\ndo_b = (b[0] ** 2 + b[1] ** 2) ** 0.5\nprint(round(dot / (do_a * do_b), 2))`,
      question: 'Cosine giữa [3,0] và [6,0] in ra là bao nhiêu?',
      choices: ['1.0', '18.0', '0.5', '2.0'],
      answerIndex: 0,
      explain:
        'dot = 18, |a| = 3, |b| = 6 → 18 / 18 = 1.0. Hai vector CÙNG HƯỚNG dù cái sau dài gấp đôi, nên cosine đạt tối đa 1.0. Đó chính là điều cosine làm mà tích vô hướng trần (18) không làm được: bỏ ảnh hưởng của độ dài.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự tính cosine: tích vô hướng → độ dài a → độ dài b → chia → in.',
      lines: [
        'dot = sum(a[i] * b[i] for i in range(len(a)))',
        'do_dai_a = sum(v * v for v in a) ** 0.5',
        'do_dai_b = sum(v * v for v in b) ** 0.5',
        'cos = dot / (do_dai_a * do_dai_b)',
        'print(f"Cosine: {round(cos, 4)}")',
      ],
    },
    make: {
      prompt:
        'Tự cài cosine similarity — hàm bạn sẽ dùng lại ở RAG và hệ gợi ý.\n\nChương trình đọc 2 dòng input(): vector a và vector b, các số cách nhau dấu phẩy, cùng số chiều, và KHÔNG vector nào là vector 0.\n\nIn đúng 1 dòng:\nCosine: <giá trị cosine, làm tròn 4 chữ số bằng round()>\n\nVí dụ "1,0" và "1,0" → "Cosine: 1.0"; "1,1" và "1,0" → "Cosine: 0.7071".',
      starterCode: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\n# dot = sum(a[i] * b[i] for i in range(len(a)))\n# do_dai = sum(v * v for v in ...) ** 0.5 cho tung vector\n# In: Cosine: <round(dot / (do_dai_a * do_dai_b), 4)>\n`,
      testCases: [
        {
          stdinLines: ['1,0', '1,0'],
          expected: 'Cosine: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Hai vector y hệt nhau → 1.0',
        },
        {
          stdinLines: ['1,1', '1,0'],
          expected: 'Cosine: 0.7071',
          match: 'contains',
          hidden: false,
          label: 'Góc 45 độ → 0.7071',
        },
        {
          stdinLines: ['1,2,3', '2,4,6'],
          expected: 'Cosine: 1.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dài gấp đôi nhưng CÙNG HƯỚNG → vẫn 1.0',
        },
      ],
      hints: [
        'Ba đại lượng cần tính riêng: tích vô hướng, độ dài a, độ dài b. Viết từng dòng, đừng nhồi vào một biểu thức.',
        'Độ dài = sum(v * v for v in a) ** 0.5 — chính là căn của tích vô hướng vector với chính nó.',
        'Cuối cùng chia rồi làm tròn: print(f"Cosine: {round(dot / (do_dai_a * do_dai_b), 4)}").',
      ],
      sampleSolution: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\ndot = sum(a[i] * b[i] for i in range(len(a)))\ndo_dai_a = sum(v * v for v in a) ** 0.5\ndo_dai_b = sum(v * v for v in b) ** 0.5\nprint(f"Cosine: {round(dot / (do_dai_a * do_dai_b), 4)}")`,
    },
    homework:
      'Làm một cỗ máy tìm kiếm ngữ nghĩa tí hon bằng tay: chọn 3 từ khoá (vd "hoc", "code", "an"), rồi mô tả 4 câu tiếng Việt không dấu bằng vector đếm số lần xuất hiện của 3 từ đó. Lấy một câu làm "câu hỏi", tính cosine với 3 câu còn lại, xếp hạng. Kết quả có hợp trực giác không? Rồi trả lời: nếu hai câu dùng từ KHÁC nhau nhưng nghĩa giống nhau ("hoc bai" vs "on tap"), cách đếm từ khoá này hỏng ở đâu — và vì sao embedding thật giải được?',
    srsCards: [
      {
        hoi: 'Công thức cosine similarity và khoảng giá trị của nó?',
        dap: 'cosine(a,b) = (a·b) / (|a|·|b|) — tích vô hướng chia cho tích hai độ dài. Giá trị luôn nằm trong [-1, 1]: 1 là cùng hướng (rất giống), 0 là vuông góc (không liên quan), -1 là ngược hướng.',
      },
      {
        hoi: 'Cosine hơn tích vô hướng trần ở điểm nào?',
        dap: 'Cosine chuẩn hoá theo độ dài nên chỉ đo HƯỚNG: một văn bản 2.000 từ và một văn bản 200 từ cùng chủ đề vẫn được coi là giống nhau. Tích vô hướng trần thiên vị vector có giá trị lớn, dễ nhầm "to" thành "giống".',
      },
      {
        hoi: 'Embedding + cosine tạo ra những sản phẩm AI nào?',
        dap: 'Tìm kiếm ngữ nghĩa và RAG (nhúng câu hỏi, lấy đoạn tài liệu có cosine cao nhất cho LLM đọc), hệ gợi ý (sở thích giống nhau về hướng), chống đạo văn, gom cụm tin tức, khử trùng lặp dữ liệu huấn luyện.',
      },
    ],
  },
  {
    id: 'mathai-u2-l4',
    unitId: 'mathai-u2',
    language: 'python',
    title: 'Trực giác trị riêng & PCA — trục nào giữ được nhiều thông tin nhất',
    hook: 'Chụp cái ghế từ chính diện thì thấy một hình chữ nhật, chụp chéo 45 độ thì nhận ra ngay đó là ghế. Cùng vật thể, cùng số chiều bị mất, mà một góc nhìn giữ được thông tin còn góc kia phá hỏng. PCA là thuật toán đi tìm góc nhìn tốt nhất đó — bằng cách hỏi: trục nào giữ được nhiều PHƯƠNG SAI nhất?',
    theory:
      'Dữ liệu thật thường có rất nhiều chiều (ảnh 28×28 = 784 chiều; embedding = 1.536 chiều). GIẢM CHIỀU là ép nó xuống 2–3 chiều để vẽ được, hoặc xuống vài chục chiều để chạy nhanh hơn — mà mất mát ít nhất.\n\nÝ tưởng cốt lõi của PCA (Principal Component Analysis): THÔNG TIN NẰM Ở CHỖ DỮ LIỆU BIẾN THIÊN. Một cột mà mọi người đều có giá trị y hệt nhau (phương sai 0) chẳng nói lên điều gì — bỏ đi không mất gì. Cột nào dàn trải mạnh mới phân biệt được các mẫu. Vậy nên PCA đi tìm những TRỤC giữ được PHƯƠNG SAI lớn nhất, gọi là các thành phần chính, rồi chiếu dữ liệu lên vài trục đầu.\n\nTRỊ RIÊNG & VECTOR RIÊNG (eigenvalue, eigenvector) là ngôn ngữ toán của việc đó. Với ma trận hiệp phương sai của dữ liệu: mỗi VECTOR RIÊNG là một hướng trục đặc biệt (nhân ma trận vào chỉ co/giãn nó chứ không đổi hướng), và TRỊ RIÊNG đi kèm cho biết trục đó giữ bao nhiêu phương sai. Sắp trị riêng từ lớn xuống nhỏ, lấy vài vector riêng đầu — đó chính là PCA. (Tính trị riêng cho ma trận lớn cần thuật toán số học ngoài phạm vi khoá; ở đây ta nắm TRỰC GIÁC và tự đo phương sai theo trục.)\n\nBài Make hôm nay làm phiên bản tối giản, đúng linh hồn PCA: cho các điểm 2 chiều, đo phương sai theo trục X và theo trục Y, rồi chọn trục giữ nhiều thông tin hơn — tức là nếu buộc phải vứt một chiều, ta biết vứt chiều nào.\n\nLƯU Ý bắt buộc: PCA rất nhạy với THANG ĐO, nên phải chuẩn hoá dữ liệu (z-score, bài mathai-u1-l5) TRƯỚC khi chạy, nếu không cột có đơn vị lớn sẽ tự động chiếm hết phương sai. Nối tiếp: bài ml-u2-l3 của khoá Học máy dùng PCA để nén dữ liệu trước khi gom cụm.',
    workedExample: {
      code: `# 4 diem trai rong theo truc X, hep theo truc Y
diem = [[0, 0], [4, 0], [0, 1], [4, 1]]

xs = [p[0] for p in diem]      # tach rieng toa do x
ys = [p[1] for p in diem]      # tach rieng toa do y

def phuong_sai(ds):
    tb = sum(ds) / len(ds)
    return sum((v - tb) ** 2 for v in ds) / len(ds)

vx = phuong_sai(xs)
vy = phuong_sai(ys)
print(f"Phuong sai theo X: {vx}")
print(f"Phuong sai theo Y: {vy}")
# Neu buoc phai bo mot chieu, bo chieu giu it phuong sai hon
print("Giu lai truc: X" if vx >= vy else "Giu lai truc: Y")`,
      stdinLines: [],
    },
    predict: {
      code: `ds = [0, 4, 0, 4]\ntb = sum(ds) / len(ds)\nprint(sum((v - tb) ** 2 for v in ds) / len(ds))`,
      question: 'Phương sai của dãy toạ độ [0, 4, 0, 4] in ra là bao nhiêu?',
      choices: ['4.0', '2.0', '8.0', '16.0'],
      answerIndex: 0,
      explain:
        'Trung bình = 2.0; mỗi giá trị lệch 2 nên bình phương lệch = 4, có 4 phần tử → 16/4 = 4.0. Trục này dàn trải mạnh nên giữ nhiều thông tin — đó đúng là tiêu chí PCA dùng để chọn giữ trục nào.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự đo trục nào giữ nhiều thông tin: tách toạ độ → tính phương sai → so sánh.',
      lines: [
        'xs = [p[0] for p in diem]',
        'ys = [p[1] for p in diem]',
        'vx = phuong_sai(xs)',
        'vy = phuong_sai(ys)',
        'print(f"Phuong sai truc X: {round(vx, 4)}")',
        'print(f"Phuong sai truc Y: {round(vy, 4)}")',
        'print("Truc giu nhieu thong tin hon: " + ("X" if vx >= vy else "Y"))',
      ],
    },
    make: {
      prompt:
        'Cài phiên bản tối giản của PCA: đo phương sai theo từng trục rồi chọn trục giữ nhiều thông tin hơn.\n\nChương trình đọc 1 dòng input(): các điểm 2 chiều, mỗi điểm là "x,y", các ĐIỂM cách nhau bởi dấu chấm phẩy ";". Ví dụ "0,0;4,0;0,1;4,1".\n\nIn đúng 3 dòng:\nPhuong sai truc X: <phương sai của các hoành độ, round 4 chữ số>\nPhuong sai truc Y: <phương sai của các tung độ, round 4 chữ số>\nTruc giu nhieu thong tin hon: X hoặc Y\n\nLUẬT CHỌN: in "X" nếu phương sai trục X LỚN HƠN HOẶC BẰNG trục Y, ngược lại in "Y" (bằng nhau thì chọn X).\n\nDùng phương sai chia cho n như bài mathai-u1-l3.',
      starterCode: `diem = [[float(v) for v in p.split(",")] for p in input("Cac diem: ").split(";")]\nxs = [p[0] for p in diem]\nys = [p[1] for p in diem]\n# Viet ham phuong_sai(ds) roi tinh vx, vy\n# In 3 dong theo dung dinh dang de bai\n`,
      testCases: [
        {
          stdinLines: ['0,0;4,0;0,1;4,1'],
          expected:
            'Phuong sai truc X: 4.0\nPhuong sai truc Y: 0.25\nTruc giu nhieu thong tin hon: X',
          match: 'contains',
          hidden: false,
          label: 'Trải rộng theo X → giữ trục X',
        },
        {
          stdinLines: ['0,0;0,4;1,0;1,4'],
          expected:
            'Phuong sai truc X: 0.25\nPhuong sai truc Y: 4.0\nTruc giu nhieu thong tin hon: Y',
          match: 'contains',
          hidden: false,
          label: 'Trải rộng theo Y → giữ trục Y',
        },
        {
          stdinLines: ['1,1;2,2;3,3'],
          expected: 'Truc giu nhieu thong tin hon: X',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hai trục phương sai BẰNG NHAU → luật chọn X',
        },
      ],
      hints: [
        'Tách chuỗi hai tầng: trước hết split(";") lấy từng điểm, sau đó split(",") lấy x và y của điểm đó.',
        'Viết hàm phuong_sai(ds) dùng lại từ bài mathai-u1-l3: tính trung bình, rồi sum((v - tb) ** 2) / len(ds).',
        'So sánh phải là vx >= vy (lớn hơn HOẶC BẰNG) thì ca hai trục bằng nhau mới cho ra "X" như đề yêu cầu.',
      ],
      sampleSolution: `diem = [[float(v) for v in p.split(",")] for p in input("Cac diem: ").split(";")]\nxs = [p[0] for p in diem]\nys = [p[1] for p in diem]\n\ndef phuong_sai(ds):\n    tb = sum(ds) / len(ds)\n    return sum((v - tb) ** 2 for v in ds) / len(ds)\n\nvx = phuong_sai(xs)\nvy = phuong_sai(ys)\nprint(f"Phuong sai truc X: {round(vx, 4)}")\nprint(f"Phuong sai truc Y: {round(vy, 4)}")\nprint("Truc giu nhieu thong tin hon: " + ("X" if vx >= vy else "Y"))`,
    },
    homework:
      'Vẽ ra giấy tập điểm "1,1;2,2;3,3" — chúng nằm trên một đường chéo. Chương trình nói hai trục X và Y giữ phương sai BẰNG NHAU, nhưng rõ ràng có một trục tốt hơn hẳn cả hai: chính đường chéo đó (chiếu lên nó thì không mất gì, vì các điểm thẳng hàng). Viết 4–5 câu giải thích: vì sao PCA thật KHÔNG chỉ so trục X với trục Y mà đi tìm hướng bất kỳ, và trị riêng đóng vai trò gì trong việc đó?',
    srsCards: [
      {
        hoi: 'PCA chọn giữ lại trục nào và theo tiêu chí gì?',
        dap: 'Giữ những trục (thành phần chính) có PHƯƠNG SAI lớn nhất, vì thông tin nằm ở chỗ dữ liệu biến thiên — chiều mà mọi mẫu gần như giống nhau thì bỏ đi gần như không mất gì.',
      },
      {
        hoi: 'Vector riêng và trị riêng đóng vai trò gì trong PCA?',
        dap: 'Với ma trận hiệp phương sai của dữ liệu, mỗi VECTOR RIÊNG là một hướng trục đặc biệt (phép nhân chỉ co/giãn chứ không xoay nó), còn TRỊ RIÊNG đi kèm cho biết trục đó giữ bao nhiêu phương sai. Sắp trị riêng giảm dần rồi lấy vài vector riêng đầu chính là PCA.',
      },
      {
        hoi: 'Vì sao phải chuẩn hoá dữ liệu trước khi chạy PCA?',
        dap: 'Vì PCA đi theo phương sai, mà phương sai phụ thuộc đơn vị đo: cột tính bằng đồng (hàng triệu) sẽ tự động nuốt hết phương sai so với cột tính bằng năm. Chuẩn hoá z-score đưa mọi cột về cùng thang trước khi so.',
      },
    ],
  },
]

// lessons/cv1u1.ts — Giai đoạn 1 "Nơ-ron & mạng MLP" của khoá ngắn "Deep Learning for
// Computer Vision cơ bản" (docs/specs/2026-09-01-cv1-bai-hoc-chi-tiet.md §2).
//
// unitId 'cv1-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi bài đều language 'python' và code được chấm là Python THUẦN
// (không numpy/torch) để Pyodide trình duyệt và python3 CI chấm y hệt nhau; ảnh luôn là ma
// trận ≤ 8×8 nhúng sẵn hoặc đọc qua input() dạng chuỗi phẳng.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const CV1_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'cv1-u1-l1',
    unitId: 'cv1-u1',
    language: 'python',
    title: 'Ảnh là ma trận số — máy "nhìn" thấy gì',
    hook: 'Bạn nhìn ảnh chụp con mèo và thấy... con mèo. Máy tính mở đúng file đó ra chỉ thấy một bảng số: mỗi ô là độ sáng của một điểm ảnh, 0 là đen thui, 255 là trắng tinh. Mọi phép màu của thị giác máy tính đều bắt đầu từ chỗ tầm thường này: ảnh chỉ là ma trận số.',
    theory:
      'ẢNH GRAYSCALE (ảnh xám) = một ma trận 2 chiều các con số. Ô (hàng i, cột j) là ĐỘ SÁNG của điểm ảnh đó. Thang phổ biến là 0–255 (8 bit); trong khoá này ta dùng thang rút gọn 0–9 cho dễ đọc bằng mắt.\n\nẢNH MÀU thì là BA ma trận chồng lên nhau (đỏ, lục, lam) — gọi là 3 KÊNH (channels). Ảnh 8x8 màu là khối số 8x8x3. Mọi thứ sau này (convolution, pooling, mạng nơ-ron) đều làm việc trên khối số đó, không hề "nhìn" gì cả.\n\nMột ảnh trong bộ nhớ thường được lưu PHẲNG — một dãy số dài — kèm theo kích thước. Muốn dùng, ta RESHAPE: cắt dãy phẳng thành từng hàng. Với ảnh rộng W, phần tử thứ k của dãy phẳng nằm ở hàng k // W, cột k % W. Đây là phép tính bạn sẽ gõ đi gõ lại suốt khoá.\n\nĐỂ NHÌN được ma trận bằng mắt thường, ta RENDER ASCII: đổi mỗi con số thành một ký tự theo độ sáng, ví dụ 0–3 thành ".", 4–6 thành "+", 7–9 thành "#". In ra là hiện hình. Đây chính là "mô phỏng máy nhìn thấy gì" — bạn đọc được cùng thứ mà mạng nơ-ron đọc.\n\nMột lưu ý về THANG ĐO sẽ gặp lại ở mọi bài sau: mạng nơ-ron thích số nhỏ quanh 0, nên ảnh thật hay được chuẩn hoá bằng cách chia 255 (về 0–1) rồi trừ trung bình. Nội dung ảnh không đổi, chỉ đổi đơn vị.',
    workedExample: {
      code: `# Anh xam 4x4 luu PHANG (16 so) — do sang 0..9
phang = [0, 0, 9, 9,
         0, 0, 9, 9,
         0, 0, 9, 9,
         0, 0, 9, 9]
W = 4                              # chieu rong anh

# RESHAPE: cat day phang thanh tung hang
anh = []
for i in range(4):
    anh.append(phang[i * W:(i + 1) * W])   # lat cat hang i
print("Ma tran:", anh)

# RENDER ASCII: doi so thanh ky tu theo do sang
for hang in anh:
    dong = ""
    for v in hang:
        if v <= 3:
            dong += "."            # toi
        elif v <= 6:
            dong += "+"            # trung binh
        else:
            dong += "#"            # sang
    print(dong)`,
      stdinLines: [],
    },
    predict: {
      code: `phang = [1, 2, 3, 4, 5, 6]\nW = 3\nprint(phang[1 * W:(1 + 1) * W])`,
      question: 'Reshape dãy phẳng 6 số thành ảnh rộng 3 — hàng thứ 1 (đếm từ 0) in ra gì?',
      choices: ['[4, 5, 6]', '[1, 2, 3]', '[2, 3, 4]', '[3, 4]'],
      answerIndex: 0,
      explain:
        'Lát cắt phang[3:6] lấy 3 phần tử từ chỉ số 3 → [4, 5, 6]. Công thức chung: hàng i là phang[i*W:(i+1)*W]. Nhớ nó là bạn reshape được mọi ảnh phẳng mà không cần numpy.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: cắt dãy phẳng thành hàng → duyệt từng hàng → đổi số thành ký tự → in dòng.',
      lines: [
        'anh = [phang[i * W:(i + 1) * W] for i in range(W)]',
        'for hang in anh:',
        '    dong = ""',
        '    for v in hang:',
        '        dong += "." if v <= 3 else ("+" if v <= 6 else "#")',
        '    print(dong)',
      ],
    },
    make: {
      prompt:
        'Viết "máy hiện hình" biến ảnh phẳng thành tranh ASCII.\n\nChương trình đọc MỘT dòng input(): 16 số nguyên 0–9 cách nhau dấu phẩy — đó là ảnh xám 4x4 lưu phẳng theo thứ tự từng hàng (4 số đầu là hàng 0).\n\nIn ĐÚNG 4 dòng, mỗi dòng 4 ký tự, theo bảng độ sáng:\n- giá trị <= 3 → "."\n- giá trị 4..6 → "+"\n- giá trị >= 7 → "#"\n\nVí dụ "0,0,9,9,0,0,9,9,0,0,9,9,0,0,9,9" cho 4 dòng "..##".',
      starterCode: `phang = [int(v) for v in input("Anh 4x4 phang: ").split(",")]\nW = 4\n# Cat thanh 4 hang bang phang[i*W:(i+1)*W], roi doi moi so thanh ky tu\n`,
      testCases: [
        {
          stdinLines: ['0,0,9,9,0,0,9,9,0,0,9,9,0,0,9,9'],
          expected: '..##\n..##\n..##\n..##',
          match: 'contains',
          hidden: false,
          label: 'Nửa trái tối, nửa phải sáng → cạnh dọc hiện rõ',
        },
        {
          stdinLines: ['0,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9'],
          expected: '....\n....\n####\n####',
          match: 'contains',
          hidden: false,
          label: 'Nửa trên tối, nửa dưới sáng → cạnh ngang',
        },
        {
          stdinLines: ['3,4,6,7,3,4,6,7,3,4,6,7,3,4,6,7'],
          expected: '.++#\n.++#\n.++#\n.++#',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng ranh giới 3/4 và 6/7 của bảng độ sáng',
        },
      ],
      hints: [
        'Đọc và đổi sang số: [int(v) for v in input().split(",")] cho list 16 số.',
        'Hàng i lấy bằng lát cắt phang[i*4:(i+1)*4] — lặp i từ 0 đến 3.',
        'Với mỗi hàng, cộng dồn một chuỗi rỗng: v <= 3 thêm ".", v <= 6 thêm "+", còn lại thêm "#". In chuỗi đó bằng print(dong).',
      ],
      sampleSolution: `phang = [int(v) for v in input("Anh 4x4 phang: ").split(",")]\nW = 4\nfor i in range(4):\n    hang = phang[i * W:(i + 1) * W]\n    dong = ""\n    for v in hang:\n        if v <= 3:\n            dong += "."\n        elif v <= 6:\n            dong += "+"\n        else:\n            dong += "#"\n    print(dong)`,
    },
    homework:
      'Tự "chụp" một ảnh 8x8 bằng tay: vẽ chữ cái đầu tên bạn trên giấy kẻ ô 8x8, ô nào có nét ghi 9, ô trống ghi 0. Gõ dãy 64 số đó vào code bài này (sửa W = 8 và vòng lặp 8 hàng) rồi xem máy hiện lại chữ của bạn. Sau đó thử đổi bảng ngưỡng (vd <=1 thành "." ) và trả lời: vì sao cùng một ma trận mà đổi ngưỡng lại ra hình khác hẳn — máy có "nhìn" khác đi không, hay chỉ mắt bạn đọc khác đi?',
    srsCards: [
      {
        hoi: 'Ảnh xám và ảnh màu được biểu diễn bằng con số như thế nào?',
        dap: 'Ảnh xám = MỘT ma trận 2 chiều, mỗi ô là độ sáng của một điểm ảnh (thường 0–255). Ảnh màu = BA ma trận chồng nhau (đỏ/lục/lam) — 3 kênh, nên ảnh 8x8 màu là khối số 8x8x3.',
      },
      {
        hoi: 'Ảnh lưu PHẲNG thì phần tử thứ k nằm ở hàng nào, cột nào (ảnh rộng W)?',
        dap: 'Hàng k // W, cột k % W. Ngược lại, cắt hàng i ra khỏi dãy phẳng bằng lát cắt phang[i*W:(i+1)*W]. Đây là phép reshape thủ công dùng suốt khoá, không cần numpy.',
      },
      {
        hoi: 'Vì sao ảnh thường được chuẩn hoá (chia 255) trước khi đưa vào mạng nơ-ron?',
        dap: 'Mạng nơ-ron học ổn định hơn với số nhỏ quanh 0; chia 255 đưa độ sáng về 0–1 (rồi có thể trừ trung bình). Nội dung ảnh không đổi, chỉ đổi đơn vị đo.',
      },
    ],
  },
  {
    id: 'cv1-u1-l2',
    unitId: 'cv1-u1',
    language: 'python',
    title: 'Nơ-ron nhân tạo — tổng có trọng số, bias và ReLU',
    hook: 'Nghe "mạng nơ-ron" thì tưởng não bộ. Mở ra xem thì một nơ-ron chỉ làm đúng ba việc: nhân mỗi đầu vào với một trọng số, cộng tất cả lại (thêm một số bias), rồi ép kết quả qua một hàm bẻ cong. Ba dòng code. Cái đáng sợ nằm ở chỗ xếp hàng triệu cái như thế cạnh nhau.',
    theory:
      'MỘT NƠ-RON nhận vector đầu vào x = (x1..xn), có vector TRỌNG SỐ w = (w1..wn) và một số BIAS b. Nó tính:\n  z = x1*w1 + x2*w2 + ... + xn*wn + b        (tổng có trọng số — weighted sum)\n  a = f(z)                                    (hàm kích hoạt)\n\nTrọng số nói "đầu vào này quan trọng bao nhiêu, theo chiều nào" (âm = ức chế). Bias dịch ngưỡng kích hoạt lên/xuống, cho phép nơ-ron bật ngay cả khi mọi đầu vào bằng 0.\n\nHÀM KÍCH HOẠT phải PHI TUYẾN, nếu không thì chồng bao nhiêu lớp cũng chỉ tương đương một phép tuyến tính duy nhất — mạng sâu vô nghĩa. Ba hàm hay gặp:\n- ReLU(z) = max(0, z) — âm thì cắt về 0, dương thì giữ nguyên. Rẻ, không bão hoà ở phía dương, là lựa chọn mặc định của thị giác máy tính.\n- sigmoid(z) = 1 / (1 + e^(-z)) — ép về khoảng (0, 1), hợp để đọc như xác suất, nhưng z quá lớn/nhỏ thì đạo hàm gần 0 (vanishing gradient).\n- tanh(z) — ép về (-1, 1), giống sigmoid nhưng cân quanh 0.\n\nMột nơ-ron ReLU nhìn từ xa là bộ DÒ ĐẶC TRƯNG: trọng số là "khuôn" nó tìm; đầu vào càng giống khuôn thì z càng lớn; ReLU dập mọi bằng chứng ngược chiều về 0. Cả CNN sau này chỉ là hàng nghìn bộ dò như thế, mỗi cái dò một mẩu hoa văn.\n\nLƯU Ý về giá trị: z = 0 thì ReLU trả 0 (không phải "giữ nguyên rồi mới cắt"), và max(0, -0.0) trong Python cho 0.0 — ca biên của bài Make hôm nay.',
    workedExample: {
      code: `import math

x = [0.5, 0.8, 0.1]      # dau vao: 3 dac trung
w = [2.0, -1.0, 0.5]     # trong so: dac trung 2 bi UC CHE (am)
b = 0.1                  # bias

z = 0.0
for i in range(len(x)):
    z += x[i] * w[i]     # tong co trong so
z += b
print(f"z = {z}")

relu = max(0.0, z)                       # cat phan am
sigmoid = 1 / (1 + math.exp(-z))         # ep ve (0, 1)
print(f"ReLU(z) = {relu}")
print(f"sigmoid(z) = {sigmoid:.4f}")`,
      stdinLines: [],
    },
    predict: {
      code: `x = [1.0, 1.0]\nw = [-2.0, 0.5]\nb = 0.0\nz = x[0] * w[0] + x[1] * w[1] + b\nprint(max(0.0, z))`,
      question: 'Nơ-ron ReLU này in ra gì?',
      choices: ['0.0', '-1.5', '1.5', '2.5'],
      answerIndex: 0,
      explain:
        'z = 1*(-2) + 1*0.5 + 0 = -1.5. ReLU cắt mọi giá trị âm về 0 nên in 0.0. Đây là lý do nơ-ron ReLU "im lặng": bằng chứng đi ngược khuôn của nó bị dập hoàn toàn, không đóng góp gì cho lớp sau.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự tính một nơ-ron: khởi tạo tổng → cộng dồn tích x*w → cộng bias → kích hoạt.',
      lines: [
        'z = 0.0',
        'for i in range(len(x)):',
        '    z += x[i] * w[i]',
        'z += b',
        'a = max(0.0, z)',
        'print(a)',
      ],
    },
    make: {
      prompt:
        'Tự cài MỘT nơ-ron ReLU.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: các đầu vào x, số thực cách nhau dấu phẩy (vd "1,2,3").\n- Dòng 2: các trọng số w, CÙNG số lượng với x (vd "0.5,0.5,0.5").\n- Dòng 3: bias b (một số thực).\n\nTính z = tổng(x[i]*w[i]) + b và a = ReLU(z) = max(0, z). In ĐÚNG 2 dòng:\nz: <z>\na: <a>\n\n(In thẳng số thực bằng f-string, không làm tròn.)',
      starterCode: `x = [float(v) for v in input("x: ").split(",")]\nw = [float(v) for v in input("w: ").split(",")]\nb = float(input("b: "))\n# Tinh z = tong x[i]*w[i] + b, roi a = max(0.0, z). In 2 dong.\n`,
      testCases: [
        {
          stdinLines: ['1,2,3', '0.5,0.5,0.5', '-1'],
          expected: 'z: 2.0\na: 2.0',
          match: 'contains',
          hidden: false,
          label: 'Tổng 3.0, bias −1 → z = 2.0, ReLU giữ nguyên',
        },
        {
          stdinLines: ['1,1', '-1,-1', '0'],
          expected: 'z: -2.0\na: 0.0',
          match: 'contains',
          hidden: false,
          label: 'z âm → ReLU dập về 0.0',
        },
        {
          stdinLines: ['1,-1', '1,1', '0'],
          expected: 'z: 0.0\na: 0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: z đúng bằng 0 — ReLU(0) = 0.0, không phải lỗi',
        },
      ],
      hints: [
        'Khung y hệt ví dụ mẫu: z = 0.0 rồi vòng for i in range(len(x)) cộng dồn x[i] * w[i].',
        'Đừng quên cộng bias SAU vòng lặp: z += b (cộng trong vòng lặp là cộng bias nhiều lần).',
        'ReLU viết bằng hàm dựng sẵn: a = max(0.0, z). In print(f"z: {z}") rồi print(f"a: {a}").',
      ],
      sampleSolution: `x = [float(v) for v in input("x: ").split(",")]\nw = [float(v) for v in input("w: ").split(",")]\nb = float(input("b: "))\nz = 0.0\nfor i in range(len(x)):\n    z += x[i] * w[i]\nz += b\na = max(0.0, z)\nprint(f"z: {z}")\nprint(f"a: {a}")`,
    },
    homework:
      'Biến nơ-ron của bạn thành cổng logic: tìm bộ (w1, w2, b) để nơ-ron ReLU trả về số DƯƠNG chỉ khi cả hai đầu vào đều bằng 1 (cổng AND), rồi tìm bộ khác cho cổng OR. Gợi ý: thử w = [1, 1] và chỉnh b. Sau đó thử làm cổng XOR (dương khi ĐÚNG MỘT đầu vào bằng 1) — bạn sẽ không tìm được bộ nào, và đó chính là lý do lịch sử người ta phải xếp NHIỀU LỚP nơ-ron (bài 3).',
    srsCards: [
      {
        hoi: 'Một nơ-ron nhân tạo tính gì, theo mấy bước?',
        dap: 'Hai bước: z = tổng(x[i]*w[i]) + b (tổng có trọng số cộng bias), rồi a = f(z) với f là hàm kích hoạt phi tuyến (ReLU/sigmoid/tanh). Trọng số nói đầu vào quan trọng bao nhiêu và theo chiều nào; bias dịch ngưỡng kích hoạt.',
      },
      {
        hoi: 'Vì sao hàm kích hoạt bắt buộc phải PHI TUYẾN?',
        dap: 'Vì chồng nhiều lớp tuyến tính vẫn chỉ tương đương MỘT phép tuyến tính duy nhất — mạng sâu sẽ vô nghĩa. Phi tuyến (ReLU, sigmoid, tanh) mới cho mạng biểu diễn được quan hệ phức tạp.',
      },
      {
        hoi: 'ReLU và sigmoid khác nhau thế nào, khi nào dùng cái nào?',
        dap: 'ReLU(z) = max(0, z): rẻ, không bão hoà phía dương, mặc định cho lớp ẩn trong thị giác máy tính. Sigmoid ép về (0,1) nên hợp làm đầu ra dạng xác suất, nhưng z quá lớn/nhỏ thì đạo hàm gần 0 (vanishing gradient).',
      },
    ],
  },
  {
    id: 'cv1-u1-l3',
    unitId: 'cv1-u1',
    language: 'python',
    title: 'MLP forward pass — xếp nơ-ron thành lớp',
    hook: 'Một nơ-ron không giải nổi XOR. Hai LỚP nơ-ron thì giải được — và thật ra giải được gần như mọi hàm, nếu đủ rộng. Bí mật không nằm ở nơ-ron nào thông minh cả, mà ở chỗ lớp sau nhìn vào ĐẶC TRƯNG do lớp trước tạo ra, chứ không nhìn vào dữ liệu thô nữa.',
    theory:
      'MLP (Multi-Layer Perceptron — perceptron nhiều lớp) = xếp nơ-ron thành LỚP, đầu ra lớp này là đầu vào lớp sau. Đường đi của dữ liệu từ đầu vào tới đầu ra gọi là FORWARD PASS (lượt truyền xuôi).\n\nMột lớp gồm m nơ-ron, mỗi nơ-ron có vector trọng số riêng dài n. Gom lại thành MA TRẬN W kích thước m x n và vector bias b dài m. Cả lớp tính gọn trong một dòng toán:\n  h = f(W · x + b)\ntrong đó W · x là NHÂN MA TRẬN với vector — đúng phép bạn đã tự cài ở khoá mathai: phần tử thứ i của kết quả là tích vô hướng giữa HÀNG i của W và x.\n\nMạng 2 lớp:\n  h = ReLU(W1 · x + b1)      (lớp ẩn — tạo đặc trưng)\n  y = W2 · h + b2            (lớp ra — thường KHÔNG kích hoạt, để nguyên logit)\n\nVÌ SAO nhân ma trận có mặt ở khắp nơi trong học sâu: nó chính là "cả một lớp nơ-ron chạy cùng lúc". Card đồ hoạ (GPU) nhân ma trận nhanh hơn CPU hàng trăm lần, nên toàn ngành xây mô hình quanh phép này.\n\nĐẾM CHIỀU là kỹ năng sống còn khi gỡ lỗi: x dài n, W1 là (m x n) → h dài m; W2 là (k x m) → y dài k. Sai chiều là lỗi phổ biến nhất khi mới học PyTorch, và nó luôn hiện ra ở đúng chỗ hai con số không khớp nhau.\n\nSố nơ-ron lớp ẩn (m) là SIÊU THAM SỐ: m nhỏ thì mạng không đủ chỗ nhớ đặc trưng (underfit), m lớn thì học vẹt và chạy chậm (overfit) — đúng đánh đổi bias–variance đã học ở khoá ml.',
    workedExample: {
      code: `# MLP 2 lop: 2 dau vao -> 2 no-ron an (ReLU) -> 1 dau ra
x = [3.0, 1.0]

W1 = [[1.0, -1.0],       # no-ron an 1: do "x1 lon hon x2"
      [1.0,  1.0]]       # no-ron an 2: do "tong hai dau vao"
b1 = [0.0, 0.0]

W2 = [1.0, 2.0]          # lop ra: gop 2 dac trung
b2 = 0.0

# --- Lop an: h = ReLU(W1 . x + b1)
h = []
for i in range(len(W1)):
    z = b1[i]
    for j in range(len(x)):
        z += W1[i][j] * x[j]     # tich vo huong hang i voi x
    h.append(max(0.0, z))        # ReLU
print(f"h = {h}")

# --- Lop ra: y = W2 . h + b2 (khong kich hoat)
y = b2
for i in range(len(h)):
    y += W2[i] * h[i]
print(f"y = {y}")`,
      stdinLines: [],
    },
    predict: {
      code: `W = [[2.0, 0.0], [0.0, 3.0]]\nx = [1.0, 1.0]\nh = []\nfor i in range(2):\n    z = 0.0\n    for j in range(2):\n        z += W[i][j] * x[j]\n    h.append(z)\nprint(h)`,
      question: 'Nhân ma trận W với vector x in ra gì?',
      choices: ['[2.0, 3.0]', '[2.0, 0.0]', '[5.0, 5.0]', '[3.0, 2.0]'],
      answerIndex: 0,
      explain:
        'Hàng 0 của W là [2, 0], tích vô hướng với [1, 1] = 2. Hàng 1 là [0, 3] → 3. Kết quả [2.0, 3.0]. Mỗi HÀNG của ma trận trọng số là một nơ-ron; số hàng chính là số nơ-ron của lớp.',
    },
    parsons: {
      prompt:
        'Xếp đúng forward pass 2 lớp: tính từng nơ-ron ẩn (tổng có trọng số + ReLU) rồi gộp ở lớp ra.',
      lines: [
        'h = []',
        'for i in range(len(W1)):',
        '    z = b1[i]',
        '    for j in range(len(x)):',
        '        z += W1[i][j] * x[j]',
        '    h.append(max(0.0, z))',
        'y = b2',
        'for i in range(len(h)):',
        '    y += W2[i] * h[i]',
        'print(y)',
      ],
    },
    make: {
      prompt:
        'Chạy forward pass của một MLP 2 lớp đã có sẵn trọng số (nhúng trong starter code):\n- Lớp ẩn: W1 = [[1, -1], [1, 1]], b1 = [0, 0], kích hoạt ReLU.\n- Lớp ra: W2 = [1, 2], b2 = 0, KHÔNG kích hoạt.\n\nChương trình đọc MỘT dòng input(): hai số thực x1, x2 cách nhau dấu phẩy (vd "3,1").\n\nIn ĐÚNG 2 dòng:\nh: <h1> <h2>          (hai giá trị lớp ẩn sau ReLU, cách nhau một dấu cách)\nout: <y>\n\nVí dụ với "3,1": h = 2.0 và 4.0, out = 2.0*1 + 4.0*2 = 10.0.',
      starterCode: `W1 = [[1.0, -1.0], [1.0, 1.0]]\nb1 = [0.0, 0.0]\nW2 = [1.0, 2.0]\nb2 = 0.0\nx = [float(v) for v in input("x1,x2: ").split(",")]\n# Tinh h (ReLU) roi out. In: "h: <h1> <h2>" va "out: <y>"\n`,
      testCases: [
        {
          stdinLines: ['3,1'],
          expected: 'h: 2.0 4.0\nout: 10.0',
          match: 'contains',
          hidden: false,
          label: 'x=(3,1) → h=(2,4) → out=10.0',
        },
        {
          stdinLines: ['1,3'],
          expected: 'h: 0.0 4.0\nout: 8.0',
          match: 'contains',
          hidden: false,
          label: 'Nơ-ron ẩn 1 ra âm → ReLU dập về 0.0',
        },
        {
          stdinLines: ['0,0'],
          expected: 'h: 0.0 0.0\nout: 0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đầu vào toàn 0, bias 0 → mạng im lặng hoàn toàn',
        },
      ],
      hints: [
        'Lớp ẩn có 2 nơ-ron = 2 HÀNG của W1. Lặp i qua các hàng, lặp j qua các đầu vào, cộng dồn W1[i][j] * x[j].',
        'Nhớ ReLU cho lớp ẩn (max(0.0, z)) nhưng KHÔNG ReLU cho lớp ra — đầu ra để nguyên logit.',
        'In lớp ẩn cách nhau một dấu cách: print(f"h: {h[0]} {h[1]}"), rồi print(f"out: {y}").',
      ],
      sampleSolution: `W1 = [[1.0, -1.0], [1.0, 1.0]]\nb1 = [0.0, 0.0]\nW2 = [1.0, 2.0]\nb2 = 0.0\nx = [float(v) for v in input("x1,x2: ").split(",")]\nh = []\nfor i in range(len(W1)):\n    z = b1[i]\n    for j in range(len(x)):\n        z += W1[i][j] * x[j]\n    h.append(max(0.0, z))\ny = b2\nfor i in range(len(h)):\n    y += W2[i] * h[i]\nprint(f"h: {h[0]} {h[1]}")\nprint(f"out: {y}")`,
    },
    homework:
      'Quay lại cổng XOR mà một nơ-ron không giải nổi (bài tập về nhà bài 2). Dùng đúng mạng 2 lớp của bài này với W1 = [[1, 1], [1, 1]], b1 = [0, -1], W2 = [1, -2], b2 = 0, rồi chạy thử cả 4 đầu vào (0,0), (0,1), (1,0), (1,1). Ghi lại đầu ra và trả lời: nơ-ron ẩn thứ hai đang phát hiện điều gì, và lớp ra dùng nó để "trừ đi" trường hợp nào?',
    srsCards: [
      {
        hoi: 'Forward pass của một lớp nơ-ron viết gọn bằng công thức nào?',
        dap: 'h = f(W · x + b): W là ma trận trọng số (mỗi HÀNG là một nơ-ron), x là vector đầu vào, b là vector bias, f là hàm kích hoạt. Nhân ma trận chính là "cả lớp nơ-ron chạy cùng lúc" — lý do GPU thống trị học sâu.',
      },
      {
        hoi: 'Trong mạng 2 lớp, chiều của các ma trận khớp nhau ra sao?',
        dap: 'x dài n; W1 kích thước (m x n) → h dài m; W2 kích thước (k x m) → y dài k. Sai chiều là lỗi phổ biến nhất khi mới học framework, và luôn lộ ra ở đúng chỗ hai con số không khớp.',
      },
      {
        hoi: 'Vì sao lớp ra của mạng phân loại thường KHÔNG có ReLU?',
        dap: 'Đầu ra lớp cuối là LOGIT (điểm số thô, được phép âm) để đưa vào softmax tính xác suất. ReLU sẽ cắt hết phần âm, làm mất thông tin so sánh giữa các lớp.',
      },
    ],
  },
  {
    id: 'cv1-u1-l4',
    unitId: 'cv1-u1',
    language: 'python',
    title: 'Softmax & cross-entropy — biến điểm số thành xác suất và đo độ sai',
    hook: 'Mạng nhìn ảnh rồi trả về ba con số: 2.0 cho "mèo", 1.0 cho "chó", 0.0 cho "chim". Ba số này chưa phải xác suất — chúng có thể âm, có thể to bất kỳ. Softmax là cái phễu biến chúng thành ba xác suất cộng lại đúng bằng 1, còn cross-entropy là cái cân đo mạng đã sai bao nhiêu.',
    theory:
      'LOGIT = điểm số thô ở lớp ra, chưa chuẩn hoá. SOFTMAX biến vector logit z thành vector xác suất p:\n  p_i = e^(z_i) / tổng_j e^(z_j)\nHàm mũ làm mọi số thành dương và khuếch đại khoảng cách (logit hơn nhau 1 đơn vị thì xác suất hơn nhau e ≈ 2,72 lần); phép chia cho tổng đảm bảo các p cộng lại bằng 1.\n\nCROSS-ENTROPY (mất mát entropy chéo) đo độ sai khi nhãn đúng là lớp c:\n  L = -log(p_c)\nChỉ xác suất của LỚP ĐÚNG được tính. Đọc bằng lời: "mạng đã dành bao nhiêu niềm tin cho đáp án đúng". p_c = 1 (chắc chắn đúng) → L = 0. p_c = 0.5 → L = 0,693. p_c tiến về 0 (tự tin mà SAI) → L bốc lên vô cực. Chính hình phạt tăng vọt này dạy mạng đừng tự tin bừa.\n\nMỘT SỐ MỐC nên thuộc: với n lớp mà mạng đoán mù hoàn toàn (mọi p bằng nhau = 1/n) thì L = log(n). Hai lớp → 0,693; ba lớp → 1,0986; mười lớp → 2,303. Huấn luyện mà loss cứ nằm ì quanh log(n) nghĩa là mạng chưa học được gì cả — mẹo chẩn đoán nhanh dùng suốt đời làm nghề.\n\nBẪY SỐ HỌC: e^z tràn số khi z lớn (e^1000 là vô cực). Cách chữa chuẩn của mọi thư viện: TRỪ giá trị lớn nhất khỏi mọi logit trước khi lấy mũ — softmax(z) = softmax(z - max(z)), kết quả không đổi vì thừa số chung ở tử và mẫu triệt tiêu. Bài Make hôm nay dùng số nhỏ nên chưa cần, nhưng phải biết mẹo này tồn tại.\n\nTrong PyTorch, nn.CrossEntropyLoss ĐÃ GỘP softmax bên trong — đưa logit thô vào, đừng softmax hai lần. Đây là lỗi kinh điển của người mới, và triệu chứng là mạng học rất chậm mà không báo lỗi gì.',
    workedExample: {
      code: `import math

logit = [2.0, 1.0, 0.0]     # diem tho cho 3 lop: meo, cho, chim
nhan_dung = 0               # dap an that: lop 0 (meo)

# --- Softmax
mu = [math.exp(z) for z in logit]     # ham mu: moi so thanh duong
tong = sum(mu)
p = [m / tong for m in mu]            # chia cho tong -> cong lai bang 1
print("p:", " ".join(f"{v:.4f}" for v in p))
print(f"Tong xac suat = {sum(p):.4f}")

# --- Cross-entropy: chi nhin xac suat cua LOP DUNG
loss = -math.log(p[nhan_dung])
print(f"loss = {loss:.4f}")

# Mo hinh doan mu 3 lop thi loss = log(3)
print(f"Doan mu 3 lop: {math.log(3):.4f}")`,
      stdinLines: [],
    },
    predict: {
      code: `import math\nlogit = [0.0, 0.0]\nmu = [math.exp(z) for z in logit]\ntong = sum(mu)\np = [m / tong for m in mu]\nprint(f"{-math.log(p[0]):.4f}")`,
      question: 'Hai logit bằng nhau, nhãn đúng là lớp 0 — cross-entropy in ra bao nhiêu?',
      choices: ['0.6931', '0.0000', '1.0000', '1.0986'],
      answerIndex: 0,
      explain:
        'Hai logit bằng nhau → p = [0.5, 0.5] → L = -log(0.5) = log(2) = 0.6931. Đây là mốc "đoán mù 2 lớp": loss nằm ì quanh 0.6931 nghĩa là mạng chưa học được gì. Với n lớp, mốc đó là log(n).',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự softmax rồi cross-entropy: lấy mũ → cộng tổng → chia → lấy -log của lớp đúng.',
      lines: [
        'mu = [math.exp(z) for z in logit]',
        'tong = sum(mu)',
        'p = [m / tong for m in mu]',
        'loss = -math.log(p[nhan_dung])',
        'print(f"{loss:.4f}")',
      ],
    },
    make: {
      prompt:
        'Tự cài softmax + cross-entropy.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: các logit, số thực cách nhau dấu phẩy (vd "2,1,0").\n- Dòng 2: chỉ số lớp đúng, đếm từ 0 (vd "0").\n\nIn ĐÚNG 2 dòng, mọi số dùng ĐÚNG 4 chữ số thập phân (f-string dạng {v:.4f}):\np: <p0> <p1> ...      (các xác suất, cách nhau một dấu cách)\nloss: <L>\n\nVí dụ "2,1,0" với nhãn 0 → p: 0.6652 0.2447 0.0900 và loss: 0.4076.',
      starterCode: `import math\n\nlogit = [float(v) for v in input("Logit: ").split(",")]\nnhan = int(input("Nhan dung: "))\n# Softmax: lay math.exp tung logit, chia cho tong.\n# Cross-entropy: loss = -math.log(p[nhan]). In dung dinh dang :.4f\n`,
      testCases: [
        {
          stdinLines: ['2,1,0', '0'],
          expected: 'p: 0.6652 0.2447 0.0900\nloss: 0.4076',
          match: 'contains',
          hidden: false,
          label: 'Logit (2,1,0), nhãn đúng lớp 0 → loss 0.4076',
        },
        {
          stdinLines: ['1,1,1', '0'],
          expected: 'p: 0.3333 0.3333 0.3333\nloss: 1.0986',
          match: 'contains',
          hidden: false,
          label: 'Ba logit bằng nhau = đoán mù 3 lớp → loss = log(3)',
        },
        {
          stdinLines: ['0,0', '1'],
          expected: 'p: 0.5000 0.5000\nloss: 0.6931',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 2 lớp, nhãn đúng là lớp 1 → mốc log(2)',
        },
      ],
      hints: [
        'Softmax ba bước: mu = [math.exp(z) for z in logit] → tong = sum(mu) → p = [m / tong for m in mu].',
        'Ghép chuỗi xác suất bằng " ".join(f"{v:.4f}" for v in p) rồi in kèm tiền tố "p: ".',
        'Cross-entropy CHỈ dùng xác suất của lớp đúng: loss = -math.log(p[nhan]); in print(f"loss: {loss:.4f}").',
      ],
      sampleSolution: `import math\n\nlogit = [float(v) for v in input("Logit: ").split(",")]\nnhan = int(input("Nhan dung: "))\nmu = [math.exp(z) for z in logit]\ntong = sum(mu)\np = [m / tong for m in mu]\nprint("p: " + " ".join(f"{v:.4f}" for v in p))\nloss = -math.log(p[nhan])\nprint(f"loss: {loss:.4f}")`,
    },
    homework:
      'Chạy code của bạn với logit "10,0,0" (nhãn 0) rồi với "0,0,10" (vẫn nhãn 0). So hai giá trị loss và viết 3 câu trả lời: vì sao "tự tin và ĐÚNG" gần như không bị phạt, còn "tự tin và SAI" bị phạt nặng tới mức nào? Sau đó thử logit "1000,0,0" — chương trình sẽ báo lỗi tràn số (OverflowError). Sửa bằng mẹo trừ max: thay logit bằng [z - max(logit) for z in logit] trước khi lấy mũ, và kiểm rằng kết quả với "10,0,0" không đổi.',
    srsCards: [
      {
        hoi: 'Softmax biến logit thành xác suất bằng công thức nào?',
        dap: 'p_i = e^(z_i) / tổng_j e^(z_j). Hàm mũ làm mọi số thành dương và khuếch đại khoảng cách; chia cho tổng đảm bảo các xác suất cộng lại bằng 1.',
      },
      {
        hoi: 'Cross-entropy tính thế nào và mốc "đoán mù" là bao nhiêu?',
        dap: 'L = -log(p_c) với c là lớp đúng — chỉ xác suất của lớp đúng được tính. Đoán mù n lớp cho L = log(n): 2 lớp → 0,693; 3 lớp → 1,0986; 10 lớp → 2,303. Loss nằm ì quanh log(n) nghĩa là mạng chưa học được gì.',
      },
      {
        hoi: 'Mẹo chống tràn số của softmax là gì, vì sao kết quả không đổi?',
        dap: 'Trừ giá trị lớn nhất khỏi mọi logit trước khi lấy mũ: softmax(z) = softmax(z − max(z)). Kết quả không đổi vì thừa số chung e^(−max) xuất hiện ở cả tử và mẫu nên triệt tiêu.',
      },
    ],
  },
  {
    id: 'cv1-u1-l5',
    unitId: 'cv1-u1',
    language: 'python',
    title: 'Lan truyền ngược — chain rule và phép kiểm bằng đạo hàm số',
    hook: 'Mạng đoán sai. Câu hỏi triệu đô: trong hàng triệu trọng số, mỗi cái phải nhích lên hay xuống bao nhiêu để lần sau bớt sai? Lan truyền ngược trả lời câu đó bằng đúng một quy tắc toán lớp 12 — chain rule — và bạn có thể KIỂM nó đúng hay sai chỉ bằng máy tính bỏ túi.',
    theory:
      'GRADIENT của hàm mất mát theo một trọng số w, ký hiệu dL/dw, trả lời: "w tăng một chút thì L tăng hay giảm, nhanh bao nhiêu". Biết nó rồi thì cập nhật theo hướng ngược: w mới = w - lr * dL/dw (gradient descent, bài cv1-u2-l4).\n\nCHAIN RULE (quy tắc chuỗi) cho phép tính gradient qua nhiều tầng bằng cách NHÂN các đạo hàm cục bộ dọc đường. Với mô hình một tham số y_hat = w*x và mất mát L = (y_hat - y)^2:\n  dL/dy_hat = 2 * (y_hat - y)     (đạo hàm của bình phương)\n  dy_hat/dw = x                    (đạo hàm của w*x theo w)\n  dL/dw = 2 * (y_hat - y) * x      (nhân hai cái lại)\n\nLAN TRUYỀN NGƯỢC (backpropagation) chỉ là chain rule chạy từ lớp cuối về lớp đầu, TÁI SỬ DỤNG các kết quả trung gian thay vì tính lại — nhờ vậy tính gradient cho cả mạng chỉ tốn khoảng gấp đôi một forward pass, thay vì tốn theo số trọng số. Đây là lý do kỹ thuật khiến học sâu khả thi.\n\nCÁCH KIỂM (gradient checking) — kỹ năng nghề nghiệp thật sự của bài này: so công thức giải tích với ĐẠO HÀM SỐ tính theo sai phân trung tâm:\n  dL/dw ≈ (L(w + h) - L(w - h)) / (2h),  với h nhỏ, ví dụ 1e-5\nHai số phải khớp nhau tới vài chữ số. Lệch nhiều = công thức lan truyền ngược viết sai. Mọi thư viện học sâu đều có test kiểu này trong bộ kiểm thử của nó.\n\nVÌ SAO dùng sai phân TRUNG TÂM chứ không (L(w+h) - L(w))/h: sai số của sai phân trung tâm bậc h^2 thay vì bậc h — chính xác hơn nhiều với cùng h, và với hàm bậc hai như MSE thì nó cho kết quả gần như chính xác tuyệt đối.\n\nBẪY h: h quá lớn thì công thức xấp xỉ thô; h quá nhỏ (vd 1e-12) thì phép trừ hai số gần bằng nhau mất hết chữ số có nghĩa (triệt tiêu thảm hoạ). Khoảng 1e-5 tới 1e-7 là vùng vàng.',
    workedExample: {
      code: `# Mo hinh 1 tham so: y_hat = w * x, mat mat L = (y_hat - y)^2
x = 2.0
y = 6.0

def L(w):
    y_hat = w * x
    return (y_hat - y) ** 2

w = 1.0

# --- Cach 1: cong thuc giai tich (chain rule)
grad_giai_tich = 2 * (w * x - y) * x
print(f"Giai tich: {grad_giai_tich:.4f}")

# --- Cach 2: dao ham so (sai phan trung tam) de KIEM
h = 0.00001
grad_so = (L(w + h) - L(w - h)) / (2 * h)
print(f"Dao ham so: {grad_so:.4f}")

# Hai so khop nhau -> cong thuc viet dung
print(f"Lech: {abs(grad_giai_tich - grad_so):.8f}")`,
      stdinLines: [],
    },
    predict: {
      code: `x = 3.0\ny = 3.0\nw = 1.0\nprint(f"{2 * (w * x - y) * x:.4f}")`,
      question: 'Mô hình đoán đúng y ngay từ đầu (w*x = 3 = y). Gradient in ra bao nhiêu?',
      choices: ['0.0000', '3.0000', '6.0000', '-3.0000'],
      answerIndex: 0,
      explain:
        'w*x − y = 3 − 3 = 0, nhân với gì cũng ra 0. Gradient bằng 0 nghĩa là "đang ở đáy, đừng nhúc nhích" — công thức cập nhật w − lr*0 giữ nguyên w. Đó cũng là dấu hiệu hội tụ mà bạn sẽ thấy ở vòng huấn luyện bài cv1-u2-l4.',
    },
    parsons: {
      prompt:
        'Xếp đúng phép kiểm gradient: định nghĩa hàm mất mát → tính giải tích → tính sai phân trung tâm → so lệch.',
      lines: [
        'def L(w):',
        '    return (w * x - y) ** 2',
        'grad_giai_tich = 2 * (w * x - y) * x',
        'h = 0.00001',
        'grad_so = (L(w + h) - L(w - h)) / (2 * h)',
        'print(abs(grad_giai_tich - grad_so) < 0.001)',
      ],
    },
    make: {
      prompt:
        'Viết máy KIỂM GRADIENT cho mô hình một tham số y_hat = w*x với mất mát L(w) = (w*x - y)^2.\n\nChương trình đọc 3 dòng input(): x, y, w (đều là số thực).\n\nTính gradient theo HAI cách rồi in ĐÚNG 2 dòng, mỗi số 4 chữ số thập phân:\ngiai tich: <2*(w*x - y)*x>\ndao ham so: <(L(w+h) - L(w-h)) / (2h) với h = 0.00001>\n\nVí dụ x=2, y=6, w=1 → cả hai đều là -16.0000.',
      starterCode: `x = float(input("x: "))\ny = float(input("y: "))\nw = float(input("w: "))\n\ndef L(gia_tri_w):\n    return (gia_tri_w * x - y) ** 2\n\nh = 0.00001\n# Tinh grad giai tich va grad so, in 2 dong dinh dang :.4f\n`,
      testCases: [
        {
          stdinLines: ['2', '6', '1'],
          expected: 'giai tich: -16.0000\ndao ham so: -16.0000',
          match: 'contains',
          hidden: false,
          label: 'Đoán 2 mà đáp án 6 → gradient âm mạnh, hai cách khớp nhau',
        },
        {
          stdinLines: ['1', '0', '3'],
          expected: 'giai tich: 6.0000\ndao ham so: 6.0000',
          match: 'contains',
          hidden: false,
          label: 'Đoán 3 mà đáp án 0 → gradient dương, phải giảm w',
        },
        {
          stdinLines: ['2', '4', '2'],
          expected: 'giai tich: 0.0000\ndao ham so: 0.0000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đã đoán đúng → gradient bằng 0, dừng cập nhật',
        },
      ],
      hints: [
        'Công thức giải tích lấy nguyên từ theory: grad = 2 * (w * x - y) * x.',
        'Đạo hàm số dùng ĐÚNG hàm L đã cho sẵn trong starter: (L(w + h) - L(w - h)) / (2 * h) — nhớ mẫu số là 2*h chứ không phải h.',
        'In bằng f-string định dạng cố định: print(f"giai tich: {grad:.4f}") và print(f"dao ham so: {grad_so:.4f}").',
      ],
      sampleSolution: `x = float(input("x: "))\ny = float(input("y: "))\nw = float(input("w: "))\n\ndef L(gia_tri_w):\n    return (gia_tri_w * x - y) ** 2\n\nh = 0.00001\ngrad = 2 * (w * x - y) * x\ngrad_so = (L(w + h) - L(w - h)) / (2 * h)\nprint(f"giai tich: {grad:.4f}")\nprint(f"dao ham so: {grad_so:.4f}")`,
    },
    homework:
      'Phá cho hỏng rồi sửa: sửa công thức giải tích trong code của bạn thành 2*(w*x - y) (QUÊN nhân x) rồi chạy lại với x=2, y=6, w=1. Hai con số lệch nhau — đó chính xác là cảm giác khi bạn viết sai một dòng lan truyền ngược trong dự án thật. Sau đó đổi h thành 1e-12 với công thức đúng và xem chuyện gì xảy ra: viết 2 câu giải thích vì sao h quá nhỏ lại làm đạo hàm số sai.',
    srsCards: [
      {
        hoi: 'Chain rule cho mô hình y_hat = w*x với L = (y_hat − y)² cho gradient bằng gì?',
        dap: 'dL/dw = dL/dy_hat · dy_hat/dw = 2(y_hat − y) · x = 2(w·x − y)·x. Lan truyền ngược chỉ là chain rule chạy từ lớp cuối về lớp đầu, tái sử dụng kết quả trung gian.',
      },
      {
        hoi: 'Kiểm gradient (gradient checking) làm thế nào?',
        dap: 'So công thức giải tích với đạo hàm số theo sai phân trung tâm: (L(w+h) − L(w−h)) / (2h) với h khoảng 1e-5. Hai số phải khớp vài chữ số; lệch nhiều nghĩa là công thức lan truyền ngược viết sai.',
      },
      {
        hoi: 'Vì sao h trong đạo hàm số không được quá lớn cũng không được quá nhỏ?',
        dap: 'h quá lớn → xấp xỉ thô, sai số công thức. h quá nhỏ (1e-12) → trừ hai số gần bằng nhau làm mất chữ số có nghĩa (triệt tiêu thảm hoạ). Vùng vàng khoảng 1e-5 đến 1e-7.',
      },
    ],
  },
]

// lessons/cv1u3.ts — Giai đoạn 3 "PyTorch, transfer learning & Docker" của khoá ngắn "Deep
// Learning for Computer Vision cơ bản" (docs/specs/2026-09-01-cv1-bai-hoc-chi-tiet.md §4).
//
// unitId 'cv1-u3' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: bài "đọc PyTorch" (cv1-u3-l1) chỉ nhắc code nn.Module dạng CHỮ
// trong hook/theory — KHÔNG đưa vào code được chấm, vì Pyodide và CI không cài được PyTorch.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const CV1_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'cv1-u3-l1',
    unitId: 'cv1-u3',
    language: 'python',
    title: 'Đọc PyTorch — mỗi dòng nn.Module ứng với đoạn code bạn đã tự cài',
    hook: 'Bốn dòng PyTorch làm đúng việc mà bạn vừa gõ bốn vòng lặp lồng nhau để làm. Sau khi tự cài, đọc chúng không còn là đọc phép thuật — bạn biết chính xác từng dòng đang giấu vòng lặp nào bên trong, và đó là khác biệt giữa người dùng thư viện và người hiểu thư viện.',
    theory:
      'PYTORCH là thư viện học sâu phổ biến nhất trong nghiên cứu. Nó KHÔNG chạy được trong Pyodide (trình duyệt) nên khoá này đọc code PyTorch trong bài giảng, còn phần được CHẤM vẫn là bản Python thuần tương đương — hiểu ruột trước, gõ thư viện sau.\n\nBẢNG ĐỐI CHIẾU từng dòng — bên trái là PyTorch, bên phải là thứ bạn đã tự cài:\n\n1. nn.Linear(3, 2)  →  ma trận W kích thước 2x3 và vector b dài 2, tính W·x + b. Đúng bài cv1-u1-l3. Chú ý thứ tự đối số là (số_vào, số_ra), còn W lưu dạng (số_ra, số_vào) — chỗ này hay làm người mới rối.\n2. nn.ReLU()  →  max(0.0, z) cho từng phần tử. Bài cv1-u1-l2.\n3. nn.Conv2d(1, 8, kernel_size=3)  →  8 kernel 3x3 trượt trên ảnh 1 kênh, đúng bốn vòng lặp lồng nhau ở bài cv1-u2-l1, có sẵn bias mỗi kênh ra (80 tham số — đã đếm ở cv1-u2-l3).\n4. nn.MaxPool2d(2)  →  vòng lặp bước nhảy 2 lấy max mỗi ô 2x2. Bài cv1-u2-l2.\n5. nn.CrossEntropyLoss()  →  softmax rồi -log(p của lớp đúng). Bài cv1-u1-l4. Nhớ: nó ĐÃ gộp softmax, đừng softmax hai lần.\n6. loss.backward()  →  chain rule chạy ngược tính mọi gradient. Bài cv1-u1-l5.\n7. optimizer.step()  →  w = w - lr*grad cho mọi tham số. Bài cv1-u2-l4.\n\nMỘT MẠNG PYTORCH điển hình viết như sau (đọc, KHÔNG chạy trong khoá này):\n  class Mang(nn.Module):\n      def __init__(self):\n          super().__init__()\n          self.fc1 = nn.Linear(3, 2)\n          self.relu = nn.ReLU()\n          self.fc2 = nn.Linear(2, 1)\n      def forward(self, x):\n          return self.fc2(self.relu(self.fc1(x)))\n\nĐọc bằng lời: __init__ KHAI BÁO các lớp có tham số (nơi trọng số sinh ra và được nhớ), còn forward MÔ TẢ đường đi của dữ liệu — chính là forward pass bạn viết tay. PyTorch tự lo phần backward nhờ ghi lại đồ thị tính toán trong lúc forward (autograd).\n\nBA DÒNG NGHI THỨC hay quên khi huấn luyện thật, theo đúng thứ tự: optimizer.zero_grad() (xoá gradient cũ, vì PyTorch CỘNG DỒN gradient) → loss.backward() → optimizer.step(). Quên dòng đầu là gradient chồng lên nhau qua các bước, mạng học sai mà không báo lỗi.\n\nHôm nay bạn cài lại nn.Linear bằng tay cho một lớp cụ thể — đọc xong bảng đối chiếu trên, hãy tự chỉ ra dòng PyTorch tương ứng với code mình vừa viết.',
    workedExample: {
      code: `# Ban PYTHON THUAN tuong duong nn.Linear(3, 2): y = W . x + b
# (PyTorch: layer = nn.Linear(3, 2); y = layer(x) — cung mot phep tinh)
W = [[1.0, 0.0, -1.0],      # HANG i = trong so cua no-ron ra thu i
     [0.0, 1.0,  1.0]]
b = [0.5, -0.5]

x = [1.0, 2.0, 3.0]

y = []
for i in range(len(W)):          # moi hang = mot dau ra
    z = b[i]
    for j in range(len(x)):
        z += W[i][j] * x[j]      # tich vo huong hang i voi x
    y.append(z)

print("y: " + " ".join(f"{v:.2f}" for v in y))
print(f"So tham so: {len(W) * len(x) + len(b)}")   # 2*3 + 2 = 8`,
      stdinLines: [],
    },
    predict: {
      code: `W = [[1.0, 0.0, -1.0], [0.0, 1.0, 1.0]]\nb = [0.5, -0.5]\nx = [0.0, 0.0, 0.0]\ny = [b[i] + sum(W[i][j] * x[j] for j in range(3)) for i in range(2)]\nprint(" ".join(f"{v:.2f}" for v in y))`,
      question: 'Đầu vào toàn 0 đi qua lớp Linear này — in ra gì?',
      choices: ['0.50 -0.50', '0.00 0.00', '1.00 -1.00', '0.50 0.50'],
      answerIndex: 0,
      explain:
        'Mọi tích W[i][j]*x[j] đều bằng 0, chỉ còn BIAS: [0.5, −0.5]. Đây chính là vai trò của bias — cho lớp trả về giá trị khác 0 ngay cả khi đầu vào im lặng hoàn toàn. Trong PyTorch, tắt nó bằng nn.Linear(3, 2, bias=False).',
    },
    parsons: {
      prompt:
        'Xếp đúng bản Python thuần của nn.Linear: mỗi hàng W là một đầu ra, khởi tạo bằng bias rồi cộng dồn tích.',
      lines: [
        'y = []',
        'for i in range(len(W)):',
        '    z = b[i]',
        '    for j in range(len(x)):',
        '        z += W[i][j] * x[j]',
        '    y.append(z)',
        'print("y: " + " ".join(f"{v:.2f}" for v in y))',
      ],
    },
    make: {
      prompt:
        'Cài lại nn.Linear(3, 2) bằng Python thuần.\n\nTrọng số NHÚNG SẴN trong starter code:\n  W = [[1, 0, -1], [0, 1, 1]]   (mỗi HÀNG là một đầu ra)\n  b = [0.5, -0.5]\n\nChương trình đọc MỘT dòng input(): 3 số thực cách nhau dấu phẩy — vector đầu vào x.\n\nTính y[i] = b[i] + tổng_j W[i][j]*x[j], rồi in ĐÚNG 1 dòng, hai số với ĐÚNG 2 chữ số thập phân, cách nhau một dấu cách:\ny: <y0> <y1>\n\nVí dụ "1,2,3" → y0 = 1 − 3 + 0.5 = −1.5 và y1 = 2 + 3 − 0.5 = 4.5, in "y: -1.50 4.50".',
      starterCode: `W = [[1.0, 0.0, -1.0],\n     [0.0, 1.0, 1.0]]\nb = [0.5, -0.5]\nx = [float(v) for v in input("x (3 so): ").split(",")]\n# Tinh y[i] = b[i] + tong W[i][j]*x[j], in dinh dang :.2f\n`,
      testCases: [
        {
          stdinLines: ['1,2,3'],
          expected: 'y: -1.50 4.50',
          match: 'contains',
          hidden: false,
          label: 'x=(1,2,3): nơ-ron 0 đo "x1 trừ x3", nơ-ron 1 đo "x2 cộng x3"',
        },
        {
          stdinLines: ['0,0,0'],
          expected: 'y: 0.50 -0.50',
          match: 'contains',
          hidden: false,
          label: 'Đầu vào im lặng → đầu ra chính là bias',
        },
        {
          stdinLines: ['2,2,2'],
          expected: 'y: 0.50 3.50',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: x1 và x3 bằng nhau nên triệt tiêu ở nơ-ron 0, chỉ còn bias',
        },
      ],
      hints: [
        'Số đầu ra = số HÀNG của W (2), số đầu vào = độ dài x (3). Lặp i qua hàng, j qua cột.',
        'Khởi tạo tổng bằng BIAS chứ không phải 0: z = b[i], rồi cộng dồn W[i][j] * x[j].',
        'Định dạng bắt buộc 2 chữ số thập phân: " ".join(f"{v:.2f}" for v in y), in kèm tiền tố "y: ".',
      ],
      sampleSolution: `W = [[1.0, 0.0, -1.0],\n     [0.0, 1.0, 1.0]]\nb = [0.5, -0.5]\nx = [float(v) for v in input("x (3 so): ").split(",")]\ny = []\nfor i in range(len(W)):\n    z = b[i]\n    for j in range(len(x)):\n        z += W[i][j] * x[j]\n    y.append(z)\nprint("y: " + " ".join(f"{v:.2f}" for v in y))`,
    },
    homework:
      'Cầm bảng đối chiếu 7 dòng trong phần lý thuyết và viết ra giấy (hoặc gõ dạng comment) bản PyTorch của mạng CNN bạn đã tự cài suốt giai đoạn 2: một Conv2d(1→8, kernel 3), ReLU, MaxPool2d(2), Flatten, Linear(→10). Với MỖI dòng, ghi kèm tên bài trong khoá này mà bạn đã cài phần ruột của nó. Cuối cùng trả lời: dòng nào trong đó bạn CHƯA từng tự cài, và nó làm gì?',
    srsCards: [
      {
        hoi: 'Trong PyTorch, __init__ và forward của một nn.Module đảm nhiệm việc gì?',
        dap: '__init__ khai báo các lớp CÓ THAM SỐ (nơi trọng số sinh ra và được nhớ); forward mô tả ĐƯỜNG ĐI của dữ liệu qua các lớp — chính là forward pass viết tay. Phần backward do autograd tự lo nhờ đồ thị tính toán ghi lại lúc forward.',
      },
      {
        hoi: 'nn.Linear(3, 2) tương đương phép tính nào, ma trận trọng số kích thước bao nhiêu?',
        dap: 'y = W·x + b với W kích thước (2 x 3) — số HÀNG là số đầu ra, số cột là số đầu vào — và b dài 2. Đối số truyền vào theo thứ tự (số_vào, số_ra), ngược với cách lưu W: chỗ này hay gây rối.',
      },
      {
        hoi: 'Ba dòng nghi thức trong một bước huấn luyện PyTorch, theo đúng thứ tự?',
        dap: 'optimizer.zero_grad() → loss.backward() → optimizer.step(). Quên zero_grad() thì gradient CỘNG DỒN qua các bước, mạng học sai mà không hề báo lỗi.',
      },
    ],
  },
  {
    id: 'cv1-u3-l2',
    unitId: 'cv1-u3',
    language: 'python',
    title: 'Transfer learning — đóng băng backbone, thay đầu phân loại',
    hook: 'Huấn luyện ResNet-50 từ số 0 cần cả triệu ảnh và nhiều ngày GPU. Nhưng bạn chỉ có 300 ảnh lá cây bệnh và một buổi chiều. Cách dân nghề vẫn làm: mượn một mạng đã học nhìn từ 1,2 triệu ảnh, khoá phần "biết nhìn" lại, chỉ dạy lại vài nghìn tham số ở đầu ra. Kết quả thường tốt hơn hẳn mạng tự huấn luyện từ đầu.',
    theory:
      'TRANSFER LEARNING (học chuyển giao) = lấy mô hình đã huấn luyện sẵn (pretrained) trên tập dữ liệu lớn rồi tái sử dụng cho bài toán của mình.\n\nVì sao chạy được: các lớp ĐẦU của CNN học đặc trưng RẤT CHUNG — cạnh, góc, hoa văn, kết cấu — dùng được cho hầu như mọi bài toán ảnh. Chỉ các lớp CUỐI mới chuyên biệt cho tập dữ liệu gốc ("đây là giống chó Husky"). Vậy giữ phần chung, thay phần chuyên biệt.\n\nHAI PHẦN của mô hình:\n- BACKBONE (xương sống) — toàn bộ phần trích đặc trưng, chiếm gần hết tham số (ResNet-50 khoảng 23,5 triệu).\n- HEAD (đầu phân loại) — vài lớp cuối ra số lớp của BÀI TOÁN BẠN. Thay head cũ (1.000 lớp ImageNet) bằng head mới (vd 2 lớp: lá khoẻ / lá bệnh) là vài nghìn tham số.\n\nHAI CHIẾN LƯỢC:\n1. ĐÓNG BĂNG (freeze) backbone — chỉ huấn luyện head. Số tham số cập nhật cực nhỏ nên chạy nhanh, ít overfit, hợp khi dữ liệu ÍT (dưới vài nghìn ảnh) và bài toán GẦN với dữ liệu gốc.\n2. TINH CHỈNH (fine-tune) toàn mạng — mở khoá tất cả, huấn luyện với learning rate NHỎ (vd nhỏ hơn 10 lần bình thường) để không đập nát kiến thức cũ. Hợp khi dữ liệu NHIỀU hơn hoặc miền ảnh khác xa (ảnh y tế, ảnh vệ tinh).\n\nCÔNG THỨC quyết định trong thực tế: dữ liệu ít + miền giống → đóng băng. Dữ liệu nhiều + miền khác → fine-tune (thậm chí huấn luyện lại từ đầu). Ở giữa thì đóng băng trước, sau đó mở khoá dần vài lớp cuối của backbone (progressive unfreezing).\n\n"ĐÓNG BĂNG" trong code nghĩa là gì: đặt requires_grad = False cho tham số đó, tức lan truyền ngược vẫn ĐI QUA nó (để tính gradient cho lớp trước nếu cần) nhưng bộ tối ưu KHÔNG cập nhật giá trị của nó. Trong PyTorch:\n  for p in model.backbone.parameters():\n      p.requires_grad = False\n\nHÔM NAY bạn cài bộ đếm cho quyết định đó: cho số tham số backbone và head, cho chiến lược, in ra bao nhiêu tham số thật sự được cập nhật. Con số này quyết định thời gian huấn luyện và rủi ro overfit của bạn.',
    workedExample: {
      code: `# Dem tham so duoc cap nhat theo chien luoc transfer learning
backbone = 23500000       # ResNet-50 phan trich dac trung
head = 2570               # lop phan loai moi (2 lop dau ra)

for chien_luoc in ["freeze", "finetune"]:
    if chien_luoc == "freeze":
        cap_nhat = head           # backbone bi khoa
        dong_bang = backbone
    else:
        cap_nhat = backbone + head    # mo khoa tat ca
        dong_bang = 0
    print(f"--- {chien_luoc}")
    print(f"Tham so cap nhat: {cap_nhat}")
    print(f"Tham so dong bang: {dong_bang}")

# Ti le tham so phai hoc lai khi dong bang
print(f"Chi hoc lai {head} / {backbone + head} tham so")`,
      stdinLines: [],
    },
    predict: {
      code: `backbone = 1000\nhead = 10\nchien_luoc = "freeze"\ncap_nhat = head if chien_luoc == "freeze" else backbone + head\nprint(cap_nhat)`,
      question:
        'Chiến lược "freeze" với backbone 1000 tham số, head 10 — bao nhiêu tham số được cập nhật?',
      choices: ['10', '1000', '1010', '990'],
      answerIndex: 0,
      explain:
        'Đóng băng backbone nghĩa là chỉ head được học: 10 tham số. Ít tham số cập nhật → huấn luyện nhanh và khó overfit khi dữ liệu ít. Đó chính là lý do transfer learning cứu được những dự án chỉ có vài trăm ảnh.',
    },
    parsons: {
      prompt:
        'Xếp đúng logic chọn chiến lược: nếu freeze thì chỉ head được học, ngược lại học tất cả, rồi in hai con số.',
      lines: [
        'if chien_luoc == "freeze":',
        '    cap_nhat = head',
        '    dong_bang = backbone',
        'else:',
        '    cap_nhat = backbone + head',
        '    dong_bang = 0',
        'print(f"Tham so cap nhat: {cap_nhat}")',
        'print(f"Tham so dong bang: {dong_bang}")',
      ],
    },
    make: {
      prompt:
        'Viết máy tính "chi phí huấn luyện" của một quyết định transfer learning.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: số tham số của BACKBONE (số nguyên).\n- Dòng 2: số tham số của HEAD (số nguyên).\n- Dòng 3: chiến lược, đúng một trong hai chuỗi: "freeze" hoặc "finetune".\n\nLuật:\n- "freeze" → cập nhật CHỈ head, đóng băng toàn bộ backbone.\n- "finetune" → cập nhật cả backbone lẫn head, đóng băng 0.\n\nIn ĐÚNG 2 dòng:\nTham so cap nhat: <số>\nTham so dong bang: <số>',
      starterCode: `backbone = int(input("Tham so backbone: "))\nhead = int(input("Tham so head: "))\nchien_luoc = input("Chien luoc: ").strip()\n# freeze -> chi head duoc cap nhat; finetune -> tat ca. In 2 dong.\n`,
      testCases: [
        {
          stdinLines: ['23500000', '2570', 'freeze'],
          expected: 'Tham so cap nhat: 2570\nTham so dong bang: 23500000',
          match: 'contains',
          hidden: false,
          label: 'ResNet-50 đóng băng: chỉ 2.570 tham số phải học lại',
        },
        {
          stdinLines: ['23500000', '2570', 'finetune'],
          expected: 'Tham so cap nhat: 23502570\nTham so dong bang: 0',
          match: 'contains',
          hidden: false,
          label: 'Fine-tune toàn mạng: mọi tham số đều được cập nhật',
        },
        {
          stdinLines: ['0', '10', 'freeze'],
          expected: 'Tham so cap nhat: 10\nTham so dong bang: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không có backbone (mạng tự dựng) → freeze cũng chẳng khoá được gì',
        },
      ],
      hints: [
        'Đọc hai dòng đầu bằng int(input(...)); dòng thứ ba là chuỗi, nhớ .strip() để bỏ khoảng trắng thừa.',
        'Nhánh if chien_luoc == "freeze" đặt cap_nhat = head và dong_bang = backbone; nhánh else đảo lại.',
        'In đúng hai dòng theo mẫu: print(f"Tham so cap nhat: {cap_nhat}") và print(f"Tham so dong bang: {dong_bang}").',
      ],
      sampleSolution: `backbone = int(input("Tham so backbone: "))\nhead = int(input("Tham so head: "))\nchien_luoc = input("Chien luoc: ").strip()\nif chien_luoc == "freeze":\n    cap_nhat = head\n    dong_bang = backbone\nelse:\n    cap_nhat = backbone + head\n    dong_bang = 0\nprint(f"Tham so cap nhat: {cap_nhat}")\nprint(f"Tham so dong bang: {dong_bang}")`,
    },
    homework:
      'Cho bốn tình huống thật, chọn chiến lược (đóng băng / fine-tune / huấn luyện từ đầu) và viết một câu lý do cho mỗi cái: (1) 200 ảnh chó–mèo tự chụp; (2) 50.000 ảnh chụp X-quang phổi; (3) 800 ảnh lá cây bệnh chụp bằng điện thoại; (4) 3.000 ảnh vệ tinh đa phổ 12 kênh. Gợi ý: hai trục quyết định là LƯỢNG DỮ LIỆU và ĐỘ GẦN của miền ảnh so với ImageNet — tình huống 4 có một chi tiết khiến backbone ImageNet gần như không dùng lại được, tìm ra nó.',
    srsCards: [
      {
        hoi: 'Transfer learning là gì và vì sao nó chạy được?',
        dap: 'Lấy mô hình đã huấn luyện trên tập lớn rồi tái dùng cho bài toán của mình. Chạy được vì các lớp ĐẦU của CNN học đặc trưng rất chung (cạnh, góc, hoa văn) dùng lại được cho hầu như mọi bài toán ảnh; chỉ lớp cuối mới chuyên biệt cho dữ liệu gốc.',
      },
      {
        hoi: 'Khi nào đóng băng backbone, khi nào fine-tune toàn mạng?',
        dap: 'Dữ liệu ÍT + miền ảnh GIỐNG dữ liệu gốc → đóng băng, chỉ học head (nhanh, ít overfit). Dữ liệu NHIỀU hoặc miền KHÁC XA (ảnh y tế, vệ tinh) → fine-tune toàn mạng với learning rate nhỏ hơn nhiều lần để không đập nát kiến thức cũ.',
      },
      {
        hoi: '"Đóng băng" một tham số trong PyTorch nghĩa là gì về mặt kỹ thuật?',
        dap: 'Đặt requires_grad = False: lan truyền ngược vẫn đi qua tham số đó nếu cần tính gradient cho lớp trước, nhưng bộ tối ưu KHÔNG cập nhật giá trị của nó nữa.',
      },
    ],
  },
  {
    id: 'cv1-u3-l3',
    unitId: 'cv1-u3',
    language: 'python',
    title: 'Confusion matrix trên ảnh — sai ở đâu thì nhìn thẳng vào đó',
    hook: 'Mô hình phân loại ảnh X-quang đạt accuracy 97%. Nghe tuyệt vời, cho tới khi bạn mở bảng nhầm lẫn ra và thấy: nó bỏ sót 8 trên 10 ca bệnh thật, vì 97% kia đến từ việc đoán "khoẻ mạnh" cho gần như tất cả. Một con số accuracy không bao giờ đủ để ký duyệt triển khai.',
    theory:
      'CONFUSION MATRIX (ma trận nhầm lẫn) tách accuracy thành BỐN ô, với một lớp được chọn làm lớp DƯƠNG (positive — thường là cái ta muốn phát hiện):\n- TP (true positive) — đoán dương, thật sự dương. Bắt đúng.\n- FP (false positive) — đoán dương, thật ra âm. Báo động giả.\n- FN (false negative) — đoán âm, thật ra dương. BỎ SÓT.\n- TN (true negative) — đoán âm, thật sự âm. Bỏ qua đúng.\n\nHai thước đo rút ra từ đó:\n  PRECISION = TP / (TP + FP) — "trong những ca tôi HÔ dương, bao nhiêu phần đúng?"\n  RECALL    = TP / (TP + FN) — "trong những ca THẬT SỰ dương, tôi bắt được bao nhiêu phần?"\n\nHai con số này ĐÁNH ĐỔI nhau. Hạ ngưỡng quyết định thì hô dương nhiều hơn: recall tăng, precision giảm. Nâng ngưỡng thì ngược lại. Chọn điểm cân bằng là quyết định NGHIỆP VỤ dựa trên hậu quả của từng loại sai:\n- Sàng lọc ung thư: bỏ sót (FN) là chết người, báo động giả chỉ tốn một lần xét nghiệm lại → ưu tiên RECALL.\n- Lọc thư rác: bỏ sót một thư rác chỉ khó chịu, nhưng đánh nhầm thư quan trọng vào hộp rác (FP) là mất việc → ưu tiên PRECISION.\nF1 = trung bình điều hoà của hai cái, dùng khi không có lý do nghiêng bên nào.\n\nCA BIÊN PHẢI XỬ LÝ: mẫu số có thể bằng 0. Mô hình không hô dương lần nào thì TP + FP = 0 và precision KHÔNG XÁC ĐỊNH (chia cho 0). Quy ước phổ biến (và của bài này) là in 0.00 thay vì để chương trình sập. Thư viện sklearn cũng làm vậy và in cảnh báo.\n\nVỚI ẢNH còn một bước nữa mà bảng số không thay được: MỞ RA XEM những ảnh bị phân loại sai. Rất thường xuyên bạn sẽ phát hiện nhãn gốc sai, ảnh mờ, hoặc cả một nhóm ảnh chụp cùng điều kiện bị sai hết — thứ mà không con số tổng hợp nào chỉ ra được. Với bài toán nhiều lớp, ma trận nhầm lẫn đầy đủ (n x n) cho biết mô hình hay lẫn CẶP lớp nào với nhau: chữ số 4 với 9, chó Husky với sói.',
    workedExample: {
      code: `# Confusion matrix voi lop DUONG la "cho"
du_doan = ["cho", "cho", "meo", "meo"]
thuc_te = ["cho", "meo", "cho", "meo"]

TP = FP = FN = TN = 0
for i in range(len(thuc_te)):
    if du_doan[i] == "cho" and thuc_te[i] == "cho":
        TP += 1          # bat dung
    elif du_doan[i] == "cho" and thuc_te[i] != "cho":
        FP += 1          # bao dong gia
    elif du_doan[i] != "cho" and thuc_te[i] == "cho":
        FN += 1          # BO SOT
    else:
        TN += 1          # bo qua dung

print(f"TP: {TP}")
print(f"FP: {FP}")
print(f"FN: {FN}")
print(f"TN: {TN}")

# Chia cho 0 khi mo hinh khong ho duong lan nao -> quy uoc 0.00
precision = TP / (TP + FP) if (TP + FP) > 0 else 0.0
recall = TP / (TP + FN) if (TP + FN) > 0 else 0.0
print(f"Precision: {precision:.2f}")
print(f"Recall: {recall:.2f}")`,
      stdinLines: [],
    },
    predict: {
      code: `TP = 8\nFP = 2\nFN = 40\nprint(f"{TP / (TP + FP):.2f} {TP / (TP + FN):.2f}")`,
      question: 'Mô hình sàng lọc bệnh: precision và recall in ra lần lượt là bao nhiêu?',
      choices: ['0.80 0.17', '0.17 0.80', '0.80 0.80', '0.20 0.83'],
      answerIndex: 0,
      explain:
        'Precision = 8/10 = 0.80 (hô dương khá chuẩn), recall = 8/48 = 0.17 (bỏ sót 40 trên 48 ca bệnh thật!). Với sàng lọc bệnh đây là mô hình HỎNG dù precision đẹp — bỏ sót mới là loại sai chết người. Luôn đọc CẢ HAI con số.',
    },
    parsons: {
      prompt: 'Xếp đúng vòng đếm bốn ô: bắt đúng → báo động giả → bỏ sót → bỏ qua đúng.',
      lines: [
        'for i in range(len(thuc_te)):',
        '    if du_doan[i] == duong and thuc_te[i] == duong:',
        '        TP += 1',
        '    elif du_doan[i] == duong and thuc_te[i] != duong:',
        '        FP += 1',
        '    elif du_doan[i] != duong and thuc_te[i] == duong:',
        '        FN += 1',
        '    else:',
        '        TN += 1',
      ],
    },
    make: {
      prompt:
        'Viết máy dựng confusion matrix cho bộ phân loại ảnh hai lớp. Lớp DƯƠNG cố định là "cho".\n\nChương trình đọc 2 dòng input():\n- Dòng 1: các nhãn mô hình ĐOÁN, cách nhau dấu phẩy (vd "cho,cho,meo,meo").\n- Dòng 2: các nhãn THẬT, cùng độ dài.\n\nIn ĐÚNG 6 dòng:\nTP: <số>\nFP: <số>\nFN: <số>\nTN: <số>\nPrecision: <TP/(TP+FP) với 2 chữ số thập phân>\nRecall: <TP/(TP+FN) với 2 chữ số thập phân>\n\nQUY ƯỚC BẮT BUỘC: nếu mẫu số bằng 0 thì in 0.00 (không được để chương trình sập).',
      starterCode: `du_doan = input("Du doan: ").split(",")\nthuc_te = input("Thuc te: ").split(",")\nduong = "cho"\n# Dem TP, FP, FN, TN roi tinh precision/recall (mau so 0 thi in 0.00)\n`,
      testCases: [
        {
          stdinLines: ['cho,cho,meo,meo', 'cho,meo,cho,meo'],
          expected: 'TP: 1\nFP: 1\nFN: 1\nTN: 1\nPrecision: 0.50\nRecall: 0.50',
          match: 'contains',
          hidden: false,
          label: 'Mỗi ô đúng một ca → precision và recall đều 0.50',
        },
        {
          stdinLines: ['cho,cho,cho,cho', 'cho,cho,meo,meo'],
          expected: 'TP: 2\nFP: 2\nFN: 0\nTN: 0\nPrecision: 0.50\nRecall: 1.00',
          match: 'contains',
          hidden: false,
          label: 'Mô hình hô "cho" tuốt: recall hoàn hảo nhưng precision chỉ 0.50',
        },
        {
          stdinLines: ['meo,meo,meo', 'meo,meo,meo'],
          expected: 'TP: 0\nFP: 0\nFN: 0\nTN: 3\nPrecision: 0.00\nRecall: 0.00',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không hô dương lần nào → CẢ HAI mẫu số bằng 0, phải in 0.00',
        },
      ],
      hints: [
        'Bốn biến đếm khởi tạo 0, rồi một vòng for i qua các vị trí; dùng chuỗi if/elif/elif/else đúng thứ tự như ví dụ mẫu.',
        'So sánh với biến duong = "cho" chứ đừng gõ chuỗi rải rác — dễ sai chính tả mà không phát hiện.',
        'Chống chia 0 bằng biểu thức điều kiện: precision = TP / (TP + FP) if (TP + FP) > 0 else 0.0. In với f"{precision:.2f}".',
      ],
      sampleSolution: `du_doan = input("Du doan: ").split(",")\nthuc_te = input("Thuc te: ").split(",")\nduong = "cho"\nTP = 0\nFP = 0\nFN = 0\nTN = 0\nfor i in range(len(thuc_te)):\n    if du_doan[i] == duong and thuc_te[i] == duong:\n        TP += 1\n    elif du_doan[i] == duong and thuc_te[i] != duong:\n        FP += 1\n    elif du_doan[i] != duong and thuc_te[i] == duong:\n        FN += 1\n    else:\n        TN += 1\nprint(f"TP: {TP}")\nprint(f"FP: {FP}")\nprint(f"FN: {FN}")\nprint(f"TN: {TN}")\nprecision = TP / (TP + FP) if (TP + FP) > 0 else 0.0\nrecall = TP / (TP + FN) if (TP + FN) > 0 else 0.0\nprint(f"Precision: {precision:.2f}")\nprint(f"Recall: {recall:.2f}")`,
    },
    homework:
      'Tính accuracy cho ca ẩn của bài Make (mô hình chỉ đoán "meo", dữ liệu toàn "meo") — bạn sẽ được 100%, một con số vô nghĩa. Sau đó dựng một bộ dữ liệu 100 ca với 3 ca dương, cho mô hình đoán âm hết, rồi tính cả ba thước đo. Viết 4 câu trả lời: với bài toán phát hiện lỗi sản phẩm trên dây chuyền (3% hàng lỗi), bạn báo cáo cho sếp con số nào, và nếu chỉ được chọn tối ưu MỘT trong precision/recall thì bạn chọn cái nào, vì sao?',
    srsCards: [
      {
        hoi: 'Bốn ô của confusion matrix là gì?',
        dap: 'TP (đoán dương, thật dương — bắt đúng) · FP (đoán dương, thật âm — báo động giả) · FN (đoán âm, thật dương — BỎ SÓT) · TN (đoán âm, thật âm — bỏ qua đúng). Lớp "dương" là cái ta muốn phát hiện.',
      },
      {
        hoi: 'Precision và recall tính thế nào, đọc bằng lời ra sao?',
        dap: 'Precision = TP/(TP+FP): "trong những ca tôi HÔ dương, bao nhiêu phần đúng". Recall = TP/(TP+FN): "trong những ca THẬT SỰ dương, tôi bắt được bao nhiêu phần". Hạ ngưỡng thì recall tăng còn precision giảm, và ngược lại.',
      },
      {
        hoi: 'Khi nào ưu tiên recall, khi nào ưu tiên precision?',
        dap: 'Ưu tiên recall khi BỎ SÓT đắt hơn báo động giả (sàng lọc ung thư, phát hiện gian lận). Ưu tiên precision khi BÁO ĐỘNG GIẢ đắt hơn (lọc thư rác — đánh nhầm thư quan trọng vào hộp rác). Không nghiêng bên nào thì dùng F1.',
      },
    ],
  },
  {
    id: 'cv1-u3-l4',
    unitId: 'cv1-u3',
    language: 'python',
    title: 'Docker & triển khai — đóng gói mô hình để nó chạy được ở mọi máy',
    hook: '"Máy em chạy ngon mà!" — câu nói khiến vô số dự án AI chết ở bước cuối. Mô hình của bạn cần đúng phiên bản Python, đúng phiên bản thư viện, đúng file trọng số. Docker gói tất cả những thứ đó vào MỘT hộp niêm phong, và cái hộp ấy chạy y hệt trên laptop của bạn lẫn trên máy chủ khách hàng.',
    theory:
      'VẤN ĐỀ: mô hình huấn luyện xong là một file trọng số, nhưng để CHẠY nó cần cả một môi trường — phiên bản Python, danh sách thư viện đúng phiên bản, mã nguồn, file trọng số, biến môi trường. Thiếu hoặc lệch một thứ là kết quả khác hoặc sập.\n\nDOCKER đóng gói toàn bộ môi trường đó thành một IMAGE (ảnh đĩa bất biến, có thể sao chép). Chạy image lên được một CONTAINER (tiến trình cô lập). Cùng một image thì mọi máy cho kết quả như nhau — đó là toàn bộ lời hứa của Docker.\n\nDOCKERFILE là công thức xây image, đọc từ trên xuống, mỗi lệnh tạo một TẦNG (layer) được cache lại:\n  FROM python:3.11-slim          # anh nen: he dieu hanh + Python 3.11 ban gon\n  WORKDIR /app                   # thu muc lam viec ben trong container\n  COPY requirements.txt .        # chep RIENG file thu vien truoc\n  RUN pip install -r requirements.txt   # cai thu vien (tang nay duoc cache)\n  COPY . .                       # chep phan con lai cua ma nguon\n  EXPOSE 8000                    # khai bao cong dich vu lang nghe\n  CMD ["python", "api.py"]       # lenh chay khi container khoi dong\n\nMẸO THỨ TỰ quan trọng nhất: COPY requirements.txt và RUN pip install phải đứng TRƯỚC COPY . . — vì mã nguồn đổi liên tục còn danh sách thư viện thì hiếm khi đổi. Đặt đúng thứ tự thì mỗi lần sửa code chỉ xây lại tầng cuối (vài giây); đặt sai thì cài lại toàn bộ thư viện mỗi lần (nhiều phút).\n\nBA KHÁI NIỆM phân biệt cho rõ: IMAGE là bản thiết kế bất biến; CONTAINER là một lần chạy của image; VOLUME là thư mục gắn từ máy chủ vào để dữ liệu SỐNG SÓT sau khi container chết (mọi thay đổi bên trong container biến mất khi nó dừng).\n\nRIÊNG MÔ HÌNH AI có mấy lưu ý: file trọng số thường vài trăm MB nên đừng nhét vào image nếu có thể tải lúc khởi động; nạp mô hình MỘT LẦN lúc khởi động chứ không nạp mỗi request; chạy trên CPU thì image gọn hơn nhiều so với bản GPU (cần CUDA), nên chọn ảnh nền tương ứng đúng nhu cầu.\n\n--- TỔNG KẾT KHOÁ cv1 ---\nBạn đã đi từ "ảnh là ma trận số" tới một mô hình được đóng gói chạy được ở máy khác: tự cài nơ-ron, MLP, softmax/cross-entropy, kiểm gradient, convolution, pooling, đếm tham số, vòng huấn luyện, augmentation, đọc PyTorch, transfer learning, confusion matrix. Lối đi tiếp: khoá cv2 (Transformer/ViT, object detection, GAN, diffusion) hoặc khoá llmagent (LLM và AI agents).\n\nLƯU Ý VỀ BÀI LÀM HÔM NAY: Dockerfile không chạy được trong trình duyệt, nên phần được chấm là một chương trình Python MÔ PHỎNG ý tưởng đóng gói — nó dựng bản kê khai (manifest) của một "hộp niêm phong" từ các mảnh rời. Ý niệm giống hệt, chỉ khác quy mô.',
    workedExample: {
      code: `# MO PHONG y tuong dong goi: gom cac manh roi thanh MOT ban ke khai
ten = "cv-classifier"
python_ver = "3.11"
thu_vien = ["torch", "numpy", "pillow"]

# "Dong goi": nhet moi thu vao mot dict duy nhat
hop = {
    "ten": ten,
    "base": f"python:{python_ver}-slim",
    "thu_vien": sorted(set(thu_vien)),   # bo trung, sap xep cho tat dinh
}

# "Giai nen" o may khac: doc lai dung nhung gi da niem phong
print(f"Dong goi: {hop['ten']}")
print(f"Base: {hop['base']}")
print("Thu vien: " + ", ".join(hop["thu_vien"]))
print(f"So goi: {len(hop['thu_vien'])}")`,
      stdinLines: [],
    },
    predict: {
      code: `thu_vien = ["torch", "numpy", "torch"]\nprint(", ".join(sorted(set(thu_vien))))`,
      question: 'Danh sách thư viện có phần tử trùng — in ra gì?',
      choices: ['numpy, torch', 'torch, numpy, torch', 'numpy, torch, torch', 'torch, numpy'],
      answerIndex: 0,
      explain:
        'set() bỏ trùng, sorted() sắp xếp theo bảng chữ cái nên kết quả TẤT ĐỊNH: "numpy, torch". Tất định là điều Docker cũng theo đuổi: cùng công thức thì cùng kết quả, ở bất kỳ máy nào, bất kỳ lúc nào.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự các lệnh trong Dockerfile để tận dụng cache: ảnh nền → thư mục làm việc → cài thư viện trước → chép mã nguồn sau → lệnh chạy.',
      lines: [
        'FROM python:3.11-slim',
        'WORKDIR /app',
        'COPY requirements.txt .',
        'RUN pip install -r requirements.txt',
        'COPY . .',
        'EXPOSE 8000',
        'CMD ["python", "api.py"]',
      ],
    },
    make: {
      prompt:
        'Dockerfile không chạy được trong trình duyệt, nên hôm nay bạn viết chương trình Python MÔ PHỎNG việc đóng gói: gom các mảnh rời thành một bản kê khai tất định (đúng ý niệm của một image).\n\nChương trình đọc 3 dòng input():\n- Dòng 1: tên mô hình.\n- Dòng 2: phiên bản Python (vd "3.11").\n- Dòng 3: danh sách thư viện, cách nhau dấu phẩy (CÓ THỂ TRÙNG NHAU).\n\nGom vào một dict rồi in lại ĐÚNG 4 dòng:\nDong goi: <tên>\nBase: python:<phiên bản>-slim\nThu vien: <danh sách đã BỎ TRÙNG và SẮP XẾP tăng dần, nối bằng ", ">\nSo goi: <số thư viện sau khi bỏ trùng>\n\nVí dụ "cv-classifier" / "3.11" / "torch,numpy,pillow" → "Thu vien: numpy, pillow, torch" và "So goi: 3".',
      starterCode: `ten = input("Ten mo hinh: ").strip()\npython_ver = input("Phien ban Python: ").strip()\nthu_vien = [v.strip() for v in input("Thu vien: ").split(",")]\n# Dong goi vao mot dict (bo trung + sap xep), roi in 4 dong ban ke khai\n`,
      testCases: [
        {
          stdinLines: ['cv-classifier', '3.11', 'torch,numpy,pillow'],
          expected:
            'Dong goi: cv-classifier\nBase: python:3.11-slim\nThu vien: numpy, pillow, torch\nSo goi: 3',
          match: 'contains',
          hidden: false,
          label: 'Ba thư viện khác nhau → sắp xếp theo bảng chữ cái',
        },
        {
          stdinLines: ['detector', '3.10', 'flask'],
          expected: 'Base: python:3.10-slim\nThu vien: flask\nSo goi: 1',
          match: 'contains',
          hidden: false,
          label: 'Một thư viện duy nhất, ảnh nền Python 3.10',
        },
        {
          stdinLines: ['api', '3.12', 'numpy,numpy,torch'],
          expected: 'Thu vien: numpy, torch\nSo goi: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: thư viện khai trùng — bản kê khai phải bỏ trùng, đếm 2',
        },
      ],
      hints: [
        'Bỏ trùng và sắp xếp trong MỘT bước: sorted(set(thu_vien)) — set bỏ trùng, sorted cho thứ tự tất định.',
        'Dòng Base ghép bằng f-string đúng mẫu: f"Base: python:{python_ver}-slim".',
        'Nối danh sách bằng ", ".join(danh_sach) (dấu phẩy VÀ một dấu cách); số gói là len(danh_sach) sau khi đã bỏ trùng.',
      ],
      sampleSolution: `ten = input("Ten mo hinh: ").strip()\npython_ver = input("Phien ban Python: ").strip()\nthu_vien = [v.strip() for v in input("Thu vien: ").split(",")]\nhop = {\n    "ten": ten,\n    "base": f"python:{python_ver}-slim",\n    "thu_vien": sorted(set(thu_vien)),\n}\nprint(f"Dong goi: {hop['ten']}")\nprint(f"Base: {hop['base']}")\nprint("Thu vien: " + ", ".join(hop["thu_vien"]))\nprint(f"So goi: {len(hop['thu_vien'])}")`,
    },
    homework:
      'Viết ra giấy Dockerfile đầy đủ cho một API dự đoán ảnh của chính bạn: ảnh nền python:3.11-slim, cài từ requirements.txt, chép mã nguồn, mở cổng 8000, chạy api.py. Sau đó trả lời ba câu: (1) nếu bạn đảo COPY . . lên TRƯỚC RUN pip install thì mỗi lần sửa một dòng code sẽ tốn thêm bao lâu, vì sao; (2) file trọng số 400 MB nên nằm trong image hay tải lúc khởi động, đánh đổi là gì; (3) mô hình nên được nạp ở đâu trong code — lúc khởi động hay trong mỗi request? Cuối cùng, chọn bước tiếp theo của bạn: khoá cv2 (Transformer, ViT, object detection, GAN, diffusion) hay khoá llmagent (LLM và AI agents) — và viết một câu vì sao.',
    srsCards: [
      {
        hoi: 'Docker giải quyết vấn đề gì cho việc triển khai mô hình AI?',
        dap: 'Đóng gói TOÀN BỘ môi trường (phiên bản Python, thư viện đúng phiên bản, mã nguồn, trọng số) vào một image bất biến, nên cùng một image chạy y hệt trên laptop lẫn máy chủ — hết cảnh "máy em chạy ngon mà".',
      },
      {
        hoi: 'Vì sao COPY requirements.txt + RUN pip install phải đứng TRƯỚC COPY . . trong Dockerfile?',
        dap: 'Mỗi lệnh tạo một tầng được cache. Mã nguồn đổi liên tục còn danh sách thư viện hiếm khi đổi; đặt đúng thứ tự thì sửa code chỉ xây lại tầng cuối (vài giây), đặt sai thì cài lại toàn bộ thư viện mỗi lần (nhiều phút).',
      },
      {
        hoi: 'Phân biệt image, container và volume.',
        dap: 'Image = bản thiết kế bất biến, sao chép được. Container = một lần chạy của image (tiến trình cô lập; mọi thay đổi bên trong mất khi nó dừng). Volume = thư mục gắn từ máy chủ vào để dữ liệu sống sót qua các lần chạy.',
      },
    ],
  },
]

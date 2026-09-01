# Đặc tả kín: 14 bài học khoá ngắn `cv1` — "Deep Learning for Computer Vision cơ bản"

> Ngày 2026-09-01. Đặc tả CON của `docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` (§03d,
> khoá 04 của cụm "Kỹ sư AI thực chiến"). Đây là đặc tả **kín**: mọi nội dung bài đã viết sẵn
> dạng object literal `ProgrammingLesson` — người thi hành CHỈ chép vào
> `packages/subject-programming/lessons/cv1u1.ts` · `cv1u2.ts` · `cv1u3.ts`, không tự sáng tác.

## 0. Tóm tắt

- Khoá `cv1`, **14 bài**, 3 giai đoạn (3 unit ảo của tầng khoá ngắn):
  - **GĐ1 `cv1-u1` — Nơ-ron & mạng MLP** (5 bài): ảnh = ma trận số · nơ-ron nhân tạo ·
    forward pass MLP · softmax + cross-entropy · lan truyền ngược mức trực giác.
  - **GĐ2 `cv1-u2` — CNN** (5 bài): convolution 2D tự cài · padding/stride/pooling · kiến
    trúc CNN & đếm tham số · vòng huấn luyện đầy đủ · augmentation & overfit.
  - **GĐ3 `cv1-u3` — PyTorch, transfer learning & Docker** (4 bài): đọc PyTorch · transfer
    learning · confusion matrix trên ảnh · Docker & triển khai + tổng kết.
- `canDo` của khoá và `prerequisites: ['Khoá Machine Learning & Data Science (mlds)']` —
  lấy nguyên văn từ đặc tả cụm §03d.

## 1. Luật soạn đã áp cho cả 14 bài (kiểm lại khi review PR)

1. `language: 'python'` cho **mọi** bài. Bài "đọc PyTorch" (`cv1-u3-l1`) chỉ nhắc code
   `nn.Module` trong `theory`/`hook` dạng chữ — **không** đưa vào `workedExample.code` /
   `make.sampleSolution`, vì Pyodide và CI không cài được PyTorch.
2. Mọi `print()` là **tiếng Việt KHÔNG DẤU**.
3. `id` = `cv1-u<gđ>-l<số>`, `unitId` = `cv1-u<gđ>`.
4. Ảnh luôn là ma trận **≤ 8×8**: nhúng sẵn trong `starterCode`, hoặc đọc qua `input()` dạng
   chuỗi phẳng cách nhau dấu phẩy rồi reshape thủ công — định dạng ghi rõ trong `make.prompt`.
5. Ma trận in ra: **mỗi hàng một dòng, các số cách nhau MỘT dấu cách**.
6. Số thực trong output so khớp dùng `f"{x:.4f}"` / `:.2f` (định dạng cố định) chứ không
   `round()` — tránh `0.09` vs `0.0900`.
7. Mỗi bài 3–4 `testCases`, **≥ 1 ca ẩn (`hidden: true`) là ca biên**.
8. Mọi `sampleSolution` đã được suy luận tay qua từng test-case (bảng kiểm ở §3 cuối file).

---

## 2. GIAI ĐOẠN 1 — `cv1-u1` · Nơ-ron & mạng MLP (5 bài)

### Bài 1 — `cv1-u1-l1` · Ảnh là ma trận số

```typescript
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
    prompt: 'Xếp đúng thứ tự: cắt dãy phẳng thành hàng → duyệt từng hàng → đổi số thành ký tự → in dòng.',
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
}
```

### Bài 2 — `cv1-u1-l2` · Nơ-ron nhân tạo

```typescript
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
    prompt: 'Xếp đúng thứ tự tính một nơ-ron: khởi tạo tổng → cộng dồn tích x*w → cộng bias → kích hoạt.',
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
}
```

### Bài 3 — `cv1-u1-l3` · Forward pass của MLP

```typescript
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
    prompt: 'Xếp đúng forward pass 2 lớp: tính từng nơ-ron ẩn (tổng có trọng số + ReLU) rồi gộp ở lớp ra.',
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
}
```

### Bài 4 — `cv1-u1-l4` · Softmax & cross-entropy

```typescript
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
    prompt: 'Xếp đúng thứ tự softmax rồi cross-entropy: lấy mũ → cộng tổng → chia → lấy -log của lớp đúng.',
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
}
```

### Bài 5 — `cv1-u1-l5` · Lan truyền ngược mức trực giác

```typescript
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
    prompt: 'Xếp đúng phép kiểm gradient: định nghĩa hàm mất mát → tính giải tích → tính sai phân trung tâm → so lệch.',
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
}
```

---

## 3. GIAI ĐOẠN 2 — `cv1-u2` · CNN (5 bài)

### Bài 1 — `cv1-u2-l1` · Convolution 2D tự cài

```typescript
{
  id: 'cv1-u2-l1',
  unitId: 'cv1-u2',
  language: 'python',
  title: 'Convolution 2D — tự cài bộ dò cạnh',
  hook: 'Nếu duỗi ảnh 8x8 thành 64 số rồi ném vào MLP, mạng mất sạch thông tin "ô này nằm cạnh ô kia". Convolution giữ lại điều đó: nó trượt một khuôn nhỏ (kernel) khắp ảnh, mỗi lần chỉ nhìn một mẩu 3x3. Chạy đúng một kernel dò cạnh lên ảnh, bạn sẽ thấy đường viền hiện ra như phép thuật.',
  theory:
    'CONVOLUTION 2D (tích chập) = trượt một KERNEL (bộ lọc, ma trận nhỏ thường 3x3) khắp ảnh; ở mỗi vị trí, nhân từng ô kernel với ô ảnh tương ứng rồi cộng tất cả lại thành MỘT số của ma trận kết quả (gọi là FEATURE MAP — bản đồ đặc trưng).\n\nCông thức tại vị trí (i, j) với kernel 3x3:\n  out[i][j] = tổng_{u=0..2} tổng_{v=0..2} anh[i+u][j+v] * kernel[u][v]\n\nKÍCH THƯỚC đầu ra (chưa padding, bước nhảy 1): ảnh N x N với kernel K x K cho ra (N-K+1) x (N-K+1). Ảnh 5x5 với kernel 3x3 → 3x3. Ảnh bị "co lại" ở viền vì kernel không trượt ra ngoài mép được — bài sau chữa bằng padding.\n\nKERNEL DÒ CẠNH DỌC dùng trong bài này:\n  [[-1, 0, 1],\n   [-1, 0, 1],\n   [-1, 0, 1]]\nĐọc nó bằng lời: "lấy tổng cột phải TRỪ tổng cột trái". Vùng ảnh đồng màu → hai bên bằng nhau → kết quả 0. Vùng có cạnh tối-sang → chênh lệch lớn → kết quả dương to. Cạnh sáng-tối → âm to. Vậy dấu cho biết CHIỀU của cạnh, độ lớn cho biết cạnh MẠNH tới đâu.\n\nBA TÍNH CHẤT khiến convolution thống trị thị giác máy tính:\n1. CỤC BỘ — mỗi đầu ra chỉ phụ thuộc một mẩu ảnh nhỏ, đúng với thực tế "cạnh là hiện tượng địa phương".\n2. CHIA SẺ TRỌNG SỐ — cùng một kernel dùng cho mọi vị trí, nên số tham số bé tí và mẫu học được ở góc trên áp dụng luôn cho góc dưới.\n3. BẤT BIẾN TỊNH TIẾN — vật dịch sang phải thì bản đồ đặc trưng cũng dịch sang phải, mạng không phải học lại từ đầu.\n\nTrong CNN thật, kernel KHÔNG do người viết ra — chúng là trọng số được HỌC bằng gradient descent. Điều thú vị đã được kiểm chứng nhiều lần: lớp đầu tiên của mạng học ảnh, sau khi huấn luyện, gần như luôn tự mọc ra các kernel dò cạnh giống hệt cái bạn gõ tay hôm nay.',
  workedExample: {
    code: `# Convolution 2D: kernel do canh doc truot tren anh 5x5
anh = [[0, 0, 9, 9, 9],
       [0, 0, 9, 9, 9],
       [0, 0, 9, 9, 9],
       [0, 0, 9, 9, 9],
       [0, 0, 9, 9, 9]]

kernel = [[-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 1]]      # cot phai TRU cot trai

N = 5
K = 3
kich_thuoc_ra = N - K + 1   # 5 - 3 + 1 = 3

for i in range(kich_thuoc_ra):
    hang_ra = []
    for j in range(kich_thuoc_ra):
        tong = 0
        for u in range(K):
            for v in range(K):
                tong += anh[i + u][j + v] * kernel[u][v]
        hang_ra.append(tong)
    # in mot hang: cac so cach nhau MOT dau cach
    print(" ".join(str(v) for v in hang_ra))`,
    stdinLines: [],
  },
  predict: {
    code: `manh = [[5, 5, 5],\n        [5, 5, 5],\n        [5, 5, 5]]\nkernel = [[-1, 0, 1],\n          [-1, 0, 1],\n          [-1, 0, 1]]\ntong = 0\nfor u in range(3):\n    for v in range(3):\n        tong += manh[u][v] * kernel[u][v]\nprint(tong)`,
    question: 'Kernel dò cạnh chạy trên một mẩu ảnh ĐỒNG MÀU — in ra gì?',
    choices: ['0', '45', '15', '-15'],
    answerIndex: 0,
    explain:
      'Cột phải (5+5+5 = 15) trừ cột trái (15) = 0; cột giữa nhân 0 nên không đóng góp. Vùng phẳng cho 0 chính là điều ta muốn: bộ dò cạnh chỉ "kêu" ở chỗ có cạnh, im lặng ở chỗ đồng màu.',
  },
  parsons: {
    prompt: 'Xếp đúng bốn vòng lặp lồng nhau của convolution: vị trí (i, j) ở ngoài, ô kernel (u, v) ở trong.',
    lines: [
      'for i in range(N - K + 1):',
      '    hang_ra = []',
      '    for j in range(N - K + 1):',
      '        tong = 0',
      '        for u in range(K):',
      '            for v in range(K):',
      '                tong += anh[i + u][j + v] * kernel[u][v]',
      '        hang_ra.append(tong)',
      '    print(" ".join(str(v) for v in hang_ra))',
    ],
  },
  make: {
    prompt:
      'Tự cài convolution 2D với kernel dò cạnh dọc CỐ ĐỊNH:\n  [[-1, 0, 1],\n   [-1, 0, 1],\n   [-1, 0, 1]]\n\nChương trình đọc MỘT dòng input(): 25 số nguyên cách nhau dấu phẩy — ảnh 5x5 lưu phẳng theo từng hàng (5 số đầu là hàng 0).\n\nTrượt kernel với bước nhảy 1, không padding → bản đồ đặc trưng 3x3. In ĐÚNG 3 dòng, mỗi dòng 3 số nguyên cách nhau MỘT dấu cách.\n\nVí dụ ảnh "0,0,9,9,9" lặp 5 hàng → mỗi dòng kết quả là "27 27 0".',
    starterCode: `phang = [int(v) for v in input("Anh 5x5 phang: ").split(",")]\nanh = [phang[i * 5:(i + 1) * 5] for i in range(5)]\nkernel = [[-1, 0, 1],\n          [-1, 0, 1],\n          [-1, 0, 1]]\n# Truot kernel: 3x3 vi tri, moi vi tri cong don 9 tich. In moi hang mot dong.\n`,
    testCases: [
      {
        stdinLines: ['0,0,9,9,9,0,0,9,9,9,0,0,9,9,9,0,0,9,9,9,0,0,9,9,9'],
        expected: '27 27 0\n27 27 0\n27 27 0',
        match: 'contains',
        hidden: false,
        label: 'Cạnh tối→sáng ở cột 1–2 → hai cột trái dương, cột phải phẳng nên 0',
      },
      {
        stdinLines: ['5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5'],
        expected: '0 0 0\n0 0 0\n0 0 0',
        match: 'contains',
        hidden: false,
        label: 'Ảnh đồng màu → không có cạnh nào → toàn 0',
      },
      {
        stdinLines: ['9,9,9,0,0,9,9,9,0,0,9,9,9,0,0,9,9,9,0,0,9,9,9,0,0'],
        expected: '0 -27 -27\n0 -27 -27\n0 -27 -27',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: cạnh SÁNG→TỐI cho giá trị ÂM — dấu cho biết chiều cạnh',
      },
    ],
    hints: [
      'Ảnh đã được reshape sẵn trong starter code: anh[i][j] là ô hàng i cột j.',
      'Bốn vòng lặp lồng: i và j chạy range(3) (vị trí kernel), u và v chạy range(3) (ô trong kernel). Cộng dồn anh[i+u][j+v] * kernel[u][v].',
      'In một hàng bằng " ".join(str(v) for v in hang_ra) — nhớ đưa hang_ra về rỗng ở đầu mỗi hàng i.',
    ],
    sampleSolution: `phang = [int(v) for v in input("Anh 5x5 phang: ").split(",")]\nanh = [phang[i * 5:(i + 1) * 5] for i in range(5)]\nkernel = [[-1, 0, 1],\n          [-1, 0, 1],\n          [-1, 0, 1]]\nfor i in range(3):\n    hang_ra = []\n    for j in range(3):\n        tong = 0\n        for u in range(3):\n            for v in range(3):\n                tong += anh[i + u][j + v] * kernel[u][v]\n        hang_ra.append(tong)\n    print(" ".join(str(v) for v in hang_ra))`,
  },
  homework:
    'Đổi kernel thành bộ dò cạnh NGANG: [[-1,-1,-1], [0,0,0], [1,1,1]] (hàng dưới trừ hàng trên). Chạy lại trên cả ba ảnh của bài Make và giải thích vì sao ảnh có cạnh DỌC giờ cho kết quả toàn 0. Sau đó thử kernel làm MỜ: [[1,1,1],[1,1,1],[1,1,1]] chia 9 — kết quả nói lên điều gì về vai trò của dấu trong kernel?',
  srsCards: [
    {
      hoi: 'Convolution 2D tính một ô đầu ra như thế nào?',
      dap: 'Đặt kernel lên một mẩu ảnh cùng kích thước, nhân từng ô tương ứng rồi cộng tất cả: out[i][j] = Σ_u Σ_v anh[i+u][j+v] · kernel[u][v]. Trượt khắp ảnh được bản đồ đặc trưng (feature map).',
    },
    {
      hoi: 'Ảnh N×N qua kernel K×K (bước 1, không padding) cho đầu ra kích thước bao nhiêu?',
      dap: '(N−K+1) × (N−K+1). Ảnh co lại ở viền vì kernel không trượt ra ngoài mép được — chữa bằng padding (thêm viền 0).',
    },
    {
      hoi: 'Ba tính chất khiến convolution hợp với ảnh là gì?',
      dap: 'Cục bộ (mỗi đầu ra chỉ nhìn một mẩu nhỏ) · chia sẻ trọng số (một kernel cho mọi vị trí → ít tham số, mẫu học ở góc này dùng được cho góc kia) · bất biến tịnh tiến (vật dịch đi thì đặc trưng dịch theo).',
    },
  ],
}
```

### Bài 2 — `cv1-u2-l2` · Padding, stride & pooling

```typescript
{
  id: 'cv1-u2-l2',
  unitId: 'cv1-u2',
  language: 'python',
  title: 'Padding, stride & pooling — điều khiển kích thước bản đồ đặc trưng',
  hook: 'Mỗi lớp convolution ăn mất 2 hàng 2 cột ở viền. Chồng 10 lớp là ảnh 32x32 teo còn 12x12, mà toàn bộ thông tin ở mép thì bị nhìn ít hơn hẳn phần giữa. Ba nút vặn — padding, stride, pooling — cho bạn quyết định ảnh co lại bao nhiêu và co ở đâu.',
  theory:
    'PADDING (đệm viền) = thêm viền số 0 quanh ảnh trước khi tích chập. Với kernel 3x3, đệm 1 viền giữ nguyên kích thước đầu ra (gọi là "same padding"); không đệm gọi là "valid padding". Ngoài giữ kích thước, padding còn chữa được chuyện điểm ảnh ở mép bị kernel ghé thăm ít hơn điểm ở giữa.\n\nSTRIDE (bước nhảy) = kernel trượt mấy ô một lần. Stride 1 trượt sát; stride 2 nhảy cách ô, đầu ra nhỏ đi khoảng một nửa mỗi chiều. Công thức chung:\n  kích thước ra = (N + 2*P - K) // S + 1\nvới N cạnh ảnh, P số viền đệm, K cạnh kernel, S bước nhảy. Kiểm nhanh: N=5, P=0, K=3, S=1 → (5-3)//1 + 1 = 3, đúng bài trước.\n\nPOOLING (gộp) = thu nhỏ bản đồ đặc trưng bằng cách thay mỗi ô vuông nhỏ bằng MỘT số tóm tắt. Hai kiểu:\n- MAX POOLING lấy giá trị LỚN NHẤT trong ô. Đọc bằng lời: "trong vùng này, đặc trưng mạnh nhất mạnh bao nhiêu" — vị trí chính xác của nó không quan trọng bằng sự có mặt.\n- AVERAGE POOLING lấy trung bình — mượt hơn, ít dùng ở giữa mạng, hay dùng ở cuối (global average pooling).\n\nPooling 2x2 stride 2 là cấu hình kinh điển: chia đôi mỗi chiều, giữ nguyên số kênh. Ảnh 4x4 → 2x2. Ưu điểm: giảm tính toán, tăng vùng nhìn của lớp sau (mỗi ô sau pooling "thấy" vùng ảnh gốc rộng gấp đôi), và tạo BẤT BIẾN NHỎ với dịch chuyển — vật nhích 1 pixel thường không đổi kết quả max.\n\nĐáng chú ý: pooling KHÔNG có tham số học được — nó là phép cố định. Nhiều kiến trúc hiện đại đã bỏ pooling, thay bằng convolution stride 2 (để mạng tự học cách thu nhỏ). Biết cả hai đường là đủ cho khoá này.',
  workedExample: {
    code: `# Max pooling 2x2, buoc nhay 2: anh 4x4 -> ban do 2x2
anh = [[1,  2,  3,  4],
       [5,  6,  7,  8],
       [9,  10, 11, 12],
       [13, 14, 15, 16]]

for i in range(0, 4, 2):            # nhay 2 hang mot lan
    hang_ra = []
    for j in range(0, 4, 2):        # nhay 2 cot mot lan
        o = [anh[i][j], anh[i][j + 1],
             anh[i + 1][j], anh[i + 1][j + 1]]
        hang_ra.append(max(o))      # giu dac trung MANH NHAT
    print(" ".join(str(v) for v in hang_ra))

# Cong thuc kich thuoc ra cho convolution
N, P, K, S = 5, 0, 3, 1
print(f"Conv 5x5, kernel 3, stride 1: {(N + 2 * P - K) // S + 1}")
N, P, K, S = 5, 1, 3, 1
print(f"Them padding 1: {(N + 2 * P - K) // S + 1}")`,
    stdinLines: [],
  },
  predict: {
    code: `N, P, K, S = 8, 1, 3, 2\nprint((N + 2 * P - K) // S + 1)`,
    question: 'Ảnh 8x8, padding 1, kernel 3x3, stride 2 — cạnh đầu ra dài bao nhiêu?',
    choices: ['4', '3', '8', '6'],
    answerIndex: 0,
    explain:
      '(8 + 2 − 3) // 2 + 1 = 7 // 2 + 1 = 3 + 1 = 4. Stride 2 chia đôi kích thước, padding 1 bù lại phần hao ở viền. Thuộc công thức này là hết cảnh đoán mò khi xếp lớp trong PyTorch.',
  },
  parsons: {
    prompt: 'Xếp đúng max pooling 2x2 stride 2: nhảy 2 hàng → nhảy 2 cột → gom 4 ô → lấy max → in hàng.',
    lines: [
      'for i in range(0, N, 2):',
      '    hang_ra = []',
      '    for j in range(0, N, 2):',
      '        o = [anh[i][j], anh[i][j + 1], anh[i + 1][j], anh[i + 1][j + 1]]',
      '        hang_ra.append(max(o))',
      '    print(" ".join(str(v) for v in hang_ra))',
    ],
  },
  make: {
    prompt:
      'Tự cài MAX POOLING 2x2 với bước nhảy 2.\n\nChương trình đọc MỘT dòng input(): 16 số nguyên cách nhau dấu phẩy — bản đồ đặc trưng 4x4 lưu phẳng theo từng hàng.\n\nChia thành 4 ô vuông 2x2 không chồng nhau, mỗi ô lấy giá trị LỚN NHẤT. In ĐÚNG 2 dòng, mỗi dòng 2 số nguyên cách nhau MỘT dấu cách.\n\nVí dụ "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16" → "6 8" rồi "14 16".',
    starterCode: `phang = [int(v) for v in input("Ban do 4x4 phang: ").split(",")]\nanh = [phang[i * 4:(i + 1) * 4] for i in range(4)]\n# Lap i, j theo buoc 2. Moi o gom 4 phan tu -> lay max. In 2 dong.\n`,
    testCases: [
      {
        stdinLines: ['1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16'],
        expected: '6 8\n14 16',
        match: 'contains',
        hidden: false,
        label: 'Mỗi ô 2x2 giữ số lớn nhất ở góc dưới phải',
      },
      {
        stdinLines: ['0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'],
        expected: '0 0\n0 0',
        match: 'contains',
        hidden: false,
        label: 'Bản đồ trống → pooling vẫn cho toàn 0',
      },
      {
        stdinLines: ['0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,7'],
        expected: '9 0\n0 7',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: mỗi ô chỉ có một giá trị khác 0 — max giữ đúng nó',
      },
    ],
    hints: [
      'Nhảy hai bước: for i in range(0, 4, 2) và for j in range(0, 4, 2) — i, j là góc trên trái của mỗi ô.',
      'Bốn phần tử của ô: anh[i][j], anh[i][j+1], anh[i+1][j], anh[i+1][j+1]. Gom vào một list rồi gọi max().',
      'In mỗi hàng bằng " ".join(str(v) for v in hang_ra); nhớ tạo lại hang_ra rỗng ở đầu mỗi vòng i.',
    ],
    sampleSolution: `phang = [int(v) for v in input("Ban do 4x4 phang: ").split(",")]\nanh = [phang[i * 4:(i + 1) * 4] for i in range(4)]\nfor i in range(0, 4, 2):\n    hang_ra = []\n    for j in range(0, 4, 2):\n        o = [anh[i][j], anh[i][j + 1], anh[i + 1][j], anh[i + 1][j + 1]]\n        hang_ra.append(max(o))\n    print(" ".join(str(v) for v in hang_ra))`,
  },
  homework:
    'Sửa code thành AVERAGE POOLING (thay max(o) bằng sum(o) / 4) rồi chạy lại ca ẩn "0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,7". So hai kết quả và trả lời: nếu đặc trưng bạn đang tìm là "có một nét sáng mạnh ở đâu đó trong vùng", kiểu pooling nào giữ được tín hiệu đó, kiểu nào làm nó loãng đi? Sau đó tính bằng tay: ảnh 32x32 qua 3 lần pooling 2x2 còn bao nhiêu?',
  srsCards: [
    {
      hoi: 'Công thức kích thước đầu ra của convolution là gì?',
      dap: '(N + 2P − K) // S + 1, với N cạnh ảnh, P số viền đệm (padding), K cạnh kernel, S bước nhảy (stride). Ví dụ N=8, P=1, K=3, S=2 → (8+2−3)//2+1 = 4.',
    },
    {
      hoi: 'Padding "same" và "valid" khác nhau thế nào?',
      dap: 'Valid = không đệm, ảnh co lại còn (N−K+1). Same = đệm viền 0 (với kernel 3x3 thì đệm 1) để đầu ra GIỮ NGUYÊN kích thước; đồng thời chữa việc điểm ảnh ở mép bị kernel ghé thăm ít hơn điểm ở giữa.',
    },
    {
      hoi: 'Max pooling làm gì và được lợi gì?',
      dap: 'Thay mỗi ô vuông (thường 2x2, stride 2) bằng giá trị lớn nhất — giữ "đặc trưng mạnh nhất có mặt", bỏ vị trí chính xác. Lợi: giảm tính toán, tăng vùng nhìn của lớp sau, tạo bất biến nhỏ với dịch chuyển. Không có tham số học được.',
    },
  ],
}
```

### Bài 3 — `cv1-u2-l3` · Kiến trúc CNN & đếm tham số

```typescript
{
  id: 'cv1-u2-l3',
  unitId: 'cv1-u2',
  language: 'python',
  title: 'Kiến trúc CNN — conv → pool → conv → pool → FC và phép đếm tham số',
  hook: 'Một MLP nối đủ cho ảnh 224x224 màu cần hơn 150 triệu tham số chỉ riêng lớp đầu. Cùng công việc đó, một lớp convolution 3x3 với 64 kênh dùng 1.792 tham số. Chênh nhau gần trăm nghìn lần — và đó là toàn bộ lý do CNN tồn tại. Hôm nay bạn đếm con số đó bằng tay.',
  theory:
    'KIẾN TRÚC CNN kinh điển là một dây chuyền lặp lại:\n  [Conv → kích hoạt → Pool] x nhiều lần → làm phẳng (flatten) → [Fully-Connected] → softmax\n\nÝ tưởng xuyên suốt: đi càng sâu thì bản đồ đặc trưng càng NHỎ về không gian nhưng càng NHIỀU KÊNH. Lớp đầu học nét cạnh; lớp giữa ghép cạnh thành góc, hoa văn; lớp sâu ghép tiếp thành bộ phận vật thể (bánh xe, mắt). Cuối cùng lớp fully-connected đọc bộ đặc trưng trừu tượng đó để ra quyết định.\n\nĐẾM THAM SỐ MỘT LỚP CONV — công thức phải thuộc:\n  tham số = C_vào * C_ra * K * K + C_ra\nGiải thích từng phần: mỗi kênh ra cần một bộ kernel K x K cho MỖI kênh vào (nên nhân C_vào * C_ra * K * K), cộng thêm mỗi kênh ra một bias (nên + C_ra). Ví dụ 3 kênh vào (ảnh màu), 64 kênh ra, kernel 3x3: 3*64*9 + 64 = 1.792.\n\nĐẾM THAM SỐ LỚP FULLY-CONNECTED:\n  tham số = số_đầu_vào * số_đầu_ra + số_đầu_ra\nĐây mới là chỗ tham số phình to. Bản đồ 7x7 với 512 kênh làm phẳng thành 25.088 đầu vào; nối sang 4.096 nơ-ron là hơn 102 triệu tham số cho MỘT lớp. Vì thế kiến trúc hiện đại thay lớp FC to bằng GLOBAL AVERAGE POOLING (lấy trung bình mỗi kênh, 512 kênh → 512 số) rồi mới nối.\n\nĐIỀU QUAN TRỌNG cần nhớ: số tham số của lớp conv KHÔNG phụ thuộc kích thước ảnh — cùng kernel dùng lại cho mọi vị trí. Ảnh to hơn chỉ tốn thêm TÍNH TOÁN, không tốn thêm tham số. Với lớp FC thì ngược lại: ảnh to hơn là số đầu vào phình lên theo.\n\nMột thói quen nghề: trước khi viết code, vẽ bảng "kích thước sau từng lớp" ra giấy. 90% lỗi khi dựng CNN lần đầu là lỗi kích thước, và bảng đó bắt được hết trước khi máy kịp báo lỗi.',
  workedExample: {
    code: `# Dem tham so cho mot CNN nho phan loai anh xam 28x28
def tham_so_conv(c_vao, c_ra, k):
    return c_vao * c_ra * k * k + c_ra    # kernel cho moi cap kenh + 1 bias/kenh ra

def tham_so_fc(vao, ra):
    return vao * ra + ra

# Conv1: 1 kenh (anh xam) -> 8 kenh, kernel 3x3
p1 = tham_so_conv(1, 8, 3)
print(f"Conv1: {p1}")

# Conv2: 8 kenh -> 16 kenh, kernel 3x3
p2 = tham_so_conv(8, 16, 3)
print(f"Conv2: {p2}")

# Sau 2 lan pool 2x2: 28 -> 14 -> 7. Lam phang: 7*7*16
phang = 7 * 7 * 16
p3 = tham_so_fc(phang, 10)              # 10 lop dau ra (chu so 0..9)
print(f"FC: {p3}")

print(f"Tong: {p1 + p2 + p3}")
print("Chu y: lop FC chiem phan lon tham so!")`,
    stdinLines: [],
  },
  predict: {
    code: `def tham_so_conv(c_vao, c_ra, k):\n    return c_vao * c_ra * k * k + c_ra\nprint(tham_so_conv(3, 64, 3))`,
    question: 'Lớp conv đầu tiên của một mạng ảnh màu (3 kênh) với 64 kênh ra, kernel 3x3 — bao nhiêu tham số?',
    choices: ['1792', '1728', '576', '110656'],
    answerIndex: 0,
    explain:
      '3 × 64 × 3 × 3 = 1.728 trọng số, cộng 64 bias = 1.792. Con số này KHÔNG đổi dù ảnh 32x32 hay 4000x3000 — kernel dùng chung cho mọi vị trí. Đó là điều MLP nối đủ không làm được.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự một khối CNN và phép đếm: định nghĩa công thức conv → công thức FC → tính từng lớp → cộng tổng.',
    lines: [
      'def tham_so_conv(c_vao, c_ra, k):',
      '    return c_vao * c_ra * k * k + c_ra',
      'def tham_so_fc(vao, ra):',
      '    return vao * ra + ra',
      'p1 = tham_so_conv(1, 8, 3)',
      'p2 = tham_so_fc(7 * 7 * 8, 10)',
      'print(p1 + p2)',
    ],
  },
  make: {
    prompt:
      'Viết máy đếm tham số cho MỘT lớp convolution.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: số kênh VÀO.\n- Dòng 2: số kênh RA.\n- Dòng 3: cạnh kernel k (kernel vuông k x k).\n\nCông thức: tham số = c_vao * c_ra * k * k + c_ra.\n\nIn ĐÚNG 1 dòng:\nTham so: <số nguyên>\n\nVí dụ 1, 8, 3 → "Tham so: 80".',
    starterCode: `c_vao = int(input("Kenh vao: "))\nc_ra = int(input("Kenh ra: "))\nk = int(input("Canh kernel: "))\n# Ap dung cong thuc roi in: Tham so: <so>\n`,
    testCases: [
      {
        stdinLines: ['1', '8', '3'],
        expected: 'Tham so: 80',
        match: 'contains',
        hidden: false,
        label: 'Ảnh xám → 8 kênh, kernel 3x3: 1*8*9 + 8 = 80',
      },
      {
        stdinLines: ['8', '16', '3'],
        expected: 'Tham so: 1168',
        match: 'contains',
        hidden: false,
        label: 'Lớp conv thứ hai: 8*16*9 + 16 = 1168',
      },
      {
        stdinLines: ['3', '1', '1'],
        expected: 'Tham so: 4',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: kernel 1x1 (trộn kênh) — chỉ 3*1*1 + 1 = 4 tham số',
      },
    ],
    hints: [
      'Đọc cả ba dòng bằng int(input(...)) — chúng đều là số nguyên.',
      'Công thức gồm HAI phần: phần trọng số c_vao * c_ra * k * k, cộng phần bias c_ra (mỗi kênh ra một bias).',
      'In đúng định dạng: print(f"Tham so: {tong}") — không thêm dấu chấm phân cách hàng nghìn.',
    ],
    sampleSolution: `c_vao = int(input("Kenh vao: "))\nc_ra = int(input("Kenh ra: "))\nk = int(input("Canh kernel: "))\ntong = c_vao * c_ra * k * k + c_ra\nprint(f"Tham so: {tong}")`,
  },
  homework:
    'Đếm bằng tay (rồi kiểm bằng code của bạn) toàn bộ mạng sau cho ảnh xám 32x32: Conv(1→16, 3x3, same padding) → Pool 2x2 → Conv(16→32, 3x3, same) → Pool 2x2 → Flatten → FC(→10). Ghi kích thước sau từng lớp và số tham số từng lớp. Câu hỏi chốt: lớp nào ngốn nhiều tham số nhất, và nếu thay lớp FC bằng global average pooling (32 kênh → 32 số) rồi FC(32→10) thì tổng giảm bao nhiêu lần?',
  srsCards: [
    {
      hoi: 'Công thức đếm tham số của một lớp convolution?',
      dap: 'C_vào × C_ra × K × K + C_ra: mỗi kênh ra cần một kernel K×K cho mỗi kênh vào, cộng một bias mỗi kênh ra. Ví dụ 3→64 kernel 3x3 = 3·64·9 + 64 = 1.792.',
    },
    {
      hoi: 'Vì sao số tham số lớp conv KHÔNG phụ thuộc kích thước ảnh, còn lớp FC thì có?',
      dap: 'Conv chia sẻ cùng một kernel cho mọi vị trí nên ảnh to hơn chỉ tốn thêm tính toán. Lớp FC nối tới TỪNG phần tử của bản đồ đã làm phẳng, nên ảnh to hơn làm số đầu vào (và số tham số) phình lên theo.',
    },
    {
      hoi: 'Dây chuyền kiến trúc CNN kinh điển gồm những gì, xu hướng kích thước ra sao?',
      dap: '[Conv → kích hoạt → Pool] lặp nhiều lần → flatten → fully-connected → softmax. Càng sâu thì bản đồ càng NHỎ về không gian nhưng càng NHIỀU KÊNH; lớp đầu học cạnh, lớp sâu học bộ phận vật thể.',
    },
  ],
}
```

### Bài 4 — `cv1-u2-l4` · Vòng huấn luyện đầy đủ

```typescript
{
  id: 'cv1-u2-l4',
  unitId: 'cv1-u2',
  language: 'python',
  title: 'Vòng huấn luyện đầy đủ — thấy loss giảm qua từng epoch',
  hook: 'Đến giờ bạn đã có đủ mảnh ghép: forward pass tính đầu ra, hàm mất mát đo độ sai, gradient chỉ hướng sửa. Ghép ba mảnh vào một vòng lặp là bạn có TOÀN BỘ cách mọi mô hình học sâu trên đời được huấn luyện. In loss từng epoch ra và nhìn nó tụt xuống — khoảnh khắc đó khó quên.',
  theory:
    'VÒNG HUẤN LUYỆN (training loop) lặp lại đúng bốn bước, mỗi vòng gọi là một EPOCH (một lượt đi qua toàn bộ dữ liệu):\n1. FORWARD — đưa dữ liệu qua mô hình, lấy dự đoán.\n2. LOSS — đo độ sai giữa dự đoán và nhãn thật.\n3. BACKWARD — tính gradient của loss theo từng tham số.\n4. UPDATE — nhích tham số ngược chiều gradient: w = w - lr * grad.\n\nMÔ HÌNH của bài này rút gọn tối đa để nhìn rõ cơ chế: một tham số w, dự đoán y_hat = w*x, dữ liệu x = [1, 2, 3], y = [2, 4, 6] (tức quy luật thật là y = 2x, nên đáp án đúng là w = 2). Mất mát MSE:\n  L = trung bình các (w*x_i - y_i)^2\n  dL/dw = trung bình các 2*(w*x_i - y_i)*x_i\n\nLEARNING RATE (lr, tốc độ học) là siêu tham số quan trọng nhất của học sâu:\n- lr quá NHỎ: loss giảm nhỏ giọt, huấn luyện lâu vô tận (thử lr = 0.001 ở bài tập về nhà).\n- lr VỪA: loss giảm nhanh và mượt, hội tụ về đáy.\n- lr quá LỚN: mỗi bước nhảy vọt qua đáy sang bên kia còn xa hơn — loss TĂNG dần rồi thành nan (không phải số). Với bài này, ngưỡng an toàn quanh lr < 0.21; thử 0.3 là thấy văng.\n\nGRADIENT DESCENT có ba biến thể theo lượng dữ liệu dùng mỗi bước: batch (cả tập — chính xác nhưng chậm, là cái bài này cài), stochastic (một mẫu — nhanh, nhiễu), mini-batch (một nhúm 32–256 mẫu — dung hoà, là cái mọi người thật sự dùng).\n\nĐỌC ĐƯỜNG LOSS là kỹ năng chẩn đoán: giảm rồi phẳng = hội tụ; giảm rồi tăng lại = lr to hoặc overfit; đứng ì từ đầu = lr quá nhỏ, dữ liệu chưa chuẩn hoá, hoặc code gradient sai (lúc đó quay lại phép kiểm gradient bài cv1-u1-l5).',
  workedExample: {
    code: `# Vong huan luyen day du cho mo hinh 1 tham so y_hat = w * x
x = [1.0, 2.0, 3.0]
y = [2.0, 4.0, 6.0]      # quy luat that: y = 2x
n = len(x)

w = 0.0                  # khoi tao
lr = 0.1                 # learning rate

for epoch in range(1, 6):            # 5 epoch co dinh
    # 1. FORWARD + 2. LOSS
    loss = 0.0
    for i in range(n):
        sai = w * x[i] - y[i]
        loss += sai * sai
    loss = loss / n
    print(f"Epoch {epoch}: loss={loss:.4f}")

    # 3. BACKWARD
    grad = 0.0
    for i in range(n):
        grad += 2 * (w * x[i] - y[i]) * x[i]
    grad = grad / n

    # 4. UPDATE: di NGUOC chieu gradient
    w = w - lr * grad

print(f"w: {w:.4f}")     # tien ve 2.0`,
    stdinLines: [],
  },
  predict: {
    code: `w = 5.0\ngrad = 2.0\nlr = 0.1\nw = w - lr * grad\nprint(f"{w:.4f}")`,
    question: 'Gradient dương 2.0, learning rate 0.1 — w sau một bước cập nhật là bao nhiêu?',
    choices: ['4.8000', '5.2000', '5.0000', '3.0000'],
    answerIndex: 0,
    explain:
      '5.0 − 0.1×2.0 = 4.8. Gradient DƯƠNG nghĩa là "tăng w thì loss tăng", nên ta đi NGƯỢC lại: giảm w. Dấu trừ trong w = w − lr·grad chính là chỗ "descent" (đi xuống) nằm trong tên gradient descent.',
  },
  parsons: {
    prompt: 'Xếp đúng bốn bước trong một epoch: tính loss → in → tính gradient → cập nhật tham số.',
    lines: [
      'for epoch in range(1, 6):',
      '    loss = sum((w * x[i] - y[i]) ** 2 for i in range(n)) / n',
      '    print(f"Epoch {epoch}: loss={loss:.4f}")',
      '    grad = sum(2 * (w * x[i] - y[i]) * x[i] for i in range(n)) / n',
      '    w = w - lr * grad',
      'print(f"w: {w:.4f}")',
    ],
  },
  make: {
    prompt:
      'Chạy vòng huấn luyện đầy đủ cho mô hình một tham số y_hat = w*x.\n\nDữ liệu NHÚNG SẴN trong starter code: x = [1, 2, 3], y = [2, 4, 6]. Khởi tạo w = 0.0. Số epoch CỐ ĐỊNH là 5.\n\nChương trình đọc MỘT dòng input(): learning rate (số thực).\n\nMỗi epoch, theo ĐÚNG thứ tự: (1) tính loss MSE = trung bình (w*x_i − y_i)², (2) in dòng\nEpoch <số>: loss=<loss với 4 chữ số thập phân>\n(3) tính gradient = trung bình 2*(w*x_i − y_i)*x_i, (4) cập nhật w = w − lr*grad.\n\nSau 5 epoch, in thêm ĐÚNG một dòng:\nw: <w với 4 chữ số thập phân>\n\nEpoch đánh số từ 1 đến 5. Ví dụ với lr = 0.1, epoch 1 in "Epoch 1: loss=18.6667" và dòng cuối là "w: 2.0000".',
    starterCode: `x = [1.0, 2.0, 3.0]\ny = [2.0, 4.0, 6.0]\nn = len(x)\nw = 0.0\nlr = float(input("Learning rate: "))\n# 5 epoch: tinh loss -> in -> tinh grad -> cap nhat w. Cuoi cung in w.\n`,
    testCases: [
      {
        stdinLines: ['0.1'],
        expected: 'Epoch 1: loss=18.6667',
        match: 'contains',
        hidden: false,
        label: 'Epoch đầu luôn có loss 18.6667 (w khởi tạo bằng 0)',
      },
      {
        stdinLines: ['0.1'],
        expected: 'Epoch 5: loss=0.0000\nw: 2.0000',
        match: 'contains',
        hidden: false,
        label: 'lr = 0.1 hội tụ đẹp: sau 5 epoch w về đúng 2.0000',
      },
      {
        stdinLines: ['0'],
        expected: 'Epoch 5: loss=18.6667\nw: 0.0000',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: lr = 0 → không cập nhật gì, loss đứng ì và w giữ nguyên 0',
      },
    ],
    hints: [
      'Vòng ngoài: for epoch in range(1, 6) để epoch chạy từ 1 tới 5 (range(6) sẽ in số 0 — sai đề).',
      'Thứ tự quan trọng: IN loss TRƯỚC khi cập nhật w, nếu không epoch 1 sẽ không còn là 18.6667.',
      'Loss và gradient đều chia cho n = 3. Định dạng in: f"Epoch {epoch}: loss={loss:.4f}" và cuối cùng f"w: {w:.4f}".',
    ],
    sampleSolution: `x = [1.0, 2.0, 3.0]\ny = [2.0, 4.0, 6.0]\nn = len(x)\nw = 0.0\nlr = float(input("Learning rate: "))\nfor epoch in range(1, 6):\n    loss = 0.0\n    for i in range(n):\n        sai = w * x[i] - y[i]\n        loss += sai * sai\n    loss = loss / n\n    print(f"Epoch {epoch}: loss={loss:.4f}")\n    grad = 0.0\n    for i in range(n):\n        grad += 2 * (w * x[i] - y[i]) * x[i]\n    grad = grad / n\n    w = w - lr * grad\nprint(f"w: {w:.4f}")`,
  },
  homework:
    'Chạy code của bạn với bốn learning rate và ghi lại đường loss: 0.001 · 0.05 · 0.1 · 0.3. Với lr = 0.3 bạn sẽ thấy loss TĂNG vọt qua từng epoch — vẽ tay hình parabol mất mát và mũi tên nhảy qua đáy để giải thích vì sao. Sau đó tăng số epoch lên 50 với lr = 0.001 và trả lời: cuối cùng nó có tới được w = 2 không, và cái giá phải trả là gì?',
  srsCards: [
    {
      hoi: 'Vòng huấn luyện gồm bốn bước nào, lặp theo đơn vị gì?',
      dap: 'Forward (tính dự đoán) → Loss (đo độ sai) → Backward (tính gradient) → Update (w = w − lr·grad). Một lượt đi qua toàn bộ dữ liệu gọi là một epoch; vòng lặp chạy nhiều epoch.',
    },
    {
      hoi: 'Learning rate quá nhỏ và quá lớn gây ra hiện tượng gì?',
      dap: 'Quá nhỏ: loss giảm nhỏ giọt, huấn luyện lâu vô tận. Quá lớn: mỗi bước nhảy vọt qua đáy sang bên kia còn xa hơn, loss TĂNG dần rồi thành nan. Vừa: loss giảm nhanh, mượt, rồi phẳng.',
    },
    {
      hoi: 'Batch, stochastic và mini-batch gradient descent khác nhau ở đâu?',
      dap: 'Batch dùng CẢ tập dữ liệu mỗi bước (chính xác, chậm); stochastic dùng MỘT mẫu (nhanh, nhiễu); mini-batch dùng một nhúm 32–256 mẫu (dung hoà) — mini-batch là cái được dùng thực tế.',
    },
  ],
}
```

### Bài 5 — `cv1-u2-l5` · Augmentation & overfit trên ảnh

```typescript
{
  id: 'cv1-u2-l5',
  unitId: 'cv1-u2',
  language: 'python',
  title: 'Augmentation & overfit — nhân dữ liệu bằng phép lật, dừng đúng lúc',
  hook: 'Bạn có 200 ảnh mèo, mạng thuộc lòng cả 200 sau vài phút rồi gặp con mèo thứ 201 là chịu thua. Không có tiền chụp thêm 2.000 ảnh? Lật ngang mỗi ảnh là bạn có ngay 400 — và con mèo soi gương vẫn là con mèo. Đó là augmentation: bịa thêm dữ liệu THẬT một cách hợp lệ.',
  theory:
    'AUGMENTATION (tăng cường dữ liệu) = sinh thêm mẫu huấn luyện bằng các phép biến đổi KHÔNG làm đổi nhãn. Trên ảnh, các phép phổ biến:\n- Lật ngang (horizontal flip) — đảo thứ tự các CỘT của mỗi hàng.\n- Dịch/cắt ngẫu nhiên (shift, random crop) — dạy mạng đừng phụ thuộc vị trí tuyệt đối.\n- Xoay nhẹ, đổi sáng/tương phản, thêm nhiễu.\n\nLUẬT VÀNG: phép biến đổi phải BẢO TOÀN NHÃN. Lật ngang ảnh mèo vẫn là mèo — hợp lệ. Nhưng lật ngang ảnh chữ số 2 thì thành một ký hiệu không phải chữ số, và lật ngang biển báo "rẽ trái" thì thành "rẽ phải" — sai nhãn, đầu độc dữ liệu. Chọn phép augmentation là quyết định NGHIỆP VỤ, không phải kỹ thuật thuần.\n\nAugmentation là một dạng REGULARIZATION: nó buộc mạng học đặc trưng BỀN VỮNG (mèo vẫn là mèo dù soi gương) thay vì học thuộc từng điểm ảnh. Hai công cụ chống overfit khác đi kèm trong học sâu:\n- DROPOUT: khi huấn luyện, ngẫu nhiên tắt một tỉ lệ nơ-ron mỗi bước, buộc mạng không dựa dẫm vào một nơ-ron duy nhất. Khi suy luận thì bật hết.\n- EARLY STOPPING (dừng sớm): theo dõi loss trên tập VALIDATION sau mỗi epoch; loss train vẫn giảm mà loss validation bắt đầu TĂNG là dấu hiệu mạng chuyển sang học vẹt — dừng ở đúng epoch tốt nhất và lấy lại bản trọng số của epoch đó.\n\nLƯU Ý quan trọng: augmentation CHỈ áp cho tập huấn luyện. Augment cả tập test là tự lừa mình, không còn đo được năng lực thật.\n\nPHÉP LẬT NGANG trong code: hàng [a, b, c] thành [c, b, a] — trong Python là hang[::-1]. Bài Make hôm nay bạn tự cài để thấy nó chỉ là một phép đảo chỉ số, không có gì huyền bí.',
  workedExample: {
    code: `# Augmentation: lat ngang mot anh 3x3 (dao thu tu cot moi hang)
anh = [[1, 2, 3],
       [4, 5, 6],
       [7, 8, 9]]

print("Goc:")
for hang in anh:
    print(" ".join(str(v) for v in hang))

print("Lat ngang:")
for hang in anh:
    dao = []
    for j in range(len(hang) - 1, -1, -1):   # duyet cot tu phai sang trai
        dao.append(hang[j])
    print(" ".join(str(v) for v in dao))

# Cach ngan gon cua Python (kiem lai ket qua tren)
print("Kiem bang lat cat:", anh[0][::-1])`,
    stdinLines: [],
  },
  predict: {
    code: `hang = [0, 0, 9]\nprint(hang[::-1])`,
    question: 'Lật ngang một hàng ảnh — in ra gì?',
    choices: ['[9, 0, 0]', '[0, 0, 9]', '[0, 9, 0]', '[9, 9, 0]'],
    answerIndex: 0,
    explain:
      'Lát cắt [::-1] duyệt list theo chiều ngược, cho [9, 0, 0] — điểm sáng chuyển từ mép phải sang mép trái. Lật cả ảnh chỉ là làm việc này cho MỌI hàng; số hàng và thứ tự hàng giữ nguyên.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự: in ảnh gốc trước, rồi in ảnh đã lật ngang từng hàng.',
    lines: [
      'print("Goc:")',
      'for hang in anh:',
      '    print(" ".join(str(v) for v in hang))',
      'print("Lat ngang:")',
      'for hang in anh:',
      '    print(" ".join(str(v) for v in hang[::-1]))',
    ],
  },
  make: {
    prompt:
      'Tự cài phép augmentation lật ngang.\n\nChương trình đọc MỘT dòng input(): 9 số nguyên cách nhau dấu phẩy — ảnh 3x3 lưu phẳng theo từng hàng.\n\nIn ĐÚNG 8 dòng:\nGoc:\n<3 dòng ảnh gốc, mỗi dòng 3 số cách nhau MỘT dấu cách>\nLat ngang:\n<3 dòng ảnh đã đảo thứ tự cột trong mỗi hàng>\n\nVí dụ "1,2,3,4,5,6,7,8,9": phần gốc là "1 2 3" / "4 5 6" / "7 8 9", phần lật là "3 2 1" / "6 5 4" / "9 8 7". Số hàng và thứ tự hàng KHÔNG đổi — chỉ đảo cột.',
    starterCode: `phang = [int(v) for v in input("Anh 3x3 phang: ").split(",")]\nanh = [phang[i * 3:(i + 1) * 3] for i in range(3)]\n# In "Goc:" roi 3 hang; in "Lat ngang:" roi 3 hang da dao cot\n`,
    testCases: [
      {
        stdinLines: ['1,2,3,4,5,6,7,8,9'],
        expected: 'Goc:\n1 2 3\n4 5 6\n7 8 9\nLat ngang:\n3 2 1\n6 5 4\n9 8 7',
        match: 'contains',
        hidden: false,
        label: 'Ảnh đếm 1–9: lật ngang đảo từng hàng, giữ thứ tự hàng',
      },
      {
        stdinLines: ['1,2,1,3,4,3,5,6,5'],
        expected: 'Lat ngang:\n1 2 1\n3 4 3\n5 6 5',
        match: 'contains',
        hidden: false,
        label: 'Ảnh đối xứng trái–phải → lật xong y hệt bản gốc',
      },
      {
        stdinLines: ['0,0,9,0,0,0,0,0,0'],
        expected: 'Lat ngang:\n9 0 0\n0 0 0\n0 0 0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: một điểm sáng duy nhất ở mép phải → sau khi lật nằm ở mép trái',
      },
    ],
    hints: [
      'Ảnh đã reshape sẵn trong starter: anh là list gồm 3 hàng, mỗi hàng là list 3 số.',
      'In một hàng: print(" ".join(str(v) for v in hang)). Nhớ in đúng hai dòng nhãn "Goc:" và "Lat ngang:".',
      'Lật ngang một hàng: hang[::-1] (hoặc vòng for j chạy từ 2 xuống 0). Chỉ đảo TRONG hàng, không đảo thứ tự các hàng.',
    ],
    sampleSolution: `phang = [int(v) for v in input("Anh 3x3 phang: ").split(",")]\nanh = [phang[i * 3:(i + 1) * 3] for i in range(3)]\nprint("Goc:")\nfor hang in anh:\n    print(" ".join(str(v) for v in hang))\nprint("Lat ngang:")\nfor hang in anh:\n    print(" ".join(str(v) for v in hang[::-1]))`,
  },
  homework:
    'Thêm hai phép augmentation nữa vào code: lật DỌC (đảo thứ tự các hàng — gợi ý anh[::-1]) và tăng sáng (cộng 1 vào mọi ô, chặn trần ở 9 bằng min(9, v + 1)). Sau đó lập danh sách 5 bài toán ảnh đời thật (nhận diện khuôn mặt, đọc biển số xe, phân loại ảnh chụp X-quang, đọc chữ số viết tay, nhận biển báo giao thông) và với MỖI bài toán ghi rõ: lật ngang có hợp lệ không, vì sao. Ít nhất hai bài phải trả lời "không" — tìm ra chúng là mục tiêu của bài tập này.',
  srsCards: [
    {
      hoi: 'Augmentation dữ liệu ảnh là gì và luật vàng khi chọn phép biến đổi?',
      dap: 'Sinh thêm mẫu huấn luyện bằng biến đổi ảnh (lật, dịch, xoay, đổi sáng, nhiễu). Luật vàng: phép biến đổi phải BẢO TOÀN NHÃN — lật ngang mèo vẫn là mèo, nhưng lật ngang biển "rẽ trái" thành "rẽ phải" là đầu độc dữ liệu.',
    },
    {
      hoi: 'Vì sao augmentation chỉ được áp cho tập HUẤN LUYỆN?',
      dap: 'Tập test dùng để đo năng lực thật trên dữ liệu chưa gặp; augment nó là tự lừa mình, con số đo được không còn phản ánh thực tế triển khai.',
    },
    {
      hoi: 'Dropout và early stopping chống overfit bằng cách nào?',
      dap: 'Dropout: khi huấn luyện ngẫu nhiên tắt một tỉ lệ nơ-ron mỗi bước, buộc mạng không dựa dẫm vào một nơ-ron duy nhất (khi suy luận bật hết). Early stopping: theo dõi loss validation, thấy nó bắt đầu TĂNG trong khi loss train vẫn giảm thì dừng và lấy lại trọng số của epoch tốt nhất.',
    },
  ],
}
```

---

## 4. GIAI ĐOẠN 3 — `cv1-u3` · PyTorch, transfer learning & Docker (4 bài)

### Bài 1 — `cv1-u3-l1` · Đọc PyTorch

```typescript
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
    prompt: 'Xếp đúng bản Python thuần của nn.Linear: mỗi hàng W là một đầu ra, khởi tạo bằng bias rồi cộng dồn tích.',
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
}
```

### Bài 2 — `cv1-u3-l2` · Transfer learning

```typescript
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
    question: 'Chiến lược "freeze" với backbone 1000 tham số, head 10 — bao nhiêu tham số được cập nhật?',
    choices: ['10', '1000', '1010', '990'],
    answerIndex: 0,
    explain:
      'Đóng băng backbone nghĩa là chỉ head được học: 10 tham số. Ít tham số cập nhật → huấn luyện nhanh và khó overfit khi dữ liệu ít. Đó chính là lý do transfer learning cứu được những dự án chỉ có vài trăm ảnh.',
  },
  parsons: {
    prompt: 'Xếp đúng logic chọn chiến lược: nếu freeze thì chỉ head được học, ngược lại học tất cả, rồi in hai con số.',
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
}
```

### Bài 3 — `cv1-u3-l3` · Đánh giá mô hình ảnh

```typescript
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
}
```

### Bài 4 — `cv1-u3-l4` · Docker & triển khai + tổng kết khoá

```typescript
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
    prompt: 'Xếp đúng thứ tự các lệnh trong Dockerfile để tận dụng cache: ảnh nền → thư mục làm việc → cài thư viện trước → chép mã nguồn sau → lệnh chạy.',
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
        expected: 'Dong goi: cv-classifier\nBase: python:3.11-slim\nThu vien: numpy, pillow, torch\nSo goi: 3',
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
}
```

---

## 5. Bảng kiểm sample solution (đã suy luận tay từng ca)

| Bài         | Ca 1                          | Ca 2                        | Ca ẩn (biên)                             |
| ----------- | ----------------------------- | --------------------------- | ---------------------------------------- |
| `cv1-u1-l1` | 4 dòng `..##`                 | `....`/`....`/`####`/`####` | ranh giới 3/4 và 6/7 → `.++#`            |
| `cv1-u1-l2` | z 2.0 / a 2.0                 | z −2.0 / a 0.0              | z đúng 0 → a 0.0                         |
| `cv1-u1-l3` | h 2.0 4.0 / out 10.0          | h 0.0 4.0 / out 8.0         | đầu vào 0 → toàn 0.0                     |
| `cv1-u1-l4` | 0.6652 0.2447 0.0900 / 0.4076 | log(3) = 1.0986             | 2 lớp → log(2) = 0.6931                  |
| `cv1-u1-l5` | −16.0000 cả hai cách          | 6.0000 cả hai cách          | gradient 0.0000 (đã đoán đúng)           |
| `cv1-u2-l1` | `27 27 0` × 3                 | toàn `0 0 0`                | cạnh ngược chiều → `0 -27 -27`           |
| `cv1-u2-l2` | `6 8` / `14 16`               | toàn 0                      | một giá trị khác 0 mỗi ô → `9 0` / `0 7` |
| `cv1-u2-l3` | 80                            | 1168                        | kernel 1x1 → 4                           |
| `cv1-u2-l4` | epoch 1 loss 18.6667          | lr 0.1 → w 2.0000           | lr 0 → loss đứng ì, w 0.0000             |
| `cv1-u2-l5` | gốc 1–9 / lật 3 2 1…          | ảnh đối xứng → lật y hệt    | điểm sáng mép phải → sang mép trái       |
| `cv1-u3-l1` | y: −1.50 4.50                 | y: 0.50 −0.50 (chỉ bias)    | x1 = x3 triệt tiêu → y: 0.50 3.50        |
| `cv1-u3-l2` | freeze → 2570 / 23500000      | finetune → 23502570 / 0     | backbone 0 → 10 / 0                      |
| `cv1-u3-l3` | 1/1/1/1, P 0.50 R 0.50        | hô dương tuốt: R 1.00       | không hô dương → CẢ HAI mẫu 0, in 0.00   |
| `cv1-u3-l4` | numpy, pillow, torch / 3      | flask / 1                   | khai trùng numpy → numpy, torch / 2      |

Ghi chú số học đáng lưu ý cho người review:

- `cv1-u1-l4` ca 1: e² = 7,389056 · e¹ = 2,718282 · e⁰ = 1 → tổng 11,107338; p = 0,665241 /
  0,244728 / 0,090031 → `.4f` cho `0.6652 0.2447 0.0900`; loss = −ln(0,665241) = 0,407606 →
  `0.4076`.
- `cv1-u2-l4` với lr = 0,1 (x = [1,2,3], y = 2x, w₀ = 0, mean(x²) = 14/3):
  loss các epoch = 18,6667 → 0,0830 → 0,0004 → 0,0000 → 0,0000; w cuối = 1,999997 → `2.0000`.
  Ca 2 và ca ẩn cố ý chỉ so những dòng KHÔNG phụ thuộc tích luỹ số học nhiều bước, tránh test
  giòn.
- `cv1-u1-l5`: sai phân trung tâm CHÍNH XÁC với hàm bậc hai (sai số chỉ do dấu phẩy động, cỡ
  1e-9), nên `.4f` khớp tuyệt đối với công thức giải tích ở cả 3 ca.

## 6. Việc thi hành (ngoài phạm vi đặc tả nội dung này)

1. Tạo `packages/subject-programming/lessons/cv1u1.ts` · `cv1u2.ts` · `cv1u3.ts` xuất
   `CV1_U1_LESSONS` · `CV1_U2_LESSONS` · `CV1_U3_LESSONS` (khuôn header comment như `mlu1.ts`).
2. Đăng ký ở `lessons.ts` và thêm `lessonsCv1.test.ts` (hoặc gộp vào cổng python sẵn có).
3. **Nới regex `lessonId` để nhận tiền tố `cv1`** ở đúng 4 chỗ đã liệt kê trong đặc tả cụm §④:
   `lessonTypes.ts` (`id` + `unitId`), `apps/server/src/api/subjects/programming/progress.ts`,
   `.../feedback.ts`. Regex hiện tại là `(git|hermes|vibe|openclaw|ml)-u\d+-l\d+` — chưa nhận
   `cv1-u1-l1`, nên **bài sẽ trượt Zod nếu quên bước này**.
4. Tạo `courses/cv1.ts` với `canDo` và `prerequisites: ['Khoá Machine Learning & Data Science (mlds)']`
   theo §03d, đăng ký `registry.ts`, nới `ShortCourseId`.
5. Cổng: `npx vitest run packages/subject-programming` (chấm python3 thật) + `npm run typecheck`
   - `npm run lint` + `npm test`.

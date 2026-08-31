// lessons/mlu4.ts — Chương C4 "Học sâu & AI tạo sinh" của khoá "Học máy — từ hồi quy đến AI
// tạo sinh" (docs/specs/2026-08-31-khoa-hoc-may.md). ĐÂY LÀ CHƯƠNG CUỐI CÙNG của toàn khoá.
//
// unitId 'ml-u4' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi thuật toán LÕI đều tự cài bằng Python THUẦN (không numpy/
// torch/tensorflow) để Pyodide trình duyệt và python3 CI chấm y hệt nhau; kiến trúc/mô hình
// không tự cài nổi bằng Python thuần trong một bài (CNN đầy đủ, RNN, Transformer, diffusion,
// GAN, Bayesian network...) dạy ở mức nhận-đường trong theory, không bịa code.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const ML_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'ml-u4-l1',
    unitId: 'ml-u4',
    language: 'python',
    title: 'Nơ-ron & MLP — tự cài forward pass của một nơ-ron',
    hook: 'Bộ não người có khoảng 86 tỷ nơ-ron, mỗi cái đơn giản đến bất ngờ: nhận vài tín hiệu, cộng lại, "bừng sáng" nếu đủ mạnh. Mạng nơ-ron nhân tạo bắt chước đúng ý tưởng đó — và một nơ-ron nhân tạo chỉ là vài dòng Python.',
    theory:
      'NƠ-RON nhân tạo nhận nhiều đầu vào (x1, x2, x3…), mỗi đầu vào có một TRỌNG SỐ (w) đo mức quan trọng, cộng thêm một BIAS (độ lệch), rồi qua HÀM KÍCH HOẠT (activation) để quyết định "bừng sáng" hay không.\n\nCông thức: z = (w1*x1 + w2*x2 + ... ) + bias, rồi output = kich_hoat(z).\n\nHàm kích hoạt phổ biến nhất hiện nay là ReLU (Rectified Linear Unit): relu(z) = max(0, z) — âm thì cắt về 0, dương thì giữ nguyên. Đơn giản đến mức khó tin, nhưng chính ReLU (thay cho các hàm cong phức tạp hơn) là một lý do mạng sâu huấn luyện được nhanh trên quy mô lớn.\n\nMỘT nơ-ron chỉ vẽ được một đường/mặt phân chia thẳng — yếu ớt. Sức mạnh đến từ xếp CHỒNG: nhiều nơ-ron song song tạo thành một LỚP (layer), nhiều lớp nối tiếp tạo thành MLP (Multi-Layer Perceptron, mạng nơ-ron nhiều lớp). Lớp đầu học đặc trưng thô (vd cạnh trong ảnh), lớp sau ghép các đặc trưng đó thành khái niệm cao hơn (vd hình tròn, rồi khuôn mặt) — càng sâu càng trừu tượng. Đây là điểm khác biệt gốc rễ so với hồi quy tuyến tính (chương 1): một đường thẳng không uốn được, nhưng hàng triệu nơ-ron xếp lớp thì xấp xỉ được gần như mọi hàm số.\n\nHọc (huấn luyện) một mạng nghĩa là tìm bộ trọng số + bias sao cho output khớp dữ liệu — bài sau (gradient descent) dạy CÁCH tìm chúng.',
    workedExample: {
      code: `# Forward pass: mot no-ron nhan 3 dau vao, co dinh trong so + bias
trong_so = [0.5, -0.6, 0.2]
bias = 0.1

def relu(x):
    return max(0, x)         # am thi cat ve 0, duong thi giu nguyen

def forward(dau_vao):
    tong = sum(w * x for w, x in zip(trong_so, dau_vao)) + bias
    return relu(tong)

# Ca 1: no-ron "tat" (tong am -> relu cat ve 0)
print(forward([2, 3, 1]))
# Ca 2: no-ron "bung sang" (tong duong -> giu nguyen)
print(forward([4, 1, 2]))`,
      stdinLines: [],
    },
    predict: {
      code: `trong_so = [1, 2]\nbias = -3\ndau_vao = [2, 1]\ntong = sum(w * x for w, x in zip(trong_so, dau_vao)) + bias\nprint(max(0, tong))`,
      question: 'Nơ-ron này in ra bao nhiêu?',
      choices: ['1', '0', '-1', '2'],
      answerIndex: 0,
      explain:
        'tong = 1*2 + 2*1 + (-3) = 2 + 2 - 3 = 1. Vì tong dương nên ReLU giữ nguyên: max(0, 1) = 1. Đổi dấu bias một chút là kết quả có thể tụt về 0 — đúng cơ chế "bật/tắt" mà ReLU tạo ra.',
    },
    parsons: {
      prompt: 'Xếp đúng forward pass: tính tổng có trọng số cộng bias → áp ReLU → in kết quả.',
      lines: [
        'tong = sum(w * x for w, x in zip(trong_so, dau_vao)) + bias',
        'ket_qua = max(0, tong)',
        'print(ket_qua)',
      ],
    },
    make: {
      prompt:
        'Tự cài forward pass của một nơ-ron ReLU với trọng số cố định.\n\nTrọng số và bias đã cho sẵn trong starter code: trong_so = [0.5, -1.0, 2.0], bias = -1.0.\n\nChương trình đọc 1 dòng input(): 3 giá trị đầu vào cách nhau dấu phẩy (vd "2,1,1").\n\nTính tổng có trọng số cộng bias, áp ReLU (max(0, tong)), rồi in đúng 1 dòng:\nOutput: <ket_qua>',
      starterCode: `trong_so = [0.5, -1.0, 2.0]\nbias = -1.0\ndau_vao = [float(x) for x in input("Dau vao (vd 2,1,1): ").split(",")]\n# Tinh tong = sum(w*x) + bias, ap ReLU (max(0, tong)), roi in Output: <ket qua>\n`,
      testCases: [
        {
          stdinLines: ['2,1,1'],
          expected: 'Output: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Tổng có trọng số dương → ReLU giữ nguyên 1.0',
        },
        {
          stdinLines: ['0,0,0'],
          expected: 'Output: 0',
          match: 'contains',
          hidden: false,
          label: 'Chỉ còn bias âm → ReLU cắt về 0',
        },
        {
          stdinLines: ['1,1,1'],
          expected: 'Output: 0.5',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tổng 1.5 trừ bias 1.0 → 0.5, đúng biên dương rất nhỏ',
        },
      ],
      hints: [
        'Đúng khung ví dụ mẫu: tong = sum(w * x for w, x in zip(trong_so, dau_vao)) + bias.',
        'Áp ReLU bằng max(0, tong) — hàm max có sẵn của Python, không cần viết if.',
        'In: print(f"Output: {ket_qua}") với ket_qua = max(0, tong).',
      ],
      sampleSolution: `trong_so = [0.5, -1.0, 2.0]\nbias = -1.0\ndau_vao = [float(x) for x in input("Dau vao (vd 2,1,1): ").split(",")]\ntong = sum(w * x for w, x in zip(trong_so, dau_vao)) + bias\nket_qua = max(0, tong)\nprint(f"Output: {ket_qua}")`,
    },
    homework:
      'Vẽ tay (giấy hoặc note app) một MLP mini: 2 đầu vào → 1 lớp ẩn 2 nơ-ron → 1 nơ-ron đầu ra. Tự đặt trọng số bất kỳ cho từng mũi tên, rồi tính forward pass bằng tay cho input (1, 1): mỗi nơ-ron lớp ẩn tính z riêng rồi ReLU, hai kết quả đó lại làm đầu vào cho nơ-ron cuối. So với việc chỉ dùng 1 nơ-ron — bạn thấy lớp ẩn "trộn" thông tin theo cách một nơ-ron đơn không làm được ở chỗ nào?',
    srsCards: [
      {
        hoi: 'Một nơ-ron nhân tạo tính output qua công thức nào?',
        dap: 'z = tổng có trọng số của các đầu vào (Σ wi*xi) cộng bias, rồi output = ham_kich_hoat(z). Với ReLU: output = max(0, z) — âm cắt về 0, dương giữ nguyên.',
      },
      {
        hoi: 'MLP (Multi-Layer Perceptron) là gì và vì sao cần nhiều lớp?',
        dap: 'MLP = nhiều LỚP nơ-ron xếp nối tiếp. Một nơ-ron chỉ vẽ được ranh giới thẳng, yếu; xếp nhiều lớp thì lớp sau ghép đặc trưng của lớp trước thành khái niệm trừu tượng hơn — nhờ đó xấp xỉ được các hàm số phức tạp, không chỉ đường thẳng.',
      },
      {
        hoi: 'Vì sao ReLU (max(0,x)) được dùng phổ biến làm hàm kích hoạt?',
        dap: 'Đơn giản, tính rất nhanh, và giúp mạng sâu huấn luyện hiệu quả hơn các hàm kích hoạt cong phức tạp trước đó — mỗi nơ-ron coi như một công tắc "bật (giữ giá trị) / tắt (về 0)".',
      },
    ],
  },
  {
    id: 'ml-u4-l2',
    unitId: 'ml-u4',
    language: 'python',
    title: 'Gradient descent — cách mạng nơ-ron tự học trọng số',
    hook: 'Bịt mắt đứng giữa một quả đồi, mục tiêu là xuống tới đáy thung lũng. Cách hợp lý nhất: sờ xem chân nào đang dốc xuống, bước một bước theo hướng đó, lặp lại. Đó chính xác là GRADIENT DESCENT — thuật toán đứng sau việc "học" của mọi mạng nơ-ron.',
    theory:
      'HÀM MẤT MÁT (loss function) đo mô hình đang SAI bao nhiêu — càng nhỏ càng tốt. GRADIENT DESCENT là thuật toán TỐI ƯU: tìm tham số làm hàm mất mát nhỏ nhất, bằng cách lặp đi bước theo hướng NGƯỢC với đạo hàm (đạo hàm cho biết hướng dốc LÊN, nên đi ngược lại là xuống).\n\nVới một tham số x, công thức cập nhật: x_moi = x - learning_rate * dao_ham(x). learning_rate (tốc độ học) là độ dài mỗi bước — quá lớn thì nhảy qua đáy, quá nhỏ thì học rất chậm.\n\nVí dụ tối giản: hàm mất mát f(x) = (x - 5)², đạo hàm là 2*(x - 5) (đạt 0 đúng tại x = 5, đáy của hàm parabol). Lặp công thức trên nhiều vòng, x hội tụ dần về 5 dù xuất phát từ đâu.\n\nMạng nơ-ron thật có HÀNG TRIỆU trọng số, không chỉ một x. Thuật toán LAN TRUYỀN NGƯỢC (backpropagation) là cách tính đạo hàm của hàm mất mát theo TỪNG trọng số một cách hiệu quả, đi từ lớp cuối ngược về lớp đầu, dựa trên QUY TẮC CHUỖI (chain rule) của đạo hàm: đạo hàm của một mạng nhiều lớp lồng nhau bằng tích các đạo hàm từng lớp. Sau khi có đạo hàm cho MỌI trọng số, gradient descent cập nhật TẤT CẢ chúng CÙNG LÚC theo đúng công thức bạn vừa tự cài — chỉ là lặp lại hàng triệu lần trên hàng triệu tham số thay vì một x. Bài này không tự cài backprop đầy đủ (cần đạo hàm ma trận nhiều lớp), chỉ cần nắm chắc trực giác một-tham-số này là đủ hiểu bản chất.',
    workedExample: {
      code: `# Gradient descent tren ham mat mat f(x) = (x - 5) ** 2
# Dao ham cua f la 2 * (x - 5), dat 0 tai x = 5 (day cua parabol)
x = 0.0
lr = 0.1                        # toc do hoc

for vong in range(10):
    dao_ham = 2 * (x - 5)
    x = x - lr * dao_ham         # buoc nguoc huong dao ham
    print(f"Vong {vong + 1}: x = {round(x, 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `x = 0\nlr = 0.5\ndao_ham = 2 * (x - 5)\nx = x - lr * dao_ham\nprint(x)`,
      question: 'Sau đúng 1 bước gradient descent, x in ra bao nhiêu?',
      choices: ['5.0', '0.5', '-5.0', '10.0'],
      answerIndex: 0,
      explain:
        'dao_ham = 2*(0-5) = -10. x_moi = 0 - 0.5*(-10) = 0 + 5.0 = 5.0. Với learning_rate 0.5 và hàm parabol đơn giản này, một bước là "nhảy" thẳng tới đáy — thực tế learning_rate lớn cỡ này dễ nhảy VƯỢT QUA đáy ở các hàm phức tạp hơn.',
    },
    parsons: {
      prompt: 'Xếp đúng một vòng lặp gradient descent: tính đạo hàm → cập nhật x → lặp lại.',
      lines: [
        'x = 0.0',
        'lr = 0.1',
        'for vong in range(10):',
        '    dao_ham = 2 * (x - 5)',
        '    x = x - lr * dao_ham',
      ],
    },
    make: {
      prompt:
        'Tự cài gradient descent tối ưu hàm mất mát f(x) = (x - 5)².\n\nChương trình đọc 3 dòng input():\n- Dòng 1: x khởi đầu (số thực).\n- Dòng 2: learning_rate (số thực).\n- Dòng 3: số vòng lặp (số nguyên).\n\nLặp đúng số vòng, mỗi vòng cập nhật x = x - lr * dao_ham với dao_ham = 2*(x-5). In đúng 1 dòng cuối:\nX sau <so_vong> vong: <x lam tron 4 chu so>',
      starterCode: `x = float(input("X khoi dau: "))\nlr = float(input("Learning rate: "))\nso_vong = int(input("So vong: "))\n# Lap so_vong lan: dao_ham = 2*(x-5); x = x - lr*dao_ham\n# In: X sau <so_vong> vong: <x lam tron 4 chu so>\n`,
      testCases: [
        {
          stdinLines: ['0', '0.1', '10'],
          expected: 'X sau 10 vong: 4.4631',
          match: 'contains',
          hidden: false,
          label: 'Xuất phát 0, lr 0.1, 10 vòng → hội tụ dần về 5',
        },
        {
          stdinLines: ['10', '0.1', '1'],
          expected: 'X sau 1 vong: 9.0',
          match: 'contains',
          hidden: false,
          label: 'Xuất phát 10 (trên đỉnh), 1 vòng → 9.0',
        },
        {
          stdinLines: ['5', '0.1', '5'],
          expected: 'X sau 5 vong: 5.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đã đúng đáy (x=5) → đạo hàm luôn 0, x đứng yên',
        },
      ],
      hints: [
        'Vòng lặp for vong in range(so_vong): tính dao_ham = 2 * (x - 5) rồi cập nhật x = x - lr * dao_ham — làm ĐÚNG số vòng trước khi in.',
        'Chỉ in kết quả SAU KHI vòng lặp kết thúc, không in trong từng vòng.',
        'Làm tròn bằng round(x, 4). In: print(f"X sau {so_vong} vong: {round(x, 4)}").',
      ],
      sampleSolution: `x = float(input("X khoi dau: "))\nlr = float(input("Learning rate: "))\nso_vong = int(input("So vong: "))\nfor vong in range(so_vong):\n    dao_ham = 2 * (x - 5)\n    x = x - lr * dao_ham\nprint(f"X sau {so_vong} vong: {round(x, 4)}")`,
    },
    homework:
      'Chạy lại bài Make với learning_rate = 2.5 (rất lớn) và 5 vòng, xuất phát x=0. Quan sát x nhảy thế nào — có tiến gần 5 không hay càng lúc càng vọt xa hơn? Đây gọi là "phân kỳ" (diverge). Rồi thử learning_rate = 0.001 với 10 vòng — x tiến được bao xa? Viết 2-3 câu rút ra quy tắc: learning_rate quá lớn và quá nhỏ mỗi cái hỏng theo kiểu nào.',
    srsCards: [
      {
        hoi: 'Công thức cập nhật một tham số trong gradient descent là gì?',
        dap: 'x_moi = x - learning_rate * dao_ham(x). Đi NGƯỢC hướng đạo hàm (đạo hàm chỉ hướng dốc lên) để tiến dần về điểm hàm mất mát nhỏ nhất; learning_rate quyết định độ dài mỗi bước.',
      },
      {
        hoi: 'Lan truyền ngược (backpropagation) làm việc gì trong mạng nơ-ron?',
        dap: 'Tính đạo hàm của hàm mất mát theo TỪNG trọng số của mạng, đi từ lớp cuối ngược về lớp đầu bằng quy tắc chuỗi (chain rule — đạo hàm của hàm lồng nhau bằng tích đạo hàm từng lớp). Sau đó gradient descent cập nhật mọi trọng số cùng lúc.',
      },
      {
        hoi: 'Learning rate quá lớn hoặc quá nhỏ gây hậu quả gì?',
        dap: 'Quá lớn: bước nhảy vượt qua điểm tối ưu, có thể càng lặp càng xa hơn (phân kỳ). Quá nhỏ: học đúng hướng nhưng cực chậm, tốn rất nhiều vòng lặp mới tới gần đáy.',
      },
    ],
  },
  {
    id: 'ml-u4-l3',
    unitId: 'ml-u4',
    language: 'python',
    title: 'CNN, RNN, Transformer — kiến trúc nào hợp dữ liệu nào',
    hook: 'Nhìn một bức ảnh, mắt bạn không đọc từng pixel theo thứ tự — bạn nhận ra CẠNH và VÙNG trước. Nghe một câu nói, não bạn nhớ TỪ TRƯỚC để hiểu từ SAU. Hai cách xử lý thông tin khác hẳn nhau, và học sâu có kiến trúc riêng cho từng cách: CNN cho không gian, RNN/Transformer cho chuỗi.',
    theory:
      'MLP (bài 1) coi mọi đầu vào như một dãy số phẳng, không "biết" pixel nào cạnh pixel nào hay từ nào đứng trước từ nào. Ba kiến trúc dưới đây thêm CẤU TRÚC phù hợp với từng loại dữ liệu:\n\nCNN (Convolutional Neural Network — mạng tích chập): dùng cho dữ liệu có cấu trúc KHÔNG GIAN CỤC BỘ (ảnh, âm thanh dạng sóng). Ý tưởng lõi là TÍCH CHẬP (convolution): trượt một KERNEL (bộ lọc nhỏ, vài số) qua tín hiệu, tại mỗi vị trí nhân từng cặp rồi cộng lại — kernel dò ra một hoa văn cục bộ (cạnh, góc, vệt màu) lặp lại ở nhiều vị trí, nên CNN dùng chung một bộ trọng số cho cả ảnh thay vì một trọng số riêng cho từng pixel — đó là lý do CNN ít tham số và học ảnh hiệu quả hơn MLP thuần.\n\nRNN (Recurrent Neural Network — mạng hồi quy): dùng cho dữ liệu CÓ THỨ TỰ THỜI GIAN (câu văn, chuỗi thời gian, âm thanh giọng nói). Nó xử lý từng phần tử LẦN LƯỢT và giữ một TRẠNG THÁI ẨN (hidden state) tóm tắt mọi thứ đã thấy trước đó — đọc từ thứ 10 thì đã "nhớ" ngữ cảnh của 9 từ trước. Điểm yếu: xử lý tuần tự nên chậm, và khó nhớ ngữ cảnh RẤT XA về trước (long-range dependency).\n\nTransformer: cũng cho dữ liệu chuỗi, nhưng thay vì đọc tuần tự, dùng cơ chế ATTENTION — mỗi vị trí "nhìn" đồng thời TOÀN BỘ chuỗi và tự quyết định nên chú ý phần nào nhiều nhất, tính song song được nên huấn luyện nhanh hơn nhiều trên phần cứng hiện đại. Đây là kiến trúc đứng sau GPT, BERT và hầu hết mô hình NLP/thị giác hiện đại — gần như đã thay thế RNN ở quy mô lớn.\n\nHai kiến trúc khác đáng biết ở mức khái niệm: GNN (Graph Neural Network) xử lý dữ liệu dạng ĐỒ THỊ (mạng xã hội, phân tử hoá học — mỗi nút "nhìn" các nút hàng xóm). AUTOENCODER là mạng tự học NÉN dữ liệu vào một biểu diễn nhỏ gọn rồi GIẢI NÉN lại gần giống bản gốc — nén lỗi thì tín hiệu "khác thường" bị tái tạo tệ hơn, nên dùng để giảm nhiễu hoặc phát hiện bất thường (gian lận, lỗi máy).\n\nBài này tự cài đúng phần lõi tính TOÁN được của CNN — tích chập 1D — vì kernel trượt qua tín hiệu là phép cộng-nhân thuần tuý, chạy được bằng Python thường; RNN/Transformer cần trạng thái/attention học qua hàng triệu tham số nên chỉ học ở mức khái niệm.',
    workedExample: {
      code: `# Tich chap 1D: truot kernel qua tin hieu, kernel [1, 0, -1] la bo do canh
tin_hieu = [1, 1, 1, 5, 5, 5, 1, 1, 1]   # tin hieu co mot "buoc nhay" o giua
kernel = [1, 0, -1]

for i in range(len(tin_hieu) - len(kernel) + 1):
    doan = tin_hieu[i:i + len(kernel)]           # doan tin hieu dang xet
    tich_chap = sum(a * b for a, b in zip(doan, kernel))
    print(tich_chap)`,
      stdinLines: [],
    },
    predict: {
      code: `tin_hieu = [1, 3, 2, 5]\nkernel = [1, -1]\ndoan = tin_hieu[0:2]\ntich_chap = sum(a * b for a, b in zip(doan, kernel))\nprint(tich_chap)`,
      question:
        'Giá trị tích chập tại vị trí đầu tiên (kernel [1, -1] trên đoạn [1, 3]) là bao nhiêu?',
      choices: ['-2', '4', '0', '-4'],
      answerIndex: 0,
      explain:
        'tich_chap = 1*1 + 3*(-1) = 1 - 3 = -2. Kernel [1, -1] đo CHÊNH LỆCH giữa hai phần tử liền kề — giá trị âm lớn nghĩa là tín hiệu đang TĂNG mạnh tại vị trí đó, đúng cách một kernel dò cạnh hoạt động.',
    },
    parsons: {
      prompt:
        'Xếp đúng vòng lặp tích chập 1D: cắt đoạn tín hiệu → nhân-cộng với kernel → in kết quả, cho từng vị trí trượt.',
      lines: [
        'for i in range(len(tin_hieu) - len(kernel) + 1):',
        '    doan = tin_hieu[i:i + len(kernel)]',
        '    tich_chap = sum(a * b for a, b in zip(doan, kernel))',
        '    print(tich_chap)',
      ],
    },
    make: {
      prompt:
        'Tự cài tích chập 1D tổng quát (nhận tín hiệu và kernel bất kỳ độ dài).\n\nChương trình đọc 2 dòng input():\n- Dòng 1: tín hiệu, các số nguyên cách nhau dấu phẩy.\n- Dòng 2: kernel, các số nguyên cách nhau dấu phẩy.\n\nTrượt kernel qua tín hiệu (không đệm biên), tính tích chập tại mỗi vị trí, rồi in đúng 1 dòng:\nTich chap: <ket_qua_1>,<ket_qua_2>,...\n\nNếu kernel dài hơn tín hiệu thì không trượt được lần nào — in "Tich chap: " (danh sách rỗng).',
      starterCode: `tin_hieu = [int(x) for x in input("Tin hieu: ").split(",")]\nkernel = [int(x) for x in input("Kernel: ").split(",")]\n# Truot kernel qua tin_hieu, tinh tich chap tung vi tri\n# In: Tich chap: v0,v1,v2,...\n`,
      testCases: [
        {
          stdinLines: ['1,1,1,5,5,5,1,1,1', '1,0,-1'],
          expected: 'Tich chap: 0,-4,-4,0,4,4,0',
          match: 'contains',
          hidden: false,
          label: 'Kernel dò cạnh [1,0,-1] bắt được cả hai bước nhảy của tín hiệu',
        },
        {
          stdinLines: ['2,4,6,8', '1,-1'],
          expected: 'Tich chap: -2,-2,-2',
          match: 'contains',
          hidden: false,
          label: 'Tín hiệu tăng đều 2 mỗi bước → chênh lệch không đổi -2',
        },
        {
          stdinLines: ['3', '1,1'],
          expected: 'Tich chap: ',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: kernel dài hơn tín hiệu → không trượt được lần nào, danh sách rỗng',
        },
      ],
      hints: [
        'Số vị trí trượt được là len(tin_hieu) - len(kernel) + 1 — nếu số này <= 0 thì vòng lặp range() tự rỗng, không cần if riêng.',
        'Tại mỗi vị trí i: doan = tin_hieu[i:i+len(kernel)] rồi tich_chap = sum(a*b for a,b in zip(doan, kernel)).',
        'Gom hết kết quả vào một list rồi join: print("Tich chap: " + ",".join(str(v) for v in ket_qua)).',
      ],
      sampleSolution: `tin_hieu = [int(x) for x in input("Tin hieu: ").split(",")]\nkernel = [int(x) for x in input("Kernel: ").split(",")]\nket_qua = []\nfor i in range(len(tin_hieu) - len(kernel) + 1):\n    doan = tin_hieu[i:i + len(kernel)]\n    ket_qua.append(sum(a * b for a, b in zip(doan, kernel)))\nprint("Tich chap: " + ",".join(str(v) for v in ket_qua))`,
    },
    homework:
      'Ba tình huống dữ liệu: (1) ảnh chụp X-quang phổi cần phát hiện đốm bất thường, (2) một câu hỏi khách hàng chat gửi tới, cần hiểu ý toàn câu, (3) mạng lưới bạn bè trên mạng xã hội để gợi ý kết bạn. Với mỗi tình huống, chọn kiến trúc hợp nhất trong 4 cái (CNN / RNN-Transformer / GNN / autoencoder để phát hiện bất thường) và giải thích bằng 1 câu VÌ SAO cấu trúc dữ liệu đó hợp với kiến trúc đó.',
    srsCards: [
      {
        hoi: 'CNN dùng cho loại dữ liệu nào và ý tưởng lõi (tích chập) là gì?',
        dap: 'Dữ liệu có cấu trúc không gian cục bộ (ảnh, tín hiệu). Tích chập: trượt một kernel nhỏ qua tín hiệu, tại mỗi vị trí nhân-cộng để dò một hoa văn cục bộ (cạnh, góc) — dùng chung kernel cho toàn ảnh nên ít tham số hơn MLP.',
      },
      {
        hoi: 'RNN khác Transformer ở cách xử lý chuỗi như thế nào?',
        dap: 'RNN đọc TUẦN TỰ, giữ trạng thái ẩn tóm tắt quá khứ — chậm và khó nhớ ngữ cảnh xa. Transformer dùng ATTENTION: mỗi vị trí nhìn TOÀN BỘ chuỗi cùng lúc, tính song song được nên nhanh hơn — nền tảng của GPT/BERT hiện nay.',
      },
      {
        hoi: 'GNN và autoencoder dùng để làm gì?',
        dap: 'GNN xử lý dữ liệu dạng ĐỒ THỊ (mạng xã hội, phân tử — mỗi nút nhìn hàng xóm). Autoencoder tự học NÉN rồi GIẢI NÉN dữ liệu; tín hiệu bất thường bị tái tạo kém hơn nên dùng để giảm nhiễu hoặc phát hiện bất thường.',
      },
    ],
  },
  {
    id: 'ml-u4-l4',
    unitId: 'ml-u4',
    language: 'python',
    title: 'AI tạo sinh — hạt giống của ChatGPT: mô hình bigram đoán từ tiếp theo',
    hook: 'Gõ "Chào" vào điện thoại, bàn phím gợi ý "bạn". Gõ tiếp, nó gợi "khoẻ không?". ChatGPT làm việc y hệt vậy — chỉ là mạnh hơn hàng tỷ lần: DỰ ĐOÁN TỪ TIẾP THEO, lặp lại liên tục. Hôm nay bạn tự cài đúng hạt giống nguyên thuỷ của ý tưởng đó.',
    theory:
      'AI TẠO SINH (generative AI) sinh ra nội dung MỚI (văn bản, ảnh, âm thanh) thay vì chỉ đoán nhãn/con số như các chương trước. Với văn bản, mô hình ngôn ngữ (language model) như GPT về bản chất làm một việc lặp đi lặp lại: cho một đoạn văn bản, DỰ ĐOÁN TỪ (chính xác hơn là "token") TIẾP THEO có khả năng cao nhất, rồi nối vào và lặp lại.\n\nMô hình BIGRAM là phiên bản tối giản nhất của ý tưởng này: chỉ nhìn ĐÚNG MỘT từ liền trước để đoán từ tiếp theo. Học = đếm trong văn bản mẫu, với mỗi từ, những từ nào theo sau nó và bao nhiêu lần. Sinh văn bản (kiểu GREEDY, tất định) = từ từ hiện tại, chọn từ tiếp theo có TẦN SUẤT cao nhất trong dữ liệu đã đếm.\n\nGPT thật khác bigram ở quy mô và độ tinh vi: nhìn HÀNG NGHÌN từ ngữ cảnh (không chỉ 1), dùng Transformer (bài 3) thay vì bảng đếm, và thường chọn từ tiếp theo theo XÁC SUẤT có pha ngẫu nhiên (sampling) thay vì luôn chọn cái cao nhất (greedy) — để văn bản sinh ra đa dạng, không lặp một khuôn. Nhưng NGUYÊN LÝ GỐC — dự đoán token tiếp theo từ ngữ cảnh — không đổi.\n\nNhánh AI tạo sinh cho ẢNH đi con đường khác: DIFFUSION MODELS khởi đầu từ một tấm nhiễu ngẫu nhiên thuần tuý, rồi lặp nhiều bước KHỬ NHIỄU dần cho tới khi hiện ra một ảnh có nghĩa (Midjourney, Stable Diffusion đi hướng này). GAN (Generative Adversarial Network) huấn luyện HAI mạng đấu nhau: một mạng GENERATOR cố sinh ảnh giả đánh lừa, một mạng DISCRIMINATOR cố phân biệt thật/giả — cả hai cùng giỏi lên qua từng vòng đấu. MULTIMODAL MODELS (đa phương thức) xử lý được NHIỀU loại dữ liệu cùng lúc trong một mô hình — vừa hiểu ảnh vừa hiểu văn bản, trả lời được câu hỏi về một bức ảnh bạn gửi lên.',
    workedExample: {
      code: `# Mo hinh bigram: dem tu nao theo sau tu nao, roi sinh tiep theo kieu greedy
van_ban = "toi thich hoc toi thich choi toi di hoc"
tu = van_ban.split()

dem = {}                              # dem[tu_hien_tai][tu_tiep_theo] = so lan
for i in range(len(tu) - 1):
    hien_tai = tu[i]
    tiep_theo = tu[i + 1]
    if hien_tai not in dem:
        dem[hien_tai] = {}
    dem[hien_tai][tiep_theo] = dem[hien_tai].get(tiep_theo, 0) + 1

def du_doan_tiep(tu_hien_tai):
    if tu_hien_tai not in dem:
        return None
    return max(dem[tu_hien_tai], key=lambda k: dem[tu_hien_tai][k])  # tan suat cao nhat

print(f"Sau 'toi': {du_doan_tiep('toi')}")
print(f"Sau 'thich': {du_doan_tiep('thich')}")`,
      stdinLines: [],
    },
    predict: {
      code: `van_ban = "meo an ca meo an chuot"\ntu = van_ban.split()\ndem = {}\nfor i in range(len(tu) - 1):\n    hien_tai = tu[i]\n    tiep_theo = tu[i + 1]\n    if hien_tai not in dem:\n        dem[hien_tai] = {}\n    dem[hien_tai][tiep_theo] = dem[hien_tai].get(tiep_theo, 0) + 1\nprint(max(dem['an'], key=lambda k: dem['an'][k]))`,
      question: 'Sau từ "an", mô hình bigram này dự đoán từ nào?',
      choices: ['ca', 'chuot', 'meo', 'an'],
      answerIndex: 0,
      explain:
        '"an" theo sau bởi "ca" (1 lần) và "chuot" (1 lần) — HOÀ. Khi hoà, max() trong Python trả về phần tử ĐẦU TIÊN đạt giá trị lớn nhất theo thứ tự duyệt dict — mà "ca" được thêm vào dict trước "chuot" (xuất hiện ở vị trí sớm hơn trong văn bản), nên thắng.',
    },
    parsons: {
      prompt:
        'Xếp đúng vòng lặp đếm bigram: tách từ liền kề → khởi tạo dict con nếu chưa có → cộng dồn số đếm.',
      lines: [
        'for i in range(len(tu) - 1):',
        '    hien_tai = tu[i]',
        '    tiep_theo = tu[i + 1]',
        '    if hien_tai not in dem:',
        '        dem[hien_tai] = {}',
        '    dem[hien_tai][tiep_theo] = dem[hien_tai].get(tiep_theo, 0) + 1',
      ],
    },
    make: {
      prompt:
        'Tự cài mô hình bigram sinh văn bản kiểu greedy.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: văn bản mẫu để học (các từ cách nhau bởi dấu cách).\n- Dòng 2: từ bắt đầu sinh.\n- Dòng 3: số từ muốn sinh THÊM (số nguyên).\n\nHọc bảng đếm bigram từ văn bản mẫu. Bắt đầu từ từ ở dòng 2, lặp đúng số lần ở dòng 3: nếu từ hiện tại có trong bảng đếm thì nối thêm từ có tần suất cao nhất, còn không thì DỪNG NGAY (không sinh thêm được nữa). In đúng 1 dòng:\nCau sinh: <cac tu cach nhau boi dau cach>',
      starterCode: `van_ban = input("Van ban mau: ")\ntu_bat_dau = input("Tu bat dau: ")\nso_buoc = int(input("So tu sinh them: "))\n# Hoc bang dem bigram tu van_ban, roi sinh greedy tu tu_bat_dau\n# In: Cau sinh: <cac tu cach nhau boi dau cach>\n`,
      testCases: [
        {
          stdinLines: ['toi thich hoc toi thich choi toi di hoc', 'toi', '3'],
          expected: 'Cau sinh: toi thich hoc toi',
          match: 'contains',
          hidden: false,
          label: 'Sinh 3 từ từ "toi": lặp đúng chu trình toi→thich→hoc→toi',
        },
        {
          stdinLines: ['toi thich hoc toi thich choi toi di hoc', 'di', '2'],
          expected: 'Cau sinh: di hoc toi',
          match: 'contains',
          hidden: false,
          label: 'Sinh 2 từ từ "di": di→hoc→toi',
        },
        {
          stdinLines: ['toi thich hoc toi thich choi toi di hoc', 'meo', '5'],
          expected: 'Cau sinh: meo',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: "meo" chưa từng gặp trong văn bản mẫu → dừng ngay, chỉ có từ bắt đầu',
        },
      ],
      hints: [
        'Học bảng đếm y hệt ví dụ mẫu trước (vòng for qua các cặp từ liền kề của van_ban.split()).',
        'Sinh: ket_qua = [tu_bat_dau], hien_tai = tu_bat_dau; lặp so_buoc lần, nếu hien_tai not in dem thì break, còn không thì hien_tai = max(dem[hien_tai], key=...) rồi append vào ket_qua.',
        'In: print("Cau sinh: " + " ".join(ket_qua)).',
      ],
      sampleSolution: `van_ban = input("Van ban mau: ")\ntu_bat_dau = input("Tu bat dau: ")\nso_buoc = int(input("So tu sinh them: "))\ntu = van_ban.split()\ndem = {}\nfor i in range(len(tu) - 1):\n    hien_tai = tu[i]\n    tiep_theo = tu[i + 1]\n    if hien_tai not in dem:\n        dem[hien_tai] = {}\n    dem[hien_tai][tiep_theo] = dem[hien_tai].get(tiep_theo, 0) + 1\nket_qua = [tu_bat_dau]\nhien_tai = tu_bat_dau\nfor _ in range(so_buoc):\n    if hien_tai not in dem:\n        break\n    hien_tai = max(dem[hien_tai], key=lambda k: dem[hien_tai][k])\n    ket_qua.append(hien_tai)\nprint("Cau sinh: " + " ".join(ket_qua))`,
    },
    homework:
      'Chạy bài Make với một đoạn văn bản dài hơn của chính bạn (chép một đoạn tin nhắn hay ghi chú ~30-40 từ). Sinh thử 10 từ từ vài từ bắt đầu khác nhau. Câu sinh ra có nghĩa không, hay lặp vòng vô tận? Vì sao mô hình bigram (chỉ nhớ 1 từ trước) dễ "kẹt vòng lặp" hơn hẳn GPT thật (nhớ hàng nghìn từ ngữ cảnh) — trả lời bằng 2-3 câu.',
    srsCards: [
      {
        hoi: 'Mô hình bigram học và sinh văn bản (kiểu greedy) qua các bước nào?',
        dap: 'Học: đếm trong văn bản mẫu, với mỗi từ, những từ nào theo sau nó và bao nhiêu lần. Sinh: từ từ hiện tại, chọn từ tiếp theo có tần suất cao nhất trong bảng đếm, nối vào, lặp lại — đây là hạt giống nguyên thuỷ của "dự đoán token tiếp theo" mà GPT dùng ở quy mô lớn hơn nhiều.',
      },
      {
        hoi: 'Diffusion model và GAN sinh ảnh khác nhau ở cơ chế nào?',
        dap: 'Diffusion: khởi đầu từ nhiễu ngẫu nhiên, lặp nhiều bước KHỬ NHIỄU dần thành ảnh có nghĩa. GAN: hai mạng đấu nhau — generator cố sinh ảnh giả đánh lừa, discriminator cố phân biệt thật/giả — cả hai cùng giỏi lên qua từng vòng huấn luyện.',
      },
      {
        hoi: 'Multimodal model là gì?',
        dap: 'Mô hình xử lý được NHIỀU LOẠI dữ liệu cùng lúc trong một hệ thống (vd vừa ảnh vừa văn bản) — trả lời được câu hỏi về nội dung một bức ảnh, thay vì chỉ xử lý một loại dữ liệu như các mô hình chuyên biệt trước đó.',
      },
    ],
  },
  {
    id: 'ml-u4-l5',
    unitId: 'ml-u4',
    language: 'python',
    title: 'Naive Bayes & mô hình đồ thị xác suất — tổng kết toàn khoá',
    hook: 'Thấy các từ "trúng thưởng", "khẩn", "miễn phí" xuất hiện dày đặc trong một tin nhắn, bạn nghi ngay đó là rác — dựa thuần trên KINH NGHIỆM tần suất, không đọc kỹ ngữ pháp. NAIVE BAYES làm đúng như bản năng đó, bằng một công thức xác suất cực đơn giản mà vẫn hiệu quả tới tận hôm nay.',
    theory:
      'NAIVE BAYES là bộ phân loại dựa trên xác suất: với mỗi LỚP (spam/không-spam), nó biết những từ đặc trưng nào hay xuất hiện và bao nhiêu lần trong lớp đó (học từ dữ liệu, giống bảng đếm bigram bài trước). Với một câu MỚI, nó tính "điểm phù hợp" cho từng lớp bằng cách NHÂN tần suất của TỪNG từ trong câu theo lớp đó lại với nhau, rồi chọn lớp có điểm cao hơn.\n\nChữ "NAIVE" (ngây thơ) nằm ở giả định: các từ trong câu ĐỘC LẬP với nhau về mặt xác suất — thực tế các từ trong câu thật liên quan chặt (ngữ pháp, ngữ cảnh), nhưng giả định đơn giản hoá này làm phép tính rẻ tới mức chạy được trên hàng triệu email mỗi giây, và trên thực tế vẫn phân loại tốt dù giả định "ngây thơ" không hoàn toàn đúng.\n\nTừ chưa từng gặp trong lớp nào đó không được gán tần suất 0 tuyệt đối (nhân với 0 sẽ xoá sạch điểm của cả câu chỉ vì MỘT từ lạ) — kỹ thuật LÀM MỊN (smoothing) gán một giá trị mặc định nhỏ (vd 1) cho từ lạ thay vì 0. Bài này dùng bản đơn giản nhất của làm mịn để giữ code ngắn gọn.\n\nHọ hàng trên bản đồ mô hình xác suất: BAYESIAN NETWORK biểu diễn quan hệ NHÂN QUẢ/phụ thuộc giữa nhiều biến bằng một ĐỒ THỊ có hướng (vd "trời mưa" ảnh hưởng tới "đường trơn" ảnh hưởng tới "tai nạn") — không ngây thơ như Naive Bayes, cho phép biến phụ thuộc lẫn nhau theo cấu trúc rõ ràng. MARKOV RANDOM FIELD tương tự nhưng dùng đồ thị VÔ HƯỚNG (quan hệ hai chiều, không nhân-quả). HMM (Hidden Markov Model) mô hình hoá một CHUỖI trạng thái ẩn sinh ra chuỗi quan sát thấy được (dùng trong nhận dạng giọng nói, gán nhãn từ loại) — về bản chất là bigram bài trước cộng thêm một lớp trạng thái "ẩn" không quan sát trực tiếp được.\n\n--- TỔNG KẾT TOÀN KHOÁ "HỌC MÁY — TỪ HỒI QUY ĐẾN AI TẠO SINH" ---\nBốn chương, mười hai nhánh, một bản đồ:\nC1 Học có giám sát: mô hình ngưỡng · hồi quy tuyến tính · k-NN phân loại · train/test & accuracy · overfitting.\nC2 Học không giám sát: gom cụm (k-means) · giảm chiều · luật kết hợp.\nC3 Học tăng cường & ensemble: agent thử-sai theo thưởng/phạt · rừng ngẫu nhiên/boosting · học lai (semi-/self-supervised, transfer).\nC4 Học sâu & AI tạo sinh: nơ-ron/MLP · gradient descent · CNN/RNN/Transformer · mô hình sinh văn bản · Naive Bayes/mô hình đồ thị xác suất.\nMỗi bài trong 4 chương này đều tự cài được bằng Python thuần — đó là NỀN, đủ để bạn ĐỌC HIỂU và KHÔNG SỢ bất kỳ bài báo/tài liệu ML nào nữa.\n\nMuốn học ML THÀNH NGHỀ — không dừng ở nền tảng — hướng chuyên sâu "Trí tuệ nhân tạo & Học máy" (`/lap-trinh/huong/ai`) của môn Lập trình đi tiếp đúng 4 nhánh này với chiều sâu 12-18 tháng qua 4 chặng S1→S4: S1 ứng dụng LLM (prompt engineering, RAG, agent) · S2 học máy cổ điển (scikit-learn, feature engineering, đánh giá mô hình thật) · S3 học sâu (PyTorch, huấn luyện mạng thật trên GPU) · S4 MLOps (đưa mô hình vào sản xuất, theo dõi, tái huấn luyện). Khoá "Học máy" này chính là tấm bản đồ để bạn bước vào hướng đó mà không lạc.',
    workedExample: {
      code: `# Naive Bayes phan loai van ban: tan suat tu theo tung lop
tu_dac_trung = {
    "spam": {"trung": 5, "thuong": 4, "ngay": 2},
    "khong_spam": {"hoc": 5, "bai": 4, "diem": 3},
}

def tinh_diem(cau, lop):
    diem = 1
    for tu in cau:
        diem *= tu_dac_trung[lop].get(tu, 1)   # tu la: mac dinh 1 (lam min)
    return diem

def phan_loai(cau):
    diem_spam = tinh_diem(cau, "spam")
    diem_khong = tinh_diem(cau, "khong_spam")
    return "spam" if diem_spam > diem_khong else "khong_spam"

print(phan_loai(["trung", "thuong", "ngay"]))
print(phan_loai(["hoc", "bai", "diem"]))`,
      stdinLines: [],
    },
    predict: {
      code: `tu_dac_trung = {"spam": {"trung": 5}, "khong_spam": {"hoc": 5}}\ndef tinh_diem(cau, lop):\n    diem = 1\n    for tu in cau:\n        diem *= tu_dac_trung[lop].get(tu, 1)\n    return diem\ncau = ["trung"]\ndiem_spam = tinh_diem(cau, "spam")\ndiem_khong = tinh_diem(cau, "khong_spam")\nprint("spam" if diem_spam > diem_khong else "khong_spam")`,
      question: 'Câu chỉ có từ "trung" (đặc trưng riêng của spam) được phân loại là gì?',
      choices: ['spam', 'khong_spam', 'Báo lỗi', 'Không in gì'],
      answerIndex: 0,
      explain:
        'diem_spam = 5 (tần suất "trung" trong lớp spam). diem_khong = 1 (từ "trung" lạ với lớp khong_spam, làm mịn về 1). 5 > 1 nên chọn "spam" — đúng bản năng: từ càng đặc trưng cho một lớp thì điểm lớp đó càng vượt trội.',
    },
    parsons: {
      prompt:
        'Xếp đúng Naive Bayes: tính điểm từng lớp bằng tích tần suất từng từ → so sánh → chọn lớp điểm cao hơn.',
      lines: [
        'def tinh_diem(cau, lop):',
        '    diem = 1',
        '    for tu in cau:',
        '        diem *= tu_dac_trung[lop].get(tu, 1)',
        '    return diem',
        'diem_spam = tinh_diem(cau, "spam")',
        'diem_khong = tinh_diem(cau, "khong_spam")',
      ],
    },
    make: {
      prompt:
        'Tự cài bộ phân loại Naive Bayes 2 lớp với bảng tần suất cố định (đã cho sẵn trong starter code).\n\nChương trình đọc 1 dòng input(): một câu, các từ cách nhau bởi dấu cách.\n\nTính điểm mỗi lớp bằng tích tần suất từng từ (từ lạ mặc định tần suất 1). Nếu điểm spam LỚN HƠN điểm khong_spam thì chọn "spam", còn lại (kể cả hoà) chọn "khong_spam". In đúng 1 dòng:\nPhan loai: <spam hoac khong_spam>',
      starterCode: `tu_dac_trung = {\n    "spam": {"trung": 5, "thuong": 4, "ngay": 2},\n    "khong_spam": {"hoc": 5, "bai": 4, "diem": 3},\n}\ncau = input("Cau can phan loai: ").split()\n# Tinh diem tung lop bang tich tan suat tung tu (mac dinh 1 neu tu la)\n# In: Phan loai: <spam hoac khong_spam>\n`,
      testCases: [
        {
          stdinLines: ['trung thuong ngay'],
          expected: 'Phan loai: spam',
          match: 'contains',
          hidden: false,
          label: 'Toàn từ đặc trưng spam → điểm spam vượt trội',
        },
        {
          stdinLines: ['hoc bai diem'],
          expected: 'Phan loai: khong_spam',
          match: 'contains',
          hidden: false,
          label: 'Toàn từ đặc trưng khong_spam → điểm khong_spam vượt trội',
        },
        {
          stdinLines: ['abc xyz'],
          expected: 'Phan loai: khong_spam',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cả hai từ đều lạ (điểm hoà 1 và 1) → quy ước hoà thì chọn khong_spam',
        },
      ],
      hints: [
        'Hàm tính điểm: diem = 1, rồi for tu in cau: diem *= tu_dac_trung[lop].get(tu, 1) — .get(tu, 1) là chỗ làm mịn cho từ lạ.',
        'Tính diem_spam và diem_khong bằng hàm đó cho 2 lớp "spam" và "khong_spam".',
        'So sánh: print("Phan loai: spam" if diem_spam > diem_khong else "Phan loai: khong_spam") — chú ý dùng > (hoà thì rơi vào khong_spam).',
      ],
      sampleSolution: `tu_dac_trung = {\n    "spam": {"trung": 5, "thuong": 4, "ngay": 2},\n    "khong_spam": {"hoc": 5, "bai": 4, "diem": 3},\n}\ncau = input("Cau can phan loai: ").split()\ndef tinh_diem(lop):\n    diem = 1\n    for tu in cau:\n        diem *= tu_dac_trung[lop].get(tu, 1)\n    return diem\ndiem_spam = tinh_diem("spam")\ndiem_khong = tinh_diem("khong_spam")\nprint("Phan loai: spam" if diem_spam > diem_khong else "Phan loai: khong_spam")`,
    },
    homework:
      'BÀI TẬP TỔNG KẾT: mở lại 5 bài của cả 4 chương trong đầu (không cần xem lại code), với mỗi chương viết ĐÚNG MỘT câu nêu ý tưởng cốt lõi (vd C1: "học có giám sát là tìm quy luật từ dữ liệu có kèm đáp án"). Sau đó tự hỏi: trong 12 nhánh của bản đồ, nhánh nào bạn thấy TÒ MÒ muốn đào sâu nhất? Nếu câu trả lời liên quan tới ứng dụng LLM, học máy cổ điển, học sâu hay đưa mô hình vào sản xuất — hướng chuyên sâu "Trí tuệ nhân tạo & Học máy" (`/lap-trinh/huong/ai`) của môn Lập trình chính là bước tiếp theo, đi sâu 12-18 tháng qua 4 chặng S1→S4.',
    srsCards: [
      {
        hoi: 'Naive Bayes phân loại một câu mới bằng cách nào, và vì sao gọi là "naive" (ngây thơ)?',
        dap: 'Tính điểm mỗi lớp bằng TÍCH tần suất từng từ trong câu theo lớp đó, chọn lớp điểm cao hơn. "Ngây thơ" vì giả định các từ ĐỘC LẬP xác suất với nhau — thực tế không đúng hoàn toàn nhưng vẫn hiệu quả và rẻ để tính.',
      },
      {
        hoi: 'Làm mịn (smoothing) trong Naive Bayes giải quyết vấn đề gì?',
        dap: 'Nếu một từ chưa từng gặp trong một lớp mà gán tần suất 0, nhân với 0 sẽ xoá sạch điểm của cả câu chỉ vì một từ lạ. Làm mịn gán một giá trị mặc định nhỏ (vd 1) cho từ lạ thay vì 0, giữ phép tính hợp lý.',
      },
      {
        hoi: 'Bayesian network và HMM khác Naive Bayes ở điểm nào?',
        dap: 'Bayesian network biểu diễn quan hệ nhân quả/phụ thuộc giữa nhiều biến bằng đồ thị có hướng — không giả định độc lập như Naive Bayes. HMM mô hình một chuỗi trạng thái ẩn sinh ra chuỗi quan sát (dùng cho giọng nói, gán nhãn từ loại) — như bigram cộng thêm một lớp trạng thái ẩn.',
      },
      {
        hoi: 'Học xong khoá "Học máy" này, muốn theo ML thành nghề thì đi tiếp ở đâu?',
        dap: 'Hướng chuyên sâu "Trí tuệ nhân tạo & Học máy" (/lap-trinh/huong/ai) của môn Lập trình — 4 chặng S1→S4 trong 12-18 tháng: ứng dụng LLM, học máy cổ điển, học sâu (PyTorch), rồi MLOps đưa mô hình vào sản xuất.',
      },
    ],
  },
]

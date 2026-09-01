// lessons/cv2u2.ts — Chương 2 của khoá ngắn "Deep Learning for CV nâng cao"
// (docs/specs/2026-09-01-cv2-bai-hoc-chi-tiet.md). Nội dung chép nguyên văn từ đặc tả.
//
// unitId 'cv2-u2' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi bài đều language 'python' và code được chấm là Python THUẦN
// (chỉ math chuẩn, không numpy/torch) để Pyodide trình duyệt và python3 CI chấm y hệt nhau.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const CV2_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'cv2-u2-l1',
    unitId: 'cv2-u2',
    language: 'python',
    title: 'Bài toán phát hiện vật — hộp, lớp và điểm tin cậy',
    hook: 'Phân loại ảnh trả lời "trong ảnh có gì" — một chữ. Xe tự lái cần nhiều hơn: có gì, ở ĐÂU, và bao nhiêu cái. Nó không hỏi "ảnh này có người không" mà hỏi "có 3 người, người gần nhất cách 4 mét, ở góc dưới trái".',
    theory:
      'PHÁT HIỆN VẬT (object detection) = với mỗi vật trong ảnh, trả về BỘ BA:\n1. HỘP BAO (bounding box) — vị trí. Hai định dạng thông dụng, lẫn nhau là sai hết: (x1, y1, x2, y2) tức góc trên-trái và góc dưới-phải; hoặc (cx, cy, w, h) tức tâm và kích thước. Khoá này dùng định dạng thứ nhất. Toạ độ ảnh có gốc ở GÓC TRÊN-TRÁI, y tăng khi đi XUỐNG — khác trục toạ độ toán học quen thuộc.\n2. LỚP (class) — vật gì: người, xe, chó…\n3. ĐIỂM TIN CẬY (confidence) — mô hình chắc bao nhiêu, số thực 0–1.\n\nMô hình thật không nhả ra vài hộp gọn ghẽ: YOLO đưa ra HÀNG NGHÌN hộp ứng viên cho mỗi ảnh. Hai bước lọc luôn đi kèm, và đây là toàn bộ chương 2:\n- LỌC THEO NGƯỠNG TIN CẬY: bỏ hộp có điểm dưới ngưỡng (thường 0,25–0,5). Bài này.\n- NON-MAX SUPPRESSION: gộp các hộp chồng nhau cùng chỉ một vật (bài 3), dựa trên thước đo IoU (bài 2).\n\nChọn ngưỡng tin cậy là một QUYẾT ĐỊNH SẢN PHẨM chứ không phải hằng số kỹ thuật: ngưỡng cao → ít báo động giả nhưng bỏ lọt vật (nguy hiểm cho xe tự lái); ngưỡng thấp → bắt được gần hết nhưng nhiễu (mệt cho camera an ninh báo về điện thoại lúc 3 giờ sáng). Đúng cặp precision/recall của bài `ml-u1-l4`, chỉ là mặc áo thị giác máy tính.',
    workedExample: {
      code: `# Ba hop ung vien tu mo hinh: (x1, y1, x2, y2, lop, diem tin cay)
boxes = [
    (0, 0, 10, 10, "nguoi", 0.92),
    (5, 5, 15, 20, "xe", 0.45),
    (20, 20, 30, 26, "cho", 0.77),
]

nguong = 0.5                       # quyet dinh san pham, khong phai hang so
for (x1, y1, x2, y2, nhan, diem) in boxes:
    rong = x2 - x1                 # chieu rong hop
    cao = y2 - y1                  # chieu cao hop (y tang khi di XUONG)
    trang_thai = "GIU" if diem >= nguong else "BO"
    print(f"{nhan}: {rong}x{cao}, dien tich {rong * cao}, diem {diem} -> {trang_thai}")`,
      stdinLines: [],
    },
    predict: {
      code: `x1, y1, x2, y2 = 2, 3, 8, 9\nprint((x2 - x1) * (y2 - y1))`,
      question: 'Hộp (2,3,8,9) có diện tích bao nhiêu?',
      choices: ['36', '48', '24', '18'],
      answerIndex: 0,
      explain:
        'Rộng = 8 − 2 = 6, cao = 9 − 3 = 6, diện tích = 36. Nhớ trừ đúng chiều: LUÔN là toạ độ lớn trừ toạ độ nhỏ. Đảo ngược sẽ ra số âm và làm hỏng IoU ở bài sau — đây là lỗi kinh điển của người mới.',
    },
    parsons: {
      prompt: 'Xếp đúng vòng lọc hộp theo ngưỡng tin cậy và in diện tích.',
      lines: [
        'giu = [b for b in boxes if b[5] >= nguong]',
        'print(f"So vat giu lai: {len(giu)}")',
        'for (x1, y1, x2, y2, nhan, diem) in giu:',
        '    print(f"{nhan}: dien tich {(x2 - x1) * (y2 - y1)}, diem {diem}")',
      ],
    },
    make: {
      prompt:
        'Viết bước lọc đầu tiên của mọi bộ phát hiện vật: bỏ các hộp có điểm tin cậy dưới ngưỡng.\n\nDanh sách hộp đã nhúng sẵn trong starter code, mỗi hộp là (x1, y1, x2, y2, lop, diem).\n\nChương trình đọc 1 dòng input(): ngưỡng tin cậy (số thực). Giữ lại hộp có điểm LỚN HƠN HOẶC BẰNG ngưỡng, giữ nguyên thứ tự ban đầu. In:\nSo vat giu lai: <n>\nrồi mỗi hộp giữ lại một dòng:\n<lop>: dien tich <(x2-x1)*(y2-y1)>, diem <diem>',
      starterCode: `boxes = [\n    (0, 0, 10, 10, "nguoi", 0.92),\n    (5, 5, 15, 20, "xe", 0.45),\n    (20, 20, 30, 26, "cho", 0.77),\n]\nnguong = float(input("Nguong tin cay: "))\n# Loc theo b[5] >= nguong roi in so luong va tung dong\n`,
      testCases: [
        {
          stdinLines: ['0.5'],
          expected:
            'So vat giu lai: 2\nnguoi: dien tich 100, diem 0.92\ncho: dien tich 60, diem 0.77',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 0.5 → loại "xe" (0.45), còn 2 vật',
        },
        {
          stdinLines: ['0.8'],
          expected: 'So vat giu lai: 1\nnguoi: dien tich 100, diem 0.92',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng cao 0.8 → chỉ còn "nguoi"',
        },
        {
          stdinLines: ['0.0'],
          expected: 'So vat giu lai: 3',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 0 → giữ hết (nhiều báo động giả)',
        },
        {
          stdinLines: ['0.95'],
          expected: 'So vat giu lai: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ngưỡng quá cao → không giữ vật nào, vẫn phải in dòng đếm',
        },
      ],
      hints: [
        'Lọc bằng list comprehension: giu = [b for b in boxes if b[5] >= nguong] — chỉ số 5 là điểm tin cậy.',
        'Dùng >= chứ không phải > (hộp đúng bằng ngưỡng vẫn được giữ).',
        'Diện tích = (x2 - x1) * (y2 - y1). Ca 0 hộp vẫn phải in dòng "So vat giu lai: 0" rồi kết thúc.',
      ],
      sampleSolution: `boxes = [\n    (0, 0, 10, 10, "nguoi", 0.92),\n    (5, 5, 15, 20, "xe", 0.45),\n    (20, 20, 30, 26, "cho", 0.77),\n]\nnguong = float(input("Nguong tin cay: "))\ngiu = [b for b in boxes if b[5] >= nguong]\nprint(f"So vat giu lai: {len(giu)}")\nfor (x1, y1, x2, y2, nhan, diem) in giu:\n    print(f"{nhan}: dien tich {(x2 - x1) * (y2 - y1)}, diem {diem}")`,
    },
    homework:
      'Chọn ngưỡng cho hai sản phẩm rồi biện hộ bằng 2–3 câu mỗi cái: (a) xe tự lái phát hiện người đi bộ; (b) camera an ninh gửi thông báo về điện thoại bạn ban đêm. Cùng một mô hình, cùng một tấm ảnh — vì sao hai ngưỡng phải khác nhau? Loại sai nào đắt hơn ở từng ca?',
    srsCards: [
      {
        hoi: 'Một kết quả phát hiện vật gồm những gì?',
        dap: 'Bộ ba: HỘP BAO (x1,y1,x2,y2 hoặc cx,cy,w,h — gốc toạ độ ở góc trên-trái, y tăng khi xuống) · LỚP của vật · ĐIỂM TIN CẬY 0–1. Khác phân loại ảnh chỉ trả về một nhãn cho cả ảnh.',
      },
      {
        hoi: 'Hai bước lọc sau khi mô hình detection nhả ra hàng nghìn hộp ứng viên?',
        dap: 'Lọc theo ngưỡng tin cậy (bỏ hộp điểm thấp, thường 0,25–0,5) rồi non-max suppression (gộp các hộp chồng nhau chỉ cùng một vật, dựa trên IoU).',
      },
      {
        hoi: 'Đặt ngưỡng tin cậy cao hay thấp thì đánh đổi gì?',
        dap: 'Cao: ít báo động giả (precision cao) nhưng bỏ lọt vật — nguy hiểm cho xe tự lái. Thấp: bắt gần hết (recall cao) nhưng nhiễu nhiều — phiền cho camera báo động. Chọn theo HẬU QUẢ của từng loại sai, không có giá trị đúng chung.',
      },
    ],
  },
  {
    id: 'cv2-u2-l2',
    unitId: 'cv2-u2',
    language: 'python',
    title: 'IoU tự cài — đo hai hộp trùng nhau bao nhiêu',
    hook: 'Mô hình khoanh người đi bộ ở (10,20)-(50,80); đáp án đúng là (12,22)-(48,78). Đúng hay sai? Không có "đúng/sai" — cần một CON SỐ đo độ trùng. Con số đó tên là IoU, và cả ngành object detection đứng trên nó: chấm điểm mô hình bằng nó, lọc hộp thừa cũng bằng nó.',
    theory:
      'IoU (Intersection over Union — giao trên hợp) = diện tích phần GIAO NHAU / diện tích phần HỢP LẠI. Kết quả luôn nằm trong [0, 1]: 0 là rời hẳn, 1 là trùng khít.\n\nCài đúng 4 bước, và bước 2 là chỗ ai cũng sai lần đầu:\n1. Hình chữ nhật GIAO: x1 = max(a.x1, b.x1), y1 = max(a.y1, b.y1), x2 = min(a.x2, b.x2), y2 = min(a.y2, b.y2). Nhớ mẹo: giao thì lấy MAX của hai mép trái và MIN của hai mép phải.\n2. Diện tích giao = max(0, x2 − x1) * max(0, y2 − y1). BẮT BUỘC có max(0, …): hai hộp rời nhau cho x2 − x1 ÂM, nhân hai số âm ra số DƯƠNG — IoU sẽ dương một cách vô lý cho hai hộp chẳng dính gì nhau. Đây là lỗi kinh điển, và nó im lặng: code chạy, không báo lỗi, chỉ ra số sai.\n3. Diện tích hợp = dt_A + dt_B − dt_giao (trừ đi vì phần giao đã bị đếm hai lần).\n4. IoU = giao / hợp, phòng chia cho 0 khi cả hai hộp suy biến.\n\nDùng IoU ở hai chỗ, phải phân biệt:\n- CHẤM ĐIỂM mô hình: một dự đoán được tính là ĐÚNG nếu IoU với hộp thật ≥ ngưỡng. Chỉ số mAP@0.5 nghĩa là ngưỡng 0,5; mAP@[.5:.95] là trung bình qua nhiều ngưỡng từ 0,5 đến 0,95 — chuẩn khắt khe của bộ COCO.\n- LỌC hộp trùng: chính là NMS ở bài sau.\n\nHọ hàng cần biết mặt: GIoU, DIoU, CIoU — các biến thể vá điểm yếu "IoU bằng 0 thì không có gradient để học" khi hai hộp chưa hề chạm nhau.',
    workedExample: {
      code: `# IoU cua hai hop chong nhau mot goc
a = (0, 0, 10, 10)          # (x1, y1, x2, y2)
b = (5, 5, 15, 15)

x1 = max(a[0], b[0])        # mep trai cua phan giao: lay MAX
y1 = max(a[1], b[1])
x2 = min(a[2], b[2])        # mep phai cua phan giao: lay MIN
y2 = min(a[3], b[3])

rong = max(0, x2 - x1)      # max(0,..) BAT BUOC: hop roi nhau cho so am
cao = max(0, y2 - y1)
giao = rong * cao
print(f"Phan giao: {rong} x {cao} = {giao}")

dt_a = (a[2] - a[0]) * (a[3] - a[1])
dt_b = (b[2] - b[0]) * (b[3] - b[1])
hop = dt_a + dt_b - giao    # tru phan giao vi da dem hai lan
print(f"Phan hop: {dt_a} + {dt_b} - {giao} = {hop}")
print(f"IoU: {round(giao / hop, 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `a = (0, 0, 10, 10)\nb = (20, 20, 30, 30)\nx2, x1 = min(a[2], b[2]), max(a[0], b[0])\ny2, y1 = min(a[3], b[3]), max(a[1], b[1])\nprint((x2 - x1) * (y2 - y1))`,
      question: 'Hai hộp RỜI HẲN nhau — biểu thức thiếu max(0,…) này in ra gì?',
      choices: ['100', 'Khong tinh duoc', '-100', '200'],
      answerIndex: 0,
      explain:
        'x2 − x1 = 10 − 20 = −10 và y2 − y1 = −10; nhân hai số âm ra +100. Hai hộp cách nhau cả chục đơn vị mà "diện tích giao" lại là 100! Đây đúng là lý do phải bọc max(0, …) quanh từng chiều — lỗi này không hề báo, chỉ lặng lẽ trả số sai.',
    },
    parsons: {
      prompt:
        'Xếp đúng 4 bước tính IoU: hình chữ nhật giao → diện tích giao (có max 0) → hợp → chia.',
      lines: [
        'x1 = max(a[0], b[0])',
        'y1 = max(a[1], b[1])',
        'x2 = min(a[2], b[2])',
        'y2 = min(a[3], b[3])',
        'giao = max(0.0, x2 - x1) * max(0.0, y2 - y1)',
        'hop = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - giao',
        'print(f"IoU: {round(giao / hop, 4)}")',
      ],
    },
    make: {
      prompt:
        'Tự cài IoU cho hai hộp bất kỳ.\n\nChương trình đọc 2 dòng input(), mỗi dòng là một hộp dạng "x1,y1,x2,y2" (số thực, cách nhau dấu phẩy).\n\nIn đúng 2 dòng:\nDien tich giao: <giao làm tròn 2>\nIoU: <iou làm tròn 4>\n\nBẮT BUỘC dùng max(0.0, …) cho cả chiều rộng lẫn chiều cao phần giao. Nếu diện tích hợp bằng 0 thì IoU là 0.0.\n\nVí dụ: "0,0,10,10" và "5,5,15,15" → giao 25.0, IoU 0.1429.',
      starterCode: `a = [float(v) for v in input("Box A: ").split(",")]\nb = [float(v) for v in input("Box B: ").split(",")]\n# x1 = max(a[0], b[0]) ... x2 = min(a[2], b[2]) ...\n# giao = max(0.0, x2-x1) * max(0.0, y2-y1)\n# hop = dt_a + dt_b - giao ; iou = giao / hop (phong hop == 0)\n`,
      testCases: [
        {
          stdinLines: ['0,0,10,10', '5,5,15,15'],
          expected: 'Dien tich giao: 25.0\nIoU: 0.1429',
          match: 'contains',
          hidden: false,
          label: 'Chồng một góc: giao 25, hợp 175 → 0.1429',
        },
        {
          stdinLines: ['0,0,10,10', '0,0,10,10'],
          expected: 'Dien tich giao: 100.0\nIoU: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Trùng khít → IoU đúng bằng 1.0',
        },
        {
          stdinLines: ['0,0,10,10', '20,20,30,30'],
          expected: 'Dien tich giao: 0.0\nIoU: 0.0',
          match: 'contains',
          hidden: false,
          label: 'Rời hẳn → 0.0 (thiếu max(0,..) sẽ ra 100, sai!)',
        },
        {
          stdinLines: ['0,0,4,4', '2,0,6,4'],
          expected: 'IoU: 0.3333',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chồng nửa theo chiều ngang — giao 8, hợp 24',
        },
      ],
      hints: [
        'Phần giao: mép trái lấy MAX của hai x1, mép phải lấy MIN của hai x2 (tương tự cho y).',
        'Đừng quên max(0.0, x2 - x1) và max(0.0, y2 - y1) — không có nó thì hai hộp rời nhau ra IoU dương, sai âm thầm.',
        'hop = dt_a + dt_b - giao (trừ vì phần giao bị đếm hai lần). In: round(giao, 2) và round(iou, 4).',
      ],
      sampleSolution: `a = [float(v) for v in input("Box A: ").split(",")]\nb = [float(v) for v in input("Box B: ").split(",")]\nx1 = max(a[0], b[0])\ny1 = max(a[1], b[1])\nx2 = min(a[2], b[2])\ny2 = min(a[3], b[3])\nrong = max(0.0, x2 - x1)\ncao = max(0.0, y2 - y1)\ngiao = rong * cao\ndt_a = (a[2] - a[0]) * (a[3] - a[1])\ndt_b = (b[2] - b[0]) * (b[3] - b[1])\nhop = dt_a + dt_b - giao\niou = giao / hop if hop > 0 else 0.0\nprint(f"Dien tich giao: {round(giao, 2)}")\nprint(f"IoU: {round(iou, 4)}")`,
    },
    homework:
      'Cố tình BỎ max(0.0, …) trong code của bạn rồi chạy lại ca "0,0,10,10" và "20,20,30,30". Ghi lại con số sai nhận được và giải thích bằng lời vì sao hai số âm nhân nhau lại ra diện tích dương. Sau đó tìm hai hộp có IoU khoảng 0,5 và vẽ ra giấy — cảm nhận xem "trùng một nửa" trông như thế nào, vì 0,5 chính là ngưỡng mặc định của mAP@0.5.',
    srsCards: [
      {
        hoi: 'Công thức IoU và ý nghĩa các giá trị?',
        dap: 'IoU = diện tích GIAO / diện tích HỢP, luôn trong [0,1]: 0 là rời hẳn, 1 là trùng khít. Hợp = dt_A + dt_B − dt_giao (trừ vì phần giao bị đếm hai lần).',
      },
      {
        hoi: 'Vì sao bắt buộc bọc max(0, …) khi tính diện tích giao?',
        dap: 'Hai hộp rời nhau cho x2−x1 và y2−y1 đều ÂM; nhân hai số âm ra diện tích DƯƠNG, khiến IoU dương một cách vô lý. Lỗi này không báo gì, chỉ âm thầm trả số sai.',
      },
      {
        hoi: 'IoU được dùng ở hai chỗ nào trong object detection?',
        dap: 'Chấm điểm (một dự đoán tính là đúng nếu IoU với hộp thật ≥ ngưỡng — mAP@0.5, mAP@[.5:.95]) và lọc hộp trùng trong non-max suppression.',
      },
    ],
  },
  {
    id: 'cv2-u2-l3',
    unitId: 'cv2-u2',
    language: 'python',
    title: 'Non-max suppression — 5 hộp chồng nhau, giữ lại 2',
    hook: 'YOLO nhìn một người đi bộ và nhả ra 40 hộp gần như chồng khít lên nhau, mỗi hộp lệch vài pixel. Không ai muốn thấy 40 khung đỏ quanh một người. Cần một luật thu dọn: giữ hộp tự tin nhất, dẹp mọi hộp trùng nó. Luật đó tên là NMS, và bạn sắp tự viết nó trong 12 dòng.',
    theory:
      'NON-MAX SUPPRESSION (NMS — triệt tiêu các đỉnh không lớn nhất) là thuật toán THAM LAM, đúng 4 bước:\n1. Sắp xếp mọi hộp theo điểm tin cậy GIẢM DẦN.\n2. Lấy hộp điểm cao nhất còn lại, ĐƯA VÀO kết quả giữ.\n3. LOẠI khỏi danh sách mọi hộp có IoU với hộp vừa giữ VƯỢT ngưỡng — chúng bị coi là "cũng chính vật đó".\n4. Lặp lại từ bước 2 cho tới khi danh sách rỗng.\n\nNgưỡng IoU của NMS là một núm vặn có hậu quả rõ ràng và ngược đời với trực giác lần đầu:\n- Ngưỡng THẤP (0,1–0,3): loại hăng, gộp mạnh → ít hộp còn lại. Rủi ro: hai vật thật đứng sát nhau (hai người ôm nhau, dãy xe kẹt đường) bị gộp thành một, MẤT một vật.\n- Ngưỡng CAO (0,7–0,9): loại dè dặt → nhiều hộp trùng sót lại quanh cùng một vật.\nGiá trị thông dụng là 0,45–0,5. Chú ý: NMS chạy RIÊNG cho từng lớp — hộp "người" chồng hộp "xe" thì không được loại nhau, vì đó là hai vật khác nhau thật.\n\nBiến thể phải biết tên: Soft-NMS (thay vì xoá thẳng thì HẠ điểm hộp chồng — tốt cho cảnh đông đúc); và các mô hình kiểu DETR bỏ hẳn NMS bằng cách huấn luyện với "ghép cặp Hungary" để mỗi vật chỉ sinh ra đúng một dự đoán (bài sau). Nói cách khác, NMS là miếng vá cho một kiến trúc nhả thừa; kiến trúc mới thì không cần vá.\n\nMột chi tiết cài đặt hay bị bỏ qua: dùng "IoU <= ngưỡng thì GIỮ" (không phải <) để ngưỡng 0.0 vẫn giữ được các hộp rời hẳn nhau (IoU đúng bằng 0).',
    workedExample: {
      code: `def iou(a, b):
    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])
    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])
    giao = max(0, x2 - x1) * max(0, y2 - y1)
    hop = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - giao
    return giao / hop if hop > 0 else 0.0

boxes = [(0, 0, 10, 10, 0.95), (1, 1, 11, 11, 0.90), (50, 50, 60, 60, 0.80)]
nguong = 0.5

con_lai = sorted(boxes, key=lambda b: -b[4])   # (1) sap theo diem GIAM dan
giu = []
while con_lai:
    tot_nhat = con_lai.pop(0)                  # (2) lay hop tu tin nhat
    giu.append(tot_nhat)
    # (3) loai moi hop trung no qua nguong; <= nguong thi GIU
    con_lai = [b for b in con_lai if iou(tot_nhat, b) <= nguong]
print(f"Con lai {len(giu)} hop tu {len(boxes)} hop ban dau")`,
      stdinLines: [],
    },
    predict: {
      code: `boxes = [(0, 0, 10, 10, 0.7), (0, 0, 10, 10, 0.9), (0, 0, 10, 10, 0.8)]\ncon = sorted(boxes, key=lambda b: -b[4])\nprint(con[0][4])`,
      question: 'Sau khi sắp xếp giảm dần theo điểm, hộp đầu tiên có điểm bao nhiêu?',
      choices: ['0.9', '0.7', '0.8', '1.0'],
      answerIndex: 0,
      explain:
        'key=lambda b: -b[4] đổi dấu điểm nên sort tăng dần theo số âm = giảm dần theo điểm thật → 0.9 đứng đầu. Bước sắp xếp này là linh hồn của NMS: hộp tự tin nhất luôn được chọn trước, mọi hộp trùng nó bị dẹp.',
    },
    parsons: {
      prompt: 'Xếp đúng vòng lặp NMS: sắp giảm dần → lấy hộp đầu → giữ → loại hộp trùng.',
      lines: [
        'con_lai = sorted(boxes, key=lambda b: -b[4])',
        'giu = []',
        'while con_lai:',
        '    tot_nhat = con_lai.pop(0)',
        '    giu.append(tot_nhat)',
        '    con_lai = [b for b in con_lai if iou(tot_nhat, b) <= nguong]',
      ],
    },
    make: {
      prompt:
        'Tự cài non-max suppression trên 5 hộp đã nhúng sẵn (mỗi hộp là (x1, y1, x2, y2, diem)).\n\nChương trình đọc 1 dòng input(): ngưỡng IoU (số thực).\n\nLàm đúng 4 bước: sắp giảm dần theo điểm → lấy hộp tốt nhất → giữ → loại mọi hộp có IoU VƯỢT ngưỡng (dùng "<= nguong thì giữ"). In:\nSo box con lai: <n>\nrồi mỗi hộp giữ lại một dòng theo thứ tự đã giữ:\n(<x1>,<y1>,<x2>,<y2>) diem <diem>\n\nVới ngưỡng 0.3 → còn 2 hộp.',
      starterCode: `boxes = [\n    (0, 0, 10, 10, 0.95),\n    (1, 1, 11, 11, 0.90),\n    (2, 0, 12, 10, 0.85),\n    (50, 50, 60, 60, 0.80),\n    (52, 52, 62, 62, 0.70),\n]\nnguong = float(input("Nguong IoU: "))\n\ndef iou(a, b):\n    # Chep lai cong thuc IoU cua bai truoc (nho max(0, ...))\n    return 0.0\n\n# sorted(..., key=lambda b: -b[4]) roi vong while nhu bai hoc\n`,
      testCases: [
        {
          stdinLines: ['0.3'],
          expected: 'So box con lai: 2\n(0,0,10,10) diem 0.95\n(50,50,60,60) diem 0.8',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 0.3 → 5 hộp gộp còn đúng 2 vật',
        },
        {
          stdinLines: ['0.5'],
          expected: 'So box con lai: 3',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 0.5 → cặp xa (IoU 0.47) không bị gộp nữa, còn 3',
        },
        {
          stdinLines: ['0.9'],
          expected: 'So box con lai: 5',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng quá cao → không loại ai, thừa hộp quanh cùng một vật',
        },
        {
          stdinLines: ['0.0'],
          expected: 'So box con lai: 2\n(0,0,10,10) diem 0.95\n(50,50,60,60) diem 0.8',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ngưỡng 0.0 — dùng "<=" nên hộp RỜI HẲN (IoU = 0) vẫn được giữ',
        },
      ],
      hints: [
        'Hàm iou chép nguyên từ bài trước, nhớ max(0, …) — sai chỗ này thì mọi ca đều lệch.',
        'Sắp giảm dần: con_lai = sorted(boxes, key=lambda b: -b[4]). Vòng while con_lai: pop(0) lấy hộp đầu.',
        'Điều kiện GIỮ là iou(tot_nhat, b) <= nguong (không phải <): nhờ vậy ngưỡng 0.0 vẫn giữ được hộp rời hẳn có IoU đúng bằng 0.',
      ],
      sampleSolution: `boxes = [\n    (0, 0, 10, 10, 0.95),\n    (1, 1, 11, 11, 0.90),\n    (2, 0, 12, 10, 0.85),\n    (50, 50, 60, 60, 0.80),\n    (52, 52, 62, 62, 0.70),\n]\nnguong = float(input("Nguong IoU: "))\n\n\ndef iou(a, b):\n    x1 = max(a[0], b[0])\n    y1 = max(a[1], b[1])\n    x2 = min(a[2], b[2])\n    y2 = min(a[3], b[3])\n    giao = max(0, x2 - x1) * max(0, y2 - y1)\n    dt_a = (a[2] - a[0]) * (a[3] - a[1])\n    dt_b = (b[2] - b[0]) * (b[3] - b[1])\n    hop = dt_a + dt_b - giao\n    return giao / hop if hop > 0 else 0.0\n\n\ncon_lai = sorted(boxes, key=lambda b: -b[4])\ngiu = []\nwhile con_lai:\n    tot_nhat = con_lai.pop(0)\n    giu.append(tot_nhat)\n    con_lai = [b for b in con_lai if iou(tot_nhat, b) <= nguong]\nprint(f"So box con lai: {len(giu)}")\nfor b in giu:\n    print(f"({b[0]},{b[1]},{b[2]},{b[3]}) diem {b[4]}")`,
    },
    homework:
      'Chạy code với các ngưỡng 0.1, 0.3, 0.5, 0.7, 0.9 và lập bảng "ngưỡng → số hộp còn lại". Rồi nghĩ một cảnh thật mà ngưỡng THẤP gây hại: hai người đứng ôm nhau, hộp của họ chồng nhau IoU ~0,4 — chuyện gì xảy ra với ngưỡng 0,3? Từ đó tự tra xem Soft-NMS vá vấn đề này bằng cách nào (gợi ý: nó HẠ điểm thay vì XOÁ).',
    srsCards: [
      {
        hoi: 'Non-max suppression làm việc theo 4 bước nào?',
        dap: 'Sắp mọi hộp theo điểm tin cậy giảm dần → lấy hộp điểm cao nhất còn lại và giữ nó → loại mọi hộp có IoU với nó vượt ngưỡng (coi là cùng một vật) → lặp tới khi hết hộp. Thuật toán tham lam.',
      },
      {
        hoi: 'Đặt ngưỡng IoU của NMS thấp hay cao thì hỏng kiểu gì?',
        dap: 'Thấp (0,1–0,3): gộp mạnh, hai vật thật đứng sát nhau bị nhập làm một → MẤT vật. Cao (0,7–0,9): loại dè dặt, còn nhiều hộp trùng quanh cùng một vật. Thông dụng 0,45–0,5.',
      },
      {
        hoi: 'Vì sao NMS phải chạy riêng cho từng lớp, và mô hình nào bỏ được NMS?',
        dap: 'Hộp "người" chồng hộp "xe" là hai vật khác nhau thật, không được loại nhau. DETR bỏ hẳn NMS nhờ huấn luyện ghép cặp Hungary — mỗi vật chỉ sinh đúng một dự đoán; Soft-NMS thì hạ điểm thay vì xoá.',
      },
    ],
  },
  {
    id: 'cv2-u2-l4',
    unitId: 'cv2-u2',
    language: 'python',
    title: 'Dòng họ mô hình phát hiện — hai pha, một pha và transformer',
    hook: 'Hỏi "mô hình phát hiện vật nào tốt nhất" cũng như hỏi "xe nào tốt nhất". Xe tải chở được nhiều, xe máy luồn được ngõ nhỏ. Camera đếm người trong siêu thị và xe tự lái chạy 100 km/h cần hai loại "xe" khác hẳn nhau — và tiêu chí chọn thì đếm được, không cảm tính.',
    theory:
      'Ba dòng họ, xếp theo thứ tự lịch sử và theo triết lý thiết kế:\n\n1. HAI PHA (two-stage) — R-CNN → Fast R-CNN → Faster R-CNN. Pha 1 đề xuất các vùng có thể có vật (region proposal); pha 2 phân loại và tinh chỉnh từng vùng. Như đọc lướt tìm đoạn khả nghi rồi mới đọc kỹ từng đoạn. Chính xác cao, nhất là với vật NHỎ; chậm (thường 5–15 FPS).\n\n2. MỘT PHA (one-stage) — YOLO, SSD, RetinaNet. Chia ảnh thành lưới, MỖI Ô đồng thời đoán hộp + lớp + điểm, tất cả trong một lần chạy mạng. Tên YOLO nói đúng ý: "You Only Look Once". Rất nhanh (30–150 FPS, chạy được thời gian thực trên thiết bị nhúng), xưa kém chính xác hơn nhưng khoảng cách đã hẹp gần hết ở các bản 2023–2026.\n\n3. TRANSFORMER (DETR và hậu duệ). Coi phát hiện vật là bài toán DỰ ĐOÁN TẬP HỢP: mô hình nhả ra đúng N "chỗ trống truy vấn", huấn luyện bằng ghép cặp Hungary để mỗi vật thật khớp đúng một dự đoán. Hệ quả đẹp: KHÔNG cần anchor box, KHÔNG cần NMS — hai miếng vá thủ công biến mất. Giá phải trả: hội tụ chậm khi huấn luyện (bản gốc cần rất nhiều epoch), và ngốn dữ liệu.\n\nCÁCH CHỌN, theo thứ tự câu hỏi phải trả lời:\n- Cần bao nhiêu FPS? Dưới 10 thì mọi lựa chọn đều mở; từ 30 trở lên gần như bắt buộc một pha.\n- Chạy ở đâu? Điện thoại/camera nhúng → một pha, mô hình nhỏ. Máy chủ có GPU → tuỳ.\n- Vật to hay nhỏ, dày hay thưa? Vật nhỏ và cảnh đông → nghiêng về hai pha hoặc DETR biến thể.\n- Có bao nhiêu ảnh gán nhãn? Ít → dùng mô hình pretrained + transfer learning (cv1), tránh DETR gốc.\nĐây là cùng một kiểu quyết định với "CNN hay ViT" ở `cv2-u1-l4`: không có nhà vô địch tuyệt đối, chỉ có lựa chọn hợp ràng buộc.',
    workedExample: {
      code: `# Bo chon mo hinh theo rang buoc san pham
def chon(fps, uu_tien):
    if uu_tien == "toc do" and fps >= 30:
        return "YOLO (mot pha)"          # thoi gian thuc, thiet bi nhung
    if uu_tien == "chinh xac" and fps < 10:
        return "Faster R-CNN (hai pha)"  # cham nhung ky, vat nho
    return "DETR (transformer)"          # can bang, bo anchor va NMS

print(chon(60, "toc do"))     # camera xe tu lai
print(chon(5, "chinh xac"))   # anh y te, xu ly theo lo
print(chon(20, "chinh xac"))  # o giua -> DETR`,
      stdinLines: [],
    },
    predict: {
      code: `fps = 45\nuu_tien = "toc do"\nprint("YOLO" if (uu_tien == "toc do" and fps >= 30) else "khac")`,
      question: 'Yêu cầu 45 FPS, ưu tiên tốc độ — máy in ra gì?',
      choices: ['YOLO', 'khac', 'DETR', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Cả hai điều kiện đều đúng (45 ≥ 30 và ưu tiên là "toc do") nên nhánh đầu chạy. 30 FPS là mốc "thời gian thực" theo cảm nhận mắt người — dưới mức đó video bắt đầu giật, nên đây là con số kỹ thuật có gốc sinh học chứ không tuỳ tiện.',
    },
    parsons: {
      prompt:
        'Xếp đúng bộ chọn mô hình: ưu tiên tốc độ + FPS cao → ưu tiên chính xác + FPS thấp → còn lại.',
      lines: [
        'if uu_tien == "toc do" and fps >= 30:',
        '    ten = "YOLO (mot pha)"',
        'elif uu_tien == "chinh xac" and fps < 10:',
        '    ten = "Faster R-CNN (hai pha)"',
        'else:',
        '    ten = "DETR (transformer)"',
        'print(f"Chon: {ten}")',
      ],
    },
    make: {
      prompt:
        'Viết bộ tư vấn chọn mô hình phát hiện vật.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: số FPS cần đạt (số thực).\n- Dòng 2: ưu tiên, đúng một trong hai chuỗi "toc do" hoặc "chinh xac".\n\nÁp dụng đúng thứ tự luật:\n1. Nếu ưu tiên là "toc do" VÀ fps >= 30 → "YOLO (mot pha)"\n2. Nếu không, nếu ưu tiên là "chinh xac" VÀ fps < 10 → "Faster R-CNN (hai pha)"\n3. Còn lại → "DETR (transformer)"\n\nIn đúng 1 dòng: Chon: <tên mô hình>',
      starterCode: `fps = float(input("FPS can dat: "))\nuu_tien = input("Uu tien: ").strip()\n# Ba nhanh if / elif / else theo dung thu tu de cho\n`,
      testCases: [
        {
          stdinLines: ['60', 'toc do'],
          expected: 'Chon: YOLO (mot pha)',
          match: 'contains',
          hidden: false,
          label: 'Xe tự lái 60 FPS, ưu tiên tốc độ → YOLO',
        },
        {
          stdinLines: ['5', 'chinh xac'],
          expected: 'Chon: Faster R-CNN (hai pha)',
          match: 'contains',
          hidden: false,
          label: 'Ảnh y tế xử lý theo lô, cần kỹ → hai pha',
        },
        {
          stdinLines: ['20', 'chinh xac'],
          expected: 'Chon: DETR (transformer)',
          match: 'contains',
          hidden: false,
          label: 'Ở giữa hai thái cực → DETR',
        },
        {
          stdinLines: ['10', 'toc do'],
          expected: 'Chon: DETR (transformer)',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ưu tiên tốc độ nhưng chỉ 10 FPS — chưa đủ 30 nên rơi xuống nhánh cuối',
        },
      ],
      hints: [
        'Nhớ .strip() cho dòng ưu tiên — chuỗi nhập có thể dính khoảng trắng thừa ở cuối.',
        'Thứ tự if/elif/else quan trọng: luật 1 xét trước, ca "toc do" mà fps thấp phải rơi xuống else.',
        'So chuỗi bằng == với đúng chữ "toc do" / "chinh xac" (không dấu, có khoảng trắng ở giữa).',
      ],
      sampleSolution: `fps = float(input("FPS can dat: "))\nuu_tien = input("Uu tien: ").strip()\nif uu_tien == "toc do" and fps >= 30:\n    ten = "YOLO (mot pha)"\nelif uu_tien == "chinh xac" and fps < 10:\n    ten = "Faster R-CNN (hai pha)"\nelse:\n    ten = "DETR (transformer)"\nprint(f"Chon: {ten}")`,
    },
    homework:
      'Chọn mô hình cho 3 bài toán thật và viết 2–3 câu biện hộ mỗi cái, nêu rõ FPS cần, thiết bị chạy, kích thước vật: (a) đếm người ra vào cửa hàng bằng camera Raspberry Pi; (b) phát hiện khối u nhỏ trên ảnh CT, chạy trên máy chủ, không gấp; (c) trọng tài bóng đá tự động bám bóng trực tiếp. Ràng buộc nào là ràng buộc QUYẾT ĐỊNH ở từng ca?',
    srsCards: [
      {
        hoi: 'Mô hình phát hiện hai pha khác một pha ở chỗ nào?',
        dap: 'Hai pha (Faster R-CNN): pha 1 đề xuất vùng khả nghi, pha 2 phân loại + tinh chỉnh từng vùng — chính xác hơn với vật nhỏ nhưng chậm (5–15 FPS). Một pha (YOLO/SSD): mỗi ô lưới đoán hộp + lớp + điểm trong một lần chạy — rất nhanh (30–150 FPS).',
      },
      {
        hoi: 'DETR bỏ được hai miếng vá thủ công nào, và trả giá gì?',
        dap: 'Bỏ anchor box và bỏ NMS, nhờ coi detection là dự đoán TẬP HỢP và huấn luyện bằng ghép cặp Hungary (mỗi vật khớp đúng một dự đoán). Giá: hội tụ chậm khi huấn luyện và cần nhiều dữ liệu.',
      },
      {
        hoi: 'Bốn câu hỏi cần trả lời khi chọn mô hình detection?',
        dap: 'Cần bao nhiêu FPS (≥30 thì gần như buộc một pha)? Chạy trên thiết bị gì (nhúng → mô hình nhỏ)? Vật to hay nhỏ, cảnh thưa hay đông (nhỏ/đông → hai pha hoặc DETR biến thể)? Có bao nhiêu ảnh gán nhãn (ít → pretrained + transfer learning)?',
      },
    ],
  },
]

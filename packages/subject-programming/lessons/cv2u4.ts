// lessons/cv2u4.ts — Chương 4 của khoá ngắn "Deep Learning for CV nâng cao"
// (docs/specs/2026-09-01-cv2-bai-hoc-chi-tiet.md). Nội dung chép nguyên văn từ đặc tả.
//
// unitId 'cv2-u4' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi bài đều language 'python' và code được chấm là Python THUẦN
// (chỉ math chuẩn, không numpy/torch) để Pyodide trình duyệt và python3 CI chấm y hệt nhau.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const CV2_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'cv2-u4-l1',
    unitId: 'cv2-u4',
    language: 'python',
    title: 'Project — pipeline dò "vật sáng" nối conv, chú ý và NMS',
    hook: 'Ba chương vừa rồi cho bạn ba mảnh rời: convolution (khoá cv1), bản đồ chú ý, và NMS. Hôm nay ráp cả ba thành một đường ống chạy được đầu-tới-cuối trên ảnh 8×8: quét ảnh, chấm điểm từng vị trí, lọc ngưỡng, dẹp trùng, trả về danh sách vật. Đó đúng là hình hài của một bộ phát hiện thật, chỉ nhỏ lại.',
    theory:
      'Mọi bộ phát hiện vật, bỏ hết chi tiết, đều là BỐN CHẶNG nối tiếp:\n1. TRÍCH ĐẶC TRƯNG — quét ảnh bằng convolution, ra một "bản đồ đặc trưng" (feature map) nói mỗi vị trí đáng chú ý cỡ nào. Trong bài này kernel là bộ lọc trung bình 3×3, và đặc trưng ta quan tâm là ĐỘ SÁNG.\n2. CHẤM ĐIỂM + LỌC NGƯỠNG — bỏ mọi vị trí điểm thấp, đúng bước `cv2-u2-l1`. Bản đồ điểm này chính là họ hàng gần của "bản đồ chú ý" ở chương 1: cả hai đều nói "nhìn vào đâu".\n3. DẸP TRÙNG (NMS) — một vật sáng làm cả một VÙNG vị trí lân cận cùng vượt ngưỡng; giữ vị trí mạnh nhất và loại các vị trí quá gần nó. Ở đây ta thay IoU của hộp bằng thước đo đơn giản hơn cho ĐIỂM: khoảng cách Chebyshev max(|Δhàng|, |Δcột|) < 2 thì coi là cùng một vật. Luật vẫn y nguyên tinh thần bài `cv2-u2-l3`: sắp giảm dần theo điểm, tham lam giữ, loại kẻ trùng.\n4. TRẢ KẾT QUẢ — danh sách vật kèm vị trí và độ mạnh.\n\nMột chi tiết kỹ thuật quan trọng: convolution "valid" (không đệm viền) trên ảnh 8×8 với kernel 3×3 chỉ tính được ở các tâm hàng/cột 1..6 — vì tâm ở mép sẽ đòi pixel nằm ngoài ảnh. Vì thế bản đồ đặc trưng là 6×6 chứ không phải 8×8, và toạ độ in ra là toạ độ TRÊN ẢNH GỐC (hàng 1..6, cột 1..6). Lệch chỗ này là toạ độ báo về sai một pixel — loại lỗi hay xảy ra thật khi ghép nhiều tầng xử lý.\n\nĐể kết quả ổn định và so sánh được, thứ tự sắp xếp phải TẤT ĐỊNH tuyệt đối: sắp theo (điểm giảm dần, hàng tăng, cột tăng). Hai vị trí cùng điểm mà không có tiêu chí phụ thì mỗi lần chạy có thể ra thứ tự khác — đúng loại lỗi mà Tầng 10 của quy trình audit dự án nhắm tới.',
    workedExample: {
      code: `# Chang 1: convolution trung binh 3x3 tren anh 4x4 (valid -> ban do 2x2)
anh = [
    [0, 0, 0, 0],
    [0, 9, 9, 0],
    [0, 9, 9, 0],
    [0, 0, 0, 0],
]
for r in range(1, 3):            # tam chi chay o 1..2 (khong dem vien)
    for c in range(1, 3):
        tong = 0
        for dr in (-1, 0, 1):    # cua so 3x3 quanh tam
            for dc in (-1, 0, 1):
                tong += anh[r + dr][c + dc]
        print(f"Tam ({r},{c}) do sang = {round(tong / 9, 2)}")`,
      stdinLines: [],
    },
    predict: {
      code: `print(len(range(1, 7)))`,
      question: 'Convolution 3×3 không đệm viền trên ảnh 8×8 cho bản đồ đặc trưng bao nhiêu hàng?',
      choices: ['6', '8', '7', '4'],
      answerIndex: 0,
      explain:
        'Tâm cửa sổ chỉ đặt được ở hàng 1..6 (hàng 0 và 7 sẽ đòi pixel ngoài ảnh) → 6 hàng, tương tự 6 cột, bản đồ 6×6. Công thức chung: kích thước ra = vào − kernel + 1 = 8 − 3 + 1 = 6.',
    },
    parsons: {
      prompt:
        'Xếp đúng bốn chặng của pipeline: quét conv → lọc ngưỡng → sắp giảm dần → NMS giữ điểm xa nhau.',
      lines: [
        'for r in range(1, 7):',
        '    for c in range(1, 7):',
        '        do_sang = round(sum(anh[r + dr][c + dc] for dr in (-1, 0, 1) for dc in (-1, 0, 1)) / 9, 2)',
        '        if do_sang >= nguong:',
        '            diem.append((do_sang, r, c))',
        'diem.sort(key=lambda p: (-p[0], p[1], p[2]))',
        'giu = [p for p in diem if all(max(abs(p[1] - g[1]), abs(p[2] - g[2])) >= 2 for g in giu)]',
      ],
    },
    make: {
      prompt:
        'Ráp pipeline phát hiện "vật sáng" đầy đủ 4 chặng trên ảnh 8×8 đã nhúng sẵn.\n\nChương trình đọc 1 dòng input(): ngưỡng độ sáng (số thực).\n\nCHẶNG 1 — với mọi tâm (r, c) trong 1..6, tính do_sang = trung bình 9 ô của cửa sổ 3×3 quanh tâm, làm tròn 2.\nCHẶNG 2 — giữ các tâm có do_sang >= ngưỡng. In: So diem vuot nguong: <n>\nCHẶNG 3 — sắp giảm dần theo (điểm, rồi hàng tăng, rồi cột tăng); duyệt lần lượt, GIỮ một tâm nếu nó cách MỌI tâm đã giữ ít nhất 2 theo khoảng cách Chebyshev max(|Δr|, |Δc|).\nCHẶNG 4 — in: So vat phat hien: <m>\nrồi mỗi vật một dòng theo thứ tự đã giữ:\nVat tai (hang <r>, cot <c>), do sang <do_sang>\n\nVới ngưỡng 5 → 8 điểm vượt ngưỡng, gộp còn 2 vật.',
      starterCode: `anh = [\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n]\nnguong = float(input("Nguong sang: "))\ndiem = []\n# Chang 1+2: for r in range(1, 7): for c in range(1, 7): tinh trung binh 3x3, loc nguong\n# Chang 3: diem.sort(key=lambda p: (-p[0], p[1], p[2])) roi giu theo khoang cach Chebyshev >= 2\n`,
      testCases: [
        {
          stdinLines: ['5'],
          expected:
            'So diem vuot nguong: 8\nSo vat phat hien: 2\nVat tai (hang 2, cot 2), do sang 9.0\nVat tai (hang 6, cot 6), do sang 8.0',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 5 → 8 tâm sáng gộp lại đúng 2 vật',
        },
        {
          stdinLines: ['4'],
          expected: 'So diem vuot nguong: 12\nSo vat phat hien: 2',
          match: 'contains',
          hidden: false,
          label: 'Hạ ngưỡng → nhiều tâm hơn nhưng NMS vẫn gộp còn 2 vật',
        },
        {
          stdinLines: ['9.5'],
          expected: 'So diem vuot nguong: 0\nSo vat phat hien: 0',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng quá cao → không có vật nào',
        },
        {
          stdinLines: ['1'],
          expected: 'So diem vuot nguong: 24\nSo vat phat hien: 7',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ngưỡng quá thấp — rìa mờ cũng thành "vật", 7 báo động',
        },
      ],
      hints: [
        'Cửa sổ 3×3 quanh tâm: hai vòng dr, dc chạy trong (-1, 0, 1), cộng anh[r + dr][c + dc] rồi chia 9 và round(..., 2).',
        'Tâm chỉ chạy range(1, 7) — hàng/cột 0 và 7 sẽ đòi pixel ngoài ảnh. Toạ độ in ra là toạ độ trên ảnh gốc.',
        'NMS: sau diem.sort(key=lambda p: (-p[0], p[1], p[2])), duyệt tuần tự và chỉ append khi all(max(abs(r - gr), abs(c - gc)) >= 2 for (gs, gr, gc) in giu) — dùng vòng for thường cho dễ đọc.',
      ],
      sampleSolution: `anh = [\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n]\nnguong = float(input("Nguong sang: "))\ndiem = []\nfor r in range(1, 7):\n    for c in range(1, 7):\n        tong = 0\n        for dr in (-1, 0, 1):\n            for dc in (-1, 0, 1):\n                tong += anh[r + dr][c + dc]\n        do_sang = round(tong / 9, 2)\n        if do_sang >= nguong:\n            diem.append((do_sang, r, c))\nprint(f"So diem vuot nguong: {len(diem)}")\ndiem.sort(key=lambda p: (-p[0], p[1], p[2]))\ngiu = []\nfor (s, r, c) in diem:\n    if all(max(abs(r - gr), abs(c - gc)) >= 2 for (gs, gr, gc) in giu):\n        giu.append((s, r, c))\nprint(f"So vat phat hien: {len(giu)}")\nfor (s, r, c) in giu:\n    print(f"Vat tai (hang {r}, cot {c}), do sang {s}")`,
    },
    homework:
      'Mở rộng pipeline theo hai hướng và ghi lại kết quả: (1) đổi bán kính dẹp trùng từ 2 lên 3 — số vật phát hiện đổi thế nào ở ngưỡng 1, và vì sao? (2) Vẽ tay ảnh 8×8 của riêng bạn với BA vật sáng, trong đó hai vật đứng sát nhau; chạy pipeline và xem chúng có bị gộp làm một không. Nếu bị gộp, bạn chỉnh núm nào — ngưỡng sáng hay bán kính NMS? Đây đúng là việc kỹ sư thị giác máy tính làm mỗi ngày.',
    srsCards: [
      {
        hoi: 'Bốn chặng của một pipeline phát hiện vật là gì?',
        dap: 'Trích đặc trưng bằng convolution (ra bản đồ đặc trưng) → chấm điểm và lọc theo ngưỡng → dẹp trùng bằng NMS (một vật làm cả vùng lân cận cùng vượt ngưỡng) → trả danh sách vật kèm vị trí và độ mạnh.',
      },
      {
        hoi: 'Convolution 3×3 không đệm viền trên ảnh N×N cho bản đồ kích thước bao nhiêu, vì sao?',
        dap: 'N−3+1 mỗi chiều (8×8 → 6×6): tâm cửa sổ không đặt được ở mép vì sẽ đòi pixel ngoài ảnh. Nhớ báo toạ độ theo ẢNH GỐC, lệch chỗ này là sai vị trí một pixel khi ghép nhiều tầng.',
      },
      {
        hoi: 'Vì sao thứ tự sắp xếp trong pipeline phải tất định tuyệt đối?',
        dap: 'Hai vị trí cùng điểm mà không có tiêu chí phụ thì mỗi lần chạy có thể cho thứ tự khác nhau, kết quả không tái lập được. Cách sửa: sắp theo bộ khoá đầy đủ, ví dụ (điểm giảm dần, hàng tăng, cột tăng).',
      },
    ],
  },
  {
    id: 'cv2-u4-l2',
    unitId: 'cv2-u4',
    language: 'python',
    title: 'Tổng kết cv2 — bạn đã tự cài những gì và đi tiếp đâu',
    hook: 'Mười ba bài trước, bạn không đọc về attention — bạn CÀI nó. Không nghe kể về IoU — bạn viết nó và tự tay dính cái bẫy thiếu max(0,…). Bài cuối này gom lại toàn bộ bản đồ và chỉ ra ba con đường đi tiếp, để chỗ bạn đứng có tên gọi rõ ràng.',
    theory:
      'BẠN ĐÃ TỰ CÀI, bằng Python thuần, không thư viện:\n- Chương 1: chi phí O(n²) của attention · self-attention một đầu đủ 4 bước (Q·K → scale √d → softmax tự cài → trộn V) · positional encoding sin/cos · cắt ảnh thành patch kiểu ViT.\n- Chương 2: lọc hộp theo ngưỡng tin cậy · IoU (kèm bẫy max(0,…)) · non-max suppression tham lam · khung quyết định chọn dòng họ mô hình.\n- Chương 3: GAN một chiều tất định — thấy generator hội tụ về phân phối thật bằng con số · máy đo mode collapse · diffusion hai chiều thêm/khử nhiễu trên vector 8 phần tử · kinh tế của số bước lấy mẫu.\n- Chương 4: ráp cả ba mảnh thành pipeline dò vật chạy đầu-tới-cuối.\n\nBỐN Ý NIỆM ĐI THEO BẠN SANG MỌI KHOÁ SAU, đáng nhớ hơn mọi dòng code:\n1. Attention là "phân bổ 100% sự chú ý" — softmax luôn cộng lại bằng 1, ưu ái chỗ này là phải bớt chỗ khác. Nó là ruột của cả LLM lẫn ViT.\n2. Không có kiến trúc thắng tuyệt đối. CNN hay ViT, một pha hay hai pha, GAN hay diffusion — chọn theo dữ liệu, ngân sách và hậu quả của từng loại sai.\n3. Mọi đường ống thị giác đều là: trích đặc trưng → chấm điểm → lọc → dẹp trùng.\n4. Thước đo quyết định hành vi. Đổi ngưỡng tin cậy, ngưỡng NMS hay số bước khử nhiễu là đổi hẳn sản phẩm, dù mô hình không đổi một tham số nào.\n\nBA LỐI ĐI TIẾP:\n- Khoá `llmagent` (LLMs & AI Agents) — attention bạn vừa cài chính là ruột của LLM; ở đó bạn cài tokenizer, sinh next-token, RAG mini và vòng lặp agent ReAct.\n- Hướng chuyên sâu `ai` chặng S3 trong môn Lập trình — huấn luyện và triển khai mô hình thật với PyTorch, ở quy mô dự án.\n- Đọc paper gốc, nay đã đủ nền để đọc: "Attention Is All You Need" (2017), "An Image is Worth 16×16 Words" (ViT, 2020), "Denoising Diffusion Probabilistic Models" (2020).\n\nBài Make cuối là một công cụ nhỏ cho chính bạn: bản đồ tra cứu khái niệm → chương đã học, để khi quên thì biết quay lại đúng chỗ.',
    workedExample: {
      code: `# Ban do tra cuu: khai niem -> hoc o chuong nao
ban_do = {
    "attention": "Chuong 1 - Transformer & ViT",
    "iou": "Chuong 2 - Object detection",
    "gan": "Chuong 3 - Mo hinh sinh anh",
}

for tu in ["attention", "iou", "kubernetes"]:
    # .get(khoa, mac_dinh) tra ve mac dinh khi khong tim thay, khong bao loi
    print(f"{tu}: {ban_do.get(tu, 'Chua hoc trong khoa cv2')}")`,
      stdinLines: [],
    },
    predict: {
      code: `d = {"a": 1}\nprint(d.get("b", "khong co"))`,
      question: 'Tra khoá "b" không tồn tại bằng .get() với giá trị mặc định — in ra gì?',
      choices: ['khong co', 'None', 'Báo lỗi KeyError', '1'],
      answerIndex: 0,
      explain:
        '.get(khoa, mac_dinh) trả về giá trị mặc định khi không tìm thấy, khác hẳn d["b"] vốn ném KeyError làm sập chương trình. Đây là thói quen tốt cho mọi tra cứu có thể trượt — đúng tinh thần "mọi thao tác có thể lỗi đều có nhánh xử lý".',
    },
    parsons: {
      prompt: 'Xếp đúng công cụ tra cứu: chuẩn hoá chuỗi nhập → tra bản đồ có mặc định → in.',
      lines: [
        'tu = input("Khai niem: ").strip().lower()',
        'ket_qua = ban_do.get(tu, "Chua hoc trong khoa cv2")',
        'print(f"{tu}: {ket_qua}")',
      ],
    },
    make: {
      prompt:
        'Viết công cụ tra cứu tổng kết khoá: nhập tên một khái niệm, máy cho biết nó học ở chương nào.\n\nBản đồ tra cứu (dùng đúng 6 khoá này):\n- "attention", "patch" → "Chuong 1 - Transformer & ViT"\n- "iou", "nms" → "Chuong 2 - Object detection"\n- "gan", "diffusion" → "Chuong 3 - Mo hinh sinh anh"\n\nChương trình đọc 1 dòng input(): tên khái niệm. Phải CHUẨN HOÁ trước khi tra: bỏ khoảng trắng thừa (.strip()) và đổi về chữ thường (.lower()) — người dùng có thể gõ "IoU" hay " Attention ".\n\nIn đúng 1 dòng: <khái niệm đã chuẩn hoá>: <chương>\nNếu không có trong bản đồ, phần chương là "Chua hoc trong khoa cv2" (dùng .get() với giá trị mặc định, KHÔNG để chương trình báo lỗi).',
      starterCode: `ban_do = {\n    "attention": "Chuong 1 - Transformer & ViT",\n    "patch": "Chuong 1 - Transformer & ViT",\n    "iou": "Chuong 2 - Object detection",\n    "nms": "Chuong 2 - Object detection",\n    "gan": "Chuong 3 - Mo hinh sinh anh",\n    "diffusion": "Chuong 3 - Mo hinh sinh anh",\n}\ntu = input("Khai niem: ")\n# Chuan hoa bang .strip().lower() roi tra bang .get(tu, "Chua hoc trong khoa cv2")\n`,
      testCases: [
        {
          stdinLines: ['IoU'],
          expected: 'iou: Chuong 2 - Object detection',
          match: 'contains',
          hidden: false,
          label: 'Viết hoa lẫn lộn vẫn tra đúng nhờ .lower()',
        },
        {
          stdinLines: ['diffusion'],
          expected: 'diffusion: Chuong 3 - Mo hinh sinh anh',
          match: 'contains',
          hidden: false,
          label: 'Tra khái niệm chương 3',
        },
        {
          stdinLines: [' Attention '],
          expected: 'attention: Chuong 1 - Transformer & ViT',
          match: 'contains',
          hidden: false,
          label: 'Khoảng trắng thừa hai đầu bị .strip() cắt sạch',
        },
        {
          stdinLines: ['kubernetes'],
          expected: 'kubernetes: Chua hoc trong khoa cv2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: khoá lạ — .get() trả mặc định, không ném KeyError',
        },
      ],
      hints: [
        'Nối hai phép chuẩn hoá: tu = input("Khai niem: ").strip().lower() — strip trước, lower sau, thứ tự nào cũng được.',
        'Tra an toàn bằng .get(tu, "Chua hoc trong khoa cv2"); dùng ban_do[tu] sẽ ném KeyError với khoá lạ.',
        'In một dòng: print(f"{tu}: {ket_qua}") với tu là chuỗi ĐÃ chuẩn hoá (chữ thường).',
      ],
      sampleSolution: `ban_do = {\n    "attention": "Chuong 1 - Transformer & ViT",\n    "patch": "Chuong 1 - Transformer & ViT",\n    "iou": "Chuong 2 - Object detection",\n    "nms": "Chuong 2 - Object detection",\n    "gan": "Chuong 3 - Mo hinh sinh anh",\n    "diffusion": "Chuong 3 - Mo hinh sinh anh",\n}\ntu = input("Khai niem: ").strip().lower()\nprint(f"{tu}: {ban_do.get(tu, 'Chua hoc trong khoa cv2')}")`,
    },
    homework:
      'Viết một trang giấy (hoặc một file ghi chú) tổng kết cho chính bạn: với MỖI trong 4 ý niệm lớn của khoá (attention là phân bổ chú ý · không có kiến trúc thắng tuyệt đối · pipeline luôn là trích-chấm-lọc-dẹp · thước đo quyết định hành vi), viết 2 câu bằng lời của bạn và 1 ví dụ từ bài Make bạn đã tự viết. Sau đó chọn MỘT lối đi tiếp (khoá llmagent, hướng ai S3, hoặc đọc paper) và đặt một mốc thời gian cụ thể cho nó.',
    srsCards: [
      {
        hoi: 'Bốn ý niệm lớn còn lại sau khoá cv2?',
        dap: '① Attention là phân bổ 100% sự chú ý (softmax cộng lại bằng 1) ② Không có kiến trúc thắng tuyệt đối — chọn theo dữ liệu, ngân sách, hậu quả của từng loại sai ③ Pipeline thị giác luôn là trích đặc trưng → chấm điểm → lọc → dẹp trùng ④ Thước đo quyết định hành vi sản phẩm, dù mô hình không đổi.',
      },
      {
        hoi: 'Ba thứ bạn đã tự cài trong chương sinh ảnh?',
        dap: 'GAN một chiều tất định (generator hội tụ về trung bình thật qua từng vòng) · máy đo mode collapse bằng độ đa dạng mẫu · diffusion hai chiều thêm nhiễu rồi khử ngược trên vector 8 phần tử.',
      },
      {
        hoi: 'Vì sao nên dùng dict.get(khoa, mac_dinh) thay cho dict[khoa]?',
        dap: 'dict[khoa] ném KeyError làm sập chương trình khi khoá không tồn tại; .get() trả về giá trị mặc định để luồng đi tiếp bình thường — đúng nguyên tắc mọi thao tác có thể lỗi đều phải có nhánh xử lý.',
      },
    ],
  },
]

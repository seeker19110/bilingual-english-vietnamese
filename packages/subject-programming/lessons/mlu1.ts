// lessons/mlu1.ts — Chương C1 "Bản đồ ML & Học có giám sát" của khoá "Học máy — từ hồi quy
// đến AI tạo sinh" (docs/specs/2026-08-31-khoa-hoc-may.md).
//
// unitId 'ml-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi thuật toán LÕI đều tự cài bằng Python THUẦN (không numpy/
// sklearn) để Pyodide trình duyệt và python3 CI chấm y hệt nhau; nhánh chuyên sâu của bản đồ
// (SVM, t-SNE…) dạy ở mức nhận-đường trong theory, không bịa code.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const ML_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'ml-u1-l1',
    unitId: 'ml-u1',
    language: 'python',
    title: 'Học máy là gì — luật viết tay vs học từ dữ liệu',
    hook: 'Muốn máy lọc thư rác, cách cũ là ngồi viết 1.000 luật if: "có chữ TRÚNG THƯỞNG thì chặn". Kẻ gửi rác đổi thành "TR-Ú-NG TH-ƯỞ-NG" là luật vỡ. Học máy đi ngược lại: đưa máy 10.000 lá thư đã dán nhãn rác/không-rác, để MÁY TỰ RÚT RA luật từ dữ liệu.',
    theory:
      'HỌC MÁY (Machine Learning) = lập trình bằng DỮ LIỆU thay vì bằng luật viết tay: bạn đưa vào các VÍ DỤ, thuật toán tự tìm quy luật (gọi là MÔ HÌNH), rồi dùng mô hình đó đoán cho ca chưa gặp.\n\nBản đồ toàn ngành có 4 vùng lớn, khoá này đi đủ:\n1. HỌC CÓ GIÁM SÁT (supervised) — dữ liệu CÓ ĐÁP ÁN kèm theo: hồi quy (đoán con số: giá nhà), phân loại (đoán nhãn: rác/không-rác). Chương 1.\n2. HỌC KHÔNG GIÁM SÁT (unsupervised) — dữ liệu KHÔNG có đáp án, máy tự tìm cấu trúc: gom cụm, giảm chiều, luật kết hợp. Chương 2.\n3. HỌC TĂNG CƯỜNG (reinforcement) — máy tự thử, môi trường thưởng/phạt: AI chơi cờ, robot. Chương 3 (kèm ensemble và các kiểu học lai: semi-/self-supervised, transfer).\n4. HỌC SÂU & AI TẠO SINH (deep learning, generative AI) — mạng nơ-ron nhiều lớp, ChatGPT/Midjourney thuộc vùng này. Chương 4.\n\nDạng học đơn giản nhất: từ dữ liệu rút ra MỘT CON SỐ làm ngưỡng. Ví dụ đoán "hôm nay quán đông hay vắng" từ số khách các ngày trước: lấy TRUNG BÌNH làm ngưỡng — hơn trung bình là đông. Trung bình chính là "mô hình" một-tham-số đầu tiên của bạn: nó được TÍNH TỪ DỮ LIỆU, không phải bạn bịa ra. Toàn bộ học máy chỉ là phiên bản tinh vi hơn của bước này.',
    workedExample: {
      code: `# "Mo hinh" don gian nhat: hoc mot nguong tu du lieu
so_khach = [120, 80, 150, 90, 160]     # du lieu 5 ngay da qua

nguong = sum(so_khach) / len(so_khach) # HOC: rut nguong tu du lieu
print(f"Nguong hoc duoc: {nguong}")

hom_nay = 130                          # ca moi chua tung gap
if hom_nay > nguong:                   # DU DOAN bang mo hinh
    print("Du doan: dong khach")
else:
    print("Du doan: vang khach")`,
      stdinLines: [],
    },
    predict: {
      code: `du_lieu = [10, 20, 30]\nnguong = sum(du_lieu) / len(du_lieu)\nprint(nguong)`,
      question: 'Mô hình "trung bình" học được ngưỡng bao nhiêu từ dữ liệu này?',
      choices: ['20.0', '30.0', '60.0', '10.0'],
      answerIndex: 0,
      explain:
        'sum([10, 20, 30]) = 60, chia cho 3 phần tử = 20.0. Con số này KHÔNG do người viết code chọn — nó được tính từ dữ liệu. Đổi dữ liệu là ngưỡng tự đổi theo, không phải sửa code: đó chính là điểm khác căn bản với luật viết tay.',
    },
    parsons: {
      prompt:
        'Xếp đúng quy trình học máy tối giản: có dữ liệu → học tham số từ dữ liệu → dùng tham số đoán ca mới.',
      lines: [
        'diem_cac_ngay = [50, 70, 90]',
        'nguong = sum(diem_cac_ngay) / len(diem_cac_ngay)',
        'ca_moi = 80',
        'print("cao" if ca_moi > nguong else "thap")',
      ],
    },
    make: {
      prompt:
        'Viết "mô hình" đầu tiên của bạn: đoán một ngày là "dong" (đông) hay "vang" (vắng) bằng ngưỡng trung bình.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: số khách các ngày trước, cách nhau bởi dấu phẩy (vd "100,200,150").\n- Dòng 2: số khách hôm nay.\n\nTính ngưỡng = trung bình dòng 1. In đúng 2 dòng:\nNguong: <trung binh>\nDu doan: dong (nếu hôm nay LỚN HƠN ngưỡng) hoặc Du doan: vang (còn lại).\n\nVí dụ: "100,200,150" và "160" → ngưỡng 150.0 → "Du doan: dong".',
      starterCode: `du_lieu = input("So khach cac ngay: ")   # vd "100,200,150"\nhom_nay = int(input("Hom nay: "))\n# Tach chuoi bang du_lieu.split(",") roi doi tung phan sang int\n# Tinh nguong trung binh, in Nguong: ... va Du doan: ...\n`,
      testCases: [
        {
          stdinLines: ['100,200,150', '160'],
          expected: 'Nguong: 150.0\nDu doan: dong',
          match: 'contains',
          hidden: false,
          label: 'Ngưỡng 150.0, hôm nay 160 → đông',
        },
        {
          stdinLines: ['100,200,150', '120'],
          expected: 'Du doan: vang',
          match: 'contains',
          hidden: false,
          label: 'Hôm nay 120 dưới ngưỡng → vắng',
        },
        {
          stdinLines: ['80,80,80', '80'],
          expected: 'Du doan: vang',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bằng đúng ngưỡng — KHÔNG lớn hơn thì là vắng',
        },
      ],
      hints: [
        'Tách chuỗi: cac_phan = du_lieu.split(",") cho list các chuỗi con; đổi sang số bằng [int(x) for x in cac_phan].',
        'Ngưỡng = sum(danh_sach) / len(danh_sach) — phép chia / luôn ra số thực nên in ra sẽ có .0.',
        'In hai dòng: print(f"Nguong: {nguong}") rồi print("Du doan: dong" if hom_nay > nguong else "Du doan: vang").',
      ],
      sampleSolution: `du_lieu = input("So khach cac ngay: ")\nhom_nay = int(input("Hom nay: "))\ncac_ngay = [int(x) for x in du_lieu.split(",")]\nnguong = sum(cac_ngay) / len(cac_ngay)\nprint(f"Nguong: {nguong}")\nprint("Du doan: dong" if hom_nay > nguong else "Du doan: vang")`,
    },
    homework:
      'Nghĩ ra 3 việc quanh bạn có thể giải bằng học máy, và với mỗi việc trả lời: nó thuộc vùng nào của bản đồ (có giám sát / không giám sát / tăng cường / tạo sinh)? Dữ liệu để học lấy ở đâu, có sẵn "đáp án" kèm theo không? Ví dụ mồi: đoán điểm thi từ số giờ học (hồi quy — có giám sát), gom khách hàng thành nhóm để gửi khuyến mãi (gom cụm — không giám sát).',
    srsCards: [
      {
        hoi: 'Học máy khác lập trình luật viết tay ở điểm căn bản nào?',
        dap: 'Luật viết tay: người nghĩ ra quy tắc rồi code cứng. Học máy: đưa máy các VÍ DỤ (dữ liệu), thuật toán tự rút ra quy luật (mô hình) rồi dùng nó đoán ca chưa gặp — đổi dữ liệu là mô hình tự đổi theo.',
      },
      {
        hoi: 'Bản đồ học máy có 4 vùng lớn nào?',
        dap: 'Học có giám sát (dữ liệu có đáp án: hồi quy, phân loại) · học không giám sát (tự tìm cấu trúc: gom cụm, giảm chiều) · học tăng cường (thử-sai theo thưởng/phạt) · học sâu & AI tạo sinh (mạng nơ-ron nhiều lớp).',
      },
      {
        hoi: 'Học CÓ GIÁM SÁT khác học KHÔNG GIÁM SÁT ở chỗ nào?',
        dap: 'Có giám sát: mỗi ví dụ huấn luyện KÈM ĐÁP ÁN đúng (nhãn), máy học ánh xạ vào→ra. Không giám sát: dữ liệu KHÔNG có nhãn, máy tự tìm cấu trúc ẩn (cụm, chiều quan trọng, luật đi kèm).',
      },
    ],
  },
  {
    id: 'ml-u1-l2',
    unitId: 'ml-u1',
    language: 'python',
    title: 'Hồi quy tuyến tính — tự cài mô hình đoán con số',
    hook: 'Quán bạn chạy quảng cáo: chi 1 triệu được thêm ~50 khách, chi 2 triệu được ~100. Vậy chi 3,5 triệu thì được bao nhiêu? Kẻ một ĐƯỜNG THẲNG xuyên qua các điểm dữ liệu rồi kéo dài ra — đó là hồi quy tuyến tính, mô hình "đoán con số" già đời và bền bỉ nhất của học máy.',
    theory:
      'HỒI QUY (regression) = đoán một CON SỐ liên tục (giá nhà, doanh thu, nhiệt độ) — khác PHÂN LOẠI đoán nhãn rời rạc (bài sau).\n\nHồi quy TUYẾN TÍNH giả định quan hệ là đường thẳng: y = a*x + b. Học = tìm a (độ dốc) và b (điểm cắt trục) sao cho đường thẳng BÁM SÁT dữ liệu nhất — "sát" đo bằng tổng bình phương khoảng cách từ các điểm tới đường (least squares).\n\nĐiều đẹp: bài này có CÔNG THỨC ĐÓNG, không cần thử-sai. Với tb_x, tb_y là trung bình của x và y:\n- a = tổng[(x - tb_x) * (y - tb_y)] / tổng[(x - tb_x)²]\n- b = tb_y - a * tb_x\nTử số của a đo x và y CÙNG lệch khỏi trung bình theo hướng nào (hiệp phương sai); mẫu số chuẩn hoá theo độ dàn trải của x.\n\nHọ hàng trên bản đồ: hồi quy ĐA THỨC (polynomial) — cong thay vì thẳng, mạnh hơn nhưng dễ "học vẹt" (bài 5); RIDGE/LASSO — hồi quy tuyến tính có thêm "phanh" phạt hệ số quá lớn để chống học vẹt. Cả ba đều chung ruột least squares bạn cài hôm nay.',
    workedExample: {
      code: `# Hoc duong thang y = a*x + b tu du lieu quang cao -> khach
x = [1, 2, 3, 4]          # trieu dong quang cao
y = [50, 100, 150, 200]   # khach them

tb_x = sum(x) / len(x)    # trung binh x
tb_y = sum(y) / len(y)    # trung binh y

tu_so = 0                 # tong (x-tb_x)*(y-tb_y)
mau_so = 0                # tong (x-tb_x)^2
for i in range(len(x)):
    tu_so += (x[i] - tb_x) * (y[i] - tb_y)
    mau_so += (x[i] - tb_x) ** 2

a = tu_so / mau_so        # do doc hoc duoc
b = tb_y - a * tb_x       # diem cat truc
print(f"Mo hinh: y = {a}x + {b}")
print(f"Chi 3.5 trieu du doan: {a * 3.5 + b} khach")`,
      stdinLines: [],
    },
    predict: {
      code: `x = [1, 2, 3]\ny = [10, 20, 30]\ntb_x = sum(x) / len(x)\ntb_y = sum(y) / len(y)\ntu = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(3))\nmau = sum((x[i] - tb_x) ** 2 for i in range(3))\nprint(tu / mau)`,
      question: 'Dữ liệu nằm đúng trên đường y = 10x. Độ dốc a in ra là bao nhiêu?',
      choices: ['10.0', '1.0', '20.0', '5.0'],
      answerIndex: 0,
      explain:
        'Dữ liệu hoàn hảo trên đường y = 10x nên công thức least squares trả về đúng độ dốc 10.0 (tử = (−1)(−10) + 0 + (1)(10) = 20; mẫu = 1 + 0 + 1 = 2; 20/2 = 10.0). Với dữ liệu thật có nhiễu, a sẽ là đường "bám sát nhất", không đi qua đủ mọi điểm.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự cài hồi quy tuyến tính: trung bình → tử số/mẫu số → độ dốc → điểm cắt.',
      lines: [
        'tb_x = sum(x) / len(x)',
        'tb_y = sum(y) / len(y)',
        'tu = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x)))',
        'mau = sum((x[i] - tb_x) ** 2 for i in range(len(x)))',
        'a = tu / mau',
        'b = tb_y - a * tb_x',
      ],
    },
    make: {
      prompt:
        'Tự cài hồi quy tuyến tính đoán điểm thi từ số giờ ôn.\n\nChương trình đọc 3 dòng input():\n- Dòng 1: các giá trị x (giờ ôn), cách nhau dấu phẩy, vd "1,2,3,4".\n- Dòng 2: các giá trị y (điểm), cùng độ dài, vd "4,5,6,7".\n- Dòng 3: giờ ôn của ca cần đoán.\n\nHọc a, b theo công thức least squares trong bài, rồi in đúng 2 dòng:\nDo doc: <a>\nDu doan: <a * x_moi + b>',
      starterCode: `x = [float(v) for v in input("x: ").split(",")]\ny = [float(v) for v in input("y: ").split(",")]\nx_moi = float(input("x moi: "))\n# Tinh tb_x, tb_y, tu so, mau so -> a, b roi in ket qua\n`,
      testCases: [
        {
          stdinLines: ['1,2,3,4', '4,5,6,7', '5'],
          expected: 'Do doc: 1.0\nDu doan: 8.0',
          match: 'contains',
          hidden: false,
          label: 'y = x + 3 → độ dốc 1.0, đoán x=5 ra 8.0',
        },
        {
          stdinLines: ['1,2,3', '10,20,30', '4'],
          expected: 'Du doan: 40.0',
          match: 'contains',
          hidden: false,
          label: 'y = 10x → đoán x=4 ra 40.0',
        },
        {
          stdinLines: ['1,2,3,4', '2,2,2,2', '100'],
          expected: 'Do doc: 0.0\nDu doan: 2.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: y không đổi → độ dốc 0.0, đoán gì cũng ra 2.0',
        },
      ],
      hints: [
        'Làm đúng 4 bước của ví dụ mẫu: tb_x, tb_y trước; rồi vòng lặp (hoặc sum(... for ...)) cộng dồn tử số và mẫu số.',
        'a = tu / mau, còn b = tb_y - a * tb_x (đường thẳng buộc đi qua điểm trung bình của dữ liệu).',
        'In: print(f"Do doc: {a}") rồi print(f"Du doan: {a * x_moi + b}").',
      ],
      sampleSolution: `x = [float(v) for v in input("x: ").split(",")]\ny = [float(v) for v in input("y: ").split(",")]\nx_moi = float(input("x moi: "))\ntb_x = sum(x) / len(x)\ntb_y = sum(y) / len(y)\ntu = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x)))\nmau = sum((x[i] - tb_x) ** 2 for i in range(len(x)))\na = tu / mau\nb = tb_y - a * tb_x\nprint(f"Do doc: {a}")\nprint(f"Du doan: {a * x_moi + b}")`,
    },
    homework:
      'Lấy dữ liệu thật của chính bạn (số giờ ngủ → mức tỉnh táo tự chấm 1–10 trong 7 ngày, hoặc nhiệt độ → số ly nước uống). Chạy code bài này lên dữ liệu đó. Độ dốc a nói lên điều gì bằng lời? Có điểm nào lệch hẳn khỏi đường thẳng không — bạn có tin dự đoán cho x nằm XA ngoài vùng dữ liệu (vd ôn 100 giờ) không, vì sao?',
    srsCards: [
      {
        hoi: 'Hồi quy khác phân loại ở đầu ra như thế nào?',
        dap: 'Hồi quy đoán CON SỐ liên tục (giá nhà, doanh thu, điểm thi); phân loại đoán NHÃN rời rạc (rác/không-rác, chó/mèo). Cùng là học có giám sát nhưng cách đo sai và thuật toán khác nhau.',
      },
      {
        hoi: 'Hồi quy tuyến tính "học" bằng tiêu chí nào?',
        dap: 'Tìm đường thẳng y = a*x + b có TỔNG BÌNH PHƯƠNG khoảng cách tới các điểm dữ liệu nhỏ nhất (least squares). Với 1 biến có công thức đóng: a = Σ(x−tb_x)(y−tb_y) / Σ(x−tb_x)², b = tb_y − a·tb_x.',
      },
      {
        hoi: 'Ridge/Lasso là gì so với hồi quy tuyến tính thường?',
        dap: 'Vẫn là hồi quy tuyến tính nhưng thêm PHẠT hệ số quá lớn (regularization) để chống học vẹt: Ridge phạt bình phương hệ số, Lasso phạt trị tuyệt đối và có thể ép hệ số về 0 (tự bỏ bớt đặc trưng).',
      },
    ],
  },
  {
    id: 'ml-u1-l3',
    unitId: 'ml-u1',
    language: 'python',
    title: 'Phân loại k-NN — "hàng xóm gần nhất nói bạn là ai"',
    hook: 'Bạn nếm một quả lạ: ngọt 7/10, giòn 8/10. Nó giống táo hay giống chuối? Cách người thật làm: so với những quả ĐÃ BIẾT giống nó nhất. Thuật toán k-NN làm y hệt — nhìn k hàng xóm gần nhất trong dữ liệu rồi theo số đông. Đơn giản tới mức khó tin, mà vẫn được dùng thật.',
    theory:
      'PHÂN LOẠI (classification) = đoán NHÃN rời rạc. Bản đồ nhánh này đông đúc: logistic regression, SVM, cây quyết định, Naive Bayes… — hôm nay cài thuật toán trực quan nhất: k-NN (k Nearest Neighbors, k hàng xóm gần nhất).\n\nk-NN KHÔNG có bước huấn luyện: nó GHI NHỚ toàn bộ dữ liệu. Khi cần đoán ca mới:\n1. Tính KHOẢNG CÁCH từ ca mới tới TỪNG điểm đã biết. Với 2 đặc trưng (x1, x2), dùng khoảng cách Euclid: sqrt((x1-a1)² + (x2-a2)²) — trong Python là ((x1-a1)**2 + (x2-a2)**2) ** 0.5.\n2. Chọn k điểm GẦN NHẤT (k lẻ để khỏi hoà, vd k=3).\n3. Nhãn nào chiếm ĐA SỐ trong k điểm đó là dự đoán.\n\nVới k=1 chỉ cần tìm điểm gần nhất duy nhất — chính là bài Make hôm nay.\n\nHai điểm yếu phải biết: (1) đặc trưng có THANG ĐO khác nhau (tuổi 0–100 vs thu nhập 0–100 triệu) thì đặc trưng số to nuốt trọn khoảng cách — phải chuẩn hoá trước (chương 2 dạy); (2) dữ liệu lớn thì đoán chậm, vì mỗi lần đoán phải so với TẤT CẢ điểm đã nhớ.\n\nSo nhanh với họ hàng: cây quyết định hỏi chuỗi câu if về đặc trưng ("ngọt > 5?"); logistic regression kẻ một đường thẳng chia hai lớp; SVM cũng kẻ đường nhưng chọn đường có LỀ rộng nhất; Naive Bayes tính xác suất theo tần suất (gặp lại ở chương 4). Tất cả cùng trả lời một câu hỏi: ca mới thuộc lớp nào.',
    workedExample: {
      code: `# 1-NN: qua la thuoc loai nao? Dac trung: (ngot, gion)
du_lieu = [
    (9, 8, "tao"),      # (ngot, gion, nhan)
    (8, 9, "tao"),
    (9, 2, "chuoi"),
    (10, 1, "chuoi"),
]
qua_la = (7, 8)         # ca moi can doan

gan_nhat = None
kc_min = None
for (ngot, gion, nhan) in du_lieu:
    # khoang cach Euclid giua qua la va diem nay
    kc = ((qua_la[0] - ngot) ** 2 + (qua_la[1] - gion) ** 2) ** 0.5
    print(f"Toi ({ngot},{gion},{nhan}): {round(kc, 2)}")
    if kc_min is None or kc < kc_min:   # giu diem gan nhat
        kc_min = kc
        gan_nhat = nhan
print(f"Du doan: {gan_nhat}")`,
      stdinLines: [],
    },
    predict: {
      code: `a = (0, 0)\nb = (3, 4)\nkc = ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5\nprint(kc)`,
      question: 'Khoảng cách Euclid giữa (0,0) và (3,4) in ra là bao nhiêu?',
      choices: ['5.0', '7.0', '25.0', '3.5'],
      answerIndex: 0,
      explain:
        'sqrt(3² + 4²) = sqrt(9 + 16) = sqrt(25) = 5.0 — bộ ba 3-4-5 kinh điển của định lý Pythagore. Toàn bộ k-NN đứng trên đúng một phép tính này: "gần" nghĩa là khoảng cách Euclid nhỏ.',
    },
    parsons: {
      prompt:
        'Xếp đúng ruột vòng lặp 1-NN: tính khoảng cách từng điểm → nếu gần hơn kỷ lục thì cập nhật kỷ lục + nhãn.',
      lines: [
        'for (x1, x2, nhan) in du_lieu:',
        '    kc = ((moi[0] - x1) ** 2 + (moi[1] - x2) ** 2) ** 0.5',
        '    if kc_min is None or kc < kc_min:',
        '        kc_min = kc',
        '        du_doan = nhan',
      ],
    },
    make: {
      prompt:
        'Tự cài bộ phân loại 1-NN đoán một học viên hợp lớp "beginner" hay "advanced".\n\nDữ liệu đã biết (ghi sẵn trong starter code): mỗi người có (số tháng đã học, điểm bài test /10, nhãn lớp).\n\nChương trình đọc 2 dòng input(): số tháng đã học và điểm test của học viên MỚI. Tìm người GẦN NHẤT theo khoảng cách Euclid rồi in đúng 1 dòng:\nLop phu hop: <nhãn của người gần nhất>',
      starterCode: `du_lieu = [\n    (1, 3, "beginner"),\n    (2, 4, "beginner"),\n    (10, 8, "advanced"),\n    (12, 9, "advanced"),\n]\nthang = float(input("So thang da hoc: "))\ndiem = float(input("Diem test: "))\n# Tim nguoi gan nhat (Euclid) va in: Lop phu hop: <nhan>\n`,
      testCases: [
        {
          stdinLines: ['1', '4'],
          expected: 'Lop phu hop: beginner',
          match: 'contains',
          hidden: false,
          label: '1 tháng, 4 điểm → sát nhóm beginner',
        },
        {
          stdinLines: ['11', '9'],
          expected: 'Lop phu hop: advanced',
          match: 'contains',
          hidden: false,
          label: '11 tháng, 9 điểm → sát nhóm advanced',
        },
        {
          stdinLines: ['6', '6'],
          expected: 'Lop phu hop: beginner',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: điểm lưng chừng (6,6) — gần (2,4) hơn (10,8)',
        },
      ],
      hints: [
        'Khung y hệt ví dụ mẫu: hai biến kỷ lục kc_min = None, du_doan = None, rồi vòng for qua du_lieu.',
        'Khoảng cách: kc = ((thang - t) ** 2 + (diem - d) ** 2) ** 0.5 với (t, d, nhan) là từng bộ trong dữ liệu.',
        'if kc_min is None or kc < kc_min: cập nhật cả kc_min lẫn du_doan. Cuối cùng print(f"Lop phu hop: {du_doan}").',
      ],
      sampleSolution: `du_lieu = [\n    (1, 3, "beginner"),\n    (2, 4, "beginner"),\n    (10, 8, "advanced"),\n    (12, 9, "advanced"),\n]\nthang = float(input("So thang da hoc: "))\ndiem = float(input("Diem test: "))\nkc_min = None\ndu_doan = None\nfor (t, d, nhan) in du_lieu:\n    kc = ((thang - t) ** 2 + (diem - d) ** 2) ** 0.5\n    if kc_min is None or kc < kc_min:\n        kc_min = kc\n        du_doan = nhan\nprint(f"Lop phu hop: {du_doan}")`,
    },
    homework:
      'k-NN với k=3 thay vì k=1: sửa code bài Make để lấy 3 người gần nhất rồi theo nhãn đa số (gợi ý: lưu list các cặp (khoảng cách, nhãn), sort theo khoảng cách, đếm nhãn trong 3 phần tử đầu). Thử một ca mà k=1 và k=3 cho kết quả KHÁC nhau — vì sao k lớn hơn thường "điềm tĩnh" hơn trước một điểm dữ liệu nhiễu?',
    srsCards: [
      {
        hoi: 'Thuật toán k-NN dự đoán một ca mới qua 3 bước nào?',
        dap: 'Tính khoảng cách (thường là Euclid) từ ca mới tới MỌI điểm đã biết → chọn k điểm gần nhất (k lẻ để khỏi hoà) → lấy nhãn chiếm đa số trong k điểm đó làm dự đoán. Không có bước huấn luyện — mô hình chính là dữ liệu.',
      },
      {
        hoi: 'Hai điểm yếu chính của k-NN là gì?',
        dap: 'Đặc trưng khác thang đo (tuổi vs thu nhập) làm đặc trưng số to nuốt trọn khoảng cách — phải chuẩn hoá trước; và đoán chậm với dữ liệu lớn vì mỗi lần đoán phải so với tất cả điểm đã ghi nhớ.',
      },
      {
        hoi: 'Công thức khoảng cách Euclid giữa hai điểm (x1,y1) và (x2,y2)?',
        dap: 'sqrt((x1−x2)² + (y1−y2)²) — trong Python: ((x1-x2)**2 + (y1-y2)**2) ** 0.5. Đây là "thước đo độ giống nhau" mà k-NN và k-means (chương 2) cùng đứng lên trên.',
      },
    ],
  },
  {
    id: 'ml-u1-l4',
    unitId: 'ml-u1',
    language: 'python',
    title: 'Train/test split & accuracy — đừng chấm bài bằng đề đã phát đáp án',
    hook: 'Học sinh ôn đúng bộ đề có sẵn đáp án rồi thi lại chính bộ đề đó — 10 điểm. Giỏi thật không? Không biết. Học máy có đúng cái bẫy này: chấm mô hình trên dữ liệu nó ĐÃ HỌC thì điểm cao là vô nghĩa. Luật sắt số 1 của nghề: phải để riêng một phần dữ liệu mô hình CHƯA TỪNG THẤY.',
    theory:
      'Quy trình chuẩn của MỌI dự án học có giám sát:\n1. CHIA dữ liệu làm hai: tập HUẤN LUYỆN (train, thường ~80%) để mô hình học, tập KIỂM TRA (test, ~20%) giấu đi.\n2. Học CHỈ trên train.\n3. Chấm CHỈ trên test — vì test là "ca chưa gặp", điểm trên đó mới phản ánh khả năng thật.\n\nThước đo phân loại cơ bản nhất: ACCURACY = số ca đoán đúng / tổng số ca. Ví dụ đoán đúng 8/10 ca test → accuracy 0.8 (80%).\n\nAccuracy có bẫy riêng: dữ liệu LỆCH thì nó nói dối. 1.000 giao dịch chỉ 10 gian lận — mô hình lười đoán "không gian lận" cho TẤT CẢ vẫn đạt accuracy 99%, mà bỏ lọt đủ 10 ca gian lận. Nghề dùng thêm precision (đoán "gian lận" thì bao nhiêu phần đúng thật) và recall (số gian lận thật bắt được bao nhiêu phần) — dự án DHCB này chấm chất lượng AI gia sư bằng đúng cặp đó (eval-tutor). Bài này cài accuracy; điều phải nhớ: CHỌN THƯỚC ĐO THEO HẬU QUẢ CỦA TỪNG LOẠI SAI, không theo thói quen.\n\nMột lỗi kín đáo nữa: RÒ RỈ DỮ LIỆU (data leakage) — thông tin của test lọt vào lúc huấn luyện (vd chuẩn hoá bằng trung bình tính trên CẢ dữ liệu trước khi chia). Điểm test đẹp giả tạo, ra đời thật thì sập. Thấy điểm ĐẸP BẤT THƯỜNG, phản xạ đúng của dân nghề là NGHI NGỜ trước, ăn mừng sau.',
    workedExample: {
      code: `# Cham mo hinh nguong (bai 1) tren tap test no chua tung thay
train = [(120, "dong"), (80, "vang"), (150, "dong"), (90, "vang")]
test = [(160, "dong"), (85, "vang"), (100, "dong")]

# Hoc CHI tren train: nguong = trung binh so khach
nguong = sum(x for (x, nhan) in train) / len(train)
print(f"Nguong hoc tu train: {nguong}")

dung = 0
for (x, nhan_that) in test:              # cham CHI tren test
    du_doan = "dong" if x > nguong else "vang"
    ket_qua = "DUNG" if du_doan == nhan_that else "SAI"
    print(f"x={x}: doan {du_doan}, that {nhan_that} -> {ket_qua}")
    if du_doan == nhan_that:
        dung += 1
print(f"Accuracy: {dung / len(test)}")`,
      stdinLines: [],
    },
    predict: {
      code: `du_doan = ["a", "a", "b", "b", "a"]\nthuc_te = ["a", "b", "b", "b", "a"]\ndung = sum(1 for i in range(5) if du_doan[i] == thuc_te[i])\nprint(dung / 5)`,
      question: 'Accuracy in ra là bao nhiêu?',
      choices: ['0.8', '0.6', '1.0', '0.4'],
      answerIndex: 0,
      explain:
        'So từng vị trí: a=a đúng, a≠b sai, b=b đúng, b=b đúng, a=a đúng → 4/5 = 0.8. Accuracy chỉ là "đếm số khớp chia tổng" — dễ tính, nhưng nhớ bẫy dữ liệu lệch: đoán bừa một nhãn áp đảo vẫn được điểm cao.',
    },
    parsons: {
      prompt:
        'Xếp đúng quy trình chuẩn: học trên train → đoán từng ca test → đếm ca đúng → chia ra accuracy.',
      lines: [
        'nguong = sum(x for (x, n) in train) / len(train)',
        'dung = 0',
        'for (x, nhan_that) in test:',
        '    du_doan = "dong" if x > nguong else "vang"',
        '    if du_doan == nhan_that:',
        '        dung += 1',
        'print(dung / len(test))',
      ],
    },
    make: {
      prompt:
        'Viết máy chấm accuracy dùng được cho MỌI mô hình phân loại.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: các nhãn mô hình ĐOÁN, cách nhau dấu phẩy, vd "dong,vang,dong".\n- Dòng 2: các nhãn THẬT, cùng độ dài, vd "dong,dong,dong".\n\nIn đúng 2 dòng:\nDung: <số ca đúng>/<tổng số ca>\nAccuracy: <số đúng chia tổng>',
      starterCode: `du_doan = input("Du doan: ").split(",")\nthuc_te = input("Thuc te: ").split(",")\n# Dem so vi tri hai list trung nhau roi in Dung: a/b va Accuracy: ...\n`,
      testCases: [
        {
          stdinLines: ['dong,vang,dong,vang', 'dong,vang,vang,vang'],
          expected: 'Dung: 3/4\nAccuracy: 0.75',
          match: 'contains',
          hidden: false,
          label: '3/4 ca khớp → accuracy 0.75',
        },
        {
          stdinLines: ['a,a,a', 'a,a,a'],
          expected: 'Accuracy: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Khớp hết → 1.0 (đẹp bất thường thì phải nghi rò rỉ!)',
        },
        {
          stdinLines: ['a,b', 'b,a'],
          expected: 'Dung: 0/2\nAccuracy: 0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sai cả hai → 0.0',
        },
      ],
      hints: [
        'Đếm khớp theo vị trí: dung = sum(1 for i in range(len(thuc_te)) if du_doan[i] == thuc_te[i]).',
        'Tổng số ca là len(thuc_te). Accuracy = dung / len(thuc_te) — phép chia / cho số thực (3/4 → 0.75).',
        'In: print(f"Dung: {dung}/{len(thuc_te)}") rồi print(f"Accuracy: {dung / len(thuc_te)}").',
      ],
      sampleSolution: `du_doan = input("Du doan: ").split(",")\nthuc_te = input("Thuc te: ").split(",")\ndung = sum(1 for i in range(len(thuc_te)) if du_doan[i] == thuc_te[i])\nprint(f"Dung: {dung}/{len(thuc_te)}")\nprint(f"Accuracy: {dung / len(thuc_te)}")`,
    },
    homework:
      'Bài toán phát hiện gian lận 1.000 giao dịch trong đó chỉ 10 gian lận: tính accuracy của mô hình lười luôn đoán "không gian lận" (đáp: 990/1000 = 99%). Rồi trả lời: với bài toán này, bỏ LỌT một ca gian lận và báo OAN một ca lương thiện — cái nào đắt hơn? Từ đó bạn muốn tối ưu recall hay precision? Không có đáp án chung — câu trả lời nằm ở HẬU QUẢ của từng loại sai.',
    srsCards: [
      {
        hoi: 'Vì sao phải chia dữ liệu thành train/test trước khi huấn luyện?',
        dap: 'Chấm mô hình trên dữ liệu nó ĐÃ HỌC thì điểm cao vô nghĩa (như thi lại đúng bộ đề đã có đáp án). Tập test giấu đi đóng vai "ca chưa gặp" — điểm trên đó mới phản ánh khả năng tổng quát hoá thật.',
      },
      {
        hoi: 'Accuracy là gì và bẫy lớn nhất của nó?',
        dap: 'Accuracy = số ca đoán đúng / tổng số ca. Bẫy: dữ liệu lệch nhãn nặng (1.000 giao dịch, 10 gian lận) thì mô hình đoán bừa nhãn áp đảo vẫn đạt 99% — phải nhìn thêm precision/recall theo hậu quả từng loại sai.',
      },
      {
        hoi: 'Rò rỉ dữ liệu (data leakage) là gì?',
        dap: 'Thông tin của tập test lọt vào quá trình huấn luyện (vd chuẩn hoá bằng thống kê tính trên cả dữ liệu trước khi chia) — điểm test đẹp giả tạo, ra đời thật thì sập. Thấy điểm đẹp bất thường phải nghi ngờ trước.',
      },
    ],
  },
  {
    id: 'ml-u1-l5',
    unitId: 'ml-u1',
    language: 'python',
    title: 'Overfitting — khi mô hình học vẹt thay vì học hiểu',
    hook: 'Hai học sinh cùng ôn một bộ đề. Bạn A hiểu bản chất — đề quen 9 điểm, đề lạ 8. Bạn B thuộc lòng từng đáp án — đề quen 10 điểm tròn, đề lạ 4. Mô hình học máy cũng chia đúng hai kiểu này, và kiểu B có tên riêng: OVERFITTING. Nhận ra nó chỉ cần so hai con số.',
    theory:
      'OVERFITTING (quá khớp / "học vẹt") = mô hình bám quá sát dữ liệu huấn luyện, học thuộc cả NHIỄU ngẫu nhiên thay vì quy luật — điểm train rất cao, điểm test tụt sâu. Ngược lại UNDERFITTING ("học chưa tới") = mô hình quá đơn giản, không nắm nổi quy luật — điểm train lẫn test đều thấp.\n\nChẩn đoán bằng cách so HAI con số:\n- Sai số train THẤP + sai số test CAO HẲN → overfitting.\n- Cả hai cùng cao → underfitting.\n- Cả hai cùng thấp, sát nhau → mô hình vừa vặn.\n\nGốc rễ là ĐÁNH ĐỔI BIAS–VARIANCE: mô hình đơn giản thì cứng nhắc, sai có hệ thống (bias cao — đường thẳng ép lên dữ liệu cong); mô hình phức tạp thì nhạy với từng điểm dữ liệu, đổi mẫu là đổi hẳn kết quả (variance cao). Hồi quy đa thức bậc 9 xuyên qua đủ 10 điểm train (sai số 0!) nhưng uốn éo điên loạn giữa các điểm — đoán ca mới tệ hơn đường thẳng khiêm tốn.\n\nThuốc chữa overfitting, gặp lại suốt khoá: (1) THÊM DỮ LIỆU — nhiễu bị pha loãng; (2) GIẢM độ phức tạp mô hình; (3) REGULARIZATION — cho phép phức tạp nhưng PHẠT hệ số lớn (ridge/lasso bài 2, dropout ở học sâu chương 4); (4) dừng sớm khi điểm trên tập kiểm định bắt đầu xấu đi. Toàn ngành học máy, nói gọn, là nghệ thuật đứng đúng điểm cân bằng giữa học vẹt và học chưa tới.',
    workedExample: {
      code: `# Chan doan suc khoe mo hinh tu 2 con so sai so
def chan_doan(sai_train, sai_test):
    if sai_train < 0.1 and sai_test >= sai_train + 0.2:
        return "overfitting"        # train ngon, test tut sau
    if sai_train >= 0.3 and sai_test >= 0.3:
        return "underfitting"       # ca hai cung te
    return "vua van"                # ca hai thap, sat nhau

# Ba mo hinh cung mot bai toan:
print(chan_doan(0.05, 0.40))   # thuoc long tung diem train
print(chan_doan(0.45, 0.50))   # duong thang ep len du lieu cong
print(chan_doan(0.08, 0.12))   # diem can bang dep`,
      stdinLines: [],
    },
    predict: {
      code: `sai_train = 0.02\nsai_test = 0.35\nif sai_train < 0.1 and sai_test >= sai_train + 0.2:\n    print("hoc vet")\nelse:\n    print("on")`,
      question: 'Sai số train 0.02, test 0.35 — máy in ra gì?',
      choices: ['hoc vet', 'on', 'Báo lỗi', 'Không in gì'],
      answerIndex: 0,
      explain:
        'Train 0.02 < 0.1 (gần thuộc lòng) và test 0.35 ≥ 0.22 (kém hẳn khi gặp ca lạ) — đúng chân dung overfitting: khoảng cách train–test toác rộng. Con số tuyệt đối chưa đáng sợ; KHOẢNG CÁCH giữa hai con số mới là còi báo động.',
    },
    parsons: {
      prompt:
        'Xếp đúng hàm chẩn đoán: overfitting (train thấp, test cao hẳn) → underfitting (cả hai cao) → còn lại là vừa vặn.',
      lines: [
        'def chan_doan(sai_train, sai_test):',
        '    if sai_train < 0.1 and sai_test >= sai_train + 0.2:',
        '        return "overfitting"',
        '    if sai_train >= 0.3 and sai_test >= 0.3:',
        '        return "underfitting"',
        '    return "vua van"',
      ],
    },
    make: {
      prompt:
        'Viết máy chẩn đoán sức khoẻ mô hình.\n\nChương trình đọc 2 dòng input(): sai số trên train và sai số trên test (số thực 0–1).\n\nLuật chẩn đoán (xét theo đúng thứ tự):\n1. Nếu sai_train < 0.1 VÀ sai_test >= sai_train + 0.2 → in "Chan doan: overfitting"\n2. Nếu không, nếu sai_train >= 0.3 VÀ sai_test >= 0.3 → in "Chan doan: underfitting"\n3. Còn lại → in "Chan doan: vua van"',
      starterCode: `sai_train = float(input("Sai so train: "))\nsai_test = float(input("Sai so test: "))\n# Ap dung 3 luat chan doan theo dung thu tu\n`,
      testCases: [
        {
          stdinLines: ['0.05', '0.4'],
          expected: 'Chan doan: overfitting',
          match: 'contains',
          hidden: false,
          label: 'Train 0.05, test 0.40 → học vẹt',
        },
        {
          stdinLines: ['0.45', '0.5'],
          expected: 'Chan doan: underfitting',
          match: 'contains',
          hidden: false,
          label: 'Cả hai cùng tệ → học chưa tới',
        },
        {
          stdinLines: ['0.08', '0.12'],
          expected: 'Chan doan: vua van',
          match: 'contains',
          hidden: false,
          label: 'Cả hai thấp, sát nhau → vừa vặn',
        },
        {
          stdinLines: ['0.05', '0.25'],
          expected: 'Chan doan: overfitting',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 0.25 = 0.05 + 0.2 — RANH GIỚI, >= vẫn tính là overfitting',
        },
      ],
      hints: [
        'Ba nhánh if/elif/else theo đúng thứ tự đề cho — thứ tự quan trọng vì luật 1 được xét trước.',
        'Luật 1: if sai_train < 0.1 and sai_test >= sai_train + 0.2. Chú ý >= chứ không phải > (ca ranh giới).',
        'elif sai_train >= 0.3 and sai_test >= 0.3 cho underfitting; else cho vừa vặn. In bằng print("Chan doan: ...").',
      ],
      sampleSolution: `sai_train = float(input("Sai so train: "))\nsai_test = float(input("Sai so test: "))\nif sai_train < 0.1 and sai_test >= sai_train + 0.2:\n    print("Chan doan: overfitting")\nelif sai_train >= 0.3 and sai_test >= 0.3:\n    print("Chan doan: underfitting")\nelse:\n    print("Chan doan: vua van")`,
    },
    homework:
      'Nối sang đời thật: tìm 2 ví dụ "overfitting của con người" quanh bạn (mẹo chỉ đúng với đề cũ, kinh nghiệm chỉ đúng với một khách hàng...) và 1 ví dụ "underfitting" (quy tắc quá thô nên sai đều). Với mỗi ví dụ, "thêm dữ liệu" và "regularization" tương đương với hành động gì ngoài đời? Viết 3–4 câu.',
    srsCards: [
      {
        hoi: 'Chẩn đoán overfitting vs underfitting bằng cặp sai số train/test thế nào?',
        dap: 'Train thấp + test cao hẳn (khoảng cách toác rộng) → overfitting, mô hình học thuộc cả nhiễu. Cả hai cùng cao → underfitting, mô hình quá đơn giản. Cả hai thấp và sát nhau → vừa vặn.',
      },
      {
        hoi: 'Đánh đổi bias–variance nói điều gì?',
        dap: 'Mô hình đơn giản: cứng nhắc, sai có hệ thống (bias cao, dễ underfit). Mô hình phức tạp: nhạy với từng điểm dữ liệu, đổi mẫu là đổi kết quả (variance cao, dễ overfit). Học máy là tìm điểm cân bằng giữa hai đầu.',
      },
      {
        hoi: 'Kể 3 cách chữa overfitting.',
        dap: 'Thêm dữ liệu huấn luyện (pha loãng nhiễu) · giảm độ phức tạp mô hình · regularization — phạt hệ số lớn (ridge/lasso, dropout) · dừng sớm khi điểm kiểm định xấu đi. (Nêu được 3 trong 4 là đạt.)',
      },
    ],
  },
]
